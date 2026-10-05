/**
 * The legacy `bpui.*` storage keys, collected in one place on their way out.
 *
 * The app was renamed from `bpui` to `eidolon`, so every persisted value moved
 * from a `bpui.*` key to an `eidolon.*` one. Each module kept reading its old key
 * as a fallback, which migrates *lazily*: the first read of a legacy value writes
 * it to the current key and deletes the old one. That works, but only for the
 * screens a user actually opens — a key behind an unvisited screen never moves, so
 * the fallbacks could never be removed.
 *
 * This registry makes one eager pass possible at startup (see
 * `packages/web/src/lib/persistence/migrate-legacy-keys.ts`), after which the
 * per-module fallbacks are gone and the keys are retired for good.
 *
 * It lives in `shared` because the shared API service also reads
 * `bpui.web.apiKeys` to build its request header, and `shared` cannot import from
 * `web`.
 */
export interface LegacyStorageKeyPair {
  /** The `eidolon.*` key in use today. */
  current: string;
  /** The `bpui.*` key it replaced. */
  legacy: string;
}

export const LEGACY_STORAGE_KEYS: readonly LegacyStorageKeyPair[] = [
  { current: 'eidolon.web.config', legacy: 'bpui.web.config' },
  { current: 'eidolon.web.apiKeys', legacy: 'bpui.web.apiKeys' },
  { current: 'eidolon.web.apiKeys.persist', legacy: 'bpui.web.apiKeys.persist' },
  { current: 'eidolon.web.blueprints.overrides', legacy: 'bpui.web.blueprints.overrides' },
  { current: 'eidolon.web.templates.custom', legacy: 'bpui.web.templates.custom' },
  { current: 'eidolon.web.themes.custom', legacy: 'bpui.web.themes.custom' },
  { current: 'eidolon.web.seedGenerator.history', legacy: 'bpui.web.seedGenerator.history' },
  { current: 'eidolon.web.seedGenerator.favorites', legacy: 'bpui.web.seedGenerator.favorites' },
];

/** Every legacy key belonging to a current one, for callers that need the mapping. */
export function legacyKeysFor(currentKey: string): string[] {
  return LEGACY_STORAGE_KEYS.filter((pair) => pair.current === currentKey).map((pair) => pair.legacy);
}

/**
 * Registry sanity, so a malformed entry cannot silently skip a user's data.
 * Returns human-readable issues, empty when the registry is usable.
 */
export function validateLegacyKeyRegistry(pairs: readonly LegacyStorageKeyPair[] = LEGACY_STORAGE_KEYS): string[] {
  const issues: string[] = [];
  const seenCurrent = new Set<string>();
  const seenLegacy = new Set<string>();

  for (const { current, legacy } of pairs) {
    if (!current.startsWith('eidolon.')) {
      issues.push(`Current key does not use the eidolon prefix: ${current}`);
    }

    if (!legacy.startsWith('bpui.')) {
      issues.push(`Legacy key does not use the bpui prefix: ${legacy}`);
    }

    if (seenCurrent.has(current)) {
      issues.push(`Duplicate current key: ${current}`);
    }
    seenCurrent.add(current);

    if (seenLegacy.has(legacy)) {
      issues.push(`Duplicate legacy key: ${legacy}`);
    }
    seenLegacy.add(legacy);
  }

  return issues;
}
