/**
 * Usage records: the durable contract for per-call LLM telemetry.
 *
 * The provider engines normalise token usage per call (`GenerateResult.usage`
 * and the final `StreamChunk.usage`), but the engines do not persist anything.
 * This module defines the record surfaces write for every LLM call plus pure
 * aggregation helpers for the Insights surface. Storage itself is owned by
 * each surface (IndexedDB in the browser, SQLite in the desktop app), so this
 * file deliberately has no runtime dependencies.
 */

import type { TokenUsage } from '../llm/types';

export type UsageCallKind =
  | 'orchestrator'
  | 'asset'
  | 'seed'
  | 'offspring-seed'
  | 'lorebook'
  | 'refine'
  | 'chat'
  | 'similarity'
  | 'connection-test';

export type UsageCallStatus = 'ok' | 'error' | 'aborted';

export const USAGE_CALL_KINDS: readonly UsageCallKind[] = [
  'orchestrator',
  'asset',
  'seed',
  'offspring-seed',
  'lorebook',
  'refine',
  'chat',
  'similarity',
  'connection-test',
];

export const USAGE_CALL_STATUSES: readonly UsageCallStatus[] = ['ok', 'error', 'aborted'];

/** Default cap applied when surfaces prune stored usage records. */
export const USAGE_RETENTION_LIMIT = 5000;

/** Key used when a record has no value for the requested grouping. */
export const UNATTRIBUTED_GROUP_KEY = '(unattributed)';

export interface UsageRecord {
  id?: number;
  /** Epoch milliseconds. */
  timestamp: number;
  kind: UsageCallKind;
  status: UsageCallStatus;
  provider: string;
  model: string;
  durationMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  draftId?: string;
  templateName?: string;
  assetName?: string;
  errorMessage?: string;
}

/** The shape call sites build; `buildUsageRecord` turns it into a record. */
export interface UsageRecordDraft {
  timestamp: number;
  kind: UsageCallKind;
  status: UsageCallStatus;
  provider: string;
  model: string;
  durationMs: number;
  usage?: TokenUsage;
  draftId?: string;
  templateName?: string;
  assetName?: string;
  errorMessage?: string;
}

const OPTIONAL_STRING_FIELDS = ['draftId', 'templateName', 'assetName', 'errorMessage'] as const;

const TOKEN_FIELDS = ['promptTokens', 'completionTokens', 'totalTokens'] as const;

function assignOptionalString(
  record: UsageRecord,
  field: (typeof OPTIONAL_STRING_FIELDS)[number],
  value: unknown,
): void {
  if (typeof value === 'string' && value.trim()) {
    record[field] = value.trim();
  }
}

function coerceNonNegativeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

function coerceOptionalTokenCount(value: unknown): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return Math.round(value);
}

/**
 * Build a record at an LLM call site. Token usage is copied from the
 * engine-reported `usage` object; optional context fields are dropped when
 * empty so stored records stay minimal.
 */
export function buildUsageRecord(draft: UsageRecordDraft): UsageRecord {
  const record: UsageRecord = {
    timestamp: Math.round(draft.timestamp),
    kind: draft.kind,
    status: draft.status,
    provider: draft.provider.trim(),
    model: draft.model.trim(),
    durationMs: coerceNonNegativeNumber(draft.durationMs),
  };

  if (draft.usage) {
    record.promptTokens = draft.usage.promptTokens;
    record.completionTokens = draft.usage.completionTokens;
    record.totalTokens = draft.usage.totalTokens;
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    assignOptionalString(record, field, draft[field]);
  }

  return record;
}

/**
 * Coerce a value read back from storage. Returns null when the value is not a
 * recognizable usage record, so a corrupt row can be dropped instead of
 * poisoning aggregates.
 */
export function normalizeUsageRecord(value: unknown): UsageRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const kind = raw.kind as UsageCallKind;
  const status = raw.status as UsageCallStatus;
  const provider = typeof raw.provider === 'string' ? raw.provider.trim() : '';
  const model = typeof raw.model === 'string' ? raw.model.trim() : '';
  const timestamp = typeof raw.timestamp === 'number' && Number.isFinite(raw.timestamp) ? raw.timestamp : NaN;

  if (!USAGE_CALL_KINDS.includes(kind) || !USAGE_CALL_STATUSES.includes(status)) {
    return null;
  }

  if (!provider || !model || !Number.isFinite(timestamp)) {
    return null;
  }

  const record: UsageRecord = {
    timestamp,
    kind,
    status,
    provider,
    model,
    durationMs: coerceNonNegativeNumber(raw.durationMs),
  };

  if (typeof raw.id === 'number' && Number.isFinite(raw.id)) {
    record.id = raw.id;
  }

  for (const field of TOKEN_FIELDS) {
    const tokens = coerceOptionalTokenCount(raw[field]);
    if (tokens !== undefined) {
      record[field] = tokens;
    }
  }

  for (const field of OPTIONAL_STRING_FIELDS) {
    assignOptionalString(record, field, raw[field]);
  }

  return record;
}

