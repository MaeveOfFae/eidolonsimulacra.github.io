export {
  MAX_DRAFT_REVISION_SNAPSHOTS,
  appendDraftRevisionSnapshot,
  buildDraftRevisionSnapshot,
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotAssetDiffPreview,
  buildDraftSnapshotAssetDiffPreviews,
  buildDraftSnapshotAssetDiffPreviewsFromStates,
  buildDraftSnapshotDiffCandidateAssets,
  buildDraftSnapshotDiffModelFromStates,
  buildDraftSnapshotDiffModelsFromSnapshots,
  buildDraftSnapshotDiffSummary,
  buildDraftSnapshotDiffSummaryFromStates,
  getLatestDraftSnapshotSummary,
} from '@char-gen/shared';

export type {
  DraftSnapshotAssetDiffLine,
  DraftSnapshotAssetDiffPreview,
  DraftSnapshotDiffModel,
  DraftSnapshotDiffSummary,
  LatestDraftSnapshotSummary,
} from '@char-gen/shared';
