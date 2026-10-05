/**
 * Canonical information architecture for the web app.
 *
 * Before this module the same 35 routes were described in five places that could
 * drift independently, and only one of them was validated:
 *
 *   1. `App.tsx`                          — the router itself
 *   2. `Layout.tsx` `navItems`            — the sidebar
 *   3. `Layout.tsx` `*SubmenuItems`       — the Characters / Worlds submenus
 *   4. `Layout.tsx` `routeTitleByPrefix`  — the app-frame heading fallback
 *   5. `Home.tsx` `WORKFLOW_LANES` / `EXPLORATION_ACTIONS`
 *   6. `shared/src/help.ts`               — help coverage (the only validated one)
 *
 * This file is the single source of truth. The sidebar, the app-frame title, and
 * the quick-actions palette all read it, and `validateRouteCatalog` fails loudly
 * when it falls out of step with the router — mirroring the existing
 * `validateHelpRouteCoverage` convention in `shared/src/help.ts` so a new route
 * cannot be added without an entry here.
 */
import type { ComponentType } from 'react';
import {
  Baby,
  BarChart3,
  BookOpen,
  Calendar,
  CircleHelp,
  Database,
  Dice1,
  Download,
  FileJson,
  FileText,
  FolderOpen,
  GitBranch,
  GitCompare,
  Globe,
  Home,
  Info,
  Layers,
  Megaphone,
  Palette,
  Ruler,
  Scale,
  ScissorsLineDashed,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

export type RouteIcon = ComponentType<{ className?: string }>;

/** Sidebar section a route belongs to. `main` is the always-visible list. */
export type RouteGroupId = 'main' | 'characters' | 'worlds' | 'tools' | 'system';

export interface RouteCatalogEntry {
  /** Router path exactly as declared in `App.tsx`. `:param` and `*` are allowed. */
  path: string;
  /** Sidebar / palette label. */
  label: string;
  /** App-frame heading fallback when the route has no page-help title. */
  title: string;
  /** One-line description used by the quick-actions palette. */
  description: string;
  group: RouteGroupId;
  icon: RouteIcon;
  /** Extra search terms for the palette, so synonyms find the right screen. */
  keywords: string[];
  /** Renders in the sidebar. Detail and legal screens stay reachable by link/palette. */
  inNav: boolean;
  /** Additional router paths that resolve to this same surface (e.g. `/drafts/`). */
  aliases?: string[];
}

export const routeCatalog: RouteCatalogEntry[] = [
  {
    path: '/',
    label: 'Home',
    title: 'Home',
    description: 'Dashboard for the next step, recent drafts, and first-run setup.',
    group: 'main',
    icon: Home,
    keywords: ['dashboard', 'start', 'overview', 'getting started'],
    inNav: true,
  },
  {
    path: '/generate',
    label: 'Generate',
    title: 'Generate',
    description: 'Turn one seed into a reviewable draft pack.',
    group: 'main',
    icon: Sparkles,
    keywords: ['seed', 'draft', 'create', 'new draft', 'run'],
    inNav: true,
  },
  {
    path: '/compare',
    label: 'Compare',
    title: 'Compare',
    description: 'Run one seed through several models and line the results up.',
    group: 'main',
    icon: GitCompare,
    keywords: ['models', 'multi-model', 'a/b', 'candidates', 'evaluate'],
    inNav: true,
  },
  {
    path: '/drafts',
    label: 'Library',
    title: 'Library',
    description: 'Reopen saved drafts, check metadata, and send one to review.',
    group: 'main',
    icon: FolderOpen,
    keywords: ['drafts', 'saved', 'archive', 'favorites', 'seeds'],
    inNav: true,
    aliases: ['/drafts/'],
  },
  {
    path: '/drafts/:id',
    label: 'Review',
    title: 'Draft Review',
    description: 'Inspect assets, refine weak spots, validate, and export.',
    group: 'main',
    icon: FileText,
    keywords: ['review', 'approve', 'refine', 'export', 'assets', 'validate'],
    inNav: false,
  },
  {
    path: '/drafts/:id/assets/:assetName/regenerate',
    label: 'Regenerate asset',
    title: 'Draft Review',
    description: 'Re-run a single asset with extra guidance.',
    group: 'main',
    icon: ScissorsLineDashed,
    keywords: ['regenerate', 'asset', 'retry', 'rewrite'],
    inNav: false,
  },
  {
    path: '/templates',
    label: 'Templates',
    title: 'Templates',
    description: 'Choose the asset graph before generating.',
    group: 'main',
    icon: FileText,
    keywords: ['structure', 'asset graph', 'contract', 'pack'],
    inNav: true,
  },
  {
    path: '/optimize',
    label: 'Optimize',
    title: 'Token Optimization',
    description: 'Shorten text while preserving structure and required detail.',
    group: 'main',
    icon: ScissorsLineDashed,
    keywords: ['tokens', 'compress', 'shorten', 'trim', 'cost'],
    inNav: true,
  },
  {
    path: '/blueprints',
    label: 'Blueprints',
    title: 'Blueprints',
    description: 'Advanced prompt and compiler definitions per asset.',
    group: 'main',
    icon: FileJson,
    keywords: ['prompt', 'compiler', 'advanced', 'definitions'],
    inNav: true,
  },
  {
    path: '/blueprints/edit/*',
    label: 'Blueprint editor',
    title: 'Blueprint Editor',
    description: 'Edit one blueprint, with lint and preview.',
    group: 'main',
    icon: FileJson,
    keywords: ['blueprint', 'edit', 'lint', 'prompt'],
    inNav: false,
  },
  {
    path: '/themes',
    label: 'Themes',
    title: 'Themes',
    description: 'Install, author, and share colour themes.',
    group: 'main',
    icon: Palette,
    keywords: ['appearance', 'colours', 'presets', 'dark', 'light', 'look'],
    inNav: true,
  },
  {
    path: '/tokenizer',
    label: 'Tokenizer',
    title: 'Tokenizer',
    description: 'Preview how the prompt breakdown counts tokens.',
    group: 'main',
    icon: Ruler,
    keywords: ['tokens', 'count', 'measure', 'prompt breakdown'],
    inNav: true,
  },
  {
    path: '/insights',
    label: 'Insights',
    title: 'Insights',
    description: 'Token and time cost by provider, model, asset, and day.',
    group: 'main',
    icon: BarChart3,
    keywords: ['usage', 'cost', 'stats', 'history', 'spend', 'metrics'],
    inNav: true,
  },
  {
    path: '/download',
    label: 'Download',
    title: 'Download',
    description: 'Get the desktop and mobile builds.',
    group: 'main',
    icon: Download,
    keywords: ['install', 'desktop', 'app', 'release'],
    inNav: true,
  },
  {
    path: '/data',
    label: 'Data Manager',
    title: 'Data Manager',
    description: 'Back up, export, import, and reset everything stored locally.',
    group: 'main',
    icon: Database,
    keywords: ['backup', 'export', 'import', 'reset', 'storage', 'restore'],
    inNav: true,
  },
  {
    path: '/settings',
    label: 'Settings',
    title: 'Settings',
    description: 'Keys, models, provider, persistence, and runtime options.',
    group: 'main',
    icon: Settings,
    keywords: ['api key', 'provider', 'model', 'preferences', 'config', 'runtime'],
    inNav: true,
  },
  {
    path: '/lineage',
    label: 'Lineage',
    title: 'Lineage',
    description: 'Walk inherited character relationships across generations.',
    group: 'characters',
    icon: GitBranch,
    keywords: ['family', 'tree', 'ancestry', 'relations', 'generations'],
    inNav: true,
  },
  {
    path: '/offspring',
    label: 'Offspring',
    title: 'Offspring',
    description: 'Blend two characters into a new one.',
    group: 'characters',
    icon: Baby,
    keywords: ['blend', 'breed', 'combine', 'child', 'merge'],
    inNav: true,
  },
  {
    path: '/worlds',
    label: 'Worlds',
    title: 'Worlds',
    description: 'Canon worlds, factions, places, and rules.',
    group: 'worlds',
    icon: Globe,
    keywords: ['setting', 'canon', 'factions', 'places', 'lore'],
    inNav: true,
  },
  {
    path: '/timelines',
    label: 'Timeline',
    title: 'Timeline',
    description: 'Order world events chronologically.',
    group: 'worlds',
    icon: GitBranch,
    keywords: ['chronology', 'events', 'history', 'order'],
    inNav: true,
  },
  {
    path: '/events',
    label: 'Events',
    title: 'Events',
    description: 'Individual canon events that hang off a world.',
    group: 'worlds',
    icon: Calendar,
    keywords: ['happening', 'canon', 'date', 'occurrence'],
    inNav: true,
  },
  {
    path: '/seed-generator',
    label: 'Seed Generator',
    title: 'Seed Generator',
    description: 'Produce concept material before committing to a draft.',
    group: 'tools',
    icon: Dice1,
    keywords: ['ideas', 'concepts', 'inspiration', 'brainstorm', 'prompts'],
    inNav: false,
  },
  {
    path: '/batch',
    label: 'Batch',
    title: 'Batch',
    description: 'Run many seeds in sequence without driving each one by hand.',
    group: 'tools',
    icon: Layers,
    keywords: ['queue', 'throughput', 'bulk', 'multiple', 'concurrency'],
    inNav: false,
  },
  {
    path: '/validation',
    label: 'Validation',
    title: 'Validation',
    description: 'Check a draft against its template contract.',
    group: 'tools',
    icon: ShieldCheck,
    keywords: ['check', 'lint', 'structure', 'contract', 'problems'],
    inNav: false,
  },
  {
    path: '/similarity',
    label: 'Similarity',
    title: 'Similarity',
    description: 'Find overlap between drafts that share a seed or template.',
    group: 'tools',
    icon: GitCompare,
    keywords: ['duplicates', 'overlap', 'redundancy', 'clones', 'compare', 'similar'],
    inNav: false,
  },
  {
    path: '/about',
    label: 'About',
    title: 'About',
    description: 'Project background, storage model, and credits.',
    group: 'system',
    icon: Info,
    keywords: ['info', 'credits', 'background'],
    inNav: false,
  },
  {
    path: '/help',
    label: 'Help Center',
    title: 'Help Center',
    description: 'Guides, concepts, troubleshooting, and guided tours.',
    group: 'system',
    icon: CircleHelp,
    keywords: ['docs', 'guide', 'tour', 'support', 'how to'],
    inNav: false,
  },
  {
    path: '/community',
    label: 'Community',
    title: 'Community',
    description: 'Where to find the project community and resources.',
    group: 'system',
    icon: Users,
    keywords: ['discord', 'social', 'resources'],
    inNav: false,
  },
  {
    path: '/whats-new',
    label: "What's New",
    title: "What's New",
    description: 'Release notes for the current version.',
    group: 'system',
    icon: Megaphone,
    keywords: ['changelog', 'releases', 'updates', 'notes'],
    inNav: false,
  },
  {
    path: '/license',
    label: 'License',
    title: 'License',
    description: 'Project licence terms.',
    group: 'system',
    icon: Scale,
    keywords: ['legal', 'terms of use', 'open source'],
    inNav: false,
  },
  {
    path: '/terms',
    label: 'Terms',
    title: 'Terms',
    description: 'Terms of service.',
    group: 'system',
    icon: FileText,
    keywords: ['legal', 'agreement', 'service'],
    inNav: false,
  },
  {
    path: '/privacy',
    label: 'Privacy',
    title: 'Privacy',
    description: 'What the app stores and where it goes.',
    group: 'system',
    icon: ShieldCheck,
    keywords: ['legal', 'data', 'storage', 'gdpr'],
    inNav: false,
  },
  {
    path: '/security',
    label: 'Security',
    title: 'Security',
    description: 'How keys and local data are handled.',
    group: 'system',
    icon: ShieldCheck,
    keywords: ['legal', 'keys', 'safety', 'report'],
    inNav: false,
  },
  {
    path: '/code-of-conduct',
    label: 'Code of Conduct',
    title: 'Code of Conduct',
    description: 'Community behaviour expectations.',
    group: 'system',
    icon: BookOpen,
    keywords: ['legal', 'community', 'behaviour'],
    inNav: false,
  },
];

/** Catalog order within a group is the sidebar order. */
export function navEntriesForGroup(group: RouteGroupId): RouteCatalogEntry[] {
  return routeCatalog.filter((entry) => entry.inNav && entry.group === group);
}

/** The always-visible sidebar list. */
export const primaryNavEntries: RouteCatalogEntry[] = navEntriesForGroup('main');

export interface NavSubmenuGroup {
  id: 'characters' | 'worlds';
  label: string;
  icon: RouteIcon;
  entries: RouteCatalogEntry[];
}

/** Collapsible sidebar sections, in render order. */
export const navSubmenuGroups: NavSubmenuGroup[] = [
  { id: 'characters', label: 'Characters', icon: Users, entries: navEntriesForGroup('characters') },
  { id: 'worlds', label: 'Worlds', icon: Globe, entries: navEntriesForGroup('worlds') },
];

const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;

function escapeSegment(segment: string): string {
  return segment.replace(REGEX_SPECIAL, '\\$&');
}

/**
 * Compile a router path into a matcher. Supports the three shapes `App.tsx`
 * actually uses: literal segments, `:param` segments, and a trailing `*`.
 */
function patternToRegExp(pattern: string): RegExp {
  const segments = pattern.split('/').filter((segment) => segment !== '');

  if (segments.length === 0) {
    return /^\/?$/;
  }

  const allowTail = segments[segments.length - 1] === '*';
  if (allowTail) {
    segments.pop();
  }

  const parts = segments.map((segment) => {
    if (segment === '*') {
      return '.*';
    }

    if (segment.startsWith(':')) {
      return '[^/]+';
    }

    return escapeSegment(segment);
  });

  const head = `/${parts.join('/')}`;
  const tail = allowTail ? '(?:/.*)?' : '';
  return new RegExp(`^${head}${tail}$`);
}

function stripTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.replace(/\/+$/, '') : path;
}

