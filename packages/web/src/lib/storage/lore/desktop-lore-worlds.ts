/**
 * World, character, faction, location and relationship CRUD for the desktop lore
 * store.
 */

import type {
  WorldCharacterDraftLinkRecord,
  WorldCharacterRecord,
  WorldFactionRecord,
  WorldLocationRecord,
  WorldRecord,
  WorldRelationshipRecord,
} from '@char-gen/shared';
import {
  SqlWorldRow,
  SqlCharacterRow,
  SqlWorldCharacterDraftLinkRow,
  SqlFactionRow,
  SqlLocationRow,
  SqlRelationshipRow,
  SqlTimelineRow,
  SqlWorldRelationshipAuditIssueRow,
  createId,
  nowIso,
  getDatabase,
  loadLoreTagMap,
  replaceLoreTags,
  normalizeStringList,
  coerceStringList,
  loadLoreDraftLinkMap,
  replaceLoreDraftLinks,
  worldFromRow,
  characterFromRow,
  draftLinkFromRow,
  worldRelationshipAuditIssueFromRow,
  factionFromRow,
  locationFromRow,
  relationshipFromRow,
  timelineFromRow,
} from './desktop-lore-sql.js';

export async function getLocalWorlds(params?: {
  search?: string;
  genre?: string;
  includePublic?: boolean;
}): Promise<{ worlds: WorldRecord[] }> {
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

  const rows = await database.select<
    Array<
      SqlWorldRow & {
        characterCount: number;
        timelineCount: number;
        factionCount: number;
        locationCount: number;
      }
    >[number]
  >(query, bindValues);

  const tagMap = await loadLoreTagMap(
    database,
    'world_tags',
    'world_id',
    rows.map((row) => row.id),
  );

  return {
    worlds: rows.map((row) =>
      worldFromRow(
        row,
        {
          characters: Number(row.characterCount ?? 0),
          timelines: Number(row.timelineCount ?? 0),
          factions: Number(row.factionCount ?? 0),
          locations: Number(row.locationCount ?? 0),
        },
        tagMap.get(row.id),
      ),
    ),
  };
}

