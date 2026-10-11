import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Draft, GenerateResult, StreamChunk } from '@char-gen/shared';
import { DraftStorage } from '../storage/draft-db.js';
import { db } from '../storage/draft-db.js';
import { UsageStorage } from '../storage/usage-db.js';

/**
 * Canon-lock injection on the two paths the service owns the draft ids for:
 * reference-based generation (`connected_draft_ids`) and offspring seeds
 * (`parent1_id` / `parent2_id`). Per-asset regeneration resolves its locks in
 * the components, so it is pinned separately.
 */
const fake = vi.hoisted(() => ({
  messages: [] as Array<Array<{ role: string; content: string }>>,
  usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  content: '```character_sheet\nA lone wanderer of the ash roads\n```',
  lockLines: ['World: magic always costs blood'] as string[],
  resolverCalls: [] as string[][],
}));

vi.mock('../worlds/canon-lock-context.js', () => ({
  resolveCanonLockConstraintLines: vi.fn(async (draftIds: readonly string[]) => {
    fake.resolverCalls.push([...draftIds]);
    return fake.lockLines;
  }),
}));

vi.mock('../llm/factory.js', () => ({
  createEngine: vi.fn(() => ({
    getProvider: () => 'openai',
    getModel: () => 'gpt-4o-test',
    generate: async (messages: Array<{ role: string; content: string }>): Promise<GenerateResult> => {
      fake.messages.push(messages);
      return { content: fake.content, finishReason: 'stop', usage: fake.usage };
    },
    generateStream: async function* generateStream(
      messages: Array<{ role: string; content: string }>,
    ): AsyncGenerator<StreamChunk> {
      fake.messages.push(messages);
      yield { content: fake.content, done: false };
      yield { content: '', done: true, usage: fake.usage };
    },
    testConnection: async () => ({ success: true, latencyMs: 5 }),
  })),
}));

vi.mock('../config/manager.js', () => ({
  configManager: {
    getConfig: () => ({ model: 'gpt-4o-test', temperature: 0.7, max_tokens: 512, engine_mode: 'auto' }),
    getApiKeys: () => ({ openai: 'sk-test' }),
  },
}));

import { GenerationService } from './generation.js';

async function drain(iterable: AsyncIterable<{ type: string }>): Promise<void> {
  for await (const _item of iterable) {
    void _item;
  }
}

/** Usage records are written fire-and-forget; let pending writes commit. */
function flushAsync(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function lastPromptContent(): string {
  return (fake.messages.at(-1) ?? []).map((message) => message.content).join('\n');
}

function parentDraft(reviewId: string, characterName: string): Draft {
  return {
    path: reviewId,
    metadata: { review_id: reviewId, seed: 'parent seed', favorite: false, character_name: characterName },
    assets: { character_sheet: `${characterName} sheet` },
  };
}

describe('GenerationService canon-lock injection', () => {
  beforeEach(async () => {
    fake.messages.length = 0;
    fake.resolverCalls.length = 0;
    fake.lockLines = ['World: magic always costs blood'];
    await UsageStorage.clear();
    await db.drafts.clear();
  });

  afterEach(async () => {
    await UsageStorage.clear();
    await db.drafts.clear();
    vi.clearAllMocks();
  });

  it('injects the locks of the connected reference drafts into the orchestrator prompt', async () => {
    await drain(
      GenerationService.generate({ seed: 'a seed', mode: 'Auto', stream: false, connected_draft_ids: ['d1', 'd2'] }),
    );
    await flushAsync();

    expect(fake.resolverCalls).toEqual([['d1', 'd2']]);
    expect(lastPromptContent()).toContain('ADDITIONAL RULES:');
    expect(lastPromptContent()).toContain('- World: magic always costs blood');
  });

  it('injects both parents locks into the offspring seed prompt', async () => {
    await DraftStorage.saveDraft(parentDraft('p1', 'Parent One'));
    await DraftStorage.saveDraft(parentDraft('p2', 'Parent Two'));

    await drain(GenerationService.generateOffspringSeed({ parent1_id: 'p1', parent2_id: 'p2', mode: 'Auto' }));
    await flushAsync();

    expect(fake.resolverCalls).toEqual([['p1', 'p2']]);
    expect(lastPromptContent()).toContain('ADDITIONAL RULES:');
    expect(lastPromptContent()).toContain('- World: magic always costs blood');
  });

  it('injects locks named by canon_lock_draft_ids when there are no connected references', async () => {
    await drain(
      GenerationService.generate({ seed: 'a seed', mode: 'Auto', stream: false, canon_lock_draft_ids: ['d1'] }),
    );
    await flushAsync();

    expect(fake.resolverCalls).toEqual([['d1']]);
    expect(lastPromptContent()).toContain('ADDITIONAL RULES:');
    expect(lastPromptContent()).toContain('- World: magic always costs blood');
  });

  it('injects locks into per-asset generation from canon_lock_draft_ids', async () => {
    await drain(
      GenerationService.generateAsset({
        seed: 'a seed',
        mode: 'Auto',
        asset_name: 'character_sheet',
        prior_assets: {},
        canon_lock_draft_ids: ['d1'],
      }),
    );
    await flushAsync();

    expect(fake.resolverCalls).toEqual([['d1']]);
    expect(lastPromptContent()).toContain('ADDITIONAL INSTRUCTIONS:');
    expect(lastPromptContent()).toContain('World: magic always costs blood');
  });

  it('leaves the prompt untouched when there are no locks', async () => {
    fake.lockLines = [];

    await drain(GenerationService.generate({ seed: 'a seed', mode: 'Auto', stream: false }));
    await flushAsync();

    expect(lastPromptContent()).not.toContain('ADDITIONAL RULES:');
  });
});
