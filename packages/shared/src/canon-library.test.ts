import { describe, expect, it } from 'vitest';
import {
  CANON_ENTRY_CATEGORIES,
  buildCanonContextLines,
  formatCanonEntryCitation,
  normalizeCanonEntryCategory,
  normalizeCanonEntryText,
} from './canon-library';

describe('normalizeCanonEntryText', () => {
  it('collapses whitespace to one trimmed line', () => {
    expect(normalizeCanonEntryText('  The  Blood\n\nPrice ')).toBe('The Blood Price');
    expect(normalizeCanonEntryText(42)).toBe('');
  });
});

describe('normalizeCanonEntryCategory', () => {
  it('accepts the known categories and defaults everything else to lore', () => {
    expect(CANON_ENTRY_CATEGORIES).toEqual(['trait', 'lore', 'relationship', 'setting']);
    expect(normalizeCanonEntryCategory('trait')).toBe('trait');
    expect(normalizeCanonEntryCategory('nonsense')).toBe('lore');
    expect(normalizeCanonEntryCategory(undefined)).toBe('lore');
  });
});

describe('formatCanonEntryCitation', () => {
  it('reads as title plus category', () => {
    expect(formatCanonEntryCitation({ title: 'Blood Price', category: 'lore' })).toBe('Blood Price (lore)');
  });
});

describe('buildCanonContextLines', () => {
  it('renders title, category and summary, skipping blank titles and duplicates', () => {
    const lines = buildCanonContextLines([
      { title: 'Blood Price', category: 'lore', summary: 'magic always costs blood' },
      { title: 'Vale', category: 'trait', summary: '' },
      { title: '   ', category: 'lore', summary: 'ignored' },
      { title: 'Blood Price', category: 'lore', summary: 'magic always costs blood' },
    ]);

    expect(lines).toEqual(['Blood Price (lore): magic always costs blood', 'Vale (trait)']);
  });

  it('returns an empty list when nothing is usable', () => {
    expect(buildCanonContextLines([])).toEqual([]);
    expect(buildCanonContextLines([{ title: '', category: 'lore', summary: 'x' }])).toEqual([]);
  });
});
