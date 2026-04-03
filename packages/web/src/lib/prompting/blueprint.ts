/**
 * Blueprint Loader and Parser
 * Client-side blueprint loading from static resources
 */

import type {
  FeatureCategory,
  Template,
} from '@char-gen/shared';
import { configManager } from '../config/manager';

const BLUEPRINT_OVERRIDES_STORAGE_KEY = 'eidolon.web.blueprints.overrides';
const LEGACY_BLUEPRINT_OVERRIDES_STORAGE_KEYS = ['bpui.web.blueprints.overrides'];

const bundledBlueprintModules = import.meta.glob('../../../../../blueprints/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export interface Blueprint {
  name: string;
  description: string;
  invokable: boolean;
  version: string;
  category: 'core' | 'system' | 'template' | 'example';
  content: string;
  path: string;
}

const BLUEPRINT_PATH_ALIASES: Record<string, string> = {
  generator: 'system/generator.md',
  rpbotgenerator: 'system/generator.md',
  seed_generator: 'system/seed_generator.md',
  offspring_generator: 'system/offspring_generator.md',
  system_prompt: 'system/system_prompt.md',
  post_history: 'system/post_history.md',
  character_sheet: 'system/character_sheet.md',
  intro_scene: 'system/intro_scene.md',
  intro_page: 'system/intro_page.md',
  a1111: 'system/a1111.md',
};

function resolveBlueprintPath(nameOrPath: string): string {
  const normalized = nameOrPath.replace(/^\/+/, '').replace(/^blueprints\//, '');

  if (normalized.endsWith('.md')) {
    return normalized;
  }

  return BLUEPRINT_PATH_ALIASES[normalized] ?? `${normalized}.md`;
}

function getStoredBlueprintOverride(path: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  for (const storageKey of [BLUEPRINT_OVERRIDES_STORAGE_KEY, ...LEGACY_BLUEPRINT_OVERRIDES_STORAGE_KEYS]) {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, string>;
      const override = parsed[path];
      if (typeof override === 'string' && override.trim().length > 0) {
        return override;
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

function getBundledBlueprint(path: string): string | undefined {
  const modulePath = `../../../../../${path}`;
  return bundledBlueprintModules[modulePath];
}

/**
 * Blueprint repository URL
 * Can be configured to point to a CDN or local folder
 */
const BLUEPRINT_REPO_URL = '/blueprints';

/**
 * Load a blueprint from the repository
 */
export async function loadBlueprint(name: string, baseUrl: string = BLUEPRINT_REPO_URL): Promise<string> {
  const resolvedPath = resolveBlueprintPath(name);
  const repoPath = `blueprints/${resolvedPath}`;
  const url = `${baseUrl}/${resolvedPath}`;

  const overrideContent = getStoredBlueprintOverride(repoPath);
  if (overrideContent) {
    return overrideContent;
  }

  const bundledContent = getBundledBlueprint(repoPath);
  if (bundledContent) {
    return bundledContent;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Blueprint not found: ${resolvedPath}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Failed to load blueprint '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Default blueprints for each feature category
 */
const DEFAULT_FEATURE_BLUEPRINTS: Partial<Record<FeatureCategory, string>> = {
  orchestration: 'blueprints/system/generator.md',
  seed_generation: 'blueprints/system/seed_generator.md',
  offspring_generation: 'blueprints/system/offspring_generator.md',
  intro_scene_generation: 'blueprints/system/intro_scene.md',
};

/**
 * Resolve a blueprint for a feature category
 * Priority: override > settings default > system default
 */
export async function resolveFeatureBlueprint(
  feature: FeatureCategory,
  overridePath?: string,
  baseUrl: string = BLUEPRINT_REPO_URL
): Promise<string> {
  const config = configManager.getConfig();
  const settingsDefault = config.feature_blueprints?.[feature];
  const systemDefault = DEFAULT_FEATURE_BLUEPRINTS[feature];

  const blueprintPath = overridePath || settingsDefault || systemDefault;

  if (!blueprintPath) {
    throw new Error(`No blueprint configured for feature: ${feature}`);
  }

  return loadBlueprint(blueprintPath, baseUrl);
}

/**
 * Parse blueprint metadata from frontmatter
 */
export function parseBlueprintFrontmatter(content: string): {
  name: string;
  description: string;
  invokable: boolean;
  version: string;
  feature_category?: FeatureCategory;
} {
  const normalizedContent = content.replace(/\r\n?/g, '\n');

  // Look for YAML frontmatter between --- markers
  const frontmatterMatch = normalizedContent.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    const headingMatch = normalizedContent.match(/^#\s+(.+)$/m);
    const paragraphMatch = normalizedContent
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('```'));

    return {
      name: headingMatch?.[1]?.trim() || 'Untitled Blueprint',
      description: paragraphMatch || 'No description',
      invokable: false,
      version: '1.0',
    };
  }

  const frontmatter = frontmatterMatch[1];
  const metadata: Record<string, unknown> = {};

  // Simple YAML parser (enough for our needs)
  const lines = frontmatter.split('\n');
  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // Handle boolean values
      if (value.toLowerCase() === 'true') {
        metadata[key] = true;
      } else if (value.toLowerCase() === 'false') {
        metadata[key] = false;
      } else {
        // Remove quotes if present
        metadata[key] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  }

  return {
    name: String(metadata.name || 'unknown'),
    description: String(metadata.description || ''),
    invokable: Boolean(metadata.invokable),
    version: String(metadata.version || '1.0'),
    feature_category: metadata.feature_category as FeatureCategory | undefined,
  };
}

/**
 * Get all available blueprints
 */
export async function listBlueprints(baseUrl: string = BLUEPRINT_REPO_URL): Promise<Blueprint[]> {
  const systemBlueprints = [
    'generator',
    'offspring_generator',
  ];

  const blueprints: Blueprint[] = [];

  for (const name of systemBlueprints) {
    try {
      const content = await loadBlueprint(name, baseUrl);
      const metadata = parseBlueprintFrontmatter(content);
      const resolvedPath = resolveBlueprintPath(name);

      blueprints.push({
        ...metadata,
        category: 'system',
        content,
        path: `${baseUrl}/${resolvedPath}`,
      });
    } catch {
      // Skip failed blueprints
    }
  }

  return blueprints;
}

/**
 * Template asset definitions from template
 */
export interface TemplateAsset {
  name: string;
  required: boolean;
  dependsOn: string[];
  description: string;
  blueprintFile?: string;
}

/**
 * Convert Template object to asset list
 */
export function templateToAssets(template: Template): TemplateAsset[] {
  return template.assets.map(asset => ({
    name: asset.name,
    required: asset.required,
    dependsOn: asset.depends_on,
    description: asset.description,
    blueprintFile: asset.blueprint_file,
  }));
}

/**
 * Topological sort of assets based on dependencies
 */
export function topologicalSort(assets: TemplateAsset[]): string[] {
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: string[] = [];

  const visit = (assetName: string) => {
    if (visited.has(assetName)) {
      return;
    }
    if (visiting.has(assetName)) {
      throw new Error(`Circular dependency detected involving ${assetName}`);
    }

    visiting.add(assetName);

    const asset = assets.find(a => a.name === assetName);
    if (asset) {
      for (const dep of asset.dependsOn) {
        visit(dep);
      }
    }

    visiting.delete(assetName);
    visited.add(assetName);
    result.push(assetName);
  };

  for (const asset of assets) {
    visit(asset.name);
  }

  return result;
}
