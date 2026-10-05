import type { RouteCatalogEntry } from './route-catalog';
import {
  findRouteEntry,
  isNavPathActive,
  matchRoutePattern,
  navSubmenuGroups,
  primaryNavEntries,
  resolveRouteTitle,
  routeCatalog,
  searchRouteCatalog,
  validateRouteCatalog,
} from './route-catalog';
import appSource from '../../App.tsx?raw';

/**
 * The router itself is the thing the catalog must not drift from, so the guard
 * parses `App.tsx` rather than trusting a second hand-maintained list. A new
 * `<Route>` fails `matches the router` until it is described in the catalog.
 *
 * `?raw` rather than `node:fs`: the web suite runs under happy-dom, where
 * `import.meta.url` is an http URL and `fileURLToPath` throws.
 */
const declaredRoutes = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);

const pathsOf = (entries: readonly RouteCatalogEntry[]) => entries.map((entry) => entry.path);

describe('route catalog', () => {
  it('parsed a real route table out of App.tsx', () => {
    expect(declaredRoutes.length).toBe(36);
    expect(declaredRoutes).toContain('/drafts/:id/assets/:assetName/regenerate');
    expect(declaredRoutes).toContain('*');
  });

  it('matches the router', () => {
    expect(validateRouteCatalog(routeCatalog, declaredRoutes)).toEqual([]);
  });

  it('fails the drift guard when a route is added without a catalog entry', () => {
    const issues = validateRouteCatalog(routeCatalog, [...declaredRoutes, '/brand-new-screen']);

    expect(issues).toEqual(['App route has no catalog entry: /brand-new-screen']);
  });

  it('fails the drift guard when a catalog entry outlives its route', () => {
    const issues = validateRouteCatalog(
      routeCatalog,
      declaredRoutes.filter((route) => route !== '/data'),
    );

    expect(issues).toEqual(['Catalog entry does not match any app route: /data']);
  });

  it('fails the drift guard when two sidebar entries share an icon', () => {
    const clashing = routeCatalog.map((entry) =>
      entry.path === '/tokenizer' ? { ...entry, icon: routeCatalog[0].icon } : entry,
    );

    expect(validateRouteCatalog(clashing, declaredRoutes)).toEqual(['Sidebar entries share an icon: / and /tokenizer']);
  });
});

describe('route matching', () => {
  it('matches literal, parameterised, and trailing-wildcard patterns', () => {
    expect(matchRoutePattern('/', '/')).toBe(true);
    expect(matchRoutePattern('/', '/generate')).toBe(false);
    expect(matchRoutePattern('/drafts/:id', '/drafts/abc')).toBe(true);
    expect(matchRoutePattern('/blueprints/edit/*', '/blueprints/edit')).toBe(true);
    expect(matchRoutePattern('/blueprints/edit/*', '/blueprints/edit/a/b')).toBe(true);
  });

  it('does not let a shallow list route swallow a deeper detail route', () => {
    expect(matchRoutePattern('/drafts', '/drafts/abc')).toBe(false);
    expect(matchRoutePattern('/drafts/:id', '/drafts/abc/assets/system_prompt/regenerate')).toBe(false);
  });

  it('resolves the trailing-slash library alias to the same entry', () => {
    expect(findRouteEntry('/drafts')?.path).toBe('/drafts');
    expect(findRouteEntry('/drafts/')?.path).toBe('/drafts');
  });

  it('prefers the deepest match for nested detail routes', () => {
    expect(findRouteEntry('/drafts/abc')?.path).toBe('/drafts/:id');
    expect(findRouteEntry('/drafts/abc/assets/system_prompt/regenerate')?.path).toBe(
      '/drafts/:id/assets/:assetName/regenerate',
    );
  });

  it('returns null for an unknown path', () => {
    expect(findRouteEntry('/nowhere')).toBeNull();
    expect(resolveRouteTitle('/nowhere')).toBeNull();
  });

  it('keeps the workspace headings the previous hand-ordered map produced', () => {
    const expected: Array<[string, string]> = [
      ['/', 'Home'],
      ['/generate', 'Generate'],
      ['/optimize', 'Token Optimization'],
      ['/batch', 'Batch'],
      ['/seed-generator', 'Seed Generator'],
      ['/drafts', 'Library'],
      ['/drafts/', 'Library'],
      ['/drafts/abc', 'Draft Review'],
      ['/drafts/abc/assets/system_prompt/regenerate', 'Draft Review'],
      ['/blueprints/edit/foo/bar', 'Blueprint Editor'],
      ['/templates', 'Templates'],
      ['/themes', 'Themes'],
      ['/tokenizer', 'Tokenizer'],
      ['/timelines', 'Timeline'],
      ['/data', 'Data Manager'],
      ['/whats-new', "What's New"],
      ['/code-of-conduct', 'Code of Conduct'],
    ];

    for (const [pathname, title] of expected) {
      expect(resolveRouteTitle(pathname)).toBe(title);
    }
  });
});

