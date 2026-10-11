import { fireEvent, render, screen } from '@testing-library/react';
import type { WorldRecord } from '@char-gen/shared';
import WorldbookSection from './WorldbookSection';

const saveBlobDownload = vi.hoisted(() => vi.fn(async () => ({ ok: true })));

vi.mock('@/utils/download', () => ({ saveBlobDownload }));

function makeWorld(overrides: Partial<WorldRecord> = {}): WorldRecord {
  return {
    id: 'w1',
    userId: 'local-desktop',
    name: 'Ashfall',
    description: 'A city under permanent ash.',
    tags: [],
    isPublic: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    characters: [{ id: 'c1', worldId: 'w1', characterName: 'Vesna', role: 'fixer', createdAt: '', updatedAt: '' }],
    canonLocks: [
      {
        id: 'lk1',
        worldId: 'w1',
        targetKind: 'world',
        statement: 'magic always costs blood',
        createdAt: '',
        updatedAt: '',
      },
    ],
    ...overrides,
  };
}

describe('WorldbookSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('previews the worldbook entries built from the world', () => {
    render(<WorldbookSection world={makeWorld()} />);

    expect(screen.getByText('3 entries')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'Ashfall' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'Vesna' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'magic always costs blood' })).toBeInTheDocument();
  });

  it('filters the entries by packet type', () => {
    render(<WorldbookSection world={makeWorld()} />);

    fireEvent.click(screen.getByRole('button', { name: 'character' }));

    expect(screen.getByRole('heading', { level: 5, name: 'Vesna' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 5, name: 'magic always costs blood' })).not.toBeInTheDocument();
  });

  it('still emits the setting entry for a world that has nothing but a name', () => {
    render(<WorldbookSection world={makeWorld({ description: undefined, characters: [], canonLocks: [] })} />);

    expect(screen.getByText('1 entry')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 5, name: 'Ashfall' })).toBeInTheDocument();
  });

  it('hands the packet markdown to the download flow with a worldbook filename', async () => {
    render(<WorldbookSection world={makeWorld()} />);

    fireEvent.click(screen.getByRole('button', { name: /Packet \.md/ }));

    await vi.waitFor(() => {
      expect(saveBlobDownload).toHaveBeenCalledTimes(1);
    });
    const [blob, filename, contentType] = saveBlobDownload.mock.calls[0] as unknown as [Blob, string, string];
    expect(filename).toBe('ashfall_worldbook.md');
    expect(contentType).toBe('text/markdown');
    expect(await blob.text()).toContain('[[LOREBOOK_PACKET]]');
  });
});
