/**
 * Search, filter, sort and density controls for the theme manager.
 *
 * Extracted from `Themes` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). The filtering itself
 * stays in the parent, which owns the theme list; this renders the controls and
 * reports the visible/total counts. Behavior is pinned by `Themes.test.tsx`
 * through the parent.
 */

export type ThemeSortMode = 'name-asc' | 'name-desc' | 'author-asc' | 'source';
export type ThemeViewMode = 'comfortable' | 'compact';

interface ThemeFiltersPanelProps {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sourceFilter: 'all' | 'builtin' | 'custom';
  onSourceFilterChange: (value: 'all' | 'builtin' | 'custom') => void;
  selectedAuthor: string;
  onSelectedAuthorChange: (value: string) => void;
  selectedTag: string;
  onSelectedTagChange: (value: string) => void;
  sortMode: ThemeSortMode;
  onSortModeChange: (value: ThemeSortMode) => void;
  viewMode: ThemeViewMode;
  onViewModeChange: (value: ThemeViewMode) => void;
  availableAuthors: string[];
  availableTags: string[];
  visibleCount: number;
  totalCount: number;
}

export default function ThemeFiltersPanel({
  searchQuery,
  onSearchQueryChange,
  sourceFilter,
  onSourceFilterChange,
  selectedAuthor,
  onSelectedAuthorChange,
  selectedTag,
  onSelectedTagChange,
  sortMode,
  onSortModeChange,
  viewMode,
  onViewModeChange,
  availableAuthors,
  availableTags,
  visibleCount,
  totalCount,
}: ThemeFiltersPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <label className="mb-4 block space-y-2 text-sm">
        <span className="font-medium">Search presets</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search by name, author, tag, lineage, or description"
          className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
        <div className="text-sm">
          <div className="mb-1.5 font-medium">Source</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSourceFilterChange('all')}
              className={`rounded-full border px-3 py-1.5 text-xs ${sourceFilter === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onSourceFilterChange('builtin')}
              className={`rounded-full border px-3 py-1.5 text-xs ${sourceFilter === 'builtin' ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
            >
              Built-in
            </button>
            <button
              type="button"
              onClick={() => onSourceFilterChange('custom')}
              className={`rounded-full border px-3 py-1.5 text-xs ${sourceFilter === 'custom' ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
            >
              Custom
            </button>
          </div>
        </div>
        <div className="text-sm">
          <div className="mb-1.5 font-medium">Author</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectedAuthorChange('all')}
              className={`rounded-full border px-3 py-1.5 text-xs ${selectedAuthor === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
            >
              All
            </button>
            {availableAuthors.map((author) => (
              <button
                key={author}
                type="button"
                onClick={() => onSelectedAuthorChange(author)}
                className={`rounded-full border px-3 py-1.5 text-xs ${selectedAuthor === author ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
              >
                {author}
              </button>
            ))}
            {availableAuthors.length === 0 && <span className="text-xs text-muted-foreground">No authors yet</span>}
          </div>
        </div>
        <div className="text-sm">
          <div className="mb-1.5 font-medium">Tag</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectedTagChange('all')}
              className={`rounded-full border px-3 py-1.5 text-xs ${selectedTag === 'all' ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onSelectedTagChange(tag)}
                className={`rounded-full border px-3 py-1.5 text-xs ${selectedTag === tag ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
              >
                {tag}
              </button>
            ))}
            {availableTags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet</span>}
          </div>
        </div>
        <div className="flex items-end gap-4 text-sm">
          <label className="space-y-1.5">
            <span className="font-medium">Sort</span>
            <select
              value={sortMode}
              onChange={(event) => onSortModeChange(event.target.value as ThemeSortMode)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="author-asc">Author</option>
              <option value="source">Source</option>
            </select>
          </label>
          <div className="space-y-1.5">
            <div className="font-medium">View</div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => onViewModeChange('comfortable')}
                className={`rounded-md border px-2 py-1 text-xs ${viewMode === 'comfortable' ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
              >
                Comfy
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('compact')}
                className={`rounded-md border px-2 py-1 text-xs ${viewMode === 'compact' ? 'border-primary bg-primary text-primary-foreground' : 'border-input hover:bg-accent'}`}
              >
                Compact
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        Showing {visibleCount} of {totalCount} presets.
      </div>
    </div>
  );
}
