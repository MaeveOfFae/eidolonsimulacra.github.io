# TODO List

Engineering debt, next steps, and known gaps. Feature-level unfinished work lives in [docs/ROADMAP.md](docs/ROADMAP.md).

Immediate next steps to complete before launch:

- [X] Finalize project name and branding (currently "Eidolon Simulacra" in code, but some files still say "Character Generator")
- [X] separate tokenizer from themes and make it its own page (`/tokenizer` + `TokenizerThemeStudio`)
- [X] add a "What's New" section to the home screen for release notes and updates
- [X] implement a basic "Getting Started" guide in the app (Help Center guides + guided tours + first-run checklist)

Longer-term improvements and nice-to-haves:

- [X] Add a "Community" page linking to forums, Discord, etc. (GitHub, issues, Ko-fi and contact are live; Discord/forums are still pending and the page says so)
- [X] Replace one-off bundle transfer with a true paired PC companion link for mobile-to-desktop sync (desktop LAN companion + pairing links + workspace bundle sync)
- [ ] Add more export formats (e.g. PDF character sheets)
- [ ] Implement a plugin system for user-contributed templates and blueprints
- [ ] Add more detailed analytics and error reporting for better support and debugging

Stretch goals:

- [X] Develop a Tauri desktop app for offline use and local API server integration
- [X] Release a companion mobile app for on-the-go character management and generation

Known gaps found while reviewing the codebase (not yet scheduled):

- [ ] Split the `EidolonBrowserAPI` class in `packages/web/src/lib/api.ts` into domain modules. The file is down from 2,727 to 1,826 lines after the theme-data extraction, and `src/lib/api.surface.ts` locks the public method set at compile time. Characterization tests now cover the draft, theme, template, config and export domains (`api.drafts.test.ts`, `api.themes.test.ts`, `api.templates.test.ts`, `api.config.test.ts`, `api.export.test.ts` — 40 tests). The blueprint and world/timeline domains still need coverage before they can be moved safely, since roughly 40 components depend on the `api` object shape
- [ ] Publish or drop `docs/index.html` (it is not built or published by CI)

Recently completed hygiene work (kept here for context):

- [X] Made the browser API runtime-testable: happy-dom has no `indexedDB`, which blocked the Dexie-backed draft store, so `fake-indexeddb` is now imported from `packages/web/src/test/setup.ts`. `test:web` grew from 22 files / 78 tests to 27 files / 118 tests across the draft, theme, template, config and export domains

- [X] Deleted the dead `packages/shared/src/services/generation.ts` stub. It was not exported from `shared/src/index.ts` or `services/index.ts`, was absent from the built `dist/services/index.js`, and had zero importers — web's `GenerationService` is the live implementation and stays in web because it depends on web's `configManager`
- [X] Extracted `builtinTheme()` and the `builtinThemes` array out of `packages/web/src/lib/api.ts` into `lib/themes/builtin-themes.ts` (901 lines, ~33% of the file) and added `lib/api.surface.ts`, a compile-time lock over the 91 public API methods that fails `pnpm typecheck:web` if one is removed or renamed

- [X] Collapsed the forked web LLM layer onto `@char-gen/shared`. Web's `lib/llm/*` are now re-export shims; `proxyKey` support and the corrupted-key guard were ported into the shared `OpenAICompatEngine`; `shared/src/llm/*.test.ts` pins request shaping, streaming, headers and error handling
- [X] Fixed a latent bug found by those tests: because the shared factory always resolves a default `baseUrl`, a proxy key would have overridden the provider key for every request. The factory now forwards `proxyKey` only when a custom base URL was supplied

- [X] Removed 31 unwired `*Placeholder` components and 3 dead modules; rewrote `roadmap.ts` with honest statuses
- [X] Renamed `OnboardingPlaceholder` to `GettingStartedGuide` and added a `Home` smoke test
- [X] Added CI coverage for shared tests, mobile typecheck, formatting, and placeholder wiring
- [X] Enforced formatting via `.prettierrc.json` + `pnpm format:check` and added `.prettierignore` for build output
- [X] Aligned the whole workspace on TypeScript 5.9.3 and fixed the typed-array fallout that surfaced
- [X] Added a logic-only Vitest suite for `packages/mobile`, wired into CI
- [X] Deleted `packages/server` and its deployment artifacts (`docker/eidolon`, `docker-compose.yml`, `docker-compose.dev.yml`, `Caddyfile`, `.env.docker.example`, `docker/.env.example`). Nothing in the web, desktop or mobile apps called it, so the repo is now backend-free; `typecheck:server`/`test:server` scripts and their CI steps were removed too
