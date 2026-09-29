/**
 * Mobile theme resolution logic.
 *
 * Deliberately pure so it runs in the node Vitest environment: the theme data
 * comes from `@char-gen/shared` and anything touching React Native /
 * React Navigation glue stays in the provider or `App.tsx`. The colour mapping
 * mirrors how web maps `ThemeColors` onto CSS variables
 * (`themeColorsToCssVariables`): `--primary` = accent, `--card` = surface,
 * `--border` = border.
 */

import { builtinThemes, type ThemeColors, type ThemePreset } from '@char-gen/shared';

export const DEFAULT_MOBILE_THEME_NAME = 'dark';

export const MOBILE_THEME_OPTIONS: readonly ThemePreset[] = builtinThemes;

function getFallbackTheme(): ThemePreset {
  const defaultTheme = builtinThemes.find((theme) => theme.name === DEFAULT_MOBILE_THEME_NAME);
  if (defaultTheme) {
    return defaultTheme;
  }

  const first = builtinThemes[0];
  if (first) {
    return first;
  }

  throw new Error('No builtin themes are available.');
}

/**
 * Resolves the active theme preset the same way web's ThemeProvider does:
 * match `theme_name`, otherwise fall back to the first available theme.
 */
export function resolveActiveTheme(
  themeName: string | undefined,
  themes: readonly ThemePreset[] = MOBILE_THEME_OPTIONS,
): ThemePreset {
  const source = themes.length > 0 ? themes : builtinThemes;
  const requested = themeName?.trim() || DEFAULT_MOBILE_THEME_NAME;

  return source.find((theme) => theme.name === requested) ?? source[0] ?? getFallbackTheme();
}

/** Relative luminance of a `#rrggbb` colour, used to pick light/dark chrome defaults. */
export function isColorDark(hex: string): boolean {
  const normalized = hex.replace('#', '').trim();
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((value) => value + value)
          .join('')
      : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    return true;
  }

  const red = parseInt(expanded.slice(0, 2), 16) / 255;
  const green = parseInt(expanded.slice(2, 4), 16) / 255;
  const blue = parseInt(expanded.slice(4, 6), 16) / 255;

  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance < 0.5;
}

/** Structurally matches React Navigation's `Theme['colors']` without importing it. */
export interface MobileNavigationThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
}

/**
 * Maps shared theme colours onto navigation chrome colours. Mirrors web's
 * CSS-variable mapping so both surfaces tint the same preset identically.
 */
export function buildNavigationThemeColors(colors: ThemeColors): MobileNavigationThemeColors {
  return {
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  };
}

/** Whether the navigation theme should be flagged dark for system chrome. */
export function resolveNavigationDarkFlag(colors: ThemeColors): boolean {
  return isColorDark(colors.background);
}

export interface ThemeSwatch {
  label: string;
  color: string;
}

/** The preview strip shown on each theme card in the picker. */
export function buildThemeSwatches(colors: ThemeColors): ThemeSwatch[] {
  return [
    { label: 'Background', color: colors.background },
    { label: 'Surface', color: colors.surface },
    { label: 'Accent', color: colors.accent },
    { label: 'Button', color: colors.button },
    { label: 'Border', color: colors.border },
  ];
}

/** Short one-line description for the theme entry point. */
export function describeActiveTheme(preset: ThemePreset | null): string {
  return preset ? `${preset.display_name} • ${preset.colors.accent}` : 'Default dark theme';
}
