import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Draft, DraftMetadata } from '@char-gen/shared';
import { api } from '@/lib/api';
import { DraftComparisonPanel } from './DraftComparisonPanel';

vi.mock('@/lib/api', () => ({
  api: {
    getDraft: vi.fn(),
    createDraft: vi.fn(),
    createDraftSnapshot: vi.fn(),
    updateAsset: vi.fn(),
    updateMetadata: vi.fn(),
  },
}));

const TIMESTAMP = '2026-09-01T00:00:00.000Z';

const draftOptions: DraftMetadata[] = [
  { review_id: 'd-1', seed: 'a lonely space pirate', favorite: false, model: 'gpt-4o', character_name: 'Draft A' },
  { review_id: 'd-2', seed: 'a lonely space pirate', favorite: false, model: 'gpt-4o', character_name: 'Draft B' },
];

function makeDraft(reviewId: string, characterName: string, templateName: string): Draft {
  return {
    metadata: {
      review_id: reviewId,
      seed: 'a lonely space pirate',
      favorite: false,
      model: 'gpt-4o',
      character_name: characterName,
      template_name: templateName,
      mode: 'card',
      created_at: TIMESTAMP,
      updated_at: TIMESTAMP,
    },
    assets: {},
  } as unknown as Draft;
}

const LEFT_DRAFT = makeDraft('d-1', 'Draft A', 'V2/V3 Card');
const RIGHT_DRAFT = makeDraft('d-2', 'Draft B', 'Classic');

function renderPanel(props: Partial<Parameters<typeof DraftComparisonPanel>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(
    <QueryClientProvider client={queryClient}>
      <DraftComparisonPanel draftOptions={draftOptions} {...props} />
    </QueryClientProvider>,
  );
}

describe('DraftComparisonPanel', () => {
  beforeEach(() => {
    vi.mocked(api.getDraft).mockImplementation(async (id: string) =>
      id === 'd-1' ? LEFT_DRAFT : id === 'd-2' ? RIGHT_DRAFT : (undefined as never),
    );
  });

  it('keeps comparison locked until two drafts are chosen', async () => {
    renderPanel();

    expect(screen.getByText('Left: unset · Right: unset')).toBeInTheDocument();

    // The body only exists once expanded; a single selection is not enough.
    fireEvent.click(screen.getByRole('button', { name: /Draft comparison/ }));

    expect(screen.getByText('Select at least two drafts to unlock comparison.')).toBeInTheDocument();
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(api.getDraft).not.toHaveBeenCalled();
  });

  it('loads both drafts and shows their comparison cards', async () => {
    renderPanel({ leftDraftId: 'd-1', rightDraftId: 'd-2' });

    // Selecting both sides expands the section by default, which hides the preview
    // (CollapsibleSection only renders `preview` while collapsed).
    expect(screen.getByRole('button', { name: /Draft comparison/ })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('Left: d-1 · Right: d-2')).not.toBeInTheDocument();
    // Both selects list every candidate, so each name appears once per selector.
    expect(screen.getAllByRole('option', { name: 'Draft A' }).length).toBe(2);
    expect(screen.getAllByRole('option', { name: 'Draft B' }).length).toBe(2);

    // Both drafts load asynchronously, then each side gets a comparison card.
    expect(await screen.findAllByText('Comparing Current draft')).toHaveLength(2);
    expect(screen.getAllByText('No saved review context')).toHaveLength(2);
    expect(screen.getAllByText(/V2\/V3 Card/).length).toBeGreaterThan(0);
    // Now the names appear in both dropdowns plus the card heading.
    expect(screen.getAllByText('Draft A').length).toBeGreaterThan(2);
    expect(screen.getAllByText('Draft B').length).toBeGreaterThan(2);

    expect(screen.getByRole('button', { name: 'Branch left draft' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Branch right draft' })).toBeInTheDocument();

    await waitFor(() => {
      expect(api.getDraft).toHaveBeenCalledWith('d-1');
      expect(api.getDraft).toHaveBeenCalledWith('d-2');
    });
  });

  it('reports draft selection changes to the parent', async () => {
    const onLeftDraftChange = vi.fn();
    const onRightDraftChange = vi.fn();

    renderPanel({ onLeftDraftChange, onRightDraftChange });
    fireEvent.click(screen.getByRole('button', { name: /Draft comparison/ }));

    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'd-2' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: 'd-1' } });

    await waitFor(() => {
      expect(onLeftDraftChange).toHaveBeenLastCalledWith('d-2');
      expect(onRightDraftChange).toHaveBeenLastCalledWith('d-1');
    });
  });
});
