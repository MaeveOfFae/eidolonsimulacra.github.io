# How To

Step-by-step instructions for every flow in Eidolon Simulacra. Each entry is one
task, with the exact screen, the controls you touch, and the gotchas worth
knowing before you touch them.

- For **what the product does today**, read [`../README.md`](../README.md).
- For **what is not finished**, read [`ROADMAP.md`](ROADMAP.md).
- For **interface parity between surfaces**, read [`MOBILE_PARITY.md`](MOBILE_PARITY.md).

## Surfaces and conventions

| Surface | Where it runs                      | How to start it                |
| ------- | ---------------------------------- | ------------------------------ |
| Web     | Browser                            | `pnpm dev:web`                 |
| Desktop | Tauri shell around the web app     | `pnpm dev:desktop`             |
| Mobile  | Expo / React Native                | `pnpm dev:mobile`              |
| LAN web | Browser, reachable on your network | `pnpm dev:web:lan` (port 3000) |

Conventions used below:

- **Web/Desktop** share the same screens; the desktop shell adds persisted
  drafts/lore and the LAN companion endpoint. Where a flow is desktop-only it is
  called out.
- **Mobile** is local-first and uses the same shared engine, but has a smaller
  screen set (5 tabs plus the Home and Drafts stacks). Mobile-only differences
  are called out where they matter.
- "⌘K / Ctrl-K" means `Cmd+K` on macOS and `Ctrl+K` elsewhere.

## Table of contents

