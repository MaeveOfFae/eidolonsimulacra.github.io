import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CircleHelp, ChevronDown, ChevronRight, Heart, Menu, Search, Sparkles, X } from 'lucide-react';
import { PROJECT_SUPPORT_URL } from '@char-gen/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { helpTopics, resolvePageHelp } from '../lib/help';
import { api, DRAFTS_SYNCED_EVENT } from '../lib/api';
import { getFavoriteSeeds, SEED_FAVORITES_CHANGED_EVENT } from '../lib/seed-generator';
import { cn } from '../utils/cn';
import { AssistantContextProvider } from './common/AssistantContext';
import ContextualHelpPanel from './common/ContextualHelpPanel';
import GuidedTourOverlay from './common/GuidedTourOverlay';
import { GuidedTourProvider } from './common/GuidedTourContext';
import { isDesktopRuntime } from '../lib/runtime';
import {
  isNavPathActive,
  navSubmenuGroups,
  primaryNavEntries,
  resolveRouteTitle,
} from '../lib/navigation/route-catalog';
import { quickActionsShortcutLabel } from '../lib/navigation/quick-actions';
import { HELP_SHORTCUT_ARIA, isHelpShortcut, isPaletteShortcut, PALETTE_SHORTCUT_ARIA } from '../lib/shortcuts';
import {
  clearStoredWorkspaceMode,
  orderEntriesForMode,
  readStoredWorkspaceMode,
  resolveActiveWorkspaceMode,
  WORKSPACE_MODES,
  writeStoredWorkspaceMode,
  type WorkspaceModeId,
} from '../lib/navigation/workspace-modes';
import HoverHelpPopover from './common/HoverHelpPopover';
import QuickActionsPalette from './common/QuickActionsPalette';
import WorkspaceModeSwitcher from './common/WorkspaceModeSwitcher';

interface LayoutProps {
  children: ReactNode;
}

const QUICK_ACTIONS_SHORTCUT = quickActionsShortcutLabel(typeof navigator === 'undefined' ? '' : navigator.platform);

/**
 * The sidebar list, its submenus, the active-route rule, and the heading
 * fallback all come from `@/lib/navigation/route-catalog`, which is validated
 * against `App.tsx` in `route-catalog.test.ts`. This file used to keep its own
 * copy of each: a 12-item `navItems` array, two submenu arrays, an
 * `isNavItemActive` clone of the same rule, and a hand-ordered 31-entry
 * heading map whose correctness depended on `/drafts/` sorting above `/drafts`.
 */
