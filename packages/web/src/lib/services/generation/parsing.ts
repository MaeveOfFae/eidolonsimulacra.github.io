/**
 * Parsers for what the model hands back: the blueprint asset dictionary, the
 * character profile, and the review id a new draft gets.
 *
 * Split out of `services/generation.ts`; all three were `private static` and reference
 * nothing but their own imports.
 */

/**
 * Parse blueprint output into asset dictionary
 */
export function parseBlueprintOutput(content: string): Record<string, string> {
  const assets: Record<string, string> = {};

  // Look for code blocks with asset names
  // Format: ```asset_name ... content ... ```
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  // Known asset names in order
  const knownAssets = [
    'Adjustment Note',
    'system_prompt',
    'post_history',
    'character_sheet',
    'intro_scene',
    'creator_notes',
    'intro_page',
    'a1111',
    'suno',
  ];

  // Try to match code blocks with asset name
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const assetName = match[1];
    const assetContent = match[2]?.trim();

    if (assetName && assetContent && knownAssets.includes(assetName)) {
      assets[assetName] = assetContent;
    }
  }

  // If no code blocks found, try to parse by known sections
  if (Object.keys(assets).length === 0) {
    for (let i = 0; i < knownAssets.length; i++) {
      const asset = knownAssets[i];
      const nextAsset = knownAssets[i + 1];

      const startRegex = new RegExp(`^##\\s*${asset}`, 'im');
      const startMatch = content.search(startRegex);

      if (startMatch === -1) continue;

      let endMatch: number;
      if (nextAsset) {
        const endRegex = new RegExp(`^##\\s*${nextAsset}`, 'im');
        const endSearch = content.slice(startMatch).search(endRegex);
        endMatch = endSearch === -1 ? content.length : startMatch + endSearch;
      } else {
        endMatch = content.length;
      }

      const assetContent = content.slice(startMatch, endMatch).trim();
      if (assetContent) {
        assets[asset] = assetContent;
      }
    }
  }

  return assets;
}

/**
 * Parse character sheet into profile object
 */
export function parseCharacterProfile(characterSheet: string): Record<string, unknown> {
  const profile: Record<string, unknown> = {};

  // Simple key-value parsing from character sheet
  // Format: Key: Value
  const lines = characterSheet.split('\n');
  let currentKey: string | null = null;
  let currentValue: string[] = [];

  for (const line of lines) {
    const keyMatch = line.match(/^([A-Z][A-Za-z\s]+):\s*(.+)$/);
    if (keyMatch) {
      // Save previous key-value pair
      if (currentKey && currentValue.length > 0) {
        profile[currentKey] = currentValue.join('\n').trim();
      }

      currentKey = keyMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
      currentValue = [keyMatch[2].trim()];
    } else if (currentKey && line.trim()) {
      currentValue.push(line.trim());
    }
  }

  // Save last key-value pair
  if (currentKey && currentValue.length > 0) {
    profile[currentKey] = currentValue.join('\n').trim();
  }

  // Extract arrays from comma-separated values
  for (const key of ['personality_traits', 'core_values', 'goals', 'fears', 'motivations']) {
    if (typeof profile[key] === 'string') {
      profile[key] = (profile[key] as string)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }
  }

  return profile;
}

/**
 * Generate a unique review ID
 */
export function generateReviewId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}_${random}`;
}
