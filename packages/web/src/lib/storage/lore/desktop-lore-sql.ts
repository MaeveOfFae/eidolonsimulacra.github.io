/**
 * The desktop lore store's SQL layer: the connection, the row types the queries
 * return, the shared tag and draft-link helpers, and the row-to-record mappers.
 *
 * Split out of `desktop-lore-db.ts` so the query surface could be read in one
 * place; the barrel re-exports only the public functions, so nothing that imported
 * the old module can tell the difference.
 */
import type {
  TimelineEventRecord,
  TimelineRecord,
  WorldCharacterDraftLinkRecord,
  WorldCharacterRecord,
  WorldFactionRecord,
  WorldLocationRecord,
  WorldRelationshipRecord,
  WorldRecord,
} from '@char-gen/shared';
import { isSelfContainedDesktopRuntime } from '../../runtime.js';

export const DESKTOP_LORE_DB_FILE = 'eidolon-lore.db';
export const DESKTOP_LORE_DB_CONNECTION = `sqlite:${DESKTOP_LORE_DB_FILE}`;
export const DESKTOP_LORE_SNAPSHOT_FILE = 'eidolon-lore-sqlite-snapshot.json';
export const DESKTOP_LORE_EXPORT_FILE = 'eidolon-simulacra-lore.json';

export interface DesktopLoreStorageDiagnostics {
  backend: 'desktop-app-data';
  fileName: string;
  locationLabel: string;
  worldCount: number;
  characterCount: number;
  factionCount: number;
  locationCount: number;
  timelineCount: number;
  eventCount: number;
}

export interface SqlDatabase {
  execute(query: string, bindValues?: unknown[]): Promise<unknown>;
  select<T>(query: string, bindValues?: unknown[]): Promise<T[]>;
}

