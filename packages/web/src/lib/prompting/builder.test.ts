import { describe, expect, it } from 'vitest';
import { buildAssetPrompt, buildLorebookPrompt, buildOffspringPrompt, buildOrchestratorPrompt, buildRefinementSystemPrompt } from './builder';

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

  it('injects connected reference suites before prior assets', async () => {
    const [, userPrompt] = await buildAssetPrompt(
      'intro_scene',
      'test seed',
      'SFW',
      {
        system_prompt: 'Current draft system prompt',
      },
      'test blueprint content',
      undefined,
      [],
      [
        {
          label: 'Maeve',
          assets: {
            character_sheet: JSON.stringify({
              name: 'Maeve',
              faction: 'Crimson Court',
            }, null, 2),
          },
        },
      ]
    );

    expect(userPrompt).toContain('## Connected Character References:');
    expect(userPrompt).toContain('## REFERENCE 1: Maeve');
    expect(userPrompt).toContain('### character_sheet (structured JSON context):');
    expect(userPrompt).toContain('- name: Maeve');
    expect(userPrompt).toContain('- faction: Crimson Court');
    expect(userPrompt.indexOf('## Connected Character References:')).toBeLessThan(userPrompt.indexOf('## Prior Assets (for context):'));
  });

  it('limits prior asset context to declared dependencies for a1111', async () => {
    const [, userPrompt] = await buildAssetPrompt(
      'a1111',
      'test seed',
      'SFW',
      {
        system_prompt: 'System prompt content',
        post_history: 'Post history content',
        character_sheet: 'Character sheet content',
        intro_scene: 'Intro scene content',
      },
      'test blueprint content',
      undefined,
      [],
      [],
      'V2/V3 Card'
    );

    expect(userPrompt).toContain('TARGET ASSET: a1111');
    expect(userPrompt).toContain('TASK: Generate only the requested a1111 asset.');
    expect(userPrompt).toContain('OUTPUT: Return only the final raw A1111 prompt lines.');
    expect(userPrompt).toContain('### system_prompt:');
    expect(userPrompt).toContain('### post_history:');
    expect(userPrompt).toContain('### character_sheet:');
    expect(userPrompt).not.toContain('### intro_scene:');
  });

  it('injects imported source material as structured asset context', async () => {
    const [, userPrompt] = await buildAssetPrompt(
      'intro_scene',
      'test seed',
      'SFW',
      {
        system_prompt: 'Current draft system prompt',
      },
      'test blueprint content',
      undefined,
      [],
      [],
      'V2/V3 Card',
      {
        label: 'Selene',
        source: 'Chub AI',
        assets: {
          intro_scene: 'Imported opening line',
          character_sheet: JSON.stringify({ name: 'Selene', faction: 'Moon dossier' }, null, 2),
        },
      }
    );

    expect(userPrompt).toContain('## Imported Character Source Material');
    expect(userPrompt).toContain('Source label: Selene');
    expect(userPrompt).toContain('Imported from: Chub AI');
    expect(userPrompt).toContain('### intro_scene:');
    expect(userPrompt).toContain('Imported opening line');
    expect(userPrompt).toContain('### character_sheet (structured JSON context):');
    expect(userPrompt).toContain('- name: Selene');
    expect(userPrompt).toContain('- faction: Moon dossier');
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

describe('buildOrchestratorPrompt', () => {
  it('injects connected reference suites into the orchestrator user prompt', async () => {
    const [, userPrompt] = await buildOrchestratorPrompt(
      'test seed',
      'SFW',
      undefined,
      undefined,
      undefined,
      [],
      [
        {
          label: 'Maeve',
          assets: {
            reference_summary: 'name: Maeve\nseed: Court intriguer bound to the Crimson Court',
            post_history: 'Treats debts like ownership and keeps score in silence.',
          },
        },
      ]
    );

    expect(userPrompt).toContain('CONNECTED CHARACTER REFERENCES:');
    expect(userPrompt).toContain('## REFERENCE 1: Maeve');
    expect(userPrompt).toContain('### reference_summary:');
    expect(userPrompt).toContain('### post_history:');
  });
});

describe('buildLorebookPrompt', () => {
  it('builds a lorebook prompt from reference suites without requesting a new character', async () => {
    const [systemPrompt, userPrompt] = await buildLorebookPrompt(
      [
        {
          label: 'Maeve',
          assets: {
            reference_summary: 'name: Maeve\nseed: Court intriguer bound to the Crimson Court',
            lorebook: '## Crimson Court\n\nControls the inland passes through bribery and soft terror.',
            intro_scene: 'Maeve waits at the checkpoint where the toll bells never stop ringing.',
          },
        },
      ],
      {
        focus: 'Extract faction pressure and recurring places.',
      }
    );

    expect(systemPrompt).toContain('Lorebook Generator');
    expect(userPrompt).toContain('TASK: Synthesize a connected lorebook/worldbook packet from these reference drafts.');
    expect(userPrompt).toContain('CONSTRAINT: Do not generate a new standalone character.');
    expect(userPrompt).toContain('FOCUS: Extract faction pressure and recurring places.');
    expect(userPrompt).toContain('## REFERENCE DRAFT 1: Maeve');
    expect(userPrompt).toContain('### lorebook:');
    expect(userPrompt).toContain('### intro_scene:');
  });
});