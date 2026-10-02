import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIError, api } from './api';

/**
 * Characterization tests for the world/timeline domain of `EidolonBrowserAPI`.
 *
 * In the browser this domain is intentionally inert: reads return empty lists
 * and every mutation answers 501 "desktop only". On the desktop runtime each
 * method delegates, argument-for-argument, to the local lore store — which is
 * what the second suite pins, by flipping the runtime flag and stubbing the
 * local functions with sentinels.
 */

const OVERRIDES = vi.hoisted(() => {
  const locals = [
    'getLocalWorlds',
    'getLocalWorldCharacterDraftLinks',
    'getLocalWorldRelationshipAuditIssues',
    'getLocalWorld',
    'createLocalWorld',
    'updateLocalWorld',
    'deleteLocalWorld',
    'addLocalWorldCharacter',
    'updateLocalWorldCharacter',
    'deleteLocalWorldCharacter',
    'addLocalWorldFaction',
    'updateLocalWorldFaction',
    'deleteLocalWorldFaction',
    'addLocalWorldLocation',
    'updateLocalWorldLocation',
    'deleteLocalWorldLocation',
    'addLocalWorldRelationship',
    'updateLocalWorldRelationship',
    'deleteLocalWorldRelationship',
    'getLocalTimeline',
    'createLocalTimeline',
    'updateLocalTimeline',
    'deleteLocalTimeline',
    'addLocalTimelineEvent',
    'updateLocalTimelineEvent',
    'deleteLocalTimelineEvent',
  ];

  return Object.fromEntries(locals.map((name) => [name, vi.fn(() => ({ sentinel: name }))]));
});

const runtimeState = vi.hoisted(() => ({ desktop: false }));

vi.mock('./runtime.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./runtime')>()),
  isSelfContainedDesktopRuntime: () => runtimeState.desktop,
}));

vi.mock('./storage/desktop-lore-db.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./storage/desktop-lore-db')>()),
  ...OVERRIDES,
}));

describe('browser api: world and timeline domain (browser guards)', () => {
  beforeEach(() => {
    runtimeState.desktop = false;
  });

  it('returns empty reads outside the desktop runtime', async () => {
    await expect(api.getWorlds()).resolves.toEqual({ worlds: [] });
    await expect(api.getWorldCharacterDraftLinks()).resolves.toEqual({ links: [] });
    await expect(api.getWorldRelationshipAuditIssues()).resolves.toEqual({ issues: [] });
  });

  it('rejects every world and timeline mutation with a 501 desktop-only error', async () => {
    const calls: Array<() => Promise<unknown>> = [
      () => api.getWorld('w1'),
      () => api.createWorld({ name: 'N' }),
      () => api.updateWorld('w1', {}),
      () => api.deleteWorld('w1'),
      () => api.addWorldCharacter('w1', { characterName: 'C' }),
      () => api.updateWorldCharacter('w1', 'c1', {}),
      () => api.deleteWorldCharacter('w1', 'c1'),
      () => api.addWorldFaction('w1', { name: 'F' } as never),
      () => api.updateWorldFaction('w1', 'f1', {}),
      () => api.deleteWorldFaction('w1', 'f1'),
      () => api.addWorldLocation('w1', { name: 'L' } as never),
      () => api.updateWorldLocation('w1', 'l1', {}),
      () => api.deleteWorldLocation('w1', 'l1'),
      () => api.addWorldRelationship('w1', { sourceCharacterId: 'a', targetCharacterId: 'b', label: 'ally' }),
      () => api.updateWorldRelationship('w1', 'r1', {}),
      () => api.deleteWorldRelationship('w1', 'r1'),
      () => api.getTimeline('t1'),
      () => api.createTimeline({ worldId: 'w1', name: 'T' }),
      () => api.updateTimeline('t1', {}),
      () => api.deleteTimeline('t1'),
      () => api.addTimelineEvent('t1', { title: 'E' }),
      () => api.updateTimelineEvent('t1', 'e1', {}),
      () => api.deleteTimelineEvent('t1', 'e1'),
    ];

    for (const call of calls) {
      await expect(call()).rejects.toMatchObject({ status: 501 });
    }
    await expect(api.createWorld({ name: 'N' })).rejects.toBeInstanceOf(APIError);
  });
});

