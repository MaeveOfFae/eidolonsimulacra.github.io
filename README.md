# Eidolon Simulacra

Eidolon Simulacra is a pnpm monorepo for template-aware character generation. The current product surface is a browser-first React app backed by shared TypeScript generation, parsing, export, and template utilities.

The repo is centered on a strict blueprint contract: start from one seed, generate assets in dependency order, keep asset formats module-specific, and do not leak downstream facts upstream.

## Current State

- Browser-only workflow for day-to-day use. Drafts, templates, blueprint edits, and theme choices stay in browser storage.
- Direct LLM provider integration from the client via the shared engine layer.
- One built-in runtime template is currently loaded from `blueprints/templates/`:
  - `V2/V3 Card` with `system_prompt`, `post_history`, `character_sheet`, `intro_scene`, `intro_page`, and `a1111`
- Aksho reference material is checked in under `dev/official_aksho/`, but it is not currently loaded as a built-in browser template manifest.
- Shared parser and validator utilities for fenced-codeblock generation output.
- Export helpers and preset definitions for raw asset packs and platform-specific formats.
- Rule and workflow documentation under `rules/` for generation constraints, content modes, and blueprint hygiene.

## Workspace Layout

```text
eidolon-simulacra/
├── blueprints/          # System blueprints, template manifests, and examples
├── dev/                 # Reference and in-progress template material
├── packages/
│   ├── shared/          # Shared TS types, generation, parsing, export, template utilities
│   ├── web/             # React 19 + Vite browser app
│   └── mobile/          # Early mobile scaffold, not part of the current build/lint flow
├── presets/             # Export preset definitions
├── resources/           # Theme/resource files tracked in the repo
├── rules/               # Generation contract, content rules, and workflow docs
└── tools/               # Supporting docs and generation notes
```

## Web App

The web app currently exposes the main workflows directly in the browser:

- Generate from a seed with template selection and content mode controls
- Generate seed ideas and carry them into the main generation flow
- Review, edit, validate, compare, and export drafts
- Browse and edit templates and blueprint source
- Run offspring and similarity workflows
- Manage themes, browser-stored data, and app settings

The home screen also calls out the current operating mode explicitly: browser-only, no local API server required for normal usage.

## Optional Docker API Stack

If you want the sync API on Windows 11 with Docker Desktop, the default Compose stack now runs:

- `eidolon`: the Node API server and PostgreSQL in the same container
- `caddy`: reverse proxy and TLS termination in its own container

Quick start:

```bash
Copy-Item .env.docker.example .env
docker compose --env-file .env up -d --build
```

Notes:

- Set `DB_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `ENCRYPTION_KEY` before first boot.
- Set `CORS_ORIGIN` to your web app origin and `EIDOLON_DOMAIN` to the API hostname Caddy should serve.
- The API is still reachable directly on `http://localhost:3001`, while Caddy serves it on ports `80` and `443`.
- PostgreSQL data persists in the named Docker volume `postgres_data`.

## Quick Start

Requirements:

- Node.js 20+
- pnpm 9+

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

## Common Commands

```bash
# Start all configured dev tasks through Turbo
pnpm dev

# Build shared package only
pnpm build:shared

# Build the web app and its shared dependency
pnpm build:web

# Typecheck the web app
pnpm typecheck:web

# Run the web test suite
pnpm test:web

# Build the current workspace graph
pnpm build

# Lint packages that participate in CI
pnpm lint

# Format tracked source/docs globs
pnpm format
```

Notes:

- The current CI path runs release-notes parity, lint, web typechecking, web tests, the shared/web build, and a web preview smoke test.
- `packages/mobile` exists in the workspace, but it is not wired into the root build or lint tasks yet.
- The web package now includes a Vitest harness that covers the in-app help and guide system; run it with `pnpm test:web`.

## Generation Model

The generation system is template-driven.

- Canonical system prompts and orchestrators live in `blueprints/system/`.
- Built-in runtime templates live in `blueprints/templates/` and declare asset order with `depends_on` in `template.toml`.
- Shared parsing utilities map fenced codeblocks back into asset files and run fatal contract checks for placeholders and format violations.
- The browser Seed Generator now uses the canonical seed-generation blueprint in `blueprints/system/seed_generator.md`.
- The default built-in template is the six-asset V2/V3 flow. Aksho reference files currently live under `dev/official_aksho/` rather than the runtime template catalog.

If you are editing blueprints, start with `rules/60_blueprint_hard_rules.md` and `blueprints/README.md`.

## Exports, Presets, and Themes

- The browser app currently exposes built-in export modes for JSON, plain text, and combined markdown bundles.
- The `presets/` directory stores TOML preset definitions for raw packs and platform-oriented exports such as Chub AI, RisuAI, and TavernAI.
- Theme and resource files tracked in `resources/` are repository assets; the current browser runtime uses built-in theme presets defined in code plus browser-stored customizations.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

[Eidolon Simulacra Personal Use License v1.0](LICENSE)
