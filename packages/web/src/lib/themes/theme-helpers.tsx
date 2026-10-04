import type { ThemeColors, ThemePreset } from '@char-gen/shared';

/**
 * Shared theme helpers for the theme manager and theme editor screens.
 *
 * These six were duplicated byte-for-byte across `components/settings/Themes.tsx`
 * and `components/themes/ThemeEditor.tsx` (found while planning the theme-manager
 * decomposition). Extracted during the 5.0 work stream so both screens — and the
 * import dialog slice — share one copy.
 */

export type ThemePresetRecord = ThemePreset & {
  author: string;
  tags: string[];
  based_on: string;
};

export function parseTagInput(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function sanitizeThemeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function buildUniqueThemeName(baseName: string, themes: ThemePreset[]): string {
  const sanitizedBase = sanitizeThemeName(baseName);
  const existing = new Set(themes.map((theme) => sanitizeThemeName(theme.name)));

  if (!existing.has(sanitizedBase)) {
    return sanitizedBase;
  }

  let index = 2;
  while (existing.has(`${sanitizedBase}_${index}`)) {
    index += 1;
  }

  return `${sanitizedBase}_${index}`;
}

export const palettePreviewKeys: Array<keyof ThemeColors> = [
  'background',
  'surface',
  'accent',
  'highlight',
  'button',
  'tok_brackets',
];

export function isHexColor(value: string): boolean {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim());
}

export function renderColorValue(value: string) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-4 w-4 rounded-full border border-black/10"
        style={{ backgroundColor: isHexColor(value) ? value : 'transparent' }}
      />
      <span className="font-mono text-xs">{value}</span>
    </div>
  );
}
