import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
import { assertTabOrderAfter, findUnnamedTabStops, formatTabStops } from '../../test/tab-order';
import { api } from '../../lib/api.js';
import { configManager } from '../../lib/config/manager';
import { ALL_PROVIDERS, PROVIDER_LABELS } from '../../lib/llm/providers';

vi.mock('../../lib/api.js', () => ({
  api: {
    getModels: vi.fn(async () => ({ models: [], error: null })),
    getBlueprints: vi.fn(async () => ({
      core: [],
      system: [],
      templates: { local: [] },
      examples: [],
    })),
    updateConfig: vi.fn(async (config: unknown) => config),
  },
}));

vi.mock('../../lib/llm/factory.js', () => ({
  MODEL_SUGGESTIONS: {
    openrouter: ['openrouter/openai/gpt-4o-mini'],
    openai: ['openai/gpt-4o-mini'],
    google: ['google/gemini-2.0-flash'],
    anthropic: ['anthropic/claude-3-5-sonnet'],
    deepseek: ['deepseek/chat'],
    zai: ['zai/glm'],
    moonshot: ['moonshot/kimi'],
    ollama: ['gemma4', 'llama3.1'],
  },
  createEngine: vi.fn(() => ({
    testConnection: vi.fn(async () => ({ success: true })),
  })),
  getRuntimeLLMFetch: () => fetch,
}));

