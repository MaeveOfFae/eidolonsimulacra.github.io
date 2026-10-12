import { describe, expect, it } from 'vitest';
import type { DashboardState } from '@char-gen/shared';
import {
  DASHBOARD_PANELS,
  DEFAULT_DASHBOARD,
  findDashboardPanel,
  isDashboardDefault,
  normalizeDashboard,
  setPanelVisibility,
  swapPanels,
  visiblePanels,
} from './dashboard';

const ids = (state: DashboardState) => state.panels.map((panel) => panel.id);

const defaultVisibleOf = (id: string) => DASHBOARD_PANELS.find((panel) => panel.id === id)?.defaultVisible;

describe('dashboard registry', () => {
  it('names every panel once, with copy the customizer can render', () => {
    const registryIds = DASHBOARD_PANELS.map((panel) => panel.id);

    expect(new Set(registryIds).size).toBe(registryIds.length);
    DASHBOARD_PANELS.forEach((panel) => {
      expect({ id: panel.id, title: panel.title.trim().length > 0 }).toEqual({ id: panel.id, title: true });
      expect({ id: panel.id, description: panel.description.trim().length > 0 }).toEqual({
        id: panel.id,
        description: true,
      });
    });
  });

  it('starts every panel in its default state exactly once, in registry order', () => {
    expect(ids(DEFAULT_DASHBOARD)).toEqual(DASHBOARD_PANELS.map((panel) => panel.id));
    expect(DEFAULT_DASHBOARD.panels.some((panel) => panel.visible)).toBe(true);
  });

  it('looks panels up by id and answers null for anything else', () => {
    expect(findDashboardPanel('in-flight')?.title).toBe('In flight');
    expect(findDashboardPanel('not-a-panel')).toBeNull();
    // Inherited object keys must not resolve as panels.
    expect(findDashboardPanel('constructor')).toBeNull();
    expect(findDashboardPanel('__proto__')).toBeNull();
  });
});

describe('normalizeDashboard', () => {
  it('falls back to the default layout for anything that is not stored panels', () => {
    for (const stored of [undefined, null, 'nope', 42, {}, { panels: 'x' }, { panels: null }]) {
      const state = normalizeDashboard(stored);

      expect(ids(state)).toEqual(ids(DEFAULT_DASHBOARD));
      expect(isDashboardDefault(state)).toBe(true);
    }
  });

  it('gives back a fresh copy rather than the shared default', () => {
    const state = normalizeDashboard(undefined);
    state.panels[0].visible = false;

    expect(DEFAULT_DASHBOARD.panels[0].visible).toBe(true);
  });

  it('keeps the stored order and drops ids the registry does not know', () => {
    const state = normalizeDashboard({
      panels: [
        { id: 'supporting-tools', visible: true },
        { id: 'retired-panel', visible: true },
        { id: 'in-flight', visible: false },
      ],
    });

    // The two known ids keep their stored order, and the retired one is gone.
    expect(ids(state).slice(0, 2)).toEqual(['supporting-tools', 'in-flight']);
    expect(state.panels.find((panel) => panel.id === 'in-flight')?.visible).toBe(false);
    expect(ids(state)).not.toContain('retired-panel');
  });

  it('appends panels the stored order forgot, in registry order', () => {
    const state = normalizeDashboard({ panels: [{ id: 'next-steps', visible: true }] });
    const rest = DASHBOARD_PANELS.map((panel) => panel.id).filter((id) => id !== 'next-steps');

    expect(ids(state)).toEqual(['next-steps', ...rest]);
  });

  it('collapses duplicates to their first appearance, visibility included', () => {
    const state = normalizeDashboard({
      panels: [
        { id: 'guided-help', visible: false },
        { id: 'guided-help', visible: true },
      ],
    });

    expect(ids(state).filter((id) => id === 'guided-help')).toHaveLength(1);
    expect(state.panels.find((panel) => panel.id === 'guided-help')?.visible).toBe(false);
  });

  it('falls back to the panel default when visibility is not a boolean', () => {
    const state = normalizeDashboard({
      panels: [{ id: 'in-flight', visible: 'yes' }, { id: 'recent-drafts' }, { id: 'saved-searches', visible: null }],
    });
    const visibleOf = (id: string) => state.panels.find((panel) => panel.id === id)?.visible;

    expect(visibleOf('in-flight')).toBe(defaultVisibleOf('in-flight'));
    expect(visibleOf('recent-drafts')).toBe(defaultVisibleOf('recent-drafts'));
    expect(visibleOf('saved-searches')).toBe(defaultVisibleOf('saved-searches'));
  });

  it('ignores entries that are not objects, and extra fields on the ones that are', () => {
    const state = normalizeDashboard({ panels: [null, 7, 'in-flight', ...DASHBOARD_PANELS] });

    expect(ids(state)).toEqual(ids(DEFAULT_DASHBOARD));
  });
});

