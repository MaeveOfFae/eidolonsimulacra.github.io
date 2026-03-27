import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Generation from './Generation';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    getTemplates: vi.fn(),
    getBlueprints: vi.fn(),
  },
}));

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

describe('Generation', () => {
  beforeEach(() => {
    window.localStorage.clear();
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
      </QueryClientProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Assets' }));

    expect(await screen.findByText('Asset Regenerator Mock')).toBeInTheDocument();
    expect(screen.getByText('Embedded Asset Workspace')).toBeInTheDocument();
    expect(screen.getByText('Draft selection enabled')).toBeInTheDocument();
    expect(screen.getByText('Asset selection enabled')).toBeInTheDocument();
    expect(screen.getByText('Template count: 1')).toBeInTheDocument();
  });
});