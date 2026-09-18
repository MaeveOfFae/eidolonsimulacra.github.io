import { describe, expect, it } from 'vitest';
import { buildDraftExportArtifact, detectAndParseCharacter, parseDraftImportText, type Draft } from '@char-gen/shared';

describe('detectAndParseCharacter', () => {
  it('stores unknown JSON as a single raw text asset', () => {
    const payload = {
      meta: {
        origin: 'custom-upload',
      },
      sections: [
        { label: 'bio', value: 'A wandering archivist' },
      ],
    };

    const result = detectAndParseCharacter(JSON.stringify(payload), 'mystery.json');

    expect(result).toMatchObject({
      name: 'mystery',
      sourceFormat: 'unknown',
      assets: {
        character_sheet: JSON.stringify(payload, null, 2),
      },
    });
    expect(result.unmappedFields).toBeUndefined();
  });

  it('extracts lorebook content from unknown JSON into a dedicated asset', () => {
    const payload = {
      title: 'Archive bundle',
      character_book: {
        name: 'Travel Notes',
        entries: [
          {
            keys: ['Velis', 'Harbor'],
            content: 'Velis Harbor is under guild lockdown.',
          },
        ],
      },
    };

    const result = detectAndParseCharacter(JSON.stringify(payload), 'archive.json');

    expect(result.assets.character_sheet).toBe(JSON.stringify(payload, null, 2));
    expect(result.assets.lorebook).toContain('Travel Notes');
    expect(result.assets.lorebook).toContain('Velis Harbor is under guild lockdown.');
    expect(result.assets.lorebook).toContain('Velis, Harbor');
  });

  it('keeps structured TavernAI cards mapped to standard assets', () => {
    const payload = {
      name: 'Maeve',
      description: 'Character sheet content',
      personality: 'System prompt content',
      first_mes: 'Opening line',
      mes_example: 'Example exchange',
      scenario: 'Scene context',
      character_book: {
        entries: [
          {
            name: 'Crimson Court',
            content: 'The Crimson Court controls the inland passes.',
          },
        ],
      },
    };

    const result = detectAndParseCharacter(JSON.stringify(payload), 'maeve.json');

    expect(result).toMatchObject({
      name: 'Maeve',
      sourceFormat: 'tavernai_v1',
      assets: {
        character_sheet: 'Character sheet content',
        system_prompt: 'System prompt content',
        intro_scene: 'Opening line',
        post_history: 'Example exchange',
        intro_page: 'Scene context',
      },
    });
    expect(result.assets.lorebook).toContain('Crimson Court');
    expect(result.assets.lorebook).toContain('The Crimson Court controls the inland passes.');
  });

  it('exports a Chub-compatible V2/V3 card JSON that round-trips full Eidolon assets', () => {
    const draft: Draft = {
      path: 'maeve-review',
      metadata: {
        review_id: 'maeve-review',
        seed: 'night court archivist',
        favorite: true,
        character_name: 'Maeve',
        template_name: 'V2/V3 Card',
        mode: 'NSFW',
        tags: ['court', 'gothic'],
        notes: 'Carry over the imported card metadata.',
        card_metadata: {
          avatar: 'https://example.test/maeve.png',
          creator: 'MaeveOfFae',
          character_version: 'main',
          depth_prompt: { depth: 0, prompt: '' },
          chub: {
            id: 6358382,
            full_path: 'MaeveOfFae/maeve',
            related_lorebooks: [
              { id: -1, book: null, path: 'embedded', version: 'main', commit_ref: 'main' },
            ],
          },
        },
      },
      assets: {
        system_prompt: 'Stay in character and keep the tone intimate but precise.',
        post_history: 'Maeve already trusts {{user}} with the archive keys.',
        character_sheet: 'Name: Maeve\nRole: Archivist\nHooks: court intrigue, ritual debt',
        intro_scene: 'The archive door opens before you can knock.',
        intro_page: 'A candlelit archive under the old palace.',
        a1111: 'upper body portrait, candlelight, black velvet, crimson foil, cinematic',
        creator_notes: '# Maeve\n\nPrivate notes for the archivist card.',
        alternate_greetings: JSON.stringify(['Second greeting', 'Third greeting']),
        lorebook: '# Secret\n\n## Crimson Court\n\nKeys: court, crimson\n\nThe Crimson Court keeps a ledger under the altar.',
      },
    };

    const artifact = buildDraftExportArtifact(draft, 'json', true);
    expect(typeof artifact.content).toBe('string');
    if (typeof artifact.content !== 'string') {
      throw new Error('Expected JSON export artifact content to be a string');
    }
    const payload = JSON.parse(artifact.content) as Record<string, unknown>;
    const data = payload.data as Record<string, unknown>;
    const extensions = data.extensions as Record<string, unknown>;
    const eidolon = extensions.eidolon as Record<string, unknown>;
    const assets = eidolon.assets as Record<string, unknown>;

    expect(payload.spec).toBe('chara_card_v2');
    expect(payload.spec_version).toBe('2.0');
    expect(data.name).toBe('Maeve');
    expect(data.description).toBe(draft.assets.character_sheet);
    expect(data.first_mes).toBe(draft.assets.intro_scene);
    expect(data.personality).toBe('');
    expect(data.avatar).toBe('https://example.test/maeve.png');
    expect(data.scenario).toBe('');
    expect(data.mes_example).toBe('');
    expect(data.creator_notes).toBe(draft.assets.creator_notes);
    expect(data.system_prompt).toBe(`{{original}}\n${draft.assets.system_prompt}`);
    expect(data.post_history_instructions).toBe(`{{original}}\n${draft.assets.post_history}`);
    expect(data.alternate_greetings).toEqual(['Second greeting', 'Third greeting']);
    expect(data.creator).toBe('MaeveOfFae');
    expect(data.character_version).toBe('main');
    expect((data.extensions as Record<string, unknown>).depth_prompt).toEqual({ depth: 0, prompt: '' });
    expect(((data.extensions as Record<string, unknown>).chub as Record<string, unknown>).id).toBe(6358382);
    expect(((data.extensions as Record<string, unknown>).chub as Record<string, unknown>).full_path).toBe('MaeveOfFae/maeve');
    expect(((data.extensions as Record<string, unknown>).chub as Record<string, unknown>).related_lorebooks).toEqual([
      { id: -1, book: null, path: 'embedded', version: 'main', commit_ref: 'main' },
    ]);
    expect((data.character_book as Record<string, unknown>).name).toBe('Secret');
    expect(((data.character_book as Record<string, unknown>).entries as Array<Record<string, unknown>>)[0]?.content).toContain('The Crimson Court keeps a ledger under the altar.');
    expect(assets.a1111).toBe(draft.assets.a1111);

    const parsed = detectAndParseCharacter(artifact.content, 'maeve.json');

    expect(parsed.assets).toMatchObject(draft.assets);
    expect(parsed.metadata).toMatchObject({
      character_name: 'Maeve',
      template_name: 'V2/V3 Card',
      mode: 'NSFW',
      tags: ['court', 'gothic'],
      notes: 'Carry over the imported card metadata.',
    });
    expect(parsed.metadata?.card_metadata).toMatchObject({
      avatar: 'https://example.test/maeve.png',
      creator: 'MaeveOfFae',
      character_version: 'main',
      depth_prompt: { depth: 0, prompt: '' },
      chub: {
        id: 6358382,
        full_path: 'MaeveOfFae/maeve',
        related_lorebooks: [{ id: -1, book: null, path: 'embedded', version: 'main', commit_ref: 'main' }],
      },
    });
  });

  it('parses v2 and v3 card fields into richer internal assets', () => {
    const payload = {
      spec: 'chara_card_v2',
      spec_version: '3.0',
      data: {
        name: 'Iris',
        description: 'Character sheet content',
        system_prompt: '{{original}}\nFollow the ritual etiquette exactly.',
        mes_example: '<START>\n{{user}}: Are you alone?\n{{char}}: Never in this place.',
        post_history_instructions: '{{original}}\nThe exchange happens after weeks of cautious trust.',
        alternate_greetings: ['Fallback greeting', 'Second hello'],
        creator_notes: 'Imported from a Chub archive.',
        avatar: 'https://example.test/iris.png',
        creator: 'MaeveOfFae',
        character_version: 'main',
        extensions: {
          chub: {
            id: 44,
            full_path: 'MaeveOfFae/iris',
            related_lorebooks: [
              { id: -1, book: null, path: 'embedded', version: 'main', commit_ref: 'main' },
            ],
          },
          depth_prompt: { depth: 2, prompt: 'Keep the ritual secret.' },
        },
        tags: ['archive', 'ritual'],
      },
    };

    const result = detectAndParseCharacter(JSON.stringify(payload), 'iris.json');

    expect(result.sourceFormat).toBe('chubai');
    expect(result.assets.character_sheet).toContain('Character sheet content');
    expect(result.assets.system_prompt).toBe('Follow the ritual etiquette exactly.');
    expect(result.assets.post_history).toBe('Example Dialogue\n\n{{user}}: Are you alone?\n{{char}}: Never in this place.\n\nPost-History Instructions\n\nThe exchange happens after weeks of cautious trust.');
    expect(result.assets.creator_notes).toBe('Imported from a Chub archive.');
    expect(result.assets.avatar).toBe('https://example.test/iris.png');
    expect(result.assets.alternate_greetings).toBe('[\n  "Fallback greeting",\n  "Second hello"\n]');
    expect(result.assets.creator).toBe('MaeveOfFae');
    expect(result.assets.character_version).toBe('main');
    expect(result.metadata).toMatchObject({
      character_name: 'Iris',
      tags: ['archive', 'ritual'],
      notes: 'Imported from a Chub archive.',
    });
    expect(result.metadata?.card_metadata).toMatchObject({
      avatar: 'https://example.test/iris.png',
      creator: 'MaeveOfFae',
      character_version: 'main',
      depth_prompt: { depth: 2, prompt: 'Keep the ritual secret.' },
      chub: {
        id: 44,
        full_path: 'MaeveOfFae/iris',
        related_lorebooks: [{ id: -1, book: null, path: 'embedded', version: 'main', commit_ref: 'main' }],
      },
    });
  });

  it('maps custom imported fields into template assets via import aliases', () => {
    const payload = {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Selene',
        description: 'Character sheet content',
        first_mes: 'Opening line',
        creator_notes: 'Private subtext notes',
        character_book: {
          name: 'Moon dossier',
          entries: [
            {
              keys: ['moon'],
              content: 'The moon cult keeps its rites below the cistern.',
            },
          ],
        },
        extensions: {
          chub: {
            full_path: 'MaeveOfFae/selene',
          },
        },
      },
    };

    const result = detectAndParseCharacter(JSON.stringify(payload), 'selene.json', {
      template: {
        name: 'Moon Rite',
        assets: [
          { name: 'character_sheet', required: true, depends_on: [], description: 'Character sheet' },
          { name: 'intro_scene', required: true, depends_on: [], description: 'Intro scene' },
          { name: 'private_notes', required: false, depends_on: [], description: 'Private import', import_aliases: ['creator_notes'] },
          { name: 'world_dossier', required: false, depends_on: [], description: 'Lorebook import', import_aliases: ['character_book'] },
          { name: 'registry_path', required: false, depends_on: [], description: 'Nested import', import_aliases: ['extensions.chub.full_path'] },
        ],
      },
    });

    expect(result.assets.character_sheet).toBe('Character sheet content');
    expect(result.assets.intro_scene).toBe('Opening line');
    expect(result.assets.private_notes).toBe('Private subtext notes');
    expect(result.assets.world_dossier).toContain('Moon dossier');
    expect(result.assets.world_dossier).toContain('The moon cult keeps its rites below the cistern.');
    expect(result.assets.registry_path).toBe('MaeveOfFae/selene');
    expect(result.assets.creator_notes).toBeUndefined();
    expect(result.assets.lorebook).toBeUndefined();
  });

  it('exports a PNG character card that round-trips the embedded JSON and source image', () => {
    const onePixelPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aGKsAAAAASUVORK5CYII=';
    const draft: Draft = {
      path: 'maeve-png-review',
      metadata: {
        review_id: 'maeve-png-review',
        seed: 'archive keeper',
        favorite: false,
        character_name: 'Maeve',
        template_name: 'V2/V3 Card',
        mode: 'NSFW',
      },
      assets: {
        card_image: `data:image/png;base64,${onePixelPngBase64}`,
        system_prompt: 'Stay exact.',
        post_history: 'Already knows {{user}}.',
        character_sheet: 'Name: Maeve\nRole: Keeper',
        intro_scene: 'The door is already open.',
        a1111: 'portrait, archive, candlelight',
      },
    };

    const artifact = buildDraftExportArtifact(draft, 'png', true);

    expect(artifact.extension).toBe('png');
    expect(artifact.contentType).toBe('image/png');
    expect(artifact.content).toBeInstanceOf(Uint8Array);

    if (!(artifact.content instanceof Uint8Array)) {
      throw new Error('Expected PNG export artifact content to be a Uint8Array');
    }

    const parsed = detectAndParseCharacter(artifact.content.buffer.slice(artifact.content.byteOffset, artifact.content.byteOffset + artifact.content.byteLength), 'maeve.png');

    expect(parsed.sourceFormat).toBe('png_card');
    expect(parsed.assets.system_prompt).toBe(draft.assets.system_prompt);
    expect(parsed.assets.post_history).toBe(draft.assets.post_history);
    expect(parsed.assets.character_sheet).toBe(draft.assets.character_sheet);
    expect(parsed.assets.intro_scene).toBe(draft.assets.intro_scene);
    expect(parsed.assets.card_image).toMatch(/^data:image\/png;base64,/);
  });

  it('uses template context when importing loose card files into drafts', () => {
    const payload = {
      spec: 'chara_card_v2',
      spec_version: '2.0',
      data: {
        name: 'Selene',
        description: 'Character sheet content',
        first_mes: 'Opening line',
        creator_notes: 'Private subtext notes',
      },
    };

    const result = parseDraftImportText(JSON.stringify(payload), 'selene.json', {
      template: {
        name: 'Moon Rite',
        assets: [
          { name: 'character_sheet', required: true, depends_on: [], description: 'Character sheet' },
          { name: 'intro_scene', required: true, depends_on: [], description: 'Intro scene' },
          { name: 'private_notes', required: false, depends_on: [], description: 'Private notes', import_aliases: ['creator_notes'] },
        ],
      },
    });

    expect(result.drafts).toHaveLength(1);
    expect(result.drafts[0]?.metadata.template_name).toBe('Moon Rite');
    expect(result.drafts[0]?.assets.private_notes).toBe('Private subtext notes');
    expect(result.drafts[0]?.assets.creator_notes).toBeUndefined();
  });
});