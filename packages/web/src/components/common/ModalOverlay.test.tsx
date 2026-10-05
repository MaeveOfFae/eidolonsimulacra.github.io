import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import ModalOverlay from './ModalOverlay';

function renderDialog({
  dismissible = true,
  onClose = vi.fn(),
  children = (
    <>
      <button type="button">first</button>
      <button type="button">last</button>
    </>
  ),
}: {
  dismissible?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
} = {}) {
  const view = render(
    <ModalOverlay
      onClose={onClose}
      label="Test dialog"
      className="z-50 flex items-center justify-center"
      dismissible={dismissible}
    >
      <div className="panel">{children}</div>
    </ModalOverlay>,
  );

  return { ...view, onClose };
}

describe('ModalOverlay', () => {
  it('renders a named modal dialog', () => {
    renderDialog();

    expect(screen.getByRole('dialog', { name: 'Test dialog' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'first' })).toBeInTheDocument();
  });

  it('moves focus to the first focusable element on open', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('focuses the dialog itself when it contains nothing focusable', () => {
    renderDialog({ children: <p>Nothing to focus here</p> });

    expect(screen.getByRole('dialog', { name: 'Test dialog' })).toHaveFocus();
  });

  it('closes on Escape', () => {
    const { onClose } = renderDialog();

    fireEvent.keyDown(screen.getByRole('button', { name: 'first' }), { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape while it is not dismissible', () => {
    const { onClose } = renderDialog({ dismissible: false });

    fireEvent.keyDown(screen.getByRole('button', { name: 'first' }), { key: 'Escape' });
    fireEvent.click(screen.getByRole('dialog', { name: 'Test dialog' }).firstElementChild as HTMLElement);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on a backdrop click and keeps the backdrop out of the a11y tree', () => {
    const { onClose } = renderDialog();

    const backdrop = screen.getByRole('dialog', { name: 'Test dialog' }).firstElementChild as HTMLElement;
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('wraps Tab from the last focusable back to the first', () => {
    renderDialog();
    const last = screen.getByRole('button', { name: 'last' });
    last.focus();

    fireEvent.keyDown(last, { key: 'Tab' });

    expect(screen.getByRole('button', { name: 'first' })).toHaveFocus();
  });

  it('wraps Shift-Tab from the first focusable back to the last', () => {
    renderDialog();
    const first = screen.getByRole('button', { name: 'first' });
    first.focus();

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });

    expect(screen.getByRole('button', { name: 'last' })).toHaveFocus();
  });

  it('returns focus to whatever was focused before it opened', () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'trigger';
    document.body.appendChild(trigger);
    trigger.focus();

    const { unmount } = renderDialog();
    expect(trigger).not.toHaveFocus();

    unmount();
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it('owns the body scroll lock for its whole lifetime', () => {
    const { unmount } = renderDialog();
    expect(document.body).toHaveClass('modal-open');

    unmount();
    expect(document.body).not.toHaveClass('modal-open');
  });

  it('keeps the scroll lock while a nested dialog is still open', () => {
    function Nested() {
      const [innerOpen, setInnerOpen] = useState(true);

      return (
        <ModalOverlay onClose={() => undefined} label="Outer">
          <button type="button" onClick={() => setInnerOpen(false)}>
            close inner
          </button>
          {innerOpen ? (
            <ModalOverlay onClose={() => undefined} label="Inner">
              <button type="button">inner action</button>
            </ModalOverlay>
          ) : null}
        </ModalOverlay>
      );
    }

    render(<Nested />);
    expect(document.body).toHaveClass('modal-open');

    fireEvent.click(screen.getByRole('button', { name: 'close inner' }));

    expect(screen.queryByRole('dialog', { name: 'Inner' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Outer' })).toBeInTheDocument();
    expect(document.body).toHaveClass('modal-open');
  });
});
