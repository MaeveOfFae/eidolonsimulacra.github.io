import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Globe, Search, Star, X, Filter, SortAsc, SortDesc, Clock, Heart, FileText, Layers } from 'lucide-react';
import type { DraftMetadata, WorldCharacterDraftLinkRecord } from '@char-gen/shared';
import { buildDraftLibraryBadges } from '@/lib/drafts/export-readiness';
import { getLatestDraftSnapshotSummary } from '@/lib/drafts/revision-snapshots';
import { cn } from '@/utils/cn';

export interface DraftListSidebarProps {
  drafts: DraftMetadata[];
  isLoading?: boolean;
  draftWorldLinksByDraftId?: Map<string, WorldCharacterDraftLinkRecord>;
  activeSnapshotPreviewId?: string;
  onSelectSnapshotPreview?: (draftId: string, snapshotId: string) => void;
}

type SortField = 'created' | 'modified' | 'name';
type SortOrder = 'asc' | 'desc';
type MergeStrategyFilter = '' | 'single-asset' | 'staged-merge';

function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ');
}

export function DraftListSidebar({
  drafts,
  isLoading,
  draftWorldLinksByDraftId,
  activeSnapshotPreviewId,
  onSelectSnapshotPreview,
}: DraftListSidebarProps) {
  const location = useLocation();
  const reviewMatch = location.pathname.match(/^\/drafts\/([^/]+)$/);
  const currentDraftId = reviewMatch ? decodeURIComponent(reviewMatch[1]) : null;

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [mergedOnly, setMergedOnly] = useState(false);
  const [undoableOnly, setUndoableOnly] = useState(false);
  const [selectedMergeStrategy, setSelectedMergeStrategy] = useState<MergeStrategyFilter>('');
  const [selectedMode, setSelectedMode] = useState<string>('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('modified');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Extract unique genres and modes from drafts
  const { genres, modes } = useMemo(() => {
    const genreSet = new Set<string>();
    const modeSet = new Set<string>();

    drafts.forEach((draft) => {
      if (draft.genre) genreSet.add(draft.genre);
      if (draft.mode) modeSet.add(draft.mode);
    });

    return {
      genres: Array.from(genreSet).sort(),
      modes: Array.from(modeSet).sort(),
    };
  }, [drafts]);

  // Filter and sort drafts
  const filteredDrafts = useMemo(() => {
    let result = [...drafts];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (draft) =>
          draft.character_name?.toLowerCase().includes(searchLower) ||
          draft.seed.toLowerCase().includes(searchLower) ||
          draft.template_name?.toLowerCase().includes(searchLower) ||
          draft.notes?.toLowerCase().includes(searchLower),
      );
    }

    // Favorites filter
    if (favoritesOnly) {
      result = result.filter((draft) => draft.favorite);
    }

    if (mergedOnly) {
      result = result.filter((draft) => Boolean((draft.merge_history?.length ?? 0) > 0 || draft.merge_provenance));
    }

    if (undoableOnly) {
      result = result.filter((draft) => Boolean(draft.merge_history?.some((entry) => Boolean(entry.undo_snapshot_id))));
    }

    if (selectedMergeStrategy) {
      result = result.filter((draft) => {
        const mergeStrategies = draft.merge_history?.length
          ? draft.merge_history.map((entry) => entry.strategy)
          : draft.merge_provenance
            ? [draft.merge_provenance.strategy]
            : [];

        return mergeStrategies.includes(selectedMergeStrategy);
      });
    }

    // Mode filter
    if (selectedMode) {
      result = result.filter((draft) => draft.mode === selectedMode);
    }

    // Genre filter
    if (selectedGenre) {
      result = result.filter((draft) => draft.genre === selectedGenre);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'created': {
          const aDate = a.created ? new Date(a.created).getTime() : 0;
          const bDate = b.created ? new Date(b.created).getTime() : 0;
          comparison = aDate - bDate;
          break;
        }
        case 'modified': {
          const aDate = a.modified ? new Date(a.modified).getTime() : a.created ? new Date(a.created).getTime() : 0;
          const bDate = b.modified ? new Date(b.modified).getTime() : b.created ? new Date(b.created).getTime() : 0;
          comparison = aDate - bDate;
          break;
        }
        case 'name': {
          const aName = a.character_name || a.seed;
          const bName = b.character_name || b.seed;
          comparison = aName.localeCompare(bName);
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    drafts,
    search,
    favoritesOnly,
    mergedOnly,
    undoableOnly,
    selectedMergeStrategy,
    selectedMode,
    selectedGenre,
    sortField,
    sortOrder,
  ]);

  const hasMergeRecords = useMemo(
    () => drafts.some((draft) => Boolean((draft.merge_history?.length ?? 0) > 0 || draft.merge_provenance)),
    [drafts],
  );
  const hasUndoableMergeRecords = useMemo(
    () => drafts.some((draft) => draft.merge_history?.some((entry) => Boolean(entry.undo_snapshot_id))),
    [drafts],
  );
  const hasActiveFilters =
    search || favoritesOnly || mergedOnly || undoableOnly || selectedMergeStrategy || selectedMode || selectedGenre;
  const activeFilterCount =
    Number(Boolean(search)) +
    Number(favoritesOnly) +
    Number(mergedOnly) +
    Number(undoableOnly) +
    Number(Boolean(selectedMergeStrategy)) +
    Number(Boolean(selectedMode)) +
    Number(Boolean(selectedGenre));

  const clearFilters = () => {
    setSearch('');
    setFavoritesOnly(false);
    setMergedOnly(false);
    setUndoableOnly(false);
    setSelectedMergeStrategy('');
    setSelectedMode('');
    setSelectedGenre('');
  };

  const stats = useMemo(() => {
    const total = drafts.length;
    const favorites = drafts.filter((d) => d.favorite).length;
    return { total, favorites };
  }, [drafts]);
  const draftNameById = useMemo(
    () => new Map(drafts.map((draft) => [draft.review_id, draft.character_name || draft.seed] as const)),
    [drafts],
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/60 px-3 py-2.5">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Draft Library</h3>
        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{stats.total} drafts</span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {stats.favorites}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-border/40 px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search drafts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-8 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter toggle and sort */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex max-w-full items-center gap-1">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            title="Sort by"
            className="max-w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
          >
            <option value="modified">Modified</option>
            <option value="created">Created</option>
            <option value="name">Name</option>
          </select>
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="rounded-md border border-input p-1 hover:bg-accent/50"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <SortDesc className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="grid gap-2 border-b border-border/40 bg-muted/20 px-3 py-2 sm:grid-cols-2">
          <label className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-2 text-xs">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="rounded border-input"
            />
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            Favorites only
          </label>

          <label className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-2 text-xs">
            <input
              type="checkbox"
              checked={mergedOnly}
              onChange={(e) => setMergedOnly(e.target.checked)}
              className="rounded border-input"
            />
            <Layers className="h-3.5 w-3.5 text-primary" />
            Merged only
          </label>

          {hasUndoableMergeRecords && (
            <label className="flex items-center gap-2 rounded-md border border-border/60 bg-background/60 px-2.5 py-2 text-xs">
              <input
                type="checkbox"
                checked={undoableOnly}
                onChange={(e) => setUndoableOnly(e.target.checked)}
                className="rounded border-input"
              />
              <Clock className="h-3.5 w-3.5 text-emerald-500" />
              Undoable merges only
            </label>
          )}

          {hasMergeRecords && (
            <label className="space-y-1 text-xs sm:col-span-2">
              <span className="text-muted-foreground">Merge strategy</span>
              <select
                value={selectedMergeStrategy}
                onChange={(e) => setSelectedMergeStrategy(e.target.value as MergeStrategyFilter)}
                title="Filter by merge strategy"
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                <option value="">All merge strategies</option>
                <option value="staged-merge">Staged merge</option>
                <option value="single-asset">Single-asset merge</option>
              </select>
            </label>
          )}

          {modes.length > 0 && (
            <label className="space-y-1 text-xs">
              <span className="text-muted-foreground">Mode</span>
              <select
                value={selectedMode}
                onChange={(e) => setSelectedMode(e.target.value)}
                title="Filter by mode"
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                <option value="">All modes</option>
                {modes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </label>
          )}

          {genres.length > 0 && (
            <label className="space-y-1 text-xs sm:col-span-2">
              <span className="text-muted-foreground">Genre</span>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                title="Filter by genre"
                className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs"
              >
                <option value="">All genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </label>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="sm:col-span-2 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Draft list */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">Loading drafts...</div>
        ) : filteredDrafts.length === 0 ? (
          <div className="p-4 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">
              {hasActiveFilters ? 'No drafts match filters' : 'No drafts yet'}
            </p>
            {hasActiveFilters && (
              <button type="button" onClick={clearFilters} className="mt-2 text-xs text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredDrafts.map((draft) => {
              const isActive = currentDraftId === draft.review_id;
              const reviewBadges = buildDraftLibraryBadges(draft).slice(0, 3);
              const latestSnapshot = getLatestDraftSnapshotSummary(draft);
              const worldLink = draftWorldLinksByDraftId?.get(draft.review_id) ?? null;
              const mergeProvenance = draft.merge_provenance;
              const mergeSourceName = mergeProvenance
                ? (draftNameById.get(mergeProvenance.source_draft_id) ?? mergeProvenance.source_draft_id)
                : null;
              const mergeBaseName = mergeProvenance
                ? (draftNameById.get(mergeProvenance.base_draft_id) ?? mergeProvenance.base_draft_id)
                : null;
              const mergeAssetPreview = mergeProvenance
                ? mergeProvenance.asset_names.slice(0, 3).map(formatAssetLabel).join(', ')
                : '';
              return (
                <article
                  key={draft.review_id}
                  className={cn(
                    'group block rounded-lg border p-2 transition-all',
                    isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-border/60 hover:bg-accent/40',
                  )}
                >
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <Link to={`/drafts/${encodeURIComponent(draft.review_id)}`} className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">{draft.character_name || draft.seed}</span>
                        {draft.favorite && <Star className="h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500" />}
                      </div>
                      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {draft.mode && (
                          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">
                            <Layers className="h-2.5 w-2.5" />
                            {draft.mode}
                          </span>
                        )}
                        {draft.template_name && <span className="truncate">{draft.template_name}</span>}
                      </div>
                      {worldLink && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/80">
                          <Globe className="h-2.5 w-2.5" />
                          World: {worldLink.worldName}
                          {worldLink.role ? ` · ${worldLink.role}` : ''}
                        </div>
                      )}
                      {(draft.created || draft.modified) && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(draft.modified || draft.created || '').toLocaleDateString()}
                        </div>
                      )}
                      {latestSnapshot && (
                        <div className="mt-1 text-[10px] text-muted-foreground/80">
                          Snapshot: {latestSnapshot.label}
                          {latestSnapshot.reason ? ` · ${latestSnapshot.reason}` : ''}
                        </div>
                      )}
                      {mergeProvenance && (
                        <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground/80">
                          <div>
                            Merge: {mergeSourceName} ({mergeProvenance.source_side}) into branch of {mergeBaseName}
                          </div>
                          <div>
                            Assets: {mergeAssetPreview}
                            {mergeProvenance.asset_names.length > 3
                              ? `, +${mergeProvenance.asset_names.length - 3} more`
                              : ''}
                          </div>
                        </div>
                      )}
                      {reviewBadges.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {reviewBadges.map((badge) => (
                            <span
                              key={`${draft.review_id}-${badge.label}`}
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[9px] font-medium',
                                badge.tone === 'warning'
                                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                  : badge.tone === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-muted text-muted-foreground',
                              )}
                            >
                              {badge.label}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                    {draft.tags && draft.tags.length > 0 && (
                      <div className="flex max-w-[8rem] shrink-0 flex-wrap justify-end gap-0.5 overflow-hidden">
                        {draft.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                        {draft.tags.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">+{draft.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {latestSnapshot && onSelectSnapshotPreview && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/40 pt-2">
                      <button
                        type="button"
                        onClick={() => onSelectSnapshotPreview(draft.review_id, latestSnapshot.id)}
                        className={cn(
                          'rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors',
                          activeSnapshotPreviewId === latestSnapshot.id
                            ? 'border-primary/40 bg-primary/10 text-foreground'
                            : 'border-border/60 bg-background/70 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                        )}
                      >
                        {activeSnapshotPreviewId === latestSnapshot.id
                          ? 'Previewing latest snapshot'
                          : 'Preview latest snapshot'}
                      </button>
                      <Link
                        to={`/drafts/${encodeURIComponent(draft.review_id)}?historySnapshot=${encodeURIComponent(latestSnapshot.id)}`}
                        className="text-[11px] font-medium text-primary hover:underline"
                      >
                        Open full diff
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DraftListSidebar;
