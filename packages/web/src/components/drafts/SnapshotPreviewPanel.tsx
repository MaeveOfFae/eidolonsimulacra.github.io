import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { DraftMetadata } from '@char-gen/shared';
import { api } from '@/lib/api';
import { formatTimestamp } from '@/lib/format-timestamp';
import {
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotDiffCandidateAssets,
  buildDraftSnapshotDiffModelFromStates,
  buildDraftSnapshotDiffSummaryFromStates,
} from '@/lib/drafts/revision-snapshots';

/**
 * Restore-point preview for the drafts library.
 *
 * Extracted from `Drafts` (5.0 workspace-release work stream: decompose the giant
 * screens into focused, individually testable sections). It owns the comparison
 * state and the snapshot-diff model; the selected snapshot id stays in the parent
 * because the sidebar and both tabs drive it. Behavior is pinned by
 * `Drafts.test.tsx` through the parent.
 */

type SnapshotPreviewEntry = {
  draftId: string;
  draftName: string;
  snapshot: NonNullable<DraftMetadata['revision_snapshots']>[number];
};

interface SnapshotPreviewPanelProps {
  entries: SnapshotPreviewEntry[];
  selectedSnapshotPreviewId: string;
  onSelectedSnapshotPreviewIdChange: (snapshotId: string) => void;
}

