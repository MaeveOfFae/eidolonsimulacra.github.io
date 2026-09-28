/**
 * Character Card Import Parser
 *
 * Parses external character card formats (TavernAI/SillyTavern v1/v2, Chub AI,
 * PNG-embedded cards) and maps their fields plus Eidolon extension payloads
 * back to internal draft assets.
 */

import type {
  CharacterCardMetadata,
  CharacterImportOptions,
  DraftMetadata,
  ImportedCharacter,
  ImportedCharacterFormat,
  ExportPreset,
} from '../types';
import { extractPngCharaChunk, parseEmbeddedPngBytes, pngBytesToDataUrl } from '../png-card';
import { normalizeAssetName, normalizeAssetNameList, normalizeAssetRecord, OFFICIAL_TEMPLATE } from '../templates';

// ============================================================================
// Format Detection
// ============================================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const EIDOLON_EXTENSION_KEYS = ['eidolon', 'eidolon_simulacra', 'eidolonsimulacra'] as const;

function readString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function mergeCardMetadata(
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

function readCardMetadataRecord(value: unknown): CharacterCardMetadata | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const metadata: CharacterCardMetadata = {};
  const avatar = readString(value.avatar);
  if (avatar) {
    metadata.avatar = avatar;
  }

  const creator = readString(value.creator);
  if (creator) {
    metadata.creator = creator;
  }

  const characterVersion = readString(value.character_version);
  if (characterVersion) {
    metadata.character_version = characterVersion;
  }

  if (isRecord(value.depth_prompt)) {
    const depth = readNumber(value.depth_prompt.depth);
    const prompt = readString(value.depth_prompt.prompt) ?? '';
    if (depth !== undefined) {
      metadata.depth_prompt = { depth, prompt };
    }
  }

  if (isRecord(value.chub)) {
    const chub: NonNullable<CharacterCardMetadata['chub']> = {};
    const id = readNumber(value.chub.id);
    if (id !== undefined) {
      chub.id = id;
    }

    if (value.chub.preset === null || typeof value.chub.preset === 'string') {
      chub.preset = value.chub.preset === null ? null : value.chub.preset.trim() || null;
    }

    const fullPath = readString(value.chub.full_path);
    if (fullPath) {
      chub.full_path = fullPath;
    }

    if (value.chub.custom_css === null || typeof value.chub.custom_css === 'string') {
      chub.custom_css = value.chub.custom_css === null ? null : value.chub.custom_css.trim() || null;
    }

    const backgroundImage = readString(value.chub.background_image);
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
      chub.related_lorebooks = value.chub.related_lorebooks
        .filter((entry): entry is Record<string, unknown> => isRecord(entry))
        .map((entry) => {
          const record: NonNullable<NonNullable<CharacterCardMetadata['chub']>['related_lorebooks']>[number] = {};
          const id = readNumber(entry.id);
          if (id !== undefined) {
            record.id = id;
          }
          if (entry.book === null || typeof entry.book === 'string') {
            record.book = entry.book === null ? null : entry.book;
          }
          const path = readString(entry.path);
          if (path) {
            record.path = path;
          }
          const version = readString(entry.version);
          if (version) {
            record.version = version;
          }
          const commitRef = readString(entry.commit_ref);
          if (commitRef) {
            record.commit_ref = commitRef;
          }
          return record;
        })
        .filter((entry) => Object.keys(entry).length > 0);
    }

    if (Object.keys(chub).length > 0) {
      metadata.chub = chub;
    }
  }

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function readCardCandidates(data: Record<string, unknown>): Record<string, unknown>[] {
  return isRecord(data.data) ? [data, data.data] : [data];
}

function hasCardSpec(data: Record<string, unknown>): boolean {
  const spec = readString(data.spec);
  const specVersion = readString(data.spec_version) ?? readString(data.specVersion);

  if (spec === 'chara_card_v2') {
    return true;
  }

  if (!specVersion) {
    return false;
  }

  return (
    specVersion === '2' ||
    specVersion === '2.0' ||
    specVersion === '3' ||
    specVersion === '3.0' ||
    specVersion.startsWith('2.') ||
    specVersion.startsWith('3.')
  );
}

