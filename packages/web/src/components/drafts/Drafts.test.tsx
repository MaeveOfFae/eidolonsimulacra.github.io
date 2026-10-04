import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/lib/api';
import type { FavoriteSeedRecord, SeedRunRecord } from '@/lib/seed-generator';
import Drafts from './Drafts';

const seedState = vi.hoisted(() => ({
  favorites: [] as Array<{ seed: string; addedAt: string; lastUsedAt?: string }>,
  history: [] as Array<{
    id: string;
    createdAt: string;
    seeds: string[];
    request: { count: number; genreLines: string };
  }>,
  archivedSeeds: [] as string[],
  archivedRuns: [] as string[],
}));

vi.mock('@/lib/seed-generator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/seed-generator')>();
  return {
    ...actual,
    getFavoriteSeeds: () => [...seedState.favorites] as unknown as FavoriteSeedRecord[],
    getSeedRunHistory: () => [...seedState.history] as unknown as SeedRunRecord[],
    getArchivedFavoriteSeeds: () => [] as FavoriteSeedRecord[],
    getArchivedSeedRuns: () => [] as SeedRunRecord[],
    archiveFavoriteSeed: (seed: string) => {
      seedState.archivedSeeds.push(seed);
    },
    archiveSeedRun: (id: string) => {
      seedState.archivedRuns.push(id);
    },
  };
});

vi.mock('@/lib/api', () => ({
  api: {
    getDrafts: vi.fn(),
    getTemplates: vi.fn(async () => []),
    getDraft: vi.fn(async () => ({ metadata: { review_id: 'd-1' }, assets: [] })),
    getWorldCharacterDraftLinks: vi.fn(async () => ({ links: [] })),
    restoreDraft: vi.fn(async () => ({})),
    deleteDraft: vi.fn(async () => ({})),
    createDraft: vi.fn(async () => ({ metadata: { review_id: 'd-new' } })),
    createDraftSnapshot: vi.fn(async () => ({})),
    updateDraftsMetadata: vi.fn(async () => 0),
  },
}));

vi.mock('../common/GuidedTourContext', () => ({
  useGuidedTour: () => ({
    isTourCompleted: () => true,
    restartTour: vi.fn(),
    startTour: vi.fn(),
  }),
}));

vi.mock('../common/SyncControls', () => ({
  default: ({ label }: { label: string }) => <div data-testid="sync-controls">{`sync:${label}`}</div>,
}));

// The comparison panel owns its own draft fetching; the library composition is what
// these characterization tests pin down.
vi.mock('./DraftComparisonPanel', () => ({
  DraftComparisonPanel: () => <div data-testid="comparison-panel" />,
}));

const TIMESTAMP = '2026-09-01T00:00:00.000Z';

const activeDrafts = [
  {
    review_id: 'd-1',
    seed: 'a lonely space pirate',
    favorite: false,
    character_name: 'Vesna',
    created: TIMESTAMP,
    modified: '2026-09-02T00:00:00.000Z',
  },
  {
    review_id: 'd-2',
    seed: 'night court archivist',
    favorite: true,
    character_name: 'Maeve',
    created: TIMESTAMP,
    modified: '2026-09-04T00:00:00.000Z',
  },
];

const draftStats = {
  total_drafts: 2,
  archived_drafts: 1,
  favorites: 1,
  by_genre: { fantasy: 1 },
};

