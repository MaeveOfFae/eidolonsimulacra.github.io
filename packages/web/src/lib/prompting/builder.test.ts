import { describe, expect, it } from 'vitest';
import { buildAssetPrompt, buildOffspringPrompt, buildRefinementSystemPrompt } from './builder';

describe('buildAssetPrompt', () => {
  it('converts JSON prior assets into structured inline context', async () => {
    const priorAssets = {
      character_sheet: JSON.stringify({
        name: 'Maeve',
        description: 'Character sheet content',
        scenario: 'Scene context',
        tags: ['court', 'intrigue'],
        character_book: {
          entries: [
            {
              name: 'Crimson Court',
              content: 'The Crimson Court controls the inland passes.',
            },
          ],
        },
      }, null, 2),
      system_prompt: 'System prompt content',
    };

    const [, userPrompt] = await buildAssetPrompt(
      'intro_scene',
      'test seed',
      'SFW',
      priorAssets,
      'test blueprint content'
    );

    expect(userPrompt).toContain('### character_sheet (structured JSON context):');
    expect(userPrompt).toContain('Use the extracted fields below. Do not assume access to any external file.');
    expect(userPrompt).toContain('- name: Maeve');
    expect(userPrompt).toContain('- description: Character sheet content');
    expect(userPrompt).toContain('- tags: court, intrigue');
    expect(userPrompt).toContain('- character_book.entries[0].content: The Crimson Court controls the inland passes.');
    expect(userPrompt).toContain('### system_prompt:');
    expect(userPrompt).toContain('```\nSystem prompt content\n```');
    expect(userPrompt).not.toContain('"name": "Maeve"');
  });
});

describe('buildOffspringPrompt', () => {
  it('converts JSON parent assets into structured inline context', async () => {
    const [_, userPrompt] = await buildOffspringPrompt(
      {
        character_sheet: JSON.stringify({
          name: 'Maeve',
          description: 'Character sheet content',
          tags: ['court', 'intrigue'],
        }, null, 2),
      },
      {
        system_prompt: 'Parent 2 system prompt',
      },
      'Maeve',
      'Riven',
      'SFW'
    );

    expect(userPrompt).toContain('## PARENT 1: Maeve');
    expect(userPrompt).toContain('### character_sheet (structured JSON context):');
    expect(userPrompt).toContain('- name: Maeve');
    expect(userPrompt).toContain('- tags: court, intrigue');
    expect(userPrompt).not.toContain('"description": "Character sheet content"');
  });
});

describe('buildRefinementSystemPrompt', () => {
  it('converts JSON asset content into structured inline context', async () => {
    const prompt = await buildRefinementSystemPrompt(
      'character_sheet',
      JSON.stringify({
        name: 'Maeve',
        description: 'Character sheet content',
      }, null, 2),
      JSON.stringify({
        name: 'Maeve',
        scenario: 'Scene context',
      }, null, 2)
    );

    expect(prompt).toContain('## Current Asset: Character Sheet (structured JSON context):');
    expect(prompt).toContain('Use the extracted fields below as the active asset content. Do not assume access to any external file.');
    expect(prompt).toContain('- name: Maeve');
    expect(prompt).toContain('## Character Sheet (for context) (structured JSON context):');
    expect(prompt).toContain('Use the extracted character-sheet fields below to maintain consistency. Do not assume access to any external file.');
    expect(prompt).toContain('return only the finished asset content with no surrounding code fences or commentary');
    expect(prompt).toContain('provide the complete edited asset content only');
    expect(prompt).not.toContain('"scenario": "Scene context"');
  });
});