# Blueprints

This directory contains the system blueprints, runtime template manifests, and example blueprints used by the current browser template system.

## Layout

```text
blueprints/
├── system/                    # Canonical system blueprints
│   ├── generator.md
│   ├── offspring_generator.md
│   ├── seed_generator.md
│   ├── system_prompt.md
│   ├── post_history.md
│   ├── character_sheet.md
│   ├── intro_scene.md
│   ├── intro_page.md
│   └── a1111.md
├── templates/                 # Template manifests
│   ├── official_v2v3/
│   │   └── template.toml
└── examples/                  # Alternate/example blueprints
```

The built-in V2/V3 asset blueprints live under `blueprints/system/` alongside the orchestrators.

Template manifests reference these canonical system paths instead of maintaining template-local copies.

The browser Seed Generator also uses `blueprints/system/seed_generator.md` as its canonical runtime prompt.

## Built-in Runtime Templates

The checked-in runtime template catalog currently carries one built-in template family under `blueprints/templates/`.

### V2/V3 Card

This remains the default built-in template used by the browser generation flow. Its asset set is:

1. `system_prompt`
2. `post_history`
3. `character_sheet`
4. `intro_scene`
5. `intro_page`
6. `a1111`

`suno` is not part of the current official default.

## Related Reference Material

The repo also contains Aksho reference material under `dev/official_aksho/`.

- That folder includes its own `template.toml` plus template-local asset blueprints.
- It is useful for reference or future integration work.
- It is not the current built-in browser template manifest loaded from `blueprints/templates/`.

## Template Manifests

Each template directory under `blueprints/templates/` contains a `template.toml` manifest describing:

- template name and version
- asset names
- dependency order via `depends_on`
- blueprint file paths for each asset

The built-in runtime template currently lives under `blueprints/templates/official_v2v3/`.

## Resolution Order

When a template references blueprint files, resolution happens in this order:

1. Template-local path declared in `template.toml`
2. Relative path from the template directory
3. Another blueprint under `blueprints/`
4. Example blueprint under `blueprints/examples/`

The seed generation workflow note at `rules/workflows/seed-gen-list.md` is operator guidance, not the runtime prompt source.

Current starter examples under `blueprints/examples/` include:

- `generic_system_prompt.md`
- `generic_post_history.md`
- `generic_character_sheet.md`
- `generic_intro_scene.md`
- `generic_intro_page.md`
- `generic_initial_message.md`
- `a1111_sdxl_comfyui.md`

## Editing Rules

- Keep formats asset-specific; do not normalize different asset outputs into one house style
- Respect the dependency chain; downstream assets should not introduce facts upstream assets would need
- Replace placeholders in generated output, but keep placeholder syntax inside blueprint source when the blueprint expects substitution later
- Treat the orchestrator and template manifests as part of the generation contract
- Check `rules/60_blueprint_hard_rules.md` before changing official blueprint formats
- The browser app is currently client-side, but the blueprint contract still needs to stay strict because shared parsing and validation code depends on it
- If you are editing Aksho reference files under `dev/official_aksho/`, do not describe them as active built-in runtime assets unless the implementation is wired up first

## Adding a Template

1. Create `blueprints/templates/<template_name>/template.toml`
2. Declare assets and `depends_on` edges explicitly
3. Point each asset at the appropriate blueprint file, typically under `blueprints/system/` unless the template needs a template-specific file
4. Keep filenames and output formats aligned with the validator and export flow
