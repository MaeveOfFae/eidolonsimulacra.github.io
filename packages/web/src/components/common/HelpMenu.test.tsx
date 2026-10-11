import { act, useState } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import HelpMenu from './HelpMenu';
import type { PageHelpEntry } from '@/lib/help';

const mockUseGuidedTour = vi.fn();

vi.mock('./GuidedTourContext', () => ({
  useGuidedTour: () => mockUseGuidedTour(),
}));

const entry: PageHelpEntry = {
  id: 'generate',
  match: '/generate',
  matchMode: 'exact',
  title: 'Generate help',
  summary: 'Generation is where you choose the template and the seed.',
  keyActions: ['Choose the template before refining the seed.'],
  pitfalls: ['Do not skip provider setup.'],
  actions: [{ label: 'Open Settings', to: '/settings' }],
  relatedTopicIds: [],
};

const tours = [
  { id: 'getting-started', title: 'Getting Started Tour', estimatedMinutes: 6, steps: [{}, {}] },
  { id: 'review-and-export', title: 'Review and Export Tour', estimatedMinutes: 4, steps: [{}] },
];

/** Lets a test change the route without a pointer event, to exercise the route rule. */
let navigateForTest: ReturnType<typeof useNavigate> | null = null;

function CaptureNavigation() {
  navigateForTest = useNavigate();
  return null;
}

function renderMenu(options: { entry?: PageHelpEntry | null; onOpenPageHelp?: () => void } = {}) {
  const onOpenPageHelp = options.onOpenPageHelp ?? vi.fn();

  // The caller owns the open state (the `?` shortcut opens it from outside), so the
  // harness is the smallest thing that plays that part.
  function Harness() {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <HelpMenu
        entry={options.entry === undefined ? entry : options.entry}
        onOpenPageHelp={onOpenPageHelp}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    );
  }

  const result = render(
    <MemoryRouter initialEntries={['/generate']}>
      <CaptureNavigation />
      <Harness />
    </MemoryRouter>,
  );

  return { ...result, onOpenPageHelp };
}

function openMenu() {
  const trigger = screen.getByRole('button', { name: 'Help' });
  fireEvent.click(trigger);
  return trigger;
}

describe('HelpMenu', () => {
  beforeEach(() => {
    mockUseGuidedTour.mockReset();
    mockUseGuidedTour.mockReturnValue({
      tours,
      isTourCompleted: (tourId: string) => tourId === 'review-and-export',
      startTour: vi.fn(),
      restartTour: vi.fn(),
    });
    navigateForTest = null;
  });

  it('stays closed until the trigger is used, and reports its state', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Help' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).toBeNull();

    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('dialog', { name: 'Help' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('dialog').id);
  });

  it('opens the contextual help drawer for the current page and closes itself', () => {
    const onOpenPageHelp = vi.fn();
    renderMenu({ onOpenPageHelp });
    openMenu();

    expect(screen.getByText('Generation is where you choose the template and the seed.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Help for this page/ }));

    expect(onOpenPageHelp).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('says so plainly when the route has no page help, instead of offering a dead action', () => {
    renderMenu({ entry: null });
    openMenu();

    expect(screen.queryByRole('button', { name: /Help for this page/ })).toBeNull();
    expect(screen.getByText(/This screen has no page-level help yet/)).toBeInTheDocument();
  });

  it('lists every tour with its length and a correctly labelled action', () => {
    renderMenu();
    openMenu();

    expect(screen.getByText('Getting Started Tour')).toBeInTheDocument();
    expect(screen.getByText('6 min · 2 steps')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Getting Started Tour' })).toBeInTheDocument();
    // A completed tour offers the other action, which is the rule the Help Center uses.
    expect(screen.getByRole('button', { name: 'Restart Review and Export Tour' })).toBeInTheDocument();
    expect(screen.getByText('1/2 complete')).toBeInTheDocument();
  });

  it('runs the tour the user picked and closes', () => {
    const startTour = vi.fn();
    const restartTour = vi.fn();
    mockUseGuidedTour.mockReturnValue({
      tours,
      isTourCompleted: (tourId: string) => tourId === 'review-and-export',
      startTour,
      restartTour,
    });

    renderMenu();
    openMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Restart Review and Export Tour' }));

    expect(restartTour).toHaveBeenCalledWith('review-and-export');
    expect(startTour).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('links to the Help Center, the release notes and About', () => {
    renderMenu();
    openMenu();

    expect(screen.getByRole('link', { name: /Help Center/ })).toHaveAttribute('href', '/help');
    expect(screen.getByRole('link', { name: /new/ })).toHaveAttribute('href', '/whats-new');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('closes on Escape and puts focus back on the trigger', () => {
    renderMenu();
    const trigger = openMenu();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on a press outside, and not on one inside', () => {
    renderMenu();
    openMenu();

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes when the route changes, so it cannot cover the screen it opened', () => {
    renderMenu();
    openMenu();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => {
      navigateForTest?.('/about');
    });

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
