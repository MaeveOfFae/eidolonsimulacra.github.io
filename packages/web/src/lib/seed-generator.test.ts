import { beforeEach, describe, expect, it } from 'vitest';
import {
  archiveFavoriteSeed,
  archiveSeedRun,
  getArchivedFavoriteSeeds,
  getArchivedSeedRuns,
  getFavoriteSeeds,
  getSeedRunHistory,
  restoreFavoriteSeed,
  restoreSeedRun,
  saveSeedRun,
  toggleFavoriteSeed,
} from './seed-generator';

describe('seed archive helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('archives and restores favorite seeds without losing the record', () => {
    toggleFavoriteSeed('archivable seed');
    expect(getFavoriteSeeds().map((entry) => entry.seed)).toEqual(['archivable seed']);

    archiveFavoriteSeed('archivable seed');
    expect(getFavoriteSeeds()).toEqual([]);
    expect(getArchivedFavoriteSeeds().map((entry) => entry.seed)).toEqual(['archivable seed']);

    restoreFavoriteSeed('archivable seed');
    expect(getArchivedFavoriteSeeds()).toEqual([]);
    expect(getFavoriteSeeds().map((entry) => entry.seed)).toEqual(['archivable seed']);
  });

  it('moves seed runs between active history and archive', () => {
    saveSeedRun({
      request: {
        genreLines: 'fantasy:slow-burn',
        count: 5,
        coverageMode: 'per-genre',
        surpriseMode: false,
      },
      seeds: ['one', 'two'],
    });

    const [activeRun] = getSeedRunHistory();
    expect(activeRun).toBeDefined();

    archiveSeedRun(activeRun.id);
    expect(getSeedRunHistory()).toEqual([]);
    expect(getArchivedSeedRuns().map((entry) => entry.id)).toEqual([activeRun.id]);

    restoreSeedRun(activeRun.id);
    expect(getArchivedSeedRuns()).toEqual([]);
    expect(getSeedRunHistory().map((entry) => entry.id)).toEqual([activeRun.id]);
  });
});
