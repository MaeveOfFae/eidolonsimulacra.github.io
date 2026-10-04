import type { Config, FeatureCategory } from '@char-gen/shared';

/**
 * Feature blueprint paths shipped with the app.
 *
 * This is the single source of truth: `configManager` seeds `feature_blueprints` from it,
 * and the settings screen compares against it to report how many features the user has
 * actually customised. Keeping one copy is what stopped the "N overrides configured"
 * metric from counting these five built-ins as user overrides.
 */
export const DEFAULT_FEATURE_BLUEPRINT_PATHS: Partial<Record<FeatureCategory, string>> = {
  orchestration: 'blueprints/system/generator.md',
  seed_generation: 'blueprints/system/seed_generator.md',
  offspring_generation: 'blueprints/system/offspring_generator.md',
  worldbook_generation: 'blueprints/system/lorebook_generator.md',
  intro_scene_generation: 'blueprints/system/intro_scene.md',
};

/**
 * Counts the feature blueprints that point somewhere other than the shipped default.
 *
 * A feature counts once when it has a value that differs from the default — including a
 * feature that has no default at all (validation, similarity) once the user picks one.
 * Features that are unset, or set to "None (Built-in)", are not overrides: they fall back
 * to the built-in behaviour, so a fresh install reports zero.
 */
export function countFeatureBlueprintOverrides(featureBlueprints?: Config['feature_blueprints']): number {
  const current = (featureBlueprints ?? {}) as Record<string, string | undefined>;
  const defaults = DEFAULT_FEATURE_BLUEPRINT_PATHS as Record<string, string | undefined>;

  let overrides = 0;
  for (const feature of Object.keys(current)) {
    const value = current[feature];
    if (value === undefined) {
      continue;
    }

    if (value !== defaults[feature]) {
      overrides += 1;
    }
  }

  return overrides;
}