export async function getLocalWorld(id: string): Promise<{ world: WorldRecord }> {
  const database = await getDatabase();
  const worldRows = await database.select<SqlWorldRow>(
    'SELECT id, name, description, genre, setting, notes, created_at AS createdAt, updated_at AS updatedAt FROM worlds WHERE id = $1 LIMIT 1',
    [id],
  );
  const worldRow = worldRows[0];
  if (!worldRow) {
    throw new Error('World not found');
  }

  const [characters, factions, locations, relationships, timelines] = await Promise.all([
    database.select<SqlCharacterRow>(
      'SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE world_id = $1 ORDER BY updated_at DESC',
      [id],
    ),
    database.select<SqlFactionRow>(
      'SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE world_id = $1 ORDER BY updated_at DESC',
      [id],
    ),
    database.select<SqlLocationRow>(
      'SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE world_id = $1 ORDER BY updated_at DESC',
      [id],
    ),
    database.select<SqlRelationshipRow>(
      'SELECT id, world_id AS worldId, source_character_id AS sourceCharacterId, target_character_id AS targetCharacterId, label, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_relationships WHERE world_id = $1 ORDER BY updated_at DESC, created_at DESC',
      [id],
    ),
    database.select<SqlTimelineRow>(
      'SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE world_id = $1 ORDER BY updated_at DESC',
      [id],
    ),
  ]);

  const [worldTagMap, factionTagMap, locationTagMap, timelineTagMap, factionDraftLinkMap, locationDraftLinkMap] =
    await Promise.all([
      loadLoreTagMap(database, 'world_tags', 'world_id', [id]),
      loadLoreTagMap(
        database,
        'world_faction_tags',
        'faction_id',
        factions.map((entry) => entry.id),
      ),
      loadLoreTagMap(
        database,
        'world_location_tags',
        'location_id',
        locations.map((entry) => entry.id),
      ),
      loadLoreTagMap(
        database,
        'timeline_tags',
        'timeline_id',
        timelines.map((entry) => entry.id),
      ),
      loadLoreDraftLinkMap(
        database,
        'world_faction_draft_links',
        'faction_id',
        factions.map((entry) => entry.id),
      ),
      loadLoreDraftLinkMap(
        database,
        'world_location_draft_links',
        'location_id',
        locations.map((entry) => entry.id),
      ),
    ]);

  const timelineCounts = new Map<string, number>();
  if (timelines.length > 0) {
    const placeholders = timelines.map((_, index) => `$${index + 1}`).join(', ');
    const countRows = await database.select<{ timelineId: string; eventCount: number }>(
      `SELECT timeline_id AS timelineId, COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id IN (${placeholders}) GROUP BY timeline_id`,
      timelines.map((timeline) => timeline.id),
    );
    countRows.forEach((row) => timelineCounts.set(row.timelineId, Number(row.eventCount ?? 0)));
  }

  return {
    world: {
      ...worldFromRow(
        worldRow,
        {
          characters: characters.length,
          timelines: timelines.length,
          factions: factions.length,
          locations: locations.length,
        },
        worldTagMap.get(id),
      ),
      characters: characters.map(characterFromRow),
      factions: factions.map((faction) =>
        factionFromRow(faction, factionTagMap.get(faction.id), factionDraftLinkMap.get(faction.id)),
      ),
      locations: locations.map((location) =>
        locationFromRow(location, locationTagMap.get(location.id), locationDraftLinkMap.get(location.id)),
      ),
      relationships: relationships.map(relationshipFromRow),
      timelines: timelines.map((timeline) =>
        timelineFromRow(timeline, timelineCounts.get(timeline.id) ?? 0, timelineTagMap.get(timeline.id)),
      ),
    },
  };
}

export async function getLocalWorldCharacterDraftLinks(params?: {
  draftIds?: string[];
}): Promise<{ links: WorldCharacterDraftLinkRecord[] }> {
  const database = await getDatabase();
  const bindValues: unknown[] = [];
  const clauses = ['world_characters.draft_id IS NOT NULL'];

  if (params?.draftIds?.length) {
    const placeholders = params.draftIds.map((_, index) => `$${bindValues.length + index + 1}`).join(', ');
    clauses.push(`world_characters.draft_id IN (${placeholders})`);
    bindValues.push(...params.draftIds);
  }

  const rows = await database.select<SqlWorldCharacterDraftLinkRow>(
    `SELECT
      world_characters.world_id AS worldId,
      worlds.name AS worldName,
      world_characters.id AS characterId,
      world_characters.draft_id AS draftId,
      world_characters.character_name AS characterName,
      world_characters.role,
      world_characters.updated_at AS updatedAt
    FROM world_characters
    INNER JOIN worlds ON worlds.id = world_characters.world_id
    ${clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : ''}
    ORDER BY world_characters.updated_at DESC`,
    bindValues,
  );

  return { links: rows.map(draftLinkFromRow) };
}

export async function getLocalWorldRelationshipAuditIssues(): Promise<{
  issues: Array<{
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
  }>;
}> {
  const database = await getDatabase();
  const rows = await database.select<SqlWorldRelationshipAuditIssueRow>(
    `SELECT
      world_relationships.world_id AS worldId,
      worlds.name AS worldName,
      world_relationships.id AS relationshipId,
      world_relationships.label,
      world_relationships.source_character_id AS sourceCharacterId,
      source_characters.character_name AS sourceCharacterName,
      world_relationships.target_character_id AS targetCharacterId,
      target_characters.character_name AS targetCharacterName,
      world_relationships.updated_at AS updatedAt
    FROM world_relationships
    INNER JOIN worlds ON worlds.id = world_relationships.world_id
    LEFT JOIN world_characters AS source_characters ON source_characters.id = world_relationships.source_character_id
    LEFT JOIN world_characters AS target_characters ON target_characters.id = world_relationships.target_character_id
    WHERE source_characters.id IS NULL OR target_characters.id IS NULL
    ORDER BY world_relationships.updated_at DESC, world_relationships.created_at DESC`,
  );

  return { issues: rows.map(worldRelationshipAuditIssueFromRow) };
}

