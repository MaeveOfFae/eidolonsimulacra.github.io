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

## Outstanding work by area

### Generation Workflow — `partial`

Shipped: seed → dependency-ordered draft generation, content modes, streaming progress, resume, per-asset regeneration, chat refinement, live batch queue, multi-model comparison runs (`/compare` sends one seed and template through 2–4 candidate models with per-candidate provider detection, saves each result as a normal draft linked by a comparison group, and lines candidates up with their token, duration, and outcome from the usage records), scenario presets (named bundles of template, mode, and instruction lines that apply in one click), a constraint builder (a data-driven catalog of tone, pacing, style, content-handling, and framing options that compose into deterministic additional-instruction lines riding the existing instructions path), seed remix (deterministic 2–4 seed folding into one premise line), a seed idea board (tagged inspiration fragments that flow into generation), and asset-by-asset approval workflow on the draft review screen — approve / request changes / undo per asset, decisions fingerprinted to the approved content so later edits mark them stale, an approval progress chip beside export readiness, and changes-requested assets joining low scores as export blockers (`shared/src/draft-approvals.ts`, `api.setAssetApproval`).

Outstanding: checkpointed sessions; batch comparison across multiple seeds; batch run history with priorities/retry; assistant seed suggestions; offline/local-model presets.

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
