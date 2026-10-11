/**
 * Canon locks: world-scoped facts that derivative drafts must not change.
 *
 * A lock is a plain instruction ("Vesna's surname is Vale and never changes")
 * attached to a world, and optionally to one of its characters, factions,
 * locations, or timelines. The registry itself is desktop-persisted; this
 * module is the runtime-free contract for building the constraint lines that
 * generation sends, so both the world editor's preview and the generation
 * call sites format a lock the same way.
 */

import type { CanonLockTargetKind, WorldCanonLockRecord } from './types';

export const CANON_LOCK_TARGET_KINDS: readonly CanonLockTargetKind[] = [
  'world',
  'character',
  'faction',
  'location',
  'timeline',
];

/** Collapse a statement to a single trimmed line; non-strings become empty. */
export function normalizeCanonLockStatement(input: unknown): string {
  return typeof input === 'string' ? input.replace(/\s+/g, ' ').trim() : '';
}

/** Coerce a target kind, defaulting to `world` for anything unrecognised. */
export function normalizeCanonLockTargetKind(input: unknown): CanonLockTargetKind {
  return typeof input === 'string' && (CANON_LOCK_TARGET_KINDS as readonly string[]).includes(input)
    ? (input as CanonLockTargetKind)
    : 'world';
}

/** The scope a lock is printed under, e.g. `World` or `Vesna (character)`. */
export function formatCanonLockScope(lock: Pick<WorldCanonLockRecord, 'targetKind' | 'targetLabel'>): string {
  if (lock.targetKind === 'world') {
    return 'World';
  }

  const label = lock.targetLabel?.trim();
  return label ? `${label} (${lock.targetKind})` : lock.targetKind;
}

/** One constraint line: `<scope>: <statement>`. */
export function formatCanonLockLine(
  lock: Pick<WorldCanonLockRecord, 'targetKind' | 'targetLabel' | 'statement'>,
): string {
  return `${formatCanonLockScope(lock)}: ${normalizeCanonLockStatement(lock.statement)}`;
}

/**
 * The ordered, de-duplicated constraint lines generation sends for a set of
 * locks. Blank statements are dropped so an unfinished lock never reaches a
 * prompt as an empty rule.
 */
export function buildCanonLockConstraintLines(
  locks: readonly Pick<WorldCanonLockRecord, 'targetKind' | 'targetLabel' | 'statement'>[],
): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const lock of locks) {
    if (!normalizeCanonLockStatement(lock.statement)) {
      continue;
    }

    const line = formatCanonLockLine(lock);
    if (seen.has(line)) {
      continue;
    }

    seen.add(line);
    lines.push(line);
  }

  return lines;
}
