import type { Draft, DraftMetadata, DraftRevisionSnapshot, DraftRevisionSnapshotState } from './types';

export const MAX_DRAFT_REVISION_SNAPSHOTS = 12;

function cloneSnapshotValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createDraftRevisionSnapshotId(): string {
  const cryptoLike = globalThis as { crypto?: { randomUUID?: () => string } };
  return cryptoLike.crypto?.randomUUID?.() ?? `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildDraftRevisionSnapshotState(draft: Draft): DraftRevisionSnapshotState {
  return {
    seed: draft.metadata.seed,
    mode: draft.metadata.mode,
    model: draft.metadata.model,
    tags: draft.metadata.tags ? [...draft.metadata.tags] : undefined,
    genre: draft.metadata.genre,
    notes: draft.metadata.notes,
    favorite: draft.metadata.favorite,
    character_name: draft.metadata.character_name,
    template_name: draft.metadata.template_name,
    parent_drafts: draft.metadata.parent_drafts ? [...draft.metadata.parent_drafts] : undefined,
    connected_drafts: draft.metadata.connected_drafts ? [...draft.metadata.connected_drafts] : undefined,
    offspring_type: draft.metadata.offspring_type,
    comparison_group: draft.metadata.comparison_group,
    custom_instructions: draft.metadata.custom_instructions,
    component_send_order: draft.metadata.component_send_order ? [...draft.metadata.component_send_order] : undefined,
    card_metadata: draft.metadata.card_metadata ? cloneSnapshotValue(draft.metadata.card_metadata) : undefined,
    review_annotations: draft.metadata.review_annotations
      ? cloneSnapshotValue(draft.metadata.review_annotations)
      : undefined,
    merge_provenance: draft.metadata.merge_provenance ? cloneSnapshotValue(draft.metadata.merge_provenance) : undefined,
    merge_history: draft.metadata.merge_history ? cloneSnapshotValue(draft.metadata.merge_history) : undefined,
    assets: cloneSnapshotValue(draft.assets),
  };
}

export function buildDraftRevisionSnapshot(
  draft: Draft,
  options: { label?: string; reason?: string } = {},
): DraftRevisionSnapshot {
  return {
    id: createDraftRevisionSnapshotId(),
    created_at: new Date().toISOString(),
    ...(options.label ? { label: options.label } : {}),
    ...(options.reason ? { reason: options.reason } : {}),
    state: buildDraftRevisionSnapshotState(draft),
  };
}

export function appendDraftRevisionSnapshot(
  existingSnapshots: DraftRevisionSnapshot[] | undefined,
  snapshot: DraftRevisionSnapshot,
  limit = MAX_DRAFT_REVISION_SNAPSHOTS,
): DraftRevisionSnapshot[] {
  return [snapshot, ...(existingSnapshots ?? []).filter((entry) => entry.id !== snapshot.id)].slice(0, limit);
}

export interface DraftSnapshotDiffSummary {
  assetDeltaCount: number;
  addedAssets: string[];
  removedAssets: string[];
  changedAssets: string[];
  metadataChanges: string[];
  assetFocusedDifference: boolean;
}

export interface DraftSnapshotAssetDiffLine {
  lineNumber: number;
  currentLine: string;
  snapshotLine: string;
  status: 'changed' | 'current-only' | 'snapshot-only';
}

export interface DraftSnapshotAssetDiffPreview {
  assetName: string;
  changedLineCount: number;
  previewLines: DraftSnapshotAssetDiffLine[];
  omittedDifferenceCount: number;
}

export interface DraftSnapshotDiffModel {
  summary: DraftSnapshotDiffSummary;
  assetPreviews: DraftSnapshotAssetDiffPreview[];
}

export interface LatestDraftSnapshotSummary {
  id: string;
  label: string;
  reason?: string;
  createdAt: string;
}

function areStringArraysEqual(left?: string[], right?: string[]): boolean {
  const normalizedLeft = left ?? [];
  const normalizedRight = right ?? [];
  if (normalizedLeft.length !== normalizedRight.length) {
    return false;
  }

  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
}

function areValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}

export function buildDraftSnapshotDiffSummaryFromStates(
  currentState: DraftRevisionSnapshotState,
  snapshotState: DraftRevisionSnapshotState,
  assetName?: string,
): DraftSnapshotDiffSummary {
  const currentAssetNames = new Set(Object.keys(currentState.assets));
  const snapshotAssetNames = new Set(Object.keys(snapshotState.assets));
  const allAssetNames = Array.from(new Set([...currentAssetNames, ...snapshotAssetNames])).sort();
  const addedAssets = allAssetNames.filter((name) => !currentAssetNames.has(name) && snapshotAssetNames.has(name));
  const removedAssets = allAssetNames.filter((name) => currentAssetNames.has(name) && !snapshotAssetNames.has(name));
  const changedAssets = allAssetNames.filter(
    (name) =>
      currentAssetNames.has(name) &&
      snapshotAssetNames.has(name) &&
      currentState.assets[name] !== snapshotState.assets[name],
  );
  const metadataChanges: string[] = [];

  if ((currentState.character_name ?? '') !== (snapshotState.character_name ?? '')) {
    metadataChanges.push('name');
  }
  if ((currentState.genre ?? '') !== (snapshotState.genre ?? '')) {
    metadataChanges.push('genre');
  }
  if ((currentState.notes ?? '') !== (snapshotState.notes ?? '')) {
    metadataChanges.push('notes');
  }
  if (!areStringArraysEqual(currentState.tags, snapshotState.tags)) {
    metadataChanges.push('tags');
  }
  if (!areStringArraysEqual(currentState.connected_drafts, snapshotState.connected_drafts)) {
    metadataChanges.push('references');
  }
  if (!areStringArraysEqual(currentState.component_send_order, snapshotState.component_send_order)) {
    metadataChanges.push('send order');
  }
  if (!areValuesEqual(currentState.review_annotations, snapshotState.review_annotations)) {
    metadataChanges.push('review');
  }
  if (!areValuesEqual(currentState.merge_provenance, snapshotState.merge_provenance)) {
    metadataChanges.push('merge provenance');
  }
  if (!areValuesEqual(currentState.merge_history, snapshotState.merge_history)) {
    metadataChanges.push('merge history');
  }

  return {
    assetDeltaCount: addedAssets.length + removedAssets.length + changedAssets.length,
    addedAssets,
    removedAssets,
    changedAssets,
    metadataChanges,
    assetFocusedDifference: assetName
      ? currentState.assets[assetName] !== snapshotState.assets[assetName] ||
        !areValuesEqual(
          {
            score: currentState.review_annotations?.asset_scores?.[assetName],
            note: currentState.review_annotations?.asset_notes?.[assetName] ?? null,
          },
          {
            score: snapshotState.review_annotations?.asset_scores?.[assetName],
            note: snapshotState.review_annotations?.asset_notes?.[assetName] ?? null,
          },
        )
      : false,
  };
}

export function buildDraftSnapshotDiffCandidateAssets(summary: DraftSnapshotDiffSummary): string[] {
  return [...summary.changedAssets, ...summary.addedAssets, ...summary.removedAssets];
}

function countChangedLines(currentContent: string, snapshotContent: string): number {
  const currentLines = currentContent.split('\n');
  const snapshotLines = snapshotContent.split('\n');
  const maxLength = Math.max(currentLines.length, snapshotLines.length);
  let changed = 0;

  for (let index = 0; index < maxLength; index += 1) {
    if ((currentLines[index] || '') !== (snapshotLines[index] || '')) {
      changed += 1;
    }
  }

  return changed;
}

export function buildDraftSnapshotAssetDiffPreview(
  assetName: string,
  currentContent: string,
  snapshotContent: string,
  maxPreviewLines = 6,
): DraftSnapshotAssetDiffPreview {
  const currentLines = currentContent.split('\n');
  const snapshotLines = snapshotContent.split('\n');
  const maxLength = Math.max(currentLines.length, snapshotLines.length);
  const previewLines: DraftSnapshotAssetDiffLine[] = [];

  for (let index = 0; index < maxLength; index += 1) {
    const currentLine = currentLines[index] ?? '';
    const snapshotLine = snapshotLines[index] ?? '';
    if (currentLine === snapshotLine) {
      continue;
    }

    if (previewLines.length < maxPreviewLines) {
      previewLines.push({
        lineNumber: index + 1,
        currentLine,
        snapshotLine,
        status:
          currentLine && !snapshotLine ? 'current-only' : !currentLine && snapshotLine ? 'snapshot-only' : 'changed',
      });
    }
  }

  const changedLineCount = countChangedLines(currentContent, snapshotContent);

  return {
    assetName,
    changedLineCount,
    previewLines,
    omittedDifferenceCount: Math.max(changedLineCount - previewLines.length, 0),
  };
}

export function buildDraftSnapshotAssetDiffPreviews(
  draft: Draft,
  snapshot: DraftRevisionSnapshot,
  options: { assetName?: string; maxAssets?: number; maxPreviewLines?: number } = {},
): DraftSnapshotAssetDiffPreview[] {
  return buildDraftSnapshotAssetDiffPreviewsFromStates(buildDraftRevisionSnapshotState(draft), snapshot.state, options);
}

export function buildDraftSnapshotAssetDiffPreviewsFromStates(
  currentState: DraftRevisionSnapshotState,
  snapshotState: DraftRevisionSnapshotState,
  options: { assetName?: string; maxAssets?: number; maxPreviewLines?: number } = {},
): DraftSnapshotAssetDiffPreview[] {
  const summary = buildDraftSnapshotDiffSummaryFromStates(currentState, snapshotState, options.assetName);
  const candidateAssets = options.assetName
    ? summary.assetFocusedDifference
      ? [options.assetName]
      : []
    : buildDraftSnapshotDiffCandidateAssets(summary).slice(0, options.maxAssets ?? 2);

  return candidateAssets.map((assetName) =>
    buildDraftSnapshotAssetDiffPreview(
      assetName,
      currentState.assets[assetName] ?? '',
      snapshotState.assets[assetName] ?? '',
      options.maxPreviewLines ?? 6,
    ),
  );
}

export function buildDraftSnapshotDiffModelFromStates(
  currentState: DraftRevisionSnapshotState,
  snapshotState: DraftRevisionSnapshotState,
  options: { assetName?: string; maxAssets?: number; maxPreviewLines?: number } = {},
): DraftSnapshotDiffModel {
  return {
    summary: buildDraftSnapshotDiffSummaryFromStates(currentState, snapshotState, options.assetName),
    assetPreviews: buildDraftSnapshotAssetDiffPreviewsFromStates(currentState, snapshotState, options),
  };
}

export function buildDraftSnapshotDiffModelsFromSnapshots(
  currentState: DraftRevisionSnapshotState,
  snapshots: Array<Pick<DraftRevisionSnapshot, 'id' | 'state'>>,
  options: { assetName?: string; maxAssets?: number; maxPreviewLines?: number } = {},
): Map<string, DraftSnapshotDiffModel> {
  return new Map(
    snapshots.map(
      (snapshot) =>
        [snapshot.id, buildDraftSnapshotDiffModelFromStates(currentState, snapshot.state, options)] as const,
    ),
  );
}

export function buildDraftSnapshotDiffSummary(
  draft: Draft,
  snapshot: DraftRevisionSnapshot,
  assetName?: string,
): DraftSnapshotDiffSummary {
  return buildDraftSnapshotDiffSummaryFromStates(buildDraftRevisionSnapshotState(draft), snapshot.state, assetName);
}

export function getLatestDraftSnapshotSummary(metadata: DraftMetadata): LatestDraftSnapshotSummary | null {
  const snapshot = metadata.revision_snapshots?.[0];
  if (!snapshot) {
    return null;
  }

  return {
    id: snapshot.id,
    label: snapshot.label || 'Restore point',
    reason: snapshot.reason,
    createdAt: snapshot.created_at,
  };
}
