/**
 * The final migration off the legacy `bpui.*` storage keys.
 *
 * Runs once at startup, before the app renders, because the per-module fallbacks
 * are gone: anything still sitting under a `bpui.*` key would otherwise be
 * orphaned the moment the app reads it. Migrating eagerly also means a user who
 * never opens Settings still gets their keys and config moved.
 *
 * Uses the shared persistence layer rather than touching `localStorage`, so the
 * desktop (AppData file) and browser backends both migrate through one path.
 */
import { LEGACY_STORAGE_KEYS, type LegacyStorageKeyPair } from '@char-gen/shared';
import { readPersistedString, removePersistedValues, writePersistedString } from './storage.js';

export interface LegacyMigrationResult {
  /** Current keys that received a legacy value. */
  migrated: string[];
  /** Current keys that already had a value, so the legacy copy was dropped instead. */
  alreadyCurrent: string[];
}

/**
 * Move every legacy value onto its current key and delete the old one.
 *
 * Idempotent: once migrated there is nothing to move, and a stale legacy copy
 * sitting beside a current value is deleted rather than allowed to win later.
 */
export function migrateLegacyStorageKeys(
  pairs: readonly LegacyStorageKeyPair[] = LEGACY_STORAGE_KEYS,
): LegacyMigrationResult {
  const migrated: string[] = [];
  const alreadyCurrent: string[] = [];

  for (const { current, legacy } of pairs) {
    if (readPersistedString(current)) {
      // The current key wins. Drop a stale legacy copy if one is still around.
      removePersistedValues([legacy]);
      alreadyCurrent.push(current);
      continue;
    }

    const stored = readPersistedString(legacy);
    if (!stored) {
      continue;
    }

    // `writePersistedString` deletes the legacy keys it is handed, so this both
    // moves the value and retires the old key in one step.
    writePersistedString(current, [legacy], stored.value);
    migrated.push(current);
  }

  return { migrated, alreadyCurrent };
}
