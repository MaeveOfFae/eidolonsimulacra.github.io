import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WorldRecord } from '@char-gen/shared';
import WorldCanonLibrarySection from './WorldCanonLibrarySection';

const api = vi.hoisted(() => ({
  createCanonEntry: vi.fn(async () => ({ entry: { id: 'new' } })),
  updateCanonEntry: vi.fn(async () => ({ entry: { id: 'e1' } })),
  deleteCanonEntry: vi.fn(async () => ({ message: 'Canon library entry removed' })),
}));

vi.mock('@/lib/api', () => ({ api }));

function makeWorld(overrides: Partial<WorldRecord> = {}): WorldRecord {
  return {
    id: 'w1',
    userId: 'local-desktop',
    name: 'Ashfall',
    tags: [],
    isPublic: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    canonEntries: [
      {
        id: 'e1',
        worldId: 'w1',
        title: 'Blood Price',
        category: 'lore',
        summary: 'magic always costs blood',
        tags: ['magic'],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'e2',
        worldId: 'w1',
        title: 'Vale',
        category: 'trait',
        summary: '',
        tags: [],
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
      },
    ],
    ...overrides,
  };
}

function renderSection(world: WorldRecord) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const props = {
    world,
    canEdit: true,
    onNotice: vi.fn(),
    onError: vi.fn(),
    onRefresh: vi.fn(async () => undefined),
  };

  render(
    <QueryClientProvider client={queryClient}>
      <WorldCanonLibrarySection {...props} />
    </QueryClientProvider>,
  );

  return props;
}

describe('WorldCanonLibrarySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders entries and the canon context block', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByText('Blood Price')).toBeInTheDocument();
    });
    expect(screen.getByText('Vale')).toBeInTheDocument();
    expect(screen.getByText('Blood Price (lore): magic always costs blood')).toBeInTheDocument();
    // An entry with no summary cites as title plus category only.
    expect(screen.getByText('Vale (trait)')).toBeInTheDocument();
  });

  it('adds an entry, parsing comma-separated tags', async () => {
    const props = renderSection(makeWorld({ canonEntries: [] }));

    await waitFor(() => {
      expect(screen.getByLabelText('Canon entry title')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Canon entry title'), { target: { value: 'The Long Winter' } });
    fireEvent.change(screen.getByLabelText('Canon entry category'), { target: { value: 'setting' } });
    fireEvent.change(screen.getByLabelText('Canon entry summary'), { target: { value: 'winters last a decade' } });
    fireEvent.change(screen.getByLabelText('Canon entry tags'), { target: { value: 'weather, climate, weather' } });
    fireEvent.click(screen.getByRole('button', { name: /Add entry/ }));

    await waitFor(() => {
      expect(api.createCanonEntry).toHaveBeenCalledWith('w1', {
        title: 'The Long Winter',
        category: 'setting',
        summary: 'winters last a decade',
        body: undefined,
        tags: ['weather', 'climate'],
      });
    });
    expect(props.onRefresh).toHaveBeenCalled();
  });

  it('filters the list by category', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByText('Blood Price')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'trait' }));

    expect(screen.getByText('Vale')).toBeInTheDocument();
    expect(screen.queryByText('Blood Price')).not.toBeInTheDocument();
  });

  it('removes an entry', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Remove Blood Price' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Blood Price' }));

    await waitFor(() => {
      expect(api.deleteCanonEntry).toHaveBeenCalledWith('w1', 'e1');
    });
  });
});
