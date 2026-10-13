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
│   ├── creator_notes.md
│   ├── intro_page.md          # Legacy alias retained for compatibility
│   └── a1111.md
├── templates/                 # One directory per family: template.toml + assets/
│   ├── alien_rpg/             # Alien RPG
│   ├── avatar_legends/        # Avatar Legends
│   ├── call_of_cthulhu_7e/    # Call of Cthulhu 7e
│   ├── changeling_the_dreaming/ # Changeling: The Dreaming 20th
│   ├── cosmere/               # Cosmere
│   ├── cyberpunk_red/         # Cyberpunk RED
│   ├── dnd2024/               # D&D 2024
│   ├── dnd5e/                 # D&D 5e
│   ├── dragon_age/            # Dragon Age RPG
│   ├── fate_core/             # Fate Core
│   ├── gurps/                 # GURPS 4e
│   ├── hunter_the_reckoning/  # Hunter: The Reckoning 5e
│   ├── imperium_maledictum/   # Imperium Maledictum
│   ├── mage_the_ascension/    # Mage: The Ascension 20th
│   ├── official_v2v3/         # V2/V3 Card (the default)
│   ├── pathfinder1e/          # Pathfinder 1e
│   ├── pathfinder2e/          # Pathfinder 2e
│   ├── shadowrun5e/           # Shadowrun 5e
│   ├── shadowrun6e/           # Shadowrun 6e
│   ├── side_characters/       # Side Characters
│   ├── tales_from_the_loop/   # Tales from the Loop
│   ├── vampire_the_masquerade_5e/ # Vampire: The Masquerade 5e
│   ├── warhammer_fantasy_roleplay/ # Warhammer Fantasy Roleplay 4e
│   ├── werewolf_the_apocalypse/ # Werewolf: The Apocalypse 5e
│   ├── wrath_and_glory/       # Wrath & Glory
│   └── wraith_the_oblivion/   # Wraith: The Oblivion 20th
└── examples/                  # Alternate/example blueprints
```

The built-in V2/V3 asset blueprints live under `blueprints/system/` alongside the orchestrators.

Template manifests reference these canonical system paths instead of maintaining template-local copies, unless a template genuinely needs template-specific assets (e.g. the D&D 5e stat block). Template-local blueprints live in the template directory and are declared with repo-relative paths so both surfaces resolve them.

The browser Seed Generator also uses `blueprints/system/seed_generator.md` as its canonical runtime prompt.

## Built-in Runtime Templates

The checked-in runtime template catalog currently carries twenty-six built-in template families under `blueprints/templates/`. Each family directory holds a `template.toml` manifest plus an `assets/` folder of template-local blueprints (the `official_v2v3` family has no `assets/` folder because it points straight at `blueprints/system/`).

### V2/V3 Card

This remains the default built-in template used by the browser generation flow. Its asset set is:

1. `system_prompt`
2. `post_history`
3. `character_sheet`
4. `intro_scene`
5. `creator_notes`
6. `a1111`

`suno` is not part of the current official default.

### D&D 2024

The D&D 2024 revised rules (often called 5.5e), with template-local asset blueprints. Its asset set is:

1. `dnd_character_sheet`
2. `dnd_stat_block`
3. `dnd_backstory`
4. `dnd_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `dnd_*` blueprints live under `blueprints/templates/dnd2024/assets/`. The stat block applies the 2024 deltas: Origin as species plus background, ability increases from the background rather than the species, an Origin feat, subclasses at level 3, Weapon Mastery properties, and the cumulative 1-6 level Exhaustion.

### D&D 5e

Dungeons & Dragons 5th edition, with template-local asset blueprints. Its asset set is:

