import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorldDetailEditorPanel from './WorldDetailEditorPanel';
import { api } from '@/lib/api';
import type { WorldRecord } from '@char-gen/shared';

vi.mock('@/lib/api', () => ({
  api: {
    getDrafts: vi.fn(),
    getTimeline: vi.fn(),
    updateWorld: vi.fn(),
    deleteWorld: vi.fn(),
    addWorldCharacter: vi.fn(),
    updateWorldCharacter: vi.fn(),
    deleteWorldCharacter: vi.fn(),
    addWorldFaction: vi.fn(),
    updateWorldFaction: vi.fn(),
    deleteWorldFaction: vi.fn(),
    addWorldRelationship: vi.fn(),
    updateWorldRelationship: vi.fn(),
    deleteWorldRelationship: vi.fn(),
    createTimeline: vi.fn(),
    updateTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    addTimelineEvent: vi.fn(),
    updateTimelineEvent: vi.fn(),
    deleteTimelineEvent: vi.fn(),
    addWorldLocation: vi.fn(),
    updateWorldLocation: vi.fn(),
    deleteWorldLocation: vi.fn(),
  },
}));

const TIMESTAMP = '2026-01-01T00:00:00.000Z';

const world: WorldRecord = {
  id: 'world-1',
  userId: 'user-1',
  name: 'Alpha Station',
  description: 'A station at the edge of the charted lanes',
  tags: [],
  isPublic: false,
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  characters: [
    { id: 'char-1', worldId: 'world-1', characterName: 'Maeve', createdAt: TIMESTAMP, updatedAt: TIMESTAMP },
  ],
  factions: [
    {
      id: 'faction-1',
      worldId: 'world-1',
      name: 'Dock Guild',
      role: 'Trade',
      tags: [],
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
  ],
  locations: [
    { id: 'loc-1', worldId: 'world-1', name: 'The Spire', tags: [], createdAt: TIMESTAMP, updatedAt: TIMESTAMP },
  ],
  relationships: [],
  timelines: [
    {
      id: 'timeline-1',
      worldId: 'world-1',
      userId: 'user-1',
      name: 'Main thread',
      tags: [],
      createdAt: TIMESTAMP,
      updatedAt: TIMESTAMP,
    },
  ],
};

function renderPanel() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const onRefresh = vi.fn(async () => undefined);

  render(
    <QueryClientProvider client={queryClient}>
      <WorldDetailEditorPanel world={world} canEdit onRefresh={onRefresh} />
    </QueryClientProvider>,
  );

  return { onRefresh };
}

