import { describe, expect, it } from 'vitest';
import {
  UNATTRIBUTED_GROUP_KEY,
  USAGE_RETENTION_LIMIT,
  buildUsageRecord,
  filterUsageRecords,
  normalizeUsageRecord,
  pruneUsageRecords,
  summarizeUsage,
  usageGroupKey,
  type UsageRecord,
} from './records';

function record(overrides: Partial<UsageRecord> = {}): UsageRecord {
  return {
    timestamp: 1_700_000_000_000,
    kind: 'orchestrator',
    status: 'ok',
    provider: 'openai',
    model: 'gpt-4o',
    durationMs: 1_000,
    ...overrides,
  };
}

describe('buildUsageRecord', () => {
  it('spreads engine usage onto the token fields', () => {
    const built = buildUsageRecord({
      timestamp: 1_700_000_012_345,
      kind: 'asset',
      status: 'ok',
      provider: 'openai',
      model: 'gpt-4o',
      durationMs: 1234.6,
      usage: { promptTokens: 11, completionTokens: 7, totalTokens: 18 },
      assetName: 'system_prompt',
      templateName: 'Official V2/V3',
    });

    expect(built).toEqual({
      timestamp: 1_700_000_012_345,
      kind: 'asset',
      status: 'ok',
      provider: 'openai',
      model: 'gpt-4o',
      durationMs: 1235,
      promptTokens: 11,
      completionTokens: 7,
      totalTokens: 18,
      assetName: 'system_prompt',
      templateName: 'Official V2/V3',
    });
  });

  it('drops empty context fields and clamps non-positive durations', () => {
    const built = buildUsageRecord({
      timestamp: 1,
      kind: 'chat',
      status: 'aborted',
      provider: ' openrouter ',
      model: 'qwen',
      durationMs: -5,
      draftId: '   ',
      errorMessage: 'cancelled',
    });

    expect(built).toEqual({
      timestamp: 1,
      kind: 'chat',
      status: 'aborted',
      provider: 'openrouter',
      model: 'qwen',
      durationMs: 0,
      errorMessage: 'cancelled',
    });
  });
});

describe('normalizeUsageRecord', () => {
  it('round-trips a stored record including id and token counts', () => {
    const stored = normalizeUsageRecord({
      id: 7,
      timestamp: 1_700_000_000_000,
      kind: 'lorebook',
      status: 'ok',
      provider: 'openrouter',
      model: 'qwen/qwen-2.5-72b-instruct',
      durationMs: 2500,
      promptTokens: 40,
      completionTokens: 12,
      totalTokens: 52,
      draftId: 'd1',
    });

    expect(stored).toEqual({
      id: 7,
      timestamp: 1_700_000_000_000,
      kind: 'lorebook',
      status: 'ok',
      provider: 'openrouter',
      model: 'qwen/qwen-2.5-72b-instruct',
      durationMs: 2500,
      promptTokens: 40,
      completionTokens: 12,
      totalTokens: 52,
      draftId: 'd1',
    });
  });

  it('rejects values that are not recognizable records', () => {
    expect(normalizeUsageRecord(null)).toBeNull();
    expect(normalizeUsageRecord('nope')).toBeNull();
    expect(normalizeUsageRecord({ timestamp: 1, kind: 'mystery', status: 'ok', provider: 'p', model: 'm' })).toBeNull();
    expect(normalizeUsageRecord({ timestamp: 1, kind: 'chat', status: 'fine', provider: 'p', model: 'm' })).toBeNull();
    expect(normalizeUsageRecord({ timestamp: NaN, kind: 'chat', status: 'ok', provider: 'p', model: 'm' })).toBeNull();
    expect(normalizeUsageRecord({ timestamp: 1, kind: 'chat', status: 'ok', provider: '  ', model: 'm' })).toBeNull();
  });

  it('drops invalid token counts but keeps valid context strings', () => {
    const stored = normalizeUsageRecord({
      timestamp: 5,
      kind: 'similarity',
      status: 'ok',
      provider: 'google',
      model: 'gemini-2.0-flash',
      durationMs: 90,
      promptTokens: 'lots',
      assetName: ' character_sheet ',
      errorMessage: '',
    });

    expect(stored).toEqual({
      timestamp: 5,
      kind: 'similarity',
      status: 'ok',
      provider: 'google',
      model: 'gemini-2.0-flash',
      durationMs: 90,
      assetName: 'character_sheet',
    });
  });
});

