/**
 * Relationship map layout: places a world's characters and their relationships
 * into a deterministic circular graph.
 *
 * The geometry is separated from the SVG so the placement can be unit-tested
 * without a DOM, and so the same layout drives both the map and any future
 * export. Everything is rounded to two decimals, so a given world always
 * produces the same coordinates.
 */

import type { WorldCharacterRecord, WorldRelationshipRecord } from '@char-gen/shared';

export const RELATIONSHIP_MAP_WIDTH = 720;
export const RELATIONSHIP_MAP_HEIGHT = 480;

/** Distance from the viewbox edge to the ring the characters sit on. */
const NODE_INSET = 92;
const COORD_PRECISION = 100;

export interface RelationshipMapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  /** Number of drawn relationships touching this character. */
  degree: number;
}

export interface RelationshipMapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  /** Midpoint of the edge, where the label is drawn. */
  labelX: number;
  labelY: number;
}

export interface RelationshipMapLayout {
  width: number;
  height: number;
  nodes: RelationshipMapNode[];
  edges: RelationshipMapEdge[];
  /** Relationships whose source or target character is not in the world. */
  danglingRelationshipIds: string[];
  /** Character-to-itself relationships, which cannot be drawn as a line. */
  selfRelationshipIds: string[];
  /** True when there are no characters to draw. */
  isEmpty: boolean;
}

function round(value: number): number {
  return Math.round(value * COORD_PRECISION) / COORD_PRECISION;
}

function compareCharacters(left: WorldCharacterRecord, right: WorldCharacterRecord): number {
  if (left.characterName !== right.characterName) {
    return left.characterName < right.characterName ? -1 : 1;
  }
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

export function buildRelationshipMapLayout(
  characters: readonly WorldCharacterRecord[],
  relationships: readonly WorldRelationshipRecord[],
): RelationshipMapLayout {
  const ordered = [...characters].sort(compareCharacters);
  const count = ordered.length;
  const centerX = RELATIONSHIP_MAP_WIDTH / 2;
  const centerY = RELATIONSHIP_MAP_HEIGHT / 2;
  const ringRadius =
    count > 1 ? Math.max(40, Math.min(RELATIONSHIP_MAP_WIDTH, RELATIONSHIP_MAP_HEIGHT) / 2 - NODE_INSET) : 0;

  const positions = new Map<string, { x: number; y: number }>();
  ordered.forEach((character, index) => {
    if (count <= 1) {
      positions.set(character.id, { x: centerX, y: centerY });
      return;
    }

    // Start at the top and walk clockwise so the first character reads first.
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    positions.set(character.id, {
      x: round(centerX + ringRadius * Math.cos(angle)),
      y: round(centerY + ringRadius * Math.sin(angle)),
    });
  });

  const degree = new Map<string, number>();
  const edges: RelationshipMapEdge[] = [];
  const danglingRelationshipIds: string[] = [];
  const selfRelationshipIds: string[] = [];

  for (const relationship of relationships) {
    const source = positions.get(relationship.sourceCharacterId);
    const target = positions.get(relationship.targetCharacterId);

    if (!source || !target) {
      danglingRelationshipIds.push(relationship.id);
      continue;
    }

    if (relationship.sourceCharacterId === relationship.targetCharacterId) {
      selfRelationshipIds.push(relationship.id);
      continue;
    }

    degree.set(relationship.sourceCharacterId, (degree.get(relationship.sourceCharacterId) ?? 0) + 1);
    degree.set(relationship.targetCharacterId, (degree.get(relationship.targetCharacterId) ?? 0) + 1);

    edges.push({
      id: relationship.id,
      sourceId: relationship.sourceCharacterId,
      targetId: relationship.targetCharacterId,
      label: relationship.label,
      labelX: round((source.x + target.x) / 2),
      labelY: round((source.y + target.y) / 2),
    });
  }

  const nodes: RelationshipMapNode[] = ordered.map((character) => {
    const position = positions.get(character.id)!;
    return {
      id: character.id,
      name: character.characterName,
      x: position.x,
      y: position.y,
      degree: degree.get(character.id) ?? 0,
    };
  });

  return {
    width: RELATIONSHIP_MAP_WIDTH,
    height: RELATIONSHIP_MAP_HEIGHT,
    nodes,
    edges,
    danglingRelationshipIds,
    selfRelationshipIds,
    isEmpty: nodes.length === 0,
  };
}
