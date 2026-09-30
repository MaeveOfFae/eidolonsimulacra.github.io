/**
 * Usage record storage: durable per-call LLM telemetry.
 *
 * Browser: the `usageRecords` store (Dexie schema version 2) in the shared
 * EidolonSimulacraDB database. Desktop: a dedicated `usage_records` SQLite
 * table in the same file the draft store uses. Unlike drafts there is no
 * in-memory mirror — records are append-only telemetry read on demand, and
 * writes never block generation: callers fire-and-forget the promise.
 */

import {
  USAGE_RETENTION_LIMIT,
  buildUsageRecord,
  filterUsageRecords,
  normalizeUsageRecord,
  pruneUsageRecords,
  summarizeUsage,
  type UsageFilter,
  type UsageRecord,
  type UsageRecordDraft,
  type UsageSummary,
  type UsageSummarizeOptions,
} from '@char-gen/shared';
import { db, isDesktopDraftStoreEnabled, openDesktopDraftDatabase, type DraftSqlDatabase } from './draft-db.js';

interface UsageRecordRow {
  id: number;
  timestamp: number;
  kind: string;
  status: string;
  provider: string;
  model: string;
  duration_ms: number;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  draft_id: string | null;
  template_name: string | null;
  asset_name: string | null;
  error_message: string | null;
}

function rowToRecord(row: UsageRecordRow): UsageRecord | null {
  return normalizeUsageRecord({
    id: row.id,
    timestamp: row.timestamp,
    kind: row.kind,
    status: row.status,
    provider: row.provider,
    model: row.model,
    durationMs: row.duration_ms,
    promptTokens: row.prompt_tokens ?? undefined,
    completionTokens: row.completion_tokens ?? undefined,
    totalTokens: row.total_tokens ?? undefined,
    draftId: row.draft_id ?? undefined,
    templateName: row.template_name ?? undefined,
    assetName: row.asset_name ?? undefined,
    errorMessage: row.error_message ?? undefined,
  });
}

async function listDesktopUsageRecords(database: DraftSqlDatabase): Promise<UsageRecord[]> {
  const rows = await database.select<UsageRecordRow>('SELECT * FROM usage_records ORDER BY timestamp DESC, id DESC');
  return rows.map(rowToRecord).filter((record): record is UsageRecord => record !== null);
}

async function pruneDesktopUsageRecords(database: DraftSqlDatabase): Promise<void> {
  await database.execute(
    'DELETE FROM usage_records WHERE id NOT IN (SELECT id FROM usage_records ORDER BY timestamp DESC, id DESC LIMIT $1)',
    [USAGE_RETENTION_LIMIT],
  );
}

async function pruneBrowserUsageRecords(): Promise<void> {
  const count = await db.usageRecords.count();
  if (count <= USAGE_RETENTION_LIMIT) {
    return;
  }

  const records = await db.usageRecords.toArray();
  const kept = new Set(pruneUsageRecords(records, USAGE_RETENTION_LIMIT).map((record) => record.id));
  await db.usageRecords.bulkDelete(records.filter((record) => !kept.has(record.id)).map((record) => record.id ?? -1));
}

export class UsageStorage {
  /** Append a record for one finished LLM call and enforce the retention cap. */
  static async record(draft: UsageRecordDraft): Promise<void> {
    const record = buildUsageRecord(draft);

    if (isDesktopDraftStoreEnabled()) {
      const database = await openDesktopDraftDatabase();
      await database.execute(
        `INSERT INTO usage_records
           (timestamp, kind, status, provider, model, duration_ms, prompt_tokens, completion_tokens,
            total_tokens, draft_id, template_name, asset_name, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          record.timestamp,
          record.kind,
          record.status,
          record.provider,
          record.model,
          record.durationMs,
          record.promptTokens ?? null,
          record.completionTokens ?? null,
          record.totalTokens ?? null,
          record.draftId ?? null,
          record.templateName ?? null,
          record.assetName ?? null,
          record.errorMessage ?? null,
        ],
      );
      await pruneDesktopUsageRecords(database);
      return;
    }

    await db.usageRecords.add(record);
    await pruneBrowserUsageRecords();
  }

  /** Newest-first records matching the filter. */
  static async list(filter: UsageFilter = {}): Promise<UsageRecord[]> {
    const records = isDesktopDraftStoreEnabled()
      ? await listDesktopUsageRecords(await openDesktopDraftDatabase())
      : (await db.usageRecords.toArray()).sort((a, b) => b.timestamp - a.timestamp);

    return filterUsageRecords(records, filter);
  }

  /** Aggregated usage (see `summarizeUsage` in @char-gen/shared). */
  static async summarize(options: UsageSummarizeOptions = {}): Promise<UsageSummary> {
    const records = await UsageStorage.list(options.filter ?? {});
    return summarizeUsage(records, options);
  }

  /** Delete every stored usage record. */
  static async clear(): Promise<void> {
    if (isDesktopDraftStoreEnabled()) {
      const database = await openDesktopDraftDatabase();
      await database.execute('DELETE FROM usage_records');
      return;
    }

    await db.usageRecords.clear();
  }
}
