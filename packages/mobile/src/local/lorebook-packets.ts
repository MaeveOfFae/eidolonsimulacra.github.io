import {
  buildLorebookPacketRecord,
  extractLorebookPacketSourceDrafts,
  mergeLorebookPacket,
  normalizeLorebookPackets,
  removeLorebookPacket,
  type LorebookPacketSaveInput,
  type SavedLorebookPacketRecord,
} from '@char-gen/shared';

const LOREBOOK_PACKETS_STORAGE_KEY = 'eidolon.mobile.lorebookPackets';

export {
  MAX_LOREBOOK_PACKETS,
  deriveLorebookPacketTitle,
  extractLorebookPacketSourceDrafts,
  getLorebookPacketFilename,
  normalizeLorebookPacketDraftIds,
  normalizeLorebookPackets,
  parseLorebookPacket,
  sortLorebookPackets,
} from '@char-gen/shared';

export type {
  LorebookPacketEntryType,
  ParsedLorebookPacket,
  ParsedLorebookPacketEntry,
  SavedLorebookPacketRecord,
} from '@char-gen/shared';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function getStorage(): StorageLike | null {
  const maybeStorage = globalThis as { localStorage?: StorageLike };
  return maybeStorage.localStorage ?? null;
}

/**
 * Mobile persists packets through the same `globalThis.localStorage` surface the
 * device config / content stores use (`expo-sqlite/localStorage/install`).
 */
function readLorebookPackets(): SavedLorebookPacketRecord[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(LOREBOOK_PACKETS_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    return normalizeLorebookPackets(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

function writeLorebookPackets(records: SavedLorebookPacketRecord[]): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(LOREBOOK_PACKETS_STORAGE_KEY, JSON.stringify(records));
}

export function listSavedLorebookPackets(): SavedLorebookPacketRecord[] {
  return readLorebookPackets();
}

export function saveLorebookPacket(input: LorebookPacketSaveInput): SavedLorebookPacketRecord[] {
  const content = input.content.trim();
  if (!content) {
    return readLorebookPackets();
  }

  const existing = readLorebookPackets();
  const record = buildLorebookPacketRecord({ ...input, content }, existing);
  const next = mergeLorebookPacket(record, existing);

  writeLorebookPackets(next);
  return next;
}

export function deleteLorebookPacket(id: string): SavedLorebookPacketRecord[] {
  const next = removeLorebookPacket(id, readLorebookPackets());
  writeLorebookPackets(next);
  return next;
}

export function importLorebookPacketText(input: {
  content: string;
  blueprintPath?: string;
  blueprintOverride?: string | null;
}): SavedLorebookPacketRecord[] {
  return saveLorebookPacket({
    content: input.content,
    draftIds: extractLorebookPacketSourceDrafts(input.content),
    blueprintPath: input.blueprintPath,
    blueprintOverride: input.blueprintOverride,
  });
}