export interface SqlWorldRow {
  id: string;
  name: string;
  description?: string | null;
  genre?: string | null;
  setting?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SqlCharacterRow {
  id: string;
  worldId: string;
  draftId?: string | null;
  characterName: string;
  role?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SqlWorldCharacterDraftLinkRow {
  worldId: string;
  worldName: string;
  characterId: string;
  draftId: string;
  characterName: string;
  role?: string | null;
  updatedAt: string;
}

export interface SqlFactionRow {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  role?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SqlLocationRow {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SqlRelationshipRow {
  id: string;
  worldId: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  label: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SqlTimelineRow {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SqlTimelineEventRow {
  id: string;
  timelineId: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  sortOrder: number;
  metadataJson?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SqlLoreTagRow {
  ownerId: string;
  tag: string;
  sortOrder: number;
}

export interface SqlLoreDraftLinkRow {
  ownerId: string;
  draftId: string;
  sortOrder: number;
}

export interface SqlWorldRelationshipAuditIssueRow {
  worldId: string;
  worldName: string;
  relationshipId: string;
  label: string;
  sourceCharacterId: string;
  sourceCharacterName?: string | null;
  targetCharacterId: string;
  targetCharacterName?: string | null;
  updatedAt: string;
}

let sqlModulePromise: Promise<typeof import('@tauri-apps/plugin-sql')> | null = null;
let databasePromise: Promise<SqlDatabase> | null = null;

function ensureDesktopLoreAvailable(): void {
  if (!isSelfContainedDesktopRuntime()) {
    throw new Error('Local lore persistence is only available in the self-contained desktop runtime.');
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function parseMetadata(value?: string | null): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function loadSqlModule() {
  if (!sqlModulePromise) {
    sqlModulePromise = import('@tauri-apps/plugin-sql');
  }

  return sqlModulePromise;
}

export async function getDatabase(): Promise<SqlDatabase> {
  ensureDesktopLoreAvailable();

  if (!databasePromise) {
    databasePromise = (async () => {
      const Database = (await loadSqlModule()).default;
      return Database.load(DESKTOP_LORE_DB_CONNECTION) as Promise<SqlDatabase>;
    })();
  }

  return databasePromise;
}

export async function loadLoreTagMap(
  database: SqlDatabase,
  tableName: string,
  ownerColumn: string,
  ownerIds: string[],
): Promise<Map<string, string[]>> {
  const tagMap = new Map<string, string[]>();
  if (ownerIds.length === 0) {
    return tagMap;
  }

  const placeholders = ownerIds.map((_, index) => `$${index + 1}`).join(', ');
  const rows = await database.select<SqlLoreTagRow>(
    `SELECT ${ownerColumn} AS ownerId, tag, sort_order AS sortOrder FROM ${tableName} WHERE ${ownerColumn} IN (${placeholders}) ORDER BY ${ownerColumn} ASC, sort_order ASC`,
    ownerIds,
  );

  for (const row of rows) {
    const current = tagMap.get(row.ownerId) ?? [];
    current.push(row.tag);
    tagMap.set(row.ownerId, current);
  }

  return tagMap;
}

export async function replaceLoreTags(
  database: SqlDatabase,
  tableName: string,
  ownerColumn: string,
  ownerId: string,
  tags: string[],
): Promise<void> {
  await database.execute(`DELETE FROM ${tableName} WHERE ${ownerColumn} = $1`, [ownerId]);
  for (const [sortOrder, tag] of tags.entries()) {
    await database.execute(`INSERT INTO ${tableName} (${ownerColumn}, tag, sort_order) VALUES ($1, $2, $3)`, [
      ownerId,
      tag,
      sortOrder,
    ]);
  }
}

export function normalizeStringList(values: string[]): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }

    seen.add(trimmed);
    normalized.push(trimmed);
  }

  return normalized;
}

export function coerceStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return normalizeStringList(value.filter((entry): entry is string => typeof entry === 'string'));
}

export async function loadLoreDraftLinkMap(
  database: SqlDatabase,
  tableName: string,
  ownerColumn: string,
  ownerIds: string[],
): Promise<Map<string, string[]>> {
  const draftLinkMap = new Map<string, string[]>();
  if (ownerIds.length === 0) {
    return draftLinkMap;
  }

  const placeholders = ownerIds.map((_, index) => `$${index + 1}`).join(', ');
  const rows = await database.select<SqlLoreDraftLinkRow>(
    `SELECT ${ownerColumn} AS ownerId, draft_id AS draftId, sort_order AS sortOrder FROM ${tableName} WHERE ${ownerColumn} IN (${placeholders}) ORDER BY ${ownerColumn} ASC, sort_order ASC`,
    ownerIds,
  );

  for (const row of rows) {
    const current = draftLinkMap.get(row.ownerId) ?? [];
    current.push(row.draftId);
    draftLinkMap.set(row.ownerId, current);
  }

  return draftLinkMap;
}

export async function replaceLoreDraftLinks(
  database: SqlDatabase,
  tableName: string,
  ownerColumn: string,
  ownerId: string,
  draftIds: string[],
): Promise<void> {
  const normalizedDraftIds = normalizeStringList(draftIds);
  await database.execute(`DELETE FROM ${tableName} WHERE ${ownerColumn} = $1`, [ownerId]);
  for (const [sortOrder, draftId] of normalizedDraftIds.entries()) {
    await database.execute(`INSERT INTO ${tableName} (${ownerColumn}, draft_id, sort_order) VALUES ($1, $2, $3)`, [
      ownerId,
      draftId,
      sortOrder,
    ]);
  }
}

export function worldFromRow(row: SqlWorldRow, counts?: WorldRecord['_count'], tags?: string[]): WorldRecord {
  return {
    id: row.id,
    userId: 'local-desktop',
    name: row.name,
    description: row.description || undefined,
    genre: row.genre || undefined,
    setting: row.setting || undefined,
    notes: row.notes || undefined,
    tags: tags ?? [],
    isPublic: false,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    _count: counts,
  };
}

export function characterFromRow(row: SqlCharacterRow): WorldCharacterRecord {
  return {
    id: row.id,
    worldId: row.worldId,
    draftId: row.draftId || undefined,
    characterName: row.characterName,
    role: row.role || undefined,
    notes: row.notes || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function draftLinkFromRow(row: SqlWorldCharacterDraftLinkRow): WorldCharacterDraftLinkRecord {
  return {
    worldId: row.worldId,
    worldName: row.worldName,
    characterId: row.characterId,
    draftId: row.draftId,
    characterName: row.characterName,
    role: row.role || undefined,
    updatedAt: row.updatedAt,
  };
}

export function worldRelationshipAuditIssueFromRow(row: SqlWorldRelationshipAuditIssueRow): {
  worldId: string;
  worldName: string;
  relationshipId: string;
  label: string;
  sourceCharacterId: string;
  sourceCharacterName?: string;
  targetCharacterId: string;
  targetCharacterName?: string;
  updatedAt: string;
  kind: 'missing-source-character' | 'missing-target-character' | 'missing-both-characters';
} {
  const missingSourceCharacter = !row.sourceCharacterName;
  const missingTargetCharacter = !row.targetCharacterName;

  return {
    worldId: row.worldId,
    worldName: row.worldName,
    relationshipId: row.relationshipId,
    label: row.label,
    sourceCharacterId: row.sourceCharacterId,
    sourceCharacterName: row.sourceCharacterName || undefined,
    targetCharacterId: row.targetCharacterId,
    targetCharacterName: row.targetCharacterName || undefined,
    updatedAt: row.updatedAt,
    kind:
      missingSourceCharacter && missingTargetCharacter
        ? 'missing-both-characters'
        : missingSourceCharacter
          ? 'missing-source-character'
          : 'missing-target-character',
  };
}

export function factionFromRow(row: SqlFactionRow, tags?: string[], draftIds?: string[]): WorldFactionRecord {
  return {
    id: row.id,
    worldId: row.worldId,
    name: row.name,
    description: row.description || undefined,
    role: row.role || undefined,
    notes: row.notes || undefined,
    tags: tags ?? [],
    draftIds: draftIds && draftIds.length > 0 ? draftIds : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function locationFromRow(row: SqlLocationRow, tags?: string[], draftIds?: string[]): WorldLocationRecord {
  return {
    id: row.id,
    worldId: row.worldId,
    name: row.name,
    description: row.description || undefined,
    category: row.category || undefined,
    notes: row.notes || undefined,
    tags: tags ?? [],
    draftIds: draftIds && draftIds.length > 0 ? draftIds : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function relationshipFromRow(row: SqlRelationshipRow): WorldRelationshipRecord {
  return {
    id: row.id,
    worldId: row.worldId,
    sourceCharacterId: row.sourceCharacterId,
    targetCharacterId: row.targetCharacterId,
    label: row.label,
    notes: row.notes || undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function timelineFromRow(row: SqlTimelineRow, eventCount = 0, tags?: string[]): TimelineRecord {
  return {
    id: row.id,
    worldId: row.worldId,
    userId: 'local-desktop',
    name: row.name,
    description: row.description || undefined,
    startDate: row.startDate || undefined,
    endDate: row.endDate || undefined,
    tags: tags ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    _count: { events: eventCount },
  };
}

export function timelineEventFromRow(row: SqlTimelineEventRow, tags?: string[]): TimelineEventRecord {
  return {
    id: row.id,
    timelineId: row.timelineId,
    title: row.title,
    description: row.description || undefined,
    eventDate: row.eventDate || undefined,
    sortOrder: row.sortOrder,
    tags: tags ?? [],
    metadata: parseMetadata(row.metadataJson),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
