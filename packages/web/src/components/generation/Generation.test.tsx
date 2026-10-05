import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { assertTabOrderAfter, findUnnamedTabStops, formatTabStops } from '@/test/tab-order';
import Generation from './Generation';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getTemplates: vi.fn(),
    getBlueprints: vi.fn(),
    getDrafts: vi.fn(),
  },
}));

vi.mock('@/lib/services/generation-session', () => ({
  clearActiveGenerationSession: vi.fn(),
  loadActiveGenerationSession: vi.fn(),
}));

import { loadActiveGenerationSession } from '@/lib/services/generation-session';

vi.mock('../common/useAssistantContext', () => ({
  useAssistantScreenContext: () => undefined,
}));

vi.mock('./DraftRefiner', () => ({
  default: () => <div>Draft Refiner Mock</div>,
}));

vi.mock('../drafts/AssetRegenerator', () => ({
  default: (props: {
    templates?: Array<{ name: string }>;
    enableDraftSelection?: boolean;
    enableAssetSelection?: boolean;
    embedded?: boolean;
  }) => (
    <div>
      <div>Asset Regenerator Mock</div>
      <div>{props.embedded ? 'Embedded Asset Workspace' : 'Standalone Asset Workspace'}</div>
      <div>{props.enableDraftSelection ? 'Draft selection enabled' : 'Draft selection disabled'}</div>
      <div>{props.enableAssetSelection ? 'Asset selection enabled' : 'Asset selection disabled'}</div>
      <div>Template count: {props.templates?.length ?? 0}</div>
    </div>
  ),
}));

vi.mock('../common/BlueprintPanel', () => ({
  BlueprintPanel: () => <div>Blueprint Panel Mock</div>,
}));

vi.mock('./GenerationProgress', () => ({
  default: (props: { connectedDraftIds?: string[] }) => (
    <div>
      <div>Generation Progress Mock</div>
      <div>Connected references: {props.connectedDraftIds?.join(',') || 'none'}</div>
    </div>
  ),
}));

describe('Generation', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(loadActiveGenerationSession).mockReset();
    vi.mocked(api.getTemplates).mockResolvedValue([
      {
        name: 'V2/V3 Card',
        assets: [
          { name: 'system_prompt', required: true, depends_on: [] },
          { name: 'intro_scene', required: true, depends_on: ['system_prompt'] },
        ],
      },
    ] as never);
    vi.mocked(api.getBlueprints).mockResolvedValue({
      system: [],
      core: [],
      examples: [],
      templates: {},
    } as never);
    vi.mocked(api.getDrafts).mockResolvedValue({
      drafts: [
        {
          review_id: 'draft-1',
          seed: 'existing draft',
          favorite: false,
          character_name: 'Maeve',
        },
      ],
      total: 1,
      stats: {
        total_drafts: 1,
        archived_drafts: 0,
        favorite_drafts: 0,
      },
    } as never);
  });

  it('tabs through the compose column in visual order', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/generate']}>
          <Generation />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'New Draft' })).toBeInTheDocument();
    });

    const sequence = formatTabStops();

    // The mode strip reads first, then the compose fields, then the Setup section
    // that configures the same run — i.e. DOM order matches the column.
    assertTabOrderAfter(sequence, 'New Draft', 'Refine Draft');
    assertTabOrderAfter(sequence, 'Refine Draft', 'Assets');
    assertTabOrderAfter(sequence, 'Assets', 'Enter a seed');
    assertTabOrderAfter(sequence, 'Enter a seed', 'Template');

    // The generate button is disabled until the form is valid, and a disabled
    // button is not focusable — so the primary action correctly joins the tab
    // order only once it can actually do something.
    expect(sequence).not.toContain('button: Generate Character');
    expect(findUnnamedTabStops(sequence)).toEqual([]);
  });

  it('renders the universal asset workspace from the Assets tab', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/generate']}>
          <Generation />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Assets' }));

    expect(await screen.findByText('Asset Regenerator Mock')).toBeInTheDocument();
    expect(screen.getByText('Embedded Asset Workspace')).toBeInTheDocument();
    expect(screen.getByText('Draft selection enabled')).toBeInTheDocument();
    expect(screen.getByText('Asset selection enabled')).toBeInTheDocument();
    expect(screen.getByText('Template count: 1')).toBeInTheDocument();
  });

  it('passes selected connected draft ids into the generation workflow', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/generate']}>
          <Generation />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByPlaceholderText('e.g., a lonely space pirate searching for redemption'), {
      target: { value: 'New interconnected character' },
    });

    fireEvent.change(screen.getByLabelText('Connected draft reference'), {
      target: { value: 'draft-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add reference' }));

    fireEvent.click(screen.getByRole('button', { name: 'Generate Character' }));

    expect(await screen.findByText('Generation Progress Mock')).toBeInTheDocument();
    expect(screen.getByText('Connected references: draft-1')).toBeInTheDocument();
  });

  it('restores a paused session on mount and enters the progress view', async () => {
    vi.mocked(loadActiveGenerationSession).mockReturnValue({
      version: 1,
      seed: 'paused seed',
      mode: 'SFW',
      template: 'V2/V3 Card',
      assetDrafts: { system_prompt: 'Partial system prompt' },
      currentAsset: 'intro_scene',
      currentAssetContent: '',
      currentStatus: 'paused',
      startedAt: 1,
      updatedAt: 2,
    } as never);

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/generate']}>
          <Generation />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Restored a paused generation session.')).toBeInTheDocument();
    expect(screen.getByText('Generation Progress Mock')).toBeInTheDocument();
  });
});
