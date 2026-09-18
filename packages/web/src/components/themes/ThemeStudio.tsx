import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Globe, Palette, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { isSelfContainedDesktopRuntime } from '@/lib/runtime';
import { EDITABLE_THEME_SECTIONS } from '../../theme/theme';
import ThemeSelection from './ThemeSelection';
import ThemeEditor from './ThemeEditor';
import ThemeBrowserPlaceholder from './ThemeBrowserPlaceholder';
import SyncControls from '../common/SyncControls';

interface StudioSection {
  id: 'theme-runtime' | 'theme-workshop' | 'theme-browser';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  note: string;
}

const sections: StudioSection[] = [
  {
    id: 'theme-runtime',
    label: 'Runtime Editor',
    icon: Palette,
    title: 'Tune the active preset and preview changes live.',
    description: 'Choose the active preset, preview it live, and edit app or tokenizer colors in one place.',
    note: 'This is the primary surface. Most theme work should start here.',
  },
  {
    id: 'theme-workshop',
    label: 'Preset Workshop',
    icon: Pencil,
    title: 'Manage reusable presets without crowding the runtime editor.',
    description: 'Create reusable presets, import them, duplicate them, and keep the library organized.',
    note: 'Built-in presets stay read-only; custom presets stay editable and syncable.',
  },
  {
    id: 'theme-browser',
    label: 'Community Browser',
    icon: Globe,
    title: 'Keep the public browser visible without giving it primary weight.',
    description: 'Track the public sharing surface without burying the local tools behind another tab.',
    note: 'This remains secondary until the browser is fully implemented.',
  },
];

export default function ThemeStudio() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState<StudioSection['id']>('theme-runtime');
  const { data: config } = useQuery({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
  });
  const { data: themes = [] } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.getThemes(),
  });

  const activeTheme = themes.find((theme) => theme.name === config?.theme_name) ?? themes[0];
  const customThemeCount = themes.filter((theme) => !theme.is_builtin).length;
  const builtinThemeCount = themes.filter((theme) => theme.is_builtin).length;
  const editableFieldCount = EDITABLE_THEME_SECTIONS.reduce((count, section) => count + section.fields.length, 0);
  const activeStudioSection = sections.find((section) => section.id === activeSection) ?? sections[0];

  return (
    <div className="app-page space-y-8 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Theme runtime</p>
            <h1 className="app-page-title">Tune the live palette</h1>
            <p className="app-page-summary">
              Keep the theme route focused on the current preset first, then open preset management or the community browser only when you actually need them.
            </p>
            <p className="text-xs text-muted-foreground">
              Changes apply automatically. If another page does not repaint cleanly, press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">F5</kbd> to refresh.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="app-pill app-pill-emerald">Live preview enabled</span>
              <span className="app-pill app-pill-muted">Changes apply in-place</span>
            </div>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Studio state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Active preset</p>
                <div className="app-page-metric-value text-xl">{activeTheme?.display_name ?? 'Loading'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Library</p>
                <div className="app-page-metric-value text-2xl">{themes.length}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Custom presets</p>
                <div className="app-page-metric-value text-2xl">{customThemeCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Built-in presets</p>
                <div className="app-page-metric-value text-2xl">{builtinThemeCount}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Editable fields</p>
                <div className="app-page-metric-value text-2xl">{editableFieldCount}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex overflow-x-auto pb-1">
        <div className="app-tab-group min-w-max">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                data-active={isActive ? 'true' : 'false'}
                className="app-tab-button"
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="app-page-eyebrow">{activeStudioSection.label}</p>
            <h2 className="text-2xl font-semibold text-foreground">{activeStudioSection.title}</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {activeStudioSection.description}
            </p>
          </div>
          <div className="app-note max-w-xl p-4 text-sm text-muted-foreground">
            {activeStudioSection.note}
          </div>
        </div>

        {activeSection === 'theme-runtime' && (
          <div className="app-panel p-5">
            <ThemeSelection />
          </div>
        )}

        {activeSection === 'theme-workshop' && (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="app-panel p-5">
              <ThemeEditor showHeader={false} showSyncControls={false} />
            </div>

            {!selfContainedDesktop && (
              <div className="app-panel p-4">
                <SyncControls
                  dataType="themes"
                  label="Themes"
                  onGetLocalData={async () => {
                    const themes = await api.getThemes();
                    return { version: '1.0', exportedAt: new Date().toISOString(), themes };
                  }}
                  onApplyData={async (data) => {
                    if (data && typeof data === 'object' && 'themes' in data) {
                      queryClient.invalidateQueries({ queryKey: ['themes'] });
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}

        {activeSection === 'theme-browser' && (
          <div className="app-panel p-5">
            <ThemeBrowserPlaceholder showHeader={false} />
          </div>
        )}
      </section>
    </div>
  );
}