describe('WorldDetailEditorPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getDrafts).mockResolvedValue({
      drafts: [{ review_id: 'draft-1', seed: 'a lonely space pirate', character_name: 'Vesna', favorite: false }],
      total: 1,
      stats: { total_drafts: 1, archived_drafts: 0, favorites: 0, by_genre: {}, by_mode: {} },
    } as never);
    vi.mocked(api.getTimeline).mockResolvedValue({ timeline: { ...world.timelines![0]!, events: [] } } as never);
    vi.mocked(api.addWorldFaction).mockResolvedValue({ faction: world.factions![0] } as never);
    vi.mocked(api.updateWorldFaction).mockResolvedValue({ faction: world.factions![0] } as never);
    vi.mocked(api.addWorldLocation).mockResolvedValue({ location: world.locations![0] } as never);
    vi.mocked(api.createTimeline).mockResolvedValue({ timeline: world.timelines![0] } as never);
    vi.mocked(api.addTimelineEvent).mockResolvedValue({ event: {} } as never);
    vi.mocked(api.updateTimelineEvent).mockResolvedValue({ event: {} } as never);
  });

  it('opens on world details with tab counts', () => {
    renderPanel();

    expect(screen.getByText('World details')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Characters 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Factions 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Locations 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Relationships 0' })).toBeInTheDocument();
  });

  it('adds a faction through the factions tab', async () => {
    const { onRefresh } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Factions 1' }));
    fireEvent.change(screen.getByPlaceholderText('Faction name'), { target: { value: '  Couriers  ' } });
    fireEvent.change(screen.getByPlaceholderText('Role / pressure'), { target: { value: 'Message runners' } });
    fireEvent.change(screen.getByPlaceholderText('Faction description'), { target: { value: 'Runs the post.' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add faction' }));

    await waitFor(() => {
      expect(api.addWorldFaction).toHaveBeenCalledWith('world-1', {
        name: 'Couriers',
        role: 'Message runners',
        description: 'Runs the post.',
        draftIds: [],
      });
    });
    expect(await screen.findByText('Faction added.')).toBeInTheDocument();
    expect(onRefresh).toHaveBeenCalled();
  });

  it('edits a faction in place with trimmed values', async () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Factions 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    fireEvent.change(screen.getByDisplayValue('Dock Guild'), { target: { value: 'Dock Guild Reformed' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(api.updateWorldFaction).toHaveBeenCalledWith('world-1', 'faction-1', {
        name: 'Dock Guild Reformed',
        role: 'Trade',
        description: undefined,
        draftIds: [],
      });
    });
  });

  it('adds a location through the locations tab', async () => {
    const { onRefresh } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Locations 1' }));
    fireEvent.change(screen.getByPlaceholderText('Location name'), { target: { value: 'The Undercroft' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add location' }));

    await waitFor(() => {
      expect(api.addWorldLocation).toHaveBeenCalledWith('world-1', {
        name: 'The Undercroft',
        category: undefined,
        description: undefined,
        draftIds: [],
      });
    });
    expect(await screen.findByText('Location added.')).toBeInTheDocument();
    expect(onRefresh).toHaveBeenCalled();
  });

  it('creates a timeline with trimmed values', async () => {
    const { onRefresh } = renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Timelines 1' }));
    fireEvent.change(screen.getByPlaceholderText('Timeline name'), { target: { value: '  Second thread  ' } });
    fireEvent.change(screen.getByPlaceholderText('Timeline description'), { target: { value: '  Later events  ' } });

    fireEvent.click(screen.getByRole('button', { name: 'Add timeline' }));

    await waitFor(() => {
      expect(api.createTimeline).toHaveBeenCalledWith({
        worldId: 'world-1',
        name: 'Second thread',
        description: 'Later events',
      });
    });
    expect(await screen.findByText('Timeline created.')).toBeInTheDocument();
    expect(onRefresh).toHaveBeenCalled();
  });

  it('adds an event to the timeline selected by default', async () => {
    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Timelines 1' }));

    // The first timeline is selected by default, so its event editor is live.
    await waitFor(() => expect(api.getTimeline).toHaveBeenCalledWith('timeline-1'));

    fireEvent.change(await screen.findByPlaceholderText('Event title'), {
      target: { value: 'The fall of the Spire' },
    });
    fireEvent.change(screen.getByPlaceholderText('Event date (optional)'), { target: { value: '  Year 400  ' } });
    fireEvent.change(screen.getByPlaceholderText('Event description'), {
      target: { value: 'The spire collapsed.' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add event' }));

    await waitFor(() => {
      expect(api.addTimelineEvent).toHaveBeenCalledWith('timeline-1', {
        title: 'The fall of the Spire',
        eventDate: 'Year 400',
        description: 'The spire collapsed.',
      });
    });
    expect(await screen.findByText('Timeline event added.')).toBeInTheDocument();
  });

  it('reorders events with the arrows and disables the edge arrows', async () => {
    vi.mocked(api.getTimeline).mockResolvedValue({
      timeline: {
        ...world.timelines![0]!,
        events: [
          {
            id: 'event-1',
            timelineId: 'timeline-1',
            title: 'First',
            sortOrder: 0,
            tags: [],
            metadata: {},
            createdAt: TIMESTAMP,
            updatedAt: TIMESTAMP,
          },
          {
            id: 'event-2',
            timelineId: 'timeline-1',
            title: 'Second',
            sortOrder: 1,
            tags: [],
            metadata: {},
            createdAt: TIMESTAMP,
            updatedAt: TIMESTAMP,
          },
        ],
      },
    } as never);

    renderPanel();

    fireEvent.click(screen.getByRole('button', { name: 'Timelines 1' }));

    const downButtons = await screen.findAllByRole('button', { name: 'Move event down' });
    expect(downButtons).toHaveLength(2);
    // The first event cannot move up, and the last cannot move down.
    expect(screen.getAllByRole('button', { name: 'Move event up' })[0]).toBeDisabled();
    expect(downButtons[1]).toBeDisabled();

    fireEvent.click(downButtons[0]!);

    await waitFor(() => {
      expect(api.updateTimelineEvent).toHaveBeenCalledTimes(2);
    });
    expect(vi.mocked(api.updateTimelineEvent).mock.calls).toEqual([
      ['timeline-1', 'event-2', { sortOrder: 0 }],
      ['timeline-1', 'event-1', { sortOrder: 1 }],
    ]);
  });
});