function readEidolonExtension(data: Record<string, unknown>): Record<string, unknown> | null {
  if (!isRecord(data.extensions)) {
    return null;
  }

  for (const key of EIDOLON_EXTENSION_KEYS) {
    if (isRecord(data.extensions[key])) {
      return data.extensions[key];
    }
  }

  return null;
}

function hasChubSignals(data: Record<string, unknown>): boolean {
  return (
    Array.isArray(data.tags) ||
    typeof data.creator === 'string' ||
    typeof data.creator_notes === 'string' ||
    typeof data.system_prompt === 'string' ||
    typeof data.post_history_instructions === 'string' ||
    Array.isArray(data.alternate_greetings) ||
    readEidolonExtension(data) !== null
  );
}

function extractEidolonAssets(data: Record<string, unknown>): Record<string, string> {
  const extension = readEidolonExtension(data);
  if (!extension || !isRecord(extension.assets)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(extension.assets)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
      .map(([key, value]) => [key, value.trim()]),
  );
}

function extractImportedMetadata(data: Record<string, unknown>, name: string): Partial<DraftMetadata> | undefined {
  const extension = readEidolonExtension(data);
  const rawMetadata = extension && isRecord(extension.metadata) ? extension.metadata : null;
  const metadata: Partial<DraftMetadata> = {};

  const assignString = (key: keyof DraftMetadata, ...candidates: unknown[]) => {
    for (const candidate of candidates) {
      const value = readString(candidate);
      if (value) {
        (metadata as Record<string, unknown>)[key] = value;
        return;
      }
    }
  };

  if (rawMetadata) {
    const existingCardMetadata = readCardMetadataRecord(rawMetadata.card_metadata ?? rawMetadata.cardMetadata);
    if (existingCardMetadata) {
      metadata.card_metadata = existingCardMetadata;
    }

    assignString('seed', rawMetadata.seed);
    assignString('model', rawMetadata.model);
    assignString('created', rawMetadata.created, rawMetadata.createdAt);
    assignString('modified', rawMetadata.modified, rawMetadata.updatedAt);
    assignString('genre', rawMetadata.genre);
    assignString('notes', rawMetadata.notes);
    assignString('character_name', rawMetadata.character_name, rawMetadata.characterName);
    assignString('template_name', rawMetadata.template_name, rawMetadata.templateName);
    assignString('custom_instructions', rawMetadata.custom_instructions, rawMetadata.customInstructions);
    assignString('offspring_type', rawMetadata.offspring_type, rawMetadata.offspringType);

    if (
      rawMetadata.mode === 'SFW' ||
      rawMetadata.mode === 'NSFW' ||
      rawMetadata.mode === 'Platform-Safe' ||
      rawMetadata.mode === 'Auto'
    ) {
      metadata.mode = rawMetadata.mode;
    }

    if (typeof rawMetadata.favorite === 'boolean') {
      metadata.favorite = rawMetadata.favorite;
    }

    const componentSendOrder = readStringArray(rawMetadata.component_send_order ?? rawMetadata.componentSendOrder);
    if (componentSendOrder.length > 0) {
      metadata.component_send_order = componentSendOrder;
    }

    const rawTags = readStringArray(rawMetadata.tags);
    if (rawTags.length > 0) {
      metadata.tags = rawTags;
    }
  }

  const importedCardMetadata = readCardMetadataRecord({
    avatar: data.avatar,
    creator: data.creator,
    character_version: data.character_version,
    depth_prompt: isRecord(data.extensions) ? data.extensions.depth_prompt : undefined,
    chub: isRecord(data.extensions) ? data.extensions.chub : undefined,
  });
  const cardMetadata = mergeCardMetadata(metadata.card_metadata, importedCardMetadata);
  if (cardMetadata) {
    metadata.card_metadata = cardMetadata;
  }

  const tags = readStringArray(data.tags);
  if (tags.length > 0) {
    metadata.tags = Array.from(new Set([...(metadata.tags ?? []), ...tags]));
  }

  if (!metadata.notes) {
    const notes = readString(data.creator_notes);
    if (notes) {
      metadata.notes = notes;
    }
  }

  metadata.character_name = metadata.character_name ?? name;

  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

function buildCharacterSheetAsset(data: Record<string, unknown>): string | null {
  const description = readString(data.description);
  const personality = readString(data.personality);
  const creatorNotes = readString(data.creator_notes);

  if (description) {
    return description;
  }

  if (personality) {
    return personality;
  }

  return creatorNotes;
}

function buildPostHistoryAsset(data: Record<string, unknown>): string | null {
  const mesExample = readString(data.mes_example);
  const postHistoryInstructions = readString(data.post_history_instructions);
  const unwrappedExample = mesExample ? unwrapContent(mesExample) : null;
  const unwrappedInstructions = postHistoryInstructions ? unwrapContent(postHistoryInstructions) : null;

  if (unwrappedExample && unwrappedInstructions && unwrappedInstructions !== unwrappedExample) {
    return ['Example Dialogue', '', unwrappedExample, '', 'Post-History Instructions', '', unwrappedInstructions].join(
      '\n',
    );
  }

  return unwrappedExample ?? unwrappedInstructions;
}

function buildIntroSceneAsset(data: Record<string, unknown>): string | null {
  const firstMes = readString(data.first_mes);
  if (firstMes) {
    return firstMes;
  }

  const alternateGreetings = readStringArray(data.alternate_greetings);
  return alternateGreetings[0] ?? null;
}

/**
 * Detect the format of a parsed JSON character card.
 */
export function detectJsonFormat(data: unknown): ImportedCharacterFormat {
  if (!isRecord(data)) return 'unknown';

  const candidates = readCardCandidates(data);
  const hasAnyChubSignals = candidates.some((candidate) => hasChubSignals(candidate));

  for (const candidate of candidates) {
    if (hasCardSpec(candidate)) {
      return hasChubSignals(candidate) || hasAnyChubSignals ? 'chubai' : 'tavernai_v2';
    }
  }

  const cardData = isRecord(data.data) ? data.data : data;

  if (typeof cardData.description === 'string' && typeof cardData.first_mes === 'string' && hasChubSignals(cardData)) {
    return 'chubai';
  }

  // TavernAI v1: has name + description + first_mes at top level
  if (
    typeof cardData.name === 'string' &&
    typeof cardData.description === 'string' &&
    typeof cardData.first_mes === 'string'
  ) {
    return 'tavernai_v1';
  }

  return 'unknown';
}

/**
 * Detect whether a filename suggests a PNG character card.
 */
export function isPngFilename(filename: string): boolean {
  return filename.toLowerCase().endsWith('.png');
}

// ============================================================================
// Reverse Field Mapping
// ============================================================================

/**
 * Known field-to-asset mappings for common character card formats.
 * These represent the "standard" external field names that map to internal assets.
 */
const TAVERNAI_FIELD_MAP: Record<string, string> = {
  description: 'character_sheet',
  personality: 'system_prompt',
  first_mes: 'intro_scene',
  mes_example: 'post_history',
  scenario: 'creator_notes',
};

const LOREBOOK_SOURCE_KEYS = ['character_book', 'lorebook', 'world_info'] as const;

/**
 * Build a reverse mapping from an export preset.
 * Takes the preset's fields (asset → target) and inverts to (target → asset).
 */
export function buildReverseMapping(preset: ExportPreset): Record<string, string> {
  const reverseMap: Record<string, string> = {};

  for (const field of preset.fields) {
    // Strip file extensions from target names (e.g., "description" from "description.txt")
    const cleanTarget = field.target.replace(/\.(txt|md|json)$/i, '');
    reverseMap[cleanTarget] = field.asset;
  }

  return reverseMap;
}

/**
 * Unwrap wrapper patterns from content.
 * For example, the TavernAI preset wraps post_history in:
 *   <START>\n{{user}}: Hello!\n{{char}}: {{content}}
 * We try to extract just the content portion.
 */
function unwrapContent(content: string, wrapper?: string): string {
  const normalizedContent = content
    .replace(/^\{\{original\}\}\s*/i, '')
    .replace(/^<START>\s*/i, '')
    .trim();

  if (!wrapper) return normalizedContent;

  // Common wrapper pattern: <START>\n...{{char}}: {{content}} or similar
  // Try to find the content after the last {{char}}: or {{content}} placeholder

  // If the wrapper contains <START>, try to strip it
  if (wrapper.includes('<START>')) {
    // Remove <START> prefix lines
    const lines = normalizedContent.split('\n');
    const startIndex = lines.findIndex(
      (line) =>
        line.trim().toLowerCase() === '<start>' ||
        line.trim().startsWith('{{user}}:') ||
        line.trim().startsWith('{{char}}:'),
    );

    if (startIndex >= 0) {
      // Find the first {{char}}: line and take everything after it
      for (let i = startIndex; i < lines.length; i++) {
        if (lines[i].trim().startsWith('{{char}}:') || lines[i].trim().startsWith('{{Char}}:')) {
          const charLine = lines[i].replace(/^\{\{[Cc]har\}\}:\s*/, '');
          const remaining = lines.slice(i + 1).join('\n');
          return (charLine + (remaining ? '\n' + remaining : '')).trim();
        }
      }
    }
  }

  return normalizedContent;
}

function stringifyUnknown(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null || value === undefined) {
    return null;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return null;
  }
}

