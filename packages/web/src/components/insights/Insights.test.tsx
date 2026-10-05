import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Insights from './Insights';
import { findUnnamedTabStops, formatTabStops } from '@/test/tab-order';

const apiMocks = vi.hoisted(() => ({
  getModelPricing: vi.fn(() => [] as Array<Record<string, unknown>>),
  saveModelPricing: vi.fn(),
  deleteModelPricing: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  api: {
    getUsageSummary: vi.fn(async () => ({
      totals: {
        key: 'all',
        calls: 3,
        okCalls: 2,
        errorCalls: 1,
        abortedCalls: 0,
        failureRate: 1 / 3,
        promptTokens: 30,
        completionTokens: 15,
        totalTokens: 45,
        avgDurationMs: 2000,
        avgTotalTokens: 15,
      },
      groups: [
        {
          key: 'openai',
          calls: 2,
          okCalls: 1,
          errorCalls: 1,
          abortedCalls: 0,
          failureRate: 0.5,
          promptTokens: 10,
          completionTokens: 5,
          totalTokens: 15,
          avgDurationMs: 2000,
          avgTotalTokens: 7.5,
        },
      ],
    })),
    getUsageRecords: vi.fn(async () => [
      {
        id: 1,
        timestamp: 1_700_000_000_000,
        kind: 'chat',
        status: 'ok',
        provider: 'openai',
        model: 'gpt-4o',
        durationMs: 1200,
        promptTokens: 10,
        completionTokens: 8,
        totalTokens: 18,
      },
    ]),
    clearUsageRecords: vi.fn(async () => undefined),
    getModelPricing: apiMocks.getModelPricing,
    saveModelPricing: apiMocks.saveModelPricing,
    deleteModelPricing: apiMocks.deleteModelPricing,
  },
}));

const saveBlobDownload = vi.hoisted(() => vi.fn(async () => ({ saved: true, method: 'download' as const })));
vi.mock('@/utils/download', () => ({ saveBlobDownload: saveBlobDownload }));

function renderInsights() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/insights']}>
        <Insights />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Insights page', () => {
  it('keeps every tab stop named', async () => {
    renderInsights();

    await waitFor(() => {
      expect((document.body.textContent ?? '').trim().length).toBeGreaterThan(100);
    });

    expect(findUnnamedTabStops(formatTabStops())).toEqual([]);
  });

  it('renders totals, the provider breakdown, and recent calls', async () => {
    renderInsights();

    expect(screen.getByRole('heading', { name: 'Insights' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument();
    });
    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getByText('chat')).toBeInTheDocument();
  });

  it('shows estimated cost in the scorecard when pricing is configured', async () => {
    apiMocks.getModelPricing.mockReturnValue([
      {
        id: 'p1',
        model: 'gpt-4o',
        inputCostPerMillionTokens: 1000,
        outputCostPerMillionTokens: 1000,
        currency: 'USD',
        createdAt: '2026-09-01T00:00:00.000Z',
      },
    ]);

    renderInsights();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Provider scorecard' })).toBeInTheDocument();
    });
    // 10 prompt + 8 completion tokens at 1 per 1K = USD 0.018
    expect(await screen.findByText('USD 0.018')).toBeInTheDocument();
    expect(screen.getByText('Model pricing (1 entry)')).toBeInTheDocument();
  });

  it('exports usage records as CSV and JSON downloads', async () => {
    renderInsights();

    // Wait for the queries to resolve so the export buttons are enabled.
    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
    await waitFor(() => {
      expect(saveBlobDownload).toHaveBeenCalledTimes(1);
    });
    const [csvBlob, csvName] = saveBlobDownload.mock.calls[0] as unknown as [Blob, string];
    expect(csvName).toMatch(/^eidolon-usage-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(csvBlob.type).toBe('text/csv');
    expect(await csvBlob.text()).toContain('gpt-4o');

    fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));
    await waitFor(() => {
      expect(saveBlobDownload).toHaveBeenCalledTimes(2);
    });
    const [jsonBlob, jsonName] = saveBlobDownload.mock.calls[1] as unknown as [Blob, string];
    expect(jsonName).toMatch(/\.json$/);
    expect(await jsonBlob.text()).toContain('"record_count": 1');
  });
});
