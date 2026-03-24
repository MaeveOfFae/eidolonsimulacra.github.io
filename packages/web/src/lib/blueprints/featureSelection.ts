import type { Blueprint, BlueprintList, FeatureCategory } from '@char-gen/shared';

function flattenBlueprintList(list: BlueprintList): Blueprint[] {
  return [
    ...list.system,
    ...list.core,
    ...list.examples,
    ...Object.values(list.templates).flat(),
  ];
}

function categoryRank(category: Blueprint['category']): number {
  switch (category) {
    case 'system':
      return 0;
    case 'core':
      return 1;
    case 'template':
      return 2;
    case 'example':
      return 3;
    default:
      return 4;
  }
}

export function getBlueprintsForFeature(list: BlueprintList, featureCategory: FeatureCategory): Blueprint[] {
  return flattenBlueprintList(list)
    .filter((entry) => entry.feature_category === featureCategory)
    .sort((left, right) => {
      const categoryDiff = categoryRank(left.category) - categoryRank(right.category);
      if (categoryDiff !== 0) {
        return categoryDiff;
      }

      return left.name.localeCompare(right.name);
    });
}

export function resolveBlueprintForFeature(
  list: BlueprintList,
  featureCategory: FeatureCategory,
  preferredPath?: string
): Blueprint | null {
  const matching = getBlueprintsForFeature(list, featureCategory);

  if (preferredPath) {
    const preferred = matching.find((entry) => entry.path === preferredPath);
    if (preferred) {
      return preferred;
    }
  }

  return matching[0] ?? null;
}

export function toBlueprintOptions(blueprints: Blueprint[]): Array<{ name: string; label: string }> {
  return blueprints.map((entry) => ({
    name: entry.path,
    label: entry.name || entry.path,
  }));
}