/**
 * Pure helpers for the draft comparison panel.
 *
 * Extracted from `DraftComparisonPanel` (5.0 workspace-release work stream: the screen
 * carried ~270 lines of module-private helpers ahead of the component itself). They are
 * pure or near-pure builders, so they live here with their own unit tests instead of
 * being reachable only through the rendered panel.
 */

import type { Draft, DraftMetadata } from '@char-gen/shared';
import { buildDraftRevisionSnapshotState } from '@/lib/drafts/revision-snapshots';

export function countChangedLines(left: string, right: string): number {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const maxLength = Math.max(leftLines.length, rightLines.length);
  let changed = 0;

  for (let index = 0; index < maxLength; index += 1) {
    if ((leftLines[index] || '') !== (rightLines[index] || '')) {
      changed += 1;
    }
  }

  return changed;
}

export interface DraftReviewSummary {
  hasReview: boolean;
  reviewerSummary: string;
  scoredAssetCount: number;
  notedAssetCount: number;
  lowScoreEntries: Array<{ assetName: string; score: number }>;
  updatedAt?: string;
}

export interface AssetReviewState {
  score?: number;
  note: string;
  hasReview: boolean;
}

export interface MergeCandidateAsset {
  assetName: string;
  source: 'left' | 'right' | 'either';
  reason: 'content-drift' | 'review-drift' | 'left-only' | 'right-only';
}

export type DraftComparisonState = ReturnType<typeof buildDraftRevisionSnapshotState> & {
  label: string;
  origin: 'current' | 'snapshot';
};

export function buildDraftReviewSummary(reviewState: {
  review_annotations?: DraftMetadata['review_annotations'];
}): DraftReviewSummary {
  const annotations = reviewState.review_annotations;
  const reviewerSummary = annotations?.notes?.trim() ?? '';
  const assetScores = annotations?.asset_scores ?? {};
  const assetNotes = annotations?.asset_notes ?? {};
  const lowScoreEntries = Object.entries(assetScores)
    .filter(([, score]) => score <= 2)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([assetName, score]) => ({ assetName, score }));
  const notedAssetCount = Object.values(assetNotes).filter((note) => note.trim().length > 0).length;

  return {
    hasReview: Boolean(
      reviewerSummary || Object.keys(assetScores).length > 0 || notedAssetCount > 0 || annotations?.updated_at,
    ),
    reviewerSummary,
    scoredAssetCount: Object.keys(assetScores).length,
    notedAssetCount,
    lowScoreEntries,
    updatedAt: annotations?.updated_at,
  };
}

export function getAssetReviewState(
  state: { review_annotations?: DraftMetadata['review_annotations'] },
  assetName: string,
): AssetReviewState {
  const score = state.review_annotations?.asset_scores?.[assetName];
  const note = state.review_annotations?.asset_notes?.[assetName]?.trim() ?? '';

  return {
    score,
    note,
    hasReview: score !== undefined || note.length > 0,
  };
}

export function formatSnapshotOptionLabel(snapshot: NonNullable<DraftMetadata['revision_snapshots']>[number]) {
  const timestamp = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(snapshot.created_at));

  return `${snapshot.label || 'Restore point'} · ${timestamp}`;
}

export function buildDraftMergeProvenance(options: {
  strategy: NonNullable<DraftMetadata['merge_provenance']>['strategy'];
  sourceDraftId: string;
  sourceSide: 'left' | 'right';
  sourceSnapshotId?: string;
  baseDraftId: string;
  baseSide: 'left' | 'right';
  baseSnapshotId?: string;
  assetNames: string[];
}): NonNullable<DraftMetadata['merge_provenance']> {
  return {
    strategy: options.strategy,
    source_draft_id: options.sourceDraftId,
    source_side: options.sourceSide,
    ...(options.sourceSnapshotId ? { source_snapshot_id: options.sourceSnapshotId } : {}),
    base_draft_id: options.baseDraftId,
    base_side: options.baseSide,
    ...(options.baseSnapshotId ? { base_snapshot_id: options.baseSnapshotId } : {}),
    asset_names: Array.from(new Set(options.assetNames)),
    created_at: new Date().toISOString(),
  };
}

