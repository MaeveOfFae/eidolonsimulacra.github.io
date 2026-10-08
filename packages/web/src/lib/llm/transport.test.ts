import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getRuntimeLLMFetch,
  isRuntimeLLMStreamingSupported,
  setRuntimeLLMFetch,
  setRuntimeLLMStreamingSupported,
} from '@char-gen/shared';
import { installDesktopLLMFetch } from './transport';

const { nativeFetch } = vi.hoisted(() => ({
  nativeFetch: vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
    Promise.resolve(new Response('{}', { status: 200 })),
  ),
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
    setRuntimeLLMStreamingSupported(true);
    nativeFetch.mockClear();
  });

  it('swaps provider calls to native HTTP on desktop and marks the transport non-streaming', async () => {
    setRuntimeLLMStreamingSupported(true);

    installDesktopLLMFetch();

    const response = await getRuntimeLLMFetch()('http://localhost:11434/v1/models', { method: 'GET' });

    expect(nativeFetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    // The native plugin buffers the body, so a streaming request would stall
    // until it completed — engines must run one non-streaming completion.
    expect(isRuntimeLLMStreamingSupported()).toBe(false);
  });
});
