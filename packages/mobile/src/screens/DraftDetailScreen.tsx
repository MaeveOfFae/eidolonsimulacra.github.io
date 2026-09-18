import { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import { StarIcon, ArrowLeftIcon, TrashIcon, DocumentTextIcon, ChatBubbleIcon, ClipboardDocumentIcon, PencilIcon, SparklesIcon } from '../components/Icons';
import type { DraftDetailRouteProp, DraftsStackNavigationProp } from '../types/navigation';
import { getErrorMessage } from '../utils/errors';
import { pickCharacterImportFile, saveDownload } from '../utils/file-transfer';

type AssetEntry = {
  name: string;
  exists: boolean;
  required?: boolean;
  description?: string;
};

type IntroCandidate = {
  id: string;
  content: string;
  timestamp: number;
};

const SAVED_INTROS_BLOCK_PATTERN = /\[SAVED_INTROS\][\s\S]*?\[\/SAVED_INTROS\]/g;
const SAVED_INTROS_CAPTURE_PATTERN = /\[SAVED_INTROS\]([\s\S]*?)\[\/SAVED_INTROS\]/;

function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function stripSavedIntrosBlock(notes?: string | null): string {
  return (notes || '').replace(SAVED_INTROS_BLOCK_PATTERN, '').trim();
}

function parseSavedIntros(notes?: string | null): IntroCandidate[] {
  if (!notes) {
    return [];
  }

  try {
    const match = notes.match(SAVED_INTROS_CAPTURE_PATTERN);
    if (!match?.[1]) {
      return [];
    }

    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((entry): entry is IntroCandidate => (
      !!entry
      && typeof entry === 'object'
      && typeof entry.id === 'string'
      && typeof entry.content === 'string'
      && typeof entry.timestamp === 'number'
    ));
  } catch {
    return [];
  }
}

function mergeNotesWithSavedIntros(notes: string | undefined, savedIntros: IntroCandidate[]): string | undefined {
  const baseNotes = stripSavedIntrosBlock(notes).trim();
  if (savedIntros.length === 0) {
    return baseNotes || undefined;
  }

  return `${baseNotes ? `${baseNotes}\n\n` : ''}[SAVED_INTROS]${JSON.stringify(savedIntros)}[/SAVED_INTROS]`;
}

function createIntroCandidate(content: string): IntroCandidate {
  return {
    id: `intro_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    content,
    timestamp: Date.now(),
  };
}

function summarizeText(content?: string | null, maxLength = 160): string {
  const trimmed = (content || '').replace(/\s+/g, ' ').trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function isVisibleDraftAsset(assetName: string): boolean {
  return assetName !== 'card_image';
}

function describeGenerationStage(stage: string, progress?: number, asset?: string): string {
  const percent = typeof progress === 'number' ? ` (${Math.round(progress * 100)}%)` : '';
  const assetLabel = asset ? ` ${formatAssetLabel(asset)}` : '';

  switch (stage) {
    case 'building_asset_prompt':
      return `Preparing${assetLabel}${percent}`;
    case 'contacting_provider':
      return `Submitting${assetLabel} to provider${percent}`;
    case 'provider_generating':
      return `Provider is generating${assetLabel}${percent}`;
    case 'asset_complete':
      return `Completed${assetLabel}${percent}`;
    case 'complete':
      return 'Intro generation complete.';
    default:
      return `${stage.replace(/_/g, ' ')}${percent}`;
  }
}

export default function DraftDetailScreen() {
  const navigation = useNavigation<DraftsStackNavigationProp<'DraftDetail'>>();
  const route = useRoute<DraftDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const queryClient = useQueryClient();
  const { draftId } = route.params;
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
  const introAbortRef = useRef<(() => void) | null>(null);
  const introCancelRequestedRef = useRef(false);

  const { data: draft, isLoading, error } = useQuery({
    queryKey: ['draft', draftId],
    queryFn: () => api.getDraft(decodeURIComponent(draftId)),
    enabled: !!draftId,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const template = useMemo(
    () => templates.find((entry) => entry.name === draft?.metadata.template_name),
    [draft?.metadata.template_name, templates]
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
    mutationFn: () => api.updateMetadata(draftId, { favorite: !draft?.metadata.favorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
    },
  });

  const updateMetadataMutation = useMutation({
    mutationFn: (metadata: Parameters<typeof api.updateMetadata>[1]) => api.updateMetadata(draftId, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
      setEditModalVisible(false);
    },
    onError: (error: unknown) => {
      Alert.alert('Error', getErrorMessage(error, 'Failed to update metadata'));
    },
  });

  const hiddenNotesMutation = useMutation({
    mutationFn: (notes: string | undefined) => api.updateMetadata(draftId, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
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
      ]
    );
  };

  const handleExportPreset = async (preset: 'text' | 'combined' | 'json' | 'png') => {
    try {
      if (!draft) {
        return;
      }

      const download = await api.exportDraft({
        draft_id: draftId,
        preset,
        include_metadata: preset !== 'text',
      });
      const result = await saveDownload(download, `${draft.metadata.character_name || draft.metadata.review_id}.${preset === 'png' ? 'png' : preset === 'json' ? 'json' : preset === 'combined' ? 'md' : 'txt'}`);

      if (!result.saved) {
        return;
      }

      const label = preset === 'combined' ? 'Markdown bundle' : preset === 'png' ? 'PNG character card' : preset.toUpperCase();
      Alert.alert('Export ready', `${label} file prepared. Save it from the system share sheet to Files, Downloads, or another destination.`);
    } catch (error) {
      Alert.alert('Error', getErrorMessage(error, 'Failed to export character'));
    }
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

      await api.updateAsset(draftId, 'card_image', dataUrl);
      await api.updateMetadata(draftId, {
        card_metadata: {
          ...(draft.metadata.card_metadata ?? {}),
          avatar: dataUrl,
        },
      });
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
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
        await api.updateMetadata(draftId, {
          card_metadata: Object.keys(nextCardMetadata).length > 0 ? nextCardMetadata : undefined,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
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
      await api.updateAsset(draftId, 'intro_scene', nextContent);
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
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

    const selectedAssetExists = Boolean(draft && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset));

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
      await api.updateAsset(draftId, selectedRefineAsset, nextContent);
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
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
      await api.updateAsset(draftId, editingAssetName, nextContent);
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['drafts'] });
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
      .map(t => t.trim())
      .filter(t => t.length > 0);

    updateMetadataMutation.mutate({
      character_name: editName.trim() || undefined,
      genre: editGenre.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      notes: mergeNotesWithSavedIntros(editNotes.trim() || undefined, savedIntros),
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error || !draft) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error loading draft</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const assetNames = Object.keys(draft.assets).filter(isVisibleDraftAsset);
  const missingAssets = assetEntries.filter((entry) => !entry.exists);
  const missingAssetCount = assetEntries.filter((entry) => !entry.exists).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon color="#9ca3af" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={1}>
            {draft.metadata.character_name || 'Character'}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={handleOpenEditModal}
              style={styles.editHeaderButton}
            >
              <PencilIcon color="#7c3aed" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRefine()}
              style={styles.refineHeaderButton}
            >
              <ChatBubbleIcon color="#7c3aed" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleFavorite.mutate()}
              style={styles.favoriteButton}
            >
              <StarIcon
                color={draft.metadata.favorite ? '#eab308' : '#6b7280'}
                size={24}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tags */}
      <ScrollView horizontal style={styles.tagsContainer} contentContainerStyle={styles.tagsContent}>
        {draft.metadata.mode && (
          <View style={[styles.tag, styles.tagPrimary]}>
            <Text style={styles.tagPrimaryText}>{draft.metadata.mode}</Text>
          </View>
        )}
        {draft.metadata.genre && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{draft.metadata.genre}</Text>
          </View>
        )}
        {draft.metadata.template_name && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{draft.metadata.template_name}</Text>
          </View>
        )}
        {draft.metadata.tags?.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsContent}>
        <TouchableOpacity style={styles.actionButton} onPress={() => void handleAttachCardImage()}>
          <DocumentTextIcon color="#7c3aed" size={18} />
          <Text style={styles.actionButtonText}>Attach PNG</Text>
        </TouchableOpacity>
        {(draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) ? (
          <TouchableOpacity style={styles.actionButton} onPress={() => void handleClearCardImage()}>
            <TrashIcon color="#9ca3af" size={18} />
            <Text style={styles.actionButtonText}>Clear PNG</Text>
          </TouchableOpacity>
        ) : null}
        {hasIntroScene ? (
          <TouchableOpacity style={styles.actionButton} onPress={handleOpenIntroModal}>
            <SparklesIcon color="#7c3aed" size={18} />
            <Text style={styles.actionButtonText}>Intros</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.actionButton, exportTrayExpanded && styles.actionButtonActive]}
          onPress={() => setExportTrayExpanded((current) => !current)}
        >
          <DocumentTextIcon color="#7c3aed" size={18} />
          <Text style={styles.actionButtonText}>Export</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteActionButton]} onPress={handleDelete}>
          <TrashIcon color="#ef4444" size={18} />
          <Text style={[styles.actionButtonText, styles.deleteActionText]}>Delete</Text>
        </TouchableOpacity>
        </View>
      </View>

      {exportTrayExpanded ? (
        <View style={styles.exportTrayRow}>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('png')}>
            <Text style={styles.exportChipText}>PNG</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('text')}>
            <Text style={styles.exportChipText}>TXT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('combined')}>
            <Text style={styles.exportChipText}>MD</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('json')}>
            <Text style={styles.exportChipText}>JSON</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {(draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) ? (
        <View style={styles.cardImagePreviewWrap}>
          <Text style={styles.cardImagePreviewLabel}>Attached card image</Text>
          <View style={styles.cardImagePreviewCard}>
            <Text style={styles.cardImagePreviewMeta}>PNG image attached for standard card export.</Text>
          </View>
        </View>
      ) : null}

      {/* Assets */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <CollapsibleTray
          title="Overview"
          subtitle={`${assetNames.length} saved asset${assetNames.length === 1 ? '' : 's'}${savedIntros.length > 0 ? ` • ${savedIntros.length} extra intro${savedIntros.length === 1 ? '' : 's'}` : ''}`}
          initiallyExpanded={Boolean(visibleNotes)}
          preview={
            <View style={styles.overviewPreviewRow}>
              {draft.metadata.created ? (
                <Text style={styles.overviewPreviewText}>
                  Created {new Date(draft.metadata.created).toLocaleDateString()}
                </Text>
              ) : null}
              {draft.metadata.model ? (
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {draft.metadata.model}
                </Text>
              ) : null}
              {visibleNotes ? (
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {summarizeText(visibleNotes, 90)}
                </Text>
              ) : null}
            </View>
          }
          style={styles.primaryTray}
        >
          {visibleNotes ? (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{visibleNotes}</Text>
            </View>
          ) : null}

          <View style={styles.metaGrid}>
            {draft.metadata.created ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Created</Text>
                <Text style={styles.metaValue}>{new Date(draft.metadata.created).toLocaleDateString()}</Text>
              </View>
            ) : null}
            {draft.metadata.model ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Model</Text>
                <Text style={styles.metaValue} numberOfLines={2}>{draft.metadata.model}</Text>
              </View>
            ) : null}
            {draft.metadata.parent_drafts && draft.metadata.parent_drafts.length > 0 ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Parents</Text>
                <Text style={styles.metaValue}>{draft.metadata.parent_drafts.join(' + ')}</Text>
              </View>
            ) : null}
          </View>
        </CollapsibleTray>

        {missingAssetCount > 0 ? (
          <CollapsibleTray
            title="Missing assets"
            subtitle={`${missingAssetCount} slot${missingAssetCount === 1 ? '' : 's'} still need content before export.`}
            initiallyExpanded={false}
            preview={
              <Text style={styles.trayPreviewText} numberOfLines={1}>
                {missingAssets.slice(0, 3).map((entry) => formatAssetLabel(entry.name)).join(' • ')}
                {missingAssets.length > 3 ? ` • +${missingAssets.length - 3} more` : ''}
              </Text>
            }
            style={styles.missingSummaryCard}
          >
            <View style={styles.missingAssetList}>
              {missingAssets.map((entry) => (
                <View key={entry.name} style={styles.missingAssetPill}>
                  <Text style={styles.missingAssetPillText}>{formatAssetLabel(entry.name)}</Text>
                </View>
              ))}
            </View>
          </CollapsibleTray>
        ) : null}

        {assetEntries.map((assetEntry) => {
          const assetName = assetEntry.name;
          const assetExists = assetEntry.exists;
          const assetContent = draft.assets[assetName];

          return (
            <CollapsibleTray
              key={assetName}
              title={formatAssetLabel(assetName)}
              subtitle={assetEntry.description}
              initiallyExpanded={false}
              preview={
                <Text style={[styles.trayPreviewText, !assetExists && styles.trayPreviewTextMuted]} numberOfLines={2}>
                  {assetExists ? summarizeText(assetContent) : 'No saved content yet.'}
                </Text>
              }
              style={styles.assetSection}
            >
              {assetEntry.required || !assetExists ? (
                <View style={styles.assetStatusRow}>
                  {!assetExists ? <Text style={styles.missingBadge}>Missing</Text> : null}
                  {assetEntry.required ? <Text style={styles.requiredBadge}>Req</Text> : null}
                </View>
              ) : null}
              <View style={styles.assetActions}>
                {assetExists ? (
                  <TouchableOpacity
                    style={styles.assetActionButton}
                    onPress={() => handleCopyAsset(assetName, assetContent)}
                  >
                    <ClipboardDocumentIcon color="#9ca3af" size={16} />
                    <Text style={styles.assetActionText}>Copy</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity
                  style={styles.assetActionButton}
                  onPress={() => handleOpenAssetEditor(assetName)}
                >
                  <PencilIcon color={assetExists ? '#9ca3af' : '#7c3aed'} size={16} />
                  <Text style={[styles.assetActionText, !assetExists && styles.assetActionTextAccent]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.assetActionButton}
                  onPress={() => handleRefine(assetName)}
                >
                  <ChatBubbleIcon color="#7c3aed" size={16} />
                  <Text style={styles.assetActionTextAccent}>Refine</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.assetActionButton}
                  onPress={() => navigation.navigate('Home', {
                    screen: 'TokenOptimization',
                    params: {
                      draftId,
                      assetName,
                      text: assetContent || '',
                    },
                  })}
                >
                  <SparklesIcon color="#7c3aed" size={16} />
                  <Text style={styles.assetActionTextAccent}>Optimize</Text>
                </TouchableOpacity>
                {assetName === 'intro_scene' ? (
                  <TouchableOpacity
                    style={styles.assetActionButton}
                    onPress={handleOpenIntroModal}
                  >
                    <SparklesIcon color="#7c3aed" size={16} />
                    <Text style={styles.assetActionTextAccent}>Intros</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <View style={styles.assetContent}>
                {assetExists ? (
                  <Text style={styles.assetText}>{assetContent}</Text>
                ) : (
                  <Text style={styles.assetPlaceholderText}>No saved content yet.</Text>
                )}
              </View>
            </CollapsibleTray>
          );
        })}
      </ScrollView>

      {/* Edit Metadata Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Details</Text>
            <TouchableOpacity
              onPress={handleSaveMetadata}
              disabled={updateMetadataMutation.isPending}
            >
              {updateMetadataMutation.isPending ? (
                <ActivityIndicator size="small" color="#7c3aed" />
              ) : (
                <Text style={styles.modalSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}>
            {/* Character Name */}
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Character Name</Text>
              <TextInput
                style={styles.editInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter character name"
                placeholderTextColor="#6b7280"
              />
            </View>

            {/* Genre */}
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Genre</Text>
              <TextInput
                style={styles.editInput}
                value={editGenre}
                onChangeText={setEditGenre}
                placeholder="e.g., Fantasy, Sci-Fi, Romance"
                placeholderTextColor="#6b7280"
              />
            </View>

            {/* Tags */}
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Tags</Text>
              <TextInput
                style={styles.editInput}
                value={editTags}
                onChangeText={setEditTags}
                placeholder="Comma-separated tags"
                placeholderTextColor="#6b7280"
              />
              <Text style={styles.editHint}>Separate multiple tags with commas</Text>
            </View>

            {/* Notes */}
            <View style={styles.editField}>
              <Text style={styles.editLabel}>Notes</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={editNotes}
                onChangeText={setEditNotes}
                placeholder="Add personal notes about this character..."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={refineModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRefineModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeRefineModal} disabled={isRefining || isApplyingRefinement}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Refine Asset</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}>
            <Text style={styles.modalHelpText}>
              Generate a replacement for an existing asset, or draft the first version of a missing template asset and review it before saving.
            </Text>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>Asset</Text>
              <View style={styles.assetPicker}>
                {assetEntries.map((assetEntry) => {
                  const isActive = assetEntry.name === selectedRefineAsset;
                  return (
                    <TouchableOpacity
                      key={assetEntry.name}
                      style={[styles.assetChip, isActive && styles.assetChipActive]}
                      onPress={() => handleSelectRefineAsset(assetEntry.name)}
                      disabled={isRefining || isApplyingRefinement}
                    >
                      <Text style={[styles.assetChipText, isActive && styles.assetChipTextActive]}>
                        {formatAssetLabel(assetEntry.name)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.editField}>
              <Text style={styles.editLabel}>
                {selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                  ? 'Revision Request'
                  : 'Generation Direction'}
              </Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea]}
                value={refineRequest}
                onChangeText={setRefineRequest}
                placeholder={selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                  ? 'Describe the change you want to make'
                  : 'Describe the first version you want AI to draft for this asset'}
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isRefining && !isApplyingRefinement}
                maxLength={1500}
              />
              <Text style={styles.editHint}>
                {selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                  ? 'Refinement replaces only the selected asset after you apply it.'
                  : 'AI generation drafts only the selected missing asset after you apply it.'}
              </Text>
            </View>

            {selectedRefineAsset ? (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Current {formatAssetLabel(selectedRefineAsset)}</Text>
                <ScrollView style={styles.previewBox} nestedScrollEnabled>
                  <Text style={styles.previewText}>{draft.assets[selectedRefineAsset] || 'No saved content yet.'}</Text>
                </ScrollView>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.primaryButton, styles.fullWidthButton, (!selectedRefineAsset || !refineRequest.trim() || isRefining || isApplyingRefinement) && styles.disabledButton]}
              onPress={handleRunRefine}
              disabled={!selectedRefineAsset || !refineRequest.trim() || isRefining || isApplyingRefinement}
            >
              {isRefining ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {refinePreview
                    ? 'Regenerate Preview'
                    : selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                      ? 'Preview Changes'
                      : 'Generate Preview'}
                </Text>
              )}
            </TouchableOpacity>

            {isRefining && refineStatusText ? (
              <Text style={styles.modalStatusText}>{refineStatusText}</Text>
            ) : null}

            {isRefining || refinePreview ? (
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Refined Preview</Text>
                <ScrollView style={styles.previewBox} nestedScrollEnabled>
                  {refinePreview ? (
                    <Text style={styles.previewText}>{refinePreview}</Text>
                  ) : (
                    <Text style={styles.previewPlaceholder}>Generating preview...</Text>
                  )}
                </ScrollView>
              </View>
            ) : null}

            {refinePreview ? (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.secondaryModalButton, isApplyingRefinement && styles.disabledButton]}
                  onPress={handleDiscardRefinement}
                  disabled={isApplyingRefinement}
                >
                  <Text style={styles.secondaryModalButtonText}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.secondaryModalButton, isApplyingRefinement && styles.disabledButton]}
                  onPress={handleOptimizeRefinement}
                  disabled={isApplyingRefinement}
                >
                  <Text style={styles.secondaryModalButtonText}>Optimize</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, styles.modalActionButton, isApplyingRefinement && styles.disabledButton]}
                  onPress={handleApplyRefinement}
                  disabled={isApplyingRefinement}
                >
                  {isApplyingRefinement ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Apply Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={assetEditorVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAssetEditor}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeAssetEditor} disabled={isSavingAsset}>
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editingAssetName ? formatAssetLabel(editingAssetName) : 'Edit Asset'}</Text>
              <TouchableOpacity onPress={() => void handleSaveAssetEdit()} disabled={isSavingAsset}>
                {isSavingAsset ? (
                  <ActivityIndicator size="small" color="#7c3aed" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}>
              <Text style={styles.modalHelpText}>
                Write or revise the raw asset text directly. Saving will create the asset if it did not exist yet.
              </Text>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Asset Content</Text>
                <TextInput
                  style={[styles.editInput, styles.assetEditorInput]}
                  value={editingAssetContent}
                  onChangeText={setEditingAssetContent}
                  placeholder="Enter asset content"
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={14}
                  textAlignVertical="top"
                  editable={!isSavingAsset}
                />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={introModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={isGeneratingIntro ? handleCancelIntroGeneration : closeIntroModal}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.modalKeyboardContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={isGeneratingIntro ? handleCancelIntroGeneration : closeIntroModal} disabled={isPersistingIntro}>
                <Text style={styles.modalCancelText}>{isGeneratingIntro ? 'Cancel' : 'Close'}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Additional Intros</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView style={styles.modalContent} contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}>
              <Text style={styles.modalHelpText}>
                Generate alternate intro scenes without replacing the active one. Keep the good ones, then activate whichever intro fits best.
              </Text>

              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Current Active Intro</Text>
                <View style={styles.previewBox}>
                  <Text style={styles.previewText}>{draft.assets.intro_scene || 'No intro scene saved.'}</Text>
                </View>
              </View>

              <View style={styles.editField}>
                <Text style={styles.editLabel}>Direction</Text>
                <TextInput
                  style={[styles.editInput, styles.editTextArea]}
                  value={introInstructions}
                  onChangeText={setIntroInstructions}
                  placeholder="Optional guidance for the next intro scene"
                  placeholderTextColor="#6b7280"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  editable={!isGeneratingIntro && !isPersistingIntro}
                  maxLength={1500}
                />
                <Text style={styles.editHint}>This applies only to the next generated intro candidate.</Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, styles.fullWidthButton, (isGeneratingIntro || isPersistingIntro || !draft.metadata.template_name) && styles.disabledButton]}
                onPress={() => void handleGenerateAdditionalIntro()}
                disabled={isGeneratingIntro || isPersistingIntro || !draft.metadata.template_name}
              >
                {isGeneratingIntro ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Generate Additional Intro</Text>
                )}
              </TouchableOpacity>

              {isGeneratingIntro && introGenerationStage ? (
                <Text style={styles.modalStatusText}>{introGenerationStage}</Text>
              ) : null}

              {!draft.metadata.template_name ? (
                <Text style={styles.editHint}>This draft needs a saved template before mobile can generate intro variants.</Text>
              ) : null}

              {isGeneratingIntro || generatedIntro ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Generated Intro Preview</Text>
                  <View style={styles.previewBox}>
                    {generatedIntro?.content ? (
                      <Text style={styles.previewText}>{generatedIntro.content}</Text>
                    ) : (
                      <Text style={styles.previewPlaceholder}>{introGenerationStage || 'Generating intro scene...'}</Text>
                    )}
                  </View>
                </View>
              ) : null}

              {generatedIntro ? (
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => setGeneratedIntro(null)}
                    disabled={isPersistingIntro}
                  >
                    <Text style={styles.secondaryModalButtonText}>Discard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.secondaryModalButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => void handleKeepGeneratedIntro()}
                    disabled={isPersistingIntro}
                  >
                    {isPersistingIntro ? (
                      <ActivityIndicator size="small" color="#d1d5db" />
                    ) : (
                      <Text style={styles.secondaryModalButtonText}>Keep</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryButton, styles.modalActionButton, isPersistingIntro && styles.disabledButton]}
                    onPress={() => void handleSetActiveIntro(generatedIntro.content)}
                    disabled={isPersistingIntro}
                  >
                    <Text style={styles.primaryButtonText}>Make Active</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {savedIntros.length > 0 ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Saved Additional Intros</Text>
                  <View style={styles.savedIntroList}>
                    {savedIntros.map((intro, index) => {
                      const isActive = draft.assets.intro_scene?.trim() === intro.content.trim();
                      return (
                        <View key={intro.id} style={[styles.savedIntroCard, isActive && styles.savedIntroCardActive]}>
                          <View style={styles.savedIntroHeader}>
                            <Text style={styles.savedIntroTitle}>Intro #{index + 1}</Text>
                            <Text style={styles.savedIntroMeta}>{new Date(intro.timestamp).toLocaleString()}</Text>
                          </View>
                          <View style={styles.previewBox}>
                            <Text style={styles.previewText}>{intro.content}</Text>
                          </View>
                          <View style={styles.savedIntroActions}>
                            <TouchableOpacity
                              style={styles.introActionButton}
                              onPress={() => void handleCopyAsset('intro_scene', intro.content)}
                            >
                              <Text style={styles.introActionButtonText}>Copy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.introActionButton, styles.introActionButtonPrimary, isPersistingIntro && styles.disabledButton]}
                              onPress={() => void handleSetActiveIntro(intro.content)}
                              disabled={isPersistingIntro}
                            >
                              <Text style={[styles.introActionButtonText, styles.introActionButtonPrimaryText]}>{isActive ? 'Active' : 'Make Active'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.introActionButton, isPersistingIntro && styles.disabledButton]}
                              onPress={() => void handleRemoveSavedIntro(intro.id)}
                              disabled={isPersistingIntro}
                            >
                              <Text style={styles.introActionButtonText}>Remove</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    marginBottom: 16,
  },
  backText: {
    color: '#7c3aed',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refineHeaderButton: {
    padding: 8,
  },
  editHeaderButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  tagsContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  tagsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tag: {
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagPrimary: {
    backgroundColor: '#7c3aed',
  },
  tagText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  tagPrimaryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  actionsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionButton: {
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  actionButtonActive: {
    borderColor: '#4c1d95',
    backgroundColor: '#241536',
  },
  deleteActionButton: {
    borderColor: '#7f1d1d',
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    color: '#7c3aed',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteActionText: {
    color: '#ef4444',
  },
  exportTrayRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  cardImagePreviewWrap: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  cardImagePreviewLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardImagePreviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardImagePreviewMeta: {
    color: '#d1d5db',
    fontSize: 12,
  },
  exportChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#312e81',
    backgroundColor: '#1b1b2f',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  exportChipText: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '700',
  },
  metaContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    color: '#6b7280',
    fontSize: 11,
    marginBottom: 2,
  },
  metaValue: {
    color: '#d1d5db',
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  primaryTray: {
    marginBottom: 0,
  },
  overviewPreviewRow: {
    gap: 4,
  },
  overviewPreviewText: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  metaGrid: {
    gap: 10,
  },
  metaCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
  },
  notesSection: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  notesLabel: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 4,
  },
  notesText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  savedIntroList: {
    gap: 12,
  },
  savedIntroCard: {
    backgroundColor: '#161616',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    padding: 12,
    gap: 12,
  },
  savedIntroCardActive: {
    borderColor: '#7c3aed',
  },
  savedIntroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  savedIntroTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  savedIntroMeta: {
    color: '#6b7280',
    fontSize: 11,
    flex: 1,
    textAlign: 'right',
  },
  savedIntroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  introActionButton: {
    minWidth: 104,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#1f1f1f',
  },
  introActionButtonPrimary: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  introActionButtonText: {
    color: '#d1d5db',
    fontSize: 14,
    fontWeight: '600',
  },
  introActionButtonPrimaryText: {
    color: '#fff',
  },
  missingSummaryCard: {
    backgroundColor: '#1c1917',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7c3aed55',
    marginBottom: 0,
  },
  trayPreviewText: {
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 18,
  },
  trayPreviewTextMuted: {
    color: '#8b8f98',
  },
  missingAssetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  missingAssetPill: {
    backgroundColor: '#3b1f42',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  missingAssetPillText: {
    color: '#f5d0fe',
    fontSize: 12,
    fontWeight: '600',
  },
  missingSummaryTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  missingSummaryText: {
    color: '#d4d4d8',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  assetSection: {
    marginBottom: 24,
  },
  assetStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetTitleBlock: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginRight: 12,
  },
  assetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  requiredBadge: {
    color: '#ffffff',
    backgroundColor: '#27272a',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '700',
  },
  missingBadge: {
    color: '#f5d0fe',
    backgroundColor: '#581c87',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '700',
  },
  assetDescription: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  assetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assetActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1b1b1b',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  assetActionText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  assetActionTextAccent: {
    color: '#a78bfa',
  },
  assetContent: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  assetText: {
    color: '#d1d5db',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  assetPlaceholderText: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  modalKeyboardContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  modalHeaderSpacer: {
    width: 48,
  },
  modalCancelText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  modalSaveText: {
    color: '#7c3aed',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 16,
  },
  modalHelpText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  editField: {
    marginBottom: 20,
  },
  editLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  editTextArea: {
    minHeight: 100,
  },
  assetEditorInput: {
    minHeight: 280,
    textAlignVertical: 'top',
  },
  editHint: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 4,
  },
  modalStatusText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  assetPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  assetChipActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  assetChipText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
  },
  assetChipTextActive: {
    color: '#fff',
  },
  previewSection: {
    marginTop: 20,
  },
  previewLabel: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  previewBox: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    padding: 12,
    maxHeight: 220,
  },
  previewText: {
    color: '#d1d5db',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  previewPlaceholder: {
    color: '#6b7280',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    marginTop: 20,
  },
  modalActionButton: {
    flex: 1,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryModalButton: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2f2f2f',
  },
  secondaryModalButtonText: {
    color: '#d1d5db',
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
