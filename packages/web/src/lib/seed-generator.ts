import type { SeedGenerationRequest } from '@char-gen/shared';
import { serverClient, type SyncedSeedRecord } from './server/client.js';

import seedGenerationPrompt from '../../../../blueprints/system/seed_generator.md?raw';

export interface SeedSuggestionPreset {
  id: string;
  label: string;
  genreLines: string;
}

export type SeedCoverageMode = 'per-genre' | 'blended';

export interface SeedGeneratorControls {
  count: number;
  coverageMode: SeedCoverageMode;
}

export interface SeedRunRecord {
  id: string;
  createdAt: string;
  request: {
    genreLines: string;
    count: number;
    coverageMode: SeedCoverageMode;
    surpriseMode: boolean;
    presetId?: string;
  };
  seeds: string[];
}

export interface FavoriteSeedRecord {
  seed: string;
  addedAt: string;
  lastUsedAt?: string;
}

const SEED_HISTORY_STORAGE_KEY = 'eidolon.web.seedGenerator.history';
const LEGACY_SEED_HISTORY_STORAGE_KEYS = ['bpui.web.seedGenerator.history'];
const SEED_FAVORITES_STORAGE_KEY = 'eidolon.web.seedGenerator.favorites';
const LEGACY_SEED_FAVORITES_STORAGE_KEYS = ['bpui.web.seedGenerator.favorites'];
const SEED_FAVORITES_SYNC_STATE_STORAGE_KEY = 'eidolon.web.seedGenerator.favorites.syncState';
const MAX_SEED_HISTORY = 12;
export const DEFAULT_SEED_COUNT = 12;
export const SEED_FAVORITES_CHANGED_EVENT = 'seed-favorites-changed';

interface FavoriteSeedSyncState {
  lastChangedAt?: string;
  lastSyncedAt?: string;
}

interface WriteFavoriteSeedsOptions {
  markChanged?: boolean;
  markSynced?: boolean;
  timestamp?: string;
}

function readStorage<T>(keys: string | readonly string[], fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const keyList = Array.isArray(keys) ? [...keys] : [keys];
  const [currentKey, ...legacyKeys] = keyList;

  try {
    for (const key of keyList) {
      const raw = window.localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as T;
      if (key !== currentKey) {
        window.localStorage.setItem(currentKey, JSON.stringify(parsed));
        legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
      }

      return parsed;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function writeStorage<T>(key: string, legacyKeys: readonly string[], value: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
  legacyKeys.forEach((legacyKey) => window.localStorage.removeItem(legacyKey));
}

function emitFavoriteSeedsChanged(favorites: FavoriteSeedRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SEED_FAVORITES_CHANGED_EVENT, {
    detail: { count: favorites.length },
  }));
}

function toIsoString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function normalizeFavoriteSeedRecord(value: unknown): FavoriteSeedRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const seed = typeof record.seed === 'string' ? record.seed.trim() : '';
  if (!seed) {
    return null;
  }

  const addedAt = toIsoString(record.addedAt) ?? new Date().toISOString();
  const lastUsedAt = toIsoString(record.lastUsedAt);

  return lastUsedAt ? { seed, addedAt, lastUsedAt } : { seed, addedAt };
}

function normalizeFavoriteSeeds(records: readonly unknown[]): FavoriteSeedRecord[] {
  const deduped = new Map<string, FavoriteSeedRecord>();

  for (const record of records) {
    const normalized = normalizeFavoriteSeedRecord(record);
    if (!normalized) {
      continue;
    }

    deduped.set(normalized.seed, normalized);
  }

  return Array.from(deduped.values()).sort((left, right) => {
    const leftTime = Date.parse(left.lastUsedAt ?? left.addedAt);
    const rightTime = Date.parse(right.lastUsedAt ?? right.addedAt);
    return rightTime - leftTime;
  });
}

function readFavoriteSeedSyncState(): FavoriteSeedSyncState {
  return readStorage<FavoriteSeedSyncState>(SEED_FAVORITES_SYNC_STATE_STORAGE_KEY, {});
}

function writeFavoriteSeedSyncState(state: FavoriteSeedSyncState): void {
  writeStorage(SEED_FAVORITES_SYNC_STATE_STORAGE_KEY, [], state);
}

