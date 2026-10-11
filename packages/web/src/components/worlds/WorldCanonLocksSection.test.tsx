import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { WorldRecord } from '@char-gen/shared';
import WorldCanonLocksSection from './WorldCanonLocksSection';

const api = vi.hoisted(() => ({
  createCanonLock: vi.fn(async () => ({ lock: { id: 'new' } })),
  updateCanonLock: vi.fn(async () => ({ lock: { id: 'l1' } })),
  deleteCanonLock: vi.fn(async () => ({ message: 'Canon lock removed' })),
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
    characters: [
      {
        id: 'c1',
        worldId: 'w1',
        characterName: 'Vesna',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    canonLocks: [
      {
        id: 'l1',
        worldId: 'w1',
        targetKind: 'character',
        targetId: 'c1',
        targetLabel: 'Vesna',
        statement: 'surname is Vale',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
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
      <WorldCanonLocksSection {...props} />
    </QueryClientProvider>,
  );

  return props;
}

describe('WorldCanonLocksSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing locks and the exact constraint block generation receives', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByText('surname is Vale')).toBeInTheDocument();
    });
    expect(screen.getByText('Vesna (character): surname is Vale')).toBeInTheDocument();
  });

  it('adds a lock with the chosen scope, target, and statement', async () => {
    const props = renderSection(makeWorld({ canonLocks: [] }));

    await waitFor(() => {
      expect(screen.getByLabelText('Canon lock scope')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Canon lock scope'), { target: { value: 'character' } });
    fireEvent.change(screen.getByLabelText('Canon lock target'), { target: { value: 'c1' } });
    fireEvent.change(screen.getByLabelText('Canon lock statement'), { target: { value: 'never loses her left arm' } });
    fireEvent.click(screen.getByRole('button', { name: /Add lock/ }));

    await waitFor(() => {
      expect(api.createCanonLock).toHaveBeenCalledWith('w1', {
        targetKind: 'character',
        targetId: 'c1',
        targetLabel: 'Vesna',
        statement: 'never loses her left arm',
        notes: undefined,
      });
    });
    expect(props.onRefresh).toHaveBeenCalled();
  });

  it('removes a lock', async () => {
    renderSection(makeWorld());

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Remove surname is Vale' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Remove surname is Vale' }));

    await waitFor(() => {
      expect(api.deleteCanonLock).toHaveBeenCalledWith('w1', 'l1');
    });
  });

  it('disables saving until a statement and target are chosen', async () => {
    renderSection(makeWorld({ canonLocks: [] }));

    await waitFor(() => {
      expect(screen.getByLabelText('Canon lock scope')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add lock/ });
    expect(addButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Canon lock scope'), { target: { value: 'character' } });
    fireEvent.change(screen.getByLabelText('Canon lock statement'), { target: { value: 'locked' } });
    // A scoped lock still needs a target selected.
    expect(screen.getByRole('button', { name: /Add lock/ })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Canon lock target'), { target: { value: 'c1' } });
    expect(screen.getByRole('button', { name: /Add lock/ })).toBeEnabled();
  });
});
