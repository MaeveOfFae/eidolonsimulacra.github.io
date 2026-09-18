/**
 * Server Settings Component
 * Configure and manage connection to the sync server
 */

import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Loader2,
  LogIn,
  LogOut,
  UserPlus,
  RefreshCw,
  Link as LinkIcon,
  ExternalLink,
} from 'lucide-react';
import { isSelfContainedDesktopRuntime } from '../../lib/runtime.js';
import { serverClient, type SyncStatus } from '../../lib/server/index.js';

export default function ServerSettings() {
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Server config state
  const config = serverClient.getConfig();
  const [serverUrl, setServerUrl] = useState(config.url);
  const [syncEnabled, setSyncEnabled] = useState(config.enabled);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await serverClient.checkStatus();
      setStatus(result);
    } catch (e) {
      setStatus({ connected: false, authenticated: false, error: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleSaveConfig = async () => {
    clearMessages();
    serverClient.setConfig({ url: serverUrl, enabled: syncEnabled });
    setSuccess('Server configuration saved');
    await loadStatus();
  };

  const handleTestConnection = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      const result = await serverClient.testConnection(serverUrl);
      if (result.success) {
        setSuccess(result.message);
        // Auto-enable and save on successful connection
        serverClient.setConfig({ url: serverUrl, enabled: true });
        setSyncEnabled(true);
        await loadStatus();
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    clearMessages();
    setIsLoading(true);
    try {
      await serverClient.logout();
      setSuccess('Logged out successfully');
      void loadStatus();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (selfContainedDesktop) {
    return (
      <div className="app-note border-border/60 bg-background/40 p-4 text-sm text-muted-foreground">
        This desktop build is self-contained. Server sync, remote auth, and cross-device server storage are disabled.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Server className="h-6 w-6" />
          Server Sync
        </h2>
        <p className="text-muted-foreground">
          Connect to a self-hosted server to sync your data across devices.
        </p>
      </div>

      {/* Status Card */}
      <div className="app-panel p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Connection Status</h3>
          <button
            onClick={loadStatus}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
          <span className={`rounded-full px-2.5 py-1 ${status?.connected ? 'bg-green-500/12 text-green-700 dark:text-green-400' : 'bg-destructive/12 text-destructive'}`}>
            {status?.connected ? 'Server connected' : 'Server offline'}
          </span>
          <span className={`rounded-full px-2.5 py-1 ${status?.authenticated ? 'bg-green-500/12 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
            {status?.authenticated ? 'Authenticated' : 'Guest session'}
          </span>
        </div>
        {status?.user && (
          <div className="mt-3 text-sm text-muted-foreground">
            Logged in as <span className="font-medium text-foreground">{status.user.displayName}</span> ({status.user.email})
          </div>
        )}
        {status?.error && (
          <div className="mt-3 text-sm text-red-500">
            Error: {status.error}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="app-note border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {error}
          <button onClick={clearMessages} className="ml-2 opacity-50 hover:opacity-100">×</button>
        </div>
      )}
      {success && (
        <div className="app-note border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
          {success}
          <button onClick={clearMessages} className="ml-2 opacity-50 hover:opacity-100">×</button>
        </div>
      )}

      {/* Server Configuration */}
      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Server Configuration</h3>
        </div>
        <div className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sync-enabled"
              checked={syncEnabled}
              onChange={(e) => setSyncEnabled(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="sync-enabled" className="text-sm">
              Enable server sync
            </label>
          </div>

          <div>
            <label className="text-sm font-medium">Server URL</label>
            <div className="mt-1 flex gap-2">
              <input
                type="url"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://api.eidolonsimulacra.com"
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                onClick={handleTestConnection}
                disabled={isLoading || !serverUrl}
                className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LinkIcon className="h-4 w-4" />
                )}
                Connect
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Enter your server URL and click Connect to test and enable sync
            </p>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Authentication */}
      <div className="app-panel">
        <div className="border-b border-border p-4">
          <h3 className="font-semibold">Authentication</h3>
        </div>
        <div className="p-4">
          {status?.authenticated ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You are logged in. Your data will be synced to the server.
              </p>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {status?.connected ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Server is connected. Sign in or create an account to sync your data.
                  </p>
                  <div className="flex gap-3">
                    <Link
                      to="/auth?mode=login"
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Link>
                    <Link
                      to="/auth?mode=register"
                      className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Account
                    </Link>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Connect to a server first to sign in or create an account.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="app-panel-muted p-4">
        <h3 className="font-medium text-sm mb-2">Quick Links</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link to="/auth" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />
            Full Sign In Page
          </Link>
          <Link to="/data" className="inline-flex items-center gap-1 text-primary hover:underline">
            <ExternalLink className="h-3 w-3" />
            Data Manager
          </Link>
        </div>
      </div>
    </div>
  );
}
