import { afterEach, describe, expect, it, vi } from 'vitest';
import { SAVED_SEARCHES_CHANGED_EVENT, deleteSavedSearch, getSavedSearches, saveSavedSearch } from './saved-searches';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('saved searches', () => {
  it('starts empty and ignores corrupt storage', () => {
    expect(getSavedSearches()).toEqual([]);

    localStorage.setItem('eidolon.web.draftLibrary.savedSearches', '{not json');
    expect(getSavedSearches()).toEqual([]);
  });

  it('saves a search, emits the changed event, and reads it back normalized', () => {
    const listener = vi.fn();
    window.addEventListener(SAVED_SEARCHES_CHANGED_EVENT, listener);

    const saved = saveSavedSearch('  Sci-fi favourites  ', { search: 'pirate', favoritesOnly: true });
    expect(saved).toMatchObject({ name: 'Sci-fi favourites', filter: { search: 'pirate', favoritesOnly: true } });
    expect(listener).toHaveBeenCalledTimes(1);

    const all = getSavedSearches();
    expect(all).toHaveLength(1);
    expect(all[0]).toEqual(saved);
  });

  it('rejects empty names and deletes by id', () => {
    expect(saveSavedSearch('   ', { favoritesOnly: true })).toBeNull();
    expect(getSavedSearches()).toEqual([]);

    const first = saveSavedSearch('First', { genre: 'fantasy' });
    const second = saveSavedSearch('Second', { mode: 'NSFW' });
    expect(getSavedSearches().map((entry) => entry.name)).toEqual(['Second', 'First']);

    deleteSavedSearch(first!.id);
    expect(getSavedSearches().map((entry) => entry.name)).toEqual(['Second']);
    expect(second).toBeDefined();
  });

  it('drops malformed stored records on read', () => {
    localStorage.setItem(
      'eidolon.web.draftLibrary.savedSearches',
      JSON.stringify([{ id: 'x' }, { id: 'ok', name: 'OK', filter: {}, createdAt: '2026-09-01T00:00:00.000Z' }]),
    );

    const all = getSavedSearches();
    expect(all).toHaveLength(1);
    expect(all[0]?.name).toBe('OK');
  });
});