export function buildDraftMergeHistoryEvent(
  options: Parameters<typeof buildDraftMergeProvenance>[0],
): NonNullable<DraftMetadata['merge_history']>[number] {
  const cryptoLike = globalThis as { crypto?: { randomUUID?: () => string } };

  return {
    id: cryptoLike.crypto?.randomUUID?.() ?? `merge-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    ...buildDraftMergeProvenance(options),
  };
}

export function appendDraftMergeHistory(
  existingEntries: DraftMetadata['merge_history'] | undefined,
  entry: NonNullable<DraftMetadata['merge_history']>[number],
): NonNullable<DraftMetadata['merge_history']> {
  return [entry, ...(existingEntries ?? []).filter((existing) => existing.id !== entry.id)];
}

export function buildDraftMergeResolutionDetails(
  candidates: MergeCandidateAsset[],
  targetState: DraftComparisonState,
): NonNullable<DraftMetadata['merge_history']>[number]['asset_resolutions'] {
  return candidates.map((candidate) => ({
    asset_name: candidate.assetName,
    reason: candidate.reason,
    target_previously_had_asset: Object.prototype.hasOwnProperty.call(targetState.assets, candidate.assetName),
    review_context_applied: true,
  }));
}

export function buildComparisonState(draft: Draft | undefined, snapshotId: string): DraftComparisonState | null {
  if (!draft) {
    return null;
  }

  if (!snapshotId) {
    return {
      ...buildDraftRevisionSnapshotState(draft),
      label: 'Current draft',
      origin: 'current',
    };
  }

  const snapshot = draft.metadata.revision_snapshots?.find((entry) => entry.id === snapshotId);
  if (!snapshot) {
    return {
      ...buildDraftRevisionSnapshotState(draft),
      label: 'Current draft',
      origin: 'current',
    };
  }

  return {
    ...snapshot.state,
    label: snapshot.label || 'Restore point',
    origin: 'snapshot',
  };
}

export function buildBranchCreateRequest(
  sourceDraftId: string,
  sourceState: DraftComparisonState,
  options: {
    additionalParentDraftIds?: string[];
    mergeProvenance?: DraftMetadata['merge_provenance'];
    mergeHistory?: DraftMetadata['merge_history'];
  } = {},
) {
  const sourceName = sourceState.character_name || sourceState.seed;

  return {
    seed: sourceState.seed,
    templateName: sourceState.template_name || '',
    mode: sourceState.mode,
    characterName: `${sourceName} (branch)`,
    genre: sourceState.genre,
    notes: sourceState.notes,
    tags: sourceState.tags,
    customInstructions: sourceState.custom_instructions,
    componentSendOrder: sourceState.component_send_order,
    connectedDraftIds: sourceState.connected_drafts,
    parentDraftIds: Array.from(
      new Set([...(sourceState.parent_drafts ?? []), sourceDraftId, ...(options.additionalParentDraftIds ?? [])]),
    ),
    cardMetadata: sourceState.card_metadata,
    reviewAnnotations: sourceState.review_annotations,
    mergeProvenance: options.mergeProvenance ?? sourceState.merge_provenance,
    mergeHistory: options.mergeHistory ?? sourceState.merge_history,
    assets: sourceState.assets,
  };
}

export function buildPromotedReviewAnnotations(
  sourceMetadata: DraftMetadata,
  targetMetadata: DraftMetadata,
  assetName: string,
) {
  return buildPromotedReviewAnnotationsForAssets(sourceMetadata, targetMetadata, [assetName]);
}

export function buildPromotedReviewAnnotationsForAssets(
  sourceMetadata: DraftMetadata,
  targetMetadata: DraftMetadata,
  assetNames: string[],
) {
  const sourceAnnotations = sourceMetadata.review_annotations;
  const targetAnnotations = targetMetadata.review_annotations;
  const nextAssetScores = { ...(targetAnnotations?.asset_scores ?? {}) };
  const nextAssetNotes = { ...(targetAnnotations?.asset_notes ?? {}) };
  assetNames.forEach((assetName) => {
    const sourceScore = sourceAnnotations?.asset_scores?.[assetName];
    const sourceNote = sourceAnnotations?.asset_notes?.[assetName]?.trim() ?? '';

    if (sourceScore !== undefined) {
      nextAssetScores[assetName] = sourceScore;
    } else {
      delete nextAssetScores[assetName];
    }

    if (sourceNote) {
      nextAssetNotes[assetName] = sourceNote;
    } else {
      delete nextAssetNotes[assetName];
    }
  });

  const hasScores = Object.keys(nextAssetScores).length > 0;
  const hasNotes = Object.keys(nextAssetNotes).length > 0;
  const summaryNotes = targetAnnotations?.notes?.trim() ?? '';

  if (!summaryNotes && !hasScores && !hasNotes) {
    return undefined;
  }

  return {
    ...(summaryNotes ? { notes: summaryNotes } : {}),
    ...(hasScores ? { asset_scores: nextAssetScores } : {}),
    ...(hasNotes ? { asset_notes: nextAssetNotes } : {}),
    updated_at: new Date().toISOString(),
  };
}