function formatLorebookEntry(entry: unknown, index: number): string | null {
  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    return trimmed ? `## Entry ${index}\n\n${trimmed}` : null;
  }

  if (!isRecord(entry)) {
    const serialized = stringifyUnknown(entry);
    return serialized ? `## Entry ${index}\n\n${serialized}` : null;
  }

  const title =
    typeof entry.name === 'string' && entry.name.trim()
      ? entry.name.trim()
      : typeof entry.comment === 'string' && entry.comment.trim()
        ? entry.comment.trim()
        : Array.isArray(entry.keys) && entry.keys.length > 0
          ? entry.keys.filter((key): key is string => typeof key === 'string' && key.trim().length > 0).join(', ')
          : `Entry ${index}`;

  const details: string[] = [];
  const keys = Array.isArray(entry.keys)
    ? entry.keys.filter((key): key is string => typeof key === 'string' && key.trim().length > 0)
    : [];
  const secondaryKeys = Array.isArray(entry.secondary_keys)
    ? entry.secondary_keys.filter((key): key is string => typeof key === 'string' && key.trim().length > 0)
    : [];

  if (keys.length > 0) {
    details.push(`Keys: ${keys.join(', ')}`);
  }
  if (secondaryKeys.length > 0) {
    details.push(`Secondary Keys: ${secondaryKeys.join(', ')}`);
  }
  if (typeof entry.comment === 'string' && entry.comment.trim() && entry.comment.trim() !== title) {
    details.push(`Comment: ${entry.comment.trim()}`);
  }
  if (typeof entry.insertion_order === 'number') {
    details.push(`Insertion Order: ${entry.insertion_order}`);
  }
  if (typeof entry.enabled === 'boolean' && !entry.enabled) {
    details.push('Enabled: false');
  }

  const content =
    typeof entry.content === 'string' && entry.content.trim()
      ? entry.content.trim()
      : typeof entry.entry === 'string' && entry.entry.trim()
        ? entry.entry.trim()
        : typeof entry.text === 'string' && entry.text.trim()
          ? entry.text.trim()
          : null;

  const bodyParts = [`## ${title}`];
  if (details.length > 0) {
    bodyParts.push(details.join('\n'));
  }
  if (content) {
    bodyParts.push(content);
  } else {
    const serialized = stringifyUnknown(entry);
    if (serialized) {
      bodyParts.push(serialized);
    }
  }

  return bodyParts.join('\n\n').trim();
}

