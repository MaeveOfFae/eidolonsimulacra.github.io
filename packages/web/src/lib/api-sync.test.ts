import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./services/generation.js', () => ({
  GenerationService: {},
}));

vi.mock('./storage/draft-db.js', () => ({
  DraftStorage: {},
}));

vi.mock('./server/auto-sync.js', () => ({
  queueAutoSync: vi.fn(),
}));

vi.mock('./server/client.js', () => ({
  serverClient: {
    isEnabled: vi.fn(),
    hasAccessToken: vi.fn(),
    syncTemplates: vi.fn(),
    syncBlueprints: vi.fn(),
  },
}));

import { api } from './api';
import { serverClient } from './server/client.js';

describe('sync-backed browser persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(serverClient.isEnabled).mockReturnValue(true);
    vi.mocked(serverClient.hasAccessToken).mockReturnValue(true);
    vi.mocked(serverClient.syncTemplates).mockResolvedValue({ templates: [] });
    vi.mocked(serverClient.syncBlueprints).mockResolvedValue({ blueprints: [] });
  });

  it('hydrates synced templates from camelCase server payloads', async () => {
    vi.mocked(serverClient.syncTemplates).mockResolvedValue({
      templates: [
        {
          name: 'Synced Upload',
          version: '1.2.3',
          description: 'Imported from another session',
          isOfficial: false,
          isDefault: false,
          assets: [
            {
              name: 'intro_scene',
              required: true,
              depends_on: [],
              description: 'Intro scene asset',
              blueprint_file: 'intro_scene.md',
            },
          ],
          blueprintContent: {
            'intro_scene.md': 'synced blueprint content',
          },
        },
      ],
    });

    const templates = await api.getTemplates();
    const syncedTemplate = templates.find((entry) => entry.name === 'Synced Upload');
    const blueprintContents = await api.getTemplateBlueprintContents('Synced Upload');

    expect(syncedTemplate).toMatchObject({
      name: 'Synced Upload',
      version: '1.2.3',
      description: 'Imported from another session',
      is_official: false,
      is_default: false,
    });
    expect(blueprintContents.blueprint_contents).toEqual({
      'intro_scene.md': 'synced blueprint content',
    });
  });

  it('persists synced custom blueprints and remote overrides under local paths', async () => {
    vi.mocked(serverClient.syncBlueprints).mockResolvedValue({
      blueprints: [
        {
          path: 'blueprints/custom/remote_note.md',
          name: 'Remote Note',
          description: 'A synced custom blueprint',
          invokable: true,
          version: '1.0',
          category: 'custom',
          isBuiltin: false,
          content: [
            '---',
            'name: Remote Note',
            'description: A synced custom blueprint',
            'version: 1.0',
            'invokable: true',
            '---',
            '',
            'Remote content',
          ].join('\n'),
        },
        {
          path: 'blueprints/overrides/system/generator.md',
          name: 'Generator Override',
          description: 'Remote override for the built-in generator',
          invokable: true,
          version: '1.0',
          category: 'custom',
          isBuiltin: false,
          content: [
            '---',
            'name: Generator Override',
            'description: Remote override for the built-in generator',
            'version: 1.0',
            'invokable: true',
            '---',
            '',
            'Override content',
          ].join('\n'),
        },
      ],
    });

    const blueprints = await api.getBlueprints();
    const customBlueprint = await api.getBlueprint('blueprints/custom/remote_note.md');
    const overriddenBlueprint = await api.getBlueprint('blueprints/system/generator.md');

    expect(blueprints.core.some((entry) => entry.path === 'blueprints/custom/remote_note.md')).toBe(true);
    expect(customBlueprint.name).toBe('Remote Note');
    expect(api.hasBlueprintOverride('blueprints/system/generator.md')).toBe(true);
    expect(overriddenBlueprint.content).toContain('Override content');
  });
});