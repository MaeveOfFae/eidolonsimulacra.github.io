/**
 * The normalisers behind the public coercion: field-by-field readers for metadata, revision snapshots, merge history, card metadata and review annotations, each of which accepts unknown input and returns undefined rather than guessing.
 *
 * Split out of `draft-files.ts`, which is now a barrel over these modules.
 */
import { normalizeAssetNameList, normalizeAssetRecord } from '../templates';
import type {
  CharacterCardMetadata,
  DraftAssetReviewScore,
  DraftMergeHistoryEvent,
  DraftMergeProvenance,
  DraftMergeResolutionDetail,
  DraftMetadata,
  DraftReviewAnnotations,
  DraftRevisionSnapshot,
  DraftRevisionSnapshotState,
} from '../types';
import { MAX_CONNECTED_DRAFT_REFERENCES } from '../types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function coerceContentMode(value: unknown): DraftMetadata['mode'] | undefined {
  if (value !== 'SFW' && value !== 'NSFW' && value !== 'Platform-Safe' && value !== 'Auto') {
    return undefined;
  }

  return value;
}

export function coerceStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeConnectedDraftIds(reviewId: string, value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }

    const trimmed = entry.trim();
    if (!trimmed || trimmed === reviewId || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);

    if (normalized.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
      break;
    }
  }

  return normalized.length > 0 ? normalized : undefined;
}

export function normalizeMetadataString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function normalizeMetadataStringArray(value: unknown): string[] | undefined {
  return coerceStringArray(value);
}

export function mergeImportedNotes(importedNotes: string | undefined, sourceNotes: string): string {
  if (!importedNotes) {
    return sourceNotes;
  }

  if (importedNotes.includes(sourceNotes)) {
    return importedNotes;
  }

  return `${importedNotes}\n\n${sourceNotes}`;
}

export function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function normalizeMetadataNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function normalizeMetadataNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return normalizeMetadataString(value);
}

export function normalizeDraftAssetReviewScore(value: unknown): DraftAssetReviewScore | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  const rounded = Math.round(value);
  if (rounded < 1 || rounded > 5) {
    return undefined;
  }

  return rounded as DraftAssetReviewScore;
}

