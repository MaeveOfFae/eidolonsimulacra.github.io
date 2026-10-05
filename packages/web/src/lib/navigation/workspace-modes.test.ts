import {
  clearStoredWorkspaceMode,
  findWorkspaceMode,
  isModePrimaryPath,
  isWorkspaceModeId,
  orderByMode,
  orderEntriesForMode,
  readStoredWorkspaceMode,
  resolveActiveWorkspaceMode,
  WORKSPACE_MODES,
  WORKSPACE_MODE_STORAGE_KEY,
  workspaceModeForPath,
  writeStoredWorkspaceMode,
} from './workspace-modes';

const entries = [{ path: '/' }, { path: '/generate' }, { path: '/drafts' }, { path: '/batch' }, { path: '/settings' }];

describe('workspace mode definitions', () => {
  it('exposes the three modes from the roadmap bar', () => {
    expect(WORKSPACE_MODES.map((mode) => mode.id)).toEqual(['draft', 'review', 'bulk']);
  });

  it('gives every mode a default route and at least one promoted screen', () => {
    for (const mode of WORKSPACE_MODES) {
      expect(mode.primaryPaths.length).toBeGreaterThan(0);
      expect(mode.defaultRoute).toBe(mode.primaryPaths[0]);
    }
  });

  it('never lets two modes claim the same screen', () => {
    const claimed = WORKSPACE_MODES.flatMap((mode) => mode.primaryPaths);

    expect(new Set(claimed).size).toBe(claimed.length);
  });

  it('keeps every promoted path and default route literal', () => {
    for (const mode of WORKSPACE_MODES) {
      for (const path of [...mode.primaryPaths, mode.defaultRoute]) {
        expect(path).not.toMatch(/[:*]/);
      }
    }
  });

  it('recognises only known mode ids', () => {
    expect(isWorkspaceModeId('bulk')).toBe(true);
    expect(isWorkspaceModeId('archive')).toBe(false);
    expect(isWorkspaceModeId(null)).toBe(false);
    expect(isWorkspaceModeId(3)).toBe(false);
  });

  it('throws rather than returning undefined for an unknown mode', () => {
    expect(() => findWorkspaceMode('nope' as never)).toThrow(/Unknown workspace mode/);
  });
});

describe('mode detection', () => {
  it('reports the mode that owns a screen', () => {
    expect(workspaceModeForPath('/generate')).toBe('draft');
    expect(workspaceModeForPath('/seed-generator')).toBe('draft');
    expect(workspaceModeForPath('/drafts')).toBe('review');
    expect(workspaceModeForPath('/validation')).toBe('review');
    expect(workspaceModeForPath('/batch')).toBe('bulk');
    expect(workspaceModeForPath('/compare')).toBe('bulk');
  });

  it('follows a promoted screen into its detail routes', () => {
    expect(workspaceModeForPath('/drafts/abc')).toBe('review');
  });

  it('reports nothing for screens no mode owns', () => {
    expect(workspaceModeForPath('/')).toBeNull();
    expect(workspaceModeForPath('/themes')).toBeNull();
    expect(workspaceModeForPath('/settings')).toBeNull();
  });

  it('does not match a path that merely shares a prefix string', () => {
    expect(workspaceModeForPath('/drafts-archive')).toBeNull();
  });

  it('lets an explicit choice win over the current screen', () => {
    expect(resolveActiveWorkspaceMode('bulk', '/generate')).toBe('bulk');
    expect(resolveActiveWorkspaceMode(null, '/generate')).toBe('draft');
    expect(resolveActiveWorkspaceMode(null, '/themes')).toBeNull();
  });

  it('exposes promoted-screen membership', () => {
    expect(isModePrimaryPath('review', '/drafts')).toBe(true);
    expect(isModePrimaryPath('review', '/generate')).toBe(false);
  });
});

describe('mode ordering', () => {
  it('promotes the mode screens in mode order, keeping the rest stable', () => {
    expect(orderEntriesForMode(entries, 'bulk').map((entry) => entry.path)).toEqual([
      '/batch',
      '/',
      '/generate',
      '/drafts',
      '/settings',
    ]);
  });

  it('leaves the list alone with no mode', () => {
    expect(orderEntriesForMode(entries, null).map((entry) => entry.path)).toEqual(entries.map((e) => e.path));
  });

  it('does not mutate the input', () => {
    const original = [...entries];
    orderEntriesForMode(entries, 'draft');

    expect(entries).toEqual(original);
  });

  it('skips promoted paths that are not present', () => {
    const partial = [{ path: '/settings' }, { path: '/generate' }];

    expect(orderEntriesForMode(partial, 'review').map((entry) => entry.path)).toEqual(['/settings', '/generate']);
  });

  it('orders arbitrary items through an accessor', () => {
    const scored = [
      { entry: { path: '/settings' }, score: 10 },
      { entry: { path: '/batch' }, score: 1 },
    ];

    expect(orderByMode(scored, 'bulk', (item) => item.entry.path).map((item) => item.entry.path)).toEqual([
      '/batch',
      '/settings',
    ]);
  });
});

describe('mode persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a chosen mode', () => {
    writeStoredWorkspaceMode('review');

    expect(readStoredWorkspaceMode()).toBe('review');
    expect(localStorage.getItem(WORKSPACE_MODE_STORAGE_KEY)).toBe('review');
  });

  it('ignores a stored value that is not a known mode', () => {
    localStorage.setItem(WORKSPACE_MODE_STORAGE_KEY, 'archive');

    expect(readStoredWorkspaceMode()).toBeNull();
  });

  it('clears back to following the current screen', () => {
    writeStoredWorkspaceMode('bulk');
    clearStoredWorkspaceMode();

    expect(readStoredWorkspaceMode()).toBeNull();
  });
});
