import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchProviderModels, getFallbackModels } from './models';
import { listModels, normalizeModelsPayload, providerModelsUrl } from './openai-compat';

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('providerModelsUrl', () => {
  it('appends /v1/models for Anthropic and /models everywhere else', () => {
    expect(providerModelsUrl('anthropic', 'https://api.anthropic.com')).toBe('https://api.anthropic.com/v1/models');
    expect(providerModelsUrl('anthropic', 'https://api.anthropic.com/v1')).toBe('https://api.anthropic.com/v1/models');
    expect(providerModelsUrl('openai', 'https://api.openai.com/v1/')).toBe('https://api.openai.com/v1/models');
    expect(providerModelsUrl('google', 'https://generativelanguage.googleapis.com/v1beta')).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models',
    );
    expect(providerModelsUrl('ollama', 'https://ollama.com/v1')).toBe('https://ollama.com/v1/models');
    expect(providerModelsUrl('custom', 'http://localhost:11434/v1')).toBe('http://localhost:11434/v1/models');
  });
});

describe('normalizeModelsPayload', () => {
  it('reads the OpenAI-compatible data[] shape', () => {
    const entries = normalizeModelsPayload({
      data: [
        {
          id: 'gpt-6-astra',
          name: 'GPT-6 Astra',
          context_length: 1050000,
          architecture: { input_modalities: ['text', 'image'] },
          supported_parameters: ['tools'],
        },
        { id: null },
      ],
    });
    expect(entries).toEqual([
      {
        id: 'gpt-6-astra',
        name: 'GPT-6 Astra',
        context_length: 1050000,
        input_modalities: ['text', 'image'],
        supported_parameters: ['tools'],
      },
    ]);
  });

  it("reads Google's models[] shape and strips the models/ prefix", () => {
    const entries = normalizeModelsPayload({
      models: [
        { name: 'models/gemini-3.8-flash', displayName: 'Gemini 3.8 Flash', inputTokenLimit: 1048576 },
        { name: 'models/embedding-001', displayName: 'Embedding' },
        { displayName: 'No name entry' },
      ],
    });
    expect(entries).toEqual([
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', context_length: 1048576 },
      { id: 'embedding-001', name: 'Embedding' },
    ]);
  });

  it('returns nothing for unusable payloads', () => {
    expect(normalizeModelsPayload(null)).toEqual([]);
    expect(normalizeModelsPayload({})).toEqual([]);
    expect(normalizeModelsPayload({ error: 'nope' })).toEqual([]);
  });
});

describe('fetchProviderModels', () => {
  it('lists Anthropic models from /v1/models with the x-api-key header', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ data: [{ id: 'claude-opus-5-5' }] }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await fetchProviderModels('anthropic', 'sk-ant-test', 'https://api.anthropic.com');
    expect(response.models.map((model) => model.id)).toEqual(['claude-opus-5-5']);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.anthropic.com/v1/models');
    expect((init.headers as Record<string, string>)['x-api-key']).toBe('sk-ant-test');
  });

  it("parses Google's models[] payload", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({ models: [{ name: 'models/gemini-3.8-flash', displayName: 'Gemini 3.8 Flash' }] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const response = await fetchProviderModels(
      'google',
      'goog-test',
      'https://generativelanguage.googleapis.com/v1beta',
    );
    expect(response.models).toEqual([
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash',
        provider: 'google',
        context_length: undefined,
        supports_vision: false,
        supports_tools: false,
      },
    ]);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models');
    expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('goog-test');
  });

  it('surfaces the provider error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ error: { message: 'Invalid API key' } }, 401)),
    );
    await expect(fetchProviderModels('openai', 'bad', 'https://api.openai.com/v1')).rejects.toThrow('Invalid API key');
  });

  it('refuses to list Custom models without a base URL', async () => {
    await expect(fetchProviderModels('custom', '', '')).rejects.toThrow(/API base URL/);
  });
});

describe('listModels', () => {
  it('returns sorted ids from the data[] payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ data: [{ id: 'b' }, { id: 'a' }] })),
    );
    await expect(listModels('https://api.deepseek.com', 'sk')).resolves.toEqual(['a', 'b']);
  });

  it('treats 404 as an unsupported listing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({}, 404)),
    );
    await expect(listModels('http://localhost:11434/v1')).resolves.toEqual([]);
  });
});

describe('getFallbackModels', () => {
  it('maps the suggestion list into ModelsResponse entries', () => {
    const models = getFallbackModels('moonshot');
    expect(models.length).toBeGreaterThan(0);
    expect(models[0]).toMatchObject({ id: 'kimi-k3', provider: 'moonshot' });
  });
});
