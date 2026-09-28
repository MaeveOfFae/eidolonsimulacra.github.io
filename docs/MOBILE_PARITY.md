# Mobile Parity Scope

What the mobile app (`packages/mobile`) has today versus the web app (`packages/web`), and what it would take to close the gap.

Status legend: **parity** (already works on mobile), **gap** (missing, portable), **decision** (not a port — see notes), **non-goal** (staged on web; do not build).

## Already at parity

| Area | Mobile entry point |
| --- | --- |
| Generate from seed / asset variants / batch / offspring / seed generator | `GenerateScreen`, `BatchGenerateScreen`, `OffspringScreen`, `SeedGeneratorScreen` |
| Lorebook packet generation (references, focus, save/load/import/export) | `LorebookGeneratorScreen`, `api.generateLorebook`, `src/local/lorebook-packets.ts` |
| Refine + chat on a draft | `ChatScreen`, `api.refine`, `api.chat` |
| Character import (JSON + PNG card) | `GenerateScreen.handleImportCharacter` → shared `detectAndParseCharacter` |
| Drafts: list, detail, metadata, assets, revision snapshots + restore, archive + restore, export (json / text / combined / png / pdf), delete | `DraftsScreen`, `DraftDetailScreen`, `api.createDraftSnapshot` / `restoreDraftSnapshot` / `archiveDraft` / `restoreDraft` |
| Templates: list, detail, create, update, delete, validate, export, import-from-text | `TemplatesScreen`, `api.*Template*` |
| Blueprints: browse + edit | `BlueprintsScreen`, `BlueprintEditorScreen`, `api.updateBlueprint` |
| Similarity, lineage, validation, token optimization | `SimilarityScreen`, `LineageScreen`, `ValidationScreen`, `TokenOptimizationScreen` |
| Config: provider, model, keys, connection test, model list/refresh | `SettingsScreen`, `api.getConfig` / `updateConfig` / `testConnection` |
| Cross-device transfer: workspace bundles + desktop companion pairing | `src/local/device-link.ts`, `src/local/desktop-companion.ts`, `SettingsScreen` |
| Basic first-run guide + help state | `HomeScreen`, `HelpState` in `src/storage/device-config.ts` |

That is the majority of the day-to-day loop. The gaps below are the remainder.

## Finding that changes the scope: worlds and timelines are desktop-only

`packages/web/src/lib/api.ts` contains **26 `isSelfContainedDesktopRuntime()` guards**. In the browser:

- `getWorlds()` returns `{ worlds: [] }`
- every world/timeline write throws `new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE)`
- the message itself reads: *"Persisted worlds, factions, locations, and timelines are currently only available in the desktop app."*

So worlds/timelines are **not a working browser feature waiting to be ported**. Mobile "parity" there would mean designing a third data layer (expo-sqlite) for something the web app cannot do either. That is a **product decision** (Tier 3), not a parity task.

## Tier 1 — self-contained gaps (recommended first)

| # | Gap | What exists to build on | Effort |
| --- | --- | --- | --- |
| 1 | **Draft archiving** (`archiveDraft` / `restoreDraft`, archived filter + an Archive view) — **done** | Shared already ships `applyDraftFilters` (honours `archived` / `include_archived`) and `isArchivedDraft`; web's behaviour is pinned by `api.drafts.test.ts`. Mobile now has `archiveDraft` / `restoreDraft` on `MobileLocalAPI`, an `Archived` filter mode in `DraftsScreen`, a detail-screen action, and `src/lib/draft-archive.ts` with 11 logic tests. | S |
| 2 | **Lorebook generation** — **done** | The blueprint was already bundled on mobile (`blueprints/system/lorebook_generator.md`). Web's flow ran through `LorebookGeneratorPanel` → `GenerationService.generateLorebook`. Mobile now has `generateLorebook` on `MobileLocalAPI`, a `LorebookGeneratorScreen` reachable from the Home tools grid, and the packet format itself was extracted into `packages/shared/src/lorebook-packets.ts` so both surfaces persist the same records. | S–M |
| 3 | **PNG card write on export** — **done** | Shared exposes `buildPngCardBytes` / `extractPngCharaChunk`; mobile writes the embedded `chara` chunk through `local/api.ts` and imports PNG cards through the same shared helpers. Landed with `bdcba21` (PDF export). | S |
| 4 | **Release notes / "What's New"** | Web's data lives in `packages/web/src/lib/whats-new.ts`. Move the data (not the UI) into `packages/shared` so both surfaces render one source. | S |

Tier 1 status: items **1**, **2** and **3** are shipped; item **4** (release notes) is outstanding.

Notes on the archiving port (item 1):

- Both surfaces take a safeguard revision snapshot before flipping `archived_at` (`pre-draft-archive` / `pre-draft-restore`), so the previous state stays recoverable from revision history.
- The archived list is a separate query on both surfaces (`['drafts', 'archived']` → `getDrafts({ archived: true })`), because `applyDraftFilters` excludes archived drafts from the default list.
- Mobile has no separate Archive tab: archiving from the list or the detail screen moves the draft into the `Archived` filter chip, which keeps it reachable from the existing navigation without adding a tab.

Notes on the lorebook port (item 2):

- This item paid down the structural risk below instead of adding a third copy: the packet format, the reference-suite compaction rules, the synthesis prompt and the feature-blueprint ranking all moved into `packages/shared`, and web's equivalents are now shims. `packages/web/src/lib/lorebook-packets.ts` and `reference-context.ts` keep only browser storage/lookups.
- Mobile reuses web's semantics exactly — `reference_summary` plus the `lorebook` / `character_sheet` / `post_history` preferred order, the `lorebook_*` prefix sweep, the same `MAX_CONNECTED_DRAFT_REFERENCES` cap, and the same `TASK:`/`CONSTRAINT:` prompt lines.
- Mobile is generate → inspect → copy/save/export/import only. Web's "promote packet into a persisted world" step is deliberately not ported: worlds are desktop-only (see Tier 3), so there is nothing to promote into on device.