describe('sidebar structure', () => {
  it('keeps the primary list in its established order, with Data Manager added', () => {
    expect(primaryNavEntries.map((entry) => entry.label)).toEqual([
      'Home',
      'Generate',
      'Compare',
      'Library',
      'Templates',
      'Optimize',
      'Blueprints',
      'Themes',
      'Tokenizer',
      'Insights',
      'Download',
      'Data Manager',
      'Settings',
    ]);
  });

  it('exposes the Characters and Worlds submenus', () => {
    expect(navSubmenuGroups.map((group) => group.label)).toEqual(['Characters', 'Worlds']);
    expect(navSubmenuGroups.map((group) => pathsOf(group.entries))).toEqual([
      ['/lineage', '/offspring'],
      ['/worlds', '/timelines', '/events'],
    ]);
  });

  it('only puts navigable routes in the sidebar', () => {
    for (const entry of [...primaryNavEntries, ...navSubmenuGroups.flatMap((group) => group.entries)]) {
      expect(entry.path).not.toMatch(/[:*]/);
      expect(entry.label.length).toBeGreaterThan(0);
    }
  });

  it('marks a nav entry active for its own path and its descendants only', () => {
    expect(isNavPathActive('/', '/')).toBe(true);
    expect(isNavPathActive('/generate', '/')).toBe(false);
    expect(isNavPathActive('/drafts', '/drafts')).toBe(true);
    expect(isNavPathActive('/drafts/abc', '/drafts')).toBe(true);
    expect(isNavPathActive('/drafts-archive', '/drafts')).toBe(false);
  });
});

describe('quick-actions search', () => {
  it('ranks a label prefix above a keyword hit', () => {
    expect(searchRouteCatalog('lib')[0]?.entry.path).toBe('/drafts');
  });

  it('finds routes by synonym', () => {
    expect(searchRouteCatalog('backup')[0]?.entry.path).toBe('/data');
    expect(searchRouteCatalog('api key')[0]?.entry.path).toBe('/settings');
    expect(searchRouteCatalog('duplicates')[0]?.entry.path).toBe('/similarity');
  });

  it('keeps Compare and Similarity distinguishable', () => {
    const results = searchRouteCatalog('compare');

    expect(results[0]?.entry.path).toBe('/compare');
    expect(results.map((result) => result.entry.path)).toContain('/similarity');
    expect(searchRouteCatalog('similarity')[0]?.entry.path).toBe('/similarity');
  });

  it('hides parameterised routes unless asked for them', () => {
    expect(searchRouteCatalog('review').every((result) => !result.entry.path.includes(':'))).toBe(true);
    expect(searchRouteCatalog('review', { includeParameterised: true }).map((r) => r.entry.path)).toContain(
      '/drafts/:id',
    );
  });

  it('also hides wildcard routes, which have no literal target', () => {
    // `/blueprints/edit/*` has no `:`, so a `:`-only filter let the palette offer
    // it and navigate to a literal `*` path.
    expect(searchRouteCatalog('', { limit: 40 }).map((result) => result.entry.path)).not.toContain(
      '/blueprints/edit/*',
    );
    expect(searchRouteCatalog('blueprint editor', { limit: 40 }).map((r) => r.entry.path)).not.toContain(
      '/blueprints/edit/*',
    );
    expect(searchRouteCatalog('blueprint editor', { includeParameterised: true }).map((r) => r.entry.path)).toContain(
      '/blueprints/edit/*',
    );
  });

  it('opens with a bounded default list', () => {
    const results = searchRouteCatalog('   ', { limit: 5 });

    expect(results).toHaveLength(5);
    expect(results.every((result) => result.score === 0)).toBe(true);
  });

  it('returns nothing for a query that matches no route', () => {
    expect(searchRouteCatalog('zzzzz')).toEqual([]);
  });
});

describe('mode-aware search', () => {
  it('promotes the active mode screens into the default list', () => {
    expect(searchRouteCatalog('', { modeId: 'bulk', limit: 4 }).map((result) => result.entry.path)).toEqual([
      '/batch',
      '/compare',
      '/insights',
      '/',
    ]);
  });

  it('promotes a screen that would otherwise fall outside the default list', () => {
    expect(searchRouteCatalog('', { limit: 8 }).map((result) => result.entry.path)).not.toContain('/batch');
    expect(searchRouteCatalog('', { modeId: 'bulk', limit: 8 }).map((result) => result.entry.path)).toContain('/batch');
  });

  it('still requires a promoted screen to match the query', () => {
    // The bonus must never rescue a non-match, or Bulk mode would list Batch for
    // every search.
    expect(searchRouteCatalog('zzzzz', { modeId: 'bulk' })).toEqual([]);
  });

  it('leaves results identical when no mode is set', () => {
    expect(searchRouteCatalog('backup', { modeId: null })).toEqual(searchRouteCatalog('backup'));
  });
});

describe('mode drift guard', () => {
  const modes = [
    {
      id: 'draft' as const,
      label: 'Draft',
      description: '',
      icon: routeCatalog[0].icon,
      defaultRoute: '/generate',
      primaryPaths: ['/generate'],
    },
  ];

  it('accepts the real mode configuration', () => {
    expect(validateRouteCatalog(routeCatalog, declaredRoutes)).toEqual([]);
  });

  it('reports a mode that promotes a path with no catalog entry', () => {
    const issues = validateRouteCatalog(routeCatalog, declaredRoutes, [
      { ...modes[0], primaryPaths: ['/generate', '/ghost'] },
    ]);

    expect(issues).toEqual(['Workspace mode draft promotes a path with no catalog entry: /ghost']);
  });

  it('reports two modes claiming the same screen', () => {
    const issues = validateRouteCatalog(routeCatalog, declaredRoutes, [
      modes[0],
      { ...modes[0], id: 'review', label: 'Review', primaryPaths: ['/generate'] },
    ]);

    expect(issues).toEqual(['Workspace modes draft and review both promote: /generate']);
  });

  it('reports a promoted parameterised path and a bad default route', () => {
    const issues = validateRouteCatalog(routeCatalog, declaredRoutes, [
      { ...modes[0], primaryPaths: ['/drafts/:id'], defaultRoute: '/ghost' },
    ]);

    expect(issues).toEqual([
      'Workspace mode draft promotes a parameterised path: /drafts/:id',
      'Workspace mode draft has a default route with no catalog entry: /ghost',
    ]);
  });
});
