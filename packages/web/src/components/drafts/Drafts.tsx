import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FolderOpen, Upload } from 'lucide-react';
import { api, type CreateDraftRequest } from '@/lib/api';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
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
import LibraryArchiveTab from './LibraryArchiveTab';
import LibraryDraftsTab from './LibraryDraftsTab';
import LibrarySeedsTab from './LibrarySeedsTab';
import LibraryWorkbenchTab from './LibraryWorkbenchTab';
import ManualDraftCreateModal from './ManualDraftCreateModal';
import SnapshotPreviewPanel from './SnapshotPreviewPanel';

type LibraryTab = 'drafts' | 'seeds' | 'archive' | 'worlds' | 'timelines' | 'workbench';

const LIBRARY_TABS: Array<{ id: LibraryTab; label: string }> = [
  { id: 'drafts', label: 'Drafts' },
  { id: 'seeds', label: 'Seeds' },
  { id: 'archive', label: 'Archive' },
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

export default function Drafts() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [leftDraftId, setLeftDraftId] = useState<string>('');
  const [rightDraftId, setRightDraftId] = useState<string>('');
  const [workbenchPreviewSide, setWorkbenchPreviewSide] = useState<'left' | 'right'>('left');
  const [workbenchPanelSource, setWorkbenchPanelSource] = useState<'left' | 'preview'>('left');
  const [selectedSnapshotPreviewId, setSelectedSnapshotPreviewId] = useState<string>('');
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
    // Only fall back once the draft query has settled: reading `data?.drafts.length`
    // while it is still loading would bounce a `?tab=workbench` deep link to drafts.
    if (!data) {
      return;
    }

    if (!data.drafts.length && activeTab === 'workbench') {
      setActiveTab('drafts');
    }
  }, [activeTab, data, setActiveTab]);

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
              ? 'border-success/50 bg-success/10 text-success'
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
            ×
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
        <LibraryDraftsTab
          drafts={data?.drafts ?? []}
          isLoading={isLoading}
          draftWorldLinksByDraftId={draftWorldLinksByDraftId}
          draftCount={draftCount}
          favoritesCount={favoritesCount}
          genresCount={genresCount}
          recentRevisionSnapshots={recentRevisionSnapshots}
          recentMergeEvents={recentMergeEvents}
          draftNameById={draftNameById}
          selectedSnapshotPreviewId={selectedSnapshotPreviewId}
          onSelectSnapshotPreviewId={setSelectedSnapshotPreviewId}
          onSelectSnapshotPreview={handleSelectSnapshotPreview}
          onDraftsChanged={refreshDrafts}
          selfContainedDesktop={selfContainedDesktop}
          snapshotPreview={
            <SnapshotPreviewPanel
              entries={selectedSnapshotPreviewEntries}
              selectedSnapshotPreviewId={selectedSnapshotPreviewId}
              onSelectedSnapshotPreviewIdChange={setSelectedSnapshotPreviewId}
            />
          }
        />
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

      {activeTab === 'workbench' && hasDrafts && (
        <LibraryWorkbenchTab
          draftCount={draftCount}
          drafts={data?.drafts}
          leftDraftId={leftDraftId}
          rightDraftId={rightDraftId}
          onLeftDraftChange={setLeftDraftId}
          onRightDraftChange={setRightDraftId}
          workbenchPanelSource={workbenchPanelSource}
          onWorkbenchPanelSourceChange={setWorkbenchPanelSource}
          workbenchPreviewSide={workbenchPreviewSide}
          onWorkbenchPreviewSideChange={setWorkbenchPreviewSide}
          activeWorkbenchPanelDraftId={activeWorkbenchPanelDraftId}
          activeWorkbenchPanelDraftLabel={activeWorkbenchPanelDraftLabel}
          workbenchPreviewDraftLabel={workbenchPreviewDraftLabel}
          workbenchPreviewSnapshots={workbenchPreviewSnapshots}
          selectedSnapshotPreviewId={selectedSnapshotPreviewId}
          onSelectSnapshotPreviewId={setSelectedSnapshotPreviewId}
          snapshotPreview={
            <SnapshotPreviewPanel
              entries={selectedSnapshotPreviewEntries}
              selectedSnapshotPreviewId={selectedSnapshotPreviewId}
              onSelectedSnapshotPreviewIdChange={setSelectedSnapshotPreviewId}
            />
          }
        />
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