function formatLorebookSource(label: string, value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (Array.isArray(value)) {
    const entries = value
      .map((entry, index) => formatLorebookEntry(entry, index + 1))
      .filter((entry): entry is string => Boolean(entry));
    return entries.length > 0 ? entries.join('\n\n') : null;
  }

  if (!isRecord(value)) {
    return stringifyUnknown(value);
  }

  const heading =
    typeof value.name === 'string' && value.name.trim()
      ? `# ${value.name.trim()}`
      : `# ${label.replace(/_/g, ' ').replace(/\b\w/g, (segment) => segment.toUpperCase())}`;
  const sections: string[] = [heading];

  if (typeof value.description === 'string' && value.description.trim()) {
    sections.push(value.description.trim());
  }

  const entries = Array.isArray(value.entries)
    ? value.entries
    : Array.isArray(value.world_info)
      ? value.world_info
      : null;

  if (entries) {
    const formattedEntries = entries
      .map((entry, index) => formatLorebookEntry(entry, index + 1))
      .filter((entry): entry is string => Boolean(entry));

    if (formattedEntries.length > 0) {
      sections.push(formattedEntries.join('\n\n'));
    }
  }

  if (sections.length === 1) {
    const serialized = stringifyUnknown(value);
    if (serialized) {
      sections.push(serialized);
    }
  }

  return sections.join('\n\n').trim() || null;
}

