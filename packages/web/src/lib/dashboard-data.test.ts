import { describe, expect, it } from 'vitest';
import type { DraftMetadata, SavedSearchRecord } from '@char-gen/shared';
import {
  buildPinnedSavedSearches,
  describeDraftLibraryFilter,
  listResumableRuns,
  type ResumableRunLoaders,
} from './dashboard-data';
import type {
  ActiveAssetRegeneratorSession,
  ActiveBatchGenerationSession,
  ActiveDraftRefinerSession,
  ActiveGenerationSession,
  ActiveOffspringSession,
  ActiveSeedGeneratorSession,
} from './services/generation-session';

const emptyLoaders: ResumableRunLoaders = {
  generation: () => null,
  batch: () => null,
  seedGenerator: () => null,
  offspring: () => null,
  assetRegenerator: () => null,
  draftRefiner: () => null,
};

function loaders(overrides: Partial<ResumableRunLoaders>): ResumableRunLoaders {
  return { ...emptyLoaders, ...overrides };
}

/** Only the fields the builders read; the rest of each session is irrelevant here. */
function generation(overrides: Partial<ActiveGenerationSession> = {}): ActiveGenerationSession {
  return {
    version: 1,
    seed: 'a lonely space pirate',
    mode: 'SFW',
    assetDrafts: {},
    currentAsset: null,
    currentAssetContent: '',
    currentStatus: 'generating',
    startedAt: 1,
    updatedAt: 10,
    ...overrides,
  };
}

function batch(overrides: Partial<ActiveBatchGenerationSession> = {}): ActiveBatchGenerationSession {
  return {
    version: 1,
    seeds: ['one', 'two'],
    mode: 'SFW',
    parallel: true,
    maxConcurrent: 3,
    inputText: '',
    jobs: [],
    currentSeed: '',
    status: 'configuring',
    updatedAt: 10,
    ...overrides,
  };
}

function seedGenerator(overrides: Partial<ActiveSeedGeneratorSession> = {}): ActiveSeedGeneratorSession {
  return {
    version: 1,
    genreLines: '',
    activePreset: null,
    controls: { count: 6, coverageMode: 'blended' },
    seeds: [],
    status: 'idle',
    updatedAt: 10,
    ...overrides,
  };
}

function offspring(overrides: Partial<ActiveOffspringSession> = {}): ActiveOffspringSession {
  return {
    version: 1,
    parent1Id: 'd-1',
    parent2Id: 'd-2',
    mode: 'SFW',
    templateManuallySelected: false,
    output: '',
    status: 'configuring',
    updatedAt: 10,
    ...overrides,
  };
}

function assetRegenerator(overrides: Partial<ActiveAssetRegeneratorSession> = {}): ActiveAssetRegeneratorSession {
  return {
    version: 1,
    draftId: 'd-1',
    assetName: 'card_image',
    generationCount: 1,
    customInstructions: '',
    blueprintOverrideContent: '',
    generatedCandidates: [],
    expandedCandidates: [],
    generatingContent: '',
    status: 'configuring',
    updatedAt: 10,
    ...overrides,
  };
}

function draftRefiner(overrides: Partial<ActiveDraftRefinerSession> = {}): ActiveDraftRefinerSession {
  return {
    version: 1,
    selectedDraftId: 'd-1',
    assetStates: {},
    expandedAssets: [],
    editingAsset: null,
    editContent: '',
    interrupted: false,
    updatedAt: 10,
    ...overrides,
  };
}

function draft(overrides: Partial<DraftMetadata> & { review_id: string }): DraftMetadata {
  return {
    seed: 'a lonely space pirate',
    template_name: 'V2/V3 Card',
    mode: 'SFW',
    ...overrides,
  } as DraftMetadata;
}

function savedSearch(id: string, name: string, filter: SavedSearchRecord['filter']): SavedSearchRecord {
  return { id, name, filter, createdAt: '2026-01-01T00:00:00.000Z' };
}

