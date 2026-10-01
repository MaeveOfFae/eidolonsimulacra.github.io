# Changelog

Generated release history for the browser app.


## v4.5.0 - 2026-09-30

### Analysis round 2: scorecards, costs, and export

This release builds on the usage records introduced in 4.1: the Insights page now ranks every model in a provider scorecard, estimates cost in your own currency from per-model pricing you enter (Eidolon ships no price tables), and exports the raw usage history as CSV or JSON so it can leave the device it was recorded on.

### Highlights
- Provider scorecard ranks every model by calls, failure rate, tokens, and average duration
- Enter your own per-1K-token rates per model and see estimated costs in your currency
- Model matching resolves dated model ids to one pricing entry through exact and prefix matches
- Export the full usage history as CSV or JSON from the Insights page
- Pricing and scorecard contracts are runtime-free and shared, so mobile can adopt them later

### Links
- [Open generation](/generate)
- [Open the library](/drafts)
- [Open the Help Center](/help)
## v4.4.0 - 2026-09-30

### Generation launcher polish

This release polishes the input side of generation: save the launcher's template, mode, and instructions as named scenario presets that apply in one click; compose additional-instruction lines from a pickable constraint catalog covering tone, pacing, style, content handling, and framing; fold two to four favorite seeds into one premise line; and keep tagged inspiration fragments on the seed generator's idea board.

### Highlights
- Named scenario presets bundle the launcher's template, mode, and instructions for one-click reuse
- A constraint builder composes deterministic instruction lines from a catalog of tone, pacing, style, content-handling, and framing options
- Seed remix deterministically folds 2-4 favorite seeds into a single premise line, no LLM required
- The idea board stores tagged inspiration fragments that flow into generation
- All contracts live in runtime-free shared modules so mobile can adopt them later

### Links
- [Open generation](/generate)
- [Open the seed generator](/seed-generator)
- [Open the Help Center](/help)
## v4.3.0 - 2026-09-30

### Draft library at scale

This release makes the draft library manageable as it grows: the library's filter set can be saved as named searches, selected drafts can be edited in bulk through one batched write, and a duplicate scan pairs matching seeds and names then scores each pair with the similarity engine.

### Highlights
- Save the library's filter set as named searches that survive navigation
- Select drafts and edit favourite, archive, genre, or tags in one batched write
- Duplicate scan pairs matching seeds and character names, then scores each pair by similarity
- Filter and sort logic now lives in one shared, test-pinned contract

### Links
- [Open the library](/drafts)
- [Open generation](/generate)
- [Open the Help Center](/help)
## v4.2.0 - 2026-09-30

### Multi-model comparison runs

This release adds a Compare page that sends one seed and template through up to four candidate models, saves each result as a linked draft, and lines the candidates up with their token and time cost from the local usage records introduced in 4.1.

### Highlights
- New Compare page runs one seed and template through 2-4 candidate models
- Each candidate saves a normal draft linked by a comparison group
- Results show status, tokens, and duration per candidate, drawn from local usage records
- Any two candidates open in the existing side-by-side diff
- Comparison calls appear as their own call type in Insights

### Links
- [Open generation](/generate)
- [Review templates](/templates)
- [Open the Help Center](/help)
## v4.1.0 - 2026-09-30

### Usage insights: every LLM call, measured locally

This release turns per-call engine telemetry into an owned local record. Every LLM call the app makes now writes its tokens, duration, provider, model, and outcome to device storage, streaming responses included, and the new Insights page rolls that history up by provider, model, asset, template, draft, and day.

### Highlights
- Every LLM call now writes a local usage record with tokens, duration, provider, model, and outcome
- Streaming responses report real token usage from OpenAI, OpenRouter, DeepSeek, Anthropic, and Google
- New Insights page rolls usage up by provider, model, asset, template, draft, and day
- Usage history survives restarts in the browser (IndexedDB) and desktop (SQLite) apps
- Records stay on your device, capped at the newest 5,000 calls, with a one-click clear

### Links
- [Open the Help Center](/help)
- [Open generation](/generate)
- [Review templates](/templates)
## v4.0.0 - 2026-09-29

### Mobile parity tiers 1 and 2, on a shared content layer

This release completes every scoped mobile parity item and moves the content behind them into shared modules. The phone app now ships draft archiving, lorebook generation, PNG card export, release notes, live theming from the builtin preset catalogue, a Help Center with guided tours, and the full info and legal document set, all rendering from the same data the browser and desktop apps use.

### Highlights
- Mobile draft archiving, including archived filters and safeguard restore points
- Lorebook generation on mobile, with the packet format shared across surfaces
- PNG character-card export and import on mobile through the shared card helpers
- Release notes and What's New rendering from one shared source on every surface
- Themes: the 27 builtin presets extracted to shared, with every mobile screen retinting live
- Help Center on mobile with shared topics, walkable tours, and persisted tour progress
- Info and legal pages on mobile, generated from the repository documents with a CI drift check
- Worldbuilding recorded as desktop-only, closing parity Tier 3 by decision

### Links
- [Open generation](/generate)
- [Review templates](/templates)
- [Open the Help Center](/help)
- [Browse themes](/themes)
## v3.3.5 - 2026-04-20

### Platform and UI update

This release packages 12 recent commits focused on platform, UI, and runtime.

### Highlights
- Enhance draft configuration with custom instructions and component send order
- Update LLM engine options and improve base64 encoding
- Release v3.3.3 with platform and UI updates, including new features and enhancements
- Enhance draft review and refinement process
- Add Kofi overlay styling to ensure proper positioning on the screen

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.3.4 - 2026-04-20

### Platform and UI update

This release packages 12 recent commits focused on platform, UI, and runtime.

### Highlights
- Update LLM engine options and improve base64 encoding
- Release v3.3.3 with platform and UI updates, including new features and enhancements
- Enhance draft review and refinement process
- Add Kofi overlay styling to ensure proper positioning on the screen
- Refactor Ko-fi overlay integration and improve contextual help panel accessibility

### Links
- [Open generation](/generate)
- [Review templates](/templates)
## v3.3.3 - 2026-04-17

### Platform and UI update

This release packages 12 recent commits focused on platform, UI, and templates.

### Highlights
- Enhance draft review and refinement process
- Add Kofi overlay styling to ensure proper positioning on the screen
- Refactor Ko-fi overlay integration and improve contextual help panel accessibility
- Add Ko-fi overlay widget for donations support
- Implement character import functionality with support for multiple formats

### Links
- [Open generation](/generate)
- [Review templates](/templates)

## v3.3.2 - 2026-04-17

### Platform and templates update

This release packages recent commits focused on platform, templates, and themes.

### Highlights
- Implement archiving functionality for seeds and seed runs
- added draft import

### Links
- [Open generation](/generate)
- [Review templates](/templates)









