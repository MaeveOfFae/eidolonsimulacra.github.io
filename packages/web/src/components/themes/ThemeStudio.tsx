import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Globe, Palette, Pencil } from 'lucide-react';
import { api } from '@/lib/api';
import { EDITABLE_THEME_SECTIONS } from '../../theme/theme';
import ThemeSelection from './ThemeSelection';
import ThemeEditor from './ThemeEditor';
import ThemeBrowserPlaceholder from './ThemeBrowserPlaceholder';
import SyncControls from '../common/SyncControls';

interface StudioSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  note: string;
}

const sections: StudioSection[] = [
  {
    id: 'theme-runtime',
    label: 'Runtime Editor',
    icon: Palette,
    description: 'Choose the active preset, preview it live, and edit app or tokenizer colors in one place.',
    note: 'This is where the missing live editors belong.',
  },
  {
    id: 'theme-workshop',
    label: 'Preset Workshop',
    icon: Pencil,
    description: 'Create reusable presets, import them, duplicate them, and keep the library organized.',
    note: 'Built-in presets stay read-only; custom presets stay editable.',
  },
  {
    id: 'theme-browser',
    label: 'Community Browser',
    icon: Globe,
    description: 'Track the public sharing surface without burying the local tools behind another tab.',
    note: 'This remains secondary until the browser is fully implemented.',
  },
];

export default function ThemeStudio() {
  const queryClient = useQueryClient();
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

  return (
    <div className="app-page space-y-6 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Theme runtime</p>
            <h1 className="app-page-title flex items-center gap-3">
              <Palette className="h-7 w-7 text-primary" />
              Theme Studio
            </h1>
            <p className="app-page-summary">
              Select, customize, and manage browser themes for the app shell and review surfaces. The studio is organized around the three actual jobs on this page: tune the live runtime theme, manage reusable presets, and track the community browser.
            </p>
            <p className="text-xs text-muted-foreground">
              Changes apply automatically. If another page does not repaint cleanly, press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">F5</kbd> to refresh.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="app-pill app-pill-emerald">Live preview enabled</span>
              <span className="app-pill app-pill-muted">Editors surfaced in-page</span>
              <span className="app-pill app-pill-muted">Preset tools grouped together</span>
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

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr]">
        <section className="app-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <p className="app-page-eyebrow">Studio map</p>
              <h2 className="text-2xl font-semibold text-foreground">Everything is visible by job, not hidden by tab.</h2>
              <p className="max-w-3xl text-sm text-muted-foreground">
                Runtime editing stays with the live preview. Preset management stays together in the workshop. The browser roadmap stays separate so it does not hide the tools you actually use.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group rounded-2xl border border-border bg-background/60 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <span>{section.label}</span>
                      </div>
                      <div className="text-base font-semibold text-foreground">{section.description}</div>
                      <p className="text-sm text-muted-foreground">{section.note}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-background/80 p-2 text-primary transition-colors group-hover:border-primary/40 group-hover:bg-primary/10">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Jump to section
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="app-panel p-4">
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
        </section>
      </div>

      <section id="theme-runtime" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="app-page-eyebrow">Runtime editor</p>
            <h2 className="text-2xl font-semibold text-foreground">Choose the live preset and edit its active palette.</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              This section keeps the preset picker, live preview, import and export actions, and the full app plus tokenizer override editor together.
            </p>
          </div>
          <div className="app-note max-w-xl p-4 text-sm text-muted-foreground">
            Save here when you want browser runtime changes to persist. Use the workshop below when you want to turn the current palette into a reusable preset.
          </div>
        </div>

        <div className="app-panel p-5">
          <ThemeSelection />
        </div>
      </section>

      <section id="theme-workshop" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="app-page-eyebrow">Preset workshop</p>
            <h2 className="text-2xl font-semibold text-foreground">Create, import, rename, and organize reusable presets.</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              The preset workshop is now its own section instead of a separate tab, so it sits directly under the live editor and keeps library operations in one place.
            </p>
          </div>
          <div className="app-note max-w-xl p-4 text-sm text-muted-foreground">
            Built-in presets remain read-only. Custom presets can be updated from the current active palette, duplicated for variants, or deleted when they are no longer useful.
          </div>
        </div>

        <div className="app-panel p-5">
          <ThemeEditor showHeader={false} showSyncControls={false} />
        </div>
      </section>

      <section id="theme-browser" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="app-page-eyebrow">Community browser</p>
            <h2 className="text-2xl font-semibold text-foreground">Keep the public browser visible without giving it primary weight.</h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              The browser remains a roadmap surface for discovery and sharing, but it no longer blocks access to the editors the theme page needs today.
            </p>
          </div>
        </div>

        <div className="app-panel p-5">
          <ThemeBrowserPlaceholder showHeader={false} />
        </div>
      </section>
    </div>
  );
}