function renderDrafts(options: { drafts?: unknown[]; archivedDrafts?: unknown[]; entry?: string } = {}) {
  const drafts = options.drafts ?? activeDrafts;
  const archivedDrafts = options.archivedDrafts ?? [];

  vi.mocked(api.getDrafts).mockImplementation(async (params?: { archived?: boolean }) => {
    if (params?.archived) {
      return { drafts: archivedDrafts, stats: draftStats } as never;
    }

    return { drafts, stats: draftStats } as never;
  });

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[options.entry ?? '/drafts']}>
        <Drafts />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Drafts library screen', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    seedState.favorites = [];
    seedState.history = [];
    seedState.archivedSeeds = [];
    seedState.archivedRuns = [];
  });

  it('renders the library hero and overview for saved drafts', async () => {
    renderDrafts();

    expect(await screen.findByText('Browse saved work')).toBeInTheDocument();

    expect(await screen.findByText('Library overview')).toBeInTheDocument();
    // The count shows both on the tab bar and in the overview pill.
    expect(screen.getAllByText('2 drafts').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('Vesna')).toBeInTheDocument();
    expect(screen.getByText('Maeve')).toBeInTheDocument();
  });

  it('shows the empty state when no drafts exist', async () => {
    renderDrafts({ drafts: [] });

    expect(await screen.findByText('No drafts yet')).toBeInTheDocument();
    expect(screen.getByText('Generate your first character to get started')).toBeInTheDocument();
    expect(screen.queryByText('Library overview')).not.toBeInTheDocument();
  });

  it('lists archived drafts and their counts on the archive tab', async () => {
    renderDrafts({
      entry: '/drafts?tab=archive',
      archivedDrafts: [
        {
          review_id: 'd-archived',
          seed: 'retired sky captain',
          character_name: 'Rook',
          created: TIMESTAMP,
          modified: TIMESTAMP,
          archived_at: TIMESTAMP,
        },
      ],
    });

    expect(await screen.findByText('Archived drafts')).toBeInTheDocument();
    expect(screen.getByText('1 archived items')).toBeInTheDocument();
    expect(screen.getByText('Rook')).toBeInTheDocument();
    expect(screen.getByText('Restore')).toBeInTheDocument();
  });

  it('falls back to the drafts tab when the workbench has nothing to compare', async () => {
    renderDrafts({ drafts: [], entry: '/drafts?tab=workbench' });

    await waitFor(() => {
      expect(screen.getByText('No drafts yet')).toBeInTheDocument();
    });
  });

  it('shows the seeds tab empty states when nothing is saved', async () => {
    renderDrafts({ entry: '/drafts?tab=seeds' });

    expect(await screen.findByText('No favorite seeds yet')).toBeInTheDocument();
    expect(screen.getByText('No recent seed runs yet.')).toBeInTheDocument();
    expect(screen.getByText('0 saved')).toBeInTheDocument();
  });

  it('lists saved seeds and runs on the seeds tab and archives a favorite', async () => {
    seedState.favorites = [{ seed: 'a lonely space pirate', addedAt: TIMESTAMP }];
    seedState.history = [
      {
        id: 'run-1',
        createdAt: TIMESTAMP,
        seeds: ['first seed', 'second seed', 'third seed'],
        request: { count: 3, genreLines: 'space opera' },
      },
    ];

    renderDrafts({ entry: '/drafts?tab=seeds' });

    expect(await screen.findByText('a lonely space pirate')).toBeInTheDocument();
    expect(screen.getByText('1 saved')).toBeInTheDocument();
    expect(screen.getByText('3 generated seeds')).toBeInTheDocument();
    expect(screen.getByText('first seed')).toBeInTheDocument();

    const favoriteArticle = screen.getByText('a lonely space pirate').closest('article');
    fireEvent.click(within(favoriteArticle!).getByRole('button', { name: 'Archive' }));

    expect(seedState.archivedSeeds).toEqual(['a lonely space pirate']);

    const runArticle = screen.getByText('3 generated seeds').closest('article');
    fireEvent.click(within(runArticle!).getByRole('button', { name: 'Archive run' }));

    expect(seedState.archivedRuns).toEqual(['run-1']);
  });

  it('redirects the worlds tab to the worlds route instead of rendering the staged shelf', async () => {
    renderDrafts({ entry: '/drafts?tab=worlds' });

    // The screen navigates away from `?tab=worlds`, so the tab falls back to drafts.
    expect(await screen.findByText('Library overview')).toBeInTheDocument();
    expect(screen.queryByText('World library')).not.toBeInTheDocument();
  });

  it('redirects the timelines tab to the timelines route instead of rendering staged modules', async () => {
    renderDrafts({ entry: '/drafts?tab=timelines' });

    expect(await screen.findByText('Library overview')).toBeInTheDocument();
    expect(screen.queryByText('Timeline modules')).not.toBeInTheDocument();
  });
});
