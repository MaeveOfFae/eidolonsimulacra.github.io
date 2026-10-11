import { describe, expect, it } from 'vitest';
import {
  MAX_COMPARISON_CANDIDATES,
  MAX_COMPARISON_SEEDS,
  MIN_COMPARISON_CANDIDATES,
  MIN_COMPARISON_SEEDS,
  buildComparisonCandidateKeys,
  buildComparisonCandidateSummaries,
  createComparisonGroupId,
  filterComparisonGroupDrafts,
  normalizeComparisonGroupId,
  normalizeComparisonSeeds,
} from './comparison';
import type { DraftMetadata } from './types';
import type { UsageRecord } from './usage/records';

function groupDraft(overrides: Partial<DraftMetadata> = {}): DraftMetadata {
  return {
    review_id: 'draft-1',
    seed: 'a seed',
    favorite: false,
    comparison_group: 'group-1',
    ...overrides,
  };
}

function usage(overrides: Partial<UsageRecord> = {}): UsageRecord {
  return {
    timestamp: 1_000,
    kind: 'comparison',
    status: 'ok',
    provider: 'openai',
    model: 'gpt-4o',
    durationMs: 1_000,
    draftId: 'draft-1',
    ...overrides,
  };
}

describe('comparison ids', () => {
  it('creates prefixed ids and normalizes them', () => {
    const first = createComparisonGroupId();
    const second = createComparisonGroupId();

    expect(first).toMatch(/^cmp-\d+-[a-z0-9]+$/);
    expect(first).not.toBe(second);

    expect(normalizeComparisonGroupId('  group-1 ')).toBe('group-1');
    expect(normalizeComparisonGroupId('')).toBeUndefined();
    expect(normalizeComparisonGroupId(42)).toBeUndefined();
  });
});

describe('filterComparisonGroupDrafts', () => {
  it('keeps only drafts in the group', () => {
    const inGroup = groupDraft();
    const otherGroup = groupDraft({ review_id: 'draft-2', comparison_group: 'group-2' });
    const ungrouped = groupDraft({ review_id: 'draft-3', comparison_group: undefined });

    expect(filterComparisonGroupDrafts([inGroup, otherGroup, ungrouped], 'group-1')).toEqual([inGroup]);
    expect(filterComparisonGroupDrafts([inGroup], '')).toEqual([]);
  });
});

describe('comparison seeds', () => {
  it('normalizes a multi-line input into ordered unique seeds', () => {
    expect(normalizeComparisonSeeds('  one seed \n\n two seed\r\none seed\n')).toEqual(['one seed', 'two seed']);
    expect(normalizeComparisonSeeds(['a', ' a ', '', 'b'])).toEqual(['a', 'b']);
    expect(normalizeComparisonSeeds('')).toEqual([]);
  });

  it('builds the seed-major matrix of (seed, model) candidates', () => {
    expect(buildComparisonCandidateKeys(['s1', 's2'], ['m1', 'm2'])).toEqual([
      { seed: 's1', model: 'm1' },
      { seed: 's1', model: 'm2' },
      { seed: 's2', model: 'm1' },
      { seed: 's2', model: 'm2' },
    ]);
    expect(buildComparisonCandidateKeys([], ['m1'])).toEqual([]);
  });
});

describe('buildComparisonCandidateSummaries', () => {
  it('marks candidates without a draft as pending and preserves matrix order', () => {
    const candidates = buildComparisonCandidateKeys(['seed-a', 'seed-b'], ['model-a', 'model-b']);
    const summaries = buildComparisonCandidateSummaries(candidates, []);

    expect(summaries.map((summary) => [summary.seed, summary.model])).toEqual([
      ['seed-a', 'model-a'],
      ['seed-a', 'model-b'],
      ['seed-b', 'model-a'],
      ['seed-b', 'model-b'],
    ]);
    expect(summaries.every((summary) => summary.status === 'pending')).toBe(true);
  });

  it('matches each candidate by its seed and model and joins the newest usage record', () => {
    const drafts = [
      groupDraft({
        review_id: 'd-a1',
        seed: 'seed-a',
        model: 'model-a',
        character_name: 'Vesna',
        created: '2026-09-29T00:00:00.000Z',
      }),
      groupDraft({ review_id: 'd-b1', seed: 'seed-b', model: 'model-b' }),
    ];
    const records = [
      usage({ draftId: 'd-a1', model: 'model-a', timestamp: 1_000, totalTokens: 30, durationMs: 900 }),
      usage({
        draftId: 'd-a1',
        model: 'model-a',
        timestamp: 2_000,
        promptTokens: 20,
        completionTokens: 24,
        totalTokens: 44,
        durationMs: 1_500,
      }),
      usage({ draftId: 'd-b1', model: 'model-b', status: 'error', errorMessage: 'boom', timestamp: 3_000 }),
    ];

    const candidates = buildComparisonCandidateKeys(['seed-a', 'seed-b'], ['model-a', 'model-b']);
    const summaries = buildComparisonCandidateSummaries(candidates, drafts, records);

    expect(summaries[0]).toEqual({
      seed: 'seed-a',
      model: 'model-a',
      status: 'ok',
      draftId: 'd-a1',
      characterName: 'Vesna',
      createdAt: '2026-09-29T00:00:00.000Z',
      promptTokens: 20,
      completionTokens: 24,
      totalTokens: 44,
      durationMs: 1_500,
    });
    // seed-a never ran through model-b, so that cell stays pending.
    expect(summaries[1]).toMatchObject({ seed: 'seed-a', model: 'model-b', status: 'pending' });
    expect(summaries[2]).toMatchObject({ seed: 'seed-b', model: 'model-a', status: 'pending' });
    expect(summaries[3]).toMatchObject({
      seed: 'seed-b',
      model: 'model-b',
      status: 'error',
      draftId: 'd-b1',
      errorMessage: 'boom',
    });
  });

  it('does not match a draft whose model matches but whose seed differs', () => {
    const drafts = [groupDraft({ review_id: 'd-a', seed: 'seed-a', model: 'model-a' })];

    const summaries = buildComparisonCandidateSummaries(buildComparisonCandidateKeys(['seed-b'], ['model-a']), drafts);

    expect(summaries[0]).toMatchObject({ seed: 'seed-b', model: 'model-a', status: 'pending' });
  });

  it('treats a draft without a usage record as ok', () => {
    const drafts = [groupDraft({ review_id: 'd-a', seed: 'seed-a', model: 'model-a' })];

    const summaries = buildComparisonCandidateSummaries(
      buildComparisonCandidateKeys(['seed-a'], ['model-a']),
      drafts,
      [],
    );

    expect(summaries[0]).toMatchObject({ seed: 'seed-a', model: 'model-a', status: 'ok', draftId: 'd-a' });
  });

  it('exposes the candidate and seed bounds', () => {
    expect(MIN_COMPARISON_CANDIDATES).toBe(2);
    expect(MAX_COMPARISON_CANDIDATES).toBe(4);
    expect(MIN_COMPARISON_SEEDS).toBe(1);
    expect(MAX_COMPARISON_SEEDS).toBe(4);
  });
});
