import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import {
  isMeasurable,
  resolveTooltipPlacement,
  type TooltipAlign,
  type TooltipPlacement,
  type TooltipSide,
} from '../../lib/tooltip-position';
import { cn } from '../../utils/cn';

/**
 * A short description attached to one control, shown on hover and on keyboard focus.
 *
 * This exists because the app's tooltips were the browser's `title` attribute: about a
 * second of delay before anything appears, an OS-styled box that ignores the theme,
 * invisible to keyboard users, and — the reason it kept being used anyway — a name for
 * icon-only buttons that nothing else gave them. Here the split is explicit:
 *
 *   - the **name** stays on the trigger's own text, or on its `aria-label`;
 *   - the **description** is this label, wired with `aria-describedby` while visible.
 *
 * So a tooltip can never be the only name of a control again; `a11y-guards.test.ts`
 * enforces the other half of that (no interactive element may rely on `title` alone).
 *
 * Behaviour worth stating, because each piece is a requirement rather than a taste:
 *
 *   - hover **and** focus show it, so a keyboard user is not excluded;
 *   - Escape dismisses it (WCAG 1.4.13), and it stays dismissed until the pointer
 *     leaves the trigger, so a resting pointer cannot pin it open;
 *   - the tooltip lives inside the trigger's wrapper and accepts the pointer, so
 *     moving onto it does not dismiss it (1.4.13 "hoverable");
 *   - the first show is delayed and a re-hover within `ARPEGGIO_MS` is instant, which
 *     is what stops a row of icons from firing a trail of tooltips.
 *
 * It renders one short line, never interactive content — anything with links in it is
 * a popover or the Help menu, not a tooltip.
 */
interface TooltipProps {
  /** The description. Keep it to a single short line. */
  label: string;
  /** Preferred side; flipped when it would leave the viewport. */
  side?: TooltipSide;
  /** Preferred alignment along that side; clamped when it would overflow. */
  align?: TooltipAlign;
  /** For callers that need the wrapper to participate in their own layout. */
  wrapperClassName?: string;
  /** Exactly one focusable element. Its `aria-describedby` is owned by this component. */
  children: ReactElement;
}

/** Long enough not to fire while a pointer crosses the page, short enough to feel direct. */
const SHOW_DELAY_MS = 250;
/** A pointer travelling from the trigger onto the tooltip crosses the visual gap. */
const HIDE_DELAY_MS = 120;
/** A second hover inside this window is deliberate, so it gets no delay. */
const ARPEGGIO_MS = 500;

const SIDE_CLASSES: Record<TooltipSide, string> = {
  top: 'bottom-full mb-1.5',
  bottom: 'top-full mt-1.5',
};

const ALIGN_CLASSES: Record<TooltipAlign, string> = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};

export default function Tooltip({ label, side = 'top', align = 'center', wrapperClassName, children }: TooltipProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<TooltipPlacement>({ side, align });
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const lastHiddenAt = useRef(0);

  const clearTimers = useCallback(() => {
    if (showTimer.current !== null) {
      window.clearTimeout(showTimer.current);
      showTimer.current = null;
    }
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const show = useCallback(() => {
    clearTimers();

    if (Date.now() - lastHiddenAt.current < ARPEGGIO_MS) {
      setOpen(true);
      return;
    }

    showTimer.current = window.setTimeout(() => {
      showTimer.current = null;
      setOpen(true);
    }, SHOW_DELAY_MS);
  }, [clearTimers]);

  const hide = useCallback(() => {
    clearTimers();
    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null;
      lastHiddenAt.current = Date.now();
      setOpen(false);
    }, HIDE_DELAY_MS);
  }, [clearTimers]);

  // A pointer can rest on the trigger with focus somewhere else entirely, so Escape is
  // read from the document rather than from the wrapper's own key events.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      clearTimers();
      lastHiddenAt.current = Date.now();
      setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [clearTimers, open]);

  useEffect(() => clearTimers, [clearTimers]);

  // Placement is measured, not guessed: the browser's real rects go into
  // `resolveTooltipPlacement`, and where nothing is laid out (happy-dom returns
  // zero-sized rects) the caller's requested side stands instead of a flip that four
  // zeroes cannot justify.
  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const trigger = wrapperRef.current?.getBoundingClientRect();
    const tooltip = tooltipRef.current?.getBoundingClientRect();
    if (!trigger || !tooltip) {
      return;
    }

    const triggerRect = { top: trigger.top, left: trigger.left, width: trigger.width, height: trigger.height };
    const tooltipRect = { top: tooltip.top, left: tooltip.left, width: tooltip.width, height: tooltip.height };
    if (!isMeasurable(triggerRect) || !isMeasurable(tooltipRect)) {
      return;
    }

    setPlacement(
      resolveTooltipPlacement({
        trigger: triggerRect,
        tooltip: { width: tooltipRect.width, height: tooltipRect.height },
        viewport: { width: window.innerWidth, height: window.innerHeight },
        preferred: { side, align },
      }),
    );
  }, [align, label, open, side]);

  // `ReactElement`'s props type defaults to `unknown`, which `cloneElement` refuses to
  // merge anything into. The cast is the narrowest way to say "this child is a DOM
  // element and the attribute below is valid on it" — which the a11y contract above
  // depends on, since the tooltip is a *description* hung off the trigger.
  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    'aria-describedby': open ? tooltipId : undefined,
  });

  return (
    <span
      ref={wrapperRef}
      className={cn('relative inline-flex', wrapperClassName)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {trigger}

      {open ? (
        <span
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={cn('app-tooltip', SIDE_CLASSES[placement.side], ALIGN_CLASSES[placement.align])}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
