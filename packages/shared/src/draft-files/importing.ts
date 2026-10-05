/**
 * The entry points for bringing a draft in: review-id allocation, `coerceDraftMetadata` and `coerceDraft`, and the text importer that turns a pasted card into drafts.
 *
 * Split out of `draft-files.ts`, which is now a barrel over these modules.
 */
import { detectAndParseCharacter } from '../import/character-parser';
import { OFFICIAL_TEMPLATE, normalizeAssetNameList, normalizeAssetRecord } from '../templates';
import type { CharacterImportOptions, Draft, DraftMetadata, ImportedCharacter } from '../types';
import {
  coerceContentMode,
  coerceStringArray,
  isRecord,
  mergeImportedNotes,
  normalizeCardMetadata,
  normalizeConnectedDraftIds,
  normalizeDraftMergeHistory,
  normalizeDraftMergeProvenance,
  normalizeDraftReviewAnnotations,
  normalizeDraftRevisionSnapshots,
  normalizeMetadataString,
  normalizeMetadataStringArray,
} from './normalizers';

export function createImportedReviewId(): string {
  return `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getUniqueImportedReviewId(usedIds: Set<string>): string {
  let candidate = createImportedReviewId();
  while (usedIds.has(candidate)) {
    candidate = createImportedReviewId();
  }
  return candidate;
}

export function coerceDraftMetadata(raw: unknown, fallbackSeed: string): DraftMetadata {
  const source = isRecord(raw) ? raw : {};
  const reviewIdValue =
    typeof source.review_id === 'string'
      ? source.review_id
      : typeof source.reviewId === 'string'
        ? source.reviewId
        : '';
  const review_id = reviewIdValue.trim().length > 0 ? reviewIdValue : createImportedReviewId();
  const seedValue = typeof source.seed === 'string' ? source.seed : '';
  const seed = seedValue.trim().length > 0 ? seedValue : fallbackSeed;

  const metadata: DraftMetadata = {
    review_id,
    seed,
    favorite: Boolean(source.favorite),
  };

  metadata.mode = coerceContentMode(source.mode);
  if (typeof source.model === 'string') metadata.model = source.model;
  if (typeof source.created === 'string') metadata.created = source.created;
  else if (typeof source.createdAt === 'string') metadata.created = source.createdAt;
  if (typeof source.modified === 'string') metadata.modified = source.modified;
  else if (typeof source.updatedAt === 'string') metadata.modified = source.updatedAt;
  if (Array.isArray(source.tags)) metadata.tags = source.tags.filter((tag): tag is string => typeof tag === 'string');
  if (typeof source.genre === 'string') metadata.genre = source.genre;
  if (typeof source.notes === 'string') metadata.notes = source.notes;
  if (typeof source.custom_instructions === 'string') metadata.custom_instructions = source.custom_instructions;
  else if (typeof source.customInstructions === 'string') metadata.custom_instructions = source.customInstructions;
  const componentSendOrder =
    coerceStringArray(source.component_send_order) ?? coerceStringArray(source.componentSendOrder);
  if (componentSendOrder) {
    metadata.component_send_order = componentSendOrder;
  }
  if (typeof source.character_name === 'string') metadata.character_name = source.character_name;
  else if (typeof source.characterName === 'string') metadata.character_name = source.characterName;
  if (typeof source.template_name === 'string') metadata.template_name = source.template_name;
  else if (typeof source.templateName === 'string') metadata.template_name = source.templateName;
  const parentDraftsValue = Array.isArray(source.parent_drafts)
    ? source.parent_drafts
    : Array.isArray(source.parentDraftIds)
      ? source.parentDraftIds
      : null;
  if (parentDraftsValue) {
    metadata.parent_drafts = parentDraftsValue.filter((id): id is string => typeof id === 'string');
  }
  const connectedDraftsValue = Array.isArray(source.connected_drafts)
    ? source.connected_drafts
    : Array.isArray(source.connectedDraftIds)
      ? source.connectedDraftIds
      : null;
  const normalizedConnectedDrafts = normalizeConnectedDraftIds(review_id, connectedDraftsValue);
  if (normalizedConnectedDrafts) {
    metadata.connected_drafts = normalizedConnectedDrafts;
  }
  if (typeof source.offspring_type === 'string') metadata.offspring_type = source.offspring_type;
  else if (typeof source.offspringType === 'string') metadata.offspring_type = source.offspringType;
  const comparisonGroupSource = source.comparison_group ?? source.comparisonGroup;
  if (typeof comparisonGroupSource === 'string' && comparisonGroupSource.trim()) {
    metadata.comparison_group = comparisonGroupSource.trim();
  }
  const cardMetadata = normalizeCardMetadata(source.card_metadata ?? source.cardMetadata);
  if (cardMetadata) {
    metadata.card_metadata = cardMetadata;
  }
  const reviewAnnotations = normalizeDraftReviewAnnotations(source.review_annotations ?? source.reviewAnnotations);
  if (reviewAnnotations) {
    metadata.review_annotations = reviewAnnotations;
  }
  const mergeProvenance = normalizeDraftMergeProvenance(source.merge_provenance ?? source.mergeProvenance);
  if (mergeProvenance) {
    metadata.merge_provenance = mergeProvenance;
  }
  const mergeHistory = normalizeDraftMergeHistory(source.merge_history ?? source.mergeHistory);
  if (mergeHistory) {
    metadata.merge_history = mergeHistory;
  }
  const revisionSnapshots = normalizeDraftRevisionSnapshots(
    source.revision_snapshots ?? source.revisionSnapshots,
    seed,
  );
  if (revisionSnapshots) {
    metadata.revision_snapshots = revisionSnapshots;
  }

  return metadata;
}

export function coerceDraft(value: unknown, fallbackSeed = 'Imported draft'): Draft | null {
  if (!isRecord(value) || !isRecord(value.assets)) {
    return null;
  }

  const assets: Record<string, string> = {};
  for (const [assetName, content] of Object.entries(value.assets)) {
    if (typeof content === 'string') {
      assets[assetName] = content;
    }
  }

  if (Object.keys(assets).length === 0) {
    return null;
  }

  const metadata = coerceDraftMetadata(isRecord(value.metadata) ? value.metadata : value, fallbackSeed);
  const normalizedAssets = normalizeAssetRecord(assets, metadata.template_name);
  const normalizedComponentSendOrder = metadata.component_send_order
    ? normalizeAssetNameList(metadata.component_send_order, metadata.template_name)
    : undefined;

  if (normalizedComponentSendOrder && normalizedComponentSendOrder.length > 0) {
    metadata.component_send_order = normalizedComponentSendOrder;
  } else {
    delete metadata.component_send_order;
  }

  const path =
    typeof value.path === 'string' && value.path.trim().length > 0
      ? value.path
      : typeof value.reviewId === 'string' && value.reviewId.trim().length > 0
        ? value.reviewId
        : metadata.review_id;

  return { metadata, assets: normalizedAssets, path };
}

export function parseJsonDraftPayload(data: unknown): Draft[] {
  if (Array.isArray(data)) {
    return data.map((entry) => coerceDraft(entry)).filter((entry): entry is Draft => entry !== null);
  }

  if (!isRecord(data)) {
    return [];
  }

  if (Array.isArray(data.drafts)) {
    return data.drafts.map((entry) => coerceDraft(entry)).filter((entry): entry is Draft => entry !== null);
  }

  if (isRecord(data.draft)) {
    const singleDraft = coerceDraft(data.draft);
    return singleDraft ? [singleDraft] : [];
  }

  const single = coerceDraft(data);
  return single ? [single] : [];
}

export function isExplicitEmptyDraftPayload(data: unknown): boolean {
  if (Array.isArray(data)) {
    return data.length === 0;
  }

  return isRecord(data) && Array.isArray(data.drafts) && data.drafts.length === 0;
}

export function isRecognizedDraftJsonPayload(data: unknown): boolean {
  if (Array.isArray(data)) {
    return true;
  }

  if (!isRecord(data)) {
    return false;
  }

  return (
    Array.isArray(data.drafts) ||
    isRecord(data.draft) ||
    isRecord(data.assets) ||
    isRecord(data.metadata) ||
    typeof data.reviewId === 'string' ||
    typeof data.review_id === 'string'
  );
}

export function normalizeAssetHeading(heading: string): string {
  return heading.trim().toLowerCase().replace(/\s+/g, '_');
}

export function parseMarkdownDraftPayload(markdown: string): Draft[] {
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const fallbackSeed = titleMatch?.[1]?.trim() || 'Imported draft';
  const headingRegex = /^##\s+(.+)$/gm;
  const headings: Array<{ title: string; start: number; bodyStart: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      title: match[1].trim(),
      start: match.index,
      bodyStart: headingRegex.lastIndex,
    });
  }

  if (headings.length === 0) {
    return [];
  }

  const assets: Record<string, string> = {};
  let metadataSource: unknown = undefined;

  for (let index = 0; index < headings.length; index += 1) {
    const current = headings[index];
    const next = headings[index + 1];
    const rawBody = markdown.slice(current.bodyStart, next ? next.start : markdown.length);
    const body = rawBody.replace(/^\n+/, '').trimEnd().replace(/^\\##/gm, '##');
    if (!body) {
      continue;
    }

    if (current.title.trim().toLowerCase() === 'metadata') {
      try {
        metadataSource = JSON.parse(body);
      } catch {
        // Ignore malformed metadata blocks and still import asset content.
      }
      continue;
    }

    const assetName = normalizeAssetHeading(current.title);
    assets[assetName] = body;
  }

  if (Object.keys(assets).length === 0) {
    return [];
  }

  const metadata = coerceDraftMetadata(metadataSource, fallbackSeed);
  return [
    {
      path: metadata.review_id,
      metadata,
      assets,
    },
  ];
}

export function buildImportedDraftFromCharacter(
  character: ImportedCharacter,
  sourceName?: string,
  template?: CharacterImportOptions['template'],
): Draft {
  const reviewId = createImportedReviewId();
  const characterName = character.name.trim() || sourceName?.replace(/\.[^.]+$/, '') || 'Imported draft';
  const seed = sourceName ? `Imported from ${sourceName}` : `Imported draft: ${characterName}`;
  const sourceLabel = character.sourcePreset || character.sourceFormat;
  const unmappedCount = Object.keys(character.unmappedFields || {}).length;
  const notes =
    unmappedCount > 0
      ? `Imported from ${sourceLabel}. Preserved ${unmappedCount} unmapped field${unmappedCount === 1 ? '' : 's'} in the upload preview.`
      : `Imported from ${sourceLabel}.`;
  const importedMetadata = character.metadata ?? {};

  const metadata: DraftMetadata = {
    review_id: reviewId,
    seed: normalizeMetadataString(importedMetadata.seed) ?? seed,
    favorite: importedMetadata.favorite === true,
    character_name: normalizeMetadataString(importedMetadata.character_name) ?? characterName,
    template_name: normalizeMetadataString(importedMetadata.template_name) ?? template?.name ?? OFFICIAL_TEMPLATE.name,
    notes: mergeImportedNotes(normalizeMetadataString(importedMetadata.notes), notes),
  };

  const mode = coerceContentMode(importedMetadata.mode);
  if (mode) {
    metadata.mode = mode;
  }

  const model = normalizeMetadataString(importedMetadata.model);
  if (model) {
    metadata.model = model;
  }

  const created = normalizeMetadataString(importedMetadata.created);
  if (created) {
    metadata.created = created;
  }

  const modified = normalizeMetadataString(importedMetadata.modified);
  if (modified) {
    metadata.modified = modified;
  }

  const tags = normalizeMetadataStringArray(importedMetadata.tags);
  if (tags) {
    metadata.tags = tags;
  }

  const genre = normalizeMetadataString(importedMetadata.genre);
  if (genre) {
    metadata.genre = genre;
  }

  const customInstructions = normalizeMetadataString(importedMetadata.custom_instructions);
  if (customInstructions) {
    metadata.custom_instructions = customInstructions;
  }

  const offspringType = normalizeMetadataString(importedMetadata.offspring_type);
  if (offspringType) {
    metadata.offspring_type = offspringType;
  }

  const componentSendOrder = normalizeMetadataStringArray(importedMetadata.component_send_order);
  if (componentSendOrder) {
    metadata.component_send_order = componentSendOrder;
  }

  const cardMetadata = normalizeCardMetadata(importedMetadata.card_metadata);
  if (cardMetadata) {
    metadata.card_metadata = cardMetadata;
  }

  return {
    path: reviewId,
    metadata,
    assets: character.assets,
  };
}

export function parseLooseDraftPayload(raw: string, sourceName?: string, options?: CharacterImportOptions): Draft[] {
  const character = detectAndParseCharacter(raw, sourceName, options);
  if (Object.keys(character.assets).length === 0) {
    return [];
  }

  return [buildImportedDraftFromCharacter(character, sourceName, options?.template)];
}

export interface DraftImportParseResult {
  drafts: Draft[];
  recognizedJsonPayload: boolean;
  explicitEmptyPayload: boolean;
}

export function parseDraftImportText(
  raw: string,
  sourceName?: string,
  options?: CharacterImportOptions,
): DraftImportParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Import file is empty');
  }

  let drafts: Draft[] = [];
  let recognizedJsonPayload = false;
  let explicitEmptyPayload = false;
  let parsedJson: unknown = undefined;

  try {
    parsedJson = JSON.parse(trimmed);
    recognizedJsonPayload = isRecognizedDraftJsonPayload(parsedJson);
    explicitEmptyPayload = isExplicitEmptyDraftPayload(parsedJson);
    drafts = parseJsonDraftPayload(parsedJson);
  } catch {
    drafts = parseMarkdownDraftPayload(raw);
  }

  if (drafts.length === 0 && !explicitEmptyPayload) {
    drafts = parseLooseDraftPayload(raw, sourceName, options);
  }

  return {
    drafts,
    recognizedJsonPayload,
    explicitEmptyPayload,
  };
}

export function escapeAssetContentForMarkdownBundle(content: string): string {
  return content.replace(/^##/gm, '\\##');
}
