import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Palette, Save, Upload, Wand2 } from 'lucide-react';
import type { ThemeColors, ThemePreset } from '@char-gen/shared';
import { api } from '@/lib/api';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
import {
  buildUniqueThemeName,
  parseTagInput,
  sanitizeThemeName,
  type ThemePresetRecord,
} from '@/lib/themes/theme-helpers';
import { EDITABLE_THEME_SECTIONS, resolveThemeColors, applyThemeToDocument } from '../../theme/theme';
import { pickFile, saveDownload } from '../../utils/download';
import SyncControls from '../common/SyncControls';
import ThemeCard from './ThemeCard';
import ThemeCardForms, {
  type ThemeDuplicateDraft,
  type ThemeMetadataDraft,
  type ThemeRenameDraft,
} from './ThemeCardForms';
import ThemeFiltersPanel, { type ThemeSortMode, type ThemeViewMode } from './ThemeFiltersPanel';
import ThemeImportDialog, { type ImportedThemePayload, type ThemeImportDraft } from './ThemeImportDialog';

interface ThemeImportOptions {
  conflict_strategy?: 'reject' | 'rename' | 'overwrite';
  target_name?: string;
}

type ThemeApi = typeof api & {
  exportTheme: (name: string) => Promise<{ blob: Blob; filename: string | null; contentType: string | null }>;
  importTheme: (file: File, options?: ThemeImportOptions) => Promise<ThemePreset>;
  createTheme: (request: {
    name: string;
    display_name: string;
    description?: string;
    author?: string;
    tags?: string[];
    based_on?: string;
    colors: ThemeColors;
  }) => Promise<ThemePreset>;
  updateTheme: (
    name: string,
    request: {
      display_name?: string;
      description?: string;
      author?: string;
      tags?: string[];
      based_on?: string;
      colors?: ThemeColors;
    },
  ) => Promise<ThemePreset>;
  duplicateTheme: (
    name: string,
    request: {
      new_name: string;
      display_name?: string;
      description?: string;
      author?: string;
      tags?: string[];
      based_on?: string;
    },
  ) => Promise<ThemePreset>;
  renameTheme: (name: string, request: { new_name: string; display_name?: string }) => Promise<ThemePreset>;
  deleteTheme: (name: string) => Promise<{ status: string; name: string }>;
};

const themeApi = api as ThemeApi;

async function readImportedThemePayload(file: File): Promise<ImportedThemePayload> {
  const raw = JSON.parse(await file.text()) as Record<string, unknown>;
  const payload = (raw.theme && typeof raw.theme === 'object' ? raw.theme : raw) as Record<string, unknown>;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const displayNameValue = payload.display_name ?? payload.displayName;
  const displayName = typeof displayNameValue === 'string' ? displayNameValue.trim() : '';
  const description = typeof payload.description === 'string' ? payload.description : '';
  const author = typeof payload.author === 'string' ? payload.author : '';
  const tags = Array.isArray(payload.tags) ? payload.tags.map((tag) => String(tag).trim()).filter(Boolean) : [];
  const basedOnValue = payload.based_on ?? payload.basedOn;
  const basedOn = typeof basedOnValue === 'string' ? basedOnValue : '';
  const colors = payload.colors;

  if (!name || !displayName || !colors || typeof colors !== 'object') {
    throw new Error('Theme file is missing a valid name, display name, or colors payload.');
  }

  return { name, displayName, description, author, tags, basedOn, colors: colors as ThemeColors };
}