function extractLorebookAssets(data: Record<string, unknown>): {
  assets: Record<string, string>;
  sourceKeys: string[];
} {
  const assets: Record<string, string> = {};
  const sourceKeys: string[] = [];
  const sources: Array<{ key: string; value: unknown }> = [];

  for (const key of LOREBOOK_SOURCE_KEYS) {
    if (data[key] !== undefined && data[key] !== null) {
      sources.push({ key, value: data[key] });
    }
  }

  if (isRecord(data.extensions)) {
    for (const key of LOREBOOK_SOURCE_KEYS) {
      if (data.extensions[key] !== undefined && data.extensions[key] !== null) {
        sources.push({ key: `extensions.${key}`, value: data.extensions[key] });
      }
    }
  }

  sources.forEach(({ key, value }, index) => {
    const content = formatLorebookSource(key, value);
    if (!content) {
      return;
    }

    const assetName = index === 0 ? 'lorebook' : `lorebook_${index + 1}`;
    assets[assetName] = content;
    sourceKeys.push(key.split('.')[0]);
  });

  return { assets, sourceKeys: [...new Set(sourceKeys)] };
}

// ============================================================================
// Parsing Functions
// ============================================================================

/**
 * Flatten a possibly-nested card data object to a single-level record.
 * Handles both TavernAI v2's `{ data: {...} }` wrapper and flat v1 layouts.
 */
function flattenCardData(raw: Record<string, unknown>): Record<string, unknown> {
  // If there's a "data" key that's an object, prefer it
  if (isRecord(raw.data)) {
    return { ...raw.data };
  }
  return raw;
}

function getValueAtImportPath(data: Record<string, unknown>, importPath: string): unknown {
  const trimmedPath = importPath.trim();
  if (!trimmedPath) {
    return undefined;
  }

  const direct = data[trimmedPath];
  if (direct !== undefined) {
    return direct;
  }

  const segments = trimmedPath.split('.').filter(Boolean);
  if (segments.length === 0) {
    return undefined;
  }

  let current: unknown = data;
  for (const segment of segments) {
    if (!isRecord(current) || !(segment in current)) {
      return undefined;
    }
    current = current[segment];
  }

  return current;
}

function formatImportedAliasValue(alias: string, value: unknown): string | null {
  const normalizedAlias = alias.trim().toLowerCase();

  if (normalizedAlias === 'character_book' || normalizedAlias === 'lorebook' || normalizedAlias === 'world_info') {
    return formatLorebookSource(normalizedAlias, value);
  }

  if (
    normalizedAlias === 'mes_example' ||
    normalizedAlias === 'system_prompt' ||
    normalizedAlias === 'post_history_instructions'
  ) {
    const text = readString(value);
    return text ? unwrapContent(text) : null;
  }

  if (normalizedAlias === 'alternate_greetings' && Array.isArray(value)) {
    const values = readStringArray(value);
    return values.length > 0 ? JSON.stringify(values, null, 2) : null;
  }

  return stringifyUnknown(value);
}

function getDefaultAssetNamesForImportAlias(alias: string, data: Record<string, unknown>): string[] {
  const normalizedAlias = alias.trim().toLowerCase();
  switch (normalizedAlias) {
    case 'description':
      return ['character_sheet'];
    case 'system_prompt':
    case 'personality':
      return ['system_prompt', 'personality'];
    case 'first_mes':
      return ['intro_scene'];
    case 'mes_example':
    case 'post_history_instructions':
      return ['post_history'];
    case 'scenario':
    case 'creator_notes':
      return ['creator_notes', 'intro_page'];
    case 'avatar':
      return ['avatar'];
    case 'creator':
      return ['creator'];
    case 'character_version':
      return ['character_version'];
    case 'alternate_greetings':
      return ['alternate_greetings'];
    case 'character_book':
    case 'lorebook':
    case 'world_info': {
      const assets = extractLorebookAssets(data).assets;
      return Object.keys(assets).length > 0 ? Object.keys(assets) : ['character_book'];
    }
    case 'extensions.chub':
      return ['chub_extension'];
    case 'extensions.depth_prompt':
      return ['depth_prompt'];
    default:
      return [];
  }
}

