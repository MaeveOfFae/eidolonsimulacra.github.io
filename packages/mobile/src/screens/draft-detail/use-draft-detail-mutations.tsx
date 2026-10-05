/**
 * The draft detail mutations: every write the screen can make — the metadata and asset
 * edits, the archives and deletes, the snapshots and restores — and the safeguard
 * snapshot they share.
 *
 * Split out of `use-draft-detail-state` verbatim, with the state it works on taken as a
 * parameter so the screen composes it after the state and before the handlers.
 */

import { useMemo } from 'react';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { decideAssetApproval, type DraftAssetApprovalStatus, type DraftAssetReviewScore } from '@char-gen/shared';
import { api } from '../../config/api';
import { resolveDraftArchiveAction } from '../../lib/draft-archive';
import { buildAssetApprovalDecision } from '../../lib/review-approval';
import { getErrorMessage } from '../../utils/errors';
import {
  formatAssetLabel,
  stripSavedIntrosBlock,
  parseSavedIntros,
  buildRevertedReviewAnnotations,
  isVisibleDraftAsset,
} from '../../lib/draft-detail-helpers';
import type { AssetEntry, AssetNoteMap, AssetScoreMap } from './use-draft-detail-state';
import type { useDraftDetailState } from './use-draft-detail-state';

