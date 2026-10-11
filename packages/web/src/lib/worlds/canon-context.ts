/**
 * Resolves the canon context for a set of drafts.
 *
 * A world owns two bodies of canon: locks (facts that must not change) and
 * library entries (setting material to honour). A draft is tied to a world
 * through its `world_characters` link, so a run over a linked draft inherits
 * both. Outside the desktop runtime there are no persisted worlds, and this
 * resolves to nothing.
 */

import { buildCanonContextLines, buildCanonLockConstraintLines } from '@char-gen/shared';
import { isSelfContainedDesktopRuntime } from '../runtime.js';
import { getCanonEntries, getCanonLocks, getWorldCharacterDraftLinks } from './lore-api.js';

export interface CanonContext {
  /** Canon-lock lines: facts the draft must not change. */
  constraints: string[];
  /** Canon-library lines: setting material the draft should honour as context. */
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
      const [locks, entries] = await Promise.all([getCanonLocks(worldId), getCanonEntries(worldId)]);
      return { locks: locks.locks, entries: entries.entries };
    }),
  );

  return {
    constraints: buildCanonLockConstraintLines(perWorld.flatMap((result) => result.locks)),
    context: buildCanonContextLines(perWorld.flatMap((result) => result.entries)),
  };
}
