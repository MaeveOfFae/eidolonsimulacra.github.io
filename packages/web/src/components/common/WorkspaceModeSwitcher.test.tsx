import { fireEvent, render, screen } from '@testing-library/react';
import WorkspaceModeSwitcher from './WorkspaceModeSwitcher';
import { WORKSPACE_MODES } from '@/lib/navigation/workspace-modes';

function renderSwitcher({
  explicitModeId = null,
  activeModeId = null,
  onSelect = vi.fn(),
}: {
  explicitModeId?: (typeof WORKSPACE_MODES)[number]['id'] | null;
  activeModeId?: (typeof WORKSPACE_MODES)[number]['id'] | null;
  onSelect?: (modeId: (typeof WORKSPACE_MODES)[number]['id'] | null) => void;
} = {}) {
  const view = render(
    <WorkspaceModeSwitcher explicitModeId={explicitModeId} activeModeId={activeModeId} onSelect={onSelect} />,
  );

  return { ...view, onSelect };
}

describe('WorkspaceModeSwitcher', () => {
  it('offers Auto plus every mode', () => {
    renderSwitcher();

    for (const label of ['Auto', ...WORKSPACE_MODES.map((mode) => mode.label)]) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('marks Auto as selected while the mode follows the screen', () => {
    renderSwitcher({ explicitModeId: null, activeModeId: 'review' });

    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Review' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('explains which mode the screen implies while on Auto', () => {
    renderSwitcher({ explicitModeId: null, activeModeId: 'review' });

    expect(screen.getByText('Following this screen: Review')).toBeInTheDocument();
  });

  it('hides that hint once a mode is chosen deliberately', () => {
    renderSwitcher({ explicitModeId: 'bulk', activeModeId: 'bulk' });

    expect(screen.queryByText(/Following this screen/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bulk' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Auto' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('reports the chosen mode, and null for Auto', () => {
    const { onSelect } = renderSwitcher();

    fireEvent.click(screen.getByRole('button', { name: 'Solo drafting' }));
    expect(onSelect).toHaveBeenCalledWith('draft');

    fireEvent.click(screen.getByRole('button', { name: 'Auto' }));
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });
});