describe('dashboard layout operations', () => {
  it('swaps two panels without touching the state it was given', () => {
    const state = normalizeDashboard(undefined);
    const before = ids(state);
    const swapped = swapPanels(state, 'guided-help', 'next-steps');
    const after = ids(swapped);

    expect(after.indexOf('guided-help')).toBe(before.indexOf('next-steps'));
    expect(after.indexOf('next-steps')).toBe(before.indexOf('guided-help'));
    expect(ids(state)).toEqual(before);
  });

  it('leaves a hidden panel in its slot when two others are exchanged', () => {
    const withHidden = setPanelVisibility(normalizeDashboard(undefined), 'getting-started', false);
    const swapped = swapPanels(withHidden, 'in-flight', 'recent-drafts');

    // The two named panels moved; the hidden one did not, and is still hidden.
    expect(ids(swapped).indexOf('getting-started')).toBe(ids(withHidden).indexOf('getting-started'));
    expect(swapped.panels.find((panel) => panel.id === 'getting-started')?.visible).toBe(false);
    expect(
      visiblePanels(swapped)
        .map((panel) => panel.id)
        .slice(0, 2),
    ).toEqual(['recent-drafts', 'in-flight']);
  });

  it('does nothing when a panel cannot be found, or when both names are the same', () => {
    const state = normalizeDashboard(undefined);

    expect(swapPanels(state, 'not-a-panel', 'in-flight')).toBe(state);
    expect(swapPanels(state, 'in-flight', 'not-a-panel')).toBe(state);
    expect(swapPanels(state, 'in-flight', 'in-flight')).toBe(state);
  });

  it('shows and hides a panel without disturbing the order', () => {
    const state = normalizeDashboard(undefined);
    const hidden = setPanelVisibility(state, 'recent-drafts', false);

    expect(ids(hidden)).toEqual(ids(state));
    expect(hidden.panels.find((panel) => panel.id === 'recent-drafts')?.visible).toBe(false);
    expect(state.panels.find((panel) => panel.id === 'recent-drafts')?.visible).toBe(true);
    expect(setPanelVisibility(state, 'not-a-panel', false)).toBe(state);
  });

  it('reports the panels to render, in stored order', () => {
    const state = setPanelVisibility(normalizeDashboard(undefined), 'getting-started', false);
    const rendered = visiblePanels(state).map((panel) => panel.id);

    expect(rendered).not.toContain('getting-started');
    expect(rendered).toEqual(ids(state).filter((id) => id !== 'getting-started'));
  });

  it('recognizes a customized layout, and not one that normalizes back to default', () => {
    expect(isDashboardDefault(normalizeDashboard(undefined))).toBe(true);

    expect(isDashboardDefault(swapPanels(normalizeDashboard(undefined), 'recent-drafts', 'in-flight'))).toBe(false);
    expect(isDashboardDefault(setPanelVisibility(normalizeDashboard(undefined), 'saved-searches', false))).toBe(false);
    expect(isDashboardDefault(normalizeDashboard({ panels: [...DEFAULT_DASHBOARD.panels].reverse() }))).toBe(false);
    expect(isDashboardDefault(normalizeDashboard({ panels: [{ id: 'next-steps', visible: true }] }))).toBe(false);
  });
});
