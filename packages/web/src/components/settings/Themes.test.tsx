import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/lib/api';
import Themes from './Themes';

vi.mock('@/lib/api', () => ({
  api: {
    getConfig: vi.fn(),
    getThemes: vi.fn(),
  },
}));

vi.mock('../common/SyncControls', () => ({
  default: () => null,
}));

function createTheme(overrides: Record<string, unknown>) {
  return {
    description: 'A test preset',
    author: 'core',
    tags: [] as string[],
    is_builtin: true,
    colors: { background: '#101010', surface: '#181818', accent: '#ff8800', button: '#ff8800' },
    ...overrides,
  };
}

const themeFixtures = [
  createTheme({ name: 'light', display_name: 'Light' }),
  createTheme({ name: 'ember_night', display_name: 'Ember Night', tags: ['dark', 'warm'] }),
  createTheme({
    name: 'charcoal',
    display_name: 'Charcoal',
    description: 'Maeve’s custom preset',
    author: 'Maeve',
    tags: ['dark'],
    is_builtin: false,
  }),
];

function renderThemes() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/settings/themes']}>
        <Themes />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Themes manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getConfig).mockResolvedValue({ theme_name: 'ember_night' } as never);
    vi.mocked(api.getThemes).mockResolvedValue(themeFixtures as never);
  });

  it('renders the theme manager with every available preset and the active badge', async () => {
    renderThemes();

    expect(await screen.findByRole('heading', { name: 'Theme Manager' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Available Themes' })).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ember Night' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Charcoal' })).toBeInTheDocument();

    // The active preset is the one the config points at.
    expect(screen.getByText('Active preset')).toBeInTheDocument();
    expect(screen.getByText('Built-in themes')).toBeInTheDocument();
    expect(screen.getByText('Custom themes')).toBeInTheDocument();
  });

  it('filters presets by search text across name, author and description', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });

    fireEvent.change(screen.getByLabelText('Search presets'), { target: { value: 'maeve' } });

    expect(screen.getByRole('heading', { name: 'Charcoal' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ember Night' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Light' })).not.toBeInTheDocument();
  });

  it('filters presets by source', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });

    fireEvent.click(screen.getByRole('button', { name: 'Custom' }));

    expect(screen.getByRole('heading', { name: 'Charcoal' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ember Night' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Light' })).not.toBeInTheDocument();
  });
});
