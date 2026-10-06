import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Copy, Edit3, RotateCcw, ScissorsLineDashed, X } from 'lucide-react';
import { buildAssetApprovalSummary, type DraftAssetApprovalDecision } from '@char-gen/shared';
import { formatAssetLabel } from '@/lib/drafts/asset-display';
import CollapsibleSection from '../common/CollapsibleSection';
import A1111TagLintPanel from './A1111TagLintPanel';
import ChubPublishPanel from './ChubPublishPanel';
import ComfyRenderPanel from './ComfyRenderPanel';
import { summarizeText } from '@/lib/drafts/asset-display';

/**
 * Asset cards for the review screen.
 *
 * Extracted from `Review` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). The status badges, the
 * approve / request-changes / undo decisions, the regen and optimize links, and the
 * inline editor live here. The editing state and the save/approval mutations stay
 * in the parent because the chat-panel refine flow and the pre-edit safeguard
 * snapshot share them. Behavior is pinned by `Review.test.tsx` through the parent.
 */

export interface ReviewAssetEntry {
  name: string;
  exists: boolean;
  description?: string;
  required?: boolean;
}

interface ReviewAssetCardsProps {
  reviewId: string;
  assets: Record<string, string>;
  assetEntries: ReviewAssetEntry[];
  assetApprovals: ReturnType<typeof buildAssetApprovalSummary>;
  editingAsset: string | null;
  editingBaseContent: string | null;
  editContent: string;
  copiedAsset: string | null;
  isSaving: boolean;
  isRecordingApproval: boolean;
  onCopyAsset: (assetName: string) => void | Promise<unknown>;
  onStartEdit: (assetName: string) => void;
  onSaveAsset: () => void;
  onCancelEdit: () => void;
  onEditContentChange: (value: string) => void;
  onRecordApproval: (assetName: string, decision: DraftAssetApprovalDecision | null) => void;
  /** Provided when the a1111 tag lint panel should render (saves through the parent's asset mutation). */
  onApplyA1111Fixes?: (nextContent: string) => void;
}

