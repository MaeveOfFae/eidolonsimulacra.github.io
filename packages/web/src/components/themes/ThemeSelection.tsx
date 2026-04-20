import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Upload,
  XCircle,
  Shield,
  Save,
} from 'lucide-react';
import type { ThemeOverride, ThemePreset } from '@char-gen/shared';
import { useThemePreview } from '../common/useThemePreview';
import {
  EDITABLE_THEME_SECTIONS,
  resolveThemeColors,
} from '../../theme/theme';
import { api } from '../../lib/api.js';
import { saveBlobDownload } from '../../utils/download';

type ThemeImportPayload = {
  version?: number;
  theme_name?: string;
  theme?: ThemeOverride;
  name?: string;
  colors?: ThemePreset['colors'];
};

function buildThemeOverrideFromColors(colors: ThemePreset['colors']): ThemeOverride {
  return {
    app: {
      background: colors.background,
      text: colors.text,
      accent: colors.accent,
      button: colors.button,
      button_text: colors.button_text,
      border: colors.border,
      highlight: colors.highlight,
      window: colors.window,
      muted_text: colors.muted_text,
      surface: colors.surface,
      success_text: colors.success_text,
      error_text: colors.error_text,
      warning_text: colors.warning_text,
      success_bg: colors.success_bg,
      danger_bg: colors.danger_bg,
      accent_bg: colors.accent_bg,
      accent_title: colors.accent_title,
    },
    tokenizer: {
      brackets: colors.tok_brackets,
      asterisk: colors.tok_asterisk,
      parentheses: colors.tok_parentheses,
      double_brackets: colors.tok_double_brackets,
      curly_braces: colors.tok_curly_braces,
      pipes: colors.tok_pipes,
      at_sign: colors.tok_at_sign,
    },
  } as ThemeOverride;
}

