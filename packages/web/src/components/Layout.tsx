import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Sparkles,
  ScissorsLineDashed,
  FolderOpen,
  FileText,
  FileJson,
  Baby,
  GitBranch,
  Settings,
  Menu,
  X,
  CircleHelp,
  LogIn,
  User,
  Users,
  ChevronDown,
  ChevronRight,
  Globe,
  Calendar,
  Palette,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { helpTopics, resolvePageHelp } from '../lib/help';
import { api, DRAFTS_SYNCED_EVENT } from '../lib/api';
import { getFavoriteSeeds, SEED_FAVORITES_CHANGED_EVENT } from '../lib/seed-generator';
import { cn } from '../utils/cn';
import { AssistantContextProvider } from './common/AssistantContext';
import ContextualHelpPanel from './common/ContextualHelpPanel';
import GuidedTourOverlay from './common/GuidedTourOverlay';
import { GuidedTourProvider } from './common/GuidedTourContext';
import { CONFIG_MANAGER_CHANGED_EVENT } from '../lib/config/manager';
import { queueAutoSync } from '../lib/server/auto-sync.js';
import { serverClient, type SyncStatus, AUTH_STATE_CHANGED_EVENT, triggerAutoSyncFlush } from '../lib/server/index.js';
import { isDesktopRuntime } from '../lib/runtime';
import HoverHelpPopover from './common/HoverHelpPopover';

interface LayoutProps {
  children: ReactNode;
}

type KofiWidgetOverlay = {
  draw: (username: string, options: Record<string, string>) => void;
};

type KofiWindow = Window & typeof globalThis & {
  kofiWidgetOverlay?: KofiWidgetOverlay;
  __eidolonKofiOverlayInitialized?: boolean;
};

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/generate', label: 'Generate', icon: Sparkles },
  { path: '/drafts', label: 'Library', icon: FolderOpen },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/optimize', label: 'Optimize', icon: ScissorsLineDashed },
  { path: '/blueprints', label: 'Blueprints', icon: FileJson },
  { path: '/themes', label: 'Themes', icon: Palette },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const KOFI_SCRIPT_ID = 'kofi-overlay-widget-script';
const KOFI_SCRIPT_SRC = 'https://storage.ko-fi.com/cdn/scripts/overlay-widget.js';
const KOFI_STYLE_ID = 'kofi-overlay-position-style';

function shouldShowSupportOverlay(pathname: string): boolean {
  return pathname.startsWith('/about')
    || pathname.startsWith('/help')
    || pathname.startsWith('/whats-new')
    || pathname.startsWith('/license')
    || pathname.startsWith('/terms')
    || pathname.startsWith('/privacy')
    || pathname.startsWith('/security')
    || pathname.startsWith('/code-of-conduct');
}

function ensureKofiTopRightStyles() {
  const existingStyle = document.getElementById(KOFI_STYLE_ID) as HTMLStyleElement | null;
  if (existingStyle) {
    return;
  }

  const style = document.createElement('style');
  style.id = KOFI_STYLE_ID;
  style.textContent = `
    :root {
      --kofi-overlay-top: 16px;
      --kofi-overlay-popup-top: 92px;
      --kofi-overlay-right: 16px;
    }

    .floatingchat-container-wrap,
    .floatingchat-container-wrap-mobi {
      top: var(--kofi-overlay-top) !important;
      right: var(--kofi-overlay-right) !important;
      bottom: auto !important;
      left: auto !important;
    }

    .floating-chat-kofi-popup-iframe,
    .floating-chat-kofi-popup-iframe-mobi {
      top: var(--kofi-overlay-popup-top) !important;
      right: var(--kofi-overlay-right) !important;
      bottom: auto !important;
      left: auto !important;
      max-width: calc(100vw - 32px) !important;
    }

    body[data-support-overlay='hidden'] .floatingchat-container-wrap,
    body[data-support-overlay='hidden'] .floatingchat-container-wrap-mobi,
    body[data-support-overlay='hidden'] .floating-chat-kofi-popup-iframe,
    body[data-support-overlay='hidden'] .floating-chat-kofi-popup-iframe-mobi {
      display: none !important;
    }

    @media (max-width: 1023px) {
      :root {
        --kofi-overlay-top: 80px;
        --kofi-overlay-popup-top: 156px;
        --kofi-overlay-right: 12px;
      }
    }
  `;

  document.head.appendChild(style);
}

