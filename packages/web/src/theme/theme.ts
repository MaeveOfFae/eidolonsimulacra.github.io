import type { ThemeColors, ThemeOverride, ThemePreset } from '@char-gen/shared';

const APP_OVERRIDE_MAP: Record<string, keyof ThemeColors> = {
  background: 'background',
  text: 'text',
  accent: 'accent',
  button: 'button',
  button_text: 'button_text',
  border: 'border',
  highlight: 'highlight',
  window: 'window',
  muted_text: 'muted_text',
  surface: 'surface',
  success_bg: 'success_bg',
  danger_bg: 'danger_bg',
  accent_bg: 'accent_bg',
  accent_title: 'accent_title',
  success_text: 'success_text',
  error_text: 'error_text',
  warning_text: 'warning_text',
};

const TOKENIZER_OVERRIDE_MAP: Record<string, keyof ThemeColors> = {
  brackets: 'tok_brackets',
  asterisk: 'tok_asterisk',
  parentheses: 'tok_parentheses',
  double_brackets: 'tok_double_brackets',
  curly_braces: 'tok_curly_braces',
  pipes: 'tok_pipes',
  at_sign: 'tok_at_sign',
};

type ThemeFieldSection = 'app' | 'tokenizer';

export interface ThemeFieldDefinition {
  section: ThemeFieldSection;
  key: string;
  label: string;
  colorKey: keyof ThemeColors;
}

export const APP_THEME_FIELDS: ThemeFieldDefinition[] = [
  { section: 'app', key: 'background', label: 'Background', colorKey: 'background' },
  { section: 'app', key: 'surface', label: 'Surface', colorKey: 'surface' },
  { section: 'app', key: 'window', label: 'Window', colorKey: 'window' },
  { section: 'app', key: 'text', label: 'Text', colorKey: 'text' },
  { section: 'app', key: 'muted_text', label: 'Muted Text', colorKey: 'muted_text' },
  { section: 'app', key: 'accent', label: 'Primary Accent', colorKey: 'accent' },
  { section: 'app', key: 'accent_bg', label: 'Accent Surface', colorKey: 'accent_bg' },
  { section: 'app', key: 'button', label: 'Button', colorKey: 'button' },
  { section: 'app', key: 'button_text', label: 'Button Text', colorKey: 'button_text' },
  { section: 'app', key: 'border', label: 'Border', colorKey: 'border' },
  { section: 'app', key: 'highlight', label: 'Ring / Highlight', colorKey: 'highlight' },
  { section: 'app', key: 'success_text', label: 'Success Text', colorKey: 'success_text' },
  { section: 'app', key: 'warning_text', label: 'Warning Text', colorKey: 'warning_text' },
  { section: 'app', key: 'error_text', label: 'Error Text', colorKey: 'error_text' },
  { section: 'app', key: 'success_bg', label: 'Success Surface', colorKey: 'success_bg' },
  { section: 'app', key: 'danger_bg', label: 'Danger Surface', colorKey: 'danger_bg' },
  { section: 'app', key: 'accent_title', label: 'Accent Title', colorKey: 'accent_title' },
];

export const TOKENIZER_THEME_FIELDS: ThemeFieldDefinition[] = [
  { section: 'tokenizer', key: 'brackets', label: 'Brackets', colorKey: 'tok_brackets' },
  { section: 'tokenizer', key: 'asterisk', label: 'Asterisk', colorKey: 'tok_asterisk' },
  { section: 'tokenizer', key: 'parentheses', label: 'Parentheses', colorKey: 'tok_parentheses' },
  { section: 'tokenizer', key: 'double_brackets', label: 'Double Brackets', colorKey: 'tok_double_brackets' },
  { section: 'tokenizer', key: 'curly_braces', label: 'Curly Braces', colorKey: 'tok_curly_braces' },
  { section: 'tokenizer', key: 'pipes', label: 'Pipes', colorKey: 'tok_pipes' },
  { section: 'tokenizer', key: 'at_sign', label: 'At Sign', colorKey: 'tok_at_sign' },
];

export const EDITABLE_THEME_SECTIONS = [
  { title: 'App Colors', description: 'Web and app-facing surfaces.', fields: APP_THEME_FIELDS },
  { title: 'Tokenizer Colors', description: 'Syntax highlighting tokens used in review surfaces.', fields: TOKENIZER_THEME_FIELDS },
] as const;

export function resolveThemeColors(
  preset: ThemePreset | undefined,
  overrides?: ThemeOverride
): ThemeColors | null {
  if (!preset) {
    return null;
  }

  const merged: ThemeColors = {
    ...preset.colors,
  };

  for (const [overrideKey, value] of Object.entries(overrides?.app ?? {})) {
    if (!value) {
      continue;
    }

    const mappedKey = APP_OVERRIDE_MAP[overrideKey];
    if (mappedKey) {
      merged[mappedKey] = value;
    }
  }

  for (const [overrideKey, value] of Object.entries(overrides?.tokenizer ?? {})) {
    if (!value) {
      continue;
    }

    const mappedKey = TOKENIZER_OVERRIDE_MAP[overrideKey];
    if (mappedKey) {
      merged[mappedKey] = value;
    }
  }

  return merged;
}

function hexToHsl(hex: string): string {
  const normalized = hex.replace('#', '').trim();
  const expanded = normalized.length === 3
    ? normalized.split('').map((value) => value + value).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return '0 0% 0%';
  }

  const red = parseInt(expanded.slice(0, 2), 16) / 255;
  const green = parseInt(expanded.slice(2, 4), 16) / 255;
  const blue = parseInt(expanded.slice(4, 6), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
  }

  const h = Math.round(hue * 60 < 0 ? hue * 60 + 360 : hue * 60);
  const s = Math.round(saturation * 1000) / 10;
  const l = Math.round(lightness * 1000) / 10;
  return `${h} ${s}% ${l}%`;
}

export function themeColorsToCssVariables(colors: ThemeColors): Record<string, string> {
  return {
    '--background': hexToHsl(colors.background),
    '--foreground': hexToHsl(colors.text),
    '--card': hexToHsl(colors.surface),
    '--card-foreground': hexToHsl(colors.text),
    '--primary': hexToHsl(colors.accent),
    '--primary-foreground': hexToHsl(colors.button_text),
    '--secondary': hexToHsl(colors.button),
    '--secondary-foreground': hexToHsl(colors.button_text),
    '--muted': hexToHsl(colors.window),
    '--muted-foreground': hexToHsl(colors.muted_text),
    '--accent': hexToHsl(colors.accent_bg),
    '--accent-foreground': hexToHsl(colors.text),
    '--destructive': hexToHsl(colors.danger_bg),
    '--destructive-foreground': hexToHsl(colors.button_text),
    '--border': hexToHsl(colors.border),
    '--input': hexToHsl(colors.border),
    '--ring': hexToHsl(colors.highlight),
  };
}

export function applyThemeToDocument(colors: ThemeColors): void {
  const root = document.documentElement;
  const variables = themeColorsToCssVariables(colors);

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.style.setProperty('--app-bg', colors.background);
  root.style.setProperty('--app-surface', colors.surface);
  root.style.setProperty('--app-border', colors.border);
  root.style.setProperty('--app-highlight', colors.highlight);
  root.style.setProperty('--app-accent', colors.accent);

  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', colors.window);
  }
}
