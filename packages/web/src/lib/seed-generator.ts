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
  archivedAt?: string;
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
  archivedAt?: string;
}

const SEED_HISTORY_STORAGE_KEY = 'eidolon.web.seedGenerator.history';
const LEGACY_SEED_HISTORY_STORAGE_KEYS = ['bpui.web.seedGenerator.history'];
const SEED_FAVORITES_STORAGE_KEY = 'eidolon.web.seedGenerator.favorites';
const LEGACY_SEED_FAVORITES_STORAGE_KEYS = ['bpui.web.seedGenerator.favorites'];
const SEED_FAVORITES_SYNC_STATE_STORAGE_KEY = 'eidolon.web.seedGenerator.favorites.syncState';
const ARCHIVED_SEED_RUNS_SYNC_STATE_STORAGE_KEY = 'eidolon.web.seedGenerator.archivedSeedRuns.syncState';
const MAX_SEED_HISTORY = 12;
export const DEFAULT_SEED_COUNT = 12;
export const SEED_FAVORITES_CHANGED_EVENT = 'seed-favorites-changed';
export const SEED_HISTORY_CHANGED_EVENT = 'seed-history-changed';

interface FavoriteSeedSyncState {
  lastChangedAt?: string;
  lastSyncedAt?: string;
}

interface WriteFavoriteSeedsOptions {
  markChanged?: boolean;
  markSynced?: boolean;
  timestamp?: string;
}

interface WriteSeedRunHistoryOptions {
  markArchivedChanged?: boolean;
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

function emitSeedHistoryChanged(history: SeedRunRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SEED_HISTORY_CHANGED_EVENT, {
    detail: { count: history.filter((entry) => !entry.archivedAt).length },
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
  const archivedAt = toIsoString(record.archivedAt);

  const normalized: FavoriteSeedRecord = { seed, addedAt };
  if (lastUsedAt) {
    normalized.lastUsedAt = lastUsedAt;
  }
  if (archivedAt) {
    normalized.archivedAt = archivedAt;
  }

  return normalized;
}

function compareFavoriteSeedActivity(left: FavoriteSeedRecord, right: FavoriteSeedRecord): number {
  const leftTime = Date.parse(left.lastUsedAt ?? left.addedAt);
  const rightTime = Date.parse(right.lastUsedAt ?? right.addedAt);
  return rightTime - leftTime;
}

function compareArchivedFavoriteSeeds(left: FavoriteSeedRecord, right: FavoriteSeedRecord): number {
  const leftTime = Date.parse(left.archivedAt ?? left.lastUsedAt ?? left.addedAt);
  const rightTime = Date.parse(right.archivedAt ?? right.lastUsedAt ?? right.addedAt);
  return rightTime - leftTime;
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
    if (left.archivedAt || right.archivedAt) {
      return compareArchivedFavoriteSeeds(left, right);
    }

    return compareFavoriteSeedActivity(left, right);
  });
}

function readFavoriteSeedSyncState(): FavoriteSeedSyncState {
  return readStorage<FavoriteSeedSyncState>(SEED_FAVORITES_SYNC_STATE_STORAGE_KEY, {});
}

function writeFavoriteSeedSyncState(state: FavoriteSeedSyncState): void {
  writeStorage(SEED_FAVORITES_SYNC_STATE_STORAGE_KEY, [], state);
}

function readArchivedSeedRunSyncState(): FavoriteSeedSyncState {
  return readStorage<FavoriteSeedSyncState>(ARCHIVED_SEED_RUNS_SYNC_STATE_STORAGE_KEY, {});
}

function writeArchivedSeedRunSyncState(state: FavoriteSeedSyncState): void {
  writeStorage(ARCHIVED_SEED_RUNS_SYNC_STATE_STORAGE_KEY, [], state);
}

export function getAllFavoriteSeeds(): FavoriteSeedRecord[] {
  const stored = readStorage<FavoriteSeedRecord[]>([SEED_FAVORITES_STORAGE_KEY, ...LEGACY_SEED_FAVORITES_STORAGE_KEYS], []);
  return normalizeFavoriteSeeds(stored);
}

function getActiveFavoriteSeeds(records: readonly FavoriteSeedRecord[]): FavoriteSeedRecord[] {
  return [...records]
    .filter((entry) => !entry.archivedAt)
    .sort(compareFavoriteSeedActivity);
}

