import { describe, expect, it } from 'vitest';
import * as loreDb from './desktop-lore-db';

/**
 * `desktop-lore-db.ts` is now a barrel over `./lore/*` — the SQL core, the world
 * records, the timeline records, and the store-wide diagnostics/export/import.
 *
 * The implementation was moved verbatim (the split was verified line-by-line against
 * the original), but the *public surface* is the part that silently rots: a barrel
 * can drop an export and the only symptom is a runtime `is not a function` in
 * `DataManager` or `lore-api`, the two modules that import this path. So the surface
 * is pinned here instead. The one type export
 * (`DesktopLoreStorageDiagnostics`) has no runtime presence to check and is covered
 * by `pnpm typecheck:web` wherever it is used.
 */
const PUBLIC_SURFACE = [
  'addLocalTimelineEvent',
  'addLocalWorldCharacter',
  'addLocalWorldFaction',
  'addLocalWorldLocation',
  'addLocalWorldRelationship',
  'clearLocalLoreData',
  'createLocalTimeline',
  'createLocalWorld',
  'deleteLocalTimeline',
  'deleteLocalTimelineEvent',
  'deleteLocalWorld',
  'deleteLocalWorldCharacter',
  'deleteLocalWorldFaction',
  'deleteLocalWorldLocation',
  'deleteLocalWorldRelationship',
  'exportLocalLoreData',
  'exportLocalLoreStorageSnapshot',
  'getDesktopLoreDbInfo',
  'getDesktopLoreExportFileName',
  'getLocalLoreStorageDiagnostics',
  'getLocalTimeline',
  'getLocalWorld',
  'getLocalWorldCharacterDraftLinks',
  'getLocalWorldRelationshipAuditIssues',
  'getLocalWorlds',
  'importLocalLoreData',
  'updateLocalTimeline',
  'updateLocalTimelineEvent',
  'updateLocalWorld',
  'updateLocalWorldCharacter',
  'updateLocalWorldFaction',
  'updateLocalWorldLocation',
  'updateLocalWorldRelationship',
].sort();

describe('desktop lore storage barrel', () => {
  it('exposes exactly the functions the single module used to', () => {
    expect(Object.keys(loreDb).sort()).toEqual(PUBLIC_SURFACE);
  });
});
