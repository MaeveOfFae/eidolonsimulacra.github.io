import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import type { DraftMergeHistoryEvent, DraftMetadata, WorldCharacterDraftLinkRecord } from '@char-gen/shared';
import { formatTimestamp } from '@/lib/format-timestamp';
import { DraftStorage } from '@/lib/storage/draft-db';
import CollapsibleSection from '../common/CollapsibleSection';
import SyncControls from '../common/SyncControls';
import { DraftDuplicatesPanel } from './DraftDuplicatesPanel';
import { DraftListSidebar } from './DraftListSidebar';

/**
 * Drafts tab of the library screen.
 *
 * Extracted from `Drafts` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Behavior is pinned by
 * `Drafts.test.tsx` through the parent.
 *
 * The restore-point preview arrives as `snapshotPreview` because it shares the
 * parent's snapshot-comparison state.
 */

interface LibraryDraftsTabProps {
  drafts: DraftMetadata[];
  isLoading: boolean;
  draftWorldLinksByDraftId: Map<string, WorldCharacterDraftLinkRecord>;
  draftCount: number;
  favoritesCount: number;
  genresCount: number;
  recentRevisionSnapshots: Array<{
    draftId: string;
    draftName: string;
    snapshot: NonNullable<DraftMetadata['revision_snapshots']>[number];
  }>;
  recentMergeEvents: Array<{
    draftId: string;
    draftName: string;
    entry: DraftMergeHistoryEvent;
  }>;
  draftNameById: Map<string, string>;
  selectedSnapshotPreviewId: string;
  onSelectSnapshotPreviewId: (snapshotId: string) => void;
  onSelectSnapshotPreview: (draftId: string, snapshotId: string) => void;
  onDraftsChanged: () => void;
  selfContainedDesktop: boolean;
  snapshotPreview: ReactNode;
}

export default function LibraryDraftsTab({
  drafts,
  isLoading,
  draftWorldLinksByDraftId,
  draftCount,
  favoritesCount,
  genresCount,
  recentRevisionSnapshots,
  recentMergeEvents,
  draftNameById,
  selectedSnapshotPreviewId,
  onSelectSnapshotPreviewId,
  onSelectSnapshotPreview,
  onDraftsChanged,
  selfContainedDesktop,
  snapshotPreview,
}: LibraryDraftsTabProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
      <section
        className="app-panel min-w-0 overflow-hidden p-0 xl:max-h-[calc(100vh-18rem)]"
        data-tour-anchor="drafts-open-review"
      >
        <DraftListSidebar
          drafts={drafts}
          isLoading={isLoading}
          draftWorldLinksByDraftId={draftWorldLinksByDraftId}
          activeSnapshotPreviewId={selectedSnapshotPreviewId}
          onSelectSnapshotPreview={onSelectSnapshotPreview}
          onDraftsChanged={onDraftsChanged}
        />
      </section>

      <div className="min-w-0 space-y-4">
        <DraftDuplicatesPanel drafts={drafts} onDraftsChanged={onDraftsChanged} />

        <section className="app-panel p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Library overview</h2>
              <p className="text-sm text-muted-foreground">
                Search, filter, and reopen any saved draft from one place.
              </p>
            </div>
            <span className="app-pill app-pill-muted">{drafts.length} drafts</span>
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
                          {draftName} · {formatTimestamp(snapshot.created_at)}
                        </p>
                        {snapshot.reason && <p className="mt-1 text-xs text-muted-foreground">{snapshot.reason}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectSnapshotPreviewId(snapshot.id)}
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

                {snapshotPreview}
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
                            {entry.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge'} ·{' '}
                            {formatTimestamp(entry.created_at)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Source: {sourceName} ({entry.source_side}) · Base: {baseName} ({entry.base_side})
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">Assets: {entry.asset_names.join(', ')}</p>
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
                  onDraftsChanged();
                }
              }}
            />
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