## Tier 2 — feature systems that need new UI

| # | Gap | What exists to build on | Effort |
| --- | --- | --- | --- |
| 5 | **Themes** (pick a theme; possibly custom themes) | Web has 27 builtin themes now isolated in `packages/web/src/lib/themes/builtin-themes.ts` plus custom-theme storage and Theme Studio. Mobile has **no theme layer at all** — styles are inline `StyleSheet` objects with hardcoded colours. Requires moving builtin theme data into `shared` and mapping web colour tokens (CSS variables) onto a React Native theme context. Authoring (Theme Studio / Tokenizer) stays web-only. | M–L |
| 6 | **Help Center + guided tours** | Web has `packages/web/src/lib/help.ts` with per-route guides, tour definitions and coverage validation, plus `GuidedTourOverlay`. Mobile has only a first-run guide + `HelpState`. Needs the guide/tour data moved to `shared` and an RN overlay equivalent. | M |
| 7 | **Info / legal pages** (About, License, Terms, Privacy, Security, Code of Conduct, Community) | Web's 8 `DocumentPage`-based routes. Mobile needs simple scrollable document screens; content should come from `shared` so it cannot drift. | M |

## Tier 3 — requires a new data layer (product decision)

| # | Item | Why it is not a port |
| --- | --- | --- |
| 8 | **Worlds, factions, locations, timelines, events** | Desktop-only on web (see above). Mobile would need an `expo-sqlite` schema, its own CRUD layer, and a UI — for a feature with no browser implementation to mirror. Decide whether mobile should own worldbuilding at all before spending anything here. |

## Non-goals (deliberately not ported)

These are staged or explicitly "planned" on web, so they must not be built for parity:

- Event tracking (web `/events`: *"Event tracking is staged, not live."*)
- Batch scheduling and reusable batch presets (web `/batch`: *"Not live"*)
- Export preview and publishing flows (web: *"Planned Export Extras"*)
- World canon / worldbook / universe-notes / canon-lock modules
- Timeline event editing and the continuity assistant/checker
- Theme Studio and Tokenizer authoring surfaces (web-only by design)

## Recommended sequence

1. **Tier 1 in order** (draft archiving ✅ → lorebook ✅ → PNG write ✅ → release notes). Each is small, uses existing shared helpers, and is independently shippable. Next up: **release notes** (item 4).
2. **Extract shared domain data** before Tier 2: move release notes, help/tour definitions and builtin themes out of `packages/web/src/lib/` into `packages/shared/`. Otherwise Tier 2 duplicates them a third time (`local/api.ts` already mirrors web's draft/template domains).
3. **Theme layer, then Help Center, then Info pages** — themes first because every later screen inherits the theming context.
4. **Tier 3 only on an explicit decision.**

## Risks and prerequisites

- **`packages/mobile/src/local/api.ts` already mirrors web's `api.ts` domains** (drafts, templates, blueprints). Adding more per-surface logic grows a third copy. The structural prerequisite for cheap parity is extracting the pure domain helpers (filters, response builders, readiness checks) into `packages/shared` and letting both surfaces consume them — the same move already made for the LLM layer. **Item 2 paid part of this down**: the lorebook packet format, reference-suite compaction, synthesis prompt and feature-blueprint ranking now live in shared, so web's `lorebook-packets.ts`, `reference-context.ts` and `blueprints/featureSelection.ts` are thin shims rather than parallel implementations.
- **Mobile has only a small logic-test suite and no UI tests.** Web's api domains are pinned by 41 characterization tests; mobile now has 4 files / 45 tests (`lorebook.test.ts` covers lorebook generation, `draft-archive.test.ts` covers archiving, plus `compare-selection.test.ts` and `errors.test.ts`); shared grew to 10 files / 103 tests. Add logic tests per tier as it lands so parity work does not ship unverified.
- **Mobile UI is verified by typecheck and lint only.** `test:mobile` runs in a node environment and covers pure logic; nothing renders the React Native screens, so keep screen files thin and push behaviour into `src/lib/*` where it can be pinned.
- **Theming is a real port, not a config flag.** Web themes are CSS custom properties; React Native needs a context + `StyleSheet` values, and the current mobile screens hardcode colours inline, so each screen touched must be converted.
- **No native release CI.** Mobile builds stay outside the default CI path, so parity work is validated by the pipeline only through typecheck/lint/test.

## Acceptance criteria per tier

- **Tier 1**: each item has a passing logic test in `packages/mobile` and is reachable from the existing navigation without adding a new tab.
- **Tier 2**: shared owns the moved data, both surfaces import it, and `pnpm check:placeholders`, lint and typecheck stay green for both packages.
- **Tier 3**: not started until a written decision records who owns worldbuilding (desktop only, mobile too, or neither).

## How to verify this analysis

- `packages/mobile/App.tsx` — the full navigator (5 tabs plus the Home and Drafts stacks)
- `packages/mobile/src/local/api.ts` — the mobile API surface
- `packages/web/src/App.tsx` — the 30 web routes
- `packages/web/src/lib/api.ts` — `DESKTOP_WORLDS_ONLY_MESSAGE` and the 26 desktop guards
- `packages/shared/src/lorebook-packets.ts`, `lorebook-prompt.ts`, `blueprint-features.ts` — the shared domain extracted by Tier 1 item 2
