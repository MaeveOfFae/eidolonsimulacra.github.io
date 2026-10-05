import { describe, expect, it } from 'vitest';
import * as draftDb from './draft-db';

/**
 * `draft-db.ts` is now a barrel over `./draft/*` — the entities and schemas, the
 * desktop SQL store, the browser Dexie store, and the `DraftStorage` API.
 *
 * The implementation was moved verbatim (verified line-by-line against the
 * pre-split file: 1,728 code lines in, 1,731 out, and the three extra lines are the
 * one deliberate change, `resetDraftStorageMigration`). The surface is what a
 * decomposition can silently break, and **twelve** modules import this path — every
 * draft screen, the API layers, `device-link`, `setup` — so it is pinned here. The
 * type-only exports (`DraftEntity`, `AssetEntity`, `TagEntity`,
 * `DraftStorageDiagnostics`, `AssetWriteOptions`, `BulkDraftMetadataPatch`,
 * `DraftSqlDatabase`) have no runtime presence to check and are covered by
 * `pnpm typecheck:web` at each use.
 */
const PUBLIC_SURFACE = [
  'COMPARISON_DB_SCHEMA',
  'DRAFT_DB_SCHEMA',
  'DraftDatabase',
  'DraftStorage',
  'USAGE_DB_SCHEMA',
  'db',
  'exportRawDraftStorage',
  'getDraftStorageDiagnostics',
  'isDesktopDraftStoreEnabled',
  'openDesktopDraftDatabase',
].sort();

describe('draft storage barrel', () => {
  it('exposes exactly the values the single module used to', () => {
    expect(Object.keys(draftDb).sort()).toEqual(PUBLIC_SURFACE);
  });
});
