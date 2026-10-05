import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GitBranch, GitCompare, Loader2, MoveLeft, MoveRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { DraftMetadata } from '@char-gen/shared';
import CollapsibleSection from '../common/CollapsibleSection';
import { DraftComparisonCards } from './DraftComparisonCards';
import { DraftAssetComparisonDetail } from './DraftAssetComparisonDetail';
import { DraftComparisonSharedAssets } from './DraftComparisonSharedAssets';
import { formatAssetLabel, summarizeText } from '@/lib/drafts/asset-display';
import {
  countChangedLines,
  buildDraftReviewSummary,
  getAssetReviewState,
  formatSnapshotOptionLabel,
  buildDraftMergeProvenance,
  buildDraftMergeHistoryEvent,
  appendDraftMergeHistory,
  buildDraftMergeResolutionDetails,
  buildComparisonState,
  buildBranchCreateRequest,
  buildPromotedReviewAnnotations,
  buildPromotedReviewAnnotationsForAssets,
} from '@/lib/drafts/comparison-helpers';
import type { MergeCandidateAsset } from '@/lib/drafts/comparison-helpers';

export interface DraftComparisonPanelProps {
  leftDraftId?: string;
  rightDraftId?: string;
  draftOptions?: DraftMetadata[];
  onLeftDraftChange?: (draftId: string) => void;
  onRightDraftChange?: (draftId: string) => void;
}