export default function ReviewAssetCards({
  reviewId,
  assets,
  assetEntries,
  assetApprovals,
  editingAsset,
  editingBaseContent,
  editContent,
  copiedAsset,
  isSaving,
  isRecordingApproval,
  onCopyAsset,
  onStartEdit,
  onSaveAsset,
  onCancelEdit,
  onEditContentChange,
  onRecordApproval,
  onApplyA1111Fixes,
}: ReviewAssetCardsProps) {
  const assetApprovalLookup = useMemo(
    () => new Map(assetApprovals.entries.map((entry) => [entry.assetName, entry] as const)),
    [assetApprovals],
  );

  return (
    <div data-tour-anchor="review-assets" className="space-y-2.5 sm:space-y-3">
      {assetEntries.map((assetEntry) => {
        const assetName = assetEntry.name;
        const assetExists = assetEntry.exists;
        const approvalEntry = assetApprovalLookup.get(assetName);
        const approvalStatus = approvalEntry?.status ?? 'unapproved';
        const assetLabel = formatAssetLabel(assetName);
        const assetPreview =
          editingAsset === assetName
            ? 'Editing asset content'
            : assetExists
              ? summarizeText(assets[assetName], 180)
              : 'No saved content yet';

        return (
          <CollapsibleSection
            key={assetName}
            title={assetLabel}
            subtitle={assetEntry.description}
            preview={assetPreview}
            defaultExpanded={false}
            forceExpanded={editingAsset === assetName}
            density="compact"
            className="app-panel"
            bodyClassName="space-y-2.5"
          >
            {(assetEntry.required || !assetExists || approvalStatus !== 'unapproved') && (
              <div className="flex flex-wrap items-center gap-1.5">
                {!assetExists && (
                  <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-warning">
                    Missing
                  </span>
                )}
                {assetEntry.required && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-secondary-foreground">
                    Req
                  </span>
                )}
                {assetExists && approvalStatus === 'approved' && (
                  <span className="rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-success">
                    Approved
                  </span>
                )}
                {approvalStatus === 'changes_requested' && (
                  <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-warning">
                    Changes requested
                  </span>
                )}
                {approvalStatus === 'stale' && (
                  <span className="rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Approval stale
                  </span>
                )}
              </div>
            )}

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {assetExists && (
                <button
                  onClick={() => void onCopyAsset(assetName)}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                >
                  {copiedAsset === assetName ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copiedAsset === assetName ? 'Copied' : 'Copy'}
                </button>
              )}
              <Link
                to={`/drafts/${encodeURIComponent(reviewId)}/assets/${encodeURIComponent(assetName)}/regenerate`}
                className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
              >
                <ArrowLeft className="h-3 w-3 rotate-180" />
                {assetExists ? 'Regen' : 'Create with AI'}
              </Link>
              <Link
                to={`/optimize?draft=${encodeURIComponent(reviewId)}&asset=${encodeURIComponent(assetName)}&text=${encodeURIComponent(editingAsset === assetName ? editContent : (assets[assetName] ?? ''))}`}
                className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
              >
                <ScissorsLineDashed className="h-3 w-3" />
                Optimize
              </Link>
              {assetExists && (
                <button
                  onClick={() => onRecordApproval(assetName, { status: 'approved' })}
                  disabled={isRecordingApproval}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                >
                  <Check className="h-3 w-3" />
                  Approve
                </button>
              )}
              {assetExists && (
                <button
                  onClick={() => onRecordApproval(assetName, { status: 'changes_requested' })}
                  disabled={isRecordingApproval}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                >
                  <AlertTriangle className="h-3 w-3" />
                  Request changes
                </button>
              )}
              {assetExists && approvalStatus !== 'unapproved' && (
                <button
                  onClick={() => onRecordApproval(assetName, null)}
                  disabled={isRecordingApproval}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent disabled:opacity-50"
                >
                  <RotateCcw className="h-3 w-3" />
                  Undo decision
                </button>
              )}
              {editingAsset !== assetName && (
                <button
                  onClick={() => onStartEdit(assetName)}
                  className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2 py-1 text-xs hover:bg-accent"
                >
                  <Edit3 className="h-3 w-3" />
                  {assetExists ? 'Edit' : 'Add manually'}
                </button>
              )}
            </div>

            <div className="rounded-xl border border-border/60 bg-background/45 p-2 sm:p-2.5">
              {editingAsset === assetName ? (
                <div className="space-y-3">
                  <textarea
                    aria-label={`${assetLabel} content`}
                    value={editContent}
                    onChange={(event) => onEditContentChange(event.target.value)}
                    className="min-h-[160px] w-full min-w-0 rounded-xl border border-input bg-background p-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[180px]"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={onSaveAsset}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSaving ? <span className="animate-spin">⏳</span> : <Check className="h-4 w-4" />}
                      {editingBaseContent === null ? 'Create Asset' : 'Save'}
                    </button>
                    <button
                      onClick={onCancelEdit}
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : assetExists ? (
                <pre className="max-h-[24rem] overflow-auto whitespace-pre-wrap break-words text-xs leading-5 font-mono">
                  {assets[assetName]}
                </pre>
              ) : (
                <div className="rounded-lg border border-dashed border-border/70 bg-background/40 p-3 text-sm text-muted-foreground">
                  Not saved yet. Create it with AI using the existing draft context, or add it manually here.
                </div>
              )}
            </div>

            {assetName === 'a1111' && assetExists && editingAsset !== assetName && onApplyA1111Fixes && (
              <A1111TagLintPanel
                content={assets[assetName] ?? ''}
                onApplyFixes={onApplyA1111Fixes}
                isSaving={isSaving}
              />
            )}

            {assetName === 'a1111' && assetExists && editingAsset !== assetName && (
              <ComfyRenderPanel
                content={assets[assetName] ?? ''}
                approved={approvalStatus === 'approved'}
                referenceImageDataUrl={
                  typeof assets.card_image === 'string' && assets.card_image.startsWith('data:')
                    ? assets.card_image
                    : undefined
                }
              />
            )}

            {assetName === 'character_sheet' && assetExists && editingAsset !== assetName && (
              <ChubPublishPanel approved={approvalStatus === 'approved'} />
            )}
          </CollapsibleSection>
        );
      })}
    </div>
  );
}
