# Roadmap

This is the single source of truth for what is **not** finished. It exists because the app used to advertise unfinished areas as if they were shipped.

- `README.md` describes what the product does **today**.
- This file describes what it does **not** do yet.
- `TODO.md` tracks engineering debt and next steps.

If something is listed here, do not describe it anywhere else as shipped.

## Status legend

| Status    | Meaning                                                          |
| --------- | ---------------------------------------------------------------- |
| `shipped` | Live end to end in the web/desktop/mobile app                    |
| `partial` | Core of the area is live; the listed items are still outstanding |
| `planned` | Nothing in the area has shipped yet                              |

The same data drives the in-app **What's New → Upcoming Updates** panel (`packages/web/src/lib/roadmap.ts`).

## Staged in the product UI

These areas currently have visible UI that is explicitly labelled as staged rather than live:

| Surface                                                | Location                               | Note                                           |
| ------------------------------------------------------ | -------------------------------------- | ---------------------------------------------- |
| Events                                                 | `/events`                              | Page states event tracking is staged, not live |
| World canon / worldbook / universe notes / canon locks | `/worlds` "Planned modules"            | Listed as planned, not implemented             |
| Timeline event editing, continuity assistant/checker   | `/timelines` "Staged timeline modules" | Live chronology view stops at draft history    |
| Batch scheduling, reusable batch presets               | `/batch` "Staged modules"              | Marked "Not live"                              |
| Export preview, publishing                             | Export modal → "Planned Export Extras" | Marked "Planned"                               |

## The 5.0 theme — the workspace release

The next major is scoped as a UI overhaul with measurable bars, not feature accumulation (features remain 4.x minors). A 5.0 is cut only when every bar below is green. Tracked here so the claim stays honest while the work is in progress; the same bars drive the in-app Upcoming panel.

1. **Screen decomposition** — every screen over ~1,000 lines split into focused, individually testable sections. **DONE for every screen that was in scope:** `WorldDetailEditorPanel` 2,213 → 228 · `Drafts` 1,918 → 744 · `Review` 1,740 → 984 · `Themes`/`ThemeEditor` 1,489 + 1,451 → one shared manager + two thin wrappers (~1,400 lines of duplication removed) · `Settings` 1,444 → 639 · `DraftComparisonPanel` 1,430 → 948 · `AssetRegenerator` 1,210 → 995 · `DeviceLinkSettings` 1,078 → 813. Extracted sections carry characterization tests written first, and shared helpers now live in `@/lib` modules with their own unit tests (`format-timestamp`, `themes/theme-helpers`, `llm/providers`, `drafts/comparison-helpers`, `drafts/asset-regenerator-helpers`).
   - **Beyond the screen scope, staged for 5.1:** three large non-screen modules — `lib/storage/draft-db.ts` (2,156), `lib/storage/desktop-lore-db.ts` (1,609) and `lib/services/generation.ts` (1,130). The `Generation.tsx` screen the same sweep turned up (1,037) is now **987** via `@/lib/generation/generation-helpers` + 7 unit tests, so the screen bar is met. The modules are not screens and need a per-store/per-service seam, so they are scheduled for **5.1** rather than blocking 5.0.
