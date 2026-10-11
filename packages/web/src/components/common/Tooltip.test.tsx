import { act } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Tooltip from './Tooltip';
import type { TooltipAlign, TooltipSide } from '../../lib/tooltip-position';

/** The show delay is deliberately not zero, so every appearance takes an advance. */
const SHOW_DELAY_MS = 250;
const HIDE_DELAY_MS = 120;

interface RenderOptions {
  label?: string;
  side?: TooltipSide;
  align?: TooltipAlign;
}

function renderTooltip({ label = 'Archive this draft', side, align }: RenderOptions = {}) {
  render(
    <Tooltip label={label} side={side} align={align}>
      <button type="button" aria-label="Archive">
        Archive
      </button>
    </Tooltip>,
  );

  const trigger = screen.getByRole('button', { name: 'Archive' });
  // The handlers live on the wrapper, because the wrapper is also what keeps the
  // tooltip open while the pointer travels onto it.
  const wrapper = trigger.parentElement;
  if (!wrapper) {
    throw new Error('Tooltip did not render a wrapper around its trigger.');
  }

  return { trigger, wrapper };
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('appears on hover only after the show delay', () => {
    const { wrapper } = renderTooltip();

    fireEvent.mouseEnter(wrapper);
    expect(screen.queryByRole('tooltip')).toBeNull();

    advance(SHOW_DELAY_MS - 1);
    expect(screen.queryByRole('tooltip')).toBeNull();

    advance(1);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Archive this draft');
  });

  it('cancels a pending show when the pointer leaves first', () => {
    const { wrapper } = renderTooltip();

    fireEvent.mouseEnter(wrapper);
    fireEvent.mouseLeave(wrapper);
    advance(SHOW_DELAY_MS * 4);

    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('appears on keyboard focus, not only on hover', () => {
    const { trigger } = renderTooltip();

    fireEvent.focusIn(trigger);
    advance(SHOW_DELAY_MS);

    expect(screen.getByRole('tooltip')).toHaveTextContent('Archive this draft');
  });

  it('hides on blur', () => {
    const { trigger } = renderTooltip();

    fireEvent.focusIn(trigger);
    advance(SHOW_DELAY_MS);
    fireEvent.focusOut(trigger);
    advance(HIDE_DELAY_MS);

    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('skips the delay when the pointer returns straight away', () => {
    const { wrapper } = renderTooltip();

    fireEvent.mouseEnter(wrapper);
    advance(SHOW_DELAY_MS);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.mouseLeave(wrapper);
    advance(HIDE_DELAY_MS);
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.mouseEnter(wrapper);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('describes the trigger without renaming it', () => {
    const { trigger, wrapper } = renderTooltip();

    expect(trigger).not.toHaveAttribute('aria-describedby');

    fireEvent.mouseEnter(wrapper);
    advance(SHOW_DELAY_MS);

    const tooltip = screen.getByRole('tooltip');
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);

    // The accessible name is still the button's own label: a tooltip must never be
    // the thing a screen reader reads as the name of the control.
    expect(screen.getByRole('button', { name: 'Archive' })).toBe(trigger);
  });

  it('keeps the tooltip inside the trigger wrapper so the pointer can reach it', () => {
    const { wrapper } = renderTooltip();

    fireEvent.mouseEnter(wrapper);
    advance(SHOW_DELAY_MS);

    const tooltip = screen.getByRole('tooltip');
    expect(wrapper.contains(tooltip)).toBe(true);
    // `app-tooltip` accepts the pointer, which is what stops the tooltip dismissing
    // itself the moment the user tries to read it.
    expect(tooltip).toHaveClass('app-tooltip');
  });

  it('dismisses on Escape and stays dismissed while the pointer rests', () => {
    const { wrapper } = renderTooltip();

    fireEvent.mouseEnter(wrapper);
    advance(SHOW_DELAY_MS);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();

    // No new mouseenter has happened, so nothing reopens it behind the user's back.
    advance(SHOW_DELAY_MS * 4);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('uses the requested side and alignment by default', () => {
    const { wrapper } = renderTooltip();

    fireEvent.mouseEnter(wrapper);
    advance(SHOW_DELAY_MS);

    expect(screen.getByRole('tooltip')).toHaveClass('bottom-full', 'left-1/2');
  });

  it('honours a caller-supplied side and alignment', () => {
    const { wrapper } = renderTooltip({ side: 'bottom', align: 'end' });

    fireEvent.mouseEnter(wrapper);
    advance(SHOW_DELAY_MS);

    expect(screen.getByRole('tooltip')).toHaveClass('top-full', 'right-0');
  });
});