/** Whether `pathname` resolves to the given router path or one of its aliases. */
export function matchRoutePattern(pattern: string, pathname: string): boolean {
  return patternToRegExp(pattern).test(stripTrailingSlash(pathname));
}

/** Deeper patterns win, so `/drafts/:id/assets/.../regenerate` beats `/drafts/:id`. */
function patternDepth(pattern: string): number {
  return pattern.split('/').filter((segment) => segment !== '' && segment !== '*').length;
}

/**
 * The catalog entry a pathname resolves to, or `null` when nothing matches.
 *
 * This replaces `Layout`'s hand-ordered 31-entry prefix list, whose behaviour
 * depended on array order (`'/drafts/'` had to stay above `'/drafts'` or the
 * library lost its heading).
 */
export function findRouteEntry(pathname: string): RouteCatalogEntry | null {
  const matches = routeCatalog.filter((entry) =>
    [entry.path, ...(entry.aliases ?? [])].some((pattern) => matchRoutePattern(pattern, pathname)),
  );

  if (matches.length === 0) {
    return null;
  }

  return [...matches].sort((left, right) => patternDepth(right.path) - patternDepth(left.path))[0] ?? null;
}

/** App-frame heading fallback for a pathname, or `null` when unmapped. */
export function resolveRouteTitle(pathname: string): string | null {
  return findRouteEntry(pathname)?.title ?? null;
}

