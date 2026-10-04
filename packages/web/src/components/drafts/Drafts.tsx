import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FolderOpen,
  Upload,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Globe,
  Lock,
  MapPin,
  ShieldCheck,
  Users,
  History,
} from 'lucide-react';
import { api, type CreateDraftRequest } from '@/lib/api';
import {
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotDiffCandidateAssets,
  buildDraftSnapshotDiffModelFromStates,
  buildDraftSnapshotDiffSummaryFromStates,
} from '@/lib/drafts/revision-snapshots';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
import SyncControls from '../common/SyncControls';
import { DraftStorage } from '@/lib/storage/draft-db';
import { useGuidedTour } from '../common/GuidedTourContext';
import { DRAFT_LIBRARY_TOUR_ID } from '@/lib/help';
import {
  archiveFavoriteSeed,
  archiveSeedRun,
  deleteArchivedFavoriteSeed,
  deleteArchivedSeedRun,
  getArchivedFavoriteSeeds,
  getArchivedSeedRuns,
  getFavoriteSeeds,
  getSeedRunHistory,
  restoreFavoriteSeed,
  restoreSeedRun,
  SEED_FAVORITES_CHANGED_EVENT,
  SEED_HISTORY_CHANGED_EVENT,
  type FavoriteSeedRecord,
  type SeedRunRecord,
} from '@/lib/seed-generator';
import { pickFile } from '@/utils/download';
import CollapsibleSection from '../common/CollapsibleSection';
import { DraftListSidebar } from './DraftListSidebar';
import LibraryArchiveTab from './LibraryArchiveTab';
import LibrarySeedsTab from './LibrarySeedsTab';
import { DraftDuplicatesPanel } from './DraftDuplicatesPanel';
import { DraftComparisonPanel } from './DraftComparisonPanel';
import ManualDraftCreateModal from './ManualDraftCreateModal';
import { ReviewChecklistPanel } from './ReviewChecklistPanel';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { GenerationHistoryPanel } from '../timelines/GenerationHistoryPanel';

type LibraryTab = 'drafts' | 'seeds' | 'archive' | 'worlds' | 'timelines' | 'workbench';

const LIBRARY_TABS: Array<{ id: LibraryTab; label: string }> = [
  { id: 'drafts', label: 'Drafts' },
  { id: 'seeds', label: 'Seeds' },
  { id: 'archive', label: 'Archive' },
];

const WORLD_MODULES = [
  { label: 'Canon library', icon: BookOpen },
  { label: 'Worldbook', icon: Globe },
  { label: 'Relationships', icon: Users },
  { label: 'Factions', icon: ShieldCheck },
  { label: 'Locations', icon: MapPin },
  { label: 'Universe notes', icon: BookOpen },
  { label: 'Canon locks', icon: Lock },
] as const;

const TIMELINE_MODULES = [
  {
    name: 'Event timeline',
    status: 'Staged',
    description: 'World event storage, ordering, and editing are not live in the current browser flow.',
  },
  {
    name: 'Continuity assistant',
    status: 'Staged',
    description: 'Conflict detection still needs dedicated timeline data beyond saved draft branches.',
  },
];

