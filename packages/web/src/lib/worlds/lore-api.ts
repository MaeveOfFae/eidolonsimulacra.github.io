/**
 * World, faction, location, relationship, and timeline operations.
 *
 * Extracted from `EidolonBrowserAPI` (4.6): the facade delegates here
 * one-for-one and `api.surface.ts` still locks the public method set. Outside
 * the self-contained desktop runtime this domain is intentionally inert —
 * reads return empty lists and every mutation answers 501 — because the lore
 * store is desktop-only SQLite storage.
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
import { isSelfContainedDesktopRuntime } from '../runtime.js';
import { APIError } from '../api-error.js';
import {
  addLocalTimelineEvent,
  addLocalWorldCharacter,
  addLocalWorldFaction,
  addLocalWorldLocation,
  addLocalWorldRelationship,
  createLocalTimeline,
  createLocalWorld,
  deleteLocalTimeline,
  deleteLocalTimelineEvent,
  deleteLocalWorld,
  deleteLocalWorldCharacter,
  deleteLocalWorldFaction,
  deleteLocalWorldLocation,
  deleteLocalWorldRelationship,
  getLocalTimeline,
  getLocalWorld,
  getLocalWorldCharacterDraftLinks,
  getLocalWorldRelationshipAuditIssues,
  getLocalWorlds,
  updateLocalTimeline,
  updateLocalTimelineEvent,
  updateLocalWorld,
  updateLocalWorldCharacter,
  updateLocalWorldFaction,
  updateLocalWorldLocation,
  updateLocalWorldRelationship,
} from '../storage/desktop-lore-db.js';

const DESKTOP_WORLDS_ONLY_MESSAGE =
  'Persisted worlds, factions, locations, and timelines are currently only available in the desktop app.';

function desktopOnly(): never {
  throw new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE);
}

export async function getWorlds(params?: {
  search?: string;
  genre?: string;
  includePublic?: boolean;
}): Promise<{ worlds: WorldRecord[] }> {
  if (isSelfContainedDesktopRuntime()) {
    return getLocalWorlds(params);
  }

  return { worlds: [] };
}

export async function getWorldCharacterDraftLinks(params?: {
  draftIds?: string[];
}): Promise<{ links: WorldCharacterDraftLinkRecord[] }> {
  if (isSelfContainedDesktopRuntime()) {
    return getLocalWorldCharacterDraftLinks(params);
  }

  return { links: [] };
}

export async function getWorldRelationshipAuditIssues(): Promise<
  Awaited<ReturnType<typeof getLocalWorldRelationshipAuditIssues>>
> {
  if (isSelfContainedDesktopRuntime()) {
    return getLocalWorldRelationshipAuditIssues();
  }

  return { issues: [] };
}

export async function getWorld(id: string): Promise<{ world: WorldRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return getLocalWorld(id);
  }

  desktopOnly();
}

export async function createWorld(data: {
  name: string;
  description?: string;
  genre?: string;
  setting?: string;
  notes?: string;
  tags?: string[];
  isPublic?: boolean;
}): Promise<{ world: WorldRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return createLocalWorld(data);
  }

  desktopOnly();
}

export async function updateWorld(id: string, data: Record<string, unknown>): Promise<{ world: WorldRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return updateLocalWorld(id, data);
  }

  desktopOnly();
}

export async function deleteWorld(id: string): Promise<{ message: string }> {
  if (isSelfContainedDesktopRuntime()) {
    return deleteLocalWorld(id);
  }

  desktopOnly();
}

export async function addWorldCharacter(
  worldId: string,
  data: { draftId?: string; characterName: string; role?: string; notes?: string },
): Promise<{ character: WorldCharacterRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return addLocalWorldCharacter(worldId, data);
  }

  desktopOnly();
}

export async function updateWorldCharacter(
  worldId: string,
  characterId: string,
  data: Record<string, unknown>,
): Promise<{ character: WorldCharacterRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return updateLocalWorldCharacter(worldId, characterId, data);
  }

  desktopOnly();
}

export async function deleteWorldCharacter(worldId: string, characterId: string): Promise<{ message: string }> {
  if (isSelfContainedDesktopRuntime()) {
    return deleteLocalWorldCharacter(worldId, characterId);
  }

  desktopOnly();
}

export async function addWorldFaction(
  worldId: string,
  data: { name: string; description?: string; role?: string; notes?: string; tags?: string[]; draftIds?: string[] },
): Promise<{ faction: WorldFactionRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return addLocalWorldFaction(worldId, data);
  }

  desktopOnly();
}

export async function updateWorldFaction(
  worldId: string,
  factionId: string,
  data: Record<string, unknown>,
): Promise<{ faction: WorldFactionRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return updateLocalWorldFaction(worldId, factionId, data);
  }

  desktopOnly();
}

export async function deleteWorldFaction(worldId: string, factionId: string): Promise<{ message: string }> {
  if (isSelfContainedDesktopRuntime()) {
    return deleteLocalWorldFaction(worldId, factionId);
  }

  desktopOnly();
}

export async function addWorldLocation(
  worldId: string,
  data: {
    name: string;
    description?: string;
    category?: string;
    notes?: string;
    tags?: string[];
    draftIds?: string[];
  },
): Promise<{ location: WorldLocationRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return addLocalWorldLocation(worldId, data);
  }

  desktopOnly();
}

export async function updateWorldLocation(
  worldId: string,
  locationId: string,
  data: Record<string, unknown>,
): Promise<{ location: WorldLocationRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return updateLocalWorldLocation(worldId, locationId, data);
  }

  desktopOnly();
}

export async function deleteWorldLocation(worldId: string, locationId: string): Promise<{ message: string }> {
  if (isSelfContainedDesktopRuntime()) {
    return deleteLocalWorldLocation(worldId, locationId);
  }

  desktopOnly();
}

export async function addWorldRelationship(
  worldId: string,
  data: { sourceCharacterId: string; targetCharacterId: string; label: string; notes?: string },
): Promise<{ relationship: WorldRelationshipRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return addLocalWorldRelationship(worldId, data);
  }

  desktopOnly();
}

export async function updateWorldRelationship(
  worldId: string,
  relationshipId: string,
  data: Record<string, unknown>,
): Promise<{ relationship: WorldRelationshipRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return updateLocalWorldRelationship(worldId, relationshipId, data);
  }

  desktopOnly();
}

export async function deleteWorldRelationship(worldId: string, relationshipId: string): Promise<{ message: string }> {
  if (isSelfContainedDesktopRuntime()) {
    return deleteLocalWorldRelationship(worldId, relationshipId);
  }

  desktopOnly();
}

export async function getTimeline(id: string): Promise<{ timeline: TimelineRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return getLocalTimeline(id);
  }

  desktopOnly();
}

export async function createTimeline(data: {
  worldId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
}): Promise<{ timeline: TimelineRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return createLocalTimeline(data);
  }

  desktopOnly();
}

export async function updateTimeline(id: string, data: Record<string, unknown>): Promise<{ timeline: TimelineRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return updateLocalTimeline(id, data);
  }

  desktopOnly();
}

export async function deleteTimeline(id: string): Promise<{ message: string }> {
  if (isSelfContainedDesktopRuntime()) {
    return deleteLocalTimeline(id);
  }

  desktopOnly();
}

export async function addTimelineEvent(
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
  if (isSelfContainedDesktopRuntime()) {
    return addLocalTimelineEvent(timelineId, data);
  }

  desktopOnly();
}

export async function updateTimelineEvent(
  timelineId: string,
  eventId: string,
  data: Record<string, unknown>,
): Promise<{ event: TimelineEventRecord }> {
  if (isSelfContainedDesktopRuntime()) {
    return updateLocalTimelineEvent(timelineId, eventId, data);
  }

  desktopOnly();
}

export async function deleteTimelineEvent(timelineId: string, eventId: string): Promise<{ message: string }> {
  if (isSelfContainedDesktopRuntime()) {
    return deleteLocalTimelineEvent(timelineId, eventId);
  }

  desktopOnly();
}
