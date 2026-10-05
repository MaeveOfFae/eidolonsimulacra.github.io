/**
 * Diagnostics, export and import for the desktop lore store — the whole-store
 * operations, as opposed to the per-record CRUD in the sibling modules.
 */

import type {
  TimelineEventRecord,
  TimelineRecord,
  WorldCharacterRecord,
  WorldFactionRecord,
  WorldLocationRecord,
  WorldRecord,
  WorldRelationshipRecord,
} from '@char-gen/shared';
import {
  DESKTOP_LORE_DB_FILE,
  DESKTOP_LORE_DB_CONNECTION,
  DESKTOP_LORE_SNAPSHOT_FILE,
  DESKTOP_LORE_EXPORT_FILE,
  DesktopLoreStorageDiagnostics,
  SqlWorldRow,
  SqlCharacterRow,
  SqlFactionRow,
  SqlLocationRow,
  SqlRelationshipRow,
  SqlTimelineRow,
  SqlTimelineEventRow,
  getDatabase,
  loadLoreTagMap,
  replaceLoreTags,
  loadLoreDraftLinkMap,
  replaceLoreDraftLinks,
  worldFromRow,
  characterFromRow,
  factionFromRow,
  locationFromRow,
  relationshipFromRow,
  timelineFromRow,
  timelineEventFromRow,
} from './desktop-lore-sql.js';

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
  const [worlds, characters, factions, locations, relationships, timelines, events] = await Promise.all([
    database.select<SqlWorldRow>(
      'SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds ORDER BY updated_at DESC',
    ),
    database.select<SqlCharacterRow>(
      'SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters ORDER BY updated_at DESC',
    ),
    database.select<SqlFactionRow>(
      'SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions ORDER BY updated_at DESC',
    ),
    database.select<SqlLocationRow>(
      'SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations ORDER BY updated_at DESC',
    ),
    database.select<SqlRelationshipRow>(
      'SELECT id, world_id AS worldId, source_character_id AS sourceCharacterId, target_character_id AS targetCharacterId, label, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_relationships ORDER BY updated_at DESC',
    ),
    database.select<SqlTimelineRow>(
      'SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines ORDER BY updated_at DESC',
    ),
    database.select<SqlTimelineEventRow>(
      'SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events ORDER BY updated_at DESC',
    ),
  ]);

  const [
    worldTagMap,
    factionTagMap,
    locationTagMap,
    timelineTagMap,
    eventTagMap,
    factionDraftLinkMap,
    locationDraftLinkMap,
  ] = await Promise.all([
    loadLoreTagMap(
      database,
      'world_tags',
      'world_id',
      worlds.map((row) => row.id),
    ),
    loadLoreTagMap(
      database,
      'world_faction_tags',
      'faction_id',
      factions.map((row) => row.id),
    ),
    loadLoreTagMap(
      database,
      'world_location_tags',
      'location_id',
      locations.map((row) => row.id),
    ),
    loadLoreTagMap(
      database,
      'timeline_tags',
      'timeline_id',
      timelines.map((row) => row.id),
    ),
    loadLoreTagMap(
      database,
      'timeline_event_tags',
      'event_id',
      events.map((row) => row.id),
    ),
    loadLoreDraftLinkMap(
      database,
      'world_faction_draft_links',
      'faction_id',
      factions.map((row) => row.id),
    ),
    loadLoreDraftLinkMap(
      database,
      'world_location_draft_links',
      'location_id',
      locations.map((row) => row.id),
    ),
  ]);

  return {
    fileName: DESKTOP_LORE_SNAPSHOT_FILE,
    contents: JSON.stringify(
      {
        version: 1,
        worlds: worlds.map((row) => worldFromRow(row, undefined, worldTagMap.get(row.id))),
        characters: characters.map(characterFromRow),
        factions: factions.map((row) =>
          factionFromRow(row, factionTagMap.get(row.id), factionDraftLinkMap.get(row.id)),
        ),
        locations: locations.map((row) =>
          locationFromRow(row, locationTagMap.get(row.id), locationDraftLinkMap.get(row.id)),
        ),
        relationships: relationships.map(relationshipFromRow),
        timelines: timelines.map((row) => timelineFromRow(row, 0, timelineTagMap.get(row.id))),
        events: events.map((row) => timelineEventFromRow(row, eventTagMap.get(row.id))),
      },
      null,
      2,
    ),
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
  await database.execute('DELETE FROM world_relationships');
  await database.execute('DELETE FROM world_location_draft_links');
  await database.execute('DELETE FROM world_location_tags');
  await database.execute('DELETE FROM world_locations');
  await database.execute('DELETE FROM world_faction_draft_links');
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
    relationships?: WorldRelationshipRecord[];
    timelines?: TimelineRecord[];
    events?: TimelineEventRecord[];
  };

  const worlds = Array.isArray(payload.worlds) ? payload.worlds : [];
  const characters = Array.isArray(payload.characters) ? payload.characters : [];
  const factions = Array.isArray(payload.factions) ? payload.factions : [];
  const locations = Array.isArray(payload.locations) ? payload.locations : [];
  const relationships = Array.isArray(payload.relationships) ? payload.relationships : [];
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
        [
          world.id,
          world.name,
          world.description ?? null,
          world.genre ?? null,
          world.setting ?? null,
          world.notes ?? null,
          world.createdAt,
          world.updatedAt,
        ],
      );
      await replaceLoreTags(database, 'world_tags', 'world_id', world.id, world.tags ?? []);
    }

    for (const character of characters) {
      await database.execute(
        'INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, draft_id = excluded.draft_id, character_name = excluded.character_name, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at',
        [
          character.id,
          character.worldId,
          character.draftId ?? null,
          character.characterName,
          character.role ?? null,
          character.notes ?? null,
          character.createdAt,
          character.updatedAt,
        ],
      );
    }

    for (const faction of factions) {
      await database.execute(
        'INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, role = excluded.role, notes = excluded.notes, updated_at = excluded.updated_at',
        [
          faction.id,
          faction.worldId,
          faction.name,
          faction.description ?? null,
          faction.role ?? null,
          faction.notes ?? null,
          faction.createdAt,
          faction.updatedAt,
        ],
      );
      await replaceLoreTags(database, 'world_faction_tags', 'faction_id', faction.id, faction.tags ?? []);
      await replaceLoreDraftLinks(
        database,
        'world_faction_draft_links',
        'faction_id',
        faction.id,
        faction.draftIds ?? [],
      );
    }

    for (const location of locations) {
      await database.execute(
        'INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, category = excluded.category, notes = excluded.notes, updated_at = excluded.updated_at',
        [
          location.id,
          location.worldId,
          location.name,
          location.description ?? null,
          location.category ?? null,
          location.notes ?? null,
          location.createdAt,
          location.updatedAt,
        ],
      );
      await replaceLoreTags(database, 'world_location_tags', 'location_id', location.id, location.tags ?? []);
      await replaceLoreDraftLinks(
        database,
        'world_location_draft_links',
        'location_id',
        location.id,
        location.draftIds ?? [],
      );
    }

    for (const relationship of relationships) {
      await database.execute(
        'INSERT INTO world_relationships (id, world_id, source_character_id, target_character_id, label, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, source_character_id = excluded.source_character_id, target_character_id = excluded.target_character_id, label = excluded.label, notes = excluded.notes, updated_at = excluded.updated_at',
        [
          relationship.id,
          relationship.worldId,
          relationship.sourceCharacterId,
          relationship.targetCharacterId,
          relationship.label,
          relationship.notes ?? null,
          relationship.createdAt,
          relationship.updatedAt,
        ],
      );
    }

    for (const timeline of timelines) {
      await database.execute(
        'INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT(id) DO UPDATE SET world_id = excluded.world_id, name = excluded.name, description = excluded.description, start_date = excluded.start_date, end_date = excluded.end_date, updated_at = excluded.updated_at',
        [
          timeline.id,
          timeline.worldId,
          timeline.name,
          timeline.description ?? null,
          timeline.startDate ?? null,
          timeline.endDate ?? null,
          timeline.createdAt,
          timeline.updatedAt,
        ],
      );
      await replaceLoreTags(database, 'timeline_tags', 'timeline_id', timeline.id, timeline.tags ?? []);
    }

    for (const event of events) {
      await database.execute(
        'INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT(id) DO UPDATE SET timeline_id = excluded.timeline_id, title = excluded.title, description = excluded.description, event_date = excluded.event_date, sort_order = excluded.sort_order, metadata_json = excluded.metadata_json, updated_at = excluded.updated_at',
        [
          event.id,
          event.timelineId,
          event.title,
          event.description ?? null,
          event.eventDate ?? null,
          event.sortOrder,
          JSON.stringify(event.metadata ?? {}),
          event.createdAt,
          event.updatedAt,
        ],
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
