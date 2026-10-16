import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEngine } from './factory';
import { fetchProviderModels } from './models';
import { getRuntimeLLMFetch, setRuntimeLLMFetch, type LLMFetch } from './transport';

function jsonOnce(body: unknown): ReturnType<typeof vi.fn> {
  return vi.fn(async () =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
}

describe('runtime llm fetch', () => {
  afterEach(() => {
    setRuntimeLLMFetch(undefined);
    vi.unstubAllGlobals();
  });

  it('routes provider model listing through the installed runtime fetch', async () => {
    const runtimeFetch = jsonOnce({ data: [{ id: 'local-a' }] });
    setRuntimeLLMFetch(runtimeFetch as unknown as LLMFetch);

    const response = await fetchProviderModels('ollama', '', 'http://localhost:11434/v1');

    expect(runtimeFetch).toHaveBeenCalledTimes(1);
    const [url] = runtimeFetch.mock.calls[0] as unknown as [RequestInfo | URL];
    expect(String(url)).toBe('http://localhost:11434/v1/models');
    expect(response.models.map((model) => model.id)).toEqual(['local-a']);
  });

  it('routes engine requests through the installed runtime fetch', async () => {
    const runtimeFetch = jsonOnce({});
    setRuntimeLLMFetch(runtimeFetch as unknown as LLMFetch);

    const result = await createEngine({ provider: 'ollama', model: 'gemma4' }).testConnection();

    expect(result.success).toBe(true);
    expect(runtimeFetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to the environment fetch when nothing is installed', async () => {
    const envFetch = jsonOnce({});
    vi.stubGlobal('fetch', envFetch);

    const result = await createEngine({ provider: 'ollama', model: 'gemma4' }).testConnection();

    expect(result.success).toBe(true);
    expect(envFetch).toHaveBeenCalledTimes(1);
    expect(getRuntimeLLMFetch()).toBeTypeOf('function');
  });
});