function writeFavoriteSeeds(favorites: FavoriteSeedRecord[], options: WriteFavoriteSeedsOptions = {}): FavoriteSeedRecord[] {
  const { markChanged = true, markSynced = false, timestamp = new Date().toISOString() } = options;
  const normalized = normalizeFavoriteSeeds(favorites);
  writeStorage(SEED_FAVORITES_STORAGE_KEY, LEGACY_SEED_FAVORITES_STORAGE_KEYS, normalized);

  const nextSyncState = readFavoriteSeedSyncState();
  if (markChanged) {
    nextSyncState.lastChangedAt = timestamp;
  }
  if (markSynced) {
    nextSyncState.lastSyncedAt = timestamp;
  }
  writeFavoriteSeedSyncState(nextSyncState);

  emitFavoriteSeedsChanged(normalized);
  return normalized;
}

const SURPRISE_PRESETS: SeedSuggestionPreset[] = [
  {
    id: 'noir-romance',
    label: 'Noir Pressure',
    genreLines: 'noir:debt, surveillance, intimacy, slow-burn\nromance:realism, asymmetry, messy loyalty, after-hours',
  },
  {
    id: 'grounded-sf',
    label: 'Grounded Sci-Fi',
    genreLines: 'sci-fi:grounded, labor, proximity, bureaucracy\nromance:subtext, contracts, withheld tenderness',
  },
  {
    id: 'low-magic',
    label: 'Low Magic',
    genreLines: 'fantasy:low-magic, domestic, obligation, village politics\nromance:restraint, longing, practical intimacy',
  },
  {
    id: 'urban-horror',
    label: 'Urban Horror',
    genreLines: 'horror:grounded, neighborhood, debt, body unease\nthriller:secrecy, leverage, false safety',
  },
  {
    id: 'moreau',
    label: 'Moreau',
    genreLines: 'romance:moreau, realism, stigma, protective tension\nurban fantasy:morphosis, nightlife, consent ethic, social friction',
  },
];

function stripFence(line: string): string {
  return line.replace(/^```+/, '').replace(/```+$/, '').trim();
}

function normalizeSeedLine(line: string): string {
  return stripFence(line)
    .replace(/^[-*•]\s+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/^seed\s*:\s*/i, '')
    .trim();
}

export function getSeedSuggestionPresets(): SeedSuggestionPreset[] {
  return SURPRISE_PRESETS;
}

export function pickSurpriseSeedPreset(): SeedSuggestionPreset {
  return SURPRISE_PRESETS[Math.floor(Math.random() * SURPRISE_PRESETS.length)]!;
}

export function sanitizeSeedCount(value: number): number {
  return Math.min(30, Math.max(5, Math.round(value || DEFAULT_SEED_COUNT)));
}

export function buildSeedGenerationLines(
  genreLines: string,
  controls: SeedGeneratorControls
): string {
  const cleaned = genreLines
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const controlLines = [`count=${sanitizeSeedCount(controls.count)}`, controls.coverageMode];
  return [...controlLines, ...cleaned].join('\n');
}

export function resolveSeedGenerationInput(request: SeedGenerationRequest): {
  genreLines: string;
  sourcePreset?: SeedSuggestionPreset;
} {
  const cleaned = request.genre_lines
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');

  if (request.surprise_mode || !cleaned) {
    const preset = pickSurpriseSeedPreset();
    return {
      genreLines: preset.genreLines,
      sourcePreset: preset,
    };
  }

  return { genreLines: cleaned };
}

export function buildSeedGeneratorSystemPrompt(): string {
  return seedGenerationPrompt.trim();
}

