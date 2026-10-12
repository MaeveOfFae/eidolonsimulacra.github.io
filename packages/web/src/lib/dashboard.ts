/**
 * The Home dashboard: which panels exist, their default order, and the operations the
 * customizer performs on that order.
 *
 * Home used to have a fixed shape — a two-column split with three panels in the first
 * column and two in the second — so "customize your home screen" had nowhere to live.
 * The layout is data now: a stored order and visibility per panel, normalized against
 * this registry on every read, because stored preferences outlive the code that wrote
 * them.
 *
 * The registry is authored (what exists, what it is called, how wide it is); the stored
 * state is only order and visibility. Width is a layout decision rather than a
 * preference, and keeping it out of the stored state is what makes it safe to change.
 */
import type { DashboardPanelPreference, DashboardState } from '@char-gen/shared';

export type DashboardPanelId =
  | 'in-flight'
  | 'getting-started'
  | 'recent-drafts'
  | 'saved-searches'
  | 'next-steps'
  | 'guided-help'
  | 'supporting-tools';

export interface DashboardPanelDefinition {
  id: DashboardPanelId;
  /** Heading the panel frame renders. */
  title: string;
  /** One line for the customizer, where the panel is a name rather than a presence. */
  description: string;
  /** `full` spans both columns on a wide screen. Authored, never stored. */
  width: 'half' | 'full';
  defaultVisible: boolean;
}

export const DASHBOARD_PANELS: readonly DashboardPanelDefinition[] = [
  {
    id: 'in-flight',
    title: 'In flight',
    description: 'Work parked mid-run, or finished and waiting for your decision.',
    width: 'full',
    defaultVisible: true,
  },
  {
    id: 'getting-started',
    title: 'Getting started',
    description: 'The first-run path, until you have finished it.',
    width: 'full',
    defaultVisible: true,
  },
  {
    id: 'recent-drafts',
    title: 'Continue working',
    description: 'The drafts you touched last.',
    width: 'half',
    defaultVisible: true,
  },
  {
    id: 'saved-searches',
    title: 'Saved searches',
    description: 'Library filters you kept, and how many drafts each one matches.',
    width: 'half',
    defaultVisible: true,
  },
  {
    id: 'next-steps',
    title: 'Next steps',
    description: 'One path from setup through review.',
    width: 'half',
    defaultVisible: true,
  },
  {
    id: 'guided-help',
    title: 'Guided help',
    description: 'Resume the tour you are in, or start the next one.',
    width: 'half',
    defaultVisible: true,
  },
  {
    id: 'supporting-tools',
    title: 'Supporting tools',
    description: 'The tools that matter less often, kept nearby.',
    width: 'half',
    defaultVisible: true,
  },
];

/**
 * A fresh default layout.
 *
 * A factory rather than the constant itself, because both the manager's default config
 * and its reset path hand this out: returning the shared object would let one caller's
 * toggle change every other caller's baseline.
 */
export function createDefaultDashboard(): DashboardState {
  return {
    panels: DASHBOARD_PANELS.map((panel) => ({ id: panel.id, visible: panel.defaultVisible })),
  };
}

export const DEFAULT_DASHBOARD: DashboardState = createDefaultDashboard();

const PANELS_BY_ID = new Map(DASHBOARD_PANELS.map((panel) => [panel.id, panel]));

export function findDashboardPanel(id: string): DashboardPanelDefinition | null {
  return PANELS_BY_ID.get(id as DashboardPanelId) ?? null;
}

/**
 * A stored dashboard, made safe to render.
 *
 * Stored preferences are older or newer than the code reading them, so this is the only
 * place that decides what "a valid dashboard" means. Unknown ids are dropped; duplicates
 * collapse to their first appearance; a missing or non-boolean `visible` falls back to
 * the panel's own default; and every registry panel the stored order forgot is appended
 * in registry order — so a panel added in a later release turns up for someone who
 * customized their home a year ago, instead of being silently absent.
 */
export function normalizeDashboard(stored: unknown): DashboardState {
  const rawPanels =
    stored && typeof stored === 'object' && Array.isArray((stored as DashboardState).panels)
      ? (stored as DashboardState).panels
      : null;

  if (!rawPanels) {
    return createDefaultDashboard();
  }

  const panels: DashboardPanelPreference[] = [];
  const seen = new Set<string>();

  for (const entry of rawPanels) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }

    const id = typeof entry.id === 'string' ? entry.id : '';
    const definition = findDashboardPanel(id);
    if (!definition || seen.has(id)) {
      continue;
    }

    seen.add(id);
    panels.push({ id, visible: typeof entry.visible === 'boolean' ? entry.visible : definition.defaultVisible });
  }

  for (const definition of DASHBOARD_PANELS) {
    if (!seen.has(definition.id)) {
      panels.push({ id: definition.id, visible: definition.defaultVisible });
    }
  }

  return { panels };
}

/**
 * Swaps the stored positions of two panels, leaving every other entry exactly where it is.
 *
 * The customizer's unit of change is one step up or down the page, but *which* panels are
 * on the page is a fact only the renderer knows: a panel can be visible by preference and
 * still absent from the screen because it has nothing to show — no run in flight, no saved
 * searches yet. So the caller names the two panels to exchange (the one being moved and
 * the neighbour it steps past) and this does exactly that, rather than a `move by delta`
 * that would silently swap with something the user cannot see.
 */
export function swapPanels(state: DashboardState, firstId: string, secondId: string): DashboardState {
  const first = state.panels.findIndex((panel) => panel.id === firstId);
  const second = state.panels.findIndex((panel) => panel.id === secondId);

  if (first === -1 || second === -1 || first === second) {
    return state;
  }

  const panels = state.panels.map((panel) => ({ ...panel }));
  const held = panels[first];
  panels[first] = panels[second];
  panels[second] = held;

  return { panels };
}

export function setPanelVisibility(state: DashboardState, id: string, visible: boolean): DashboardState {
  if (!state.panels.some((panel) => panel.id === id)) {
    return state;
  }

  return {
    panels: state.panels.map((panel) => (panel.id === id ? { ...panel, visible } : { ...panel })),
  };
}

/** The panels to render, in stored order. */
export function visiblePanels(state: DashboardState): DashboardPanelPreference[] {
  return state.panels.filter((panel) => panel.visible);
}

/**
 * Whether the layout still matches a fresh profile.
 *
 * Drives the customizer's Reset affordance: offering to reset something that was never
 * changed is noise, and hiding the offer when it *was* changed is a dead end.
 */
export function isDashboardDefault(state: DashboardState): boolean {
  if (state.panels.length !== DEFAULT_DASHBOARD.panels.length) {
    return false;
  }

  return state.panels.every((panel, index) => {
    const expected = DEFAULT_DASHBOARD.panels[index];
    return expected.id === panel.id && expected.visible === panel.visible;
  });
}
