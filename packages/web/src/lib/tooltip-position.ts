/**
 * Where a tooltip goes, as a pure decision.
 *
 * A tooltip that renders past the edge of the viewport is worse than no tooltip: the
 * user sees a clipped fragment and cannot tell what it was meant to say. Flipping the
 * side and clamping the alignment normally means measuring two elements and reading
 * the viewport, which is exactly the part that cannot be tested here — happy-dom does
 * not compute layout, so every rect it returns is zero-sized. So the measuring and the
 * deciding are separate: this takes plain numbers, `Tooltip` feeds it real rects in a
 * browser and falls back to the requested placement when there is nothing to measure.
 */
export type TooltipSide = 'top' | 'bottom';
export type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipPlacement {
  side: TooltipSide;
  align: TooltipAlign;
}

export interface TooltipRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TooltipPositionInput {
  trigger: TooltipRect;
  /** The rendered tooltip's size, which depends on the label and not on the trigger. */
  tooltip: { width: number; height: number };
  viewport: { width: number; height: number };
  preferred: TooltipPlacement;
  /** The visual gap between trigger and tooltip, counted as overflow. */
  gap?: number;
  /** Space to keep clear at the viewport edge. */
  margin?: number;
}

const DEFAULT_GAP = 6;
const DEFAULT_MARGIN = 8;

/**
 * The requested placement, flipped or clamped only when it would actually overflow.
 *
 * Preference is preserved whenever it fits: a tooltip that silently moves between
 * shows reads as a glitch, so the fallback is used for the case it exists for.
 */
export function resolveTooltipPlacement({
  trigger,
  tooltip,
  viewport,
  preferred,
  gap = DEFAULT_GAP,
  margin = DEFAULT_MARGIN,
}: TooltipPositionInput): TooltipPlacement {
  const triggerBottom = trigger.top + trigger.height;
  const fitsBelow = triggerBottom + gap + tooltip.height + margin <= viewport.height;
  const fitsAbove = trigger.top - gap - tooltip.height - margin >= 0;

  let side = preferred.side;
  if (side === 'bottom' && !fitsBelow && fitsAbove) {
    side = 'top';
  } else if (side === 'top' && !fitsAbove && fitsBelow) {
    side = 'bottom';
  }

  let align = preferred.align;
  if (align === 'center') {
    const centeredLeft = trigger.left + trigger.width / 2 - tooltip.width / 2;
    if (centeredLeft + tooltip.width + margin > viewport.width) {
      align = 'end';
    } else if (centeredLeft < margin) {
      align = 'start';
    }
  } else if (align === 'start') {
    if (trigger.left + tooltip.width + margin > viewport.width) {
      align = 'end';
    }
  } else if (trigger.left + trigger.width - tooltip.width < margin) {
    align = 'start';
  }

  return { side, align };
}

/**
 * Whether a rect is worth measuring at all.
 *
 * A zero-sized trigger means the element is not laid out — an unmounted subtree, a
 * `display: none` ancestor, or a DOM that does not compute styles. The component uses
 * this to keep the caller's requested placement instead of "flipping" to a side
 * derived from four zeroes.
 */
export function isMeasurable(rect: TooltipRect): boolean {
  return rect.width > 0 || rect.height > 0;
}
