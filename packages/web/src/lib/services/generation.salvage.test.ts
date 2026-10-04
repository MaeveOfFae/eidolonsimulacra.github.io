import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { StreamChunk } from '@char-gen/shared';
import { createEngine } from '../llm/factory.js';
import { db, DraftStorage } from '../storage/draft-db.js';

vi.mock('../llm/factory.js', () => ({
  createEngine: vi.fn(() => ({
    getProvider: () => 'openai',
    getModel: () => 'gpt-4o-test',
    generate: async () => ({ content: '', finishReason: 'stop' }),
    generateStream: async function* (): AsyncGenerator<StreamChunk> {
      yield {
        content:
          'Intro line.\n```system_prompt\nYou are a pirate.\n```\n```character_sheet\nShe was mid-sentence when ',
        done: false,
      };
      throw new Error('connection dropped');
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

async function drainGeneration(): Promise<void> {
  for await (const progress of GenerationService.generate({ seed: 'a lonely space pirate', mode: 'SFW' })) {
    void progress;
  }
}

describe('GenerationService partial-run salvage', () => {
  beforeEach(async () => {
    vi.mocked(createEngine).mockImplementation(
      vi.fn(() => ({
        getProvider: () => 'openai',
        getModel: () => 'gpt-4o-test',
        generate: async () => ({ content: '', finishReason: 'stop' }),
        generateStream: async function* (): AsyncGenerator<StreamChunk> {
          yield {
            content:
              'Intro line.\n```system_prompt\nYou are a pirate.\n```\n```character_sheet\nShe was mid-sentence when ',
            done: false,
          };
          throw new Error('connection dropped');
        },
        testConnection: async () => ({ success: true, latencyMs: 5 }),
      })),
    );
    await db.drafts.clear();
    await db.assets.clear();
    await db.tags.clear();
  });

  it('saves closed asset blocks as a partial draft when the stream dies mid-run', async () => {
    let thrown: unknown;
    try {
      await drainGeneration();
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe('connection dropped');

    const metadata = await DraftStorage.getAllMetadata();
    expect(metadata).toHaveLength(1);

    const draft = await DraftStorage.getDraft(metadata[0]!.review_id);

    // The closed system_prompt block is salvaged; the unclosed
    // character_sheet block was cut off mid-stream and is excluded.
    expect(Object.keys(draft?.assets ?? {})).toEqual(['system_prompt']);
    expect(draft?.assets.system_prompt).toBe('You are a pirate.');
    expect(draft?.metadata.notes).toContain('salvaged');
    expect(draft?.metadata.seed).toBe('a lonely space pirate');

    // The thrown error carries the salvaged draft id so batch errors can
    // surface which seed produced a partial draft.
    expect((thrown as { salvagedDraftId?: string }).salvagedDraftId).toBe(metadata[0]!.review_id);
  });

  it('saves nothing when the stream dies before any asset block closes', async () => {
    vi.mocked(createEngine).mockImplementationOnce(
      vi.fn(() => ({
        getProvider: () => 'openai',
        getModel: () => 'gpt-4o-test',
        generate: async () => ({ content: '', finishReason: 'stop' }),
        generateStream: async function* (): AsyncGenerator<StreamChunk> {
          yield { content: 'The model was warming up when ', done: false };
          throw new Error('connection dropped');
        },
        testConnection: async () => ({ success: true, latencyMs: 5 }),
      })),
    );

    await expect(drainGeneration()).rejects.toThrow('connection dropped');

    expect(await DraftStorage.getAllMetadata()).toHaveLength(0);
  });
});
