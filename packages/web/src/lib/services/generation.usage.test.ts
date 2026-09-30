import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GenerateResult, StreamChunk } from '@char-gen/shared';
import { UsageStorage } from '../storage/usage-db.js';

const fake = vi.hoisted(() => ({
  nonStreamUsage: { promptTokens: 2, completionTokens: 3, totalTokens: 5 },
  streamUsage: { promptTokens: 4, completionTokens: 6, totalTokens: 10 },
  failEngine: false,
}));

vi.mock('../llm/factory.js', () => ({
  createEngine: vi.fn(() => ({
    getProvider: () => 'openai',
    getModel: () => 'gpt-4o-test',
    generate: async (): Promise<GenerateResult> => {
      if (fake.failEngine) {
        throw new Error('boom');
      }
      return { content: 'seed alpha\nseed beta', finishReason: 'stop', usage: fake.nonStreamUsage };
    },
    generateStream: async function* generateStream(): AsyncGenerator<StreamChunk> {
      if (fake.failEngine) {
        throw new Error('boom');
      }
      yield { content: 'seed ', done: false };
      yield { content: 'gamma', done: false };
      yield { content: '', done: true, usage: fake.streamUsage };
    },
    testConnection: async () => ({ success: true, latencyMs: 5 }),
  })),
}));

vi.mock('../config/manager.js', () => ({
  configManager: {
    getConfig: () => ({ model: 'gpt-4o-test', temperature: 0.7, max_tokens: 256, engine_mode: 'auto' }),
    getApiKeys: () => ({ openai: 'sk-test' }),
  },
}));

import { GenerationService } from './generation.js';

async function drain<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

/** Usage records are written fire-and-forget; let pending writes commit. */
function flushAsync(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('GenerationService usage capture', () => {
  beforeEach(async () => {
    fake.failEngine = false;
    await UsageStorage.clear();
  });

  afterEach(async () => {
    await UsageStorage.clear();
    vi.clearAllMocks();
  });

  it('records a seed call with the engine-reported usage', async () => {
    await drain(GenerationService.generateSeeds({ genre_lines: 'high fantasy' }));
    await flushAsync();

    const records = await UsageStorage.list();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      kind: 'seed',
      status: 'ok',
      provider: 'openai',
      model: 'gpt-4o-test',
      promptTokens: 2,
      completionTokens: 3,
      totalTokens: 5,
    });
  });

  it('records a chat call with streaming usage, draft id, and asset context', async () => {
    await drain(GenerationService.chat('draft-1', [{ role: 'user', content: 'hello' }], 'system_prompt'));
    await flushAsync();

    const records = await UsageStorage.list();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      kind: 'chat',
      status: 'ok',
      draftId: 'draft-1',
      assetName: 'system_prompt',
      promptTokens: 4,
      completionTokens: 6,
      totalTokens: 10,
    });
  });

  it('records an error outcome when the engine call fails', async () => {
    fake.failEngine = true;

    await expect(drain(GenerationService.generateSeeds({ genre_lines: 'nope' }))).rejects.toThrow('boom');
    await flushAsync();

    const records = await UsageStorage.list();
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({ kind: 'seed', status: 'error', errorMessage: 'boom' });
  });
});