/** Sidebar active state: exact for Home, self-or-descendant for everything else. */
export function isNavPathActive(currentPath: string, navPath: string): boolean {
  if (navPath === '/') {
    return currentPath === '/';
  }

  return currentPath === navPath || currentPath.startsWith(`${navPath}/`);
}

export interface RouteSearchResult {
  entry: RouteCatalogEntry;
  score: number;
}

/** Ranked match strengths, highest first. Ties keep catalog order. */
const SCORE_LABEL_EXACT = 100;
const SCORE_LABEL_PREFIX = 80;
const SCORE_TITLE_PREFIX = 70;
const SCORE_KEYWORD_PREFIX = 60;
const SCORE_LABEL_CONTAINS = 50;
const SCORE_KEYWORD_CONTAINS = 40;
const SCORE_TITLE_CONTAINS = 30;
const SCORE_PATH_CONTAINS = 10;

function scoreEntry(entry: RouteCatalogEntry, needle: string): number {
  const label = entry.label.toLowerCase();
  const title = entry.title.toLowerCase();
  const keywords = entry.keywords.map((keyword) => keyword.toLowerCase());

  if (label === needle) return SCORE_LABEL_EXACT;
  if (label.startsWith(needle)) return SCORE_LABEL_PREFIX;
  if (title.startsWith(needle)) return SCORE_TITLE_PREFIX;
  if (keywords.some((keyword) => keyword.startsWith(needle))) return SCORE_KEYWORD_PREFIX;
  if (label.includes(needle)) return SCORE_LABEL_CONTAINS;
  if (keywords.some((keyword) => keyword.includes(needle))) return SCORE_KEYWORD_CONTAINS;
  if (title.includes(needle)) return SCORE_TITLE_CONTAINS;
  if (entry.path.toLowerCase().includes(needle)) return SCORE_PATH_CONTAINS;
  return 0;
}

