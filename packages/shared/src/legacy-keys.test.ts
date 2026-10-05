import { describe, expect, it } from 'vitest';
import { LEGACY_STORAGE_KEYS, validateLegacyKeyRegistry } from './legacy-keys';

/**
 * The registry's own guard, on the `shared` side of the house.
 *
 * `shared` cannot be scanned from a web test (it is consumed as built `dist`), so
 * the check that the legacy keys live in exactly one place has to run here.
 */
const sharedSources = import.meta.glob('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

describe('legacy key registry', () => {
  it('is well formed', () => {
    expect(validateLegacyKeyRegistry()).toEqual([]);
  });

  it('is the only module in shared that names a bpui.* key', () => {
    const offenders = Object.keys(sharedSources)
      .filter((key) => !key.endsWith('legacy-keys.ts') && !key.endsWith('legacy-keys.test.ts'))
      .filter((key) => /bpui\.web/.test(sharedSources[key]))
      .map((key) => key.replace('./', ''));

    expect(offenders).toEqual([]);
  });

  it('maps every legacy key onto a distinct current key', () => {
    const currents = LEGACY_STORAGE_KEYS.map((pair) => pair.current);

    expect(new Set(currents).size).toBe(currents.length);
  });
});
