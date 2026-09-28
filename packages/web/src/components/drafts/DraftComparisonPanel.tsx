import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, GitBranch, GitCompare, Loader2, MoveLeft, MoveRight } from 'lucide-react';
import { api } from '@/lib/api';
import type { Draft, DraftMetadata } from '@char-gen/shared';
import { buildDraftRevisionSnapshotState } from '@/lib/drafts/revision-snapshots';
import CollapsibleSection from '../common/CollapsibleSection';
import { cn } from '../../utils/cn';

export interface DraftComparisonPanelProps {
  leftDraftId?: string;
  rightDraftId?: string;
  draftOptions?: DraftMetadata[];
  onLeftDraftChange?: (draftId: string) => void;
  onRightDraftChange?: (draftId: string) => void;
}

function countChangedLines(left: string, right: string): number {
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

interface DraftReviewSummary {
  hasReview: boolean;
  reviewerSummary: string;
  scoredAssetCount: number;
  notedAssetCount: number;
  lowScoreEntries: Array<{ assetName: string; score: number }>;
  updatedAt?: string;
}

interface AssetReviewState {
  score?: number;
  note: string;
  hasReview: boolean;
}

interface MergeCandidateAsset {
  assetName: string;
  source: 'left' | 'right' | 'either';
  reason: 'content-drift' | 'review-drift' | 'left-only' | 'right-only';
}

type DraftComparisonState = ReturnType<typeof buildDraftRevisionSnapshotState> & {
  label: string;
  origin: 'current' | 'snapshot';
};

function buildDraftReviewSummary(reviewState: {
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

function getAssetReviewState(
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

function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ');
}

function summarizeText(content: string, maxLength = 120): string {
  const trimmed = content.replace(/\s+/g, ' ').trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatSnapshotOptionLabel(snapshot: NonNullable<DraftMetadata['revision_snapshots']>[number]) {
  const timestamp = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(snapshot.created_at));

  return `${snapshot.label || 'Restore point'} · ${timestamp}`;
}

function buildDraftMergeProvenance(options: {
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

function buildDraftMergeHistoryEvent(
  options: Parameters<typeof buildDraftMergeProvenance>[0],
): NonNullable<DraftMetadata['merge_history']>[number] {
  const cryptoLike = globalThis as { crypto?: { randomUUID?: () => string } };

  return {
    id: cryptoLike.crypto?.randomUUID?.() ?? `merge-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    ...buildDraftMergeProvenance(options),
  };
}

function appendDraftMergeHistory(
  existingEntries: DraftMetadata['merge_history'] | undefined,
  entry: NonNullable<DraftMetadata['merge_history']>[number],
): NonNullable<DraftMetadata['merge_history']> {
  return [entry, ...(existingEntries ?? []).filter((existing) => existing.id !== entry.id)];
}

function buildDraftMergeResolutionDetails(
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

function buildComparisonState(draft: Draft | undefined, snapshotId: string): DraftComparisonState | null {
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

function buildBranchCreateRequest(
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

function buildPromotedReviewAnnotations(
  sourceMetadata: DraftMetadata,
  targetMetadata: DraftMetadata,
  assetName: string,
) {
  return buildPromotedReviewAnnotationsForAssets(sourceMetadata, targetMetadata, [assetName]);
}

function buildPromotedReviewAnnotationsForAssets(
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
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0 rounded-md border border-border p-3">
              <div className="font-medium text-foreground">
                {comparison.leftState.character_name || comparison.leftState.seed}
              </div>
              <div className="mt-1 break-words text-xs">
                {comparison.leftState.template_name || 'Default Template'} ·{' '}
                {comparison.leftState.mode || 'Unknown mode'}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Comparing {comparison.leftState.label}</div>
              {leftReviewSummary && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {leftReviewSummary.hasReview
                    ? `${leftReviewSummary.scoredAssetCount} scored · ${leftReviewSummary.notedAssetCount} noted${leftReviewSummary.updatedAt ? ` · reviewed ${new Date(leftReviewSummary.updatedAt).toLocaleDateString()}` : ''}`
                    : 'No saved review context'}
                </div>
              )}
              <button
                type="button"
                onClick={() => createBranchMutation.mutate('left')}
                disabled={createBranchMutation.isPending}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                <GitBranch className="h-3.5 w-3.5" />
                Branch left draft
              </button>
              {leftDraft.data?.metadata.revision_snapshots?.length ? (
                <select
                  value={selectedLeftSnapshotId}
                  onChange={(event) => setSelectedLeftSnapshotId(event.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
                >
                  <option value="">Current draft</option>
                  {leftDraft.data.metadata.revision_snapshots.slice(0, 6).map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {formatSnapshotOptionLabel(snapshot)}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
            <div className="min-w-0 rounded-md border border-border p-3">
              <div className="font-medium text-foreground">
                {comparison.rightState.character_name || comparison.rightState.seed}
              </div>
              <div className="mt-1 break-words text-xs">
                {comparison.rightState.template_name || 'Default Template'} ·{' '}
                {comparison.rightState.mode || 'Unknown mode'}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">Comparing {comparison.rightState.label}</div>
              {rightReviewSummary && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {rightReviewSummary.hasReview
                    ? `${rightReviewSummary.scoredAssetCount} scored · ${rightReviewSummary.notedAssetCount} noted${rightReviewSummary.updatedAt ? ` · reviewed ${new Date(rightReviewSummary.updatedAt).toLocaleDateString()}` : ''}`
                    : 'No saved review context'}
                </div>
              )}
              <button
                type="button"
                onClick={() => createBranchMutation.mutate('right')}
                disabled={createBranchMutation.isPending}
                className="mt-3 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                <GitBranch className="h-3.5 w-3.5" />
                Branch right draft
              </button>
              {rightDraft.data?.metadata.revision_snapshots?.length ? (
                <select
                  value={selectedRightSnapshotId}
                  onChange={(event) => setSelectedRightSnapshotId(event.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
                >
                  <option value="">Current draft</option>
                  {rightDraft.data.metadata.revision_snapshots.slice(0, 6).map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {formatSnapshotOptionLabel(snapshot)}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          </div>

          {branchError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {branchError}
            </div>
          )}

          {branchNotice && (
            <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
              {branchNotice}
            </div>
          )}

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
                <div className="mt-2 text-amber-700 dark:text-amber-300">
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
                <div className="mt-2 text-amber-700 dark:text-amber-300">
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
              <div className="rounded-md border border-border p-3">
                <div className="font-medium text-foreground">Compare asset</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {comparison.sharedAssets.map((asset) => {
                    const isDifferent = comparison.differentAssets.includes(asset);
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => setSelectedAsset(asset)}
                        className={cn(
                          'app-pill transition-colors',
                          selectedAsset === asset
                            ? 'app-pill-emerald'
                            : isDifferent
                              ? 'app-pill-amber'
                              : 'app-pill-muted',
                        )}
                      >
                        {asset}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-md border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">Merge branch set</span>
                    <span>{stagedMergeAssets.length} staged</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mergeCandidateAssets.length > 0 ? (
                      mergeCandidateAssets.map(({ assetName, source, reason }) => {
                        const isStaged = stagedMergeAssets.includes(assetName);
                        const helperLabel =
                          source === 'left'
                            ? 'Left only'
                            : source === 'right'
                              ? 'Right only'
                              : reason === 'review-drift'
                                ? 'Review drift'
                                : 'Content drift';
                        return (
                          <button
                            key={`merge-${assetName}`}
                            type="button"
                            onClick={() => toggleStagedMergeAsset(assetName)}
                            className={cn(
                              'app-pill transition-colors',
                              isStaged ? 'app-pill-emerald' : 'app-pill-muted',
                            )}
                          >
                            {isStaged ? 'Staged' : 'Stage'} {assetName} · {helperLabel}
                          </button>
                        );
                      })
                    ) : (
                      <span>No merge candidates available yet.</span>
                    )}
                  </div>
                  {stagedMergeAssets.length > 0 && (
                    <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
                      <div className="text-xs font-medium text-foreground">Merge manifest</div>
                      <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                        {stagedMergeManifest.map(({ assetName, source, reason }) => (
                          <div
                            key={`manifest-${assetName}`}
                            className="rounded-md border border-border/50 bg-background/60 px-3 py-2"
                          >
                            <div className="font-medium text-foreground">{formatAssetLabel(assetName)}</div>
                            <div className="mt-1">
                              {source === 'either'
                                ? reason === 'review-drift'
                                  ? 'Shared asset with review drift.'
                                  : 'Shared asset with content drift.'
                                : `Unique ${source} asset that will be copied into the new branch.`}
                            </div>
                          </div>
                        ))}
                        <div>
                          Staged branch merges apply the selected assets plus their saved scores and notes onto a fresh
                          branch copy of the target side.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedAsset && (
                <div className="space-y-3 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{selectedAsset}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {selectedLeftAssetContent === selectedRightAssetContent
                          ? 'No content differences.'
                          : `${changedLines} changed lines detected.`}
                      </div>
                    </div>
                    {mergeCandidateAssets.some((entry) => entry.assetName === selectedAsset) && (
                      <button
                        type="button"
                        onClick={() => toggleStagedMergeAsset(selectedAsset)}
                        className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                      >
                        {stagedMergeAssets.includes(selectedAsset) ? 'Remove from merge set' : 'Stage for merge'}
                      </button>
                    )}
                  </div>

                  {selectedAssetReviewComparison?.hasDifferences && (
                    <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div>
                          Saved review context differs for this asset. Use the score and note drift here as merge
                          groundwork before promoting one version over the other.
                        </div>
                      </div>
                    </div>
                  )}

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

                  {promotionError && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {promotionError}
                    </div>
                  )}

                  {promotionNotice && (
                    <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                      {promotionNotice}
                    </div>
                  )}

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="min-w-0 space-y-2">
                      <div className="text-xs font-medium text-foreground">Left</div>
                      <div className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                        <div>
                          Score:{' '}
                          {selectedAssetReviewComparison?.leftReview.score
                            ? `${selectedAssetReviewComparison.leftReview.score}/5`
                            : 'Unrated'}
                        </div>
                        <div className="mt-1">
                          Note:{' '}
                          {selectedAssetReviewComparison?.leftReview.note
                            ? summarizeText(selectedAssetReviewComparison.leftReview.note, 140)
                            : 'No asset note saved.'}
                        </div>
                      </div>
                      <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-xs whitespace-pre-wrap break-words">
                        {selectedLeftAssetContent || '(Asset missing)'}
                      </pre>
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="text-xs font-medium text-foreground">Right</div>
                      <div className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                        <div>
                          Score:{' '}
                          {selectedAssetReviewComparison?.rightReview.score
                            ? `${selectedAssetReviewComparison.rightReview.score}/5`
                            : 'Unrated'}
                        </div>
                        <div className="mt-1">
                          Note:{' '}
                          {selectedAssetReviewComparison?.rightReview.note
                            ? summarizeText(selectedAssetReviewComparison.rightReview.note, 140)
                            : 'No asset note saved.'}
                        </div>
                      </div>
                      <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-xs whitespace-pre-wrap break-words">
                        {selectedRightAssetContent || '(Asset missing)'}
                      </pre>
                    </div>
                  </div>
                </div>
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
