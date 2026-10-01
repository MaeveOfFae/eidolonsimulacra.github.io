import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Draft } from '@char-gen/shared';
import { db, DraftStorage } from './draft-db.js';

function draft(reviewId: string, overrides: Partial<Draft['metadata']> = {}): Draft {
  return {
    path: reviewId,
    metadata: {
      review_id: reviewId,
      seed: `seed for ${reviewId}`,
      favorite: false,
      ...overrides,
    },
    assets: { character_sheet: 'sheet' },
  };
}

beforeEach(async () => {
  await db.drafts.clear();
  await db.tags.clear();
});

afterEach(async () => {
  await db.drafts.clear();
  await db.tags.clear();
});

describe('DraftStorage.updateDraftsMetadata', () => {
  it('patches only the listed drafts and stamps modified', async () => {
    await DraftStorage.saveDraft(draft('a', { modified: '2026-09-01T00:00:00.000Z' }));
    await DraftStorage.saveDraft(draft('b', { modified: '2026-09-01T00:00:00.000Z' }));
    await DraftStorage.saveDraft(draft('c', { modified: '2026-09-01T00:00:00.000Z' }));

    const updated = await DraftStorage.updateDraftsMetadata(['a', 'c'], { favorite: true, genre: 'sci-fi' });
    expect(updated).toBe(2);

    const patched = await DraftStorage.getDraft('a');
    const untouched = await DraftStorage.getDraft('b');
    expect(patched?.metadata.favorite).toBe(true);
    expect(patched?.metadata.genre).toBe('sci-fi');
    expect(patched?.metadata.modified).not.toBe('2026-09-01T00:00:00.000Z');
    expect(untouched?.metadata.favorite).toBe(false);
    expect(untouched?.metadata.modified).toBe('2026-09-01T00:00:00.000Z');
  });

  it('clears the archive marker through the explicit unarchive flag', async () => {
    await DraftStorage.saveDraft(
      draft('a', { archived_at: '2026-09-01T00:00:00.000Z', modified: '2026-09-01T00:00:00.000Z' }),
    );

    const updated = await DraftStorage.updateDraftsMetadata(['a'], { unarchive: true });
    expect(updated).toBe(1);

    const restored = await DraftStorage.getDraft('a');
    expect(restored?.metadata.archived_at).toBeUndefined();
  });

  it('replaces the tag index for patched drafts only', async () => {
    await DraftStorage.saveDraft(draft('a', { tags: ['old'] }));
    await DraftStorage.saveDraft(draft('b', { tags: ['keep'] }));

    await DraftStorage.updateDraftsMetadata(['a'], { tags: ['new-a', 'new-b'] });

    const tagRows = await db.tags.toArray();
    expect(
      tagRows
        .filter((row) => row.draftId === 'a')
        .map((row) => row.tag)
        .sort(),
    ).toEqual(['new-a', 'new-b']);
    expect(tagRows.filter((row) => row.draftId === 'b').map((row) => row.tag)).toEqual(['keep']);
  });

  it('ignores unknown and duplicate ids and returns the matched count', async () => {
    await DraftStorage.saveDraft(draft('a'));

    expect(await DraftStorage.updateDraftsMetadata(['a', 'a', 'missing'], { favorite: true })).toBe(1);
    expect(await DraftStorage.updateDraftsMetadata([], { favorite: true })).toBe(0);
  });
});
