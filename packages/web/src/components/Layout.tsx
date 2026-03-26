import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Sparkles,
  FolderOpen,
  FileText,
  Baby,
  GitBranch,
  Settings,
  Menu,
  X,
  Info,
  CircleHelp,
  LogIn,
  User,
  Users,
  ChevronDown,
  ChevronRight,
  Globe,
  Calendar,
  ChevronRight as TrayChevronRight,
  Layers as DynamicIcon,
  Palette,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { helpTopics, resolvePageHelp } from '../lib/help';
import { roadmapGroups } from '../lib/roadmap';
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
import { DraftListSidebar } from './drafts/DraftListSidebar';

interface LayoutProps {
  children: ReactNode;
}

interface TrayItem {
  id: string;
  label: string;
  description?: string;
  to?: string;
  badge?: string;
}

interface TraySection {
  id: string;
  title: string;
  emptyLabel: string;
  items: TrayItem[];
}

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/generate', label: 'Generate', icon: Sparkles },
  { path: '/drafts', label: 'Drafts', icon: FolderOpen },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/themes', label: 'Themes', icon: Palette },
  { path: '/settings', label: 'Settings', icon: Settings },
];

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
        'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5 transition-transform duration-200', isActive ? 'scale-110' : 'group-hover:scale-110')} />
      <span>{label}</span>
      {isActive && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 -z-10" />
      )}
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
          'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-accent/50 text-foreground'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
          <span>{label}</span>
          {(draftsCount > 0 || seedsCount > 0) && (
            <div className="flex items-center gap-1.5">
              {draftsCount > 0 && (
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {draftsCount} drafts
                </span>
              )}
              {seedsCount > 0 && (
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
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
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  itemIsActive
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
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
  const reviewMatch = location.pathname.match(/^\/drafts\/([^/]+)$/);
  const reviewDraftId = reviewMatch ? decodeURIComponent(reviewMatch[1]) : null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trayOpen, setTrayOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<SyncStatus | null>(null);
  const [charactersExpanded, setCharactersExpanded] = useState(false);
  const [worldsExpanded, setWorldsExpanded] = useState(false);
  const [trayTab, setTrayTab] = useState<'dynamic' | 'whats-new'>('dynamic');
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

  const { data: reviewDraft } = useQuery({
    queryKey: ['draft', reviewDraftId],
    queryFn: () => api.getDraft(reviewDraftId || ''),
    enabled: Boolean(reviewDraftId),
  });

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.getTemplates(),
    enabled: location.pathname.startsWith('/templates'),
  });

  const { data: themesData } = useQuery({
    queryKey: ['themes'],
    queryFn: () => api.getThemes(),
    enabled: location.pathname.startsWith('/themes'),
  });

  const { data: blueprintsData } = useQuery({
    queryKey: ['blueprints'],
    queryFn: () => api.getBlueprints(),
    enabled: location.pathname.startsWith('/blueprints'),
  });

  // Get favorite seeds count (synchronously from localStorage)
  const [seedsCount, setSeedsCount] = useState(() => getFavoriteSeeds().length);
  const draftsCount = draftsData?.drafts?.length ?? 0;

  useEffect(() => {
    const handleDraftsSynced = () => {
      void queryClient.invalidateQueries({ queryKey: ['drafts'] });
    };

    window.addEventListener(DRAFTS_SYNCED_EVENT, handleDraftsSynced);
    return () => {
      window.removeEventListener(DRAFTS_SYNCED_EVENT, handleDraftsSynced);
    };
  }, [queryClient]);

  const traySections = useMemo<TraySection[]>(() => {
    if (location.pathname.startsWith('/drafts')) {
      const draftItems = (draftsData?.drafts || []).slice(0, 16).map((draft) => ({
        id: draft.review_id,
        label: draft.character_name || draft.seed,
        description: `${draft.template_name || 'Default'} • ${draft.mode}`,
        to: `/drafts/${encodeURIComponent(draft.review_id)}`,
        badge: reviewDraftId && reviewDraftId === draft.review_id
          ? 'Open'
          : (draft.favorite ? 'Fav' : undefined),
      }));

      const sections: TraySection[] = [{
        id: 'drafts',
        title: 'Draft Filing Tray',
        emptyLabel: 'No drafts available yet.',
        items: draftItems,
      }];

      if (reviewDraftId) {
        const assetItems = Object.keys(reviewDraft?.assets || {}).map((assetName) => ({
          id: assetName,
          label: assetName.replace(/_/g, ' '),
          description: 'Asset in current draft',
        }));

        sections.push({
          id: 'review-assets',
          title: 'Current Draft Assets',
          emptyLabel: 'No assets loaded for this draft.',
          items: assetItems,
        });
      }

      return sections;
    }

    if (location.pathname.startsWith('/templates')) {
      const items = (templatesData || []).slice(0, 16).map((template) => ({
        id: template.name,
        label: template.name,
        description: template.description || 'Template definition',
        badge: template.is_default ? 'Default' : undefined,
      }));

      return [{
        id: 'templates',
        title: 'Template Tray',
        emptyLabel: 'No templates available.',
        items,
      }];
    }

    if (location.pathname.startsWith('/themes')) {
      const items = (themesData || []).slice(0, 16).map((theme) => ({
        id: theme.name,
        label: theme.display_name,
        description: theme.description || theme.name,
        badge: theme.is_builtin ? 'Built-in' : 'Custom',
      }));

      return [{
        id: 'themes',
        title: 'Theme Tray',
        emptyLabel: 'No theme presets available.',
        items,
      }];
    }

    if (location.pathname.startsWith('/blueprints')) {
      const blueprintItems = [
        ...(blueprintsData?.core || []),
        ...(blueprintsData?.system || []),
        ...(blueprintsData?.templates?.local || []),
        ...(blueprintsData?.examples || []),
      ];

      const items = blueprintItems.slice(0, 18).map((blueprint) => ({
        id: blueprint.path,
        label: blueprint.name,
        description: blueprint.path,
      }));

      return [{
        id: 'blueprints',
        title: 'Blueprint Tray',
        emptyLabel: 'No blueprints found.',
        items,
      }];
    }

    if (location.pathname.startsWith('/generate')) {
      return [{
        id: 'generate',
        title: 'Generate Tray',
        emptyLabel: 'No generation actions available.',
        items: [
          { id: 'gen-drafts', label: 'Recent drafts', description: `${draftsCount} available`, to: '/drafts' },
          { id: 'gen-seeds', label: 'Favorite seeds', description: `${seedsCount} saved`, to: '/seed-generator' },
          { id: 'gen-templates', label: 'Template manager', description: 'Switch template packs', to: '/templates' },
        ],
      }];
    }

    return [{
      id: 'general',
      title: 'Shortcuts',
      emptyLabel: 'No shortcuts available.',
      items: [
        { id: 'nav-seeds', label: 'Seed Generator', to: '/seed-generator' },
        { id: 'nav-validation', label: 'Validation', to: '/validation' },
        { id: 'nav-batch', label: 'Batch', to: '/batch' },
        { id: 'nav-compare', label: 'Compare', to: '/similarity' },
        { id: 'nav-blueprints', label: 'Blueprints', to: '/blueprints' },
        { id: 'nav-themes', label: 'Theme Studio', to: '/themes' },
      ],
    }];
  }, [location.pathname, draftsData?.drafts, draftsCount, reviewDraftId, reviewDraft?.assets, templatesData, themesData, blueprintsData, seedsCount]);

  // Get upcoming features for What's New tab
  const upcomingFeatures = useMemo(() => {
    return roadmapGroups
      .filter((group) => group.status !== 'implemented')
      .flatMap((group) =>
        group.items.slice(0, 3).map((item, index) => ({
          id: `${group.id}-${index}`,
          title: item.length > 60 ? item.slice(0, 60) + '...' : item,
          category: group.title,
          status: group.status,
        }))
      )
      .slice(0, 12);
  }, []);

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
          void triggerAutoSyncFlush();
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
    setTrayOpen(false);
    setHelpOpen(false);
  }, [location.pathname]);

  return (
    <AssistantContextProvider>
      <GuidedTourProvider>
      <div className="app-shell flex min-h-dvh bg-background lg:h-screen">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {trayOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/45 backdrop-blur-sm"
            onClick={() => setTrayOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-[min(20rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-card/80 backdrop-blur-md border-r border-border transition-transform duration-300 ease-out lg:static lg:w-72 lg:max-w-none lg:translate-x-0',
            'app-sidebar',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex h-dvh flex-col lg:h-full">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
              <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold tracking-tight text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Eidolon</span>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>Simulacra v{__APP_VERSION__}</span>
                </div>
              </Link>
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
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
                const isActive = location.pathname === item.path;
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
              <div className="px-4 py-3 border-t border-border/50">
                <Link
                  to="/auth"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 px-4 py-3 text-sm font-medium text-foreground transition-all hover:from-primary/20 hover:to-accent/20 hover:border-primary/40"
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
              <div className="px-4 py-3 border-t border-border/50">
                <div className="flex items-center gap-3 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                    <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{authStatus.user.displayName}</span>
                    <span className="text-xs text-muted-foreground truncate">{authStatus.user.email}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-border/50 p-4">
              <div className="grid grid-cols-3 gap-2">
                <Link
                  to="/settings"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
                >
                  Settings
                </Link>
                <Link
                  to="/help"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
                >
                  Help
                </Link>
                <Link
                  to="/about"
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-center text-xs font-medium text-muted-foreground transition-colors hover:border-primary/35 hover:text-primary"
                >
                  About
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 overflow-auto">
          {/* Mobile header */}
          <header className="app-frame-panel sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/50 px-4 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <Menu className="h-6 w-6" />
            </button>
            <span className="min-w-0 truncate text-base font-semibold tracking-tight text-foreground sm:text-lg" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Eidolon Simulacra</span>
            {pageHelp && (
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                className="ml-auto inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <CircleHelp className="h-4 w-4" />
                Help
              </button>
            )}
          </header>

          {/* Page content */}
          <div className="mx-auto max-w-[1360px] p-5 lg:p-6">
            {children}
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
        <button
          type="button"
          onClick={() => setTrayOpen(true)}
          className="fixed bottom-24 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/95 px-3 py-3 text-sm font-medium text-foreground shadow-xl shadow-black/20 backdrop-blur-md transition-colors hover:border-primary/40 hover:text-primary sm:px-4"
        >
          <DynamicIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Workspace</span>
        </button>
        <aside
          className={cn(
            'fixed right-0 top-0 z-40 flex h-dvh w-full max-w-md flex-col border-l border-border/60 bg-card/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out',
            trayOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          aria-hidden={!trayOpen}
        >
          <div className="sticky top-0 z-10 border-b border-border/60 bg-card/90 backdrop-blur">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Utility Panel</p>
                <p className="mt-1 text-sm text-muted-foreground">Shortcuts, context, and current work.</p>
              </div>
              <button
                type="button"
                onClick={() => setTrayOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {pageHelp && (
              <div className="border-b border-border/40 px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setTrayOpen(false);
                    setHelpOpen(true);
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-left transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Page Help</p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">{pageHelp.title}</p>
                  </div>
                  <CircleHelp className="h-4 w-4 shrink-0" />
                </button>
              </div>
            )}

            <div className="flex border-b border-border/40">
              <button
                type="button"
                onClick={() => setTrayTab('dynamic')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors',
                  trayTab === 'dynamic'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <DynamicIcon className="h-3.5 w-3.5" />
                Dynamic
              </button>
              <button
                type="button"
                onClick={() => setTrayTab('whats-new')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors',
                  trayTab === 'whats-new'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                New
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {trayTab === 'dynamic' ? (
              location.pathname.startsWith('/drafts') ? (
                <DraftListSidebar
                  drafts={draftsData?.drafts || []}
                  isLoading={draftsQuery.isLoading}
                />
              ) : (
                <div className="space-y-3">
                  <div className="px-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upcoming Features</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Planned improvements and new capabilities.</p>
                  </div>
                  {upcomingFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="rounded-lg border border-border/70 bg-background/50 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                          feature.status === 'planned'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        )}>
                          {feature.status === 'planned' ? 'Planned' : 'In Progress'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-foreground leading-snug">{feature.title}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">{feature.category}</p>
                    </div>
                  ))}
                  <Link
                    to="/whats-new"
                    onClick={() => setTrayOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    View Full Roadmap
                    <TrayChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )
            ) : (
              <div className="space-y-4">
                {traySections.map((section) => (
                  <section key={section.id} className="space-y-2">
                    <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h3>
                    {section.items.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
                        {section.emptyLabel}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {section.items.map((item) => {
                          const content = (
                            <>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium">{item.label}</div>
                                {item.description && (
                                  <div className="truncate text-xs text-muted-foreground">{item.description}</div>
                                )}
                              </div>
                              {item.badge && (
                                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                  {item.badge}
                                </span>
                              )}
                              {item.to && <TrayChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                            </>
                          );

                          if (item.to) {
                            return (
                              <Link
                                key={item.id}
                                to={item.to}
                                onClick={() => setTrayOpen(false)}
                                className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/70 px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40"
                              >
                                {content}
                              </Link>
                            );
                          }

                          return (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/50 px-3 py-2"
                            >
                              {content}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </div>
        </aside>
        <GuidedTourOverlay />
      </div>
      </GuidedTourProvider>
    </AssistantContextProvider>
  );
}
