# Character Generator

Character Generator is a modern web application for generating RPG characters. It uses a client-side architecture with direct LLM provider integrations, supporting multiple character templates and asset sets.

## Current State

- Official default template: `V2/V3 Card`
- Official shared asset set: `system_prompt`, `post_history`, `character_sheet`, `intro_scene`, `intro_page`, `a1111`
- Template-aware generation from a single seed
- Local storage using IndexedDB
- Direct API calls to LLM providers (no backend required)

## Quick Start

### Web App

```bash
pnpm install
pnpm dev:web
```

Open `http://localhost:3000`.

To expose the web app on your local network:

```bash
pnpm dev:web:lan
```

Then open `http://<your-machine-ip>:3000` from another device on the same network.

## Core Capabilities

- Template-aware generation from a single seed
- Draft review, editing, validation, and export
- Generation, offspring, chat refinement workflows
- Preset-based export for raw and combined outputs
- Similarity analysis and redundancy detection
- Local search and indexing
- Multiple LLM provider support

## Architecture

```text
character-generator/
├── packages/
│   ├── shared/          # Shared TypeScript types and utilities
│   └── web/             # React + Vite app
└── docs/                # Project documentation
```

## Building

```bash
# Build shared package
pnpm build:shared

# Build web app
pnpm build:web

# Build all
pnpm build
```

## Testing & Linting

```bash
# Lint all packages
pnpm lint

# Type check
pnpm --filter @char-gen/web exec tsc --noEmit

# Format code
pnpm format
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md).

## License

[BSD 3-Clause License](LICENSE)
