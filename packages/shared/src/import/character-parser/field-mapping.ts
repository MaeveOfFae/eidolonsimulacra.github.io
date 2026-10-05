/**
 * Format detection, the TavernAI field map and reverse mapping, and the lorebook and template-alias formatting that turns card fields into assets.
 *
 * Split out of `character-parser.ts`, which is now a barrel over these modules.
 */
import type { CharacterImportOptions, ExportPreset, ImportedCharacter, ImportedCharacterFormat } from '../../types';
import { hasCardSpec, hasChubSignals, isRecord, readCardCandidates, readString, readStringArray } from './card-readers';

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
export const TAVERNAI_FIELD_MAP: Record<string, string> = {
  description: 'character_sheet',
  personality: 'system_prompt',
  first_mes: 'intro_scene',
  mes_example: 'post_history',
  scenario: 'creator_notes',
};

export const LOREBOOK_SOURCE_KEYS = ['character_book', 'lorebook', 'world_info'] as const;

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
export function unwrapContent(content: string, wrapper?: string): string {
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

export function stringifyUnknown(value: unknown): string | null {
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

export function formatLorebookEntry(entry: unknown, index: number): string | null {
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

export function formatLorebookSource(label: string, value: unknown): string | null {
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

export function extractLorebookAssets(data: Record<string, unknown>): {
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
export function flattenCardData(raw: Record<string, unknown>): Record<string, unknown> {
  // If there's a "data" key that's an object, prefer it
  if (isRecord(raw.data)) {
    return { ...raw.data };
  }
  return raw;
}

export function getValueAtImportPath(data: Record<string, unknown>, importPath: string): unknown {
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

export function formatImportedAliasValue(alias: string, value: unknown): string | null {
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

export function getDefaultAssetNamesForImportAlias(alias: string, data: Record<string, unknown>): string[] {
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

export function applyTemplateImportAliases(
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
