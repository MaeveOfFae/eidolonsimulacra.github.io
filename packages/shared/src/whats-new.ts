export interface ReleaseNoteLink {
  label: string;
  to: string;
}

export interface ReleaseNoteEntry {
  version: string;
  releasedOn: string;
  badge: string;
  headline: string;
  summary: string;
  highlights: string[];
  links: ReleaseNoteLink[];
}

// Generated and maintained by tools/generation/generate-release-notes.mjs.
export const releaseNotes: ReleaseNoteEntry[] = [
  {
    version: '5.1.0',
    releasedOn: '2026-10-06',
    badge: 'Current release',
    headline: 'The image handoff release: a Danbooru tag linter and a direct ComfyUI bridge',
    summary:
      '5.1 turns the a1111 asset from copy-paste output into a validated, executable prompt. A local Danbooru tag index (185k tags and 37k aliases fetched on demand, plus a bundled 12k-tag core for offline use) lints every prompt for unknown tags, aliases, deprecated tags, duplicates and line-order drift, and one click applies the mechanical fixes that used to be manual. The approved prompt can then be sent straight to ComfyUI on the actual pipeline - dual-encoder, CLIP skip 2, IPAdapter refs - with the render polled and reviewed inline.',
    highlights: [
      'Every a1111 prompt is linted against a local Danbooru index: unknown tags, alias to canonical, deprecated, duplicates',
      'One-click fixes automate the manual pseudo-tag corrections (fiery_redhead to red_hair)',
      'Approve, render and review without leaving the app: the a1111 card sends to ComfyUI and shows the outputs inline',
      'Built-in dual-encoder + CLIP skip 2 + IPAdapter workflow, or import any Save (API Format) graph',
      'Desktop talks to ComfyUI natively via tauri-plugin-http; the browser path documents the --enable-cors-header requirement',
    ],
    links: [
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open Settings', to: '/settings' },
    ],
  },
  {
    version: '5.0.0',
    releasedOn: '2026-10-04',
    badge: 'Previous release',
    headline: 'The workspace release: a command palette, workspace modes, and a keyboard-first pass',
    summary:
      '5.0 is the workspace release. A Cmd/Ctrl-K palette reaches all 36 routes plus recent drafts, workspace modes (solo drafting, review, bulk) promote the screens they own, and every dialog now handles Escape, captures focus, wraps Tab and returns focus on close. Mobile gains the same approval decisions the review screen already had, and state colours come from four theme tokens that carry their own dark values.',
    highlights: [
      'Cmd/Ctrl-K opens a palette over every route plus recent drafts, with a ranked search',
      'Workspace modes - solo drafting, review, and bulk - promote their screens and name themselves in the app frame',
      'One dialog shell gives all 14 overlays Escape, focus capture, Tab wrapping and focus return',
      'Around 101 form controls gained accessible names, and a tab-order test over all 35 routes found four unnamed tab stops',
      'Mobile review and approval: approve, request changes, or undo, with decisions that go stale when the asset changes',
      'State colours are theme tokens in both themes; 381 hand-written utilities and 88 dark: overrides went with them',
      'No source file is over 1,000 lines, and the legacy bpui.* storage keys are retired behind one migration',
    ],
    links: [
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open generation', to: '/generate' },
      { label: "Open What's New", to: '/whats-new' },
    ],
  },
  {
    version: '4.8.0',
    releasedOn: '2026-10-04',
    badge: 'Previous release',
    headline: 'Checkpointed generation sessions',
    summary:
      'Generation runs are now checkpointed end to end. The per-asset run can pause mid-stream and resume from the paused asset with the approved prefix as context, any approved asset can become a restart point that regenerates everything downstream, and a paused session restores after reload without auto-resuming. Single-shot runs (batch, comparison, API callers) checkpoint by salvage - closed asset blocks from a dying stream are saved as a marked partial draft, and batch errors name it - while mobile persists a per-asset checkpoint with a Resume generation card that restores imported sources and can restart from any completed asset.',
    highlights: [
      'Pause mid-run keeps the checkpoint; Resume session continues from the paused asset with the approved prefix as context',
      'Restart from any approved asset - on the web run and the mobile resume card - regenerating everything downstream',
      'Interrupted single-shot runs salvage closed asset blocks into a marked partial draft, and batch errors name it',
      'Mobile checkpoints every completed asset and offers a Resume generation card that restores imported sources',
      'Paused sessions restore after reload without auto-resuming, so a reload never restarts token spend on its own',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open the Help Center', to: '/help' },
    ],
  },
  {
    version: '4.7.0',
    releasedOn: '2026-10-02',
    badge: 'Previous release',
    headline: 'Asset approvals and the finished facade split',
    summary:
      'Every draft asset can now be approved, flagged for changes, or undone from the review screen, with decisions fingerprinted to the content they approved so later edits mark them stale, and changes-requested assets joining low scores as export blockers. Under the hood the API facade split is complete: all nine domains live in their own modules behind a thin 589-line delegation shell, down from 2,727 lines, with the public surface locked and every characterization suite passing unchanged.',
    highlights: [
      'Approve, request changes, or undo a decision on each draft asset from the review screen',
      'Decisions are fingerprinted to the approved content, so editing an asset marks its decision stale',
      'Assets with changes requested join low scores as export-readiness blockers',
      'The API facade split is complete: nine domain modules behind a 589-line shell, down from 2,727 lines',
      'The public surface lock grows to 100 methods; 250 shared and 204 web tests pass',
    ],
    links: [
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open the Help Center', to: '/help' },
      { label: 'Open generation', to: '/generate' },
    ],
  },
  {
    version: '4.6.1',
    releasedOn: '2026-10-01',
    badge: 'Previous release',
    headline: 'Pricing is per million tokens',
    summary:
      'Corrects the Insights pricing model: rates are entered per 1M tokens — the unit providers actually quote — not per 1K, so estimated costs had been coming out 1000x too high. The math, field names, editor labels, and example placeholders now all say 1M, and pricing entries saved earlier migrate automatically with their values unchanged.',
    highlights: [
      'Cost calculation divides by one million tokens instead of one thousand',
      'Pricing fields renamed to input and output cost per million tokens',
      'Entries saved before this release migrate automatically, values unchanged',
      'Editor labels and placeholders now read per 1M with realistic example rates',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open the Help Center', to: '/help' },
    ],
  },
  {
    version: '4.6.0',
    releasedOn: '2026-10-01',
    badge: 'Previous release',
    headline: 'API facade split: domain homes for worlds and blueprints',
    summary:
      "A maintenance release: the browser API's world/timeline and blueprint domains move out of the 1,600-line facade into their own modules, pinned on both sides of the move by 39 new characterization tests, with the public 99-method surface locked unchanged.",
    highlights: [
      'Blueprint domain characterized: 11 tests pin catalog listing, overrides, the built-in-edit redirect, and reset',
      'World and timeline domain characterized: browser guards plus argument-exact desktop delegation across 28 tests',
      'APIError extracted to its own module and re-exported, so no importer changes',
      'The facade drops to 1,441 lines; every extracted domain now has a home of its own',
      'All 199 web tests pass unchanged — the refactor is provably behavior-preserving',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open the Help Center', to: '/help' },
    ],
  },
  {
    version: '4.5.0',
    releasedOn: '2026-09-30',
    badge: 'Previous release',
    headline: 'Analysis round 2: scorecards, costs, and export',
    summary:
      'This release builds on the usage records introduced in 4.1: the Insights page now ranks every model in a provider scorecard, estimates cost in your own currency from per-model pricing you enter (Eidolon ships no price tables), and exports the raw usage history as CSV or JSON so it can leave the device it was recorded on.',
    highlights: [
      'Provider scorecard ranks every model by calls, failure rate, tokens, and average duration',
      'Enter your own per-1K-token rates per model and see estimated costs in your currency',
      'Model matching resolves dated model ids to one pricing entry through exact and prefix matches',
      'Export the full usage history as CSV or JSON from the Insights page',
      'Pricing and scorecard contracts are runtime-free and shared, so mobile can adopt them later',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open the Help Center', to: '/help' },
    ],
  },
  {
    version: '4.4.0',
    releasedOn: '2026-09-30',
    badge: 'Previous release',
    headline: 'Generation launcher polish',
    summary:
      "This release polishes the input side of generation: save the launcher's template, mode, and instructions as named scenario presets that apply in one click; compose additional-instruction lines from a pickable constraint catalog covering tone, pacing, style, content handling, and framing; fold two to four favorite seeds into one premise line; and keep tagged inspiration fragments on the seed generator's idea board.",
    highlights: [
      "Named scenario presets bundle the launcher's template, mode, and instructions for one-click reuse",
      'A constraint builder composes deterministic instruction lines from a catalog of tone, pacing, style, content-handling, and framing options',
      'Seed remix deterministically folds 2-4 favorite seeds into a single premise line, no LLM required',
      'The idea board stores tagged inspiration fragments that flow into generation',
      'All contracts live in runtime-free shared modules so mobile can adopt them later',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Open the seed generator', to: '/seed-generator' },
      { label: 'Open the Help Center', to: '/help' },
    ],
  },
  {
    version: '4.3.0',
    releasedOn: '2026-09-30',
    badge: 'Previous release',
    headline: 'Draft library at scale',
    summary:
      "This release makes the draft library manageable as it grows: the library's filter set can be saved as named searches, selected drafts can be edited in bulk through one batched write, and a duplicate scan pairs matching seeds and names then scores each pair with the similarity engine.",
    highlights: [
      "Save the library's filter set as named searches that survive navigation",
      'Select drafts and edit favourite, archive, genre, or tags in one batched write',
      'Duplicate scan pairs matching seeds and character names, then scores each pair by similarity',
      'Filter and sort logic now lives in one shared, test-pinned contract',
    ],
    links: [
      { label: 'Open the library', to: '/drafts' },
      { label: 'Open generation', to: '/generate' },
      { label: 'Open the Help Center', to: '/help' },
    ],
  },
  {
    version: '4.2.0',
    releasedOn: '2026-09-30',
    badge: 'Previous release',
    headline: 'Multi-model comparison runs',
    summary:
      'This release adds a Compare page that sends one seed and template through up to four candidate models, saves each result as a linked draft, and lines the candidates up with their token and time cost from the local usage records introduced in 4.1.',
    highlights: [
      'New Compare page runs one seed and template through 2-4 candidate models',
      'Each candidate saves a normal draft linked by a comparison group',
      'Results show status, tokens, and duration per candidate, drawn from local usage records',
      'Any two candidates open in the existing side-by-side diff',
      'Comparison calls appear as their own call type in Insights',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
      { label: 'Open the Help Center', to: '/help' },
    ],
  },
  {
    version: '4.1.0',
    releasedOn: '2026-09-30',
    badge: 'Previous release',
    headline: 'Usage insights: every LLM call, measured locally',
    summary:
      'This release turns per-call engine telemetry into an owned local record. Every LLM call the app makes now writes its tokens, duration, provider, model, and outcome to device storage, streaming responses included, and the new Insights page rolls that history up by provider, model, asset, template, draft, and day.',
    highlights: [
      'Every LLM call now writes a local usage record with tokens, duration, provider, model, and outcome',
      'Streaming responses report real token usage from OpenAI, OpenRouter, DeepSeek, Anthropic, and Google',
      'New Insights page rolls usage up by provider, model, asset, template, draft, and day',
      'Usage history survives restarts in the browser (IndexedDB) and desktop (SQLite) apps',
      'Records stay on your device, capped at the newest 5,000 calls, with a one-click clear',
    ],
    links: [
      { label: 'Open the Help Center', to: '/help' },
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
    ],
  },
  {
    version: '4.0.0',
    releasedOn: '2026-09-29',
    badge: 'Previous release',
    headline: 'Mobile parity tiers 1 and 2, on a shared content layer',
    summary:
      'This release completes every scoped mobile parity item and moves the content behind them into shared modules. The phone app now ships draft archiving, lorebook generation, PNG card export, release notes, live theming from the builtin preset catalogue, a Help Center with guided tours, and the full info and legal document set, all rendering from the same data the browser and desktop apps use.',
    highlights: [
      'Mobile draft archiving, including archived filters and safeguard restore points',
      'Lorebook generation on mobile, with the packet format shared across surfaces',
      'PNG character-card export and import on mobile through the shared card helpers',
      "Release notes and What's New rendering from one shared source on every surface",
      'Themes: the 27 builtin presets extracted to shared, with every mobile screen retinting live',
      'Help Center on mobile with shared topics, walkable tours, and persisted tour progress',
      'Info and legal pages on mobile, generated from the repository documents with a CI drift check',
      'Worldbuilding recorded as desktop-only, closing parity Tier 3 by decision',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
      { label: 'Open the Help Center', to: '/help' },
      { label: 'Browse themes', to: '/themes' },
    ],
  },
  {
    version: '3.3.5',
    releasedOn: '2026-04-20',
    badge: 'Previous release',
    headline: 'Platform and UI update',
    summary: 'This release packages 12 recent commits focused on platform, UI, and runtime.',
    highlights: [
      'Enhance draft configuration with custom instructions and component send order',
      'Update LLM engine options and improve base64 encoding',
      'Release v3.3.3 with platform and UI updates, including new features and enhancements',
      'Enhance draft review and refinement process',
      'Add Kofi overlay styling to ensure proper positioning on the screen',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
    ],
  },
  {
    version: '3.3.4',
    releasedOn: '2026-04-20',
    badge: 'Previous release',
    headline: 'Platform and UI update',
    summary: 'This release packages 12 recent commits focused on platform, UI, and runtime.',
    highlights: [
      'Update LLM engine options and improve base64 encoding',
      'Release v3.3.3 with platform and UI updates, including new features and enhancements',
      'Enhance draft review and refinement process',
      'Add Kofi overlay styling to ensure proper positioning on the screen',
      'Refactor Ko-fi overlay integration and improve contextual help panel accessibility',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
    ],
  },
  {
    version: '3.3.3',
    releasedOn: '2026-04-17',
    badge: 'Previous release',
    headline: 'Platform and UI update',
    summary: 'This release packages 12 recent commits focused on platform, UI, and templates.',
    highlights: [
      'Enhance draft review and refinement process',
      'Add Kofi overlay styling to ensure proper positioning on the screen',
      'Refactor Ko-fi overlay integration and improve contextual help panel accessibility',
      'Add Ko-fi overlay widget for donations support',
      'Implement character import functionality with support for multiple formats',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
    ],
  },
  {
    version: '3.3.2',
    releasedOn: '2024-06-17',
    badge: 'Previous release',
    headline: 'Platform and templates update',
    summary: 'This release packages 12 recent commits focused on platform, templates, and themes.',
    highlights: [
      'Implement archiving functionality for seeds and seed runs',
      'Added draft import handling with character sheet and lorebook asset extraction',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
    ],
  },
];
