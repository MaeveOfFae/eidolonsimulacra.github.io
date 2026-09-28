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

- [ ] Decide the fate of `packages/server`: it builds, lints, typechecks and now has tests in CI, but nothing in the web/desktop/mobile apps calls it
- [ ] Split the `EidolonBrowserAPI` class in `packages/web/src/lib/api.ts` into domain modules (draft/template/config/world/timeline). The file is down from 2,727 to 1,826 lines after the theme-data extraction, and `src/lib/api.surface.ts` now locks the public method set at compile time, but the remaining class body needs per-domain behaviour tests before it can be moved safely: most methods have no coverage and roughly 40 components depend on the `api` object shape
- [ ] Publish or drop `docs/index.html` (it is not built or published by CI)

Recently completed hygiene work (kept here for context):

- [X] Deleted the dead `packages/shared/src/services/generation.ts` stub. It was not exported from `shared/src/index.ts` or `services/index.ts`, was absent from the built `dist/services/index.js`, and had zero importers — web's `GenerationService` is the live implementation and stays in web because it depends on web's `configManager`
- [X] Extracted `builtinTheme()` and the `builtinThemes` array out of `packages/web/src/lib/api.ts` into `lib/themes/builtin-themes.ts` (901 lines, ~33% of the file) and added `lib/api.surface.ts`, a compile-time lock over the 91 public API methods that fails `pnpm typecheck:web` if one is removed or renamed

- [X] Collapsed the forked web LLM layer onto `@char-gen/shared`. Web's `lib/llm/*` are now re-export shims; `proxyKey` support and the corrupted-key guard were ported into the shared `OpenAICompatEngine`; `shared/src/llm/*.test.ts` pins request shaping, streaming, headers and error handling
- [X] Fixed a latent bug found by those tests: because the shared factory always resolves a default `baseUrl`, a proxy key would have overridden the provider key for every request. The factory now forwards `proxyKey` only when a custom base URL was supplied

- [X] Removed 31 unwired `*Placeholder` components and 3 dead modules; rewrote `roadmap.ts` with honest statuses
- [X] Renamed `OnboardingPlaceholder` to `GettingStartedGuide` and added a `Home` smoke test
- [X] Added CI coverage for shared tests, mobile typecheck, server typecheck, formatting, and placeholder wiring
- [X] Enforced formatting via `.prettierrc.json` + `pnpm format:check` and added `.prettierignore` for build output
- [X] Aligned the whole workspace on TypeScript 5.9.3 (web and server were still on 5.7.3) and fixed the typed-array/Prisma `Bytes` fallout that surfaced
- [X] Added logic-only Vitest suites for `packages/mobile` and `packages/server`, wired into CI, with server test files excluded from the built `dist`
