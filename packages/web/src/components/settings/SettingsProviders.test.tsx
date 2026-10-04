import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
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

vi.mock('../common/GuidedTourContext', () => ({
  useGuidedTour: () => ({
    isTourCompleted: vi.fn(() => false),
    restartTour: vi.fn(),
    startTour: vi.fn(),
  }),
}));

vi.mock('../common/InlineHelpTip', () => ({
  default: () => null,
}));

function renderProviderSettings() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/settings?section=providers']}>
        <Settings />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Settings providers section', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configManager.clearAll();
  });

  it('lists every provider with its configured, local or empty status', async () => {
    configManager.setApiKey('openrouter', 'sk-test');

    renderProviderSettings();

    expect(await screen.findByRole('heading', { name: 'Providers' })).toBeInTheDocument();
    expect(screen.getByText(`1 / ${ALL_PROVIDERS.length}`)).toBeInTheDocument();

    for (const provider of ALL_PROVIDERS) {
      const name = new RegExp(`^${PROVIDER_LABELS[provider]}`);
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }

    // OpenRouter holds a key, Ollama is local-only, and the rest are empty.
    expect(screen.getByText('Configured')).toBeInTheDocument();
    expect(screen.getByText('Local')).toBeInTheDocument();
    expect(screen.getAllByText('Empty')).toHaveLength(ALL_PROVIDERS.length - 2);
  });

  it('opens on the model prefix provider and swaps to another one', async () => {
    configManager.setApiKey('openrouter', 'sk-test');

    renderProviderSettings();

    // The default model `openrouter/openai/gpt-4o-mini` resolves by its own
    // `openrouter/` prefix, so the editor opens on the provider that model names.
    expect(await screen.findByRole('heading', { name: 'OpenRouter' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your openrouter API key')).toHaveValue('sk-test');
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Clear key' })).toBeEnabled();

    // Empty providers cannot be tested until a key is entered.
    fireEvent.click(screen.getByRole('button', { name: /^OpenAI/ }));
    expect(screen.getByRole('heading', { name: 'OpenAI' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your openai API key')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear key' })).toBeDisabled();

    // Ollama is local, so it is testable without credentials.
    fireEvent.click(screen.getByRole('button', { name: /^Ollama/ }));
    expect(screen.getByRole('heading', { name: 'Ollama' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Optional - Ollama runs locally without auth')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeEnabled();
  });

  it('clears a stored key without switching providers', async () => {
    configManager.setApiKey('openrouter', 'sk-test');

    renderProviderSettings();

    expect(await screen.findByRole('heading', { name: 'OpenRouter' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your openrouter API key')).toHaveValue('sk-test');

    fireEvent.click(screen.getByRole('button', { name: 'Clear key' }));

    // Clearing writes config and fires the change event the screen listens for, but the
    // provider is only re-resolved when the engine/model identity changes, so the editor
    // stays on the provider the user was working in.
    expect(await screen.findByRole('heading', { name: 'OpenRouter' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your openrouter API key')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Test connection' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear key' })).toBeDisabled();

    // The stored key really is gone.
    expect(configManager.getApiKey('openrouter')).toBeFalsy();
    expect(configManager.getConfig().api_keys?.openrouter).toBeFalsy();
  });
});