export async function createLocalWorld(data: {
  name: string;
  description?: string;
  genre?: string;
  setting?: string;
  notes?: string;
  tags?: string[];
  isPublic?: boolean;
}): Promise<{ world: WorldRecord }> {
  const database = await getDatabase();
  const id = createId('world');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO worlds (id, name, description, genre, setting, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      id,
      data.name.trim(),
      data.description?.trim() || null,
      data.genre?.trim() || null,
      data.setting?.trim() || null,
      data.notes?.trim() || null,
      timestamp,
      timestamp,
    ],
  );
  await replaceLoreTags(database, 'world_tags', 'world_id', id, data.tags ?? []);
  return getLocalWorld(id);
}

export async function updateLocalWorld(id: string, data: Record<string, unknown>): Promise<{ world: WorldRecord }> {
  const existing = await getLocalWorld(id);
  const nextName = typeof data.name === 'string' ? data.name.trim() : existing.world.name;
  const nextDescription =
    typeof data.description === 'string' ? data.description.trim() || null : (existing.world.description ?? null);
  const nextGenre = typeof data.genre === 'string' ? data.genre.trim() || null : (existing.world.genre ?? null);
  const nextSetting = typeof data.setting === 'string' ? data.setting.trim() || null : (existing.world.setting ?? null);
  const nextNotes = typeof data.notes === 'string' ? data.notes.trim() || null : (existing.world.notes ?? null);
  const nextTags = Array.isArray(data.tags)
    ? data.tags.filter((entry): entry is string => typeof entry === 'string')
    : existing.world.tags;

  const database = await getDatabase();
  await database.execute(
    'UPDATE worlds SET name = $1, description = $2, genre = $3, setting = $4, notes = $5, updated_at = $6 WHERE id = $7',
    [nextName, nextDescription, nextGenre, nextSetting, nextNotes, nowIso(), id],
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
  await database.execute('DELETE FROM world_relationships WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM world_characters WHERE world_id = $1', [id]);
  await database.execute(
    'DELETE FROM world_faction_draft_links WHERE faction_id IN (SELECT id FROM world_factions WHERE world_id = $1)',
    [id],
  );
  await database.execute(
    'DELETE FROM world_faction_tags WHERE faction_id IN (SELECT id FROM world_factions WHERE world_id = $1)',
    [id],
  );
  await database.execute('DELETE FROM world_factions WHERE world_id = $1', [id]);
  await database.execute(
    'DELETE FROM world_location_draft_links WHERE location_id IN (SELECT id FROM world_locations WHERE world_id = $1)',
    [id],
  );
  await database.execute(
    'DELETE FROM world_location_tags WHERE location_id IN (SELECT id FROM world_locations WHERE world_id = $1)',
    [id],
  );
  await database.execute('DELETE FROM world_locations WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM world_tags WHERE world_id = $1', [id]);
  await database.execute('DELETE FROM worlds WHERE id = $1', [id]);
  return { message: 'World deleted' };
}

export async function addLocalWorldCharacter(
  worldId: string,
  data: { draftId?: string; characterName: string; role?: string; notes?: string },
): Promise<{ character: WorldCharacterRecord }> {
  const database = await getDatabase();
  const id = createId('char');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO world_characters (id, world_id, draft_id, character_name, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      id,
      worldId,
      data.draftId ?? null,
      data.characterName.trim(),
      data.role?.trim() || null,
      data.notes?.trim() || null,
      timestamp,
      timestamp,
    ],
  );
  const rows = await database.select<SqlCharacterRow>(
    'SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1',
    [id],
  );
  return { character: characterFromRow(rows[0]) };
}

