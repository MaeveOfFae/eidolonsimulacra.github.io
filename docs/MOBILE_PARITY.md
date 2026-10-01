# Mobile Parity Scope

What the mobile app (`packages/mobile`) has today versus the web app (`packages/web`), and what it would take to close the gap.

Status legend: **parity** (already works on mobile), **gap** (missing, portable), **decision** (not a port — see notes), **non-goal** (staged on web; do not build).

## Already at parity

| Area | Mobile entry point |
| --- | --- |
| Generate from seed / asset variants / batch / offspring / seed generator | `GenerateScreen`, `BatchGenerateScreen`, `OffspringScreen`, `SeedGeneratorScreen` |
| Lorebook packet generation (references, focus, save/load/import/export) | `LorebookGeneratorScreen`, `api.generateLorebook`, `src/local/lorebook-packets.ts` |
| What's New / release notes | `WhatsNewScreen`, shared `releaseNotes` in `packages/shared/src/whats-new.ts` |
| Theme selection (builtin catalogue, live chrome retint) | `ThemePickerScreen`, `src/theme/ThemeProvider.tsx`, shared `builtinThemes` |
| Refine + chat on a draft | `ChatScreen`, `api.refine`, `api.chat` |
| Character import (JSON + PNG card) | `GenerateScreen.handleImportCharacter` → shared `detectAndParseCharacter` |
| Drafts: list, detail, metadata, assets, revision snapshots + restore, archive + restore, export (json / text / combined / png / pdf), delete | `DraftsScreen`, `DraftDetailScreen`, `api.createDraftSnapshot` / `restoreDraftSnapshot` / `archiveDraft` / `restoreDraft` |
| Templates: list, detail, create, update, delete, validate, export, import-from-text | `TemplatesScreen`, `api.*Template*` |
| Blueprints: browse + edit | `BlueprintsScreen`, `BlueprintEditorScreen`, `api.updateBlueprint` |
| Similarity, lineage, validation, token optimization | `SimilarityScreen`, `LineageScreen`, `ValidationScreen`, `TokenOptimizationScreen` |
| Config: provider, model, keys, connection test, model list/refresh | `SettingsScreen`, `api.getConfig` / `updateConfig` / `testConnection` |
| Cross-device transfer: workspace bundles + desktop companion pairing | `src/local/device-link.ts`, `src/local/desktop-companion.ts`, `SettingsScreen` |
| Basic first-run guide + help state | `HomeScreen`, `HelpState` in `src/storage/device-config.ts` |
| Help Center: starter guide, topic library, walkable guided tours | `HelpCenterScreen`, shared `helpTopics` / `gettingStartedSteps` / `guidedTours` in `packages/shared/src/help.ts` |
| Info / legal: About hub, Community, License, Terms, Privacy, Security, Code of Conduct | `AboutScreen`, `CommunityScreen`, `InfoDocumentScreen`, shared content in `packages/shared/src/info/` |
| Download page: desktop installers and the Android APK (iOS pending), with sizes and caveats | `DownloadScreen`, shared `downloadChannels` in `packages/shared/src/info/download.ts` |

That is the majority of the day-to-day loop. The gaps below are the remainder.

## Finding that changes the scope: worlds and timelines are desktop-only

`packages/web/src/lib/api.ts` contains **26 `isSelfContainedDesktopRuntime()` guards**. In the browser:

- `getWorlds()` returns `{ worlds: [] }`
- every world/timeline write throws `new APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE)`
- the message itself reads: *"Persisted worlds, factions, locations, and timelines are currently only available in the desktop app."*

