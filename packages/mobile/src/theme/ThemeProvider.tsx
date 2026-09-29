import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ThemeColors, ThemePreset } from '@char-gen/shared';
import { getStoredDeviceConfig, updateStoredDeviceConfig } from '../storage/device-config';
import { DEFAULT_MOBILE_THEME_NAME, MOBILE_THEME_OPTIONS, resolveActiveTheme } from './theme';

interface MobileThemeContextValue {
  /** The resolved preset's name (may differ from the stored name if it was unknown). */
  themeName: string;
  preset: ThemePreset;
  colors: ThemeColors;
  themes: readonly ThemePreset[];
  setThemeName: (name: string) => void;
}

const MobileThemeContext = createContext<MobileThemeContextValue | null>(null);

/**
 * Mobile counterpart of web's `ThemeProvider`: resolves the stored
 * `theme_name` against the shared builtin catalogue and exposes the active
 * colours. Persistence rides the same `['device-config']` query every other
 * settings surface uses, so a selection retints the app chrome immediately.
 */
export function MobileThemeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ['device-config'],
    queryFn: async () => getStoredDeviceConfig(),
  });

  const storedName = config?.theme_name?.trim() || DEFAULT_MOBILE_THEME_NAME;
  const preset = resolveActiveTheme(storedName, MOBILE_THEME_OPTIONS);

  const value = useMemo<MobileThemeContextValue>(
    () => ({
      themeName: preset.name,
      preset,
      colors: preset.colors,
      themes: MOBILE_THEME_OPTIONS,
      setThemeName: (name: string) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }

        const nextConfig = updateStoredDeviceConfig({ theme_name: trimmed });
        queryClient.setQueryData(['device-config'], nextConfig);
      },
    }),
    [preset, queryClient],
  );

  return <MobileThemeContext.Provider value={value}>{children}</MobileThemeContext.Provider>;
}

export function useTheme(): MobileThemeContextValue {
  const context = useContext(MobileThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within MobileThemeProvider');
  }

  return context;
}