function resolveWorkspaceTitle(pathname: string, helpTitle?: string): string {
  if (!helpTitle) {
    return resolveRouteTitle(pathname) ?? 'Workspace';
  }

  return helpTitle.replace(/\s+help$/i, '');
}

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
          : 'text-muted-foreground hover:border-border/70 hover:bg-background/50 hover:text-foreground',
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 transition-transform duration-200',
          isActive ? 'scale-105 text-primary' : 'group-hover:scale-105',
        )}
      />
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
            : 'text-muted-foreground hover:border-border/70 hover:bg-background/50 hover:text-foreground',
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
                    : 'text-muted-foreground hover:border-border/70 hover:bg-background/50 hover:text-foreground',
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const sidebarCloseButtonRef = useRef<HTMLButtonElement>(null);
  // The explicit choice is null until the user picks a mode, in which case the
  // active mode simply follows the screen they are on.
  const [explicitModeId, setExplicitModeId] = useState<WorkspaceModeId | null>(() => readStoredWorkspaceMode());
  const [expandedSubmenus, setExpandedSubmenus] = useState<string[]>([]);
  const toggleSubmenu = (id: string) =>
    setExpandedSubmenus((previous) =>
      previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id],
    );
  const pageHelp = useMemo(() => resolvePageHelp(location.pathname), [location.pathname]);
  const relatedTopics = useMemo(
    () => helpTopics.filter((topic) => pageHelp?.relatedTopicIds.includes(topic.id)),
    [pageHelp],
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
  const workspaceSummary =
    pageHelp?.summary ?? 'Move between generation, review, editing, and export surfaces without breaking focus.';
  const workspaceStateLabel = desktopRuntime ? 'Device-link ready' : 'Local workspace';
  const activeModeId = resolveActiveWorkspaceMode(explicitModeId, location.pathname);
  const activeMode = WORKSPACE_MODES.find((mode) => mode.id === activeModeId) ?? null;
  const ActiveModeIcon = activeMode?.icon ?? null;
  // A mode reorders the sidebar; it never removes anything from it.
  const navEntries = orderEntriesForMode(primaryNavEntries, activeModeId);
  const selectWorkspaceMode = (modeId: WorkspaceModeId | null) => {
    setExplicitModeId(modeId);
    if (modeId) {
      writeStoredWorkspaceMode(modeId);
    } else {
      clearStoredWorkspaceMode();
    }
  };

  useEffect(() => {
    const handleDraftsSynced = () => {
      void queryClient.invalidateQueries({ queryKey: ['drafts'] });
    };

    window.addEventListener(DRAFTS_SYNCED_EVENT, handleDraftsSynced);
    return () => {
      window.removeEventListener(DRAFTS_SYNCED_EVENT, handleDraftsSynced);
    };
  }, [queryClient]);

  // Which collapsible sidebar section (if any) the current route belongs to.
  const activeSubmenuId =
    navSubmenuGroups.find((group) => group.entries.some((entry) => isNavPathActive(location.pathname, entry.path)))
      ?.id ?? null;

  // Auto-expand whichever section contains the current route.
  useEffect(() => {
    if (activeSubmenuId && !expandedSubmenus.includes(activeSubmenuId)) {
      setExpandedSubmenus((previous) => [...previous, activeSubmenuId]);
    }
  }, [activeSubmenuId, expandedSubmenus]);

  // The mobile drawer covers the page, so it takes focus on open. That is also
  // what makes its Escape handler work: the keydown fires on the drawer itself.
  useEffect(() => {
    if (sidebarOpen) {
      sidebarCloseButtonRef.current?.focus();
    }
  }, [sidebarOpen]);

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
    setPaletteOpen(false);
  }, [location.pathname]);

  // ⌘K / Ctrl-K toggles the quick-actions palette; `?` opens help for this page.
  // Both decisions live in `@/lib/shortcuts` so they are testable without the
  // app shell — in particular the rule that `?` is ignored while typing.
  useEffect(() => {
    const handleShortcuts = (event: KeyboardEvent) => {
      if (isPaletteShortcut(event)) {
        event.preventDefault();
        setPaletteOpen((current) => !current);
        return;
      }

      if (isHelpShortcut(event) && pageHelp) {
        event.preventDefault();
        setHelpOpen(true);
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => {
      window.removeEventListener('keydown', handleShortcuts);
    };
  }, [pageHelp]);

  return (
    <AssistantContextProvider>
      <GuidedTourProvider>
        <div className="app-shell flex min-h-dvh bg-background text-foreground lg:h-dvh lg:items-stretch lg:overflow-hidden">
          {/* Keyboard-first: reach the page content without walking the nav. */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:border focus:border-primary/40 focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg"
          >
            Skip to main content
          </a>
          {/* Mobile sidebar backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            onKeyDown={(event) => {
              if (event.key === 'Escape' && sidebarOpen) {
                setSidebarOpen(false);
              }
            }}
            className={cn(
              'fixed inset-y-0 left-0 z-50 w-[min(18rem,calc(100vw-1rem))] max-w-[calc(100vw-1rem)] bg-card/80 backdrop-blur-xl border-r border-border transition-[transform,background-color,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:order-0 lg:static lg:w-[18rem] lg:max-w-none lg:translate-x-0',
              'app-sidebar',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full',
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
                    <span
                      className="text-base font-semibold tracking-tight text-foreground"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      Eidolon
                    </span>
                    <span
                      className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      Simulacra v{__APP_VERSION__}
                    </span>
                  </div>
                </Link>
                <button
                  ref={sidebarCloseButtonRef}
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
                {/* Workspace mode: reorders the list below, hides nothing. */}
                <WorkspaceModeSwitcher
                  explicitModeId={explicitModeId}
                  activeModeId={activeModeId}
                  onSelect={selectWorkspaceMode}
                />

                {/* Quick-actions trigger. The palette itself opens from ⌘K anywhere. */}
                <button
                  type="button"
                  onClick={() => {
                    setSidebarOpen(false);
                    setPaletteOpen(true);
                  }}
                  aria-keyshortcuts={PALETTE_SHORTCUT_ARIA}
                  title={`Quick actions (${QUICK_ACTIONS_SHORTCUT})`}
                  className="mb-2 flex w-full items-center gap-2.5 rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 truncate text-left">Quick actions</span>
                  <kbd className="shrink-0 rounded border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">
                    {QUICK_ACTIONS_SHORTCUT}
                  </kbd>
                </button>

                {/* Collapsible sections (Characters, Worlds) come from the catalog. */}
                {navSubmenuGroups.map((group) => (
                  <CollapsibleSubmenu
                    key={group.id}
                    label={group.label}
                    icon={group.icon}
                    items={group.entries}
                    isActive={activeSubmenuId === group.id}
                    isExpanded={expandedSubmenus.includes(group.id)}
                    onToggle={() => toggleSubmenu(group.id)}
                    onNavigate={() => setSidebarOpen(false)}
                    draftsCount={group.id === 'characters' ? draftsCount : 0}
                    seedsCount={group.id === 'characters' ? seedsCount : 0}
                  />
                ))}

                {/* Regular nav items */}
                {navEntries.map((item) => {
                  const isActive = isNavPathActive(location.pathname, item.path);
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

                {/* Support link (external, always visible in the sidebar) */}
                <div className="mt-2 border-t border-border/60 pt-2">
                  <a
                    href={PROJECT_SUPPORT_URL}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center gap-2.5 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-border/70 hover:bg-background/50 hover:text-foreground"
                  >
                    <Heart
                      className="h-5 w-5 text-[#ff38b8] transition-transform duration-200 group-hover:scale-105"
                      aria-hidden="true"
                    />
                    <span>Support me</span>
                  </a>
                </div>
              </nav>

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
          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 overflow-hidden outline-none">
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
                <span
                  className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground sm:text-base"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  Eidolon Simulacra
                </span>
                {pageHelp && (
                  <button
                    type="button"
                    onClick={() => setHelpOpen(true)}
                    aria-keyshortcuts={HELP_SHORTCUT_ARIA}
                    title="Help for this page (?)"
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
                      {ActiveModeIcon && activeMode ? (
                        <Link
                          to={activeMode.defaultRoute}
                          title={`Go to the ${activeMode.label} workspace`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:border-primary/50 hover:bg-primary/15"
                        >
                          <ActiveModeIcon className="h-3 w-3" aria-hidden="true" />
                          {activeMode.label}
                        </Link>
                      ) : null}
                    </div>
                    <h1
                      className="mt-3 text-3xl font-semibold tracking-tight text-foreground"
                      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                    >
                      {workspaceTitle}
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{workspaceSummary}</p>
                    <p className="mt-3 text-xs font-medium text-muted-foreground">
                      {draftsCount} drafts · {seedsCount} favorite seeds · {workspaceStateLabel}
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
                <div className="app-page mx-auto flex min-h-full w-full max-w-[1680px] flex-col gap-4">{children}</div>
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
          <QuickActionsPalette
            isOpen={paletteOpen}
            onClose={() => setPaletteOpen(false)}
            drafts={draftsData?.drafts ?? []}
            modeId={activeModeId}
          />
          <GuidedTourOverlay />
        </div>
      </GuidedTourProvider>
    </AssistantContextProvider>
  );
}
