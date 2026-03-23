# Blueprints

This directory contains the official orchestrators, template manifests, template-local asset blueprints, and example blueprints used by the current template system.

## Layout

```text
blueprints/
├── system/                    # Orchestrator blueprints
│   ├── generator.md
│   └── offspring_generator.md
├── templates/                 # Template manifests and template-local blueprints
│   ├── official_v2v3/
│   │   ├── template.toml
│   │   └── assets/
└── examples/                  # Alternate/example blueprints
```

Official asset blueprints now live under their template directories, for example:

- `blueprints/templates/official_v2v3/assets/`
- `blueprints/system/` for orchestrators like `generator.md`

## Official Templates

The repo currently carries one official template family.

### V2/V3 Card

This remains the default official template used by the browser generation flow. Its asset set is:

1. `system_prompt`
2. `post_history`
3. `character_sheet`
4. `intro_scene`
5. `intro_page`
6. `a1111`

`suno` is not part of the current official default.

## Template Manifests

Each template directory under `blueprints/templates/` contains a `template.toml` manifest describing:

- template name and version
- asset names
- dependency order via `depends_on`
- template-local blueprint files

The built-in template currently lives under `blueprints/templates/official_v2v3/`.

## Resolution Order

When a template references blueprint files, resolution happens in this order:

1. Template-local path declared in `template.toml`
2. Relative path from the template directory
3. Another blueprint under `blueprints/`
4. Example blueprint under `blueprints/examples/`

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

## Adding a Template

1. Create `blueprints/templates/<template_name>/template.toml`
2. Declare assets and `depends_on` edges explicitly
3. Add template-local blueprint files under `blueprints/templates/<template_name>/assets/`
4. Keep filenames and output formats aligned with the validator and export flow
