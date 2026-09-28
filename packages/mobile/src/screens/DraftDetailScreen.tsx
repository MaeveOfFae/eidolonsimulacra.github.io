import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotDiffCandidateAssets,
  buildDraftSnapshotDiffModelFromStates,
  buildDraftSnapshotDiffSummaryFromStates,
  buildExportReadinessSummary,
  type DraftAssetReviewScore,
  type DraftMetadata,
  type ExportFormat,
} from '@char-gen/shared';
import { api } from '../config/api';
import CollapsibleTray from '../components/CollapsibleTray';
import {
  StarIcon,
  ArrowLeftIcon,
  TrashIcon,
  DocumentTextIcon,
  ChatBubbleIcon,
  ClipboardDocumentIcon,
  PencilIcon,
  SparklesIcon,
  UsersIcon,
} from '../components/Icons';
import {
  getMobileCompareSelection,
  setMobileCompareSelection,
  type MobileCompareSelection,
} from '../lib/compare-selection';
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

type AssetScoreMap = Record<string, DraftAssetReviewScore>;
type AssetNoteMap = Record<string, string>;

const SAVED_INTROS_BLOCK_PATTERN = /\[SAVED_INTROS\][\s\S]*?\[\/SAVED_INTROS\]/g;
const SAVED_INTROS_CAPTURE_PATTERN = /\[SAVED_INTROS\]([\s\S]*?)\[\/SAVED_INTROS\]/;

/** Keeps the export chips, filenames and labels aligned with `ExportFormat`. */
const EXPORT_EXTENSIONS: Record<ExportFormat, string> = {
  json: 'json',
  text: 'txt',
  combined: 'md',
  png: 'png',
  pdf: 'pdf',
};

const EXPORT_LABELS: Record<ExportFormat, string> = {
  json: 'JSON',
  text: 'TXT',
  combined: 'Markdown bundle',
  png: 'PNG character card',
  pdf: 'PDF',
};

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

    return parsed.filter(
      (entry): entry is IntroCandidate =>
        !!entry &&
        typeof entry === 'object' &&
        typeof entry.id === 'string' &&
        typeof entry.content === 'string' &&
        typeof entry.timestamp === 'number',
    );
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

