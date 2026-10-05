import { describe, expect, it } from 'vitest';
import { decideAssetApproval, type Draft, type ValidationResponse } from '@char-gen/shared';
import {
  MOBILE_APPROVAL_DECISIONS,
  buildAssetApprovalDecision,
  buildMobileApprovalQueue,
  describeApprovalStatus,
  formatApprovalAssetLabel,
} from './review-approval';

/**
 * The approval rules themselves are shared and tested there
 * (`@char-gen/shared`'s `draft-approvals.test.ts` — fingerprints, stale detection,
 * counting, gating). These tests cover only what mobile adds on top: ordering,
 * status vocabulary, the progress line, and the one-note-field decision.
 */
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

/** Records a decision and returns the draft carrying it. */
function withDecision(draft: Draft, assetName: string, status: 'approved' | 'changes_requested'): Draft {
  return {
    ...draft,
    metadata: {
      ...draft.metadata,
      review_annotations: decideAssetApproval(draft, assetName, { status }),
    },
  };
}

const passingValidation: ValidationResponse = {
  success: true,
  path: 'drafts/review-1',
  output: '',
  errors: '',
  exit_code: 0,
};

describe('formatApprovalAssetLabel', () => {
  it('turns an asset name into a readable label', () => {
    expect(formatApprovalAssetLabel('character_sheet')).toBe('Character Sheet');
    expect(formatApprovalAssetLabel('intro_scene')).toBe('Intro Scene');
    expect(formatApprovalAssetLabel('bio')).toBe('Bio');
  });

  it('survives odd names without inventing characters', () => {
    expect(formatApprovalAssetLabel('')).toBe('');
    expect(formatApprovalAssetLabel('__leading__trailing__')).toBe('Leading Trailing');
  });
});

describe('describeApprovalStatus', () => {
  it('uses wording a reviewer reads rather than the stored status', () => {
    expect(describeApprovalStatus('approved')).toBe('Approved');
    expect(describeApprovalStatus('changes_requested')).toBe('Changes requested');
    expect(describeApprovalStatus('stale')).toBe('Needs re-review');
    expect(describeApprovalStatus('unapproved')).toBe('Not reviewed');
  });
});

describe('buildMobileApprovalQueue ordering', () => {
  it('puts what needs work above what is finished', () => {
    const base = buildDraft();
    const approved = withDecision(base, 'character_sheet', 'approved');
    const requested = withDecision(approved, 'intro_scene', 'changes_requested');

    const queue = buildMobileApprovalQueue(requested);

    expect(queue.entries.map((entry) => entry.assetName)).toEqual(['intro_scene', 'character_sheet']);
    expect(queue.entries[0]?.statusLabel).toBe('Changes requested');
    expect(queue.pendingEntries.map((entry) => entry.assetName)).toEqual(['intro_scene']);
  });

  it('orders by status and then alphabetically, so the list never jitters', () => {
    const draft = buildDraft({
      assets: { zeta_sheet: 'Zeta', alpha_scene: 'Alpha', beta_scene: 'Beta' },
    });

    const queue = buildMobileApprovalQueue(draft);

    expect(queue.entries.map((entry) => entry.assetName)).toEqual(['alpha_scene', 'beta_scene', 'zeta_sheet']);
  });

  it('leaves the card image out, because it is not a reviewable asset', () => {
    const queue = buildMobileApprovalQueue(buildDraft());

    expect(queue.totalCount).toBe(2);
    expect(queue.entries.map((entry) => entry.assetName)).not.toContain('card_image');
  });
});

