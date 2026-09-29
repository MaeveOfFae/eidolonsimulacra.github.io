import { describe, expect, it } from 'vitest';
import { builtinTheme, builtinThemes } from './builtin-themes';
import type { ThemeColors, ThemePreset } from '../types';

const EXPECTED_COLOR_KEYS: Array<keyof ThemeColors> = [
  'background',
  'text',
  'accent',
  'button',
  'button_text',
  'border',
  'highlight',
  'window',
  'tok_brackets',
  'tok_asterisk',
  'tok_parentheses',
  'tok_double_brackets',
  'tok_curly_braces',
  'tok_pipes',
  'tok_at_sign',
  'muted_text',
  'surface',
  'success_bg',
  'danger_bg',
  'accent_bg',
  'accent_title',
  'success_text',
  'error_text',
  'warning_text',
];

function buildPreset(colors: ThemeColors): Omit<ThemePreset, 'author' | 'is_builtin'> & { author?: string } {
  return {
    name: 'test-theme',
    display_name: 'Test Theme',
    description: 'A test theme.',
    tags: ['test'],
    based_on: '',
    colors,
  };
}

describe('builtinTheme factory', () => {
  it('stamps builtin authorship and flags', () => {
    const theme = builtinTheme(buildPreset(builtinThemes[0]!.colors));

    expect(theme.author).toBe('Eidolon Simulacra');
    expect(theme.is_builtin).toBe(true);
  });

  it('lets an explicit author win over the default', () => {
    const theme = builtinTheme({ ...buildPreset(builtinThemes[0]!.colors), author: 'Someone else' });

    expect(theme.author).toBe('Someone else');
    expect(theme.is_builtin).toBe(true);
  });
});

describe('builtinThemes data', () => {
  it('ships the expected catalogue of themes', () => {
    expect(builtinThemes.length).toBe(27);
  });

  it('uses unique theme names', () => {
    const names = builtinThemes.map((theme) => theme.name);

    expect(new Set(names).size).toBe(names.length);
  });

  it('keeps every theme narrative field populated', () => {
    builtinThemes.forEach((theme) => {
      expect(theme.display_name.trim().length).toBeGreaterThan(0);
      expect(theme.description.trim().length).toBeGreaterThan(0);
      expect(theme.name).toBe(theme.name.trim().toLowerCase());
    });
  });

  it('defines every colour token as a six-digit hex value for every theme', () => {
    builtinThemes.forEach((theme) => {
      expect(Object.keys(theme.colors).sort()).toEqual([...EXPECTED_COLOR_KEYS].sort());
      EXPECTED_COLOR_KEYS.forEach((key) => {
        expect(theme.colors[key]).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  it('only derives from themes that exist in the catalogue', () => {
    const names = new Set(builtinThemes.map((theme) => theme.name));

    builtinThemes.forEach((theme) => {
      if (theme.based_on) {
        expect(names.has(theme.based_on)).toBe(true);
      }
    });
  });

  it('includes the dark theme both surfaces fall back to', () => {
    const dark = builtinThemes.find((theme) => theme.name === 'dark');

    expect(dark).toBeDefined();
    expect(dark?.is_builtin).toBe(true);
  });

  it('includes a light theme for light-mode preference', () => {
    expect(builtinThemes.some((theme) => theme.name === 'light')).toBe(true);
  });
});
