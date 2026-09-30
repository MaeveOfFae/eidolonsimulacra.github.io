# Eidolon Simulacra

Eidolon Simulacra is a pnpm monorepo for template-aware character generation. The current product surfaces are a React web app, a Tauri desktop build of that app, and an Expo-based mobile app. Generation, parsing, export, and template utilities are shared through one TypeScript package.

The repo is centered on a strict blueprint contract: start from one seed, generate assets in dependency order, keep asset formats module-specific, and do not leak downstream facts upstream.

## Current State

- The web app remains the most complete day-to-day workflow. Drafts, templates, blueprint edits, and theme choices stay in local browser or desktop storage, and cross-device transfer centers on workspace bundle export/import plus the local PC companion link instead of hosted sync.
- The desktop build (`packages/web/src-tauri`) runs the same web app offline with local SQLite-backed draft and lore storage, and can host a LAN companion endpoint for paired mobile devices.
- The mobile app now ships as an Expo workspace package with native navigation for generation, drafts, templates, settings, lineage, validation, blueprint browsing, comparison, and offspring flows.
- Cross-device movement between mobile and PC uses the paired desktop companion link or local workspace bundles exported from the PC app or web workspace and imported on mobile.
- Direct LLM provider integration from the client via the shared engine layer.
- One built-in runtime template is currently loaded from `blueprints/templates/`:
  - `V2/V3 Card` with `system_prompt`, `post_history`, `character_sheet`, `intro_scene`, `creator_notes`, and `a1111`
- Aksho reference material is checked in under `dev/official_aksho/`, but it is not currently loaded as a built-in browser template manifest. (`dev/` is git-ignored, so it only exists in checkouts that have it locally.)
- Shared parser and validator utilities for fenced-codeblock generation output.
- Export helpers and preset definitions for raw asset packs and platform-specific formats.
- Rule and workflow documentation under `rules/` for generation constraints, content modes, and blueprint hygiene.

### Staged and unfinished areas

Roadmap areas are tracked in [`docs/ROADMAP.md`](docs/ROADMAP.md) and surfaced in-app on the What's New page. Nothing there is presented as shipped. The following areas are explicitly staged in the product UI today rather than live:

- The Events screen (event tracking is staged, not live)
- World canon, worldbook, universe-notes, and canon-lock modules
- Timeline event editing and the continuity assistant/checker
- Batch scheduling and reusable batch presets
- Export preview and publishing flows (shown as "Planned Export Extras")

Unwired `*Placeholder` components are not allowed: `pnpm check:placeholders` fails CI if a placeholder exists without an import.

## Workspace Layout

```text
eidolon-simulacra/
├── blueprints/          # System blueprints, template manifests, and examples
├── docker/              # Container image for the web preview/dev stack
├── docs/                # Static project home page and roadmap served from the repo
├── packages/
│   ├── shared/          # Shared TS types, generation, parsing, export, template utilities
│   ├── web/             # React 19 + Vite browser app (includes the Tauri desktop shell)
│   └── mobile/          # Expo + React Native app shell using the shared package
├── presets/             # Export preset definitions
├── resources/           # Theme/resource files tracked in the repo
├── rules/               # Generation contract, content rules, and workflow docs
└── tools/               # Supporting docs, generation, deploy, and mobile build notes
```

## Web App

The web app currently exposes the main workflows directly in the browser:

- Generate from a seed with template selection and content mode controls
- Generate seed ideas and carry them into the main generation flow
- Review, edit, validate, compare, and export drafts
- Browse and edit templates and blueprint source
- Run offspring and similarity workflows
- Manage themes, browser-stored data, and app settings
- Read release notes, the Help Center, and the info/legal documents, all rendered from `packages/shared`
- Reach the `/download` page, which offers the desktop installers and the Android APK with their file names, sizes, requirements and caveats — the visitor-facing view of the same shared data the mobile app renders (build-from-source steps stay in this README and `docs/DOWNLOADS.md`)

