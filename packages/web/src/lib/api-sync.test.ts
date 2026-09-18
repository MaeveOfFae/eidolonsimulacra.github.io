import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./services/generation.js', () => ({
  GenerationService: {},
}));

vi.mock('./storage/draft-db.js', () => ({
  DraftStorage: {
    getAllMetadata: vi.fn(),
    getDraft: vi.fn(),
    saveDraft: vi.fn(),
  },
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
    syncDrafts: vi.fn(),
    pullConfig: vi.fn(),
    pullApiKeys: vi.fn(),
  },
}));

import { api } from './api';
import { configManager } from './config/manager';
import { queueAutoSync } from './server/auto-sync.js';
import { serverClient } from './server/client.js';
import { DraftStorage } from './storage/draft-db.js';

describe('sync-backed browser persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
    configManager.clearAll();
    vi.mocked(serverClient.isEnabled).mockReturnValue(true);
    vi.mocked(serverClient.hasAccessToken).mockReturnValue(true);
    vi.mocked(serverClient.syncTemplates).mockResolvedValue({ templates: [] });
    vi.mocked(serverClient.syncBlueprints).mockResolvedValue({ blueprints: [] });
    vi.mocked(serverClient.syncDrafts).mockResolvedValue({ drafts: [] });
    vi.mocked(serverClient.pullConfig).mockResolvedValue({ config: {} });
    vi.mocked(serverClient.pullApiKeys).mockResolvedValue({ apiKeys: {} });
    vi.mocked(DraftStorage.getAllMetadata).mockResolvedValue([]);
    vi.mocked(DraftStorage.getDraft).mockResolvedValue(null);
    vi.mocked(DraftStorage.saveDraft).mockResolvedValue(undefined);
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

  it('hydrates synced config and replaces API keys from the server', async () => {
    await api.updateConfig({
      model: 'openrouter/openai/gpt-4o-mini',
      api_keys: {
        openrouter: 'local-openrouter-key',
        openai: 'stale-local-key',
      },
    });

    vi.mocked(serverClient.pullConfig).mockResolvedValue({
      config: {
        model: 'openai/gpt-4.1-mini',
        engine_mode: 'explicit',
        engine: 'openai',
      },
    });
    vi.mocked(serverClient.pullApiKeys).mockResolvedValue({
      apiKeys: {
        openai: 'remote-openai-key',
      },
    });

    const changed = await api.syncConfigFromServer();
    const config = await api.getConfig();

    expect(changed).toBe(true);
    expect(config.model).toBe('openai/gpt-4.1-mini');
    expect(config.api_keys).toEqual({
      openai: 'remote-openai-key',
    });
  });

  it('hydrates synced drafts with saved instructions and send order fields', async () => {
    vi.mocked(serverClient.syncDrafts).mockResolvedValue({
      drafts: [
        {
          id: '9e30fdf4-2c0f-4fa3-8f68-672df908a948',
          reviewId: 'review-1',
          seed: 'remote seed',
          mode: 'NSFW',
          model: 'openrouter/test-model',
          characterName: 'Remote Character',
          templateName: 'V2/V3 Card',
          notes: 'remote notes',
          favorite: true,
          tags: ['remote'],
          customInstructions: 'Keep the voice severe.',
          componentSendOrder: ['post_history', 'system_prompt'],
          assets: {
            system_prompt: 'system prompt',
            post_history: 'post history',
          },
          createdAt: '2026-04-20T00:00:00.000Z',
          updatedAt: '2026-04-20T01:00:00.000Z',
        },
      ],
    });

    const changed = await (api as unknown as { syncDraftsFromServer: () => Promise<boolean> }).syncDraftsFromServer();

    expect(changed).toBe(true);
    expect(DraftStorage.saveDraft).toHaveBeenCalledWith(expect.objectContaining({
      metadata: expect.objectContaining({
        review_id: 'review-1',
        custom_instructions: 'Keep the voice severe.',
        component_send_order: ['post_history', 'system_prompt'],
      }),
    }));
  });

  it('creates a manual draft with local metadata and queues sync', async () => {
    const randomUuidSpy = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('11111111-1111-1111-1111-111111111111');

    await api.updateConfig({
      model: 'openrouter/test-model',
    });

    const draft = await api.createDraft({
      seed: '  hand-built draft seed  ',
      templateName: 'V2/V3 Card',
      mode: 'NSFW',
      characterName: '  Manual Character  ',
      genre: '  grimdark  ',
      notes: '  Keep the ritual language dense.  ',
    });

    expect(DraftStorage.saveDraft).toHaveBeenCalledWith(expect.objectContaining({
      path: '11111111-1111-1111-1111-111111111111',
      metadata: expect.objectContaining({
        review_id: '11111111-1111-1111-1111-111111111111',
        seed: 'hand-built draft seed',
        template_name: 'V2/V3 Card',
        mode: 'NSFW',
        character_name: 'Manual Character',
        genre: 'grimdark',
        notes: 'Keep the ritual language dense.',
        favorite: false,
        model: 'openrouter/test-model',
      }),
      assets: {},
    }));
    expect(queueAutoSync).toHaveBeenCalledWith('drafts');
    expect(draft.metadata.review_id).toBe('11111111-1111-1111-1111-111111111111');

    randomUuidSpy.mockRestore();
  });
});