import { describe, expect, it } from 'vitest';
import { buildAssetApprovalSummary, decideAssetApproval, fingerprintAssetContent } from './draft-approvals';
import { buildExportReadinessSummary } from './draft-readiness';
import type { Draft } from './types';

function buildDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    path: 'review-1',
    metadata: {
      review_id: 'review-1',
      seed: 'a lonely space pirate',
      favorite: false,
      template_name: 'official_v2v3',
    },
    assets: {
      character_sheet: 'Sheet content',
      intro_scene: 'Scene content',
      card_image: 'data:image/png;base64,ignored',
    },
    ...overrides,
  };
}

describe('fingerprintAssetContent', () => {
  it('is deterministic and distinguishes changed content', () => {
    const first = fingerprintAssetContent('Sheet content');
    expect(fingerprintAssetContent('Sheet content')).toBe(first);
    expect(fingerprintAssetContent('Sheet content ')).not.toBe(first);
    expect(fingerprintAssetContent('Sheet content!')).not.toBe(first);
    expect(fingerprintAssetContent('')).not.toBe(first);
  });
});

describe('decideAssetApproval', () => {
  it('records a decision against the current content fingerprint', () => {
    const draft = buildDraft();
    const annotations = decideAssetApproval(draft, 'character_sheet', { status: 'approved' });

    const approval = annotations.asset_approvals?.character_sheet;
    expect(approval?.status).toBe('approved');
    expect(approval?.decided_at).toBeTruthy();
    expect(approval?.content_fingerprint).toBe(fingerprintAssetContent('Sheet content'));
    expect(annotations.updated_at).toBeTruthy();
  });

  it('keeps a trimmed note and preserves the surrounding annotations', () => {
    const draft = buildDraft({
      metadata: {
        ...buildDraft().metadata,
        review_annotations: {
          notes: 'Overall solid.',
          asset_scores: { intro_scene: 4 },
          asset_notes: { intro_scene: 'Tighten the opening.' },
        },
      },
    });

    const annotations = decideAssetApproval(draft, 'intro_scene', {
      status: 'changes_requested',
      note: '  Rewrite the hook.  ',
    });

    expect(annotations.notes).toBe('Overall solid.');
    expect(annotations.asset_scores?.intro_scene).toBe(4);
    expect(annotations.asset_notes?.intro_scene).toBe('Tighten the opening.');
    expect(annotations.asset_approvals?.intro_scene?.note).toBe('Rewrite the hook.');
  });

  it('clears a decision when passed null', () => {
    const draft = buildDraft();
    const decided = decideAssetApproval(draft, 'character_sheet', { status: 'approved' });
    const cleared = decideAssetApproval(
      { ...draft, metadata: { ...draft.metadata, review_annotations: decided } },
      'character_sheet',
      null,
    );

    expect(cleared.asset_approvals?.character_sheet).toBeUndefined();
  });

  it('refuses to approve an asset with no saved content', () => {
    const draft = buildDraft({ assets: {} });

    expect(() => decideAssetApproval(draft, 'character_sheet', { status: 'approved' })).toThrow(
      'Asset character_sheet has no saved content to approve',
    );
  });
});

describe('buildAssetApprovalSummary', () => {
  it('reports all assets as unapproved without recorded decisions', () => {
    const summary = buildAssetApprovalSummary(buildDraft());

    expect(summary.totalAssetCount).toBe(2); // card_image is excluded
    expect(summary.unapprovedCount).toBe(2);
    expect(summary.approvedCount).toBe(0);
    expect(summary.decidedCount).toBe(0);
    expect(summary.complete).toBe(false);
  });

  it('returns an empty summary for an undefined draft', () => {
    const summary = buildAssetApprovalSummary(undefined);

    expect(summary.totalAssetCount).toBe(0);
    expect(summary.entries).toEqual([]);
    expect(summary.complete).toBe(false);
  });

  it('marks a decision stale when the asset content changed after it was recorded', () => {
    const base = buildDraft();
    const decided = decideAssetApproval(base, 'character_sheet', { status: 'approved' });
    const changedContent = {
      ...base,
      assets: { ...base.assets, character_sheet: 'Rewritten sheet content' },
      metadata: { ...base.metadata, review_annotations: decided },
    };

    const summary = buildAssetApprovalSummary(changedContent);
    const entry = summary.entries.find((candidate) => candidate.assetName === 'character_sheet');

    expect(entry?.status).toBe('stale');
    expect(entry?.decidedAt).toBeUndefined();
    expect(summary.approvedCount).toBe(0);
    expect(summary.staleCount).toBe(1);
  });

  it('counts approved and changes-requested assets separately and reports completeness', () => {
    const base = buildDraft();
    const annotations = decideAssetApproval(base, 'character_sheet', { status: 'approved' });
    const decided = decideAssetApproval(
      { ...base, metadata: { ...base.metadata, review_annotations: annotations } },
      'intro_scene',
      { status: 'changes_requested' },
    );
    const draft = { ...base, metadata: { ...base.metadata, review_annotations: decided } };

    const summary = buildAssetApprovalSummary(draft);

    expect(summary.approvedCount).toBe(1);
    expect(summary.changesRequestedCount).toBe(1);
    expect(summary.decidedCount).toBe(2);
    expect(summary.complete).toBe(false);

    const resolved = decideAssetApproval(draft, 'intro_scene', { status: 'approved' });
    expect(
      buildAssetApprovalSummary({
        ...draft,
        metadata: { ...draft.metadata, review_annotations: resolved },
      }).complete,
    ).toBe(true);
  });
});

describe('buildExportReadinessSummary approval gating', () => {
  const passingValidation = { success: true, path: 'drafts/review-1', output: '', errors: '', exit_code: 0 };

  it('adds a blocking warning while any asset has changes requested', () => {
    const base = buildDraft();
    const annotations = decideAssetApproval(base, 'intro_scene', { status: 'changes_requested' });
    const draft = { ...base, metadata: { ...base.metadata, review_annotations: annotations } };

    const summary = buildExportReadinessSummary(draft, passingValidation);

    expect(summary.changesRequestedCount).toBe(1);
    expect(summary.blockingWarnings).toContainEqual(
      '1 asset still has changes requested and needs approval work before export.',
    );
    expect(summary.requiresAcknowledgement).toBe(true);
  });

  it('does not block when approvals are only approved, stale, or absent', () => {
    const base = buildDraft();
    const annotations = decideAssetApproval(base, 'character_sheet', { status: 'approved' });
    const draft = {
      ...base,
      assets: { ...base.assets, intro_scene: 'Edited scene content' },
      metadata: { ...base.metadata, review_annotations: annotations },
    };

    const summary = buildExportReadinessSummary(draft, passingValidation);

    expect(summary.approvedAssetCount).toBe(1);
    expect(summary.staleApprovalCount).toBe(0); // intro_scene never had a decision
    expect(summary.changesRequestedCount).toBe(0);
    expect(summary.blockingWarnings).toEqual([]);
    expect(summary.requiresAcknowledgement).toBe(false);
  });
});
