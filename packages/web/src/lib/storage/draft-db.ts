/**
 * Draft storage service.
 * Uses desktop app data in the Tauri runtime and IndexedDB in the browser.
 *
 * This module is now a barrel: the implementation lives in `./draft/`, split into the
 * entities and schemas, the desktop SQL store, the browser Dexie store, and the
 * `DraftStorage` API. The export list is pinned by `draft-db.test.ts` — a dozen
 * modules import this path, so a decomposition must not be able to drop a name.
 * Types are re-exported with `export type`, which `isolatedModules` requires.
 */
export { DRAFT_DB_SCHEMA, USAGE_DB_SCHEMA, COMPARISON_DB_SCHEMA } from './draft/draft-entities.js';
export type {
  DraftEntity,
  AssetEntity,
  TagEntity,
  DraftStorageDiagnostics,
  AssetWriteOptions,
  BulkDraftMetadataPatch,
} from './draft/draft-entities.js';

export { isDesktopDraftStoreEnabled, openDesktopDraftDatabase } from './draft/draft-sql-desktop.js';
export type { DraftSqlDatabase } from './draft/draft-sql-desktop.js';

export { DraftDatabase, getDraftStorageDiagnostics, exportRawDraftStorage, db } from './draft/draft-dexie.js';

export { DraftStorage } from './draft/draft-storage.js';
