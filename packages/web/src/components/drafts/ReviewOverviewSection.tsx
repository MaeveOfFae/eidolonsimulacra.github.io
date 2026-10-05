import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { buildAssetApprovalSummary, type DraftMetadata } from '@char-gen/shared';
import { buildExportReadinessSummary } from '@/lib/drafts/export-readiness';
import CollapsibleSection from '../common/CollapsibleSection';

/**
 * Overview panel for the review screen.
 *
 * Extracted from `Review` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). It holds the tag row, the
 * validation / missing-asset notes, the export-readiness card, the lineage note,
 * the merge-provenance card, the archived note, and the draft card image controls.
 * The world attachment wiring arrives as `worldAttachments` rather than 24 more
 * props, and `defaultExpanded` is computed by the parent that owns the state it
 * depends on. Behavior is pinned by `Review.test.tsx` through the parent.
 */

export interface ReviewMergeProvenanceSummary {
  strategyLabel: string;
  sourceName: string;
  baseName: string;
  sourceDraftId: string;
  baseDraftId: string;
  sourceSide: string;
  baseSide: string;
  sourceSnapshotLabel: string | null;
  baseSnapshotLabel: string | null;
  assetNames: string[];
  createdAt: string;
}

interface ReviewOverviewSectionProps {
  metadata: DraftMetadata;
  assets: Record<string, string>;
  overviewPreview: string;
  defaultExpanded: boolean;
  validationMessage: string | null;
  missingAssetCount: number;
  exportReadiness: ReturnType<typeof buildExportReadinessSummary>;
  assetNames: string[];
  assetApprovals: ReturnType<typeof buildAssetApprovalSummary>;
  mergeProvenanceSummary: ReviewMergeProvenanceSummary | null;
  onAttachCardImage: () => void | Promise<unknown>;
  onClearCardImage: () => void | Promise<unknown>;
  worldAttachments: ReactNode;
}

