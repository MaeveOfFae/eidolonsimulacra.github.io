import type { Config } from '@char-gen/shared';
import { configManager } from '@/lib/config/manager';
import { DEFAULT_FEATURE_BLUEPRINT_PATHS, countFeatureBlueprintOverrides } from './defaults';

type FeatureBlueprints = Config['feature_blueprints'];

describe('countFeatureBlueprintOverrides', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configManager.clearAll();
  });

  it('reports zero for a fresh install, whose blueprints are the shipped defaults', () => {
    const shipped = configManager.getConfig().feature_blueprints;

    expect(shipped).toEqual(DEFAULT_FEATURE_BLUEPRINT_PATHS);
    expect(countFeatureBlueprintOverrides(shipped)).toBe(0);
  });

  it('counts a feature whose path differs from the default', () => {
    const blueprints = {
      ...DEFAULT_FEATURE_BLUEPRINT_PATHS,
      orchestration: 'blueprints/custom/orchestrator.md',
    } as FeatureBlueprints;

    expect(countFeatureBlueprintOverrides(blueprints)).toBe(1);
  });

  it('does not count a feature that falls back to the built-in behaviour', () => {
    // "None (Built-in)" clears the value, which is not a custom path.
    const blueprints = { ...DEFAULT_FEATURE_BLUEPRINT_PATHS, orchestration: undefined } as FeatureBlueprints;

    expect(countFeatureBlueprintOverrides(blueprints)).toBe(0);
  });

  it('counts a feature with no default only once the user picks one', () => {
    expect(countFeatureBlueprintOverrides({ ...DEFAULT_FEATURE_BLUEPRINT_PATHS })).toBe(0);
    expect(
      countFeatureBlueprintOverrides({
        ...DEFAULT_FEATURE_BLUEPRINT_PATHS,
        validation: 'blueprints/custom/validator.md',
      }),
    ).toBe(1);
  });

  it('treats missing blueprints as no overrides', () => {
    expect(countFeatureBlueprintOverrides(undefined)).toBe(0);
    expect(countFeatureBlueprintOverrides({})).toBe(0);
  });
});
