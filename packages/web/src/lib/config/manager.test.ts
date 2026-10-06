import { beforeEach, describe, expect, it } from 'vitest';
import { ConfigManager } from './manager';

describe('ConfigManager feature blueprint persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('uses path-based built-in defaults for persisted feature blueprints', () => {
    const manager = new ConfigManager();
    const config = manager.getConfig();

    expect(config.batch.rate_limit_delay).toBe(1);
    expect(config.feature_blueprints?.orchestration).toBe('blueprints/system/generator.md');
    expect(config.feature_blueprints?.seed_generation).toBe('blueprints/system/seed_generator.md');
    expect(config.feature_blueprints?.offspring_generation).toBe('blueprints/system/offspring_generator.md');
    expect(config.feature_blueprints?.worldbook_generation).toBe('blueprints/system/lorebook_generator.md');
    expect(config.feature_blueprints?.intro_scene_generation).toBe('blueprints/system/intro_scene.md');
  });

  it('normalizes legacy feature blueprint aliases and persists them across reloads', () => {
    const manager = new ConfigManager();

    manager.updateConfig({
      feature_blueprints: {
        orchestration: 'generator',
        seed_generation: 'seed_generator',
        offspring_generation: 'offspring_generator',
        worldbook_generation: 'lorebook_generator',
        intro_scene_generation: 'intro_scene',
      },
    });

    const reloaded = new ConfigManager();
    const config = reloaded.getConfig();

    expect(config.feature_blueprints?.orchestration).toBe('blueprints/system/generator.md');
    expect(config.feature_blueprints?.seed_generation).toBe('blueprints/system/seed_generator.md');
    expect(config.feature_blueprints?.offspring_generation).toBe('blueprints/system/offspring_generator.md');
    expect(config.feature_blueprints?.worldbook_generation).toBe('blueprints/system/lorebook_generator.md');
    expect(config.feature_blueprints?.intro_scene_generation).toBe('blueprints/system/intro_scene.md');
  });
});

describe('ConfigManager Chub config', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ships defaults and merges partial updates without losing fields', () => {
    const manager = new ConfigManager();
    expect(manager.getConfig().chub).toMatchObject({
      base_url: 'https://gateway.chub.ai',
      api_token: '',
      publish_token: '',
      username: '',
    });

    manager.updateChubConfig({ api_token: 'sess-1' });
    manager.updateChubConfig({ username: 'maeve' });

    const config = manager.getConfig().chub;
    expect(config?.api_token).toBe('sess-1');
    expect(config?.username).toBe('maeve');
    expect(config?.base_url).toBe('https://gateway.chub.ai');
  });

  it('persists across manager reloads', () => {
    const manager = new ConfigManager();
    manager.updateChubConfig({ api_token: 'sess-2', username: 'maeve', verified_at: '2026-10-06T00:00:00.000Z' });

    const reloaded = new ConfigManager();
    expect(reloaded.getConfig().chub).toMatchObject({
      api_token: 'sess-2',
      username: 'maeve',
      verified_at: '2026-10-06T00:00:00.000Z',
    });
  });
});