function getArchivedFavoriteSeedRecords(records: readonly FavoriteSeedRecord[]): FavoriteSeedRecord[] {
  return [...records]
    .filter((entry) => Boolean(entry.archivedAt))
    .sort(compareArchivedFavoriteSeeds);
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

  emitFavoriteSeedsChanged(getActiveFavoriteSeeds(normalized));
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

function normalizeSeedRunRecord(value: unknown): SeedRunRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === 'string' && record.id.trim().length > 0 ? record.id : crypto.randomUUID();
  const createdAt = toIsoString(record.createdAt) ?? new Date().toISOString();
  const archivedAt = toIsoString(record.archivedAt);
  const request = typeof record.request === 'object' && record.request !== null
    ? record.request as Record<string, unknown>
    : null;
  const seeds = Array.isArray(record.seeds)
    ? record.seeds.filter((seed): seed is string => typeof seed === 'string' && seed.trim().length > 0)
    : [];

  if (!request || seeds.length === 0) {
    return null;
  }

  const coverageMode = request.coverageMode === 'blended' ? 'blended' : 'per-genre';
  const count = typeof request.count === 'number' && Number.isFinite(request.count)
    ? Math.max(1, Math.round(request.count))
    : seeds.length;

  const normalized: SeedRunRecord = {
    id,
    createdAt,
    request: {
      genreLines: typeof request.genreLines === 'string' ? request.genreLines : '',
      count,
      coverageMode,
      surpriseMode: Boolean(request.surpriseMode),
      presetId: typeof request.presetId === 'string' ? request.presetId : undefined,
    },
    seeds,
  };

  if (archivedAt) {
    normalized.archivedAt = archivedAt;
  }

  return normalized;
}

function normalizeSeedRunRecords(records: readonly unknown[]): SeedRunRecord[] {
  const normalized: SeedRunRecord[] = [];

  for (const record of records) {
    const nextRecord = normalizeSeedRunRecord(record);
    if (nextRecord) {
      normalized.push(nextRecord);
    }
  }

  return normalized;
}

function getAllSeedRuns(): SeedRunRecord[] {
  const stored = readStorage<SeedRunRecord[]>([SEED_HISTORY_STORAGE_KEY, ...LEGACY_SEED_HISTORY_STORAGE_KEYS], []);
  return normalizeSeedRunRecords(stored);
}

function getActiveSeedRuns(records: readonly SeedRunRecord[]): SeedRunRecord[] {
  return records.filter((entry) => !entry.archivedAt);
}

function getArchivedSeedRunRecords(records: readonly SeedRunRecord[]): SeedRunRecord[] {
  return records.filter((entry) => Boolean(entry.archivedAt));
}

function writeSeedRunHistory(records: SeedRunRecord[], options: WriteSeedRunHistoryOptions = {}): SeedRunRecord[] {
  const { markArchivedChanged = false, markSynced = false, timestamp = new Date().toISOString() } = options;
  const normalized = normalizeSeedRunRecords(records);
  writeStorage(SEED_HISTORY_STORAGE_KEY, LEGACY_SEED_HISTORY_STORAGE_KEYS, normalized);

  if (markArchivedChanged || markSynced) {
    const nextSyncState = readArchivedSeedRunSyncState();
    if (markArchivedChanged) {
      nextSyncState.lastChangedAt = timestamp;
    }
    if (markSynced) {
      nextSyncState.lastSyncedAt = timestamp;
    }
    writeArchivedSeedRunSyncState(nextSyncState);
  }

  emitSeedHistoryChanged(getActiveSeedRuns(normalized));
  return normalized;
}

export function getSeedRunHistory(): SeedRunRecord[] {
  return getActiveSeedRuns(getAllSeedRuns());
}

export function getArchivedSeedRuns(): SeedRunRecord[] {
  return getArchivedSeedRunRecords(getAllSeedRuns());
}

export function saveSeedRun(record: Omit<SeedRunRecord, 'id' | 'createdAt' | 'archivedAt'>): SeedRunRecord[] {
  const nextEntry: SeedRunRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const archived = getArchivedSeedRuns();
  const history = [nextEntry, ...getSeedRunHistory()].slice(0, MAX_SEED_HISTORY);
  writeSeedRunHistory([...history, ...archived]);
  return history;
}

export function archiveSeedRun(id: string): SeedRunRecord[] {
  const now = new Date().toISOString();
  const archived = getArchivedSeedRuns();
  const active = getSeedRunHistory();
  const entry = active.find((candidate) => candidate.id === id);
  if (!entry) {
    return active;
  }

  writeSeedRunHistory([
    ...active.filter((candidate) => candidate.id !== id),
    { ...entry, archivedAt: now },
    ...archived.filter((candidate) => candidate.id !== id),
  ], { markArchivedChanged: true, timestamp: now });

  return getSeedRunHistory();
}

export function restoreSeedRun(id: string): SeedRunRecord[] {
  const archived = getArchivedSeedRuns();
  const entry = archived.find((candidate) => candidate.id === id);
  if (!entry) {
    return getSeedRunHistory();
  }

  const nextActive = [
    { ...entry, archivedAt: undefined },
    ...getSeedRunHistory(),
  ].slice(0, MAX_SEED_HISTORY);

  writeSeedRunHistory([
    ...nextActive,
    ...archived.filter((candidate) => candidate.id !== id),
  ], { markArchivedChanged: true });

  return nextActive;
}

export function deleteArchivedSeedRun(id: string): SeedRunRecord[] {
  writeSeedRunHistory(
    getAllSeedRuns().filter((candidate) => candidate.id !== id),
    { markArchivedChanged: true }
  );
  return getArchivedSeedRuns();
}