1. [Set up first run and API keys](#1-set-up-first-run-and-api-keys)
2. [Choose a provider and model](#2-choose-a-provider-and-model)
3. [Generate a draft from a seed](#3-generate-a-draft-from-a-seed)
4. [Use scenario presets and constraints](#4-use-scenario-presets-and-constraints)
5. [Import an existing character card](#5-import-an-existing-character-card)
6. [Resume or cancel a generation](#6-resume-or-cancel-a-generation)
7. [Generate seed ideas](#7-generate-seed-ideas)
8. [Run a batch](#8-run-a-batch)
9. [Run a multi-model comparison](#9-run-a-multi-model-comparison)
10. [Review a draft](#10-review-a-draft)
11. [Approve, request changes, or undo a decision](#11-approve-request-changes-or-undo-a-decision)
12. [Edit an asset inline](#12-edit-an-asset-inline)
13. [Regenerate one asset](#13-regenerate-one-asset)
14. [Chat and refine a draft](#14-chat-and-refine-a-draft)
15. [Create a draft manually](#15-create-a-draft-manually)
16. [Use version history and restore points](#16-use-version-history-and-restore-points)
17. [Validate a draft](#17-validate-a-draft)
18. [Optimize text for tokens](#18-optimize-text-for-tokens)
19. [Preview tokenizer colours](#19-preview-tokenizer-colours)
20. [Use and manage templates](#20-use-and-manage-templates)
21. [Browse and edit blueprints](#21-browse-and-edit-blueprints)
22. [Export a draft](#22-export-a-draft)
23. [Lint a1111 tags and render in ComfyUI](#23-lint-a1111-tags-and-render-in-comfyui)
24. [Publish a draft to Chub](#24-publish-a-draft-to-chub)
25. [Manage the draft library](#25-manage-the-draft-library)
26. [Use the seeds library](#26-use-the-seeds-library)
27. [Restore from the archive](#27-restore-from-the-archive)
28. [Compare drafts in the workbench](#28-compare-drafts-in-the-workbench)
29. [Read usage insights](#29-read-usage-insights)
30. [Build a world (desktop only)](#30-build-a-world-desktop-only)
31. [Record canon locks, canon library, and universe notes](#31-record-canon-locks-canon-library-and-universe-notes)
32. [Export a worldbook](#32-export-a-worldbook)
33. [Read the relationship map](#33-read-the-relationship-map)
34. [Author timelines and read the event calendar](#34-author-timelines-and-read-the-event-calendar)
35. [Generate a lorebook packet](#35-generate-a-lorebook-packet)
36. [Trace lineage](#36-trace-lineage)
37. [Find similar drafts](#37-find-similar-drafts)
38. [Blend two characters into offspring](#38-blend-two-characters-into-offspring)
39. [Change the theme](#39-change-the-theme)
40. [Back up, export, import, or reset local data](#40-back-up-export-import-or-reset-local-data)
41. [Move data between devices](#41-move-data-between-devices)
42. [Pair mobile with the desktop companion](#42-pair-mobile-with-the-desktop-companion)
43. [Use the command palette, help, and workspace modes](#43-use-the-command-palette-help-and-workspace-modes)
44. [Run the mobile app flows](#44-run-the-mobile-app-flows)
45. [Build and ship the desktop and mobile apps](#45-build-and-ship-the-desktop-and-mobile-apps)
46. [Maintainer flows](#46-maintainer-flows)
47. [Troubleshooting](#47-troubleshooting)

## 1. Set up first run and API keys

1. Install dependencies: `pnpm install` (Node 20+, pnpm 10+).
2. Start the surface you want: `pnpm dev:web`, `pnpm dev:desktop`, or `pnpm dev:mobile`.
3. Open the app. **Home** is a dashboard: a starter checklist until you finish it,
   panels for recent drafts, saved searches and anything still in flight, then the
   next-steps and guided-help panels.
4. Press **Customize** on Home to reorder those panels or hide the ones you do not
   want, and **Reset layout** to put them back. This changes the dashboard only —
   every screen stays reachable from the sidebar and the palette.
4. Open **Settings** and stay on the **Setup** tab (the default).
5. In the **Access** column, tick **Save API keys to browser storage** (or
   **…desktop app data** on desktop) if you want keys persisted between sessions.
   Leaving it off keeps keys in memory for the session only.
6. Pick your **Active provider** in the provider grid, paste the key, and press
   **Test** to send a live probe. A corrupted key (invisible characters etc.) is
   rejected before it is stored.
7. Press **Save** to persist the config.

**Gotchas**

- Most "generation does nothing" reports are a missing or mismatched key here.
  Fix Settings before debugging anything else.
- Clearing browser storage removes stored keys. Export your config first (see
  [Section 40](#40-back-up-export-import-or-reset-local-data)).

## 2. Choose a provider and model

1. Open **Settings**.
2. Use **Setup → Active provider** to pick the provider; the model suggestions
   and the key field follow the provider you pick.
3. **Providers** tab: manage stored credentials one provider at a time instead of
   scanning every field.
4. **Generation** tab: set **batch** pacing (`max_concurrent`, `rate_limit_delay`)
   and the **advanced feature-blueprint defaults** per feature.
5. When a provider is reachable, the model list is loaded live; a stored model
   that is **not** in the loaded list is called out next to the picker.

**Gotchas**

- The app detects the provider from the model id (slash prefixes, bare ids).
  Key-only edits do not re-detect the provider, so editing a key cannot bounce
  your provider selection.
- OpenAI browser-direct calls can hit CORS; use OpenRouter or a proxy for
  browser-direct generation.

## 3. Generate a draft from a seed

1. Open **Generate** (`/generate`).
2. On the **New Draft** tab, set the **Content Mode**: SFW, NSFW, Platform-Safe,
   or Auto Detect.
3. Pick the **Template** first — it decides which assets exist and in what order.
4. Optionally add **Connected character references**: choose a saved draft and add
   it. Up to the displayed maximum are injected into every asset prompt and the
   links are saved on the new draft.
5. Optionally attach **optional assets** that the template exposes.
6. Enter a **seed**. Make it concrete enough for the model to preserve across
   assets.
7. Optionally fold in presets/constraints (see [Section 4](#4-use-scenario-presets-and-constraints)).
8. Press **Generate Character**.
9. Watch the **progress overlay** asset by asset. When it finishes, the draft is
   saved and you land in review.

**Gotchas**

- An invalid or missing API key fails generation before useful output appears.
- Treat the first result as a draft to review, not a final export. Review is
  where you fix things.

## 4. Use scenario presets and constraints

**Scenario presets** bundle a template, mode, and instruction lines:

1. On **Generate → New Draft**, set the template, mode, and any constraints you
   want.
2. Save them as a named preset. Later, clicking the preset name applies all three
   in one click.
3. Delete a preset with the **×** next to its name.

**Constraints** are a pickable catalog (tone, pacing, style, content handling,
framing):

1. Expand **Constraints**.
2. Toggle chips per category. The count badge shows how many lines are active.
3. Active constraint lines are appended to the generation instructions.

## 5. Import an existing character card

1. Open **Generate** and press **Import character**.
2. Pick a JSON or PNG character card. The importer runs the shared
   `detectAndParseCharacter`.
3. Confirm the detected name and assets.
4. The imported assets load as **structured source material** and the seed fills
   in with the character name if it was empty.
5. Generate as normal; the rehash uses the imported assets rather than inventing
   from scratch.
6. Press the clear control to drop the imported source and start clean.

## 6. Resume or cancel a generation

1. If a run is interrupted (tab closed, app killed, provider error), reopening
   **Generate** shows a **resume notice** when a checkpointed session exists.
2. Choose to resume; the run restarts from the next unfinished asset.
3. To stop a live run, press **Cancel** in the progress overlay. The active
   session is cleared.

**Mobile** shows a resume card when a checkpointed session exists, and can
restart from a named asset (drop that asset and everything after it).

## 7. Generate seed ideas

1. Set up provider access first ([Section 1](#1-set-up-first-run-and-api-keys)).
2. Open **Seed Generator** (`/seed-generator`).
3. Enter genre clusters lines (and any guidance).
4. Run the generator to produce concept seeds.
5. From the results:
   - Send the strongest seeds into **Generate** to become drafts.
   - Fold 2–4 favorite seeds into **one premise line**.
   - Keep tagged inspiration fragments on the **idea board**.
6. Favorites and run history are visible from the library's **Seeds** tab.

**Gotchas**

- The runtime prompt is the canonical `blueprints/system/seed_generator.md`.
  The note at `rules/workflows/seed-gen-list.md` is operator guidance, not the
  runtime prompt.

## 8. Run a batch

1. Open **Batch** (`/batch`).
2. Add one seed per line (the queue is shown).
3. Set defaults: template, mode, and pacing/concurrency.
4. Press the run button to start the queue.
5. Monitor progress per item; the live queue shows each run's state.

**Gotchas**

- Keep concurrency conservative until you know your provider's limits. High
  concurrency makes failures harder to interpret.
- Batch scheduling and reusable batch presets are **staged**, not live.

## 9. Run a multi-model comparison

1. Open **Compare** (`/compare`).
2. Enter 1–4 seeds.
3. Pick one template.
4. Pick 2–4 candidate models.
5. Run the pass. Every seed goes through every candidate.
6. Each `(seed, model)` cell is saved as a normal draft linked by a comparison
   group. The results matrix lines the cells up with token, duration, and outcome
   pulled from the usage records.
7. Open any cell in review to keep polishing it.

## 10. Review a draft

1. Open the draft from **Library** (`/drafts`) or straight after generation.
2. The review header shows the character name (editable), asset count, mode, and
   template.
3. The overview section shows approval progress and export readiness.
4. Each asset renders as a card with its own status badge.
5. Work the assets: edit inline, regenerate, optimize, lint, or extend downstream
   (see the following sections).
6. Use the readiness checklist to confirm nothing structural is missing.
7. Export only when the pack is coherent ([Section 22](#22-export-a-draft)).

**Header actions** (in the hero):

- **Validate** — run the contract check in place.
- **Favorite / Favorited** — toggle the draft's favourite flag.
- **Export** — open the export modal.
- **Publish to Chub** — open the publish dialog (gated on the character sheet).
- **Archive / Restore** — move in or out of the archive.

**Gotchas**

- A draft can read well in one asset and still fail export because another asset
  drifted or broke format. Validate after meaningful edits.
- Never ignore unresolved placeholders or empty required sections in strict
  assets.

## 11. Approve, request changes, or undo a decision

1. On a **Review** asset card, decide: **Approve** or **Request changes**.
2. The decision is recorded with a **fingerprint of the asset content**, so an
   approval **goes stale by itself** when that asset is regenerated or edited.
3. Changes-requested and stale assets sort to the top of the queue.
4. Undo a decision to send the asset back to undecided.
5. Downstream actions gate on approval:
   - **Publish to Chub** requires the character sheet to be approved.
   - **Send to ComfyUI** requires the a1111 asset to be approved.
6. Each decision writes a safeguard snapshot first, so approvals are undoable.

**Mobile** offers the same two decisions, **Approve** and **Request changes**,
driven by the same shared approvals engine — so the two surfaces cannot disagree
about what "approved" means.

## 12. Edit an asset inline

1. On the asset card, press the edit control.
2. Edit the content in the inline editor.
3. Press **Save**. A pre-edit safeguard snapshot is written first, so the change
   is revertible via version history.
4. Any existing approval for that asset is now stale by design.

## 13. Regenerate one asset

**From review:**

1. On the asset card, follow the **Regen** link. This opens
   `/drafts/:id/assets/:assetName/regenerate`.
2. Add extra guidance for the re-run.
3. Generate; the new content replaces the asset (with a safeguard snapshot).

**From Generate → Assets tab:**

1. Open **Generate** and switch to the **Assets** tab.
2. Pick the draft and the asset.
3. Adjust guidance and run.

`Generate → Refine Draft` also reaches the refiner (see next section).

## 14. Chat and refine a draft

**Chat assistant:**

1. On **Review**, open the chat assistant panel (an in-review assistant with
   per-screen context).
2. Choose the asset to focus on.
3. Ask for a change; the assistant streams a refined version you can accept.

**Refine Draft tab:**

1. Open **Generate → Refine Draft**.
2. Select the draft to refine.
3. Apply targeted edits rather than regenerating the whole draft.

**Gotchas**

- Prefer targeted refinement over a full regeneration; it preserves approved
  work.
- Refinement and chat are recorded as usage (tokens/duration) like every other
  LLM call.

## 15. Create a draft manually

1. From **Library**, press **Create draft manually** (available when templates
   exist).
2. Pick a seed and a template.
3. The draft is saved with empty asset slots.
4. Open it in review and fill the slots by hand or by AI.

## 16. Use version history and restore points

1. On **Review**, open the **Version history** panel.
2. Every safeguard snapshot (pre-edit, pre-approval, pre-merge, etc.) is listed
   with its label and reason.
3. Select a snapshot to preview it in the restore-point preview panel.
4. Restore a snapshot to roll the draft back. A restore itself is recorded, so it
   is also revertible.

Snapshots are also visible from the library (recent revision snapshots and recent
merge events).

## 17. Validate a draft

1. Open **Validation** (`/validation`).
2. **Validate a saved draft** by review id — the normal path — and press
   **Validate Draft**.
3. Or validate a **manual path**: type the stored path when you know exactly what
   you are checking.
4. Read the **results** panel: pass/fail plus the specific lines needing
   attention.
5. Fix missing required sections and unresolved placeholders first, then re-run.

You can also press **Validate** directly in the review header.

**Gotchas**

- Validation checks the draft against its template's contract — the asset graph,
  placeholders, and format. It cannot judge prose quality.

## 18. Optimize text for tokens

1. Open **Optimize** (`/optimize`).
2. Paste the full text to compress.
3. Decide whether formatting must be preserved.
4. Set the reduction target and run.
5. Compare output against input: confirm names, constraints, and required details
   survived; check the estimated token counts.
6. Rerun with a lower target if nuance was over-compressed.

**Gotchas**

- This is compression, not summarization. A high target can crush meaning.
- Estimated token counts are for comparison, not billing.

## 19. Preview tokenizer colours

1. Open **Tokenizer** (`/tokenizer`).
2. Tune bracket, pipe, and annotation colours independently of the main theme.
3. Preview the effect on syntax-highlighted prompt and review surfaces.

**Gotchas**

- Tokenizer colours affect highlighted editing/review surfaces only, not the
  whole app chrome. Use **Themes** for the app palette.

## 20. Use and manage templates

1. Open **Templates** (`/templates`) to see the catalog and each template's asset
   graph.
2. **Choose a template** before generating — this is the structural decision.
3. **Create** a template with the wizard (basic info, assets, dependencies).
4. **Edit** a template: add/remove assets and set `depends_on` edges explicitly.
5. **Validate** a template to check its contract.
6. **Export** a template to a file and **import** one from text.
7. **Delete** templates you no longer need.

**Gotchas**

- Templates decide which files exist and how they depend on each other. Treat
  changes as structural, not cosmetic.
- Start with the built-in **V2/V3 Card** template
  (`system_prompt`, `post_history`, `character_sheet`, `intro_scene`,
  `creator_notes`, `a1111`) so you learn the baseline.
- The built-in runtime catalog currently ships one template family under
  `blueprints/templates/official_v2v3/`.

## 21. Browse and edit blueprints

1. Open **Blueprints** (`/blueprints`). Treat this as **inspection first**.
2. **Search** a blueprint by name/path to find the family you are looking at.
3. Use the **browser tools** — lint and sandbox — to inspect behaviour before
   rewriting contract-heavy text.
4. To edit, open the **Blueprint editor** (`/blueprints/edit/*`): edit the source
   with lint and preview.
5. Or override a blueprint for a single run from **Generate → Blueprint
   override** (inspect or replace the generation blueprint).

**Gotchas**

- A casual blueprint edit can break validation or export even when the text still
  looks readable. If you only need a different workflow shape, prefer
  **Templates**.
- The four blueprint resolution paths are: template-local path, relative from the
  template dir, another blueprint under `blueprints/`, then
  `blueprints/examples/`.

## 22. Export a draft

1. Open the draft in **Review** and press **Export**.
2. In the export modal, choose a preset/format:
   - **json** — Chub-compatible V2/V3 card JSON with an `extensions.eidolon`
     payload for lossless round-tripping.
   - **text** — plain text with a section header per asset.
   - **combined** — a markdown bundle with metadata and all assets.
   - **png** — a PNG character card with the V2/V3 payload embedded (needs an
     attached card image).
   - **pdf** — a printable single-column PDF with metadata and every asset.
3. Toggle **include metadata** as needed.
4. Review the **export readiness** summary; if warnings require acknowledgement,
   tick the acknowledgement.
5. Press the export button. Where the file lands depends on the surface:
   - Desktop browser → Downloads / save dialog.
   - Mobile browser → share sheet or a new tab.
   - Tauri desktop → native save dialog.

**Gotchas**

- **png** requires an attached card image; without one it cannot build the card.
- Export preview and additional publishing flows are shown as **Planned Export
  Extras** — staged, not live.
- `presets/` TOML files are reference definitions, not the source of truth for
  the built-in export picker.

## 23. Lint a1111 tags and render in ComfyUI

**Lint:**

1. Open a draft with an `a1111` asset in **Review**.
2. The `a1111` card runs the **tag lint** against the local Danbooru index:
   unknown tags with near-miss suggestions, alias → canonical, deprecated tags,
   duplicates, and line-order drift.
3. Apply the one-click fixes for the mechanical corrections
   (`fiery_redhead → red_hair`).
4. **Approve** the `a1111` asset — the render action is gated on approval.

**Render:**

1. Configure **Settings → Image Pipeline** with your local ComfyUI `base_url`.
2. On the approved `a1111` card, press **Send to ComfyUI**.
3. Review the render inline; live step progress streams from the websocket when
   the transport allows it.
4. Batch up to four variations with one click (a pinned seed ladders
   seed, seed+1, …).
5. Every finished render is recorded on the draft (seed, outputs, workflow).
6. In the render gallery you can: re-pin a seed, promote an output to the card
   image (which feeds the IPAdapter reference), or save it into the draft as a
   `render_<n>` asset.

**Gotchas**

- The browser needs ComfyUI started with `--enable-cors-header`. The desktop app
  talks to ComfyUI natively through `tauri-plugin-http`.
- On the desktop app, requests leave through the native HTTP plugin, which is
  restricted by an allowlist in
  `packages/web/src-tauri/capabilities/default.json`. A scheme-wide pattern such
  as `http://**` matches **only the scheme's default port**, so a local server at
  `http://127.0.0.1:8188` is rejected before any connection is attempted — the
  entry must be port-aware (`http://*:*`). The same applies to any other
  `host:port` endpoint (Ollama, LM Studio).
- A built-in dual-encoder + CLIP skip 2 + IPAdapter workflow ships alongside;
  you can also import any "Save (API Format)" graph.

## 24. Publish a draft to Chub

1. Open **Settings → Chub**. Paste your chub.ai token and press **Test**. The app
   verifies it, shows the signed-in account, and mints a scoped projects-CRUD
   token for publishing. The session JWT's `exp` is decoded and shown; an expired
   one is called out with the remedy instead of being sent.
2. Approve the draft's **character sheet** (publishing is gated on it).
3. In **Review**, press **Publish to Chub** (in the header or from the
   character-sheet card).
4. Fill the editable form: name, tagline, tags, rating, visibility.
5. Read the live **preflight** list. It blocks under-tagged public listings,
   missing greetings, and macro hygiene problems before any request is made.
6. Publish. The record (`username/pathname` + character id) is stored on the
   draft as `metadata.chub_publish`.
7. Publish again later to **update the same character** instead of creating a
   duplicate.
8. Use **Disconnect** to clear the connection.

**Gotchas**

- The V2 mapping carries character sheet → persona, creator notes → notes, intro
  scene → first message, post history → `<START>`-wrapped example dialogs, and
  card image → avatar.
- A stale scoped token is re-minted once on a 401 and persisted.

## 25. Manage the draft library

The **Library** (`/drafts`) has three visible tabs — **Drafts**, **Seeds**,
**Archive** — plus a **Workbench** surface.

**Drafts tab:**

1. Search and filter the list; the header shows draft, favourite, and genre
   counts.
2. **Save the current filter set** as a named search, and reapply it later.
3. **Select multiple drafts** and edit metadata across all of them in one batched
   write.
4. **Scan for duplicates** by seed, character name, and similarity score.
5. Open a draft to move into review.
6. Toggle favourites to keep the library manageable as it grows.
7. Drag the divider between the list and the details pane to give one side more
   room. It is a real control: focus it and **←** / **→** resize, **Home** and
   **End** jump to the limits, and a double-click puts it back to the default. The
   width is remembered, and narrowed windows pull it in rather than pushing the
   details pane off screen. Below the `xl` breakpoint the two panes stack and there
   is no divider to drag.

**Gotchas**

- Deleting a draft removes the local copy unless you exported or backed it up.

## 26. Use the seeds library

1. Open **Library → Seeds**.
2. Review favourites and the seed run history.
3. Send a seed straight into generation, or archive seeds/runs you are done with.
4. Archived favourites and runs move to the archive ([Section 27](#27-restore-from-the-archive)).

## 27. Restore from the archive

1. Open **Library → Archive**.
2. Archived drafts (and archived seeds) are listed with their metadata.
3. **Restore** a draft. A safeguard snapshot is written before the restore, so it
   is reversible.
4. **Delete** an archived item permanently when you are sure.

## 28. Compare drafts in the workbench

1. Open **Library**, then press **Workbench** (enabled once drafts exist).
2. Choose a left and a right draft.
3. Compare them side by side and inspect the active one.
4. Use the snapshot preview to inspect restore points while comparing.
5. Merge or record findings; merge provenance is recorded on the draft.

## 29. Read usage insights

1. Open **Insights** (`/insights`).
2. Every LLM call (generation, per-asset regeneration, seeds, offspring,
   lorebook, chat/refine, similarity) has written a local usage record.
3. Read the roll-ups by provider, model, call type, asset, template, draft, and
   day, with failure rates and durations.
4. Check the **provider scorecard** model ranking.
5. Enter your own **per-model pricing** to get cost estimates in your currency
   (there are no bundled price tables).
6. **Export** the raw records as CSV or JSON.

**Gotchas**

- Records are local: IndexedDB in the browser, SQLite on desktop, capped at the
  newest 5,000 calls.

## 30. Build a world (desktop only)

Persisted worlds, factions, locations, and timelines are **only available in the
desktop app**. In the browser, `getWorlds()` returns an empty list and writes
throw `APIError(501, …)` — _"Persisted worlds, factions, locations, and timelines
are currently only available in the desktop app."_

1. Run the desktop app (`pnpm dev:desktop`).
2. Open **Worlds** (`/worlds`).
3. Create a world with a name and description.
4. Open the world editor. It has tabs: **World**, **Characters**,
   **Relationships**, **Timelines**, **Factions**, **Locations**,
   **Canon locks**, **Canon library**, **Worldbook**, **Universe notes**.
5. Add characters, factions, and locations from their tabs.
6. Link drafts to the world — directly, as a connected reference, or as an
   offspring parent — so they inherit the world's canon.

**Gotchas**

- World data persists in the desktop SQLite lore store and travels with the
  workspace lore export/import.
- Mobile worldbuilding is **desktop-only by decision**, recorded in
  [`WORLDBUILDING_DECISION.md`](WORLDBUILDING_DECISION.md).

## 31. Record canon locks, canon library, and universe notes

**Canon locks** — facts a derivative draft must not change:

1. In the world editor, open **Canon locks**.
2. Scope a lock to the world, or to one of its characters, factions, locations,
   or timelines.
3. Write the fact. The tab shows the exact constraint block generation receives.
4. Any draft linked to the world inherits these locks as additional rules during
   per-asset regeneration, refinement, offspring seed/character generation, and
   reference-based generation.

**Canon library** — curated setting material:

1. Open **Canon library**.
2. Add a titled entry in one of four categories: `trait`, `lore`,
   `relationship`, `setting`.
3. Give it a one-line summary, optional long-form body, and tags.
4. Filter by category. The tab renders the **canon context block** generation
   receives.

**Universe notes** — free-form canon context:

1. Open **Universe notes**.
2. Add a note (tone, continuity reminders, how magic feels).
3. Pin the important ones; pinned notes lead the list and the context block.

**Gotchas**

- Locks, library entries, and notes all travel into generation in a dedicated
  `CANON CONTEXT` section for drafts linked to the world.

## 32. Export a worldbook

1. In the world editor, open **Worldbook**.
2. The projection covers the world's details, characters, factions, locations,
   timelines, canon locks, and canon-library entries.
3. Export one of two formats:
   - `[[LOREBOOK_PACKET]]` plaintext — readable back by the app's lorebook
     importer.
   - SillyTavern-style world-info JSON.
4. The preview and the exported files come from the same pure function
   (`buildWorldbook`), so they cannot drift.

## 33. Read the relationship map

1. In the world editor, open **Relationships**.
2. Every character is a node on a deterministic ring; every relationship is a
   labelled edge.
3. Records whose characters are missing are **counted**, not drawn; self-
   referential records are reported.
4. Add or edit a relationship record to change the map.

**Gotchas**

- The layout is deterministic, so a given world always renders the same.

## 34. Author timelines and read the event calendar

**Authoring (inside a world):**

1. Run the **desktop** app and open a world.
2. Open the **Timelines** tab.
3. Add timeline events with dates and descriptions.
4. Order events chronologically.

**Reading across worlds:**

1. Open **Events** (`/events`).
2. `buildEventCalendar` treats `YYYY` / `YYYY-MM` / `YYYY-MM-DD` as real-world
   dates and sorts them numerically.
3. Anything else ("1204 AF") is kept as an in-world label in its recorded order.
4. Undated events are listed last, not dropped.
5. Filter by world.

**Gotchas**

- This screen **only reads** events; authoring happens in the world editor.
- Timeline event editing plus the continuity assistant/checker are **staged**.

## 35. Generate a lorebook packet

Available on both web and mobile:

1. Open the lorebook generator (web: the **Lorebook** panel on the Worlds
   screen; mobile: **Home → Lorebook Generator**).
2. Select the drafts that should define shared canon. Best results come from
   drafts that already imply consistent facts.
3. Add a focus/promotion instruction for what the packet should emphasise.
4. Generate the `[[LOREBOOK_PACKET]]` result.
5. Save, load, import, or export the packet.

The same packet format is shared across surfaces.

## 36. Trace lineage

1. Open **Lineage** (`/lineage`).
2. See how related drafts connect over time — derivations and review ancestry.
3. Use it for provenance, not for editing.

**Gotchas**

- Lineage projection, the ancestry graph, and lineage export are **staged** and
  marked "Not live". The live view stops at what the draft history records.

## 37. Find similar drafts

1. Open **Similarity** (`/similarity`).
2. Run pairwise similarity across drafts that share a seed or template.
3. Optionally run the LLM read for a deeper comparison.
4. Use the results to catch repeats, redundancy, or near-duplicates — typically
   after a larger library or a batch output set.

**Gotchas**

- Similarity is analysis support, not a replacement for human review.
- Similarity clustering and the cross-draft relationship graph are **staged**.

## 38. Blend two characters into offspring

1. Approve/review the parent drafts first — parent quality drives the result.
2. Open **Offspring** (`/offspring`).
3. Choose two parent drafts.
4. Set the mode and generation options.
5. Run. The offspring seed and character are generated from the parents
   (blueprint: `blueprints/system/offspring_generator.md`).
6. Review the resulting draft like any other.

**Gotchas**

- Unstable or contradictory parents give unstable offspring output.
- Trait inheritance and breeding history are **staged**.

## 39. Change the theme

1. Open **Themes** (`/themes`).
2. Pick a built-in preset. The whole app retints (web chrome; mobile retints every
   screen from the shared catalogue).
3. Open **Theme Manager** to author a custom theme, duplicate, or rename one.
4. Use **Import** to bring in a theme file; a conflict prompt appears when a theme
   with that name already exists.
5. For prompt/review highlight colours specifically, use **Tokenizer**
   (`/tokenizer`).

**Gotchas**

- Editing the reference TOML files under `resources/themes/` is **not** the same
  as changing the live runtime theme. Those files are repository assets.

## 40. Back up, export, import, or reset local data

1. Open **Data Manager** (`/data`).
2. Read the storage stats (drafts, seeds, API keys, whether a config exists).
3. **Export** the pieces you need:
   - drafts, seeds, config / API keys, and (desktop) the lore store,
   - a full **workspace bundle**,
   - a persistent-storage snapshot and an inspector view on desktop.
4. **Import** a previously exported file: drafts, config, seeds, lore, or a
   workspace bundle.
5. After importing drafts you can assign a template.
6. **Reset / clear** local data with the confirmation dialog.

**Gotchas**

- **Export backups before clearing browser data or changing devices.** Clearing
  storage without a backup removes local drafts and settings.
- Treat API-key exports as sensitive data.
- Mobile ships **no Data Manager**; use Settings for import/export instead
  ([Section 41](#41-move-data-between-devices)).

## 41. Move data between devices

**Workspace bundles:**

1. On the PC/web workspace, open **Data Manager** and export a **workspace
   bundle**.
2. On the target surface, import it:
   - Web/desktop → **Data Manager → Import**.
   - Mobile → **Settings → Import workspace bundle**.

**Desktop companion link (LAN):**

1. Start the desktop app and enable the companion endpoint.
2. On mobile, pair with the link ([Section 42](#42-pair-mobile-with-the-desktop-companion)).

## 42. Pair mobile with the desktop companion

1. On the desktop app, open the LAN companion settings and note the pairing link
   / code and the desktop name.
2. On mobile, open **Settings → Device Link**.
3. Add the desktop companion URL (or scan the pairing QR from the pair code).
4. Press **Test** to probe the connection; a reliability timestamp is shown.
5. Choose the **sync domains** you want to send or pull.
6. **Load preview** to inspect a pull before applying it; then pull or send.
7. **Remember** the current companion so it can be reused without re-entering
   the URL. **Delete remembered** to forget one.

**Gotchas**

- Opening the pairing link externally (deep link) focuses the mobile Settings
  Device Link section automatically.

## 43. Use the command palette, help, and workspace modes

**Command palette:**

1. Press **⌘K / Ctrl-K**.
2. Type to search every route plus recent drafts (ranked).
3. Press Enter to navigate.

**Help:**

1. Press **?** to open the **Help menu**, or use the **Help** button in the app
   frame — one menu at every width, rather than a hover card on desktop and a bare
   button on mobile.
2. The menu holds this page's help (the drawer opens from there), every guided
   tour, the keyboard-shortcut list, and links to the Help Center, What's new and
   About.
3. `?` opens the menu even on the screens with no page-level help: the tours and
   the Help Center apply everywhere.
4. Tours spotlight the relevant control, and **Help** advertises that shortcut via
   `aria-keyshortcuts`.
5. **Tooltips:** hover an icon-only control — or focus it with Tab — to see a
   one-line description. The tooltip is the control's *description*; its name is
   the control's own label, so a screen reader announces both.

**Gotchas**

- `?` is ignored while you are typing, so a question mark in a seed or a chat
  message stays a question mark.
- The menu closes on **Escape**, on a press anywhere outside it, and when you
  navigate — so it can never cover the screen you just asked for.

**Workspace modes:**

1. Switch between **Solo drafting**, **Review**, and **Bulk**.
2. A mode **promotes** its own screens in the sidebar and the palette's default
   list, and names itself in the app frame. It never hides anything.
3. Leave it on **Auto** to follow whichever screen you are on.
4. Each screen is owned by exactly one mode: Solo = `/generate`,
   `/seed-generator`, `/templates`; Review = `/drafts`, `/validation`,
   `/optimize`; Bulk = `/batch`, `/compare`, `/insights`.

**Gotchas**

- A mode is a lens, not a filter — the palette still reaches every route in every
  mode.

## 44. Run the mobile app flows

Start with `pnpm dev:mobile` (or `pnpm dev:mobile:android` / `:ios`). The app has
five tabs — **Home**, **Generate**, **Drafts**, **Templates**, **Settings** —
plus the Home and Drafts stacks.

| Task                                                                      | Where on mobile                                                                        |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Generate from a seed, pick variants/assets, import a card                 | **Generate** tab                                                                       |
| Batch generation                                                          | **Home → Batch**                                                                       |
| Seed ideas                                                                | **Home → Seed Generator**                                                              |
| Lorebook packet                                                           | **Home → Lorebook Generator**                                                          |
| Drafts list, detail, metadata, assets, snapshots, archive, export, delete | **Drafts** tab                                                                         |
| Refine an asset on a draft                                                | Draft detail → the asset's **Refine** action (streams a preview you accept or discard) |
| Templates list/detail/create/update/delete/validate/export/import         | **Templates** tab                                                                      |
| Blueprints browse + edit                                                  | **Home → Blueprints**                                                                  |
| Lineage, Validation, Token Optimization                                   | **Home →** each                                                                        |
| Compare characters / similarity                                           | **Lineage → Compare**                                                                  |
| Offspring blend                                                           | **Lineage → Offspring**                                                                |
| a1111 tag lint                                                            | Draft detail → the tag-lint tray (bundled core index)                                  |
| Provider, model, keys, connection test, model refresh                     | **Settings**                                                                           |
| Workspace bundle import/export, desktop companion pairing                 | **Settings → Device Link**                                                             |
| What's New / release notes                                                | **Home → What's New**                                                                  |
| Help Center, screen help, tours, info/legal                              | **Home** cards; **Help** on each tab screen                                             |
| Download page, Community                                                  | **Home → About** hub cards                                                             |
| Theme picker (live retint)                                                | **Home → Theme Picker**                                                                |

**Approval on mobile:** in a draft detail, use the approval tray with **Approve**
and **Request changes**. Changes-requested and stale assets sort to the top. The
decision is recorded with a safeguard snapshot and a content fingerprint, so it
goes stale automatically when the asset changes.

**Gotchas**

- Mobile is local-first: drafts, templates, blueprint overrides, settings, and
  keys live on the device.
- Generation talks directly to the provider; there is no backend.
- Mobile has no Data Manager and no worlds/timelines (desktop-only).

## 45. Build and ship the desktop and mobile apps

**Build everything, then verify:**

```bash
pnpm build          # shared -> web -> desktop -> mobile -> verify
```

**Build targets individually:**

```bash
pnpm build:shared
pnpm build:web
pnpm build:desktop  # Tauri; bundles the web app first
pnpm build:mobile   # regenerates bundled content, then Gradle
pnpm build:verify   # assert the artifacts exist (add --target web for one)
```

**Where the artifacts land:**

- Desktop: `packages/web/src-tauri/target/release/bundle/{nsis,msi}/`
- Android APK: `packages/mobile/android/app/build/outputs/apk/release/`

**Shipping a release** (maintainer): follow [`DOWNLOADS.md`](DOWNLOADS.md). In
short — build, create the GitHub release tagged `v<version>` and upload the
artifacts, update `packages/shared/src/info/download.ts`, run
`pnpm test:shared` and `pnpm downloads:check`, then push the Porkbun build with
`pnpm deploy:porkbun --build`.

**Gotchas**

- The Android release APK is signed with the **debug keystore** today, so it is
  not store-ready. Set up a release keystore or use the EAS `production` profile
  first.
- `pnpm content:check` and `pnpm info:docs:check` guard the generated sources the
  builds depend on.

## 46. Maintainer flows

**Common checks:**

```bash
pnpm typecheck:web
pnpm typecheck:mobile
pnpm test:web
pnpm test:shared
pnpm test:mobile
pnpm lint
pnpm format:check
pnpm check:placeholders   # a *Placeholder must be imported or allowlisted
pnpm check:roadmap        # roadmap.ts must agree with docs/ROADMAP.md
pnpm release:notes:check  # whats-new.ts version must match the app version
pnpm info:docs:check
pnpm content:check
pnpm downloads:check
pnpm icons:check
pnpm tags:check
```

**Generating derived sources:**

```bash
pnpm info:docs      # embed LICENSE / SECURITY / CODE_OF_CONDUCT into shared
pnpm content:generate  # regenerate mobile bundled content from blueprints/
pnpm release:notes  # write the release note into shared/src/whats-new.ts
pnpm icons:generate
pnpm tags:build     # build the Danbooru tag index
```

**Editing blueprints/templates:** start with `rules/60_blueprint_hard_rules.md`
and [`../blueprints/README.md`](../blueprints/README.md).

**Adding a prebuilt flow to the UI:** every route needs an entry in
`packages/web/src/lib/navigation/route-catalog.ts`, and
`validateRouteCatalog` fails loudly if the router and catalog drift.

## 47. Troubleshooting

| Symptom                              | Likely cause                                 | Fix                                                                             |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------- |
| Generation fails immediately         | Missing / mismatched provider key            | Re-check Settings → Access ([Section 1](#1-set-up-first-run-and-api-keys))      |
| Export seems to do nothing (mobile)  | No native filename prompt in mobile browsers | Look for a share sheet, a new tab, or the download tray                         |
| Drafts vanished                      | Browser storage cleared without a backup     | Restore from a JSON/workspace backup in Data Manager                            |
| Generation stops mid-run             | Tab closed / app killed / provider error     | Resume the checkpointed session ([Section 6](#6-resume-or-cancel-a-generation)) |
| PNG export refuses                   | No card image attached                       | Attach a card image (or promote a ComfyUI render) first                         |
| Publish button disabled              | Character sheet not approved                 | Approve the character sheet first                                               |
| Send to ComfyUI disabled             | a1111 asset not approved                     | Approve the a1111 asset first                                                   |
| ComfyUI send fails in browser        | Server started without CORS                  | Start ComfyUI with `--enable-cors-header`                                       |
| Worlds screen is empty / writes fail | Browser runtime                              | Worlds/timelines are desktop-only                                               |
| A screen ignores `?` help            | Focus is in a text field                     | `?` is deliberately ignored while typing                                        |

**Where to look when debugging a flow**

- `packages/web/src/App.tsx` — the router (every web route).
- `packages/web/src/lib/navigation/route-catalog.ts` — labels, groups, modes.
- `packages/shared/src/help/pages.ts` — per-screen help and pitfalls.
- `packages/mobile/App.tsx` and `packages/mobile/src/types/navigation.ts` — the
  mobile navigator.
- `docs/ROADMAP.md` — whether a missing behaviour is simply unshipped.
