/**
 * Seed ideas (the idea board).
 *
 * Same pattern as saved searches and scenario presets: records persist
 * through the shared persistence layer and normalize through the shared
 * contract, with a changed event for live component updates.
 */

import {
  createSeedIdeaId,
  normalizeSeedIdeaRecord,
  normalizeTagList,
  upsertSeedIdea,
  type SeedIdeaRecord,
} from '@char-gen/shared';
import { readPersistedJson, writePersistedJson } from '../persistence/storage.js';

const SEED_IDEAS_STORAGE_KEY = 'eidolon.web.seedStudio.ideas';

export const SEED_IDEAS_CHANGED_EVENT = 'eidolon:seed-ideas-changed';

function emitSeedIdeasChanged(records: SeedIdeaRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SEED_IDEAS_CHANGED_EVENT, { detail: { count: records.length } }));
}

export function getSeedIdeas(): SeedIdeaRecord[] {
  const raw = readPersistedJson<unknown>(SEED_IDEAS_STORAGE_KEY, []);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((entry) => normalizeSeedIdeaRecord(entry)).filter((entry): entry is SeedIdeaRecord => entry !== null);
}

function writeSeedIdeas(records: SeedIdeaRecord[]): void {
  writePersistedJson(SEED_IDEAS_STORAGE_KEY, [], records);
  emitSeedIdeasChanged(records);
}

export interface SaveSeedIdeaInput {
  text: string;
  tags?: string[];
}

export function saveSeedIdea(input: SaveSeedIdeaInput): SeedIdeaRecord | null {
  const text = input.text.trim().replace(/\s+/g, ' ');
  if (!text) {
    return null;
  }

  const record: SeedIdeaRecord = {
    id: createSeedIdeaId(),
    text,
    tags: normalizeTagList(input.tags),
    createdAt: new Date().toISOString(),
  };

  writeSeedIdeas(upsertSeedIdea(getSeedIdeas(), record));

  return record;
}

export function deleteSeedIdea(id: string): void {
  writeSeedIdeas(getSeedIdeas().filter((entry) => entry.id !== id));
}
