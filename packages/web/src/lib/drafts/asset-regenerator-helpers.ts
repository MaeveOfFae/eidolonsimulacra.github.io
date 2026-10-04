/**
 * Pure and export helpers for the asset regenerator screen.
 *
 * Extracted from `AssetRegenerator` (5.0 workspace-release work stream: the screen
 * carried these ahead of the component itself). They build the recovered template
 * contract and the intro-scene downloads, and are unit tested directly.
 */

import { OFFICIAL_TEMPLATE, type Draft, type Template } from '@char-gen/shared';
import { getEffectiveDraftComponentSendOrder } from '@/lib/drafts/send-config';
import { saveBlobDownload } from '@/utils/download';

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

/** Filename used for the intro-scene exports. */
export function introExportFilename(characterName: string, extension: 'md' | 'json'): string {
  return `${characterName.replace(/[^a-z0-9]/gi, '_')}_intro_scenes.${extension}`;
}

/** Builds the markdown body for the intro-scene export. */
export function buildIntrosMarkdown(
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined,
): string {
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

  return lines.join('\n');
}

/** Builds the JSON payload for the intro-scene export. */
export function buildIntrosJson(
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined,
): string {
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

  return JSON.stringify(data, null, 2);
}

/**
 * Downloads the saved intros as markdown.
 *
 * The download itself goes through `saveBlobDownload`, so the desktop build gets a Tauri
 * save dialog and mobile browsers get the share sheet instead of the hand-rolled anchor
 * this used to create.
 */
export async function exportIntrosAsMarkdown(
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined,
): Promise<void> {
  const blob = new Blob([buildIntrosMarkdown(characterName, savedIntros, activeIntroContent)], {
    type: 'text/markdown',
  });
  await saveBlobDownload(blob, introExportFilename(characterName, 'md'), 'text/markdown');
}

/** Downloads the saved intros as JSON. See `exportIntrosAsMarkdown` for the transport. */
export async function exportIntrosAsJson(
  characterName: string,
  savedIntros: AssetCandidate[],
  activeIntroContent: string | undefined,
): Promise<void> {
  const blob = new Blob([buildIntrosJson(characterName, savedIntros, activeIntroContent)], {
    type: 'application/json',
  });
  await saveBlobDownload(blob, introExportFilename(characterName, 'json'), 'application/json');
}
