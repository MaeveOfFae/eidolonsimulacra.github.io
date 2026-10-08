/**
 * Browser storage adapter for lorebook packets.
 *
 * The packet format, every pure helper, and the read/write/save/delete/import
 * logic live in `@char-gen/shared` (`lorebook-packets`), so web and mobile share
 * one `createLorebookPacketStore` factory instead of two near-identical adapters.
 * This module only supplies web's `localStorage` accessor and storage key.
 */

import {
  createLorebookPacketStore,
  type LorebookPacketImportInput,
  type LorebookPacketSaveInput,
  type LorebookPacketStorageLike,
  type SavedLorebookPacketRecord,
} from '@char-gen/shared';

const LOREBOOK_PACKETS_STORAGE_KEY = 'eidolon.web.lorebookPackets';

export {
  MAX_LOREBOOK_PACKETS,
  createLorebookPacketId,
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

const store = createLorebookPacketStore({
  storageKey: LOREBOOK_PACKETS_STORAGE_KEY,
  getStorage: (): LorebookPacketStorageLike | null =>
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined' ? window.localStorage : null,
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
