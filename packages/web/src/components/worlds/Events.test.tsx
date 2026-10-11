import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { WorldTimelineEventRecord } from '@char-gen/shared';
import Events from './Events';

const state = vi.hoisted(() => ({ desktop: true, events: [] as WorldTimelineEventRecord[] }));

vi.mock('@/lib/runtime', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/runtime')>()),
  isSelfContainedDesktopRuntime: () => state.desktop,
}));

vi.mock('@/lib/api', () => ({
  api: { getWorldTimelineEvents: vi.fn(async () => ({ events: state.events })) },
}));

vi.mock('../common/useAssistantContext', () => ({
  useAssistantScreenContext: () => undefined,
}));

function event(overrides: Partial<WorldTimelineEventRecord> = {}): WorldTimelineEventRecord {
  return {
    id: 'e1',
    timelineId: 't1',
    title: 'An event',
    sortOrder: 0,
    tags: [],
    metadata: {},
    createdAt: '',
    updatedAt: '',
    worldId: 'w1',
    worldName: 'Ashfall',
    timelineName: 'Main',
    ...overrides,
  };
}

function renderEvents() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Events />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Events calendar', () => {
  beforeEach(() => {
    state.desktop = true;
    state.events = [];
  });

  it('groups events into real-world dates, in-world labels, and undated', async () => {
    state.events = [
      event({ id: 'a', title: 'Coronation', eventDate: '2026-03-14' }),
      event({ id: 'b', title: 'Ashfall founded', eventDate: '1204 AF', sortOrder: 1 }),
      event({ id: 'c', title: 'Floating rumour' }),
    ];

    renderEvents();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: '2026-03-14' })).toBeInTheDocument();
    });
    expect(screen.getByText('real-world date')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '1204 AF' })).toBeInTheDocument();
    expect(screen.getByText('in-world date')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Undated' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Coronation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ashfall founded' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Floating rumour' })).toBeInTheDocument();
    // Every event carries its world and timeline, and all three share the same pair.
    expect(screen.getAllByText('Ashfall · Main')).toHaveLength(3);
  });

  it('filters the calendar by world', async () => {
    state.events = [
      event({ id: 'a', title: 'Ashfall event', worldId: 'w1', worldName: 'Ashfall', eventDate: '2026' }),
      event({ id: 'b', title: 'Emberfall event', worldId: 'w2', worldName: 'Emberfall', eventDate: '2027' }),
    ];

    renderEvents();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Emberfall' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Emberfall' }));

    expect(screen.getByRole('heading', { name: 'Emberfall event' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ashfall event' })).not.toBeInTheDocument();
  });

  it('explains that the calendar reads desktop worlds in the browser', async () => {
    state.desktop = false;

    renderEvents();

    expect(screen.getByRole('heading', { name: 'The calendar reads your desktop worlds.' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'No events yet.' })).not.toBeInTheDocument();
  });

  it('invites the user to add events when a desktop store has none', async () => {
    renderEvents();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'No events yet.' })).toBeInTheDocument();
    });
    expect(screen.getByRole('link', { name: 'Open Worlds' })).toHaveAttribute('href', '/worlds');
  });
});
