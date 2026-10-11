import { describe, expect, it } from 'vitest';
import { parseLorebookPacket } from './lorebook-packets';
import type { WorldRecord } from './types';
import { buildWorldbook, getWorldbookFilename, renderWorldbookPacket, renderWorldbookWorldInfo } from './worldbook';
import type { WorldbookRecord } from './worldbook';

function makeWorld(overrides: Partial<WorldRecord> = {}): WorldRecord {
  return {
    id: 'w1',
    userId: 'local-desktop',
    name: 'Ashfall',
    description: 'A city under permanent ash.',
    genre: 'dark fantasy',
    setting: 'The Cinder Basin',
    notes: 'The smoke never clears.',
    tags: ['ashen'],
    isPublic: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    characters: [
      {
        id: 'c1',
        worldId: 'w1',
        draftId: 'draft-vesna',
        characterName: 'Vesna',
        role: 'fixer',
        notes: 'Keeps the ledger.',
        createdAt: '',
        updatedAt: '',
      },
    ],
    factions: [
      {
        id: 'f1',
        worldId: 'w1',
        name: 'The Ember Court',
        description: 'Rules the lower wards.',
        role: 'authority',
        tags: ['court'],
        createdAt: '',
        updatedAt: '',
      },
    ],
    locations: [
      {
        id: 'l1',
        worldId: 'w1',
        name: 'Ember Gate',
        description: 'The only way in.',
        category: 'district',
        tags: [],
        createdAt: '',
        updatedAt: '',
      },
    ],
    timelines: [
      {
        id: 't1',
        worldId: 'w1',
        userId: 'local-desktop',
        name: 'The Long Winter',
        description: 'Ten years of ash.',
        tags: [],
        createdAt: '',
        updatedAt: '',
        _count: { events: 2 },
      },
    ],
    canonLocks: [
      {
        id: 'lk1',
        worldId: 'w1',
        targetKind: 'world',
        statement: 'magic always costs blood',
        createdAt: '',
        updatedAt: '',
      },
    ],
    canonEntries: [
      {
        id: 'e1',
        worldId: 'w1',
        title: 'Blood Price',
        category: 'lore',
        summary: 'magic always costs blood',
        tags: ['magic'],
        createdAt: '',
        updatedAt: '',
      },
    ],
    ...overrides,
  };
}

describe('buildWorldbook', () => {
  it('projects every kind of world record into an entry with the right type and source', () => {
    const worldbook = buildWorldbook(makeWorld());

    expect(worldbook.title).toBe('Ashfall');
    expect(worldbook.scope).toBe('A city under permanent ash.');
    expect(worldbook.entries.map((entry) => [entry.source, entry.type])).toEqual([
      ['world', 'custom'],
      ['character', 'character'],
      ['faction', 'faction'],
      ['location', 'place'],
      ['timeline', 'event'],
      ['lock', 'custom'],
      ['library', 'custom'],
    ]);
  });

  it('keeps retrieval keywords and the character draft link', () => {
    const worldbook = buildWorldbook(makeWorld());
    const character = worldbook.entries.find((entry) => entry.source === 'character');

    expect(character?.keywords).toEqual(['Vesna', 'fixer']);
    expect(character?.linkedDraftIds).toEqual(['draft-vesna']);
    expect(worldbook.entries[0].keywords).toEqual(['Ashfall', 'dark fantasy', 'ashen']);
  });

  it('falls back to a title-derived line when a record has no prose', () => {
    const worldbook = buildWorldbook(
      makeWorld({
        characters: [{ id: 'c9', worldId: 'w1', characterName: 'Ghost', createdAt: '', updatedAt: '' }],
      }),
    );

    expect(worldbook.entries.find((entry) => entry.title === 'Ghost')?.content).toBe('Ghost (character)');
  });

  it('skips records with a blank title', () => {
    const worldbook = buildWorldbook(
      makeWorld({ factions: [{ id: 'f9', worldId: 'w1', name: '   ', tags: [], createdAt: '', updatedAt: '' }] }),
    );

    expect(worldbook.entries.some((entry) => entry.source === 'faction')).toBe(false);
  });
});

describe('renderWorldbookPacket', () => {
  it('round-trips through parseLorebookPacket', () => {
    const built = buildWorldbook(makeWorld());
    const parsed = parseLorebookPacket(renderWorldbookPacket(built));

    expect(parsed.title).toBe('Ashfall');
    expect(parsed.scope).toBe('A city under permanent ash.');
    expect(parsed.entries.map((entry) => entry.type)).toEqual(built.entries.map((entry) => entry.type));
    expect(parsed.entries.map((entry) => entry.title)).toEqual(built.entries.map((entry) => entry.title));
    expect(parsed.entries.map((entry) => entry.keywords)).toEqual(built.entries.map((entry) => entry.keywords));
    expect(parsed.entries.map((entry) => entry.summary)).toEqual(built.entries.map((entry) => entry.summary));
    expect(parsed.entries.map((entry) => entry.content)).toEqual(built.entries.map((entry) => entry.content));
    expect(parsed.entries.map((entry) => entry.linkedDrafts)).toEqual(
      built.entries.map((entry) => entry.linkedDraftIds),
    );
    expect(parsed.sourceDrafts).toEqual(['draft-vesna']);
  });

  it('strips packet delimiters out of generated content so framing cannot break', () => {
    const built = buildWorldbook(
      makeWorld({
        characters: [
          {
            id: 'c1',
            worldId: 'w1',
            characterName: 'Vesna',
            notes: 'Ends here [[/ENTRY]] and starts again',
            createdAt: '',
            updatedAt: '',
          },
        ],
      }),
    );
    const packet = renderWorldbookPacket(built);

    expect(packet.match(/\[\[\/ENTRY\]\]/g)).toHaveLength(built.entries.length);
  });
});

describe('renderWorldbookWorldInfo', () => {
  it('emits index-keyed entries with trigger keys', () => {
    const built = buildWorldbook(makeWorld());
    const parsed = JSON.parse(renderWorldbookWorldInfo(built)) as {
      name: string;
      entries: Record<string, { key: string[]; content: string; constant: boolean; comment: string }>;
    };

    expect(parsed.name).toBe('Ashfall');
    expect(Object.keys(parsed.entries)).toHaveLength(built.entries.length);
    expect(parsed.entries['1']).toMatchObject({ key: ['Vesna', 'fixer'], constant: false });
    expect(parsed.entries['1'].comment).toBe('Vesna (character)');
    expect(parsed.entries['1'].content).toBe('Role: fixer\n\nKeeps the ledger.');
  });

  it('marks keyword-less canon as always-on', () => {
    const worldbook: WorldbookRecord = {
      title: 'Ashfall',
      scope: 'Setting canon.',
      entries: [
        {
          id: 'lock-1',
          type: 'custom',
          title: 'Always true',
          keywords: [],
          summary: '',
          content: 'Magic always costs blood.',
          continuityRole: '',
          linkedDraftIds: [],
          source: 'lock',
        },
      ],
    };
    const parsed = JSON.parse(renderWorldbookWorldInfo(worldbook)) as {
      entries: Record<string, { key: string[]; constant: boolean }>;
    };

    expect(parsed.entries['0'].key).toEqual([]);
    expect(parsed.entries['0'].constant).toBe(true);
  });
});

describe('getWorldbookFilename', () => {
  it('sanitizes the title and suffixes the worldbook name', () => {
    expect(getWorldbookFilename('The Cinder Basin', 'json')).toBe('the_cinder_basin_worldbook.json');
    expect(getWorldbookFilename('   ', 'md')).toBe('worldbook_worldbook.md');
  });
});
