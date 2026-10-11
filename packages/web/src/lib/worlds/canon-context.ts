/**
 * Resolves the canon context for a set of drafts.
 *
 * A world owns three bodies of canon: locks (facts that must not change),
 * universe notes (free-form framing), and library entries (curated setting
 * material). A draft is tied to a world through its `world_characters` link, so
 * a run over a linked draft inherits all three. Outside the desktop runtime
 * there are no persisted worlds, and this resolves to nothing.
 */

import { buildCanonContextLines, buildCanonLockConstraintLines, buildUniverseNoteContextLines } from '@char-gen/shared';
import { isSelfContainedDesktopRuntime } from '../runtime.js';
import { getCanonEntries, getCanonLocks, getUniverseNotes, getWorldCharacterDraftLinks } from './lore-api.js';

export interface CanonContext {
  /** Canon-lock lines: facts the draft must not change. */
  constraints: string[];
  /** Universe notes and canon-library lines: context the draft should honour. */
  context: string[];
}

const EMPTY_CANON_CONTEXT: CanonContext = { constraints: [], context: [] };

function uniqueDraftIds(draftIds: readonly string[]): string[] {
  const seen = new Set<string>();
  const ids: string[] = [];

  for (const draftId of draftIds) {
    const trimmed = typeof draftId === 'string' ? draftId.trim() : '';
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    ids.push(trimmed);
  }

  return ids;
}

export async function resolveCanonContext(draftIds: readonly string[]): Promise<CanonContext> {
  if (!isSelfContainedDesktopRuntime()) {
    return EMPTY_CANON_CONTEXT;
  }

  const ids = uniqueDraftIds(draftIds);
  if (ids.length === 0) {
    return EMPTY_CANON_CONTEXT;
  }

  const { links } = await getWorldCharacterDraftLinks({ draftIds: ids });
  const worldIds = [...new Set(links.map((link) => link.worldId))];
  if (worldIds.length === 0) {
    return EMPTY_CANON_CONTEXT;
  }

  const perWorld = await Promise.all(
    worldIds.map(async (worldId) => {
      const [locks, entries, notes] = await Promise.all([
        getCanonLocks(worldId),
        getCanonEntries(worldId),
        getUniverseNotes(worldId),
      ]);
      return { locks: locks.locks, entries: entries.entries, notes: notes.notes };
    }),
  );

  return {
    constraints: buildCanonLockConstraintLines(perWorld.flatMap((result) => result.locks)),
    // Notes are the broadest framing, so they lead the context block.
    context: [
      ...buildUniverseNoteContextLines(perWorld.flatMap((result) => result.notes)),
      ...buildCanonContextLines(perWorld.flatMap((result) => result.entries)),
    ],
  };
}
