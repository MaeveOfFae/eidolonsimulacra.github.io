import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, History, Loader2, RotateCcw, Save } from 'lucide-react';
import type { DraftMetadata } from '@char-gen/shared';
import { api } from '@/lib/api';
import { formatTimestamp } from '@/lib/format-timestamp';
import {
  buildDraftRevisionSnapshotState,
  buildDraftSnapshotDiffModelsFromSnapshots,
  type DraftSnapshotDiffModel,
} from '@/lib/drafts/revision-snapshots';
import CollapsibleSection from '../common/CollapsibleSection';
import { DraftStorage } from '@/lib/storage/draft-db';
import { isDesktopRuntime } from '@/lib/runtime';

export interface VersionHistoryPanelProps {
  draftId?: string;
  assetName?: string;
  snapshotId?: string;
}

function formatAssetLabel(assetName: string): string {
  return assetName.replace(/_/g, ' ');
}

function formatMergeResolutionReason(reason: 'content-drift' | 'review-drift' | 'left-only' | 'right-only'): string {
  switch (reason) {
    case 'content-drift':
      return 'content drift';
    case 'review-drift':
      return 'review drift';
    case 'left-only':
      return 'left-only asset';
    case 'right-only':
      return 'right-only asset';
    default:
      return reason;
  }
}

function buildRevertedReviewAnnotations(
  currentAnnotations: DraftMetadata['review_annotations'],
  snapshotAnnotations: DraftMetadata['review_annotations'],
  assetName: string,
) {
  const nextAssetScores = { ...(currentAnnotations?.asset_scores ?? {}) };
  const nextAssetNotes = { ...(currentAnnotations?.asset_notes ?? {}) };
  const sourceScore = snapshotAnnotations?.asset_scores?.[assetName];
  const sourceNote = snapshotAnnotations?.asset_notes?.[assetName]?.trim() ?? '';

  if (sourceScore !== undefined) {
    nextAssetScores[assetName] = sourceScore;
  } else {
    delete nextAssetScores[assetName];
  }

  if (sourceNote) {
    nextAssetNotes[assetName] = sourceNote;
  } else {
    delete nextAssetNotes[assetName];
  }

  const hasScores = Object.keys(nextAssetScores).length > 0;
  const hasNotes = Object.keys(nextAssetNotes).length > 0;
  const summaryNotes = currentAnnotations?.notes?.trim() ?? '';

  if (!summaryNotes && !hasScores && !hasNotes) {
    return undefined;
  }

  return {
    ...(summaryNotes ? { notes: summaryNotes } : {}),
    ...(hasScores ? { asset_scores: nextAssetScores } : {}),
    ...(hasNotes ? { asset_notes: nextAssetNotes } : {}),
    updated_at: new Date().toISOString(),
  };
}

