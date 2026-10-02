import { beforeEach, describe, expect, it } from 'vitest';
import { APIError, api } from './api';

/**
 * Characterization tests for the blueprint domain of `EidolonBrowserAPI`.
 *
 * Blueprints live in a catalog assembled from the bundled `blueprints/` modules
 * plus user overrides persisted through the desktop-aware persistence layer
 * (`eidolon.web.blueprints.overrides` in browser localStorage). Editing a
 * built-in never mutates it: `updateBlueprint` redirects to a fresh custom copy.
 */
const OVERRIDES_KEY = 'eidolon.web.blueprints.overrides';
const BUILTIN = 'blueprints/system/generator.md';
const CUSTOM = 'blueprints/custom/test_prompt.md';

function content(name: string): string {
  return `---\nname: ${name}\ndescription: characterization fixture\ninvokable: false\n---\n\n# ${name} body\n`;
}

describe('browser api: blueprint domain', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('lists the builtin catalog grouped by category', async () => {
    const list = await api.getBlueprints();

    expect(list.system.some((blueprint) => blueprint.path.startsWith('blueprints/system/'))).toBe(true);
    expect(list.examples.some((blueprint) => blueprint.path.startsWith('blueprints/examples/'))).toBe(true);
  });

  it('returns a builtin blueprint and 404s for unknown paths', async () => {
    const blueprint = await api.getBlueprint(BUILTIN);

    expect(blueprint.path).toBe(BUILTIN);
    expect(blueprint.content.trim().length).toBeGreaterThan(0);
    await expect(api.getBlueprint('blueprints/nope.md')).rejects.toBeInstanceOf(APIError);
  });

  it('creates a custom override that round-trips through the catalog', async () => {
    const created = await api.createBlueprint(CUSTOM, content('Test Prompt'));

    expect(created.path).toBe(CUSTOM);
    expect(api.hasBlueprintOverride(CUSTOM)).toBe(true);
    expect((await api.getBlueprint(CUSTOM)).content).toBe(content('Test Prompt'));
    expect((await api.getBlueprints()).core.some((blueprint) => blueprint.path === CUSTOM)).toBe(true);
  });

  it('rejects duplicates, including builtin paths', async () => {
    await api.createBlueprint(CUSTOM, content('Test Prompt'));

    await expect(api.createBlueprint(CUSTOM, 'other')).rejects.toBeInstanceOf(APIError);
    await expect(api.createBlueprint(BUILTIN, 'other')).rejects.toBeInstanceOf(APIError);
  });

  it('updates a builtin by redirecting to a new custom copy, leaving the original intact', async () => {
    const original = await api.getBlueprint(BUILTIN);

    const redirected = await api.updateBlueprint(BUILTIN, content('Generator Custom'));

    expect(redirected.path).toBe('blueprints/custom/generator_custom.md');
    expect(redirected.content).toBe(content('Generator Custom'));
    expect(api.hasBlueprintOverride(BUILTIN)).toBe(false);
    expect((await api.getBlueprint(BUILTIN)).content).toBe(original.content);

    const second = await api.updateBlueprint(BUILTIN, content('Generator Custom'));
    expect(second.path).toBe('blueprints/custom/generator_custom_2.md');
  });

  it('overwrites a custom blueprint in place', async () => {
    await api.createBlueprint(CUSTOM, content('Test Prompt'));

    const updated = await api.updateBlueprint(CUSTOM, content('Test Prompt v2'));

    expect(updated.path).toBe(CUSTOM);
    expect((await api.getBlueprint(CUSTOM)).content).toBe(content('Test Prompt v2'));
  });

  it('refuses to delete builtins and removes custom overrides cleanly', async () => {
    await expect(api.deleteBlueprint(BUILTIN)).rejects.toBeInstanceOf(APIError);

    await api.createBlueprint(CUSTOM, content('Test Prompt'));
    expect(await api.deleteBlueprint(CUSTOM)).toEqual({ status: 'deleted', path: CUSTOM });
    expect(api.hasBlueprintOverride(CUSTOM)).toBe(false);
    await expect(api.getBlueprint(CUSTOM)).rejects.toBeInstanceOf(APIError);
  });

  it('resets a seeded override back to the bundled original', async () => {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify({ [BUILTIN]: 'hijacked' }));
    expect((await api.getBlueprint(BUILTIN)).content).toBe('hijacked');

    const restored = await api.resetBlueprint(BUILTIN);

    expect(restored.content).not.toBe('hijacked');
    expect(api.hasBlueprintOverride(BUILTIN)).toBe(false);
  });

  it('404s when resetting a path that has no catalog entry', async () => {
    await expect(api.resetBlueprint('blueprints/custom/ghost.md')).rejects.toBeInstanceOf(APIError);
  });

  it('duplicates a blueprint after validating both ends of the copy', async () => {
    const source = await api.getBlueprint(BUILTIN);

    await expect(api.duplicateBlueprint('blueprints/missing.md', 'blueprints/custom/x.md')).rejects.toBeInstanceOf(
      APIError,
    );
    await expect(api.duplicateBlueprint(BUILTIN, BUILTIN)).rejects.toBeInstanceOf(APIError);

    const copy = await api.duplicateBlueprint(BUILTIN, 'blueprints/custom/generator_copy.md');

    expect(copy.content).toBe(source.content);
    expect(api.hasBlueprintOverride('blueprints/custom/generator_copy.md')).toBe(true);
  });

  it('exposes original content for builtins only', () => {
    expect(api.getOriginalBlueprintContent(BUILTIN)).toBeTruthy();
    expect(api.getOriginalBlueprintContent('blueprints/custom/never.md')).toBeNull();
  });
});