describe('filterUsageRecords', () => {
  it('applies an inclusive since and exclusive until bound', () => {
    const first = record({ timestamp: 10 });
    const middle = record({ timestamp: 20 });
    const last = record({ timestamp: 30 });

    expect(filterUsageRecords([first, middle, last], { sinceMs: 10, untilMs: 30 })).toEqual([first, middle]);
  });

  it('filters by kind, status, and draft id', () => {
    const asset = record({ kind: 'asset', draftId: 'd1' });
    const lorebook = record({ kind: 'lorebook', status: 'error', draftId: 'd2' });

    expect(filterUsageRecords([asset, lorebook], { kinds: ['asset'] })).toEqual([asset]);
    expect(filterUsageRecords([asset, lorebook], { statuses: ['error'] })).toEqual([lorebook]);
    expect(filterUsageRecords([asset, lorebook], { draftId: 'd2' })).toEqual([lorebook]);
  });
});

describe('summarizeUsage', () => {
  const records: UsageRecord[] = [
    record({
      provider: 'openai',
      model: 'gpt-4o',
      durationMs: 1000,
      promptTokens: 10,
      completionTokens: 5,
      totalTokens: 15,
    }),
    record({ provider: 'openai', model: 'gpt-4o', durationMs: 3000, status: 'error' }),
    record({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-latest',
      durationMs: 2000,
      promptTokens: 20,
      completionTokens: 10,
      totalTokens: 30,
    }),
  ];

  it('totals every call and groups with counts, failure rate, and averages', () => {
    const summary = summarizeUsage(records, { groupBy: 'provider' });

    expect(summary.totals).toEqual({
      key: 'all',
      calls: 3,
      okCalls: 2,
      errorCalls: 1,
      abortedCalls: 0,
      failureRate: 1 / 3,
      promptTokens: 30,
      completionTokens: 15,
      totalTokens: 45,
      avgDurationMs: 2000,
      avgTotalTokens: 15,
    });

    expect(summary.groups.map((group) => group.key)).toEqual(['openai', 'anthropic']);
    expect(summary.groups[0]).toMatchObject({
      key: 'openai',
      calls: 2,
      errorCalls: 1,
      totalTokens: 15,
      avgDurationMs: 2000,
    });
  });

  it('groups by UTC day', () => {
    const dayRecords = [
      record({ timestamp: Date.UTC(2026, 8, 28, 23, 30) }),
      record({ timestamp: Date.UTC(2026, 8, 29, 0, 30) }),
    ];

    const summary = summarizeUsage(dayRecords, { groupBy: 'day' });

    expect(summary.groups.map((group) => group.key)).toEqual(['2026-09-28', '2026-09-29']);
  });

  it('falls back to the unattributed key for optional groupings', () => {
    const attributed = record({ assetName: 'system_prompt' });

    const summary = summarizeUsage([attributed, record()], { groupBy: 'asset' });

    expect(summary.groups.map((group) => group.key)).toEqual([UNATTRIBUTED_GROUP_KEY, 'system_prompt']);
  });

  it('applies the filter before aggregating', () => {
    const summary = summarizeUsage(records, { filter: { statuses: ['error'] } });

    expect(summary.totals.calls).toBe(1);
    expect(summary.totals.errorCalls).toBe(1);
    expect(summary.groups).toHaveLength(1);
  });

  it('returns zeroed totals for empty input', () => {
    const summary = summarizeUsage([], { groupBy: 'model' });

    expect(summary.totals).toEqual({
      key: 'all',
      calls: 0,
      okCalls: 0,
      errorCalls: 0,
      abortedCalls: 0,
      failureRate: 0,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      avgDurationMs: 0,
      avgTotalTokens: 0,
    });
    expect(summary.groups).toEqual([]);
  });
});

describe('usageGroupKey', () => {
  it('derives a UTC day key from the timestamp', () => {
    expect(usageGroupKey(record({ timestamp: Date.UTC(2026, 8, 29, 5) }), 'day')).toBe('2026-09-29');
  });
});

describe('pruneUsageRecords', () => {
  it('keeps the newest records and preserves their original order', () => {
    const oldest = record({ timestamp: 1 });
    const newest = record({ timestamp: 3 });
    const middle = record({ timestamp: 2 });

    expect(pruneUsageRecords([oldest, newest, middle], 2)).toEqual([newest, middle]);
  });

  it('returns everything unchanged when under the limit', () => {
    const only = record({ timestamp: 1 });

    expect(pruneUsageRecords([only], USAGE_RETENTION_LIMIT)).toEqual([only]);
  });
});
