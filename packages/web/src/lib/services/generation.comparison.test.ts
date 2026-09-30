import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GenerateResult, StreamChunk } from '@char-gen/shared';
import { DraftStorage } from '../storage/draft-db.js';
import { db } from '../storage/draft-db.js';
import { UsageStorage } from '../storage/usage-db.js';

const fake = vi.hoisted(() => ({
  createEngineCalls: [] as Array<Record<string, unknown>>,
  usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  content: '```character_sheet\nA lone wanderer of the ash roads\n```',
}));

vi.mock('../llm/factory.js', () => ({
  createEngine: vi.fn((options: Record<string, unknown>) => {
    fake.createEngineCalls.push(options);

    return {
      getProvider: () => (typeof options.provider === 'string' ? options.provider : 'openai'),
      getModel: () => (typeof options.model === 'string' ? options.model : 'gpt-4o-test'),
      generate: async (): Promise<GenerateResult> => ({
        content: fake.content,
        finishReason: 'stop',
        usage: fake.usage,
      }),
      generateStream: async function* generateStream(): AsyncGenerator<StreamChunk> {
        yield { content: fake.content, done: false };
        yield { content: '', done: true, usage: fake.usage };
      },
      testConnection: async () => ({ success: true, latencyMs: 5 }),
    };
  }),
}));

vi.mock('../config/manager.js', () => ({
  configManager: {
    getConfig: () => ({ model: 'gpt-4o-test', temperature: 0.7, max_tokens: 512, engine_mode: 'auto' }),
    getApiKeys: () => ({ openai: 'sk-test' }),
  },
}));

import { GenerationService } from './generation.js';

async function drain(
  iterable: AsyncIterable<{ type: string; asset?: string }>,
): Promise<{ type: string; asset?: string }[]> {
  const items: { type: string; asset?: string }[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

/** Usage records are written fire-and-forget; let pending writes commit. */
function flushAsync(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('GenerationService comparison runs', () => {
  beforeEach(async () => {
    fake.createEngineCalls.length = 0;
    await UsageStorage.clear();
    await db.drafts.clear();
  });

  afterEach(async () => {
    await UsageStorage.clear();
    await db.drafts.clear();
    vi.clearAllMocks();
  });

  it('runs a candidate with a model override and links the draft to the group', async () => {
    const items = await drain(
      GenerationService.generate({
        seed: 'a seed',
        mode: 'NSFW',
        stream: false,
        model_override: 'claude-3-5-sonnet-latest',
        comparison_group: 'cmp-1',
      }),
    );
    await flushAsync();

    // The engine is built for the candidate model, with its provider detected
    // from the model string.
    expect(fake.createEngineCalls).toHaveLength(1);
    expect(fake.createEngineCalls[0]).toMatchObject({
      model: 'claude-3-5-sonnet-latest',
      provider: 'anthropic',
    });

    const complete = items.find((item) => item.type === 'complete');
    expect(complete?.asset).toBeTruthy();

    const draft = complete?.asset ? await DraftStorage.getDraft(complete.asset) : null;
    expect(draft?.metadata.model).toBe('claude-3-5-sonnet-latest');
    expect(draft?.metadata.comparison_group).toBe('cmp-1');
    expect(draft?.assets.character_sheet).toContain('lone wanderer');

    // The usage record attributes the call to the candidate, as a comparison.
    const records = await UsageStorage.list();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      kind: 'comparison',
      status: 'ok',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-latest',
      draftId: complete?.asset,
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    });
  });

  it('keeps normal generation untouched without a comparison group', async () => {
    const items = await drain(GenerationService.generate({ seed: 'plain seed', mode: 'Auto', stream: false }));
    await flushAsync();

    expect(fake.createEngineCalls[0]).toMatchObject({ model: 'gpt-4o-test' });

    const records = await UsageStorage.list();
    expect(records).toHaveLength(1);
    expect(records[0]?.kind).toBe('orchestrator');
    expect(records[0]?.model).toBe('gpt-4o-test');

    const complete = items.find((item) => item.type === 'complete');
    const draft = complete?.asset ? await DraftStorage.getDraft(complete.asset) : null;
    expect(draft?.metadata.comparison_group).toBeUndefined();
  });
});
