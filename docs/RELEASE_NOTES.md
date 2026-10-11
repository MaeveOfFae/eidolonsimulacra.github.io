# 5.3.0 — the canon release

**Released 2026-10-11** · In the app: [`/whats-new`](/whats-new) · History: [`CHANGELOG.md`](../CHANGELOG.md)

5.3 is the release where a world stops being a folder of notes and becomes a constraint. A world now
holds **canon locks** — the facts a derivative draft must not change — and they ride generation as
additional rules for every draft linked to that world. It holds a **canon library** and **universe
notes**, injected into that same generation as a dedicated `CANON CONTEXT` section. And the whole body
of canon **exports as a worldbook**: the plaintext the app's own lorebook importer reads back, and
SillyTavern's world-info shape.

Two views make that material legible — a **relationship map** that draws a world's characters and
relationships deterministically, and **`/events`**, a date-aware calendar over every world's timeline —
and comparison runs grew up: `/compare` now runs one to four seeds through a two-to-four model matrix in
a single pass.

All of it is desktop-persisted worldbuilding, which remains desktop-only by decision
([`docs/WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md)). The canon channel is not: the
`CANON CONTEXT` section, the relationship map and `/events` are ordinary screens over data the desktop
store already holds.

Draft for the `v5.3.0` release body: everything from "Canon locks" down to "Where to look".

Suggested tag: `v5.3.0`, titled "the canon release" — earlier releases are tagged as lightweight tags
(`v5.2.0` points straight at its release commit).

## Canon locks

**A lock is a fact a derivative draft must not change.** The world editor's **Canon locks** tab records
them, scoped either to the world or to one of its characters, factions, locations, or timelines, so
"the city burned in 1204" binds every draft that belongs to the world while a character-scoped lock
binds only the drafts that carry that character.

**Linking is what makes it bind.** A draft linked to a world — directly, as a connected reference, or as
an offspring parent — inherits that world's locks during per-asset regeneration, refinement, offspring
seed and character generation, and reference-based generation. They arrive as additional rules
(`ADDITIONAL RULES:` / `ADDITIONAL INSTRUCTIONS:`), the same path a constraint set already used, and the
tab renders the exact constraint block generation receives, so what you see is what is sent.

**It persists and travels.** Locks live in their own `world_canon_locks` table and travel with the
workspace lore export/import.

## A canon library and universe notes

**Setting material, categorised.** The **Canon library** tab holds titled entries in one of four
categories (`trait`, `lore`, `relationship`, `setting`), each with a one-line summary, an optional
long-form body, and tags. Entries filter by category, and the tab renders the canon context block that
generation receives.

**The framing you keep re-explaining.** The **Universe notes** tab holds free-form text — tone,
continuity reminders, how magic feels — pinned or unpinned, with pinned notes leading both the list and
the context block.

**Both ride one channel.** For a draft linked to the world, the library entries and the notes are merged
into a single `CANON CONTEXT` section on the prompt (`resolveCanonContext`), kept separate from the
canon-lock rules so constraints and context stay distinguishable in the prompt and in the UI. Universe
notes are prepended, because they are the framing the rest of the material is read in.

## Export the world: the worldbook

**One projection, two formats.** The world editor's **Worldbook** tab projects the world's canon — its
details, characters, factions, locations, timelines, canon locks, and canon-library entries — into
portable setting entries, and exports them as the `[[LOREBOOK_PACKET]]` plaintext the app's own
lorebook importer reads back, or as a SillyTavern-style world-info JSON.

**The preview cannot drift from the file.** The projection is a pure function (`buildWorldbook`), so the
preview in the tab and the file you download are built from the same values instead of being rendered
twice.

## The relationship map

**Deterministic by construction.** The **Relationships** tab draws every character as a node on a ring
and every relationship as a labelled edge, computed by a pure layout module — so a given world always
renders the same picture, and a review of "what changed" is a real diff rather than a redraw.

**Unrenderable records are reported, not dropped.** Relationships whose characters are missing are
counted, and self-referential records are called out; neither becomes a stray line or a silent gap. This
replaces the staged **Relationship** placeholder that used to sit in that tab.

## `/events`: one calendar across every world

**Dates are sorted as dates.** `/events` collects the timeline events from every world and treats `YYYY`,
`YYYY-MM` and `YYYY-MM-DD` as real-world dates, sorting them numerically. Anything else — `1204 AF`, an
age name, a season — is kept as an in-world label in its recorded order, and undated events are listed
last rather than dropped. The screen filters by world.

**Events are still authored where they belong.** Creating and editing an event happens inside a world's
timeline, in the world editor; `/events` reads that data. Event storage, ordering and editing is
therefore no longer a roadmap item — it is the timeline editor you already had, plus a view over it.

## `/compare`: seeds and models in one pass

**One run, the whole matrix.** `/compare` takes one to four seeds and two to four models and runs every
seed through every candidate, with per-candidate provider detection. Each `(seed, model)` cell saves an
ordinary draft, linked by a comparison group, and the results matrix lines the cells up with the token,
duration and outcome recorded in the usage log — so choosing a model is a reading of results rather than
a memory of impressions.

## Under the hood

- **The canon channel has one entry point.** `resolveCanonContext` merges canon locks (→ `constraints`)
  and universe notes plus library entries (→ `context`), so every generation path that injects canon
  inherits both halves instead of re-implementing the merge.
- **Release-note links have to be reachable on mobile.** The first draft of this note linked `/worlds`
  and `/events`; mobile's `whats-new.test.ts` fails when a shared note links anywhere mobile cannot
  deep-link, and worldbuilding is desktop-only, so the note points at `/drafts`, `/lineage` and
  `/whats-new` instead.
- **Tests at the end of the release: 433 shared, 631 web, 155 mobile**, with `tsc` clean on web and
  mobile, lint at zero errors, prettier clean, and the repository document checks (`check:roadmap`,
  `check:placeholders`, `info:docs:check`, `release:notes:check`, `content:check`, `downloads:check`)
  green. Three files that had drifted out of prettier's style — `lorebook-packets.ts`,
  `llm/openai-compat.test.ts` and `services/generation.lorebook.test.ts` — were formatted, so
  `format:check` passes again.
- **The installers are not rebuilt yet.** The desktop bundles and the Android APK are still the 5.2.0
  builds, and `download.ts` still names `v5.2.0`, exactly as `docs/DOWNLOADS.md` requires: create the
  release and upload the assets first, then bump `RELEASE_VERSION`. `downloads:check` reports that
  deliberately as a note rather than a failure.

## Upgrading

Nothing to do, and nothing is deleted — no storage keys moved in this release, and existing worlds,
drafts, settings and keys are read as they are. The version is 5.3.0 across the web app, the desktop
build and the mobile app. The desktop tables behind the new tabs (`world_canon_locks`,
`world_canon_entries`, `world_universe_notes`) are created by the existing migration chain, so opening
the app is the only step.

## Where to look

- Canon locks, the canon library, universe notes, the worldbook and the relationship map: `?` on the
  world editor, or the [Help Center](/help).
- Roadmap and what is *not* shipped — including the canon work still outstanding (family tree and
  affiliation visualizations, the continuity assistant, conflict checking):
  [`docs/ROADMAP.md`](ROADMAP.md), the same claims the app's **What's New → Upcoming Updates** panel
  shows.
- Mobile parity against the web app, and why worldbuilding is out of scope for it:
  [`docs/MOBILE_PARITY.md`](MOBILE_PARITY.md) and
  [`docs/WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md).
- Download and install: [`/download`](/download) and [`docs/DOWNLOADS.md`](DOWNLOADS.md).