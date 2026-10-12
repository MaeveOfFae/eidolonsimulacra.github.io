import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { DraftMetadata, SavedSearchRecord } from '@char-gen/shared';
import { buildPinnedSavedSearches } from '@/lib/dashboard-data';
import { SAVED_SEARCHES_CHANGED_EVENT, getSavedSearches } from '@/lib/drafts/saved-searches';

interface SavedSearchesPanelProps {
  /** The drafts already loaded on this screen, which the counts are computed from. */
  drafts: readonly DraftMetadata[];
}

/**
 * The library filters you kept, with how many drafts each one currently matches.
 *
 * The count is what makes the panel worth a slot: a name on its own does not tell you
 * whether the collection is worth opening, and the filter runs against drafts the screen
 * has loaded anyway.
 *
 * Renders nothing until there is at least one saved search: the place to make one is the
 * library sidebar, and an empty card here would be an advert rather than a widget.
 */
export default function SavedSearchesPanel({ drafts }: SavedSearchesPanelProps) {
  const [records, setRecords] = useState<SavedSearchRecord[]>(() => getSavedSearches());

  useEffect(() => {
    const handleChanged = () => setRecords(getSavedSearches());

    window.addEventListener(SAVED_SEARCHES_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(SAVED_SEARCHES_CHANGED_EVENT, handleChanged);
  }, []);

  const pinned = useMemo(() => buildPinnedSavedSearches(records, drafts), [drafts, records]);

  if (pinned.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[1.75rem] border border-border/60 p-6 sm:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          Saved searches
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Filters you kept in the library, and how many drafts each one matches right now.
        </p>
      </div>

      <div className="grid gap-2">
        {pinned.map((search) => (
          <Link
            key={search.id}
            to={search.to}
            className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/35 hover:bg-background/60"
          >
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">{search.name}</span>
              <span className="block truncate text-xs text-muted-foreground">{search.summary}</span>
            </span>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {search.matchCount}
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
