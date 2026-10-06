import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import ComfyRenderPanel from './ComfyRenderPanel';
import { runComfyRender } from '@/lib/comfyui/run';
import { describeComfyTransportError } from '@/lib/comfyui/transport';

vi.mock('@/lib/comfyui/run', () => ({
  runComfyRender: vi.fn(),
}));

vi.mock('@/lib/comfyui/transport', () => ({
  describeComfyTransportError: vi.fn((error: unknown) => (error instanceof Error ? error.message : 'failed')),
}));

vi.mock('@/lib/config', () => ({
  configManager: {
    getConfig: () => ({ comfyui: { base_url: 'http://127.0.0.1:8188' } }),
  },
}));

const mockedRun = vi.mocked(runComfyRender);
const CONTENT = '1girl, solo\nschool_uniform\nindoors\nstanding\nportrait';

function renderPanel(approved: boolean) {
  return render(<ComfyRenderPanel content={CONTENT} approved={approved} />);
}

beforeEach(() => {
  mockedRun.mockReset();
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
    expect(screen.getByRole('button', { name: /render again/i })).toBeInTheDocument();
  });

  it('shows the mapped transport error on failure', async () => {
    mockedRun.mockRejectedValue(new Error('boom'));
    vi.mocked(describeComfyTransportError).mockReturnValue('remedy text');

    renderPanel(true);
    fireEvent.click(screen.getByRole('button', { name: /send to comfyui/i }));

    await waitFor(() => expect(screen.getByText('remedy text')).toBeInTheDocument());
  });
});
