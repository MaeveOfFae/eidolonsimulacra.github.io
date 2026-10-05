/**
 * The draft detail screen's state: the asset types, the draft and template queries, the
 * review editors, the snapshot comparison and lineage state, and the refs an intro
 * generation is cancelled through.
 *
 * Halved out of what was one hook: `useDraftDetailMutations`, `useDraftDetailDerived` and
 * `useDraftDetailHandlers` take what they need from this one as parameters, so the screen
 * composes a one-way chain and no hook calls another. A name the JSX needs is on one of the
 * four returns, or it is a typecheck error.
 */

import { useMemo, useRef, useState } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type DraftAssetReviewScore } from '@char-gen/shared';
import { api } from '../../config/api';
import { useTheme } from '../../theme/ThemeProvider';
import { getMobileCompareSelection, type MobileCompareSelection } from '../../lib/compare-selection';
import type { DraftDetailRouteProp, DraftsStackNavigationProp } from '../../types/navigation';
import { buildStyles } from '../draft-detail/styles';
import { formatAssetLabel, summarizeText, formatTimestamp } from '../../lib/draft-detail-helpers';

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

  return {
    assetEditorVisible,
    colors,
    compareSnapshotId,
    draft,
    draftId,
    draftListData,
    editGenre,
    editModalVisible,
    editName,
    editNotes,
    editTags,
    editingAssetContent,
    editingAssetName,
    error,
    exportTrayExpanded,
    formatAssetLabel,
    formatTimestamp,
    generatedIntro,
    historySnapshotId,
    insets,
    introAbortRef,
    introCancelRequestedRef,
    introGenerationStage,
    introInstructions,
    introModalVisible,
    invalidateDraftQueries,
    isApplyingRefinement,
    isGeneratingIntro,
    isLoading,
    isPersistingIntro,
    isRefining,
    isSavingAsset,
    modalBottomPadding,
    navigation,
    pendingCompareSelection,
    queryClient,
    refineModalVisible,
    refinePreview,
    refineRequest,
    refineStatusText,
    reviewAssetNotesDraft,
    reviewAssetScoresDraft,
    reviewNotesDraft,
    reviewSaveFeedback,
    route,
    selectedRefineAsset,
    selectedSnapshotAssetName,
    selectedSnapshotId,
    setAssetEditorVisible,
    setCompareSnapshotId,
    setEditGenre,
    setEditModalVisible,
    setEditName,
    setEditNotes,
    setEditTags,
    setEditingAssetContent,
    setEditingAssetName,
    setExportTrayExpanded,
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
    setSelectedSnapshotAssetName,
    setSelectedSnapshotId,
    styles,
    summarizeText,
    tabBarHeight,
    templates,
    validationQuery,
  };
}
