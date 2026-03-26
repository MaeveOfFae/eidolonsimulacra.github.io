import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FolderOpen, Upload, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import SyncControls from '../common/SyncControls';
import { DraftStorage } from '@/lib/storage/draft-db';
import { useGuidedTour } from '../common/GuidedTourContext';
import { DRAFT_LIBRARY_TOUR_ID } from '@/lib/help';
import { DraftListSidebar } from './DraftListSidebar';
import { DraftComparisonPanel } from './DraftComparisonPanel';
import { ReviewChecklistPanel } from './ReviewChecklistPanel';
import { VersionHistoryPanel } from './VersionHistoryPanel';

type DraftsTab = 'library' | 'workbench';

export default function Drafts() {
  const [activeTab, setActiveTab] = useState<DraftsTab>('library');
  const [leftDraftId, setLeftDraftId] = useState<string>('');
  const [rightDraftId, setRightDraftId] = useState<string>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
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
      setActiveTab('library');
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

  const activeWorkbenchDraftId = leftDraftId || data?.drafts[0]?.review_id;

  async function handleImportDrafts(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const result = await DraftStorage.import(text);
      await queryClient.invalidateQueries({ queryKey: ['drafts'] });
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

  return (
    <div className="app-page space-y-10 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Draft library</p>
            <h1 className="app-page-title">Review current work</h1>
            <p className="app-page-summary">
              Reopen drafts, compare them, and move the best ones forward.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/generate" className="app-button app-button-primary">
                Generate another draft
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
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            data-active={activeTab === 'library' ? 'true' : 'false'}
            className="app-tab-button"
          >
            Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workbench')}
            data-active={activeTab === 'workbench' ? 'true' : 'false'}
            className="app-tab-button"
            disabled={!hasDrafts}
          >
            Workbench
          </button>
        </div>
      </div>

      {!hasDrafts && activeTab === 'library' && (
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

      {activeTab === 'library' && hasDrafts && (
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
                  <div className="mt-1 text-2xl font-semibold text-foreground">{data?.stats?.total_drafts ?? 0}</div>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Favorites</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{data?.stats?.favorites ?? 0}</div>
                </div>
                <div className="rounded-lg border border-border bg-background/60 p-4">
                  <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Genres</div>
                  <div className="mt-1 text-2xl font-semibold text-foreground">{data?.stats ? Object.keys(data.stats.by_genre).length : 0}</div>
                </div>
              </div>
            </section>
          </div>
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
              {data?.drafts.length} drafts
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
