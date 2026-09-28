import { beforeEach, describe, expect, it } from 'vitest';
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

  it('does not sync from a server in browser-only mode', async () => {
    expect(await api.syncConfigFromServer()).toBe(false);
  });
});
