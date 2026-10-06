import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultComfyUIConfig } from '@char-gen/shared';
import { nextRenderAssetName, runComfyVariationBatch } from './run';

const jsonResponse = (payload: unknown) =>
  new Response(JSON.stringify(payload), { status: 200, headers: { 'Content-Type': 'application/json' } });

/** Fixture transport covering /prompt, /history/{id} and /view. */
function makeComfyFetch() {
  let promptCounter = 0;
  return vi.fn(async (url: string) => {
    if (url.endsWith('/prompt')) {
      promptCounter += 1;
      return jsonResponse({ prompt_id: `p-${promptCounter}`, number: promptCounter });
    }
    const historyMatch = url.match(/\/history\/([^/]+)$/);
    if (historyMatch) {
      const promptId = historyMatch[1]!;
      return jsonResponse({
        [promptId]: {
          prompt_id: promptId,
          outputs: { '8': { images: [{ filename: `${promptId}.png`, subfolder: '', type: 'output' }] } },
          status: { completed: true, status_str: 'success' },
        },
      });
    }
    if (url.includes('/view')) {
      return new Response(new Blob(['png'], { type: 'image/png' }), { status: 200 });
    }
    throw new Error(`unexpected url ${url}`);
  });
}

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => `blob:${Math.random().toString(36).slice(2)}`);
  URL.revokeObjectURL = vi.fn();
});

describe('runComfyVariationBatch', () => {
  it('runs a pinned seed ladder across the batch', async () => {
    const batch = await runComfyVariationBatch({
      config: createDefaultComfyUIConfig(),
      a1111Content: '1girl\nuniform\nindoors\nstanding\nportrait',
      seed: 100,
      count: 3,
      fetchFn: makeComfyFetch(),
    });

    expect(batch.errors).toEqual([]);
    expect(batch.results).toHaveLength(3);
    expect(batch.results.map((result) => result.seed)).toEqual([100, 101, 102]);
    expect(new Set(batch.results.map((result) => result.promptId)).size).toBe(3);
    for (const result of batch.results) {
      expect(result.images).toHaveLength(1);
      expect(result.objectUrls).toHaveLength(1);
    }
  });

  it('gives every variation its own seed when none is pinned', async () => {
    const batch = await runComfyVariationBatch({
      config: createDefaultComfyUIConfig(),
      a1111Content: '1girl\nuniform\nindoors\nstanding\nportrait',
      count: 2,
      fetchFn: makeComfyFetch(),
    });

    expect(batch.results).toHaveLength(2);
    expect(batch.results[0]!.seed).not.toBe(batch.results[1]!.seed);
  });

  it('clamps the count into 1–4 and collects failures without rejecting', async () => {
    const failingFetch = vi.fn(async () => {
      throw new Error('server refused');
    }) as never as Parameters<typeof runComfyVariationBatch>[0]['fetchFn'];

    const batch = await runComfyVariationBatch({
      config: createDefaultComfyUIConfig(),
      a1111Content: '1girl\nuniform\nindoors\nstanding\nportrait',
      count: 9,
      fetchFn: failingFetch,
    });

    expect(batch.results).toEqual([]);
    expect(batch.errors).toHaveLength(4);
    expect(batch.errors[0]).toMatch(/server refused/);
  });
});

describe('nextRenderAssetName', () => {
  it('increments past the highest saved render and ignores other assets', () => {
    expect(nextRenderAssetName({})).toBe('render_1');
    expect(nextRenderAssetName({ card_image: 'data:…', render_1: 'data:…' })).toBe('render_2');
    expect(nextRenderAssetName({ render_1: 'a', render_3: 'b', character_sheet: 'x' })).toBe('render_4');
  });
});
