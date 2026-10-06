import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from './api';
import { configManager } from './config/manager';

describe('browser api: config', () => {
  beforeEach(() => {
    // `configManager` caches in memory, so clearing storage alone would leak
    // API keys between tests (and could trigger a real provider request).
    configManager.clearAll();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('exposes the same config synchronously and asynchronously', async () => {
    const snapshot = api.getConfigSnapshot();

    expect(typeof snapshot.model).toBe('string');
    expect(snapshot.model.length).toBeGreaterThan(0);
    expect(await api.getConfig()).toEqual(snapshot);
  });

  it('applies partial updates and persists them', async () => {
    const updated = await api.updateConfig({ model: 'gpt-4o-mini', temperature: 0.25 });

    expect(updated.model).toBe('gpt-4o-mini');
    expect(updated.temperature).toBe(0.25);
    expect(api.getConfigSnapshot().model).toBe('gpt-4o-mini');
    expect((await api.getConfig()).temperature).toBe(0.25);
  });

  it('round-trips api keys through updateConfig', async () => {
    const updated = await api.updateConfig({ api_keys: { openai: 'sk-test' } });

    expect(updated.api_keys?.openai).toBe('sk-test');
    expect(updated.model).toBe(api.getConfigSnapshot().model);
  });

  it('reports a missing api key instead of attempting a request', async () => {
    const result = await api.testConnection({ provider: 'openai' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('No API key configured');
  });

  it('does not demand a key for Ollama', async () => {
    // Local Ollama answers without auth; the request may fail (no server here)
    // but it must never be rejected as "No API key configured".
    const result = await api.testConnection({ provider: 'ollama' });

    expect(result.error ?? '').not.toContain('No API key configured');
  });

  it('lists Ollama models keylessly', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: [{ id: 'gemma4' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    try {
      const response = await api.getModels('ollama');

      expect(fetchMock).toHaveBeenCalled();
      expect(response.error).toBeUndefined();
      expect(response.models.map((model) => model.id)).toContain('gemma4');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('falls back to suggestions without a key and lists remotely with one', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(JSON.stringify({ data: [{ id: 'gemini-3.8-flash' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    try {
      const withoutKey = await api.getModels('google');
      expect(fetchMock).not.toHaveBeenCalled();
      expect(withoutKey.error).toBeUndefined();
      expect(withoutKey.models.map((model) => model.id)).toContain('gemini-3.8-flash');

      configManager.setApiKey('google', 'goog-test');
      const withKey = await api.getModels('google');
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
      expect(url).toContain('/models');
      expect((init.headers as Record<string, string>)['x-goog-api-key']).toBe('goog-test');
      expect(withKey.models.map((model) => model.id)).toEqual(['gemini-3.8-flash']);
      expect(withKey.error).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('does not sync from a server in browser-only mode', async () => {
    expect(await api.syncConfigFromServer()).toBe(false);
  });
});
