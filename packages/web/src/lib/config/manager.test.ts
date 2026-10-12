import { beforeEach, describe, expect, it } from 'vitest';
import {
  DASHBOARD_PANELS,
  createDefaultDashboard,
  isDashboardDefault,
  setPanelVisibility,
  swapPanels,
} from '../dashboard';
import { ConfigManager } from './manager';

describe('ConfigManager dashboard layout', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('ships the default layout and reports it back unchanged', () => {
    const manager = new ConfigManager();

    expect(manager.getDashboard()).toEqual(createDefaultDashboard());
    expect(isDashboardDefault(manager.getDashboard())).toBe(true);
  });

  it('persists a reordered layout across reloads', () => {
    const manager = new ConfigManager();
    const swapped = swapPanels(manager.getDashboard(), 'supporting-tools', 'guided-help');

    manager.updateDashboard(swapped);

    expect(new ConfigManager().getDashboard()).toEqual(swapped);
  });

  it('persists a hidden panel across reloads', () => {
    const manager = new ConfigManager();
    manager.updateDashboard(setPanelVisibility(manager.getDashboard(), 'saved-searches', false));

    const reloaded = new ConfigManager().getDashboard();
    expect(reloaded.panels.find((panel) => panel.id === 'saved-searches')?.visible).toBe(false);
  });

  it('normalizes what it is handed, so a bad shape never reaches storage', () => {
    const manager = new ConfigManager();
    manager.updateDashboard({ panels: [{ id: 'not-a-panel', visible: true }] });

    expect(isDashboardDefault(manager.getDashboard())).toBe(true);
    expect(manager.getConfig().dashboard?.panels.some((panel) => panel.id === 'not-a-panel')).toBe(false);
  });

  it('drops a panel id written by an older build when reading it back', () => {
    localStorage.setItem(
      'eidolon.web.config',
      JSON.stringify({ dashboard: { panels: [{ id: 'ghost-panel', visible: true }] } }),
    );

    const loaded = new ConfigManager().getDashboard();

    expect(loaded.panels.map((panel) => panel.id)).toEqual(DASHBOARD_PANELS.map((panel) => panel.id));
    expect(isDashboardDefault(loaded)).toBe(true);
  });

  it('resets to the default layout, and resetting again changes nothing', () => {
    const manager = new ConfigManager();
    manager.updateDashboard(swapPanels(manager.getDashboard(), 'recent-drafts', 'in-flight'));
    expect(isDashboardDefault(manager.getDashboard())).toBe(false);

    manager.resetDashboard();
    expect(isDashboardDefault(manager.getDashboard())).toBe(true);

    manager.resetDashboard();
    expect(isDashboardDefault(manager.getDashboard())).toBe(true);
  });

  it('hands out copies, so a caller cannot mutate the shared default', () => {
    const manager = new ConfigManager();

    manager.getDashboard().panels.forEach((panel) => {
      panel.visible = false;
    });
    manager.getConfig().dashboard?.panels.forEach((panel) => {
      panel.visible = false;
    });

    expect(isDashboardDefault(new ConfigManager().getDashboard())).toBe(true);
  });
});

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
