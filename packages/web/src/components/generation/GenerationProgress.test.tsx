import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GenerationProgress from './GenerationProgress';
import { GenerationService } from '../../lib/services/generation.js';
import { DraftStorage } from '../../lib/storage/draft-db.js';
import { clearActiveGenerationSession, saveActiveGenerationSession } from '../../lib/services/generation-session.js';

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

  it('pauses mid-run, keeps the checkpoint, and resumes from the paused asset', async () => {
    vi.mocked(GenerationService.generateAsset)
      .mockImplementationOnce(async function* () {
        yield { type: 'chunk', content: 'partial content' };
        // Deliberately never settles: the stream is interrupted by pausing.
        await new Promise(() => {});
      })
      .mockImplementationOnce(async function* () {
        yield {
          type: 'asset',
          asset: 'system_prompt',
          content: 'System prompt content',
        };
      });

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
      expect(screen.getByText('Generating current asset...')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));

    expect(await screen.findByText('Session paused')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume session' })).toBeEnabled();

    // Unlike Cancel, pausing must not discard the persisted checkpoint.
    expect(clearActiveGenerationSession).not.toHaveBeenCalled();
    const lastSave = vi.mocked(saveActiveGenerationSession).mock.calls.at(-1)?.[0] as unknown as {
      currentStatus?: string;
    };
    expect(lastSave.currentStatus).toBe('paused');

    fireEvent.click(screen.getByRole('button', { name: 'Resume session' }));

    await waitFor(() => {
      expect(screen.getByText('Review and edit this asset')).toBeInTheDocument();
    });
    expect(vi.mocked(GenerationService.generateAsset)).toHaveBeenCalledTimes(2);
    expect(onError).not.toHaveBeenCalled();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('restarts from an approved asset, discarding it and everything downstream', async () => {
    vi.mocked(GenerationService.generateAsset)
      .mockImplementationOnce(async function* () {
        yield { type: 'asset', asset: 'system_prompt', content: 'System prompt v1' };
      })
      .mockImplementationOnce(async function* () {
        yield { type: 'asset', asset: 'a1111', content: 'Tag block v1' };
      })
      .mockImplementationOnce(async function* () {
        yield { type: 'asset', asset: 'system_prompt', content: 'System prompt v2' };
      });

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
      expect(screen.getByRole('button', { name: 'Save Draft' })).toBeEnabled();
    });

    // The approved upstream asset is restartable from the asset list.
    fireEvent.click(screen.getByRole('button', { name: 'Restart from system_prompt' }));

    await waitFor(() => {
      expect(vi.mocked(GenerationService.generateAsset)).toHaveBeenCalledTimes(3);
    });

    const restartRequest = vi.mocked(GenerationService.generateAsset).mock.calls[2]?.[0] as {
      asset_name?: string;
      prior_assets?: Record<string, string>;
    };
    expect(restartRequest.asset_name).toBe('system_prompt');
    expect(restartRequest.prior_assets).toEqual({});

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Approve and Continue' })).toBeEnabled();
    });
    expect(onError).not.toHaveBeenCalled();
  });
  it('does not abort the stream it just started when the queued action clears', async () => {
    let signal: AbortSignal | undefined;

    vi.mocked(GenerationService.generateAsset).mockImplementation(
      // The stream must stay open so the abort this test guards against (the
      // effect clearing its own queued action) would be observable mid-flight.
      // eslint-disable-next-line require-yield -- deliberately never yields: the stream is held open
      async function* (_request, _stream, options) {
        signal = options?.signal;
        await new Promise<void>(() => {
          /* never resolves */
        });
      },
    );

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
        onComplete={vi.fn()}
        onError={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // Generation is dispatched on a 0ms timer; the effect then clears its queued
    // action, which re-runs the effect. That must not abort the stream that just
    // began — otherwise the catch returns silently and the screen hangs forever.
    await waitFor(() => {
      expect(signal).toBeDefined();
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(signal?.aborted).toBe(false);
  });
});
