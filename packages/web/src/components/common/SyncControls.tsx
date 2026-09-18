/**
 * Sync Controls Component
 * Reusable UI for syncing data with the server
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { readPersistedString, writePersistedString } from '../../lib/persistence/storage.js';
import { isSelfContainedDesktopRuntime } from '../../lib/runtime.js';
import { serverClient, type SyncStatus } from '../../lib/server/index.js';

interface SyncControlsProps {
  /** Type of data to sync */
  dataType: 'drafts' | 'themes' | 'templates' | 'seeds' | 'config';
  /** Callback to get local data for push */
  onGetLocalData?: () => Promise<unknown> | unknown;
  /** Callback to apply pulled data */
  onApplyData?: (data: unknown) => Promise<void> | void;
  /** Optional label override */
  label?: string;
  /** Show compact version */
  compact?: boolean;
}

export default function SyncControls({
  dataType,
  onGetLocalData,
  onApplyData,
  label,
  compact = false,
}: SyncControlsProps) {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadStatus = useCallback(async () => {
    const result = await serverClient.checkStatus();
    setStatus(result);
  }, []);

  useEffect(() => {
    void loadStatus();
    const stored = readPersistedString(`sync-${dataType}-last`)?.value;
    if (stored) {
      setLastSync(stored);
    }
  }, [loadStatus, dataType]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  if (selfContainedDesktop) {
    return compact ? null : (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudOff className="h-4 w-4" />
        <span>Desktop build is self-contained. Remote sync is unavailable.</span>
      </div>
    );
  }

  const handlePush = async () => {
    if (!status?.authenticated || !onGetLocalData) return;

    clearMessages();
    setIsSyncing(true);
    try {
      const localData = await onGetLocalData();

      if (dataType === 'config') {
        // Config uses different endpoints
        const configData = localData as { config?: Record<string, unknown>; apiKeys?: Record<string, string> };
        if (configData.config) {
          await serverClient.pushConfig(configData.config);
        }
        if (configData.apiKeys) {
          await serverClient.pushApiKeys(configData.apiKeys);
        }
      } else {
        await serverClient.sync(dataType, 'push', localData);
      }

      const now = new Date().toISOString();
      setLastSync(now);
      writePersistedString(`sync-${dataType}-last`, [], now);
      setSuccess(`${label || dataType} pushed to server`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Push failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePull = async () => {
    if (!status?.authenticated || !onApplyData) return;

    clearMessages();
    setIsSyncing(true);
    try {
      let data: unknown;

      if (dataType === 'config') {
        // Config uses different endpoints - pull both config and API keys
        const [configResult, apiKeysResult] = await Promise.all([
          serverClient.pullConfig(),
          serverClient.pullApiKeys(),
        ]);
        data = {
          config: configResult.config,
          apiKeys: apiKeysResult.apiKeys,
        };
      } else {
        data = await serverClient.sync(dataType, 'pull');
      }

      await onApplyData(data);
      const now = new Date().toISOString();
      setLastSync(now);
      writePersistedString(`sync-${dataType}-last`, [], now);
      setSuccess(`${label || dataType} pulled from server`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pull failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = async () => {
    if (!status?.authenticated) return;

    clearMessages();
    setIsSyncing(true);
    try {
      // Push local data first
      if (onGetLocalData) {
        const localData = await onGetLocalData();

        if (dataType === 'config') {
          const configData = localData as { config?: Record<string, unknown>; apiKeys?: Record<string, string> };
          if (configData.config) {
            await serverClient.pushConfig(configData.config);
          }
          if (configData.apiKeys) {
            await serverClient.pushApiKeys(configData.apiKeys);
          }
        } else {
          await serverClient.sync(dataType, 'push', localData);
        }
      }

      // Then pull remote data
      if (onApplyData) {
        let data: unknown;

        if (dataType === 'config') {
          const [configResult, apiKeysResult] = await Promise.all([
            serverClient.pullConfig(),
            serverClient.pullApiKeys(),
          ]);
          data = {
            config: configResult.config,
            apiKeys: apiKeysResult.apiKeys,
          };
        } else {
          data = await serverClient.sync(dataType, 'pull');
        }

        await onApplyData(data);
      }

      const now = new Date().toISOString();
      setLastSync(now);
      writePersistedString(`sync-${dataType}-last`, [], now);
      setSuccess(`${label || dataType} synced`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!serverClient.isEnabled()) {
    return compact ? null : (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudOff className="h-4 w-4" />
        <span>Server sync disabled</span>
      </div>
    );
  }

  if (!status?.connected) {
    return compact ? null : (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudOff className="h-4 w-4" />
        <span>Server unavailable</span>
      </div>
    );
  }

  if (!status?.authenticated) {
    return compact ? null : (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CloudOff className="h-4 w-4" />
        <span>Login required for sync</span>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center gap-1 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-50"
        title={`Sync ${label || dataType} with server`}
      >
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Cloud className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cloud className="h-5 w-5 text-primary" />
          <span className="font-medium">Server Sync</span>
          {lastSync && (
            <span className="text-xs text-muted-foreground">
              Last: {new Date(lastSync).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onGetLocalData && (
            <button
              onClick={handlePush}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              title="Push to server"
            >
              <Upload className="h-3.5 w-3.5" />
              Push
            </button>
          )}
          {onApplyData && (
            <button
              onClick={handlePull}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
              title="Pull from server"
            >
              <Download className="h-3.5 w-3.5" />
              Pull
            </button>
          )}
          {onGetLocalData && onApplyData && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              title="Sync both directions"
            >
              {isSyncing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Sync
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4" />
          {error}
          <button onClick={clearMessages} className="ml-auto opacity-50 hover:opacity-100">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          {success}
          <button onClick={clearMessages} className="ml-auto opacity-50 hover:opacity-100">
            ×
          </button>
        </div>
      )}
    </div>
  );
}
