import { beforeEach, describe, expect, it } from 'vitest';
import {
  deleteLorebookPacket,
  extractLorebookPacketSourceDrafts,
  getLorebookPacketFilename,
  importLorebookPacketText,
  listSavedLorebookPackets,
  parseLorebookPacket,
  saveLorebookPacket,
} from './lorebook-packets';

describe('lorebook packet storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('derives titles and normalizes draft ids when saving packets', () => {
    const records = saveLorebookPacket({
      content: `[[LOREBOOK_PACKET]]\ntitle: Crimson Court Dossier\nscope: port intrigue\n[[/LOREBOOK_PACKET]]`,
      draftIds: ['draft-1', 'draft-1', '  draft-2  '],
      focus: '  factions  ',
    });

    expect(records).toHaveLength(1);
    expect(records[0].title).toBe('Crimson Court Dossier');
    expect(records[0].draftIds).toEqual(['draft-1', 'draft-2']);
    expect(records[0].focus).toBe('factions');
  });

  it('loads and deletes saved packets', () => {
    const [saved] = saveLorebookPacket({
      content: 'title: Harbor Ledger',
      draftIds: ['draft-1'],
    });

    expect(listSavedLorebookPackets()).toHaveLength(1);

    const remaining = deleteLorebookPacket(saved.id);
    expect(remaining).toHaveLength(0);
    expect(listSavedLorebookPackets()).toHaveLength(0);
  });

  it('builds sanitized filenames for downloads', () => {
    expect(getLorebookPacketFilename('Crimson Court: Harbor Notes', 'md')).toBe('crimson_court_harbor_notes.md');
  });

  it('extracts source draft ids from packet text and imports it', () => {
    const content = `[[LOREBOOK_PACKET]]\ntitle: Harbor Ledger\nsource_drafts: draft-1, draft-2, draft-1\n[[/LOREBOOK_PACKET]]`;

    expect(extractLorebookPacketSourceDrafts(content)).toEqual(['draft-1', 'draft-2']);

    const [saved] = importLorebookPacketText({ content });
    expect(saved.title).toBe('Harbor Ledger');
    expect(saved.draftIds).toEqual(['draft-1', 'draft-2']);
  });

  it('parses structured lorebook packet entries for world promotion', () => {
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
keywords: harbor, fire, bells
linked_drafts: draft-1, draft-2
continuity_role: shared turning point
summary: The night every debt went public.
content:
The checkpoint fire exposed hidden routes and rearranged loyalties across the harbor.
[[/ENTRY]]

[[/LOREBOOK_PACKET]]
    `);

    expect(parsed.title).toBe('Crimson Court Dossier');
    expect(parsed.scope).toBe('Smuggling, checkpoints, and court pressure.');
    expect(parsed.sourceDrafts).toEqual(['draft-1', 'draft-2']);
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0].type).toBe('character');
    expect(parsed.entries[0].title).toBe('Maeve Talren');
    expect(parsed.entries[1].type).toBe('event');
    expect(parsed.entries[1].linkedDrafts).toEqual(['draft-1', 'draft-2']);
  });
});