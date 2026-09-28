import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Template } from '@char-gen/shared';
import ManualDraftCreateModal from './ManualDraftCreateModal';

const templates: Template[] = [
  {
    name: 'V2/V3 Card',
    version: '1.0',
    description: '',
    assets: [],
  },
  {
    name: 'Alt Template',
    version: '1.0',
    description: '',
    assets: [],
  },
];

describe('ManualDraftCreateModal', () => {
  it('submits a trimmed manual draft request', async () => {
    const onCreate = vi.fn();

    render(<ManualDraftCreateModal templates={templates} onClose={vi.fn()} onCreate={onCreate} />);

    fireEvent.change(screen.getByLabelText('Character name'), {
      target: { value: '  Maeve  ' },
    });
    fireEvent.change(screen.getByLabelText('Template'), {
      target: { value: 'Alt Template' },
    });
    fireEvent.change(screen.getByLabelText('Seed'), {
      target: { value: '  isolated archivist guarding a cursed engine  ' },
    });
    fireEvent.change(screen.getByLabelText('Mode'), {
      target: { value: 'NSFW' },
    });
    fireEvent.change(screen.getByLabelText('Genre'), {
      target: { value: '  gothic science fantasy  ' },
    });
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: '  Preserve the broken courtly tone.  ' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create Draft' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        seed: 'isolated archivist guarding a cursed engine',
        characterName: 'Maeve',
        templateName: 'Alt Template',
        mode: 'NSFW',
        genre: 'gothic science fantasy',
        notes: 'Preserve the broken courtly tone.',
      });
    });
  });

  it('shows a validation error when seed is blank', () => {
    const onCreate = vi.fn();

    render(<ManualDraftCreateModal templates={templates} onClose={vi.fn()} onCreate={onCreate} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create Draft' }));

    expect(screen.getByText('Seed is required.')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