export function DraftComparisonPanel({
  leftDraftId,
  rightDraftId,
  draftOptions = [],
  onLeftDraftChange,
  onRightDraftChange,
}: DraftComparisonPanelProps) {
  const queryClient = useQueryClient();
  const [selectedLeftDraftId, setSelectedLeftDraftId] = useState(leftDraftId || '');
  const [selectedRightDraftId, setSelectedRightDraftId] = useState(rightDraftId || '');
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [stagedMergeAssets, setStagedMergeAssets] = useState<string[]>([]);
  const [selectedLeftSnapshotId, setSelectedLeftSnapshotId] = useState('');
  const [selectedRightSnapshotId, setSelectedRightSnapshotId] = useState('');
  const [promotionNotice, setPromotionNotice] = useState<string | null>(null);
  const [promotionError, setPromotionError] = useState<string | null>(null);
  const [branchNotice, setBranchNotice] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);

  useEffect(() => {
    setSelectedLeftDraftId(leftDraftId || '');
  }, [leftDraftId]);

  useEffect(() => {
    onLeftDraftChange?.(selectedLeftDraftId);
  }, [onLeftDraftChange, selectedLeftDraftId]);

  useEffect(() => {
    setSelectedRightDraftId(rightDraftId || '');
  }, [rightDraftId]);

  useEffect(() => {
    onRightDraftChange?.(selectedRightDraftId);
  }, [onRightDraftChange, selectedRightDraftId]);

  const leftDraft = useQuery({
    queryKey: ['draft', selectedLeftDraftId, 'comparison-left'],
    queryFn: () => api.getDraft(selectedLeftDraftId || ''),
    enabled: Boolean(selectedLeftDraftId),
  });

  const rightDraft = useQuery({
    queryKey: ['draft', selectedRightDraftId, 'comparison-right'],
    queryFn: () => api.getDraft(selectedRightDraftId || ''),
    enabled: Boolean(selectedRightDraftId),
  });

  useEffect(() => {
    const snapshotIds = leftDraft.data?.metadata.revision_snapshots?.map((snapshot) => snapshot.id) ?? [];
    setSelectedLeftSnapshotId((current) => {
      if (!current) {
        return '';
      }

      return snapshotIds.includes(current) ? current : '';
    });
  }, [leftDraft.data?.metadata.revision_snapshots]);

  useEffect(() => {
    const snapshotIds = rightDraft.data?.metadata.revision_snapshots?.map((snapshot) => snapshot.id) ?? [];
    setSelectedRightSnapshotId((current) => {
      if (!current) {
        return '';
      }

      return snapshotIds.includes(current) ? current : '';
    });
  }, [rightDraft.data?.metadata.revision_snapshots]);

  const comparison = useMemo(() => {
    const leftState = buildComparisonState(leftDraft.data, selectedLeftSnapshotId);
    const rightState = buildComparisonState(rightDraft.data, selectedRightSnapshotId);
    if (!leftState || !rightState) {
      return null;
    }

    const leftAssets = Object.keys(leftState.assets);
    const rightAssets = Object.keys(rightState.assets);
    const sharedAssets = leftAssets.filter((asset) => rightAssets.includes(asset));
    const uniqueLeft = leftAssets.filter((asset) => !rightAssets.includes(asset));
    const uniqueRight = rightAssets.filter((asset) => !leftAssets.includes(asset));
    const identicalAssets = sharedAssets.filter((asset) => leftState.assets[asset] === rightState.assets[asset]);
    const differentAssets = sharedAssets.filter((asset) => leftState.assets[asset] !== rightState.assets[asset]);

    return {
      leftState,
      rightState,
      sharedAssets,
      uniqueLeft,
      uniqueRight,
      identicalAssets,
      differentAssets,
    };
  }, [leftDraft.data, rightDraft.data, selectedLeftSnapshotId, selectedRightSnapshotId]);
  const leftReviewSummary = useMemo(
    () => (comparison ? buildDraftReviewSummary(comparison.leftState) : null),
    [comparison],
  );
  const rightReviewSummary = useMemo(
    () => (comparison ? buildDraftReviewSummary(comparison.rightState) : null),
    [comparison],
  );
  const reviewContextDifferenceCount = useMemo(() => {
    if (!comparison) {
      return 0;
    }

    return comparison.sharedAssets.filter((assetName) => {
      const leftReview = getAssetReviewState(comparison.leftState, assetName);
      const rightReview = getAssetReviewState(comparison.rightState, assetName);

      return leftReview.score !== rightReview.score || leftReview.note !== rightReview.note;
    }).length;
  }, [comparison]);
  const mergeCandidateAssets = useMemo(() => {
    if (!comparison) {
      return [] as MergeCandidateAsset[];
    }

    const sharedCandidates = comparison.sharedAssets.flatMap((assetName) => {
      const leftReview = getAssetReviewState(comparison.leftState, assetName);
      const rightReview = getAssetReviewState(comparison.rightState, assetName);
      const contentDiffers = comparison.leftState.assets[assetName] !== comparison.rightState.assets[assetName];
      const reviewDiffers = leftReview.score !== rightReview.score || leftReview.note !== rightReview.note;

      if (!contentDiffers && !reviewDiffers) {
        return [];
      }

      return [
        {
          assetName,
          source: 'either' as const,
          reason: contentDiffers ? ('content-drift' as const) : ('review-drift' as const),
        },
      ];
    });

    const leftUniqueCandidates = comparison.uniqueLeft.map((assetName) => ({
      assetName,
      source: 'left' as const,
      reason: 'left-only' as const,
    }));

    const rightUniqueCandidates = comparison.uniqueRight.map((assetName) => ({
      assetName,
      source: 'right' as const,
      reason: 'right-only' as const,
    }));

    return [...sharedCandidates, ...leftUniqueCandidates, ...rightUniqueCandidates];
  }, [comparison]);

  useEffect(() => {
    if (!comparison) {
      setSelectedAsset('');
      return;
    }

    const preferredAsset = comparison.differentAssets[0] || comparison.sharedAssets[0] || '';
    if (!selectedAsset || !comparison.sharedAssets.includes(selectedAsset)) {
      setSelectedAsset(preferredAsset);
    }
  }, [comparison, selectedAsset]);

  const selectedLeftAssetContent =
    selectedAsset && leftDraft.data ? comparison?.leftState.assets[selectedAsset] || '' : '';
  const selectedRightAssetContent =
    selectedAsset && rightDraft.data ? comparison?.rightState.assets[selectedAsset] || '' : '';
  const leftLatestSnapshotId = leftDraft.data?.metadata.revision_snapshots?.[0]?.id;
  const rightLatestSnapshotId = rightDraft.data?.metadata.revision_snapshots?.[0]?.id;
  const selectedAssetReviewComparison = useMemo(() => {
    if (!selectedAsset || !comparison) {
      return null;
    }

    const leftReview = getAssetReviewState(comparison.leftState, selectedAsset);
    const rightReview = getAssetReviewState(comparison.rightState, selectedAsset);

    return {
      leftReview,
      rightReview,
      hasDifferences: leftReview.score !== rightReview.score || leftReview.note !== rightReview.note,
    };
  }, [comparison, selectedAsset]);

  useEffect(() => {
    if (!mergeCandidateAssets.length) {
      setStagedMergeAssets([]);
      return;
    }

    const validAssets = new Set(mergeCandidateAssets.map(({ assetName }) => assetName));
    setStagedMergeAssets((current) => current.filter((assetName) => validAssets.has(assetName)));
  }, [mergeCandidateAssets]);

  const changedLines = selectedAsset ? countChangedLines(selectedLeftAssetContent, selectedRightAssetContent) : 0;
  const leftHasSelectedAsset = Boolean(
    selectedAsset && comparison && Object.prototype.hasOwnProperty.call(comparison.leftState.assets, selectedAsset),
  );
  const rightHasSelectedAsset = Boolean(
    selectedAsset && comparison && Object.prototype.hasOwnProperty.call(comparison.rightState.assets, selectedAsset),
  );
  const canPromoteLeftToRight = Boolean(
    selectedAsset &&
    leftDraft.data &&
    rightDraft.data &&
    selectedRightSnapshotId === '' &&
    leftHasSelectedAsset &&
    (selectedLeftAssetContent !== selectedRightAssetContent || selectedAssetReviewComparison?.hasDifferences),
  );
  const canPromoteRightToLeft = Boolean(
    selectedAsset &&
    leftDraft.data &&
    rightDraft.data &&
    selectedLeftSnapshotId === '' &&
    rightHasSelectedAsset &&
    (selectedLeftAssetContent !== selectedRightAssetContent || selectedAssetReviewComparison?.hasDifferences),
  );
  const canPromoteStagedLeftToRight = Boolean(
    stagedMergeAssets.length > 0 &&
    leftDraft.data &&
    rightDraft.data &&
    comparison &&
    stagedMergeAssets.every((assetName) => {
      const candidate = mergeCandidateAssets.find((entry) => entry.assetName === assetName);
      return (
        candidate &&
        candidate.source !== 'right' &&
        Object.prototype.hasOwnProperty.call(comparison.leftState.assets, assetName)
      );
    }),
  );
  const canPromoteStagedRightToLeft = Boolean(
    stagedMergeAssets.length > 0 &&
    leftDraft.data &&
    rightDraft.data &&
    comparison &&
    stagedMergeAssets.every((assetName) => {
      const candidate = mergeCandidateAssets.find((entry) => entry.assetName === assetName);
      return (
        candidate &&
        candidate.source !== 'left' &&
        Object.prototype.hasOwnProperty.call(comparison.rightState.assets, assetName)
      );
    }),
  );

  const stagedMergeManifest = useMemo(
    () =>
      stagedMergeAssets
        .map((assetName) => mergeCandidateAssets.find((entry) => entry.assetName === assetName))
        .filter(Boolean) as MergeCandidateAsset[],
    [mergeCandidateAssets, stagedMergeAssets],
  );
  const selectedMergeCandidate = useMemo(
    () => (selectedAsset ? (mergeCandidateAssets.find((entry) => entry.assetName === selectedAsset) ?? null) : null),
    [mergeCandidateAssets, selectedAsset],
  );

  const toggleStagedMergeAsset = (assetName: string) => {
    setStagedMergeAssets((current) =>
      current.includes(assetName) ? current.filter((entry) => entry !== assetName) : [...current, assetName],
    );
  };

  const promoteAssetMutation = useMutation({
    mutationFn: async (direction: 'left-to-right' | 'right-to-left') => {
      if (!selectedAsset || !leftDraft.data || !rightDraft.data) {
        throw new Error('Select two drafts and an asset before promoting content.');
      }

      const sourceDraft = direction === 'left-to-right' ? leftDraft.data : rightDraft.data;
      const targetDraft = direction === 'left-to-right' ? rightDraft.data : leftDraft.data;
      const sourceLabel = direction === 'left-to-right' ? 'left' : 'right';
      const sourceState = direction === 'left-to-right' ? comparison?.leftState : comparison?.rightState;
      const sourceHasAsset = Boolean(
        sourceState && Object.prototype.hasOwnProperty.call(sourceState.assets, selectedAsset),
      );

      if (!sourceHasAsset) {
        throw new Error(`The ${sourceLabel} draft does not have ${selectedAsset}.`);
      }

      const nextContent = sourceState?.assets[selectedAsset] ?? '';
      const targetHasAsset = Object.prototype.hasOwnProperty.call(targetDraft.assets, selectedAsset);
      const nextAnnotations = buildPromotedReviewAnnotations(
        {
          ...sourceDraft.metadata,
          review_annotations: sourceState?.review_annotations,
        },
        targetDraft.metadata,
        selectedAsset,
      );
      const mergeRecordOptions = {
        strategy: 'single-asset',
        sourceDraftId: sourceDraft.metadata.review_id,
        sourceSide: direction === 'left-to-right' ? 'left' : 'right',
        sourceSnapshotId:
          direction === 'left-to-right' ? selectedLeftSnapshotId || undefined : selectedRightSnapshotId || undefined,
        baseDraftId: targetDraft.metadata.review_id,
        baseSide: direction === 'left-to-right' ? 'right' : 'left',
        assetNames: [selectedAsset],
      } satisfies Parameters<typeof buildDraftMergeProvenance>[0];
      const mergeHistoryEntry = {
        ...buildDraftMergeHistoryEvent(mergeRecordOptions),
        asset_resolutions: buildDraftMergeResolutionDetails(
          [
            selectedMergeCandidate ?? {
              assetName: selectedAsset,
              source: 'either',
              reason: selectedLeftAssetContent !== selectedRightAssetContent ? 'content-drift' : 'review-drift',
            },
          ],
          direction === 'left-to-right' ? comparison!.rightState : comparison!.leftState,
        ),
      } satisfies NonNullable<DraftMetadata['merge_history']>[number];

      const safeguardSnapshot = await api.createDraftSnapshot(targetDraft.metadata.review_id, {
        label: `Before promoting ${formatAssetLabel(selectedAsset)}`,
        reason: `pre-promotion:${selectedAsset}`,
      });

      if (safeguardSnapshot?.snapshot_id) {
        mergeHistoryEntry.undo_snapshot_id = safeguardSnapshot.snapshot_id;
      }

      await api.updateAsset(targetDraft.metadata.review_id, selectedAsset, nextContent, {
        overwrite: targetHasAsset,
        expectedPreviousContent: targetHasAsset ? targetDraft.assets[selectedAsset] : null,
      });
      await api.updateMetadata(targetDraft.metadata.review_id, {
        review_annotations: nextAnnotations,
        merge_provenance: buildDraftMergeProvenance(mergeRecordOptions),
        merge_history: appendDraftMergeHistory(targetDraft.metadata.merge_history, mergeHistoryEntry),
      });

      return {
        targetDraftId: targetDraft.metadata.review_id,
        message: `Promoted ${formatAssetLabel(selectedAsset)} from ${direction === 'left-to-right' ? 'left' : 'right'} to ${direction === 'left-to-right' ? 'right' : 'left'}, including that asset's saved review context. A restore point was saved on the target draft first.`,
      };
    },
    onSuccess: async ({ targetDraftId, message }) => {
      setPromotionNotice(message);
      setPromotionError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['draft', selectedLeftDraftId] }),
        queryClient.invalidateQueries({ queryKey: ['draft', selectedRightDraftId] }),
        queryClient.invalidateQueries({ queryKey: ['draft', targetDraftId] }),
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
      ]);
    },
    onError: (error) => {
      setPromotionNotice(null);
      setPromotionError(error instanceof Error ? error.message : 'Failed to promote asset.');
    },
  });

  const createBranchMutation = useMutation({
    mutationFn: async (source: 'left' | 'right') => {
      const sourceDraft = source === 'left' ? leftDraft.data : rightDraft.data;
      const sourceState = source === 'left' ? comparison?.leftState : comparison?.rightState;

      if (!sourceDraft || !sourceState) {
        throw new Error('Load the source draft before creating a branch copy.');
      }

      if (!sourceState.template_name) {
        throw new Error('This draft does not have a saved template name, so a branch copy cannot be created yet.');
      }

      const branchDraft = await api.createDraft(buildBranchCreateRequest(sourceDraft.metadata.review_id, sourceState));

      return {
        branchDraft,
        sourceViewLabel: sourceState.origin === 'snapshot' ? sourceState.label || 'restore point' : 'current draft',
      };
    },
    onSuccess: async ({ branchDraft, sourceViewLabel }, source) => {
      setBranchError(null);
      setBranchNotice(
        `Created a branch copy from the ${source === 'left' ? 'left' : 'right'} ${sourceViewLabel} and loaded it into the ${source === 'left' ? 'right' : 'left'} comparison slot.`,
      );
      if (source === 'left') {
        setSelectedRightSnapshotId('');
        setSelectedRightDraftId(branchDraft.metadata.review_id);
      } else {
        setSelectedLeftSnapshotId('');
        setSelectedLeftDraftId(branchDraft.metadata.review_id);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['draft', branchDraft.metadata.review_id] }),
      ]);
    },
    onError: (error) => {
      setBranchNotice(null);
      setBranchError(error instanceof Error ? error.message : 'Failed to create branch copy.');
    },
  });

  const promoteIntoBranchMutation = useMutation({
    mutationFn: async (direction: 'left-to-right' | 'right-to-left') => {
      if (!selectedAsset || !leftDraft.data || !rightDraft.data) {
        throw new Error('Select two drafts and an asset before promoting into a branch.');
      }

      const sourceDraft = direction === 'left-to-right' ? leftDraft.data : rightDraft.data;
      const targetSourceDraft = direction === 'left-to-right' ? rightDraft.data : leftDraft.data;
      const sourceState = direction === 'left-to-right' ? comparison?.leftState : comparison?.rightState;
      const targetState = direction === 'left-to-right' ? comparison?.rightState : comparison?.leftState;
      const sourceHasAsset = Boolean(
        sourceState && Object.prototype.hasOwnProperty.call(sourceState.assets, selectedAsset),
      );

      if (!sourceHasAsset || !targetState) {
        throw new Error(
          `The ${direction === 'left-to-right' ? 'left' : 'right'} draft does not have ${selectedAsset}.`,
        );
      }

      if (!targetState.template_name) {
        throw new Error(
          'The target draft does not have a saved template name, so a branch copy cannot be created yet.',
        );
      }

      const sourceSide = direction === 'left-to-right' ? 'left' : 'right';
      const baseSide = direction === 'left-to-right' ? 'right' : 'left';
      const mergeRecordOptions = {
        strategy: 'single-asset',
        sourceDraftId: sourceDraft.metadata.review_id,
        sourceSide,
        sourceSnapshotId:
          sourceSide === 'left' ? selectedLeftSnapshotId || undefined : selectedRightSnapshotId || undefined,
        baseDraftId: targetSourceDraft.metadata.review_id,
        baseSide,
        baseSnapshotId:
          baseSide === 'left' ? selectedLeftSnapshotId || undefined : selectedRightSnapshotId || undefined,
        assetNames: [selectedAsset],
      } satisfies Parameters<typeof buildDraftMergeProvenance>[0];
      const mergeProvenance = buildDraftMergeProvenance(mergeRecordOptions);
      const mergeHistoryEntry = {
        ...buildDraftMergeHistoryEvent(mergeRecordOptions),
        asset_resolutions: buildDraftMergeResolutionDetails(
          [
            selectedMergeCandidate ?? {
              assetName: selectedAsset,
              source: 'either',
              reason: selectedLeftAssetContent !== selectedRightAssetContent ? 'content-drift' : 'review-drift',
            },
          ],
          targetState,
        ),
      } satisfies NonNullable<DraftMetadata['merge_history']>[number];

      const branchDraft = await api.createDraft(
        buildBranchCreateRequest(targetSourceDraft.metadata.review_id, targetState, {
          additionalParentDraftIds: [sourceDraft.metadata.review_id],
          mergeProvenance,
          mergeHistory: appendDraftMergeHistory(targetState.merge_history, mergeHistoryEntry),
        }),
      );
      const targetHasAsset = Object.prototype.hasOwnProperty.call(branchDraft.assets, selectedAsset);
      const nextContent = sourceState?.assets[selectedAsset] ?? '';
      const nextAnnotations = buildPromotedReviewAnnotations(
        {
          ...sourceDraft.metadata,
          review_annotations: sourceState?.review_annotations,
        },
        branchDraft.metadata,
        selectedAsset,
      );

      await api.updateAsset(branchDraft.metadata.review_id, selectedAsset, nextContent, {
        overwrite: targetHasAsset,
        expectedPreviousContent: targetHasAsset ? branchDraft.assets[selectedAsset] : null,
      });
      await api.updateMetadata(branchDraft.metadata.review_id, {
        review_annotations: nextAnnotations,
      });

      return {
        branchDraftId: branchDraft.metadata.review_id,
        targetSlot: direction === 'left-to-right' ? 'right' : 'left',
        message: `Created a ${direction === 'left-to-right' ? 'right' : 'left'} branch copy and promoted ${formatAssetLabel(selectedAsset)} into it with that asset's saved review context.`,
      };
    },
    onSuccess: async ({ branchDraftId, targetSlot, message }) => {
      setBranchError(null);
      setBranchNotice(message);
      if (targetSlot === 'right') {
        setSelectedRightDraftId(branchDraftId);
      } else {
        setSelectedLeftDraftId(branchDraftId);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['draft', branchDraftId] }),
      ]);
    },
    onError: (error) => {
      setBranchNotice(null);
      setBranchError(
        error instanceof Error ? error.message : 'Failed to create branch copy and promote the selected asset.',
      );
    },
  });

  const promoteStagedIntoBranchMutation = useMutation({
    mutationFn: async (direction: 'left-to-right' | 'right-to-left') => {
      if (!leftDraft.data || !rightDraft.data || stagedMergeAssets.length === 0) {
        throw new Error('Stage one or more merge assets before promoting them into a branch.');
      }

      const sourceDraft = direction === 'left-to-right' ? leftDraft.data : rightDraft.data;
      const targetSourceDraft = direction === 'left-to-right' ? rightDraft.data : leftDraft.data;
      const sourceState = direction === 'left-to-right' ? comparison?.leftState : comparison?.rightState;
      const targetState = direction === 'left-to-right' ? comparison?.rightState : comparison?.leftState;

      if (!sourceState || !targetState) {
        throw new Error('Load both draft states before creating a staged merge branch.');
      }

      if (!targetState.template_name) {
        throw new Error(
          'The target draft does not have a saved template name, so a merge branch cannot be created yet.',
        );
      }

      const invalidAssets = stagedMergeAssets.filter((assetName) => {
        const candidate = mergeCandidateAssets.find((entry) => entry.assetName === assetName);
        return (
          !candidate ||
          candidate.source === (direction === 'left-to-right' ? 'right' : 'left') ||
          !Object.prototype.hasOwnProperty.call(sourceState.assets, assetName)
        );
      });
      if (invalidAssets.length > 0) {
        throw new Error(`The source side is missing ${invalidAssets.join(', ')}.`);
      }

      const sourceSide = direction === 'left-to-right' ? 'left' : 'right';
      const baseSide = direction === 'left-to-right' ? 'right' : 'left';
      const mergeRecordOptions = {
        strategy: 'staged-merge',
        sourceDraftId: sourceDraft.metadata.review_id,
        sourceSide,
        sourceSnapshotId:
          sourceSide === 'left' ? selectedLeftSnapshotId || undefined : selectedRightSnapshotId || undefined,
        baseDraftId: targetSourceDraft.metadata.review_id,
        baseSide,
        baseSnapshotId:
          baseSide === 'left' ? selectedLeftSnapshotId || undefined : selectedRightSnapshotId || undefined,
        assetNames: stagedMergeAssets,
      } satisfies Parameters<typeof buildDraftMergeProvenance>[0];
      const mergeProvenance = buildDraftMergeProvenance(mergeRecordOptions);
      const mergeHistoryEntry = {
        ...buildDraftMergeHistoryEvent(mergeRecordOptions),
        asset_resolutions: buildDraftMergeResolutionDetails(stagedMergeManifest, targetState),
      } satisfies NonNullable<DraftMetadata['merge_history']>[number];

      const branchDraft = await api.createDraft(
        buildBranchCreateRequest(targetSourceDraft.metadata.review_id, targetState, {
          additionalParentDraftIds: [sourceDraft.metadata.review_id],
          mergeProvenance,
          mergeHistory: appendDraftMergeHistory(targetState.merge_history, mergeHistoryEntry),
        }),
      );

      for (const assetName of stagedMergeAssets) {
        const targetHasAsset = Object.prototype.hasOwnProperty.call(branchDraft.assets, assetName);
        await api.updateAsset(branchDraft.metadata.review_id, assetName, sourceState.assets[assetName] ?? '', {
          overwrite: targetHasAsset,
          expectedPreviousContent: targetHasAsset ? branchDraft.assets[assetName] : null,
        });
      }

      const nextAnnotations = buildPromotedReviewAnnotationsForAssets(
        {
          ...sourceDraft.metadata,
          review_annotations: sourceState.review_annotations,
        },
        branchDraft.metadata,
        stagedMergeAssets,
      );

      await api.updateMetadata(branchDraft.metadata.review_id, {
        review_annotations: nextAnnotations,
      });

      return {
        branchDraftId: branchDraft.metadata.review_id,
        targetSlot: direction === 'left-to-right' ? 'right' : 'left',
        mergedAssetCount: stagedMergeAssets.length,
      };
    },
    onSuccess: async ({ branchDraftId, targetSlot, mergedAssetCount }) => {
      setBranchError(null);
      setBranchNotice(
        `Created a merge branch with ${mergedAssetCount} staged asset${mergedAssetCount === 1 ? '' : 's'} applied to the ${targetSlot} side.`,
      );
      setStagedMergeAssets([]);
      if (targetSlot === 'right') {
        setSelectedRightSnapshotId('');
        setSelectedRightDraftId(branchDraftId);
      } else {
        setSelectedLeftSnapshotId('');
        setSelectedLeftDraftId(branchDraftId);
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['draft', branchDraftId] }),
      ]);
    },
    onError: (error) => {
      setBranchNotice(null);
      setBranchError(
        error instanceof Error ? error.message : 'Failed to create a merge branch from the staged assets.',
      );
    },
  });

  useEffect(() => {
    setPromotionNotice(null);
    setPromotionError(null);
    setBranchNotice(null);
    setBranchError(null);
  }, [selectedAsset, stagedMergeAssets, selectedLeftDraftId, selectedRightDraftId]);

  return (
    <CollapsibleSection
      title="Draft comparison"
      subtitle="Shared assets, plus template and mode drift between two saved drafts"
      preview={`Left: ${selectedLeftDraftId || 'unset'} · Right: ${selectedRightDraftId || 'unset'}`}
      meta={<GitCompare className="h-4 w-4 text-primary" />}
      defaultExpanded={Boolean(selectedLeftDraftId && selectedRightDraftId)}
      className="border-dashed text-sm text-muted-foreground"
      bodyClassName="space-y-4"
    >
      {draftOptions.length > 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium text-foreground">Left draft</span>
            <select
              value={selectedLeftDraftId}
              onChange={(event) => setSelectedLeftDraftId(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a draft...</option>
              {draftOptions.map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.seed}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-foreground">Right draft</span>
            <select
              value={selectedRightDraftId}
              onChange={(event) => setSelectedRightDraftId(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a draft...</option>
              {draftOptions.map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.seed}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {(leftDraft.isLoading || rightDraft.isLoading) && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading draft comparison...
        </div>
      )}

      {!selectedLeftDraftId || !selectedRightDraftId ? (
        <div className="rounded-md border border-border p-3">Select at least two drafts to unlock comparison.</div>
      ) : null}

      {comparison && leftDraft.data && rightDraft.data && (
        <div className="space-y-3">
          <DraftComparisonCards
            leftState={comparison.leftState}
            rightState={comparison.rightState}
            leftReviewSummary={leftReviewSummary}
            rightReviewSummary={rightReviewSummary}
            leftSnapshots={leftDraft.data.metadata.revision_snapshots ?? []}
            rightSnapshots={rightDraft.data.metadata.revision_snapshots ?? []}
            selectedLeftSnapshotId={selectedLeftSnapshotId}
            onSelectLeftSnapshot={setSelectedLeftSnapshotId}
            selectedRightSnapshotId={selectedRightSnapshotId}
            onSelectRightSnapshot={setSelectedRightSnapshotId}
            onBranch={(side) => createBranchMutation.mutate(side)}
            branchPending={createBranchMutation.isPending}
            branchNotice={branchNotice}
            branchError={branchError}
          />

          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Shared assets</div>
              <div className="mt-1">{comparison.sharedAssets.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Identical assets</div>
              <div className="mt-1">{comparison.identicalAssets.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Different assets</div>
              <div className="mt-1">{comparison.differentAssets.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Unique assets</div>
              <div className="mt-1">{comparison.uniqueLeft.length + comparison.uniqueRight.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Review drift</div>
              <div className="mt-1">{reviewContextDifferenceCount}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-md border border-border p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Left review state</div>
              <div className="mt-1">
                {leftReviewSummary?.reviewerSummary
                  ? summarizeText(leftReviewSummary.reviewerSummary)
                  : 'No reviewer summary saved.'}
              </div>
              {leftReviewSummary && leftReviewSummary.lowScoreEntries.length > 0 && (
                <div className="mt-2 text-warning">
                  Low-score assets:{' '}
                  {leftReviewSummary.lowScoreEntries
                    .map(({ assetName, score }) => `${formatAssetLabel(assetName)} (${score}/5)`)
                    .join(', ')}
                </div>
              )}
            </div>
            <div className="rounded-md border border-border p-3 text-xs text-muted-foreground">
              <div className="font-medium text-foreground">Right review state</div>
              <div className="mt-1">
                {rightReviewSummary?.reviewerSummary
                  ? summarizeText(rightReviewSummary.reviewerSummary)
                  : 'No reviewer summary saved.'}
              </div>
              {rightReviewSummary && rightReviewSummary.lowScoreEntries.length > 0 && (
                <div className="mt-2 text-warning">
                  Low-score assets:{' '}
                  {rightReviewSummary.lowScoreEntries
                    .map(({ assetName, score }) => `${formatAssetLabel(assetName)} (${score}/5)`)
                    .join(', ')}
                </div>
              )}
            </div>
          </div>

          {comparison.sharedAssets.length > 0 && (
            <>
              <DraftComparisonSharedAssets
                sharedAssets={comparison.sharedAssets}
                differentAssets={comparison.differentAssets}
                selectedAsset={selectedAsset}
                onSelectAsset={setSelectedAsset}
                stagedMergeAssets={stagedMergeAssets}
                mergeCandidateAssets={mergeCandidateAssets}
                stagedMergeManifest={stagedMergeManifest}
                onToggleStagedMergeAsset={toggleStagedMergeAsset}
              />

              {selectedAsset && (
                <DraftAssetComparisonDetail
                  assetName={selectedAsset}
                  leftContent={selectedLeftAssetContent}
                  rightContent={selectedRightAssetContent}
                  changedLines={changedLines}
                  reviewComparison={selectedAssetReviewComparison}
                  isMergeCandidate={mergeCandidateAssets.some((entry) => entry.assetName === selectedAsset)}
                  isStaged={stagedMergeAssets.includes(selectedAsset)}
                  onToggleStaged={toggleStagedMergeAsset}
                  promotionNotice={promotionNotice}
                  promotionError={promotionError}
                >
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => promoteStagedIntoBranchMutation.mutate('left-to-right')}
                      disabled={!canPromoteStagedLeftToRight || promoteStagedIntoBranchMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      Promote staged left assets into new right branch
                    </button>
                    <button
                      type="button"
                      onClick={() => promoteStagedIntoBranchMutation.mutate('right-to-left')}
                      disabled={!canPromoteStagedRightToLeft || promoteStagedIntoBranchMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      Promote staged right assets into new left branch
                    </button>
                    <button
                      type="button"
                      onClick={() => promoteAssetMutation.mutate('left-to-right')}
                      disabled={!canPromoteLeftToRight || promoteAssetMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <MoveRight className="h-3.5 w-3.5" />
                      Promote left to right
                    </button>
                    <button
                      type="button"
                      onClick={() => promoteIntoBranchMutation.mutate('left-to-right')}
                      disabled={!canPromoteLeftToRight || promoteIntoBranchMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      Promote left into new right branch
                    </button>
                    <button
                      type="button"
                      onClick={() => promoteAssetMutation.mutate('right-to-left')}
                      disabled={!canPromoteRightToLeft || promoteAssetMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <MoveLeft className="h-3.5 w-3.5" />
                      Promote right to left
                    </button>
                    <button
                      type="button"
                      onClick={() => promoteIntoBranchMutation.mutate('right-to-left')}
                      disabled={!canPromoteRightToLeft || promoteIntoBranchMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      Promote right into new left branch
                    </button>
                    {selectedAsset && selectedLeftDraftId && (
                      <div className="flex flex-wrap items-center gap-2">
                        {leftDraft.data?.metadata.revision_snapshots?.length ? (
                          <select
                            aria-label="Left draft revision"
                            value={selectedLeftSnapshotId}
                            onChange={(event) => setSelectedLeftSnapshotId(event.target.value)}
                            className="rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
                          >
                            {leftDraft.data.metadata.revision_snapshots.slice(0, 6).map((snapshot) => (
                              <option key={snapshot.id} value={snapshot.id}>
                                {formatSnapshotOptionLabel(snapshot)}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        <a
                          href={`/drafts/${encodeURIComponent(selectedLeftDraftId)}?historyAsset=${encodeURIComponent(selectedAsset)}${selectedLeftSnapshotId ? `&historySnapshot=${encodeURIComponent(selectedLeftSnapshotId)}` : leftLatestSnapshotId ? `&historySnapshot=${encodeURIComponent(leftLatestSnapshotId)}` : ''}`}
                          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          {leftLatestSnapshotId ? 'View left snapshot diff' : 'View left history'}
                        </a>
                      </div>
                    )}
                    {selectedAsset && selectedRightDraftId && (
                      <div className="flex flex-wrap items-center gap-2">
                        {rightDraft.data?.metadata.revision_snapshots?.length ? (
                          <select
                            aria-label="Right draft revision"
                            value={selectedRightSnapshotId}
                            onChange={(event) => setSelectedRightSnapshotId(event.target.value)}
                            className="rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
                          >
                            {rightDraft.data.metadata.revision_snapshots.slice(0, 6).map((snapshot) => (
                              <option key={snapshot.id} value={snapshot.id}>
                                {formatSnapshotOptionLabel(snapshot)}
                              </option>
                            ))}
                          </select>
                        ) : null}
                        <a
                          href={`/drafts/${encodeURIComponent(selectedRightDraftId)}?historyAsset=${encodeURIComponent(selectedAsset)}${selectedRightSnapshotId ? `&historySnapshot=${encodeURIComponent(selectedRightSnapshotId)}` : rightLatestSnapshotId ? `&historySnapshot=${encodeURIComponent(rightLatestSnapshotId)}` : ''}`}
                          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                        >
                          {rightLatestSnapshotId ? 'View right snapshot diff' : 'View right history'}
                        </a>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Promotion copies the selected asset plus that asset&apos;s saved score and note. Draft-level
                      reviewer summaries stay on the target draft. Direct promote targets the live draft only, not a
                      restore-point view.
                    </span>
                  </div>
                </DraftAssetComparisonDetail>
              )}
            </>
          )}

          <div className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
            Merge branches can now carry a staged set of assets with their saved review context. Alternate revision
            storage and timeline-aware merge history are still planned.
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}

export default DraftComparisonPanel;
