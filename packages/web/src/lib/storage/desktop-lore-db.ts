/**
 * The desktop lore store (worlds, timelines, their records and the whole-store
 * diagnostics/export/import) for the self-contained desktop runtime.
 *
 * This module is now a barrel: the implementation lives in `./lore/`, split into the
 * SQL core, the world records, the timeline records and the store-wide operations.
 * The export list below is pinned by `desktop-lore-db.test.ts`, because the path was
 * what the rest of the app imported (`DataManager` and `lore-api`) and a decomposition
 * should not be able to quietly drop one.
 */
export type { DesktopLoreStorageDiagnostics } from './lore/desktop-lore-sql.js';

export {
  getLocalWorlds,
  getLocalWorld,
  getLocalWorldCharacterDraftLinks,
  getLocalWorldRelationshipAuditIssues,
  createLocalWorld,
  updateLocalWorld,
  deleteLocalWorld,
  addLocalWorldCharacter,
  updateLocalWorldCharacter,
  deleteLocalWorldCharacter,
  addLocalWorldFaction,
  updateLocalWorldFaction,
  deleteLocalWorldFaction,
  addLocalWorldLocation,
  updateLocalWorldLocation,
  deleteLocalWorldLocation,
  addLocalWorldRelationship,
  updateLocalWorldRelationship,
  deleteLocalWorldRelationship,
} from './lore/desktop-lore-worlds.js';

export {
  createLocalTimeline,
  getLocalTimeline,
  updateLocalTimeline,
  deleteLocalTimeline,
  addLocalTimelineEvent,
  updateLocalTimelineEvent,
  deleteLocalTimelineEvent,
} from './lore/desktop-lore-timelines.js';

export {
  getDesktopLoreDbInfo,
  getLocalLoreStorageDiagnostics,
  exportLocalLoreStorageSnapshot,
  exportLocalLoreData,
  clearLocalLoreData,
  importLocalLoreData,
  getDesktopLoreExportFileName,
} from './lore/desktop-lore-export.js';