describe('browser api: world and timeline domain (desktop delegation)', () => {
  const data = { any: 'payload' };

  beforeEach(() => {
    runtimeState.desktop = true;
    vi.clearAllMocks();
  });

  const cases: Array<{ label: string; invoke: () => Promise<unknown>; local: string; args: unknown[] }> = [
    {
      label: 'getWorlds',
      invoke: () => api.getWorlds({ search: 'q' }),
      local: 'getLocalWorlds',
      args: [{ search: 'q' }],
    },
    {
      label: 'getWorldCharacterDraftLinks',
      invoke: () => api.getWorldCharacterDraftLinks({ draftIds: ['d1'] }),
      local: 'getLocalWorldCharacterDraftLinks',
      args: [{ draftIds: ['d1'] }],
    },
    {
      label: 'getWorldRelationshipAuditIssues',
      invoke: () => api.getWorldRelationshipAuditIssues(),
      local: 'getLocalWorldRelationshipAuditIssues',
      args: [],
    },
    { label: 'getWorld', invoke: () => api.getWorld('w1'), local: 'getLocalWorld', args: ['w1'] },
    {
      label: 'createWorld',
      invoke: () => api.createWorld({ name: 'N' }),
      local: 'createLocalWorld',
      args: [{ name: 'N' }],
    },
    { label: 'updateWorld', invoke: () => api.updateWorld('w1', data), local: 'updateLocalWorld', args: ['w1', data] },
    { label: 'deleteWorld', invoke: () => api.deleteWorld('w1'), local: 'deleteLocalWorld', args: ['w1'] },
    {
      label: 'addWorldCharacter',
      invoke: () => api.addWorldCharacter('w1', { characterName: 'C' }),
      local: 'addLocalWorldCharacter',
      args: ['w1', { characterName: 'C' }],
    },
    {
      label: 'updateWorldCharacter',
      invoke: () => api.updateWorldCharacter('w1', 'c1', data),
      local: 'updateLocalWorldCharacter',
      args: ['w1', 'c1', data],
    },
    {
      label: 'deleteWorldCharacter',
      invoke: () => api.deleteWorldCharacter('w1', 'c1'),
      local: 'deleteLocalWorldCharacter',
      args: ['w1', 'c1'],
    },
    {
      label: 'addWorldFaction',
      invoke: () => api.addWorldFaction('w1', data as never),
      local: 'addLocalWorldFaction',
      args: ['w1', data],
    },
    {
      label: 'updateWorldFaction',
      invoke: () => api.updateWorldFaction('w1', 'f1', data),
      local: 'updateLocalWorldFaction',
      args: ['w1', 'f1', data],
    },
    {
      label: 'deleteWorldFaction',
      invoke: () => api.deleteWorldFaction('w1', 'f1'),
      local: 'deleteLocalWorldFaction',
      args: ['w1', 'f1'],
    },
    {
      label: 'addWorldLocation',
      invoke: () => api.addWorldLocation('w1', data as never),
      local: 'addLocalWorldLocation',
      args: ['w1', data],
    },
    {
      label: 'updateWorldLocation',
      invoke: () => api.updateWorldLocation('w1', 'l1', data),
      local: 'updateLocalWorldLocation',
      args: ['w1', 'l1', data],
    },
    {
      label: 'deleteWorldLocation',
      invoke: () => api.deleteWorldLocation('w1', 'l1'),
      local: 'deleteLocalWorldLocation',
      args: ['w1', 'l1'],
    },
    {
      label: 'addWorldRelationship',
      invoke: () => api.addWorldRelationship('w1', { sourceCharacterId: 'a', targetCharacterId: 'b', label: 'ally' }),
      local: 'addLocalWorldRelationship',
      args: ['w1', { sourceCharacterId: 'a', targetCharacterId: 'b', label: 'ally' }],
    },
    {
      label: 'updateWorldRelationship',
      invoke: () => api.updateWorldRelationship('w1', 'r1', data),
      local: 'updateLocalWorldRelationship',
      args: ['w1', 'r1', data],
    },
    {
      label: 'deleteWorldRelationship',
      invoke: () => api.deleteWorldRelationship('w1', 'r1'),
      local: 'deleteLocalWorldRelationship',
      args: ['w1', 'r1'],
    },
    { label: 'getTimeline', invoke: () => api.getTimeline('t1'), local: 'getLocalTimeline', args: ['t1'] },
    {
      label: 'createTimeline',
      invoke: () => api.createTimeline({ worldId: 'w1', name: 'T' }),
      local: 'createLocalTimeline',
      args: [{ worldId: 'w1', name: 'T' }],
    },
    {
      label: 'updateTimeline',
      invoke: () => api.updateTimeline('t1', data),
      local: 'updateLocalTimeline',
      args: ['t1', data],
    },
    { label: 'deleteTimeline', invoke: () => api.deleteTimeline('t1'), local: 'deleteLocalTimeline', args: ['t1'] },
    {
      label: 'addTimelineEvent',
      invoke: () => api.addTimelineEvent('t1', { title: 'E' }),
      local: 'addLocalTimelineEvent',
      args: ['t1', { title: 'E' }],
    },
    {
      label: 'updateTimelineEvent',
      invoke: () => api.updateTimelineEvent('t1', 'e1', data),
      local: 'updateLocalTimelineEvent',
      args: ['t1', 'e1', data],
    },
    {
      label: 'deleteTimelineEvent',
      invoke: () => api.deleteTimelineEvent('t1', 'e1'),
      local: 'deleteLocalTimelineEvent',
      args: ['t1', 'e1'],
    },
  ];

  it.each(cases)('$label delegates verbatim to $local', async ({ invoke, local, args }) => {
    await expect(invoke()).resolves.toEqual({ sentinel: local });
    const mock = OVERRIDES[local] as ReturnType<typeof vi.fn>;
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(...args);
  });
});
