import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Settings from './Settings';
import { configManager } from '../../lib/config/manager';
import { GETTING_STARTED_GUIDE_ID, GETTING_STARTED_TOUR_ID } from '@/lib/help';

vi.mock('../common/useThemePreview', () => ({
  useThemePreview: () => ({
    themes: [
      {
        name: 'dark',
        display_name: 'Dark',
        description: 'Default dark theme',
        colors: {
          background: '#000000',
          text: '#ffffff',
          accent: '#3366ff',
          button: '#3366ff',
          button_text: '#ffffff',
          border: '#222222',
          highlight: '#777777',
          window: '#111111',
          muted_text: '#999999',
          surface: '#181818',
          success_text: '#00ff00',
          error_text: '#ff0000',
          warning_text: '#ffaa00',
          success_bg: '#002200',
          danger_bg: '#220000',
          accent_bg: '#001133',
          accent_title: '#88aaff',
          tok_brackets: '#ffffff',
          tok_asterisk: '#ffffff',
          tok_parentheses: '#ffffff',
          tok_double_brackets: '#ffffff',
          tok_curly_braces: '#ffffff',
          tok_pipes: '#ffffff',
          tok_at_sign: '#ffffff',
        },
      },
    ],
    isLoading: false,
    previewTheme: vi.fn(),
    clearPreview: vi.fn(),
  }),
}));

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

vi.mock('../../utils/download', () => ({
  saveBlobDownload: vi.fn(),
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

function renderSettings() {
  const queryClient = new QueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/settings?section=help']}>
        <Settings />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Settings help controls', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    configManager.clearAll();
  });

  it('resets help preferences back to defaults', async () => {
    configManager.updateHelpState({
      first_run_completed: true,
      show_inline_tips: false,
      completed_guides: [GETTING_STARTED_GUIDE_ID],
      dismissed_tips: ['settings-provider-tip'],
      completed_tours: [GETTING_STARTED_TOUR_ID],
    });

    renderSettings();

    fireEvent.click(screen.getByRole('button', { name: 'Reset Help Preferences' }));

    await waitFor(() => {
      expect(
        screen.getByText('Help preferences were reset. Hover help popups and first-run guidance are enabled again.'),
      ).toBeInTheDocument();
    });

    expect(configManager.getHelpState()).toEqual({
      first_run_completed: false,
      show_inline_tips: true,
      completed_guides: [],
      dismissed_tips: [],
      completed_tours: [],
    });
  });

  it('restarts getting started and clears its completion markers', async () => {
    configManager.updateHelpState({
      first_run_completed: true,
      completed_guides: [GETTING_STARTED_GUIDE_ID],
      completed_tours: [GETTING_STARTED_TOUR_ID],
    });

    renderSettings();

    fireEvent.click(screen.getByRole('button', { name: 'Restart Getting Started' }));

    await waitFor(() => {
      expect(
        screen.getByText('Getting Started has been reset. Return to Home to run through it again.'),
      ).toBeInTheDocument();
    });

    expect(configManager.getHelpState().first_run_completed).toBe(false);
    expect(configManager.getHelpState().completed_guides).toEqual([]);
    expect(configManager.getHelpState().completed_tours).toEqual([]);
  });

  it('shows the help section with its popup toggle, guide link and reset action', async () => {
    renderSettings();

    expect(await screen.findByRole('heading', { name: 'Help and Tutorials' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Hover help popups' })).toBeInTheDocument();

    // First-run guidance is on by default, so the toggle starts checked.
    expect(screen.getByRole('checkbox')).toBeChecked();

    const helpCenterLink = screen.getByRole('link', { name: 'Open Help Center' });
    expect(helpCenterLink).toHaveAttribute('href', '/help');

    expect(screen.getByRole('button', { name: 'Restart Getting Started' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset Help Preferences' })).toBeInTheDocument();
  });
});
