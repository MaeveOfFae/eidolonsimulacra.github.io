import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WorldRecord } from '@char-gen/shared';
import WorldUniverseNotesSection from './WorldUniverseNotesSection';

const api = vi.hoisted(() => ({
  createUniverseNote: vi.fn(async () => ({ note: { id: 'new' } })),
  updateUniverseNote: vi.fn(async () => ({ note: { id: 'n1' } })),
  deleteUniverseNote: vi.fn(async () => ({ message: 'Universe note removed' })),
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
    universeNotes: [
      {
        id: 'n1',
        worldId: 'w1',
        title: 'Tone',
        body: 'Keep it cold.',
        pinned: true,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'n2',
        worldId: 'w1',
        title: 'Loose',
        body: 'Not pinned yet.',
        pinned: false,
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
      <WorldUniverseNotesSection {...props} />
    </QueryClientProvider>,
  );

  return props;
}

describe('WorldUniverseNotesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists notes pinned-first and shows the context block generation receives', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Tone' })).toBeInTheDocument();
    });

    const headings = screen.getAllByRole('heading', { level: 5 }).map((heading) => heading.textContent);
    expect(headings).toEqual(['Tone', 'Loose']);
    expect(screen.getByText('pinned')).toBeInTheDocument();
    expect(screen.getByText('Tone: Keep it cold.')).toBeInTheDocument();
    expect(screen.getByText('Loose: Not pinned yet.')).toBeInTheDocument();
  });

  it('adds a note with its body and pinned flag', async () => {
    const props = renderSection(makeWorld({ universeNotes: [] }));

    await waitFor(() => {
      expect(screen.getByLabelText('Universe note title')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Universe note title'), { target: { value: 'How magic feels' } });
    fireEvent.change(screen.getByLabelText('Universe note body'), { target: { value: 'Warm, greasy.' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /Add note/ }));

    await waitFor(() => {
      expect(api.createUniverseNote).toHaveBeenCalledWith('w1', {
        title: 'How magic feels',
        body: 'Warm, greasy.',
        pinned: true,
      });
    });
    expect(props.onRefresh).toHaveBeenCalled();
  });

  it('pins an unpinned note from the list', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pin Loose' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pin Loose' }));

    await waitFor(() => {
      expect(api.updateUniverseNote).toHaveBeenCalledWith('w1', 'n2', { pinned: true });
    });
  });

  it('filters to pinned notes only', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 5, name: 'Loose' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Pinned (1)' }));

    expect(screen.getByRole('heading', { level: 5, name: 'Tone' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 5, name: 'Loose' })).not.toBeInTheDocument();
  });

  it('removes a note', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Remove Tone' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Tone' }));

    await waitFor(() => {
      expect(api.deleteUniverseNote).toHaveBeenCalledWith('w1', 'n1');
    });
  });
});
