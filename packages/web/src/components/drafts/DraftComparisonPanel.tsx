import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { DraftMetadata } from '@char-gen/shared';
import CollapsibleSection from '../common/CollapsibleSection';
import { cn } from '../../utils/cn';

export interface DraftComparisonPanelProps {
  leftDraftId?: string;
  rightDraftId?: string;
  draftOptions?: DraftMetadata[];
  onLeftDraftChange?: (draftId: string) => void;
  onRightDraftChange?: (draftId: string) => void;
}

function countChangedLines(left: string, right: string): number {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const maxLength = Math.max(leftLines.length, rightLines.length);
  let changed = 0;

  for (let index = 0; index < maxLength; index += 1) {
    if ((leftLines[index] || '') !== (rightLines[index] || '')) {
      changed += 1;
    }
  }

  return changed;
}

export function DraftComparisonPanel({
  leftDraftId,
  rightDraftId,
  draftOptions = [],
  onLeftDraftChange,
  onRightDraftChange,
}: DraftComparisonPanelProps) {
  const [selectedLeftDraftId, setSelectedLeftDraftId] = useState(leftDraftId || '');
  const [selectedRightDraftId, setSelectedRightDraftId] = useState(rightDraftId || '');
  const [selectedAsset, setSelectedAsset] = useState<string>('');

  useEffect(() => {
    setSelectedLeftDraftId(leftDraftId || '');
  }, [leftDraftId]);

  useEffect(() => {
    onLeftDraftChange?.(selectedLeftDraftId);
  }, [onLeftDraftChange, selectedLeftDraftId]);

  useEffect(() => {
    setSelectedRightDraftId(rightDraftId || '');
  }, [rightDraftId]);

  useEffect(() => {
    onRightDraftChange?.(selectedRightDraftId);
  }, [onRightDraftChange, selectedRightDraftId]);

  const leftDraft = useQuery({
    queryKey: ['draft', selectedLeftDraftId, 'comparison-left'],
    queryFn: () => api.getDraft(selectedLeftDraftId || ''),
    enabled: Boolean(selectedLeftDraftId),
  });

  const rightDraft = useQuery({
    queryKey: ['draft', selectedRightDraftId, 'comparison-right'],
    queryFn: () => api.getDraft(selectedRightDraftId || ''),
    enabled: Boolean(selectedRightDraftId),
  });

  const comparison = useMemo(() => {
    if (!leftDraft.data || !rightDraft.data) {
      return null;
    }

    const leftAssets = Object.keys(leftDraft.data.assets);
    const rightAssets = Object.keys(rightDraft.data.assets);
    const sharedAssets = leftAssets.filter((asset) => rightAssets.includes(asset));
    const uniqueLeft = leftAssets.filter((asset) => !rightAssets.includes(asset));
    const uniqueRight = rightAssets.filter((asset) => !leftAssets.includes(asset));
    const identicalAssets = sharedAssets.filter((asset) => leftDraft.data?.assets[asset] === rightDraft.data?.assets[asset]);
    const differentAssets = sharedAssets.filter((asset) => leftDraft.data?.assets[asset] !== rightDraft.data?.assets[asset]);

    return {
      sharedAssets,
      uniqueLeft,
      uniqueRight,
      identicalAssets,
      differentAssets,
    };
  }, [leftDraft.data, rightDraft.data]);

  useEffect(() => {
    if (!comparison) {
      setSelectedAsset('');
      return;
    }

    const preferredAsset = comparison.differentAssets[0] || comparison.sharedAssets[0] || '';
    if (!selectedAsset || !comparison.sharedAssets.includes(selectedAsset)) {
      setSelectedAsset(preferredAsset);
    }
  }, [comparison, selectedAsset]);

  const selectedLeftAssetContent = selectedAsset && leftDraft.data
    ? leftDraft.data.assets[selectedAsset] || ''
    : '';
  const selectedRightAssetContent = selectedAsset && rightDraft.data
    ? rightDraft.data.assets[selectedAsset] || ''
    : '';
  const changedLines = selectedAsset
    ? countChangedLines(selectedLeftAssetContent, selectedRightAssetContent)
    : 0;

  return (
    <CollapsibleSection
      title="Draft comparison"
      subtitle="Shared assets, plus template and mode drift between two saved drafts"
      preview={`Left: ${selectedLeftDraftId || 'unset'} · Right: ${selectedRightDraftId || 'unset'}`}
      meta={<GitCompare className="h-4 w-4 text-primary" />}
      defaultExpanded={Boolean(selectedLeftDraftId && selectedRightDraftId)}
      className="border-dashed text-sm text-muted-foreground"
      bodyClassName="space-y-4"
    >

      {draftOptions.length > 1 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-medium text-foreground">Left draft</span>
            <select
              value={selectedLeftDraftId}
              onChange={(event) => setSelectedLeftDraftId(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a draft...</option>
              {draftOptions.map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.seed}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-medium text-foreground">Right draft</span>
            <select
              value={selectedRightDraftId}
              onChange={(event) => setSelectedRightDraftId(event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a draft...</option>
              {draftOptions.map((draft) => (
                <option key={draft.review_id} value={draft.review_id}>
                  {draft.character_name || draft.seed}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {(leftDraft.isLoading || rightDraft.isLoading) && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading draft comparison...
        </div>
      )}

      {!selectedLeftDraftId || !selectedRightDraftId ? (
        <div className="rounded-md border border-border p-3">
          Select at least two drafts to unlock comparison.
        </div>
      ) : null}

      {comparison && leftDraft.data && rightDraft.data && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="min-w-0 rounded-md border border-border p-3">
              <div className="font-medium text-foreground">{leftDraft.data.metadata.character_name || leftDraft.data.metadata.seed}</div>
              <div className="mt-1 break-words text-xs">{leftDraft.data.metadata.template_name || 'Default Template'} · {leftDraft.data.metadata.mode || 'Unknown mode'}</div>
            </div>
            <div className="min-w-0 rounded-md border border-border p-3">
              <div className="font-medium text-foreground">{rightDraft.data.metadata.character_name || rightDraft.data.metadata.seed}</div>
              <div className="mt-1 break-words text-xs">{rightDraft.data.metadata.template_name || 'Default Template'} · {rightDraft.data.metadata.mode || 'Unknown mode'}</div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Shared assets</div>
              <div className="mt-1">{comparison.sharedAssets.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Identical assets</div>
              <div className="mt-1">{comparison.identicalAssets.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Different assets</div>
              <div className="mt-1">{comparison.differentAssets.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Unique assets</div>
              <div className="mt-1">{comparison.uniqueLeft.length + comparison.uniqueRight.length}</div>
            </div>
          </div>

          {comparison.sharedAssets.length > 0 && (
            <>
              <div className="rounded-md border border-border p-3">
                <div className="font-medium text-foreground">Compare asset</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {comparison.sharedAssets.map((asset) => {
                    const isDifferent = comparison.differentAssets.includes(asset);
                    return (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => setSelectedAsset(asset)}
                        className={cn(
                          'app-pill transition-colors',
                          selectedAsset === asset
                            ? 'app-pill-emerald'
                            : isDifferent
                              ? 'app-pill-amber'
                              : 'app-pill-muted'
                        )}
                      >
                        {asset}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedAsset && (
                <div className="space-y-3 rounded-md border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-foreground">{selectedAsset}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {selectedLeftAssetContent === selectedRightAssetContent ? 'No content differences.' : `${changedLines} changed lines detected.`}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="min-w-0 space-y-2">
                      <div className="text-xs font-medium text-foreground">Left</div>
                      <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-xs whitespace-pre-wrap break-words">{selectedLeftAssetContent || '(Asset missing)'}</pre>
                    </div>
                    <div className="min-w-0 space-y-2">
                      <div className="text-xs font-medium text-foreground">Right</div>
                      <pre className="max-h-64 overflow-auto rounded-md border border-border bg-background p-3 text-xs whitespace-pre-wrap break-words">{selectedRightAssetContent || '(Asset missing)'}</pre>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TODO: Add merge and branch actions once review state can safely preserve alternate asset revisions. */}
        </div>
      )}
    </CollapsibleSection>
  );
}

export default DraftComparisonPanel;