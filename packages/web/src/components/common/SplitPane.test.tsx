import { fireEvent, render, screen } from '@testing-library/react';
import SplitPane from './SplitPane';
import { configManager } from '@/lib/config/manager';
import { PANE_DEFAULT_WIDTH, PANE_KEYBOARD_STEP, PANE_MAX_WIDTH, PANE_MIN_WIDTH } from '@/lib/split-pane';

const PANE_ID = 'test-pane';
const SEPARATOR_NAME = 'Resize the test pane';

function renderPane() {
  return render(
    <SplitPane
      paneId={PANE_ID}
      separatorLabel={SEPARATOR_NAME}
      primary={<p>Primary pane</p>}
      secondary={<p>Secondary pane</p>}
    />,
  );
}

function separator() {
  return screen.getByRole('separator', { name: SEPARATOR_NAME });
}

function currentWidth() {
  return Number(separator().getAttribute('aria-valuenow'));
}

/**
 * Stubs the container measurement. No test DOM lays anything out, so this is the only way
 * to exercise the clamping that depends on real room.
 */
function measureContainer(width: number) {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

describe('SplitPane', () => {
  beforeEach(() => {
    localStorage.clear();
    configManager.resetConfig();
  });

  it('renders both panes', () => {
    renderPane();

    expect(screen.getByText('Primary pane')).toBeInTheDocument();
    expect(screen.getByText('Secondary pane')).toBeInTheDocument();
  });

  it('exposes the divider as a labelled vertical separator with its limits', () => {
    renderPane();
    const handle = separator();

    expect(handle).toHaveAttribute('aria-orientation', 'vertical');
    expect(handle).toHaveAttribute('aria-valuenow', String(PANE_DEFAULT_WIDTH));
    expect(handle).toHaveAttribute('aria-valuemin', String(PANE_MIN_WIDTH));
    expect(handle).toHaveAttribute('aria-valuemax', String(PANE_MAX_WIDTH));
    // The divider names the pane it sizes, so the relationship is not just visual.
    expect(handle).toHaveAttribute('aria-controls', screen.getByText('Primary pane').parentElement?.id);
  });

  it('moves with the arrow keys, and remembers where it was left', () => {
    renderPane();

    fireEvent.keyDown(separator(), { key: 'ArrowRight' });
    expect(currentWidth()).toBe(PANE_DEFAULT_WIDTH + PANE_KEYBOARD_STEP);
    expect(configManager.getPaneWidth(PANE_ID)).toBe(PANE_DEFAULT_WIDTH + PANE_KEYBOARD_STEP);

    fireEvent.keyDown(separator(), { key: 'ArrowLeft' });
    expect(currentWidth()).toBe(PANE_DEFAULT_WIDTH);
  });

  it('goes to the limits with Home and End', () => {
    renderPane();

    fireEvent.keyDown(separator(), { key: 'End' });
    expect(currentWidth()).toBe(PANE_MAX_WIDTH);

    fireEvent.keyDown(separator(), { key: 'Home' });
    expect(currentWidth()).toBe(PANE_MIN_WIDTH);
    expect(configManager.getPaneWidth(PANE_ID)).toBe(PANE_MIN_WIDTH);
  });

  it('ignores keys that are not resizing it', () => {
    renderPane();
    const before = currentWidth();

    for (const key of ['Enter', 'Tab', 'ArrowUp', 'a']) {
      fireEvent.keyDown(separator(), { key });
    }

    expect(currentWidth()).toBe(before);
    // Nothing was written either, so an ignored key cannot leave a stray preference behind.
    expect(configManager.getPaneWidth(PANE_ID)).toBeUndefined();
  });

  it('returns to the default width on a double click', () => {
    renderPane();
    fireEvent.keyDown(separator(), { key: 'End' });
    expect(currentWidth()).toBe(PANE_MAX_WIDTH);

    fireEvent.doubleClick(separator());

    expect(currentWidth()).toBe(PANE_DEFAULT_WIDTH);
    expect(configManager.getPaneWidth(PANE_ID)).toBe(PANE_DEFAULT_WIDTH);
  });

  it('honours a width stored before it mounted', () => {
    configManager.updatePaneWidth(PANE_ID, 620);

    renderPane();

    expect(currentWidth()).toBe(620);
  });

  it('clamps a stored width to the room the container actually has', () => {
    configManager.updatePaneWidth(PANE_ID, PANE_MAX_WIDTH);
    const measure = measureContainer(1000);

    try {
      renderPane();
    } finally {
      measure.mockRestore();
    }

    // 1000px of container, 320px reserved for the other pane.
    expect(currentWidth()).toBe(680);
    expect(separator()).toHaveAttribute('aria-valuemax', '680');
  });

  it('drags the divider, and saves once at the end rather than during', () => {
    renderPane();
    const handle = separator();

    fireEvent.pointerDown(handle, { button: 0, clientX: 500, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 560, pointerId: 1 });

    expect(currentWidth()).toBe(PANE_DEFAULT_WIDTH + 60);
    // Mid-drag is local state: a config write per pointermove would re-render every
    // listener of the config-changed event, once per frame.
    expect(configManager.getPaneWidth(PANE_ID)).toBeUndefined();

    fireEvent.pointerUp(handle, { pointerId: 1 });

    expect(configManager.getPaneWidth(PANE_ID)).toBe(PANE_DEFAULT_WIDTH + 60);
  });

  it('ignores a drag that is not the primary button', () => {
    renderPane();
    const before = currentWidth();

    fireEvent.pointerDown(separator(), { button: 2, clientX: 500, pointerId: 1 });
    fireEvent.pointerMove(separator(), { clientX: 600, pointerId: 1 });

    expect(currentWidth()).toBe(before);
  });
});
