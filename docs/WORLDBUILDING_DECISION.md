# Worldbuilding ownership — decision record

**Status:** decided.
**Answers:** [`docs/MOBILE_PARITY.md`](MOBILE_PARITY.md) Tier 3, item 8 — "Decide whether mobile should own worldbuilding at all before spending anything here."

## Decision

**Worldbuilding stays desktop-only. Mobile does not implement worlds, factions, locations, timelines, or events, and no mobile parity work is planned against them.**

The parity doc's Tier 3 gate — *"not started until a written decision records who owns worldbuilding (desktop only, mobile too, or neither)"* — is satisfied by this record. Ownership is **desktop-only**; the feature is not "mobile later, unscheduled", it is **out of scope for mobile** until one of the revisit triggers below fires.

## Evidence: what exists today

### Web / desktop (the current owner)

| Fact | Value | Where |
| --- | --- | --- |
| Public API methods for worldbuilding | 26 | `packages/web/src/lib/api.surface.ts` |
| Desktop-guard message uses | 24 (`APIError(501, DESKTOP_WORLDS_ONLY_MESSAGE)` — writes and single-record reads; the three list/audit reads return empty instead) | `packages/web/src/lib/api.ts` (1,834 lines) |
| Guarded message | *"Persisted worlds, factions, locations, and timelines are currently only available in the desktop app."* | `api.ts:198`, surfaced as `APIError(501, …)` |
| Non-desktop behaviour (writes and single-record reads) | throw `APIError(501, …)` — verified in `getWorld`, `getTimeline`, `createWorld`, `createTimeline` | `api.ts` |
| Non-desktop behaviour (list/audit reads) | degrade to empty collections instead of erroring — verified: `{ worlds: [] }`, `{ links: [] }`, `{ issues: [] }` | `getWorlds`, `getWorldCharacterDraftLinks`, `getWorldRelationshipAuditIssues` |
| Persistence | SQLite in the Rust/Tauri shell, with indexes and a **v2 schema migration** (`worlds_v2`, `world_factions_v2`, `world_locations_v2`, `timelines_v2`, `timeline_events_v2`) | `packages/web/src-tauri/src/main.rs` (26.4 KB) |
| Tables | `worlds`, `world_characters`, `world_factions`, `world_locations`, `world_relationships`, `timelines`, `timeline_events`, plus tag tables and `world_faction_draft_links` / `world_location_draft_links` | same |
| Web UI | `Worlds.tsx` 23.7 KB, `WorldDetailEditorPanel.tsx` **99.4 KB**, `Timelines.tsx` 4.8 KB, `Events.tsx` 3.4 KB (~131 KB TSX) | `packages/web/src/components/worlds/`, `.../timelines/` |
| Shared type layer | **Already shared**: `WorldRecord`, `WorldFactionRecord`, `WorldLocationRecord`, `WorldRelationshipRecord`, `WorldCharacterRecord`, `WorldCharacterDraftLinkRecord`, `TimelineRecord`, `TimelineEventRecord`, `WorldCounts` | `packages/shared/src/types/index.ts` |
| Product status | `partial` — "Shipped (desktop-persisted): worlds CRUD, world detail editor … **Outstanding**: canon library; worldbook; universe notes; canon locks; relationship map visualization; family tree/affiliation visualizations; cross-draft continuity assistant; event calendar; world event storage; canon conflict checking" | `docs/ROADMAP.md` |

### Mobile (the candidate)

| Fact | Value | Where |
| --- | --- | --- |
| World storage, schema, or routes | none | — |
| SQLite precedent | **already present**: `expo-sqlite` with WAL, `CREATE TABLE IF NOT EXISTS`, and additive column migrations | `packages/mobile/src/local/draft-store.ts` (32.1 KB) |
| Mobile API surface | 56.6 KB, with no world domain | `packages/mobile/src/local/api.ts` |
| Shared data that links to `/worlds` | none — help topics, the starter guide, and release-note links do not reference it | `packages/shared/src/help.ts`, `whats-new.ts` |
| Behaviour if a link ever targets `/worlds` | `mapWebRouteToMobileDestination('/worlds')` returns `null`, so the screen renders inert text showing the route rather than a dead button | `packages/mobile/src/lib/route-targets.ts` |
| Parity position | Tiers 1 and 2 complete (release notes, Help Center, themes, info/legal) | `docs/MOBILE_PARITY.md` |


## Options considered

### 1. Desktop-only ownership — **chosen**

Mobile ships no worldbuilding surface. The only artefact is this record plus the honest-failure behaviour that already exists (unmapped routes render as inert text).

### 2. Mobile read-only mirror — **deferred, and the recommended first increment if we ever revisit**