The home screen also calls out the current browser-first operating mode explicitly: no backend or local API server is involved.

## Mobile App

The mobile app lives in `packages/mobile` and runs through Expo. It is local-first and uses the same shared generation, draft, import/export, and template utilities as the PC workspace.

Start it with:

```bash
pnpm dev:mobile
```

Platform shortcuts:

```bash
pnpm dev:mobile:android
pnpm dev:mobile:ios
pnpm typecheck:mobile
pnpm lint:mobile
```

Notes:

- The current mobile flow stores drafts, templates, blueprint overrides, settings, and keys locally on-device.
- Use the mobile Settings screen to import a workspace bundle exported from the PC app or browser workspace when you want to mirror data across devices, or pair with the desktop companion for LAN transfer.
- Generation talks directly to the configured provider from the device; mobile has no backend dependency.
- Parity status against the web app — what already matches, what is missing, and the recommended order — is scoped in [`docs/MOBILE_PARITY.md`](docs/MOBILE_PARITY.md). Tiers 1 and 2 are complete: release notes, help, themes, and info/legal content all render from shared modules, so the mobile app — every screen — retints live from the selected theme and shows the same guidance, help center, and legal documents as the browser. Tier 3 (worlds, factions, locations, timelines) is closed by decision rather than pending — mobile worldbuilding is desktop-only, recorded in [`docs/WORLDBUILDING_DECISION.md`](docs/WORLDBUILDING_DECISION.md).

## Desktop App

The desktop build wraps the web app with Tauri:

```bash
pnpm dev:desktop
pnpm build:desktop
```

