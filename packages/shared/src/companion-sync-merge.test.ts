import { describe, expect, it } from 'vitest';
import {
  planAdditiveApiKeyMerge,
  planAdditiveBlueprintOverrideMerge,
  planAdditiveConfigMerge,
  planAdditiveDraftMerge,
  planAdditiveTemplateMerge,
  type AdditiveConfigDefaultState,
} from './companion-sync-merge';
import { buildStoredTemplateRecord } from './content-runtime';
import type { Config, Draft, WorkspaceBundleTemplateRecord } from './index';

function createDraft(reviewId: string, name: string, overrides: Partial<Draft> = {}): Draft {
  return {
    path: reviewId,
    metadata: {
      review_id: reviewId,
      seed: name,
      favorite: false,
      character_name: name,
      ...(overrides.metadata ?? {}),
    },
    assets: {
      description: name,
      ...(overrides.assets ?? {}),
    },
  };
}

function createTemplateRecord(name: string, blueprintContent: string): WorkspaceBundleTemplateRecord {
  return buildStoredTemplateRecord({
    name,
    version: '1.0',
    description: `${name} description`,
    assets: [
      {
        name: 'description',
        required: true,
        depends_on: [],
        description: 'Description',
        blueprint_file: 'description.md',
      },
    ],
    blueprint_contents: {
      'description.md': blueprintContent,
    },
  });
}

describe('companion additive merge helpers', () => {
  it('splits drafts into identical, conflicting, and new groups', () => {
    const localDrafts = [createDraft('draft-1', 'Alpha'), createDraft('draft-2', 'Beta')];
    const incomingDrafts = [
      createDraft('draft-1', 'Alpha'),
      createDraft('draft-2', 'Beta Two'),
      createDraft('draft-3', 'Gamma'),
    ];

    const plan = planAdditiveDraftMerge(localDrafts, incomingDrafts);

    expect(plan.identicalReviewIds).toBe(1);
    expect(plan.conflictingReviewIds).toBe(1);
    expect(plan.newReviewIds).toBe(1);
    expect(plan.conflictingDrafts[0]?.metadata.review_id).toBe('draft-2');
    expect(plan.newDrafts[0]?.metadata.review_id).toBe('draft-3');
  });

  it('preserves both templates when names conflict but content differs', () => {
    const localStored = [createTemplateRecord('Character Card', 'local blueprint')];
    const localAll = [...localStored];
    const incoming = [
      createTemplateRecord('Character Card', 'incoming blueprint'),
      createTemplateRecord('Lore Card', 'new blueprint'),
      createTemplateRecord('Character Card', 'incoming blueprint'),
    ];

    const plan = planAdditiveTemplateMerge(localStored, localAll, incoming);

    expect(plan.identicalNames).toBe(0);
    expect(plan.conflictingNames).toBe(2);
    expect(plan.newNames).toBe(1);
    expect(plan.conflictingTemplates[0]?.importedName).toBe('Character Card Copy');
    expect(plan.conflictingTemplates[1]?.importedName).toBe('Character Card Copy 2');
    expect(plan.newTemplateNames).toEqual(['Lore Card']);
  });

  it('preserves blueprint conflicts as copies and distinguishes overrides from new paths', () => {
    const plan = planAdditiveBlueprintOverrideMerge(
      { 'blueprints/custom/existing.md': 'local override' },
      {
        'blueprints/custom/existing.md': 'incoming override',
        'blueprints/system/generator.md': 'incoming generator override',
        'blueprints/custom/fresh.md': 'fresh custom blueprint',
      },
      {
        knownPaths: ['blueprints/custom/existing.md', 'blueprints/system/generator.md'],
        resolveOriginalContent: (path) => (path === 'blueprints/system/generator.md' ? 'builtin generator' : null),
      },
    );

    expect(plan.conflictingPaths).toBe(1);
    expect(plan.overridingPaths).toBe(1);
    expect(plan.newPaths).toBe(1);
    expect(plan.conflictingBlueprints[0]?.importedPath).toBe('blueprints/custom/existing_sync.md');
    expect(plan.overridingBlueprintPaths).toEqual(['blueprints/system/generator.md']);
    expect(plan.newBlueprintPaths).toEqual(['blueprints/custom/fresh.md']);
  });

  it('only fills missing/default config values and missing api keys', () => {
    const defaultConfig: AdditiveConfigDefaultState = {
      engine: 'openai_compatible',
      engine_mode: 'auto',
      model: 'openrouter/openai/gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 4096,
      batch: {
        max_concurrent: 3,
        rate_limit_delay: 1,
      },
      feature_blueprints: {
        orchestration: 'blueprints/system/generator.md',
      },
    };
    const currentConfig: Config = {
      ...defaultConfig,
      api_keys: {},
      batch: {
        max_concurrent: 3,
        rate_limit_delay: 1,
      },
      feature_blueprints: {
        orchestration: 'blueprints/system/generator.md',
      },
    };
    const incomingConfig: Omit<Config, 'api_keys'> = {
      ...currentConfig,
      engine: 'anthropic',
      model: 'claude-sonnet',
      temperature: 0.4,
      batch: {
        max_concurrent: 5,
        rate_limit_delay: 2,
      },
      feature_blueprints: {
        orchestration: 'blueprints/custom/orchestrator.md',
      },
      base_url: 'http://192.168.1.10:48231',
    };

    const configPlan = planAdditiveConfigMerge(currentConfig, incomingConfig, defaultConfig);
    const keyPlan = planAdditiveApiKeyMerge(
      { openai: 'existing-key' },
      { openai: 'incoming-key', anthropic: 'new-key' },
    );

    expect(configPlan.importedCount).toBeGreaterThan(0);
    expect(configPlan.updates.engine).toBe('anthropic');
    expect(configPlan.updates.model).toBe('claude-sonnet');
    expect(configPlan.modelWillChange).toBe(true);
    expect(keyPlan.importedKeys).toEqual({ anthropic: 'new-key' });
    expect(keyPlan.importedCount).toBe(1);
  });
});
