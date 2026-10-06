import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComfyRenderPanel from './ComfyRenderPanel';
import { runComfyVariationBatch, type ComfyRenderResult } from '@/lib/comfyui/run';
import { describeComfyTransportError, getComfyFetch } from '@/lib/comfyui/transport';
import { api } from '@/lib/api';

vi.mock('@/lib/comfyui/run', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/comfyui/run')>()),
  runComfyVariationBatch: vi.fn(),
}));

vi.mock('@/lib/comfyui/transport', () => ({
  describeComfyTransportError: vi.fn((error: unknown) => (error instanceof Error ? error.message : 'failed')),
  getComfyFetch: vi.fn(),
}));

vi.mock('@/lib/config', () => ({
  configManager: {
    getConfig: () => ({ comfyui: { base_url: 'http://127.0.0.1:8188' } }),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useParams: () => ({ id: 'draft-1' }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    getDraft: vi.fn(),
    updateMetadata: vi.fn(),
    updateAsset: vi.fn(),
  },
}));

const mockedBatch = vi.mocked(runComfyVariationBatch);
const mockedGetDraft = vi.mocked(api.getDraft);
const mockedUpdateMetadata = vi.mocked(api.updateMetadata);
const mockedUpdateAsset = vi.mocked(api.updateAsset);

const CONTENT = '1girl, solo\nschool_uniform\nindoors\nstanding\nportrait';

const SINGLE_RESULT = {
  promptId: 'prompt-12345678',
  seed: 42,
  images: [{ filename: 'out.png', subfolder: '', type: 'output' }],
  objectUrls: ['blob:render-1'],
};

const DRAFT_WITH_HISTORY = {
  metadata: {
    review_id: 'draft-1',
    seed: 's',
    favorite: false,
    comfy_renders: [
      {
        prompt_id: 'older-prompt',
        seed: 999,
        rendered_at: new Date(Date.now() - 3_600_000).toISOString(),
        workflow_preset: 'default',
        image_count: 2,
        images: [
          { filename: 'old.png', subfolder: '', type: 'output' },
          { filename: 'old2.png', subfolder: '', type: 'output' },
        ],
      },
    ],
  },
  assets: {},
};

function renderPanel(approved: boolean, draft: unknown = DRAFT_WITH_HISTORY) {
  mockedGetDraft.mockResolvedValue(draft as never);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ComfyRenderPanel content={CONTENT} approved={approved} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockedBatch.mockReset();
  mockedGetDraft.mockReset();
  mockedUpdateMetadata.mockReset().mockResolvedValue({ status: 'updated', draft_id: 'draft-1' });
  mockedUpdateAsset.mockReset().mockResolvedValue({ status: 'updated', draft_id: 'draft-1', asset_name: 'card_image' });
  vi.mocked(describeComfyTransportError).mockImplementation((error: unknown) =>
    error instanceof Error ? error.message : 'failed',
  );
  // Thumbnails and the done-view use object URLs; happy-dom does not implement them.
  URL.createObjectURL = vi.fn(() => `blob:thumb-${Math.random().toString(36).slice(2)}`);
  URL.revokeObjectURL = vi.fn();
  vi.mocked(getComfyFetch).mockReturnValue(
    vi.fn(async () => new Response(new Blob(['png'], { type: 'image/png' }), { status: 200 })),
  );
});
describe('ComfyRenderPanel', () => {
  it('gates the send action on approval and says so', () => {
    renderPanel(false);
    const button = screen.getByRole('button', { name: /send to comfyui/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/approve the a1111 asset first/i)).toBeInTheDocument();
  });

  it('renders a finished batch inline and records it into the draft history', async () => {
    mockedBatch.mockResolvedValue({ results: [SINGLE_RESULT], errors: [] });

    renderPanel(true);
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(screen.getByRole('img', { name: 'ComfyUI render 42-1' })).toBeInTheDocument());
    expect((screen.getByLabelText('Seed') as HTMLInputElement).value).toBe('42');
    expect(mockedBatch).toHaveBeenCalledTimes(1);
    expect(mockedBatch.mock.calls[0]![0]).toMatchObject({ count: 1 });

    await waitFor(() => expect(mockedUpdateMetadata).toHaveBeenCalledTimes(1));
    const history = mockedUpdateMetadata.mock.calls[0]![1].comfy_renders ?? [];
    expect(history[0]).toMatchObject({ prompt_id: 'prompt-12345678', seed: 42 });
  });

  it('passes a pinned seed through to the render', async () => {
    mockedBatch.mockResolvedValue({ results: [SINGLE_RESULT], errors: [] });

    renderPanel(true);
    fireEvent.change(screen.getByLabelText('Seed'), { target: { value: '777' } });
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(mockedBatch).toHaveBeenCalled());
    expect(mockedBatch.mock.calls[0]![0].seed).toBe(777);
  });

  it('submits a variation batch with the chosen count', async () => {
    mockedBatch.mockResolvedValue({ results: [SINGLE_RESULT], errors: [] });

    renderPanel(true);
    fireEvent.change(screen.getByLabelText('Variations'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(mockedBatch).toHaveBeenCalled());
    expect(mockedBatch.mock.calls[0]![0]).toMatchObject({ count: 3 });
  });

  it('shows live step progress while rendering', async () => {
    let finishBatch: ((value: { results: ComfyRenderResult[]; errors: string[] }) => void) | undefined;
    mockedBatch.mockImplementation(async (params) => {
      params.onProgress?.({ kind: 'progress', value: 5, max: 20, node: '6' });
      return new Promise((resolve) => {
        finishBatch = resolve;
      });
    });

    renderPanel(true);
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    const bar = await screen.findByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '5');
    expect(bar).toHaveAttribute('aria-valuemax', '20');
    expect(screen.getByText(/step 5\/20/)).toBeInTheDocument();

    finishBatch?.({ results: [SINGLE_RESULT], errors: [] });
    await waitFor(() => expect(screen.getByRole('img', { name: 'ComfyUI render 42-1' })).toBeInTheDocument());
  });

  it('shows the mapped transport error when every variation fails', async () => {
    mockedBatch.mockResolvedValue({ results: [], errors: ['remedy text'] });

    renderPanel(true);
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(screen.getByText('remedy text')).toBeInTheDocument());
  });

  it('renders the gallery from saved history and pins a record seed', async () => {
    renderPanel(true);

    expect(await screen.findByText('Render gallery')).toBeInTheDocument();
    const pinButton = await screen.findByRole('button', { name: 'Pin seed 999' });
    fireEvent.click(pinButton);
    expect((screen.getByLabelText('Seed') as HTMLInputElement).value).toBe('999');
  });

  it('promotes a history render to the draft card image', async () => {
    renderPanel(true);
    fireEvent.click(await screen.findByRole('button', { name: /use render older-pr as card image/i }));

    await waitFor(() =>
      expect(mockedUpdateAsset).toHaveBeenCalledWith(
        'draft-1',
        'card_image',
        expect.stringMatching(/^data:image\/png;base64,/),
        { overwrite: true },
      ),
    );
    await waitFor(() => expect(screen.getByText(/promoted to the draft card image/i)).toBeInTheDocument());
  });

  it('saves a history render into the draft as render_1', async () => {
    renderPanel(true);
    fireEvent.click(await screen.findByRole('button', { name: /save render older-pr to draft/i }));

    await waitFor(() =>
      expect(mockedUpdateAsset).toHaveBeenCalledWith(
        'draft-1',
        'render_1',
        expect.stringMatching(/^data:image\/png;base64,/),
        { overwrite: true },
      ),
    );
  });

  it('shows renders already saved into the draft in the gallery', async () => {
    const draftWithSavedRender = {
      ...DRAFT_WITH_HISTORY,
      assets: { render_1: 'data:image/png;base64,cG5n' },
    };
    renderPanel(true, draftWithSavedRender);

    expect(await screen.findByAltText('Saved render render_1')).toBeInTheDocument();
    expect(screen.getByText(/saved to draft/)).toBeInTheDocument();
  });
});