export async function updateLocalWorldCharacter(
  worldId: string,
  characterId: string,
  data: Record<string, unknown>,
): Promise<{ character: WorldCharacterRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlCharacterRow>(
    'SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 AND world_id = $2 LIMIT 1',
    [characterId, worldId],
  );
  const existing = rows[0];
  if (!existing) {
    throw new Error('Character not found');
  }
  const characterName = typeof data.characterName === 'string' ? data.characterName.trim() : existing.characterName;
  const role = typeof data.role === 'string' ? data.role.trim() || null : (existing.role ?? null);
  const notes = typeof data.notes === 'string' ? data.notes.trim() || null : (existing.notes ?? null);
  const draftId = typeof data.draftId === 'string' ? data.draftId.trim() || null : (existing.draftId ?? null);
  await database.execute(
    'UPDATE world_characters SET draft_id = $1, character_name = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7',
    [draftId, characterName, role, notes, nowIso(), characterId, worldId],
  );
  const updated = await database.select<SqlCharacterRow>(
    'SELECT id, world_id AS worldId, draft_id AS draftId, character_name AS characterName, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_characters WHERE id = $1 LIMIT 1',
    [characterId],
  );
  return { character: characterFromRow(updated[0]) };
}

export async function deleteLocalWorldCharacter(worldId: string, characterId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM world_relationships WHERE source_character_id = $1 OR target_character_id = $1', [
    characterId,
  ]);
  await database.execute('DELETE FROM world_characters WHERE id = $1 AND world_id = $2', [characterId, worldId]);
  return { message: 'Character removed' };
}

export async function addLocalWorldFaction(
  worldId: string,
  data: { name: string; description?: string; role?: string; notes?: string; tags?: string[]; draftIds?: string[] },
): Promise<{ faction: WorldFactionRecord }> {
  const database = await getDatabase();
  const id = createId('faction');
  const timestamp = nowIso();
  const tags = normalizeStringList(data.tags ?? []);
  const draftIds = normalizeStringList(data.draftIds ?? []);
  await database.execute(
    'INSERT INTO world_factions (id, world_id, name, description, role, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      id,
      worldId,
      data.name.trim(),
      data.description?.trim() || null,
      data.role?.trim() || null,
      data.notes?.trim() || null,
      timestamp,
      timestamp,
    ],
  );
  await replaceLoreTags(database, 'world_faction_tags', 'faction_id', id, tags);
  await replaceLoreDraftLinks(database, 'world_faction_draft_links', 'faction_id', id, draftIds);
  const rows = await database.select<SqlFactionRow>(
    'SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1',
    [id],
  );
  return { faction: factionFromRow(rows[0], tags, draftIds) };
}