function isLibraryTab(value: string | null): value is LibraryTab {
  return (
    value === 'drafts' ||
    value === 'seeds' ||
    value === 'archive' ||
    value === 'worlds' ||
    value === 'timelines' ||
    value === 'workbench'
  );
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

export default function Drafts() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leftDraftId, setLeftDraftId] = useState<string>('');
  const [rightDraftId, setRightDraftId] = useState<string>('');
  const [workbenchPreviewSide, setWorkbenchPreviewSide] = useState<'left' | 'right'>('left');
  const [workbenchPanelSource, setWorkbenchPanelSource] = useState<'left' | 'preview'>('left');
  const [selectedSnapshotPreviewId, setSelectedSnapshotPreviewId] = useState<string>('');
  const [selectedSnapshotPreviewAssetName, setSelectedSnapshotPreviewAssetName] = useState<string>('');
  const [compareSnapshotPreviewId, setCompareSnapshotPreviewId] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [favoriteSeeds, setFavoriteSeeds] = useState<FavoriteSeedRecord[]>(() => getFavoriteSeeds());
  const [archivedFavoriteSeeds, setArchivedFavoriteSeeds] = useState<FavoriteSeedRecord[]>(() =>
    getArchivedFavoriteSeeds(),
  );
  const [seedHistory, setSeedHistory] = useState<SeedRunRecord[]>(() => getSeedRunHistory());
  const [archivedSeedRuns, setArchivedSeedRuns] = useState<SeedRunRecord[]>(() => getArchivedSeedRuns());
  const [importTemplateName, setImportTemplateName] = useState('');
  const [showCreateDraftModal, setShowCreateDraftModal] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { isTourCompleted, restartTour, startTour } = useGuidedTour();
  const queryClient = useQueryClient();
  const requestedTab = searchParams.get('tab');
  const activeTab: LibraryTab = isLibraryTab(requestedTab) ? requestedTab : 'drafts';

  const { data, isLoading, error } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const refreshDrafts = () => {
    void queryClient.invalidateQueries({ queryKey: ['drafts'] });
  };

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  const {
    data: archivedDraftData,
    isLoading: archivedDraftsLoading,
    error: archivedDraftError,
  } = useQuery({
    queryKey: ['drafts', 'archived'],
    queryFn: () => api.getDrafts({ archived: true }),
  });
  const { data: worldDraftLinkData } = useQuery({
    queryKey: ['world-character-draft-links'],
    queryFn: () => api.getWorldCharacterDraftLinks(),
    enabled: selfContainedDesktop,
  });

  const refreshSeedData = () => {
    setFavoriteSeeds(getFavoriteSeeds());
    setArchivedFavoriteSeeds(getArchivedFavoriteSeeds());
    setSeedHistory(getSeedRunHistory());
    setArchivedSeedRuns(getArchivedSeedRuns());
  };

  const refreshDraftQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['drafts'] }),
      queryClient.invalidateQueries({ queryKey: ['drafts', 'archived'] }),
    ]);
  };

  const restoreDraftMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const metadata = archivedDraftData?.drafts.find((draft) => draft.review_id === reviewId);
      await api.createDraftSnapshot(reviewId, {
        label: metadata?.character_name
          ? `Before restoring ${metadata.character_name}`
          : 'Before restoring archived draft',
        reason: 'pre-archive-restore',
      });
      return api.restoreDraft(reviewId);
    },
    onSuccess: async () => {
      await refreshDraftQueries();
    },
  });

  const deleteDraftMutation = useMutation({
    mutationFn: (reviewId: string) => api.deleteDraft(reviewId),
    onSuccess: async () => {
      await refreshDraftQueries();
    },
  });

  const createDraftMutation = useMutation({
    mutationFn: (request: CreateDraftRequest) => api.createDraft(request),
  });

  const setActiveTab = useCallback(
    (tab: LibraryTab) => {
      const nextParams = new URLSearchParams(searchParams);
      if (tab === 'drafts') {
        nextParams.delete('tab');
      } else {
        nextParams.set('tab', tab);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (!data?.drafts.length) {
      setLeftDraftId('');
      setRightDraftId('');
      return;
    }

    setLeftDraftId((previous) => previous || data.drafts[0]?.review_id || '');
    setRightDraftId((previous) => {
      if (previous) {
        return previous;
      }
      return data.drafts[1]?.review_id || data.drafts[0]?.review_id || '';
    });
  }, [data?.drafts]);

  useEffect(() => {
    if (!importTemplateName && templates.length > 0) {
      setImportTemplateName(templates[0].name);
    }
  }, [importTemplateName, templates]);

  const selectedImportTemplate = templates.find((candidate) => candidate.name === importTemplateName);

  useEffect(() => {
    window.addEventListener(SEED_FAVORITES_CHANGED_EVENT, refreshSeedData);
    window.addEventListener(SEED_HISTORY_CHANGED_EVENT, refreshSeedData);
    window.addEventListener('storage', refreshSeedData);
    refreshSeedData();

    return () => {
      window.removeEventListener(SEED_FAVORITES_CHANGED_EVENT, refreshSeedData);
      window.removeEventListener(SEED_HISTORY_CHANGED_EVENT, refreshSeedData);
      window.removeEventListener('storage', refreshSeedData);
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'worlds') {
      navigate('/worlds', { replace: true });
      return;
    }

    if (activeTab === 'timelines') {
      navigate('/timelines', { replace: true });
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    if (!data?.drafts.length && activeTab === 'workbench') {
      setActiveTab('drafts');
    }
  }, [activeTab, data?.drafts.length, setActiveTab]);

  const hasDrafts = (data?.drafts?.length ?? 0) > 0;
  const draftCount = data?.stats?.total_drafts ?? data?.drafts.length ?? 0;
  const archivedDraftCount = archivedDraftData?.drafts.length ?? data?.stats?.archived_drafts ?? 0;
  const favoritesCount = data?.stats?.favorites ?? 0;
  const genresCount = data?.stats ? Object.keys(data.stats.by_genre).length : 0;
  const branchCount = (data?.drafts ?? []).filter((draft) => (draft.parent_drafts?.length ?? 0) > 0).length;
  const mergedDraftCount = useMemo(
    () =>
      (data?.drafts ?? []).filter((draft) => Boolean((draft.merge_history?.length ?? 0) > 0 || draft.merge_provenance))
        .length,
    [data?.drafts],
  );
  const worldLinkedDraftCount = useMemo(
    () => new Set((worldDraftLinkData?.links ?? []).map((link) => link.draftId)).size,
    [worldDraftLinkData?.links],
  );
  const mergeEventCount = useMemo(
    () =>
      (data?.drafts ?? []).reduce(
        (total, draft) => total + (draft.merge_history?.length ?? (draft.merge_provenance ? 1 : 0)),
        0,
      ),
    [data?.drafts],
  );
  const undoableMergeCount = useMemo(
    () =>
      (data?.drafts ?? []).reduce(
        (total, draft) => total + (draft.merge_history?.filter((entry) => Boolean(entry.undo_snapshot_id)).length ?? 0),
        0,
      ),
    [data?.drafts],
  );
  const draftNameById = useMemo(
    () => new Map((data?.drafts ?? []).map((draft) => [draft.review_id, draft.character_name || draft.seed] as const)),
    [data?.drafts],
  );
  const draftWorldLinksByDraftId = useMemo(
    () => new Map((worldDraftLinkData?.links ?? []).map((link) => [link.draftId, link] as const)),
    [worldDraftLinkData?.links],
  );
  const recentRevisionSnapshots = (data?.drafts ?? [])
    .flatMap((draft) =>
      (draft.revision_snapshots ?? []).map((snapshot) => ({
        draftId: draft.review_id,
        draftName: draft.character_name || draft.seed,
        snapshot,
      })),
    )
    .sort((left, right) => new Date(right.snapshot.created_at).getTime() - new Date(left.snapshot.created_at).getTime())
    .slice(0, 5);
  const recentMergeEvents = useMemo(
    () =>
      (data?.drafts ?? [])
        .flatMap((draft) => {
          const mergeEntries = draft.merge_history?.length
            ? draft.merge_history
            : draft.merge_provenance
              ? [{ id: `merge-provenance-${draft.review_id}`, ...draft.merge_provenance }]
              : [];

          return mergeEntries.map((entry) => ({
            draftId: draft.review_id,
            draftName: draft.character_name || draft.seed,
            entry,
          }));
        })
        .sort((left, right) => new Date(right.entry.created_at).getTime() - new Date(left.entry.created_at).getTime())
        .slice(0, 5),
    [data?.drafts],
  );
  const activeWorkbenchDraftId = leftDraftId || data?.drafts[0]?.review_id;
  const activeWorkbenchPreviewDraftId =
    workbenchPreviewSide === 'right'
      ? rightDraftId || leftDraftId || data?.drafts[0]?.review_id
      : leftDraftId || rightDraftId || data?.drafts[0]?.review_id;
  const activeWorkbenchPanelDraftId =
    workbenchPanelSource === 'preview' ? activeWorkbenchPreviewDraftId : activeWorkbenchDraftId;
  const workbenchPreviewDraft =
    (data?.drafts ?? []).find((draft) => draft.review_id === activeWorkbenchPreviewDraftId) ?? null;
  const activeWorkbenchPanelDraft =
    (data?.drafts ?? []).find((draft) => draft.review_id === activeWorkbenchPanelDraftId) ?? null;
  const workbenchPreviewSnapshots = useMemo(() => {
    if (!workbenchPreviewDraft) {
      return [] as Array<{
        draftId: string;
        draftName: string;
        snapshot: NonNullable<typeof workbenchPreviewDraft>['revision_snapshots'][number];
      }>;
    }

    return (workbenchPreviewDraft.revision_snapshots ?? []).slice(0, 6).map((snapshot) => ({
      draftId: workbenchPreviewDraft.review_id,
      draftName: workbenchPreviewDraft.character_name || workbenchPreviewDraft.seed,
      snapshot,
    }));
  }, [workbenchPreviewDraft]);
  const workbenchPreviewDraftLabel =
    workbenchPreviewDraft?.character_name || workbenchPreviewDraft?.seed || `Selected ${workbenchPreviewSide} draft`;
  const activeWorkbenchPanelDraftLabel =
    activeWorkbenchPanelDraft?.character_name || activeWorkbenchPanelDraft?.seed || 'Selected workbench draft';
  const selectedSnapshotPreviewEntries =
    activeTab === 'workbench' ? workbenchPreviewSnapshots : recentRevisionSnapshots;
  const selectedSnapshotEntry =
    selectedSnapshotPreviewEntries.find((entry) => entry.snapshot.id === selectedSnapshotPreviewId) ?? null;
  const { data: selectedSnapshotDraft, isLoading: selectedSnapshotDraftLoading } = useQuery({
    queryKey: ['draft', selectedSnapshotEntry?.draftId, 'library-snapshot-preview'],
    queryFn: () => api.getDraft(selectedSnapshotEntry?.draftId || ''),
    enabled: Boolean(selectedSnapshotEntry?.draftId),
  });
  const selectedSnapshotCompareOptions = useMemo(
    () =>
      (selectedSnapshotDraft?.metadata.revision_snapshots ?? []).filter(
        (snapshot) => snapshot.id !== selectedSnapshotEntry?.snapshot.id,
      ),
    [selectedSnapshotDraft?.metadata.revision_snapshots, selectedSnapshotEntry?.snapshot.id],
  );
  const selectedSnapshotCompareBaseSnapshot = useMemo(
    () => selectedSnapshotCompareOptions.find((snapshot) => snapshot.id === compareSnapshotPreviewId) ?? null,
    [compareSnapshotPreviewId, selectedSnapshotCompareOptions],
  );
  const selectedSnapshotCompareBaseState = useMemo(
    () =>
      selectedSnapshotCompareBaseSnapshot?.state ??
      (selectedSnapshotDraft ? buildDraftRevisionSnapshotState(selectedSnapshotDraft) : null),
    [selectedSnapshotCompareBaseSnapshot, selectedSnapshotDraft],
  );
  const selectedSnapshotCompareBaseLabel =
    selectedSnapshotCompareBaseSnapshot?.label ||
    (selectedSnapshotCompareBaseSnapshot ? 'Restore point' : 'Current draft');
  const selectedSnapshotDiffSummary =
    selectedSnapshotEntry && selectedSnapshotDraft && selectedSnapshotCompareBaseState
      ? buildDraftSnapshotDiffSummaryFromStates(selectedSnapshotCompareBaseState, selectedSnapshotEntry.snapshot.state)
      : null;
  const selectedSnapshotCandidateAssets = useMemo(
    () => (selectedSnapshotDiffSummary ? buildDraftSnapshotDiffCandidateAssets(selectedSnapshotDiffSummary) : []),
    [selectedSnapshotDiffSummary],
  );
  const selectedSnapshotActiveAssetName = selectedSnapshotCandidateAssets.includes(selectedSnapshotPreviewAssetName)
    ? selectedSnapshotPreviewAssetName
    : selectedSnapshotCandidateAssets[0] || '';
  const selectedSnapshotDiffModel =
    selectedSnapshotEntry && selectedSnapshotDraft && selectedSnapshotCompareBaseState
      ? buildDraftSnapshotDiffModelFromStates(selectedSnapshotCompareBaseState, selectedSnapshotEntry.snapshot.state, {
          assetName: selectedSnapshotActiveAssetName || undefined,
          maxAssets: selectedSnapshotActiveAssetName ? 1 : 2,
          maxPreviewLines: 5,
        })
      : null;
  const selectedSnapshotAssetPreviews = selectedSnapshotDiffModel?.assetPreviews ?? [];
  const selectedSnapshotPreviewIndex = selectedSnapshotEntry
    ? selectedSnapshotPreviewEntries.findIndex((entry) => entry.snapshot.id === selectedSnapshotEntry.snapshot.id)
    : -1;
  const previousSnapshotEntry =
    selectedSnapshotPreviewIndex > 0 ? selectedSnapshotPreviewEntries[selectedSnapshotPreviewIndex - 1] : null;
  const nextSnapshotEntry =
    selectedSnapshotPreviewIndex >= 0 && selectedSnapshotPreviewIndex < selectedSnapshotPreviewEntries.length - 1
      ? selectedSnapshotPreviewEntries[selectedSnapshotPreviewIndex + 1]
      : null;

  useEffect(() => {
    if (workbenchPreviewSide === 'right' && !rightDraftId && leftDraftId) {
      setWorkbenchPreviewSide('left');
    }
  }, [leftDraftId, rightDraftId, workbenchPreviewSide]);

  useEffect(() => {
    if (selectedSnapshotPreviewEntries.length === 0) {
      setSelectedSnapshotPreviewId('');
      return;
    }

    setSelectedSnapshotPreviewId((current) => {
      if (current && selectedSnapshotPreviewEntries.some((entry) => entry.snapshot.id === current)) {
        return current;
      }

      return selectedSnapshotPreviewEntries[0]?.snapshot.id ?? '';
    });
  }, [selectedSnapshotPreviewEntries]);

  useEffect(() => {
    if (!selectedSnapshotCandidateAssets.length) {
      setSelectedSnapshotPreviewAssetName('');
      return;
    }

    setSelectedSnapshotPreviewAssetName((current) =>
      selectedSnapshotCandidateAssets.includes(current) ? current : (selectedSnapshotCandidateAssets[0] ?? ''),
    );
  }, [selectedSnapshotCandidateAssets]);

  useEffect(() => {
    if (!compareSnapshotPreviewId) {
      return;
    }

    if (!selectedSnapshotCompareOptions.some((snapshot) => snapshot.id === compareSnapshotPreviewId)) {
      setCompareSnapshotPreviewId('');
    }
  }, [compareSnapshotPreviewId, selectedSnapshotCompareOptions]);

  useEffect(() => {
    if (!selectedSnapshotEntry || !selectedSnapshotDraft) {
      return;
    }

    const nextSummary = selectedSnapshotCompareBaseState
      ? buildDraftSnapshotDiffSummaryFromStates(
          selectedSnapshotCompareBaseState,
          selectedSnapshotEntry.snapshot.state,
          selectedSnapshotPreviewAssetName || undefined,
        )
      : null;
    if (selectedSnapshotPreviewAssetName && nextSummary?.assetFocusedDifference) {
      return;
    }

    const overlappingAsset = selectedSnapshotCandidateAssets.find((assetName) => {
      if (!selectedSnapshotCompareBaseState) {
        return false;
      }

      const diff = buildDraftSnapshotDiffSummaryFromStates(
        selectedSnapshotCompareBaseState,
        selectedSnapshotEntry.snapshot.state,
        assetName,
      );
      return diff.assetFocusedDifference;
    });

    setSelectedSnapshotPreviewAssetName(overlappingAsset ?? selectedSnapshotCandidateAssets[0] ?? '');
  }, [
    selectedSnapshotCandidateAssets,
    selectedSnapshotCompareBaseState,
    selectedSnapshotDraft,
    selectedSnapshotEntry,
    selectedSnapshotPreviewAssetName,
  ]);

  const handleSelectSnapshotPreview = useCallback(
    (draftId: string, snapshotId: string) => {
      setSelectedSnapshotPreviewId(snapshotId);
      const nextParams = new URLSearchParams(searchParams);
      if (activeTab !== 'drafts') {
        nextParams.set('tab', 'drafts');
        setSearchParams(nextParams, { replace: true });
      }

      void draftId;
    },
    [activeTab, searchParams, setSearchParams],
  );

  const renderSelectedSnapshotPreview = () => {
    if (!selectedSnapshotEntry) {
      return null;
    }

    return (
      <div className="rounded-lg border border-border bg-background/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Snapshot preview</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedSnapshotEntry.draftName} Ã‚Â· {selectedSnapshotEntry.snapshot.label || 'Restore point'} Ã‚Â·{' '}
              {formatTimestamp(selectedSnapshotEntry.snapshot.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => previousSnapshotEntry && setSelectedSnapshotPreviewId(previousSnapshotEntry.snapshot.id)}
              disabled={!previousSnapshotEntry}
              className="app-button app-button-secondary disabled:opacity-50"
            >
              Previous snapshot
            </button>
            <button
              type="button"
              onClick={() => nextSnapshotEntry && setSelectedSnapshotPreviewId(nextSnapshotEntry.snapshot.id)}
              disabled={!nextSnapshotEntry}
              className="app-button app-button-secondary disabled:opacity-50"
            >
              Next snapshot
            </button>
            <Link
              to={`/drafts/${encodeURIComponent(selectedSnapshotEntry.draftId)}?historySnapshot=${encodeURIComponent(selectedSnapshotEntry.snapshot.id)}`}
              className="app-button app-button-secondary"
            >
              Open full history
            </Link>
          </div>
        </div>

        {selectedSnapshotDraftLoading ? (
          <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
            Loading snapshot preview...
          </div>
        ) : selectedSnapshotDiffSummary ? (
          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-muted-foreground">
                <span className="sr-only">Compare preview against</span>
                <select
                  value={compareSnapshotPreviewId}
                  onChange={(event) => setCompareSnapshotPreviewId(event.target.value)}
                  className="rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
                >
                  <option value="">Compare against current draft</option>
                  {selectedSnapshotCompareOptions.map((snapshot) => (
                    <option key={snapshot.id} value={snapshot.id}>
                      {snapshot.label || 'Restore point'} Ã‚Â· {formatTimestamp(snapshot.created_at)}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-xs text-muted-foreground">
                Comparing against{' '}
                <span className="font-medium text-foreground">{selectedSnapshotCompareBaseLabel}</span>
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Asset changes</div>
                <div className="mt-1 text-xl font-semibold text-foreground">
                  {selectedSnapshotDiffSummary.assetDeltaCount}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Metadata</div>
                <div className="mt-1 text-sm text-foreground">
                  {selectedSnapshotDiffSummary.metadataChanges.length > 0
                    ? selectedSnapshotDiffSummary.metadataChanges.join(', ')
                    : 'No drift'}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Changed assets</div>
                <div className="mt-1 text-sm text-foreground">
                  {selectedSnapshotDiffSummary.changedAssets.length > 0
                    ? selectedSnapshotDiffSummary.changedAssets.slice(0, 3).join(', ')
                    : 'No content drift'}
                </div>
              </div>
            </div>

            {selectedSnapshotCandidateAssets.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {selectedSnapshotCandidateAssets.map((assetName) => (
                  <button
                    key={assetName}
                    type="button"
                    onClick={() => setSelectedSnapshotPreviewAssetName(assetName)}
                    className={`app-pill transition-colors ${selectedSnapshotActiveAssetName === assetName ? 'app-pill-emerald' : 'app-pill-muted'}`}
                  >
                    {assetName}
                  </button>
                ))}
              </div>
            )}

            {selectedSnapshotAssetPreviews.length > 0 ? (
              <div className="space-y-3">
                {selectedSnapshotAssetPreviews.map((preview) => (
                  <div
                    key={`${selectedSnapshotEntry.snapshot.id}-${preview.assetName}`}
                    className="rounded-lg border border-border/60 bg-background/60 p-3"
                  >
                    <div className="font-medium text-foreground">{preview.assetName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {preview.changedLineCount} changed line{preview.changedLineCount === 1 ? '' : 's'}
                    </div>
                    <div className="mt-3 space-y-2">
                      {preview.previewLines.map((line) => (
                        <div
                          key={`${preview.assetName}-${line.lineNumber}-${line.status}`}
                          className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                        >
                          <div className="rounded-md border border-border/60 bg-background/80 p-2">
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              {selectedSnapshotCompareBaseSnapshot ? 'Baseline snapshot' : 'Current'} Ã‚Â· line{' '}
                              {line.lineNumber}
                            </div>
                            <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-foreground">
                              {line.currentLine || '(empty)'}
                            </pre>
                          </div>
                          <div className="rounded-md border border-border/60 bg-background/80 p-2">
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Snapshot Ã‚Â· line {line.lineNumber}
                            </div>
                            <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-foreground">
                              {line.snapshotLine || '(empty)'}
                            </pre>
                          </div>
                        </div>
                      ))}
                      {preview.omittedDifferenceCount > 0 && (
                        <div className="text-[11px] text-muted-foreground">
                          +{preview.omittedDifferenceCount} more differing line
                          {preview.omittedDifferenceCount === 1 ? '' : 's'}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
                This snapshot currently matches the latest saved asset content.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
            Choose another restore point to inspect its diff preview.
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading drafts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
        Error loading drafts: {error.message}
      </div>
    );
  }

  async function handleImportDraftsFile(file: File) {
    try {
      const text = await file.text();
      const result = await DraftStorage.import(text, { sourceName: file.name, template: selectedImportTemplate });
      await refreshDraftQueries();
      const remapMessage =
        result.remapped > 0 ? ` (${result.remapped} review IDs remapped to avoid overwriting existing drafts)` : '';
      setNotice({ type: 'success', message: `Imported ${result.imported} drafts from ${file.name}${remapMessage}` });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Draft import failed',
      });
    }
  }

  async function handleImportDrafts() {
    const file = await pickFile(
      { accept: 'application/json,.json,text/markdown,.md,text/plain,.txt' },
      importInputRef.current,
    );
    if (!file) {
      return;
    }

    await handleImportDraftsFile(file);
  }

  async function handleRestoreDraft(reviewId: string) {
    await restoreDraftMutation.mutateAsync(reviewId);
  }

  async function handleDeleteDraft(reviewId: string) {
    await deleteDraftMutation.mutateAsync(reviewId);
  }

  function openCreateDraftModal() {
    createDraftMutation.reset();
    setShowCreateDraftModal(true);
  }

  function closeCreateDraftModal() {
    if (createDraftMutation.isPending) {
      return;
    }

    createDraftMutation.reset();
    setShowCreateDraftModal(false);
  }

  async function handleCreateDraft(request: CreateDraftRequest) {
    try {
      const draft = await createDraftMutation.mutateAsync(request);
      setShowCreateDraftModal(false);
      await refreshDraftQueries();
      navigate(`/drafts/${encodeURIComponent(draft.metadata.review_id)}`);
    } catch (error) {
      console.error('Draft creation failed:', error);
    }
  }

  function handleArchiveFavoriteSeed(seed: string) {
    archiveFavoriteSeed(seed);
    refreshSeedData();
  }

  function handleRestoreFavoriteSeed(seed: string) {
    restoreFavoriteSeed(seed);
    refreshSeedData();
  }

  function handleDeleteArchivedFavoriteSeed(seed: string) {
    deleteArchivedFavoriteSeed(seed);
    refreshSeedData();
  }

  function handleArchiveSeedRun(id: string) {
    archiveSeedRun(id);
    refreshSeedData();
  }

  function handleRestoreSeedRun(id: string) {
    restoreSeedRun(id);
    refreshSeedData();
  }

  function handleDeleteArchivedSeedRun(id: string) {
    deleteArchivedSeedRun(id);
    refreshSeedData();
  }

  return (
    <div className="app-page space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Library</p>
            <h1 className="app-page-title">Browse saved work</h1>
            <p className="app-page-summary">
              Reopen drafts, reuse seeds, and archive source material without losing track of what is active.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/generate" className="app-button app-button-primary">
                Generate another draft
              </Link>
              {templates.length > 0 && (
                <button type="button" onClick={openCreateDraftModal} className="app-button app-button-secondary">
                  Create draft manually
                </button>
              )}
              <Link to="/seed-generator" className="app-button app-button-secondary">
                Seed generator
              </Link>
              <button
                type="button"
                onClick={() => void handleImportDrafts()}
                className="app-button app-button-secondary"
              >
                <Upload className="h-4 w-4" />
                Upload drafts
              </button>
              {templates.length > 0 && (
                <select
                  value={importTemplateName}
                  onChange={(event) => setImportTemplateName(event.target.value)}
                  className="rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm text-foreground"
                  aria-label="Import target template"
                >
                  {templates.map((availableTemplate) => (
                    <option key={availableTemplate.name} value={availableTemplate.name}>
                      Import as {availableTemplate.name}
                    </option>
                  ))}
                </select>
              )}
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json,text/markdown,.md,text/plain,.txt"
                title="Upload draft files"
                className="hidden"
              />
              <button
                type="button"
                onClick={() =>
                  isTourCompleted(DRAFT_LIBRARY_TOUR_ID)
                    ? restartTour(DRAFT_LIBRARY_TOUR_ID)
                    : startTour(DRAFT_LIBRARY_TOUR_ID)
                }
                className="app-button app-button-secondary"
              >
                {isTourCompleted(DRAFT_LIBRARY_TOUR_ID) ? 'Replay tour' : 'Start tour'}
              </button>
            </div>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Library state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Drafts</p>
                <div className="app-page-metric-value text-2xl">{draftCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Favorite Seeds</p>
                <div className="app-page-metric-value text-2xl">{favoriteSeeds.length}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Branches</p>
                <div className="app-page-metric-value text-2xl">{branchCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">World-linked</p>
                <div className="app-page-metric-value text-2xl">{worldLinkedDraftCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Merged Drafts</p>
                <div className="app-page-metric-value text-2xl">{mergedDraftCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Merge Events</p>
                <div className="app-page-metric-value text-2xl">{mergeEventCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Undoable Merges</p>
                <div className="app-page-metric-value text-2xl">{undoableMergeCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <div
          className={`app-note flex items-start gap-3 px-4 py-3 ${
            notice.type === 'success'
              ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-destructive/50 bg-destructive/10 text-destructive'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <span className="text-sm">{notice.message}</span>
          <button type="button" onClick={() => setNotice(null)} className="ml-auto opacity-50 hover:opacity-100">
            Ãƒâ€”
          </button>
        </div>
      )}

      <div className="flex overflow-x-auto pb-1 sm:justify-start">
        <div className="app-tab-group min-w-max">
          {LIBRARY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-active={activeTab === tab.id ? 'true' : 'false'}
              className="app-tab-button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background/35 px-3 py-3 text-sm">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Other surfaces
        </span>
        <button
          type="button"
          onClick={() => setActiveTab('workbench')}
          disabled={!hasDrafts}
          className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'workbench'
              ? 'border-primary/30 bg-primary/12 text-foreground'
              : 'border-border/60 bg-background/60 text-muted-foreground hover:border-primary/35 hover:text-primary'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          Workbench
        </button>
        <Link
          to="/worlds"
          className="inline-flex items-center rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
        >
          Worlds route
        </Link>
        <Link
          to="/timelines"
          className="inline-flex items-center rounded-lg border border-border/60 bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
        >
          Timeline route
        </Link>
      </div>

      {!hasDrafts && activeTab === 'drafts' && (
        <div className="app-panel p-8 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No drafts yet</h3>
          <p className="text-muted-foreground">Generate your first character to get started</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link to="/generate" data-tour-anchor="drafts-open-review" className="app-button app-button-primary">
              Generate Character
            </Link>
            {templates.length > 0 && (
              <button type="button" onClick={openCreateDraftModal} className="app-button app-button-secondary">
                Create draft manually
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'drafts' && hasDrafts && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section
            className="app-panel min-w-0 overflow-hidden p-0 xl:max-h-[calc(100vh-18rem)]"
            data-tour-anchor="drafts-open-review"
          >
            <DraftListSidebar
              drafts={data?.drafts ?? []}
              isLoading={isLoading}
              draftWorldLinksByDraftId={draftWorldLinksByDraftId}
              activeSnapshotPreviewId={selectedSnapshotPreviewId}
              onSelectSnapshotPreview={handleSelectSnapshotPreview}
              onDraftsChanged={refreshDrafts}
            />
          </section>

          <div className="min-w-0 space-y-4">
            <DraftDuplicatesPanel drafts={data?.drafts ?? []} onDraftsChanged={refreshDrafts} />

            <section className="app-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Library overview</h2>
                  <p className="text-sm text-muted-foreground">
                    Search, filter, and reopen any saved draft from one place.
                  </p>
                </div>
                <span className="app-pill app-pill-muted">{data?.drafts.length} drafts</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                <div className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Available</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{draftCount}</div>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Favorites</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{favoritesCount}</div>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Genres</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{genresCount}</div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <History className="h-3.5 w-3.5" />
                      Recent restore points
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Open the latest saved restore points directly from the library overview when you need a fast diff
                      drilldown.
                    </p>
                  </div>
                  <span className="app-pill app-pill-muted">{recentRevisionSnapshots.length} visible</span>
                </div>

                {recentRevisionSnapshots.length === 0 ? (
                  <div className="mt-3 rounded-lg border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
                    No restore points saved yet.
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {recentRevisionSnapshots.map(({ draftId, draftName, snapshot }) => (
                      <div key={snapshot.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              to={`/drafts/${encodeURIComponent(draftId)}?historySnapshot=${encodeURIComponent(snapshot.id)}`}
                              className="text-sm font-semibold text-foreground hover:underline"
                            >
                              {snapshot.label || 'Restore point'}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {draftName} Ã‚Â· {formatTimestamp(snapshot.created_at)}
                            </p>
                            {snapshot.reason && <p className="mt-1 text-xs text-muted-foreground">{snapshot.reason}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSnapshotPreviewId(snapshot.id)}
                              className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${selectedSnapshotPreviewId === snapshot.id ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border/60 bg-background/70 text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                            >
                              {selectedSnapshotPreviewId === snapshot.id ? 'Previewing' : 'Preview here'}
                            </button>
                            <div className="text-xs text-muted-foreground">
                              {Object.keys(snapshot.state.assets).length} assets
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {renderSelectedSnapshotPreview()}
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-lg border border-border bg-background/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <History className="h-3.5 w-3.5" />
                      Recent merge events
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Scan recent branch merges without reopening the workbench first.
                    </p>
                  </div>
                  <span className="app-pill app-pill-muted">{recentMergeEvents.length} visible</span>
                </div>

                {recentMergeEvents.length === 0 ? (
                  <div className="mt-3 rounded-lg border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
                    No merge events recorded yet.
                  </div>
                ) : (
                  <div className="mt-3 space-y-3">
                    {recentMergeEvents.map(({ draftId, draftName, entry }) => {
                      const sourceName = draftNameById.get(entry.source_draft_id) ?? entry.source_draft_id;
                      const baseName = draftNameById.get(entry.base_draft_id) ?? entry.base_draft_id;
                      const hasUndo = Boolean(entry.undo_snapshot_id);
                      return (
                        <div key={entry.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={`/drafts/${encodeURIComponent(draftId)}`}
                                className="text-sm font-semibold text-foreground hover:underline"
                              >
                                {draftName}
                              </Link>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {entry.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge'} Ã‚Â·{' '}
                                {formatTimestamp(entry.created_at)}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Source: {sourceName} ({entry.source_side}) Ã‚Â· Base: {baseName} ({entry.base_side})
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Assets: {entry.asset_names.join(', ')}
                              </p>
                              {hasUndo && (
                                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                                  Undo available via safeguard snapshot.
                                </p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Link
                                to={`/drafts/${encodeURIComponent(draftId)}`}
                                className="app-button app-button-secondary"
                              >
                                Open merged draft
                              </Link>
                              {hasUndo && entry.undo_snapshot_id && (
                                <Link
                                  to={`/drafts/${encodeURIComponent(draftId)}?historySnapshot=${encodeURIComponent(entry.undo_snapshot_id)}`}
                                  className="app-button app-button-secondary"
                                >
                                  Open undo snapshot
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {!selfContainedDesktop && (
              <CollapsibleSection
                title="Sync"
                subtitle="Cross-device draft sync and merge controls"
                preview="Secondary"
                className="app-panel"
              >
                <SyncControls
                  dataType="drafts"
                  label="Drafts"
                  onGetLocalData={async () => JSON.parse(await DraftStorage.exportAll())}
                  onApplyData={async (payload) => {
                    if (payload && typeof payload === 'object' && 'drafts' in payload) {
                      await DraftStorage.import(JSON.stringify(payload), { conflictStrategy: 'merge' });
                      queryClient.invalidateQueries({ queryKey: ['drafts'] });
                    }
                  }}
                />
              </CollapsibleSection>
            )}
          </div>
        </div>
      )}

      {activeTab === 'seeds' && (
        <LibrarySeedsTab
          favoriteSeeds={favoriteSeeds}
          seedHistory={seedHistory}
          archivedFavoriteSeeds={archivedFavoriteSeeds}
          archivedSeedRuns={archivedSeedRuns}
          selfContainedDesktop={selfContainedDesktop}
          onArchiveFavoriteSeed={handleArchiveFavoriteSeed}
          onArchiveSeedRun={handleArchiveSeedRun}
          onRefreshSeedData={refreshSeedData}
        />
      )}

      {activeTab === 'archive' && (
        <LibraryArchiveTab
          archivedDraftCount={archivedDraftCount}
          archivedDrafts={archivedDraftData?.drafts ?? []}
          archivedDraftsLoading={archivedDraftsLoading}
          archivedDraftError={archivedDraftError}
          archivedFavoriteSeeds={archivedFavoriteSeeds}
          archivedSeedRuns={archivedSeedRuns}
          onRestoreDraft={handleRestoreDraft}
          onDeleteDraft={handleDeleteDraft}
          onRestoreFavoriteSeed={handleRestoreFavoriteSeed}
          onDeleteArchivedFavoriteSeed={handleDeleteArchivedFavoriteSeed}
          onRestoreSeedRun={handleRestoreSeedRun}
          onDeleteArchivedSeedRun={handleDeleteArchivedSeedRun}
        />
      )}
      {activeTab === 'worlds' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="app-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">World library</h2>
                <p className="text-sm text-muted-foreground">
                  Shared setting data still sits in a staged state, but the library now gives it a dedicated shelf.
                </p>
              </div>
              <span className="app-pill app-pill-muted">Planned</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Worlds</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">0</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Modules</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{WORLD_MODULES.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Draft branches</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{branchCount}</div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
              Shared canon, factions, locations, and event state are still intentionally gated until they have real
              persistence and cross-draft behavior.
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/worlds" className="app-button app-button-secondary">
                Open Worlds route
              </Link>
              <Link to="/events" className="app-button app-button-secondary">
                Open Events route
              </Link>
            </div>
          </section>

          <section className="app-panel p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Planned world modules</h2>
                <p className="text-sm text-muted-foreground">
                  These stay visible here as placeholders so the library reflects the intended long-term structure.
                </p>
              </div>
              <span className="app-pill app-pill-muted">Staged</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {WORLD_MODULES.map(({ label, icon: Icon }) => (
                <div key={label} className="app-panel-muted flex items-center gap-3 p-3">
                  <div className="rounded-lg border border-border/60 bg-background/60 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-medium text-foreground">{label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'timelines' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <GenerationHistoryPanel drafts={data?.drafts ?? []} />

          <section className="app-panel border-dashed p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Timeline modules</h2>
                <p className="text-sm text-muted-foreground">
                  Draft history is already live. Event editing and continuity tooling remain staged until the timeline
                  model is real.
                </p>
              </div>
              <span className="app-pill app-pill-muted">Partial</span>
            </div>

            <div className="space-y-3">
              {TIMELINE_MODULES.map((module) => (
                <article key={module.name} className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{module.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>
                    </div>
                    <span className="app-pill app-pill-muted">{module.status}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Branches</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{branchCount}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Events</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">0</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Conflicts</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">0</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/timelines" className="app-button app-button-secondary">
                Open timeline route
              </Link>
              <Link to="/lineage" className="app-button app-button-secondary">
                Open lineage
              </Link>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'workbench' && hasDrafts && (
        <section data-tour-anchor="drafts-workbench" className="app-panel p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Workbench</h2>
              <p className="text-sm text-muted-foreground">Compare drafts and inspect the active one.</p>
            </div>
            <span className="app-pill app-pill-muted">{draftCount} drafts</span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <DraftComparisonPanel
              leftDraftId={leftDraftId}
              rightDraftId={rightDraftId}
              draftOptions={data?.drafts}
              onLeftDraftChange={setLeftDraftId}
              onRightDraftChange={setRightDraftId}
            />
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Workbench inspector
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      Checklist and version activity can stay on the left draft or follow the selected preview side.
                    </div>
                  </div>
                  <div className="inline-flex rounded-md border border-border/60 bg-background/70 p-1">
                    <button
                      type="button"
                      onClick={() => setWorkbenchPanelSource('left')}
                      className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPanelSource === 'left' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Left draft
                    </button>
                    <button
                      type="button"
                      onClick={() => setWorkbenchPanelSource('preview')}
                      className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPanelSource === 'preview' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Follow preview side
                    </button>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                  Inspecting <span className="font-medium text-foreground">{activeWorkbenchPanelDraftLabel}</span>
                  {workbenchPanelSource === 'preview'
                    ? ` from the ${workbenchPreviewSide} preview side`
                    : ' from the left comparison side'}
                  .
                </div>
              </div>

              <ReviewChecklistPanel draftId={activeWorkbenchPanelDraftId} />
              <VersionHistoryPanel draftId={activeWorkbenchPanelDraftId} />
            </div>
            {workbenchPreviewSnapshots.length > 0 && (
              <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground lg:col-span-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Workbench restore points
                    </div>
                    <div className="mt-1 text-sm text-foreground">
                      Open the latest restore points for the selected comparison side without leaving the workbench.
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-md border border-border/60 bg-background/70 p-1">
                      <button
                        type="button"
                        onClick={() => setWorkbenchPreviewSide('left')}
                        className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPreviewSide === 'left' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Left draft
                      </button>
                      <button
                        type="button"
                        onClick={() => setWorkbenchPreviewSide('right')}
                        disabled={!rightDraftId}
                        className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPreviewSide === 'right' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'} disabled:opacity-40`}
                      >
                        Right draft
                      </button>
                    </div>
                    <span className="app-pill app-pill-muted">{workbenchPreviewSnapshots.length} snapshots</span>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
                  Previewing restore points for{' '}
                  <span className="font-medium text-foreground">{workbenchPreviewDraftLabel}</span> on the{' '}
                  {workbenchPreviewSide} comparison side.
                </div>

                <div className="mt-3 space-y-2">
                  {workbenchPreviewSnapshots.map(({ draftId, snapshot }) => (
                    <div
                      key={snapshot.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">{snapshot.label || 'Restore point'}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatTimestamp(snapshot.created_at)}
                          {snapshot.reason ? ` Ã‚Â· ${snapshot.reason}` : ''}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSnapshotPreviewId(snapshot.id)}
                          className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${selectedSnapshotPreviewId === snapshot.id ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border/60 bg-background/70 text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                        >
                          {selectedSnapshotPreviewId === snapshot.id ? 'Previewing' : 'Preview here'}
                        </button>
                        <Link
                          to={`/drafts/${encodeURIComponent(draftId)}?historySnapshot=${encodeURIComponent(snapshot.id)}`}
                          className="app-button app-button-secondary"
                        >
                          Open snapshot diff
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {renderSelectedSnapshotPreview()}
              </div>
            )}
            <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground lg:col-span-2">
              Restore-point preview can follow either comparison side, and the inspector panels can now either stay on
              the left draft or follow that preview side. Open any draft from the library tab when you want to jump back
              into full review.
            </div>
          </div>
        </section>
      )}

      {showCreateDraftModal && templates.length > 0 && (
        <ManualDraftCreateModal
          templates={templates}
          onClose={closeCreateDraftModal}
          onCreate={handleCreateDraft}
          isSubmitting={createDraftMutation.isPending}
          error={createDraftMutation.error instanceof Error ? createDraftMutation.error.message : null}
        />
      )}
    </div>
  );
}
