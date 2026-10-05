import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import type { DraftMetadata } from '@char-gen/shared';
import QuickActionsPalette from './QuickActionsPalette';

function draft(overrides: Partial<DraftMetadata> & { review_id: string }): DraftMetadata {
  return { seed: '', favorite: false, ...overrides };
}

const DRAFTS: DraftMetadata[] = [
  draft({ review_id: 'iris', seed: 'a frost giant', modified: '2024-06-01T00:00:00.000Z', character_name: 'Iris' }),
];

function DraftScreen() {
  const { id } = useParams<{ id: string }>();
  return <span>draft screen {id}</span>;
}

function renderPalette({ isOpen = true, drafts = DRAFTS, onClose = vi.fn() } = {}) {
  const view = render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <span>home screen</span>
              <QuickActionsPalette isOpen={isOpen} onClose={onClose} drafts={drafts} />
            </>
          }
        />
        <Route path="/data" element={<span>data screen</span>} />
        <Route path="/drafts/:id" element={<DraftScreen />} />
      </Routes>
    </MemoryRouter>,
  );

  return { ...view, onClose };
}

const searchBox = () => screen.getByRole('combobox');
const selectedOptions = () =>
  screen.getAllByRole('option').filter((option) => option.getAttribute('aria-selected') === 'true');

describe('QuickActionsPalette', () => {
  it('renders nothing while closed', () => {
    renderPalette({ isOpen: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('home screen')).toBeInTheDocument();
  });

  it('opens with screens and recent drafts, focused and with the first screen active', () => {
    renderPalette();

    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument();
    expect(screen.getByText('Screens')).toBeInTheDocument();
    expect(screen.getByText('Recent drafts')).toBeInTheDocument();
    expect(searchBox()).toHaveFocus();

    const selected = selectedOptions();
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveTextContent('Home');
    expect(document.body).toHaveClass('modal-open');
  });

  it('lists recent drafts with their character names', () => {
    renderPalette();

    expect(screen.getByRole('option', { name: /Iris/ })).toBeInTheDocument();
  });

  it('filters to a single screen and drops the empty section', () => {
    renderPalette();

    fireEvent.change(searchBox(), { target: { value: 'backup' } });

    expect(screen.getAllByRole('option')).toHaveLength(1);
    expect(screen.getByRole('option', { name: /Data Manager/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Recent drafts')).not.toBeInTheDocument();
  });

  it('reports when nothing matches', () => {
    renderPalette();

    fireEvent.change(searchBox(), { target: { value: 'zzzzz' } });

    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.getByText('No screens or drafts match that search.')).toBeInTheDocument();
  });

  it('moves and wraps the highlight with the arrow keys', () => {
    renderPalette();

    expect(selectedOptions()[0]).toHaveTextContent('Home');

    fireEvent.keyDown(searchBox(), { key: 'ArrowDown' });
    expect(selectedOptions()[0]).toHaveTextContent('Generate');

    fireEvent.keyDown(searchBox(), { key: 'ArrowUp' });
    expect(selectedOptions()[0]).toHaveTextContent('Home');

    fireEvent.keyDown(searchBox(), { key: 'ArrowUp' });
    // Wraps to the last entry in the list, which is the most recent draft.
    expect(selectedOptions()[0]).toHaveTextContent('Iris');
  });

  it('follows the mouse highlight', () => {
    renderPalette();

    fireEvent.mouseEnter(screen.getByRole('option', { name: /Templates/ }));

    expect(selectedOptions()[0]).toHaveTextContent('Templates');
  });

  it('navigates to the active screen on Enter and closes', () => {
    const { onClose } = renderPalette();

    fireEvent.change(searchBox(), { target: { value: 'backup' } });
    fireEvent.keyDown(searchBox(), { key: 'Enter' });

    expect(screen.getByText('data screen')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('navigates a recent draft to its review screen', () => {
    renderPalette();

    fireEvent.click(screen.getByRole('option', { name: /Iris/ }));

    expect(screen.getByText('draft screen iris')).toBeInTheDocument();
  });

  it('closes on Escape and on a backdrop click', () => {
    const { onClose } = renderPalette();

    fireEvent.keyDown(searchBox(), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('releases the body scroll lock when it unmounts', () => {
    const { unmount } = renderPalette();
    expect(document.body).toHaveClass('modal-open');

    unmount();
    expect(document.body).not.toHaveClass('modal-open');
  });
});

describe('QuickActionsPalette workspace modes', () => {
  function renderPaletteWithMode(modeId: 'draft' | 'review' | 'bulk') {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<QuickActionsPalette isOpen onClose={vi.fn()} drafts={[]} modeId={modeId} />} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('opens on the active mode screens', () => {
    renderPaletteWithMode('bulk');

    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Batch'),
        expect.stringContaining('Compare'),
        expect.stringContaining('Insights'),
      ]),
    );
    expect(selectedOptions()[0]).toHaveTextContent('Batch');
  });

  it('promotes the review screens instead in review mode', () => {
    renderPaletteWithMode('review');

    expect(selectedOptions()[0]).toHaveTextContent('Library');
  });
});
