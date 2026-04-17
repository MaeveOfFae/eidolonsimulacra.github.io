/**
 * Character Card Import Parser
 *
 * Parses external character card formats (TavernAI/SillyTavern v1/v2, Chub AI,
 * PNG-embedded cards) and maps their fields back to internal draft assets using
 * the reverse of the export preset field mappings.
 */

import type {
  ImportedCharacter,
  ImportedCharacterFormat,
  ExportPreset,
} from '../types';

// ============================================================================
// Format Detection
// ============================================================================

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Detect the format of a parsed JSON character card.
 */
export function detectJsonFormat(data: unknown): ImportedCharacterFormat {
  if (!isRecord(data)) return 'unknown';

  // TavernAI v2 has explicit spec field
  if (data.spec === 'chara_card_v2' || data.spec_version === '2.0') {
    return 'tavernai_v2';
  }

  // TavernAI v2 wraps data under "data" key
  if (isRecord(data.data) && (data.data.spec === 'chara_card_v2' || data.data.spec_version === '2.0')) {
    return 'tavernai_v2';
  }

  // Chub AI typically has a specific structure
  if (typeof data.creator_notes === 'string' && typeof data.first_mes === 'string' && typeof data.description === 'string') {
    // Could be either Chub or TavernAI v1 — check for Chub-specific fields
    if (Array.isArray(data.tags) && typeof data.creator === 'string') {
      // Has Chub-like metadata but also TavernAI fields; treat as tavernai_v1
      // since the field layout is compatible
      return 'tavernai_v1';
    }
  }

  // TavernAI v1: has name + description + first_mes at top level
  if (
    typeof data.name === 'string' &&
    typeof data.description === 'string' &&
    typeof data.first_mes === 'string'
  ) {
    return 'tavernai_v1';
  }

  // Check if data is wrapped under "data" (common in various card formats)
  if (isRecord(data.data)) {
    const inner = data.data;
    if (
      typeof inner.name === 'string' &&
      typeof inner.description === 'string'
    ) {
      return 'tavernai_v1';
    }
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
// PNG Character Card Extraction
// ============================================================================

/**
 * Decode a Uint8Array of ASCII bytes to a string without TextDecoder.
 */
function decodeAscii(bytes: Uint8Array): string {
  let result = '';
  for (let i = 0; i < bytes.length; i++) {
    result += String.fromCharCode(bytes[i]);
  }
  return result;
}

/**
 * Base64 character set for decoding.
 */
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * Decode a base64 string to a UTF-8 string without relying on atob.
 */
function decodeBase64(base64: string): string | null {
  try {
    // Strip whitespace/padding
    const cleaned = base64.replace(/[\s=]+/g, '');
    const len = cleaned.length;

    if (len % 4 !== 0) return null;

    const bytes: number[] = [];
    let i = 0;

    while (i < len) {
      const b0 = BASE64_CHARS.indexOf(cleaned[i]);
      const b1 = BASE64_CHARS.indexOf(cleaned[i + 1]);
      const b2 = BASE64_CHARS.indexOf(cleaned[i + 2]);
      const b3 = BASE64_CHARS.indexOf(cleaned[i + 3]);

      if (b0 === -1 || b1 === -1) return null;

      bytes.push((b0 << 2) | (b1 >> 4));
      if (b2 !== -1) bytes.push(((b1 & 0x0F) << 4) | (b2 >> 2));
      if (b3 !== -1) bytes.push(((b2 & 0x03) << 6) | b3);

      i += 4;
    }

    return decodeAscii(new Uint8Array(bytes));
  } catch {
    return null;
  }
}

/**
 * Extract the `chara` tEXt chunk from a PNG ArrayBuffer.
 * TavernAI/SillyTavern embed character data as base64-encoded JSON in the tEXt chunk.
 */
export function extractPngCharaChunk(buffer: ArrayBuffer): string | null {
  const view = new DataView(buffer);
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];

  // Verify PNG signature
  for (let i = 0; i < 8; i++) {
    if (view.getUint8(i) !== signature[i]) {
      return null;
    }
  }

  let offset = 8;
  const bytes = new Uint8Array(buffer);

  while (offset < bytes.length) {
    const chunkLength = view.getUint32(offset);
    const chunkType = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );

    if (chunkType === 'tEXt') {
      // tEXt chunk: keyword (null-terminated) + text data
      const chunkData = bytes.slice(offset + 8, offset + 8 + chunkLength);
      const nullIndex = chunkData.indexOf(0);

      if (nullIndex !== -1) {
        const keyword = decodeAscii(chunkData.slice(0, nullIndex));

        if (keyword === 'chara') {
          const textData = chunkData.slice(nullIndex + 1);
          const base64Str = decodeAscii(textData);

          return decodeBase64(base64Str);
        }
      }
    }

    // Move to next chunk: 4 (length) + 4 (type) + chunkLength + 4 (CRC)
    offset += 12 + chunkLength;

    if (chunkType === 'IEND') break;
  }

  return null;
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
  scenario: 'intro_page',
};

