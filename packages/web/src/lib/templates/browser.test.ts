import { beforeEach, describe, expect, it } from 'vitest';
import { getOrderedAssets } from '@char-gen/shared';
import { getAllTemplateRecords, getStoredTemplates } from './browser';

describe('browser template storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('ignores malformed stored template payloads without breaking built-in templates', () => {
    window.localStorage.setItem('eidolon.web.templates.custom', JSON.stringify({ broken: true }));

    expect(() => getAllTemplateRecords()).not.toThrow();
    expect(getStoredTemplates()).toEqual([]);
    expect(getAllTemplateRecords().some((record) => record.template.name === 'V2/V3 Card')).toBe(true);
  });

  it('exposes the built-in D&D 5e template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'D&D 5e');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'dnd_character_sheet',
      'dnd_stat_block',
      'dnd_backstory',
      'dnd_intro_scene',
      'a1111',
    ]);

    // Template-local assets are declared with repo-relative paths and must hydrate
    // through the bundled blueprint catalog, exactly like canonical system assets.
    expect(record!.blueprint_contents['blueprints/templates/dnd5e/assets/dnd_stat_block.md']).toContain(
      'D&D Stat Block',
    );
    expect(record!.blueprint_contents['blueprints/system/a1111.md']).toContain('A1111 Tag Prompt Layout');

    // The dependency graph must place the identity sheet first and the scene last.
    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('dnd_character_sheet')).toBeLessThan(ordered.indexOf('dnd_stat_block'));
    expect(ordered.indexOf('dnd_stat_block')).toBeLessThan(ordered.indexOf('dnd_intro_scene'));
    expect(ordered.indexOf('dnd_backstory')).toBeLessThan(ordered.indexOf('dnd_intro_scene'));
  });

  it('exposes the built-in Side Characters template as a lean NPC family', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Side Characters');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'npc_profile',
      'npc_voice',
      'npc_scene_hook',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/side_characters/assets/npc_profile.md']).toContain(
      'Side Character Profile',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('npc_profile')).toBeLessThan(ordered.indexOf('npc_voice'));
    expect(ordered.indexOf('npc_voice')).toBeLessThan(ordered.indexOf('npc_scene_hook'));
  });

  it('exposes the built-in Pathfinder 2e template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Pathfinder 2e');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'pf_character_sheet',
      'pf_stat_block',
      'pf_backstory',
      'pf_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/pathfinder2e/assets/pf_stat_block.md']).toContain(
      'Pathfinder 2e Stat Block',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('pf_character_sheet')).toBeLessThan(ordered.indexOf('pf_stat_block'));
    expect(ordered.indexOf('pf_stat_block')).toBeLessThan(ordered.indexOf('pf_intro_scene'));
    expect(ordered.indexOf('pf_backstory')).toBeLessThan(ordered.indexOf('pf_intro_scene'));
  });

  it('exposes the built-in Cosmere template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Cosmere');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'cosmere_character_sheet',
      'cosmere_investiture',
      'cosmere_backstory',
      'cosmere_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/cosmere/assets/cosmere_investiture.md']).toContain(
      'Cosmere Investiture',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('cosmere_character_sheet')).toBeLessThan(ordered.indexOf('cosmere_investiture'));
    expect(ordered.indexOf('cosmere_investiture')).toBeLessThan(ordered.indexOf('cosmere_intro_scene'));
    expect(ordered.indexOf('cosmere_backstory')).toBeLessThan(ordered.indexOf('cosmere_intro_scene'));
  });

  it('exposes the built-in Shadowrun 6e template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Shadowrun 6e');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'sr_character_sheet',
      'sr_stat_block',
      'sr_backstory',
      'sr_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/shadowrun6e/assets/sr_stat_block.md']).toContain(
      'Shadowrun Stat Block',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('sr_character_sheet')).toBeLessThan(ordered.indexOf('sr_stat_block'));
    expect(ordered.indexOf('sr_stat_block')).toBeLessThan(ordered.indexOf('sr_intro_scene'));
    expect(ordered.indexOf('sr_backstory')).toBeLessThan(ordered.indexOf('sr_intro_scene'));
  });

  it('exposes the built-in D&D 2024 template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'D&D 2024');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'dnd_character_sheet',
      'dnd_stat_block',
      'dnd_backstory',
      'dnd_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/dnd2024/assets/dnd_stat_block.md']).toContain(
      'D&D 2024 Stat Block',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('dnd_character_sheet')).toBeLessThan(ordered.indexOf('dnd_stat_block'));
    expect(ordered.indexOf('dnd_stat_block')).toBeLessThan(ordered.indexOf('dnd_intro_scene'));
  });

  it('exposes the built-in Pathfinder 1e template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Pathfinder 1e');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'pf_character_sheet',
      'pf_stat_block',
      'pf_backstory',
      'pf_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/pathfinder1e/assets/pf_stat_block.md']).toContain(
      'Pathfinder 1e Stat Block',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('pf_character_sheet')).toBeLessThan(ordered.indexOf('pf_stat_block'));
    expect(ordered.indexOf('pf_stat_block')).toBeLessThan(ordered.indexOf('pf_intro_scene'));
  });

  it('exposes the built-in Shadowrun 5e template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Shadowrun 5e');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'sr_character_sheet',
      'sr_stat_block',
      'sr_backstory',
      'sr_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/shadowrun5e/assets/sr_stat_block.md']).toContain(
      'Shadowrun 5e Stat Block',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('sr_character_sheet')).toBeLessThan(ordered.indexOf('sr_stat_block'));
    expect(ordered.indexOf('sr_stat_block')).toBeLessThan(ordered.indexOf('sr_intro_scene'));
  });

  it('exposes the built-in Call of Cthulhu 7e template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Call of Cthulhu 7e');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'coc_character_sheet',
      'coc_stat_block',
      'coc_backstory',
      'coc_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/call_of_cthulhu_7e/assets/coc_stat_block.md']).toContain(
      'Call of Cthulhu Stat Block',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('coc_character_sheet')).toBeLessThan(ordered.indexOf('coc_stat_block'));
    expect(ordered.indexOf('coc_stat_block')).toBeLessThan(ordered.indexOf('coc_intro_scene'));
  });

  it('exposes the built-in Cyberpunk RED template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Cyberpunk RED');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'cpr_character_sheet',
      'cpr_stat_block',
      'cpr_backstory',
      'cpr_intro_scene',
      'a1111',
    ]);
    expect(record!.blueprint_contents['blueprints/templates/cyberpunk_red/assets/cpr_stat_block.md']).toContain(
      'Cyberpunk RED Stat Block',
    );

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('cpr_character_sheet')).toBeLessThan(ordered.indexOf('cpr_stat_block'));
    expect(ordered.indexOf('cpr_stat_block')).toBeLessThan(ordered.indexOf('cpr_intro_scene'));
  });

  it('exposes the built-in Vampire: The Masquerade 5e template with its template-local blueprints resolved', () => {
    const record = getAllTemplateRecords().find((entry) => entry.template.name === 'Vampire: The Masquerade 5e');

    expect(record).toBeTruthy();
    expect(record!.template.assets.map((asset) => asset.name)).toEqual([
      'vtm_character_sheet',
      'vtm_stat_block',
      'vtm_backstory',
      'vtm_intro_scene',
      'a1111',
    ]);
    expect(
      record!.blueprint_contents['blueprints/templates/vampire_the_masquerade_5e/assets/vtm_stat_block.md'],
    ).toContain('Vampire the Masquerade Stat Block');

    const ordered = getOrderedAssets(record!.template).map((asset) => asset.name);
    expect(ordered.indexOf('vtm_character_sheet')).toBeLessThan(ordered.indexOf('vtm_stat_block'));
    expect(ordered.indexOf('vtm_stat_block')).toBeLessThan(ordered.indexOf('vtm_intro_scene'));
  });

  it('registers every built-in template and resolves all of their blueprints', () => {
    const expectedNames = [
      'V2/V3 Card',
      'Alien RPG',
      'Avatar Legends',
      'Call of Cthulhu 7e',
      'Changeling: The Dreaming 20th',
      'Cosmere',
      'Cyberpunk RED',
      'D&D 5e',
      'D&D 2024',
      'Dragon Age RPG',
      'Fate Core',
      'GURPS 4e',
      'Hunter: The Reckoning 5e',
      'Imperium Maledictum',
      'Mage: The Ascension 20th',
      'Pathfinder 1e',
      'Pathfinder 2e',
      'Shadowrun 5e',
      'Shadowrun 6e',
      'Side Characters',
      'Tales from the Loop',
      'Vampire: The Masquerade 5e',
      'Warhammer Fantasy Roleplay 4e',
      'Werewolf: The Apocalypse 5e',
      'Wrath & Glory',
      'Wraith: The Oblivion 20th',
    ];

    const records = getAllTemplateRecords();
    expect(records.map((record) => record.template.name).sort()).toEqual([...expectedNames].sort());

    for (const record of records) {
      expect(record.template.assets.length).toBeGreaterThan(0);
      expect(getOrderedAssets(record.template)).toHaveLength(record.template.assets.length);

      for (const asset of record.template.assets) {
        const key = asset.blueprint_file ?? `${asset.name}.md`;
        expect((record.blueprint_contents[key] ?? '').trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('hydrates legacy object-map template records from storage', () => {
    window.localStorage.setItem(
      'eidolon.web.templates.custom',
      JSON.stringify({
        legacy_template: {
          template: {
            name: 'Legacy Template',
            version: '1.0.0',
            description: 'Migrated from legacy storage',
            assets: [
              {
                name: 'intro_scene',
                required: true,
                depends_on: [],
                description: 'Intro scene asset',
                blueprint_file: 'intro_scene.md',
              },
            ],
            is_official: false,
          },
          blueprint_contents: {
            'intro_scene.md': 'legacy blueprint content',
          },
        },
      }),
    );

    const storedTemplates = getStoredTemplates();

    expect(storedTemplates).toHaveLength(1);
    expect(storedTemplates[0]).toMatchObject({
      template: {
        name: 'Legacy Template',
      },
      blueprint_contents: {
        'intro_scene.md': 'legacy blueprint content',
      },
    });
  });
});
