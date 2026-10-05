import { describe, expect, it } from 'vitest';
import { buildDraftLibraryBadges } from './draft-readiness';
import type { DraftMetadata } from './types';

/**
 * `buildDraftLibraryBadges` is rendered by both library lists (web's drafts screen
 * and mobile's), which is why the approval badge was added here rather than in
 * either surface: a draft with changes requested should not look identical to a
 * finished one in the list. Staleness is deliberately absent — it needs the asset's
 * current content, which metadata alone does not carry.
 */
function buildMetadata(overrides: Partial<DraftMetadata> = {}): DraftMetadata {
  return {
    review_id: 'review-1',
    seed: 'a lonely space pirate',
    favorite: false,
    ...overrides,
  };
}

function buildAnnotations(
  overrides: Partial<NonNullable<DraftMetadata['review_annotations']>> = {},
): NonNullable<DraftMetadata['review_annotations']> {
  return { updated_at: '2026-01-01T00:00:00.000Z', ...overrides };
}

describe('buildDraftLibraryBadges approvals', () => {
  it('says nothing about approvals when none were recorded', () => {
    expect(buildDraftLibraryBadges(buildMetadata())).toEqual([]);
    expect(buildDraftLibraryBadges(buildMetadata({ review_annotations: buildAnnotations() }))).toEqual([]);
  });

  it('leads with changes requested, because it is what needs action', () => {
    const badges = buildDraftLibraryBadges(
      buildMetadata({
        parent_drafts: ['parent-a'],
        review_annotations: buildAnnotations({
          asset_approvals: {
            character_sheet: {
              status: 'changes_requested',
              decided_at: '2026-01-01T00:00:00.000Z',
              content_fingerprint: 'x',
            },
            intro_scene: { status: 'approved', decided_at: '2026-01-01T00:00:00.000Z', content_fingerprint: 'y' },
          },
        }),
      }),
    );

    expect(badges[0]).toEqual({ label: '1 changes requested', tone: 'warning' });
    // The existing badges are still there, just after the approval state.
    expect(badges).toContainEqual({ label: 'Branch', tone: 'muted' });
  });

  it('counts approvals instead of requesting them when nothing is outstanding', () => {
    const badges = buildDraftLibraryBadges(
      buildMetadata({
        review_annotations: buildAnnotations({
          asset_approvals: {
            character_sheet: { status: 'approved', decided_at: '2026-01-01T00:00:00.000Z', content_fingerprint: 'x' },
            intro_scene: { status: 'approved', decided_at: '2026-01-01T00:00:00.000Z', content_fingerprint: 'y' },
          },
        }),
      }),
    );

    expect(badges[0]).toEqual({ label: '2 approved', tone: 'success' });
  });

  it('keeps the score, note, merge and snapshot badges it always had', () => {
    const badges = buildDraftLibraryBadges(
      buildMetadata({
        merge_provenance: { strategy: 'staged-merge', merged_at: '2026-01-01T00:00:00.000Z' },
        revision_snapshots: [
          {
            id: 'snapshot-1',
            label: 'Before review annotation update',
            created_at: '2026-01-01T00:00:00.000Z',
            state: { assets: {}, review_annotations: {} },
          },
        ],
        review_annotations: buildAnnotations({
          notes: 'Overall solid.',
          asset_scores: { intro_scene: 2, character_sheet: 5 },
          asset_notes: { intro_scene: 'Tighten the opening.' },
        }),
      }),
    );

    expect(badges).toEqual([
      { label: 'Staged merge', tone: 'muted' },
      { label: '1 snapshot', tone: 'muted' },
      { label: '1 low score', tone: 'warning' },
      { label: '1 note', tone: 'muted' },
    ]);
  });
});
