import { describe, expect, it } from 'vitest';
import { builtinThemes, type ThemePreset } from '@char-gen/shared';
import { DEFAULT_DEVICE_CONFIG } from '../storage/device-config';
import {
  DEFAULT_MOBILE_THEME_NAME,
  MOBILE_THEME_OPTIONS,
  buildNavigationThemeColors,
  buildThemeSwatches,
  describeActiveTheme,
  isColorDark,
  resolveActiveTheme,
  resolveNavigationDarkFlag,
} from './theme';

function buildPreset(overrides: Partial<ThemePreset> = {}): ThemePreset {
  const base = builtinThemes[0]!;
  return {
    ...base,
    name: 'test-theme',
    ...overrides,
  };
}

describe('resolveActiveTheme', () => {
  it('resolves the requested theme by name', () => {
    expect(resolveActiveTheme('midnight', MOBILE_THEME_OPTIONS).name).toBe('midnight');
  });

  it('falls back to the first available theme for an unknown name', () => {
    expect(resolveActiveTheme('does-not-exist', MOBILE_THEME_OPTIONS).name).toBe(MOBILE_THEME_OPTIONS[0]!.name);
  });

  it('falls back to the shared dark theme when no name is stored', () => {
    expect(resolveActiveTheme(undefined, MOBILE_THEME_OPTIONS).name).toBe(DEFAULT_MOBILE_THEME_NAME);
    expect(resolveActiveTheme('   ', MOBILE_THEME_OPTIONS).name).toBe(DEFAULT_MOBILE_THEME_NAME);
  });

  it('falls back to the builtin catalogue when the supplied list is empty', () => {
    expect(resolveActiveTheme('midnight', []).name).toBe('midnight');
  });

  it('resolves the shared builtin catalogue by default', () => {
    expect(resolveActiveTheme('light').name).toBe('light');
  });
});

describe('isColorDark', () => {
  it('classifies dark and light backgrounds', () => {
    expect(isColorDark('#0f172a')).toBe(true);
    expect(isColorDark('#000000')).toBe(true);
    expect(isColorDark('#f8fafc')).toBe(false);
    expect(isColorDark('#ffffff')).toBe(false);
  });

  it('expands three-digit hex shorthand', () => {
    expect(isColorDark('#000')).toBe(true);
    expect(isColorDark('#fff')).toBe(false);
  });

  it('treats malformed values as dark rather than crashing', () => {
    expect(isColorDark('not-a-color')).toBe(true);
  });
});

describe('buildNavigationThemeColors', () => {
  it('maps the shared colour tokens onto navigation chrome', () => {
    const dark = builtinThemes.find((theme) => theme.name === 'dark')!;
    const navigationColors = buildNavigationThemeColors(dark.colors);

    expect(navigationColors.primary).toBe(dark.colors.accent);
    expect(navigationColors.background).toBe(dark.colors.background);
    expect(navigationColors.card).toBe(dark.colors.surface);
    expect(navigationColors.text).toBe(dark.colors.text);
    expect(navigationColors.border).toBe(dark.colors.border);
    expect(navigationColors.notification).toBe(dark.colors.accent);
  });
});

describe('resolveNavigationDarkFlag', () => {
  it('marks light themes as light so system chrome adapts', () => {
    const light = builtinThemes.find((theme) => theme.name === 'light')!;
    const dark = builtinThemes.find((theme) => theme.name === 'dark')!;

    expect(resolveNavigationDarkFlag(light.colors)).toBe(false);
    expect(resolveNavigationDarkFlag(dark.colors)).toBe(true);
  });
});

describe('buildThemeSwatches', () => {
  it('previews the five tokens the picker card shows', () => {
    const dark = builtinThemes.find((theme) => theme.name === 'dark')!;
    const swatches = buildThemeSwatches(dark.colors);

    expect(swatches.map((swatch) => swatch.label)).toEqual(['Background', 'Surface', 'Accent', 'Button', 'Border']);
    expect(swatches[0].color).toBe(dark.colors.background);
    expect(swatches[2].color).toBe(dark.colors.accent);
  });
});

describe('describeActiveTheme', () => {
  it('names the active preset and its accent colour', () => {
    const dark = builtinThemes.find((theme) => theme.name === 'dark')!;

    expect(describeActiveTheme(dark)).toContain('Dark');
    expect(describeActiveTheme(dark)).toContain(dark.colors.accent);
  });

  it('falls back when no preset is available', () => {
    expect(describeActiveTheme(null)).toBe('Default dark theme');
  });
});

describe('device config default', () => {
  it('defaults to the dark theme like web does', () => {
    expect(DEFAULT_DEVICE_CONFIG.theme_name).toBe('dark');
    expect(builtinThemes.some((theme) => theme.name === DEFAULT_DEVICE_CONFIG.theme_name)).toBe(true);
  });

  it('exposes every builtin theme as a mobile option', () => {
    expect(MOBILE_THEME_OPTIONS).toHaveLength(27);
    expect(MOBILE_THEME_OPTIONS.every((theme) => theme.is_builtin)).toBe(true);
  });
});

describe('preset construction helper', () => {
  it('builds presets from the builtin baseline without mutating it', () => {
    const preset = buildPreset({ name: 'custom-name' });
    const baseline = builtinThemes[0]!;

    expect(preset.name).toBe('custom-name');
    expect(baseline.name).not.toBe('custom-name');
    expect(preset.colors).toEqual(baseline.colors);
  });
});