Mobile views worlds and timelines transferred from desktop and never writes. Reuses the existing workspace-bundle / device-link transfer path, so canon keeps exactly one writer.

### 3. Full mobile parity (build world CRUD on mobile) — **rejected**

Rejected because the cost is not the UI, it is the second canonical store:

- Mobile would have to mirror the desktop schema **and its migration history** (`*_v2` tables already exist), then keep both in step forever. Every future desktop schema change becomes a two-surface migration project.
- Canon data with two writers has two truths. For a feature whose entire purpose is consistency, that is the worst available outcome — and `getWorldRelationshipAuditIssues` exists precisely to catch consistency problems.
- The desktop surface is still `partial`: the relationship map, family tree, event calendar, canon library, worldbook, canon locks, and conflict checking are all outstanding. Porting now would freeze an **unfinished design** into a second codebase, so every later desktop design change would need a matching mobile change.
- Cost asymmetry is large: ~131 KB of TSX (one panel alone is 99.4 KB), 26 API methods, and a Rust SQLite layer to reimplement, versus no user-visible benefit on the mobile loop that the parity work was built to serve.

### 4. Mobile-native worldbuilding (a mobile-shaped feature, not a port) — **rejected for now**

A simplified "capture lore notes against a draft" flow could be genuinely useful on a phone. But it is a *new product feature with no browser counterpart*, not parity, so it needs its own product decision rather than riding in on a parity tier. Rejecting it here is not a statement that it is worthless — it is a statement that it does not belong in this doc's scope.

## Why desktop-only is the right call now

1. **Mobile's parity goal is the capture → generate → review → export loop.** Every Tier 1 and Tier 2 item served that loop. Worldbuilding does not: it is authoring reference material, which is a desk task.
2. **One writer is the correct property for canon.** The desktop app is where canon is authored and persisted; mobile's job is to produce drafts against it.
3. **Nothing on mobile claims the feature.** No route, no help topic, no release note, no starter-guide step points at `/worlds`, so users are not shown a broken promise. The web message above is the only place the limitation is described, and it is accurate.
4. **The feature is still moving.** Committing a mobile fork to a `partial` design is the expensive kind of premature.

## What mobile does instead (and why it is not a gap in behaviour)

- No world routes exist in `packages/mobile/src/types/navigation.ts`, and none are added by this decision.
- If shared data ever gains a `/worlds` link, `route-targets.ts` returns `null` for it and the receiving screen renders the target as inert text with the route shown — the same honest pattern used for `/data` (the browser Data Manager) today. A user clicking will never be told something happened when nothing did.


## Revisit triggers

Reopen this decision if **any** of the following becomes true:

1. **Users ask for worldbuilding on mobile with a concrete workflow** (not "feature parity" as an abstraction) — bring evidence, not a wish.
2. **Desktop worldbuilding reaches `complete` in `docs/ROADMAP.md`** — canon library, worldbook, universe notes, canon locks, event calendar, and conflict checking shipped — so there is a stable design worth mirroring instead of a moving one.
3. **A shared storage layer lands** (for example a schema owned by `packages/shared` plus device-link sync), which would turn option 2 from "write a store" into "render what arrived".

## If we revisit: the first increment, defined

Take **option 2 (read-only mirror)** only, and keep it explicitly one-way:

- Reuse the existing workspace-bundle / device-link transfer path rather than inventing a new sync mechanism.
- Add read-only list and detail screens for worlds and timelines; **no editing UI at all**.
- Keep desktop as the only writer, and have the mobile screens say that editing happens on desktop.
- Do not mirror `WorldDetailEditorPanel` — that 99.4 KB editor is the part that must not be forked.

## How to re-verify the facts in this record

```powershell
# API surface and guard behaviour
(Select-String -Path packages/web/src/lib/api.surface.ts -Pattern "\| '\w*(World|Timeline)\w*'").Count   # 26
(Select-String -Path packages/web/src/lib/api.ts -Pattern 'DESKTOP_WORLDS_ONLY_MESSAGE').Count           # 24

# Desktop persistence and its schema versions
Select-String -Path packages/web/src-tauri/src/main.rs -Pattern 'CREATE TABLE IF NOT EXISTS'

# Mobile already has SQLite, but no world domain
Select-String -Path packages/mobile/src/local/draft-store.ts -Pattern 'expo-sqlite|CREATE TABLE'

# Nothing on mobile claims the feature
Select-String -Path packages/shared/src/help.ts,packages/shared/src/whats-new.ts -Pattern '/worlds'
```

`pnpm test:mobile` also pins the fallback behaviour: `route-targets.test.ts` asserts that routes with no mobile destination (including anything world-related) resolve to `null`, and that every destination which *does* resolve is a real route.
