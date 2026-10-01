import { describe, expect, it } from 'vitest';
import {
  MAX_SAVED_SEARCHES,
  applyDraftLibraryFilter,
  createSavedSearchId,
  findDuplicateDraftCandidates,
  isActiveDraftLibraryFilter,
  normalizeDraftLibraryFilter,
  normalizeSavedSearchRecord,
  upsertSavedSearch,
} from './draft-library';
import type { DraftMetadata } from './types';

function draft(overrides: Partial<DraftMetadata> & { review_id: string }): DraftMetadata {
  return {
    seed: 'a seed',
    favorite: false,
    ...overrides,
  };
}

describe('normalizeDraftLibraryFilter', () => {
  it('keeps valid values and drops garbage', () => {
    expect(
      normalizeDraftLibraryFilter({
        search: '  vesna ',
        favoritesOnly: true,
        mergedOnly: 'yes',
        undoableOnly: false,
        mergeStrategy: 'staged-merge',
        mode: 'NSFW',
        genre: 42,
        sortField: 'name',
        sortOrder: 'sideways',
      }),
    ).toEqual({
      search: '  vesna ',
      favoritesOnly: true,
      mergeStrategy: 'staged-merge',
      mode: 'NSFW',
      sortField: 'name',
    });
  });

  it('returns an empty filter for non-object input', () => {
    expect(normalizeDraftLibraryFilter(null)).toEqual({});
    expect(normalizeDraftLibraryFilter('nope')).toEqual({});
  });
});

describe('applyDraftLibraryFilter', () => {
  const drafts: DraftMetadata[] = [
    draft({
      review_id: 'd-1',
      character_name: 'Vesna',
      seed: 'a lonely space pirate',
      template_name: 'V2/V3 Card',
      notes: 'keeps notes',
      mode: 'NSFW',
      genre: 'sci-fi',
      favorite: true,
      created: '2026-09-01T00:00:00.000Z',
      modified: '2026-09-03T00:00:00.000Z',
    }),
    draft({
      review_id: 'd-2',
      character_name: 'Maeve',
      seed: 'night court archivist',
      mode: 'SFW',
      genre: 'fantasy',
      created: '2026-09-02T00:00:00.000Z',
    }),
    draft({
      review_id: 'd-3',
      seed: 'a lonely space pirate remake',
      created: '2026-09-04T00:00:00.000Z',
      modified: '2026-09-05T00:00:00.000Z',
    }),
  ];

  it('searches name, seed, template, and notes case-insensitively', () => {
    expect(applyDraftLibraryFilter(drafts, { search: 'vesna' }).map((d) => d.review_id)).toEqual(['d-1']);
    // Filtered results keep the default modified-desc sort.
    expect(applyDraftLibraryFilter(drafts, { search: 'SPACE PIRATE' }).map((d) => d.review_id)).toEqual(['d-3', 'd-1']);
    expect(applyDraftLibraryFilter(drafts, { search: 'V2/V3' }).map((d) => d.review_id)).toEqual(['d-1']);
    expect(applyDraftLibraryFilter(drafts, { search: 'keeps notes' }).map((d) => d.review_id)).toEqual(['d-1']);
  });

  it('filters by favorites, mode, and genre', () => {
    expect(applyDraftLibraryFilter(drafts, { favoritesOnly: true }).map((d) => d.review_id)).toEqual(['d-1']);
    expect(applyDraftLibraryFilter(drafts, { mode: 'SFW' }).map((d) => d.review_id)).toEqual(['d-2']);
    expect(applyDraftLibraryFilter(drafts, { genre: 'sci-fi' }).map((d) => d.review_id)).toEqual(['d-1']);
  });

  it('filters merged and undoable drafts from history or provenance', () => {
    const merged = draft({
      review_id: 'm-1',
      merge_history: [
        {
          id: 'event-1',
          strategy: 'single-asset',
          source_draft_id: 'a',
          source_side: 'left',
          base_draft_id: 'b',
          base_side: 'right',
          asset_names: [],
          created_at: '2026-09-01T00:00:00.000Z',
        },
      ],
    });
    const undoable = draft({
      review_id: 'm-2',
      merge_history: [
        {
          id: 'event-2',
          strategy: 'staged-merge',
          source_draft_id: 'a',
          source_side: 'left',
          base_draft_id: 'b',
          base_side: 'right',
          asset_names: [],
          created_at: '2026-09-01T00:00:00.000Z',
          undo_snapshot_id: 'snap',
        },
      ],
    });
    const provenance = draft({
      review_id: 'm-3',
      merge_provenance: {
        strategy: 'staged-merge',
        source_draft_id: 'a',
        source_side: 'left',
        base_draft_id: 'b',
        base_side: 'right',
        asset_names: [],
        created_at: '2026-09-01T00:00:00.000Z',
      },
    });
    const library = [draft({ review_id: 'plain' }), merged, undoable, provenance];

    expect(applyDraftLibraryFilter(library, { mergedOnly: true }).map((d) => d.review_id)).toEqual([
      'm-1',
      'm-2',
      'm-3',
    ]);
    expect(applyDraftLibraryFilter(library, { undoableOnly: true }).map((d) => d.review_id)).toEqual(['m-2']);
    expect(applyDraftLibraryFilter(library, { mergeStrategy: 'staged-merge' }).map((d) => d.review_id)).toEqual([
      'm-2',
      'm-3',
    ]);
  });

  it('sorts by created, modified (with created fallback), and name in both orders', () => {
    expect(applyDraftLibraryFilter(drafts, { sortField: 'created', sortOrder: 'asc' }).map((d) => d.review_id)).toEqual(
      ['d-1', 'd-2', 'd-3'],
    );
    // d-2 has no modified date and falls back to its created date.
    expect(
      applyDraftLibraryFilter(drafts, { sortField: 'modified', sortOrder: 'desc' }).map((d) => d.review_id),
    ).toEqual(['d-3', 'd-1', 'd-2']);
    // d-3 has no character name, so it sorts by its seed ('a lonely…') first.
    expect(applyDraftLibraryFilter(drafts, { sortField: 'name', sortOrder: 'asc' }).map((d) => d.review_id)).toEqual([
      'd-3',
      'd-2',
      'd-1',
    ]);
  });

  it('returns everything sorted by modified desc for an empty filter', () => {
    expect(applyDraftLibraryFilter(drafts).map((d) => d.review_id)).toEqual(['d-3', 'd-1', 'd-2']);
    expect(isActiveDraftLibraryFilter({})).toBe(false);
    expect(isActiveDraftLibraryFilter({ search: '  ' })).toBe(false);
    expect(isActiveDraftLibraryFilter({ favoritesOnly: true })).toBe(true);
  });
});

