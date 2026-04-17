import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Review from './Review';
import { getGuidedTour, REVIEW_EXPORT_TOUR_ID } from '@/lib/help';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseQueryClient = vi.fn();
const mockUseGuidedTour = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => mockUseQuery(options),
  useMutation: (options: unknown) => mockUseMutation(options),
  useQueryClient: () => mockUseQueryClient(),
}));

vi.mock('../common/ExportModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="export-modal">
      <span>Export Modal</span>
      <button type="button" onClick={onClose}>Close Export Modal</button>
    </div>
  ),
}));

vi.mock('../common/ChatPanel', () => ({
  default: () => null,
}));

vi.mock('./ReviewChecklistPanel', () => ({
  default: () => null,
}));

vi.mock('./VersionHistoryPanel', () => ({
  default: () => null,
}));

vi.mock('../common/InlineHelpTip', () => ({
  default: () => null,
}));

vi.mock('../common/useAssistantContext', () => ({
  useAssistantScreenContext: () => undefined,
}));

vi.mock('../common/GuidedTourContext', () => ({
  useGuidedTour: () => mockUseGuidedTour(),
}));

const draftResponse = {
  metadata: {
    seed: 'test-seed',
    favorite: false,
    mode: 'NSFW',
    template_name: 'V2/V3 Card',
    tags: [],
    parent_drafts: [],
  },
  assets: {
    system_prompt: 'hello',
  },
};

const templatesResponse = [
  {
    name: 'V2/V3 Card',
    assets: [
      { name: 'system_prompt', required: true, depends_on: [], description: 'System instructions' },
      { name: 'post_history', required: true, depends_on: ['system_prompt'], description: 'Relationship context' },
    ],
  },
];

function createMutationResult() {
  return {
    mutate: vi.fn(),
    isPending: false,
  };
}

function renderReview() {
  return render(
    <MemoryRouter initialEntries={['/drafts/review-1']}>
      <Routes>
        <Route path="/drafts/:id" element={<Review />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Review export modal behavior', () => {
  const writeText = vi.fn();

  beforeEach(() => {
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();
    mockUseQueryClient.mockReset();
    mockUseGuidedTour.mockReset();
    writeText.mockReset();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText,
      },
    });

    mockUseQuery.mockImplementation((options?: { queryKey?: unknown[] }) => {
      const key = Array.isArray(options?.queryKey) ? options.queryKey[0] : undefined;

      if (key === 'templates') {
        return {
          data: templatesResponse,
          isLoading: false,
          error: null,
        };
      }

      return {
        data: draftResponse,
        isLoading: false,
        error: null,
      };
    });

    mockUseMutation.mockImplementation(() => createMutationResult());
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
  });

  it('closes the export modal when leaving a tour-managed export step', async () => {
    const exportPresetStepIndex = getGuidedTour(REVIEW_EXPORT_TOUR_ID)?.steps.findIndex(
      (step) => step.targetId === 'export-preset-selection'
    );

    if (exportPresetStepIndex === undefined || exportPresetStepIndex < 0) {
      throw new Error('Review export tour is missing the export preset step');
    }

    mockUseGuidedTour.mockReturnValue({
      activeTourId: REVIEW_EXPORT_TOUR_ID,
      activeStepIndex: exportPresetStepIndex,
      isTourCompleted: vi.fn(() => false),
      restartTour: vi.fn(),
      startTour: vi.fn(),
    });

    const view = renderReview();

    expect(await screen.findByTestId('export-modal')).toBeInTheDocument();

    mockUseGuidedTour.mockReturnValue({
      activeTourId: null,
      activeStepIndex: 0,
      isTourCompleted: vi.fn(() => false),
      restartTour: vi.fn(),
      startTour: vi.fn(),
    });

    view.rerender(
      <MemoryRouter initialEntries={['/drafts/review-1']}>
        <Routes>
          <Route path="/drafts/:id" element={<Review />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
    });
  });

  it('keeps a manually opened export modal visible when no tour is active', async () => {
    mockUseGuidedTour.mockReturnValue({
      activeTourId: null,
      activeStepIndex: 0,
      isTourCompleted: vi.fn(() => false),
      restartTour: vi.fn(),
      startTour: vi.fn(),
    });

    const view = renderReview();

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(await screen.findByTestId('export-modal')).toBeInTheDocument();

    view.rerender(
      <MemoryRouter initialEntries={['/drafts/review-1']}>
        <Routes>
          <Route path="/drafts/:id" element={<Review />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
  });

  it('copies an asset from the draft review card', async () => {
    writeText.mockResolvedValue(undefined);

    mockUseGuidedTour.mockReturnValue({
      activeTourId: null,
      activeStepIndex: 0,
      isTourCompleted: vi.fn(() => false),
      restartTour: vi.fn(),
      startTour: vi.fn(),
    });

    renderReview();

    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('hello');
    });

    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('shows missing template assets so imported drafts can create them', async () => {
    mockUseGuidedTour.mockReturnValue({
      activeTourId: null,
      activeStepIndex: 0,
      isTourCompleted: vi.fn(() => false),
      restartTour: vi.fn(),
      startTour: vi.fn(),
    });

    renderReview();

    expect(await screen.findByText('This draft is missing 1 template asset. Create it with AI from the existing draft context or add it manually before export.')).toBeInTheDocument();
    expect(screen.getByText('post history')).toBeInTheDocument();
    expect(screen.getByText('Missing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create with AI' })).toHaveAttribute('href', '/drafts/review-1/assets/post_history/regenerate');
    expect(screen.getByRole('button', { name: 'Add Manually' })).toBeInTheDocument();
  });
});