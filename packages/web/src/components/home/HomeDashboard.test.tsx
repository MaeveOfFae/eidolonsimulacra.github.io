import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import HomeDashboard from './HomeDashboard';
import { configManager } from '@/lib/config/manager';
import { normalizeDashboard, setPanelVisibility, type DashboardPanelId } from '@/lib/dashboard';

const ALL_PANELS: DashboardPanelId[] = ['in-flight', 'recent-drafts', 'next-steps', 'guided-help'];

/** The test owns the panel content, so it can assert on the order they land in. */
function panelsFor(ids: DashboardPanelId[] = ALL_PANELS): Partial<Record<DashboardPanelId, ReactNode>> {
  const entries = ids.map(
    (id) =>
      [
        id,
        <p key={id} data-testid={`panel-${id}`}>
          {id}
        </p>,
      ] as const,
  );

  return Object.fromEntries(entries) as Partial<Record<DashboardPanelId, ReactNode>>;
}

function renderedOrder(container: HTMLElement): DashboardPanelId[] {
  return Array.from(container.querySelectorAll('[data-testid^="panel-"]')).map(
    (element) => (element.getAttribute('data-testid') ?? '').replace('panel-', '') as DashboardPanelId,
  );
}

function renderDashboard(panels: Partial<Record<DashboardPanelId, ReactNode>> = panelsFor()) {
  return render(<HomeDashboard panels={panels} />);
}

function customize() {
  fireEvent.click(screen.getByRole('button', { name: 'Customize' }));
}

describe('HomeDashboard', () => {
  beforeEach(() => {
    localStorage.clear();
    // `configManager` is a module-level singleton: clearing storage does not reset the
    // config it already holds, so a layout left behind by the previous test would leak
    // into this one.
    configManager.resetConfig();
  });

  it('renders the panels it is given, in the stored order', () => {
    const { container } = renderDashboard();

    expect(renderedOrder(container)).toEqual(['in-flight', 'recent-drafts', 'next-steps', 'guided-help']);
  });

  it('leaves out a panel with nothing to show, and leaves no gap behind', () => {
    const { container } = renderDashboard(panelsFor(['in-flight', 'next-steps']));

    expect(renderedOrder(container)).toEqual(['in-flight', 'next-steps']);
    // A skipped panel is not an empty card, and not the empty-dashboard notice either.
    expect(screen.queryByText('There is nothing on the dashboard right now.')).toBeNull();
  });

  it('shows the layout controls only while customizing', () => {
    renderDashboard();

    expect(screen.queryByRole('button', { name: 'Hide Next steps' })).toBeNull();

    customize();
    expect(screen.getByRole('button', { name: 'Hide Next steps' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move Next steps up' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('button', { name: 'Hide Next steps' })).toBeNull();
  });

  it('moves a panel past its neighbour, and remembers the new order', () => {
    const { container } = renderDashboard();
    customize();

    fireEvent.click(screen.getByRole('button', { name: 'Move Next steps up' }));

    expect(renderedOrder(container)).toEqual(['in-flight', 'next-steps', 'recent-drafts', 'guided-help']);

    const stored = configManager.getDashboard().panels.map((panel) => panel.id);
    expect(stored.indexOf('next-steps')).toBeLessThan(stored.indexOf('recent-drafts'));
  });

  it('steps over a panel that is not on screen rather than swapping with it', () => {
    // `getting-started` and `saved-searches` sit between these two in the default order but
    // have no content in this render, so the step has to reach past them.
    const { container } = renderDashboard();
    customize();

    fireEvent.click(screen.getByRole('button', { name: 'Move Continue working down' }));

    expect(renderedOrder(container)).toEqual(['in-flight', 'next-steps', 'recent-drafts', 'guided-help']);
  });

  it('disables the arrows at the ends of the page', () => {
    renderDashboard();
    customize();

    expect(screen.getByRole('button', { name: 'Move In flight up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Guided help down' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move In flight down' })).toBeEnabled();
  });

  it('hides a panel and offers it back', () => {
    const { container } = renderDashboard();
    customize();

    fireEvent.click(screen.getByRole('button', { name: 'Hide Next steps' }));

    expect(renderedOrder(container)).not.toContain('next-steps');
    expect(screen.getByRole('button', { name: 'Show Next steps' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show Next steps' }));

    expect(renderedOrder(container)).toContain('next-steps');
    expect(screen.queryByRole('button', { name: 'Show Next steps' })).toBeNull();
  });

  it('offers a reset only once the layout differs from the default', () => {
    const { container } = renderDashboard();
    expect(screen.queryByRole('button', { name: 'Reset layout' })).toBeNull();

    customize();
    fireEvent.click(screen.getByRole('button', { name: 'Move Guided help up' }));
    expect(screen.getByRole('button', { name: 'Reset layout' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset layout' }));

    expect(renderedOrder(container)).toEqual(['in-flight', 'recent-drafts', 'next-steps', 'guided-help']);
    expect(screen.queryByRole('button', { name: 'Reset layout' })).toBeNull();
  });

  it('honours a layout stored before the screen mounted', () => {
    configManager.updateDashboard(setPanelVisibility(normalizeDashboard(undefined), 'guided-help', false));

    const { container } = renderDashboard();

    expect(renderedOrder(container)).toEqual(['in-flight', 'recent-drafts', 'next-steps']);
  });

  it('says so plainly when there is nothing to show at all', () => {
    const { container } = renderDashboard({});

    expect(renderedOrder(container)).toEqual([]);
    expect(screen.getByText('There is nothing on the dashboard right now.')).toBeInTheDocument();
  });
});
