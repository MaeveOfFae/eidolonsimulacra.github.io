import type {
  TimelineEventRecord,
  TimelineRecord,
  WorldCharacterRecord,
  WorldFactionRecord,
  WorldLocationRecord,
  WorldRecord,
} from '@char-gen/shared';
import { isSelfContainedDesktopRuntime } from '../runtime.js';

const DESKTOP_LORE_DB_FILE = 'eidolon-lore.db';
const DESKTOP_LORE_DB_CONNECTION = `sqlite:${DESKTOP_LORE_DB_FILE}`;
const DESKTOP_LORE_SNAPSHOT_FILE = 'eidolon-lore-sqlite-snapshot.json';
const DESKTOP_LORE_EXPORT_FILE = 'eidolon-simulacra-lore.json';

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

interface SqlDatabase {
  execute(query: string, bindValues?: unknown[]): Promise<unknown>;
  select<T>(query: string, bindValues?: unknown[]): Promise<T[]>;
}

interface SqlWorldRow {
  id: string;
  name: string;
  description?: string | null;
  genre?: string | null;
  setting?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SqlCharacterRow {
  id: string;
  worldId: string;
  draftId?: string | null;
  characterName: string;
  role?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SqlFactionRow {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  role?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SqlLocationRow {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  category?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SqlTimelineRow {
  id: string;
  worldId: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SqlTimelineEventRow {
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

interface SqlLoreTagRow {
  ownerId: string;
  tag: string;
  sortOrder: number;
}

let sqlModulePromise: Promise<typeof import('@tauri-apps/plugin-sql')> | null = null;
let databasePromise: Promise<SqlDatabase> | null = null;

function ensureDesktopLoreAvailable(): void {
  if (!isSelfContainedDesktopRuntime()) {
    throw new Error('Local lore persistence is only available in the self-contained desktop runtime.');
  }
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseMetadata(value?: string | null): Record<string, unknown> {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
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

async function getDatabase(): Promise<SqlDatabase> {
  ensureDesktopLoreAvailable();

  if (!databasePromise) {
    databasePromise = (async () => {
      const Database = (await loadSqlModule()).default;
      return Database.load(DESKTOP_LORE_DB_CONNECTION) as Promise<SqlDatabase>;
    })();
  }

  return databasePromise;
}

async function loadLoreTagMap(
  database: SqlDatabase,
  tableName: string,
  ownerColumn: string,
  ownerIds: string[]
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

async function replaceLoreTags(
  database: SqlDatabase,
  tableName: string,
  ownerColumn: string,
  ownerId: string,
  tags: string[]
): Promise<void> {
  await database.execute(`DELETE FROM ${tableName} WHERE ${ownerColumn} = $1`, [ownerId]);
  for (const [sortOrder, tag] of tags.entries()) {
    await database.execute(
      `INSERT INTO ${tableName} (${ownerColumn}, tag, sort_order) VALUES ($1, $2, $3)`,
      [ownerId, tag, sortOrder],
    );
  }
}

function worldFromRow(row: SqlWorldRow, counts?: WorldRecord['_count'], tags?: string[]): WorldRecord {
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

function characterFromRow(row: SqlCharacterRow): WorldCharacterRecord {
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

function factionFromRow(row: SqlFactionRow, tags?: string[]): WorldFactionRecord {
  return {
    id: row.id,
    worldId: row.worldId,
    name: row.name,
    description: row.description || undefined,
    role: row.role || undefined,
    notes: row.notes || undefined,
    tags: tags ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function locationFromRow(row: SqlLocationRow, tags?: string[]): WorldLocationRecord {
  return {
    id: row.id,
    worldId: row.worldId,
    name: row.name,
    description: row.description || undefined,
    category: row.category || undefined,
    notes: row.notes || undefined,
    tags: tags ?? [],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function timelineFromRow(row: SqlTimelineRow, eventCount = 0, tags?: string[]): TimelineRecord {
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

function timelineEventFromRow(row: SqlTimelineEventRow, tags?: string[]): TimelineEventRecord {
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

export async function getLocalWorlds(params?: { search?: string; genre?: string; includePublic?: boolean }): Promise<{ worlds: WorldRecord[] }> {
  const database = await getDatabase();
  const clauses: string[] = [];
  const bindValues: unknown[] = [];

  if (params?.search?.trim()) {
    clauses.push('(name LIKE $1 OR description LIKE $1 OR notes LIKE $1)');
    bindValues.push(`%${params.search.trim()}%`);
  }

  if (params?.genre?.trim()) {
    clauses.push(`genre = $${bindValues.length + 1}`);
    bindValues.push(params.genre.trim());
  }

  const query = `
    SELECT
      worlds.id,
      worlds.name,
      worlds.description,
      worlds.genre,
      worlds.setting,
      worlds.notes,
      worlds.created_at AS createdAt,
      worlds.updated_at AS updatedAt,
      (SELECT COUNT(*) FROM world_characters WHERE world_id = worlds.id) AS characterCount,
      (SELECT COUNT(*) FROM timelines WHERE world_id = worlds.id) AS timelineCount,
      (SELECT COUNT(*) FROM world_factions WHERE world_id = worlds.id) AS factionCount,
      (SELECT COUNT(*) FROM world_locations WHERE world_id = worlds.id) AS locationCount
    FROM worlds
    ${clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''}
    ORDER BY worlds.updated_at DESC
  `;

  const rows = await database.select<Array<SqlWorldRow & {
    characterCount: number;
    timelineCount: number;
    factionCount: number;
    locationCount: number;
  }>[number]>(query, bindValues);

  const tagMap = await loadLoreTagMap(database, 'world_tags', 'world_id', rows.map((row) => row.id));

  return {
    worlds: rows.map((row) => worldFromRow(row, {
      characters: Number(row.characterCount ?? 0),
      timelines: Number(row.timelineCount ?? 0),
      factions: Number(row.factionCount ?? 0),
      locations: Number(row.locationCount ?? 0),
    }, tagMap.get(row.id))),
  };
}

export async function getLocalWorld(id: string): Promise<{ world: WorldRecord }> {
  const database = await getDatabase();
  const worldRows = await database.select<SqlWorldRow>('SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds WHERE id = $1 LIMIT 1', [id]);
  const worldRow = worldRows[0];
  if (!worldRow) {
    throw new Error('World not found');
  }

  const [characters, factions, locations, timelines] = await Promise.all([
    database.select<SqlCharacterRow>('SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE world_id = $1 ORDER BY updated_at DESC', [id]),
    database.select<SqlFactionRow>('SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE world_id = $1 ORDER BY updated_at DESC', [id]),
    database.select<SqlLocationRow>('SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE world_id = $1 ORDER BY updated_at DESC', [id]),
    database.select<SqlTimelineRow>('SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE world_id = $1 ORDER BY updated_at DESC', [id]),
  ]);

  const [worldTagMap, factionTagMap, locationTagMap, timelineTagMap] = await Promise.all([
    loadLoreTagMap(database, 'world_tags', 'world_id', [id]),
    loadLoreTagMap(database, 'world_faction_tags', 'faction_id', factions.map((entry) => entry.id)),
    loadLoreTagMap(database, 'world_location_tags', 'location_id', locations.map((entry) => entry.id)),
    loadLoreTagMap(database, 'timeline_tags', 'timeline_id', timelines.map((entry) => entry.id)),
  ]);

  const timelineCounts = new Map<string, number>();
  if (timelines.length > 0) {
    const placeholders = timelines.map((_, index) => `$${index + 1}`).join(', ');
    const countRows = await database.select<{ timelineId: string; eventCount: number }>(
      `SELECT timeline_id AS timelineId, COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id IN (${placeholders}) GROUP BY timeline_id`,
      timelines.map((timeline) => timeline.id)
    );
    countRows.forEach((row) => timelineCounts.set(row.timelineId, Number(row.eventCount ?? 0)));
  }

  return {
    world: {
      ...worldFromRow(worldRow, {
        characters: characters.length,
        timelines: timelines.length,
        factions: factions.length,
        locations: locations.length,
      }, worldTagMap.get(id)),
      characters: characters.map(characterFromRow),
      factions: factions.map((faction) => factionFromRow(faction, factionTagMap.get(faction.id))),
      locations: locations.map((location) => locationFromRow(location, locationTagMap.get(location.id))),
      timelines: timelines.map((timeline) => timelineFromRow(timeline, timelineCounts.get(timeline.id) ?? 0, timelineTagMap.get(timeline.id))),
    },
  };
}

export async function createLocalWorld(data: { name: string; description?: string; genre?: string; setting?: string; notes?: string; tags?: string[]; isPublic?: boolean }): Promise<{ world: WorldRecord }> {
  const database = await getDatabase();
  const id = createId('world');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO worlds (id, name, description, genre, setting, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, data.name.trim(), data.description?.trim() || null, data.genre?.trim() || null, data.setting?.trim() || null, data.notes?.trim() || null, timestamp, timestamp]
  );
  await replaceLoreTags(database, 'world_tags', 'world_id', id, data.tags ?? []);
  return getLocalWorld(id);
}

export async function updateLocalWorld(id: string, data: Record<string, unknown>): Promise<{ world: WorldRecord }> {
  const existing = await getLocalWorld(id);
  const nextName = typeof data.name === 'string' ? data.name.trim() : existing.world.name;
  const nextDescription = typeof data.description === 'string' ? data.description.trim() || null : existing.world.description ?? null;
  const nextGenre = typeof data.genre === 'string' ? data.genre.trim() || null : existing.world.genre ?? null;
  const nextSetting = typeof data.setting === 'string' ? data.setting.trim() || null : existing.world.setting ?? null;
  const nextNotes = typeof data.notes === 'string' ? data.notes.trim() || null : existing.world.notes ?? null;
  const nextTags = Array.isArray(data.tags)
    ? data.tags.filter((entry): entry is string => typeof entry === 'string')
    : existing.world.tags;

  const database = await getDatabase();
  await database.execute(
    'UPDATE worlds SET name = $1, description = $2, genre = $3, setting = $4, notes = $5, updated_at = $6 WHERE id = $7',
    [nextName, nextDescription, nextGenre, nextSetting, nextNotes, nowIso(), id]
  );
  await replaceLoreTags(database, 'world_tags', 'world_id', id, nextTags);
  return getLocalWorld(id);
}

export async function deleteLocalWorld(id: string): Promise<{ message: string }> {
  const database = await getDatabase();
  const timelines = await database.select<{ id: string }>('SELECT id FROM timelines WHERE world_id = $1', [id]);
  for (const timeline of timelines) {
    await database.execute('DELETE FROM timeline_events WHERE timeline_id = $1', [timeline.id]);
  }
  await database.execute('DELETE FROM timelines WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM world_characters WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM world_faction_tags WHERE faction_id IN (SELECT id FROM world_factions WHERE world_id = $1)', [id]);
  await database.execute('DELETE FROM world_factions WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM world_location_tags WHERE location_id IN (SELECT id FROM world_locations WHERE world_id = $1)', [id]);
  await database.execute('DELETE FROM world_locations WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM world_tags WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM worlds WHERE id = $1', [id]);
  return { message: 'World deleted' };
}

export async function addLocalWorldCharacter(worldId: string, data: { draftId?: string; characterName: string; role?: string; notes?: string }): Promise<{ character: WorldCharacterRecord }> {
  const database = await getDatabase();
  const id = createId('char');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, worldId, data.draftId ?? null, data.characterName.trim(), data.role?.trim() || null, data.notes?.trim() || null, timestamp, timestamp]
  );
  const rows = await database.select<SqlCharacterRow>('SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1', [id]);
  return { character: characterFromRow(rows[0]) };
}

export async function updateLocalWorldCharacter(worldId: string, characterId: string, data: Record<string, unknown>): Promise<{ character: WorldCharacterRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlCharacterRow>('SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 AND world_id = $2 LIMIT 1', [characterId, worldId]);
  const existing = rows[0];
  if (!existing) {
    throw new Error('Character not found');
  }
  const characterName = typeof data.characterName === 'string' ? data.characterName.trim() : existing.characterName;
  const role = typeof data.role === 'string' ? data.role.trim() || null : existing.role ?? null;
  const notes = typeof data.notes === 'string' ? data.notes.trim() || null : existing.notes ?? null;
  const draftId = typeof data.draftId === 'string' ? data.draftId.trim() || null : existing.draftId ?? null;
  await database.execute(
    'UPDATE world_characters SET draft_id = $1, character_name = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7',
    [draftId, characterName, role, notes, nowIso(), characterId, worldId]
  );
  const updated = await database.select<SqlCharacterRow>('SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1', [characterId]);
  return { character: characterFromRow(updated[0]) };
}

export async function deleteLocalWorldCharacter(worldId: string, characterId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM world_characters WHERE id = $1 AND world_id = $2', [characterId, worldId]);
  return { message: 'Character removed' };
}

export async function addLocalWorldFaction(worldId: string, data: { name: string; description?: string; role?: string; notes?: string; tags?: string[] }): Promise<{ faction: WorldFactionRecord }> {
  const database = await getDatabase();
  const id = createId('faction');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, worldId, data.name.trim(), data.description?.trim() || null, data.role?.trim() || null, data.notes?.trim() || null, timestamp, timestamp]
  );
  await replaceLoreTags(database, 'world_faction_tags', 'faction_id', id, data.tags ?? []);
  const rows = await database.select<SqlFactionRow>('SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1', [id]);
  return { faction: factionFromRow(rows[0], data.tags ?? []) };
}

export async function updateLocalWorldFaction(worldId: string, factionId: string, data: Record<string, unknown>): Promise<{ faction: WorldFactionRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlFactionRow>('SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 AND world_id = $2 LIMIT 1', [factionId, worldId]);
  const existing = rows[0];
  if (!existing) {
    throw new Error('Faction not found');
  }
  const name = typeof data.name === 'string' ? data.name.trim() : existing.name;
  const description = typeof data.description === 'string' ? data.description.trim() || null : existing.description ?? null;
  const role = typeof data.role === 'string' ? data.role.trim() || null : existing.role ?? null;
  const notes = typeof data.notes === 'string' ? data.notes.trim() || null : existing.notes ?? null;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((entry): entry is string => typeof entry === 'string')
    : [];
  await database.execute(
    'UPDATE world_factions SET name = $1, description = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7',
    [name, description, role, notes, nowIso(), factionId, worldId]
  );
  await replaceLoreTags(database, 'world_faction_tags', 'faction_id', factionId, tags);
  const updated = await database.select<SqlFactionRow>('SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1', [factionId]);
  return { faction: factionFromRow(updated[0], tags) };
}

export async function deleteLocalWorldFaction(worldId: string, factionId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM world_faction_tags WHERE faction_id = $1', [factionId]);
  await database.execute('DELETE FROM world_factions WHERE id = $1 AND world_id = $2', [factionId, worldId]);
  return { message: 'Faction removed' };
}

export async function addLocalWorldLocation(worldId: string, data: { name: string; description?: string; category?: string; notes?: string; tags?: string[] }): Promise<{ location: WorldLocationRecord }> {
  const database = await getDatabase();
  const id = createId('location');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, worldId, data.name.trim(), data.description?.trim() || null, data.category?.trim() || null, data.notes?.trim() || null, timestamp, timestamp]
  );
  await replaceLoreTags(database, 'world_location_tags', 'location_id', id, data.tags ?? []);
  const rows = await database.select<SqlLocationRow>('SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1', [id]);
  return { location: locationFromRow(rows[0], data.tags ?? []) };
}

export async function updateLocalWorldLocation(worldId: string, locationId: string, data: Record<string, unknown>): Promise<{ location: WorldLocationRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlLocationRow>('SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 AND world_id = $2 LIMIT 1', [locationId, worldId]);
  const existing = rows[0];
  if (!existing) {
    throw new Error('Location not found');
  }
  const name = typeof data.name === 'string' ? data.name.trim() : existing.name;
  const description = typeof data.description === 'string' ? data.description.trim() || null : existing.description ?? null;
  const category = typeof data.category === 'string' ? data.category.trim() || null : existing.category ?? null;
  const notes = typeof data.notes === 'string' ? data.notes.trim() || null : existing.notes ?? null;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((entry): entry is string => typeof entry === 'string')
    : [];
  await database.execute(
    'UPDATE world_locations SET name = $1, description = $2, category = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7',
    [name, description, category, notes, nowIso(), locationId, worldId]
  );
  await replaceLoreTags(database, 'world_location_tags', 'location_id', locationId, tags);
  const updated = await database.select<SqlLocationRow>('SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1', [locationId]);
  return { location: locationFromRow(updated[0], tags) };
}

export async function deleteLocalWorldLocation(worldId: string, locationId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM world_location_tags WHERE location_id = $1', [locationId]);
  await database.execute('DELETE FROM world_locations WHERE id = $1 AND world_id = $2', [locationId, worldId]);
  return { message: 'Location removed' };
}

export async function createLocalTimeline(data: { worldId: string; name: string; description?: string; startDate?: string; endDate?: string; tags?: string[] }): Promise<{ timeline: TimelineRecord }> {
  const database = await getDatabase();
  const id = createId('timeline');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [id, data.worldId, data.name.trim(), data.description?.trim() || null, data.startDate?.trim() || null, data.endDate?.trim() || null, timestamp, timestamp]
  );
  await replaceLoreTags(database, 'timeline_tags', 'timeline_id', id, data.tags ?? []);
  return getLocalTimeline(id);
}

export async function getLocalTimeline(id: string): Promise<{ timeline: TimelineRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlTimelineRow>('SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE id = $1 LIMIT 1', [id]);
  const timelineRow = rows[0];
  if (!timelineRow) {
    throw new Error('Timeline not found');
  }
  const eventRows = await database.select<SqlTimelineEventRow>('SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE timeline_id = $1 ORDER BY sort_order ASC, created_at ASC', [id]);
  const [timelineTagMap, eventTagMap] = await Promise.all([
    loadLoreTagMap(database, 'timeline_tags', 'timeline_id', [id]),
    loadLoreTagMap(database, 'timeline_event_tags', 'event_id', eventRows.map((event) => event.id)),
  ]);
  return {
    timeline: {
      ...timelineFromRow(timelineRow, eventRows.length, timelineTagMap.get(id)),
      events: eventRows.map((event) => timelineEventFromRow(event, eventTagMap.get(event.id))),
    },
  };
}

export async function updateLocalTimeline(id: string, data: Record<string, unknown>): Promise<{ timeline: TimelineRecord }> {
  const existing = await getLocalTimeline(id);
  const database = await getDatabase();
  const name = typeof data.name === 'string' ? data.name.trim() : existing.timeline.name;
  const description = typeof data.description === 'string' ? data.description.trim() || null : existing.timeline.description ?? null;
  const startDate = typeof data.startDate === 'string' ? data.startDate.trim() || null : existing.timeline.startDate ?? null;
  const endDate = typeof data.endDate === 'string' ? data.endDate.trim() || null : existing.timeline.endDate ?? null;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((entry): entry is string => typeof entry === 'string')
    : existing.timeline.tags;
  await database.execute(
    'UPDATE timelines SET name = $1, description = $2, start_date = $3, end_date = $4, updated_at = $5 WHERE id = $6',
    [name, description, startDate, endDate, nowIso(), id]
  );
  await replaceLoreTags(database, 'timeline_tags', 'timeline_id', id, tags);
  return getLocalTimeline(id);
}

export async function deleteLocalTimeline(id: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM timeline_event_tags WHERE event_id IN (SELECT id FROM timeline_events WHERE timeline_id = $1)', [id]);
  await database.execute('DELETE FROM timeline_events WHERE timeline_id = $1', [id]);
  await database.execute('DELETE FROM timeline_tags WHERE timeline_id = $1', [id]);
  await database.execute('DELETE FROM timelines WHERE id = $1', [id]);
  return { message: 'Timeline deleted' };
}

export async function addLocalTimelineEvent(timelineId: string, data: { title: string; description?: string; eventDate?: string; sortOrder?: number; tags?: string[]; metadata?: Record<string, unknown> }): Promise<{ event: TimelineEventRecord }> {
  const database = await getDatabase();
  const id = createId('event');
  const timestamp = nowIso();
  const currentCount = await database.select<{ eventCount: number }>('SELECT COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id = $1', [timelineId]);
  const sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : Number(currentCount[0]?.eventCount ?? 0);
  await database.execute(
    'INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [id, timelineId, data.title.trim(), data.description?.trim() || null, data.eventDate?.trim() || null, sortOrder, JSON.stringify(data.metadata ?? {}), timestamp, timestamp]
  );
  await replaceLoreTags(database, 'timeline_event_tags', 'event_id', id, data.tags ?? []);
  const rows = await database.select<SqlTimelineEventRow>('SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1', [id]);
  return { event: timelineEventFromRow(rows[0], data.tags ?? []) };
}

export async function updateLocalTimelineEvent(timelineId: string, eventId: string, data: Record<string, unknown>): Promise<{ event: TimelineEventRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlTimelineEventRow>('SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 AND timeline_id = $2 LIMIT 1', [eventId, timelineId]);
  const existing = rows[0];
  if (!existing) {
    throw new Error('Timeline event not found');
  }
  const title = typeof data.title === 'string' ? data.title.trim() : existing.title;
  const description = typeof data.description === 'string' ? data.description.trim() || null : existing.description ?? null;
  const eventDate = typeof data.eventDate === 'string' ? data.eventDate.trim() || null : existing.eventDate ?? null;
  const sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : existing.sortOrder;
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((entry): entry is string => typeof entry === 'string')
    : [];
  const metadata = data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)
    ? data.metadata as Record<string, unknown>
    : parseMetadata(existing.metadataJson);
  await database.execute(
    'UPDATE timeline_events SET title = $1, description = $2, event_date = $3, sort_order = $4, metadata_json = $5, updated_at = $6 WHERE id = $7 AND timeline_id = $8',
    [title, description, eventDate, sortOrder, JSON.stringify(metadata), nowIso(), eventId, timelineId]
  );
  await replaceLoreTags(database, 'timeline_event_tags', 'event_id', eventId, tags);
  const updated = await database.select<SqlTimelineEventRow>('SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1', [eventId]);
  return { event: timelineEventFromRow(updated[0], tags) };
}

export async function deleteLocalTimelineEvent(timelineId: string, eventId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM timeline_event_tags WHERE event_id = $1', [eventId]);
  await database.execute('DELETE FROM timeline_events WHERE id = $1 AND timeline_id = $2', [eventId, timelineId]);
  return { message: 'Timeline event deleted' };
}

export function getDesktopLoreDbInfo() {
  return {
    fileName: DESKTOP_LORE_DB_FILE,
    connection: DESKTOP_LORE_DB_CONNECTION,
  };
}

export async function getLocalLoreStorageDiagnostics(): Promise<DesktopLoreStorageDiagnostics> {
  const database = await getDatabase();
  const [worlds, characters, factions, locations, timelines, events] = await Promise.all([
    database.select<{ count: number }>('SELECT COUNT(*) AS count FROM worlds'),
    database.select<{ count: number }>('SELECT COUNT(*) AS count FROM world_characters'),
    database.select<{ count: number }>('SELECT COUNT(*) AS count FROM world_factions'),
    database.select<{ count: number }>('SELECT COUNT(*) AS count FROM world_locations'),
    database.select<{ count: number }>('SELECT COUNT(*) AS count FROM timelines'),
    database.select<{ count: number }>('SELECT COUNT(*) AS count FROM timeline_events'),
  ]);

  return {
    backend: 'desktop-app-data',
    fileName: DESKTOP_LORE_DB_FILE,
    locationLabel: `AppConfig/${DESKTOP_LORE_DB_FILE}`,
    worldCount: Number(worlds[0]?.count ?? 0),
    characterCount: Number(characters[0]?.count ?? 0),
    factionCount: Number(factions[0]?.count ?? 0),
    locationCount: Number(locations[0]?.count ?? 0),
    timelineCount: Number(timelines[0]?.count ?? 0),
    eventCount: Number(events[0]?.count ?? 0),
  };
}

export async function exportLocalLoreStorageSnapshot(): Promise<{ fileName: string; contents: string }> {
  const database = await getDatabase();
  const [worlds, characters, factions, locations, timelines, events] = await Promise.all([
    database.select<SqlWorldRow>('SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds ORDER BY updated_at DESC'),
    database.select<SqlCharacterRow>('SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters ORDER BY updated_at DESC'),
    database.select<SqlFactionRow>('SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions ORDER BY updated_at DESC'),
    database.select<SqlLocationRow>('SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations ORDER BY updated_at DESC'),
    database.select<SqlTimelineRow>('SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines ORDER BY updated_at DESC'),
    database.select<SqlTimelineEventRow>('SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events ORDER BY updated_at DESC'),
  ]);

  const [worldTagMap, factionTagMap, locationTagMap, timelineTagMap, eventTagMap] = await Promise.all([
    loadLoreTagMap(database, 'world_tags', 'world_id', worlds.map((row) => row.id)),
    loadLoreTagMap(database, 'world_faction_tags', 'faction_id', factions.map((row) => row.id)),
    loadLoreTagMap(database, 'world_location_tags', 'location_id', locations.map((row) => row.id)),
    loadLoreTagMap(database, 'timeline_tags', 'timeline_id', timelines.map((row) => row.id)),
    loadLoreTagMap(database, 'timeline_event_tags', 'event_id', events.map((row) => row.id)),
  ]);

  return {
    fileName: DESKTOP_LORE_SNAPSHOT_FILE,
    contents: JSON.stringify({
      version: 1,
      worlds: worlds.map((row) => worldFromRow(row, undefined, worldTagMap.get(row.id))),
      characters: characters.map(characterFromRow),
      factions: factions.map((row) => factionFromRow(row, factionTagMap.get(row.id))),
      locations: locations.map((row) => locationFromRow(row, locationTagMap.get(row.id))),
      timelines: timelines.map((row) => timelineFromRow(row, 0, timelineTagMap.get(row.id))),
      events: events.map((row) => timelineEventFromRow(row, eventTagMap.get(row.id))),
    }, null, 2),
  };
}

export async function exportLocalLoreData(): Promise<string> {
  const snapshot = await exportLocalLoreStorageSnapshot();
  const parsed = JSON.parse(snapshot.contents) as Record<string, unknown>;
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      ...parsed,
    },
    null,
    2,
  );
}

export async function clearLocalLoreData(): Promise<void> {
  const database = await getDatabase();
  await database.execute('DELETE FROM timeline_event_tags');
  await database.execute('DELETE FROM timeline_events');
  await database.execute('DELETE FROM timeline_tags');
  await database.execute('DELETE FROM timelines');
  await database.execute('DELETE FROM world_location_tags');
  await database.execute('DELETE FROM world_locations');
  await database.execute('DELETE FROM world_faction_tags');
  await database.execute('DELETE FROM world_factions');
  await database.execute('DELETE FROM world_characters');
  await database.execute('DELETE FROM world_tags');
  await database.execute('DELETE FROM worlds');
}

export async function importLocalLoreData(
  raw: string,
  options: { mode?: 'replace' | 'merge' } = {},
): Promise<{ worlds: number; timelines: number; events: number }> {
  const payload = JSON.parse(raw) as {
    worlds?: WorldRecord[];
    characters?: WorldCharacterRecord[];
    factions?: WorldFactionRecord[];
    locations?: WorldLocationRecord[];
    timelines?: TimelineRecord[];
    events?: TimelineEventRecord[];
  };

  const worlds = Array.isArray(payload.worlds) ? payload.worlds : [];
  const characters = Array.isArray(payload.characters) ? payload.characters : [];
  const factions = Array.isArray(payload.factions) ? payload.factions : [];
  const locations = Array.isArray(payload.locations) ? payload.locations : [];
  const timelines = Array.isArray(payload.timelines) ? payload.timelines : [];
  const events = Array.isArray(payload.events) ? payload.events : [];

  const database = await getDatabase();
  await database.execute('BEGIN');
  try {
    if (options.mode === 'replace') {
      await clearLocalLoreData();
    }

    for (const world of worlds) {
      await database.execute(
        'INSERT INTO worlds (id, name, description, genre, setting, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET name = excluded.name, description = excluded.description, genre = excluded.genre, setting = excluded.setting, notes = excluded.notes, updated_at = excluded.updated_at',
        [world.id, world.name, world.description ?? null, world.genre ?? null, world.setting ?? null, world.notes ?? null, world.createdAt, world.updatedAt],
      );
      await replaceLoreTags(database, 'world_tags', 'world_id', world.id, world.tags ?? []);
    }

    for (const character of characters) {
      await database.execute(
        'INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, draft_id = excluded.draft_id, character_name = excluded.character_name, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at',
        [character.id, character.worldId, character.draftId ?? null, character.characterName, character.role ?? null, character.notes ?? null, character.createdAt, character.updatedAt],
      );
    }

    for (const faction of factions) {
      await database.execute(
        'INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at',
        [faction.id, faction.worldId, faction.name, faction.description ?? null, faction.role ?? null, faction.notes ?? null, faction.createdAt, faction.updatedAt],
      );
      await replaceLoreTags(database, 'world_faction_tags', 'faction_id', faction.id, faction.tags ?? []);
    }

    for (const location of locations) {
      await database.execute(
        'INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, category = excluded.category, notes = excluded.notes, updated_at = excluded.updated_at',
        [location.id, location.worldId, location.name, location.description ?? null, location.category ?? null, location.notes ?? null, location.createdAt, location.updatedAt],
      );
      await replaceLoreTags(database, 'world_location_tags', 'location_id', location.id, location.tags ?? []);
    }

    for (const timeline of timelines) {
      await database.execute(
        'INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, start_date = excluded.start_date, end_date = excluded.end_date, updated_at = excluded.updated_at',
        [timeline.id, timeline.worldId, timeline.name, timeline.description ?? null, timeline.startDate ?? null, timeline.endDate ?? null, timeline.createdAt, timeline.updatedAt],
      );
      await replaceLoreTags(database, 'timeline_tags', 'timeline_id', timeline.id, timeline.tags ?? []);
    }

    for (const event of events) {
      await database.execute(
        'INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT(id) DO UPDATE SET timeline_id = excluded.timeline_id, title = excluded.title, description = excluded.description, event_date = excluded.event_date, sort_order = excluded.sort_order, metadata_json = excluded.metadata_json, updated_at = excluded.updated_at',
        [event.id, event.timelineId, event.title, event.description ?? null, event.eventDate ?? null, event.sortOrder, JSON.stringify(event.metadata ?? {}), event.createdAt, event.updatedAt],
      );
      await replaceLoreTags(database, 'timeline_event_tags', 'event_id', event.id, event.tags ?? []);
    }

    await database.execute('COMMIT');
  } catch (error) {
    try {
      await database.execute('ROLLBACK');
    } catch {
      // Ignore rollback failures.
    }
    throw error;
  }

  return {
    worlds: worlds.length,
    timelines: timelines.length,
    events: events.length,
  };
}

export function getDesktopLoreExportFileName(): string {
  return DESKTOP_LORE_EXPORT_FILE;
}