export function VersionHistoryPanel({ draftId, assetName, snapshotId }: VersionHistoryPanelProps) {
  const desktopRuntime = isDesktopRuntime();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compareSnapshotId, setCompareSnapshotId] = useState<string>('');
  const draftQuery = useQuery({
    queryKey: ['draft', draftId, 'version-history'],
    queryFn: () => api.getDraft(draftId || ''),
    enabled: Boolean(draftId),
  });
  const draftListQuery = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
    enabled: Boolean(draftId),
  });

  const activityQuery = useQuery({
    queryKey: ['draft', draftId, 'asset-activity'],
    queryFn: () => DraftStorage.getAssetActivity(draftId || ''),
    enabled: Boolean(draftId),
  });

  const assetActivity = useMemo(() => {
    const rows = activityQuery.data ?? [];
    const filtered = assetName ? rows.filter((row) => row.assetName === assetName) : rows;
    return filtered.slice(0, 6);
  }, [activityQuery.data, assetName]);
  const snapshots = useMemo(() => {
    const allSnapshots = draftQuery.data?.metadata.revision_snapshots ?? [];
    if (!snapshotId) {
      return allSnapshots.slice(0, 6);
    }

    const selectedSnapshot = allSnapshots.find((snapshot) => snapshot.id === snapshotId);
    if (!selectedSnapshot) {
      return allSnapshots.slice(0, 6);
    }

    return [selectedSnapshot, ...allSnapshots.filter((snapshot) => snapshot.id !== snapshotId)].slice(0, 6);
  }, [draftQuery.data?.metadata.revision_snapshots, snapshotId]);
  const compareSnapshot = useMemo(
    () => snapshots.find((snapshot) => snapshot.id === compareSnapshotId) ?? null,
    [compareSnapshotId, snapshots],
  );
  const compareBaseState = useMemo(
    () => compareSnapshot?.state ?? (draftQuery.data ? buildDraftRevisionSnapshotState(draftQuery.data) : null),
    [compareSnapshot, draftQuery.data],
  );
  const compareBaseLabel = compareSnapshot?.label || (compareSnapshot ? 'Restore point' : 'Current draft');
  const snapshotDiffModels = useMemo(() => {
    if (!draftQuery.data || !compareBaseState) {
      return new Map<string, DraftSnapshotDiffModel>();
    }

    return buildDraftSnapshotDiffModelsFromSnapshots(compareBaseState, snapshots, {
      assetName,
      maxAssets: assetName ? 1 : 2,
    });
  }, [assetName, compareBaseState, draftQuery.data, snapshots]);

  useEffect(() => {
    if (!compareSnapshotId) {
      return;
    }

    if (!snapshots.some((snapshot) => snapshot.id === compareSnapshotId)) {
      setCompareSnapshotId('');
    }
  }, [compareSnapshotId, snapshots]);

  const refreshVersionQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['draft', draftId] }),
      queryClient.invalidateQueries({ queryKey: ['draft', draftId, 'version-history'] }),
      queryClient.invalidateQueries({ queryKey: ['draft', draftId, 'asset-activity'] }),
      queryClient.invalidateQueries({ queryKey: ['drafts'] }),
    ]);
  };

  const createSnapshotMutation = useMutation({
    mutationFn: async () => {
      if (!draftId) {
        return null;
      }

      return api.createDraftSnapshot(draftId, {
        label: assetName ? `Checkpoint for ${assetName}` : 'Manual restore point',
        reason: assetName ? `manual:${assetName}` : 'manual',
      });
    },
    onSuccess: async () => {
      setErrorMessage(null);
      setNotice('Restore point saved.');
      await refreshVersionQueries();
    },
    onError: (error) => {
      setNotice(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save restore point.');
    },
  });

  const restoreSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: string) => {
      if (!draftId) {
        return null;
      }

      return api.restoreDraftSnapshot(draftId, snapshotId);
    },
    onSuccess: async () => {
      setErrorMessage(null);
      setNotice('Restore point applied. A safeguard snapshot of the previous draft state was saved first.');
      await refreshVersionQueries();
    },
    onError: (error) => {
      setNotice(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to restore snapshot.');
    },
  });

  const revertMergedAssetMutation = useMutation({
    mutationFn: async ({ eventId, assetName }: { eventId: string; assetName: string }) => {
      if (!draftId) {
        return null;
      }

      const currentDraft = await api.getDraft(draftId);
      const mergeEntry =
        currentDraft.metadata.merge_history?.find((entry) => entry.id === eventId) ??
        (currentDraft.metadata.merge_provenance && eventId === 'merge-provenance'
          ? { id: 'merge-provenance', ...currentDraft.metadata.merge_provenance }
          : null);
      if (!mergeEntry?.undo_snapshot_id) {
        throw new Error('This merge event does not have a safeguard snapshot to restore from.');
      }

      const resolution = mergeEntry.asset_resolutions?.find((entry) => entry.asset_name === assetName);
      if (!resolution?.target_previously_had_asset) {
        throw new Error('This asset was added by the merge. Use the full merge undo to remove it cleanly.');
      }

      const undoSnapshot = currentDraft.metadata.revision_snapshots?.find(
        (snapshot) => snapshot.id === mergeEntry.undo_snapshot_id,
      );
      if (!undoSnapshot) {
        throw new Error('The safeguard snapshot for this merge event is no longer available.');
      }

      const previousHasAsset = Object.prototype.hasOwnProperty.call(undoSnapshot.state.assets, assetName);
      if (!previousHasAsset) {
        throw new Error('This asset did not exist before the merge. Use the full merge undo to remove it cleanly.');
      }

      const currentHasAsset = Object.prototype.hasOwnProperty.call(currentDraft.assets, assetName);
      const previousContent = undoSnapshot.state.assets[assetName] ?? '';
      const nextAnnotations = buildRevertedReviewAnnotations(
        currentDraft.metadata.review_annotations,
        undoSnapshot.state.review_annotations,
        assetName,
      );

      await api.createDraftSnapshot(draftId, {
        label: `Before reverting ${assetName}`,
        reason: `pre-merge-asset-revert:${assetName}`,
      });

      await api.updateAsset(draftId, assetName, previousContent, {
        overwrite: currentHasAsset,
        expectedPreviousContent: currentHasAsset ? currentDraft.assets[assetName] : null,
      });
      await api.updateMetadata(draftId, {
        review_annotations: nextAnnotations,
      });

      return { assetName };
    },
    onSuccess: async (result) => {
      if (!result) {
        return;
      }

      setErrorMessage(null);
      setNotice(`Reverted ${formatAssetLabel(result.assetName)} to its pre-merge state.`);
      await refreshVersionQueries();
    },
    onError: (error) => {
      setNotice(null);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to revert merged asset.');
    },
  });

  const draft = draftQuery.data;
  const assetCount = draft ? Object.keys(draft.assets).length : 0;
  const parentCount = draft?.metadata.parent_drafts?.length ?? 0;
  const relatedDraftLookup = useMemo(
    () => new Map((draftListQuery.data?.drafts ?? []).map((entry) => [entry.review_id, entry] as const)),
    [draftListQuery.data],
  );
  const mergeHistoryEntries = useMemo(() => {
    if (!draft) {
      return [] as Array<NonNullable<DraftMetadata['merge_history']>[number]>;
    }

    if (draft.metadata.merge_history?.length) {
      return draft.metadata.merge_history;
    }

    return draft.metadata.merge_provenance ? [{ id: 'merge-provenance', ...draft.metadata.merge_provenance }] : [];
  }, [draft]);

  return (
    <CollapsibleSection
      title="Version activity"
      subtitle={`Recent timestamps and asset touches from ${desktopRuntime ? 'desktop app data' : 'browser storage'}`}
      preview={draftId || 'Select a draft to inspect activity'}
      meta={<span className="app-pill app-pill-muted">Local</span>}
      defaultExpanded={Boolean(assetName || snapshotId)}
      className="border-dashed text-sm text-muted-foreground"
      bodyClassName="space-y-4"
    >
      {(draftQuery.isLoading || activityQuery.isLoading) && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading draft activity...
        </div>
      )}

      {!draftId ? <div className="rounded-md border border-border p-3">Select a draft to inspect activity.</div> : null}

      {draft && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-xs">
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Created</div>
              <div className="mt-1">{formatTimestamp(draft.metadata.created)}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Last modified</div>
              <div className="mt-1">{formatTimestamp(draft.metadata.modified)}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Tracked assets</div>
              <div className="mt-1">{assetCount}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Parent drafts</div>
              <div className="mt-1">{parentCount}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Restore points</div>
              <div className="mt-1">{snapshots.length}</div>
            </div>
            <div className="rounded-md border border-border p-3">
              <div className="font-medium text-foreground">Merge events</div>
              <div className="mt-1">{mergeHistoryEntries.length}</div>
            </div>
          </div>

          {mergeHistoryEntries.length > 0 && (
            <div className="rounded-md border border-border p-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                Merge history
              </div>
              <div className="mt-3 space-y-2">
                {mergeHistoryEntries.map((entry) => {
                  const sourceDraft = relatedDraftLookup.get(entry.source_draft_id);
                  const baseDraft = relatedDraftLookup.get(entry.base_draft_id);
                  const sourceSnapshotLabel = entry.source_snapshot_id
                    ? sourceDraft?.revision_snapshots?.find((snapshot) => snapshot.id === entry.source_snapshot_id)
                        ?.label || 'Selected restore point'
                    : null;
                  const baseSnapshotLabel = entry.base_snapshot_id
                    ? baseDraft?.revision_snapshots?.find((snapshot) => snapshot.id === entry.base_snapshot_id)
                        ?.label || 'Selected restore point'
                    : null;
                  const undoSnapshot = entry.undo_snapshot_id
                    ? (draft.metadata.revision_snapshots?.find((snapshot) => snapshot.id === entry.undo_snapshot_id) ??
                      null)
                    : null;

                  return (
                    <div
                      key={entry.id}
                      className="rounded-md border border-border/60 bg-background/60 p-3 text-xs text-muted-foreground"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-foreground">
                            {entry.strategy === 'staged-merge' ? 'Staged merge' : 'Single-asset merge'}
                          </div>
                          <div className="mt-1">{formatTimestamp(entry.created_at)}</div>
                          <div className="mt-1">
                            Source: {sourceDraft?.character_name || sourceDraft?.seed || entry.source_draft_id} (
                            {entry.source_side}){sourceSnapshotLabel ? ` · ${sourceSnapshotLabel}` : ''}
                          </div>
                          <div className="mt-1">
                            Base: {baseDraft?.character_name || baseDraft?.seed || entry.base_draft_id} (
                            {entry.base_side}){baseSnapshotLabel ? ` · ${baseSnapshotLabel}` : ''}
                          </div>
                          <div className="mt-1">Assets: {entry.asset_names.join(', ')}</div>
                          {entry.asset_resolutions?.length ? (
                            <div className="mt-2 space-y-1 rounded-md border border-border/50 bg-background/50 px-3 py-2">
                              <div className="font-medium text-foreground">Resolution details</div>
                              {entry.asset_resolutions.map((resolution) => (
                                <div
                                  key={`${entry.id}-${resolution.asset_name}`}
                                  className="flex flex-wrap items-start justify-between gap-2"
                                >
                                  <div>
                                    {formatAssetLabel(resolution.asset_name)}:{' '}
                                    {formatMergeResolutionReason(resolution.reason)} ·{' '}
                                    {resolution.target_previously_had_asset
                                      ? 'updated existing slot'
                                      : 'added new slot'}{' '}
                                    ·{' '}
                                    {resolution.review_context_applied
                                      ? 'review context copied'
                                      : 'review context not copied'}
                                  </div>
                                  {undoSnapshot && resolution.target_previously_had_asset && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        revertMergedAssetMutation.mutate({
                                          eventId: entry.id,
                                          assetName: resolution.asset_name,
                                        })
                                      }
                                      disabled={revertMergedAssetMutation.isPending}
                                      className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-2.5 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                      {revertMergedAssetMutation.isPending ? 'Reverting…' : 'Revert asset'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}
                          {undoSnapshot && (
                            <div className="mt-2 rounded-md border border-border/50 bg-background/50 px-3 py-2">
                              Undo available via safeguard snapshot: {undoSnapshot.label || 'Restore point'}.
                            </div>
                          )}
                        </div>
                        {undoSnapshot && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Restore ${undoSnapshot.label || 'the pre-merge safeguard snapshot'}? The current draft state will first be saved as a new safeguard snapshot.`,
                                )
                              ) {
                                restoreSnapshotMutation.mutate(undoSnapshot.id);
                              }
                            }}
                            disabled={restoreSnapshotMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {restoreSnapshotMutation.isPending ? 'Undoing…' : 'Undo merge'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <History className="h-3.5 w-3.5" />
                  Restore points
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Save the current draft state before larger edits or restore one of the recent snapshots.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-xs text-muted-foreground">
                  <span className="sr-only">Compare snapshots against</span>
                  <select
                    value={compareSnapshotId}
                    onChange={(event) => setCompareSnapshotId(event.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-2 text-xs text-foreground"
                  >
                    <option value="">Compare against current draft</option>
                    {snapshots.map((snapshot) => (
                      <option key={snapshot.id} value={snapshot.id}>
                        {snapshot.label || 'Restore point'} · {formatTimestamp(snapshot.created_at)}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => createSnapshotMutation.mutate()}
                  disabled={createSnapshotMutation.isPending || !draftId}
                  className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {createSnapshotMutation.isPending ? 'Saving…' : 'Create restore point'}
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-md border border-border/60 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
              Comparing restore points against <span className="font-medium text-foreground">{compareBaseLabel}</span>.
            </div>

            {errorMessage && (
              <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errorMessage}
              </div>
            )}

            {notice && (
              <div className="mt-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300">
                {notice}
              </div>
            )}

            {snapshots.length === 0 ? (
              <div className="mt-3 rounded-md border border-border bg-background/60 p-3 text-xs">
                No restore points saved yet.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className={`rounded-md border bg-background/60 p-3 text-xs text-muted-foreground ${snapshot.id === snapshotId ? 'border-primary/40 bg-primary/5' : 'border-border'}`}
                  >
                    {(() => {
                      const diffModel = snapshotDiffModels.get(snapshot.id);
                      const diff = diffModel?.summary;
                      const assetPreviews = diffModel?.assetPreviews ?? [];
                      return (
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-foreground">{snapshot.label || 'Restore point'}</div>
                            <div className="mt-1">{formatTimestamp(snapshot.created_at)}</div>
                            {snapshot.reason && <div className="mt-1">Reason: {snapshot.reason}</div>}
                            <div className="mt-1">
                              {Object.keys(snapshot.state.assets).length} asset
                              {Object.keys(snapshot.state.assets).length === 1 ? '' : 's'} ·{' '}
                              {snapshot.state.review_annotations?.asset_scores
                                ? Object.keys(snapshot.state.review_annotations.asset_scores).length
                                : 0}{' '}
                              scored
                            </div>
                            {diff && (
                              <div className="mt-2 space-y-1">
                                <div>
                                  {diff.assetDeltaCount} asset change{diff.assetDeltaCount === 1 ? '' : 's'} ·{' '}
                                  {diff.metadataChanges.length} metadata change
                                  {diff.metadataChanges.length === 1 ? '' : 's'}
                                </div>
                                {diff.metadataChanges.length > 0 && (
                                  <div>Metadata: {diff.metadataChanges.join(', ')}</div>
                                )}
                                {diff.changedAssets.length > 0 && (
                                  <div>
                                    Changed assets: {diff.changedAssets.slice(0, 4).join(', ')}
                                    {diff.changedAssets.length > 4 ? '…' : ''}
                                  </div>
                                )}
                                {diff.addedAssets.length > 0 && (
                                  <div>
                                    Added in snapshot: {diff.addedAssets.slice(0, 3).join(', ')}
                                    {diff.addedAssets.length > 3 ? '…' : ''}
                                  </div>
                                )}
                                {diff.removedAssets.length > 0 && (
                                  <div>
                                    Missing from snapshot: {diff.removedAssets.slice(0, 3).join(', ')}
                                    {diff.removedAssets.length > 3 ? '…' : ''}
                                  </div>
                                )}
                                {assetName && (
                                  <div>
                                    {diff.assetFocusedDifference
                                      ? `This snapshot differs for ${assetName}.`
                                      : `${assetName} matches the current draft state.`}
                                  </div>
                                )}
                              </div>
                            )}

                            {assetPreviews.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {assetPreviews.map((preview) => (
                                  <div
                                    key={`${snapshot.id}-${preview.assetName}`}
                                    className="rounded-md border border-border/60 bg-background/70 p-3"
                                  >
                                    <div className="font-medium text-foreground">{preview.assetName}</div>
                                    <div className="mt-1 text-[11px] text-muted-foreground">
                                      {preview.changedLineCount} changed line{preview.changedLineCount === 1 ? '' : 's'}
                                    </div>
                                    <div className="mt-2 space-y-2">
                                      {preview.previewLines.map((line) => (
                                        <div
                                          key={`${preview.assetName}-${line.lineNumber}-${line.status}`}
                                          className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
                                        >
                                          <div className="rounded-md border border-border/60 bg-background/80 p-2">
                                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                              {compareSnapshot ? 'Baseline snapshot' : 'Current'} · line{' '}
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
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Restore ${snapshot.label || 'this restore point'}? The current draft state will first be saved as a new safeguard snapshot.`,
                                )
                              ) {
                                restoreSnapshotMutation.mutate(snapshot.id);
                              }
                            }}
                            disabled={restoreSnapshotMutation.isPending}
                            className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {restoreSnapshotMutation.isPending ? 'Restoring…' : 'Restore'}
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5" />
              Recent asset activity
            </div>

            {assetActivity.length === 0 ? (
              <div className="mt-3 rounded-md border border-border bg-background/60 p-3 text-xs">
                No per-asset activity has been recorded yet for this draft{assetName ? ' and asset filter' : ''}.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {assetActivity.map((row) => {
                  const content = draft.assets[row.assetName] || '';
                  return (
                    <div
                      key={`${row.assetName}-${row.createdAt}`}
                      className="flex items-start justify-between gap-3 rounded-md border border-border bg-background/60 px-3 py-2.5"
                    >
                      <div>
                        <div className="font-medium text-foreground">{row.assetName}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {content.length} chars · {content.split('\n').length} lines
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-muted-foreground">{formatTimestamp(row.createdAt)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            Manual restore points are now live. True historical diffs and branch-aware timeline visuals are still
            planned.
          </div>
        </div>
      )}
    </CollapsibleSection>
  );
}

export default VersionHistoryPanel;
