/**
 * Saved searches (smart collections) for the draft library.
 *
 * Follows the seed-favorites pattern: filter tuples persist through the
 * shared persistence layer (browser localStorage, desktop app data on
 * Tauri), records normalize through the shared contract, and a changed event
 * lets components react without prop drilling.
 */

import {
  createSavedSearchId,
  normalizeSavedSearchRecord,
  upsertSavedSearch,
  type DraftLibraryFilter,
  type SavedSearchRecord,
} from '@char-gen/shared';
import { readPersistedJson, writePersistedJson } from '../persistence/storage.js';

const SAVED_SEARCHES_STORAGE_KEY = 'eidolon.web.draftLibrary.savedSearches';

export const SAVED_SEARCHES_CHANGED_EVENT = 'eidolon:draft-library-saved-searches-changed';

function emitSavedSearchesChanged(records: SavedSearchRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SAVED_SEARCHES_CHANGED_EVENT, { detail: { count: records.length } }));
}

export function getSavedSearches(): SavedSearchRecord[] {
  const raw = readPersistedJson<unknown>(SAVED_SEARCHES_STORAGE_KEY, []);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => normalizeSavedSearchRecord(entry))
    .filter((entry): entry is SavedSearchRecord => entry !== null);
}

function writeSavedSearches(records: SavedSearchRecord[]): void {
  writePersistedJson(SAVED_SEARCHES_STORAGE_KEY, [], records);
  emitSavedSearchesChanged(records);
}

export function saveSavedSearch(name: string, filter: DraftLibraryFilter): SavedSearchRecord | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const record: SavedSearchRecord = {
    id: createSavedSearchId(),
    name: trimmed,
    filter,
    createdAt: new Date().toISOString(),
  };

  writeSavedSearches(upsertSavedSearch(getSavedSearches(), record));

  return record;
}

export function deleteSavedSearch(id: string): void {
  writeSavedSearches(getSavedSearches().filter((entry) => entry.id !== id));
}
