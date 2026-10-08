import {
  createLorebookPacketStore,
  type LorebookPacketImportInput,
  type LorebookPacketSaveInput,
  type LorebookPacketStorageLike,
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

/**
 * Mobile persists packets through the same `globalThis.localStorage` surface the
 * device config / content stores use (`expo-sqlite/localStorage/install`), so it
 * shares the `@char-gen/shared` packet store with the web adapter and supplies
 * only its own storage accessor and key.
 */
const store = createLorebookPacketStore({
  storageKey: LOREBOOK_PACKETS_STORAGE_KEY,
  getStorage: (): LorebookPacketStorageLike | null =>
    (globalThis as { localStorage?: LorebookPacketStorageLike }).localStorage ?? null,
});

export function listSavedLorebookPackets(): SavedLorebookPacketRecord[] {
  return store.list();
}

export function saveLorebookPacket(input: LorebookPacketSaveInput): SavedLorebookPacketRecord[] {
  return store.save(input);
}

export function deleteLorebookPacket(id: string): SavedLorebookPacketRecord[] {
  return store.delete(id);
}

export function importLorebookPacketText(input: LorebookPacketImportInput): SavedLorebookPacketRecord[] {
  return store.importText(input);
}
