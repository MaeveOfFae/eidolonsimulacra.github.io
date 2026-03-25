/**
 * Data Manager Component
 * Import/Export drafts and configuration
 */

import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Upload,
  Database,
  Settings,
  Trash2,
  FileJson,
  AlertTriangle,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import { DraftStorage } from '../../lib/storage/draft-db.js';
import { configManager } from '../../lib/config/manager.js';
import { getFavoriteSeeds, parseFavoriteSeedsPayload, replaceFavoriteSeeds, replaceFavoriteSeedsFromServer } from '../../lib/seed-generator.js';
import { queueAutoSync } from '../../lib/server/auto-sync.js';
import { saveBlobDownload } from '../../utils/download';
import SyncControls from './SyncControls';

interface DataStats {
  drafts: number;
  seeds: number;
  apiKeys: number;
  configExists: boolean;
}

export default function DataManager() {
  const exportInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [stats, setStats] = useState<DataStats | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    void loadStats();
  }, []);

  async function loadStats() {
    try {
      const [drafts, config] = await Promise.all([
        DraftStorage.getAllDrafts(),
        Promise.resolve(configManager.getConfig()),
      ]);

      const apiKeys = Object.keys(configManager.getApiKeys());

      setStats({
        drafts: drafts.length,
        seeds: getFavoriteSeeds().length,
        apiKeys: apiKeys.length,
        configExists: !!config,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
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

      setNotice({ type: 'success', message: 'API keys exported successfully. Warning: API keys are sensitive - handle with care.' });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Export failed' });
    }
  }

  async function handleImportDrafts(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const result = await DraftStorage.import(text);
      queueAutoSync('drafts');
      await loadStats();

      const remapMessage = result.remapped > 0
        ? ` (${result.remapped} review IDs remapped to avoid overwrite)`
        : '';
      setNotice({ type: 'success', message: `Imported ${result.imported} drafts from ${file.name}${remapMessage}` });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Import failed' });
    }

    event.target.value = '';
  }

  async function handleImportConfig(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      configManager.importConfig(text);
      queueAutoSync('config');
      await loadStats();

      setNotice({ type: 'success', message: `Configuration imported from ${file.name}` });
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Import failed' });
    }

    event.target.value = '';
  }

  async function handleClearAll() {
    setIsClearing(true);

    try {
      await Promise.all([
        DraftStorage.clearAll(),
        Promise.resolve(configManager.clearAll()),
        Promise.resolve(replaceFavoriteSeeds([])),
      ]);

      queueAutoSync(['drafts', 'seeds', 'config'], { immediate: true });

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
            <h1 className="app-page-title">Back up, migrate, or purge the browser-side workspace without touching blueprint source files.</h1>
            <p className="app-page-summary">
              This page is for operational data management: exporting drafts, preserving provider configuration, syncing with an optional server, and clearing local state when you need a hard reset.
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
        <div className={`app-note flex items-start gap-3 px-4 py-3 ${
          notice.type === 'success' ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400' : 'border-destructive/50 bg-destructive/10 text-destructive'
        }`}>
          {notice.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span className="text-sm">{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            className="ml-auto opacity-50 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Drafts</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.drafts}</p>
            <p className="text-xs text-muted-foreground mt-1">Stored locally</p>
          </div>
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Seeds</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.seeds}</p>
            <p className="text-xs text-muted-foreground mt-1">Favorite seeds saved</p>
          </div>
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">API Keys</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.apiKeys}</p>
            <p className="text-xs text-muted-foreground mt-1">Configured providers</p>
          </div>
          <div className="app-panel p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Config</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{stats.configExists ? 'Set' : 'Default'}</p>
            <p className="text-xs text-muted-foreground mt-1">Customization status</p>
          </div>
        </div>
      )}

      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Server Sync
          </h2>
          <p className="text-sm text-muted-foreground">
            Sync your data with a self-hosted server for backup and cross-device access.
          </p>
        </div>
        <div className="p-4 space-y-6">
          {/* Drafts Sync */}
          <div>
            <h3 className="font-medium mb-2">Drafts</h3>
            <SyncControls
              dataType="drafts"
              label="Drafts"
              onGetLocalData={async () => JSON.parse(await DraftStorage.exportAll())}
              onApplyData={async (data) => {
                if (data && typeof data === 'object' && 'drafts' in data) {
                  await DraftStorage.import(JSON.stringify(data), { conflictStrategy: 'merge' });
                  await loadStats();
                }
              }}
            />
          </div>

          <div>
            <h3 className="font-medium mb-2">Favorite Seeds</h3>
            <SyncControls
              dataType="seeds"
              label="Favorite seeds"
              onGetLocalData={() => ({ seeds: getFavoriteSeeds() })}
              onApplyData={async (data) => {
                const favorites = parseFavoriteSeedsPayload(data);
                if (favorites) {
                  replaceFavoriteSeedsFromServer(favorites);
                  await loadStats();
                }
              }}
            />
          </div>

          {/* Config & API Keys Sync */}
          <div>
            <h3 className="font-medium mb-2">Settings & API Keys</h3>
            <SyncControls
              dataType="config"
              label="Settings"
              onGetLocalData={async () => {
                const config = JSON.parse(configManager.exportConfig());
                const apiKeys = configManager.getApiKeys();
                return { config, apiKeys };
              }}
              onApplyData={async (data) => {
                if (data && typeof data === 'object') {
                  const d = data as { config?: Record<string, unknown>; apiKeys?: Record<string, string> };
                  if (d.config) {
                    configManager.importConfig(JSON.stringify(d.config));
                  }
                  if (d.apiKeys) {
                    // Import API keys
                    for (const [provider, key] of Object.entries(d.apiKeys)) {
                      if (key) {
                        configManager.setApiKey(provider, key);
                      }
                    }
                  }
                  await loadStats();
                }
              }}
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
                <p className="text-xs text-muted-foreground">
                  Download all your generated characters
                </p>
              </div>
            </div>
            <button
              onClick={handleExportDrafts}
              className="app-button app-button-primary"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Export Configuration</h3>
                <p className="text-xs text-muted-foreground">
                  Download your theme and generation settings
                </p>
              </div>
            </div>
            <button
              onClick={handleExportConfig}
              className="app-button app-button-primary"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <FileJson className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Export API Keys</h3>
                <p className="text-xs text-muted-foreground">
                  Warning: Contains sensitive information
                </p>
              </div>
            </div>
            <button
              onClick={handleExportApiKeys}
              className="app-button app-button-secondary"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold">Import Data</h2>
          <p className="text-sm text-muted-foreground">
            Restore your data from a previously exported backup file.
          </p>
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
            <button
              onClick={() => importInputRef.current?.click()}
              className="app-button app-button-primary"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json,text/markdown,.md,text/plain,.txt"
              onChange={handleImportDrafts}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between rounded-md border border-border p-4">
            <div className="flex items-center gap-3">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Import Configuration</h3>
                <p className="text-xs text-muted-foreground">
                  Restore theme and generation settings
                </p>
              </div>
            </div>
            <button
              onClick={() => exportInputRef.current?.click()}
              className="app-button app-button-primary"
            >
              <Upload className="h-4 w-4" />
              Import
            </button>
            <input
              ref={exportInputRef}
              type="file"
              accept="application/json"
              onChange={handleImportConfig}
              className="hidden"
            />
          </div>
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
              <p className="text-sm text-destructive">
                Are you sure? This will permanently delete:
              </p>
              <ul className="space-y-1 text-sm text-destructive ml-4 list-disc">
                <li>All {stats?.drafts || 0} drafts</li>
                <li>All {stats?.apiKeys || 0} API keys</li>
                <li>All configuration settings</li>
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="app-button app-button-destructive"
                >
                  {isClearing ? (
                    <>
                      <span className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
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