describe('listResumableRuns', () => {
  it('reports nothing when nothing is parked', () => {
    expect(listResumableRuns(emptyLoaders)).toEqual([]);
  });

  it('separates a run still going from one waiting on a decision', () => {
    const running = listResumableRuns(loaders({ generation: () => generation({ currentStatus: 'generating' }) }));
    const paused = listResumableRuns(loaders({ generation: () => generation({ currentStatus: 'paused' }) }));

    expect(running[0]?.state).toBe('in-progress');
    expect(running[0]?.to).toBe('/generate');
    expect(paused[0]?.state).toBe('ready');
  });

  it('says how far a generation got', () => {
    const run = listResumableRuns(
      loaders({ generation: () => generation({ assetDrafts: { persona: 'x', appearance: 'y' } }) }),
    )[0];

    expect(run?.title).toBe('Draft generation');
    expect(run?.detail).toBe('a lonely space pirate · 2 assets written');
  });

  it('ignores a batch with no jobs and counts the ones it has', () => {
    expect(listResumableRuns(loaders({ batch: () => batch({ jobs: [] }) }))).toEqual([]);

    const run = listResumableRuns(
      loaders({
        batch: () =>
          batch({
            status: 'running',
            jobs: [
              { seed: 'one', status: 'complete' },
              { seed: 'two', status: 'error' },
              { seed: 'three', status: 'pending' },
            ],
          }),
      }),
    )[0];

    expect(run?.detail).toBe('1 of 3 seeds · 1 failed');
    expect(run?.state).toBe('in-progress');
    expect(run?.to).toBe('/batch');
  });

  it('calls a configured batch a queue rather than a run', () => {
    const run = listResumableRuns(
      loaders({ batch: () => batch({ status: 'configuring', jobs: [{ seed: 'one', status: 'pending' }] }) }),
    )[0];

    expect(run?.detail).toBe('0 of 1 seed · queued');
    expect(run?.state).toBe('ready');
  });

  it('ignores an idle seed generator and reports the seeds it did produce', () => {
    expect(listResumableRuns(loaders({ seedGenerator: () => seedGenerator({ status: 'idle' }) }))).toEqual([]);
    expect(listResumableRuns(loaders({ seedGenerator: () => seedGenerator({ seeds: ['one'] }) }))).toEqual([]);

    const run = listResumableRuns(
      loaders({ seedGenerator: () => seedGenerator({ status: 'ready', seeds: ['one', 'two', 'three'] }) }),
    )[0];

    expect(run?.detail).toBe('3 seeds');
    expect(run?.state).toBe('ready');
  });

  it('ignores an offspring run that has not synthesised a seed yet', () => {
    expect(listResumableRuns(loaders({ offspring: () => offspring({ status: 'configuring' }) }))).toEqual([]);

    const ready = listResumableRuns(
      loaders({ offspring: () => offspring({ status: 'review_seed', offspringSeed: 'the heir of two houses' }) }),
    )[0];
    const cooking = listResumableRuns(loaders({ offspring: () => offspring({ status: 'generating_character' }) }))[0];

    expect(ready?.detail).toBe('the heir of two houses');
    expect(ready?.state).toBe('ready');
    expect(cooking?.state).toBe('in-progress');
  });

  it('routes an asset regeneration back to that exact asset, encoded', () => {
    const run = listResumableRuns(
      loaders({
        assetRegenerator: () =>
          assetRegenerator({
            status: 'ready',
            draftId: 'review/1',
            assetName: 'card_image',
            generatedCandidates: [
              { id: 'a', content: 'x', timestamp: 1 },
              { id: 'b', content: 'y', timestamp: 2 },
            ],
          }),
      }),
    )[0];

    // Encoded, because both are path segments in the target route.
    expect(run?.to).toBe('/drafts/review%2F1/assets/card_image/regenerate');
    expect(run?.detail).toBe('card_image · 2 candidates');
  });

  it('ignores a refiner session nothing has been changed in', () => {
    const untouched = loaders({
      draftRefiner: () =>
        draftRefiner({
          assetStates: { persona: { assetName: 'persona', status: 'idle', content: 'x', originalContent: 'x' } },
        }),
    });

    expect(listResumableRuns(untouched)).toEqual([]);

    const edited = listResumableRuns(
      loaders({
        draftRefiner: () =>
          draftRefiner({
            assetStates: {
              persona: { assetName: 'persona', status: 'idle', content: 'edited', originalContent: 'x' },
              appearance: { assetName: 'appearance', status: 'idle', content: 'y', originalContent: 'y' },
            },
          }),
      }),
    )[0];

    expect(edited?.detail).toBe('1 asset refined');
    expect(edited?.state).toBe('ready');

    const interrupted = listResumableRuns(
      loaders({
        draftRefiner: () =>
          draftRefiner({
            interrupted: true,
            assetStates: {
              persona: { assetName: 'persona', status: 'reviewing', content: 'x', originalContent: 'x' },
            },
          }),
      }),
    )[0];

    expect(interrupted?.state).toBe('in-progress');
  });

  it('puts the most recently touched run first', () => {
    const runs = listResumableRuns(
      loaders({
        generation: () => generation({ updatedAt: 10 }),
        batch: () => batch({ jobs: [{ seed: 'one', status: 'pending' }], updatedAt: 30 }),
        offspring: () => offspring({ status: 'generating_seed', updatedAt: 20 }),
      }),
    );

    expect(runs.map((run) => run.id)).toEqual(['batch', 'offspring', 'generation']);
  });
});

