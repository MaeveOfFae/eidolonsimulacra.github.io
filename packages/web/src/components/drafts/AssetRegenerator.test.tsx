import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AssetRegenerator from './AssetRegenerator';
import { api } from '@/lib/api';
import { GenerationService } from '@/lib/services/generation';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/lib/api', () => ({
  api: {
    getDraft: vi.fn(),
    getDrafts: vi.fn(),
    getTemplates: vi.fn(),
    updateAsset: vi.fn(),
    updateMetadata: vi.fn(),
  },
}));

vi.mock('@/lib/services/generation', () => ({
  GenerationService: {
    generateAsset: vi.fn(),
    previewBlueprint: vi.fn(),
  },
}));

vi.mock('../common/useAssistantContext', () => ({
  useAssistantScreenContext: () => undefined,
}));

const draftResponse = {
  metadata: {
    review_id: 'review-1',
    seed: 'test seed',
    mode: 'NSFW',
    template_name: 'V2/V3 Card',
    character_name: 'Test Character',
    notes: '',
  },
  assets: {
    system_prompt: 'original system prompt',
    character_sheet: 'character sheet content',
  },
};

const introDraftResponse = {
  metadata: {
    review_id: 'review-2',
    seed: 'intro seed',
    mode: 'SFW',
    template_name: 'Intro Template',
    character_name: 'Intro Character',
    notes: '',
  },
  assets: {
    system_prompt: 'system prompt',
    intro_scene: 'current intro',
  },
};

const templatesResponse = [
  {
    name: 'V2/V3 Card',
    assets: [
      { name: 'system_prompt', required: true, depends_on: [] },
      { name: 'post_history', required: true, depends_on: ['system_prompt'] },
      { name: 'character_sheet', required: true, depends_on: ['system_prompt'] },
    ],
  },
  {
    name: 'Intro Template',
    assets: [
      { name: 'system_prompt', required: true, depends_on: [] },
      { name: 'intro_scene', required: true, depends_on: ['system_prompt'] },
    ],
  },
];

