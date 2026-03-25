import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Sparkles,
  FolderOpen,
  FileText,
  GitCompare,
  Baby,
  GitBranch,
  Settings,
  Menu,
  X,
  Layers,
  BookOpen,
  Dice1,
  ShieldCheck,
  Palette,
  Scale,
  Info,
  CircleHelp,
  Mail,
  LogIn,
  User,
  Users,
  ChevronDown,
  ChevronRight,
  Globe,
  Calendar,
  ChevronRight as TrayChevronRight,
  Layers as DynamicIcon,
  HelpCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { helpTopics, resolvePageHelp } from '../lib/help';
import { roadmapGroups } from '../lib/roadmap';
import { api } from '../lib/api';
import { getFavoriteSeeds } from '../lib/seed-generator';
import { cn } from '../utils/cn';
import { AssistantContextProvider } from './common/AssistantContext';
import ContextualHelpPanel from './common/ContextualHelpPanel';
import HelpTab from './common/HelpTab';
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
  { path: '/seed-generator', label: 'Seed Generator', icon: Dice1 },
  { path: '/batch', label: 'Batch', icon: Layers },
  { path: '/validation', label: 'Validation', icon: ShieldCheck },
  { path: '/similarity', label: 'Compare', icon: GitCompare },
  { path: '/drafts', label: 'Drafts', icon: FolderOpen },
  { path: '/templates', label: 'Templates', icon: FileText },
  { path: '/blueprints', label: 'Blueprints', icon: BookOpen },
  { path: '/themes', label: 'Theme Studio', icon: Palette },
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

const footerLinks = [
  { path: '/about', label: 'About', icon: Info },
  { path: '/help', label: 'Help', icon: BookOpen },
  { path: '/whats-new', label: 'What\'s New', icon: Info },
  { path: '/terms', label: 'Terms', icon: Scale },
  { path: '/privacy', label: 'Privacy', icon: ShieldCheck },
  { path: '/license', label: 'License', icon: FileText },
  { path: '/security', label: 'Security', icon: ShieldCheck },
  { path: '/code-of-conduct', label: 'Conduct', icon: BookOpen },
];

const externalFooterLinks = [
  { href: 'mailto:contact@eidolonsimulacra.com?subject=Bug%20Report%20or%20Security%20Issue', label: 'Contact', icon: Mail },
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
  const reviewMatch = location.pathname.match(/^\/drafts\/([^/]+)$/);
  const reviewDraftId = reviewMatch ? decodeURIComponent(reviewMatch[1]) : null;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [authStatus, setAuthStatus] = useState<SyncStatus | null>(null);
  const [charactersExpanded, setCharactersExpanded] = useState(false);
  const [worldsExpanded, setWorldsExpanded] = useState(false);
  const [trayTab, setTrayTab] = useState<'help' | 'dynamic' | 'whats-new'>('help');
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
  const favoriteSeeds = useMemo(() => getFavoriteSeeds(), []);
  const seedsCount = favoriteSeeds.length;
  const draftsCount = draftsData?.drafts?.length ?? 0;

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
      title: 'Page Tray',
      emptyLabel: 'No page-specific items available.',
      items: [
        { id: 'nav-home', label: 'Home', to: '/' },
        { id: 'nav-drafts', label: 'Drafts', description: `${draftsCount} saved`, to: '/drafts' },
        { id: 'nav-settings', label: 'Settings', to: '/settings' },
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

            <div className="border-t border-border/50 px-4 py-4">
              <div className="mb-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Support
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Back Eidolon Simulacra on Ko-fi.
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/80 p-3 shadow-sm">
                <a
                  href="https://ko-fi.com/maeveoffae"
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center rounded-lg bg-[#72a4f2] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Support me on Ko-fi
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Web • No backend required
                </p>
                <Link
                  to="/settings"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Settings
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs text-muted-foreground">
                {footerLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="hover:text-primary transition-colors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {externalFooterLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="hover:text-primary transition-colors"
                  >
                    {item.label}
                  </a>
                ))}
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
          <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
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
        <aside className="app-sidebar hidden w-80 flex-col border-l border-border/60 xl:flex">
          <div className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur">
            {/* Tab buttons */}
            <div className="flex border-b border-border/40">
              <button
                type="button"
                onClick={() => setTrayTab('help')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors',
                  trayTab === 'help'
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Help
              </button>
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
          <div className="flex-1 overflow-hidden">
            {trayTab === 'help' ? (
              <HelpTab pageHelp={pageHelp} relatedTopics={relatedTopics} />
            ) : trayTab === 'dynamic' ? (
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
