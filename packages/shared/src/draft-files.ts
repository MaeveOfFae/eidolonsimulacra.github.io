import { detectAndParseCharacter } from './import/character-parser';
import { inferCharacterDisplayNameFromAssets } from './parse/parse-blocks';
import { buildPngCardBytes, parseEmbeddedPngBytes } from './png-card';
import { OFFICIAL_TEMPLATE } from './templates';
import type { CharacterCardMetadata, CharacterImportOptions, Draft, DraftMetadata, ExportFormat, ImportedCharacter } from './types';
import { MAX_CONNECTED_DRAFT_REFERENCES } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function coerceContentMode(value: unknown): DraftMetadata['mode'] | undefined {
  if (value !== 'SFW' && value !== 'NSFW' && value !== 'Platform-Safe' && value !== 'Auto') {
    return undefined;
  }

  return value;
}

function coerceStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return normalized.length > 0 ? normalized : undefined;
}

function normalizeConnectedDraftIds(reviewId: string, value: unknown): string[] | undefined {
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

function normalizeMetadataString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeMetadataStringArray(value: unknown): string[] | undefined {
  return coerceStringArray(value);
}

function mergeImportedNotes(importedNotes: string | undefined, sourceNotes: string): string {
  if (!importedNotes) {
    return sourceNotes;
  }

  if (importedNotes.includes(sourceNotes)) {
    return importedNotes;
  }

  return `${importedNotes}\n\n${sourceNotes}`;
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function normalizeMetadataNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeMetadataNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }

  return normalizeMetadataString(value);
}

