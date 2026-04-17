import { describe, expect, it } from 'vitest';
import { detectAndParseCharacter } from '@char-gen/shared';

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
});