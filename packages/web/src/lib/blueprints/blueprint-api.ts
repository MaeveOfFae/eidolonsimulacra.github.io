/**
 * Blueprint catalog operations for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.6). The catalog merges the bundled
 * `blueprints/` modules with user overrides persisted through the
 * desktop-aware persistence layer; editing a built-in never mutates it —
 * `updateBlueprint` redirects the edit to a fresh custom copy. Behavior is
 * pinned by `api.blueprints.test.ts` through the facade.
 */

import { buildBlueprintList, type Blueprint, type BlueprintList } from '@char-gen/shared';
import { APIError } from '../api-error.js';
import {
  buildUniqueCustomBlueprintPath,
  getBlueprintCatalog,
  getBlueprintOverrides,
  getOriginalBlueprintContent as getOriginalContent,
  hasBlueprintOverride as hasStoredOverride,
  isCustomBlueprintPath,
  saveBlueprintOverrides,
} from '../templates/browser.js';

function parseBlueprintMetadata(
  path: string,
  content: string,
): {
  name: string;
  description: string;
  version: string;
  invokable: boolean;
} {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let name = path.split('/').pop()?.replace('.md', '') || 'Blueprint';
  let description = '';
  let version = '1.0';
  let invokable = true;

  if (!frontmatterMatch) {
    return { name, description, version, invokable };
  }

  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const versionMatch = frontmatter.match(/^version:\s*(.+)$/m);
  const invokableMatch = frontmatter.match(/^invokable:\s*(.+)$/m);

  if (nameMatch) {
    name = nameMatch[1].trim();
  }
  if (descriptionMatch) {
    description = descriptionMatch[1].trim();
  }
  if (versionMatch) {
    version = versionMatch[1].trim();
  }
  if (invokableMatch) {
    invokable = invokableMatch[1].trim() === 'true';
  }

  return { name, description, version, invokable };
}

export async function getBlueprints(): Promise<BlueprintList> {
  const values = [...getBlueprintCatalog().values()];
  return buildBlueprintList(values);
}

export async function getBlueprint(path: string): Promise<Blueprint> {
  const blueprint = getBlueprintCatalog().get(path);
  if (!blueprint) {
    throw new APIError(404, `Blueprint ${path} not found`);
  }
  return blueprint;
}

export async function updateBlueprint(path: string, content: string): Promise<Blueprint> {
  const isBuiltinBlueprint = getOriginalContent(path) !== null && !isCustomBlueprintPath(path);
  if (isBuiltinBlueprint) {
    const metadata = parseBlueprintMetadata(path, content);
    const targetPath = buildUniqueCustomBlueprintPath(metadata.name || path, path);
    return createBlueprint(targetPath, content);
  }

  // Save locally first
  const overrides = getBlueprintOverrides();
  overrides[path] = content;
  saveBlueprintOverrides(overrides);

  return getBlueprint(path);
}

export async function deleteBlueprint(path: string): Promise<{ status: 'deleted'; path: string }> {
  if (getOriginalContent(path) !== null) {
    throw new APIError(400, `Cannot delete built-in blueprint ${path}`);
  }

  const overrides = getBlueprintOverrides();
  delete overrides[path];
  saveBlueprintOverrides(overrides);

  return { status: 'deleted', path };
}

export async function resetBlueprint(path: string): Promise<Blueprint> {
  // Remove local override
  const overrides = getBlueprintOverrides();
  delete overrides[path];
  saveBlueprintOverrides(overrides);

  const blueprint = getBlueprintCatalog().get(path);
  if (!blueprint) {
    throw new APIError(404, `Blueprint ${path} not found`);
  }
  return blueprint;
}

export async function createBlueprint(path: string, content: string): Promise<Blueprint> {
  const existing = getBlueprintCatalog().get(path);
  if (existing) {
    throw new APIError(409, `Blueprint ${path} already exists`);
  }

  // Save locally first
  const overrides = getBlueprintOverrides();
  overrides[path] = content;
  saveBlueprintOverrides(overrides);

  return getBlueprint(path);
}

export async function duplicateBlueprint(sourcePath: string, targetPath: string): Promise<Blueprint> {
  const source = getBlueprintCatalog().get(sourcePath);
  if (!source) {
    throw new APIError(404, `Source blueprint ${sourcePath} not found`);
  }
  const existing = getBlueprintCatalog().get(targetPath);
  if (existing) {
    throw new APIError(409, `Blueprint ${targetPath} already exists`);
  }

  // Save locally first
  const overrides = getBlueprintOverrides();
  overrides[targetPath] = source.content;
  saveBlueprintOverrides(overrides);

  return getBlueprint(targetPath);
}

export function hasBlueprintOverride(path: string): boolean {
  return hasStoredOverride(path);
}

export function getOriginalBlueprintContent(path: string): string | null {
  return getOriginalContent(path);
}
