import { describe, expect, it } from 'vitest';
import {
  buildUniverseNoteContextLines,
  normalizeUniverseNoteBody,
  normalizeUniverseNoteTitle,
  sortUniverseNotes,
} from './universe-notes';
import type { WorldUniverseNoteRecord } from './types';

function note(overrides: Partial<WorldUniverseNoteRecord> = {}): WorldUniverseNoteRecord {
  return {
    id: 'n1',
    worldId: 'w1',
    title: 'Tone',
    body: 'Keep it cold.',
    pinned: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('normalizeUniverseNoteTitle', () => {
  it('collapses whitespace to one trimmed line', () => {
    expect(normalizeUniverseNoteTitle('  How   magic\nfeels ')).toBe('How magic feels');
    expect(normalizeUniverseNoteTitle(42)).toBe('');
  });
});

describe('normalizeUniverseNoteBody', () => {
  it('trims and collapses blank-line runs while keeping paragraphs', () => {
    expect(normalizeUniverseNoteBody('One\r\n\r\n\r\n\r\nTwo \n')).toBe('One\n\nTwo');
    expect(normalizeUniverseNoteBody(undefined)).toBe('');
  });
});

describe('sortUniverseNotes', () => {
  it('leads with pinned notes, then most recently updated', () => {
    const sorted = sortUniverseNotes([
      note({ id: 'a', title: 'Old', updatedAt: '2026-01-01T00:00:00.000Z' }),
      note({ id: 'b', title: 'New', updatedAt: '2026-03-01T00:00:00.000Z' }),
      note({ id: 'c', title: 'Pinned', pinned: true, updatedAt: '2025-01-01T00:00:00.000Z' }),
    ]);

    expect(sorted.map((entry) => entry.title)).toEqual(['Pinned', 'New', 'Old']);
  });

  it('breaks ties on title', () => {
    const sorted = sortUniverseNotes([note({ id: 'a', title: 'Beta' }), note({ id: 'b', title: 'Alpha' })]);

    expect(sorted.map((entry) => entry.title)).toEqual(['Alpha', 'Beta']);
  });
});

describe('buildUniverseNoteContextLines', () => {
  it('flattens each pinned-first note into one line', () => {
    const lines = buildUniverseNoteContextLines([
      note({ id: 'a', title: 'Loose', body: 'not pinned' }),
      note({ id: 'b', title: 'Tone', body: 'Keep it cold.\n\nNever cheerful.', pinned: true }),
    ]);

    expect(lines).toEqual(['Tone: Keep it cold. Never cheerful.', 'Loose: not pinned']);
  });

  it('drops blank titles and collapses duplicates', () => {
    const lines = buildUniverseNoteContextLines([
      note({ id: 'a', title: '   ', body: 'ignored' }),
      note({ id: 'b', title: 'Tone', body: 'Keep it cold.' }),
      note({ id: 'c', title: 'Tone', body: 'Keep it cold.' }),
    ]);

    expect(lines).toEqual(['Tone: Keep it cold.']);
  });

  it('renders a body-less note as just its title', () => {
    expect(buildUniverseNoteContextLines([note({ title: 'Tone', body: '' })])).toEqual(['Tone']);
  });
});