function formatTimestamp(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function buildRevertedReviewAnnotations(
  currentAnnotations: DraftMetadata['review_annotations'],
  snapshotAnnotations: DraftMetadata['review_annotations'],
  assetName: string,
) {
  const nextAssetScores = { ...(currentAnnotations?.asset_scores ?? {}) };
  const nextAssetNotes = { ...(currentAnnotations?.asset_notes ?? {}) };
  const sourceScore = snapshotAnnotations?.asset_scores?.[assetName];
  const sourceNote = snapshotAnnotations?.asset_notes?.[assetName]?.trim() ?? '';

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

  const hasScores = Object.keys(nextAssetScores).length > 0;
  const hasNotes = Object.keys(nextAssetNotes).length > 0;
  const summaryNotes = currentAnnotations?.notes?.trim() ?? '';

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

  // Hooks must run unconditionally, so the memoized values above are computed
  // null-safely and are guaranteed to be populated once the guards pass.
  const exportReadiness = exportReadinessPending!;

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
            <TouchableOpacity onPress={handleOpenEditModal} style={styles.editHeaderButton}>
              <PencilIcon color="#7c3aed" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRefine()} style={styles.refineHeaderButton}>
              <ChatBubbleIcon color="#7c3aed" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleFavorite.mutate()} style={styles.favoriteButton}>
              <StarIcon color={draft.metadata.favorite ? '#eab308' : '#6b7280'} size={24} />
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
          {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,') ? (
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
          <TouchableOpacity style={styles.actionButton} onPress={handleCompareDraft}>
            <UsersIcon color="#7c3aed" size={18} />
            <Text style={styles.actionButtonText}>
              {pendingCompareSelection?.character1Id && pendingCompareSelection.character1Id !== draftId
                ? 'Complete Compare'
                : 'Compare'}
            </Text>
          </TouchableOpacity>
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
          <View
            style={[
              styles.exportReadinessCard,
              exportReadiness.requiresAcknowledgement && styles.exportReadinessCardWarning,
            ]}
          >
            <Text style={styles.exportReadinessTitle}>Export readiness</Text>
            <Text style={styles.exportReadinessText}>
              {exportReadiness.validationState === 'checking'
                ? 'Validation is still checking.'
                : exportReadiness.validationState === 'passing'
                  ? 'Validation currently passes.'
                  : 'Validation currently fails.'}
            </Text>
            <Text style={styles.exportReadinessText}>
              {exportReadiness.reviewedAssetCount} rated • {exportReadiness.unratedAssetCount} unrated •{' '}
              {exportReadiness.assetNoteCount} note{exportReadiness.assetNoteCount === 1 ? '' : 's'}
            </Text>
            {exportReadiness.blockingWarnings.length > 0 ? (
              <View style={styles.exportWarningList}>
                {exportReadiness.blockingWarnings.map((warning) => (
                  <Text key={warning} style={styles.exportWarningText}>{`- ${warning}`}</Text>
                ))}
              </View>
            ) : (
              <Text style={styles.exportReadinessText}>
                No current export blockers flagged from validation or saved review scores.
              </Text>
            )}
          </View>
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
          <TouchableOpacity style={styles.exportChip} onPress={() => void handleExportPreset('pdf')}>
            <Text style={styles.exportChipText}>PDF</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {draft.assets.card_image || draft.metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,') ? (
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
                <Text style={styles.metaValue} numberOfLines={2}>
                  {draft.metadata.model}
                </Text>
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

        {hasReviewSummary ? (
          <CollapsibleTray
            title="Review Summary"
            subtitle={`${reviewScoreEntries.length} scored asset${reviewScoreEntries.length === 1 ? '' : 's'}${reviewNoteEntries.length > 0 ? ` • ${reviewNoteEntries.length} asset note${reviewNoteEntries.length === 1 ? '' : 's'}` : ''}`}
            initiallyExpanded={Boolean(reviewNotesDraft.trim() || reviewNoteEntries.length > 0)}
            preview={
              <View style={styles.overviewPreviewRow}>
                {reviewAverageScore !== null ? (
                  <Text style={styles.overviewPreviewText}>Average {reviewAverageScore.toFixed(1)}/5</Text>
                ) : null}
                {reviewAnnotations?.updated_at ? (
                  <Text style={styles.overviewPreviewText}>
                    Updated {new Date(reviewAnnotations.updated_at).toLocaleDateString()}
                  </Text>
                ) : null}
                {reviewNotesDraft.trim() ? (
                  <Text style={styles.overviewPreviewText} numberOfLines={1}>
                    {summarizeText(reviewNotesDraft, 90)}
                  </Text>
                ) : null}
              </View>
            }
          >
            {reviewAnnotations?.updated_at ? (
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Last reviewed</Text>
                <Text style={styles.metaValue}>{new Date(reviewAnnotations.updated_at).toLocaleString()}</Text>
              </View>
            ) : null}

            <View style={styles.reviewSummarySection}>
              <Text style={styles.reviewSummaryLabel}>Reviewer summary</Text>
              <TextInput
                style={[styles.editInput, styles.editTextArea, styles.reviewTextArea]}
                value={reviewNotesDraft}
                onChangeText={(value) => {
                  setReviewNotesDraft(value);
                  setReviewSaveFeedback(null);
                }}
                placeholder="Capture consistency concerns, export blockers, or follow-up edits worth revisiting later."
                placeholderTextColor="#6b7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {reviewAssetNames.length > 0 ? (
              <View style={styles.reviewSummarySection}>
                <Text style={styles.reviewSummaryLabel}>Asset scores</Text>
                <View style={styles.reviewEditorList}>
                  {reviewAssetNames.map((assetName) => {
                    const assetScore = reviewAssetScoresDraft[assetName];
                    return (
                      <View key={`review-${assetName}`} style={styles.reviewEditorCard}>
                        <View style={styles.reviewScoreCard}>
                          <Text style={styles.reviewScoreTitle}>{formatAssetLabel(assetName)}</Text>
                          <Text style={styles.reviewScoreValue}>{assetScore ? `${assetScore}/5` : 'Unrated'}</Text>
                        </View>
                        <View style={styles.reviewScoreChipRow}>
                          {[1, 2, 3, 4, 5].map((score) => {
                            const isActive = assetScore === score;
                            return (
                              <TouchableOpacity
                                key={`${assetName}-score-${score}`}
                                style={[styles.reviewScoreChip, isActive && styles.reviewScoreChipActive]}
                                onPress={() => setReviewAssetScore(assetName, score as DraftAssetReviewScore)}
                              >
                                <Text
                                  style={[styles.reviewScoreChipText, isActive && styles.reviewScoreChipTextActive]}
                                >
                                  {score}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                          <TouchableOpacity
                            style={styles.reviewScoreChip}
                            onPress={() => setReviewAssetScore(assetName, undefined)}
                          >
                            <Text style={styles.reviewScoreChipText}>Clear</Text>
                          </TouchableOpacity>
                        </View>

                        <TextInput
                          style={[styles.editInput, styles.editTextArea, styles.reviewAssetNoteInput]}
                          value={reviewAssetNotesDraft[assetName] ?? ''}
                          onChangeText={(value) => setReviewAssetNote(assetName, value)}
                          placeholder="Asset-specific follow-up, blocking issues, or rationale for the score."
                          placeholderTextColor="#6b7280"
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.metaCard}>
                <Text style={styles.metaValue}>Generate or import draft assets before rating them.</Text>
              </View>
            )}

            <View style={styles.reviewSaveRow}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.reviewSaveButton,
                  saveReviewAnnotationsMutation.isPending && styles.disabledButton,
                ]}
                onPress={() => saveReviewAnnotationsMutation.mutate()}
                disabled={saveReviewAnnotationsMutation.isPending}
              >
                {saveReviewAnnotationsMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Save Review Notes</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.secondaryModalButton,
                  styles.reviewResetButton,
                  saveReviewAnnotationsMutation.isPending && styles.disabledButton,
                ]}
                onPress={resetReviewAnnotations}
                disabled={saveReviewAnnotationsMutation.isPending}
              >
                <Text style={styles.secondaryModalButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {reviewSaveFeedback ? <Text style={styles.reviewSaveFeedback}>{reviewSaveFeedback}</Text> : null}
          </CollapsibleTray>
        ) : null}

        <CollapsibleTray
          title="Restore Points"
          subtitle={`${revisionSnapshots.length} saved restore point${revisionSnapshots.length === 1 ? '' : 's'}`}
          initiallyExpanded={Boolean(revisionSnapshots.length)}
          preview={
            selectedSnapshot ? (
              <View style={styles.overviewPreviewRow}>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {selectedSnapshot.label || 'Restore point'}
                </Text>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {formatTimestamp(selectedSnapshot.created_at)}
                </Text>
              </View>
            ) : (
              <Text style={styles.trayPreviewText}>Save a restore point before risky edits.</Text>
            )
          }
        >
          <TouchableOpacity
            style={[styles.primaryButton, createSnapshotMutation.isPending && styles.disabledButton]}
            onPress={() => createSnapshotMutation.mutate()}
            disabled={createSnapshotMutation.isPending}
          >
            {createSnapshotMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Create Restore Point</Text>
            )}
          </TouchableOpacity>

          {revisionSnapshots.length === 0 ? (
            <View style={styles.snapshotEmptyCard}>
              <Text style={styles.snapshotEmptyText}>No restore points saved yet.</Text>
            </View>
          ) : (
            <View style={styles.snapshotSection}>
              <View style={styles.snapshotCardList}>
                {revisionSnapshots.slice(0, 6).map((snapshot) => {
                  const isActive = snapshot.id === selectedSnapshotId;
                  return (
                    <TouchableOpacity
                      key={snapshot.id}
                      style={[styles.snapshotCard, isActive && styles.snapshotCardActive]}
                      onPress={() => setSelectedSnapshotId(snapshot.id)}
                    >
                      <View style={styles.snapshotCardHeader}>
                        <Text style={styles.snapshotCardTitle}>{snapshot.label || 'Restore point'}</Text>
                        <Text style={styles.snapshotCardMeta}>{formatTimestamp(snapshot.created_at)}</Text>
                      </View>
                      {snapshot.reason ? <Text style={styles.snapshotCardReason}>{snapshot.reason}</Text> : null}
                      <View style={styles.snapshotCardActions}>
                        <Text style={styles.snapshotCardActionText}>{isActive ? 'Previewing' : 'Tap to preview'}</Text>
                        <TouchableOpacity
                          style={[
                            styles.introActionButton,
                            styles.snapshotRestoreButton,
                            restoreSnapshotMutation.isPending && styles.disabledButton,
                          ]}
                          onPress={() =>
                            Alert.alert(
                              'Restore this point?',
                              'The current draft state will be saved as a safeguard restore point first.',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Restore',
                                  style: 'destructive',
                                  onPress: () => restoreSnapshotMutation.mutate(snapshot.id),
                                },
                              ],
                            )
                          }
                          disabled={restoreSnapshotMutation.isPending}
                        >
                          <Text style={styles.introActionButtonText}>
                            {restoreSnapshotMutation.isPending ? 'Restoring...' : 'Restore'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedSnapshot ? (
                <View style={styles.snapshotPreviewPanel}>
                  <Text style={styles.previewLabel}>Compare Against</Text>
                  <View style={styles.snapshotCompareChips}>
                    <TouchableOpacity
                      style={[styles.snapshotCompareChip, !compareSnapshotId && styles.snapshotCompareChipActive]}
                      onPress={() => setCompareSnapshotId('')}
                    >
                      <Text
                        style={[
                          styles.snapshotCompareChipText,
                          !compareSnapshotId && styles.snapshotCompareChipTextActive,
                        ]}
                      >
                        Current draft
                      </Text>
                    </TouchableOpacity>
                    {compareSnapshotOptions.slice(0, 4).map((snapshot) => {
                      const isActive = compareSnapshotId === snapshot.id;
                      return (
                        <TouchableOpacity
                          key={`compare-${snapshot.id}`}
                          style={[styles.snapshotCompareChip, isActive && styles.snapshotCompareChipActive]}
                          onPress={() => setCompareSnapshotId(snapshot.id)}
                        >
                          <Text
                            style={[styles.snapshotCompareChipText, isActive && styles.snapshotCompareChipTextActive]}
                            numberOfLines={1}
                          >
                            {snapshot.label || 'Restore point'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={styles.snapshotSummaryCard}>
                    <Text style={styles.snapshotSummaryText}>Comparing against {snapshotCompareBaseLabel}.</Text>
                    {selectedSnapshotDiffSummary ? (
                      <>
                        <Text style={styles.snapshotSummaryMetric}>
                          {selectedSnapshotDiffSummary.assetDeltaCount} asset change
                          {selectedSnapshotDiffSummary.assetDeltaCount === 1 ? '' : 's'}
                        </Text>
                        <Text style={styles.snapshotSummaryMetric}>
                          {selectedSnapshotDiffSummary.metadataChanges.length > 0
                            ? `Metadata: ${selectedSnapshotDiffSummary.metadataChanges.join(', ')}`
                            : 'No metadata drift'}
                        </Text>
                      </>
                    ) : null}
                  </View>

                  {selectedSnapshotCandidateAssets.length > 1 ? (
                    <View style={styles.assetPicker}>
                      {selectedSnapshotCandidateAssets.map((assetName) => {
                        const isActive = assetName === selectedSnapshotActiveAssetName;
                        return (
                          <TouchableOpacity
                            key={`snapshot-asset-${assetName}`}
                            style={[styles.assetChip, isActive && styles.assetChipActive]}
                            onPress={() => setSelectedSnapshotAssetName(assetName)}
                          >
                            <Text style={[styles.assetChipText, isActive && styles.assetChipTextActive]}>
                              {formatAssetLabel(assetName)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}

                  {selectedSnapshotAssetPreviews.length > 0 ? (
                    <View style={styles.snapshotDiffList}>
                      {selectedSnapshotAssetPreviews.map((preview) => (
                        <View key={`${selectedSnapshot.id}-${preview.assetName}`} style={styles.snapshotDiffCard}>
                          <Text style={styles.snapshotDiffTitle}>{formatAssetLabel(preview.assetName)}</Text>
                          <Text style={styles.snapshotDiffMeta}>
                            {preview.changedLineCount} changed line{preview.changedLineCount === 1 ? '' : 's'}
                          </Text>
                          <View style={styles.snapshotDiffLineList}>
                            {preview.previewLines.map((line) => (
                              <View
                                key={`${preview.assetName}-${line.lineNumber}-${line.status}`}
                                style={styles.snapshotDiffLinePair}
                              >
                                <View style={styles.snapshotDiffLineCard}>
                                  <Text style={styles.snapshotDiffLineLabel}>
                                    {compareSnapshot ? 'Baseline snapshot' : 'Current'} · line {line.lineNumber}
                                  </Text>
                                  <Text style={styles.snapshotDiffLineText}>{line.currentLine || '(empty)'}</Text>
                                </View>
                                <View style={styles.snapshotDiffLineCard}>
                                  <Text style={styles.snapshotDiffLineLabel}>Snapshot · line {line.lineNumber}</Text>
                                  <Text style={styles.snapshotDiffLineText}>{line.snapshotLine || '(empty)'}</Text>
                                </View>
                              </View>
                            ))}
                            {preview.omittedDifferenceCount > 0 ? (
                              <Text style={styles.snapshotDiffMeta}>
                                +{preview.omittedDifferenceCount} more differing line
                                {preview.omittedDifferenceCount === 1 ? '' : 's'}
                              </Text>
                            ) : null}
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.snapshotEmptyCard}>
                      <Text style={styles.snapshotEmptyText}>This restore point matches the selected baseline.</Text>
                    </View>
                  )}
                </View>
              ) : null}
            </View>
          )}
        </CollapsibleTray>

        {mergeHistoryEntries.length > 0 ? (
          <CollapsibleTray
            title="Merge History"
            subtitle={`${mergeHistoryEntries.length} merge event${mergeHistoryEntries.length === 1 ? '' : 's'}`}
            initiallyExpanded={false}
            preview={
              <View style={styles.overviewPreviewRow}>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {mergeHistoryEntries[0]?.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge'}
                </Text>
                <Text style={styles.overviewPreviewText} numberOfLines={1}>
                  {formatTimestamp(mergeHistoryEntries[0]?.created_at)}
                </Text>
              </View>
            }
          >
            <View style={styles.savedIntroList}>
              {mergeHistoryEntries.map((entry) => {
                const sourceDraft = relatedDraftLookup.get(entry.source_draft_id);
                const baseDraft = relatedDraftLookup.get(entry.base_draft_id);
                const sourceSnapshotLabel = entry.source_snapshot_id
                  ? sourceDraft?.revision_snapshots?.find((snapshot) => snapshot.id === entry.source_snapshot_id)
                      ?.label || 'Selected restore point'
                  : null;
                const baseSnapshotLabel = entry.base_snapshot_id
                  ? baseDraft?.revision_snapshots?.find((snapshot) => snapshot.id === entry.base_snapshot_id)?.label ||
                    'Selected restore point'
                  : null;
                const undoSnapshot = entry.undo_snapshot_id
                  ? (revisionSnapshots.find((snapshot) => snapshot.id === entry.undo_snapshot_id) ?? null)
                  : null;

                return (
                  <View key={entry.id} style={styles.savedIntroCard}>
                    <View style={styles.savedIntroHeader}>
                      <Text style={styles.savedIntroTitle}>
                        {entry.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge'}
                      </Text>
                      <Text style={styles.savedIntroMeta}>{formatTimestamp(entry.created_at)}</Text>
                    </View>

                    <View style={styles.metaCard}>
                      <Text style={styles.metaLabel}>Source</Text>
                      <Text style={styles.metaValue}>
                        {sourceDraft?.character_name || sourceDraft?.seed || entry.source_draft_id} ({entry.source_side}
                        ){sourceSnapshotLabel ? ` • ${sourceSnapshotLabel}` : ''}
                      </Text>
                    </View>

                    <View style={styles.metaCard}>
                      <Text style={styles.metaLabel}>Base branch</Text>
                      <Text style={styles.metaValue}>
                        {baseDraft?.character_name || baseDraft?.seed || entry.base_draft_id} ({entry.base_side})
                        {baseSnapshotLabel ? ` • ${baseSnapshotLabel}` : ''}
                      </Text>
                    </View>

                    <View style={styles.metaCard}>
                      <Text style={styles.metaLabel}>Merged assets</Text>
                      <Text style={styles.metaValue}>
                        {entry.asset_names.map((assetName) => formatAssetLabel(assetName)).join(', ')}
                      </Text>
                    </View>

                    {entry.asset_resolutions?.length ? (
                      <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Resolution details</Text>
                        <View style={styles.reviewAssetNoteList}>
                          {entry.asset_resolutions.map((resolution) => (
                            <View key={`${entry.id}-${resolution.asset_name}`} style={styles.reviewAssetNoteCard}>
                              <Text style={styles.reviewAssetNoteTitle}>{formatAssetLabel(resolution.asset_name)}</Text>
                              <Text style={styles.reviewAssetNoteText}>
                                {resolution.reason === 'content-drift'
                                  ? 'Content drift'
                                  : resolution.reason === 'review-drift'
                                    ? 'Review drift'
                                    : resolution.reason === 'left-only'
                                      ? 'Left-only asset'
                                      : 'Right-only asset'}
                                {' • '}
                                {resolution.target_previously_had_asset ? 'updated existing slot' : 'added new slot'}
                                {' • '}
                                {resolution.review_context_applied
                                  ? 'review context copied'
                                  : 'review context not copied'}
                              </Text>
                              {undoSnapshot && resolution.target_previously_had_asset ? (
                                <TouchableOpacity
                                  style={[
                                    styles.introActionButton,
                                    revertMergedAssetMutation.isPending && styles.disabledButton,
                                  ]}
                                  onPress={() =>
                                    revertMergedAssetMutation.mutate({
                                      eventId: entry.id,
                                      assetName: resolution.asset_name,
                                    })
                                  }
                                  disabled={revertMergedAssetMutation.isPending}
                                >
                                  <Text style={styles.introActionButtonText}>
                                    {revertMergedAssetMutation.isPending ? 'Reverting…' : 'Revert Asset'}
                                  </Text>
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}

                    {undoSnapshot ? (
                      <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Undo available</Text>
                        <Text style={styles.metaValue}>
                          {undoSnapshot.label || 'Restore point'} can restore the draft to its pre-merge state.
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.savedIntroActions}>
                      <TouchableOpacity
                        style={styles.introActionButton}
                        onPress={() =>
                          navigation.navigate('DraftDetail', {
                            draftId: entry.source_draft_id,
                            ...(entry.source_snapshot_id ? { historySnapshotId: entry.source_snapshot_id } : {}),
                          })
                        }
                      >
                        <Text style={styles.introActionButtonText}>Open Source</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.introActionButton}
                        onPress={() =>
                          navigation.navigate('DraftDetail', {
                            draftId: entry.base_draft_id,
                            ...(entry.base_snapshot_id ? { historySnapshotId: entry.base_snapshot_id } : {}),
                          })
                        }
                      >
                        <Text style={styles.introActionButtonText}>Open Base</Text>
                      </TouchableOpacity>
                      {undoSnapshot ? (
                        <TouchableOpacity
                          style={[styles.introActionButton, restoreSnapshotMutation.isPending && styles.disabledButton]}
                          onPress={() =>
                            Alert.alert(
                              'Undo this merge?',
                              'The current draft state will be saved as a safeguard restore point first.',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                  text: 'Restore',
                                  style: 'destructive',
                                  onPress: () => restoreSnapshotMutation.mutate(undoSnapshot.id),
                                },
                              ],
                            )
                          }
                          disabled={restoreSnapshotMutation.isPending}
                        >
                          <Text style={styles.introActionButtonText}>
                            {restoreSnapshotMutation.isPending ? 'Undoing…' : 'Undo Merge'}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </CollapsibleTray>
        ) : null}

        {missingAssetCount > 0 ? (
          <CollapsibleTray
            title="Missing assets"
            subtitle={`${missingAssetCount} slot${missingAssetCount === 1 ? '' : 's'} still need content before export.`}
            initiallyExpanded={false}
            preview={
              <Text style={styles.trayPreviewText} numberOfLines={1}>
                {missingAssets
                  .slice(0, 3)
                  .map((entry) => formatAssetLabel(entry.name))
                  .join(' • ')}
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
                <TouchableOpacity style={styles.assetActionButton} onPress={() => handleOpenAssetEditor(assetName)}>
                  <PencilIcon color={assetExists ? '#9ca3af' : '#7c3aed'} size={16} />
                  <Text style={[styles.assetActionText, !assetExists && styles.assetActionTextAccent]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.assetActionButton} onPress={() => handleRefine(assetName)}>
                  <ChatBubbleIcon color="#7c3aed" size={16} />
                  <Text style={styles.assetActionTextAccent}>Refine</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.assetActionButton}
                  onPress={() =>
                    navigation.navigate('Home', {
                      screen: 'TokenOptimization',
                      params: {
                        draftId,
                        assetName,
                        text: assetContent || '',
                      },
                    })
                  }
                >
                  <SparklesIcon color="#7c3aed" size={16} />
                  <Text style={styles.assetActionTextAccent}>Optimize</Text>
                </TouchableOpacity>
                {assetName === 'intro_scene' ? (
                  <TouchableOpacity style={styles.assetActionButton} onPress={handleOpenIntroModal}>
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
              <TouchableOpacity onPress={handleSaveMetadata} disabled={updateMetadataMutation.isPending}>
                {updateMetadataMutation.isPending ? (
                  <ActivityIndicator size="small" color="#7c3aed" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
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

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Generate a replacement for an existing asset, or draft the first version of a missing template asset and
                review it before saving.
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
                  placeholder={
                    selectedRefineAsset && Object.prototype.hasOwnProperty.call(draft.assets, selectedRefineAsset)
                      ? 'Describe the change you want to make'
                      : 'Describe the first version you want AI to draft for this asset'
                  }
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
                    <Text style={styles.previewText}>
                      {draft.assets[selectedRefineAsset] || 'No saved content yet.'}
                    </Text>
                  </ScrollView>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  styles.fullWidthButton,
                  (!selectedRefineAsset || !refineRequest.trim() || isRefining || isApplyingRefinement) &&
                    styles.disabledButton,
                ]}
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

              {isRefining && refineStatusText ? <Text style={styles.modalStatusText}>{refineStatusText}</Text> : null}

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
                    style={[
                      styles.primaryButton,
                      styles.modalActionButton,
                      isApplyingRefinement && styles.disabledButton,
                    ]}
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
              <Text style={styles.modalTitle}>
                {editingAssetName ? formatAssetLabel(editingAssetName) : 'Edit Asset'}
              </Text>
              <TouchableOpacity onPress={() => void handleSaveAssetEdit()} disabled={isSavingAsset}>
                {isSavingAsset ? (
                  <ActivityIndicator size="small" color="#7c3aed" />
                ) : (
                  <Text style={styles.modalSaveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
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
              <TouchableOpacity
                onPress={isGeneratingIntro ? handleCancelIntroGeneration : closeIntroModal}
                disabled={isPersistingIntro}
              >
                <Text style={styles.modalCancelText}>{isGeneratingIntro ? 'Cancel' : 'Close'}</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Additional Intros</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>

            <ScrollView
              style={styles.modalContent}
              contentContainerStyle={[styles.modalContentContainer, { paddingBottom: modalBottomPadding }]}
            >
              <Text style={styles.modalHelpText}>
                Generate alternate intro scenes without replacing the active one. Keep the good ones, then activate
                whichever intro fits best.
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
                style={[
                  styles.primaryButton,
                  styles.fullWidthButton,
                  (isGeneratingIntro || isPersistingIntro || !draft.metadata.template_name) && styles.disabledButton,
                ]}
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
                <Text style={styles.editHint}>
                  This draft needs a saved template before mobile can generate intro variants.
                </Text>
              ) : null}

              {isGeneratingIntro || generatedIntro ? (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>Generated Intro Preview</Text>
                  <View style={styles.previewBox}>
                    {generatedIntro?.content ? (
                      <Text style={styles.previewText}>{generatedIntro.content}</Text>
                    ) : (
                      <Text style={styles.previewPlaceholder}>
                        {introGenerationStage || 'Generating intro scene...'}
                      </Text>
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
                              style={[
                                styles.introActionButton,
                                styles.introActionButtonPrimary,
                                isPersistingIntro && styles.disabledButton,
                              ]}
                              onPress={() => void handleSetActiveIntro(intro.content)}
                              disabled={isPersistingIntro}
                            >
                              <Text style={[styles.introActionButtonText, styles.introActionButtonPrimaryText]}>
                                {isActive ? 'Active' : 'Make Active'}
                              </Text>
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
  exportReadinessCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#111111',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  exportReadinessCardWarning: {
    borderColor: '#7c3aed55',
    backgroundColor: '#1c1917',
  },
  exportReadinessTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  exportReadinessText: {
    color: '#d1d5db',
    fontSize: 12,
    lineHeight: 18,
  },
  exportWarningList: {
    gap: 4,
  },
  exportWarningText: {
    color: '#f5d0fe',
    fontSize: 12,
    lineHeight: 18,
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
  reviewSummarySection: {
    gap: 10,
  },
  reviewSummaryLabel: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  reviewTextArea: {
    minHeight: 104,
  },
  reviewEditorList: {
    gap: 12,
  },
  reviewEditorCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    gap: 10,
  },
  reviewScoreList: {
    gap: 8,
  },
  reviewScoreCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewScoreTitle: {
    color: '#d1d5db',
    fontSize: 13,
    flex: 1,
  },
  reviewScoreValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  reviewScoreChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reviewScoreChip: {
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  reviewScoreChipActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#2b1743',
  },
  reviewScoreChipText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewScoreChipTextActive: {
    color: '#fff',
  },
  reviewAssetNoteInput: {
    minHeight: 88,
  },
  reviewAssetNoteList: {
    gap: 10,
  },
  reviewAssetNoteCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    gap: 6,
  },
  reviewAssetNoteTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  reviewAssetNoteText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 19,
  },
  reviewSaveRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  reviewSaveButton: {
    flex: 1,
  },
  reviewResetButton: {
    flex: 1,
  },
  reviewSaveFeedback: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  snapshotSection: {
    gap: 12,
  },
  snapshotCardList: {
    gap: 10,
  },
  snapshotCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    gap: 8,
  },
  snapshotCardActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#1c1330',
  },
  snapshotCardHeader: {
    gap: 4,
  },
  snapshotCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  snapshotCardMeta: {
    color: '#9ca3af',
    fontSize: 12,
  },
  snapshotCardReason: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  snapshotCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  snapshotCardActionText: {
    color: '#a78bfa',
    fontSize: 12,
    fontWeight: '600',
  },
  snapshotRestoreButton: {
    minWidth: 96,
  },
  snapshotPreviewPanel: {
    gap: 12,
  },
  snapshotCompareChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  snapshotCompareChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  snapshotCompareChipActive: {
    borderColor: '#7c3aed',
    backgroundColor: '#2b1743',
  },
  snapshotCompareChipText: {
    color: '#d1d5db',
    fontSize: 12,
    fontWeight: '600',
  },
  snapshotCompareChipTextActive: {
    color: '#fff',
  },
  snapshotSummaryCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    gap: 6,
  },
  snapshotSummaryText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 18,
  },
  snapshotSummaryMetric: {
    color: '#9ca3af',
    fontSize: 12,
    lineHeight: 18,
  },
  snapshotDiffList: {
    gap: 10,
  },
  snapshotDiffCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
    gap: 8,
  },
  snapshotDiffTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  snapshotDiffMeta: {
    color: '#9ca3af',
    fontSize: 12,
  },
  snapshotDiffLineList: {
    gap: 8,
  },
  snapshotDiffLinePair: {
    gap: 8,
  },
  snapshotDiffLineCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2f2f2f',
    padding: 10,
    gap: 6,
  },
  snapshotDiffLineLabel: {
    color: '#9ca3af',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  snapshotDiffLineText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'monospace',
  },
  snapshotEmptyCard: {
    backgroundColor: '#141414',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 12,
  },
  snapshotEmptyText: {
    color: '#9ca3af',
    fontSize: 13,
    lineHeight: 18,
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
