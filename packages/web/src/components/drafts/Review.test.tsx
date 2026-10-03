import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Review from './Review';
import { getGuidedTour, REVIEW_EXPORT_TOUR_ID } from '@/lib/help';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseQueryClient = vi.fn();
const mockUseGuidedTour = vi.fn();
let mutationResults: Array<ReturnType<typeof createMutationResult>> = [];

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => mockUseQuery(options),
  useMutation: (options: unknown) => mockUseMutation(options),
  useQueryClient: () => mockUseQueryClient(),
}));

vi.mock('../common/ExportModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="export-modal">
      <span>Export Modal</span>
      <button type="button" onClick={onClose}>
        Close Export Modal
      </button>
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
    mutateAsync: vi.fn().mockResolvedValue(undefined),
    isPending: false,
  };
}

function renderReview() {
  return render(
    <MemoryRouter initialEntries={['/drafts/review-1']}>
      <Routes>
        <Route path="/drafts/:id" element={<Review />} />
      </Routes>
    </MemoryRouter>,
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
    mutationResults = [];

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

      if (key === 'worlds-list') {
        return {
          data: { worlds: [] },
          isLoading: false,
          error: null,
        };
      }

      if (key === 'world-character-draft-links') {
        return {
          data: { links: [] },
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

    mockUseMutation.mockImplementation(() => {
      const result = createMutationResult();
      mutationResults.push(result);
      return result;
    });
    mockUseQueryClient.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
  });

  it('closes the export modal when leaving a tour-managed export step', async () => {
    const exportPresetStepIndex = getGuidedTour(REVIEW_EXPORT_TOUR_ID)?.steps.findIndex(
      (step) => step.targetId === 'export-preset-selection',
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
      </MemoryRouter>,
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
      </MemoryRouter>,
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

    // The compact review layout renders each asset card collapsed.
    fireEvent.click(screen.getByRole('button', { name: /^system prompt/ }));

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

    // Overview and the asset cards start collapsed in the compact review layout.
    fireEvent.click(screen.getByRole('button', { name: /^Overview/ }));
    fireEvent.click(screen.getByRole('button', { name: /^post history/ }));

    expect(
      await screen.findByText(
        'This draft is missing 1 template asset. Create it with AI from the existing draft context or add it manually before export.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('post history').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Missing').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Create with AI' })).toHaveAttribute(
      'href',
      '/drafts/review-1/assets/post_history/regenerate',
    );
    expect(screen.getByRole('button', { name: 'Add manually' })).toBeInTheDocument();
  });

  it('saves outbound send settings and shows dependency warnings for custom order', async () => {
    mockUseGuidedTour.mockReturnValue({
      activeTourId: null,
      activeStepIndex: 0,
      isTourCompleted: vi.fn(() => false),
      restartTour: vi.fn(),
      startTour: vi.fn(),
    });

    renderReview();

    // The outbound send panel is collapsed until it is opened.
    fireEvent.click(screen.getByRole('button', { name: /^Outbound Send Settings/ }));

    fireEvent.change(screen.getByLabelText('Saved draft instructions'), {
      target: { value: 'Keep the relationship colder.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Move post history up' }));

    expect(screen.getByText('Dependency warnings')).toBeInTheDocument();
    expect(screen.getByText(/post history now appears before system prompt/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Save outbound settings' }));

    await waitFor(() => {
      const savedSendConfig = mutationResults
        .flatMap((result) => result.mutateAsync.mock.calls.map(([payload]) => payload))
        .find(
          (payload) =>
            (payload as { metadata?: { custom_instructions?: string } })?.metadata?.custom_instructions ===
            'Keep the relationship colder.',
        );

      expect(savedSendConfig).toBeDefined();
      expect(
        (savedSendConfig as { metadata?: { component_send_order?: string[] } })?.metadata?.component_send_order,
      ).toEqual(['post_history', 'system_prompt']);
    });
  });

  it('records an asset approval decision from the review card', async () => {
    mockUseGuidedTour.mockReturnValue({
      activeTourId: null,
      activeStepIndex: 0,
      isTourCompleted: vi.fn(() => false),
      restartTour: vi.fn(),
      startTour: vi.fn(),
    });

    renderReview();

    // The compact review layout renders each asset card collapsed.
    fireEvent.click(screen.getByRole('button', { name: /^system prompt/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Approve' }));

    await waitFor(() => {
      const approvalCall = mutationResults
        .flatMap((result) => result.mutate.mock.calls.map(([payload]) => payload))
        .find((payload) => (payload as { assetName?: string })?.assetName === 'system_prompt');

      expect(approvalCall).toEqual({
        assetName: 'system_prompt',
        decision: { status: 'approved' },
      });
    });
  });
});