2. **Information architecture over the 36 routes** — consolidation, a quick-actions palette, and workspace modes (solo drafting / review / bulk).
   - **Done: consolidation, the quick-actions palette, and workspace modes.** `@/lib/navigation/route-catalog` is the single source of truth for all 36 routes (path, label, heading, icon, group, keywords, `inNav`) with param-aware matching and a ranked search, validated against `App.tsx` by a drift-guard test — a new `<Route>` with no catalog entry fails `matches the router`. The sidebar, both collapsible submenus, the active-route rule and the app-frame heading all read it, replacing five inventories that could drift independently (only the help-coverage one was validated), and `Home`'s supporting-tools cards take their label and icon from it too. Four real defects fell out of the sweep: `/data` was reachable from no nav item and no Home tile, Home called `/similarity` "Compare" while `/compare` is the model-comparison screen (and wore the Offspring icon), `/themes` and `/tokenizer` shared one sidebar icon, and the palette would have offered `/blueprints/edit/*` — a wildcard path with no literal target — until the navigability filter learned to exclude it. The ⌘K / Ctrl-K palette resolves every route plus recent drafts, which is what makes the detail and tool screens with no sidebar slot — Batch, Validation, Similarity, Seed Generator, Data Manager — directly reachable. **Workspace modes** (solo drafting / review / bulk) are a lens, never a filter: a mode promotes its own screens in the sidebar and in the palette's default list, names itself in the app frame, and the frame's chip links to the mode's home. Each screen is owned by exactly one mode so "which mode am I in" is answerable rather than a guess — `validateRouteCatalog` enforces that ownership and that every mode path is a real literal route. The mode follows whichever screen you are on until you pick one, and the choice persists through the desktop-aware `eidolon.web.workspaceMode` key.
