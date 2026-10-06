import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComfyRenderPanel from './ComfyRenderPanel';
import { runComfyRender } from '@/lib/comfyui/run';
import { describeComfyTransportError, getComfyFetch } from '@/lib/comfyui/transport';
import { api } from '@/lib/api';

vi.mock('@/lib/comfyui/run', () => ({
  runComfyRender: vi.fn(),
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

const mockedRun = vi.mocked(runComfyRender);
const mockedGetDraft = vi.mocked(api.getDraft);
const mockedUpdateMetadata = vi.mocked(api.updateMetadata);
const mockedUpdateAsset = vi.mocked(api.updateAsset);

const CONTENT = '1girl, solo\nschool_uniform\nindoors\nstanding\nportrait';

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

function renderPanel(approved: boolean) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ComfyRenderPanel content={CONTENT} approved={approved} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockedRun.mockReset();
  mockedGetDraft.mockReset().mockResolvedValue(DRAFT_WITH_HISTORY as never);
  mockedUpdateMetadata.mockReset().mockResolvedValue({ status: 'updated', draft_id: 'draft-1' });
  mockedUpdateAsset.mockReset().mockResolvedValue({ status: 'updated', draft_id: 'draft-1', asset_name: 'card_image' });
  vi.mocked(getComfyFetch).mockReset();
});

describe('ComfyRenderPanel', () => {
  it('gates the send action on approval and says so', () => {
    renderPanel(false);
    const button = screen.getByRole('button', { name: /send to comfyui/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/approve the a1111 asset first/i)).toBeInTheDocument();
  });

  it('renders, polls and shows the outputs on success', async () => {
    mockedRun.mockResolvedValue({
      promptId: 'prompt-12345678',
      seed: 42,
      images: [{ filename: 'out.png', subfolder: '', type: 'output' }],
      objectUrls: ['blob:render-1'],
    });

    renderPanel(true);
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(screen.getByRole('img', { name: /comfyui render 1/i })).toBeInTheDocument());
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(mockedRun).toHaveBeenCalledTimes(1);
    const call = mockedRun.mock.calls[0]![0];
    expect(call.a1111Content).toBe(CONTENT);
    expect(call.config.base_url).toBe('http://127.0.0.1:8188');
    expect('seed' in call).toBe(false);
    // The used seed is pinned into the input so Render again is reproducible.
    expect((screen.getByLabelText('Seed') as HTMLInputElement).value).toBe('42');
    expect(screen.getByRole('button', { name: /render again/i })).toBeInTheDocument();
  });

  it('passes a pinned seed through to the render', async () => {
    mockedRun.mockResolvedValue({
      promptId: 'prompt-87654321',
      seed: 777,
      images: [{ filename: 'out.png', subfolder: '', type: 'output' }],
      objectUrls: ['blob:render-2'],
    });

    renderPanel(true);
    fireEvent.change(screen.getByLabelText('Seed'), { target: { value: '777' } });
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(screen.getByRole('img', { name: /comfyui render 1/i })).toBeInTheDocument());
    expect(mockedRun.mock.calls[0]![0].seed).toBe(777);
  });

  it('shows the mapped transport error on failure', async () => {
    mockedRun.mockRejectedValue(new Error('boom'));
    vi.mocked(describeComfyTransportError).mockReturnValue('remedy text');

    renderPanel(true);
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(screen.getByText('remedy text')).toBeInTheDocument());
  });

  it('records finished renders into the draft render history', async () => {
    mockedRun.mockResolvedValue({
      promptId: 'prompt-12345678',
      seed: 42,
      images: [{ filename: 'out.png', subfolder: '', type: 'output' }],
      objectUrls: ['blob:render-1'],
    });

    renderPanel(true);
    // Wait for the draft query (and the pre-existing history) before sending.
    await screen.findByText(/recent renders \(1\)/i);
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(screen.getByRole('img', { name: /comfyui render 1/i })).toBeInTheDocument());
    await waitFor(() => expect(mockedUpdateMetadata).toHaveBeenCalledTimes(1));
    const updates = mockedUpdateMetadata.mock.calls[0]![1];
    const history = updates.comfy_renders ?? [];
    expect(history[0]).toMatchObject({ prompt_id: 'prompt-12345678', seed: 42 });
    // The pre-existing record stays, newest first.
    expect(history[1]).toMatchObject({ prompt_id: 'older-prompt' });
  });

  it('renders the saved history and pins a record seed on demand', async () => {
    renderPanel(true);

    const pinButton = await screen.findByRole('button', { name: /pin seed 999/i });
    expect(screen.getByText(/recent renders \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/1h ago/)).toBeInTheDocument();

    fireEvent.click(pinButton);
    expect((screen.getByLabelText('Seed') as HTMLInputElement).value).toBe('999');
  });

  it('promotes a history render to the draft card image', async () => {
    vi.mocked(getComfyFetch).mockReturnValue(
      vi.fn(async () => new Response(new Blob(['png'], { type: 'image/png' }), { status: 200 })),
    );

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
});
