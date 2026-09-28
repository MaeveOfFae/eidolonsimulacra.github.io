import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ThemeOverride } from '@char-gen/shared';
import { api, THEMES_SYNCED_EVENT } from '@/lib/api';
import { applyThemeToDocument, resolveThemeColors } from '../../theme/theme';
import { ThemeContext, type ThemeContextValue } from './ThemeContext.shared';

interface ThemePreviewState {
  themeName: string;
  overrides?: ThemeOverride;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<ThemePreviewState | null>(null);
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
    initialData: () => api.getConfigSnapshot(),
  });

  const { data: themes = [], isLoading } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.getThemes(),
    initialData: () => api.getThemesSnapshot(),
  });

  const activeThemeName = preview?.themeName ?? config?.theme_name ?? 'dark';
  const activeOverrides = preview?.overrides ?? config?.theme;

  useEffect(() => {
    const preset = themes.find((theme) => theme.name === activeThemeName) ?? themes[0];
    const resolved = resolveThemeColors(preset, activeOverrides);
    if (resolved) {
      applyThemeToDocument(resolved);
    }
  }, [themes, activeThemeName, activeOverrides]);

  useEffect(() => {
    const handleThemesSynced = () => {
      void queryClient.invalidateQueries({ queryKey: ['themes'] });
    };

    window.addEventListener(THEMES_SYNCED_EVENT, handleThemesSynced);
    return () => {
      window.removeEventListener(THEMES_SYNCED_EVENT, handleThemesSynced);
    };
  }, [queryClient]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      themes,
      isLoading,
      previewTheme: (themeName: string, overrides?: ThemeOverride) => {
        setPreview({ themeName, overrides });
      },
      clearPreview: () => {
        setPreview(null);
      },
    }),
    [themes, isLoading],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
