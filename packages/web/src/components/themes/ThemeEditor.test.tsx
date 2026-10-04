import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/lib/api';
import ThemeEditor from './ThemeEditor';

vi.mock('@/lib/api', () => ({
  api: {
    getConfig: vi.fn(),
    getThemes: vi.fn(),
    createTheme: vi.fn(),
    activateTheme: vi.fn(),
    updateTheme: vi.fn(),
    duplicateTheme: vi.fn(),
    renameTheme: vi.fn(),
    deleteTheme: vi.fn(),
    exportTheme: vi.fn(),
    importTheme: vi.fn(),
  },
}));

vi.mock('../common/SyncControls', () => ({
  default: () => <div data-testid="sync-controls" />,
}));

const themeFixtures = [
  {
    name: 'light',
    display_name: 'Light',
    description: 'A test preset',
    author: 'core',
    tags: [] as string[],
    is_builtin: true,
    colors: { background: '#101010', surface: '#181818', accent: '#ff8800', button: '#ff8800' },
  },
  {
    name: 'charcoal',
    display_name: 'Charcoal',
    description: 'A custom preset',
    author: 'Maeve',
    tags: ['dark'],
    is_builtin: false,
    colors: { background: '#101010', surface: '#181818', accent: '#ff8800', button: '#ff8800' },
  },
];

function renderEditor(props: { showHeader?: boolean; showSyncControls?: boolean } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/theme-studio']}>
        <ThemeEditor {...props} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ThemeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getConfig).mockResolvedValue({ theme_name: 'light' } as never);
    vi.mocked(api.getThemes).mockResolvedValue(themeFixtures as never);
  });

  it('renders the shared manager with its page header by default', async () => {
    renderEditor();

    // Full share: the studio embed now uses the manager's own header and filters.
    expect(await screen.findByRole('heading', { name: 'Theme Manager' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Available Themes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Charcoal' })).toBeInTheDocument();
    expect(screen.getByTestId('sync-controls')).toBeInTheDocument();
  });

  it('hides the page header and sync panel when embedded in the theme studio', async () => {
    renderEditor({ showHeader: false, showSyncControls: false });

    expect(await screen.findByRole('heading', { name: 'Available Themes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Charcoal' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Theme Manager' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('sync-controls')).not.toBeInTheDocument();
  });

  it('filters presets with the shared filter row', async () => {
    renderEditor({ showHeader: false, showSyncControls: false });

    await screen.findByRole('heading', { name: 'Charcoal' });

    fireEvent.change(screen.getByLabelText('Search presets'), { target: { value: 'maeve' } });

    expect(screen.getByRole('heading', { name: 'Charcoal' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Light' })).not.toBeInTheDocument();

    // The source filter is the manager's chip row, not the old select.
    fireEvent.click(screen.getByRole('button', { name: 'Built-in' }));

    expect(screen.queryByRole('heading', { name: 'Charcoal' })).not.toBeInTheDocument();
  });
});