export async function updateLocalWorldFaction(
  worldId: string,
  factionId: string,
  data: Record<string, unknown>,
): Promise<{ faction: WorldFactionRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlFactionRow>(
    'SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 AND world_id = $2 LIMIT 1',
    [factionId, worldId],
  );
  const existing = rows[0];
  if (!existing) {
    throw new Error('Faction not found');
  }
  const [existingTags, existingDraftIds] = await Promise.all([
    loadLoreTagMap(database, 'world_faction_tags', 'faction_id', [factionId]).then(
      (tagMap) => tagMap.get(factionId) ?? [],
    ),
    loadLoreDraftLinkMap(database, 'world_faction_draft_links', 'faction_id', [factionId]).then(
      (draftLinkMap) => draftLinkMap.get(factionId) ?? [],
    ),
  ]);
  const name = typeof data.name === 'string' ? data.name.trim() : existing.name;
  const description =
    typeof data.description === 'string' ? data.description.trim() || null : (existing.description ?? null);
  const role = typeof data.role === 'string' ? data.role.trim() || null : (existing.role ?? null);
  const notes = typeof data.notes === 'string' ? data.notes.trim() || null : (existing.notes ?? null);
  const tags = coerceStringList(data.tags) ?? existingTags;
  const draftIds = coerceStringList(data.draftIds) ?? existingDraftIds;
  await database.execute(
    'UPDATE world_factions SET name = $1, description = $2, role = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7',
    [name, description, role, notes, nowIso(), factionId, worldId],
  );
  await replaceLoreTags(database, 'world_faction_tags', 'faction_id', factionId, tags);
  await replaceLoreDraftLinks(database, 'world_faction_draft_links', 'faction_id', factionId, draftIds);
  const updated = await database.select<SqlFactionRow>(
    'SELECT id, world_id AS worldId, name, description, role, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_factions WHERE id = $1 LIMIT 1',
    [factionId],
  );
  return { faction: factionFromRow(updated[0], tags, draftIds) };
}

export async function deleteLocalWorldFaction(worldId: string, factionId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM world_faction_draft_links WHERE faction_id = $1', [factionId]);
  await database.execute('DELETE FROM world_faction_tags WHERE faction_id = $1', [factionId]);
  await database.execute('DELETE FROM world_factions WHERE id = $1 AND world_id = $2', [factionId, worldId]);
  return { message: 'Faction removed' };
}

export async function addLocalWorldLocation(
  worldId: string,
  data: { name: string; description?: string; category?: string; notes?: string; tags?: string[]; draftIds?: string[] },
): Promise<{ location: WorldLocationRecord }> {
  const database = await getDatabase();
  const id = createId('location');
  const timestamp = nowIso();
  const tags = normalizeStringList(data.tags ?? []);
  const draftIds = normalizeStringList(data.draftIds ?? []);
  await database.execute(
    'INSERT INTO world_locations (id, world_id, name, description, category, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      id,
      worldId,
      data.name.trim(),
      data.description?.trim() || null,
      data.category?.trim() || null,
      data.notes?.trim() || null,
      timestamp,
      timestamp,
    ],
  );
  await replaceLoreTags(database, 'world_location_tags', 'location_id', id, tags);
  await replaceLoreDraftLinks(database, 'world_location_draft_links', 'location_id', id, draftIds);
  const rows = await database.select<SqlLocationRow>(
    'SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1',
    [id],
  );
  return { location: locationFromRow(rows[0], tags, draftIds) };
}

export async function updateLocalWorldLocation(
  worldId: string,
  locationId: string,
  data: Record<string, unknown>,
): Promise<{ location: WorldLocationRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlLocationRow>(
    'SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 AND world_id = $2 LIMIT 1',
    [locationId, worldId],
  );
  const existing = rows[0];
  if (!existing) {
    throw new Error('Location not found');
  }
  const [existingTags, existingDraftIds] = await Promise.all([
    loadLoreTagMap(database, 'world_location_tags', 'location_id', [locationId]).then(
      (tagMap) => tagMap.get(locationId) ?? [],
    ),
    loadLoreDraftLinkMap(database, 'world_location_draft_links', 'location_id', [locationId]).then(
      (draftLinkMap) => draftLinkMap.get(locationId) ?? [],
    ),
  ]);
  const name = typeof data.name === 'string' ? data.name.trim() : existing.name;
  const description =
    typeof data.description === 'string' ? data.description.trim() || null : (existing.description ?? null);
  const category = typeof data.category === 'string' ? data.category.trim() || null : (existing.category ?? null);
  const notes = typeof data.notes === 'string' ? data.notes.trim() || null : (existing.notes ?? null);
  const tags = coerceStringList(data.tags) ?? existingTags;
  const draftIds = coerceStringList(data.draftIds) ?? existingDraftIds;
  await database.execute(
    'UPDATE world_locations SET name = $1, description = $2, category = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7',
    [name, description, category, notes, nowIso(), locationId, worldId],
  );
  await replaceLoreTags(database, 'world_location_tags', 'location_id', locationId, tags);
  await replaceLoreDraftLinks(database, 'world_location_draft_links', 'location_id', locationId, draftIds);
  const updated = await database.select<SqlLocationRow>(
    'SELECT id, world_id AS worldId, name, description, category, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_locations WHERE id = $1 LIMIT 1',
    [locationId],
  );
  return { location: locationFromRow(updated[0], tags, draftIds) };
}

