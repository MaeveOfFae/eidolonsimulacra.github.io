import { describe, expect, it, vi } from 'vitest';
import type { GenerateResult, StreamChunk } from '@char-gen/shared';

vi.mock('../llm/factory.js', () => ({
  createEngine: vi.fn(() => ({
    getProvider: () => 'openai',
    getModel: () => 'gpt-4o-test',
    generate: async (): Promise<GenerateResult> => ({ content: 'fallback', finishReason: 'stop' }),
    generateStream: async function* generateStream(): AsyncGenerator<StreamChunk> {
      yield { content: '[[LOREBOOK_PACKET]]\n', done: false };
      yield { content: 'title: Crimson Court\n', done: false };
      yield { content: '[[/LOREBOOK_PACKET]]', done: false };
      yield { content: '', done: true };
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

vi.mock('../prompting/reference-context.js', () => ({
  loadReferenceSuites: vi.fn(async () => [{ label: 'Maeve', assets: { reference_summary: 'name: Maeve' } }]),
  normalizeConnectedReferenceIds: (draftIds: string[] | undefined) => draftIds ?? [],
}));

vi.mock('../storage/usage-db.js', () => ({
  UsageStorage: { record: vi.fn(async () => {}), clear: vi.fn(async () => {}), list: vi.fn(async () => []) },
}));

import { GenerationService } from './generation.js';

async function drain<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) {
    items.push(item);
  }
  return items;
}

describe('GenerationService.generateLorebook', () => {
  it('streams status → chunks → complete for a reference packet', async () => {
    const events = await drain(
      GenerationService.generateLorebook({ draft_ids: ['draft-1'], blueprint_content: 'bp' }),
    );

    const types = events.map((event) => event.type);
    expect(types).toContain('status');
    expect(types).toContain('chunk');
    expect(types[types.length - 1]).toBe('complete');

    const complete = events.find((event) => event.type === 'complete');
    expect(complete?.content).toContain('Crimson Court');
  });

  it('errors when no reference drafts are provided', async () => {
    const events = await drain(GenerationService.generateLorebook({ draft_ids: [], blueprint_content: 'bp' }));
    expect(events[0]).toMatchObject({ type: 'error' });
  });
});
