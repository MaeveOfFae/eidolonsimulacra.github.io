import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { api } from '@/lib/api';
import Themes from './Themes';
import { findUnnamedTabStops, formatTabStops } from '../../test/tab-order';

vi.mock('@/lib/api', () => ({
  api: {
    getConfig: vi.fn(),
    getThemes: vi.fn(),
    importTheme: vi.fn(),
    duplicateTheme: vi.fn(),
    renameTheme: vi.fn(),
    updateTheme: vi.fn(),
  },
}));

vi.mock('../common/SyncControls', () => ({
  default: () => null,
}));

let importPayload: Record<string, unknown> | null = null;

vi.mock('../../utils/download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../utils/download')>()),
  pickFile: async () =>
    importPayload ? ({ text: async () => JSON.stringify(importPayload) } as unknown as File) : null,
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
  it('keeps every tab stop named', async () => {
    renderThemes();

    await waitFor(() => {
      expect((document.body.textContent ?? '').trim().length).toBeGreaterThan(100);
    });

    expect(findUnnamedTabStops(formatTabStops())).toEqual([]);
  });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getConfig).mockResolvedValue({ theme_name: 'ember_night' } as never);
    vi.mocked(api.getThemes).mockResolvedValue(themeFixtures as never);
    vi.mocked(api.importTheme).mockResolvedValue({ display_name: 'Imported' } as never);
    vi.mocked(api.duplicateTheme).mockResolvedValue(
      createTheme({ name: 'charcoal_copy', display_name: 'Charcoal Copy', is_builtin: false }) as never,
    );
    vi.mocked(api.renameTheme).mockResolvedValue(
      createTheme({ name: 'charcoal_renamed', display_name: 'Charcoal Renamed', is_builtin: false }) as never,
    );
    vi.mocked(api.updateTheme).mockResolvedValue(
      createTheme({ name: 'charcoal', display_name: 'Charcoal', is_builtin: false }) as never,
    );
    importPayload = null;
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

  it('filters presets by author chip and reports the visible count', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });

    expect(screen.getByText('Showing 3 of 3 presets.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Maeve' }));

    expect(screen.getByRole('heading', { name: 'Charcoal' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Light' })).not.toBeInTheDocument();
    expect(screen.getByText('Showing 1 of 3 presets.')).toBeInTheDocument();
  });

  it('reports the empty state and tracks the sort selection', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });

    fireEvent.change(screen.getByLabelText('Sort'), { target: { value: 'name-desc' } });
    fireEvent.change(screen.getByLabelText('Search presets'), { target: { value: 'zzz' } });

    expect(screen.getByLabelText('Sort')).toHaveValue('name-desc');
    expect(screen.getByText('Showing 0 of 3 presets.')).toBeInTheDocument();
    expect(screen.getByText('No themes match the current search and tag filters.')).toBeInTheDocument();
  });

  it('shows shared preset actions and hides the custom-only ones for built-ins', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });

    // Activate, Export and Duplicate are offered for every preset.
    expect(screen.getAllByRole('button', { name: 'Activate' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Export' })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: 'Duplicate' })).toHaveLength(3);

    // Renaming, editing details and deleting are custom-preset only.
    expect(screen.getAllByRole('button', { name: 'Rename' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Edit details' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1);
  });

  it('opens the duplicate form from the first alphabetical preset card', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });

    expect(screen.queryByText('Duplicate Theme')).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[0]!);

    expect(screen.getByText('Duplicate Theme')).toBeInTheDocument();
    // Presets default to Name A-Z by display name, so Charcoal leads the grid.
    expect(screen.getByPlaceholderText('theme name')).toHaveValue('charcoal_copy');
  });

  it('flags an import conflict for a built-in preset without offering an overwrite', async () => {
    importPayload = {
      name: 'ember_night',
      display_name: 'Ember Night Import',
      colors: { background: '#101010', surface: '#181818', accent: '#ff0000', button: '#ff8800' },
    };

    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });
    fireEvent.click(screen.getByRole('button', { name: 'Import preset' }));

    expect(await screen.findByRole('heading', { name: 'Import conflict detected' })).toBeInTheDocument();
    expect(screen.getByText(/which already exists as/)).toBeInTheDocument();
    expect(screen.getByText(/palette values differ/)).toBeInTheDocument();
    expect(screen.getByText('Existing preset')).toBeInTheDocument();
    expect(screen.getByText('Imported preset')).toBeInTheDocument();

    // A built-in preset cannot be overwritten, only imported under a new name.
    expect(screen.queryByRole('button', { name: 'Overwrite existing custom preset' })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('new preset name')).toHaveValue('ember_night_2');

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(screen.queryByRole('heading', { name: 'Import conflict detected' })).not.toBeInTheDocument();
  });

  it('imports the conflicting preset under a new name', async () => {
    importPayload = {
      name: 'ember_night',
      display_name: 'Ember Night Import',
      colors: { background: '#101010', surface: '#181818', accent: '#ff0000', button: '#ff8800' },
    };

    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });
    fireEvent.click(screen.getByRole('button', { name: 'Import preset' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Import renamed preset' }));

    await waitFor(() => {
      expect(api.importTheme).toHaveBeenCalledWith(expect.anything(), {
        conflict_strategy: 'rename',
        target_name: 'ember_night_2',
      });
    });
  });

  it('offers an overwrite when the conflicting preset is a custom one', async () => {
    importPayload = {
      name: 'charcoal',
      display_name: 'Charcoal Import',
      colors: { background: '#101010', surface: '#181818', accent: '#ff0000', button: '#ff8800' },
    };

    renderThemes();

    await screen.findByRole('heading', { name: 'Charcoal' });
    fireEvent.click(screen.getByRole('button', { name: 'Import preset' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Overwrite existing custom preset' }));

    await waitFor(() => {
      expect(api.importTheme).toHaveBeenCalledWith(expect.anything(), {
        conflict_strategy: 'overwrite',
        target_name: 'charcoal',
      });
    });
  });

  it('submits the duplicate form with the edited preset name', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Ember Night' });

    fireEvent.click(screen.getAllByRole('button', { name: 'Duplicate' })[0]!);
    fireEvent.change(screen.getByPlaceholderText('theme name'), { target: { value: 'charcoal_night' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create copy' }));

    await waitFor(() => {
      expect(api.duplicateTheme).toHaveBeenCalledWith(
        'charcoal',
        expect.objectContaining({ new_name: 'charcoal_night' }),
      );
    });
  });

  it('cancels the rename form without renaming', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Charcoal' });

    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));

    expect(screen.getByText('Rename Theme')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('theme name')).toHaveValue('charcoal');

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByText('Rename Theme')).not.toBeInTheDocument();
    expect(api.renameTheme).not.toHaveBeenCalled();
  });

  it('saves the edited theme details', async () => {
    renderThemes();

    await screen.findByRole('heading', { name: 'Charcoal' });

    fireEvent.click(screen.getByRole('button', { name: 'Edit details' }));

    expect(screen.getByText('Edit Theme Details')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('author'), { target: { value: 'Maeve O.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save details' }));

    await waitFor(() => {
      expect(api.updateTheme).toHaveBeenCalledWith('charcoal', expect.objectContaining({ author: 'Maeve O.' }));
    });
  });
});
