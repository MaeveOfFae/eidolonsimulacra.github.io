# Changelog

Generated release history for the browser app.


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






