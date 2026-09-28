import { describe, expect, it } from 'vitest';
import {
  flattenBlueprintList,
  getBlueprintsForFeature,
  resolveBlueprintForFeature,
  toBlueprintOptions,
} from './blueprint-features';
import type { Blueprint, BlueprintList } from './types';

function buildBlueprint(overrides: Partial<Blueprint> = {}): Blueprint {
  return {
    name: 'Lorebook Generator',
    description: 'Generate a lorebook packet.',
    invokable: true,
    version: '1.0',
    content: 'blueprint body',
    path: 'blueprints/system/lorebook_generator.md',
    category: 'system',
    feature_category: 'worldbook_generation',
    ...overrides,
  };
}

function buildList(overrides: Partial<BlueprintList> = {}): BlueprintList {
  return {
    core: [],
    system: [],
    templates: {},
    examples: [],
    ...overrides,
  };
}

describe('flattenBlueprintList', () => {
  it('flattens every blueprint category including template folders', () => {
    const list = buildList({
      system: [buildBlueprint({ name: 'System', path: 'blueprints/system/a.md' })],
      core: [buildBlueprint({ name: 'Core', path: 'blueprints/core/b.md' })],
      examples: [buildBlueprint({ name: 'Example', path: 'blueprints/examples/c.md' })],
      templates: {
        V2: [buildBlueprint({ name: 'Template', path: 'blueprints/templates/V2/d.md' })],
      },
    });

    expect(flattenBlueprintList(list).map((entry) => entry.name)).toEqual(['System', 'Core', 'Example', 'Template']);
  });

  it('returns an empty list for an empty catalog', () => {
    expect(flattenBlueprintList(buildList())).toEqual([]);
  });
});

describe('getBlueprintsForFeature', () => {
  it('keeps only blueprints tagged for the requested feature', () => {
    const list = buildList({
      system: [
        buildBlueprint({ name: 'Lorebook', path: 'blueprints/system/lorebook.md' }),
        buildBlueprint({ name: 'Seeds', path: 'blueprints/system/seeds.md', feature_category: 'seed_generation' }),
        buildBlueprint({ name: 'Untagged', path: 'blueprints/system/untagged.md', feature_category: undefined }),
      ],
    });

    expect(getBlueprintsForFeature(list, 'worldbook_generation').map((entry) => entry.name)).toEqual(['Lorebook']);
  });

  it('ranks system blueprints ahead of core, template and example ones', () => {
    const list = buildList({
      system: [buildBlueprint({ name: 'A System', path: 'blueprints/system/a.md', category: 'system' })],
      core: [buildBlueprint({ name: 'B Core', path: 'blueprints/core/b.md', category: 'core' })],
      examples: [buildBlueprint({ name: 'D Example', path: 'blueprints/examples/d.md', category: 'example' })],
      templates: {
        V2: [buildBlueprint({ name: 'C Template', path: 'blueprints/templates/V2/c.md', category: 'template' })],
      },
    });

    expect(getBlueprintsForFeature(list, 'worldbook_generation').map((entry) => entry.name)).toEqual([
      'A System',
      'B Core',
      'C Template',
      'D Example',
    ]);
  });

  it('sorts same-rank blueprints by name', () => {
    const list = buildList({
      system: [
        buildBlueprint({ name: 'Zeta', path: 'blueprints/system/z.md' }),
        buildBlueprint({ name: 'Alpha', path: 'blueprints/system/a.md' }),
      ],
    });

    expect(getBlueprintsForFeature(list, 'worldbook_generation').map((entry) => entry.name)).toEqual(['Alpha', 'Zeta']);
  });
});

describe('resolveBlueprintForFeature', () => {
  it('returns the preferred blueprint when it matches the feature', () => {
    const list = buildList({
      system: [
        buildBlueprint({ name: 'Alpha', path: 'blueprints/system/a.md' }),
        buildBlueprint({ name: 'Beta', path: 'blueprints/system/b.md' }),
      ],
    });

    expect(resolveBlueprintForFeature(list, 'worldbook_generation', 'blueprints/system/b.md')?.name).toBe('Beta');
  });

  it('falls back to the top-ranked blueprint when the preferred path is unknown', () => {
    const list = buildList({
      system: [buildBlueprint({ name: 'Alpha', path: 'blueprints/system/a.md' })],
      core: [buildBlueprint({ name: 'Core', path: 'blueprints/core/b.md', category: 'core' })],
    });

    expect(resolveBlueprintForFeature(list, 'worldbook_generation', 'blueprints/system/gone.md')?.name).toBe('Alpha');
  });

  it('returns null when the feature has no blueprints', () => {
    expect(resolveBlueprintForFeature(buildList(), 'worldbook_generation')).toBeNull();
  });
});

describe('toBlueprintOptions', () => {
  it('maps blueprints to path/label options and falls back to the path as label', () => {
    expect(
      toBlueprintOptions([
        buildBlueprint({ name: 'Lorebook Generator', path: 'blueprints/system/lorebook_generator.md' }),
        buildBlueprint({ name: '', path: 'blueprints/system/unnamed.md' }),
      ]),
    ).toEqual([
      { name: 'blueprints/system/lorebook_generator.md', label: 'Lorebook Generator' },
      { name: 'blueprints/system/unnamed.md', label: 'blueprints/system/unnamed.md' },
    ]);
  });
});
