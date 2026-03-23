import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { api } from '@/lib/api';
import SyncControls from '../common/SyncControls';
import { DraftStorage } from '@/lib/storage/draft-db';
import InlineHelpTip from '../common/InlineHelpTip';
import { useGuidedTour } from '../common/GuidedTourContext';
import { DRAFT_LIBRARY_TOUR_ID } from '@/lib/help';
import { LibraryCollectionsPlaceholder } from './LibraryCollectionsPlaceholder';
import { DraftComparisonPlaceholder } from './DraftComparisonPlaceholder';
import { ReviewChecklistPlaceholder } from './ReviewChecklistPlaceholder';
import { VersionHistoryPlaceholder } from './VersionHistoryPlaceholder';

export default function Drafts() {
  const [leftDraftId, setLeftDraftId] = useState<string>('');
  const [rightDraftId, setRightDraftId] = useState<string>('');
  const { isTourCompleted, restartTour, startTour } = useGuidedTour();
  const queryClient = useQueryClient();

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

  const hasDrafts = data?.drafts.length > 0;

  return (
    <div className="app-page space-y-6 pb-12">
      <InlineHelpTip
        tipId="drafts-library-tip"
        title="Use the library as a review queue"
        description="Select drafts from the sidebar to compare and review. Use filters to find specific characters quickly."
        actionLabel={isTourCompleted(DRAFT_LIBRARY_TOUR_ID) ? 'Replay Draft Library Tour' : 'Start Draft Library Tour'}
        onAction={() => (isTourCompleted(DRAFT_LIBRARY_TOUR_ID) ? restartTour(DRAFT_LIBRARY_TOUR_ID) : startTour(DRAFT_LIBRARY_TOUR_ID))}
      />
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Draft library</p>
            <h1 className="app-page-title">Treat saved drafts like an active review queue, not a dead archive.</h1>
            <p className="app-page-summary">
              Reopen work, compare candidates, push data to sync when you need it, and move the best draft into full review. This is where Home hands off after generation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/generate" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                Generate another draft
              </Link>
              <Link to="/validation" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
                Validation
              </Link>
            </div>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Library state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Drafts</p>
                <div className="app-page-metric-value text-2xl">{data?.stats?.total_drafts ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Favorites</p>
                <div className="app-page-metric-value text-2xl">{data?.stats?.favorites ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Genres</p>
                <div className="app-page-metric-value text-2xl">{data?.stats ? Object.keys(data.stats.by_genre).length : 0}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {data?.stats && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="app-panel-muted p-4">
            <div className="text-2xl font-bold">{data.stats.total_drafts}</div>
            <div className="text-sm text-muted-foreground">Total Drafts</div>
          </div>
          <div className="app-panel-muted p-4">
            <div className="text-2xl font-bold">{data.stats.favorites}</div>
            <div className="text-sm text-muted-foreground">Favorites</div>
          </div>
          <div className="app-panel-muted p-4">
            <div className="text-2xl font-bold">
              {Object.keys(data.stats.by_genre).length}
            </div>
            <div className="text-sm text-muted-foreground">Genres</div>
          </div>
        </div>
      )}

      {/* Server Sync */}
      <div className="app-panel p-4">
        <SyncControls
          dataType="drafts"
          label="Drafts"
          onGetLocalData={async () => JSON.parse(await DraftStorage.exportAll())}
          onApplyData={async (data) => {
            if (data && typeof data === 'object' && 'drafts' in data) {
              await DraftStorage.import(JSON.stringify(data));
              queryClient.invalidateQueries({ queryKey: ['drafts'] });
            }
          }}
        />
      </div>

      {/* Empty State */}
      {!hasDrafts && (
        <div className="app-panel p-8 text-center">
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
      )}

      {/* Draft Workbench - only show when there are drafts */}
      {hasDrafts && (
        <section data-tour-anchor="drafts-workbench" className="app-panel p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Draft Workbench</h2>
              <p className="text-sm text-muted-foreground">
                Select drafts from the sidebar to compare and review. Use the filters to find specific characters.
              </p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {data?.drafts.length} drafts
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <LibraryCollectionsPlaceholder
              collectionName="all drafts"
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
      )}
    </div>
  );
}
