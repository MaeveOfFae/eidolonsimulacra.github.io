import { ArrowLeft, Bookmark, Check, ChevronDown, ChevronRight, Copy, Star, Trash2 } from 'lucide-react';
import type { AssetCandidate } from '@/lib/drafts/asset-regenerator-helpers';

/**
 * A single generated (or saved) asset candidate card.
 *
 * Extracted from `AssetRegenerator` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). Shows the card header with its
 * active badge and character count, and when expanded the current-versus-candidate panes
 * plus copy, keep, apply, apply-and-return and remove actions. Every piece of state it
 * reads arrives as a prop, so the parent keeps the mutations and the expansion bookkeeping.
 */

interface AssetCandidateCardProps {
  candidate: AssetCandidate;
  index: number;
  isSaved?: boolean;
  isExpanded: boolean;
  isCopied: boolean;
  isActive: boolean;
  cardLabel: string;
  currentAssetContent: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  embedded: boolean;
  isIntroAsset: boolean;
  savingPending: boolean;
  applyingPending: boolean;
  onToggleExpand: (candidateId: string) => void;
  onCopy: (candidateId: string, content: string) => void;
  onKeep: (candidate: AssetCandidate) => void;
  onApply: (content: string, options?: { returnToReview?: boolean }) => void;
  onDelete: (candidate: AssetCandidate, isSaved: boolean) => void;
}

export default function AssetCandidateCard({
  candidate,
  index,
  isSaved = false,
  isExpanded,
  isCopied,
  isActive,
  cardLabel,
  currentAssetContent,
  primaryActionLabel,
  secondaryActionLabel,
  embedded,
  isIntroAsset,
  savingPending,
  applyingPending,
  onToggleExpand,
  onCopy,
  onKeep,
  onApply,
  onDelete,
}: AssetCandidateCardProps) {
  return (
    <div className={`rounded-xl border ${isActive ? 'border-primary/50 bg-primary/5' : 'border-border/50'}`}>
      <button
        onClick={() => onToggleExpand(candidate.id)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">
            {cardLabel} #{index + 1}
          </span>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <Star className="h-3 w-3 fill-primary" />
              active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{new Date(candidate.timestamp).toLocaleTimeString()}</span>
          <span>•</span>
          <span>{candidate.content.length} chars</span>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3 border-t border-border/50 p-4">
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Current active
              </div>
              <div className="max-h-80 overflow-y-auto rounded-md bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
                {currentAssetContent || 'No active content saved.'}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Candidate</div>
              <div className="max-h-80 overflow-y-auto rounded-md bg-muted/50 p-3 text-sm font-mono whitespace-pre-wrap">
                {candidate.content}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void onCopy(candidate.id, candidate.content)}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {isCopied ? 'Copied' : 'Copy'}
            </button>

            {!isSaved && isIntroAsset && (
              <button
                onClick={() => void onKeep(candidate)}
                disabled={savingPending}
                className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm hover:bg-secondary/80 disabled:opacity-50"
              >
                <Bookmark className="h-3.5 w-3.5" />
                Keep
              </button>
            )}

            <button
              onClick={() => void onApply(candidate.content)}
              disabled={applyingPending || isActive}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Star className="h-3.5 w-3.5" />
              {isActive ? 'Active' : primaryActionLabel}
            </button>

            {!embedded && (
              <button
                onClick={() => void onApply(candidate.content, { returnToReview: true })}
                disabled={applyingPending || isActive}
                className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {secondaryActionLabel}
              </button>
            )}

            <button
              onClick={() => onDelete(candidate, isSaved)}
              disabled={isSaved && savingPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/20 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