describe('saved search records', () => {
  it('normalizes valid records and rejects incomplete ones', () => {
    const record = normalizeSavedSearchRecord({
      id: ' search-1 ',
      name: ' Sci-fi favourites ',
      filter: { search: 'pirate', favoritesOnly: true, sortField: 'bogus' },
      createdAt: '2026-09-28T00:00:00.000Z',
    });

    expect(record).toEqual({
      id: 'search-1',
      name: 'Sci-fi favourites',
      filter: { search: 'pirate', favoritesOnly: true },
      createdAt: '2026-09-28T00:00:00.000Z',
    });

    expect(normalizeSavedSearchRecord({ id: 'x' })).toBeNull();
    expect(normalizeSavedSearchRecord({ name: 'no id' })).toBeNull();
    expect(normalizeSavedSearchRecord('nope')).toBeNull();
  });

  it('creates unique ids', () => {
    expect(createSavedSearchId()).toMatch(/^search-\d+-[a-z0-9]+$/);
    expect(createSavedSearchId()).not.toBe(createSavedSearchId());
  });

  it('upserts newest-first, replaces by id, and caps the list', () => {
    const base = [
      { id: 'a', name: 'A', filter: {}, createdAt: '2026-09-01T00:00:00.000Z' },
      { id: 'b', name: 'B', filter: {}, createdAt: '2026-09-02T00:00:00.000Z' },
    ];

    const added = upsertSavedSearch(base, {
      id: 'c',
      name: 'C',
      filter: { favoritesOnly: true },
      createdAt: '2026-09-03T00:00:00.000Z',
    });
    expect(added.map((entry) => entry.id)).toEqual(['c', 'a', 'b']);

    const replaced = upsertSavedSearch(added, {
      id: 'a',
      name: 'A2',
      filter: { genre: 'fantasy' },
      createdAt: '2026-09-04T00:00:00.000Z',
    });
    expect(replaced.map((entry) => entry.id)).toEqual(['a', 'c', 'b']);
    expect(replaced[0]?.name).toBe('A2');

    const capped = upsertSavedSearch(
      Array.from({ length: MAX_SAVED_SEARCHES }, (_, index) => ({
        id: `id-${index}`,
        name: `Search ${index}`,
        filter: {},
        createdAt: '2026-09-01T00:00:00.000Z',
      })),
      { id: 'newest', name: 'Newest', filter: {}, createdAt: '2026-09-05T00:00:00.000Z' },
    );
    expect(capped).toHaveLength(MAX_SAVED_SEARCHES);
    expect(capped[0]?.id).toBe('newest');
    expect(capped[capped.length - 1]?.id).toBe(`id-${MAX_SAVED_SEARCHES - 2}`);
  });
});

describe('findDuplicateDraftCandidates', () => {
  it('pairs drafts sharing a normalized seed', () => {
    const drafts = [
      draft({ review_id: 'a', seed: 'A Lonely Space Pirate' }),
      draft({ review_id: 'b', seed: 'a lonely   space pirate' }),
      draft({ review_id: 'c', seed: 'night court archivist' }),
    ];

    expect(findDuplicateDraftCandidates(drafts)).toEqual([{ draftIds: ['a', 'b'], reason: 'same-seed' }]);
  });

  it('pairs drafts sharing a normalized character name', () => {
    const drafts = [
      draft({ review_id: 'a', seed: 'seed one', character_name: 'Vesna' }),
      draft({ review_id: 'b', seed: 'seed two', character_name: ' vesna ' }),
      draft({ review_id: 'c', seed: 'seed three', character_name: 'Maeve' }),
    ];

    expect(findDuplicateDraftCandidates(drafts)).toEqual([{ draftIds: ['a', 'b'], reason: 'same-name' }]);
  });

  it('reports a pair once when both seed and name match', () => {
    const drafts = [
      draft({ review_id: 'a', seed: 'same seed', character_name: 'Vesna' }),
      draft({ review_id: 'b', seed: 'Same   Seed', character_name: 'vesna' }),
    ];

    expect(findDuplicateDraftCandidates(drafts)).toEqual([{ draftIds: ['a', 'b'], reason: 'same-seed' }]);
  });

  it('returns nothing for unique libraries and honors the pair cap', () => {
    expect(findDuplicateDraftCandidates([draft({ review_id: 'a', seed: 'one' })])).toEqual([]);

    const manyDuplicates = Array.from({ length: 20 }, (_, index) =>
      draft({ review_id: `d-${index}`, seed: 'identical seed' }),
    );
    const pairs = findDuplicateDraftCandidates(manyDuplicates, { maxPairs: 5 });
    expect(pairs).toHaveLength(5);
    expect(new Set(pairs.map((pair) => pair.draftIds.join('|'))).size).toBe(5);
  });
});
