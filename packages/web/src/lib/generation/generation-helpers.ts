/**
 * Pure helpers for the generation screen.
 *
 * Extracted from `Generation` (5.0 workspace-release work stream: the screen carried them
 * ahead of the component itself). They resolve the blueprint paths a new draft starts
 * from and the template asset selection defaults, and are unit tested directly.
 */

import type { FeatureCategory, Template } from '@char-gen/shared';
import { configManager } from '@/lib/config/manager';

export const FEATURE_PREFERRED_PATHS: Partial<Record<FeatureCategory, string>> = {
  orchestration: 'blueprints/system/generator.md',
  intro_scene_generation: 'blueprints/system/intro_scene.md',
};

export function getInitialGenerationBlueprintPaths(): Partial<Record<FeatureCategory, string>> {
  const configured = configManager.getConfig().feature_blueprints;

  return {
    orchestration: configured?.orchestration || FEATURE_PREFERRED_PATHS.orchestration,
    intro_scene_generation: configured?.intro_scene_generation || FEATURE_PREFERRED_PATHS.intro_scene_generation,
  };
}

export function getDefaultSelectedTemplateAssets(templateDefinition?: Template): string[] {
  if (!templateDefinition) {
    return [];
  }

  return templateDefinition.assets
    .filter((asset) => {
      if (asset.required) {
        return true;
      }

      // Keep these optional by default for the built-in generation flow.
      if (asset.name === 'system_prompt' || asset.name === 'post_history') {
        return false;
      }

      return true;
    })
    .map((asset) => asset.name);
}

export function normalizeAssetSelection(selection: readonly string[], templateDefinition?: Template): string[] {
  if (!templateDefinition) {
    return [];
  }

  const templateAssetNames = new Set(templateDefinition.assets.map((asset) => asset.name));
  const requiredNames = new Set(templateDefinition.assets.filter((asset) => asset.required).map((asset) => asset.name));
  const selected = new Set<string>();

  selection.forEach((name) => {
    if (templateAssetNames.has(name)) {
      selected.add(name);
    }
  });

  requiredNames.forEach((name) => selected.add(name));

  return templateDefinition.assets.map((asset) => asset.name).filter((name) => selected.has(name));
}