export function normalizeDraftAssetReviewScores(value: unknown): Record<string, DraftAssetReviewScore> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(value)
      .map(([assetName, score]) => [assetName.trim(), normalizeDraftAssetReviewScore(score)] as const)
      .filter((entry): entry is [string, DraftAssetReviewScore] => entry[0].length > 0 && entry[1] !== undefined),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function normalizeDraftAssetReviewNotes(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const normalized = Object.fromEntries(
    Object.entries(value)
      .map(([assetName, note]) => [assetName.trim(), normalizeMetadataString(note)] as const)
      .filter((entry): entry is [string, string] => entry[0].length > 0 && entry[1] !== undefined),
  );

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function createDraftSnapshotId(): string {
  return `snapshot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeDraftRevisionSnapshotState(
  value: unknown,
  fallbackSeed: string,
): DraftRevisionSnapshotState | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const seed = normalizeMetadataString(value.seed) ?? fallbackSeed;
  const templateName = normalizeMetadataString(value.template_name) ?? normalizeMetadataString(value.templateName);
  const assetsSource = isRecord(value.assets) ? value.assets : {};
  const assets = normalizeAssetRecord(
    Object.fromEntries(
      Object.entries(assetsSource).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
    ),
    templateName,
  );
  const state: DraftRevisionSnapshotState = {
    seed,
    favorite: Boolean(value.favorite),
    assets,
  };

  state.mode = coerceContentMode(value.mode);
  if (typeof value.model === 'string') state.model = value.model;
  const tags = coerceStringArray(value.tags);
  if (tags) state.tags = tags;
  if (typeof value.genre === 'string') state.genre = value.genre;
  if (typeof value.notes === 'string') state.notes = value.notes;
  if (typeof value.character_name === 'string') state.character_name = value.character_name;
  else if (typeof value.characterName === 'string') state.character_name = value.characterName;
  if (templateName) state.template_name = templateName;
  const parentDrafts = coerceStringArray(value.parent_drafts) ?? coerceStringArray(value.parentDrafts);
  if (parentDrafts) state.parent_drafts = parentDrafts;
  const connectedDrafts = normalizeConnectedDraftIds('__snapshot__', value.connected_drafts ?? value.connectedDrafts);
  if (connectedDrafts) state.connected_drafts = connectedDrafts;
  if (typeof value.offspring_type === 'string') state.offspring_type = value.offspring_type;
  else if (typeof value.offspringType === 'string') state.offspring_type = value.offspringType;
  const comparisonGroupSource = value.comparison_group ?? value.comparisonGroup;
  if (typeof comparisonGroupSource === 'string' && comparisonGroupSource.trim()) {
    state.comparison_group = comparisonGroupSource.trim();
  }
  if (typeof value.custom_instructions === 'string') state.custom_instructions = value.custom_instructions;
  else if (typeof value.customInstructions === 'string') state.custom_instructions = value.customInstructions;
  const componentSendOrder =
    coerceStringArray(value.component_send_order) ?? coerceStringArray(value.componentSendOrder);
  if (componentSendOrder) {
    const normalizedComponentSendOrder = normalizeAssetNameList(componentSendOrder, templateName);
    if (normalizedComponentSendOrder.length > 0) {
      state.component_send_order = normalizedComponentSendOrder;
    }
  }
  const cardMetadata = normalizeCardMetadata(value.card_metadata ?? value.cardMetadata);
  if (cardMetadata) {
    state.card_metadata = cardMetadata;
  }
  const reviewAnnotations = normalizeDraftReviewAnnotations(value.review_annotations ?? value.reviewAnnotations);
  if (reviewAnnotations) {
    state.review_annotations = reviewAnnotations;
  }
  const mergeProvenance = normalizeDraftMergeProvenance(value.merge_provenance ?? value.mergeProvenance);
  if (mergeProvenance) {
    state.merge_provenance = mergeProvenance;
  }
  const mergeHistory = normalizeDraftMergeHistory(value.merge_history ?? value.mergeHistory);
  if (mergeHistory) {
    state.merge_history = mergeHistory;
  }

  return state;
}

export function normalizeDraftRevisionSnapshots(
  value: unknown,
  fallbackSeed: string,
): DraftRevisionSnapshot[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const snapshots = value
    .filter((entry): entry is Record<string, unknown> => isRecord(entry))
    .map((entry) => {
      const state = normalizeDraftRevisionSnapshotState(entry.state, fallbackSeed);
      if (!state) {
        return null;
      }

      const id = normalizeMetadataString(entry.id) ?? createDraftSnapshotId();
      const createdAt =
        normalizeMetadataString(entry.created_at) ??
        normalizeMetadataString(entry.createdAt) ??
        new Date().toISOString();
      const label = normalizeMetadataString(entry.label);
      const reason = normalizeMetadataString(entry.reason);

      return {
        id,
        created_at: createdAt,
        ...(label ? { label } : {}),
        ...(reason ? { reason } : {}),
        state,
      } satisfies DraftRevisionSnapshot;
    })
    .filter((entry): entry is DraftRevisionSnapshot => entry !== null);

  return snapshots.length > 0 ? snapshots : undefined;
}

export function normalizeDraftReviewAnnotations(value: unknown): DraftReviewAnnotations | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const annotations: DraftReviewAnnotations = {};
  const notes = normalizeMetadataString(value.notes);
  if (notes) {
    annotations.notes = notes;
  }

  const assetScores = normalizeDraftAssetReviewScores(value.asset_scores ?? value.assetScores);
  if (assetScores) {
    annotations.asset_scores = assetScores;
  }

  const assetNotes = normalizeDraftAssetReviewNotes(value.asset_notes ?? value.assetNotes);
  if (assetNotes) {
    annotations.asset_notes = assetNotes;
  }

  const updatedAt = normalizeMetadataString(value.updated_at) ?? normalizeMetadataString(value.updatedAt);
  if (updatedAt) {
    annotations.updated_at = updatedAt;
  }

  return Object.keys(annotations).length > 0 ? annotations : undefined;
}

export function normalizeDraftMergeProvenance(value: unknown): DraftMergeProvenance | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const strategy = value.strategy === 'single-asset' || value.strategy === 'staged-merge' ? value.strategy : undefined;
  const sourceDraftId = normalizeMetadataString(value.source_draft_id) ?? normalizeMetadataString(value.sourceDraftId);
  const sourceSide =
    value.source_side === 'left' || value.source_side === 'right'
      ? value.source_side
      : value.sourceSide === 'left' || value.sourceSide === 'right'
        ? value.sourceSide
        : undefined;
  const sourceSnapshotId =
    normalizeMetadataString(value.source_snapshot_id) ?? normalizeMetadataString(value.sourceSnapshotId);
  const baseDraftId = normalizeMetadataString(value.base_draft_id) ?? normalizeMetadataString(value.baseDraftId);
  const baseSide =
    value.base_side === 'left' || value.base_side === 'right'
      ? value.base_side
      : value.baseSide === 'left' || value.baseSide === 'right'
        ? value.baseSide
        : undefined;
  const baseSnapshotId =
    normalizeMetadataString(value.base_snapshot_id) ?? normalizeMetadataString(value.baseSnapshotId);
  const assetNames = normalizeMetadataStringArray(value.asset_names ?? value.assetNames);
  const createdAt = normalizeMetadataString(value.created_at) ?? normalizeMetadataString(value.createdAt);

  if (
    !strategy ||
    !sourceDraftId ||
    !sourceSide ||
    !baseDraftId ||
    !baseSide ||
    !assetNames ||
    assetNames.length === 0 ||
    !createdAt
  ) {
    return undefined;
  }

  return {
    strategy,
    source_draft_id: sourceDraftId,
    source_side: sourceSide,
    ...(sourceSnapshotId ? { source_snapshot_id: sourceSnapshotId } : {}),
    base_draft_id: baseDraftId,
    base_side: baseSide,
    ...(baseSnapshotId ? { base_snapshot_id: baseSnapshotId } : {}),
    asset_names: assetNames,
    created_at: createdAt,
  };
}

export function normalizeDraftMergeHistoryEntry(value: unknown): DraftMergeHistoryEvent | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const provenance = normalizeDraftMergeProvenance(value);
  const id = normalizeMetadataString(value.id) ?? createDraftSnapshotId();
  const undoSnapshotId =
    normalizeMetadataString(value.undo_snapshot_id) ?? normalizeMetadataString(value.undoSnapshotId);

  if (!provenance) {
    return undefined;
  }

  return {
    id,
    ...provenance,
    ...(undoSnapshotId ? { undo_snapshot_id: undoSnapshotId } : {}),
    ...(normalizeDraftMergeResolutionDetails(value.asset_resolutions ?? value.assetResolutions)
      ? { asset_resolutions: normalizeDraftMergeResolutionDetails(value.asset_resolutions ?? value.assetResolutions) }
      : {}),
  };
}

export function normalizeDraftMergeResolutionDetail(value: unknown): DraftMergeResolutionDetail | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const assetName = normalizeMetadataString(value.asset_name) ?? normalizeMetadataString(value.assetName);
  const reason =
    value.reason === 'content-drift' ||
    value.reason === 'review-drift' ||
    value.reason === 'left-only' ||
    value.reason === 'right-only'
      ? value.reason
      : undefined;
  const targetPreviouslyHadAsset =
    typeof value.target_previously_had_asset === 'boolean'
      ? value.target_previously_had_asset
      : typeof value.targetPreviouslyHadAsset === 'boolean'
        ? value.targetPreviouslyHadAsset
        : undefined;
  const reviewContextApplied =
    typeof value.review_context_applied === 'boolean'
      ? value.review_context_applied
      : typeof value.reviewContextApplied === 'boolean'
        ? value.reviewContextApplied
        : undefined;

  if (!assetName || !reason || targetPreviouslyHadAsset === undefined || reviewContextApplied === undefined) {
    return undefined;
  }

  return {
    asset_name: assetName,
    reason,
    target_previously_had_asset: targetPreviouslyHadAsset,
    review_context_applied: reviewContextApplied,
  };
}

export function normalizeDraftMergeResolutionDetails(value: unknown): DraftMergeResolutionDetail[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const entries = value
    .map((entry) => normalizeDraftMergeResolutionDetail(entry))
    .filter((entry): entry is DraftMergeResolutionDetail => entry !== undefined);

  return entries.length > 0 ? entries : undefined;
}

export function normalizeDraftMergeHistory(value: unknown): DraftMergeHistoryEvent[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const entries = value
    .map((entry) => normalizeDraftMergeHistoryEntry(entry))
    .filter((entry): entry is DraftMergeHistoryEvent => entry !== undefined);

  return entries.length > 0 ? entries : undefined;
}

export function normalizeCardMetadata(value: unknown): CharacterCardMetadata | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const metadata: CharacterCardMetadata = {};
  const avatar = normalizeMetadataString(value.avatar);
  if (avatar) {
    metadata.avatar = avatar;
  }

  const creator = normalizeMetadataString(value.creator);
  if (creator) {
    metadata.creator = creator;
  }

  const characterVersion = normalizeMetadataString(value.character_version);
  if (characterVersion) {
    metadata.character_version = characterVersion;
  }

  if (isRecord(value.depth_prompt)) {
    const depth = normalizeMetadataNumber(value.depth_prompt.depth);
    const prompt = normalizeMetadataString(value.depth_prompt.prompt) ?? '';
    if (depth !== undefined) {
      metadata.depth_prompt = { depth, prompt };
    }
  }

  if (isRecord(value.chub)) {
    const chub: NonNullable<CharacterCardMetadata['chub']> = {};
    const id = normalizeMetadataNumber(value.chub.id);
    if (id !== undefined) {
      chub.id = id;
    }

    const preset = normalizeMetadataNullableString(value.chub.preset);
    if (preset !== undefined) {
      chub.preset = preset;
    }

    const fullPath = normalizeMetadataString(value.chub.full_path);
    if (fullPath) {
      chub.full_path = fullPath;
    }

    const customCss = normalizeMetadataNullableString(value.chub.custom_css);
    if (customCss !== undefined) {
      chub.custom_css = customCss;
    }

    const backgroundImage = normalizeMetadataString(value.chub.background_image);
    if (backgroundImage) {
      chub.background_image = backgroundImage;
    }

    if (Array.isArray(value.chub.extensions)) {
      chub.extensions = cloneJsonValue(value.chub.extensions);
    }

    if (value.chub.expressions !== undefined) {
      chub.expressions = cloneJsonValue(value.chub.expressions);
    }

    if (isRecord(value.chub.alt_expressions)) {
      chub.alt_expressions = cloneJsonValue(value.chub.alt_expressions);
    }

    if (Array.isArray(value.chub.related_lorebooks)) {
      const relatedLorebooks = value.chub.related_lorebooks
        .filter((entry): entry is Record<string, unknown> => isRecord(entry))
        .map((entry) => {
          const record: NonNullable<NonNullable<CharacterCardMetadata['chub']>['related_lorebooks']>[number] = {};
          const relatedId = normalizeMetadataNumber(entry.id);
          if (relatedId !== undefined) {
            record.id = relatedId;
          }
          const book = normalizeMetadataNullableString(entry.book);
          if (book !== undefined) {
            record.book = book;
          }
          const path = normalizeMetadataString(entry.path);
          if (path) {
            record.path = path;
          }
          const version = normalizeMetadataString(entry.version);
          if (version) {
            record.version = version;
          }
          const commitRef = normalizeMetadataString(entry.commit_ref);
          if (commitRef) {
            record.commit_ref = commitRef;
          }
          return record;
        })
        .filter((entry) => Object.keys(entry).length > 0);

      if (relatedLorebooks.length > 0) {
        chub.related_lorebooks = relatedLorebooks;
      }
    }

    if (Object.keys(chub).length > 0) {
      metadata.chub = chub;
    }
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

export function mergeCardMetadata(
  base: CharacterCardMetadata | undefined,
  override: CharacterCardMetadata | undefined,
): CharacterCardMetadata | undefined {
  if (!base && !override) {
    return undefined;
  }

  const merged: CharacterCardMetadata = {};
  const source = base ? cloneJsonValue(base) : undefined;
  const next = override ? cloneJsonValue(override) : undefined;

  const avatar = next?.avatar ?? source?.avatar;
  if (avatar) {
    merged.avatar = avatar;
  }

  const creator = next?.creator ?? source?.creator;
  if (creator) {
    merged.creator = creator;
  }

  const characterVersion = next?.character_version ?? source?.character_version;
  if (characterVersion) {
    merged.character_version = characterVersion;
  }

  const depthPrompt = next?.depth_prompt ?? source?.depth_prompt;
  if (depthPrompt) {
    merged.depth_prompt = cloneJsonValue(depthPrompt);
  }

  const sourceChub = source?.chub;
  const nextChub = next?.chub;
  if (sourceChub || nextChub) {
    merged.chub = {
      ...(sourceChub ? cloneJsonValue(sourceChub) : {}),
      ...(nextChub ? cloneJsonValue(nextChub) : {}),
    };
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function slugifyCardPathSegment(value: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'character'
  );
}
