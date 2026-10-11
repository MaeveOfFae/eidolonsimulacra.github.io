/**
 * Resolves the canon-lock constraint lines for a set of drafts.
 *
 * A canon lock lives on a world, and a draft is tied to a world through its
 * `world_characters` link — so a derivative run over a linked draft inherits the
 * locks of every world that draft belongs to. Outside the desktop runtime there
 * are no persisted worlds, so this resolves to no constraints.
 */

import { buildCanonLockConstraintLines, type WorldCanonLockRecord } from '@char-gen/shared';
import { isSelfContainedDesktopRuntime } from '../runtime.js';
import { getCanonLocks, getWorldCharacterDraftLinks } from './lore-api.js';

export async function resolveCanonLockConstraintLines(draftIds: readonly string[]): Promise<string[]> {
  if (!isSelfContainedDesktopRuntime()) {
    return [];
  }

  const ids = [...new Set(draftIds.map((id) => id.trim()).filter((id) => id.length > 0))];
  if (ids.length === 0) {
    return [];
  }

  const { links } = await getWorldCharacterDraftLinks({ draftIds: ids });
  const worldIds = [...new Set(links.map((link) => link.worldId))];
  if (worldIds.length === 0) {
    return [];
  }

  const results = await Promise.all(worldIds.map((worldId) => getCanonLocks(worldId)));
  const locks: WorldCanonLockRecord[] = results.flatMap((result) => result.locks);
  return buildCanonLockConstraintLines(locks);
}