1. `dnd_character_sheet`
2. `dnd_stat_block`
3. `dnd_backstory`
4. `dnd_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `dnd_*` blueprints live under `blueprints/templates/dnd5e/assets/` because they are edition-specific, while `a1111` is shared with the default family.

### Pathfinder 1e

Pathfinder First Edition, with template-local asset blueprints. Its asset set is:

1. `pf_character_sheet`
2. `pf_stat_block`
3. `pf_backstory`
4. `pf_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `pf_*` blueprints live under `blueprints/templates/pathfinder1e/assets/`. The stat block is derived with First Edition rules: Base Attack Bonus by class progression, caster-level spells, CMB and CMD, touch and flat-footed Armor Class, class-and-level base saves, and skill ranks capped at the character's level.

### Pathfinder 2e

Pathfinder Second Edition (Remaster terminology), with template-local asset blueprints. Its asset set is:

1. `pf_character_sheet`
2. `pf_stat_block`
3. `pf_backstory`
4. `pf_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `pf_*` blueprints live under `blueprints/templates/pathfinder2e/assets/`. The stat block is derived with Second Edition proficiency ranks (Untrained +0 through Legendary = level + 8).

### Call of Cthulhu 7e

Call of Cthulhu 7th Edition, with template-local asset blueprints. Its asset set is:

1. `coc_character_sheet`
2. `coc_stat_block`
3. `coc_backstory`
4. `coc_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `coc_*` blueprints live under `blueprints/templates/call_of_cthulhu_7e/assets/`. The stat block is percentile-based: Hit Points from `(CON + SIZ) / 10`, Magic Points from `POW / 5`, Sanity starting at POW, Luck, Move, and Damage Bonus and Build from the combined STR + SIZ band, with the 7th Edition age modifiers applied.

### Cyberpunk RED

Cyberpunk RED, with template-local asset blueprints. Its asset set is:

1. `cpr_character_sheet`
2. `cpr_stat_block`
3. `cpr_backstory`
4. `cpr_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `cpr_*` blueprints live under `blueprints/templates/cyberpunk_red/assets/`. The stat block derives Hit Points from `10 + 5 x half of (BODY + WILL)`, Humanity from `10 x EMP` against each implant's Humanity Loss, Stopping Power armour per location with ablation, and a Role Ability ranked 1-10.

### Cosmere

Brandon Sanderson's Cosmere, grounded in established canon, with template-local asset blueprints. Its asset set is:

1. `cosmere_character_sheet`
2. `cosmere_investiture`
3. `cosmere_backstory`
4. `cosmere_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `cosmere_*` blueprints live under `blueprints/templates/cosmere/assets/`. The `cosmere_investiture` asset carries the canon magic systems (Allomancy, Feruchemy, Surgebinding, Awakening, AonDor, and so on) with explicit costs and limits, and every Cosmere blueprint forbids inventing new Shards, planets, or magic systems.

### Shadowrun 5e

Shadowrun Fifth Edition, with template-local asset blueprints. Its asset set is:

1. `sr_character_sheet`
2. `sr_stat_block`
3. `sr_backstory`
4. `sr_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `sr_*` blueprints live under `blueprints/templates/shadowrun5e/assets/`. The stat block restores the Fifth Edition rules: Physical, Mental, and Social Limits that cap hits, weapon Accuracy as an attack Limit, Armour Piercing applied to the damage resistance test, and Edge as a point pool rather than the Sixth Edition Edge-gain system.

### Shadowrun 6e

Shadowrun Sixth Edition, with template-local asset blueprints. Its asset set is:

1. `sr_character_sheet`
2. `sr_stat_block`
3. `sr_backstory`
4. `sr_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `sr_*` blueprints live under `blueprints/templates/shadowrun6e/assets/`. The stat block is derived with Sixth Edition rules: dice pools as skill + linked attribute counted on 5s and 6s, Initiative Score as Reaction + Intuition plus Initiative Dice, condition monitors from Body and Willpower, Defense Rating versus Attack Rating for Edge, and Essence spent on augmentations.

### Vampire: The Masquerade 5e

Vampire: The Masquerade 5th Edition, with template-local asset blueprints. Its asset set is:

