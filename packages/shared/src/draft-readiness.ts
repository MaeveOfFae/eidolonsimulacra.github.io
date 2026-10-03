import { buildAssetApprovalSummary } from './draft-approvals';
import type { Draft, DraftAssetReviewScore, DraftMetadata, ValidationResponse } from './types';

export interface ExportReadinessWarningAsset {
  assetName: string;
  score: DraftAssetReviewScore;
}

export interface ExportReadinessSummary {
  validationState: 'checking' | 'passing' | 'failing';
  reviewerSummary: string;
  reviewedAssetCount: number;
  unratedAssetCount: number;
  assetNoteCount: number;
  lowScoreEntries: ExportReadinessWarningAsset[];
  approvedAssetCount: number;
  changesRequestedCount: number;
  staleApprovalCount: number;
  blockingWarnings: string[];
  requiresAcknowledgement: boolean;
}

export interface DraftLibraryBadge {
  label: string;
  tone: 'warning' | 'success' | 'muted';
}

export function buildExportReadinessSummary(
  draft: Draft | undefined,
  validation: ValidationResponse | undefined,
): ExportReadinessSummary {
  const reviewAnnotations = draft?.metadata.review_annotations;
  const reviewAssetNames = Object.keys(draft?.assets ?? {}).filter((assetName) => assetName !== 'card_image');
  const reviewScores = reviewAnnotations?.asset_scores ?? {};
  const lowScoreEntries = Object.entries(reviewScores)
    .filter(([assetName, score]) => reviewAssetNames.includes(assetName) && score <= 2)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([assetName, score]) => ({ assetName, score }));
  const reviewedAssetCount = Object.entries(reviewScores).filter(([assetName]) =>
    reviewAssetNames.includes(assetName),
  ).length;
  const unratedAssetCount = Math.max(reviewAssetNames.length - reviewedAssetCount, 0);
  const assetNoteCount = Object.entries(reviewAnnotations?.asset_notes ?? {}).filter(
    ([assetName, note]) => reviewAssetNames.includes(assetName) && note.trim().length > 0,
  ).length;
  const reviewerSummary = reviewAnnotations?.notes?.trim() ?? '';
  const assetApprovals = buildAssetApprovalSummary(draft);
  const blockingWarnings = [
    ...(!validation?.success && validation
      ? ['Validation currently fails. Resolve the validation output before treating this export as ready.']
      : []),
    ...(lowScoreEntries.length > 0
      ? [
          `${lowScoreEntries.length} asset${lowScoreEntries.length === 1 ? '' : 's'} scored 1-2/5 and may still need review work.`,
        ]
      : []),
    ...(assetApprovals.changesRequestedCount > 0
      ? [
          `${assetApprovals.changesRequestedCount} asset${assetApprovals.changesRequestedCount === 1 ? '' : 's'} still ${assetApprovals.changesRequestedCount === 1 ? 'has' : 'have'} changes requested and need${assetApprovals.changesRequestedCount === 1 ? 's' : ''} approval work before export.`,
        ]
      : []),
  ];

  return {
    validationState: validation ? (validation.success ? 'passing' : 'failing') : 'checking',
    reviewerSummary,
    reviewedAssetCount,
    unratedAssetCount,
    assetNoteCount,
    lowScoreEntries,
    approvedAssetCount: assetApprovals.approvedCount,
    changesRequestedCount: assetApprovals.changesRequestedCount,
    staleApprovalCount: assetApprovals.staleCount,
    blockingWarnings,
    requiresAcknowledgement: blockingWarnings.length > 0,
  };
}

export function buildDraftLibraryBadges(metadata: DraftMetadata): DraftLibraryBadge[] {
  const badges: DraftLibraryBadge[] = [];
  const reviewAnnotations = metadata.review_annotations;
  const assetScores = reviewAnnotations?.asset_scores ?? {};
  const lowScoreCount = Object.values(assetScores).filter((score) => score <= 2).length;
  const scoredAssetCount = Object.keys(assetScores).length;
  const noteCount = Object.entries(reviewAnnotations?.asset_notes ?? {}).filter(
    ([, note]) => note.trim().length > 0,
  ).length;
  const hasReviewerSummary = Boolean(reviewAnnotations?.notes?.trim());
  const mergeStrategy = metadata.merge_provenance?.strategy;
  const snapshotCount = metadata.revision_snapshots?.length ?? 0;

  if ((metadata.parent_drafts?.length ?? 0) > 0) {
    badges.push({ label: 'Branch', tone: 'muted' });
  }

  if (mergeStrategy) {
    badges.push({
      label: mergeStrategy === 'staged-merge' ? 'Staged merge' : 'Single merge',
      tone: 'muted',
    });
  }

  if (snapshotCount > 0) {
    badges.push({ label: `${snapshotCount} snapshot${snapshotCount === 1 ? '' : 's'}`, tone: 'muted' });
  }

  if (lowScoreCount > 0) {
    badges.push({ label: `${lowScoreCount} low score${lowScoreCount === 1 ? '' : 's'}`, tone: 'warning' });
  } else if (scoredAssetCount > 0) {
    badges.push({ label: `${scoredAssetCount} scored`, tone: 'success' });
  }

  if (noteCount > 0 || hasReviewerSummary) {
    badges.push({
      label: noteCount > 0 ? `${noteCount} note${noteCount === 1 ? '' : 's'}` : 'Review notes',
      tone: 'muted',
    });
  }

  return badges;
}
