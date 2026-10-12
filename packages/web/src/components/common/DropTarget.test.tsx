import { fireEvent, render, screen } from '@testing-library/react';
import DropTarget from './DropTarget';

const LABEL = 'Drop a file to import it';

function renderTarget() {
  const onFiles = vi.fn();

  render(<DropTarget onFiles={onFiles} label={LABEL} />);

  return { onFiles };
}

/** A drag carrying files. The component only reads `types` and `files`, so a plain object does. */
function fileDrag(files: unknown[] = [{ name: 'Vesna.png' }]) {
  return { dataTransfer: { types: ['Files'], files } };
}

/** A drag carrying something else, e.g. selected text from another page. */
const textDrag = { dataTransfer: { types: ['text/plain'], files: [] } };

describe('DropTarget', () => {
  it('shows nothing until a file is dragged over the app', () => {
    renderTarget();

    expect(screen.queryByText(LABEL)).toBeNull();
  });

  it('shows the overlay while a file is over the window', () => {
    renderTarget();

    fireEvent.dragEnter(document.body, fileDrag());

    expect(screen.getByText(LABEL)).toBeInTheDocument();

    fireEvent.dragLeave(document.body, fileDrag());

    expect(screen.queryByText(LABEL)).toBeNull();
  });

  it('accepts the drop, so the browser does not open the file instead', () => {
    renderTarget();
    fireEvent.dragEnter(document.body, fileDrag());

    // `fireEvent` returns false when the handler called preventDefault.
    expect(fireEvent.dragOver(document.body, fileDrag())).toBe(false);
  });

  it('ignores a drag that carries no files', () => {
    renderTarget();

    fireEvent.dragEnter(document.body, textDrag);
    expect(screen.queryByText(LABEL)).toBeNull();
    // And a text drag is left to the browser: nothing is prevented.
    expect(fireEvent.dragOver(document.body, textDrag)).toBe(true);
  });

  it('hands the dropped files over and puts the overlay away', () => {
    const file = { name: 'Vesna.png' };
    const { onFiles } = renderTarget();

    fireEvent.dragEnter(document.body, fileDrag([file]));
    fireEvent.drop(document.body, fileDrag([file]));

    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(screen.queryByText(LABEL)).toBeNull();
  });

  it('does not flicker as the pointer crosses children mid-drag', () => {
    renderTarget();

    // Moving over a child fires another enter before its leave, which is why the counter
    // exists: a boolean overlay would drop out here.
    fireEvent.dragEnter(document.body, fileDrag());
    fireEvent.dragEnter(document.body, fileDrag());
    fireEvent.dragLeave(document.body, fileDrag());

    expect(screen.getByText(LABEL)).toBeInTheDocument();

    fireEvent.dragLeave(document.body, fileDrag());
    expect(screen.queryByText(LABEL)).toBeNull();
  });
});