3. **Keyboard-first + focus/a11y audit** — every primary action reachable and visibly focused via keyboard.
   - **Audited mechanically, and the shell + dialog contracts are fixed.** The measurement that mattered: of **13 modal overlays, only 1 handled Escape and only 2 touched focus**, so a keyboard user could open a dialog and then Tab straight into the page behind it. Every overlay (14 now, including the palette) goes through one `ModalOverlay` shell that owns Escape, focus-moves-in on open, Tab/Shift-Tab wrap, focus-return to the trigger, the ref-counted `modal-open` body lock (nesting is real — Asset Designer opens the blueprint browser), and a `trapFocus` opt-out the guided tour sets, because a coach mark whose trap prevented Tab-ing to the highlighted control would defeat its own purpose. A skip link reaches `#main-content`, and the mobile drawer takes focus on open and closes on Escape. Mouse-only clickable elements went **17 → 4**, and all four that remain are correct: the shared `aria-hidden` backdrop, a dropdown click-away catcher, an upload drop zone that already has its own button, and the drawer's backdrop.
   - **Focus visibility was already met, via three patterns rather than one:** `focus-visible:ring-*` (129 uses), `focus:ring-*`, and the compact-input `focus:border-primary`. Only two elements suppress their outline with nothing in its place, both deliberately chrome (the dialog container, which Radix also leaves bare, and the palette's auto-focused input, where the open dialog is the focus indicator). Worth noting for whoever finishes the bar: `index.css` still defines **no** `:focus-visible` baseline at all, so a global rule would make the guarantee structural instead of per-component.
   - **Focus visibility is enforced, not just observed.** Because the codebase satisfies it three different ways, the risk was a fourth pattern arriving unnoticed — and a rendered test cannot see a rule nobody has written yet. `src/test/a11y-guards.test.ts` reads every component source via `import.meta.glob(..., '?raw')` and fails on a form control that removes its outline with no visible replacement, and on any positive `tabIndex`; it carries self-checks that feed it synthetic violations so the guard is proven to bite. It parses per opening tag (a line-based rule missed the palette's own input, whose `className` Prettier puts on its own line) and blanks comments first (a JSDoc comment that _mentions_ `<select>` was read as markup). That one genuine violation — the palette input — now carries a focus ring. I deliberately did **not** add a blanket `:focus-visible` outline to `index.css`: ring is a box-shadow, so both indicators would render on the 129 usages, which is exactly the visual regression an audit should avoid causing. The guard gives the same protection with none of the risk.
   - **All ~101 form controls now have an accessible name.** The audit measured 32 with no label at all and 69 placeholder-only; the 40 with no name are fixed, and the placeholder-only set is finished too. They split cleanly once read: where a **visible** `<label>` already sat above the field (the template wizard, asset designer, blueprint dialog, generation seed, lorebook focus), the fix was an `id`/`htmlFor` pair so the label became programmatically associated — it had been labelled on screen and unlabelled to assistive tech; where there was no visible label at all (the worlds inline-edit forms, the theme metadata forms, the settings key fields), the fix was a hand-written `aria-label`. They could not be done mechanically: the placeholders mix field names with hints, and the same dump holds `"display name"` beside `"e.g., a lonely space pirate searching for redemption"`, so `aria-label={placeholder}` would have invented names worse than the browser's own fallback.
   - **Global shortcuts beyond ⌘K are in, as tested predicates.** `?` opens help for the current page and `@/lib/shortcuts` owns the decisions — `isPaletteShortcut`, `isHelpShortcut`, and `isTypingTarget` in `@/lib/focus` — so the rule that matters most is pinned by unit tests rather than buried in a listener: **`?` is ignored while the user is typing**, because "why?" in a seed has to stay "why?". Both bindings are advertised with `aria-keyshortcuts` on the buttons that carry them.
   - **The sweep's mechanical proxies are all enforced by source guards** in `src/test/a11y-guards.test.ts`: no form control removes its outline without a visible replacement, no positive `tabIndex`, no dialog backdrop outside `ModalOverlay`, and no icon-only button without a name. Each guard has self-checks that feed it synthetic violations, so they are proven to bite rather than merely observed to pass. That last rule is deliberately narrow — only a button body with no text _and_ no JSX expression is certainly nameless, because the audit's own first pass reported 17 icon-only buttons of which 16 were false positives from `{isSaving ? 'Saving…' : 'Save'}`-style bodies.
   - **The six primary screens now have a tab-order test, and it found four real defects.** `src/test/tab-order.ts` renders a screen and reads the focusable elements in DOM order — the only way to catch this class, since the bug is _manufactured_ by CSS or conditional rendering and is invisible in source. Its describer resolves wrapping labels and `htmlFor` pairs (without that step, correctly-labelled fields read as placeholder-only and every assertion would look wrong). Applied to Generate, Library, Review, Compare, Batch and Settings: all six tab in visual order — form fields before the button that submits them, each row's controls before the bulk action that acts on all rows — and **four unnamed tab stops turned up**, all the same shape: a button whose entire body is a conditional icon (`{shown ? <EyeOff /> : <Eye />}`), which announces as nothing and sits exactly where a keyboard user lands. Three were the settings API-key visibility toggles (now "Show/Hide API key" and "Show/Hide proxy API key") and the fourth the chat send button ("Send message" / "Refine asset with this message").
   - **Two test-environment artefacts are documented in the helper rather than "fixed"**, because acting on either would have produced wrong code: the collector cannot evaluate visibility, and **responsive duplicates appear once per variant** — Settings renders its section nav twice so exactly one is visible at any viewport, making the repeated block in that sequence a curiosity rather than a defect. Two further findings were _correct behaviour_: Generate's primary button and Batch's run button are absent from the tab order because they are disabled until their forms are valid, and a disabled button is not focusable.
   - The icon-only _source_ guard deliberately keeps its narrow rule and states its blind spot: a conditional icon is nameless, but telling it apart from a conditional fragment of text (`{copied ? <>Copied</> : <>Copy</>}`) needs a JSX parser, and every regex-only attempt produced more false positives than hits (one version flagged 5 sites and 4 rendered text). The runtime sweep owns that shape instead — which is exactly how these four were caught.
   - Remaining for this bar: the same sweep on the other ~30 screens, which is the same pattern applied per screen.
4. **Mobile-first review/approval** — closing the largest cross-surface gap, riding the approvals and checkpoint foundations.
5. **Visible visual refresh riding the existing theme-token system** (web components are already ~tokenized).
6. **Breaking-change budget spent deliberately** — retire the legacy `bpui.*` storage keys with a final migration, decide each of the five staged UI surfaces (ship or remove), apply any export/format changes.

### Staged for 5.1

- **Storage and service layer decomposition** — `lib/storage/draft-db.ts`, `lib/storage/desktop-lore-db.ts` and `lib/services/generation.ts` are the three remaining files over the ~1,000-line bar. They are storage/service layers rather than screens, so the seam is per-store/per-service modules (splitting `draft-db` by table, for example). Scheduled to ship with or before 5.1; explicitly not a 5.0 bar.

## Outstanding work by area

### Generation Workflow — `partial`

Shipped: seed → dependency-ordered draft generation, content modes, streaming progress, resume, per-asset regeneration, chat refinement, live batch queue, multi-model comparison runs (`/compare` sends one seed and template through 2–4 candidate models with per-candidate provider detection, saves each result as a normal draft linked by a comparison group, and lines candidates up with their token, duration, and outcome from the usage records), scenario presets (named bundles of template, mode, and instruction lines that apply in one click), a constraint builder (a data-driven catalog of tone, pacing, style, content-handling, and framing options that compose into deterministic additional-instruction lines riding the existing instructions path), seed remix (deterministic 2–4 seed folding into one premise line), a seed idea board (tagged inspiration fragments that flow into generation), and asset-by-asset approval workflow on the draft review screen — approve / request changes / undo per asset, decisions fingerprinted to the approved content so later edits mark them stale, an approval progress chip beside export readiness, and changes-requested assets joining low scores as export blockers (`shared/src/draft-approvals.ts`, `api.setAssetApproval`) — and checkpointed generation sessions: Pause mid-run aborts the current asset's stream while keeping the persisted checkpoint (Cancel remains the explicit discard), Resume session continues from the paused asset with the approved prefix as prior context, a paused session restores after reload without auto-resuming (so a reload never restarts token spend on its own), and during review or pause any approved asset chip becomes a restart-from-here action that discards it and everything downstream and regenerates from the approved prefix. The single-shot orchestrator path (batch, comparison, direct API runs) checkpoints by salvage — a run that dies mid-stream saves its closed asset blocks as a marked partial draft, and batch errors name the salvaged draft — and mobile persists a per-asset checkpoint during generation with a Resume generation card for interrupted runs that restores captured imported sources and can trim the checkpoint to restart from any completed asset.

Outstanding: batch comparison across multiple seeds; batch run history with priorities/retry; assistant seed suggestions; offline/local-model presets.

### Review and Editing — `partial`

Shipped: comparison with staged merge branches, review checklist with scoring, export gating, inline notes, revision snapshots and diffs, and asset-by-asset approval decisions — approve / request changes / undo per asset, fingerprinted to the approved content so later edits mark the decision stale, with fresh changes-requested assets joining low scores as export-readiness blockers (4.7.0).

Outstanding: provenance view; asset health scoring; draft branching; focus mode; assistant single-asset rewrite; read-only review links.

### Templates and Blueprints — `partial`

Shipped: template CRUD/validate/import/export, guided wizard, comparison, blueprint editor, linting, sandbox.

Outstanding: template migration assistant; visual dependency graph; marketplace/bundle sharing; starter kits; expanded sandbox with reusable test cases; prompt experimentation lab; shared snippet library.

### Draft Library and Organization — `partial`

Shipped: search/sort/filter library, import/export, manual creation, archive/restore, revision history, draft favourites (filter on web, toggle on mobile), named saved searches persisting the full filter set, multi-select bulk editing (favourite, archive/restore, genre, tags) in one batched write, and a duplicate scan that pre-filters by seed or character name and scores each pair with the similarity engine.

Outstanding: semantic search; auto-tagging; custom foldering beyond saved searches; recently viewed; pinning templates and presets; custom metadata fields; library summary dashboard.

### Canon, Worldbuilding, and Relationships — `partial`

Shipped (desktop-persisted): worlds CRUD, world detail editor (characters, relationships, timelines, factions, locations), canon link audit, lorebook generation, lineage, similarity, offspring.

Outstanding: canon library; worldbook; universe notes; canon locks; relationship map visualization; family tree/affiliation visualizations; cross-draft continuity assistant; event calendar; world event storage; canon conflict checking.

Ownership note: this area is **desktop-only** and mobile parity is closed against it. See [`WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md) for the decision record and its revisit triggers.

### Export and Publishing — `partial`

Shipped: `json` / `text` / `combined` / `pdf` exports, PNG character-card embedding, TOML preset definitions as reference assets. The PDF preset is generated by a dependency-free writer (`shared/src/export/pdf.ts`).

Outstanding: preset preview; platform capability matrix; publishing flow; export profiles; one-click bundles; shareable web preview; metadata manifest; export dry-run.

### Analysis and Evaluation — `partial`

Shipped: validation by path and by draft, token optimization, pairwise similarity with optional LLM read. Every provider engine normalises per-call token usage — streaming responses included — and every LLM call the web and desktop apps make (orchestrator runs, per-asset regeneration, batch, seeds, offspring seeds, lorebook packets, chat/refine, similarity reads) now writes a durable local usage record (provider, model, tokens, duration, outcome, asset/template/draft attribution) to IndexedDB in the browser or SQLite on desktop, capped at the newest 5,000 calls. The `/insights` page rolls those records up by provider, model, call type, asset, template, draft, and day with failure rates and durations, ranks models in a provider scorecard, estimates cost in the user's currency from user-entered per-model per-1M-token pricing (no bundled price tables), and exports the raw records as CSV or JSON.

Outstanding: golden sample packs; quality trend tracking across model changes and template revisions; regression benchmarks; review analytics; library-wide similarity clustering.

### Collaboration and Sharing — `planned`

Nothing shipped. Outstanding: collaborative review notes; shared workspaces; commentable template reviews; package format with history; team preset libraries; featured/starter templates; community discovery; visibility controls; approval workflow; activity feed.

### UX and Platform Surfaces — `partial`

Shipped: responsive web layout, native mobile navigation, desktop shell, help center, guided tours.

Outstanding: mobile-first review/approval; desktop drag-and-drop import/export; responsive split-pane editor; keyboard-first workflows; quick actions palette; pinned dashboard widgets; customizable home screen; workspace modes.

### Assistant and Automation — `partial`

Shipped: per-screen assistant context, in-review chat assistant.

Outstanding: tone/style alternates; metadata suggestions; auto summaries; conversational template helper; next-action recommendations; workflow automations; scheduled runs; revision handoff notes; safety profiles; assistant-backed onboarding.

## Known engineering gaps

Tracked in [`TODO.md`](../TODO.md). None open: the browser API facade split completed in 4.7.0 — every domain (config/models, themes, templates, drafts, export, generation/usage, blueprints, worlds/timelines) lives in its own `lib/` module behind one-line delegations, `packages/web/src/lib/api.ts` dropped from 2,727 to 589 lines, and `src/lib/api.surface.ts` still locks the 100 public methods.

Mobile parity against the web app is scoped separately in [`MOBILE_PARITY.md`](MOBILE_PARITY.md).

Resolved: the forked web LLM layer was collapsed onto `@char-gen/shared` (web keeps thin re-export shims; `proxyKey` and the corrupted-key guard were ported into the shared engine, with characterization tests in `shared/src/llm/`). The supposed duplicate generation service in `packages/shared` turned out to be dead code and was deleted. `packages/server` was deleted outright along with its Docker/Caddy deployment artifacts — it was built, linted and tested, but no client ever called it, so the product is now backend-free and local-first everywhere.

## Keeping this accurate

- When an area ships, move it into `README.md` and remove it from here.
- Never add a new `*Placeholder` component: `pnpm check:placeholders` fails CI unless it is imported or explicitly allowlisted.
- Keep `packages/web/src/lib/roadmap.ts` and this file in sync — they are the same claim in two formats.
