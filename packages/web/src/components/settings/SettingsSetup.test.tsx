import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
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
  },
  createEngine: vi.fn(() => ({
    testConnection: vi.fn(async () => ({ success: true })),
  })),
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

  it('lists every provider in the grid and warns once keys are persisted', async () => {
    configManager.setApiKey('openrouter', 'sk-test');

    renderSetupSettings();

    expect(await screen.findByRole('heading', { name: 'Access' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Manage all providers/ })).toBeInTheDocument();

    for (const provider of ALL_PROVIDERS) {
      expect(screen.getByRole('button', { name: new RegExp(`^${PROVIDER_LABELS[provider]}`) })).toBeInTheDocument();
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

    // The default config model resolves to OpenAI (see SettingsProviders.test.tsx).
    expect(await screen.findByRole('heading', { name: 'OpenAI access' })).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Enter your openai API key'), {
      target: { value: 'sk-typed' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save All Settings/ }));

    await waitFor(() => {
      expect(api.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ api_keys: expect.objectContaining({ openai: 'sk-typed' }) }),
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
