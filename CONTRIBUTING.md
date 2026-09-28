# Contributing to Eidolon Simulacra

Eidolon Simulacra currently ships as a TypeScript monorepo with a browser-first web app (plus its Tauri desktop build), an Expo mobile app, and shared generation utilities. Keep changes narrow, verifiable, and aligned with the current repo shape rather than older Python or desktop workflows.

## Setup

Requirements:

- Node.js 20+
- pnpm 10+ (the repo pins `pnpm@10.33.0`)

Install dependencies:

```bash
pnpm install
```

Common local commands:

```bash
# web app
pnpm dev:web

# mobile app
pnpm dev:mobile

# shared package build
pnpm build:shared

# web production build
pnpm build:web

# web typecheck
pnpm typecheck:web

# mobile typecheck
pnpm typecheck:mobile

# web tests
pnpm test:web

# repo lint
pnpm lint

# mobile lint
pnpm lint:mobile

# formatting
pnpm format
```

There is no checked-in Python backend or Textual launcher in the current workspace, and no backend package at all: the Tauri desktop shell lives in `packages/web/src-tauri`, so docs should describe that where relevant instead of denying its existence.

## Validation

Run the smallest relevant checks for the area you changed.

Useful commands:

```bash
pnpm --filter @char-gen/shared build
pnpm --filter @char-gen/web build
pnpm --filter @char-gen/mobile typecheck
pnpm --filter @char-gen/mobile lint
pnpm typecheck:web
pnpm test:web
pnpm test:shared
pnpm test:mobile
pnpm check:placeholders
pnpm lint
```

Notes:

- CI covers release-notes parity, the placeholder-wiring check, formatting, lint, web/mobile typechecking, tests for shared/web/mobile, the shared/web build path, and a preview smoke test.
- `@char-gen/shared` publishes from `dist/`, so rebuild it before validating web changes that depend on updated shared exports.
- The root Turbo pipeline includes `test` and `lint` tasks; `lint` covers `shared`, `web`, and `mobile`.
- Each package owns its own suite: `pnpm test:web`, `pnpm test:shared`, and `pnpm test:mobile` (logic only, no native modules).
- Web tests run under happy-dom with `fake-indexeddb` loaded from `packages/web/src/test/setup.ts`. Importing `@/lib/api` for real is supported and preferred over mocking it; the Dexie-backed draft store only works because of that polyfill.
- When a test touches config or API keys, call `configManager.clearAll()` in `beforeEach` as well as clearing storage. `configManager` caches in memory, so `localStorage.clear()` alone leaks keys between tests — and a leaked key makes `api.testConnection` issue a real request to the provider.
- `packages/mobile` has dedicated Expo and validation commands, but native release builds and store distribution stay outside CI. Type and lint coverage comes from `pnpm typecheck:mobile` and `pnpm lint:mobile`.
- Lint uses shared ignore rules at the repo root: Tauri build output (`src-tauri/target`, `src-tauri/gen`) is excluded, and `_`-prefixed bindings are treated as intentionally unused.
- Formatting is enforced in CI via `pnpm format:check`, with build output and generated native projects excluded through `.prettierignore`. `.prettierrc.json` defines the project style; prefer `pnpm exec prettier --write <paths>` over the repo-wide `pnpm format`.
- `pnpm check:placeholders` fails CI when a `*Placeholder` component is not imported anywhere. Wire it into a screen or delete it; only add to the allowlist in `tools/generation/check-placeholders.mjs` when the staging is deliberate.

## Change Guidelines

### TypeScript and React

- Preserve package boundaries between `packages/shared`, `packages/web`, and `packages/mobile`.
- Keep shared types, parsing helpers, export logic, and cross-surface contracts in `packages/shared` when possible.
- The LLM engine layer belongs to `packages/shared`. `packages/web/src/lib/llm/*` are thin re-export shims kept only so existing import paths keep working — put engine changes in `packages/shared/src/llm/` and cover them with the tests there.
- Do not document backend or API-server behavior: there is no server package in this repo.

### Documentation

- Update docs whenever commands, defaults, workflows, storage behavior, or blueprint contracts change.
- Prefer describing the current shipping path over historical or aspirational architecture.
- If a feature is only partially wired into CI or release automation, say that directly.

### Blueprints and Templates

- Do not break the generation contract.
- Keep asset formats asset-specific.
- Respect dependency order between assets.
- Do not move downstream facts into upstream assets.
- Keep placeholder and control-block requirements explicit.

Relevant locations:

- `blueprints/system/` for canonical system blueprints, including orchestrators and the seed generator
- `blueprints/templates/` for template manifests and any truly template-specific blueprint files
- `rules/` for repo constraints and workflow guidance
- `presets/` for export preset definitions

## Pull Requests

Before opening a PR:

1. Run the smallest relevant validation set and note what you ran.
2. Update docs for user-visible behavior, commands, or workflow changes.
3. Call out blueprint/template contract changes explicitly.
4. Keep titles and commits focused.

Preferred commit prefixes: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`.

## Good Contribution Targets

- stale documentation and broken command references
- web/shared contract drift
- template, blueprint, parser, or export regressions
- validation and placeholder edge cases
- mobile integration work that is clearly scoped

## Questions

If a change affects blueprint validity, export compatibility, or parser expectations, document the assumption in the PR instead of guessing.
