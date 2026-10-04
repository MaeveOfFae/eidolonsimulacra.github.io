import {
  appendDraftMergeHistory,
  buildDraftMergeProvenance,
  buildDraftReviewSummary,
  countChangedLines,
  formatAssetLabel,
  formatSnapshotOptionLabel,
  getAssetReviewState,
  summarizeText,
} from './comparison-helpers';
import type { DraftMetadata } from '@char-gen/shared';

type SnapshotEntry = NonNullable<DraftMetadata['revision_snapshots']>[number];

describe('countChangedLines', () => {
  it('counts only the lines that differ', () => {
    expect(countChangedLines('a\nb\nc', 'a\nB\nc')).toBe(1);
    expect(countChangedLines('same\nlines', 'same\nlines')).toBe(0);
  });

  it('treats a line present on only one side as changed', () => {
    expect(countChangedLines('a', 'a\nb')).toBe(1);
    expect(countChangedLines('', '')).toBe(0);
  });
});

describe('buildDraftReviewSummary', () => {
  it('summarizes annotations, counting scores, notes and weak assets', () => {
    const summary = buildDraftReviewSummary({
      review_annotations: {
        notes: '  Solid work  ',
        asset_scores: { personality: 1, speech: 4 },
        asset_notes: { personality: ' thin ', speech: '   ' },
        updated_at: '2026-01-02T03:04:05.000Z',
      },
    });

    expect(summary).toEqual({
      hasReview: true,
      reviewerSummary: 'Solid work',
      scoredAssetCount: 2,
      notedAssetCount: 1,
      lowScoreEntries: [{ assetName: 'personality', score: 1 }],
      updatedAt: '2026-01-02T03:04:05.000Z',
    });
  });

  it('sorts weak assets by name and reports an empty review', () => {
    const summary = buildDraftReviewSummary({
      // Scores are the 1-5 scale, so "weak" means 1 or 2.
      review_annotations: { asset_scores: { zeta: 2, alpha: 1, beta: 5 } },
    });

    expect(summary.lowScoreEntries).toEqual([
      { assetName: 'alpha', score: 1 },
      { assetName: 'zeta', score: 2 },
    ]);

    expect(buildDraftReviewSummary({})).toEqual({
      hasReview: false,
      reviewerSummary: '',
      scoredAssetCount: 0,
      notedAssetCount: 0,
      lowScoreEntries: [],
      updatedAt: undefined,
    });
  });
});

describe('asset review helpers', () => {
  it('reads a per-asset score and note', () => {
    const state = getAssetReviewState(
      { review_annotations: { asset_scores: { speech: 3 }, asset_notes: { speech: ' Keep ' } } },
      'speech',
    );

    expect(state).toEqual({ score: 3, note: 'Keep', hasReview: true });
  });

  it('reports no review when neither score nor note exists', () => {
    expect(getAssetReviewState({}, 'speech')).toEqual({ score: undefined, note: '', hasReview: false });
  });

  it('humanizes asset names', () => {
    expect(formatAssetLabel('intro_scene')).toBe('intro scene');
  });
});

describe('summarizeText', () => {
  it('collapses whitespace and keeps short content intact', () => {
    expect(summarizeText('  a\n  b  ')).toBe('a b');
  });

  it('truncates long content to the limit with an ellipsis', () => {
    const summarized = summarizeText('x'.repeat(200));

    expect(summarized).toHaveLength(120);
    expect(summarized.endsWith('...')).toBe(true);
    expect(summarizeText('y'.repeat(50), 20)).toHaveLength(20);
  });
});

describe('formatSnapshotOptionLabel', () => {
  const snapshot = { label: 'Before edit', created_at: '2026-03-04T10:30:00.000Z' } as SnapshotEntry;

  it('labels a snapshot with its name and timestamp', () => {
    expect(formatSnapshotOptionLabel(snapshot)).toMatch(/^Before edit · /);
  });

  it('falls back to a generic name for unlabeled restore points', () => {
    expect(formatSnapshotOptionLabel({ ...snapshot, label: '' })).toMatch(/^Restore point · /);
  });
});

describe('merge provenance helpers', () => {
  it('dedupes asset names and only records provided snapshots', () => {
    const provenance = buildDraftMergeProvenance({
      strategy: 'staged-merge',
      sourceDraftId: 'right-1',
      sourceSide: 'right',
      baseDraftId: 'left-1',
      baseSide: 'left',
      assetNames: ['speech', 'speech', 'personality'],
    });

    expect(provenance.strategy).toBe('staged-merge');
    expect(provenance.asset_names).toEqual(['speech', 'personality']);
    expect(provenance.source_snapshot_id).toBeUndefined();
    expect(provenance.base_snapshot_id).toBeUndefined();
    expect(new Date(provenance.created_at).toString()).not.toBe('Invalid Date');
  });

  it('records snapshot ids when the merge used a restore point', () => {
    const provenance = buildDraftMergeProvenance({
      strategy: 'single-asset',
      sourceDraftId: 'left-1',
      sourceSide: 'left',
      sourceSnapshotId: 'snap-9',
      baseDraftId: 'right-1',
      baseSide: 'right',
      baseSnapshotId: 'snap-8',
      assetNames: [],
    });

    expect(provenance.source_snapshot_id).toBe('snap-9');
    expect(provenance.base_snapshot_id).toBe('snap-8');
  });

  it('prepends merge history entries and drops duplicates by id', () => {
    // Only the id matters to this helper, so the entries are cast down to the slice it reads.
    type HistoryEvent = NonNullable<DraftMetadata['merge_history']>[number];
    const entry = { id: 'merge-1' } as unknown as HistoryEvent;
    const older = { id: 'merge-0' } as unknown as HistoryEvent;

    expect(appendDraftMergeHistory([older, entry], entry)).toEqual([entry, older]);
    expect(appendDraftMergeHistory(undefined, entry)).toEqual([entry]);
  });
});