export async function deleteLocalWorldLocation(worldId: string, locationId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM world_location_draft_links WHERE location_id = $1', [locationId]);
  await database.execute('DELETE FROM world_location_tags WHERE location_id = $1', [locationId]);
  await database.execute('DELETE FROM world_locations WHERE id = $1 AND world_id = $2', [locationId, worldId]);
  return { message: 'Location removed' };
}

export async function addLocalWorldRelationship(
  worldId: string,
  data: { sourceCharacterId: string; targetCharacterId: string; label: string; notes?: string },
): Promise<{ relationship: WorldRelationshipRecord }> {
  const database = await getDatabase();
  const id = createId('relationship');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO world_relationships (id, world_id, source_character_id, target_character_id, label, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      id,
      worldId,
      data.sourceCharacterId.trim(),
      data.targetCharacterId.trim(),
      data.label.trim(),
      data.notes?.trim() || null,
      timestamp,
      timestamp,
    ],
  );
  const rows = await database.select<SqlRelationshipRow>(
    'SELECT id, world_id AS worldId, source_character_id AS sourceCharacterId, target_character_id AS targetCharacterId, label, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_relationships WHERE id = $1 LIMIT 1',
    [id],
  );
  return { relationship: relationshipFromRow(rows[0]) };
}

export async function updateLocalWorldRelationship(
  worldId: string,
  relationshipId: string,
  data: Record<string, unknown>,
): Promise<{ relationship: WorldRelationshipRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlRelationshipRow>(
    'SELECT id, world_id AS worldId, source_character_id AS sourceCharacterId, target_character_id AS targetCharacterId, label, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_relationships WHERE id = $1 AND world_id = $2 LIMIT 1',
    [relationshipId, worldId],
  );
  const existing = rows[0];
  if (!existing) {
    throw new Error('Relationship not found');
  }

  const sourceCharacterId =
    typeof data.sourceCharacterId === 'string' ? data.sourceCharacterId.trim() : existing.sourceCharacterId;
  const targetCharacterId =
    typeof data.targetCharacterId === 'string' ? data.targetCharacterId.trim() : existing.targetCharacterId;
  const label = typeof data.label === 'string' ? data.label.trim() : existing.label;
  const notes = typeof data.notes === 'string' ? data.notes.trim() || null : (existing.notes ?? null);

  await database.execute(
    'UPDATE world_relationships SET source_character_id = $1, target_character_id = $2, label = $3, notes = $4, updated_at = $5 WHERE id = $6 AND world_id = $7',
    [sourceCharacterId, targetCharacterId, label, notes, nowIso(), relationshipId, worldId],
  );

  const updated = await database.select<SqlRelationshipRow>(
    'SELECT id, world_id AS worldId, source_character_id AS sourceCharacterId, target_character_id AS targetCharacterId, label, notes, created_at AS createdAt, updated_at AS updatedAt FROM world_relationships WHERE id = $1 LIMIT 1',
    [relationshipId],
  );
  return { relationship: relationshipFromRow(updated[0]) };
}

export async function deleteLocalWorldRelationship(
  worldId: string,
  relationshipId: string,
): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM world_relationships WHERE id = $1 AND world_id = $2', [relationshipId, worldId]);
  return { message: 'Relationship removed' };
}
