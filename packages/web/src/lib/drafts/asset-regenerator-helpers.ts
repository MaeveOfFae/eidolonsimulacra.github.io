/**
 * Pure and export helpers for the asset regenerator screen.
 *
 * Extracted from `AssetRegenerator` (5.0 workspace-release work stream: the screen
 * carried these ahead of the component itself). They build the recovered template
 * contract and the intro-scene downloads, and are unit tested directly.
 */

import { OFFICIAL_TEMPLATE, type Draft, type Template } from '@char-gen/shared';
import { getEffectiveDraftComponentSendOrder } from '@/lib/drafts/send-config';

export interface AssetCandidate {
  id: string;
  content: string;
  timestamp: number;
}

export function draftHasAsset(draft: Draft | undefined, assetName: string): boolean {
  return Boolean(draft && Object.prototype.hasOwnProperty.call(draft.assets, assetName));
}

export function buildRecoveredTemplateContract(draft: Draft, templates: Template[]): Template {
  const defaultTemplate = templates.find((entry) => entry.is_default) ?? OFFICIAL_TEMPLATE;
  const defaultAssetsByName = new Map(defaultTemplate.assets.map((asset) => [asset.name, asset] as const));
  const orderedAssetNames = getEffectiveDraftComponentSendOrder(draft, defaultTemplate);

  return {
    name: draft.metadata.template_name || defaultTemplate.name,
    version: defaultTemplate.version,
    description: 'Recovered from the saved draft asset order because the original template is not available locally.',
    is_official: false,
    assets: orderedAssetNames.map((assetName, index) => {
      const baseAsset = defaultAssetsByName.get(assetName);
      if (baseAsset) {
        return {
          ...baseAsset,
          depends_on: [...baseAsset.depends_on],
          ...(baseAsset.import_aliases ? { import_aliases: [...baseAsset.import_aliases] } : {}),
        };
      }

      const previousAssetName = orderedAssetNames[index - 1];
      return {
        name: assetName,
        required: draftHasAsset(draft, assetName),
        depends_on: previousAssetName ? [previousAssetName] : [],
        description: 'Recovered from the saved draft asset order.',
      };
    }),
  };
}

export const exportIntrosAsMarkdown = (
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined,
) => {
  const lines: string[] = [
    `# Intro Scenes for ${characterName}`,
    '',
    `Generated: ${new Date().toLocaleString()}`,
    `Total intros: ${savedIntros.length}`,
    '',
    '---',
    '',
  ];

  if (activeIntroContent) {
    lines.push('## Currently Active Intro Scene', '');
    lines.push('```');
    lines.push(activeIntroContent);
    lines.push('```');
    lines.push('', '---', '');
  }

  savedIntros.forEach((intro, index) => {
    const date = new Date(intro.timestamp).toLocaleString();
    lines.push(`## Intro Scene #${index + 1}`);
    lines.push(`*Created: ${date}*`);
    lines.push('');
    lines.push('```');
    lines.push(intro.content);
    lines.push('```');
    lines.push('');
    if (index < savedIntros.length - 1) {
      lines.push('---', '');
    }
  });

  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${characterName.replace(/[^a-z0-9]/gi, '_')}_intro_scenes.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

export const exportIntrosAsJson = (
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined,
) => {
  const data = {
    character_name: characterName,
    exported_at: new Date().toISOString(),
    active_intro: activeIntroContent || null,
    saved_intros: savedIntros.map((intro) => ({
      id: intro.id,
      content: intro.content,
      created_at: new Date(intro.timestamp).toISOString(),
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${characterName.replace(/[^a-z0-9]/gi, '_')}_intro_scenes.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
