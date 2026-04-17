import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DraftRefiner from './DraftRefiner';
import { api } from '@/lib/api';
import { GenerationService } from '@/lib/services/generation';

vi.mock('@/lib/api', () => ({
  api: {
    getDrafts: vi.fn(),
    getDraft: vi.fn(),
    updateAsset: vi.fn(),
  },
}));

vi.mock('@/lib/services/generation', () => ({
  GenerationService: {
    generateAsset: vi.fn(),
  },
}));

const templates = [
  {
    name: 'V2/V3 Card',
    assets: [
      { name: 'system_prompt', required: true, depends_on: [], description: 'System instructions' },
      { name: 'post_history', required: true, depends_on: ['system_prompt'], description: 'Relationship context' },
    ],
  },
];

const draftResponse = {
  metadata: {
    review_id: 'review-1',
    seed: 'test seed',
    mode: 'SFW',
    template_name: 'V2/V3 Card',
    character_name: 'Test Character',
  },
  assets: {
    system_prompt: 'existing system prompt',
  },
};

function renderRefiner() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DraftRefiner templates={templates as never} />
    </QueryClientProvider>
  );
}

describe('DraftRefiner', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.getDrafts).mockResolvedValue({
      drafts: [
        {
          review_id: 'review-1',
          seed: 'test seed',
          character_name: 'Test Character',
          template_name: 'V2/V3 Card',
        },
      ],
    } as never);
    vi.mocked(api.getDraft).mockResolvedValue(draftResponse as never);
    vi.mocked(api.updateAsset).mockResolvedValue({
      status: 'created',
      draft_id: 'review-1',
      asset_name: 'post_history',
    } as never);
    vi.mocked(GenerationService.generateAsset).mockReset();
  });

  it('shows missing template assets and creates them from AI generation', async () => {
    vi.mocked(GenerationService.generateAsset).mockImplementation(async function* () {
      yield { type: 'asset', content: 'generated post history' } as never;
    });

    window.localStorage.setItem('eidolon.active-draft-refiner-session', JSON.stringify({
      version: 1,
      selectedDraftId: 'review-1',
      assetStates: {},
      expandedAssets: [],
      editingAsset: null,
      editContent: '',
      interrupted: false,
      updatedAt: Date.now(),
    }));

    renderRefiner();

    await waitFor(() => {
      expect(api.getDraft).toHaveBeenCalledWith('review-1');
    });

    expect(await screen.findByText('This draft is missing 1 template asset. Create them here with AI or by editing the empty fields directly.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /post history/i }));

    expect(await screen.findByText('Relationship context')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create with AI' }));
    expect(await screen.findByDisplayValue('generated post history')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Asset' }));

    await waitFor(() => {
      expect(api.updateAsset).toHaveBeenCalledWith('review-1', 'post_history', 'generated post history', {
        expectedPreviousContent: null,
        overwrite: false,
      });
    });
  });
});