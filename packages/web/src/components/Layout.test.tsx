import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { primaryNavEntries } from '@/lib/navigation/route-catalog';

vi.mock('../lib/api', () => ({
  api: {
    getDrafts: vi.fn(async () => ({ drafts: [], stats: { total_drafts: 0, favorites: 0 }, filters: {} })),
  },
  DRAFTS_SYNCED_EVENT: 'drafts-synced',
}));

/** The top-level nav items are the `<nav>`'s direct link children. */
function sidebarOrder(container: HTMLElement): (string | null)[] {
  return Array.from(container.querySelectorAll('nav > a')).map((link) => link.getAttribute('href'));
}

function renderLayoutAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Layout>
          <div data-testid="screen" />
        </Layout>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Layout sidebar order', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps the catalog order while Auto mode follows the screen', () => {
    const { container } = renderLayoutAt('/generate');

    // Auto (the default) names the frame after the screen but never reorders.
    expect(sidebarOrder(container)).toEqual(primaryNavEntries.map((entry) => entry.path));

    // Navigating must not move items under the pointer: clicking Library used
    // to promote the review screens to the top and shuffle everything else.
    fireEvent.click(screen.getByRole('link', { name: 'Library' }));

    expect(sidebarOrder(container)).toEqual(primaryNavEntries.map((entry) => entry.path));
    // The screen still gets named after the mode it belongs to.
    expect(screen.getByText('Following this screen: Review')).toBeInTheDocument();
  });

  it('reorders only when a mode is picked explicitly', () => {
    const { container } = renderLayoutAt('/generate');

    fireEvent.click(screen.getByRole('button', { name: 'Review' }));

    expect(sidebarOrder(container)[0]).toBe('/drafts');
    expect(screen.queryByText(/Following this screen/)).not.toBeInTheDocument();
  });
});
