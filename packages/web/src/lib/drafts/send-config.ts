import { getOrderedAssets, normalizeAssetNameList, type Draft, type Template } from '@char-gen/shared';

type DraftOrderContext = Pick<Draft, 'assets'> & {
  metadata?: Draft['metadata'];
};

export interface DraftSendOrderWarning {
  assetName: string;
  dependencyNames: string[];
}

function getTemplateAssetNames(template?: Template): string[] {
  if (!template) {
    return [];
  }

  return getOrderedAssets(template).map((asset) => asset.name);
}

export function getDefaultDraftComponentSendOrder(draft: DraftOrderContext | undefined, template?: Template): string[] {
  const templateAssetNames = getTemplateAssetNames(template);
  const draftAssetNames = draft ? Object.keys(draft.assets) : [];

  return normalizeAssetNameList(
    [...templateAssetNames, ...draftAssetNames],
    template ?? draft?.metadata?.template_name,
  );
}

export function getEffectiveDraftComponentSendOrder(
  draft: DraftOrderContext | undefined,
  template?: Template,
): string[] {
  const defaultOrder = getDefaultDraftComponentSendOrder(draft, template);
  const availableNames = new Set(defaultOrder);
  const savedOrder = normalizeAssetNameList(
    draft?.metadata?.component_send_order ?? [],
    template ?? draft?.metadata?.template_name,
  ).filter((assetName) => availableNames.has(assetName));
  const seen = new Set(savedOrder);

  return [...savedOrder, ...defaultOrder.filter((assetName) => !seen.has(assetName))];
}

export function normalizeDraftComponentSendOrderForSave(
  componentSendOrder: readonly string[],
  draft: DraftOrderContext | undefined,
  template?: Template,
): string[] | undefined {
  const defaultOrder = getDefaultDraftComponentSendOrder(draft, template);
  const availableNames = new Set(defaultOrder);
  const normalized = normalizeAssetNameList(componentSendOrder, template ?? draft?.metadata?.template_name).filter(
    (assetName) => availableNames.has(assetName),
  );
  const seen = new Set(normalized);
  const completedOrder = [...normalized, ...defaultOrder.filter((assetName) => !seen.has(assetName))];

  if (completedOrder.length !== defaultOrder.length) {
    return defaultOrder;
  }

  if (completedOrder.every((assetName, index) => assetName === defaultOrder[index])) {
    return undefined;
  }

  return completedOrder;
}

export function getDraftSendOrderWarnings(
  componentSendOrder: readonly string[],
  template?: Template,
): DraftSendOrderWarning[] {
  if (!template) {
    return [];
  }

  const assetIndex = new Map(componentSendOrder.map((assetName, index) => [assetName, index]));
  const warnings: DraftSendOrderWarning[] = [];

  for (const asset of template.assets) {
    const assetPosition = assetIndex.get(asset.name);
    if (assetPosition === undefined || asset.depends_on.length === 0) {
      continue;
    }

    const dependencyNames = asset.depends_on.filter((dependencyName) => {
      const dependencyPosition = assetIndex.get(dependencyName);
      return dependencyPosition !== undefined && dependencyPosition > assetPosition;
    });

    if (dependencyNames.length > 0) {
      warnings.push({
        assetName: asset.name,
        dependencyNames,
      });
    }
  }

  return warnings;
}

export function buildDraftPriorAssets(
  draft: Pick<Draft, 'assets' | 'metadata'>,
  targetAssetName: string,
  template?: Template,
): Record<string, string> {
  const effectiveOrder = getEffectiveDraftComponentSendOrder(draft, template);
  const targetIndex = effectiveOrder.indexOf(targetAssetName);

  if (targetIndex <= 0) {
    return {};
  }

  const priorAssets: Record<string, string> = {};

  for (const assetName of effectiveOrder.slice(0, targetIndex)) {
    const content = draft.assets[assetName];
    if (typeof content === 'string' && content.length > 0) {
      priorAssets[assetName] = content;
    }
  }

  return priorAssets;
}

export function mergeDraftAdditionalInstructions(savedInstructions?: string, transientInstructions?: string): string[] {
  return [savedInstructions, transientInstructions]
    .filter((value): value is string => typeof value === 'string')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}
