/**
 * Timeline and timeline-event CRUD for the desktop lore store.
 */

import type { TimelineEventRecord, TimelineRecord } from '@char-gen/shared';
import {
  SqlTimelineRow,
  SqlTimelineEventRow,
  createId,
  nowIso,
  parseMetadata,
  getDatabase,
  loadLoreTagMap,
  replaceLoreTags,
  timelineFromRow,
  timelineEventFromRow,
} from './desktop-lore-sql.js';

export async function createLocalTimeline(data: {
  worldId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}): Promise<{ timeline: TimelineRecord }> {
  const database = await getDatabase();
  const id = createId('timeline');
  const timestamp = nowIso();
  await database.execute(
    'INSERT INTO timelines (id, world_id, name, description, start_date, end_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [
      id,
      data.worldId,
      data.name.trim(),
      data.description?.trim() || null,
      data.startDate?.trim() || null,
      data.endDate?.trim() || null,
      timestamp,
      timestamp,
    ],
  );
  await replaceLoreTags(database, 'timeline_tags', 'timeline_id', id, data.tags ?? []);
  return getLocalTimeline(id);
}

export async function getLocalTimeline(id: string): Promise<{ timeline: TimelineRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlTimelineRow>(
    'SELECT id, world_id AS worldId, name, description, start_date AS startDate, end_date AS endDate, created_at AS createdAt, updated_at AS updatedAt FROM timelines WHERE id = $1 LIMIT 1',
    [id],
  );
  const timelineRow = rows[0];
  if (!timelineRow) {
    throw new Error('Timeline not found');
  }
  const eventRows = await database.select<SqlTimelineEventRow>(
    'SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE timeline_id = $1 ORDER BY sort_order ASC, created_at ASC',
    [id],
  );
  const [timelineTagMap, eventTagMap] = await Promise.all([
    loadLoreTagMap(database, 'timeline_tags', 'timeline_id', [id]),
    loadLoreTagMap(
      database,
      'timeline_event_tags',
      'event_id',
      eventRows.map((event) => event.id),
    ),
  ]);
  return {
    timeline: {
      ...timelineFromRow(timelineRow, eventRows.length, timelineTagMap.get(id)),
      events: eventRows.map((event) => timelineEventFromRow(event, eventTagMap.get(event.id))),
    },
  };
}

export async function updateLocalTimeline(
  id: string,
  data: Record<string, unknown>,
): Promise<{ timeline: TimelineRecord }> {
  const existing = await getLocalTimeline(id);
  const database = await getDatabase();
  const name = typeof data.name === 'string' ? data.name.trim() : existing.timeline.name;
  const description =
    typeof data.description === 'string' ? data.description.trim() || null : (existing.timeline.description ?? null);
  const startDate =
    typeof data.startDate === 'string' ? data.startDate.trim() || null : (existing.timeline.startDate ?? null);
  const endDate = typeof data.endDate === 'string' ? data.endDate.trim() || null : (existing.timeline.endDate ?? null);
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((entry): entry is string => typeof entry === 'string')
    : existing.timeline.tags;
  await database.execute(
    'UPDATE timelines SET name = $1, description = $2, start_date = $3, end_date = $4, updated_at = $5 WHERE id = $6',
    [name, description, startDate, endDate, nowIso(), id],
  );
  await replaceLoreTags(database, 'timeline_tags', 'timeline_id', id, tags);
  return getLocalTimeline(id);
}

export async function deleteLocalTimeline(id: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute(
    'DELETE FROM timeline_event_tags WHERE event_id IN (SELECT id FROM timeline_events WHERE timeline_id = $1)',
    [id],
  );
  await database.execute('DELETE FROM timeline_events WHERE timeline_id = $1', [id]);
  await database.execute('DELETE FROM timeline_tags WHERE timeline_id = $1', [id]);
  await database.execute('DELETE FROM timelines WHERE id = $1', [id]);
  return { message: 'Timeline deleted' };
}

export async function addLocalTimelineEvent(
  timelineId: string,
  data: {
    title: string;
    description?: string;
    eventDate?: string;
    sortOrder?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
  },
): Promise<{ event: TimelineEventRecord }> {
  const database = await getDatabase();
  const id = createId('event');
  const timestamp = nowIso();
  const currentCount = await database.select<{ eventCount: number }>(
    'SELECT COUNT(*) AS eventCount FROM timeline_events WHERE timeline_id = $1',
    [timelineId],
  );
  const sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : Number(currentCount[0]?.eventCount ?? 0);
  await database.execute(
    'INSERT INTO timeline_events (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
    [
      id,
      timelineId,
      data.title.trim(),
      data.description?.trim() || null,
      data.eventDate?.trim() || null,
      sortOrder,
      JSON.stringify(data.metadata ?? {}),
      timestamp,
      timestamp,
    ],
  );
  await replaceLoreTags(database, 'timeline_event_tags', 'event_id', id, data.tags ?? []);
  const rows = await database.select<SqlTimelineEventRow>(
    'SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1',
    [id],
  );
  return { event: timelineEventFromRow(rows[0], data.tags ?? []) };
}

export async function updateLocalTimelineEvent(
  timelineId: string,
  eventId: string,
  data: Record<string, unknown>,
): Promise<{ event: TimelineEventRecord }> {
  const database = await getDatabase();
  const rows = await database.select<SqlTimelineEventRow>(
    'SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 AND timeline_id = $2 LIMIT 1',
    [eventId, timelineId],
  );
  const existing = rows[0];
  if (!existing) {
    throw new Error('Timeline event not found');
  }
  const title = typeof data.title === 'string' ? data.title.trim() : existing.title;
  const description =
    typeof data.description === 'string' ? data.description.trim() || null : (existing.description ?? null);
  const eventDate = typeof data.eventDate === 'string' ? data.eventDate.trim() || null : (existing.eventDate ?? null);
  const sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : existing.sortOrder;
  const tags = Array.isArray(data.tags) ? data.tags.filter((entry): entry is string => typeof entry === 'string') : [];
  const metadata =
    data.metadata && typeof data.metadata === 'object' && !Array.isArray(data.metadata)
      ? (data.metadata as Record<string, unknown>)
      : parseMetadata(existing.metadataJson);
  await database.execute(
    'UPDATE timeline_events SET title = $1, description = $2, event_date = $3, sort_order = $4, metadata_json = $5, updated_at = $6 WHERE id = $7 AND timeline_id = $8',
    [title, description, eventDate, sortOrder, JSON.stringify(metadata), nowIso(), eventId, timelineId],
  );
  await replaceLoreTags(database, 'timeline_event_tags', 'event_id', eventId, tags);
  const updated = await database.select<SqlTimelineEventRow>(
    'SELECT id, timeline_id AS timelineId, title, description, event_date AS eventDate, sort_order AS sortOrder, metadata_json AS metadataJson, created_at AS createdAt, updated_at AS updatedAt FROM timeline_events WHERE id = $1 LIMIT 1',
    [eventId],
  );
  return { event: timelineEventFromRow(updated[0], tags) };
}

export async function deleteLocalTimelineEvent(timelineId: string, eventId: string): Promise<{ message: string }> {
  const database = await getDatabase();
  await database.execute('DELETE FROM timeline_event_tags WHERE event_id = $1', [eventId]);
  await database.execute('DELETE FROM timeline_events WHERE id = $1 AND timeline_id = $2', [eventId, timelineId]);
  return { message: 'Timeline event deleted' };
}
