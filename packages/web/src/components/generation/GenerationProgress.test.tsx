import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GenerationProgress from './GenerationProgress';
import { GenerationService } from '../../lib/services/generation.js';
import { DraftStorage } from '../../lib/storage/draft-db.js';

vi.mock('../../lib/services/generation.js', () => ({
  GenerationService: {
    generateAsset: vi.fn(),
  },
}));

vi.mock('../../lib/storage/draft-db.js', () => ({
  DraftStorage: {
    saveDraft: vi.fn(async () => undefined),
  },
}));

vi.mock('../../lib/config/manager.js', () => ({
  configManager: {
    getConfig: () => ({ model: 'openrouter/openai/gpt-4o-mini' }),
  },
}));

vi.mock('../../lib/services/generation-session.js', () => ({
  clearActiveGenerationSession: vi.fn(),
  loadActiveGenerationSession: vi.fn(() => null),
  matchesActiveGenerationSession: vi.fn(() => false),
  saveActiveGenerationSession: vi.fn(),
}));

vi.mock('../../lib/templates/browser.js', () => ({
  inferCharacterDisplayNameForTemplate: vi.fn(() => null),
}));

vi.mock('../../lib/prompting/reference-context.js', () => ({
  loadReferenceSuites: vi.fn(async () => []),
  normalizeConnectedReferenceIds: vi.fn((value: string[] = []) => value),
}));

describe('GenerationProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps the flow open on asset generation with no content', async () => {
    vi.mocked(GenerationService.generateAsset).mockImplementation(
      // eslint-disable-next-line require-yield -- deliberate empty stream: this case asserts "generated no content"
      async function* () {
        return;
      },
    );

    const onError = vi.fn();
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <GenerationProgress
        seed="test seed"
        mode="SFW"
        template="Test Template"
        templates={[
          {
            name: 'Test Template',
            assets: [{ name: 'system_prompt', required: true, depends_on: [] }],
          } as never,
        ]}
        onComplete={onComplete}
        onError={onError}
        onCancel={onCancel}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('No content generated')).toBeInTheDocument();
    });

    expect(onError).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Regenerate Asset' })).toBeEnabled();
    // A single-asset run is also the final asset, so the primary action is labelled
    // "Save Draft". With no content there is nothing to save, so it stays disabled
    // and the flow remains open for regeneration instead of closing on an error.
    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeDisabled();
  });

  it('saves a partial draft when the final asset fails empty', async () => {
    vi.mocked(GenerationService.generateAsset)
      .mockImplementationOnce(async function* () {
        yield {
          type: 'asset',
          asset: 'system_prompt',
          content: 'System prompt content',
        };
      })
      .mockImplementationOnce(
        // eslint-disable-next-line require-yield -- deliberate empty stream: the final asset produces no content
        async function* () {
          return;
        },
      );

    const onError = vi.fn();
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <GenerationProgress
        seed="test seed"
        mode="SFW"
        template="Test Template"
        templates={[
          {
            name: 'Test Template',
            assets: [
              { name: 'system_prompt', required: true, depends_on: [] },
              { name: 'a1111', required: true, depends_on: ['system_prompt'] },
            ],
          } as never,
        ]}
        onComplete={onComplete}
        onError={onError}
        onCancel={onCancel}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Approve and Continue' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Approve and Continue' }));

    await waitFor(() => {
      expect(screen.getByText('No content generated')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save Draft' });
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(vi.mocked(DraftStorage.saveDraft)).toHaveBeenCalled();
    });

    expect(vi.mocked(DraftStorage.saveDraft).mock.calls[0]?.[0]?.assets).toEqual({
      system_prompt: 'System prompt content',
    });
    expect(onComplete).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('keeps the overlay open when draft save fails', async () => {
    vi.mocked(GenerationService.generateAsset).mockImplementation(async function* () {
      yield {
        type: 'asset',
        asset: 'system_prompt',
        content: 'System prompt content',
      };
    });
    vi.mocked(DraftStorage.saveDraft).mockRejectedValueOnce(new Error('storage unavailable'));

    const onError = vi.fn();
    const onCancel = vi.fn();
    const onComplete = vi.fn();

    render(
      <GenerationProgress
        seed="test seed"
        mode="SFW"
        template="Test Template"
        templates={[
          {
            name: 'Test Template',
            assets: [{ name: 'system_prompt', required: true, depends_on: [] }],
          } as never,
        ]}
        onComplete={onComplete}
        onError={onError}
        onCancel={onCancel}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save Draft' })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to save draft: storage unavailable')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeEnabled();
    expect(onError).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