function applyTemplateImportAliases(
  character: ImportedCharacter,
  data: Record<string, unknown>,
  options?: CharacterImportOptions,
): ImportedCharacter {
  const templateAssets = options?.template?.assets ?? [];
  if (templateAssets.length === 0) {
    return character;
  }

  const nextAssets = { ...character.assets };
  const nextUnmappedFields = character.unmappedFields ? { ...character.unmappedFields } : undefined;
  const templateAssetNames = new Set(templateAssets.map((asset) => asset.name));
  const consumedDefaultAssets = new Set<string>();

  for (const asset of templateAssets) {
    const aliases = (asset.import_aliases ?? []).map((alias) => alias.trim()).filter((alias) => alias.length > 0);

    if (aliases.length === 0) {
      continue;
    }

    for (const alias of aliases) {
      const value = getValueAtImportPath(data, alias);
      const formatted = formatImportedAliasValue(alias, value);
      if (!formatted) {
        continue;
      }

      nextAssets[asset.name] = formatted;

      const defaultAssetNames = getDefaultAssetNamesForImportAlias(alias, data);
      for (const defaultAssetName of defaultAssetNames) {
        if (defaultAssetName !== asset.name && !templateAssetNames.has(defaultAssetName)) {
          consumedDefaultAssets.add(defaultAssetName);
        }
      }

      if (nextUnmappedFields) {
        delete nextUnmappedFields[alias];
        const rootAlias = alias.split('.')[0];
        delete nextUnmappedFields[rootAlias];
      }

      break;
    }
  }

  for (const assetName of consumedDefaultAssets) {
    delete nextAssets[assetName];
  }

  return {
    ...character,
    assets: nextAssets,
    unmappedFields: nextUnmappedFields && Object.keys(nextUnmappedFields).length > 0 ? nextUnmappedFields : undefined,
  };
}

/**
 * Parse a TavernAI v1 or v2 character card.
 */
