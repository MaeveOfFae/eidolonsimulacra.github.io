import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { USAGE_RETENTION_LIMIT, type UsageRecordDraft } from '@char-gen/shared';
import { db, DraftDatabase, DRAFT_DB_SCHEMA } from './draft-db.js';
import { UsageStorage } from './usage-db.js';

function draft(overrides: Partial<UsageRecordDraft> = {}): UsageRecordDraft {
  return {
    timestamp: 1_700_000_000_000,
    kind: 'orchestrator',
    status: 'ok',
    provider: 'openai',
    model: 'gpt-4o',
    durationMs: 1500,
    usage: { promptTokens: 10, completionTokens: 8, totalTokens: 18 },
    ...overrides,
  };
}

beforeEach(async () => {
  await db.usageRecords.clear();
});

afterEach(async () => {
  await db.usageRecords.clear();
});

describe('UsageStorage browser path', () => {
  it('round-trips a recorded call through list and summarize', async () => {
    await UsageStorage.record(draft());

    const records = await UsageStorage.list();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      kind: 'orchestrator',
      status: 'ok',
      provider: 'openai',
      model: 'gpt-4o',
      durationMs: 1500,
      promptTokens: 10,
      completionTokens: 8,
      totalTokens: 18,
    });
    expect(records[0]?.id).toBeDefined();

    const summary = await UsageStorage.summarize({ groupBy: 'provider' });
    expect(summary.totals.calls).toBe(1);
    expect(summary.totals.totalTokens).toBe(18);
    expect(summary.groups[0]?.key).toBe('openai');
  });

  it('records calls without provider usage', async () => {
    await UsageStorage.record(draft({ usage: undefined, status: 'error', errorMessage: 'boom' }));

    const records = await UsageStorage.list();
    expect(records).toHaveLength(1);
    expect(records[0]?.promptTokens).toBeUndefined();
    expect(records[0]?.errorMessage).toBe('boom');
  });

  it('returns newest records first and applies window filters', async () => {
    await UsageStorage.record(draft({ timestamp: 1_000 }));
    await UsageStorage.record(draft({ timestamp: 2_000 }));
    await UsageStorage.record(draft({ timestamp: 3_000 }));

    const all = await UsageStorage.list();
    expect(all.map((record) => record.timestamp)).toEqual([3_000, 2_000, 1_000]);

    const windowed = await UsageStorage.list({ sinceMs: 1_500, untilMs: 3_000 });
    expect(windowed.map((record) => record.timestamp)).toEqual([2_000]);
  });

  it('clear removes every record', async () => {
    await UsageStorage.record(draft());
    await UsageStorage.clear();

    expect(await UsageStorage.list()).toEqual([]);
  });

  it('prunes to the retention cap keeping the newest records', async () => {
    const seeds = Array.from({ length: USAGE_RETENTION_LIMIT + 2 }, (_, index) => ({
      ...draft({ timestamp: index + 1, usage: undefined }),
    }));
    await db.usageRecords.bulkAdd(seeds);

    // Recording one more call pushes past the cap and triggers the prune.
    await UsageStorage.record(draft({ timestamp: USAGE_RETENTION_LIMIT + 100 }));

    expect(await db.usageRecords.count()).toBe(USAGE_RETENTION_LIMIT);

    const timestamps = (await db.usageRecords.toArray()).map((record) => record.timestamp);
    expect(Math.min(...timestamps)).toBe(4);
  });
});

describe('usage store schema upgrade', () => {
  it('upgrades a version 1 database without touching stored drafts', async () => {
    const dbName = `UsageUpgradeTestDB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const legacy = new Dexie(dbName);
    legacy.version(1).stores(DRAFT_DB_SCHEMA);
    await legacy.open();
    await legacy.table('drafts').add({
      reviewId: 'legacy-1',
      metadata: {},
      assets: {},
      createdAt: 1,
      updatedAt: 1,
    });
    await legacy.close();

    const upgraded = new DraftDatabase(dbName);
    await upgraded.open();

    expect(upgraded.verno).toBe(2);
    expect(await upgraded.table('drafts').count()).toBe(1);
    expect(await upgraded.table('usageRecords').count()).toBe(0);

    await upgraded.table('usageRecords').add(draft());
    expect(await upgraded.table('usageRecords').count()).toBe(1);

    await upgraded.close();
    await Dexie.delete(dbName);
  });
});
