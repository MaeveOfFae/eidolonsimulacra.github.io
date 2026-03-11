import { createContext } from 'react';

import type { ThemeOverride, ThemePreset } from '@char-gen/shared';

export interface ThemeContextValue {
  themes: ThemePreset[];
  isLoading: boolean;
  previewTheme: (themeName: string, overrides?: ThemeOverride) => void;
  clearPreview: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);