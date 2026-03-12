import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FolderOpen, Star, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { DRAFT_LIBRARY_TOUR_ID } from '@/lib/help';
import InlineHelpTip from '../common/InlineHelpTip';
import { useGuidedTour } from '../common/GuidedTourContext';
import DraftComparisonPlaceholder from './DraftComparisonPlaceholder';
import LibraryCollectionsPlaceholder from './LibraryCollectionsPlaceholder';
import ReviewChecklistPlaceholder from './ReviewChecklistPlaceholder';
import VersionHistoryPlaceholder from './VersionHistoryPlaceholder';

export default function Drafts() {
  const [leftDraftId, setLeftDraftId] = useState<string>('');
  const [rightDraftId, setRightDraftId] = useState<string>('');
  const { isTourCompleted, restartTour, startTour } = useGuidedTour();

  const { data, isLoading, error } = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });

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

  return (
    <div className="space-y-6">
      <InlineHelpTip
        tipId="drafts-library-tip"
        title="Use the library as a review queue"
        description="After generation, reopen drafts here, compare promising results, and only then move one draft into full review and export. This keeps the workflow deliberate instead of scattered."
        actionLabel={isTourCompleted(DRAFT_LIBRARY_TOUR_ID) ? 'Replay Draft Library Tour' : 'Start Draft Library Tour'}
        onAction={() => (isTourCompleted(DRAFT_LIBRARY_TOUR_ID) ? restartTour(DRAFT_LIBRARY_TOUR_ID) : startTour(DRAFT_LIBRARY_TOUR_ID))}
      />
      <div>
        <h1 className="text-3xl font-bold">Drafts</h1>
        <p className="text-muted-foreground">
          Browse and manage your saved characters
        </p>
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-2xl font-bold">{data.stats.total_drafts}</div>
            <div className="text-sm text-muted-foreground">Total Drafts</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-2xl font-bold">{data.stats.favorites}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-2xl font-bold">
              {Object.keys(data.stats.by_genre).length}
            </div>
            <div className="text-sm text-muted-foreground">Genres</div>
          </div>
        </div>
      )}

      <section data-tour-anchor="drafts-workbench" className="rounded-lg border border-dashed border-border bg-card/50 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Draft Workbench</h2>
            <p className="text-sm text-muted-foreground">
              Comparison and review checks are available now. Collections and version history remain staged for later workflow work.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Mixed
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <LibraryCollectionsPlaceholder
            collectionName={data?.drafts.length ? 'all drafts' : 'empty library'}
          />
          <DraftComparisonPlaceholder
            leftDraftId={leftDraftId}
            rightDraftId={rightDraftId}
            draftOptions={data?.drafts}
          />
          <ReviewChecklistPlaceholder draftId={leftDraftId || data?.drafts[0]?.review_id} />
          <VersionHistoryPlaceholder draftId={data?.drafts[0]?.review_id} />
        </div>
      </section>

      {/* Draft List */}
      <div data-tour-anchor="drafts-list" className="space-y-2">
        {data?.drafts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No drafts yet</h3>
            <p className="text-muted-foreground">
              Generate your first character to get started
            </p>
            <div className="mt-6 text-left">
              <LibraryCollectionsPlaceholder collectionName="first-run library" />
            </div>
            <Link
              to="/generate"
              data-tour-anchor="drafts-open-review"
              className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Generate Character
            </Link>
          </div>
        ) : (
          data?.drafts.map((draft) => (
            <Link
              key={draft.review_id}
              to={`/drafts/${encodeURIComponent(draft.review_id)}`}
              data-tour-anchor="drafts-open-review"
              className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">
                    {draft.character_name || draft.seed}
                  </h3>
                  {draft.favorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{draft.template_name || 'Default Template'}</span>
                  <span>{draft.mode}</span>
                  {draft.created && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(draft.created).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {draft.tags?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
