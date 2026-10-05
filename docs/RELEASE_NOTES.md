# 5.0.0 — the workspace release

**Released 2026-10-04** · In the app: [`/whats-new`](/whats-new) · History: [`CHANGELOG.md`](../CHANGELOG.md)

5.0 was scoped as a UI overhaul with measurable bars rather than a feature drop, so most of
what follows is about getting to the thing you wanted and not needing a mouse to do it — plus the
one feature that finally crossed the halfway line, approvals on mobile. It is the release the
roadmap cut when every bar went green; the bar-by-bar record is in [`TODO.md`](../TODO.md).
Feature work resumes in 5.1.

Draft for the `v5.0.0` release body: everything from "Reach anything from the keyboard" down to
"Where to look". The generated entry in `CHANGELOG.md` and `packages/shared/src/whats-new.ts` —
what the app's What's New page and the mobile app render — is the short form of the same claims.

## Reach anything from the keyboard

- **⌘K (Ctrl-K) opens a command palette** over all 36 routes plus your recent drafts, with a
  ranked search. The screens that never had a sidebar slot — Batch, Validation, Similarity,
  Seed Generator, Data Manager — are one keystroke away.
- **`?` opens help for the page you are on.** Neither `?` nor ⌘K fires while you are typing, so
  "why?" in a seed stays "why?".
- **Workspace modes** — solo drafting, review, and bulk — promote the screens that mode owns,
  name themselves in the app frame, and remember your choice. A mode is a lens, never a filter:
  nothing is hidden, the things you are working on come first.

Four real navigation defects fell out of that pass: one screen was reachable from no nav item
and no home tile, the home screen called one route by another route's name (and wore its icon),
two routes shared a sidebar icon, and the palette would have offered a wildcard path with no
literal target until the navigability filter learned to skip it.

## Dialogs and forms behave the same everywhere

Of 13 modal overlays, exactly one handled Escape and only two touched focus — you could open
Export and then Tab straight into the page behind it. All 14 overlays, the palette included, now
go through one shell that owns Escape, moves focus in on open, wraps Tab and Shift-Tab, returns
focus to the control you came from, and locks background scrolling robustly enough that nested
dialogs (the asset designer opening the blueprint browser) do not unlock it early.

Around 101 form controls gained accessible names — 32 had none at all and 69 were
placeholder-only — and mouse-only clickable elements went from 17 to 4, all four of them
correct (two backdrops, a click-away catcher, and a drop zone that already has its own button).
A skip link reaches the main content, the mobile drawer takes focus on open and closes on
Escape, and a tab-order test now runs on every route. That test found four buttons that
announced as nothing: three API-key visibility toggles and the chat send button.

## Review and approval, including on your phone

Approvals arrived on the web review screen in 4.7. 5.0 brings the same decisions to mobile by
calling the same shared engine instead of growing a second implementation — mobile had review
notes and per-asset scores, but not one reference to an approval.

On a phone the ordering is decision-first — changes requested, then stale, then unreviewed, then
approved — so what needs work is at the top, there is a progress line and a next asset to open
for a one-handed pass, and the single note field per asset *is* the decision note rather than
asking you to write it twice. A decision carries a fingerprint of the asset's content, so it
goes stale on its own the moment the asset is regenerated or edited. Every decision is recorded
as a safeguard snapshot first, so it is undoable. The draft lists on both surfaces now lead with
`N changes requested` instead of looking identical to a finished draft.

## A refresh you can retheme

State colours — success, warning, info, destructive — are theme tokens that carry their own dark
values, in both built-in themes. 381 hand-written utilities and their 88 `dark:` overrides were
retired, because the token already knows about both modes, and pills and callouts ride them.

The guard that checks contrast found three real defects, all pre-existing and all token-level:
muted secondary text at **4.40:1** on its background (most secondary text in the product), the
light destructive colour at **3.61:1** against its own white foreground (every destructive
button), and dark-mode destructive text at **2.08:1** — 92 `text-destructive` sites failing AA
in dark mode, which only becomes visible once the same token has to work as text and as a fill.
One edit each fixed every call site.

## Under the hood

- **No source file over ~1,000 lines** in the web, mobile, or shared packages. The largest
  screens — the drafts review screen, settings, the themes manager, the comparison panel, the
  asset regenerator, and mobile's generation, drafts, and draft-detail screens — are now
  focused modules with their own tests, and the storage and API layers are barrels over modules
  whose export surface is pinned by tests. It is why 5.0 can change this much shell and still
  behave like itself.
- **The legacy `bpui.*` storage keys are retired.** Eight keys across six modules lived behind
  hand-passed fallback lists, which only migrate when the screen that reads them is opened. One
  eager migration runs at startup instead, so your themes, keys, and settings move on first
  launch whichever screens you visit.

## Upgrading

Nothing to do. Your stored data migrates once at first launch and nothing is deleted. The
version is 5.0.0 across the web app, the desktop build, and the mobile app; the browser
workspace shows its version on the What's New page, and the download page carries the same
build facts the mobile app renders.

The staged surfaces are still staged, and still labelled that way in the app: Events (tracking
is not live), the world canon / worldbook / universe-notes / canon-lock modules, timeline event
editing and the continuity assistant, batch scheduling and reusable batch presets, and export
preview / publishing. Worlds and timelines remain desktop-only — a recorded product decision,
not an omission, with the reasoning and the revisit triggers in
[`WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md).

## Where to look

- Start here: the [Help Center](/help) still opens with the getting started guide, and `?` now
  takes you straight to the page you are on.
- Roadmap and what is *not* shipped: [`docs/ROADMAP.md`](ROADMAP.md) — the same claims the
  app's **What's New → Upcoming Updates** panel shows.
- Mobile parity against the web app: [`docs/MOBILE_PARITY.md`](MOBILE_PARITY.md).
- Download and install: [`/download`](/download) and [`docs/DOWNLOADS.md`](DOWNLOADS.md).