export default function Themes() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const queryClient = useQueryClient();
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'builtin' | 'custom'>('all');
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortMode, setSortMode] = useState<ThemeSortMode>('name-asc');
  const [viewMode, setViewMode] = useState<ThemeViewMode>('comfortable');
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeDisplayName, setNewThemeDisplayName] = useState('');
  const [newThemeDescription, setNewThemeDescription] = useState('');
  const [newThemeAuthor, setNewThemeAuthor] = useState('');
  const [newThemeTags, setNewThemeTags] = useState('');
  const [newThemeBasedOn, setNewThemeBasedOn] = useState('');
  const [duplicateDraft, setDuplicateDraft] = useState<ThemeDuplicateDraft | null>(null);
  const [renameDraft, setRenameDraft] = useState<ThemeRenameDraft | null>(null);
  const [metadataDraft, setMetadataDraft] = useState<ThemeMetadataDraft | null>(null);
  const [importDraft, setImportDraft] = useState<ThemeImportDraft | null>(null);

  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
  });

  const { data: themes = [], isLoading: themesLoading } = useQuery<ThemePresetRecord[]>({
    queryKey: ['themes'],
    queryFn: () => api.getThemes() as Promise<ThemePresetRecord[]>,
  });

  const activeTheme = useMemo(
    () => themes.find((theme) => theme.name === config?.theme_name) ?? themes[0],
    [themes, config?.theme_name],
  );

  const resolvedCurrentTheme = useMemo(
    () => resolveThemeColors(activeTheme, config?.theme),
    [activeTheme, config?.theme],
  );

  const importDiffSections = useMemo(() => {
    if (!importDraft) {
      return [];
    }

    return EDITABLE_THEME_SECTIONS.map((section) => {
      const changes = section.fields
        .map((field) => {
          const existingValue = importDraft.conflictTheme.colors[field.colorKey];
          const importedValue = importDraft.imported.colors[field.colorKey];

          if (existingValue === importedValue) {
            return null;
          }

          return {
            label: field.label,
            existingValue,
            importedValue,
          };
        })
        .filter((value): value is { label: string; existingValue: string; importedValue: string } => Boolean(value));

      return {
        title: section.title,
        changes,
      };
    }).filter((section) => section.changes.length > 0);
  }, [importDraft]);

  const importDiffCount = useMemo(
    () => importDiffSections.reduce((count, section) => count + section.changes.length, 0),
    [importDiffSections],
  );

  const updateThemesCache = (updatedTheme: ThemePresetRecord) => {
    const currentThemes = queryClient.getQueryData<ThemePresetRecord[]>(['themes']) ?? [];
    const updatedThemes = currentThemes.map((t) => (t.name === updatedTheme.name ? updatedTheme : t));
    queryClient.setQueryData(['themes'], updatedThemes);
    // If this is the active theme, apply it directly to the document
    if (config?.theme_name === updatedTheme.name) {
      const resolved = resolveThemeColors(updatedTheme, config?.theme);
      if (resolved) {
        applyThemeToDocument(resolved);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: () => {
      if (!resolvedCurrentTheme) {
        throw new Error('No resolved theme available to save.');
      }

      return themeApi.createTheme({
        name: newThemeName,
        display_name: newThemeDisplayName,
        description: newThemeDescription,
        author: newThemeAuthor,
        tags: parseTagInput(newThemeTags),
        based_on: newThemeBasedOn,
        colors: resolvedCurrentTheme,
      });
    },
    onSuccess: async (theme) => {
      await queryClient.refetchQueries({ queryKey: ['themes'] });
      setNotice(`Created reusable theme preset ${theme.display_name}.`);
      setError(null);
      setNewThemeName('');
      setNewThemeDisplayName('');
      setNewThemeDescription('');
      setNewThemeAuthor('');
      setNewThemeTags('');
      setNewThemeBasedOn('');
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to create theme');
      setNotice(null);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (themeName: string) => api.updateConfig({ theme_name: themeName, theme: {} }),
    onSuccess: async () => {
      const newConfig = await api.getConfig();
      queryClient.setQueryData(['config'], newConfig);
      setNotice('Theme activated.');
      setError(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to activate theme');
      setNotice(null);
    },
  });

  const updateCurrentCustomMutation = useMutation({
    mutationFn: (themeName: string) => {
      if (!resolvedCurrentTheme) {
        throw new Error('No resolved theme available to save.');
      }
      return themeApi.updateTheme(themeName, { colors: resolvedCurrentTheme });
    },
    onSuccess: (theme) => {
      updateThemesCache(theme as ThemePresetRecord);
      setNotice(`Updated ${theme.display_name} from the current active palette.`);
      setError(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to update theme');
      setNotice(null);
    },
  });

  const updateMetadataMutation = useMutation({
    mutationFn: (draft: ThemeMetadataDraft) =>
      themeApi.updateTheme(draft.sourceName, {
        display_name: draft.displayName,
        description: draft.description,
        author: draft.author,
        tags: parseTagInput(draft.tags),
        based_on: draft.basedOn,
      }),
    onSuccess: (theme) => {
      updateThemesCache(theme as ThemePresetRecord);
      setNotice(`Updated metadata for ${theme.display_name}.`);
      setError(null);
      setMetadataDraft(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to update theme metadata');
      setNotice(null);
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (draft: ThemeDuplicateDraft) =>
      themeApi.duplicateTheme(draft.sourceName, {
        new_name: draft.newName,
        display_name: draft.displayName,
        description: draft.description,
        author: draft.author,
        tags: parseTagInput(draft.tags),
        based_on: draft.basedOn,
      }),
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ['themes'] });
      setNotice(`Created duplicate preset.`);
      setError(null);
      setDuplicateDraft(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to duplicate theme');
      setNotice(null);
    },
  });

  const renameMutation = useMutation({
    mutationFn: (draft: ThemeRenameDraft) =>
      themeApi.renameTheme(draft.sourceName, {
        new_name: draft.newName,
        display_name: draft.displayName,
      }),
    onSuccess: async (theme) => {
      await queryClient.refetchQueries({ queryKey: ['themes'] });
      if (config?.theme_name === theme.name) {
        const newConfig = await api.getConfig();
        queryClient.setQueryData(['config'], newConfig);
      }
      setNotice(`Renamed theme to ${theme.display_name}.`);
      setError(null);
      setRenameDraft(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to rename theme');
      setNotice(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (themeName: string) => themeApi.deleteTheme(themeName),
    onSuccess: async (_, themeName) => {
      await queryClient.refetchQueries({ queryKey: ['themes'] });
      setNotice(`Deleted ${themeName}.`);
      setError(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to delete theme');
      setNotice(null);
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (theme: ThemePreset) => {
      const download = await themeApi.exportTheme(theme.name);
      await saveDownload(download, `${theme.name}.theme.json`);
      return theme;
    },
    onSuccess: (theme) => {
      setNotice(`Exported ${theme.display_name}.`);
      setError(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to export theme');
      setNotice(null);
    },
  });

  const importMutation = useMutation({
    mutationFn: ({ file, options }: { file: File; options?: ThemeImportOptions }) =>
      themeApi.importTheme(file, options),
    onSuccess: async (theme) => {
      await queryClient.refetchQueries({ queryKey: ['themes'] });
      setNotice(`Imported theme preset ${theme.display_name}.`);
      setError(null);
      setImportDraft(null);
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : 'Failed to import theme');
      setNotice(null);
    },
  });

  const builtInThemes = themes.filter((theme) => theme.is_builtin);
  const customThemes = themes.filter((theme) => !theme.is_builtin);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    themes.forEach((theme) => {
      theme.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort((left, right) => left.localeCompare(right));
  }, [themes]);

  const availableAuthors = useMemo(() => {
    const authors = new Set<string>();
    themes.forEach((theme) => {
      if (theme.author.trim()) {
        authors.add(theme.author.trim());
      }
    });
    return Array.from(authors).sort((left, right) => left.localeCompare(right));
  }, [themes]);

  const filteredThemes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return themes.filter((theme) => {
      const matchesSource =
        sourceFilter === 'all' ||
        (sourceFilter === 'builtin' && theme.is_builtin) ||
        (sourceFilter === 'custom' && !theme.is_builtin);
      if (!matchesSource) {
        return false;
      }

      const matchesAuthor = selectedAuthor === 'all' || theme.author === selectedAuthor;
      if (!matchesAuthor) {
        return false;
      }

      const matchesTag = selectedTag === 'all' || theme.tags.includes(selectedTag);
      if (!matchesTag) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [theme.name, theme.display_name, theme.description, theme.author, theme.based_on, ...theme.tags]
        .join(' ')
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [themes, searchQuery, sourceFilter, selectedAuthor, selectedTag]);

  const sortedThemes = useMemo(() => {
    const themesToSort = [...filteredThemes];

    themesToSort.sort((left, right) => {
      if (sortMode === 'name-desc') {
        return right.display_name.localeCompare(left.display_name);
      }

      if (sortMode === 'author-asc') {
        const authorCompare = (left.author || 'zzzz').localeCompare(right.author || 'zzzz');
        if (authorCompare !== 0) {
          return authorCompare;
        }
        return left.display_name.localeCompare(right.display_name);
      }

      if (sortMode === 'source') {
        const sourceCompare = Number(left.is_builtin) - Number(right.is_builtin);
        if (sourceCompare !== 0) {
          return sourceCompare;
        }
        return left.display_name.localeCompare(right.display_name);
      }

      return left.display_name.localeCompare(right.display_name);
    });

    return themesToSort;
  }, [filteredThemes, sortMode]);

  const isBusy =
    createMutation.isPending ||
    activateMutation.isPending ||
    updateCurrentCustomMutation.isPending ||
    updateMetadataMutation.isPending ||
    duplicateMutation.isPending ||
    renameMutation.isPending ||
    deleteMutation.isPending ||
    exportMutation.isPending ||
    importMutation.isPending;

  const handleImport = async () => {
    const file = await pickFile({ accept: 'application/json,.json' }, importInputRef.current);
    if (!file) {
      return;
    }

    try {
      const imported = await readImportedThemePayload(file);
      const existingTheme = themes.find((theme) => sanitizeThemeName(theme.name) === sanitizeThemeName(imported.name));

      if (!existingTheme) {
        importMutation.mutate({ file });
      } else {
        setImportDraft({
          file,
          imported,
          conflictTheme: existingTheme,
          targetName: buildUniqueThemeName(imported.name, themes),
        });
        setError(null);
        setNotice(
          `Theme ${imported.displayName} conflicts with existing preset ${existingTheme.display_name}. Choose how to import it.`,
        );
      }
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'Failed to read theme file');
      setNotice(null);
      setImportDraft(null);
    }
  };

  if (configLoading || themesLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading theme manager...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-2">
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to settings
            </Link>
          </div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Palette className="h-7 w-7 text-primary" />
            Theme Manager
          </h1>
          <p className="text-muted-foreground">
            Save the current palette as a reusable preset and manage custom themes for the web app and review surfaces.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void handleImport()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent"
          >
            <Upload className="h-4 w-4" />
            Import preset
          </button>
          <input ref={importInputRef} type="file" accept="application/json" className="hidden" />
          {activeTheme && (
            <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
              <div className="font-medium">Active preset</div>
              <div className="text-muted-foreground">{activeTheme.display_name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Device link guidance */}
      {!selfContainedDesktop && (
        <div className="rounded-lg border border-border bg-card p-4">
          <SyncControls
            dataType="themes"
            label="Themes"
            onGetLocalData={async () => {
              const themes = await api.getThemes();
              return { version: '1.0', exportedAt: new Date().toISOString(), themes };
            }}
            onApplyData={async (data) => {
              if (data && typeof data === 'object') {
                queryClient.invalidateQueries({ queryKey: ['themes'] });
              }
            }}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Save Current Theme as Preset</h2>
              <p className="text-sm text-muted-foreground">
                Creates a named custom preset from the current active theme plus any live overrides saved in settings.
              </p>
            </div>
            {activeTheme && !activeTheme.is_builtin && (
              <button
                type="button"
                onClick={() => updateCurrentCustomMutation.mutate(activeTheme.name)}
                disabled={isBusy || !resolvedCurrentTheme}
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                {updateCurrentCustomMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Update active custom theme
              </button>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Theme name</span>
              <input
                type="text"
                value={newThemeName}
                onChange={(event) => setNewThemeName(event.target.value)}
                placeholder="e.g. ember_night"
                className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Display name</span>
              <input
                type="text"
                value={newThemeDisplayName}
                onChange={(event) => setNewThemeDisplayName(event.target.value)}
                placeholder="Ember Night"
                className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
          <label className="mt-4 block space-y-2 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              value={newThemeDescription}
              onChange={(event) => setNewThemeDescription(event.target.value)}
              rows={3}
              placeholder="Warm preview theme tuned for long review sessions."
              className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Author</span>
              <input
                type="text"
                value={newThemeAuthor}
                onChange={(event) => setNewThemeAuthor(event.target.value)}
                placeholder="e.g. Nyx"
                className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Based on</span>
              <input
                type="text"
                value={newThemeBasedOn}
                onChange={(event) => setNewThemeBasedOn(event.target.value)}
                placeholder="e.g. dark"
                className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          </div>
          <label className="mt-4 block space-y-2 text-sm">
            <span className="font-medium">Tags</span>
            <input
              type="text"
              value={newThemeTags}
              onChange={(event) => setNewThemeTags(event.target.value)}
              placeholder="warm, editorial, night"
              className="w-full rounded-md border border-input bg-background px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          {resolvedCurrentTheme && (
            <div className="mt-4 rounded-lg border border-border bg-background/60 p-4">
              <div className="text-sm font-medium">Current palette preview</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  resolvedCurrentTheme.background,
                  resolvedCurrentTheme.surface,
                  resolvedCurrentTheme.accent,
                  resolvedCurrentTheme.button,
                  resolvedCurrentTheme.tok_brackets,
                  resolvedCurrentTheme.highlight,
                ].map((color, index) => (
                  <span
                    key={`${index}-${color}`}
                    className="h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => createMutation.mutate()}
              disabled={isBusy || !newThemeName.trim() || !newThemeDisplayName.trim() || !resolvedCurrentTheme}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Save custom preset
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-lg font-semibold">Preset Summary</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="text-2xl font-bold text-primary">{builtInThemes.length}</div>
              <div className="text-sm text-muted-foreground">Built-in themes</div>
            </div>
            <div className="rounded-lg border border-border bg-background/60 p-4">
              <div className="text-2xl font-bold text-primary">{customThemes.length}</div>
              <div className="text-sm text-muted-foreground">Custom themes</div>
            </div>
          </div>
        </section>
      </div>

      {(notice || error) && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${error ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-primary/30 bg-primary/10 text-foreground'}`}
        >
          {error || notice}
        </div>
      )}

      {importDraft && (
        <ThemeImportDialog
          importDraft={importDraft}
          importDiffCount={importDiffCount}
          importDiffSections={importDiffSections}
          isImporting={importMutation.isPending}
          onDismiss={() => setImportDraft(null)}
          onTargetNameChange={(targetName) =>
            setImportDraft((current) => (current ? { ...current, targetName } : current))
          }
          onOverwrite={() =>
            importMutation.mutate({
              file: importDraft.file,
              options: { conflict_strategy: 'overwrite', target_name: importDraft.conflictTheme.name },
            })
          }
          onImportRenamed={() =>
            importMutation.mutate({
              file: importDraft.file,
              options: { conflict_strategy: 'rename', target_name: importDraft.targetName },
            })
          }
        />
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Available Themes</h2>
          <p className="text-sm text-muted-foreground">
            Built-in themes are read-only. Custom themes can be renamed, duplicated, activated, updated, and deleted.
          </p>
        </div>

        <ThemeFiltersPanel
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          sourceFilter={sourceFilter}
          onSourceFilterChange={setSourceFilter}
          selectedAuthor={selectedAuthor}
          onSelectedAuthorChange={setSelectedAuthor}
          selectedTag={selectedTag}
          onSelectedTagChange={setSelectedTag}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          availableAuthors={availableAuthors}
          availableTags={availableTags}
          visibleCount={sortedThemes.length}
          totalCount={themes.length}
        />

        {sortedThemes.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No themes match the current search and tag filters.
          </div>
        )}

        <div className={`grid gap-4 ${viewMode === 'compact' ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-2'}`}>
          {sortedThemes.map((theme) => {
            const isActive = config?.theme_name === theme.name;
            const isCustom = !theme.is_builtin;
            const isDuplicating = duplicateDraft?.sourceName === theme.name;
            const isRenaming = renameDraft?.sourceName === theme.name;
            const isEditingMetadata = metadataDraft?.sourceName === theme.name;

            return (
              <ThemeCard
                key={theme.name}
                theme={theme}
                isActive={isActive}
                isCustom={isCustom}
                isCompact={viewMode === 'compact'}
                isBusy={isBusy}
                onActivate={() => activateMutation.mutate(theme.name)}
                onExport={() => exportMutation.mutate(theme)}
                onOpenDuplicate={() =>
                  setDuplicateDraft({
                    sourceName: theme.name,
                    newName: `${theme.name}_copy`,
                    displayName: `${theme.display_name} Copy`,
                    description: theme.description,
                    author: theme.author,
                    tags: theme.tags.join(', '),
                    basedOn: theme.based_on,
                  })
                }
                onOpenMetadata={() =>
                  setMetadataDraft({
                    sourceName: theme.name,
                    displayName: theme.display_name,
                    description: theme.description,
                    author: theme.author,
                    tags: theme.tags.join(', '),
                    basedOn: theme.based_on,
                  })
                }
                onOpenRename={() =>
                  setRenameDraft({
                    sourceName: theme.name,
                    newName: theme.name,
                    displayName: theme.display_name,
                  })
                }
                onDelete={() => {
                  if (window.confirm(`Delete theme ${theme.display_name}?`)) {
                    deleteMutation.mutate(theme.name);
                  }
                }}
              >
                <ThemeCardForms
                  duplicateDraft={isDuplicating ? duplicateDraft : null}
                  renameDraft={isRenaming ? renameDraft : null}
                  metadataDraft={isEditingMetadata ? metadataDraft : null}
                  isSubmittingDuplicate={duplicateMutation.isPending}
                  isSubmittingRename={renameMutation.isPending}
                  isSavingMetadata={updateMetadataMutation.isPending}
                  onDuplicateDraftChange={setDuplicateDraft}
                  onRenameDraftChange={setRenameDraft}
                  onMetadataDraftChange={setMetadataDraft}
                  onSubmitDuplicate={() => {
                    if (duplicateDraft) duplicateMutation.mutate(duplicateDraft);
                  }}
                  onSubmitRename={() => {
                    if (renameDraft) renameMutation.mutate(renameDraft);
                  }}
                  onSubmitMetadata={() => {
                    if (metadataDraft) updateMetadataMutation.mutate(metadataDraft);
                  }}
                  onCancelDuplicate={() => setDuplicateDraft(null)}
                  onCancelRename={() => setRenameDraft(null)}
                  onCancelMetadata={() => setMetadataDraft(null)}
                />
              </ThemeCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