export function parseArchivedSeedRunsPayload(data: unknown): SeedRunRecord[] | null {
  if (Array.isArray(data)) {
    return getArchivedSeedRunRecords(normalizeSeedRunRecords(data));
  }

  if (typeof data !== 'object' || data === null) {
    return null;
  }

  const record = data as { runs?: SeedRunRecord[] };
  if (!Array.isArray(record.runs)) {
    return null;
  }

  return getArchivedSeedRunRecords(normalizeSeedRunRecords(record.runs));
}

export function replaceArchivedSeedRunsFromServer(runs: readonly SeedRunRecord[]): SeedRunRecord[] {
  const archivedRuns = getArchivedSeedRunRecords(normalizeSeedRunRecords(runs));
  writeSeedRunHistory([
    ...getSeedRunHistory(),
    ...archivedRuns,
  ], {
    markArchivedChanged: false,
    markSynced: true,
  });
  return getArchivedSeedRuns();
}

export function markArchivedSeedRunsSynced(timestamp = new Date().toISOString()): void {
  const nextSyncState = readArchivedSeedRunSyncState();
  nextSyncState.lastSyncedAt = timestamp;
  writeArchivedSeedRunSyncState(nextSyncState);
}

export function archivedSeedRunsNeedSync(): boolean {
  const { lastChangedAt, lastSyncedAt } = readArchivedSeedRunSyncState();
  if (!lastChangedAt) {
    return false;
  }

  if (!lastSyncedAt) {
    return true;
  }

  return Date.parse(lastChangedAt) > Date.parse(lastSyncedAt);
}

export async function hydrateArchivedSeedRunsFromServer(): Promise<SeedRunRecord[] | null> {
  if (!serverClient.isEnabled() || !serverClient.hasAccessToken()) {
    return null;
  }

  if (archivedSeedRunsNeedSync()) {
    const runs = getArchivedSeedRuns();
    await serverClient.syncArchivedSeedRuns('push', { runs });
    markArchivedSeedRunsSynced();
    return runs;
  }

  const payload = await serverClient.syncArchivedSeedRuns('pull') as { runs?: SeedRunRecord[] };
  const runs = parseArchivedSeedRunsPayload(payload);
  if (!runs) {
    return null;
  }

  return replaceArchivedSeedRunsFromServer(runs);
}

export function getFavoriteSeeds(): FavoriteSeedRecord[] {
  return getActiveFavoriteSeeds(getAllFavoriteSeeds());
}

export function getArchivedFavoriteSeeds(): FavoriteSeedRecord[] {
  return getArchivedFavoriteSeedRecords(getAllFavoriteSeeds());
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
  writeFavoriteSeeds([...favorites]);
  return getFavoriteSeeds();
}

export function replaceFavoriteSeedsFromServer(favorites: readonly FavoriteSeedRecord[]): FavoriteSeedRecord[] {
  writeFavoriteSeeds([...favorites], {
    markChanged: false,
    markSynced: true,
  });
  return getFavoriteSeeds();
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
  if (!serverClient.isEnabled() || !serverClient.hasAccessToken()) {
    return null;
  }

  if (favoriteSeedsNeedSync()) {
    const favorites = getAllFavoriteSeeds();
    await serverClient.syncSeeds('push', { seeds: favorites });
    markFavoriteSeedsSynced();
    return getFavoriteSeeds();
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

export function archiveFavoriteSeed(seed: string): FavoriteSeedRecord[] {
  const now = new Date().toISOString();
  const nextFavorites = getAllFavoriteSeeds().map((entry) => (
    entry.seed === seed ? { ...entry, archivedAt: now } : entry
  ));
  writeFavoriteSeeds(nextFavorites, { timestamp: now });
  return getFavoriteSeeds();
}

export function restoreFavoriteSeed(seed: string): FavoriteSeedRecord[] {
  const nextFavorites = getAllFavoriteSeeds().map((entry) => (
    entry.seed === seed ? { ...entry, archivedAt: undefined } : entry
  ));
  writeFavoriteSeeds(nextFavorites);
  return getFavoriteSeeds();
}

export function deleteArchivedFavoriteSeed(seed: string): FavoriteSeedRecord[] {
  writeFavoriteSeeds(getAllFavoriteSeeds().filter((entry) => entry.seed !== seed));
  return getArchivedFavoriteSeeds();
}

export function toggleFavoriteSeed(seed: string): FavoriteSeedRecord[] {
  const allFavorites = getAllFavoriteSeeds();
  const existing = allFavorites.find((entry) => entry.seed === seed);

  if (existing?.archivedAt) {
    return restoreFavoriteSeed(seed);
  }

  if (existing) {
    return archiveFavoriteSeed(seed);
  }

  writeFavoriteSeeds([
    {
      seed,
      addedAt: new Date().toISOString(),
    },
    ...allFavorites,
  ]);
  return getFavoriteSeeds();
}

export function markSeedUsed(seed: string): FavoriteSeedRecord[] {
  const now = new Date().toISOString();
  const favorites = getAllFavoriteSeeds();
  const nextFavorites = favorites.map((entry) => (
    entry.seed === seed ? { ...entry, lastUsedAt: now } : entry
  ));
  writeFavoriteSeeds(nextFavorites, { timestamp: now });
  return getFavoriteSeeds();
}