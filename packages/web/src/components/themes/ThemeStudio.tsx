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
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Palette className="h-7 w-7 text-primary" />
          Theme Studio
        </h1>
        <p className="mt-2 text-muted-foreground">
          Select, customize, and manage themes for the application and review surfaces.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Changes apply automatically. If other pages don't update, press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">F5</kbd> to refresh.
        </p>
      </div>

      {/* Theme Sync */}
      <div className="rounded-lg border border-border bg-card p-4">
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

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'selection' && <ThemeSelection />}
        {activeTab === 'editor' && <ThemeEditor />}
        {activeTab === 'browser' && <ThemeBrowserPlaceholder />}
      </div>
    </div>
  );
}