export function useDraftDetailMutations({
  draft,
  draftId,
  invalidateDraftQueries,
  navigation,
  queryClient,
  reviewAssetNotesDraft,
  reviewAssetScoresDraft,
  reviewNotesDraft,
  setEditModalVisible,
  setReviewSaveFeedback,
  templates,
}: Pick<
  ReturnType<typeof useDraftDetailState>,
  | 'draft'
  | 'draftId'
  | 'invalidateDraftQueries'
  | 'navigation'
  | 'queryClient'
  | 'reviewAssetNotesDraft'
  | 'reviewAssetScoresDraft'
  | 'reviewNotesDraft'
  | 'setEditModalVisible'
  | 'setReviewSaveFeedback'
  | 'templates'
>) {
  const createSafeguardSnapshot = async (label: string, reason: string) => {
    await api.createDraftSnapshot(draftId, { label, reason });
  };

  const template = useMemo(
    () => templates.find((entry) => entry.name === draft?.metadata.template_name),
    [draft?.metadata.template_name, templates],
  );

  const assetEntries = useMemo((): AssetEntry[] => {
    if (!draft) {
      return [];
    }

    const entries: AssetEntry[] = [];
    const seenAssets = new Set<string>();

    if (template) {
      for (const asset of template.assets) {
        entries.push({
          name: asset.name,
          exists: Object.prototype.hasOwnProperty.call(draft.assets, asset.name),
          required: asset.required,
          description: asset.description,
        });
        seenAssets.add(asset.name);
      }
    }

    for (const assetName of Object.keys(draft.assets)) {
      if (seenAssets.has(assetName) || !isVisibleDraftAsset(assetName)) {
        continue;
      }

      entries.push({
        name: assetName,
        exists: true,
      });
    }

    return entries;
  }, [draft, template]);

  const savedIntros = useMemo(() => parseSavedIntros(draft?.metadata.notes), [draft?.metadata.notes]);
  const visibleNotes = useMemo(() => stripSavedIntrosBlock(draft?.metadata.notes), [draft?.metadata.notes]);
  const hasIntroScene = Boolean(draft?.assets.intro_scene);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      if (!draft) {
        return null;
      }

      await createSafeguardSnapshot('Before favorite toggle', 'pre-favorite-toggle');
      return api.updateMetadata(draftId, { favorite: !draft.metadata.favorite });
    },
    onSuccess: () => {
      invalidateDraftQueries();
    },
  });

  const updateMetadataMutation = useMutation({
    mutationFn: async (metadata: Parameters<typeof api.updateMetadata>[1]) => {
      if (!draft) {
        return { skipped: true as const };
      }

      const currentComparable = {
        character_name: draft.metadata.character_name ?? undefined,
        genre: draft.metadata.genre ?? undefined,
        tags: draft.metadata.tags ?? undefined,
        notes: draft.metadata.notes ?? undefined,
      };
      const nextComparable = {
        character_name: metadata.character_name ?? undefined,
        genre: metadata.genre ?? undefined,
        tags: metadata.tags ?? undefined,
        notes: metadata.notes ?? undefined,
      };

      if (JSON.stringify(currentComparable) === JSON.stringify(nextComparable)) {
        return { skipped: true as const };
      }

      await createSafeguardSnapshot('Before metadata update', 'pre-metadata-update');
      await api.updateMetadata(draftId, metadata);
      return { skipped: false as const };
    },
    onSuccess: () => {
      invalidateDraftQueries();
      setEditModalVisible(false);
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to update metadata'));
    },
  });

  const hiddenNotesMutation = useMutation({
    mutationFn: async (notes: string | undefined) => {
      if (!draft) {
        return { skipped: true as const };
      }

      const nextNotes = notes ?? undefined;
      if ((draft.metadata.notes ?? undefined) === nextNotes) {
        return { skipped: true as const };
      }

      await createSafeguardSnapshot('Before saved intro update', 'pre-saved-intro-update');
      await api.updateMetadata(draftId, { notes: nextNotes });
      return { skipped: false as const };
    },
    onSuccess: () => {
      invalidateDraftQueries();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      navigation.goBack();
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to delete draft'));
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!draft) {
        return null;
      }

      const action = resolveDraftArchiveAction(draft.metadata);

      await createSafeguardSnapshot(action.snapshotLabel, action.snapshotReason);

      return action.kind === 'restore' ? api.restoreDraft(draftId) : api.archiveDraft(draftId);
    },
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      invalidateDraftQueries();
      queryClient.invalidateQueries({ queryKey: ['drafts', 'archived'] });
      Alert.alert(
        result.status === 'restored' ? 'Draft restored' : 'Draft archived',
        result.status === 'restored'
          ? 'The character is back in the active library. A safeguard restore point was saved first.'
          : 'The character moved to the archive. Restore it from the Archived filter in the drafts list.',
      );
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to update archive state'));
    },
  });

  const createSnapshotMutation = useMutation({
    mutationFn: async () =>
      api.createDraftSnapshot(draftId, {
        label: draft?.metadata.character_name
          ? `${draft.metadata.character_name} restore point`
          : 'Manual restore point',
        reason: 'mobile-manual',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      Alert.alert('Restore point saved', 'Mobile saved the current draft state as a restore point.');
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to save restore point'));
    },
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: string) => api.restoreDraftSnapshot(draftId, snapshotId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      Alert.alert(
        'Restore point applied',
        'The previous draft state was saved as a safeguard restore point before applying this snapshot.',
      );
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to restore snapshot'));
    },
  });

  const revertMergedAssetMutation = useMutation({
    mutationFn: async ({ eventId, assetName }: { eventId: string; assetName: string }) => {
      if (!draft) {
        return null;
      }

      const currentDraft = await api.getDraft(draft.metadata.review_id);
      const mergeEntry =
        currentDraft.metadata.merge_history?.find((entry) => entry.id === eventId) ??
        (currentDraft.metadata.merge_provenance && eventId === 'merge-provenance'
          ? { id: 'merge-provenance', ...currentDraft.metadata.merge_provenance }
          : null);
      if (!mergeEntry?.undo_snapshot_id) {
        throw new Error('This merge event does not have a safeguard snapshot to restore from.');
      }

      const resolution = mergeEntry.asset_resolutions?.find((entry) => entry.asset_name === assetName);
      if (!resolution?.target_previously_had_asset) {
        throw new Error('This asset was added by the merge. Use the full merge undo to remove it cleanly.');
      }

      const undoSnapshot = currentDraft.metadata.revision_snapshots?.find(
        (snapshot) => snapshot.id === mergeEntry.undo_snapshot_id,
      );
      if (!undoSnapshot) {
        throw new Error('The safeguard snapshot for this merge event is no longer available.');
      }

      const previousHasAsset = Object.prototype.hasOwnProperty.call(undoSnapshot.state.assets, assetName);
      if (!previousHasAsset) {
        throw new Error('This asset did not exist before the merge. Use the full merge undo to remove it cleanly.');
      }

      const currentHasAsset = Object.prototype.hasOwnProperty.call(currentDraft.assets, assetName);
      const previousContent = undoSnapshot.state.assets[assetName] ?? '';
      const nextAnnotations = buildRevertedReviewAnnotations(
        currentDraft.metadata.review_annotations,
        undoSnapshot.state.review_annotations,
        assetName,
      );

      await createSafeguardSnapshot(
        `Before reverting ${formatAssetLabel(assetName)}`,
        `pre-merge-asset-revert:${assetName}`,
      );
      await api.updateAsset(draft.metadata.review_id, assetName, previousContent);
      await api.updateMetadata(draft.metadata.review_id, {
        review_annotations: nextAnnotations,
      });

      return { assetName, currentHasAsset };
    },
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      invalidateDraftQueries();
      Alert.alert('Asset reverted', `${formatAssetLabel(result.assetName)} returned to its pre-merge state.`);
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to revert merged asset'));
    },
  });

  const saveReviewAnnotationsMutation = useMutation({
    mutationFn: async () => {
      if (!draft) {
        return null;
      }

      const currentAnnotations = draft.metadata.review_annotations;
      const validAssetNames = new Set(Object.keys(draft.assets).filter(isVisibleDraftAsset));
      const cleanedNotes = reviewNotesDraft.trim();
      const cleanedScores = Object.fromEntries(
        Object.entries(reviewAssetScoresDraft)
          .filter(
            ([assetName, score]) =>
              validAssetNames.has(assetName) && Number.isFinite(score) && score >= 1 && score <= 5,
          )
          .map(([assetName, score]) => [assetName, Math.round(score) as DraftAssetReviewScore] as const),
      ) as AssetScoreMap;
      const cleanedAssetNotes = Object.fromEntries(
        Object.entries(reviewAssetNotesDraft)
          .map(([assetName, note]) => [assetName, note.trim()] as const)
          .filter(([assetName, note]) => validAssetNames.has(assetName) && note.length > 0),
      ) as AssetNoteMap;

      const nextAnnotations =
        cleanedNotes || Object.keys(cleanedScores).length > 0 || Object.keys(cleanedAssetNotes).length > 0
          ? {
              ...(cleanedNotes ? { notes: cleanedNotes } : {}),
              ...(Object.keys(cleanedScores).length > 0 ? { asset_scores: cleanedScores } : {}),
              ...(Object.keys(cleanedAssetNotes).length > 0 ? { asset_notes: cleanedAssetNotes } : {}),
              updated_at: new Date().toISOString(),
            }
          : undefined;

      if (JSON.stringify(currentAnnotations ?? null) === JSON.stringify(nextAnnotations ?? null)) {
        return { skipped: true as const };
      }

      await api.createDraftSnapshot(draftId, {
        label: 'Before review annotation update',
        reason: 'pre-review-annotation-update',
      });

      await api.updateMetadata(draftId, {
        review_annotations: nextAnnotations,
      });

      return { skipped: false as const };
    },
    onSuccess: (result) => {
      if (result?.skipped) {
        setReviewSaveFeedback('No review changes to save.');
        return;
      }

      setReviewSaveFeedback('Review notes saved.');
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: (error: unknown) => {
      setReviewSaveFeedback(getErrorMessage(error, 'Failed to save review notes'));
    },
  });

  const saveAssetApprovalMutation = useMutation({
    mutationFn: async (variables: { assetName: string; status: DraftAssetApprovalStatus }) => {
      if (!draft) {
        return null;
      }

      // The shared engine records the decision against a fingerprint of the asset's
      // current content, which is what makes an approval go stale the moment the
      // asset is regenerated or edited — so mobile never has to police that itself.
      const nextAnnotations = decideAssetApproval(
        draft,
        variables.assetName,
        buildAssetApprovalDecision(draft, variables.assetName, variables.status),
      );

      await api.createDraftSnapshot(draftId, {
        label: `Before ${
          variables.status === 'approved' ? 'approving' : 'requesting changes on'
        } ${formatAssetLabel(variables.assetName)}`,
        reason: 'pre-asset-approval',
      });

      await api.updateMetadata(draftId, {
        review_annotations: nextAnnotations,
      });

      return variables;
    },
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to save the approval decision'));
    },
  });

  return {
    archiveMutation,
    assetEntries,
    createSafeguardSnapshot,
    createSnapshotMutation,
    deleteMutation,
    hasIntroScene,
    hiddenNotesMutation,
    restoreSnapshotMutation,
    revertMergedAssetMutation,
    saveAssetApprovalMutation,
    saveReviewAnnotationsMutation,
    savedIntros,
    template,
    toggleFavorite,
    updateMetadataMutation,
    visibleNotes,
  };
}
