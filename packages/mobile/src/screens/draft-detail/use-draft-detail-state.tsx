/**
 * The draft detail screen's helpers and state: the asset and review-annotation types,
 * the saved-intro parsing, the export tables, and everything the screen keeps in state
 * — the draft queries and mutations, the review editors, the comparison and lineage
 * data, and the export flow.
 *
 * Cut out of `DraftDetailScreen` verbatim — the screen keeps its JSX and destructures
 * what it renders, so the two halves cannot drift: a name the JSX needs is either on
 * this hook's return or a typecheck error.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotDiffCandidateAssets,
  buildDraftSnapshotDiffModelFromStates,
  buildDraftSnapshotDiffSummaryFromStates,
  buildExportReadinessSummary,
  decideAssetApproval,
  type DraftAssetApprovalStatus,
  type DraftAssetReviewScore,
  type DraftMetadata,
  type ExportFormat,
} from '@char-gen/shared';
import { api } from '../../config/api';
import { useTheme } from '../../theme/ThemeProvider';
import {
  getMobileCompareSelection,
  setMobileCompareSelection,
  type MobileCompareSelection,
} from '../../lib/compare-selection';
import { resolveDraftArchiveAction } from '../../lib/draft-archive';
import { buildAssetApprovalDecision, buildMobileApprovalQueue } from '../../lib/review-approval';
import type { DraftDetailRouteProp, DraftsStackNavigationProp } from '../../types/navigation';
import { getErrorMessage } from '../../utils/errors';
import { pickCharacterImportFile, saveDownload } from '../../utils/file-transfer';
import { buildStyles } from '../draft-detail/styles';
import {
  EXPORT_EXTENSIONS,
  EXPORT_LABELS,
  formatAssetLabel,
  stripSavedIntrosBlock,
  parseSavedIntros,
  mergeNotesWithSavedIntros,
  createIntroCandidate,
  summarizeText,
  formatTimestamp,
  buildRevertedReviewAnnotations,
  isVisibleDraftAsset,
  describeGenerationStage,
} from '../../lib/draft-detail-helpers';

export type AssetEntry = {
  name: string;
  exists: boolean;
  required?: boolean;
  description?: string;
};

export type IntroCandidate = {
  id: string;
  content: string;
  timestamp: number;
};

export type AssetScoreMap = Record<string, DraftAssetReviewScore>;

export type AssetNoteMap = Record<string, string>;

export function useDraftDetailState() {
  const navigation = useNavigation<DraftsStackNavigationProp<'DraftDetail'>>();
  const route = useRoute<DraftDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
  const { draftId, historySnapshotId } = route.params;
  const modalBottomPadding = 24 + insets.bottom + tabBarHeight;

  // Metadata editing state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGenre, setEditGenre] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [refineModalVisible, setRefineModalVisible] = useState(false);
  const [introModalVisible, setIntroModalVisible] = useState(false);
  const [exportTrayExpanded, setExportTrayExpanded] = useState(false);
  const [selectedRefineAsset, setSelectedRefineAsset] = useState('');
  const [refineRequest, setRefineRequest] = useState('');
  const [refinePreview, setRefinePreview] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [isApplyingRefinement, setIsApplyingRefinement] = useState(false);
  const [refineStatusText, setRefineStatusText] = useState('');
  const [assetEditorVisible, setAssetEditorVisible] = useState(false);
  const [editingAssetName, setEditingAssetName] = useState('');
  const [editingAssetContent, setEditingAssetContent] = useState('');
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [introInstructions, setIntroInstructions] = useState('');
  const [generatedIntro, setGeneratedIntro] = useState<IntroCandidate | null>(null);
  const [isGeneratingIntro, setIsGeneratingIntro] = useState(false);
  const [isPersistingIntro, setIsPersistingIntro] = useState(false);
  const [introGenerationStage, setIntroGenerationStage] = useState('');
  const [selectedSnapshotId, setSelectedSnapshotId] = useState('');
  const [compareSnapshotId, setCompareSnapshotId] = useState('');
  const [selectedSnapshotAssetName, setSelectedSnapshotAssetName] = useState('');
  const [pendingCompareSelection, setPendingCompareSelection] = useState<MobileCompareSelection | null>(() =>
    getMobileCompareSelection(),
  );
  const [reviewNotesDraft, setReviewNotesDraft] = useState('');
  const [reviewAssetScoresDraft, setReviewAssetScoresDraft] = useState<AssetScoreMap>({});
  const [reviewAssetNotesDraft, setReviewAssetNotesDraft] = useState<AssetNoteMap>({});
  const [reviewSaveFeedback, setReviewSaveFeedback] = useState<string | null>(null);
  const introAbortRef = useRef<(() => void) | null>(null);
  const introCancelRequestedRef = useRef(false);

  const {
    data: draft,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['draft', draftId],
    queryFn: () => api.getDraft(decodeURIComponent(draftId)),
    enabled: !!draftId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const { data: draftListData } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
    enabled: Boolean(draftId),
  });

  const validationQuery = useQuery({
    queryKey: ['draft', draftId, 'mobile-export-readiness-validation'],
    queryFn: () => api.validateDraft(draftId),
    enabled: Boolean(draftId),
  });

  const invalidateDraftQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
    queryClient.invalidateQueries({ queryKey: ['drafts'] });
    queryClient.invalidateQueries({ queryKey: ['draft', draftId, 'mobile-export-readiness-validation'] });
  };

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

  const handleDelete = () => {
    Alert.alert(
      'Delete Character',
      `Delete "${draft?.metadata.character_name || 'this character'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ],
    );
  };

  const handleArchive = () => {
    if (!draft) {
      return;
    }

    const action = resolveDraftArchiveAction(draft.metadata);

    Alert.alert(action.confirmationTitle, action.confirmationMessage, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: action.actionLabel,
        onPress: () => archiveMutation.mutate(),
      },
    ]);
  };

  const handleCompareDraft = () => {
    if (!draft) {
      return;
    }

    const currentSelection = getMobileCompareSelection();
    if (currentSelection?.character1Id && currentSelection.character1Id !== draftId) {
      navigation.navigate('Home', {
        screen: 'Compare',
        params: {
          character1: currentSelection.character1Id,
          character2: draftId,
        },
      });
      return;
    }

    const nextSelection = {
      character1Id: draftId,
      character1Name: draft.metadata.character_name || draft.metadata.seed,
    } satisfies MobileCompareSelection;

    setMobileCompareSelection(nextSelection);
    setPendingCompareSelection(nextSelection);
    navigation.navigate('Home', {
      screen: 'Compare',
      params: { character1: draftId },
    });
  };

  const resetReviewAnnotations = useCallback(() => {
    const annotations = draft?.metadata.review_annotations;
    setReviewNotesDraft(annotations?.notes ?? '');
    setReviewAssetScoresDraft(annotations?.asset_scores ?? {});
    setReviewAssetNotesDraft(annotations?.asset_notes ?? {});
    setReviewSaveFeedback(null);
  }, [draft?.metadata.review_annotations]);

  const setReviewAssetScore = (assetName: string, score?: DraftAssetReviewScore) => {
    setReviewAssetScoresDraft((current) => {
      const next = { ...current };
      if (!score) {
        delete next[assetName];
        return next;
      }

      next[assetName] = score;
      return next;
    });
    setReviewSaveFeedback(null);
  };

  const setReviewAssetNote = (assetName: string, note: string) => {
    setReviewAssetNotesDraft((current) => ({
      ...current,
      [assetName]: note,
    }));
    setReviewSaveFeedback(null);
  };

  const executeExportPreset = async (preset: ExportFormat) => {
    try {
      if (!draft) {
        return;
      }

      const download = await api.exportDraft({
        draft_id: draftId,
        preset,
        include_metadata: preset !== 'text',
      });
      const result = await saveDownload(
        download,
        `${draft.metadata.character_name || draft.metadata.review_id}.${EXPORT_EXTENSIONS[preset]}`,
      );

      if (!result.saved) {
        return;
      }

      const label = EXPORT_LABELS[preset];
      Alert.alert(
        'Export ready',
        `${label} file prepared. Save it from the system share sheet to Files, Downloads, or another destination.`,
      );
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export character'));
    }
  };

  const handleExportPreset = (preset: ExportFormat) => {
    if (exportReadiness.requiresAcknowledgement) {
      Alert.alert('Export warnings', exportReadiness.blockingWarnings.join('\n\n'), [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export anyway',
          onPress: () => {
            void executeExportPreset(preset);
          },
        },
      ]);
      return;
    }

    void executeExportPreset(preset);
  };

  const handleCopyAsset = async (assetName: string, content: string) => {
    await Clipboard.setStringAsync(content);
    Alert.alert('Copied', `${assetName.replace(/_/g, ' ')} copied to clipboard`);
  };

  const handleAttachCardImage = async () => {
    try {
      if (!draft) {
        return;
      }

      const file = await pickCharacterImportFile();
      if (!file) {
        return;
      }

      const lowerName = file.name.toLowerCase();
      if (!lowerName.endsWith('.png')) {
        Alert.alert('PNG only', 'Only PNG images can be attached for PNG card export.');
        return;
      }

      if (!(file.payload instanceof ArrayBuffer)) {
        Alert.alert('PNG only', 'Expected binary PNG data but received text input.');
        return;
      }

      const bytes = new Uint8Array(file.payload);
      let base64 = '';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
      for (let index = 0; index < bytes.length; index += 3) {
        const a = bytes[index]!;
        const b = index + 1 < bytes.length ? bytes[index + 1]! : 0;
        const c = index + 2 < bytes.length ? bytes[index + 2]! : 0;
        const trio = (a << 16) | (b << 8) | c;
        base64 += chars[(trio >> 18) & 0x3f];
        base64 += chars[(trio >> 12) & 0x3f];
        base64 += index + 1 < bytes.length ? chars[(trio >> 6) & 0x3f] : '=';
        base64 += index + 2 < bytes.length ? chars[trio & 0x3f] : '=';
      }
      const dataUrl = `data:image/png;base64,${base64}`;

      if (draft.assets.card_image !== dataUrl || draft.metadata.card_metadata?.avatar !== dataUrl) {
        await createSafeguardSnapshot('Before card image attach', 'pre-card-image-attach');
      }

      await api.updateAsset(draftId, 'card_image', dataUrl);
      await api.updateMetadata(draftId, {
        card_metadata: {
          ...(draft.metadata.card_metadata ?? {}),
          avatar: dataUrl,
        },
      });
      invalidateDraftQueries();
      Alert.alert('Image attached', 'PNG card image attached for standard PNG export.');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to attach PNG image'));
    }
  };

  const handleClearCardImage = async () => {
    try {
      if (!draft) {
        return;
      }

      if (draft.assets.card_image) {
        await api.updateAsset(draftId, 'card_image', '');
      }

      if (draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) {
        const nextCardMetadata = { ...(draft.metadata.card_metadata ?? {}) };
        delete nextCardMetadata.avatar;
        await createSafeguardSnapshot('Before card image clear', 'pre-card-image-clear');
        await api.updateMetadata(draftId, {
          card_metadata: Object.keys(nextCardMetadata).length > 0 ? nextCardMetadata : undefined,
        });
      } else if (draft.assets.card_image) {
        await createSafeguardSnapshot('Before card image clear', 'pre-card-image-clear');
      }

      if (draft.assets.card_image) {
        await api.updateAsset(draftId, 'card_image', '');
      }

      invalidateDraftQueries();
      Alert.alert('Image cleared', 'Removed the attached PNG card image.');
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to clear PNG image'));
    }
  };

  const handleCancelIntroGeneration = () => {
    if (!isGeneratingIntro) {
      return;
    }

    introCancelRequestedRef.current = true;
    introAbortRef.current?.();
    introAbortRef.current = null;
    setIsGeneratingIntro(false);
    setIntroGenerationStage('');
    setGeneratedIntro(null);
  };

  const closeIntroModal = () => {
    if (isPersistingIntro) {
      return;
    }

    if (isGeneratingIntro) {
      handleCancelIntroGeneration();
    }

    setIntroModalVisible(false);
    setIntroInstructions('');
    setIntroGenerationStage('');
    setGeneratedIntro(null);
  };

  const handleOpenIntroModal = () => {
    if (!draft?.assets.intro_scene) {
      Alert.alert('No intro scene', 'This draft does not have an intro scene to extend yet.');
      return;
    }

    introCancelRequestedRef.current = false;
    introAbortRef.current = null;
    setIntroInstructions('');
    setIntroGenerationStage('');
    setGeneratedIntro(null);
    setIntroModalVisible(true);
  };

  const persistSavedIntros = async (nextIntros: IntroCandidate[]) => {
    await hiddenNotesMutation.mutateAsync(mergeNotesWithSavedIntros(draft?.metadata.notes, nextIntros));
  };

  const handleGenerateAdditionalIntro = async () => {
    if (!draft || isGeneratingIntro || isPersistingIntro) {
      return;
    }

    if (!draft.metadata.template_name) {
      Alert.alert('Template unavailable', 'Additional intros need a saved template on this draft.');
      return;
    }

    setIsGeneratingIntro(true);
    setIntroGenerationStage('Preparing intro scene generation...');
    setGeneratedIntro(null);
    introCancelRequestedRef.current = false;

    try {
      const stream = api.generateAssetVariant({
        draft_id: draftId,
        asset_name: 'intro_scene',
        additional_instructions: introInstructions.trim() ? [introInstructions.trim()] : undefined,
      });
      introAbortRef.current = () => stream.abort();

      let nextContent = '';
      stream.subscribe((event) => {
        if (event.event === 'status' && 'stage' in event.data) {
          const data = event.data as { stage?: string; progress?: number; asset?: string };
          if (data.stage) {
            setIntroGenerationStage(describeGenerationStage(data.stage, data.progress, data.asset));
          }
        }
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          nextContent += data.content;
          setGeneratedIntro(createIntroCandidate(nextContent));
        }
      });

      stream.onError_((streamError) => {
        introAbortRef.current = null;
        if (introCancelRequestedRef.current) {
          introCancelRequestedRef.current = false;
          setIntroGenerationStage('');
          return;
        }

        Alert.alert('Error', getErrorMessage(streamError, 'Failed to generate additional intro'));
        setIsGeneratingIntro(false);
        setIntroGenerationStage('');
      });

      stream.onComplete_((data) => {
        if ('content' in data) {
          const content = data.content.trim();
          if (content) {
            setGeneratedIntro(createIntroCandidate(content));
          }
        }
        introAbortRef.current = null;
        introCancelRequestedRef.current = false;
        setIsGeneratingIntro(false);
        setIntroGenerationStage('');
      });

      await stream.start();
    } catch (introError) {
      introAbortRef.current = null;
      if (introCancelRequestedRef.current) {
        introCancelRequestedRef.current = false;
        setIntroGenerationStage('');
        return;
      }

      Alert.alert('Error', getErrorMessage(introError, 'Failed to generate additional intro'));
      setIsGeneratingIntro(false);
      setIntroGenerationStage('');
    }
  };

  const handleKeepGeneratedIntro = async () => {
    if (!generatedIntro || isPersistingIntro) {
      return;
    }

    setIsPersistingIntro(true);
    try {
      const nextIntros = savedIntros.find((entry) => entry.id === generatedIntro.id)
        ? savedIntros
        : [generatedIntro, ...savedIntros];
      await persistSavedIntros(nextIntros);
      setGeneratedIntro(null);
      Alert.alert('Saved', 'Added to additional intros.');
    } catch (introError) {
      Alert.alert('Error', getErrorMessage(introError, 'Failed to save additional intro'));
    } finally {
      setIsPersistingIntro(false);
    }
  };

  const handleSetActiveIntro = async (content: string) => {
    const nextContent = content.trim();
    if (!nextContent || isPersistingIntro) {
      return;
    }

    setIsPersistingIntro(true);
    try {
      if ((draft?.assets.intro_scene ?? '').trim() !== nextContent) {
        await createSafeguardSnapshot('Before intro activation', 'pre-intro-activation');
      }

      await api.updateAsset(draftId, 'intro_scene', nextContent);
      invalidateDraftQueries();
      Alert.alert('Applied', 'Intro scene updated.');
    } catch (introError) {
      Alert.alert('Error', getErrorMessage(introError, 'Failed to apply intro scene'));
    } finally {
      setIsPersistingIntro(false);
    }
  };

  const handleRemoveSavedIntro = async (introId: string) => {
    if (isPersistingIntro) {
      return;
    }

    setIsPersistingIntro(true);
    try {
      await persistSavedIntros(savedIntros.filter((entry) => entry.id !== introId));
    } catch (introError) {
      Alert.alert('Error', getErrorMessage(introError, 'Failed to remove saved intro'));
    } finally {
      setIsPersistingIntro(false);
    }
  };

  const closeRefineModal = () => {
    if (isRefining || isApplyingRefinement) {
      return;
    }

    setRefineModalVisible(false);
    setSelectedRefineAsset('');
    setRefineRequest('');
    setRefinePreview('');
    setRefineStatusText('');
  };

  const handleRefine = (assetName?: string) => {
    if (!draft) {
      return;
    }

    const nextAsset = assetName ?? assetEntries[0]?.name ?? Object.keys(draft.assets)[0];
    if (!nextAsset) {
      Alert.alert('No assets', 'This draft has no template assets available yet.');
      return;
    }

    setSelectedRefineAsset(nextAsset);
    setRefineRequest('');
    setRefinePreview('');
    setRefineStatusText('');
    setRefineModalVisible(true);
  };

  const handleSelectRefineAsset = (assetName: string) => {
    setSelectedRefineAsset(assetName);
    setRefinePreview('');
    setRefineStatusText('');
  };

  const handleRunRefine = async () => {
    const trimmedRequest = refineRequest.trim();
    if (!selectedRefineAsset || !trimmedRequest || isRefining) {
      return;
    }

    setIsRefining(true);
    setRefinePreview('');
    setRefineStatusText('');

    const selectedAssetExists = Boolean(
      draft && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset),
    );

    try {
      const stream = selectedAssetExists
        ? api.refine({
            draft_id: draftId,
            asset: selectedRefineAsset,
            message: trimmedRequest,
          })
        : api.generateAssetVariant({
            draft_id: draftId,
            asset_name: selectedRefineAsset,
            additional_instructions: [trimmedRequest],
          });

      let nextPreview = '';
      stream.subscribe((event) => {
        if (event.event === 'status' && 'stage' in event.data) {
          const data = event.data as { stage?: string; progress?: number; asset?: string };
          if (data.stage) {
            setRefineStatusText(describeGenerationStage(data.stage, data.progress, data.asset));
          }
        }
        if (event.event === 'chunk' && 'content' in event.data) {
          const data = event.data as { content: string };
          nextPreview += data.content;
          setRefinePreview(nextPreview);
        }
      });

      stream.onError_((error) => {
        Alert.alert('Error', getErrorMessage(error, 'Failed to refine asset'));
        setIsRefining(false);
        setRefineStatusText('');
      });

      stream.onComplete_((data) => {
        if ('content' in data && data.content.trim()) {
          setRefinePreview(data.content.trim());
        }
        setIsRefining(false);
        setRefineStatusText('');
      });

      await stream.start();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to refine asset'));
      setIsRefining(false);
      setRefineStatusText('');
    }
  };

  const handleDiscardRefinement = () => {
    setRefinePreview('');
  };

  const handleApplyRefinement = async () => {
    const nextContent = refinePreview.trim();
    if (!selectedRefineAsset || !nextContent || isApplyingRefinement) {
      return;
    }

    setIsApplyingRefinement(true);
    try {
      if ((draft?.assets[selectedRefineAsset] ?? '').trim() !== nextContent) {
        await createSafeguardSnapshot(
          `Before refining ${formatAssetLabel(selectedRefineAsset)}`,
          `pre-refine:${selectedRefineAsset}`,
        );
      }

      await api.updateAsset(draftId, selectedRefineAsset, nextContent);
      invalidateDraftQueries();
      setRefineModalVisible(false);
      setSelectedRefineAsset('');
      setRefineRequest('');
      setRefinePreview('');
      Alert.alert('Applied', `${formatAssetLabel(selectedRefineAsset)} updated.`);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to apply refinement'));
    } finally {
      setIsApplyingRefinement(false);
    }
  };

  const handleOptimizeRefinement = () => {
    if (!selectedRefineAsset || !refinePreview.trim()) {
      return;
    }

    setRefineModalVisible(false);
    navigation.navigate('Home', {
      screen: 'TokenOptimization',
      params: {
        draftId,
        assetName: selectedRefineAsset,
        text: refinePreview.trim(),
      },
    });
  };

  const handleOpenEditModal = () => {
    if (draft) {
      setEditName(draft.metadata.character_name || '');
      setEditGenre(draft.metadata.genre || '');
      setEditTags(draft.metadata.tags?.join(', ') || '');
      setEditNotes(visibleNotes);
      setEditModalVisible(true);
    }
  };

  const closeAssetEditor = () => {
    if (isSavingAsset) {
      return;
    }

    setAssetEditorVisible(false);
    setEditingAssetName('');
    setEditingAssetContent('');
  };

  const handleOpenAssetEditor = (assetName: string) => {
    if (!draft) {
      return;
    }

    setEditingAssetName(assetName);
    setEditingAssetContent(draft.assets[assetName] ?? '');
    setAssetEditorVisible(true);
  };

  const handleSaveAssetEdit = async () => {
    const nextContent = editingAssetContent.trim();
    if (!editingAssetName) {
      return;
    }

    if (!nextContent) {
      Alert.alert('Content required', 'Enter asset content before saving.');
      return;
    }

    setIsSavingAsset(true);
    try {
      if ((draft?.assets[editingAssetName] ?? '').trim() !== nextContent) {
        await createSafeguardSnapshot(
          `Before editing ${formatAssetLabel(editingAssetName)}`,
          `pre-asset-edit:${editingAssetName}`,
        );
      }

      await api.updateAsset(draftId, editingAssetName, nextContent);
      invalidateDraftQueries();
      closeAssetEditor();
      Alert.alert('Saved', `${formatAssetLabel(editingAssetName)} saved.`);
    } catch (assetError) {
      Alert.alert('Error', getErrorMessage(assetError, 'Failed to save asset'));
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleSaveMetadata = () => {
    const tagsArray = editTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    updateMetadataMutation.mutate({
      character_name: editName.trim() || undefined,
      genre: editGenre.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      notes: mergeNotesWithSavedIntros(editNotes.trim() || undefined, savedIntros),
    });
  };

  const assetNames = draft ? Object.keys(draft.assets).filter(isVisibleDraftAsset) : [];
  const missingAssets = assetEntries.filter((entry) => !entry.exists);
  const missingAssetCount = assetEntries.filter((entry) => !entry.exists).length;
  const reviewAnnotations = draft?.metadata.review_annotations;
  const reviewScoreEntries = Object.entries(reviewAssetScoresDraft)
    .filter(([assetName]) => assetNames.includes(assetName))
    .sort(([left], [right]) => left.localeCompare(right));
  const reviewNoteEntries = Object.entries(reviewAssetNotesDraft)
    .map(([assetName, note]) => [assetName, note.trim()] as const)
    .filter(([assetName, note]) => assetNames.includes(assetName) && note.length > 0)
    .sort(([left], [right]) => left.localeCompare(right));
  const reviewAverageScore =
    reviewScoreEntries.length > 0
      ? reviewScoreEntries.reduce((total, [, score]) => total + score, 0) / reviewScoreEntries.length
      : null;
  const hasReviewSummary = Boolean(
    reviewNotesDraft.trim() ||
    reviewAnnotations?.updated_at ||
    reviewScoreEntries.length > 0 ||
    reviewNoteEntries.length > 0,
  );
  const reviewAssetNames = [...assetNames].sort((left, right) => left.localeCompare(right));
  const relatedDraftLookup = useMemo(
    () => new Map((draftListData?.drafts ?? []).map((entry) => [entry.review_id, entry] as const)),
    [draftListData],
  );
  const mergeHistoryEntries = useMemo(() => {
    const history = draft?.metadata.merge_history;
    if (history?.length) {
      return [...history].sort(
        (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime(),
      );
    }

    const provenance = draft?.metadata.merge_provenance;
    return provenance
      ? [{ id: 'merge-provenance', ...provenance }]
      : ([] as Array<NonNullable<DraftMetadata['merge_history']>[number]>);
  }, [draft?.metadata.merge_history, draft?.metadata.merge_provenance]);
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
  }, [draft, historySnapshotId, revisionSnapshots]);

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
  }, [compareSnapshotId, compareSnapshotOptions, draft]);

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
  }, [draft, selectedSnapshotCandidateAssets]);

  useFocusEffect(
    useCallback(() => {
      setPendingCompareSelection(getMobileCompareSelection());
    }, []),
  );

  useEffect(() => {
    if (!draft) {
      return;
    }

    resetReviewAnnotations();
  }, [draft, draft?.metadata.review_annotations, draft?.metadata.review_id, resetReviewAnnotations]);

  // Hooks must run unconditionally, so the memoized values above are computed
  // null-safely and are guaranteed to be populated once the guards pass.
  const exportReadiness = exportReadinessPending!;

  return {
    approvalQueue,
    archiveMutation,
    assetEditorVisible,
    assetEntries,
    assetNames,
    closeAssetEditor,
    closeIntroModal,
    closeRefineModal,
    colors,
    compareSnapshot,
    compareSnapshotId,
    compareSnapshotOptions,
    createSnapshotMutation,
    draft,
    draftId,
    editGenre,
    editModalVisible,
    editName,
    editNotes,
    editTags,
    editingAssetContent,
    editingAssetName,
    error,
    exportReadiness,
    exportTrayExpanded,
    formatAssetLabel,
    formatTimestamp,
    generatedIntro,
    handleApplyRefinement,
    handleArchive,
    handleAttachCardImage,
    handleCancelIntroGeneration,
    handleClearCardImage,
    handleCompareDraft,
    handleCopyAsset,
    handleDelete,
    handleDiscardRefinement,
    handleExportPreset,
    handleGenerateAdditionalIntro,
    handleKeepGeneratedIntro,
    handleOpenAssetEditor,
    handleOpenEditModal,
    handleOpenIntroModal,
    handleOptimizeRefinement,
    handleRefine,
    handleRemoveSavedIntro,
    handleRunRefine,
    handleSaveAssetEdit,
    handleSaveMetadata,
    handleSelectRefineAsset,
    handleSetActiveIntro,
    hasIntroScene,
    hasReviewSummary,
    historySnapshotId,
    introGenerationStage,
    introInstructions,
    introModalVisible,
    isApplyingRefinement,
    isGeneratingIntro,
    isLoading,
    isPersistingIntro,
    isRefining,
    isSavingAsset,
    mergeHistoryEntries,
    missingAssetCount,
    missingAssets,
    modalBottomPadding,
    navigation,
    pendingCompareSelection,
    refineModalVisible,
    refinePreview,
    refineRequest,
    refineStatusText,
    relatedDraftLookup,
    resetReviewAnnotations,
    restoreSnapshotMutation,
    revertMergedAssetMutation,
    reviewAnnotations,
    reviewAssetNames,
    reviewAssetNotesDraft,
    reviewAssetScoresDraft,
    reviewAverageScore,
    reviewNoteEntries,
    reviewNotesDraft,
    reviewSaveFeedback,
    reviewScoreEntries,
    revisionSnapshots,
    saveAssetApprovalMutation,
    saveReviewAnnotationsMutation,
    savedIntros,
    selectedRefineAsset,
    selectedSnapshot,
    selectedSnapshotActiveAssetName,
    selectedSnapshotAssetPreviews,
    selectedSnapshotCandidateAssets,
    selectedSnapshotDiffSummary,
    selectedSnapshotId,
    setCompareSnapshotId,
    setEditGenre,
    setEditModalVisible,
    setEditName,
    setEditNotes,
    setEditTags,
    setEditingAssetContent,
    setExportTrayExpanded,
    setGeneratedIntro,
    setIntroInstructions,
    setRefineRequest,
    setReviewAssetNote,
    setReviewAssetScore,
    setReviewNotesDraft,
    setReviewSaveFeedback,
    setSelectedSnapshotAssetName,
    setSelectedSnapshotId,
    snapshotCompareBaseLabel,
    styles,
    summarizeText,
    template,
    toggleFavorite,
    updateMetadataMutation,
    visibleNotes,
  };
}
