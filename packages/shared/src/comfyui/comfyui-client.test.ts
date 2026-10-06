import { describe, expect, it, vi } from 'vitest';
import {
  comfyListCheckpoints,
  comfyQueuePrompt,
  comfySystemStats,
  comfyUploadImage,
  comfyViewUrl,
  comfyWaitForImages,
  describeComfyValidationError,
  normalizeComfyBaseUrl,
  type ComfyFetch,
} from './client';
import { parseComfyWorkflowJson } from './workflow-json';
import { createDefaultComfyUIConfig, resolveComfyWorkflow } from './defaults';
import { BUILTIN_COMFY_WORKFLOW_DEFAULT } from './workflows';

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });

describe('normalizeComfyBaseUrl', () => {
  it('fills scheme and default host, strips trailing slashes', () => {
    expect(normalizeComfyBaseUrl('127.0.0.1:8188')).toBe('http://127.0.0.1:8188');
    expect(normalizeComfyBaseUrl('http://127.0.0.1:8188///')).toBe('http://127.0.0.1:8188');
    expect(normalizeComfyBaseUrl('  ')).toBe('http://127.0.0.1:8188');
    expect(normalizeComfyBaseUrl('https://gpu.lan:8288')).toBe('https://gpu.lan:8288');
  });
});

describe('comfyQueuePrompt', () => {
  it('posts the graph with a client id and returns the prompt id', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ prompt_id: 'p-1', number: 3 })) as unknown as ComfyFetch;
    const result = await comfyQueuePrompt({ baseUrl: 'http://x:8188', fetchFn }, BUILTIN_COMFY_WORKFLOW_DEFAULT);
    expect(result.prompt_id).toBe('p-1');

    const [url, init] = (fetchFn as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://x:8188/prompt');
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body)) as { prompt: unknown; client_id: string };
    expect(body.client_id).toBe('eidolon-simulacra');
    expect(body.prompt).toEqual(BUILTIN_COMFY_WORKFLOW_DEFAULT);
  });

  it('surfaces node errors readably on rejection', async () => {
    const fetchFn = (async () =>
      jsonResponse(
        { error: { message: 'Prompt outputs failed validation' }, node_errors: { '6': {}, '7': {} } },
        400,
      )) as ComfyFetch;
    await expect(comfyQueuePrompt({ baseUrl: 'http://x:8188', fetchFn }, {})).rejects.toThrow(
      /2 nodes reported errors/,
    );
  });
});

describe('describeComfyValidationError', () => {
  it('handles string errors and plain failures', () => {
    expect(describeComfyValidationError({ error: 'boom' })).toBe('boom');
    expect(describeComfyValidationError(undefined)).toContain('rejected');
  });
});

describe('comfyWaitForImages', () => {
  it('polls until the run completes and returns the saved images', async () => {
    let calls = 0;
    const fetchFn = (async () => {
      calls += 1;
      if (calls === 1) {
        return jsonResponse({});
      }
      return jsonResponse({
        'p-1': {
          prompt_id: 'p-1',
          outputs: { '8': { images: [{ filename: 'out.png', subfolder: '', type: 'output' }] } },
          status: { completed: true, status_str: 'success' },
        },
      });
    }) as ComfyFetch;

    const images = await comfyWaitForImages({ baseUrl: 'http://x:8188', fetchFn }, 'p-1', {
      pollIntervalMs: 1,
      timeoutMs: 1000,
    });
    expect(images).toEqual([{ filename: 'out.png', subfolder: '', type: 'output' }]);
    expect(calls).toBe(2);
  });

  it('throws when ComfyUI reports an execution error', async () => {
    const fetchFn = (async () =>
      jsonResponse({ 'p-2': { prompt_id: 'p-2', outputs: {}, status: { status_str: 'error' } } })) as ComfyFetch;
    await expect(
      comfyWaitForImages({ baseUrl: 'http://x:8188', fetchFn }, 'p-2', { pollIntervalMs: 1, timeoutMs: 500 }),
    ).rejects.toThrow(/execution error/);
  });
});