export interface UsageFilter {
  /** Inclusive lower bound, epoch milliseconds. */
  sinceMs?: number;
  /** Exclusive upper bound, epoch milliseconds. */
  untilMs?: number;
  kinds?: readonly UsageCallKind[];
  statuses?: readonly UsageCallStatus[];
  draftId?: string;
}

export function filterUsageRecords(records: readonly UsageRecord[], filter: UsageFilter = {}): UsageRecord[] {
  const kinds = filter.kinds ? new Set(filter.kinds) : undefined;
  const statuses = filter.statuses ? new Set(filter.statuses) : undefined;

  return records.filter((record) => {
    if (filter.sinceMs !== undefined && record.timestamp < filter.sinceMs) {
      return false;
    }
    if (filter.untilMs !== undefined && record.timestamp >= filter.untilMs) {
      return false;
    }
    if (kinds && !kinds.has(record.kind)) {
      return false;
    }
    if (statuses && !statuses.has(record.status)) {
      return false;
    }
    if (filter.draftId !== undefined && record.draftId !== filter.draftId) {
      return false;
    }
    return true;
  });
}

export type UsageGroupBy = 'provider' | 'model' | 'kind' | 'status' | 'asset' | 'draft' | 'template' | 'day';

export function usageGroupKey(record: UsageRecord, groupBy: UsageGroupBy): string {
  switch (groupBy) {
    case 'provider':
      return record.provider;
    case 'model':
      return record.model;
    case 'kind':
      return record.kind;
    case 'status':
      return record.status;
    case 'asset':
      return record.assetName?.trim() || UNATTRIBUTED_GROUP_KEY;
    case 'draft':
      return record.draftId?.trim() || UNATTRIBUTED_GROUP_KEY;
    case 'template':
      return record.templateName?.trim() || UNATTRIBUTED_GROUP_KEY;
    case 'day':
      return new Date(record.timestamp).toISOString().slice(0, 10);
  }
}

export interface UsageGroupSummary {
  key: string;
  calls: number;
  okCalls: number;
  errorCalls: number;
  abortedCalls: number;
  failureRate: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  avgDurationMs: number;
  avgTotalTokens: number;
}

export interface UsageSummary {
  totals: UsageGroupSummary;
  groups: UsageGroupSummary[];
}

export interface UsageSummarizeOptions {
  filter?: UsageFilter;
  groupBy?: UsageGroupBy;
}

function summarizeGroup(key: string, records: UsageRecord[]): UsageGroupSummary {
  let okCalls = 0;
  let errorCalls = 0;
  let abortedCalls = 0;
  let promptTokens = 0;
  let completionTokens = 0;
  let totalTokens = 0;
  let durationMs = 0;

  for (const record of records) {
    if (record.status === 'ok') {
      okCalls += 1;
    } else if (record.status === 'error') {
      errorCalls += 1;
    } else {
      abortedCalls += 1;
    }

    promptTokens += record.promptTokens ?? 0;
    completionTokens += record.completionTokens ?? 0;
    totalTokens += record.totalTokens ?? 0;
    durationMs += record.durationMs;
  }

  const calls = records.length;

  return {
    key,
    calls,
    okCalls,
    errorCalls,
    abortedCalls,
    failureRate: calls > 0 ? errorCalls / calls : 0,
    promptTokens,
    completionTokens,
    totalTokens,
    avgDurationMs: calls > 0 ? durationMs / calls : 0,
    avgTotalTokens: calls > 0 ? totalTokens / calls : 0,
  };
}

/**
 * Aggregate records into a totals block plus per-group summaries. Groups are
 * sorted by call count (descending) then key. Averages are over all calls in
 * the group; calls without provider-reported usage contribute zero tokens.
 */
export function summarizeUsage(records: readonly UsageRecord[], options: UsageSummarizeOptions = {}): UsageSummary {
  const filtered = options.filter ? filterUsageRecords(records, options.filter) : [...records];
  const groupBy = options.groupBy ?? 'provider';

  const recordsByKey = new Map<string, UsageRecord[]>();
  for (const record of filtered) {
    const key = usageGroupKey(record, groupBy);
    const bucket = recordsByKey.get(key);
    if (bucket) {
      bucket.push(record);
    } else {
      recordsByKey.set(key, [record]);
    }
  }

  const groups = [...recordsByKey.entries()].map(([key, bucket]) => summarizeGroup(key, bucket));
  groups.sort((a, b) => b.calls - a.calls || a.key.localeCompare(b.key));

  return {
    totals: summarizeGroup('all', filtered),
    groups,
  };
}

/**
 * Keep the newest `limit` records, preserving the original relative order of
 * the records that survive.
 */
export function pruneUsageRecords(
  records: readonly UsageRecord[],
  limit: number = USAGE_RETENTION_LIMIT,
): UsageRecord[] {
  if (typeof limit !== 'number' || !Number.isFinite(limit) || limit < 0) {
    return [...records];
  }

  if (records.length <= limit) {
    return [...records];
  }

  const kept = new Set([...records].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit));
  return records.filter((record) => kept.has(record));
}
