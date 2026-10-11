import { afterEach, describe, expect, it, vi } from 'vitest';
import { describeComfyTransportError, getComfyFetch } from './transport';

const { runtime, nativeFetch } = vi.hoisted(() => ({
  runtime: { desktop: true },
  nativeFetch: vi.fn(async (_input: string, _init?: RequestInit) => new Response('{}', { status: 200 })),
}));

vi.mock('@/lib/runtime', () => ({
  isDesktopRuntime: () => runtime.desktop,
}));

vi.mock('@tauri-apps/plugin-http', () => ({
  fetch: (input: string, init?: RequestInit) => nativeFetch(input, init),
}));

afterEach(() => {
  runtime.desktop = true;
  nativeFetch.mockClear();
  vi.unstubAllGlobals();
});

describe('getComfyFetch', () => {
  it('routes ComfyUI requests through the native HTTP plugin on desktop', async () => {
    runtime.desktop = true;

    const response = await getComfyFetch()('http://127.0.0.1:8188/system_stats');

    expect(nativeFetch).toHaveBeenCalledWith('http://127.0.0.1:8188/system_stats', undefined);
    expect(response.status).toBe(200);
  });

  it('uses the runtime fetch in the browser', async () => {
    runtime.desktop = false;
    const browserFetch = vi.fn(async (_input: string, _init?: RequestInit) => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', browserFetch);

    await getComfyFetch()('http://127.0.0.1:8188/system_stats');

    expect(browserFetch).toHaveBeenCalledTimes(1);
    expect(nativeFetch).not.toHaveBeenCalled();
  });
});

describe('describeComfyTransportError', () => {
  it('names the desktop HTTP allowlist when the scope denies the URL', () => {
    runtime.desktop = true;

    const message = describeComfyTransportError(
      'url not allowed on the configured scope: http://127.0.0.1:8188/system_stats',
    );

    // Tauri serializes this as a plain string, so it must survive instanceof checks.
    expect(message).toMatch(/allowlist/i);
    expect(message).toContain('http://127.0.0.1:8188/system_stats');
  });

  it('tells the user to check the server when the desktop plugin cannot connect', () => {
    runtime.desktop = true;

    const message = describeComfyTransportError('error sending request for url (http://127.0.0.1:8188/system_stats)');

    expect(message).toMatch(/Could not reach ComfyUI/);
  });

  it('explains the CORS remedy when the browser blocks the request', () => {
    runtime.desktop = false;

    const message = describeComfyTransportError(new TypeError('Failed to fetch'));

    expect(message).toMatch(/--enable-cors-header/);
  });

  it('passes an unrecognised error message through', () => {
    const message = describeComfyTransportError(new Error('ComfyUI answered HTTP 500 from http://127.0.0.1:8188.'));

    expect(message).toBe('ComfyUI answered HTTP 500 from http://127.0.0.1:8188.');
  });

  it('falls back when the thrown value carries no message', () => {
    expect(describeComfyTransportError(null)).toBe('The request to ComfyUI failed.');
  });
});
