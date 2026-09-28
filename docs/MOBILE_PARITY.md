# Mobile Parity Scope

What the mobile app (`packages/mobile`) has today versus the web app (`packages/web`), and what it would take to close the gap.

Status legend: **parity** (already works on mobile), **gap** (missing, portable), **decision** (not a port — see notes), **non-goal** (staged on web; do not build).

## Already at parity

| Area | Mobile entry point |
| --- | --- |
| Generate from seed / asset variants / batch / offspring / seed generator | `GenerateScreen`, `BatchGenerateScreen`, `OffspringScreen`, `SeedGeneratorScreen` |
| Refine + chat on a draft | `ChatScreen`, `api.refine`, `api.chat` |
| Character import (JSON + PNG card) | `GenerateScreen.handleImportCharacter` → shared `detectAndParseCharacter` |
| Drafts: list, detail, metadata, assets, revision snapshots + restore, export (json / text / combined / png / pdf), delete | `DraftsScreen`, `DraftDetailScreen`, `api.createDraftSnapshot` / `restoreDraftSnapshot` |
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
| 1 | **Draft archiving** (`archiveDraft` / `restoreDraft`, archived filter + an Archive view) | Shared already ships `applyDraftFilters` (honours `archived` / `include_archived`) and `isArchivedDraft`; web's behaviour is pinned by `api.drafts.test.ts`. Mobile only has `deleteDraft`. | S |
| 2 | **Lorebook generation** | The blueprint is already bundled on mobile — `src/generated/local-content.ts` contains `blueprints/system/lorebook_generator.md`. Web's flow is in `LorebookGeneratorPanel`. Needs one api method + one screen. | S–M |
| 3 | **PNG card write on export** | Shared exposes `buildPngCardBytes` / `extractPngCharaChunk`; mobile imports PNG cards already but does not appear to *write* an embedded character chunk. | S |
| 4 | **Release notes / "What's New"** | Web's data lives in `packages/web/src/lib/whats-new.ts`. Move the data (not the UI) into `packages/shared` so both surfaces render one source. | S |

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

1. **Tier 1 in order** (draft archiving → lorebook → PNG write → release notes). Each is small, uses existing shared helpers, and is independently shippable.
2. **Extract shared domain data** before Tier 2: move release notes, help/tour definitions and builtin themes out of `packages/web/src/lib/` into `packages/shared/`. Otherwise Tier 2 duplicates them a third time (`local/api.ts` already mirrors web's draft/template domains).
3. **Theme layer, then Help Center, then Info pages** — themes first because every later screen inherits the theming context.
4. **Tier 3 only on an explicit decision.**

## Risks and prerequisites

- **`packages/mobile/src/local/api.ts` already mirrors web's `api.ts` domains** (drafts, templates, blueprints). Adding more per-surface logic grows a third copy. The structural prerequisite for cheap parity is extracting the pure domain helpers (filters, response builders, readiness checks) into `packages/shared` and letting both surfaces consume them — the same move already made for the LLM layer.
- **Mobile has only 12 logic tests and no UI tests.** Web's api domains are now pinned by 40 characterization tests; mobile has no equivalent, so parity work there lands unverified. Add logic tests per tier as it lands.
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
