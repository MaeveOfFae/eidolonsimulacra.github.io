import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Star,
  X,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  Heart,
  FileText,
  Layers,
} from 'lucide-react';
import type { DraftMetadata, DraftFilters } from '@char-gen/shared';
import { cn } from '@/utils/cn';

export interface DraftListSidebarProps {
  drafts: DraftMetadata[];
  isLoading?: boolean;
}

type SortField = 'created' | 'modified' | 'name';
type SortOrder = 'asc' | 'desc';

export function DraftListSidebar({ drafts, isLoading }: DraftListSidebarProps) {
  const location = useLocation();
  const reviewMatch = location.pathname.match(/^\/drafts\/([^/]+)$/);
  const currentDraftId = reviewMatch ? decodeURIComponent(reviewMatch[1]) : null;

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
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
          draft.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Favorites filter
    if (favoritesOnly) {
      result = result.filter((draft) => draft.favorite);
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
  }, [drafts, search, favoritesOnly, selectedMode, selectedGenre, sortField, sortOrder]);

  const hasActiveFilters = search || favoritesOnly || selectedMode || selectedGenre;

  const clearFilters = () => {
    setSearch('');
    setFavoritesOnly(false);
    setSelectedMode('');
    setSelectedGenre('');
  };

  const stats = useMemo(() => {
    const total = drafts.length;
    const favorites = drafts.filter((d) => d.favorite).length;
    return { total, favorites };
  }, [drafts]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/60 px-3 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Draft Library
        </h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
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
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            showFilters || hasActiveFilters
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
              {[search && 'search', favoritesOnly && 'fav', selectedMode && 'mode', selectedGenre && 'genre'].filter(Boolean).length}
            </span>
          )}
        </button>

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
        <div className="border-b border-border/40 bg-muted/30 px-3 py-2 space-y-2">
          {/* Favorites toggle */}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={favoritesOnly}
              onChange={(e) => setFavoritesOnly(e.target.checked)}
              className="rounded border-input"
            />
            <Star className="h-3.5 w-3.5 text-yellow-500" />
            Favorites only
          </label>

          {/* Mode filter */}
          {modes.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Mode</label>
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
            </div>
          )}

          {/* Genre filter */}
          {genres.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Genre</label>
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
            </div>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Draft list */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            Loading drafts...
          </div>
        ) : filteredDrafts.length === 0 ? (
          <div className="p-4 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-xs text-muted-foreground">
              {hasActiveFilters ? 'No drafts match filters' : 'No drafts yet'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredDrafts.map((draft) => {
              const isActive = currentDraftId === draft.review_id;
              return (
                <Link
                  key={draft.review_id}
                  to={`/drafts/${encodeURIComponent(draft.review_id)}`}
                  className={cn(
                    'group block rounded-lg border p-2 transition-all',
                    isActive
                      ? 'border-primary bg-primary/10'
                      : 'border-transparent hover:border-border/60 hover:bg-accent/40'
                  )}
                >
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {draft.character_name || draft.seed}
                        </span>
                        {draft.favorite && (
                          <Star className="h-3 w-3 shrink-0 fill-yellow-500 text-yellow-500" />
                        )}
                      </div>
                      <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {draft.mode && (
                          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5">
                            <Layers className="h-2.5 w-2.5" />
                            {draft.mode}
                          </span>
                        )}
                        {draft.template_name && (
                          <span className="truncate">{draft.template_name}</span>
                        )}
                      </div>
                      {(draft.created || draft.modified) && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(draft.modified || draft.created || '').toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    {draft.tags && draft.tags.length > 0 && (
                      <div className="flex max-w-[8rem] shrink-0 flex-wrap justify-end gap-0.5 overflow-hidden">
                        {draft.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {draft.tags.length > 2 && (
                          <span className="text-[9px] text-muted-foreground">
                            +{draft.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DraftListSidebar;
