import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { DraftMetadata, UsageRecord } from '@char-gen/shared';
import { formatTabStops } from '@/test/tab-order';
import Compare from './Compare';

// The mocked generation service pushes into this state so the group and usage
// queries can observe what a real run would have persisted.
const state = vi.hoisted(() => ({
  groupDrafts: [] as DraftMetadata[],
  usageRecords: [] as UsageRecord[],
  generateCalls: [] as Array<Record<string, unknown>>,
}));

vi.mock('@/lib/services/generation', () => ({
  GenerationService: {
    generate: (request: Record<string, unknown>) => {
      state.generateCalls.push(request);
      const model = String(request.model_override ?? 'unknown');
      const seed = String(request.seed ?? '');
      // One draft per (seed, model), so a multi-seed run gets distinct ids the
      // way the real service does.
      const draftId = `draft-${seed}-${model}`.replace(/\s+/g, '-');
      state.groupDrafts.push({
        review_id: draftId,
        seed,
        favorite: false,
        model,
        comparison_group: String(request.comparison_group ?? ''),
      });
      state.usageRecords.push({
        timestamp: Date.now(),
        kind: 'comparison',
        status: 'ok',
        provider: 'openai',
        model,
        durationMs: 1234,
        draftId,
        totalTokens: 42,
        promptTokens: 20,
        completionTokens: 22,
      });
      return (async function* () {
        yield { type: 'complete' as const, asset: draftId };
      })();
    },
  },
}));

vi.mock('../drafts/DraftComparisonPanel', () => ({
  default: () => null,
}));

vi.mock('@/lib/api', () => ({
  api: {
    listTemplates: vi.fn(async () => [{ name: 'V2/V3 Card' }]),
    getConfig: vi.fn(async () => ({ model: 'gpt-4o' })),
    getModels: vi.fn(async () => ({ provider: 'openai', models: [{ name: 'gpt-4o' }, { name: 'gpt-4o-mini' }] })),
    getComparisonGroupDrafts: vi.fn(async () => [...state.groupDrafts]),
    getUsageRecords: vi.fn(async () => [...state.usageRecords]),
  },
}));

function renderCompare() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/compare']}>
        <Compare />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Compare page', () => {
  beforeEach(() => {
    state.groupDrafts.length = 0;
    state.usageRecords.length = 0;
    state.generateCalls.length = 0;
  });

  it('tabs through the launcher in visual order', async () => {
    renderCompare();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Seeds (one per line)'), { target: { value: 'a seed for compare' } });
    const candidates = screen.getByLabelText(/Candidate models/);
    fireEvent.change(candidates, { target: { value: 'gpt-4o' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/ }));
    fireEvent.change(candidates, { target: { value: 'gpt-4o-mini' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/ }));

    // A disabled button is not focusable, so the run button only joins the tab
    // order once a run is actually possible — which is why two candidates go in
    // first. This is the order the form reads in.
    const sequence = formatTabStops();

    expect(sequence).toEqual([
      'textarea: Seeds (one per line)',
      'select: Template',
      'select: Content mode',
      'select: Candidate provider',
      'input: Candidate models (2/4)',
      'button: Add',
      // Each added candidate's row controls come next, in the order the rows are
      // rendered, and the run button is last because it acts on all of them.
      'button: Use current (gpt-4o)',
      'button: Remove gpt-4o',
      'button: Remove gpt-4o-mini',
      'button: Run comparison (2)',
    ]);
  });

  it('renders the launcher and keeps the run button disabled until ready', async () => {
    renderCompare();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Compare models' })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Run comparison/ })).toBeDisabled();
    expect(screen.getByText('Add at least 2 candidates to enable a run.')).toBeInTheDocument();
  });

  it('runs each candidate and shows the results table with usage', async () => {
    renderCompare();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Seeds (one per line)'), { target: { value: 'a seed for compare' } });
    const input = screen.getByLabelText(/Candidate models/);
    fireEvent.change(input, { target: { value: 'gpt-4o' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/ }));
    fireEvent.change(input, { target: { value: 'gpt-4o-mini' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/ }));

    const runButton = screen.getByRole('button', { name: /Run comparison/ });
    expect(runButton).toBeEnabled();
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Results' })).toBeInTheDocument();
    });
    expect(state.generateCalls).toHaveLength(2);
    expect(state.generateCalls[0]).toMatchObject({ model_override: 'gpt-4o', comparison_group: expect.any(String) });
    expect(screen.getByRole('cell', { name: 'gpt-4o' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'gpt-4o-mini' })).toBeInTheDocument();
    expect(screen.getAllByText('42')).toHaveLength(2);
  });

  it('runs every seed through every model and shows one row per matrix cell', async () => {
    renderCompare();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add/ })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Seeds (one per line)'), {
      target: { value: 'first seed\nsecond seed' },
    });
    const input = screen.getByLabelText(/Candidate models/);
    fireEvent.change(input, { target: { value: 'gpt-4o' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/ }));
    fireEvent.change(input, { target: { value: 'gpt-4o-mini' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/ }));

    // The run button now names the size of the whole matrix.
    const runButton = screen.getByRole('button', { name: 'Run comparison (4)' });
    expect(runButton).toBeEnabled();
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Results' })).toBeInTheDocument();
    });

    expect(state.generateCalls).toHaveLength(4);
    // Seed-major: both models for the first seed, then both for the second.
    expect(state.generateCalls.map((call) => [call.seed, call.model_override])).toEqual([
      ['first seed', 'gpt-4o'],
      ['first seed', 'gpt-4o-mini'],
      ['second seed', 'gpt-4o'],
      ['second seed', 'gpt-4o-mini'],
    ]);
    expect(
      state.generateCalls.every((call) => call.comparison_group === state.generateCalls[0]?.comparison_group),
    ).toBe(true);

    expect(screen.getAllByRole('cell', { name: 'first seed' })).toHaveLength(2);
    expect(screen.getAllByRole('cell', { name: 'second seed' })).toHaveLength(2);
    expect(screen.getAllByText('42')).toHaveLength(4);
  });
});