export default function ThemeSelection() {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { themes, isLoading: themesLoading, previewTheme, clearPreview } = useThemePreview();

  const [localConfig, setLocalConfig] = useState<{
    theme_name?: string;
    theme?: ThemeOverride;
  }>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load current config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await api.getConfig();
        setLocalConfig({
          theme_name: config.theme_name,
          theme: config.theme,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load config');
      }
    };
    void loadConfig();
  }, []);

  const selectedThemeName = localConfig.theme_name ?? 'dark';
  const selectedTheme = useMemo(
    () => themes.find((theme) => theme.name === selectedThemeName) ?? themes[0],
    [themes, selectedThemeName]
  );

  const resolvedTheme = useMemo(
    () => resolveThemeColors(selectedTheme, localConfig.theme),
    [selectedTheme, localConfig.theme]
  );

  // Live preview effect
  useEffect(() => {
    previewTheme(selectedThemeName, localConfig.theme);
    return () => {
      clearPreview();
    };
  }, [previewTheme, clearPreview, selectedThemeName, localConfig.theme]);

  const updateTheme = (themeName: string, nextTheme: ThemeOverride) => {
    setLocalConfig((previous) => ({
      ...previous,
      theme_name: themeName,
      theme: nextTheme,
    }));
  };

  const handleThemePresetSelect = (themeName: string) => {
    updateTheme(themeName, {});
    setNotice(`Loaded ${themeName} preset. Save to persist it.`);
    setError(null);
  };

  const handleThemeFieldChange = (
    section: 'app' | 'tokenizer',
    key: string,
    value: string
  ) => {
    const themeSections = (localConfig.theme ?? {}) as Record<string, Record<string, string | undefined> | undefined>;
    const sectionValues = themeSections[section] ?? {};
    const nextTheme = {
      ...localConfig.theme,
      [section]: {
        ...sectionValues,
        [key]: value || undefined,
      },
    } as ThemeOverride;

    updateTheme(selectedThemeName, nextTheme);
    setNotice('Preview updated. Save to keep these overrides.');
    setError(null);
  };

  const getThemeOverrideValue = (section: 'app' | 'tokenizer', key: string) => {
    const themeSections = (localConfig.theme ?? {}) as Record<string, Record<string, string | undefined> | undefined>;
    const sectionValues = themeSections[section] as Record<string, string | undefined> | undefined;
    return sectionValues?.[key] || '';
  };

  const handleResetThemeOverrides = () => {
    updateTheme(selectedThemeName, {});
    setNotice('Custom overrides cleared. Preset colors restored.');
    setError(null);
  };

  const handleSaveTheme = async () => {
    try {
      await api.updateConfig({
        theme_name: localConfig.theme_name,
        theme: localConfig.theme,
      });
      setNotice('Theme settings saved.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save theme');
      setNotice(null);
    }
  };

  const handleExportTheme = async () => {
    const payload = {
      version: 1,
      exported_at: new Date().toISOString(),
      theme_name: selectedThemeName,
      theme: localConfig.theme ?? {},
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    await saveBlobDownload(blob, `${selectedThemeName.replace(/[^a-z0-9_-]/gi, '_')}_theme.json`);

    setNotice('Theme JSON exported.');
    setError(null);
  };

  const handleImportThemeClick = () => {
    importInputRef.current?.click();
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as ThemeImportPayload;

      if (parsed.theme || parsed.theme_name) {
        updateTheme(parsed.theme_name ?? selectedThemeName, parsed.theme ?? {});
      } else if (parsed.colors) {
        updateTheme(parsed.name ?? selectedThemeName, buildThemeOverrideFromColors(parsed.colors));
      } else {
        throw new Error('Theme file did not contain a supported theme payload.');
      }

      setNotice(`Imported theme from ${file.name}. Save to persist it.`);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Theme import failed');
      setNotice(null);
    }

    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {(notice || error) && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
          error
            ? 'bg-destructive/10 border border-destructive/30 text-destructive'
            : 'bg-primary/10 border border-primary/30 text-foreground'
        }`}>
          <Shield className={`h-4 w-4 flex-shrink-0 ${error ? 'text-destructive' : 'text-primary'}`} />
          {error || notice}
          <button
            type="button"
            onClick={() => { setError(null); setNotice(null); }}
            className="ml-auto p-1 rounded hover:bg-black/10 transition-colors"
            title="Dismiss"
            aria-label="Dismiss notification"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Active Theme Preview & Save */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold">Active Theme</h2>
              {selectedTheme && (
                <span className="text-sm text-muted-foreground">
                  {selectedTheme.display_name}
                </span>
              )}
            </div>
            {resolvedTheme && (
              <div
                className="rounded-xl border p-3 max-w-md"
                style={{
                  background: `linear-gradient(180deg, ${resolvedTheme.window} 0%, ${resolvedTheme.background} 100%)`,
                  borderColor: resolvedTheme.border,
                  color: resolvedTheme.text,
                }}
              >
                <div
                  className="flex items-center justify-between mb-2 rounded-lg px-3 py-1.5 text-sm"
                  style={{ backgroundColor: resolvedTheme.surface }}
                >
                  <span className="font-medium">Preview</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ backgroundColor: resolvedTheme.accent, color: resolvedTheme.button_text }}
                  >
                    Live
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <div
                    className="flex-1 rounded-lg p-1.5 text-xs font-medium"
                    style={{ backgroundColor: resolvedTheme.accent, color: resolvedTheme.button_text }}
                  >
                    Primary
                  </div>
                  <div
                    className="flex-1 rounded-lg p-1.5 text-xs font-medium border"
                    style={{ borderColor: resolvedTheme.border, color: resolvedTheme.text }}
                  >
                    Secondary
                  </div>
                  <div
                    className="flex-1 rounded-lg p-1.5 text-xs font-medium"
                    style={{ backgroundColor: resolvedTheme.surface, color: resolvedTheme.success_text }}
                  >
                    OK
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSaveTheme}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:from-primary/90 hover:to-accent/90 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              <Save className="h-4 w-4" />
              Save Theme
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportTheme}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                type="button"
                onClick={handleImportThemeClick}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportTheme}
              className="hidden"
              title="Import theme file"
              aria-label="Import theme file"
            />
          </div>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Theme Presets</h2>
        <p className="text-sm text-muted-foreground">
          Select a base theme preset to customize.
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {themesLoading ? (
            <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              Loading theme presets...
            </div>
          ) : (
            themes.map((theme) => {
              const isSelected = theme.name === selectedThemeName;
              return (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => handleThemePresetSelect(theme.name)}
                  className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-accent/50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 -z-10" />
                  )}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-0.5">
                        <div className="font-semibold">{theme.display_name}</div>
                        <div className="text-xs opacity-70">{theme.name}</div>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <p className="text-sm opacity-80 line-clamp-2">{theme.description || 'No description'}</p>
                    <div className="flex gap-2 mt-3">
                      {[theme.colors.background, theme.colors.surface, theme.colors.accent, theme.colors.highlight].map((color) => (
                        <span
                          key={`${theme.name}-${color}`}
                          className="h-6 w-6 rounded-full border border-black/10"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Custom Overrides */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Custom Overrides</h2>
            <p className="text-sm text-muted-foreground">
              Customize colors on top of the selected preset.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetThemeOverrides}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>

        <div className="space-y-5">
          {EDITABLE_THEME_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3">
              <div>
                <h3 className="font-medium text-sm">{section.title}</h3>
                <p className="text-xs text-muted-foreground">{section.description}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {section.fields.map((field) => (
                  <label key={`${section.title}-${field.key}`} className="space-y-1.5 text-sm">
                    <span className="font-medium">{field.label}</span>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        title={field.label}
                        value={getThemeOverrideValue(field.section, field.key) || resolvedTheme?.[field.colorKey] || '#000000'}
                        onChange={(e) => handleThemeFieldChange(field.section, field.key, e.target.value)}
                        className="h-9 w-9 rounded-lg border border-border bg-background p-1 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={getThemeOverrideValue(field.section, field.key)}
                        onChange={(e) => handleThemeFieldChange(field.section, field.key, e.target.value)}
                        placeholder={resolvedTheme?.[field.colorKey] || '#000000'}
                        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