So worlds/timelines are **not a working browser feature waiting to be ported**. Mobile "parity" there would mean a second persisted canon store for something the browser app cannot do either. That is a **product decision** (Tier 3), not a parity task — and it has now been made: see [`WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md) (desktop-only ownership).

## Tier 1 — self-contained gaps (recommended first)

| # | Gap | What exists to build on | Effort |
| --- | --- | --- | --- |
| 1 | **Draft archiving** (`archiveDraft` / `restoreDraft`, archived filter + an Archive view) — **done** | Shared already ships `applyDraftFilters` (honours `archived` / `include_archived`) and `isArchivedDraft`; web's behaviour is pinned by `api.drafts.test.ts`. Mobile now has `archiveDraft` / `restoreDraft` on `MobileLocalAPI`, an `Archived` filter mode in `DraftsScreen`, a detail-screen action, and `src/lib/draft-archive.ts` with 11 logic tests. | S |
| 2 | **Lorebook generation** — **done** | The blueprint was already bundled on mobile (`blueprints/system/lorebook_generator.md`). Web's flow ran through `LorebookGeneratorPanel` → `GenerationService.generateLorebook`. Mobile now has `generateLorebook` on `MobileLocalAPI`, a `LorebookGeneratorScreen` reachable from the Home tools grid, and the packet format itself was extracted into `packages/shared/src/lorebook-packets.ts` so both surfaces persist the same records. | S–M |
| 3 | **PNG card write on export** — **done** | Shared exposes `buildPngCardBytes` / `extractPngCharaChunk`; mobile writes the embedded `chara` chunk through `local/api.ts` and imports PNG cards through the same shared helpers. Landed with `bdcba21` (PDF export). | S |
| 4 | **Release notes / "What's New"** — **done** | Web's data lived in `packages/web/src/lib/whats-new.ts` and was written by `tools/generation/generate-release-notes.mjs`. The data (not the UI) now lives in `packages/shared/src/whats-new.ts`, both release-notes tools write/read the shared path, web's module is a re-export shim, and mobile renders the same entries in `WhatsNewScreen`. | S |

Tier 1 status: **all four items are shipped.**

Notes on the archiving port (item 1):

- Both surfaces take a safeguard revision snapshot before flipping `archived_at` (`pre-draft-archive` / `pre-draft-restore`), so the previous state stays recoverable from revision history.
- The archived list is a separate query on both surfaces (`['drafts', 'archived']` → `getDrafts({ archived: true })`), because `applyDraftFilters` excludes archived drafts from the default list.
- Mobile has no separate Archive tab: archiving from the list or the detail screen moves the draft into the `Archived` filter chip, which keeps it reachable from the existing navigation without adding a tab.

Notes on the lorebook port (item 2):

- This item paid down the structural risk below instead of adding a third copy: the packet format, the reference-suite compaction rules, the synthesis prompt and the feature-blueprint ranking all moved into `packages/shared`, and web's equivalents are now shims. `packages/web/src/lib/lorebook-packets.ts` and `reference-context.ts` keep only browser storage/lookups.
- Mobile reuses web's semantics exactly — `reference_summary` plus the `lorebook` / `character_sheet` / `post_history` preferred order, the `lorebook_*` prefix sweep, the same `MAX_CONNECTED_DRAFT_REFERENCES` cap, and the same `TASK:`/`CONSTRAINT:` prompt lines.
- Mobile is generate → inspect → copy/save/export/import only. Web's "promote packet into a persisted world" step is deliberately not ported: worlds are desktop-only (see Tier 3), so there is nothing to promote into on device.

Notes on the release-notes port (item 4):

- The data moved **byte-identically** (same entries, same formatting) to `packages/shared/src/whats-new.ts`, and `generate-release-notes.mjs` / `check-release-notes-version.mjs` now write and read the shared path — so the next release bump lands in one place and both surfaces pick it up. Verified with a generator `--dry-run` and `pnpm release:notes:check` after the move.
- Web keeps `@/lib/whats-new` as a re-export shim, so `WhatsNewPage` and the web tests were untouched.
- Release-note link targets are web routes. Mobile maps the five tab routes (`/generate`, `/templates`, `/drafts`, `/settings`, `/home`) onto tabs and renders any other target as inert text, so a link never pretends to navigate somewhere it cannot; `whats-new.test.ts` fails if tooling ever ships a route mobile cannot reach.
- Mobile does not claim the web binary version (`__APP_VERSION__` is a web build constant). The screen reports the release line from the shared data itself, which is the same source web's notes describe.

Notes on the theme port (item 5, first slice):

- The 27 builtin presets moved **byte-identically** into `packages/shared/src/themes/builtin-themes.ts`; the shared test pins the catalogue size, unique names, the full 24-token colour set per theme, six-digit hex validity, and that every `based_on` reference resolves. Web's `lib/themes/builtin-themes.ts` is a re-export shim, so `api.ts` and `api.themes.test.ts` were untouched.
- Mobile resolution mirrors web's `ThemeProvider`: match `config.theme_name`, fall back to the first available preset, default `'dark'`. The token→chrome mapping mirrors web's `themeColorsToCssVariables` (`--primary` = accent, `--card` = surface, `--border` = border), and the navigation theme's `dark` flag is derived from background luminance so the status bar style flips for light themes.
- `src/theme/theme.ts` stays free of React Native / React Navigation imports so `test:mobile` can run it in node; the `DarkTheme` composition happens in `App.tsx`.
- Selecting a theme persists through the same `['device-config']` query every other settings surface uses, so the tab bar, stack headers, status bar and scene backgrounds retint immediately without an app restart.
- Custom themes and Theme Studio / Tokenizer authoring stay web-only by design; the mobile picker lists the shared builtin catalogue only.
- Screen conversion used one convention so it stayed mechanical: screen background → `background`, cards → `surface`, inputs/chips → `window`, `#7c3aed`-style primaries → `button`/`button_text`, borders → `border`, secondary text → `muted_text`, status colours → `success_*` / `error_text` / `warning_text`. Every screen builds its `StyleSheet` inside `useMemo` keyed on `colors`, so switching themes retints the whole app without a restart. **All 19 screens and the shared `CollapsibleTray` are converted**; the audit across the entire mobile UI finds exactly two hardcoded colours, both deliberate and commented (the tray's black drop shadow and the camera preview's black surface). Alpha-suffixed borders (`#7c3aed55`-style) map onto solid tokens because the theme palette carries no alpha variants, and translucent `rgba()` camera overlays keep their alpha by design.

## Tier 2 — feature systems that need new UI

| # | Gap | What exists to build on | Effort |
| --- | --- | --- | --- |
| 5 | **Themes** (pick a theme; possibly custom themes) — **done** | Web has 27 builtin themes plus custom-theme storage and Theme Studio. The builtin catalogue lives in `packages/shared/src/themes/builtin-themes.ts` (web's module is a re-export shim), mobile resolves `config.theme_name` through a `MobileThemeProvider` that retints the navigation chrome live, a `ThemePickerScreen` (Home → Tools) previews each preset's colour strip, and **all 19 screens plus the shared `CollapsibleTray` are converted to `useTheme()`** — only two hardcoded colours remain in the whole UI, both intentional (the tray's black shadow and the camera preview's black surface, each commented). Custom-theme authoring stays web-only by design. | M–L |
| 6 | **Help Center + guided tours** — **done** | Web's guide/topic/tour data lived in `packages/web/src/lib/help.ts`; it now lives in `packages/shared/src/help.ts` (web's module is a re-export shim, so `HelpCenterPage`, `GuidedTourContext`, `ContextualHelpPanel` and the Settings help section were untouched). Mobile gained `src/lib/route-targets.ts` (the single web-route → destination table), `src/lib/help.ts` (category grouping, tour progress, step stepping), a themed `HelpCenterScreen` — progress card, shared starter guide, category-filtered topic library, and guided tours with a modal step-through runner that records completion in `HelpState.completed_tours` — plus a Home quick-link entry. The web-only refinement left: web's `GuidedTourOverlay` spotlights live DOM elements by CSS selector; React Native has no selectors, so mobile steps through the same itinerary in a modal instead of highlighting anchors in place. | M |
| 7 | **Info / legal pages** (About, License, Terms, Privacy, Security, Code of Conduct, Community) — **done** | Web's pages are `packages/web/src/components/info/*`; their content now lives in `packages/shared/src/info/`. License/Security/Code of Conduct are generated from the repository documents by `tools/generation/generate-shared-info-documents.mjs` (CI checks the generated file with `pnpm info:docs:check`), Terms is verbatim shared markdown, Privacy is a shared builder taking a `browser`/`desktop`/`mobile` scope, and the About/Community copy, info cards, cross-links, project URLs, and contact targets are shared data. Mobile gained a pure markdown reader (`src/lib/markdown.ts`, 16 tests), a themed `MarkdownDocument` renderer, `InfoDocumentScreen` (License, Terms, Privacy, Security, Code of Conduct), `AboutScreen` as the info hub, and `CommunityScreen`; every one of the seven browser routes now resolves in `route-targets.ts`, so the Help Center links that used to render inert now navigate. | M |

Tier 2 status: all three items are shipped end to end. **Item 5 (themes)**: shared catalogue, live chrome retint, picker, every screen themed. **Item 6 (Help Center)**: shared guide/topic/tour configuration, progress card, topic library, and walkable tours. **Item 7 (info / legal pages)**: shared legal documents with a generated-document drift gate, shared About/Community content, and seven mobile info screens fed by a pure markdown reader. Remaining parity work is Tier 3, which is gated on a written worldbuilding decision rather than on code.

## Tier 3 — requires a new data layer (product decision) — **decided**

**Decision: desktop-only ownership.** The written record the gate required now exists at [`WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md): the evidence behind it (26 world/timeline API methods, desktop SQLite persistence already at schema v2, ~131 KB of worldbuilding TSX, web product status `partial`), the options rejected and why, the revisit triggers, and the one-way read-only increment to take if mobile worldbuilding is ever reopened.

| # | Item | Status |
| --- | --- | --- |
| 8 | **Worlds, factions, locations, timelines, events** | **Out of scope for mobile** by decision — desktop-only. Mobile has no world route, no schema, and no UI, and no shared help/release-note data points at `/worlds`, so nothing on mobile promises the feature. The earlier framing here ("mobile would need an `expo-sqlite` schema") overstated the work: mobile already runs SQLite for drafts in `src/local/draft-store.ts`. The real cost was a second canonical canon store plus a forked 99.4 KB editor, which is exactly what the decision rejects. |

## Non-goals (deliberately not ported)

These are staged or explicitly "planned" on web, so they must not be built for parity:

- Event tracking (web `/events`: *"Event tracking is staged, not live."*)
- Batch scheduling and reusable batch presets (web `/batch`: *"Not live"*)
- Export preview and publishing flows (web: *"Planned Export Extras"*)
- World canon / worldbook / universe-notes / canon-lock modules
- Timeline event editing and the continuity assistant/checker
- Theme Studio and Tokenizer authoring surfaces (web-only by design)
- Usage Insights (`/insights`, shipped in the 4.1 web/desktop line): mobile records no usage and ships no Insights screen. The shared record contract in `packages/shared/src/usage/records.ts` is runtime-free, so a mobile store could adopt the same format later without forking it
- Multi-model comparison runs (`/compare`, shipped in the 4.2 web/desktop line): mobile ships no Compare screen. The shared comparison contract in `packages/shared/src/comparison.ts` is runtime-free, so a mobile surface can adopt it without forking
- Saved searches, bulk metadata editing, and the duplicate scan (shipped in the 4.3 web/desktop line): mobile keeps its simple inline filters. The shared filter contract in `packages/shared/src/draft-library.ts` is runtime-free, so the formats cannot fork

## Recommended sequence

1. **Tier 1 in order** (draft archiving ✅ → lorebook ✅ → PNG write ✅ → release notes ✅) — **complete**. Each item shipped with a mobile logic test and no new tab.
2. **Extract shared domain data** before Tier 2: move help/tour definitions out of `packages/web/src/lib/` into `packages/shared/` (release notes, builtin themes and help are now moved with Tier 1 item 4 / Tier 2 items 5–6). Otherwise Tier 2 duplicates them a third time (`local/api.ts` already mirrors web's draft/template domains).
3. **Tier 3 was a decision, and it is now made.** Every Tier 1 and Tier 2 item is shipped, and item 8 (worlds, factions, locations, timelines, events) is recorded as **desktop-only** in [`WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md). There is no remaining parity work; reopening worldbuilding requires one of that record's revisit triggers.
4. **Tier 3 only on an explicit decision** — satisfied by the record above, so Tier 3 stays closed unless a trigger fires.

## Risks and prerequisites

- **`packages/mobile/src/local/api.ts` already mirrors web's `api.ts` domains** (drafts, templates, blueprints). Adding more per-surface logic grows a third copy. The structural prerequisite for cheap parity is extracting the pure domain helpers (filters, response builders, readiness checks) into `packages/shared` and letting both surfaces consume them — the same move already made for the LLM layer. **Tier 1 paid part of this down**: the lorebook packet format, reference-suite compaction, synthesis prompt and feature-blueprint ranking now live in shared, so web's `lorebook-packets.ts`, `reference-context.ts` and `blueprints/featureSelection.ts` are thin shims rather than parallel implementations; release-note data likewise moved to `packages/shared/src/whats-new.ts`.
- **Mobile has only a small logic-test suite and no UI tests.** Web's api domains are pinned by 41 characterization tests; mobile now has 9 files / 114 tests (`theme.test.ts` covers theme resolution, `whats-new.test.ts` release notes, `help.test.ts` the Help Center logic, `route-targets.test.ts` web-route mapping plus a compile-time guard that every mapped destination is a real route and a check that every shared info page is reachable, `markdown.test.ts` the info-document reader, `lorebook.test.ts` lorebook generation, `draft-archive.test.ts` archiving, plus `compare-selection.test.ts` and `errors.test.ts`); shared grew to 14 files / 152 tests. Add logic tests per tier as it lands so parity work does not ship unverified.
- **Repository documents are generated into shared, and drift is a CI failure.** `LICENSE`, `SECURITY.md` and `CODE_OF_CONDUCT.md` are embedded into `packages/shared/src/generated/legal-documents.ts` by `tools/generation/generate-shared-info-documents.mjs` with line endings normalised to LF (git checks them out with the host's endings, so an unnormalised copy would fail the check on CI for no real reason). Edit the document, run `pnpm info:docs`, and commit both.
- **Mobile UI is verified by typecheck and lint only.** `test:mobile` runs in a node environment and covers pure logic; nothing renders the React Native screens, so keep screen files thin and push behaviour into `src/lib/*` where it can be pinned.
- **Theming conversion is complete.** Web themes are CSS custom properties; React Native needed a context + `StyleSheet` values. The theme layer exists (`src/theme/`), the builtin catalogue is shared, and all 19 screens plus the shared tray follow the active preset — switching a theme retints the entire app without a restart.
- **No native release CI.** Mobile builds stay outside the default CI path, so parity work is validated by the pipeline only through typecheck/lint/test.

## Acceptance criteria per tier

- **Tier 1**: each item has a passing logic test in `packages/mobile` and is reachable from the existing navigation without adding a new tab.
- **Tier 2**: shared owns the moved data, both surfaces import it, and `pnpm check:placeholders`, lint and typecheck stay green for both packages.
- **Tier 3**: satisfied — [`WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md) records desktop-only ownership, so mobile worldbuilding is out of scope rather than pending. Reopening it requires one of the documented revisit triggers.

## How to verify this analysis

- `packages/mobile/App.tsx` — the full navigator (5 tabs plus the Home and Drafts stacks)
- `packages/mobile/src/local/api.ts` — the mobile API surface
- `packages/web/src/App.tsx` — the 30 web routes
- `packages/web/src/lib/api.ts` — `DESKTOP_WORLDS_ONLY_MESSAGE` and the 26 desktop guards
- `packages/shared/src/lorebook-packets.ts`, `lorebook-prompt.ts`, `blueprint-features.ts` — the shared domain extracted by Tier 1 item 2
- `packages/shared/src/whats-new.ts` — the shared release-note data written by `tools/generation/generate-release-notes.mjs` (Tier 1 item 4)
- `packages/shared/src/themes/builtin-themes.ts` and `packages/mobile/src/theme/` — the shared builtin catalogue and the mobile theme layer (Tier 2 item 5)
- `packages/shared/src/help.ts` — the shared guide/topic/tour configuration, and `packages/mobile/src/lib/route-targets.ts` + `src/screens/HelpCenterScreen.tsx` — the mobile Help Center and the single web-route → destination table (Tier 2 item 6)
- `packages/shared/src/info/` and `tools/generation/generate-shared-info-documents.mjs` — the shared info/legal content, the generated repository documents, and the generator CI checks with `pnpm info:docs:check`; `packages/mobile/src/lib/markdown.ts` + `src/components/MarkdownDocument.tsx` — the mobile document reader (Tier 2 item 7)
- `packages/shared/src/info/download.ts` — the build/download facts behind `/download` on both surfaces (Tier 2 item 7 follow-up); `packages/web/src/components/info/DownloadPage.tsx` and `packages/mobile/src/screens/DownloadScreen.tsx` render them
- `docs/WORLDBUILDING_DECISION.md` — the written Tier 3 decision (desktop-only ownership) with its evidence, rejected options, and revisit triggers
