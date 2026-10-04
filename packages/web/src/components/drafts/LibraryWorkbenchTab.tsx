import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { DraftMetadata } from '@char-gen/shared';
import { formatTimestamp } from '@/lib/format-timestamp';
import { DraftComparisonPanel } from './DraftComparisonPanel';
import { ReviewChecklistPanel } from './ReviewChecklistPanel';
import { VersionHistoryPanel } from './VersionHistoryPanel';

/**
 * Workbench tab of the drafts library.
 *
 * Extracted from `Drafts` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Behavior is pinned by
 * `Drafts.test.tsx` through the parent.
 *
 * The restore-point preview panel still lives in the parent and arrives as
 * `snapshotPreview`, because it shares the parent's snapshot-comparison state.
 */

type WorkbenchSide = 'left' | 'right';
type WorkbenchPanelSource = 'left' | 'preview';

interface LibraryWorkbenchTabProps {
  draftCount: number;
  drafts: DraftMetadata[] | undefined;
  leftDraftId: string;
  rightDraftId: string;
  onLeftDraftChange: (draftId: string) => void;
  onRightDraftChange: (draftId: string) => void;
  workbenchPanelSource: WorkbenchPanelSource;
  onWorkbenchPanelSourceChange: (source: WorkbenchPanelSource) => void;
  workbenchPreviewSide: WorkbenchSide;
  onWorkbenchPreviewSideChange: (side: WorkbenchSide) => void;
  activeWorkbenchPanelDraftId?: string;
  activeWorkbenchPanelDraftLabel: string;
  workbenchPreviewDraftLabel: string;
  workbenchPreviewSnapshots: Array<{
    draftId: string;
    draftName: string;
    snapshot: NonNullable<DraftMetadata['revision_snapshots']>[number];
  }>;
  selectedSnapshotPreviewId: string;
  onSelectSnapshotPreviewId: (snapshotId: string) => void;
  snapshotPreview: ReactNode;
}

export default function LibraryWorkbenchTab({
  draftCount,
  drafts,
  leftDraftId,
  rightDraftId,
  onLeftDraftChange,
  onRightDraftChange,
  workbenchPanelSource,
  onWorkbenchPanelSourceChange,
  workbenchPreviewSide,
  onWorkbenchPreviewSideChange,
  activeWorkbenchPanelDraftId,
  activeWorkbenchPanelDraftLabel,
  workbenchPreviewDraftLabel,
  workbenchPreviewSnapshots,
  selectedSnapshotPreviewId,
  onSelectSnapshotPreviewId,
  snapshotPreview,
}: LibraryWorkbenchTabProps) {
  return (
    <section data-tour-anchor="drafts-workbench" className="app-panel p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Workbench</h2>
          <p className="text-sm text-muted-foreground">Compare drafts and inspect the active one.</p>
        </div>
        <span className="app-pill app-pill-muted">{draftCount} drafts</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DraftComparisonPanel
          leftDraftId={leftDraftId}
          rightDraftId={rightDraftId}
          draftOptions={drafts}
          onLeftDraftChange={onLeftDraftChange}
          onRightDraftChange={onRightDraftChange}
        />
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Workbench inspector
                </div>
                <div className="mt-1 text-sm text-foreground">
                  Checklist and version activity can stay on the left draft or follow the selected preview side.
                </div>
              </div>
              <div className="inline-flex rounded-md border border-border/60 bg-background/70 p-1">
                <button
                  type="button"
                  onClick={() => onWorkbenchPanelSourceChange('left')}
                  className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPanelSource === 'left' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Left draft
                </button>
                <button
                  type="button"
                  onClick={() => onWorkbenchPanelSourceChange('preview')}
                  className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPanelSource === 'preview' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Follow preview side
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
              Inspecting <span className="font-medium text-foreground">{activeWorkbenchPanelDraftLabel}</span>
              {workbenchPanelSource === 'preview'
                ? ` from the ${workbenchPreviewSide} preview side`
                : ' from the left comparison side'}
              .
            </div>
          </div>

          <ReviewChecklistPanel draftId={activeWorkbenchPanelDraftId} />
          <VersionHistoryPanel draftId={activeWorkbenchPanelDraftId} />
        </div>
        {workbenchPreviewSnapshots.length > 0 && (
          <div className="rounded-lg border border-border bg-background/60 p-4 text-sm text-muted-foreground lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Workbench restore points
                </div>
                <div className="mt-1 text-sm text-foreground">
                  Open the latest restore points for the selected comparison side without leaving the workbench.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-md border border-border/60 bg-background/70 p-1">
                  <button
                    type="button"
                    onClick={() => onWorkbenchPreviewSideChange('left')}
                    className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPreviewSide === 'left' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Left draft
                  </button>
                  <button
                    type="button"
                    onClick={() => onWorkbenchPreviewSideChange('right')}
                    disabled={!rightDraftId}
                    className={`rounded px-2.5 py-1 text-xs transition-colors ${workbenchPreviewSide === 'right' ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:text-foreground'} disabled:opacity-40`}
                  >
                    Right draft
                  </button>
                </div>
                <span className="app-pill app-pill-muted">{workbenchPreviewSnapshots.length} snapshots</span>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs text-muted-foreground">
              Previewing restore points for{' '}
              <span className="font-medium text-foreground">{workbenchPreviewDraftLabel}</span> on the{' '}
              {workbenchPreviewSide} comparison side.
            </div>

            <div className="mt-3 space-y-2">
              {workbenchPreviewSnapshots.map(({ draftId, snapshot }) => (
                <div
                  key={snapshot.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground">{snapshot.label || 'Restore point'}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatTimestamp(snapshot.created_at)}
                      {snapshot.reason ? ` · ${snapshot.reason}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectSnapshotPreviewId(snapshot.id)}
                      className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors ${selectedSnapshotPreviewId === snapshot.id ? 'border-primary/40 bg-primary/10 text-foreground' : 'border-border/60 bg-background/70 text-muted-foreground hover:border-primary/30 hover:text-foreground'}`}
                    >
                      {selectedSnapshotPreviewId === snapshot.id ? 'Previewing' : 'Preview here'}
                    </button>
                    <Link
                      to={`/drafts/${encodeURIComponent(draftId)}?historySnapshot=${encodeURIComponent(snapshot.id)}`}
                      className="app-button app-button-secondary"
                    >
                      Open snapshot diff
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {snapshotPreview}
          </div>
        )}
        <div className="rounded-lg border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground lg:col-span-2">
          Restore-point preview can follow either comparison side, and the inspector panels can now either stay on the
          left draft or follow that preview side. Open any draft from the library tab when you want to jump back into
          full review.
        </div>
      </div>
    </section>
  );
}
