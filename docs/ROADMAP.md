# Roadmap

This is the single source of truth for what is **not** finished. It exists because the app used to advertise unfinished areas as if they were shipped.

- `README.md` describes what the product does **today**.
- This file describes what it does **not** do yet.
- `TODO.md` tracks engineering debt and next steps.

If something is listed here, do not describe it anywhere else as shipped.

## Status legend

| Status | Meaning |
| --- | --- |
| `shipped` | Live end to end in the web/desktop/mobile app |
| `partial` | Core of the area is live; the listed items are still outstanding |
| `planned` | Nothing in the area has shipped yet |

The same data drives the in-app **What's New → Upcoming Updates** panel (`packages/web/src/lib/roadmap.ts`).

## Staged in the product UI

These areas currently have visible UI that is explicitly labelled as staged rather than live:

| Surface | Location | Note |
| --- | --- | --- |
| Events | `/events` | Page states event tracking is staged, not live |
| World canon / worldbook / universe notes / canon locks | `/worlds` "Planned modules" | Listed as planned, not implemented |
| Timeline event editing, continuity assistant/checker | `/timelines` "Staged timeline modules" | Live chronology view stops at draft history |
| Batch scheduling, reusable batch presets | `/batch` "Staged modules" | Marked "Not live" |
| Export preview, publishing | Export modal → "Planned Export Extras" | Marked "Planned" |

## Outstanding work by area

### Generation Workflow — `partial`

Shipped: seed → dependency-ordered draft generation, content modes, streaming progress, resume, per-asset regeneration, chat refinement, live batch queue.

Outstanding: asset-by-asset approval workflow; checkpointed sessions; multi-model comparison runs; batch run history with priorities/retry; scenario presets; constraint builder; seed remix; seed idea board; assistant seed suggestions; offline/local-model presets.

### Review and Editing — `partial`

Shipped: comparison with staged merge branches, review checklist with scoring, export gating, inline notes, revision snapshots and diffs.

Outstanding: provenance view; asset health scoring; draft branching; focus mode; assistant single-asset rewrite; read-only review links.

### Templates and Blueprints — `partial`

Shipped: template CRUD/validate/import/export, guided wizard, comparison, blueprint editor, linting, sandbox.

Outstanding: template migration assistant; visual dependency graph; marketplace/bundle sharing; starter kits; expanded sandbox with reusable test cases; prompt experimentation lab; shared snippet library.

### Draft Library and Organization — `partial`

Shipped: search/sort/filter library, import/export, manual creation, archive/restore, revision history.

Outstanding: saved searches and smart collections; bulk metadata editing; favourites/pins; semantic search; auto-tagging; custom foldering; recently viewed; duplicate detection; custom metadata fields; library summary dashboard.

### Canon, Worldbuilding, and Relationships — `partial`

Shipped (desktop-persisted): worlds CRUD, world detail editor (characters, relationships, timelines, factions, locations), canon link audit, lorebook generation, lineage, similarity, offspring.

Outstanding: canon library; worldbook; universe notes; canon locks; relationship map visualization; family tree/affiliation visualizations; cross-draft continuity assistant; event calendar; world event storage; canon conflict checking.

### Export and Publishing — `partial`

Shipped: `json` / `text` / `combined` exports, PNG character-card embedding, TOML preset definitions as reference assets.

Outstanding: preset preview; platform capability matrix; publishing flow; export profiles; one-click bundles; shareable web preview; metadata manifest; export dry-run; PDF/print export.

### Analysis and Evaluation — `partial`

Shipped: validation by path and by draft, token optimization, pairwise similarity with optional LLM read.

Outstanding: golden sample packs; evaluation dashboard; token/cost analytics; usage history; quality trend tracking; provider scorecards; regression benchmarks; review analytics; generation time breakdown; library-wide similarity clustering.

### Collaboration and Sharing — `planned`

Nothing shipped. Outstanding: collaborative review notes; shared workspaces; commentable template reviews; package format with history; team preset libraries; featured/starter templates; community discovery; visibility controls; approval workflow; activity feed.

### UX and Platform Surfaces — `partial`

Shipped: responsive web layout, native mobile navigation, desktop shell, help center, guided tours.

Outstanding: mobile-first review/approval; desktop drag-and-drop import/export; responsive split-pane editor; keyboard-first workflows; quick actions palette; pinned dashboard widgets; customizable home screen; workspace modes.

### Assistant and Automation — `partial`

Shipped: per-screen assistant context, in-review chat assistant.

Outstanding: tone/style alternates; metadata suggestions; auto summaries; conversational template helper; next-action recommendations; workflow automations; scheduled runs; revision handoff notes; safety profiles; assistant-backed onboarding.

## Known engineering gaps

Tracked in [`TODO.md`](../TODO.md). Currently open:

- Reconcile the web/shared LLM fork. The two layers have diverged behaviorally (web adds `proxyKey` auth; shared adds provider-endpoint mapping, null-safety, conditional `top_p`, `tool_calls`), so this needs a canonical-behavior decision plus provider characterization tests rather than a mechanical merge.
- Reconcile the generation services (`web/lib/services/generation.ts` orchestrator vs `shared/services/generation.ts` direct generator).
- Split `packages/web/src/lib/api.ts` (~2.4k lines) along draft/template/config/theme/export/world seams, after expanding characterization tests.
- Decide the fate of `packages/server` (linted, typechecked and tested in CI, but no client calls it).
- Publish or drop `docs/index.html`.

## Keeping this accurate

- When an area ships, move it into `README.md` and remove it from here.
- Never add a new `*Placeholder` component: `pnpm check:placeholders` fails CI unless it is imported or explicitly allowlisted.
- Keep `packages/web/src/lib/roadmap.ts` and this file in sync — they are the same claim in two formats.
