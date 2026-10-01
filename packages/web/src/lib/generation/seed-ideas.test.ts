import { afterEach, describe, expect, it, vi } from 'vitest';
import { SEED_IDEAS_CHANGED_EVENT, deleteSeedIdea, getSeedIdeas, saveSeedIdea } from './seed-ideas';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('seed ideas', () => {
  it('starts empty and ignores corrupt storage', () => {
    expect(getSeedIdeas()).toEqual([]);

    localStorage.setItem('eidolon.web.seedStudio.ideas', '{not json');
    expect(getSeedIdeas()).toEqual([]);
  });

  it('saves an idea with normalized text and tags, and emits the changed event', () => {
    const listener = vi.fn();
    window.addEventListener(SEED_IDEAS_CHANGED_EVENT, listener);

    const saved = saveSeedIdea({ text: '  A duelist who   fears mirrors  ', tags: [' Fantasy ', 'fantasy'] });
    expect(saved).toMatchObject({ text: 'A duelist who fears mirrors', tags: ['fantasy'] });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getSeedIdeas()).toHaveLength(1);
  });

  it('rejects empty text and deletes by id', () => {
    expect(saveSeedIdea({ text: '   ' })).toBeNull();
    expect(getSeedIdeas()).toEqual([]);

    const first = saveSeedIdea({ text: 'First idea', tags: ['a'] });
    const second = saveSeedIdea({ text: 'Second idea', tags: [] });
    expect(getSeedIdeas().map((entry) => entry.text)).toEqual(['Second idea', 'First idea']);

    deleteSeedIdea(first!.id);
    expect(getSeedIdeas().map((entry) => entry.text)).toEqual(['Second idea']);
    expect(second).toBeDefined();
  });

  it('drops malformed stored records on read', () => {
    localStorage.setItem(
      'eidolon.web.seedStudio.ideas',
      JSON.stringify([{ id: 'x' }, { id: 'ok', text: 'OK', tags: [], createdAt: '2026-09-01T00:00:00.000Z' }]),
    );

    const all = getSeedIdeas();
    expect(all).toHaveLength(1);
    expect(all[0]?.text).toBe('OK');
  });
});