export function parseSeedGenerationResponse(content: string): string[] {
  const lines = content
    .split('\n')
    .map(normalizeSeedLine)
    .filter((line) => line.length > 0)
    .filter((line) => !/^#+\s*/.test(line))
    .filter((line) => !/^output to\s+/i.test(line))
    .filter((line) => !/^no headings/i.test(line));

  return [...new Set(lines)].filter((line) => line.length <= 180);
}

export function getSeedRunHistory(): SeedRunRecord[] {
  return readStorage<SeedRunRecord[]>([SEED_HISTORY_STORAGE_KEY, ...LEGACY_SEED_HISTORY_STORAGE_KEYS], []);
}

export function saveSeedRun(record: Omit<SeedRunRecord, 'id' | 'createdAt'>): SeedRunRecord[] {
  const nextEntry: SeedRunRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const history = [nextEntry, ...getSeedRunHistory()].slice(0, MAX_SEED_HISTORY);
  writeStorage(SEED_HISTORY_STORAGE_KEY, LEGACY_SEED_HISTORY_STORAGE_KEYS, history);
  return history;
}

export function getFavoriteSeeds(): FavoriteSeedRecord[] {
  const stored = readStorage<FavoriteSeedRecord[]>([SEED_FAVORITES_STORAGE_KEY, ...LEGACY_SEED_FAVORITES_STORAGE_KEYS], []);
  return normalizeFavoriteSeeds(stored);
}

export function parseFavoriteSeedsPayload(data: unknown): FavoriteSeedRecord[] | null {
  if (Array.isArray(data)) {
    return normalizeFavoriteSeeds(data);
  }

  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const record = data as { seeds?: SyncedSeedRecord[] };
  if (!Array.isArray(record.seeds)) {
    return null;
  }

  return normalizeFavoriteSeeds(record.seeds);
}

export function replaceFavoriteSeeds(favorites: readonly FavoriteSeedRecord[]): FavoriteSeedRecord[] {
  return writeFavoriteSeeds([...favorites]);
}

export function replaceFavoriteSeedsFromServer(favorites: readonly FavoriteSeedRecord[]): FavoriteSeedRecord[] {
  return writeFavoriteSeeds([...favorites], {
    markChanged: false,
    markSynced: true,
  });
}

export function markFavoriteSeedsSynced(timestamp = new Date().toISOString()): void {
  const nextSyncState = readFavoriteSeedSyncState();
  nextSyncState.lastSyncedAt = timestamp;
  writeFavoriteSeedSyncState(nextSyncState);
}

export function favoriteSeedsNeedSync(): boolean {
  const { lastChangedAt, lastSyncedAt } = readFavoriteSeedSyncState();
  if (!lastChangedAt) {
    return false;
  }

  if (!lastSyncedAt) {
    return true;
  }

  return Date.parse(lastChangedAt) > Date.parse(lastSyncedAt);
}

export async function hydrateFavoriteSeedsFromServer(): Promise<FavoriteSeedRecord[] | null> {
  if (!serverClient.isEnabled()) {
    return null;
  }

  const status = await serverClient.checkStatus();
  if (!status.authenticated) {
    return null;
  }

  if (favoriteSeedsNeedSync()) {
    const favorites = getFavoriteSeeds();
    await serverClient.syncSeeds('push', { seeds: favorites });
    markFavoriteSeedsSynced();
    return favorites;
  }

  const payload = await serverClient.syncSeeds('pull') as { seeds?: SyncedSeedRecord[] };
  const favorites = parseFavoriteSeedsPayload(payload);
  if (!favorites) {
    return null;
  }

  return replaceFavoriteSeedsFromServer(favorites);
}

export function isFavoriteSeed(seed: string): boolean {
  return getFavoriteSeeds().some((entry) => entry.seed === seed);
}

export function toggleFavoriteSeed(seed: string): FavoriteSeedRecord[] {
  const favorites = getFavoriteSeeds();
  const index = favorites.findIndex((entry) => entry.seed === seed);

  if (index >= 0) {
    const nextFavorites = favorites.filter((entry) => entry.seed !== seed);
    return writeFavoriteSeeds(nextFavorites);
  }

  const nextFavorites = [
    {
      seed,
      addedAt: new Date().toISOString(),
    },
    ...favorites,
  ];
  return writeFavoriteSeeds(nextFavorites);
}

export function markSeedUsed(seed: string): FavoriteSeedRecord[] {
  const now = new Date().toISOString();
  const favorites = getFavoriteSeeds();
  const nextFavorites = favorites.map((entry) => (
    entry.seed === seed ? { ...entry, lastUsedAt: now } : entry
  ));
  return writeFavoriteSeeds(nextFavorites);
}