function initializeKofiOverlay() {
  const kofiWindow = window as KofiWindow;
  if (kofiWindow.__eidolonKofiOverlayInitialized || !kofiWindow.kofiWidgetOverlay) {
    return;
  }

  ensureKofiTopRightStyles();

  kofiWindow.kofiWidgetOverlay.draw('maeveoffae', {
    type: 'floating-chat',
    'floating-chat.donateButton.text': 'Support me',
    'floating-chat.donateButton.background-color': '#ff38b8',
    'floating-chat.donateButton.text-color': '#fff',
  });

  kofiWindow.__eidolonKofiOverlayInitialized = true;
}

function removeKofiOverlay() {
  const selectors = [
    '.floatingchat-container-wrap',
    '.floatingchat-container-wrap-mobi',
    '.floating-chat-kofi-iframe',
    '.floating-chat-kofi-iframe-mobi',
    '.floating-chat-kofi-popup-iframe',
    '.floating-chat-kofi-popup-iframe-mobi',
  ];

  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach((element) => element.remove());
  }

  document.getElementById(KOFI_SCRIPT_ID)?.remove();

  const kofiWindow = window as KofiWindow;
  kofiWindow.__eidolonKofiOverlayInitialized = false;
}

function isNavItemActive(currentPath: string, itemPath: string): boolean {
  if (itemPath === '/') {
    return currentPath === '/';
  }

  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}

function resolveWorkspaceTitle(pathname: string, helpTitle?: string): string {
  if (!helpTitle) {
    if (pathname === '/') {
      return 'Home';
    }

    const routeTitleByPrefix: Array<[string, string]> = [
      ['/drafts/', 'Draft Review'],
      ['/drafts', 'Library'],
      ['/seed-generator', 'Seed Generator'],
      ['/generate', 'Generate'],
      ['/validation', 'Validation'],
      ['/optimize', 'Token Optimization'],
      ['/batch', 'Batch'],
      ['/templates', 'Templates'],
      ['/blueprints/edit', 'Blueprint Editor'],
      ['/blueprints', 'Blueprints'],
      ['/themes', 'Themes'],
      ['/settings', 'Settings'],
      ['/worlds', 'Worlds'],
      ['/timelines', 'Timeline'],
      ['/events', 'Events'],
      ['/lineage', 'Lineage'],
      ['/similarity', 'Similarity'],
      ['/offspring', 'Offspring'],
      ['/data', 'Data Manager'],
      ['/auth', 'Sign In'],
      ['/about', 'About'],
      ['/help', 'Help Center'],
      ['/whats-new', 'What\'s New'],
      ['/license', 'License'],
      ['/terms', 'Terms'],
      ['/privacy', 'Privacy'],
      ['/security', 'Security'],
      ['/code-of-conduct', 'Code of Conduct'],
    ];

    const matchedRoute = routeTitleByPrefix.find(([prefix]) => pathname.startsWith(prefix));
    return matchedRoute?.[1] ?? 'Workspace';
  }

  return helpTitle.replace(/\s+help$/i, '');
}

const charactersSubmenuItems = [
  { path: '/lineage', label: 'Lineage', icon: GitBranch },
  { path: '/offspring', label: 'Offspring', icon: Baby },
];

const worldsSubmenuItems = [
  { path: '/worlds', label: 'Worlds', icon: Globe },
  { path: '/timelines', label: 'Timeline', icon: GitBranch },
  { path: '/events', label: 'Events', icon: Calendar },
];

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ path, label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200',
        isActive
          ? 'border-primary/25 bg-primary/12 text-foreground shadow-[0_16px_30px_-24px_rgba(56,189,248,0.45)]'
          : 'text-muted-foreground hover:border-border/70 hover:bg-background/50 hover:text-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive ? 'scale-105 text-primary' : 'group-hover:scale-105')} />
      <span>{label}</span>
    </Link>
  );
}

interface CollapsibleSubmenuProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Array<{ path: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
  draftsCount: number;
  seedsCount: number;
}

