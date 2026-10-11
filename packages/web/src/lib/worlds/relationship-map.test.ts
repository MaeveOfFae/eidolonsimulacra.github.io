import { describe, expect, it } from 'vitest';
import type { WorldCharacterRecord, WorldRelationshipRecord } from '@char-gen/shared';
import { RELATIONSHIP_MAP_HEIGHT, RELATIONSHIP_MAP_WIDTH, buildRelationshipMapLayout } from './relationship-map';

function character(id: string, name: string): WorldCharacterRecord {
  return { id, worldId: 'w1', characterName: name, createdAt: '', updatedAt: '' };
}

function relationship(id: string, source: string, target: string, label: string): WorldRelationshipRecord {
  return {
    id,
    worldId: 'w1',
    sourceCharacterId: source,
    targetCharacterId: target,
    label,
    createdAt: '',
    updatedAt: '',
  };
}

const CENTER_X = RELATIONSHIP_MAP_WIDTH / 2;
const CENTER_Y = RELATIONSHIP_MAP_HEIGHT / 2;

function distanceFromCenter(node: { x: number; y: number }): number {
  return Math.hypot(node.x - CENTER_X, node.y - CENTER_Y);
}

describe('buildRelationshipMapLayout', () => {
  it('returns an empty layout when the world has no characters', () => {
    const layout = buildRelationshipMapLayout([], []);

    expect(layout.isEmpty).toBe(true);
    expect(layout.nodes).toEqual([]);
    expect(layout.edges).toEqual([]);
  });

  it('places characters on a ring, ordered by name, starting at the top', () => {
    const layout = buildRelationshipMapLayout(
      [character('c', 'Cara'), character('a', 'Alice'), character('b', 'Bob')],
      [],
    );

    expect(layout.nodes.map((node) => node.name)).toEqual(['Alice', 'Bob', 'Cara']);
    // First node sits directly above the centre.
    expect(layout.nodes[0]).toMatchObject({ x: CENTER_X, y: 240 - 148 });
    for (const node of layout.nodes) {
      expect(distanceFromCenter(node)).toBeCloseTo(148, 1);
    }
  });

  it('puts a lone character at the centre with no ring', () => {
    const layout = buildRelationshipMapLayout([character('a', 'Alice')], []);

    expect(layout.nodes).toHaveLength(1);
    expect(layout.nodes[0]).toMatchObject({ x: CENTER_X, y: CENTER_Y, degree: 0 });
  });

  it('draws each relationship as an edge with a midpoint label and a degree count', () => {
    const layout = buildRelationshipMapLayout(
      [character('a', 'Alice'), character('b', 'Bob'), character('c', 'Cara')],
      [relationship('r1', 'a', 'b', 'ally'), relationship('r2', 'b', 'c', 'rival')],
    );

    expect(layout.edges).toHaveLength(2);
    const [first] = layout.edges;
    expect(first).toMatchObject({ id: 'r1', sourceId: 'a', targetId: 'b', label: 'ally' });

    const alice = layout.nodes.find((node) => node.id === 'a')!;
    const bob = layout.nodes.find((node) => node.id === 'b')!;
    expect(first.labelX).toBeCloseTo((alice.x + bob.x) / 2, 1);
    expect(first.labelY).toBeCloseTo((alice.y + bob.y) / 2, 1);

    expect(layout.nodes.map((node) => [node.id, node.degree])).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 1],
    ]);
    expect(layout.danglingRelationshipIds).toEqual([]);
    expect(layout.selfRelationshipIds).toEqual([]);
  });

  it('reports relationships whose characters are missing instead of drawing them', () => {
    const layout = buildRelationshipMapLayout(
      [character('a', 'Alice'), character('b', 'Bob')],
      [relationship('r1', 'a', 'ghost', 'haunts'), relationship('r2', 'a', 'b', 'ally')],
    );

    expect(layout.edges.map((edge) => edge.id)).toEqual(['r2']);
    expect(layout.danglingRelationshipIds).toEqual(['r1']);
  });

  it('sets dangling relationships aside when a world has no characters at all', () => {
    const layout = buildRelationshipMapLayout([], [relationship('r1', 'a', 'b', 'ally')]);

    expect(layout.edges).toEqual([]);
    expect(layout.danglingRelationshipIds).toEqual(['r1']);
  });

  it('reports self-referential relationships without counting them as degrees', () => {
    const layout = buildRelationshipMapLayout([character('a', 'Alice')], [relationship('r1', 'a', 'a', 'self')]);

    expect(layout.edges).toEqual([]);
    expect(layout.selfRelationshipIds).toEqual(['r1']);
    expect(layout.nodes[0].degree).toBe(0);
  });
});
