import { GitBranch } from 'lucide-react';
import type { DraftMetadata } from '@char-gen/shared';
import { formatSnapshotOptionLabel } from '@/lib/drafts/comparison-helpers';
import type { DraftComparisonState, DraftReviewSummary } from '@/lib/drafts/comparison-helpers';

/**
 * Side-by-side draft cards for the comparison panel.
 *
 * Extracted from `DraftComparisonPanel` (5.0 workspace-release work stream: decompose the
 * giant screens into focused, individually testable sections). Each card names the draft
 * it shows, reports its template/mode, which revision is being compared and any saved
 * review context, then offers to branch that side or to compare an older restore point.
 * The branch mutation and the snapshot selection stay in the parent.
 */

type SnapshotEntry = NonNullable<DraftMetadata['revision_snapshots']>[number];

interface DraftComparisonCardsProps {
  leftState: DraftComparisonState;
  rightState: DraftComparisonState;
  leftReviewSummary?: DraftReviewSummary | null;
  rightReviewSummary?: DraftReviewSummary | null;
  leftSnapshots: SnapshotEntry[];
  rightSnapshots: SnapshotEntry[];
  selectedLeftSnapshotId: string;
  onSelectLeftSnapshot: (snapshotId: string) => void;
  selectedRightSnapshotId: string;
  onSelectRightSnapshot: (snapshotId: string) => void;
  onBranch: (side: 'left' | 'right') => void;
  branchPending: boolean;
  branchNotice?: string | null;
  branchError?: string | null;
}

export function DraftComparisonCards({
  leftState,
  rightState,
  leftReviewSummary,
  rightReviewSummary,
  leftSnapshots,
  rightSnapshots,
  selectedLeftSnapshotId,
  onSelectLeftSnapshot,
  selectedRightSnapshotId,
  onSelectRightSnapshot,
  onBranch,
  branchPending,
  branchNotice,
  branchError,
}: DraftComparisonCardsProps) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-md border border-border p-3">
          <div className="font-medium text-foreground">{leftState.character_name || leftState.seed}</div>
          <div className="mt-1 break-words text-xs">
            {leftState.template_name || 'Default Template'} · {leftState.mode || 'Unknown mode'}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Comparing {leftState.label}</div>
          {leftReviewSummary && (
            <div className="mt-2 text-xs text-muted-foreground">
              {leftReviewSummary.hasReview
                ? `${leftReviewSummary.scoredAssetCount} scored · ${leftReviewSummary.notedAssetCount} noted${leftReviewSummary.updatedAt ? ` · reviewed ${new Date(leftReviewSummary.updatedAt).toLocaleDateString()}` : ''}`
                : 'No saved review context'}
            </div>
          )}
          <button
            type="button"
            onClick={() => onBranch('left')}
            disabled={branchPending}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <GitBranch className="h-3.5 w-3.5" />
            Branch left draft
          </button>
          {leftSnapshots.length ? (
            <select
              aria-label="Left draft revision"
              value={selectedLeftSnapshotId}
              onChange={(event) => onSelectLeftSnapshot(event.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
            >
              <option value="">Current draft</option>
              {leftSnapshots.slice(0, 6).map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {formatSnapshotOptionLabel(snapshot)}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <div className="min-w-0 rounded-md border border-border p-3">
          <div className="font-medium text-foreground">{rightState.character_name || rightState.seed}</div>
          <div className="mt-1 break-words text-xs">
            {rightState.template_name || 'Default Template'} · {rightState.mode || 'Unknown mode'}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Comparing {rightState.label}</div>
          {rightReviewSummary && (
            <div className="mt-2 text-xs text-muted-foreground">
              {rightReviewSummary.hasReview
                ? `${rightReviewSummary.scoredAssetCount} scored · ${rightReviewSummary.notedAssetCount} noted${rightReviewSummary.updatedAt ? ` · reviewed ${new Date(rightReviewSummary.updatedAt).toLocaleDateString()}` : ''}`
                : 'No saved review context'}
            </div>
          )}
          <button
            type="button"
            onClick={() => onBranch('right')}
            disabled={branchPending}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            <GitBranch className="h-3.5 w-3.5" />
            Branch right draft
          </button>
          {rightSnapshots.length ? (
            <select
              aria-label="Right draft revision"
              value={selectedRightSnapshotId}
              onChange={(event) => onSelectRightSnapshot(event.target.value)}
              className="mt-2 w-full rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
            >
              <option value="">Current draft</option>
              {rightSnapshots.slice(0, 6).map((snapshot) => (
                <option key={snapshot.id} value={snapshot.id}>
                  {formatSnapshotOptionLabel(snapshot)}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {branchError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {branchError}
        </div>
      )}

      {branchNotice && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
          {branchNotice}
        </div>
      )}
    </>
  );
}