function CollapsibleSubmenu({
  label,
  icon: Icon,
  items,
  isActive,
  isExpanded,
  onToggle,
  onNavigate,
  draftsCount,
  seedsCount,
}: CollapsibleSubmenuProps) {
  const location = useLocation();
  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'group flex w-full items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'border-primary/20 bg-primary/10 text-foreground'
            : 'text-muted-foreground hover:border-border/70 hover:bg-background/50 hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-2.5">
          <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          <span>{label}</span>
          {(draftsCount > 0 || seedsCount > 0) && (
            <div className="flex items-center gap-1.5">
              {draftsCount > 0 && (
                <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {draftsCount} drafts
                </span>
              )}
              {seedsCount > 0 && (
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  {seedsCount} seeds
                </span>
              )}
            </div>
          )}
        </div>
        <ChevronIcon className="h-4 w-4 transition-transform duration-200" />
      </button>
      {isExpanded && (
        <div className="ml-4 space-y-1 border-l border-border pl-2">
          {items.map((item) => {
            const itemIsActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-all duration-200',
                  itemIsActive
                    ? 'border-primary/25 bg-primary/12 text-foreground'
                    : 'text-muted-foreground hover:border-border/70 hover:bg-background/50 hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-4 w-4', itemIsActive && 'text-primary')} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const desktopRuntime = isDesktopRuntime();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<SyncStatus | null>(null);
  const [charactersExpanded, setCharactersExpanded] = useState(false);
  const [worldsExpanded, setWorldsExpanded] = useState(false);
  const pageHelp = useMemo(() => resolvePageHelp(location.pathname), [location.pathname]);
  const relatedTopics = useMemo(
    () => helpTopics.filter((topic) => pageHelp?.relatedTopicIds.includes(topic.id)),
    [pageHelp]
  );

  // Query for drafts count
  const draftsQuery = useQuery({
    queryKey: ['drafts'],
    queryFn: () => api.getDrafts(),
  });
  const { data: draftsData } = draftsQuery;

  // Get favorite seeds count (synchronously from localStorage)
  const [seedsCount, setSeedsCount] = useState(() => getFavoriteSeeds().length);
  const draftsCount = draftsData?.drafts?.length ?? 0;
  const workspaceTitle = resolveWorkspaceTitle(location.pathname, pageHelp?.title);
  const workspaceSummary = pageHelp?.summary
    ?? 'Move between generation, review, editing, and export surfaces without breaking focus.';
  const workspaceSyncStatus = useMemo(() => {
    if (!serverClient.isEnabled()) {
      return {
        label: 'Local workspace',
        className: 'border-border/70 bg-background/70 text-muted-foreground',
      };
    }

    if (!authStatus?.connected) {
      return {
        label: 'Sync offline',
        className: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      };
    }

    if (!authStatus.authenticated) {
      return {
        label: 'Sync available',
        className: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      };
    }

    return {
      label: 'Sync ready',
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    };
  }, [authStatus]);

  useEffect(() => {
    const handleDraftsSynced = () => {
      void queryClient.invalidateQueries({ queryKey: ['drafts'] });
    };

    window.addEventListener(DRAFTS_SYNCED_EVENT, handleDraftsSynced);
    return () => {
      window.removeEventListener(DRAFTS_SYNCED_EVENT, handleDraftsSynced);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!shouldShowSupportOverlay(location.pathname)) {
      removeKofiOverlay();
      return;
    }

    const existingScript = document.getElementById(KOFI_SCRIPT_ID) as HTMLScriptElement | null;

    if ((window as KofiWindow).kofiWidgetOverlay) {
      initializeKofiOverlay();
      return;
    }

    const script = existingScript ?? document.createElement('script');
    script.id = KOFI_SCRIPT_ID;
    script.src = KOFI_SCRIPT_SRC;
    script.async = true;

    const handleLoad = () => {
      initializeKofiOverlay();
    };

    script.addEventListener('load', handleLoad);

    if (!existingScript) {
      document.head.appendChild(script);
    }

    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, [location.pathname]);

  useEffect(() => {
    document.body.dataset.supportOverlay = shouldShowSupportOverlay(location.pathname) ? 'visible' : 'hidden';

    return () => {
      delete document.body.dataset.supportOverlay;
    };
  }, [location.pathname]);

  // Check if any characters submenu item is active
  const charactersPaths = charactersSubmenuItems.map((item) => item.path);
  const isCharactersActive = charactersPaths.includes(location.pathname);

  // Check if any worlds submenu item is active
  const worldsPaths = worldsSubmenuItems.map((item) => item.path);
  const isWorldsActive = worldsPaths.includes(location.pathname);

  // Auto-expand characters menu if a submenu item is active
  useEffect(() => {
    if (isCharactersActive && !charactersExpanded) {
      setCharactersExpanded(true);
    }
  }, [isCharactersActive, charactersExpanded]);

  // Auto-expand worlds menu if a submenu item is active
  useEffect(() => {
    if (isWorldsActive && !worldsExpanded) {
      setWorldsExpanded(true);
    }
  }, [isWorldsActive, worldsExpanded]);

  // Centralized auth status check function
  const checkAuthStatus = useCallback(async () => {
    if (serverClient.isEnabled()) {
      if (!serverClient.hasAccessToken()) {
        setAuthStatus({ connected: true, authenticated: false });
        return;
      }

      try {
        const status = await serverClient.checkStatus();
        setAuthStatus(status);
        
        // If authentication just became available, flush any pending syncs
        if (status.authenticated && status.connected) {
          void (async () => {
            await triggerAutoSyncFlush();
            await api.syncConfigFromServer();
          })();
        }
      } catch {
        setAuthStatus({ connected: false, authenticated: false });
      }
    } else {
      setAuthStatus({ connected: false, authenticated: false });
    }
  }, []);

  // Check auth status on mount. Login/logout already re-check through auth events.
  useEffect(() => {
    void checkAuthStatus();
  }, [checkAuthStatus]);

  // Listen for auth state changes (login/logout)
  useEffect(() => {
    const handleAuthChange = () => {
      void checkAuthStatus();
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_STATE_CHANGED_EVENT, handleAuthChange);
  }, [checkAuthStatus]);

  useEffect(() => {
    const handleConfigChange = () => {
      queueAutoSync('config');
    };

    window.addEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
    return () => window.removeEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
  }, []);

  useEffect(() => {
    const refreshSeedCount = () => {
      setSeedsCount(getFavoriteSeeds().length);
    };

    window.addEventListener(SEED_FAVORITES_CHANGED_EVENT, refreshSeedCount);
    window.addEventListener('storage', refreshSeedCount);
    return () => {
      window.removeEventListener(SEED_FAVORITES_CHANGED_EVENT, refreshSeedCount);
      window.removeEventListener('storage', refreshSeedCount);
    };
  }, []);

  useEffect(() => {
    setHelpOpen(false);
  }, [location.pathname]);

  return (
    <AssistantContextProvider>
      <GuidedTourProvider>
      <div className="app-shell flex min-h-dvh bg-background text-foreground lg:h-dvh lg:items-stretch lg:overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-card/80 backdrop-blur-xl border-r border-border transition-[transform,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:order-0 lg:static lg:w-[18rem] lg:max-w-none lg:translate-x-0',
            'app-sidebar',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-dvh flex-col lg:h-full">
            {/* Logo */}
            <div className="flex h-14 items-center justify-between border-b border-border/50 px-3.5">
              <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                <div className="rounded-md bg-gradient-to-br from-primary to-accent p-2 shadow-lg shadow-primary/20">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-semibold tracking-tight text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Eidolon</span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Simulacra v{__APP_VERSION__}</span>
                </div>
              </Link>
              <button
                type="button"
                aria-label="Close sidebar"
                className="rounded-lg p-2 transition-colors hover:bg-accent lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {/* Characters collapsible submenu */}
              <CollapsibleSubmenu
                label="Characters"
                icon={Users}
                items={charactersSubmenuItems}
                isActive={isCharactersActive}
                isExpanded={charactersExpanded}
                onToggle={() => setCharactersExpanded(!charactersExpanded)}
                onNavigate={() => setSidebarOpen(false)}
                draftsCount={draftsCount}
                seedsCount={seedsCount}
              />

              {/* Worlds collapsible submenu */}
              <CollapsibleSubmenu
                label="Worlds"
                icon={Globe}
                items={worldsSubmenuItems}
                isActive={isWorldsActive}
                isExpanded={worldsExpanded}
                onToggle={() => setWorldsExpanded(!worldsExpanded)}
                onNavigate={() => setSidebarOpen(false)}
                draftsCount={0}
                seedsCount={0}
              />

              {/* Regular nav items */}
              {navItems.map((item) => {
                const isActive = isNavItemActive(location.pathname, item.path);
                return (
                  <NavItem
                    key={item.path}
                    path={item.path}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                    onClick={() => setSidebarOpen(false)}
                  />
                );
              })}
            </nav>

            {/* Auth Status / Sign In Button */}
            {authStatus && !authStatus.authenticated && serverClient.isEnabled() && (
              <div className="border-t border-border/50 px-3 py-2.5">
                <Link
                  to="/auth"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10 px-3.5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:from-primary/20 hover:to-accent/20"
                >
                  <LogIn className="h-5 w-5 text-primary" />
                  <div className="flex flex-col">
                    <span className="font-semibold">Sign In</span>
                    <span className="text-xs text-muted-foreground">Sync your data</span>
                  </div>
                </Link>
              </div>
            )}

            {/* User Info when authenticated */}
            {authStatus?.authenticated && authStatus.user && (
              <div className="border-t border-border/50 px-3 py-2.5">
                <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 px-3.5 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500/20">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{authStatus.user.displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{authStatus.user.email}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-border/50 px-4 py-3">
              <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                <Link
                  to="/help"
                  onClick={() => setSidebarOpen(false)}
                  className="transition-colors hover:text-primary"
                >
                  Help
                </Link>
                <Link
                  to="/about"
                  onClick={() => setSidebarOpen(false)}
                  className="transition-colors hover:text-primary"
                >
                  About
                </Link>
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground/80">
                  v{__APP_VERSION__}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-hidden">
          <div className="flex h-full min-h-0 flex-col">
            {/* Mobile header */}
            <header className="app-frame-panel sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/50 px-3 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setSidebarOpen(true)}
                className="rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground sm:text-base" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Eidolon Simulacra</span>
              {pageHelp && (
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <CircleHelp className="h-3.5 w-3.5" />
                  Help
                </button>
              )}
            </header>

            <header className="app-frame-panel hidden border-b border-border/50 px-5 py-4 lg:block">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary"
                      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      {desktopRuntime ? 'Desktop workspace' : 'Browser workspace'}
                    </p>
                    <span className="inline-flex items-center rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {desktopRuntime ? 'Native shell' : 'Web runtime'}
                    </span>
                  </div>
                  <h1
                    className="mt-3 text-3xl font-semibold tracking-tight text-foreground"
                    style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                  >
                    {workspaceTitle}
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{workspaceSummary}</p>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">
                    {draftsCount} drafts · {seedsCount} favorite seeds · {workspaceSyncStatus.label}
                  </p>
                </div>
                {pageHelp && (
                  <div className="flex shrink-0 items-center gap-2 pt-1">
                    <HoverHelpPopover
                      title={pageHelp.title}
                      summary={pageHelp.summary}
                      keyActions={pageHelp.keyActions}
                      pitfalls={pageHelp.pitfalls}
                      actions={pageHelp.actions}
                      label="Help"
                      align="end"
                      onTriggerClick={() => setHelpOpen(true)}
                      triggerClassName="rounded-lg px-3.5 py-2 text-xs font-semibold"
                    />
                  </div>
                )}
              </div>
            </header>

            {/* Page content */}
            <div className="min-h-0 flex-1 overflow-auto px-4 py-4 lg:px-5 lg:py-5">
              <div className="app-page mx-auto flex min-h-full w-full max-w-[1680px] flex-col gap-4">
                {children}
              </div>
            </div>
          </div>
        </main>
        {pageHelp && (
          <ContextualHelpPanel
            entry={pageHelp}
            topics={relatedTopics}
            isOpen={helpOpen}
            onClose={() => setHelpOpen(false)}
          />
        )}
        <GuidedTourOverlay />
      </div>
      </GuidedTourProvider>
    </AssistantContextProvider>
  );
}
