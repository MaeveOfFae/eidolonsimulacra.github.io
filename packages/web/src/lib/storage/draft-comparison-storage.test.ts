import Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Draft } from '@char-gen/shared';
import { COMPARISON_DB_SCHEMA, db, DRAFT_DB_SCHEMA, DraftDatabase, DraftStorage, USAGE_DB_SCHEMA } from './draft-db.js';

function draft(overrides: Partial<Draft['metadata']> & { review_id: string }): Draft {
  return {
    path: overrides.review_id,
    metadata: {
      seed: 'a seed',
      favorite: false,
      ...overrides,
    },
    assets: { character_sheet: 'sheet content' },
  };
}

beforeEach(async () => {
  await db.drafts.clear();
});

afterEach(async () => {
  await db.drafts.clear();
});

describe('DraftStorage comparison groups', () => {
  it('returns only the group drafts, oldest first', async () => {
    await DraftStorage.saveDraft(draft({ review_id: 'plain' }));
    await DraftStorage.saveDraft(
      draft({
        review_id: 'cmp-b',
        model: 'model-b',
        comparison_group: 'cmp-1',
        created: '2026-09-29T00:00:02.000Z',
      }),
    );
    await DraftStorage.saveDraft(
      draft({
        review_id: 'cmp-a',
        model: 'model-a',
        comparison_group: 'cmp-1',
        created: '2026-09-29T00:00:01.000Z',
      }),
    );

    const group = await DraftStorage.getComparisonGroupDrafts('cmp-1');
    expect(group.map((metadata) => metadata.review_id)).toEqual(['cmp-a', 'cmp-b']);
    expect(group.every((metadata) => metadata.comparison_group === 'cmp-1')).toBe(true);

    expect(await DraftStorage.getComparisonGroupDrafts('   ')).toEqual([]);
  });
});

describe('comparison store schema upgrade', () => {
  it('upgrades a version 2 database, keeps drafts and usage records, and serves the new index', async () => {
    const dbName = `ComparisonUpgradeTestDB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const legacy = new Dexie(dbName);
    legacy.version(1).stores(DRAFT_DB_SCHEMA);
    legacy.version(2).stores(USAGE_DB_SCHEMA);
    await legacy.open();
    await legacy.table('drafts').add({
      reviewId: 'legacy-1',
      metadata: draft({ review_id: 'legacy-1' }).metadata,
      assets: {},
      createdAt: 1,
      updatedAt: 1,
    });
    await legacy.table('usageRecords').add({
      timestamp: 1,
      kind: 'orchestrator',
      status: 'ok',
      provider: 'openai',
      model: 'gpt-4o',
      durationMs: 10,
    });
    await legacy.close();

    const upgraded = new DraftDatabase(dbName);
    await upgraded.open();

    expect(upgraded.verno).toBe(3);
    expect(await upgraded.table('drafts').count()).toBe(1);
    expect(await upgraded.table('usageRecords').count()).toBe(1);

    await upgraded.table('drafts').add({
      reviewId: 'cmp-x',
      metadata: draft({ review_id: 'cmp-x', comparison_group: 'cmp-9' }).metadata,
      assets: {},
      createdAt: 2,
      updatedAt: 2,
    });
    const matched = await upgraded.table('drafts').where('metadata.comparison_group').equals('cmp-9').toArray();
    expect(matched).toHaveLength(1);

    await upgraded.close();
    await Dexie.delete(dbName);
  });
});
