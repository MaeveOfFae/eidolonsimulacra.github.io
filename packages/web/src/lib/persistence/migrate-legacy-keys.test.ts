import { LEGACY_STORAGE_KEYS, validateLegacyKeyRegistry } from '@char-gen/shared';
import { migrateLegacyStorageKeys } from './migrate-legacy-keys';

/**
 * Every TypeScript source in the web package, read as text.
 *
 * The point of this guard is that the legacy keys can never quietly return: after
 * the migration they are named in exactly one place (`shared/src/legacy-keys.ts`)
 * and this file, which has to spell them out to prove the migration works.
 */
const webSources = import.meta.glob(['../**/*.{ts,tsx}', '../../*.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const CONFIG = 'eidolon.web.config';
const LEGACY_CONFIG = 'bpui.web.config';
const THEMES = 'eidolon.web.themes.custom';
const LEGACY_THEMES = 'bpui.web.themes.custom';

describe('legacy key registry', () => {
  it('is well formed', () => {
    expect(validateLegacyKeyRegistry()).toEqual([]);
  });

  it('covers every pair the modules used to carry', () => {
    expect(LEGACY_STORAGE_KEYS.map((pair) => pair.current)).toEqual([
      'eidolon.web.config',
      'eidolon.web.apiKeys',
      'eidolon.web.apiKeys.persist',
      'eidolon.web.blueprints.overrides',
      'eidolon.web.templates.custom',
      'eidolon.web.themes.custom',
      'eidolon.web.seedGenerator.history',
      'eidolon.web.seedGenerator.favorites',
    ]);
  });

  it('reports a key that is on the wrong side of the rename', () => {
    expect(validateLegacyKeyRegistry([{ current: 'bpui.web.config', legacy: 'eidolon.web.config' }])).toEqual([
      'Current key does not use the eidolon prefix: bpui.web.config',
      'Legacy key does not use the bpui prefix: eidolon.web.config',
    ]);
  });

  it('reports duplicates, which would let one pair shadow another', () => {
    const issues = validateLegacyKeyRegistry([
      { current: CONFIG, legacy: LEGACY_CONFIG },
      { current: CONFIG, legacy: LEGACY_CONFIG },
    ]);

    expect(issues).toEqual([`Duplicate current key: ${CONFIG}`, `Duplicate legacy key: ${LEGACY_CONFIG}`]);
  });
});

describe('migrateLegacyStorageKeys', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('moves a legacy value onto the current key and deletes the old one', () => {
    localStorage.setItem(LEGACY_CONFIG, 'legacy payload');

    const result = migrateLegacyStorageKeys();

    expect(localStorage.getItem(CONFIG)).toBe('legacy payload');
    expect(localStorage.getItem(LEGACY_CONFIG)).toBeNull();
    expect(result.migrated).toEqual([CONFIG]);
  });

  it('migrates an empty-string value rather than treating it as absent', () => {
    // A present-but-empty value is a real value; dropping it would silently reset
    // whatever the user had configured.
    localStorage.setItem(LEGACY_CONFIG, '');

    const result = migrateLegacyStorageKeys();

    expect(result.migrated).toEqual([CONFIG]);
    expect(localStorage.getItem(CONFIG)).toBe('');
  });

  it('lets the current value win and drops a stale legacy copy', () => {
    localStorage.setItem(CONFIG, 'current');
    localStorage.setItem(LEGACY_CONFIG, 'stale');

    const result = migrateLegacyStorageKeys();

    expect(localStorage.getItem(CONFIG)).toBe('current');
    expect(localStorage.getItem(LEGACY_CONFIG)).toBeNull();
    expect(result.migrated).toEqual([]);
    expect(result.alreadyCurrent).toEqual([CONFIG]);
  });

  it('is idempotent', () => {
    localStorage.setItem(LEGACY_CONFIG, 'legacy payload');

    migrateLegacyStorageKeys();
    const second = migrateLegacyStorageKeys();

    expect(second.migrated).toEqual([]);
    expect(second.alreadyCurrent).toEqual([CONFIG]);
    expect(localStorage.getItem(CONFIG)).toBe('legacy payload');
  });

  it('migrates every pair it is given in one pass', () => {
    localStorage.setItem(LEGACY_CONFIG, 'config');
    localStorage.setItem(LEGACY_THEMES, 'themes');

    const result = migrateLegacyStorageKeys();

    expect(result.migrated).toEqual([CONFIG, THEMES]);
    expect(localStorage.getItem(THEMES)).toBe('themes');
    expect(localStorage.getItem(LEGACY_THEMES)).toBeNull();
  });

  it('leaves unrelated keys alone', () => {
    localStorage.setItem('eidolon.web.workspaceMode', 'bulk');
    localStorage.setItem('some.unrelated', 'x');

    migrateLegacyStorageKeys();

    expect(localStorage.getItem('eidolon.web.workspaceMode')).toBe('bulk');
    expect(localStorage.getItem('some.unrelated')).toBe('x');
  });

  it('does nothing when there is nothing to do', () => {
    const result = migrateLegacyStorageKeys();

    expect(result).toEqual({ migrated: [], alreadyCurrent: [] });
  });
});

describe('legacy key retirement', () => {
  it('left no production source reading a bpui.* key', () => {
    const offenders = Object.keys(webSources)
      .filter((key) => !key.endsWith('migrate-legacy-keys.test.ts'))
      .filter((key) => /bpui\.web/.test(webSources[key]))
      .map((key) => key.replace('../', ''));

    // The per-module fallbacks are gone; `migrateLegacyStorageKeys` is what keeps
    // existing users' data, so a new `bpui.` reference here is a mistake.
    expect(offenders).toEqual([]);
  });

  it('still covers every key the modules used to fall back to', () => {
    const legacyFromRegistry = LEGACY_STORAGE_KEYS.map((pair) => pair.legacy);

    expect(legacyFromRegistry).toEqual([
      'bpui.web.config',
      'bpui.web.apiKeys',
      'bpui.web.apiKeys.persist',
      'bpui.web.blueprints.overrides',
      'bpui.web.templates.custom',
      'bpui.web.themes.custom',
      'bpui.web.seedGenerator.history',
      'bpui.web.seedGenerator.favorites',
    ]);
  });
});