export default function SnapshotPreviewPanel({
  entries,
  selectedSnapshotPreviewId,
  onSelectedSnapshotPreviewIdChange,
}: SnapshotPreviewPanelProps) {
  const [selectedSnapshotPreviewAssetName, setSelectedSnapshotPreviewAssetName] = useState('');
  const [compareSnapshotPreviewId, setCompareSnapshotPreviewId] = useState('');

  const selectedSnapshotEntry = entries.find((entry) => entry.snapshot.id === selectedSnapshotPreviewId) ?? null;
  const { data: selectedSnapshotDraft, isLoading: selectedSnapshotDraftLoading } = useQuery({
    queryKey: ['draft', selectedSnapshotEntry?.draftId, 'library-snapshot-preview'],
    queryFn: () => api.getDraft(selectedSnapshotEntry?.draftId || ''),
    enabled: Boolean(selectedSnapshotEntry?.draftId),
  });
  const selectedSnapshotCompareOptions = useMemo(
    () =>
      (selectedSnapshotDraft?.metadata.revision_snapshots ?? []).filter(
        (snapshot) => snapshot.id !== selectedSnapshotEntry?.snapshot.id,
      ),
    [selectedSnapshotDraft?.metadata.revision_snapshots, selectedSnapshotEntry?.snapshot.id],
  );
  const selectedSnapshotCompareBaseSnapshot = useMemo(
    () => selectedSnapshotCompareOptions.find((snapshot) => snapshot.id === compareSnapshotPreviewId) ?? null,
    [compareSnapshotPreviewId, selectedSnapshotCompareOptions],
  );
  const selectedSnapshotCompareBaseState = useMemo(
    () =>
      selectedSnapshotCompareBaseSnapshot?.state ??
      (selectedSnapshotDraft ? buildDraftRevisionSnapshotState(selectedSnapshotDraft) : null),
    [selectedSnapshotCompareBaseSnapshot, selectedSnapshotDraft],
  );
  const selectedSnapshotCompareBaseLabel =
    selectedSnapshotCompareBaseSnapshot?.label ||
    (selectedSnapshotCompareBaseSnapshot ? 'Restore point' : 'Current draft');
  const selectedSnapshotDiffSummary =
    selectedSnapshotEntry && selectedSnapshotDraft && selectedSnapshotCompareBaseState
      ? buildDraftSnapshotDiffSummaryFromStates(selectedSnapshotCompareBaseState, selectedSnapshotEntry.snapshot.state)
      : null;
  const selectedSnapshotCandidateAssets = useMemo(
    () => (selectedSnapshotDiffSummary ? buildDraftSnapshotDiffCandidateAssets(selectedSnapshotDiffSummary) : []),
    [selectedSnapshotDiffSummary],
  );
  const selectedSnapshotActiveAssetName = selectedSnapshotCandidateAssets.includes(selectedSnapshotPreviewAssetName)
    ? selectedSnapshotPreviewAssetName
    : selectedSnapshotCandidateAssets[0] || '';
  const selectedSnapshotDiffModel =
    selectedSnapshotEntry && selectedSnapshotDraft && selectedSnapshotCompareBaseState
      ? buildDraftSnapshotDiffModelFromStates(selectedSnapshotCompareBaseState, selectedSnapshotEntry.snapshot.state, {
          assetName: selectedSnapshotActiveAssetName || undefined,
          maxAssets: selectedSnapshotActiveAssetName ? 1 : 2,
          maxPreviewLines: 5,
        })
      : null;
  const selectedSnapshotAssetPreviews = selectedSnapshotDiffModel?.assetPreviews ?? [];
  const selectedSnapshotPreviewIndex = selectedSnapshotEntry
    ? entries.findIndex((entry) => entry.snapshot.id === selectedSnapshotEntry.snapshot.id)
    : -1;
  const previousSnapshotEntry = selectedSnapshotPreviewIndex > 0 ? entries[selectedSnapshotPreviewIndex - 1] : null;
  const nextSnapshotEntry =
    selectedSnapshotPreviewIndex >= 0 && selectedSnapshotPreviewIndex < entries.length - 1
      ? entries[selectedSnapshotPreviewIndex + 1]
      : null;

  useEffect(() => {
    if (!selectedSnapshotCandidateAssets.length) {
      setSelectedSnapshotPreviewAssetName('');
      return;
    }

    setSelectedSnapshotPreviewAssetName((current) =>
      selectedSnapshotCandidateAssets.includes(current) ? current : (selectedSnapshotCandidateAssets[0] ?? ''),
    );
  }, [selectedSnapshotCandidateAssets]);

  useEffect(() => {
    if (!compareSnapshotPreviewId) {
      return;
    }

    if (!selectedSnapshotCompareOptions.some((snapshot) => snapshot.id === compareSnapshotPreviewId)) {
      setCompareSnapshotPreviewId('');
    }
  }, [compareSnapshotPreviewId, selectedSnapshotCompareOptions]);

  useEffect(() => {
    if (!selectedSnapshotEntry || !selectedSnapshotDraft) {
      return;
    }

    const nextSummary = selectedSnapshotCompareBaseState
      ? buildDraftSnapshotDiffSummaryFromStates(
          selectedSnapshotCompareBaseState,
          selectedSnapshotEntry.snapshot.state,
          selectedSnapshotPreviewAssetName || undefined,
        )
      : null;
    if (selectedSnapshotPreviewAssetName && nextSummary?.assetFocusedDifference) {
      return;
    }

    const overlappingAsset = selectedSnapshotCandidateAssets.find((assetName) => {
      if (!selectedSnapshotCompareBaseState) {
        return false;
      }

      const diff = buildDraftSnapshotDiffSummaryFromStates(
        selectedSnapshotCompareBaseState,
        selectedSnapshotEntry.snapshot.state,
        assetName,
      );
      return diff.assetFocusedDifference;
    });

    setSelectedSnapshotPreviewAssetName(overlappingAsset ?? selectedSnapshotCandidateAssets[0] ?? '');
  }, [
    selectedSnapshotCandidateAssets,
    selectedSnapshotCompareBaseState,
    selectedSnapshotDraft,
    selectedSnapshotEntry,
    selectedSnapshotPreviewAssetName,
  ]);

  if (!selectedSnapshotEntry) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-background/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Snapshot preview</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {selectedSnapshotEntry.draftName} · {selectedSnapshotEntry.snapshot.label || 'Restore point'} ·{' '}
            {formatTimestamp(selectedSnapshotEntry.snapshot.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              previousSnapshotEntry && onSelectedSnapshotPreviewIdChange(previousSnapshotEntry.snapshot.id)
            }
            disabled={!previousSnapshotEntry}
            className="app-button app-button-secondary disabled:opacity-50"
          >
            Previous snapshot
          </button>
          <button
            type="button"
            onClick={() => nextSnapshotEntry && onSelectedSnapshotPreviewIdChange(nextSnapshotEntry.snapshot.id)}
            disabled={!nextSnapshotEntry}
            className="app-button app-button-secondary disabled:opacity-50"
          >
            Next snapshot
          </button>
          <Link
            to={`/drafts/${encodeURIComponent(selectedSnapshotEntry.draftId)}?historySnapshot=${encodeURIComponent(selectedSnapshotEntry.snapshot.id)}`}
            className="app-button app-button-secondary"
          >
            Open full history
          </Link>
        </div>
      </div>

      {selectedSnapshotDraftLoading ? (
        <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
          Loading snapshot preview...
        </div>
      ) : selectedSnapshotDiffSummary ? (
        <div className="mt-3 space-y-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">
              <span className="sr-only">Compare preview against</span>
              <select
                value={compareSnapshotPreviewId}
                onChange={(event) => setCompareSnapshotPreviewId(event.target.value)}
                className="rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
              >
                <option value="">Compare against current draft</option>
                {selectedSnapshotCompareOptions.map((snapshot) => (
                  <option key={snapshot.id} value={snapshot.id}>
                    {snapshot.label || 'Restore point'} · {formatTimestamp(snapshot.created_at)}
                  </option>
                ))}
              </select>
            </label>
            <span className="text-xs text-muted-foreground">
              Comparing against <span className="font-medium text-foreground">{selectedSnapshotCompareBaseLabel}</span>
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Asset changes</div>
              <div className="mt-1 text-xl font-semibold text-foreground">
                {selectedSnapshotDiffSummary.assetDeltaCount}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Metadata</div>
              <div className="mt-1 text-sm text-foreground">
                {selectedSnapshotDiffSummary.metadataChanges.length > 0
                  ? selectedSnapshotDiffSummary.metadataChanges.join(', ')
                  : 'No drift'}
              </div>
            </div>
            <div className="rounded-lg border border-border/60 bg-background/60 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Changed assets</div>
              <div className="mt-1 text-sm text-foreground">
                {selectedSnapshotDiffSummary.changedAssets.length > 0
                  ? selectedSnapshotDiffSummary.changedAssets.slice(0, 3).join(', ')
                  : 'No content drift'}
              </div>
            </div>
          </div>

          {selectedSnapshotCandidateAssets.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {selectedSnapshotCandidateAssets.map((assetName) => (
                <button
                  key={assetName}
                  type="button"
                  onClick={() => setSelectedSnapshotPreviewAssetName(assetName)}
                  className={`app-pill transition-colors ${selectedSnapshotActiveAssetName === assetName ? 'app-pill-emerald' : 'app-pill-muted'}`}
                >
                  {assetName}
                </button>
              ))}
            </div>
          )}

          {selectedSnapshotAssetPreviews.length > 0 ? (
            <div className="space-y-3">
              {selectedSnapshotAssetPreviews.map((preview) => (
                <div
                  key={`${selectedSnapshotEntry.snapshot.id}-${preview.assetName}`}
                  className="rounded-lg border border-border/60 bg-background/60 p-3"
                >
                  <div className="font-medium text-foreground">{preview.assetName}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {preview.changedLineCount} changed line{preview.changedLineCount === 1 ? '' : 's'}
                  </div>
                  <div className="mt-3 space-y-2">
                    {preview.previewLines.map((line) => (
                      <div
                        key={`${preview.assetName}-${line.lineNumber}-${line.status}`}
                        className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                      >
                        <div className="rounded-md border border-border/60 bg-background/80 p-2">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {selectedSnapshotCompareBaseSnapshot ? 'Baseline snapshot' : 'Current'} · line{' '}
                            {line.lineNumber}
                          </div>
                          <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-foreground">
                            {line.currentLine || '(empty)'}
                          </pre>
                        </div>
                        <div className="rounded-md border border-border/60 bg-background/80 p-2">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            Snapshot · line {line.lineNumber}
                          </div>
                          <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] text-foreground">
                            {line.snapshotLine || '(empty)'}
                          </pre>
                        </div>
                      </div>
                    ))}
                    {preview.omittedDifferenceCount > 0 && (
                      <div className="text-[11px] text-muted-foreground">
                        +{preview.omittedDifferenceCount} more differing line
                        {preview.omittedDifferenceCount === 1 ? '' : 's'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
              This snapshot currently matches the latest saved asset content.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-border/60 bg-background/60 p-4 text-sm text-muted-foreground">
          Choose another restore point to inspect its diff preview.
        </div>
      )}
    </div>
  );
}