describe('buildPinnedSavedSearches', () => {
  const drafts = [
    draft({
      review_id: 'd-1',
      character_name: 'Vesna',
      seed: 'a lonely space pirate',
      mode: 'NSFW',
      genre: 'sci-fi',
      favorite: true,
    }),
    draft({ review_id: 'd-2', character_name: 'Kestrel', seed: 'a cheerful baker', genre: 'slice of life' }),
    draft({ review_id: 'd-3', seed: 'a space pirate captain' }),
  ];

  it('counts what each search matches, in the order they were saved', () => {
    const pinned = buildPinnedSavedSearches(
      [
        savedSearch('s-1', 'Space pirates', { search: 'space pirate' }),
        savedSearch('s-2', 'Favorites', { favoritesOnly: true }),
        savedSearch('s-3', 'Nothing here', { search: 'no such draft' }),
      ],
      drafts,
    );

    expect(pinned.map((entry) => entry.name)).toEqual(['Space pirates', 'Favorites', 'Nothing here']);
    expect(pinned.map((entry) => entry.matchCount)).toEqual([2, 1, 0]);
    pinned.forEach((entry) => expect(entry.to).toBe('/drafts'));
  });

  it('describes the filter, so a row is more than a name', () => {
    const pinned = buildPinnedSavedSearches(
      [savedSearch('s-1', 'Space pirates', { search: 'space pirate', mode: 'NSFW' })],
      drafts,
    );

    expect(pinned[0]?.summary).toBe('"space pirate" · NSFW');
  });

  it('keeps a row that currently matches nothing, rather than hiding the collection', () => {
    const pinned = buildPinnedSavedSearches([savedSearch('s-1', 'Anything', {})], []);

    expect(pinned).toHaveLength(1);
    expect(pinned[0]?.matchCount).toBe(0);
  });
});

describe('describeDraftLibraryFilter', () => {
  it('says so plainly when a filter selects everything', () => {
    expect(describeDraftLibraryFilter({})).toBe('every draft');
    expect(describeDraftLibraryFilter({ search: '   ' })).toBe('every draft');
  });

  it('quotes the search text and trims it', () => {
    expect(describeDraftLibraryFilter({ search: '  space pirate  ' })).toBe('"space pirate"');
  });

  it('lists the flags and values it does set, in a stable order', () => {
    expect(describeDraftLibraryFilter({ favoritesOnly: true, mergedOnly: true, undoableOnly: true })).toBe(
      'favorites · merged · undoable',
    );
    expect(describeDraftLibraryFilter({ mode: 'NSFW', genre: 'sci-fi', mergeStrategy: 'staged-merge' })).toBe(
      'staged-merge · NSFW · sci-fi',
    );
  });
});
