import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { FolderOpen, Upload, CheckCircle2, AlertTriangle, BookOpen, Globe, Lock, MapPin, ShieldCheck, Star, Users, Archive, RotateCcw, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import SyncControls from '../common/SyncControls';
import { DraftStorage } from '@/lib/storage/draft-db';
import { useGuidedTour } from '../common/GuidedTourContext';
import { DRAFT_LIBRARY_TOUR_ID } from '@/lib/help';
import {
  archiveFavoriteSeed,
  archiveSeedRun,
  deleteArchivedFavoriteSeed,
  deleteArchivedSeedRun,
  getAllFavoriteSeeds,
  getArchivedFavoriteSeeds,
  getArchivedSeedRuns,
  getFavoriteSeeds,
  getSeedRunHistory,
  hydrateArchivedSeedRunsFromServer,
  hydrateFavoriteSeedsFromServer,
  parseFavoriteSeedsPayload,
  replaceFavoriteSeedsFromServer,
  restoreFavoriteSeed,
  restoreSeedRun,
  SEED_FAVORITES_CHANGED_EVENT,
  SEED_HISTORY_CHANGED_EVENT,
  type FavoriteSeedRecord,
  type SeedRunRecord,
} from '@/lib/seed-generator';
import { queueAutoSync } from '@/lib/server/auto-sync';
import { DraftListSidebar } from './DraftListSidebar';
import { DraftComparisonPanel } from './DraftComparisonPanel';
import { ReviewChecklistPanel } from './ReviewChecklistPanel';
import { VersionHistoryPanel } from './VersionHistoryPanel';
import { GenerationHistoryPanel } from '../timelines/GenerationHistoryPanel';

type LibraryTab = 'drafts' | 'seeds' | 'archive' | 'worlds' | 'timelines' | 'workbench';

const LIBRARY_TABS: Array<{ id: LibraryTab; label: string }> = [
  { id: 'drafts', label: 'Drafts' },
  { id: 'seeds', label: 'Seeds' },
  { id: 'archive', label: 'Archive' },
  { id: 'worlds', label: 'Worlds' },
  { id: 'timelines', label: 'Timelines' },
  { id: 'workbench', label: 'Workbench' },
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
  return LIBRARY_TABS.some((tab) => tab.id === value);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [leftDraftId, setLeftDraftId] = useState<string>('');
  const [rightDraftId, setRightDraftId] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [favoriteSeeds, setFavoriteSeeds] = useState<FavoriteSeedRecord[]>(() => getFavoriteSeeds());
  const [archivedFavoriteSeeds, setArchivedFavoriteSeeds] = useState<FavoriteSeedRecord[]>(() => getArchivedFavoriteSeeds());
  const [seedHistory, setSeedHistory] = useState<SeedRunRecord[]>(() => getSeedRunHistory());
  const [archivedSeedRuns, setArchivedSeedRuns] = useState<SeedRunRecord[]>(() => getArchivedSeedRuns());
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { isTourCompleted, restartTour, startTour } = useGuidedTour();
  const queryClient = useQueryClient();
  const requestedTab = searchParams.get('tab');
  const activeTab: LibraryTab = isLibraryTab(requestedTab) ? requestedTab : 'drafts';

  const { data, isLoading, error } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

  const { data: archivedDraftData, isLoading: archivedDraftsLoading, error: archivedDraftError } = useQuery({
    queryKey: ['drafts', 'archived'],
    queryFn: () => api.getDrafts({ archived: true }),
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

  const archiveDraftMutation = useMutation({
    mutationFn: (reviewId: string) => api.archiveDraft(reviewId),
    onSuccess: async () => {
      await refreshDraftQueries();
    },
  });

  const restoreDraftMutation = useMutation({
    mutationFn: (reviewId: string) => api.restoreDraft(reviewId),
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

  const setActiveTab = (tab: LibraryTab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === 'drafts') {
      nextParams.delete('tab');
    } else {
      nextParams.set('tab', tab);
    }
    setSearchParams(nextParams, { replace: true });
  };

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
    let cancelled = false;

    const hydrateSeedArchives = async () => {
      try {
        await Promise.all([
          hydrateFavoriteSeedsFromServer(),
          hydrateArchivedSeedRunsFromServer(),
        ]);
      } catch (hydrateError) {
        console.warn('Failed to hydrate archived seed data from server:', hydrateError);
      }

      if (!cancelled) {
        refreshSeedData();
      }
    };

    window.addEventListener(SEED_FAVORITES_CHANGED_EVENT, refreshSeedData);
    window.addEventListener(SEED_HISTORY_CHANGED_EVENT, refreshSeedData);
    window.addEventListener('storage', refreshSeedData);
    void hydrateSeedArchives();

    return () => {
      cancelled = true;
      window.removeEventListener(SEED_FAVORITES_CHANGED_EVENT, refreshSeedData);
      window.removeEventListener(SEED_HISTORY_CHANGED_EVENT, refreshSeedData);
      window.removeEventListener('storage', refreshSeedData);
    };
  }, []);

  useEffect(() => {
    if (!data?.drafts.length && activeTab === 'workbench') {
      setActiveTab('drafts');
    }
  }, [activeTab, data?.drafts.length, searchParams]);

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

  const hasDrafts = data?.drafts.length > 0;
  const draftCount = data?.stats?.total_drafts ?? data?.drafts.length ?? 0;
  const archivedDraftCount = archivedDraftData?.drafts.length ?? data?.stats?.archived_drafts ?? 0;
  const favoritesCount = data?.stats?.favorites ?? 0;
  const genresCount = data?.stats ? Object.keys(data.stats.by_genre).length : 0;
  const branchCount = (data?.drafts ?? []).filter((draft) => (draft.parent_drafts?.length ?? 0) > 0).length;
  const recentFavoriteSeeds = favoriteSeeds.slice(0, 6);
  const recentSeedRuns = seedHistory.slice(0, 4);
  const recentArchivedFavoriteSeeds = archivedFavoriteSeeds.slice(0, 6);
  const recentArchivedSeedRuns = archivedSeedRuns.slice(0, 6);

  const activeWorkbenchDraftId = leftDraftId || data?.drafts[0]?.review_id;

  async function handleImportDrafts(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const result = await DraftStorage.import(text);
      await refreshDraftQueries();
      const remapMessage = result.remapped > 0
        ? ` (${result.remapped} review IDs remapped to avoid overwriting existing drafts)`
        : '';
      setNotice({ type: 'success', message: `Imported ${result.imported} drafts from ${file.name}${remapMessage}` });
    } catch (error) {
      setNotice({
        type: 'error',
        message: error instanceof Error ? error.message : 'Draft import failed',
      });
    }

    event.target.value = '';
  }

  async function handleArchiveDraft(reviewId: string) {
    await archiveDraftMutation.mutateAsync(reviewId);
  }

  async function handleRestoreDraft(reviewId: string) {
    await restoreDraftMutation.mutateAsync(reviewId);
  }

  async function handleDeleteDraft(reviewId: string) {
    await deleteDraftMutation.mutateAsync(reviewId);
  }

  function handleArchiveFavoriteSeed(seed: string) {
    archiveFavoriteSeed(seed);
    refreshSeedData();
    queueAutoSync('seeds');
  }

  function handleRestoreFavoriteSeed(seed: string) {
    restoreFavoriteSeed(seed);
    refreshSeedData();
    queueAutoSync('seeds');
  }

  function handleDeleteArchivedFavoriteSeed(seed: string) {
    deleteArchivedFavoriteSeed(seed);
    refreshSeedData();
    queueAutoSync('seeds');
  }

  function handleArchiveSeedRun(id: string) {
    archiveSeedRun(id);
    refreshSeedData();
    queueAutoSync('seeds');
  }

  function handleRestoreSeedRun(id: string) {
    restoreSeedRun(id);
    refreshSeedData();
    queueAutoSync('seeds');
  }

  function handleDeleteArchivedSeedRun(id: string) {
    deleteArchivedSeedRun(id);
    refreshSeedData();
    queueAutoSync('seeds');
  }

  return (
    <div className="app-page space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Library</p>
            <h1 className="app-page-title">Browse saved work</h1>
            <p className="app-page-summary">
              Keep drafts, favorite seeds, world scaffolding, and timeline history in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/generate" className="app-button app-button-primary">
                Generate another draft
              </Link>
              <Link to="/seed-generator" className="app-button app-button-secondary">
                Seed generator
              </Link>
              <Link to="/validation" className="app-button app-button-secondary">
                Validation
              </Link>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="app-button app-button-secondary"
              >
                <Upload className="h-4 w-4" />
                Upload drafts
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json,text/markdown,.md,text/plain,.txt"
                onChange={handleImportDrafts}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => (isTourCompleted(DRAFT_LIBRARY_TOUR_ID) ? restartTour(DRAFT_LIBRARY_TOUR_ID) : startTour(DRAFT_LIBRARY_TOUR_ID))}
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
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <div className={`app-note flex items-start gap-3 px-4 py-3 ${
          notice.type === 'success'
            ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
            : 'border-destructive/50 bg-destructive/10 text-destructive'
        }`}>
          {notice.type === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          )}
          <span className="text-sm">{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="ml-auto opacity-50 hover:opacity-100"
          >
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
              disabled={tab.id === 'workbench' && !hasDrafts}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {!hasDrafts && activeTab === 'drafts' && (
        <div className="app-panel p-8 text-center">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No drafts yet</h3>
          <p className="text-muted-foreground">
            Generate your first character to get started
          </p>
          <Link
            to="/generate"
            data-tour-anchor="drafts-open-review"
            className="app-button app-button-primary mt-4"
          >
            Generate Character
          </Link>
        </div>
      )}

      {activeTab === 'drafts' && hasDrafts && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <section className="app-panel min-w-0 overflow-hidden p-0 xl:max-h-[calc(100vh-18rem)]" data-tour-anchor="drafts-open-review">
            <DraftListSidebar drafts={data?.drafts ?? []} isLoading={isLoading} />
          </section>

          <div className="min-w-0 space-y-4">
            <div className="app-panel p-4">
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
            </div>

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
            </section>
          </div>
        </div>
      )}

      {activeTab === 'seeds' && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="app-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Favorite seeds</h2>
                <p className="text-sm text-muted-foreground">
                  Keep reusable concepts close to the review flow instead of bouncing back to the generator.
                </p>
              </div>
              <span className="app-pill app-pill-muted">{favoriteSeeds.length} saved</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Favorites</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{favoriteSeeds.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent runs</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{seedHistory.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Archived</div>
                <div className="mt-1 text-sm font-semibold text-foreground">
                  {archivedFavoriteSeeds.length} seeds · {archivedSeedRuns.length} runs
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-background/40 p-4">
              <SyncControls
                dataType="seeds"
                label="Favorite seeds"
                onGetLocalData={() => ({ seeds: getAllFavoriteSeeds() })}
                onApplyData={(payload) => {
                  const parsed = parseFavoriteSeedsPayload(payload);
                  if (parsed) {
                    replaceFavoriteSeedsFromServer(parsed);
                    refreshSeedData();
                  }
                }}
              />
            </div>

            {recentFavoriteSeeds.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-center">
                <Star className="mx-auto h-10 w-10 text-muted-foreground" />
                <h3 className="mt-3 text-lg font-semibold">No favorite seeds yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate concepts in the seed generator, then star the ones worth keeping in the library.
                </p>
                <Link to="/seed-generator" className="app-button app-button-primary mt-4">
                  Open Seed Generator
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentFavoriteSeeds.map((entry) => (
                  <article key={`${entry.seed}-${entry.addedAt}`} className="rounded-lg border border-border bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-amber-600 dark:text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          Favorite Seed
                        </div>
                        <p className="mt-2 text-sm text-foreground">{entry.seed}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Added {formatTimestamp(entry.addedAt)}{entry.lastUsedAt ? ` · Last used ${formatTimestamp(entry.lastUsedAt)}` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Link to="/generate" state={{ seed: entry.seed }} className="app-button app-button-secondary">
                          Use seed
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleArchiveFavoriteSeed(entry.seed)}
                          className="app-button app-button-secondary"
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="app-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Seed run history</h2>
                <p className="text-sm text-muted-foreground">
                  Recent batches stay visible here so it is easier to reuse concepts during review.
                </p>
              </div>
              <Link to="/seed-generator" className="app-button app-button-secondary">
                Open generator
              </Link>
            </div>

            {recentSeedRuns.length === 0 ? (
              <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
                No recent seed runs yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentSeedRuns.map((entry) => (
                  <article key={entry.id} className="rounded-lg border border-border bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{entry.seeds.length} generated seeds</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.request.count} requested · {entry.request.coverageMode} · {formatTimestamp(entry.createdAt)}
                        </p>
                      </div>
                      <span className="app-pill app-pill-muted">Run</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {entry.seeds.slice(0, 3).map((seed) => (
                        <div key={seed} className="rounded-md border border-border bg-background/60 px-3 py-2">
                          {seed}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleArchiveSeedRun(entry.id)}
                        className="app-button app-button-secondary"
                      >
                        <Archive className="h-4 w-4" />
                        Archive run
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {activeTab === 'archive' && (
        <div className="space-y-4">
          <section className="app-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Archive</h2>
                <p className="text-sm text-muted-foreground">
                  Keep source material recoverable without leaving it in the active library.
                </p>
              </div>
              <span className="app-pill app-pill-muted">
                {archivedDraftCount + archivedFavoriteSeeds.length + archivedSeedRuns.length} archived items
              </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Drafts</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{archivedDraftCount}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Favorite seeds</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{archivedFavoriteSeeds.length}</div>
              </div>
              <div className="rounded-lg border border-border bg-background/60 p-4">
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Seed runs</div>
                <div className="mt-1 text-2xl font-semibold text-foreground">{archivedSeedRuns.length}</div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="app-panel p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Archived drafts</h2>
                  <p className="text-sm text-muted-foreground">
                    Restore archived drafts back into the active workspace or remove them permanently.
                  </p>
                </div>
              </div>

              {archivedDraftsLoading ? (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
                  Loading archived drafts...
                </div>
              ) : archivedDraftError ? (
                <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  Error loading archive: {archivedDraftError.message}
                </div>
              ) : (archivedDraftData?.drafts.length ?? 0) === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
                  No archived drafts yet.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {(archivedDraftData?.drafts ?? []).map((draft) => (
                    <article key={draft.review_id} className="rounded-lg border border-border bg-background/50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <Link to={`/drafts/${encodeURIComponent(draft.review_id)}`} className="text-sm font-semibold text-foreground hover:underline">
                            {draft.character_name || draft.seed}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Archived {formatTimestamp(draft.archived_at)}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{draft.seed}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => void handleRestoreDraft(draft.review_id)}
                            className="app-button app-button-secondary"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDeleteDraft(draft.review_id)}
                            className="app-button app-button-secondary text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="app-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Archived favorite seeds</h2>
                    <p className="text-sm text-muted-foreground">
                      Restore saved concepts when you want them back in the active seed shelf.
                    </p>
                  </div>
                </div>

                {recentArchivedFavoriteSeeds.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
                    No archived favorite seeds yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {recentArchivedFavoriteSeeds.map((entry) => (
                      <article key={`${entry.seed}-${entry.archivedAt}`} className="rounded-lg border border-border bg-background/50 p-4">
                        <p className="text-sm text-foreground">{entry.seed}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Archived {formatTimestamp(entry.archivedAt)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestoreFavoriteSeed(entry.seed)}
                            className="app-button app-button-secondary"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                          <Link to="/generate" state={{ seed: entry.seed }} className="app-button app-button-secondary">
                            Use seed
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteArchivedFavoriteSeed(entry.seed)}
                            className="app-button app-button-secondary text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <div className="app-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Archived seed runs</h2>
                    <p className="text-sm text-muted-foreground">
                      Restore old batches back into the active recent history or remove them permanently.
                    </p>
                  </div>
                </div>

                {recentArchivedSeedRuns.length === 0 ? (
                  <div className="mt-4 rounded-lg border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
                    No archived seed runs yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {recentArchivedSeedRuns.map((entry) => (
                      <article key={entry.id} className="rounded-lg border border-border bg-background/50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{entry.seeds.length} generated seeds</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Archived {formatTimestamp(entry.archivedAt)}
                            </p>
                          </div>
                          <span className="app-pill app-pill-muted">Archived run</span>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{entry.request.genreLines}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleRestoreSeedRun(entry.id)}
                            className="app-button app-button-secondary"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteArchivedSeedRun(entry.id)}
                            className="app-button app-button-secondary text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
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
              Shared canon, factions, locations, and event state are still intentionally gated until they have real persistence and cross-draft behavior.
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
                  Draft history is already live. Event editing and continuity tooling remain staged until the timeline model is real.
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
              <p className="text-sm text-muted-foreground">
                Compare drafts and inspect the active one.
              </p>
            </div>
            <span className="app-pill app-pill-muted">
              {draftCount} drafts
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <DraftComparisonPanel
              leftDraftId={leftDraftId}
              rightDraftId={rightDraftId}
              draftOptions={data?.drafts}
              onLeftDraftChange={setLeftDraftId}
              onRightDraftChange={setRightDraftId}
            />
            <ReviewChecklistPanel draftId={activeWorkbenchDraftId} />
            <VersionHistoryPanel draftId={activeWorkbenchDraftId} />
            <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground lg:col-span-2">
              The workbench follows the left comparison draft for checklist and activity panels. Open any draft from the library tab when you want to jump back into full review.
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
