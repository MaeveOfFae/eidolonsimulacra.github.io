# Quick Start

This is the fastest path to a working Character Generator environment.

## Recommended Setup

```bash
pnpm install

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
```

## Start the App

### Web + API

```bash
# terminal 1
python -m uvicorn bpui.api.main:app --reload

# terminal 2
pnpm dev:web
```

Open `http://localhost:3000`.

### LAN Access

```bash
./run_lan.sh
```

Open `http://<your-machine-ip>:3000` from another device on the same network. API docs stay available on `http://<your-machine-ip>:8000/docs`.

If you need different ports, override them before launching:

```bash
CHAR_GEN_WEB_PORT=3001 CHAR_GEN_API_PORT=8001 ./run_lan.sh
```

### Desktop App

```bash
./run_desktop.sh
```

On Windows use `run_desktop.bat`.

The desktop shell stays local to the machine running it. Use the LAN launcher if you want browser access from another device.

### Python Interfaces

```bash
# legacy Qt GUI
./run_bpui.sh

# Textual TUI
./run_bpui.sh tui

# CLI
bpui --help
```

## First Useful Commands

```bash
# compile a draft
bpui compile --seed "Noir detective with psychic abilities" --mode SFW

# batch compile
bpui batch --input seeds.txt --continue-on-error

# generate seeds
bpui seed-gen --input genres.txt --out seed-output/noir.txt

# validate a draft
bpui validate drafts/20260307_203638_unnamed_character

# export using a preset
bpui export "Character Name" drafts/20260307_203638_unnamed_character --preset raw

# similarity / lineage
bpui similarity draft_a draft_b --use-llm
bpui lineage
```

## Minimal Config

Create `.bpui.toml` or save settings through the app:

```toml
engine = "openai_compatible"
model = "openrouter/openai/gpt-4o-mini"
base_url = "https://openrouter.ai/api/v1"
temperature = 0.7
max_tokens = 4096

[api_keys]
openrouter = "sk-or-v1-..."
```

For local OpenAI-compatible servers such as Ollama or LM Studio, set `base_url` to the local endpoint and use the local model name.

## What to Expect

- The official default template is `V2/V3 Card`
- The official asset set is six assets: `system_prompt`, `post_history`, `character_sheet`, `intro_scene`, `intro_page`, `a1111`
- Drafts are saved under `drafts/`
- Exports are preset-based and template-aware
- Desktop export opens a native save dialog

## Where to Go Next

- [../installation/INSTALL.md](../installation/INSTALL.md): full install and platform notes
- [../../bpui/README.md](../../bpui/README.md): Python CLI/TUI/GUI details
- [../../blueprints/README.md](../../blueprints/README.md): blueprint and template layout
