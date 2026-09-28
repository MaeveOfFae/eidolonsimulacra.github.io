import { describe, expect, it } from 'vitest';
import type { DraftMetadata } from '@char-gen/shared';
import { isDraftArchived, resolveDraftArchiveAction, selectDraftListSource } from './draft-archive';

function buildMetadata(overrides: Partial<DraftMetadata> = {}): DraftMetadata {
  return {
    review_id: 'draft-a',
    seed: 'A wandering duelist',
    favorite: false,
    ...overrides,
  };
}

describe('isDraftArchived', () => {
  it('is false without an archived_at stamp', () => {
    expect(isDraftArchived(buildMetadata())).toBe(false);
  });

  it('is true with an archived_at stamp', () => {
    expect(isDraftArchived(buildMetadata({ archived_at: '2026-01-01T00:00:00.000Z' }))).toBe(true);
  });

  it('treats a blank archived_at as not archived', () => {
    expect(isDraftArchived(buildMetadata({ archived_at: '   ' }))).toBe(false);
  });
});

describe('resolveDraftArchiveAction', () => {
  it('offers archiving for an active draft and stamps the supplied time', () => {
    const action = resolveDraftArchiveAction(buildMetadata(), '2026-02-03T04:05:06.000Z');

    expect(action.kind).toBe('archive');
    expect(action.actionLabel).toBe('Archive');
    expect(action.updates).toEqual({ archived_at: '2026-02-03T04:05:06.000Z' });
    expect(action.snapshotReason).toBe('pre-draft-archive');
  });

  it('offers restoring for an archived draft and clears the stamp', () => {
    const action = resolveDraftArchiveAction(
      buildMetadata({ archived_at: '2026-01-01T00:00:00.000Z' }),
      '2026-02-03T04:05:06.000Z',
    );

    expect(action.kind).toBe('restore');
    expect(action.actionLabel).toBe('Restore');
    expect(action.updates).toEqual({ archived_at: undefined });
    expect(action.snapshotReason).toBe('pre-draft-restore');
  });

  it('names the draft by character name when one is set', () => {
    const action = resolveDraftArchiveAction(buildMetadata({ character_name: 'Aria' }));

    expect(action.confirmationMessage).toContain('Aria');
  });

  it('falls back to the seed when the draft has no character name', () => {
    const action = resolveDraftArchiveAction(buildMetadata());

    expect(action.confirmationMessage).toContain('A wandering duelist');
  });
});

describe('selectDraftListSource', () => {
  const active = [buildMetadata({ review_id: 'active-1' })];
  const archived = [buildMetadata({ review_id: 'archived-1', archived_at: '2026-01-01T00:00:00.000Z' })];

  it('reads the active list for "all"', () => {
    expect(selectDraftListSource(active, archived, 'all')).toEqual(active);
  });

  it('reads the active list for "favorites"', () => {
    expect(selectDraftListSource(active, archived, 'favorites')).toEqual(active);
  });

  it('reads the archived list for "archived"', () => {
    expect(selectDraftListSource(active, archived, 'archived')).toEqual(archived);
  });

  it('returns an empty list when the archived query has no data yet', () => {
    expect(selectDraftListSource(active, [], 'archived')).toEqual([]);
  });
});
