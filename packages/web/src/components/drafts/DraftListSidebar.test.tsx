import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { DraftLibraryFilter } from '@char-gen/shared';
import type { SavedSearchRecord } from '@char-gen/shared';
import { DraftListSidebar } from './DraftListSidebar';

const state = vi.hoisted(() => ({
  saved: [] as SavedSearchRecord[],
  bulkCalls: [] as Array<{ ids: string[]; updates: Record<string, unknown> }>,
  draftsChanged: 0,
}));

vi.mock('@/lib/drafts/saved-searches', () => ({
  SAVED_SEARCHES_CHANGED_EVENT: 'eidolon:draft-library-saved-searches-changed',
  getSavedSearches: vi.fn(() => [...state.saved]),
  saveSavedSearch: vi.fn((name: string, filter: DraftLibraryFilter) => {
    const record: SavedSearchRecord = {
      id: `saved-${state.saved.length + 1}`,
      name,
      filter,
      createdAt: new Date().toISOString(),
    };
    state.saved = [record, ...state.saved];
    return record;
  }),
  deleteSavedSearch: vi.fn((id: string) => {
    state.saved = state.saved.filter((entry) => entry.id !== id);
  }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    updateDraftsMetadata: vi.fn(async (ids: readonly string[], updates: Record<string, unknown>) => {
      state.bulkCalls.push({ ids: [...ids], updates });
      return ids.length;
    }),
  },
}));

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/drafts']}>
      <DraftListSidebar
        drafts={[
          {
            review_id: 'd-1',
            seed: 'a lonely space pirate',
            favorite: false,
            character_name: 'Vesna',
            created: '2026-09-01T00:00:00.000Z',
            modified: '2026-09-02T00:00:00.000Z',
          },
          {
            review_id: 'd-2',
            seed: 'night court archivist',
            favorite: false,
            character_name: 'Maeve',
            created: '2026-09-03T00:00:00.000Z',
            modified: '2026-09-04T00:00:00.000Z',
          },
        ]}
        onDraftsChanged={() => {
          state.draftsChanged += 1;
        }}
      />
    </MemoryRouter>,
  );
}

describe('DraftListSidebar saved searches and bulk actions', () => {
  beforeEach(() => {
    state.saved = [];
    state.bulkCalls = [];
    state.draftsChanged = 0;
    localStorage.clear();
  });

  it('saves the current filter under a name', () => {
    renderSidebar();

    fireEvent.change(screen.getByPlaceholderText('Search drafts...'), { target: { value: 'pirate' } });
    fireEvent.change(screen.getByLabelText('Saved search name'), { target: { value: 'Pirate searches' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(state.saved).toHaveLength(1);
    expect(state.saved[0]).toMatchObject({ name: 'Pirate searches' });
    expect(state.saved[0]?.filter).toMatchObject({ search: 'pirate' });
  });

  it('runs a bulk favorite across selected drafts and refreshes', async () => {
    renderSidebar();

    fireEvent.click(screen.getByLabelText('Select Vesna'));
    fireEvent.click(screen.getByLabelText('Select Maeve'));

    expect(screen.getByText('2 selected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Favorite/ }));

    await waitFor(() => {
      expect(state.bulkCalls).toHaveLength(1);
    });
    expect(state.bulkCalls[0]?.ids.sort()).toEqual(['d-1', 'd-2']);
    expect(state.bulkCalls[0]?.updates).toEqual({ favorite: true });
    expect(state.draftsChanged).toBe(1);

    // The bulk bar clears once the operation finishes.
    await waitFor(() => {
      expect(screen.queryByText('2 selected')).not.toBeInTheDocument();
    });
  });
});
