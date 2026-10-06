import { afterEach, describe, expect, it, vi } from 'vitest';
import { getRuntimeLLMFetch, setRuntimeLLMFetch } from '@char-gen/shared';
import { installDesktopLLMFetch } from './transport';

const { nativeFetch } = vi.hoisted(() => ({
  nativeFetch: vi.fn(async () => Promise.resolve(new Response('{}', { status: 200 }))),
}));

vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: (input: RequestInfo | URL, init?: RequestInit) => nativeFetch(input, init),
}));

vi.mock('@/lib/runtime', () => ({
  isDesktopRuntime: () => true,
}));

describe('desktop llm transport', () => {
  afterEach(() => {
    setRuntimeLLMFetch(undefined);
    nativeFetch.mockClear();
  });

  it('swaps provider calls to native HTTP on desktop, bypassing webview CORS', async () => {
    installDesktopLLMFetch();

    const response = await getRuntimeLLMFetch()('http://localhost:11434/v1/models', { method: 'GET' });

    expect(nativeFetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });
});
