import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

// `vi.mock` factories are hoisted, so shared mutable state has to be created
// with `vi.hoisted` to stay initialized before the mocked modules load.
const { helpStateMock } = vi.hoisted(() => ({
  helpStateMock: {
    first_run_completed: false,
    show_inline_tips: true,
    completed_guides: [] as string[],
    dismissed_tips: [] as string[],
    completed_tours: [] as string[],
  },
}));

vi.mock('./common/GuidedTourContext', () => ({
  useGuidedTour: () => ({
    activeStepIndex: 0,
    activeTourId: null,
    goToCurrentStep: vi.fn(),
    helpState: helpStateMock,
    isTourCompleted: () => false,
    restartTour: vi.fn(),
    startTour: vi.fn(),
  }),
}));

vi.mock('./common/useAssistantContext', () => ({
  useAssistantContext: () => ({
    setScreenContext: vi.fn(),
    clearScreenContext: vi.fn(),
  }),
  useAssistantScreenContext: () => undefined,
}));

vi.mock('@/lib/api', () => ({
  api: {
    getDrafts: vi.fn(async () => ({
      drafts: [],
      stats: { total_drafts: 0, favorites: 0 },
      filters: {},
    })),
    listTemplates: vi.fn(async () => []),
  },
}));

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Home getting started guide', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    helpStateMock.first_run_completed = false;
    helpStateMock.completed_guides = [];
  });

  it('renders the getting started guide for a first-run user', async () => {
    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Follow this first-run path')).toBeInTheDocument();
    });
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('hides the getting started guide once the first run is complete', async () => {
    helpStateMock.first_run_completed = true;

    renderHome();

    await waitFor(() => {
      expect(screen.getByText('Return to the next useful task.')).toBeInTheDocument();
    });
    expect(screen.queryByText('Follow this first-run path')).not.toBeInTheDocument();
  });
});

describe('Home supporting tools', () => {
  const openSupportingTools = async () => {
    renderHome();
    // The section is collapsed by default, and collapsed sections do not render
    // their children, so the links only exist after the toggle is clicked.
    fireEvent.click(await screen.findByRole('button', { name: /Supporting tools/i }));
  };

  it('links each supporting tool to its route', async () => {
    await openSupportingTools();

    const expected: Array<[string, string]> = [
      ['Seed Generator', '/seed-generator'],
      ['Validation', '/validation'],
      ['Token Optimization', '/optimize'],
      ['Batch', '/batch'],
      ['Similarity', '/similarity'],
    ];

    for (const [label, href] of expected) {
      expect(screen.getByRole('link', { name: new RegExp(`^${label}\\b`) })).toHaveAttribute('href', href);
    }
  });

  it('calls the draft-overlap tool Similarity, not Compare', async () => {
    await openSupportingTools();

    expect(screen.getByRole('link', { name: /^Similarity\b/ })).toHaveAttribute('href', '/similarity');
    // `/compare` is the multi-model comparison screen; only one thing may be
    // called Compare, and it is not this tile.
    expect(screen.queryByRole('link', { name: /^Compare\b/ })).not.toBeInTheDocument();
  });
});
