/**
/**
 * Data Manager Component
 * Import/Export drafts and configuration
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Database,
  Download,
  FileJson,
  Settings,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  DraftStorage,
  exportRawDraftStorage,
  getDraftStorageDiagnostics,
  type DraftStorageDiagnostics,
} from '../../lib/storage/draft-db.js';
import { configManager } from '../../lib/config/manager.js';
import {
  exportPersistentStorageSnapshot,
  getPersistentStorageDiagnostics,
  type PersistentStorageDiagnostics,
} from '../../lib/persistence/storage.js';
import {
  clearLocalLoreData,
  exportLocalLoreData,
  exportLocalLoreStorageSnapshot,
  getDesktopLoreExportFileName,
  getLocalLoreStorageDiagnostics,
  importLocalLoreData,
  type DesktopLoreStorageDiagnostics,
} from '../../lib/storage/desktop-lore-db.js';
import { getAllFavoriteSeeds, parseFavoriteSeedsPayload, replaceFavoriteSeeds } from '../../lib/seed-generator.js';
import { exportWorkspaceBundleText, importWorkspaceBundleText } from '../../lib/device-link.js';
import { isDesktopRuntime } from '../../lib/runtime.js';
import { pickFile, saveBlobDownload } from '../../utils/download';
import { api } from '@/lib/api';

interface DataStats {
  drafts: number;
  seeds: number;
  apiKeys: number;
  configExists: boolean;
}

interface DesktopStorageInspectorState {
  draftStore: DraftStorageDiagnostics;
  deviceStore: PersistentStorageDiagnostics;
  loreStore: DesktopLoreStorageDiagnostics;
}

export default function DataManager() {
  const queryClient = useQueryClient();
  const desktopRuntime = isDesktopRuntime();
  const exportInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const loreImportInputRef = useRef<HTMLInputElement | null>(null);
  const apiKeysImportInputRef = useRef<HTMLInputElement | null>(null);
  const seedsImportInputRef = useRef<HTMLInputElement | null>(null);
  const workspaceBundleImportInputRef = useRef<HTMLInputElement | null>(null);

  const [stats, setStats] = useState<DataStats | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [desktopInspector, setDesktopInspector] = useState<DesktopStorageInspectorState | null>(null);
  const [importTemplateName, setImportTemplateName] = useState('');

  const { data: templates = [] } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
  });

  useEffect(() => {
    if (!importTemplateName && templates.length > 0) {
      setImportTemplateName(templates[0].name);
    }
  }, [importTemplateName, templates]);

  const selectedImportTemplate = templates.find((template) => template.name === importTemplateName);

  const loadStats = useCallback(async () => {
    try {
      const [drafts, config, inspector] = await Promise.all([
        DraftStorage.getAllDrafts(),
        Promise.resolve(configManager.getConfig()),
        desktopRuntime
          ? Promise.all([
              getDraftStorageDiagnostics(),
              getPersistentStorageDiagnostics(),
              getLocalLoreStorageDiagnostics(),
            ])
          : Promise.resolve(null),
      ]);

      const apiKeys = Object.keys(configManager.getApiKeys());

      setStats({
        drafts: drafts.length,
        seeds: getAllFavoriteSeeds().length,
        apiKeys: apiKeys.length,
        configExists: !!config,
      });

      if (inspector) {
        const [draftStore, deviceStore, loreStore] = inspector;
        setDesktopInspector({ draftStore, deviceStore, loreStore });
      } else {
        setDesktopInspector(null);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }, [desktopRuntime]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  async function handleExportDesktopStorage(kind: 'drafts' | 'device' | 'lore') {
    try {
      const snapshot =
        kind === 'drafts'
          ? await exportRawDraftStorage()
          : kind === 'device'
            ? await exportPersistentStorageSnapshot()
            : await exportLocalLoreStorageSnapshot();

      if (!snapshot) {
        throw new Error('Desktop storage export is only available in the desktop runtime.');
      }

      const blob = new Blob([snapshot.contents], { type: 'application/json' });
      await saveBlobDownload(blob, snapshot.fileName);
      setNotice({ type: 'success', message: `${snapshot.fileName} exported successfully` });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Desktop storage export failed' });
    }
  }

  async function handleExportLore() {
    try {
      const data = await exportLocalLoreData();
      const blob = new Blob([data], { type: 'application/json' });
      await saveBlobDownload(blob, getDesktopLoreExportFileName());
      setNotice({ type: 'success', message: 'Lore data exported successfully' });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Lore export failed' });
    }
  }

  async function handleExportDrafts() {
    try {
      const data = await DraftStorage.exportAll();
      const blob = new Blob([data], { type: 'application/json' });
      await saveBlobDownload(blob, `eidolon-simulacra-drafts-${new Date().toISOString().split('T')[0]}.json`);
      setNotice({ type: 'success', message: 'Drafts exported successfully' });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' });
    }
  }

  async function handleExportConfig() {
    try {
      const data = configManager.exportConfig();
      const blob = new Blob([data], { type: 'application/json' });
      await saveBlobDownload(blob, `eidolon-simulacra-config-${new Date().toISOString().split('T')[0]}.json`);
      setNotice({ type: 'success', message: 'Configuration exported successfully' });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' });
    }
  }

  async function handleExportApiKeys() {
    try {
      const data = configManager.exportApiKeys();
      const blob = new Blob([data], { type: 'application/json' });
      await saveBlobDownload(blob, `eidolon-simulacra-api-keys-${new Date().toISOString().split('T')[0]}.json`);
      setNotice({
        type: 'success',
        message: 'API keys exported successfully. Warning: API keys are sensitive - handle with care.',
      });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' });
    }
  }

  async function handleExportFavoriteSeeds() {
    try {
      const data = JSON.stringify(
        {
          version: '1.0',
          exportedAt: new Date().toISOString(),
          seeds: getAllFavoriteSeeds(),
        },
        null,
        2,
      );
      const blob = new Blob([data], { type: 'application/json' });
      await saveBlobDownload(blob, `eidolon-simulacra-favorite-seeds-${new Date().toISOString().split('T')[0]}.json`);
      setNotice({ type: 'success', message: 'Favorite seeds exported successfully' });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' });
    }
  }

  async function handleExportWorkspaceBundle() {
    try {
      const data = await exportWorkspaceBundleText();
      const blob = new Blob([data], { type: 'application/json' });
      await saveBlobDownload(blob, `eidolon-simulacra-workspace-bundle-${new Date().toISOString().split('T')[0]}.json`);
      setNotice({
        type: 'success',
        message: desktopRuntime
          ? 'Workspace bundle exported. Import it on mobile to mirror this desktop workspace.'
          : 'Workspace bundle exported. Import it on mobile or another PC/browser workspace to mirror this data.',
      });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Workspace bundle export failed' });
    }
  }

  async function handleImportDraftsFile(file: File) {
    try {
      const text = await file.text();
      const result = await DraftStorage.import(text, {
        sourceName: file.name,
        template: selectedImportTemplate,
      });
      await loadStats();

      const remapMessage = result.remapped > 0 ? ` (${result.remapped} review IDs remapped to avoid overwrite)` : '';
      setNotice({ type: 'success', message: `Imported ${result.imported} drafts from ${file.name}${remapMessage}` });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  async function handleImportDrafts() {
    const file = await pickFile(
      { accept: 'application/json,.json,text/markdown,.md,text/plain,.txt' },
      importInputRef.current,
    );
    if (!file) return;
    await handleImportDraftsFile(file);
  }

  async function handleImportConfigFile(file: File) {
    try {
      const text = await file.text();
      configManager.importConfig(text);
      await loadStats();
      setNotice({ type: 'success', message: `Configuration imported from ${file.name}` });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Import failed' });
    }
  }

  async function handleImportConfig() {
    const file = await pickFile({ accept: 'application/json,.json' }, exportInputRef.current);
    if (!file) return;
    await handleImportConfigFile(file);
  }

  async function handleImportLoreFile(file: File) {
    try {
      const text = await file.text();
      const result = await importLocalLoreData(text, { mode: 'merge' });
      await loadStats();
      setNotice({
        type: 'success',
        message: `Imported ${result.worlds} worlds, ${result.timelines} timelines, and ${result.events} events from ${file.name}`,
      });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Lore import failed' });
    }
  }

  async function handleImportLore() {
    const file = await pickFile({ accept: 'application/json,.json' }, loreImportInputRef.current);
    if (!file) return;
    await handleImportLoreFile(file);
  }

  async function handleImportApiKeysFile(file: File) {
    try {
      const text = await file.text();
      configManager.importApiKeys(text);
      await loadStats();
      setNotice({ type: 'success', message: `API keys imported from ${file.name}` });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'API key import failed' });
    }
  }

  async function handleImportApiKeys() {
    const file = await pickFile({ accept: 'application/json,.json' }, apiKeysImportInputRef.current);
    if (!file) return;
    await handleImportApiKeysFile(file);
  }

  async function handleImportFavoriteSeedsFile(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const favorites = parseFavoriteSeedsPayload(parsed);
      if (!favorites) {
        throw new Error('Invalid favorite seeds JSON');
      }

      replaceFavoriteSeeds(favorites);
      await loadStats();
      setNotice({ type: 'success', message: `Favorite seeds imported from ${file.name}` });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Favorite seeds import failed' });
    }
  }

  async function handleImportFavoriteSeeds() {
    const file = await pickFile({ accept: 'application/json,.json' }, seedsImportInputRef.current);
    if (!file) return;
    await handleImportFavoriteSeedsFile(file);
  }

  async function handleImportWorkspaceBundleFile(file: File) {
    try {
      const result = await importWorkspaceBundleText(await file.text());
      await Promise.all([
        loadStats(),
        queryClient.invalidateQueries({ queryKey: ['drafts'] }),
        queryClient.invalidateQueries({ queryKey: ['templates'] }),
        queryClient.invalidateQueries({ queryKey: ['blueprints'] }),
      ]);

      const importedSegments = [
        result.drafts > 0 ? `${result.drafts} drafts` : null,
        result.templates > 0 ? `${result.templates} templates` : null,
        result.blueprintOverrides > 0 ? `${result.blueprintOverrides} blueprint overrides` : null,
        result.configImported ? 'settings' : null,
        result.apiKeys > 0 ? `${result.apiKeys} API keys` : null,
      ].filter(Boolean);

      setNotice({
        type: 'success',
        message:
          importedSegments.length > 0
            ? `Imported ${importedSegments.join(', ')} from ${file.name}.`
            : `Workspace bundle from ${file.name} did not contain any importable records.`,
      });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Workspace bundle import failed' });
    }
  }

  async function handleImportWorkspaceBundle() {
    const file = await pickFile({ accept: 'application/json,.json' }, workspaceBundleImportInputRef.current);
    if (!file) return;
    await handleImportWorkspaceBundleFile(file);
  }

  async function handleClearAll() {
    setIsClearing(true);

    try {
      await Promise.all([
        DraftStorage.clearAll(),
        Promise.resolve(configManager.clearAll()),
        Promise.resolve(replaceFavoriteSeeds([])),
        desktopRuntime ? clearLocalLoreData() : Promise.resolve(),
      ]);

      await loadStats();
      setNotice({ type: 'success', message: 'All data cleared successfully' });
      setShowConfirmClear(false);
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Clear failed' });
    }

    setIsClearing(false);
  }

  return (
    <div className="app-page max-w-5xl space-y-6 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">Local storage ops</p>
            <h1 className="app-page-title">
              Back up, migrate, or purge the local workspace without touching blueprint source files.
            </h1>
            <p className="app-page-summary">
              {desktopRuntime
                ? 'This page manages desktop app data and local runtime state: exporting drafts, preserving provider configuration, importing local lore, and clearing the local workspace when you need a hard reset.'
                : 'This page is for operational data management: exporting drafts, preserving provider configuration, moving workspace bundles between devices, and clearing local state when you need a hard reset.'}
            </p>
          </div>

          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Stored state</p>
            <div className="mt-4 app-page-metrics">
              <div className="app-page-metric">
                <p className="app-page-metric-label">Drafts</p>
                <div className="app-page-metric-value text-2xl">{stats?.drafts ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Seeds</p>
                <div className="app-page-metric-value text-2xl">{stats?.seeds ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">API Keys</p>
                <div className="app-page-metric-value text-2xl">{stats?.apiKeys ?? 0}</div>
              </div>
              <div className="app-page-metric">
                <p className="app-page-metric-label">Config</p>
                <div className="app-page-metric-value text-2xl">{stats?.configExists ? 'Set' : 'Default'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <div
          className={`app-note flex items-start gap-3 px-4 py-3 ${
            notice.type === 'success'
              ? 'border-success/50 bg-success/10 text-success'
              : 'border-destructive/50 bg-destructive/10 text-destructive'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm">{notice.message}</span>
          <button onClick={() => setNotice(null)} className="ml-auto opacity-50 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Drafts</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.drafts}</p>
            <p className="mt-1 text-xs text-muted-foreground">Stored locally</p>
          </div>
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Seeds</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.seeds}</p>
            <p className="mt-1 text-xs text-muted-foreground">Favorite seeds saved</p>
          </div>
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">API Keys</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.apiKeys}</p>
            <p className="mt-1 text-xs text-muted-foreground">Configured providers</p>
          </div>
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Config</h3>
            </div>
            <p className="mt-2 text-2xl font-bold">{stats.configExists ? 'Set' : 'Default'}</p>
            <p className="mt-1 text-xs text-muted-foreground">Customization status</p>
          </div>
        </div>
      )}

      {desktopRuntime && desktopInspector && (
        <div className="app-panel">
          <div className="border-b border-border p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Database className="h-5 w-5" />
              Desktop Storage Inspector
            </h2>
            <p className="text-sm text-muted-foreground">
              Inspect the local desktop stores and export raw snapshots when you need migration evidence or low-level
              backups.
            </p>
          </div>
          <div className="grid gap-4 p-4 xl:grid-cols-3">
            <div className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">Draft Store</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{desktopInspector.draftStore.locationLabel}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">SQLite</span>
              </div>
              <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Drafts</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.draftStore.draftCount}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Asset rows</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.draftStore.assetActivityCount}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Migration</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {desktopInspector.draftStore.migrationChecked ? 'Checked' : 'Pending'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleExportDesktopStorage('drafts')}
                className="app-button app-button-secondary mt-4"
              >
                <Download className="h-4 w-4" />
                Export Raw Draft Store
              </button>
            </div>

            <div className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">Device Key-Value Store</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{desktopInspector.deviceStore.locationLabel}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">AppData</span>
              </div>
              <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Entries</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.deviceStore.entryCount}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Initialized</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {desktopInspector.deviceStore.initialized ? 'Ready' : 'No'}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">File</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {desktopInspector.deviceStore.hasPersistedFile ? 'Present' : 'Not written yet'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleExportDesktopStorage('device')}
                className="app-button app-button-secondary mt-4"
              >
                <Download className="h-4 w-4" />
                Export Raw Device Store
              </button>
            </div>

            <div className="rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium">Lore Store</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{desktopInspector.loreStore.locationLabel}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">SQLite</span>
              </div>
              <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Worlds</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.loreStore.worldCount}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Timelines</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.loreStore.timelineCount}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Events</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.loreStore.eventCount}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Characters</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.loreStore.characterCount}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Factions</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.loreStore.factionCount}
                  </div>
                </div>
                <div className="rounded-md border border-border bg-background/60 p-3">
                  <div className="text-muted-foreground">Locations</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {desktopInspector.loreStore.locationCount}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleExportDesktopStorage('lore')}
                className="app-button app-button-secondary mt-4"
              >
                <Download className="h-4 w-4" />
                Export Raw Lore Store
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Workspace Bundle Files
          </h2>
          <p className="text-sm text-muted-foreground">
            Move your workspace between mobile and this{' '}
            {desktopRuntime ? 'desktop app' : 'browser or desktop workspace'} with one signed-off JSON bundle.
            {desktopRuntime
              ? ' If both devices are on the same LAN, Live PC Link in Device Link is usually faster.'
              : ''}
          </p>
        </div>
        <div className="space-y-3 p-4">
          <div className="rounded-md border border-border p-4">
            <h3 className="font-medium">What moves in the bundle</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Drafts, templates, blueprint overrides, settings, and optionally stored API keys. Use bundle files when
              you want a signed-off snapshot, when devices are not on the same LAN, or when Live PC Link is unavailable.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Export Workspace Bundle</h3>
                <p className="text-xs text-muted-foreground">
                  Create one JSON bundle for mobile import or another local workspace.
                </p>
              </div>
            </div>
            <button onClick={handleExportWorkspaceBundle} className="app-button app-button-primary">
              <Download className="h-4 w-4" />
              Export Bundle
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Import Workspace Bundle</h3>
                <p className="text-xs text-muted-foreground">
                  Merge a bundle exported from mobile or another PC workspace.
                </p>
              </div>
            </div>
            <button onClick={() => void handleImportWorkspaceBundle()} className="app-button app-button-primary">
              <Upload className="h-4 w-4" />
              Import Bundle
            </button>
            <input
              ref={workspaceBundleImportInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label="Import workspace bundle file"
            />
          </div>
        </div>
      </div>

      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">Export Data</h2>
          <p className="text-sm text-muted-foreground">
            Download your data as JSON files for backup or transfer to another device.
          </p>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Export All Drafts</h3>
                <p className="text-xs text-muted-foreground">Download all your generated characters</p>
              </div>
            </div>
            <button onClick={handleExportDrafts} className="app-button app-button-primary">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Export Configuration</h3>
                <p className="text-xs text-muted-foreground">Download your theme and generation settings</p>
              </div>
            </div>
            <button onClick={handleExportConfig} className="app-button app-button-primary">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Cloud className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Export Favorite Seeds</h3>
                <p className="text-xs text-muted-foreground">Download your saved and archived seed records</p>
              </div>
            </div>
            <button onClick={handleExportFavoriteSeeds} className="app-button app-button-primary">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <FileJson className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Export API Keys</h3>
                <p className="text-xs text-muted-foreground">Warning: Contains sensitive information</p>
              </div>
            </div>
            <button onClick={handleExportApiKeys} className="app-button app-button-secondary">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          {desktopRuntime && (
            <div className="flex items-center justify-between rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Export Lore Data</h3>
                  <p className="text-xs text-muted-foreground">
                    Download local worlds, factions, locations, timelines, and events
                  </p>
                </div>
              </div>
              <button onClick={handleExportLore} className="app-button app-button-primary">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">Import Data</h2>
          <p className="text-sm text-muted-foreground">Restore your data from a previously exported backup file.</p>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Import Drafts</h3>
                <p className="text-xs text-muted-foreground">
                  Merge drafts from JSON backup or combined markdown export
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {templates.length > 0 && (
                <select
                  value={importTemplateName}
                  onChange={(event) => setImportTemplateName(event.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  aria-label="Import drafts template"
                >
                  {templates.map((template) => (
                    <option key={template.name} value={template.name}>
                      Import as {template.name}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={() => void handleImportDrafts()} className="app-button app-button-primary">
                <Upload className="h-4 w-4" />
                Import
              </button>
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json,text/markdown,.md,text/plain,.txt"
              className="hidden"
              aria-label="Import drafts file"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Import Favorite Seeds</h3>
                <p className="text-xs text-muted-foreground">
                  Restore saved and archived seed records from a JSON backup
                </p>
              </div>
            </div>
            <button onClick={() => void handleImportFavoriteSeeds()} className="app-button app-button-primary">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <input
              ref={seedsImportInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label="Import favorite seeds file"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Import Configuration</h3>
                <p className="text-xs text-muted-foreground">Restore theme and generation settings</p>
              </div>
            </div>
            <button onClick={() => void handleImportConfig()} className="app-button app-button-primary">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <input
              ref={exportInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              aria-label="Import configuration file"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Import API Keys</h3>
                <p className="text-xs text-muted-foreground">Restore provider keys from a JSON backup</p>
              </div>
            </div>
            <button onClick={() => void handleImportApiKeys()} className="app-button app-button-secondary">
              <Upload className="h-4 w-4" />
              Import
            </button>
            <input
              ref={apiKeysImportInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              aria-label="Import API keys file"
            />
          </div>

          {desktopRuntime && (
            <div className="flex items-center justify-between rounded-md border border-border p-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Import Lore Data</h3>
                  <p className="text-xs text-muted-foreground">
                    Restore local worlds, factions, locations, timelines, and events from a JSON backup
                  </p>
                </div>
              </div>
              <button onClick={() => void handleImportLore()} className="app-button app-button-primary">
                <Upload className="h-4 w-4" />
                Import
              </button>
              <input
                ref={loreImportInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                aria-label="Import lore data file"
              />
            </div>
          )}
        </div>
      </div>

      <div className="app-panel border-destructive/50 bg-destructive/5">
        <div className="border-b border-destructive/50 p-4">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">
            Permanently delete all stored data. This action cannot be undone.
          </p>
        </div>
        <div className="p-4">
          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              disabled={isClearing}
              className="app-button border border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-destructive">Are you sure? This will permanently delete:</p>
              <ul className="ml-4 list-disc space-y-1 text-sm text-destructive">
                <li>All {stats?.drafts || 0} drafts</li>
                <li>All {stats?.apiKeys || 0} API keys</li>
                <li>All configuration settings</li>
                {desktopRuntime && <li>All local worlds, factions, locations, and timelines</li>}
              </ul>
              <div className="flex gap-3">
                <button onClick={handleClearAll} disabled={isClearing} className="app-button app-button-destructive">
                  {isClearing ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Yes, Clear Everything
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  disabled={isClearing}
                  className="app-button app-button-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
