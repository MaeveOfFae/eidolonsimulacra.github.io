import { cn } from '../../utils/cn';
import { formatAssetLabel } from '@/lib/drafts/asset-display';
import type { MergeCandidateAsset } from '@/lib/drafts/comparison-helpers';

/**
 * Shared-asset picker and merge-branch staging for the draft comparison panel.
 *
 * Extracted from `DraftComparisonPanel` (5.0 workspace-release work stream: decompose the
 * giant screens into focused, individually testable sections). The asset pills show which
 * shared assets differ between the two drafts, and the merge-branch set stages the assets
 * that a branch copy should receive, listing them again as a manifest. Selection state and
 * the merge mutations stay in the parent; this section renders the two lists and reports
 * the two toggles. Behavior is pinned by `DraftComparisonPanel.test.tsx`.
 */

interface DraftComparisonSharedAssetsProps {
  sharedAssets: string[];
  differentAssets: string[];
  selectedAsset: string;
  onSelectAsset: (asset: string) => void;
  stagedMergeAssets: string[];
  mergeCandidateAssets: MergeCandidateAsset[];
  stagedMergeManifest: MergeCandidateAsset[];
  onToggleStagedMergeAsset: (assetName: string) => void;
}

export function DraftComparisonSharedAssets({
  sharedAssets,
  differentAssets,
  selectedAsset,
  onSelectAsset,
  stagedMergeAssets,
  mergeCandidateAssets,
  stagedMergeManifest,
  onToggleStagedMergeAsset,
}: DraftComparisonSharedAssetsProps) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="font-medium text-foreground">Compare asset</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {sharedAssets.map((asset) => {
          const isDifferent = differentAssets.includes(asset);
          return (
            <button
              key={asset}
              type="button"
              onClick={() => onSelectAsset(asset)}
              className={cn(
                'app-pill transition-colors',
                selectedAsset === asset ? 'app-pill-emerald' : isDifferent ? 'app-pill-amber' : 'app-pill-muted',
              )}
            >
              {asset}
            </button>
          );
        })}
      </div>
      <div className="mt-3 rounded-md border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium text-foreground">Merge branch set</span>
          <span>{stagedMergeAssets.length} staged</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {mergeCandidateAssets.length > 0 ? (
            mergeCandidateAssets.map(({ assetName, source, reason }) => {
              const isStaged = stagedMergeAssets.includes(assetName);
              const helperLabel =
                source === 'left'
                  ? 'Left only'
                  : source === 'right'
                    ? 'Right only'
                    : reason === 'review-drift'
                      ? 'Review drift'
                      : 'Content drift';
              return (
                <button
                  key={`merge-${assetName}`}
                  type="button"
                  onClick={() => onToggleStagedMergeAsset(assetName)}
                  className={cn('app-pill transition-colors', isStaged ? 'app-pill-emerald' : 'app-pill-muted')}
                >
                  {isStaged ? 'Staged' : 'Stage'} {assetName} · {helperLabel}
                </button>
              );
            })
          ) : (
            <span>No merge candidates available yet.</span>
          )}
        </div>
        {stagedMergeAssets.length > 0 && (
          <div className="mt-3 rounded-md border border-border/60 bg-background/70 p-3">
            <div className="text-xs font-medium text-foreground">Merge manifest</div>
            <div className="mt-2 space-y-2 text-xs text-muted-foreground">
              {stagedMergeManifest.map(({ assetName, source, reason }) => (
                <div
                  key={`manifest-${assetName}`}
                  className="rounded-md border border-border/50 bg-background/60 px-3 py-2"
                >
                  <div className="font-medium text-foreground">{formatAssetLabel(assetName)}</div>
                  <div className="mt-1">
                    {source === 'either'
                      ? reason === 'review-drift'
                        ? 'Shared asset with review drift.'
                        : 'Shared asset with content drift.'
                      : `Unique ${source} asset that will be copied into the new branch.`}
                  </div>
                </div>
              ))}
              <div>
                Staged branch merges apply the selected assets plus their saved scores and notes onto a fresh branch
                copy of the target side.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
