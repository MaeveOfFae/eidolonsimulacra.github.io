/**
 * Reading a raw card: the field readers, the Eidolon extension, and the asset builders every format shares.
 *
 * Split out of `character-parser.ts`, which is now a barrel over these modules.
 */
import type { CharacterCardMetadata, DraftMetadata } from '../../types';
import { unwrapContent } from './field-mapping';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const EIDOLON_EXTENSION_KEYS = ['eidolon', 'eidolon_simulacra', 'eidolonsimulacra'] as const;

export function readString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

export function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function cloneJsonValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
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

export function readCardMetadataRecord(value: unknown): CharacterCardMetadata | undefined {
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

export function readCardCandidates(data: Record<string, unknown>): Record<string, unknown>[] {
  return isRecord(data.data) ? [data, data.data] : [data];
}

export function hasCardSpec(data: Record<string, unknown>): boolean {
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

export function readEidolonExtension(data: Record<string, unknown>): Record<string, unknown> | null {
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

export function hasChubSignals(data: Record<string, unknown>): boolean {
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

export function extractEidolonAssets(data: Record<string, unknown>): Record<string, string> {
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

export function extractImportedMetadata(
  data: Record<string, unknown>,
  name: string,
): Partial<DraftMetadata> | undefined {
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

export function buildCharacterSheetAsset(data: Record<string, unknown>): string | null {
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

export function buildPostHistoryAsset(data: Record<string, unknown>): string | null {
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

export function buildIntroSceneAsset(data: Record<string, unknown>): string | null {
  const firstMes = readString(data.first_mes);
  if (firstMes) {
    return firstMes;
  }

  const alternateGreetings = readStringArray(data.alternate_greetings);
  return alternateGreetings[0] ?? null;
}
