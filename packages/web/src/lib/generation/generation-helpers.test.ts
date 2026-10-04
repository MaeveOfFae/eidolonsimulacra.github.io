import type { Template } from '@char-gen/shared';
import { configManager } from '@/lib/config/manager';
import {
  getDefaultSelectedTemplateAssets,
  getInitialGenerationBlueprintPaths,
  normalizeAssetSelection,
} from './generation-helpers';

const TEMPLATE = {
  name: 'V2/V3 Card',
  version: 1,
  is_official: true,
  assets: [
    { name: 'system_prompt', required: false, depends_on: [], description: 'System' },
    { name: 'personality', required: true, depends_on: [], description: 'Personality' },
    { name: 'post_history', required: false, depends_on: [], description: 'Post history' },
    { name: 'speech', required: false, depends_on: [], description: 'Speech' },
  ],
} as unknown as Template;

describe('getDefaultSelectedTemplateAssets', () => {
  it('selects every asset except the optional system prompt and post history', () => {
    expect(getDefaultSelectedTemplateAssets(TEMPLATE)).toEqual(['personality', 'speech']);
  });

  it('returns nothing without a template', () => {
    expect(getDefaultSelectedTemplateAssets(undefined)).toEqual([]);
  });
});

describe('normalizeAssetSelection', () => {
  it('drops unknown names and returns the selection in template order', () => {
    expect(normalizeAssetSelection(['speech', 'nope', 'personality'], TEMPLATE)).toEqual(['personality', 'speech']);
  });

  it('forces required assets back in even when the selection omitted them', () => {
    expect(normalizeAssetSelection(['speech'], TEMPLATE)).toEqual(['personality', 'speech']);
  });

  it('returns nothing without a template', () => {
    expect(normalizeAssetSelection(['speech'], undefined)).toEqual([]);
  });
});

describe('getInitialGenerationBlueprintPaths', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configManager.clearAll();
  });

  it('falls back to the preferred system blueprints', () => {
    expect(getInitialGenerationBlueprintPaths()).toEqual({
      orchestration: 'blueprints/system/generator.md',
      intro_scene_generation: 'blueprints/system/intro_scene.md',
    });
  });

  it('prefers configured blueprint overrides over the preferred paths', () => {
    configManager.updateConfig({
      feature_blueprints: {
        orchestration: 'blueprints/custom/orchestrator.md',
        intro_scene_generation: 'blueprints/custom/intro.md',
      },
    });

    expect(getInitialGenerationBlueprintPaths()).toEqual({
      orchestration: 'blueprints/custom/orchestrator.md',
      intro_scene_generation: 'blueprints/custom/intro.md',
    });
  });
});
