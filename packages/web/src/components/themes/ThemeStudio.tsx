import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Palette, Pencil, Globe } from 'lucide-react';
import { cn } from '@/utils/cn';
import { api } from '@/lib/api';
import ThemeSelection from './ThemeSelection';
import ThemeEditor from './ThemeEditor';
import ThemeBrowserPlaceholder from './ThemeBrowserPlaceholder';
import SyncControls from '../common/SyncControls';

type TabId = 'selection' | 'editor' | 'browser';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const tabs: Tab[] = [
  {
    id: 'selection',
    label: 'Theme Selection',
    icon: Palette,
    description: 'Choose and preview themes, customize colors',
  },
  {
    id: 'editor',
    label: 'Theme Editor',
    icon: Pencil,
    description: 'Create, edit, and manage custom theme presets',
  },
  {
    id: 'browser',
    label: 'Theme Browser',
    icon: Globe,
    description: 'Browse and share public themes',
  },
];

export default function ThemeStudio() {
  const [activeTab, setActiveTab] = useState<TabId>('selection');
  const queryClient = useQueryClient();

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
              Select, customize, and manage browser themes for the app shell and review surfaces. Changes apply live to the runtime theme system used by the current browser app.
            </p>
            <p className="text-xs text-muted-foreground">
              Changes apply automatically. If another page does not repaint cleanly, press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">F5</kbd> to refresh.
            </p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Studio state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Section</p>
                <div className="app-page-metric-value text-2xl">{activeTab === 'selection' ? 'Select' : activeTab === 'editor' ? 'Edit' : 'Browse'}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Sync</p>
                <div className="app-page-metric-value text-2xl">Ready</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Runtime</p>
                <div className="app-page-metric-value text-2xl">Live</div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <div className="app-tab-group">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'app-tab-button',
                  isActive
                    ? 'is-active'
                    : ''
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="app-panel p-5">
        {activeTab === 'selection' && <ThemeSelection />}
        {activeTab === 'editor' && <ThemeEditor />}
        {activeTab === 'browser' && <ThemeBrowserPlaceholder />}
      </div>
    </div>
  );
}
