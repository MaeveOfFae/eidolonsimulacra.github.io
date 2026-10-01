/**
 * Model pricing, provider scorecards, and usage-record export.
 *
 * Pricing is user-entered per model (what the user actually pays, per 1K
 * tokens, in their currency) — there is deliberately no bundled price table
 * to maintain. Cost calculation and scorecard aggregation are pure functions
 * over the usage records the engines already write (4.1). Export serializers
 * are pure too, so a surface can test the exact bytes it will download.
 */

import type { UsageRecord } from './records';
import { filterUsageRecords, type UsageFilter } from './records';

// ============================================================================
// Model Pricing
// ============================================================================

export interface ModelPricing {
  id: string;
  model: string;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
  /** ISO 4217 currency code, e.g. "USD". */
  currency: string;
  createdAt: string;
}

export const MAX_MODEL_PRICING_RECORDS = 100;

export function createModelPricingId(): string {
  return `pricing-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function coerceNonNegativeFinite(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return undefined;
  }
  return value;
}

export function normalizeModelPricing(value: unknown): ModelPricing | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : null;
  const model = typeof raw.model === 'string' && raw.model.trim().length > 0 ? raw.model.trim() : null;
  const inputCost = coerceNonNegativeFinite(raw.inputCostPer1kTokens ?? raw.inputCost);
  const outputCost = coerceNonNegativeFinite(raw.outputCostPer1kTokens ?? raw.outputCost);
  const currency =
    typeof raw.currency === 'string' && raw.currency.trim().length > 0 ? raw.currency.trim().toUpperCase() : null;

  if (!id || !model || inputCost === undefined || outputCost === undefined || !currency) {
    return null;
  }

  const createdAt =
    typeof raw.createdAt === 'string' && !Number.isNaN(new Date(raw.createdAt).getTime())
      ? raw.createdAt
      : new Date().toISOString();

  return { id, model, inputCostPer1kTokens: inputCost, outputCostPer1kTokens: outputCost, currency, createdAt };
}

/** Add or replace a pricing record by id, newest first, capped. */
export function upsertModelPricing(
  records: readonly ModelPricing[],
  record: ModelPricing,
  limit: number = MAX_MODEL_PRICING_RECORDS,
): ModelPricing[] {
  return [record, ...records.filter((entry) => entry.id !== record.id)].slice(0, Math.max(0, limit));
}

/**
 * Find the pricing record for a model name. Exact match first, then the
 * longest prefix match (so "gpt-4o-2024-08-06" resolves to a "gpt-4o" entry).
 */
export function findPricingForModel(table: readonly ModelPricing[], model: string): ModelPricing | undefined {
  const exact = table.find((entry) => entry.model === model);
  if (exact) {
    return exact;
  }

  let best: ModelPricing | undefined;
  for (const entry of table) {
    if (model.startsWith(entry.model) && (!best || entry.model.length > best.model.length)) {
      best = entry;
    }
  }

  return best;
}

// ============================================================================
// Cost Calculation
// ============================================================================

/**
 * Calculate the cost of a single LLM call from its token counts and the
 * per-1K-token pricing. Returns 0 when the usage or pricing is missing
 * (the caller decides whether to display "—" or "0").
 */
export function calculateUsageCost(
  usage: { promptTokens?: number; completionTokens?: number },
  pricing: ModelPricing,
): number {
  const inputCost = ((usage.promptTokens ?? 0) / 1000) * pricing.inputCostPer1kTokens;
  const outputCost = ((usage.completionTokens ?? 0) / 1000) * pricing.outputCostPer1kTokens;
  return inputCost + outputCost;
}

// ============================================================================
// Provider Scorecard
// ============================================================================

export interface ProviderScorecardEntry {
  model: string;
  calls: number;
  okCalls: number;
  errorCalls: number;
  failureRate: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  avgDurationMs: number;
  /** Total cost in the pricing record's currency; undefined when no pricing is configured. */
  totalCost?: number;
  /** ISO currency code from the pricing record; undefined when no pricing. */
  currency?: string;
}

/**
 * Build a per-model scorecard from usage records, sorted by call count
 * (descending) then model name. When pricing is configured for a model,
 * the entry carries totalCost and currency.
 */
export function buildProviderScorecard(
  records: readonly UsageRecord[],
  pricingTable: readonly ModelPricing[] = [],
  filter: UsageFilter = {},
): ProviderScorecardEntry[] {
  const filtered = filterUsageRecords([...records], filter);
  const byModel = new Map<string, UsageRecord[]>();

  for (const record of filtered) {
    const bucket = byModel.get(record.model);
    if (bucket) {
      bucket.push(record);
    } else {
      byModel.set(record.model, [record]);
    }
  }

  const entries: ProviderScorecardEntry[] = [];

  for (const [model, modelRecords] of byModel) {
    let okCalls = 0;
    let errorCalls = 0;
    let promptTokens = 0;
    let completionTokens = 0;
    let totalTokens = 0;
    let durationMs = 0;

    for (const record of modelRecords) {
      if (record.status === 'ok') {
        okCalls += 1;
      } else if (record.status === 'error') {
        errorCalls += 1;
      }
      promptTokens += record.promptTokens ?? 0;
      completionTokens += record.completionTokens ?? 0;
      totalTokens += record.totalTokens ?? 0;
      durationMs += record.durationMs;
    }

    const calls = modelRecords.length;
    const entry: ProviderScorecardEntry = {
      model,
      calls,
      okCalls,
      errorCalls,
      failureRate: calls > 0 ? errorCalls / calls : 0,
      promptTokens,
      completionTokens,
      totalTokens,
      avgDurationMs: calls > 0 ? durationMs / calls : 0,
    };

    const pricing = findPricingForModel(pricingTable, model);
    if (pricing) {
      entry.totalCost = calculateUsageCost({ promptTokens, completionTokens }, pricing);
      entry.currency = pricing.currency;
    }

    entries.push(entry);
  }

  entries.sort((a, b) => b.calls - a.calls || a.model.localeCompare(b.model));
  return entries;
}

// ============================================================================
// Usage-Record Export
// ============================================================================

const CSV_HEADER =
  'timestamp,iso_date,kind,status,provider,model,duration_ms,prompt_tokens,completion_tokens,total_tokens,draft_id,template_name,asset_name,error_message';

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Serialize usage records to CSV: one row per call, header line, stable field order. */
export function usageRecordsToCsv(records: readonly UsageRecord[], filter: UsageFilter = {}): string {
  const filtered = filterUsageRecords([...records], filter);
  const rows = filtered.map((record) =>
    [
      String(record.timestamp),
      new Date(record.timestamp).toISOString(),
      record.kind,
      record.status,
      record.provider,
      csvEscape(record.model),
      String(record.durationMs),
      record.promptTokens !== undefined ? String(record.promptTokens) : '',
      record.completionTokens !== undefined ? String(record.completionTokens) : '',
      record.totalTokens !== undefined ? String(record.totalTokens) : '',
      record.draftId ?? '',
      record.templateName ? csvEscape(record.templateName) : '',
      record.assetName ? csvEscape(record.assetName) : '',
      record.errorMessage ? csvEscape(record.errorMessage) : '',
    ].join(','),
  );

  return [CSV_HEADER, ...rows].join('\n');
}

export interface UsageExportJson {
  exported_at: string;
  record_count: number;
  records: UsageRecord[];
}

/** Serialize usage records to a JSON envelope with metadata. */
export function usageRecordsToJson(records: readonly UsageRecord[], filter: UsageFilter = {}): string {
  const filtered = filterUsageRecords([...records], filter);
  const payload: UsageExportJson = {
    exported_at: new Date().toISOString(),
    record_count: filtered.length,
    records: filtered,
  };
  return JSON.stringify(payload, null, 2);
}
