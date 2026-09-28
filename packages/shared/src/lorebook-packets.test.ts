import { describe, expect, it } from 'vitest';
import {
  MAX_LOREBOOK_PACKETS,
  buildLorebookPacketRecord,
  deriveLorebookPacketTitle,
  extractLorebookPacketSourceDrafts,
  getLorebookPacketFilename,
  mergeLorebookPacket,
  normalizeLorebookPacketDraftIds,
  normalizeLorebookPacketRecord,
  normalizeLorebookPackets,
  parseLorebookPacket,
  removeLorebookPacket,
  sortLorebookPackets,
  type SavedLorebookPacketRecord,
} from './lorebook-packets';

function buildPacket(overrides: Partial<SavedLorebookPacketRecord> = {}): SavedLorebookPacketRecord {
  return {
    id: 'packet-1',
    title: 'Harbor Ledger',
    content: 'title: Harbor Ledger',
    draftIds: ['draft-1'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('deriveLorebookPacketTitle', () => {
  it('prefers the packet title field', () => {
    expect(deriveLorebookPacketTitle('title: Crimson Court Dossier\nscope: port intrigue')).toBe(
      'Crimson Court Dossier',
    );
  });

  it('falls back to the scope line', () => {
    expect(deriveLorebookPacketTitle('scope: port intrigue and dock pressure')).toBe('port intrigue and dock pressure');
  });

  it('truncates an overlong scope fallback to 80 characters', () => {
    const title = deriveLorebookPacketTitle(`scope: ${'x'.repeat(120)}`);

    expect(title).toHaveLength(80);
  });

  it('falls back to a placeholder title when there is nothing to derive from', () => {
    expect(deriveLorebookPacketTitle('[[LOREBOOK_PACKET]]\n[[/LOREBOOK_PACKET]]')).toBe('Lorebook Packet');
  });
});

describe('normalizeLorebookPacketDraftIds', () => {
  it('trims, de-duplicates and caps the draft id list', () => {
    expect(normalizeLorebookPacketDraftIds([' draft-1 ', 'draft-1', 'draft-2'])).toEqual(['draft-1', 'draft-2']);
  });

  it('caps the list at the shared connected-reference ceiling', () => {
    const draftIds = Array.from({ length: 25 }, (_, index) => `draft-${index}`);

    expect(normalizeLorebookPacketDraftIds(draftIds)).toHaveLength(10);
  });

  it('ignores non-string and blank entries', () => {
    expect(normalizeLorebookPacketDraftIds(['  ', '', undefined as unknown as string, 'draft-1'])).toEqual(['draft-1']);
  });
});

describe('normalizeLorebookPacketRecord', () => {
  it('rejects records with no content', () => {
    expect(normalizeLorebookPacketRecord({ content: '   ' })).toBeNull();
    expect(normalizeLorebookPacketRecord(null)).toBeNull();
    expect(normalizeLorebookPacketRecord('nope')).toBeNull();
  });

  it('derives a missing title from the content', () => {
    expect(
      normalizeLorebookPacketRecord({
        id: 'packet-1',
        content: 'title: Crimson Court Dossier',
        createdAt: '2026-01-01T00:00:00.000Z',
      })?.title,
    ).toBe('Crimson Court Dossier');
  });

  it('defaults updatedAt to createdAt and normalizes both to ISO strings', () => {
    const record = normalizeLorebookPacketRecord({
      id: 'packet-1',
      content: 'title: Harbor Ledger',
      createdAt: '2026-01-01T12:00:00Z',
    });

    expect(record?.createdAt).toBe('2026-01-01T12:00:00.000Z');
    expect(record?.updatedAt).toBe('2026-01-01T12:00:00.000Z');
  });

  it('preserves an explicit null blueprint override and keeps string overrides verbatim', () => {
    expect(
      normalizeLorebookPacketRecord({ id: 'a', content: 'title: A', blueprintOverride: null })?.blueprintOverride,
    ).toBeNull();
    // Blueprint override text is operator-supplied markdown, so it is preserved
    // verbatim rather than trimmed (matches the pre-extraction web behaviour).
    expect(
      normalizeLorebookPacketRecord({ id: 'b', content: 'title: B', blueprintOverride: '  custom  ' })
        ?.blueprintOverride,
    ).toBe('  custom  ');
  });

  it('trims focus and blueprint path metadata', () => {
    const record = normalizeLorebookPacketRecord({
      id: 'c',
      content: 'title: C',
      focus: '  factions  ',
      blueprintPath: '  blueprints/system/lorebook_generator.md  ',
    });

    expect(record?.focus).toBe('factions');
    expect(record?.blueprintPath).toBe('blueprints/system/lorebook_generator.md');
  });
});

describe('normalizeLorebookPackets', () => {
  it('drops unusable entries and sorts newest first', () => {
    const records = normalizeLorebookPackets([
      { id: 'old', content: 'title: Old', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'bad', content: '' },
      { id: 'new', content: 'title: New', updatedAt: '2026-03-01T00:00:00.000Z' },
    ]);

    expect(records.map((record) => record.id)).toEqual(['new', 'old']);
  });

  it('returns an empty list for non-array input', () => {
    expect(normalizeLorebookPackets({ nope: true })).toEqual([]);
    expect(normalizeLorebookPackets(undefined)).toEqual([]);
  });
});

describe('buildLorebookPacketRecord', () => {
  it('trims the content and normalizes the draft ids', () => {
    const record = buildLorebookPacketRecord(
      { content: '  title: Crimson Court Dossier  ', draftIds: [' draft-1 ', 'draft-1'], focus: '  factions  ' },
      [],
      '2026-02-03T04:05:06.000Z',
    );

    expect(record.content).toBe('title: Crimson Court Dossier');
    expect(record.title).toBe('Crimson Court Dossier');
    expect(record.draftIds).toEqual(['draft-1']);
    expect(record.focus).toBe('factions');
    expect(record.createdAt).toBe('2026-02-03T04:05:06.000Z');
  });

  it('reuses the existing id and createdAt when updating a saved packet', () => {
    const existing = buildPacket({ id: 'packet-1', createdAt: '2026-01-01T00:00:00.000Z' });
    const record = buildLorebookPacketRecord(
      { id: 'packet-1', content: 'title: Updated', draftIds: [] },
      [existing],
      '2026-05-05T00:00:00.000Z',
    );

    expect(record.id).toBe('packet-1');
    expect(record.createdAt).toBe('2026-01-01T00:00:00.000Z');
    expect(record.updatedAt).toBe('2026-05-05T00:00:00.000Z');
  });
});

describe('mergeLorebookPacket', () => {
  it('puts the newest record first and replaces an existing one in place', () => {
    const existing = [buildPacket({ id: 'packet-1' }), buildPacket({ id: 'packet-2' })];
    const next = mergeLorebookPacket(buildPacket({ id: 'packet-2', title: 'Replaced' }), existing);

    expect(next.map((record) => record.id)).toEqual(['packet-2', 'packet-1']);
    expect(next).toHaveLength(2);
  });

  it('caps the stored packet count', () => {
    const existing = Array.from({ length: MAX_LOREBOOK_PACKETS }, (_, index) => buildPacket({ id: `packet-${index}` }));

    expect(mergeLorebookPacket(buildPacket({ id: 'overflow' }), existing)).toHaveLength(MAX_LOREBOOK_PACKETS);
  });
});

describe('removeLorebookPacket', () => {
  it('removes only the requested packet', () => {
    const next = removeLorebookPacket('packet-1', [buildPacket({ id: 'packet-1' }), buildPacket({ id: 'packet-2' })]);

    expect(next.map((record) => record.id)).toEqual(['packet-2']);
  });
});

describe('sortLorebookPackets', () => {
  it('does not mutate the input array', () => {
    const input = [
      buildPacket({ id: 'old', updatedAt: '2026-01-01T00:00:00.000Z' }),
      buildPacket({ id: 'new', updatedAt: '2026-02-01T00:00:00.000Z' }),
    ];

    expect(sortLorebookPackets(input).map((record) => record.id)).toEqual(['new', 'old']);
    expect(input.map((record) => record.id)).toEqual(['old', 'new']);
  });
});

describe('getLorebookPacketFilename', () => {
  it('builds a sanitized filename with the requested extension', () => {
    expect(getLorebookPacketFilename('Crimson Court: Harbor Notes', 'md')).toBe('crimson_court_harbor_notes.md');
    expect(getLorebookPacketFilename('Crimson Court', 'txt')).toBe('crimson_court.txt');
  });

  it('falls back to a default base name', () => {
    expect(getLorebookPacketFilename('   ', 'md')).toBe('lorebook_packet.md');
  });
});

describe('extractLorebookPacketSourceDrafts', () => {
  it('reads and normalizes the source_drafts field', () => {
    expect(extractLorebookPacketSourceDrafts('source_drafts: draft-1, draft-2, draft-1')).toEqual([
      'draft-1',
      'draft-2',
    ]);
  });

  it('returns an empty list when the field is absent', () => {
    expect(extractLorebookPacketSourceDrafts('title: Harbor Ledger')).toEqual([]);
  });
});

describe('parseLorebookPacket', () => {
  it('parses the packet header and every structured entry', () => {
    const parsed = parseLorebookPacket(`
[[LOREBOOK_PACKET]]
title: Crimson Court Dossier
scope: Smuggling, checkpoints, and court pressure.
source_drafts: draft-1, draft-2

[[ENTRY]]
type: character
title: Maeve Talren
keywords: crimson court, toll bells
linked_drafts: draft-1
continuity_role: checkpoint broker
summary: Keeps the crossing routes open for a price.
content:
Maeve runs the checkpoint with ritual calm and a ledger full of leverage.
[[/ENTRY]]

[[ENTRY]]
type: event
title: The Checkpoint Fire
linked_drafts: draft-1, draft-2
[[/ENTRY]]

[[/LOREBOOK_PACKET]]
    `);

    expect(parsed.title).toBe('Crimson Court Dossier');
    expect(parsed.scope).toBe('Smuggling, checkpoints, and court pressure.');
    expect(parsed.sourceDrafts).toEqual(['draft-1', 'draft-2']);
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0]).toMatchObject({
      type: 'character',
      title: 'Maeve Talren',
      keywords: ['crimson court', 'toll bells'],
      linkedDrafts: ['draft-1'],
      continuityRole: 'checkpoint broker',
    });
    expect(parsed.entries[0].content).toContain('ledger full of leverage');
    expect(parsed.entries[1].type).toBe('event');
  });

  it('coerces an unknown entry type to custom and skips entries without a title', () => {
    const parsed = parseLorebookPacket(`title: Harbor Ledger
[[ENTRY]]
type: starship
title: The Long Toll
[[/ENTRY]]
[[ENTRY]]
type: place
[[/ENTRY]]`);

    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].type).toBe('custom');
  });

  it('handles CRLF packet text', () => {
    const parsed = parseLorebookPacket(
      'title: Harbor Ledger\r\n[[ENTRY]]\r\ntype: place\r\ntitle: Dock 4\r\n[[/ENTRY]]',
    );

    expect(parsed.title).toBe('Harbor Ledger');
    expect(parsed.entries[0].title).toBe('Dock 4');
  });

  it('returns an empty entry list for content without entries', () => {
    const parsed = parseLorebookPacket('title: Harbor Ledger');

    expect(parsed.entries).toEqual([]);
    expect(parsed.scope).toBeUndefined();
  });
});
