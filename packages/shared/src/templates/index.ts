/**
 * Template system for custom asset types.
 */

import type { AssetDefinition as TypesAssetDefinition, Template as TypesTemplate } from '../types';

// Re-export types from types/index with local type names to avoid conflicts
export type AssetDefinition = TypesAssetDefinition;
export type Template = TypesTemplate;
type TemplateAssetContext = Pick<TypesTemplate, 'name' | 'assets'>;

export const CREATOR_NOTES_ASSET_NAME = 'creator_notes';
export const LEGACY_CREATOR_NOTES_ASSET_NAME = 'intro_page';
const OFFICIAL_TEMPLATE_NAME = 'V2/V3 Card';

function templateUsesCreatorNotesAsset(template?: TemplateAssetContext | string): boolean {
  if (!template) {
    return false;
  }

  if (typeof template === 'string') {
    return template === OFFICIAL_TEMPLATE_NAME;
  }

  if (template.name === OFFICIAL_TEMPLATE_NAME) {
    return true;
  }

  if (template.assets.some((asset) => asset.name === CREATOR_NOTES_ASSET_NAME)) {
    return true;
  }

  if (template.assets.some((asset) => asset.name === LEGACY_CREATOR_NOTES_ASSET_NAME)) {
    return false;
  }

  return false;
}

export function canonicalizeLegacyAssetName(assetName: string): string {
  const trimmed = typeof assetName === 'string' ? assetName.trim() : '';
  if (!trimmed) {
    return '';
  }

  return trimmed === LEGACY_CREATOR_NOTES_ASSET_NAME ? CREATOR_NOTES_ASSET_NAME : trimmed;
}

export function normalizeAssetName(assetName: string, template?: TemplateAssetContext | string): string {
  const trimmed = typeof assetName === 'string' ? assetName.trim() : '';
  if (!trimmed) {
    return '';
  }

  if (trimmed === LEGACY_CREATOR_NOTES_ASSET_NAME && templateUsesCreatorNotesAsset(template)) {
    return CREATOR_NOTES_ASSET_NAME;
  }

  return trimmed;
}

export function normalizeAssetNameList(names: readonly string[], template?: TemplateAssetContext | string): string[] {
  const normalized: string[] = [];
  const seen = new Set<string>();

  for (const name of names) {
    const resolvedName = normalizeAssetName(name, template);
    if (!resolvedName || seen.has(resolvedName)) {
      continue;
    }

    seen.add(resolvedName);
    normalized.push(resolvedName);
  }

  return normalized;
}

export function normalizeAssetRecord(
  assets: Record<string, string>,
  template?: TemplateAssetContext | string,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  const sourceNames = new Map<string, string>();

  for (const [assetName, value] of Object.entries(assets)) {
    const resolvedName = normalizeAssetName(assetName, template);
    if (!resolvedName) {
      continue;
    }

    const existingSource = sourceNames.get(resolvedName);
    if (!existingSource) {
      normalized[resolvedName] = value;
      sourceNames.set(resolvedName, assetName);
      continue;
    }

    const existingValue = normalized[resolvedName] ?? '';
    const existingHasContent = existingValue.trim().length > 0;
    const nextHasContent = value.trim().length > 0;

    if (existingSource !== resolvedName && assetName === resolvedName) {
      if (nextHasContent || !existingHasContent) {
        normalized[resolvedName] = value;
      }
      sourceNames.set(resolvedName, assetName);
      continue;
    }

    if (!existingHasContent && nextHasContent) {
      normalized[resolvedName] = value;
      sourceNames.set(resolvedName, assetName);
    }
  }

  return normalized;
}

/**
 * Built-in V2/V3 Card template
 */
export const OFFICIAL_TEMPLATE: Template = {
  name: OFFICIAL_TEMPLATE_NAME,
  version: '3.1',
  description: 'Built-in character card template with 6 standard assets',
  is_official: true,
  assets: [
    {
      name: 'system_prompt',
      required: false,
      depends_on: [],
      description: 'System-level behavioral instructions',
      blueprint_file: 'blueprints/system/system_prompt.md',
    },
    {
      name: 'post_history',
      required: false,
      depends_on: ['system_prompt'],
      description: 'Conversation context and relationship state',
      blueprint_file: 'blueprints/system/post_history.md',
    },
    {
      name: 'character_sheet',
      required: true,
      depends_on: [],
      description: 'Structured character data',
      blueprint_file: 'blueprints/system/character_sheet.md',
    },
    {
      name: 'intro_scene',
      required: true,
      depends_on: ['character_sheet'],
      description: 'First interaction scenario',
      blueprint_file: 'blueprints/system/intro_scene.md',
    },
    {
      name: CREATOR_NOTES_ASSET_NAME,
      required: true,
      depends_on: ['character_sheet'],
      description: 'Creator notes section',
      blueprint_file: 'blueprints/system/creator_notes.md',
    },
    {
      name: 'a1111',
      required: true,
      depends_on: ['character_sheet'],
      description: 'Stable Diffusion image generation prompt',
      blueprint_file: 'blueprints/system/a1111.md',
    },
  ],
};

/**
 * Default asset order (for parsing LLM output)
 */
export const DEFAULT_ASSET_ORDER = [
  'system_prompt',
  'post_history',
  'character_sheet',
  'intro_scene',
  CREATOR_NOTES_ASSET_NAME,
  'a1111',
] as const;

/**
 * Topological sort for assets based on dependencies.
 * Ensures assets are processed in the correct order.
 */
export function topologicalSort(assets: AssetDefinition[]): string[] {
  const assetNames = assets.map((a) => a.name);
  const resolved: string[] = [];
  const resolvedSet = new Set<string>();
  const visiting = new Set<string>();

  function visit(assetName: string): void {
    if (resolvedSet.has(assetName)) return;
    if (visiting.has(assetName)) {
      // Circular dependency detected, break
      return;
    }

    visiting.add(assetName);

    const asset = assets.find((a) => a.name === assetName);
    if (asset) {
      for (const dep of asset.depends_on) {
        visit(dep);
      }
    }

    resolvedSet.add(assetName);
    resolved.push(assetName);
    visiting.delete(assetName);
  }

  for (const assetName of assetNames) {
    if (!resolvedSet.has(assetName)) {
      visit(assetName);
    }
  }

  return resolved;
}

/**
 * Get assets in topological order for a template.
 */
export function getOrderedAssets(template?: Template): AssetDefinition[] {
  const targetTemplate = template || OFFICIAL_TEMPLATE;
  const orderedNames = topologicalSort(targetTemplate.assets);
  return orderedNames
    .map((name) => targetTemplate.assets.find((a) => a.name === name))
    .filter((a): a is AssetDefinition => a !== undefined);
}

/**
 * Validate a template for correctness.
 */
export function validateTemplate(template: Template): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!template.name) {
    errors.push('Template name is required');
  }

  if (!template.assets || template.assets.length === 0) {
    errors.push('Template must have at least one asset');
  }

  // Check for circular dependencies
  const assetMap = new Map(template.assets.map((a) => [a.name, a]));
  function checkDeps(deps: string[], currentAssetName: string): boolean {
    for (const dep of deps) {
      if (dep === currentAssetName) {
        return true; // Circular!
      }
      const depAsset = assetMap.get(dep);
      if (depAsset && checkDeps(depAsset.depends_on, currentAssetName)) {
        return true;
      }
    }
    return false;
  }

  for (const asset of template.assets) {
    if (checkDeps(asset.depends_on, asset.name)) {
      errors.push(`Circular dependency detected for asset: ${asset.name}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}
