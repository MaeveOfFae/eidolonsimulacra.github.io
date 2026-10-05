import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { summarizeText } from '@/lib/drafts/asset-display';

/**
 * Selected-asset detail for the draft comparison panel.
 *
 * Extracted from `DraftComparisonPanel` (5.0 workspace-release work stream: decompose the
 * giant screens into focused, individually testable sections). Renders the asset header
 * with its changed-line count and stage/remove toggle, the review-drift warning, the
 * promotion notices, and the side-by-side score, note and content panes. The action row
 * that mutates drafts arrives through `children`, so the section stays presentational.
 * Behavior is pinned by `DraftComparisonPanel.test.tsx`.
 */

interface AssetReviewComparisonLike {
  hasDifferences: boolean;
  leftReview: { score?: number; note?: string };
  rightReview: { score?: number; note?: string };
}

export interface DraftAssetComparisonDetailProps {
  assetName: string;
  leftContent: string;
  rightContent: string;
  changedLines: number;
  reviewComparison?: AssetReviewComparisonLike | null;
  isMergeCandidate: boolean;
  isStaged: boolean;
  onToggleStaged: (assetName: string) => void;
  promotionNotice?: string | null;
  promotionError?: string | null;
  children: ReactNode;
}

export function DraftAssetComparisonDetail({
  assetName,
  leftContent,
  rightContent,
  changedLines,
  reviewComparison,
  isMergeCandidate,
  isStaged,
  onToggleStaged,
  promotionNotice,
  promotionError,
  children,
}: DraftAssetComparisonDetailProps) {
  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium text-foreground">{assetName}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {leftContent === rightContent ? 'No content differences.' : `${changedLines} changed lines detected.`}
          </div>
        </div>
        {isMergeCandidate && (
          <button
            type="button"
            onClick={() => onToggleStaged(assetName)}
            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            {isStaged ? 'Remove from merge set' : 'Stage for merge'}
          </button>
        )}
      </div>

      {reviewComparison?.hasDifferences && (
        <div className="rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              Saved review context differs for this asset. Use the score and note drift here as merge groundwork before
              promoting one version over the other.
            </div>
          </div>
        </div>
      )}
      {children}
      {promotionError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {promotionError}
        </div>
      )}

      {promotionNotice && (
        <div className="rounded-md border border-success/40 bg-success/10 px-3 py-2 text-xs text-success">
          {promotionNotice}
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-2">
          <div className="text-xs font-medium text-foreground">Left</div>
          <div className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            <div>
              Score: {reviewComparison?.leftReview.score ? `${reviewComparison.leftReview.score}/5` : 'Unrated'}
            </div>
            <div className="mt-1">
              Note:{' '}
              {reviewComparison?.leftReview.note
                ? summarizeText(reviewComparison.leftReview.note, 140)
                : 'No asset note saved.'}
            </div>
          </div>
          <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-xs whitespace-pre-wrap break-words">
            {leftContent || '(Asset missing)'}
          </pre>
        </div>
        <div className="min-w-0 space-y-2">
          <div className="text-xs font-medium text-foreground">Right</div>
          <div className="rounded-md border border-border bg-background/70 px-3 py-2 text-xs text-muted-foreground">
            <div>
              Score: {reviewComparison?.rightReview.score ? `${reviewComparison.rightReview.score}/5` : 'Unrated'}
            </div>
            <div className="mt-1">
              Note:{' '}
              {reviewComparison?.rightReview.note
                ? summarizeText(reviewComparison.rightReview.note, 140)
                : 'No asset note saved.'}
            </div>
          </div>
          <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-xs whitespace-pre-wrap break-words">
            {rightContent || '(Asset missing)'}
          </pre>
        </div>
      </div>
    </div>
  );
}