export function parseTavernAICard(
  raw: unknown,
  sourceFormat: 'tavernai_v1' | 'tavernai_v2' = 'tavernai_v1',
  options?: CharacterImportOptions,
): ImportedCharacter {
  if (!isRecord(raw)) {
    throw new Error('Invalid TavernAI card: expected JSON object');
  }

  const data = flattenCardData(raw);
  const unmappedFields: Record<string, string> = {};
  const lorebook = extractLorebookAssets(data);

  // Extract character name
  const name = typeof data.name === 'string' ? data.name.trim() : 'Imported Character';
  const importedMetadata = extractImportedMetadata(data, name);
  const templateHint = options?.template ?? importedMetadata?.template_name ?? OFFICIAL_TEMPLATE.name;
  const metadata = importedMetadata
    ? {
        ...importedMetadata,
        ...(importedMetadata.component_send_order
          ? {
              component_send_order: normalizeAssetNameList(importedMetadata.component_send_order, templateHint),
            }
          : {}),
      }
    : undefined;
  const assets: Record<string, string> = normalizeAssetRecord(extractEidolonAssets(data), templateHint);
  const creatorNotesAssetName = normalizeAssetName('intro_page', templateHint);

  if (!assets.character_sheet) {
    const characterSheet = buildCharacterSheetAsset(data);
    if (characterSheet) {
      assets.character_sheet = characterSheet;
    }
  }

  if (!assets.system_prompt) {
    const systemPrompt = readString(data.system_prompt)
      ? unwrapContent(readString(data.system_prompt)!)
      : readString(data.personality);
    if (systemPrompt) {
      assets.system_prompt = systemPrompt;
    }
  }

  const personality = readString(data.personality);
  if (personality && personality !== assets.system_prompt && !assets.personality) {
    assets.personality = personality;
  }

  if (!assets.post_history) {
    const postHistory = buildPostHistoryAsset(data);
    if (postHistory) {
      assets.post_history = postHistory;
    }
  }

  if (!assets.intro_scene) {
    const introScene = buildIntroSceneAsset(data);
    if (introScene) {
      assets.intro_scene = introScene;
    }
  }

  const creatorNotes = readString(data.creator_notes);
  if (creatorNotes && !assets[creatorNotesAssetName]) {
    assets[creatorNotesAssetName] = creatorNotes;
  }

  if (!assets[creatorNotesAssetName]) {
    const scenario = readString(data.scenario);
    if (scenario) {
      assets[creatorNotesAssetName] = scenario;
    }
  }

  const avatar = readString(data.avatar);
  if (avatar && !assets.avatar) {
    assets.avatar = avatar;
  }
  if (avatar && !assets.card_image && parseEmbeddedPngBytes(avatar)) {
    assets.card_image = avatar;
  }

  const creator = readString(data.creator);
  if (creator && !assets.creator) {
    assets.creator = creator;
  }

  const characterVersion = readString(data.character_version);
  if (characterVersion && !assets.character_version) {
    assets.character_version = characterVersion;
  }

  if (data.character_book !== undefined && !assets.character_book) {
    const serializedCharacterBook = stringifyUnknown(data.character_book);
    if (serializedCharacterBook) {
      assets.character_book = serializedCharacterBook;
    }
  }

  const extensions = isRecord(data.extensions) ? data.extensions : null;

  if (extensions && isRecord(extensions.chub) && !assets.chub_extension) {
    assets.chub_extension = JSON.stringify(extensions.chub, null, 2);
  }

  if (extensions && isRecord(extensions.depth_prompt) && !assets.depth_prompt) {
    assets.depth_prompt = JSON.stringify(extensions.depth_prompt, null, 2);
  }

  const alternateGreetings = readStringArray(data.alternate_greetings);
  if (alternateGreetings.length > 0 && !assets.alternate_greetings) {
    assets.alternate_greetings = JSON.stringify(alternateGreetings, null, 2);
  }

  for (const [assetName, value] of Object.entries(lorebook.assets)) {
    if (!assets[assetName]) {
      assets[assetName] = value;
    }
  }

  // Collect unmapped fields for reference
  const mappedKeys = new Set([
    ...Object.keys(TAVERNAI_FIELD_MAP),
    ...lorebook.sourceKeys,
    'system_prompt',
    'post_history_instructions',
    'creator_notes',
    'alternate_greetings',
    'avatar',
    'creator',
    'character_version',
    'tags',
    'extensions',
  ]);
  const skipKeys = new Set(['name', 'spec', 'spec_version', 'specVersion', 'data']);

  for (const [key, value] of Object.entries(data)) {
    if (skipKeys.has(key) || mappedKeys.has(key)) continue;
    const serialized = stringifyUnknown(value);
    if (serialized) {
      unmappedFields[key] = serialized;
    }
  }

  return applyTemplateImportAliases(
    {
      name,
      assets,
      sourceFormat,
      sourcePreset: sourceFormat === 'tavernai_v2' ? 'TavernAI / SillyTavern V2/V3' : 'TavernAI / SillyTavern',
      unmappedFields: Object.keys(unmappedFields).length > 0 ? unmappedFields : undefined,
      metadata,
    },
    data,
    options,
  );
}

/**
 * Parse a Chub AI character card.
 */
export function parseChubAICard(raw: unknown, options?: CharacterImportOptions): ImportedCharacter {
  // Chub AI uses essentially the same field layout as TavernAI
  // but we keep separate parsers for format-specific quirks
  const result = parseTavernAICard(raw, 'tavernai_v2', options);
  return {
    ...result,
    sourceFormat: 'chubai',
    sourcePreset: 'Chub AI',
  };
}

/**
 * Serialize unknown JSON into a single raw text asset so later steps can interpret it.
 */
export function parseGenericCharacter(
  raw: unknown,
  filename?: string,
  options?: CharacterImportOptions,
): ImportedCharacter {
  if (!isRecord(raw)) {
    throw new Error('Invalid character data: expected JSON object');
  }

  const data = flattenCardData(raw);
  const rawText = JSON.stringify(raw, null, 2);
  const lorebook = extractLorebookAssets(data);
  const nameCandidate =
    typeof data.name === 'string' && data.name.trim()
      ? data.name.trim()
      : typeof data.character_name === 'string' && data.character_name.trim()
        ? data.character_name.trim()
        : filename?.replace(/\.[^.]+$/, '') || 'Imported Character';

  return applyTemplateImportAliases(
    {
      name: nameCandidate,
      assets: {
        character_sheet: rawText,
        ...lorebook.assets,
      },
      sourceFormat: 'unknown',
      metadata: {
        character_name: nameCandidate,
      },
    },
    data,
    options,
  );
}

/**
 * Parse plain text content as a character sheet.
 */