const CHUBAI_FIELD_MAP: Record<string, string> = {
  description: 'character_sheet',
  personality: 'system_prompt',
  first_mes: 'intro_scene',
  mes_example: 'post_history',
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
  if (!wrapper) return content;

  // Common wrapper pattern: <START>\n...{{char}}: {{content}} or similar
  // Try to find the content after the last {{char}}: or {{content}} placeholder
  const charPatterns = [
    /\{\{char\}\}:\s*/g,
    /<START>/gi,
  ];

  // If the wrapper contains <START>, try to strip it
  if (wrapper.includes('<START>')) {
    // Remove <START> prefix lines
    const lines = content.split('\n');
    const startIndex = lines.findIndex(line =>
      line.trim().toLowerCase() === '<start>' ||
      line.trim().startsWith('{{user}}:') ||
      line.trim().startsWith('{{char}}:')
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

  return content;
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

  const title = typeof entry.name === 'string' && entry.name.trim()
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

  const content = typeof entry.content === 'string' && entry.content.trim()
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

  const heading = typeof value.name === 'string' && value.name.trim()
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

function extractLorebookAssets(data: Record<string, unknown>): { assets: Record<string, string>; sourceKeys: string[] } {
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

/**
 * Parse a TavernAI v1 or v2 character card.
 */
export function parseTavernAICard(raw: unknown): ImportedCharacter {
  if (!isRecord(raw)) {
    throw new Error('Invalid TavernAI card: expected JSON object');
  }

  const data = flattenCardData(raw);
  const assets: Record<string, string> = {};
  const unmappedFields: Record<string, string> = {};
  const lorebook = extractLorebookAssets(data);

  // Extract character name
  const name = typeof data.name === 'string' ? data.name.trim() : 'Imported Character';

  // Map known fields to internal assets
  for (const [externalField, internalAsset] of Object.entries(TAVERNAI_FIELD_MAP)) {
    const value = data[externalField];
    if (typeof value === 'string' && value.trim()) {
      assets[internalAsset] = unwrapContent(value.trim());
    }
  }

  Object.assign(assets, lorebook.assets);

  // Collect unmapped fields for reference
  const mappedKeys = new Set([...Object.keys(TAVERNAI_FIELD_MAP), ...lorebook.sourceKeys]);
  const skipKeys = new Set(['name', 'spec', 'spec_version', 'data']);

  for (const [key, value] of Object.entries(data)) {
    if (skipKeys.has(key) || mappedKeys.has(key)) continue;
    if (typeof value === 'string' && value.trim()) {
      unmappedFields[key] = value.trim();
    } else if (Array.isArray(value) && value.length > 0) {
      unmappedFields[key] = JSON.stringify(value);
    }
  }

  return {
    name,
    assets,
    sourceFormat: 'tavernai_v1',
    sourcePreset: 'TavernAI / SillyTavern',
    unmappedFields: Object.keys(unmappedFields).length > 0 ? unmappedFields : undefined,
  };
}

/**
 * Parse a Chub AI character card.
 */
export function parseChubAICard(raw: unknown): ImportedCharacter {
  // Chub AI uses essentially the same field layout as TavernAI
  // but we keep separate parsers for format-specific quirks
  const result = parseTavernAICard(raw);
  return {
    ...result,
    sourceFormat: 'chubai',
    sourcePreset: 'Chub AI',
  };
}

/**
 * Serialize unknown JSON into a single raw text asset so later steps can interpret it.
 */
export function parseGenericCharacter(raw: unknown, filename?: string): ImportedCharacter {
  if (!isRecord(raw)) {
    throw new Error('Invalid character data: expected JSON object');
  }

  const data = flattenCardData(raw);
  const rawText = JSON.stringify(raw, null, 2);
  const lorebook = extractLorebookAssets(data);
  const nameCandidate = typeof data.name === 'string' && data.name.trim()
    ? data.name.trim()
    : typeof data.character_name === 'string' && data.character_name.trim()
      ? data.character_name.trim()
      : filename?.replace(/\.[^.]+$/, '') || 'Imported Character';

  return {
    name: nameCandidate,
    assets: {
      character_sheet: rawText,
      ...lorebook.assets,
    },
    sourceFormat: 'unknown',
  };
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
            const result = format === 'chubai'
              ? parseChubAICard(jsonData)
              : format !== 'unknown'
                ? parseTavernAICard(jsonData)
                : parseGenericCharacter(jsonData, filename);
            return { ...result, sourceFormat: 'png_card' };
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
    return parsePlainTextContent(
      `[Unsupported data format]`,
      filename,
    );
  }

  const trimmed = data.trim();
  if (!trimmed) {
    return parsePlainTextContent(
      `[Empty file]`,
      filename,
    );
  }

  // Try JSON parsing first
  const jsonObj = safeParseJson(trimmed);

  if (jsonObj) {
    // It's a valid JSON object — try structured parsing
    try {
      const format = detectJsonFormat(jsonObj);

      switch (format) {
        case 'tavernai_v1':
          return parseTavernAICard(jsonObj);
        case 'tavernai_v2':
          return parseTavernAICard(jsonObj);
        case 'chubai':
          return parseChubAICard(jsonObj);
        case 'unknown':
        default:
          return parseGenericCharacter(jsonObj, filename);
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