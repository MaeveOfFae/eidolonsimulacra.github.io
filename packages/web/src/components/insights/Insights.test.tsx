import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Insights from './Insights';

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
  },
}));

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
  it('renders totals, the provider breakdown, and recent calls', async () => {
    renderInsights();

    expect(screen.getByRole('heading', { name: 'Insights' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('45')).toBeInTheDocument();
    });
    expect(screen.getByText('openai')).toBeInTheDocument();
    expect(screen.getByText('chat')).toBeInTheDocument();
  });
});
