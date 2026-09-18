/**
 * Authentication Page
 * Full page for login and registration with server connection
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';
import { serverClient, type SyncStatus } from '../../lib/server/index.js';
import { isDesktopRuntime, isSelfContainedDesktopRuntime } from '../../lib/runtime.js';

type AuthMode = 'login' | 'register';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export default function AuthPage() {
  const desktopRuntime = isDesktopRuntime();
  const selfContainedDesktop = isSelfContainedDesktopRuntime();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingServer, setIsCheckingServer] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<SyncStatus | null>(null);

  // Server URL state
  const [serverUrl, setServerUrl] = useState(() => serverClient.getConfig().url);
  const [showServerConfig, setShowServerConfig] = useState(false);

  // Check for mode param and server status on mount
  useEffect(() => {
    const paramMode = searchParams.get('mode');
    if (paramMode === 'register' || paramMode === 'login') {
      setMode(paramMode);
    }
    checkServerStatus();
  }, [searchParams]);

  const checkServerStatus = useCallback(async () => {
    setIsCheckingServer(true);
    try {
      const status = await serverClient.checkStatus();
      setServerStatus(status);
      if (status.authenticated && status.user) {
        // Already logged in, redirect to settings
        navigate('/settings', { replace: true });
      }
    } catch (e) {
      setServerStatus({ connected: false, authenticated: false, error: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setIsCheckingServer(false);
    }
  }, [navigate]);

  const handleTestConnection = async () => {
    setIsCheckingServer(true);
    setError(null);
    try {
      const result = await serverClient.testConnection(serverUrl);
      if (result.success) {
        serverClient.setConfig({ url: serverUrl, enabled: true });
        await checkServerStatus();
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connection test failed');
    } finally {
      setIsCheckingServer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await serverClient.login(formData.email, formData.password);
      } else {
        await serverClient.register(formData.email, formData.password, formData.displayName || undefined);
      }
      // Redirect to settings or the page they came from
      const from = searchParams.get('from') || '/settings';
      navigate(from, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };

  const serverConnected = Boolean(serverStatus?.connected);
  const isAuthenticated = Boolean(serverStatus?.authenticated);
  const modeTitle = mode === 'login' ? 'Sign in' : 'Create account';
  const modeSummary = mode === 'login'
    ? 'Enter the server-backed account you use for sync.'
    : 'Create a server-backed account for cross-device sync.';

  return (
    <div className="app-page mx-auto max-w-4xl space-y-5 pb-10">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-3">
            <p className="app-page-eyebrow">Auth and sync</p>
            <h1 className="app-page-title">
              {mode === 'login' ? 'Reconnect to your sync server.' : 'Create an account for cross-device sync.'}
            </h1>
            <p className="app-page-summary">
              {desktopRuntime
                ? 'Optional server auth for sync. Desktop app data still remains the default workflow for drafts, themes, and provider configuration.'
                : 'Optional server auth for sync. Local browser storage still remains the default workflow for drafts, themes, and provider configuration.'}
            </p>
          </div>

          <div className="app-panel-muted p-4">
            <p className="app-page-eyebrow">Connection</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
              <span className={`rounded-full px-2.5 py-1 ${serverConnected ? 'bg-green-500/12 text-green-700 dark:text-green-400' : 'bg-destructive/12 text-destructive'}`}>
                Server {serverConnected ? 'online' : 'offline'}
              </span>
              <span className={`rounded-full px-2.5 py-1 ${isAuthenticated ? 'bg-green-500/12 text-green-700 dark:text-green-400' : 'bg-muted text-muted-foreground'}`}>
                Session {isAuthenticated ? 'active' : 'guest'}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                {mode === 'login' ? 'Login flow' : 'Register flow'}
              </span>
            </div>
            {serverStatus?.user && (
              <p className="mt-3 text-sm text-muted-foreground">
                Logged in as <span className="font-medium text-foreground">{serverStatus.user.displayName}</span> ({serverStatus.user.email})
              </p>
            )}
            {!serverConnected && serverStatus?.error && (
              <p className="mt-3 text-xs text-red-600 dark:text-red-400">{serverStatus.error}</p>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-md space-y-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {selfContainedDesktop && (
          <div className="app-panel space-y-3 p-5">
            <h2 className="text-lg font-semibold">Server auth is disabled</h2>
            <p className="text-sm text-muted-foreground">
              This desktop build is fully self-contained. It stores drafts and settings locally and does not connect to a sync server.
            </p>
          </div>
        )}

        {!selfContainedDesktop && isCheckingServer ? (
          <div className="app-panel flex items-center justify-center gap-2 p-3.5">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Checking server connection...</span>
          </div>
        ) : !selfContainedDesktop && serverStatus?.connected ? (
          <div className="app-note flex items-center justify-between gap-3 border-green-500/50 bg-green-500/10 p-3 text-green-700 dark:text-green-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">Server connected</span>
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.18em]">
              {isAuthenticated ? 'Authenticated' : 'Ready'}
            </span>
          </div>
        ) : !selfContainedDesktop ? (
          <div className="app-panel space-y-3 p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">
                {serverStatus?.error || 'Server not connected'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Server configuration</h3>
              <button
                onClick={() => setShowServerConfig(!showServerConfig)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {showServerConfig ? 'Hide' : 'Configure'}
              </button>
            </div>
            {showServerConfig && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Server URL</label>
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
                      disabled={isCheckingServer || !serverUrl}
                      className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isCheckingServer ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {error && (
          <div className="app-note border-red-500/50 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!selfContainedDesktop && serverStatus?.connected && !serverStatus?.authenticated && (
          <form onSubmit={handleSubmit} className="app-panel space-y-4 p-5">
            <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h2 className="text-lg font-semibold">{modeTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{modeSummary}</p>
              </div>
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs font-medium text-primary hover:underline"
              >
                {mode === 'login' ? 'Need an account?' : 'Have one already?'}
              </button>
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Your name"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="you@example.com"
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Your password'}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Confirm your password"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === 'login' ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <p className="pt-1 text-center text-xs text-muted-foreground">
              Your data is encrypted and stored on your own server.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
