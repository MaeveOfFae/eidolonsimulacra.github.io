import { describe, expect, it } from 'vitest';
import {
  MAX_COMFY_RENDER_HISTORY,
  appendComfyRenderRecord,
  normalizeComfyRenderHistory,
  type ComfyRenderRecord,
} from './history';

const RECORD: ComfyRenderRecord = {
  prompt_id: 'p-1',
  seed: 42,
  rendered_at: '2026-10-06T12:00:00.000Z',
  workflow_preset: 'dual-encoder-ipadapter',
  image_count: 1,
  images: [{ filename: 'out.png', subfolder: '', type: 'output' }],
};

describe('normalizeComfyRenderHistory', () => {
  it('keeps well-formed records and drops junk', () => {
    const records = normalizeComfyRenderHistory([
      RECORD,
      null,
      'nope',
      { prompt_id: 'x' },
      { ...RECORD, images: [{ filename: 'ok.png', subfolder: 's', type: 'output' }, { filename: 1 }] },
    ]);
    expect(records).toHaveLength(2);
    expect(records[1]!.images).toEqual([{ filename: 'ok.png', subfolder: 's', type: 'output' }]);
  });

  it('normalizes unknown presets to default and non-arrays to empty', () => {
    expect(normalizeComfyRenderHistory([{ ...RECORD, workflow_preset: 'weird' }])[0]!.workflow_preset).toBe('default');
    expect(normalizeComfyRenderHistory(undefined)).toEqual([]);
  });
});

describe('appendComfyRenderRecord', () => {
  it('prepends newest-first and caps the list', () => {
    let history: unknown = [];
    for (let index = 0; index < MAX_COMFY_RENDER_HISTORY + 5; index += 1) {
      history = appendComfyRenderRecord(history, { ...RECORD, prompt_id: `p-${index}`, seed: index });
    }
    const records = normalizeComfyRenderHistory(history);
    expect(records).toHaveLength(MAX_COMFY_RENDER_HISTORY);
    expect(records[0]!.prompt_id).toBe(`p-${MAX_COMFY_RENDER_HISTORY + 4}`);
  });
});
