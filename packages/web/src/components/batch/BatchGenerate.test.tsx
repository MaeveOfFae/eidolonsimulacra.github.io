import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { assertTabOrderAfter, findUnnamedTabStops, formatTabStops } from '@/test/tab-order';
import BatchGenerate from './BatchGenerate';

vi.mock('@/lib/api', () => ({
  api: {
    getTemplates: vi.fn(async () => [{ name: 'V2/V3 Card', assets: [] }]),
    getDrafts: vi.fn(async () => ({ drafts: [] })),
    generateBatch: vi.fn(),
  },
}));

vi.mock('../common/useAssistantContext', () => ({
  useAssistantScreenContext: () => undefined,
}));

function renderBatch() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/batch']}>
        <BatchGenerate />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Batch screen tab order', () => {
  it('keeps every stop named and reachable in reading order', async () => {
    renderBatch();

    await waitFor(() => {
      expect(screen.getAllByRole('heading', { name: 'Seeds' }).length).toBeGreaterThan(0);
    });

    const sequence = formatTabStops();

    // The expanded Seeds panel header reads first, then the field it contains,
    // then the collapsed panels below it — DOM order matches the column.
    assertTabOrderAfter(sequence, 'Queue one seed per line', 'Seeds, one per line');
    assertTabOrderAfter(sequence, 'Seeds, one per line', 'Options');

    // The run button is disabled until seeds exist, so it correctly stays out of
    // the tab order; and nothing focusable may announce as nothing.
    expect(findUnnamedTabStops(sequence)).toEqual([]);
  });
});