describe('buildMobileApprovalQueue progress', () => {
  it('counts progress and offers the next asset to open', () => {
    const started = buildMobileApprovalQueue(buildDraft());
    expect(started.progressLabel).toBe('0 of 2 approved');
    expect(started.complete).toBe(false);
    expect(started.nextAssetName).toBe('character_sheet');

    const partial = buildMobileApprovalQueue(withDecision(buildDraft(), 'character_sheet', 'approved'));
    expect(partial.progressLabel).toBe('1 of 2 approved');
    expect(partial.nextAssetName).toBe('intro_scene');

    const finished = buildMobileApprovalQueue(
      withDecision(withDecision(buildDraft(), 'character_sheet', 'approved'), 'intro_scene', 'approved'),
    );
    expect(finished.progressLabel).toBe('All approved');
    expect(finished.complete).toBe(true);
    expect(finished.nextAssetName).toBeUndefined();
  });

  it('says so plainly when there is nothing to approve', () => {
    const queue = buildMobileApprovalQueue(buildDraft({ assets: {} }));

    expect(queue.progressLabel).toBe('No assets to approve');
    expect(queue.totalCount).toBe(0);
    expect(queue.complete).toBe(false);
    expect(queue.nextAssetName).toBeUndefined();
  });

  it('treats an undefined draft as nothing to approve', () => {
    expect(buildMobileApprovalQueue(undefined).progressLabel).toBe('No assets to approve');
  });
});

describe('buildMobileApprovalQueue staleness', () => {
  it('surfaces a decision that no longer describes the content', () => {
    const base = buildDraft();
    const approved = withDecision(base, 'character_sheet', 'approved');
    const edited: Draft = { ...approved, assets: { ...approved.assets, character_sheet: 'Rewritten sheet' } };

    const queue = buildMobileApprovalQueue(edited);
    const entry = queue.entries.find((candidate) => candidate.assetName === 'character_sheet');

    expect(entry?.status).toBe('stale');
    expect(entry?.statusLabel).toBe('Needs re-review');
    expect(entry?.needsDecision).toBe(true);
    expect(entry?.decidedAt).toBeUndefined();
    expect(queue.staleCount).toBe(1);
    expect(queue.approvedCount).toBe(0);
    // It is what gets offered first, since it needs a fresh decision.
    expect(queue.nextAssetName).toBe('character_sheet');
  });
});

describe('buildMobileApprovalQueue readiness', () => {
  it('carries the export gating the screen shows alongside the list', () => {
    const requested = withDecision(buildDraft(), 'intro_scene', 'changes_requested');

    const queue = buildMobileApprovalQueue(requested, passingValidation);

    expect(queue.changesRequestedCount).toBe(1);
    expect(queue.requiresAcknowledgement).toBe(true);
    expect(queue.blockingWarnings).toContainEqual(
      '1 asset still has changes requested and needs approval work before export.',
    );
  });

  it('does not block on assets that were never reviewed', () => {
    const queue = buildMobileApprovalQueue(buildDraft(), passingValidation);

    expect(queue.unapprovedCount).toBe(2);
    expect(queue.blockingWarnings).toEqual([]);
    expect(queue.requiresAcknowledgement).toBe(false);
  });
});

describe('buildAssetApprovalDecision', () => {
  it('reuses the asset review note as the decision note', () => {
    const draft = buildDraft({
      metadata: {
        ...buildDraft().metadata,
        review_annotations: { asset_notes: { intro_scene: '  Tighten the opening.  ' } },
      },
    });

    expect(buildAssetApprovalDecision(draft, 'intro_scene', 'changes_requested')).toEqual({
      status: 'changes_requested',
      note: 'Tighten the opening.',
    });
  });

  it('omits the note when the reviewer left one blank', () => {
    const blank = buildDraft({
      metadata: {
        ...buildDraft().metadata,
        review_annotations: { asset_notes: { intro_scene: '   ' } },
      },
    });

    expect(buildAssetApprovalDecision(blank, 'intro_scene', 'approved')).toEqual({ status: 'approved' });
    expect(buildAssetApprovalDecision(buildDraft(), 'character_sheet', 'approved')).toEqual({
      status: 'approved',
    });
  });
});

describe('MOBILE_APPROVAL_DECISIONS', () => {
  it('offers approval before requesting changes', () => {
    expect(MOBILE_APPROVAL_DECISIONS).toEqual([
      { status: 'approved', label: 'Approve' },
      { status: 'changes_requested', label: 'Request changes' },
    ]);
  });
});
