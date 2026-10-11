import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  desktop: false,
  links: [] as Array<Record<string, unknown>>,
  locksByWorld: {} as Record<string, unknown[]>,
}));

vi.mock('../runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../runtime')>()),
  isSelfContainedDesktopRuntime: () => state.desktop,
}));

vi.mock('./lore-api.js', () => ({
  getWorldCharacterDraftLinks: vi.fn(async () => ({ links: state.links })),
  getCanonLocks: vi.fn(async (worldId: string) => ({ locks: state.locksByWorld[worldId] ?? [] })),
}));

import { resolveCanonLockConstraintLines } from './canon-lock-context';

function lock(targetKind: string, statement: string, targetLabel?: string) {
  return { id: `l-${statement}`, worldId: 'w', targetKind, targetLabel, statement, createdAt: '', updatedAt: '' };
}

describe('resolveCanonLockConstraintLines', () => {
  beforeEach(() => {
    state.desktop = false;
    state.links = [];
    state.locksByWorld = {};
  });

  it('returns no constraints outside the desktop runtime', async () => {
    state.links = [{ worldId: 'w1' }];
    state.locksByWorld = { w1: [lock('world', 'magic costs blood')] };

    await expect(resolveCanonLockConstraintLines(['d1'])).resolves.toEqual([]);
  });

  it('returns no constraints without drafts or world links', async () => {
    state.desktop = true;
    await expect(resolveCanonLockConstraintLines([])).resolves.toEqual([]);

    state.links = [];
    await expect(resolveCanonLockConstraintLines(['d1'])).resolves.toEqual([]);
  });

  it('collects and formats the locks of every world the drafts belong to', async () => {
    state.desktop = true;
    state.links = [{ worldId: 'w1' }, { worldId: 'w2' }, { worldId: 'w1' }];
    state.locksByWorld = {
      w1: [lock('world', 'magic costs blood')],
      w2: [lock('character', 'surname is Vale', 'Vesna')],
    };

    await expect(resolveCanonLockConstraintLines(['d1', 'd2'])).resolves.toEqual([
      'World: magic costs blood',
      'Vesna (character): surname is Vale',
    ]);
  });
});