export default function ReviewOverviewSection({
  metadata,
  assets,
  overviewPreview,
  defaultExpanded,
  validationMessage,
  missingAssetCount,
  exportReadiness,
  assetNames,
  assetApprovals,
  mergeProvenanceSummary,
  onAttachCardImage,
  onClearCardImage,
  worldAttachments,
}: ReviewOverviewSectionProps) {
  return (
    <CollapsibleSection
      title="Overview"
      subtitle="Tags, validation, lineage, and archive state"
      preview={overviewPreview || 'No extra metadata'}
      defaultExpanded={defaultExpanded}
      density="compact"
      className="app-panel"
      bodyClassName="space-y-2.5"
    >
      <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-2">
        {metadata.mode && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary sm:px-3 sm:text-sm">
            {metadata.mode}
          </span>
        )}
        {metadata.template_name && (
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
            {metadata.template_name}
          </span>
        )}
        {metadata.genre && (
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs sm:px-3 sm:text-sm">{metadata.genre}</span>
        )}
        {metadata.tags?.map((tag) => (
          <span key={tag} className="rounded-full bg-muted px-2.5 py-1 text-xs sm:px-3 sm:text-sm">
            {tag}
          </span>
        ))}
      </div>

      {validationMessage ? (
        <div className="app-note p-4 text-sm">
          {validationMessage}.{' '}
          <Link to="/validation" className="text-primary hover:underline">
            Open Validation screen
          </Link>
        </div>
      ) : null}

      {missingAssetCount > 0 ? (
        <div className="app-note border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
          This draft is missing {missingAssetCount} template asset{missingAssetCount === 1 ? '' : 's'}.{' '}
          {missingAssetCount === 1 ? 'Create it' : 'Create them'} with AI from the existing draft context or add{' '}
          {missingAssetCount === 1 ? 'it' : 'them'} manually before export.
        </div>
      ) : null}

      <div
        className={`rounded-xl border p-4 text-sm ${exportReadiness.requiresAcknowledgement ? 'border-warning/40 bg-warning/10 text-warning' : 'border-success/30 bg-success/10 text-muted-foreground'}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {exportReadiness.requiresAcknowledgement ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
              ) : (
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
              )}
              <div className="font-medium text-foreground">Export readiness</div>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {exportReadiness.validationState === 'checking'
                ? 'Checking validation and saved review annotations.'
                : exportReadiness.requiresAcknowledgement
                  ? 'This draft still has review blockers that will require acknowledgment in the export modal.'
                  : 'Validation and saved review annotations do not currently show export blockers.'}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
              Validation{' '}
              {exportReadiness.validationState === 'checking'
                ? 'checking'
                : exportReadiness.validationState === 'passing'
                  ? 'passing'
                  : 'failing'}
            </span>
            <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
              {exportReadiness.reviewedAssetCount}/{assetNames.length} scored
            </span>
            <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
              {exportReadiness.assetNoteCount} asset note{exportReadiness.assetNoteCount === 1 ? '' : 's'}
            </span>
            {assetApprovals.totalAssetCount > 0 && (
              <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-foreground">
                {assetApprovals.approvedCount}/{assetApprovals.totalAssetCount} approved
              </span>
            )}
          </div>
        </div>

        {exportReadiness.reviewerSummary ? (
          <div className="mt-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            Reviewer summary saved.
          </div>
        ) : null}

        {exportReadiness.blockingWarnings.length > 0 ? (
          <div className="mt-3 space-y-2 rounded-lg border border-warning/40 bg-background/60 p-3 text-xs text-warning">
            {exportReadiness.blockingWarnings.map((warning) => (
              <div key={warning}>{warning}</div>
            ))}
            {exportReadiness.lowScoreEntries.length > 0 && (
              <div>
                Low-score assets:{' '}
                {exportReadiness.lowScoreEntries
                  .map(({ assetName, score }) => `${assetName.replace(/_/g, ' ')} (${score}/5)`)
                  .join(', ')}
              </div>
            )}
          </div>
        ) : exportReadiness.unratedAssetCount > 0 ? (
          <div className="mt-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
            {exportReadiness.unratedAssetCount} asset{exportReadiness.unratedAssetCount === 1 ? '' : 's'} do not have
            saved review scores yet.
          </div>
        ) : null}
      </div>

      {metadata.parent_drafts && metadata.parent_drafts.length > 0 ? (
        <div className="app-note px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Lineage:</span> Offspring of:{' '}
          {metadata.parent_drafts.join(' + ')}
        </div>
      ) : null}
      {worldAttachments}

      {mergeProvenanceSummary ? (
        <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-medium text-foreground">Merge provenance</div>
              <div className="mt-1 text-muted-foreground">
                {mergeProvenanceSummary.strategyLabel} recorded {mergeProvenanceSummary.createdAt}.
              </div>
            </div>
            <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs text-foreground">
              {mergeProvenanceSummary.strategyLabel}
            </span>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
              <div className="font-medium uppercase tracking-[0.14em] text-muted-foreground">Source</div>
              <Link
                to={`/drafts/${encodeURIComponent(mergeProvenanceSummary.sourceDraftId)}`}
                className="mt-1 block text-sm font-medium text-foreground hover:underline"
              >
                {mergeProvenanceSummary.sourceName}
              </Link>
              <div className="mt-1">
                {mergeProvenanceSummary.sourceSide} side
                {mergeProvenanceSummary.sourceSnapshotLabel ? ` · ${mergeProvenanceSummary.sourceSnapshotLabel}` : ''}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
              <div className="font-medium uppercase tracking-[0.14em] text-muted-foreground">Base branch</div>
              <Link
                to={`/drafts/${encodeURIComponent(mergeProvenanceSummary.baseDraftId)}`}
                className="mt-1 block text-sm font-medium text-foreground hover:underline"
              >
                {mergeProvenanceSummary.baseName}
              </Link>
              <div className="mt-1">
                {mergeProvenanceSummary.baseSide} side
                {mergeProvenanceSummary.baseSnapshotLabel ? ` · ${mergeProvenanceSummary.baseSnapshotLabel}` : ''}
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Merged assets</div>
            <div className="mt-1">{mergeProvenanceSummary.assetNames.join(', ')}</div>
          </div>
        </div>
      ) : null}

      {metadata.archived_at ? (
        <div className="app-note px-4 py-3 text-sm text-muted-foreground">
          Archived{' '}
          {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
            new Date(metadata.archived_at),
          )}
        </div>
      ) : null}

      <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-medium text-foreground">Draft card image</div>
            <div className="mt-1 text-muted-foreground">
              {assets.card_image || metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')
                ? 'PNG card image attached. Standard PNG card export is available.'
                : 'No PNG card image attached yet. PNG export needs one.'}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void onAttachCardImage()}
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
            >
              Attach PNG image
            </button>
            {(assets.card_image || metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) && (
              <button
                type="button"
                onClick={() => void onClearCardImage()}
                className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                Clear image
              </button>
            )}
          </div>
        </div>
        {(assets.card_image || metadata.card_metadata?.avatar?.startsWith('data:image/png;base64,')) && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-background/60 p-3">
            <img
              src={assets.card_image || metadata.card_metadata?.avatar || ''}
              alt={`${metadata.character_name || metadata.seed} card image`}
              className="mx-auto max-h-72 rounded-lg object-contain"
            />
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
