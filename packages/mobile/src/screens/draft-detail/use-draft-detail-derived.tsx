/**
 * The values the draft detail screen derives for rendering: the revision snapshots and their
 * comparison, the review annotations and scores, the related-draft lookup, and the export
 * readiness the header reads.
 *
 * Split out of `use-draft-detail-state` verbatim. It needs only the state — a handler needs
 * one of its values (`exportReadiness`), which is why it comes before the handlers.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotDiffCandidateAssets,
  buildDraftSnapshotDiffModelFromStates,
  buildDraftSnapshotDiffSummaryFromStates,
  buildExportReadinessSummary,
} from '@char-gen/shared';
import { getMobileCompareSelection } from '../../lib/compare-selection';
import { buildMobileApprovalQueue } from '../../lib/review-approval';
import type { useDraftDetailState } from './use-draft-detail-state';

export function useDraftDetailDerived({
  compareSnapshotId,
  draft,
  historySnapshotId,
  selectedSnapshotAssetName,
  selectedSnapshotId,
  setCompareSnapshotId,
  setPendingCompareSelection,
  setSelectedSnapshotAssetName,
  setSelectedSnapshotId,
  validationQuery,
}: Pick<
  ReturnType<typeof useDraftDetailState>,
  | 'compareSnapshotId'
  | 'draft'
  | 'historySnapshotId'
  | 'selectedSnapshotAssetName'
  | 'selectedSnapshotId'
  | 'setCompareSnapshotId'
  | 'setPendingCompareSelection'
  | 'setSelectedSnapshotAssetName'
  | 'setSelectedSnapshotId'
  | 'validationQuery'
>) {
  const revisionSnapshots = useMemo(
    () => draft?.metadata.revision_snapshots ?? [],
    [draft?.metadata.revision_snapshots],
  );
  const selectedSnapshot = revisionSnapshots.find((snapshot) => snapshot.id === selectedSnapshotId) ?? null;
  const compareSnapshotOptions = useMemo(
    () => revisionSnapshots.filter((snapshot) => snapshot.id !== selectedSnapshotId),
    [revisionSnapshots, selectedSnapshotId],
  );
  const compareSnapshot = useMemo(
    () => compareSnapshotOptions.find((snapshot) => snapshot.id === compareSnapshotId) ?? null,
    [compareSnapshotId, compareSnapshotOptions],
  );
  const snapshotCompareBaseState = useMemo(
    () => compareSnapshot?.state ?? (draft ? buildDraftRevisionSnapshotState(draft) : undefined),
    [compareSnapshot, draft],
  );
  const snapshotCompareBaseLabel = compareSnapshot?.label || (compareSnapshot ? 'Restore point' : 'Current draft');
  const selectedSnapshotDiffSummary = selectedSnapshot
    ? buildDraftSnapshotDiffSummaryFromStates(snapshotCompareBaseState!, selectedSnapshot.state)
    : null;
  const selectedSnapshotCandidateAssets = useMemo(
    () => (selectedSnapshotDiffSummary ? buildDraftSnapshotDiffCandidateAssets(selectedSnapshotDiffSummary) : []),
    [selectedSnapshotDiffSummary],
  );
  const selectedSnapshotActiveAssetName = selectedSnapshotCandidateAssets.includes(selectedSnapshotAssetName)
    ? selectedSnapshotAssetName
    : selectedSnapshotCandidateAssets[0] || '';
  const selectedSnapshotDiffModel = selectedSnapshot
    ? buildDraftSnapshotDiffModelFromStates(snapshotCompareBaseState!, selectedSnapshot.state, {
        assetName: selectedSnapshotActiveAssetName || undefined,
        maxAssets: selectedSnapshotActiveAssetName ? 1 : 2,
        maxPreviewLines: 4,
      })
    : null;
  const selectedSnapshotAssetPreviews = selectedSnapshotDiffModel?.assetPreviews ?? [];
  const exportReadinessPending = useMemo(
    () => (draft ? buildExportReadinessSummary(draft, validationQuery.data) : undefined),
    [draft, validationQuery.data],
  );
  const approvalQueue = useMemo(
    () => buildMobileApprovalQueue(draft, validationQuery.data),
    [draft, validationQuery.data],
  );

  useEffect(() => {
    if (!draft) {
      return;
    }

    if (!revisionSnapshots.length) {
      setSelectedSnapshotId('');
      return;
    }

    if (historySnapshotId && revisionSnapshots.some((snapshot) => snapshot.id === historySnapshotId)) {
      setSelectedSnapshotId(historySnapshotId);
      return;
    }

    setSelectedSnapshotId((current) => {
      if (current && revisionSnapshots.some((snapshot) => snapshot.id === current)) {
        return current;
      }

      return revisionSnapshots[0]?.id ?? '';
    });
  }, [draft, historySnapshotId, revisionSnapshots, setSelectedSnapshotId]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    if (!compareSnapshotId) {
      return;
    }

    if (!compareSnapshotOptions.some((snapshot) => snapshot.id === compareSnapshotId)) {
      setCompareSnapshotId('');
    }
  }, [compareSnapshotId, compareSnapshotOptions, draft, setCompareSnapshotId]);

  useEffect(() => {
    if (!draft) {
      return;
    }

    if (!selectedSnapshotCandidateAssets.length) {
      setSelectedSnapshotAssetName('');
      return;
    }

    setSelectedSnapshotAssetName((current) =>
      selectedSnapshotCandidateAssets.includes(current) ? current : (selectedSnapshotCandidateAssets[0] ?? ''),
    );
  }, [draft, selectedSnapshotCandidateAssets, setSelectedSnapshotAssetName]);

  useFocusEffect(
    useCallback(() => {
      setPendingCompareSelection(getMobileCompareSelection());
    }, [setPendingCompareSelection]),
  );

  // Hooks must run unconditionally, so the memoized values above are computed
  // null-safely and are guaranteed to be populated once the guards pass.
  const exportReadiness = exportReadinessPending!;

  return {
    approvalQueue,
    compareSnapshot,
    compareSnapshotOptions,
    exportReadiness,
    exportReadinessPending,
    revisionSnapshots,
    selectedSnapshot,
    selectedSnapshotActiveAssetName,
    selectedSnapshotAssetPreviews,
    selectedSnapshotCandidateAssets,
    selectedSnapshotDiffModel,
    selectedSnapshotDiffSummary,
    snapshotCompareBaseLabel,
    snapshotCompareBaseState,
  };
}