1. `vtm_character_sheet`
2. `vtm_stat_block`
3. `vtm_backstory`
4. `vtm_intro_scene`
5. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `vtm_*` blueprints live under `blueprints/templates/vampire_the_masquerade_5e/assets/`. The stat block derives Health from `Stamina + 3`, Willpower from `Composure + Resolve`, and tracks Hunger on a 0-5 scale, Humanity on 0-10, and Blood Potency against Generation, with every test rolled as Attribute + Skill in d10s.

### Side Characters

A lean supporting-cast family for NPCs that only need to carry a scene: a shopkeeper, a rival, a patron. Its asset set is:

1. `npc_profile`
2. `npc_voice`
3. `npc_scene_hook`
4. `a1111` (optional; reuses the canonical `blueprints/system/a1111.md`)

The `npc_*` blueprints live under `blueprints/templates/side_characters/assets/`. This family is deliberately short — no stat block and no full backstory — to contrast with the heavier D&D 5e flow.

### Fate Core

Aspect-driven narrative play — `fate_character_sheet`, `fate_stat_block`, `fate_backstory`, `fate_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/fate_core/assets/`.

### GURPS 4e

Generic point-based play — `gurps_character_sheet`, `gurps_stat_block`, `gurps_backstory`, `gurps_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/gurps/assets/`.

### Avatar Legends

Powered by the Apocalypse in the Avatar world — `avatar_character_sheet`, `avatar_stat_block`, `avatar_backstory`, `avatar_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/avatar_legends/assets/`.

### Alien RPG

Free League survival horror — `alien_character_sheet`, `alien_stat_block`, `alien_backstory`, `alien_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/alien_rpg/assets/`.

### Warhammer Fantasy Roleplay 4e

d100 grim fantasy in the Old World — `wfrp_character_sheet`, `wfrp_stat_block`, `wfrp_backstory`, `wfrp_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/warhammer_fantasy_roleplay/assets/`.

### Wrath & Glory

d6-pool 40,000 action — `wg_character_sheet`, `wg_stat_block`, `wg_backstory`, `wg_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/wrath_and_glory/assets/`.

### Imperium Maledictum

d100 40,000 investigation — `im_character_sheet`, `im_stat_block`, `im_backstory`, `im_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/imperium_maledictum/assets/`.

### Tales from the Loop

1980s kids and the Loop — `tftl_character_sheet`, `tftl_stat_block`, `tftl_backstory`, `tftl_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/tales_from_the_loop/assets/`.

### Dragon Age RPG

AGE-system Thedas — `da_character_sheet`, `da_stat_block`, `da_backstory`, `da_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/dragon_age/assets/`.

### Werewolf: The Apocalypse 5e

Rage, Renown, and the Garou Nation — `wta_character_sheet`, `wta_stat_block`, `wta_backstory`, `wta_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/werewolf_the_apocalypse/assets/`.

### Hunter: The Reckoning 5e

Ordinary people who fight the supernatural — `htr_character_sheet`, `htr_stat_block`, `htr_backstory`, `htr_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/hunter_the_reckoning/assets/`.

### Mage: The Ascension 20th

Arete, Spheres, and Paradox — `mta_character_sheet`, `mta_stat_block`, `mta_backstory`, `mta_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/mage_the_ascension/assets/`.

### Wraith: The Oblivion 20th

Arcanoi, Pathos, and the Shadow — `wto_character_sheet`, `wto_stat_block`, `wto_backstory`, `wto_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/wraith_the_oblivion/assets/`.

### Changeling: The Dreaming 20th

Arts, Realms, and Banality — `ctd_character_sheet`, `ctd_stat_block`, `ctd_backstory`, `ctd_intro_scene`, optional `a1111`. Blueprints live under `blueprints/templates/changeling_the_dreaming/assets/`.

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
- `generic_creator_notes.md`
- `generic_intro_page.md` (legacy alias)
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
5. Run `pnpm content:generate` and commit the regenerated `packages/mobile/src/generated/local-content.ts`, or CI's `content:check` fails