describe('comfyViewUrl / upload / stats / checkpoints', () => {
  it('builds the /view URL', () => {
    expect(comfyViewUrl('http://x:8188', { filename: 'a b.png', subfolder: 's', type: 'output' })).toBe(
      'http://x:8188/view?filename=a+b.png&subfolder=s&type=output',
    );
  });

  it('uploads a reference image as hand-built multipart data', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ name: 'ref.png', subfolder: '', type: 'input' }),
    ) as unknown as ComfyFetch;
    const uploaded = await comfyUploadImage(
      { baseUrl: 'http://x:8188', fetchFn },
      { name: 'ref.png', blob: new Blob(['pngbytes'], { type: 'image/png' }) },
    );
    expect(uploaded.name).toBe('ref.png');
    const [url, init] = (fetchFn as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://x:8188/upload/image');
    expect(init.method).toBe('POST');
    expect(String((init.headers as Record<string, string>)['Content-Type'])).toMatch(
      /^multipart\/form-data; boundary=/,
    );
    const bodyText = new TextDecoder().decode(init.body as Uint8Array);
    expect(bodyText).toContain('name="image"; filename="ref.png"');
    expect(bodyText).toContain('pngbytes');
  });

  it('reads system stats and checkpoint lists', async () => {
    const statsFn = (async () =>
      jsonResponse({
        system: { os: 'nt', python_version: '3.12', ram_total: 1 },
        devices: [{ name: 'cuda:0', vram_total: 2 }],
        version: '0.3.30',
      })) as ComfyFetch;
    const stats = await comfySystemStats({ baseUrl: 'http://x:8188', fetchFn: statsFn });
    expect(stats.deviceName).toBe('cuda:0');
    expect(stats.comfyVersion).toBe('0.3.30');

    const checkpointsFn = (async () =>
      jsonResponse({
        CheckpointLoaderSimple: { input: { required: { ckpt_name: [['a.safetensors', 'b.safetensors']] } } },
      })) as ComfyFetch;
    expect(await comfyListCheckpoints({ baseUrl: 'http://x:8188', fetchFn: checkpointsFn })).toEqual([
      'a.safetensors',
      'b.safetensors',
    ]);
  });
});

describe('parseComfyWorkflowJson', () => {
  it('accepts API-format graphs', () => {
    const graph = parseComfyWorkflowJson(JSON.stringify({ '1': { class_type: 'KSampler', inputs: { seed: 1 } } }));
    expect(graph['1']!.class_type).toBe('KSampler');
  });

  it('rejects editor-format exports with the right guidance', () => {
    expect(() => parseComfyWorkflowJson(JSON.stringify({ nodes: [], links: [] }))).toThrow(/Save \(API Format\)/);
    expect(() => parseComfyWorkflowJson('not json')).toThrow(/not valid JSON/);
    expect(() => parseComfyWorkflowJson(JSON.stringify({ '1': { inputs: {} } }))).toThrow(/class_type/);
    expect(() => parseComfyWorkflowJson('{}')).toThrow(/no nodes/);
  });
});

describe('comfy defaults', () => {
  it('creates a fully-populated config', () => {
    const config = createDefaultComfyUIConfig();
    expect(config.base_url).toBe('http://127.0.0.1:8188');
    expect(config.workflow_preset).toBe('default');
    expect(parseComfyWorkflowJson(config.workflow_json)).toEqual(BUILTIN_COMFY_WORKFLOW_DEFAULT);
  });

  it('resolves presets and reports custom-workflow parse failures', () => {
    expect(resolveComfyWorkflow(createDefaultComfyUIConfig()).ok).toBe(true);
    const custom = { ...createDefaultComfyUIConfig(), workflow_preset: 'custom' as const, workflow_json: '{' };
    const failed = resolveComfyWorkflow(custom);
    expect(failed.ok).toBe(false);
    expect(failed.ok === false && failed.error).toMatch(/not valid JSON/);
  });
});