export function parsePlainTextContent(text: string, filename?: string): ImportedCharacter {
  const nameMatch = text.match(/^name:\s*(.+)$/m);
  const name = nameMatch?.[1]?.trim() || filename?.replace(/\.[^.]+$/, '') || 'Imported Character';

  return {
    name,
    assets: {
      character_sheet: text,
    },
    sourceFormat: 'plain_text',
    metadata: {
      character_name: name,
    },
  };
}

// ============================================================================
// Main Entry Point
// ============================================================================

/**
 * Safely parse a JSON object without throwing.
 * Returns null if the data is not a valid JSON object.
 */
function safeParseJson(text: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (isRecord(parsed)) return parsed;
    // Also check for array — not a character card
    return null;
  } catch {
    return null;
  }
}

/**
 * Safely parse any JSON value (including arrays) without throwing.
 */
function safeParseJsonValue(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Auto-detect format and parse a character from raw data.
 * Never throws — always falls back to plain text if structured parsing fails.
 *
 * @param data - Raw file content (string for JSON/text, ArrayBuffer for PNG)
 * @param filename - Original filename for format hint
 * @returns Parsed character data
 */
export function detectAndParseCharacter(
  data: string | ArrayBuffer,
  filename?: string,
  options?: CharacterImportOptions,
): ImportedCharacter {
  // Handle PNG files (ArrayBuffer)
  if (data instanceof ArrayBuffer) {
    if (data.byteLength > 0) {
      const jsonStr = extractPngCharaChunk(data);
      if (jsonStr) {
        const jsonData = safeParseJsonValue(jsonStr);
        if (jsonData && isRecord(jsonData)) {
          try {
            const format = detectJsonFormat(jsonData);
            const result =
              format === 'chubai'
                ? parseChubAICard(jsonData, options)
                : format !== 'unknown'
                  ? parseTavernAICard(jsonData, format === 'tavernai_v2' ? 'tavernai_v2' : 'tavernai_v1', options)
                  : parseGenericCharacter(jsonData, filename, options);
            const nextAssets = { ...result.assets };
            if (!nextAssets.card_image) {
              nextAssets.card_image = pngBytesToDataUrl(new Uint8Array(data));
            }
            return { ...result, assets: nextAssets, sourceFormat: 'png_card' };
          } catch {
            // Structured parse failed; fall through to plain text
          }
        }
        // Could not parse JSON from the embedded data — treat as raw text
        return parsePlainTextContent(jsonStr, filename);
      }
      // No chara chunk found — try to read the file as raw text if possible
      return parsePlainTextContent(
        `[Binary PNG file: ${filename || 'unknown'} — no embedded character card found]`,
        filename,
      );
    }
  }

  // Handle string data
  if (typeof data !== 'string') {
    return parsePlainTextContent(`[Unsupported data format]`, filename);
  }

  const trimmed = data.trim();
  if (!trimmed) {
    return parsePlainTextContent(`[Empty file]`, filename);
  }

  // Try JSON parsing first
  const jsonObj = safeParseJson(trimmed);

  if (jsonObj) {
    // It's a valid JSON object — try structured parsing
    try {
      const format = detectJsonFormat(jsonObj);

      switch (format) {
        case 'tavernai_v1':
          return parseTavernAICard(jsonObj, 'tavernai_v1', options);
        case 'tavernai_v2':
          return parseTavernAICard(jsonObj, 'tavernai_v2', options);
        case 'chubai':
          return parseChubAICard(jsonObj, options);
        case 'unknown':
        default:
          return parseGenericCharacter(jsonObj, filename, options);
      }
    } catch {
      // Structured parsing failed — fall through to plain text
    }
  }

  // Not valid JSON, or structured parsing failed — treat as plain text
  return parsePlainTextContent(trimmed, filename);
}

/**
 * Format an ImportedCharacterFormat into a human-readable label.
 */
export function formatSourceLabel(format: ImportedCharacterFormat): string {
  switch (format) {
    case 'tavernai_v1':
      return 'TavernAI v1';
    case 'tavernai_v2':
      return 'TavernAI v2 / SillyTavern';
    case 'chubai':
      return 'Chub AI';
    case 'png_card':
      return 'PNG Character Card';
    case 'plain_text':
      return 'Plain Text';
    case 'unknown':
    default:
      return 'Unknown Format';
  }
}
