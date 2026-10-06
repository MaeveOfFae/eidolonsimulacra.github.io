import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ChubPublishPanel from './ChubPublishPanel';
import { runChubPublish, type ChubPublishOutcome } from '@/lib/chub/publish';
import { api } from '@/lib/api';

vi.mock('@/lib/chub/publish', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/chub/publish')>()),
  runChubPublish: vi.fn(),
}));

vi.mock('@/lib/chub/transport', () => ({
  getChubFetch: vi.fn(),
  describeChubError: vi.fn((error: unknown) => (error instanceof Error ? error.message : 'failed')),
}));

const configState = vi.hoisted(() => ({
  chub: undefined as unknown,
}));

vi.mock('@/lib/config', () => ({
  configManager: {
    getConfig: () => ({ chub: configState.chub }),
  },
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useParams: () => ({ id: 'draft-1' }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    getDraft: vi.fn(),
    updateMetadata: vi.fn(),
  },
}));

const mockedPublish = vi.mocked(runChubPublish);
const mockedGetDraft = vi.mocked(api.getDraft);
const mockedUpdateMetadata = vi.mocked(api.updateMetadata);

// The panel re-reads the draft after updateMetadata; mirror persistence so the
// publish record shows up on refetch like it would in the real store.
let currentDraft: { path: string; metadata: Record<string, unknown>; assets: Record<string, string> } | null = null;

const DRAFT = {
  path: 'alice',
  metadata: {
    review_id: 'draft-1',
    seed: 's',
    favorite: false,
    character_name: 'Alice',
    mode: 'SFW',
    tags: ['oc', 'SFW', 'student'],
  },
  assets: {
    character_sheet: 'Persona prose.',
    creator_notes: 'Notes prose.',
    intro_scene: 'Hey {{user}}, I am Alice.',
    post_history: '',
    system_prompt: '',
  },
};

const CREATED_OUTCOME: ChubPublishOutcome = {
  status: 'created',
  record: {
    character_id: 211500,
    username: 'maeve',
    pathname: 'alice-9f2',
    full_path: 'maeve/alice-9f2',
    name: 'Alice',
    published_at: '2026-10-06T12:00:00.000Z',
  },
  message: 'Published maeve/alice-9f2 to Chub.',
};

function renderPanel(approved: boolean, draft: unknown = DRAFT) {
  currentDraft = JSON.parse(JSON.stringify(draft)) as typeof currentDraft;
  mockedGetDraft.mockImplementation(async () => JSON.parse(JSON.stringify(currentDraft)) as never);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ChubPublishPanel approved={approved} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

const CONNECTED_CHUB = {
  base_url: 'https://gateway.chub.ai',
  api_token: 'sess-token',
  publish_token: '',
  username: 'maeve',
  subscription: 'Full',
  verified_at: '2026-10-06T00:00:00.000Z',
};

beforeEach(() => {
  mockedPublish.mockReset();
  mockedGetDraft.mockReset();
  mockedUpdateMetadata.mockReset().mockImplementation(async (_id, updates) => {
    if (currentDraft) {
      Object.assign(currentDraft.metadata, updates);
    }
    return { status: 'updated', draft_id: 'draft-1' } as never;
  });
  configState.chub = CONNECTED_CHUB;
});

describe('ChubPublishPanel', () => {
  it('gates publishing on the character sheet approval and says so', async () => {
    renderPanel(false);
    const button = await screen.findByRole('button', { name: /publish to chub/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/approve the character sheet to enable publishing/i)).toBeInTheDocument();
  });

  it('shows the connect hint when no token is stored', async () => {
    configState.chub = { ...CONNECTED_CHUB, api_token: '', username: '' };
    renderPanel(true);
    expect(await screen.findByText(/connect your chub\.ai account first/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /publish to chub/i })).not.toBeInTheDocument();
  });

  it('publishes, stores the record on the draft, and reports success', async () => {
    mockedPublish.mockResolvedValue(CREATED_OUTCOME);
    renderPanel(true);

    fireEvent.click(await screen.findByRole('button', { name: /publish to chub/i }));

    await waitFor(() => expect(mockedPublish).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByText(/Published maeve\/alice-9f2 to Chub\./)).toBeInTheDocument());
    expect(mockedUpdateMetadata).toHaveBeenCalledWith('draft-1', { chub_publish: CREATED_OUTCOME.record });
    expect(screen.getByRole('link', { name: /maeve\/alice-9f2/i })).toHaveAttribute(
      'href',
      'https://chub.ai/characters/maeve/alice-9f2',
    );
  });

  it('blocks preflight errors before the request runs', async () => {
    renderPanel(true, {
      ...DRAFT,
      assets: { ...DRAFT.assets, intro_scene: '' },
    });
    const button = await screen.findByRole('button', { name: /publish to chub/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/first message \(intro scene\) is empty/i)).toBeInTheDocument();
    fireEvent.click(button);
    expect(mockedPublish).not.toHaveBeenCalled();
  });

  it('offers an update action once a publish record exists', async () => {
    renderPanel(true, {
      ...DRAFT,
      metadata: {
        ...DRAFT.metadata,
        chub_publish: CREATED_OUTCOME.record,
      },
    });
    expect(await screen.findByRole('button', { name: /update on chub/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /maeve\/alice-9f2/i })).toBeInTheDocument();
  });

  it('surfaces publish failures readably', async () => {
    mockedPublish.mockRejectedValue(new Error('Chub answered HTTP 422: Field required'));
    renderPanel(true);
    fireEvent.click(await screen.findByRole('button', { name: /publish to chub/i }));
    await waitFor(() => expect(screen.getByText(/HTTP 422/)).toBeInTheDocument());
  });
});