Requirements: Rust toolchain and the platform WebView prerequisites for [Tauri v2](https://v2.tauri.app/start/prerequisites/).

Notes:

- Desktop drafts and lore are stored in the app data directory through the Tauri SQL/FS plugins.
- The desktop app can start a LAN companion endpoint (`packages/web/src-tauri/src/companion.rs`) that paired mobile devices use for direct workspace transfer.

## Quick Start

Requirements:

- Node.js 20+
- pnpm 10+ (the repo pins `pnpm@10.33.0`)

Install and run the web app:

```bash
pnpm install
pnpm dev:web
```

Vite will print the local URL in the terminal. By default that is usually `http://localhost:5173`.

To expose the app on your local network:

```bash
pnpm dev:web:lan
```

That launches Vite on port `3000` with host `0.0.0.0`.

To run the mobile app through Expo:

```bash
pnpm dev:mobile
```

## Docker Web Stack

If you want the web app instances to appear in Docker Desktop, use the dedicated web compose file:

```bash
pnpm docker:web
```

That starts:

- `eidolon-web`: Vite preview on port `3000`
- `eidolon-web-dev`: Vite dev server on port `3100`

To stop both containers:

```bash
pnpm docker:web:down
```

## Build Pipeline

`pnpm build` runs the targets in dependency order and then verifies the result:

```text
build:shared  ->  web  ->  desktop  ->  mobile  ->  build:verify
```

- **`build:shared` runs first** in the top-level pipeline, and each consumer rebuilds it defensively (`packages/web`'s `build` script, and the mobile package's `prepare:android:release` hook). Shared builds in ~50 ms, so the belt-and-braces approach costs nothing and removes a whole class of confusing failures: every target imports `@char-gen/shared` from `packages/shared/dist`, so a stale `dist` shows up as "module has no exported member" rather than an obvious error.
- **Each `build:<target>` script is self-sufficient**, so running one directly works. The `build:<target>:only` variants skip the top-level prerequisite for when the pipeline already built it.
- **The desktop step bundles the web app** through Tauri's `beforeBuildCommand`, so it needs a fresh `packages/web/dist`; shared must exist before it starts.
- **The mobile step regenerates bundled content first** (`packages/mobile/src/generated/local-content.ts` from `blueprints/`) via the package's `prepare:android:release` hook, then runs Gradle.
- **`build:verify` closes the pipeline.** It asserts the shared bundle and declarations, the web `dist` (including that everything in `public/downloads/` survived the copy), an installer for the current version under the Tauri bundle, and the release APK — failing with the exact missing path instead of leaving a silent no-op.

`pnpm content:check` and `pnpm info:docs:check` guard the generated sources those builds depend on, so a stale generation step fails CI rather than shipping.

## Common Commands

```bash
# Start all configured dev tasks through Turbo
pnpm dev

# Build the shared package only (every other target depends on it)
pnpm build:shared

# Build the web app: builds shared first, then Vite
pnpm build:web

# Build the desktop app (Tauri): builds shared, then bundles for this platform
pnpm build:desktop

# Build the Android APK: builds shared, regenerates mobile content, then Gradle
pnpm build:mobile

# Everything, in dependency order, then verify the artifacts
pnpm build

# Verify artifacts without rebuilding (add --target to check one target)
pnpm build:verify
pnpm build:verify --target web

# Typecheck the web app
pnpm typecheck:web

# Typecheck the mobile app
pnpm typecheck:mobile

# Run the web test suite
pnpm test:web

# Check the shared package test suite
pnpm --filter @char-gen/shared test

# Lint packages that participate in CI
pnpm lint

# Lint the mobile package directly
pnpm lint:mobile

# Format tracked source/docs globs (repo-wide rewrite)
pnpm format

# Verify formatting without writing (uses .prettierrc.json)
pnpm format:check
```

Notes:

- The current CI path runs release-notes parity, info-document parity, placeholder-wiring checks, formatting checks, lint, web/mobile typechecking, tests for all three packages, the shared/web build, and a web preview smoke test.
- Mobile native store/distribution builds stay outside the default CI path; mobile typecheck and lint do run.
- Every package has a Vitest suite: `pnpm test:web` (components, prompting, config, templates, character import, help and tours), `pnpm test:shared`, and `pnpm test:mobile` (logic only).
- Formatting is enforced in CI via `pnpm format:check`, and `.prettierignore` excludes build output plus generated native projects. `pnpm format` rewrites every matching file in `packages/`, so prefer scoping it to the files you touched (`pnpm exec prettier --write <paths>`).
- `pnpm check:placeholders` fails when a `*Placeholder` component exists without being imported anywhere. Deliberate staging must be added to the allowlist in `tools/generation/check-placeholders.mjs`.
- Lint runs through Turbo across `shared`, `web`, and `mobile` with shared ignore rules: Tauri build output (`src-tauri/target`, `src-tauri/gen`) is excluded, and `_`-prefixed bindings are treated as intentionally unused.

## Generation Model

The generation system is template-driven.

- Canonical system prompts and orchestrators live in `blueprints/system/`.
- Built-in runtime templates live in `blueprints/templates/` and declare asset order with `depends_on` in `template.toml`.
- Shared parsing utilities map fenced codeblocks back into asset files and run fatal contract checks for placeholders and format violations.
- The browser Seed Generator now uses the canonical seed-generation blueprint in `blueprints/system/seed_generator.md`.
- The default built-in template is the six-asset V2/V3 flow. Aksho reference files currently live under `dev/official_aksho/` rather than the runtime template catalog.

If you are editing blueprints, start with `rules/60_blueprint_hard_rules.md` and `blueprints/README.md`.

## Exports, Presets, and Themes

- The browser app currently exposes built-in export modes for JSON, PNG character cards, plain text, combined markdown bundles, and printable PDF.
- The `presets/` directory stores TOML preset definitions for raw packs and platform-oriented exports (`raw.toml`, `chubai.toml`, `risuai.toml`, `tavernai.toml`, `openrouter.toml`).
- Theme and resource files tracked in `resources/` are repository assets; the current browser runtime uses built-in theme presets defined in code plus browser-stored customizations.
- `docs/index.html` is the static project home page kept in the repo for hosting the project overview. It is not built or published by CI, so it only appears wherever that directory is served from.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

[Eidolon Simulacra Personal Use License v1.0](LICENSE)
