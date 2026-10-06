import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { createDefaultComfyUIConfig, comfyListCheckpoints, type ComfyUIConfig } from '@char-gen/shared';
import SettingsImagePipelineSection from './SettingsImagePipelineSection';
import { testComfyConnection } from '@/lib/comfyui/run';
import { getComfyFetch } from '@/lib/comfyui/transport';

vi.mock('@char-gen/shared', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@char-gen/shared')>()),
  comfyListCheckpoints: vi.fn(),
}));

vi.mock('@/lib/comfyui/run', () => ({
  testComfyConnection: vi.fn(),
}));

vi.mock('@/lib/comfyui/transport', () => ({
  describeComfyTransportError: (error: unknown) => (error instanceof Error ? error.message : 'failed'),
  getComfyFetch: vi.fn(),
}));

const mockedTest = vi.mocked(testComfyConnection);
const mockedGetFetch = vi.mocked(getComfyFetch);
const mockedListCheckpoints = vi.mocked(comfyListCheckpoints);

function renderSection(config = createDefaultComfyUIConfig()) {
  const onChange = vi.fn();
  const view = render(<SettingsImagePipelineSection comfyui={config} onChange={onChange} />);
  return { onChange, ...view };
}

/** A host that actually applies changes, for tests that need re-render on select changes. */
function StatefulSettingsHost() {
  const [config, setConfig] = useState<ComfyUIConfig>(createDefaultComfyUIConfig());
  return (
    <SettingsImagePipelineSection comfyui={config} onChange={(updates) => setConfig((c) => ({ ...c, ...updates }))} />
  );
}

beforeEach(() => {
  mockedTest.mockReset();
  mockedGetFetch.mockReset();
  mockedListCheckpoints.mockReset();
});

describe('SettingsImagePipelineSection', () => {
  it('edits the base URL through the change callback', () => {
    const { onChange } = renderSection();
    fireEvent.change(screen.getByLabelText('ComfyUI base URL'), { target: { value: 'http://192.168.1.4:8188' } });
    expect(onChange).toHaveBeenCalledWith({ base_url: 'http://192.168.1.4:8188' });
  });

  it('runs the connection test and reports success', async () => {
    mockedTest.mockResolvedValue({ ok: true, message: 'Connected on cuda:0 (v0.3.30).' });
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /^test$/i }));
    await waitFor(() => expect(screen.getByText(/Connected on cuda:0/)).toBeInTheDocument());
    expect(mockedTest).toHaveBeenCalledTimes(1);
  });

  it('switches to the custom workflow editor', () => {
    const host = render(<StatefulSettingsHost />);
    fireEvent.change(screen.getByLabelText('Workflow'), { target: { value: 'custom' } });
    expect(screen.getByLabelText(/custom workflow/i)).toBeInTheDocument();
    expect(screen.queryByLabelText('Base checkpoint')).not.toBeInTheDocument();
    void host;
  });

  it('fetches checkpoints from the live server into a picker', async () => {
    mockedListCheckpoints.mockResolvedValue(['a.safetensors', 'b.safetensors']);
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: /^fetch$/i }));
    await waitFor(() => expect(screen.getByLabelText('Base checkpoint').tagName).toBe('SELECT'));
    fireEvent.change(screen.getByLabelText('Base checkpoint'), { target: { value: 'b.safetensors' } });
    expect(mockedListCheckpoints).toHaveBeenCalledTimes(1);
  });
});