function createWrapper(options?: {
  route?: string;
  element?: React.ReactNode;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[options?.route ?? '/drafts/review-1/assets/system_prompt/regenerate']}>
        <Routes>
          <Route path="/drafts/:id/assets/:assetName/regenerate" element={options?.element ?? <AssetRegenerator />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('AssetRegenerator', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockNavigate.mockReset();
    vi.mocked(api.getDraft).mockResolvedValue(draftResponse as never);
    vi.mocked(api.getDrafts).mockResolvedValue({ drafts: [] } as never);
    vi.mocked(api.getTemplates).mockResolvedValue(templatesResponse as never);
    vi.mocked(api.updateAsset).mockResolvedValue({ status: 'updated', draft_id: 'review-1', asset_name: 'system_prompt' } as never);
    vi.mocked(api.updateMetadata).mockResolvedValue(undefined as never);
    vi.mocked(GenerationService.previewBlueprint).mockReset();
    vi.mocked(GenerationService.generateAsset).mockReset();
  });

  it('generates and applies a candidate for the selected asset', async () => {
    vi.mocked(GenerationService.generateAsset).mockImplementation(async function* () {
      yield { type: 'chunk', content: 'regenerated ' } as never;
      yield { type: 'asset', content: 'regenerated system prompt' } as never;
    });

    createWrapper();

    expect(await screen.findByText('Current Active Asset')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Generate One' }));

    expect(await screen.findByText('Variant #1')).toBeInTheDocument();
    expect(await screen.findByText('regenerated system prompt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Replace Asset' }));

    await waitFor(() => {
      expect(api.updateAsset).toHaveBeenCalledWith('review-1', 'system_prompt', 'regenerated system prompt', {
        expectedPreviousContent: 'original system prompt',
        overwrite: true,
      });
    });

    expect(screen.getByText('Current active')).toBeInTheDocument();
    expect(screen.getByText('Candidate')).toBeInTheDocument();
  });

  it('restores a saved asset regeneration session for the same draft and asset', async () => {
    window.localStorage.setItem('eidolon.active-asset-regenerator-session', JSON.stringify({
      version: 1,
      draftId: 'review-1',
      assetName: 'system_prompt',
      generationCount: 2,
      customInstructions: 'Make it colder and more severe.',
      blueprintOverrideContent: '',
      generatedCandidates: [
        {
          id: 'candidate-1',
          content: 'restored candidate',
          timestamp: 1710000000000,
        },
      ],
      expandedCandidates: ['candidate-1'],
      generatingContent: '',
      status: 'ready',
      updatedAt: 1710000001000,
    }));

    createWrapper();

    expect(await screen.findByText('Restored generated asset variants.')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Make it colder and more severe.')).toBeInTheDocument();
    expect(screen.getByText('Variant #1')).toBeInTheDocument();
    expect(screen.getByText('restored candidate')).toBeInTheDocument();
  });

  it('applies a candidate and returns to draft review', async () => {
    vi.mocked(GenerationService.generateAsset).mockImplementation(async function* () {
      yield { type: 'asset', content: 'candidate for return flow' } as never;
    });

    createWrapper();

    expect(await screen.findByText('Current Active Asset')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Generate One' }));
    expect(await screen.findByText('candidate for return flow')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Replace and Return' }));

    await waitFor(() => {
      expect(api.updateAsset).toHaveBeenCalledWith('review-1', 'system_prompt', 'candidate for return flow', {
        expectedPreviousContent: 'original system prompt',
        overwrite: true,
      });
      expect(mockNavigate).toHaveBeenCalledWith('/drafts/review-1');
    });
  });

  it('creates a missing asset instead of requiring it to already exist on the draft', async () => {
    vi.mocked(api.updateAsset).mockResolvedValue({ status: 'created', draft_id: 'review-1', asset_name: 'post_history' } as never);
    vi.mocked(GenerationService.generateAsset).mockImplementation(async function* () {
      yield { type: 'asset', content: 'generated missing post history' } as never;
    });

    createWrapper({
      route: '/drafts/review-1/assets/post_history/regenerate',
    });

    expect(await screen.findByText('This draft does not have a saved post history yet. Generate a candidate to create it from the current seed and prior asset chain.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Generate One' }));
    expect(await screen.findByText('generated missing post history')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Create Asset' }));

    await waitFor(() => {
      expect(api.updateAsset).toHaveBeenCalledWith('review-1', 'post_history', 'generated missing post history', {
        expectedPreviousContent: null,
        overwrite: false,
      });
    });
  });

  it('unwraps a single outer code fence before saving a generated asset', async () => {
    vi.mocked(GenerationService.generateAsset).mockImplementation(async function* () {
      yield { type: 'asset', content: '```text\nregenerated system prompt\n```' } as never;
    });

    createWrapper();

    expect(await screen.findByText('Current Active Asset')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Generate One' }));
    expect(await screen.findByText('regenerated system prompt')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Replace Asset' }));

    await waitFor(() => {
      expect(api.updateAsset).toHaveBeenCalledWith('review-1', 'system_prompt', 'regenerated system prompt', {
        expectedPreviousContent: 'original system prompt',
        overwrite: true,
      });
    });
  });

  it('uses previewBlueprint when a blueprint override is applied', async () => {
    vi.mocked(GenerationService.previewBlueprint).mockImplementation(async function* () {
      yield { type: 'asset', content: 'override-generated system prompt' } as never;
    });

    createWrapper();

    expect(await screen.findByText('Current Active Asset')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: '' })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'custom blueprint override' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    fireEvent.click(screen.getByRole('button', { name: 'Generate One' }));

    await waitFor(() => {
      expect(GenerationService.previewBlueprint).toHaveBeenCalled();
    });

    expect(await screen.findByText('override-generated system prompt')).toBeInTheDocument();
  });

  it('keeps generated intros when the universal page is used for intro_scene', async () => {
    vi.mocked(api.getDraft).mockResolvedValue(introDraftResponse as never);
    vi.mocked(api.getDrafts).mockResolvedValue({
      drafts: [
        {
          review_id: 'review-2',
          seed: 'intro seed',
          character_name: 'Intro Character',
          template_name: 'Intro Template',
        },
      ],
    } as never);

    vi.mocked(GenerationService.generateAsset).mockImplementation(async function* () {
      yield { type: 'asset', content: 'new intro candidate' } as never;
    });

    createWrapper({
      route: '/drafts/review-2/assets/intro_scene/regenerate',
      element: <AssetRegenerator templates={templatesResponse as never} fixedAssetName="intro_scene" embedded enableDraftSelection />,
    });

    expect(await screen.findByText('Generate Asset Variants')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Draft' }), {
      target: { value: 'review-2' },
    });

    expect(await screen.findByText('Current Active Asset')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Generate One' }));
    expect(await screen.findByText('new intro candidate')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Keep' }));

    await waitFor(() => {
      expect(api.updateMetadata).toHaveBeenCalled();
    });
  });
});