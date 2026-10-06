/**
 * The draft detail handlers: the export flow, the intro, refinement and asset editors,
 * the review annotations, the snapshot comparison, and the metadata and archive actions
 * the header and the modals call.
 *
 * Split out of `use-draft-detail-state` verbatim. It takes the state, the mutations and the
 * derived values as parameters, which makes the hooks a one-way chain the screen composes
 * rather than a set of hooks that call each other.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { type DraftAssetReviewScore, type DraftMetadata, type ExportFormat } from '@char-gen/shared';
import { api } from '../../config/api';
import {
  getMobileCompareSelection,
  setMobileCompareSelection,
  type MobileCompareSelection,
} from '../../lib/compare-selection';
import { resolveDraftArchiveAction } from '../../lib/draft-archive';
import { getErrorMessage } from '../../utils/errors';
import { pickCharacterImportFile, saveDownload } from '../../utils/file-transfer';
import {
  EXPORT_EXTENSIONS,
  EXPORT_LABELS,
  formatAssetLabel,
  mergeNotesWithSavedIntros,
  createIntroCandidate,
  isVisibleDraftAsset,
  describeGenerationStage,
} from '../../lib/draft-detail-helpers';
import type { IntroCandidate } from './use-draft-detail-state';
import type { useDraftDetailState } from './use-draft-detail-state';
import type { useDraftDetailMutations } from './use-draft-detail-mutations';
import type { useDraftDetailDerived } from './use-draft-detail-derived';

export function useDraftDetailHandlers(
  {
    draft,
    draftId,
    draftListData,
    editGenre,
    editName,
    editNotes,
    editTags,
    editingAssetContent,
    editingAssetName,
    generatedIntro,
    introAbortRef,
    introCancelRequestedRef,
    introInstructions,
    invalidateDraftQueries,
    isApplyingRefinement,
    isGeneratingIntro,
    isPersistingIntro,
    isRefining,
    isSavingAsset,
    navigation,
    refinePreview,
    refineRequest,
    reviewAssetNotesDraft,
    reviewAssetScoresDraft,
    reviewNotesDraft,
    selectedRefineAsset,
    setAssetEditorVisible,
    setEditGenre,
    setEditModalVisible,
    setEditName,
    setEditNotes,
    setEditTags,
    setEditingAssetContent,
    setEditingAssetName,
    setGeneratedIntro,
    setIntroGenerationStage,
    setIntroInstructions,
    setIntroModalVisible,
    setIsApplyingRefinement,
    setIsGeneratingIntro,
    setIsPersistingIntro,
    setIsRefining,
    setIsSavingAsset,
    setPendingCompareSelection,
    setRefineModalVisible,
    setRefinePreview,
    setRefineRequest,
    setRefineStatusText,
    setReviewAssetNotesDraft,
    setReviewAssetScoresDraft,
    setReviewNotesDraft,
    setReviewSaveFeedback,
    setSelectedRefineAsset,
  }: Pick<
    ReturnType<typeof useDraftDetailState>,
    | 'draft'
    | 'draftId'
    | 'draftListData'
    | 'editGenre'
    | 'editName'
    | 'editNotes'
    | 'editTags'
    | 'editingAssetContent'
    | 'editingAssetName'
    | 'generatedIntro'
    | 'introAbortRef'
    | 'introCancelRequestedRef'
    | 'introInstructions'
    | 'invalidateDraftQueries'
    | 'isApplyingRefinement'
    | 'isGeneratingIntro'
    | 'isPersistingIntro'
    | 'isRefining'
    | 'isSavingAsset'
    | 'navigation'
    | 'refinePreview'
    | 'refineRequest'
    | 'reviewAssetNotesDraft'
    | 'reviewAssetScoresDraft'
    | 'reviewNotesDraft'
    | 'selectedRefineAsset'
    | 'setAssetEditorVisible'
    | 'setEditGenre'
    | 'setEditModalVisible'
    | 'setEditName'
    | 'setEditNotes'
    | 'setEditTags'
    | 'setEditingAssetContent'
    | 'setEditingAssetName'
    | 'setGeneratedIntro'
    | 'setIntroGenerationStage'
    | 'setIntroInstructions'
    | 'setIntroModalVisible'
    | 'setIsApplyingRefinement'
    | 'setIsGeneratingIntro'
    | 'setIsPersistingIntro'
    | 'setIsRefining'
    | 'setIsSavingAsset'
    | 'setPendingCompareSelection'
    | 'setRefineModalVisible'
    | 'setRefinePreview'
    | 'setRefineRequest'
    | 'setRefineStatusText'
    | 'setReviewAssetNotesDraft'
    | 'setReviewAssetScoresDraft'
    | 'setReviewNotesDraft'
    | 'setReviewSaveFeedback'
    | 'setSelectedRefineAsset'
  >,
  {
    archiveMutation,
    assetEntries,
    createSafeguardSnapshot,
    deleteMutation,
    hiddenNotesMutation,
    savedIntros,
    updateMetadataMutation,
    visibleNotes,
  }: Pick<
    ReturnType<typeof useDraftDetailMutations>,
    | 'archiveMutation'
    | 'assetEntries'
    | 'createSafeguardSnapshot'
    | 'deleteMutation'
    | 'hiddenNotesMutation'
    | 'savedIntros'
    | 'updateMetadataMutation'
    | 'visibleNotes'
  >,
  { exportReadiness }: Pick<ReturnType<typeof useDraftDetailDerived>, 'exportReadiness'>,
) {
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
  }, [
    draft?.metadata.review_annotations,
    setReviewAssetNotesDraft,
    setReviewAssetScoresDraft,
    setReviewNotesDraft,
    setReviewSaveFeedback,
  ]);

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

  /**
   * Apply the a1111 tag linter's mechanical corrections (alias / pseudo-tag / duplicate)
   * through the same safeguard-snapshot + update path as a manual edit, so approval
   * fingerprints correctly go stale when the content changes.
   */
  const handleApplyA1111TagFixes = async (nextContent: string) => {
    setIsSavingAsset(true);
    try {
      if ((draft?.assets.a1111 ?? '').trim() !== nextContent.trim()) {
        await createSafeguardSnapshot('Before applying a1111 tag fixes', 'pre-asset-edit:a1111');
      }
      await api.updateAsset(draftId, 'a1111', nextContent);
      invalidateDraftQueries();
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to apply the tag fixes'));
    } finally {
      setIsSavingAsset(false);
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
  useEffect(() => {
    if (!draft) {
      return;
    }

    resetReviewAnnotations();
  }, [draft, draft?.metadata.review_annotations, draft?.metadata.review_id, resetReviewAnnotations]);

  return {
    assetNames,
    closeAssetEditor,
    closeIntroModal,
    closeRefineModal,
    executeExportPreset,
    handleApplyA1111TagFixes,
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
    hasReviewSummary,
    mergeHistoryEntries,
    missingAssetCount,
    missingAssets,
    persistSavedIntros,
    relatedDraftLookup,
    resetReviewAnnotations,
    reviewAnnotations,
    reviewAssetNames,
    reviewAverageScore,
    reviewNoteEntries,
    reviewScoreEntries,
    setReviewAssetNote,
    setReviewAssetScore,
  };
}
