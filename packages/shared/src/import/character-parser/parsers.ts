/**
 * The per-format parsers — TavernAI, Chub AI, generic JSON and plain text — plus the entry point that detects and dispatches.
 *
 * Split out of `character-parser.ts`, which is now a barrel over these modules.
 */
import type { CharacterImportOptions, ImportedCharacter, ImportedCharacterFormat } from '../../types';
import { extractPngCharaChunk, parseEmbeddedPngBytes, pngBytesToDataUrl } from '../../png-card';
import { OFFICIAL_TEMPLATE, normalizeAssetName, normalizeAssetNameList, normalizeAssetRecord } from '../../templates';
import {
  buildCharacterSheetAsset,
  buildIntroSceneAsset,
  buildPostHistoryAsset,
  extractEidolonAssets,
  extractImportedMetadata,
  isRecord,
  readString,
  readStringArray,
} from './card-readers';
import {
  TAVERNAI_FIELD_MAP,
  applyTemplateImportAliases,
  detectJsonFormat,
  extractLorebookAssets,
  flattenCardData,
  stringifyUnknown,
  unwrapContent,
} from './field-mapping';

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
export function safeParseJson(text: string): Record<string, unknown> | null {
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
export function safeParseJsonValue(text: string): unknown {
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
