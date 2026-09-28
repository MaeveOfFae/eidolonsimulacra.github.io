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
- [ ] Reconcile the web/shared LLM layer. These are **not** duplicates: `packages/web/src/lib/llm/*` and `packages/shared/src/llm/*` have diverged behaviorally. Web adds `proxyKey` auth; shared adds provider-endpoint mapping, null-safe responses, conditional `top_p`, and `tool_calls` yielding. Decide canonical behavior per provider (and port `proxyKey` into shared) before merging, behind provider-level characterization tests
- [ ] Reconcile the generation services: `packages/web/src/lib/services/generation.ts` (713 lines, `GenerationService` class) vs `packages/shared/src/services/generation.ts` (166 lines, three lean functions). Web's layer is a client-side orchestrator, shared's is a direct generator, so confirm the intended seam before collapsing them
- [ ] Split `packages/web/src/lib/api.ts` (2.4k lines) along draft/template/config/theme/export/world seams. Expand characterization tests first: most `api` methods have no coverage and roughly 40 components depend on the `api` object shape
- [ ] Publish or drop `docs/index.html` (it is not built or published by CI)

Recently completed hygiene work (kept here for context):

- [X] Removed 31 unwired `*Placeholder` components and 3 dead modules; rewrote `roadmap.ts` with honest statuses
- [X] Renamed `OnboardingPlaceholder` to `GettingStartedGuide` and added a `Home` smoke test
- [X] Added CI coverage for shared tests, mobile typecheck, server typecheck, formatting, and placeholder wiring
- [X] Enforced formatting via `.prettierrc.json` + `pnpm format:check` and added `.prettierignore` for build output
- [X] Aligned the whole workspace on TypeScript 5.9.3 (web and server were still on 5.7.3) and fixed the typed-array/Prisma `Bytes` fallout that surfaced
- [X] Added logic-only Vitest suites for `packages/mobile` and `packages/server`, wired into CI, with server test files excluded from the built `dist`
