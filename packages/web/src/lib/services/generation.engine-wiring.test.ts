import { afterEach, describe, expect, it, vi } from 'vitest';
import type { GenerateResult, StreamChunk } from '@char-gen/shared';

/**
 * Pins the credentials every generation path attaches to its engine. The seed
 * generator, chat, and similarity analysis used to build their own engine inline
 * and silently dropped the Custom provider's proxy key, so a Custom endpoint
 * answered them as unauthenticated ("user not found") while `generate` worked.
 */
const captured = vi.hoisted(() => ({ engineOptions: [] as Array<Record<string, unknown>> }));

vi.mock('../llm/factory.js', () => ({
  createEngine: vi.fn((options: Record<string, unknown>) => {
    captured.engineOptions.push(options);
    return {
      getProvider: () => 'custom',
      getModel: () => 'local-model',
      generate: async (): Promise<GenerateResult> => ({
        content: 'seed one\nseed two',
        finishReason: 'stop',
      }),
      generateStream: async function* generateStream(): AsyncGenerator<StreamChunk> {
        yield { content: 'hi', done: true };
      },
      testConnection: async () => ({ success: true }),
    };
  }),
}));

vi.mock('../config/manager.js', () => ({
  configManager: {
    getConfig: () => ({
      model: 'local-model',
      temperature: 0.7,
      max_tokens: 256,
      engine_mode: 'explicit',
      engine: 'custom',
      base_url: 'http://localhost:11434/v1',
      api_proxy_key: 'sk-proxy',
    }),
    getApiKeys: () => ({}),
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

describe('generation engine wiring', () => {
  afterEach(() => {
    captured.engineOptions.length = 0;
    vi.clearAllMocks();
  });

  it('builds the seed engine from the shared resolver so the Custom proxy key rides along', async () => {
    await drain(GenerationService.generateSeeds({ genre_lines: 'noir detective' }));

    expect(captured.engineOptions[0]).toMatchObject({
      provider: 'custom',
      baseUrl: 'http://localhost:11434/v1',
      proxyKey: 'sk-proxy',
    });
  });

  it('builds the chat engine from the shared resolver too', async () => {
    await drain(GenerationService.chat('draft-1', [{ role: 'user', content: 'hello' }]));

    expect(captured.engineOptions[0]).toMatchObject({ provider: 'custom', proxyKey: 'sk-proxy' });
  });
});