function normalizeCardMetadata(value: unknown): CharacterCardMetadata | undefined {
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

function mergeCardMetadata(
  base: CharacterCardMetadata | undefined,
  override: CharacterCardMetadata | undefined
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

function slugifyCardPathSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'character';
}

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
  const reviewIdValue = typeof source.review_id === 'string'
    ? source.review_id
    : typeof source.reviewId === 'string'
      ? source.reviewId
      : '';
  const review_id = reviewIdValue.trim().length > 0
    ? reviewIdValue
    : createImportedReviewId();
  const seedValue = typeof source.seed === 'string' ? source.seed : '';
  const seed = seedValue.trim().length > 0
    ? seedValue
    : fallbackSeed;

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
  const componentSendOrder = coerceStringArray(source.component_send_order)
    ?? coerceStringArray(source.componentSendOrder);
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
  const cardMetadata = normalizeCardMetadata(source.card_metadata ?? source.cardMetadata);
  if (cardMetadata) {
    metadata.card_metadata = cardMetadata;
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
  const path = typeof value.path === 'string' && value.path.trim().length > 0
    ? value.path
    : typeof value.reviewId === 'string' && value.reviewId.trim().length > 0
      ? value.reviewId
      : metadata.review_id;

  return { metadata, assets, path };
}

function parseJsonDraftPayload(data: unknown): Draft[] {
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

function isExplicitEmptyDraftPayload(data: unknown): boolean {
  if (Array.isArray(data)) {
    return data.length === 0;
  }

  return isRecord(data) && Array.isArray(data.drafts) && data.drafts.length === 0;
}

function isRecognizedDraftJsonPayload(data: unknown): boolean {
  if (Array.isArray(data)) {
    return true;
  }

  if (!isRecord(data)) {
    return false;
  }

  return Array.isArray(data.drafts)
    || isRecord(data.draft)
    || isRecord(data.assets)
    || isRecord(data.metadata)
    || typeof data.reviewId === 'string'
    || typeof data.review_id === 'string';
}

function normalizeAssetHeading(heading: string): string {
  return heading.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseMarkdownDraftPayload(markdown: string): Draft[] {
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
  return [{
    path: metadata.review_id,
    metadata,
    assets,
  }];
}

function buildImportedDraftFromCharacter(
  character: ImportedCharacter,
  sourceName?: string,
  template?: CharacterImportOptions['template'],
): Draft {
  const reviewId = createImportedReviewId();
  const characterName = character.name.trim() || sourceName?.replace(/\.[^.]+$/, '') || 'Imported draft';
  const seed = sourceName ? `Imported from ${sourceName}` : `Imported draft: ${characterName}`;
  const sourceLabel = character.sourcePreset || character.sourceFormat;
  const unmappedCount = Object.keys(character.unmappedFields || {}).length;
  const notes = unmappedCount > 0
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

function parseLooseDraftPayload(raw: string, sourceName?: string, options?: CharacterImportOptions): Draft[] {
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

export function parseDraftImportText(raw: string, sourceName?: string, options?: CharacterImportOptions): DraftImportParseResult {
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

export interface DraftExportArtifact {
  content: string | Uint8Array;
  contentType: string;
  extension: 'json' | 'txt' | 'md' | 'png';
}

function trimDraftText(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildMesExample(postHistory: string | undefined): string | undefined {
  const trimmed = trimDraftText(postHistory);
  if (!trimmed) {
    return undefined;
  }

  return trimmed.startsWith('<START>') ? trimmed : `<START>\n${trimmed}`;
}

function parseJsonObjectAsset(raw: string | undefined): Record<string, unknown> | undefined {
  const trimmed = trimDraftText(raw);
  if (!trimmed) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Ignore malformed optional metadata assets.
  }

  return undefined;
}

function withOriginalPrefix(value: string | undefined): string {
  const trimmed = trimDraftText(value);
  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('{{original}}') ? trimmed : `{{original}}\n${trimmed}`;
}

function tryParseStringArray(raw: string | undefined): string[] {
  const trimmed = trimDraftText(raw);
  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .filter((entry): entry is string => typeof entry === 'string')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    }
  } catch {
    // Fall through to plain-text fallback.
  }

  return [trimmed];
}

function getPortableDraftAssets(draft: Draft): Record<string, string> {
  return Object.fromEntries(
    Object.entries(draft.assets).filter(([assetName, value]) => assetName !== 'card_image' && value.trim().length > 0)
  );
}

function resolveDraftCardImageBytes(
  draft: Draft,
  cardMetadata: CharacterCardMetadata | undefined,
): Uint8Array | null {
  const candidates = [
    trimDraftText(draft.assets.card_image),
    trimDraftText(cardMetadata?.avatar),
    trimDraftText(draft.assets.avatar),
  ];

  for (const candidate of candidates) {
    const parsed = parseEmbeddedPngBytes(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function lorebookAssetSort(left: string, right: string): number {
  const parseIndex = (value: string) => {
    const match = value.match(/^lorebook(?:_(\d+))?$/);
    return match?.[1] ? Number(match[1]) : 1;
  };

  return parseIndex(left) - parseIndex(right);
}

function parseLorebookEntrySections(content: string): {
  bookName?: string;
  description?: string;
  entries: Array<Record<string, unknown>>;
} {
  const trimmed = content.trim();
  if (!trimmed) {
    return { entries: [] };
  }

  const lines = trimmed.split('\n');
  let bookName: string | undefined;
  let cursor = 0;

  if (lines[0]?.startsWith('# ')) {
    bookName = lines[0].slice(2).trim() || undefined;
    cursor = 1;
  }

  const remaining = lines.slice(cursor).join('\n').trim();
  const sectionRegex = /^##\s+(.+)$/gm;
  const sections: Array<{ title: string; start: number; bodyStart: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = sectionRegex.exec(remaining)) !== null) {
    sections.push({
      title: match[1].trim(),
      start: match.index,
      bodyStart: sectionRegex.lastIndex,
    });
  }

  const description = sections.length > 0
    ? remaining.slice(0, sections[0].start).trim() || undefined
    : undefined;

  if (sections.length === 0) {
    return {
      bookName,
      description,
      entries: [{
        name: bookName || 'Entry 1',
        keys: [],
        secondary_keys: [],
        content: remaining,
        enabled: true,
        insertion_order: 10,
        case_sensitive: false,
        priority: 10,
        id: 1,
        comment: '',
        selective: false,
        constant: false,
        position: '',
        extensions: {},
        probability: 100,
        selectiveLogic: 0,
      }],
    };
  }

  const entries = sections.map((section, index) => {
    const next = sections[index + 1];
    const rawBody = remaining.slice(section.bodyStart, next ? next.start : remaining.length).trim();
    const bodyLines = rawBody.split('\n');
    const keysLine = bodyLines.find((line) => line.startsWith('Keys: '));
    const secondaryKeysLine = bodyLines.find((line) => line.startsWith('Secondary Keys: '));
    const commentLine = bodyLines.find((line) => line.startsWith('Comment: '));
    const contentLines = bodyLines.filter((line) => !/^Keys: |^Secondary Keys: |^Comment: /i.test(line));
    const entryContent = contentLines.join('\n').trim();
    const keys = keysLine ? keysLine.slice('Keys: '.length).split(',').map((entry) => entry.trim()).filter(Boolean) : [];
    const secondaryKeys = secondaryKeysLine ? secondaryKeysLine.slice('Secondary Keys: '.length).split(',').map((entry) => entry.trim()).filter(Boolean) : [];
    const comment = commentLine ? commentLine.slice('Comment: '.length).trim() : '';

    return {
      name: section.title || `Entry ${index + 1}`,
      keys,
      secondary_keys: secondaryKeys,
      content: entryContent,
      enabled: true,
      insertion_order: (index + 1) * 10,
      case_sensitive: false,
      priority: 10,
      id: index + 1,
      comment,
      selective: false,
      constant: false,
      position: '',
      extensions: {},
      probability: 100,
      selectiveLogic: 0,
    };
  }).filter((entry) => typeof entry.content === 'string' && entry.content.trim().length > 0);

  return { bookName, description, entries };
}

function buildCharacterBook(draft: Draft, fallbackName: string): Record<string, unknown> | undefined {
  const rawCharacterBook = trimDraftText(draft.assets.character_book);
  if (rawCharacterBook) {
    const parsed = parseJsonObjectAsset(rawCharacterBook);
    if (parsed) {
      return parsed;
    }
  }

  const lorebookAssetNames = Object.keys(draft.assets)
    .filter((assetName) => /^lorebook(?:_\d+)?$/i.test(assetName))
    .sort(lorebookAssetSort);

  if (lorebookAssetNames.length === 0) {
    return undefined;
  }

  let bookName = `${fallbackName} lorebook`;
  let description = '';
  const entries: Array<Record<string, unknown>> = [];

  lorebookAssetNames.forEach((assetName) => {
    const parsed = parseLorebookEntrySections(draft.assets[assetName]);
    if (parsed.bookName && entries.length === 0) {
      bookName = parsed.bookName;
    }
    if (parsed.description && !description) {
      description = parsed.description;
    }

    parsed.entries.forEach((entry) => {
      entries.push({
        ...entry,
        id: entries.length + 1,
        insertion_order: (entries.length + 1) * 10,
      });
    });
  });

  return {
    name: bookName,
    description,
    scan_depth: 2,
    token_budget: 512,
    recursive_scanning: false,
    extensions: {},
    entries,
  };
}

function buildChubCompatibleCardExport(draft: Draft, includeMetadata: boolean): Record<string, unknown> {
  const assetCardMetadata = normalizeCardMetadata({
    avatar: draft.assets.avatar,
    creator: draft.assets.creator,
    character_version: draft.assets.character_version,
    depth_prompt: parseJsonObjectAsset(draft.assets.depth_prompt),
    chub: parseJsonObjectAsset(draft.assets.chub_extension),
  });
  const cardMetadata = mergeCardMetadata(assetCardMetadata, normalizeCardMetadata(draft.metadata.card_metadata));
  const embeddedCardImage = trimDraftText(draft.assets.card_image);
  const portableAssets = getPortableDraftAssets(draft);
  const name = trimDraftText(draft.metadata.character_name)
    ?? inferCharacterDisplayNameFromAssets(draft.assets)
    ?? trimDraftText(draft.metadata.seed)
    ?? draft.metadata.review_id;
  const alternateGreetings = tryParseStringArray(draft.assets.alternate_greetings);
  const characterBook = buildCharacterBook(draft, name);
  const creator = cardMetadata?.creator ?? trimDraftText(draft.assets.creator) ?? 'Eidolon Simulacra';
  const characterVersion = cardMetadata?.character_version ?? trimDraftText(draft.assets.character_version) ?? trimDraftText(draft.metadata.modified) ?? trimDraftText(draft.metadata.created) ?? '1.0';
  const depthPrompt = cardMetadata?.depth_prompt ?? parseJsonObjectAsset(draft.assets.depth_prompt) ?? { depth: 0, prompt: '' };
  const relatedLorebooks = characterBook
    ? [{ id: -1, book: null, path: 'embedded', version: characterVersion, commit_ref: characterVersion }]
    : [];
  const chubExtension = {
    id: cardMetadata?.chub?.id ?? -1,
    preset: cardMetadata?.chub?.preset ?? null,
    full_path: cardMetadata?.chub?.full_path ?? `${slugifyCardPathSegment(creator)}/${slugifyCardPathSegment(name)}`,
    custom_css: cardMetadata?.chub?.custom_css ?? null,
    extensions: cardMetadata?.chub?.extensions ?? [],
    expressions: cardMetadata?.chub?.expressions ?? null,
    alt_expressions: cardMetadata?.chub?.alt_expressions ?? {},
    background_image: cardMetadata?.chub?.background_image ?? '',
    related_lorebooks: cardMetadata?.chub?.related_lorebooks ?? relatedLorebooks,
  };

  const extensionPayload: Record<string, unknown> = {
    format: 'eidolon-simulacra/v1',
    exported_at: new Date().toISOString(),
    asset_order: Object.keys(portableAssets),
    assets: portableAssets,
  };

  if (includeMetadata) {
    extensionPayload.metadata = draft.metadata;
  }

  const data: Record<string, unknown> = {
    name,
    description: trimDraftText(draft.assets.character_sheet) ?? '',
    personality: trimDraftText(draft.assets.personality) ?? '',
    scenario: trimDraftText(draft.assets.scenario) ?? '',
    first_mes: trimDraftText(draft.assets.intro_scene) ?? '',
    avatar: cardMetadata?.avatar ?? embeddedCardImage ?? trimDraftText(draft.assets.avatar) ?? '',
    mes_example: buildMesExample(draft.assets.mes_example) ?? '',
    creator_notes: trimDraftText(draft.assets.creator_notes)
      ?? trimDraftText(draft.assets.intro_page)
      ?? (includeMetadata ? trimDraftText(draft.metadata.notes) ?? '' : ''),
    system_prompt: withOriginalPrefix(draft.assets.system_prompt),
    post_history_instructions: withOriginalPrefix(draft.assets.post_history),
    alternate_greetings: alternateGreetings,
    tags: includeMetadata ? (draft.metadata.tags ?? []) : [],
    creator,
    character_version: characterVersion,
    extensions: {
      chub: chubExtension,
      depth_prompt: depthPrompt,
      eidolon: extensionPayload,
    },
  };

  if (characterBook) {
    data.character_book = characterBook;
  }

  return {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data,
  };
}

export function buildDraftExportArtifact(
  draft: Draft,
  format: ExportFormat,
  includeMetadata = true
): DraftExportArtifact {
  if (format === 'text') {
    const content = Object.entries(draft.assets)
      .map(([assetName, value]) => `## ${assetName}\n\n${escapeAssetContentForMarkdownBundle(value)}`)
      .join('\n\n');
    return {
      content,
      contentType: 'text/plain',
      extension: 'txt',
    };
  }

  if (format === 'combined') {
    const sections = [
      `# ${draft.metadata.character_name || draft.metadata.seed}`,
      includeMetadata ? `## Metadata\n\n${JSON.stringify(draft.metadata, null, 2)}` : '',
      ...Object.entries(draft.assets).map(([assetName, value]) => `## ${assetName}\n\n${escapeAssetContentForMarkdownBundle(value)}`),
    ].filter(Boolean);

    return {
      content: sections.join('\n\n'),
      contentType: 'text/markdown',
      extension: 'md',
    };
  }

  if (format === 'png') {
    const assetCardMetadata = normalizeCardMetadata({
      avatar: draft.assets.avatar,
      creator: draft.assets.creator,
      character_version: draft.assets.character_version,
      depth_prompt: parseJsonObjectAsset(draft.assets.depth_prompt),
      chub: parseJsonObjectAsset(draft.assets.chub_extension),
    });
    const cardMetadata = mergeCardMetadata(assetCardMetadata, normalizeCardMetadata(draft.metadata.card_metadata));
    const imageBytes = resolveDraftCardImageBytes(draft, cardMetadata);

    if (!imageBytes) {
      throw new Error('PNG export requires a draft card image. Attach or import a PNG image for this draft first.');
    }

    return {
      content: buildPngCardBytes(imageBytes, JSON.stringify(buildChubCompatibleCardExport(draft, includeMetadata))),
      contentType: 'image/png',
      extension: 'png',
    };
  }

  return {
    content: JSON.stringify(buildChubCompatibleCardExport(draft, includeMetadata), null, 2),
    contentType: 'application/json',
    extension: 'json',
  };
}

export function buildDraftLibraryExport(drafts: Draft[]): string {
  return JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    drafts,
  }, null, 2);
}