export interface RouteSearchOptions {
  limit?: number;
  /** Parameterised routes (`/drafts/:id`) have no navigable target, so they are hidden by default. */
  includeParameterised?: boolean;
}

/**
 * Query the catalog for the quick-actions palette. An empty query returns the
 * first `limit` navigable routes so the palette opens with a useful default list.
 */
export function searchRouteCatalog(query: string, options: RouteSearchOptions = {}): RouteSearchResult[] {
  const { limit = 8, includeParameterised = false } = options;
  const needle = query.trim().toLowerCase();
  const candidates = includeParameterised ? routeCatalog : routeCatalog.filter((entry) => !entry.path.includes(':'));

  if (needle.length === 0) {
    return candidates.slice(0, limit).map((entry) => ({ entry, score: 0 }));
  }

  return candidates
    .map((entry) => ({ entry, score: scoreEntry(entry, needle) }))
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}

/**
 * Drift guard. `declaredRoutes` is the `<Route path>` list from `App.tsx`; the
 * catalog must describe exactly that set. Returns human-readable issues in the
 * same shape as `validateHelpRouteCoverage`, so callers can log them in DEV.
 */
export function validateRouteCatalog(
  entries: readonly RouteCatalogEntry[],
  declaredRoutes: readonly string[],
): string[] {
  const issues: string[] = [];
  const seenPaths = new Set<string>();
  const seenAliases = new Set<string>();

  for (const entry of entries) {
    if (seenPaths.has(entry.path)) {
      issues.push(`Duplicate route catalog path: ${entry.path}`);
    }
    seenPaths.add(entry.path);

    for (const alias of entry.aliases ?? []) {
      if (seenAliases.has(alias)) {
        issues.push(`Duplicate route catalog alias: ${alias}`);
      }
      seenAliases.add(alias);
    }

    if (entry.inNav && /[:*]/.test(entry.path)) {
      issues.push(`Sidebar entry points at a parameterised route: ${entry.path}`);
    }
  }

  // Two different destinations sharing one sidebar icon is how `/themes` and
  // `/tokenizer` both ended up rendering a palette. Scoped to the always-visible
  // list: `/lineage` and `/timelines` share a branch icon by design, and they sit
  // in separate collapsed submenus where the label carries the meaning.
  //
  // Reads the `entries` argument rather than the module-level catalog so the
  // check is driven by whatever the caller passed in.
  const primaryIcons = new Map<RouteIcon, string>();
  for (const entry of entries) {
    if (!entry.inNav || entry.group !== 'main') {
      continue;
    }

    const clash = primaryIcons.get(entry.icon);
    if (clash) {
      issues.push(`Sidebar entries share an icon: ${clash} and ${entry.path}`);
    } else {
      primaryIcons.set(entry.icon, entry.path);
    }
  }

  const declared = declaredRoutes.filter((route) => route !== '*');
  const catalogPatterns = new Set([...seenPaths, ...seenAliases]);

  for (const route of declared) {
    if (!catalogPatterns.has(route)) {
      issues.push(`App route has no catalog entry: ${route}`);
    }
  }

  for (const pattern of catalogPatterns) {
    if (!declared.includes(pattern)) {
      issues.push(`Catalog entry does not match any app route: ${pattern}`);
    }
  }

  return issues;
}
