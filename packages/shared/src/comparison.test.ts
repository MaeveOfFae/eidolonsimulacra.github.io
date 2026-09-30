import { describe, expect, it } from 'vitest';
import {
  MAX_COMPARISON_CANDIDATES,
  MIN_COMPARISON_CANDIDATES,
  buildComparisonCandidateSummaries,
  createComparisonGroupId,
  filterComparisonGroupDrafts,
  normalizeComparisonGroupId,
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

describe('buildComparisonCandidateSummaries', () => {
  it('marks models without a draft as pending and preserves order', () => {
    const summaries = buildComparisonCandidateSummaries(['model-a', 'model-b'], []);

    expect(summaries.map((summary) => summary.model)).toEqual(['model-a', 'model-b']);
    expect(summaries.every((summary) => summary.status === 'pending')).toBe(true);
  });

  it('joins each draft with its newest comparison usage record', () => {
    const drafts = [
      groupDraft({
        review_id: 'd-a',
        model: 'model-a',
        character_name: 'Vesna',
        created: '2026-09-29T00:00:00.000Z',
      }),
      groupDraft({ review_id: 'd-b', model: 'model-b' }),
    ];
    const records = [
      usage({ draftId: 'd-a', model: 'model-a', timestamp: 1_000, totalTokens: 30, durationMs: 900 }),
      usage({
        draftId: 'd-a',
        model: 'model-a',
        timestamp: 2_000,
        promptTokens: 20,
        completionTokens: 24,
        totalTokens: 44,
        durationMs: 1_500,
      }),
      usage({ draftId: 'd-b', model: 'model-b', status: 'error', errorMessage: 'boom', timestamp: 3_000 }),
    ];

    const summaries = buildComparisonCandidateSummaries(['model-a', 'model-b'], drafts, records);

    expect(summaries[0]).toEqual({
      model: 'model-a',
      status: 'ok',
      draftId: 'd-a',
      characterName: 'Vesna',
      createdAt: '2026-09-29T00:00:00.000Z',
      promptTokens: 20,
      completionTokens: 24,
      totalTokens: 44,
      durationMs: 1_500,
    });
    expect(summaries[1]).toMatchObject({
      model: 'model-b',
      status: 'error',
      draftId: 'd-b',
      errorMessage: 'boom',
    });
  });

  it('treats a draft without a usage record as ok', () => {
    const drafts = [groupDraft({ review_id: 'd-a', model: 'model-a' })];

    const summaries = buildComparisonCandidateSummaries(['model-a'], drafts, []);

    expect(summaries[0]).toMatchObject({ model: 'model-a', status: 'ok', draftId: 'd-a' });
  });

  it('exposes the candidate bounds', () => {
    expect(MIN_COMPARISON_CANDIDATES).toBe(2);
    expect(MAX_COMPARISON_CANDIDATES).toBe(4);
  });
});