function renderSetupSettings() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/settings?section=setup']}>
        <Settings />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Settings setup access column', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configManager.clearAll();
    vi.mocked(api.updateConfig).mockClear();
  });

  it('tabs through the setup section in visual order', async () => {
    renderSetupSettings();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Access' })).toBeInTheDocument();
    });

    const sequence = formatTabStops();

    // The section nav reads before the section content it switches to.
    assertTabOrderAfter(sequence, 'Setup', 'Providers');
    assertTabOrderAfter(sequence, 'Device Link', 'Auto');

    // The nav appears twice in this sequence on purpose: Settings renders a compact
    // (`sm:hidden`) and a wide nav, and only one is visible at any viewport. The
    // duplicate is a test-environment artefact, not a keyboard defect.
    expect(findUnnamedTabStops(sequence)).toEqual([]);
  });

  it('lists every provider in the grid and warns once keys are persisted', async () => {
    configManager.setApiKey('openrouter', 'sk-test');

    renderSetupSettings();

    expect(await screen.findByRole('heading', { name: 'Access' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Manage all providers/ })).toBeInTheDocument();

    for (const provider of ALL_PROVIDERS) {
      // Escape the label: "Kimi (Moonshot)" would otherwise read as a group.
      expect(
        screen.getByRole('button', {
          name: new RegExp(`^${PROVIDER_LABELS[provider].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        }),
      ).toBeInTheDocument();
    }

    // Tests run outside the desktop shell, so keys persist to browser storage.
    const persistToggle = screen.getByRole('checkbox');
    expect(persistToggle).not.toBeChecked();
    expect(screen.getByText('Save API keys to browser storage')).toBeInTheDocument();

    fireEvent.click(persistToggle);

    expect(
      screen.getByText('Stored in local browser storage on this device. Use caution on shared devices.'),
    ).toBeInTheDocument();
  });

  it('edits the selected provider key and saves it through the parent draft', async () => {
    renderSetupSettings();

    // The default model `gemma4` resolves to the Ollama provider, so the card
    // opens there; OpenRouter holds a key and is one click away.
    expect(await screen.findByRole('heading', { name: 'Ollama access' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^OpenRouter/ }));
    expect(screen.getByRole('heading', { name: 'OpenRouter access' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter your openrouter API key'), {
      target: { value: 'sk-typed' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save All Settings/ }));

    await waitFor(() => {
      expect(api.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ api_keys: expect.objectContaining({ openrouter: 'sk-typed' }) }),
      );
    });
  });

  it('hands off to the providers tab from the manage button', async () => {
    renderSetupSettings();

    fireEvent.click(await screen.findByRole('button', { name: /Manage all providers/ }));

    // The providers tab takes over, including its own configured inventory.
    expect(await screen.findByRole('heading', { name: 'Providers' })).toBeInTheDocument();
    expect(screen.getByText(`0 / ${ALL_PROVIDERS.length}`)).toBeInTheDocument();
  });
});

describe('Settings setup runtime column', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configManager.clearAll();
    vi.mocked(api.updateConfig).mockClear();
  });

  it('renders the configured engine, model and sampling defaults', async () => {
    renderSetupSettings();

    expect(await screen.findByRole('heading', { name: 'Runtime' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Auto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explicit' })).toBeInTheDocument();

    // The default model `gemma4` resolves to the Ollama provider by pattern.
    expect(screen.getByLabelText('Provider')).toHaveValue('ollama');
    // Target the custom-model field by its accessible name; the placeholder is copy.
    expect(screen.getByLabelText('Custom model ID')).toHaveValue('gemma4');
    expect(screen.getByText('Showing built-in suggestions.')).toBeInTheDocument();

    expect(screen.getByLabelText('Temperature')).toHaveValue(0.7);
    expect(screen.getByLabelText('Max Tokens')).toHaveValue(4096);

    // Advanced transport stays collapsed until something custom is configured.
    expect(screen.getByText('Using provider defaults')).toBeInTheDocument();
    expect(screen.queryByText('Test Connection')).not.toBeInTheDocument();
  });

  it('warns when the current model is missing from the loaded provider list', async () => {
    // The panel first resolves the default provider (openrouter) and then infers
    // ollama from `gemma4`, calling getModels twice — answer per provider.
    vi.mocked(api.getModels).mockImplementation(async (provider) =>
      provider === 'ollama'
        ? {
            provider: 'ollama',
            models: [{ id: 'deepseek-v4.1-flash:cloud', name: 'deepseek-v4.1-flash:cloud', provider: 'ollama' }],
            cached: false,
          }
        : { provider, models: [] },
    );

    try {
      renderSetupSettings();

      expect(await screen.findByText(/is not in the loaded Ollama list/)).toBeInTheDocument();
    } finally {
      vi.mocked(api.getModels).mockImplementation(async (provider) => ({ provider, models: [] }));
    }
  });

  it('saves engine mode and sampling edits through the parent draft', async () => {
    renderSetupSettings();

    fireEvent.click(await screen.findByRole('button', { name: 'Explicit' }));
    fireEvent.change(screen.getByLabelText('Temperature'), { target: { value: '1.2' } });
    fireEvent.change(screen.getByLabelText('Max Tokens'), { target: { value: '2048' } });
    fireEvent.click(screen.getByRole('button', { name: /Save All Settings/ }));

    await waitFor(() => {
      expect(api.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ engine_mode: 'explicit', temperature: 1.2, max_tokens: 2048 }),
      );
    });
  });

  it('reveals the custom transport fields and enables the connection test', async () => {
    renderSetupSettings();

    fireEvent.change(await screen.findByLabelText('Provider'), { target: { value: 'openai' } });
    fireEvent.click(screen.getByRole('button', { name: /Advanced transport/ }));

    // Choosing OpenAI surfaces its CORS warning inside the transport panel.
    expect(screen.getByText(/blocked by CORS on api\.openai\.com/)).toBeInTheDocument();

    const testConnection = screen.getByRole('button', { name: 'Test Connection' });
    expect(testConnection).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('e.g., https://your-proxy.example.com/v1'), {
      target: { value: 'https://proxy.example.com/v1' },
    });

    expect(screen.getByRole('button', { name: 'Test Connection' })).toBeEnabled();
    // Same as above: the proxy key label is not tied to its input, so use the placeholder.
    expect(screen.getByPlaceholderText('Enter proxy API key if required')).toBeInTheDocument();
  });
});
