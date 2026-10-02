import { describe, expect, it } from 'vitest';
import {
  buildProviderScorecard,
  calculateUsageCost,
  createModelPricingId,
  findPricingForModel,
  normalizeModelPricing,
  upsertModelPricing,
  usageRecordsToCsv,
  usageRecordsToJson,
  type ModelPricing,
} from './pricing';
import type { UsageRecord } from './records';

function usage(overrides: Partial<UsageRecord> = {}): UsageRecord {
  return {
    timestamp: 1_000,
    kind: 'orchestrator',
    status: 'ok',
    provider: 'openai',
    model: 'gpt-4o',
    durationMs: 1_000,
    ...overrides,
  };
}

function pricing(overrides: Partial<ModelPricing> = {}): ModelPricing {
  return {
    id: 'p-1',
    model: 'gpt-4o',
    inputCostPerMillionTokens: 2.5,
    outputCostPerMillionTokens: 10,
    currency: 'USD',
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('model pricing', () => {
  it('normalizes valid records', () => {
    expect(
      normalizeModelPricing({
        id: ' p-1 ',
        model: ' gpt-4o ',
        inputCostPerMillionTokens: 2.5,
        outputCostPerMillionTokens: 10,
        currency: 'usd',
        createdAt: '2026-09-01T00:00:00.000Z',
      }),
    ).toEqual(pricing());
  });

  it('migrates pre-4.6.1 per-1K field names verbatim', () => {
    // Entries saved before 4.6.1 carry per-1M rates under the old keys; the
    // values were always meant per 1M tokens, so they carry over unchanged.
    expect(
      normalizeModelPricing({
        id: 'p-1',
        model: 'gpt-4o',
        inputCostPer1kTokens: 2.5,
        outputCostPer1kTokens: 10,
        currency: 'USD',
        createdAt: '2026-09-01T00:00:00.000Z',
      }),
    ).toEqual(pricing());
  });

  it('rejects incomplete or negative records', () => {
    expect(normalizeModelPricing(null)).toBeNull();
    expect(
      normalizeModelPricing({
        id: 'x',
        model: 'm',
        inputCostPerMillionTokens: -1,
        outputCostPerMillionTokens: 10,
        currency: 'USD',
      }),
    ).toBeNull();
    expect(
      normalizeModelPricing({
        id: 'x',
        model: 'm',
        inputCostPerMillionTokens: 2.5,
        outputCostPerMillionTokens: 'lots',
        currency: 'USD',
      }),
    ).toBeNull();
    expect(
      normalizeModelPricing({
        id: 'x',
        model: 'm',
        inputCostPerMillionTokens: 0,
        outputCostPerMillionTokens: 0,
        currency: '',
      }),
    ).toBeNull();
  });

  it('creates unique ids and upserts newest-first', () => {
    expect(createModelPricingId()).toMatch(/^pricing-\d+-[a-z0-9]+$/);
    const base = [pricing({ id: 'a', model: 'a' }), pricing({ id: 'b', model: 'b' })];
    expect(upsertModelPricing(base, pricing({ id: 'c', model: 'c' })).map((e) => e.id)).toEqual(['c', 'a', 'b']);
  });

  it('finds exact matches first, then longest prefix', () => {
    const table = [pricing({ id: 'short', model: 'gpt-4' }), pricing({ id: 'long', model: 'gpt-4o' })];
    expect(findPricingForModel(table, 'gpt-4o')?.id).toBe('long');
    expect(findPricingForModel(table, 'gpt-4o-2024-08-06')?.id).toBe('long');
    expect(findPricingForModel(table, 'gpt-4-turbo')?.id).toBe('short');
    expect(findPricingForModel(table, 'claude-3')).toBeUndefined();
  });

  it('computes cost from token counts and per-1M pricing', () => {
    // 10K input × $2.50/1M + 5K output × $10/1M = $0.025 + $0.05 = $0.075
    expect(calculateUsageCost({ promptTokens: 10_000, completionTokens: 5_000 }, pricing())).toBeCloseTo(0.075);
    expect(calculateUsageCost({}, pricing())).toBe(0);
  });
});

describe('buildProviderScorecard', () => {
  it('aggregates per model with cost when pricing exists', () => {
    const scorecard = buildProviderScorecard(
      [
        usage({ model: 'gpt-4o', promptTokens: 2_000, completionTokens: 1_000, totalTokens: 3_000 }),
        usage({ model: 'gpt-4o', status: 'error', errorMessage: 'boom' }),
        usage({ model: 'claude-3', promptTokens: 5_000, totalTokens: 5_000 }),
      ],
      [pricing()],
    );
    expect(scorecard).toHaveLength(2);
    expect(scorecard[0]).toMatchObject({
      model: 'gpt-4o',
      calls: 2,
      okCalls: 1,
      errorCalls: 1,
      failureRate: 0.5,
      totalTokens: 3_000,
      currency: 'USD',
    });
    expect(scorecard[0]?.totalCost).toBeCloseTo(0.005 + 0.01);
    expect(scorecard[1]).toMatchObject({ model: 'claude-3', calls: 1 });
    expect(scorecard[1]?.totalCost).toBeUndefined();
    expect(scorecard[1]?.currency).toBeUndefined();
  });

  it('sorts by call count descending then model name', () => {
    expect(
      buildProviderScorecard([usage({ model: 'zzz' }), usage({ model: 'aaa' }), usage({ model: 'aaa' })]).map(
        (e) => e.model,
      ),
    ).toEqual(['aaa', 'zzz']);
  });

  it('returns empty for no records', () => {
    expect(buildProviderScorecard([])).toEqual([]);
  });
});

describe('usage export', () => {
  it('produces CSV with header and one row per record', () => {
    const csv = usageRecordsToCsv([
      usage({ promptTokens: 100, completionTokens: 50, totalTokens: 150, assetName: 'system_prompt' }),
    ]);
    const lines = csv.split('\n');
    expect(lines[0]).toContain('timestamp,iso_date,kind,status,provider,model');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('orchestrator');
    expect(lines[1]).toContain('system_prompt');
  });

  it('escapes commas and quotes', () => {
    const csv = usageRecordsToCsv([usage({ model: 'model,with "quotes"', errorMessage: 'error\nwith newline' })]);
    expect(csv).toContain('"model,with ""quotes"""');
  });

  it('produces JSON envelope with metadata', () => {
    const parsed = JSON.parse(usageRecordsToJson([usage(), usage({ status: 'error' })]));
    expect(parsed.record_count).toBe(2);
    expect(parsed.records[0].model).toBe('gpt-4o');
    expect(typeof parsed.exported_at).toBe('string');
  });

  it('produces empty JSON envelope for no records', () => {
    const parsed = JSON.parse(usageRecordsToJson([]));
    expect(parsed.record_count).toBe(0);
    expect(parsed.records).toEqual([]);
  });
});
