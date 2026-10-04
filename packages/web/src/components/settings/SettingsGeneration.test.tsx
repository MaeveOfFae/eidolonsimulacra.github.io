import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
import { api } from '../../lib/api.js';
import { configManager } from '../../lib/config/manager';

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

function renderGenerationSettings() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/settings?section=generation']}>
        <Settings />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Settings generation section', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configManager.clearAll();
    vi.mocked(api.updateConfig).mockClear();
  });

  it('starts from the default batch pacing and a collapsed blueprint panel', async () => {
    renderGenerationSettings();

    expect(await screen.findByRole('heading', { name: 'Batch Generation' })).toBeInTheDocument();
    expect(screen.getByLabelText('Max Concurrent')).toHaveValue(3);
    expect(screen.getByLabelText('Rate Limit Delay')).toHaveValue(1);

    // The blueprint panel is collapsed, so only its preview is on screen. Note the
    // scan counts the five *default* system blueprint paths as overrides, so a fresh
    // install already reports five rather than none — that metric is pre-existing.
    expect(screen.getByText('5 overrides configured')).toBeInTheDocument();
    expect(screen.queryByLabelText('Orchestration')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Feature blueprint defaults/ }));

    expect(screen.getByLabelText('Orchestration')).toHaveValue('blueprints/system/generator.md');
    expect(screen.getByLabelText('Seed Generation')).toHaveValue('blueprints/system/seed_generator.md');
    expect(screen.getByLabelText('Validation')).toHaveValue('');
  });

  it('saves edited batch pacing through the parent draft', async () => {
    renderGenerationSettings();

    fireEvent.change(await screen.findByLabelText('Max Concurrent'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText('Rate Limit Delay'), { target: { value: '2.5' } });
    fireEvent.click(screen.getByRole('button', { name: /Save All Settings/ }));

    await waitFor(() => {
      expect(api.updateConfig).toHaveBeenCalledWith(
        expect.objectContaining({ batch: { max_concurrent: 4, rate_limit_delay: 2.5 } }),
      );
    });
  });

  it('updates the blueprint override count live as selections change', async () => {
    configManager.updateConfig({
      feature_blueprints: { orchestration: 'blueprints/custom/orchestrator.md' },
    });

    renderGenerationSettings();

    expect(await screen.findByText('5 overrides configured')).toBeInTheDocument();

    // The config really does hold the custom path...
    expect(configManager.getConfig().feature_blueprints?.orchestration).toBe('blueprints/custom/orchestrator.md');

    fireEvent.click(screen.getByRole('button', { name: /Feature blueprint defaults/ }));
    const orchestration = screen.getByLabelText('Orchestration');
    // ...but the select cannot show it, because its options come from the loaded
    // blueprint list (empty in this test) and a select whose value matches no option
    // falls back to the first one. So a stored override that is not in the list
    // silently reads as the default.
    expect(orchestration).toHaveValue('blueprints/system/generator.md');

    // Choosing "None (Built-in)" drops that override and the preview recomputes live.
    fireEvent.change(orchestration, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Feature blueprint defaults/ }));

    expect(screen.getByText('4 overrides configured')).toBeInTheDocument();
  });
});
