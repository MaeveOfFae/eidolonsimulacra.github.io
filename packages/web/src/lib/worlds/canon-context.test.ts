import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  desktop: false,
  links: [] as Array<Record<string, unknown>>,
  locksByWorld: {} as Record<string, unknown[]>,
  entriesByWorld: {} as Record<string, unknown[]>,
  notesByWorld: {} as Record<string, unknown[]>,
}));

vi.mock('../runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../runtime')>()),
  isSelfContainedDesktopRuntime: () => state.desktop,
}));

vi.mock('./lore-api.js', () => ({
  getWorldCharacterDraftLinks: vi.fn(async () => ({ links: state.links })),
  getCanonLocks: vi.fn(async (worldId: string) => ({ locks: state.locksByWorld[worldId] ?? [] })),
  getCanonEntries: vi.fn(async (worldId: string) => ({ entries: state.entriesByWorld[worldId] ?? [] })),
  getUniverseNotes: vi.fn(async (worldId: string) => ({ notes: state.notesByWorld[worldId] ?? [] })),
}));

import { resolveCanonContext } from './canon-context';

function lock(targetKind: string, statement: string, targetLabel?: string) {
  return { id: `l-${statement}`, worldId: 'w', targetKind, targetLabel, statement, createdAt: '', updatedAt: '' };
}

function entry(title: string, category: string, summary: string) {
  return { id: `e-${title}`, worldId: 'w', title, category, summary, tags: [], createdAt: '', updatedAt: '' };
}

function note(title: string, body: string, pinned = false) {
  return {
    id: `n-${title}`,
    worldId: 'w',
    title,
    body,
    pinned,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('resolveCanonContext', () => {
  beforeEach(() => {
    state.desktop = false;
    state.links = [];
    state.locksByWorld = {};
    state.entriesByWorld = {};
    state.notesByWorld = {};
  });

  it('resolves nothing outside the desktop runtime', async () => {
    state.links = [{ worldId: 'w1' }];
    state.locksByWorld = { w1: [lock('world', 'magic costs blood')] };
    state.entriesByWorld = { w1: [entry('Blood Price', 'lore', 'magic always costs blood')] };
    state.notesByWorld = { w1: [note('Tone', 'Keep it cold.')] };

    await expect(resolveCanonContext(['d1'])).resolves.toEqual({ constraints: [], context: [] });
  });

  it('resolves nothing without drafts or world links', async () => {
    state.desktop = true;

    await expect(resolveCanonContext([])).resolves.toEqual({ constraints: [], context: [] });

    state.links = [];
    await expect(resolveCanonContext(['d1'])).resolves.toEqual({ constraints: [], context: [] });
  });

  it('collects locks, universe notes, and library entries from every world the drafts belong to', async () => {
    state.desktop = true;
    state.links = [{ worldId: 'w1' }, { worldId: 'w2' }, { worldId: 'w1' }];
    state.locksByWorld = {
      w1: [lock('world', 'magic costs blood')],
      w2: [lock('character', 'surname is Vale', 'Vesna')],
    };
    state.entriesByWorld = {
      w1: [entry('Blood Price', 'lore', 'magic always costs blood')],
      w2: [entry('Vale', 'trait', '')],
    };
    state.notesByWorld = {
      w1: [note('Tone', 'Keep it cold.', true)],
      w2: [note('Continuity', 'Vesna never leaves the ward.')],
    };

    await expect(resolveCanonContext(['d1', 'd2'])).resolves.toEqual({
      constraints: ['World: magic costs blood', 'Vesna (character): surname is Vale'],
      // Notes lead: they frame the setting; library entries then name specifics.
      context: [
        'Tone: Keep it cold.',
        'Continuity: Vesna never leaves the ward.',
        'Blood Price (lore): magic always costs blood',
        'Vale (trait)',
      ],
    });
  });
});
