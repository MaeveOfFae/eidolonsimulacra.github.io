/**
 * A resizable two-pane layout, as arithmetic.
 *
 * The drag is a component concern. What can actually be wrong is the arithmetic: how wide
 * the pane may be, what a stored width means once the window has changed size, and what
 * happens to a number written by a different version of the app. Those decisions live here
 * so they can be tested without a pointer.
 *
 * Two limits apply at once, and both matter:
 *
 *   - the pane has a **hard cap**, so a width dragged out on a 4K monitor does not become
 *     the entire layout when the same profile opens on a laptop;
 *   - the other pane keeps a **minimum**, so a drag can never squeeze it out of existence
 *     — which is the failure that makes a split view feel broken rather than tight.
 */
export const PANE_MIN_WIDTH = 280;
export const PANE_MAX_WIDTH = 900;
/** The room the pane that takes what is left must always keep. */
export const PANE_MIN_CONTENT_WIDTH = 320;
export const PANE_DEFAULT_WIDTH = 460;
/** How far one arrow key moves the divider. */
export const PANE_KEYBOARD_STEP = 32;

export interface PaneWidthOptions {
  min?: number;
  max?: number;
  minContentWidth?: number;
  defaultWidth?: number;
}

export interface PaneWidthBounds {
  min: number;
  max: number;
}

export function clampPaneWidth(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * The bounds for the resizable pane inside a container of this width.
 *
 * An *unmeasured* container (width 0) answers with the absolute limits rather than a room
 * calculated from zero: nothing has been laid out yet, so there is no room to reason about,
 * and a maximum below the current width would announce `aria-valuemax` smaller than
 * `aria-valuenow` — a contradiction a screen reader would read out loud.
 *
 * `min` can exceed the calculated room in a genuinely narrow container. The floor wins in
 * that case: a pane narrower than the minimum is unusable, and the layout is a single column
 * below `xl` anyway, where none of this applies.
 */
export function resolvePaneBounds(containerWidth: number, options: PaneWidthOptions = {}): PaneWidthBounds {
  const min = options.min ?? PANE_MIN_WIDTH;
  const hardMax = options.max ?? PANE_MAX_WIDTH;

  if (containerWidth <= 0) {
    return { min, max: hardMax };
  }

  const minContentWidth = options.minContentWidth ?? PANE_MIN_CONTENT_WIDTH;
  const roomForPane = containerWidth - minContentWidth;

  return { min, max: Math.max(min, Math.min(hardMax, roomForPane)) };
}

/**
 * The width to render: the stored one where it is usable, the default otherwise.
 *
 * A container of zero width means nothing has been measured yet — the first paint, or a
 * DOM that does not lay out. Clamping to a room calculated from zero would collapse the
 * pane to the minimum before it was ever drawn, so an unmeasured container clamps to the
 * absolute limits only and the next measurement corrects it.
 */
export function resolvePaneWidth(containerWidth: number, stored?: number, options: PaneWidthOptions = {}): number {
  const min = options.min ?? PANE_MIN_WIDTH;
  const hardMax = options.max ?? PANE_MAX_WIDTH;
  const preferred =
    typeof stored === 'number' && Number.isFinite(stored) ? stored : (options.defaultWidth ?? PANE_DEFAULT_WIDTH);

  if (containerWidth <= 0) {
    return clampPaneWidth(preferred, min, hardMax);
  }

  const bounds = resolvePaneBounds(containerWidth, options);
  return clampPaneWidth(preferred, bounds.min, bounds.max);
}

/** One keyboard step. A step is just another number to resolve, so it clamps identically. */
export function stepPaneWidth(
  current: number,
  delta: number,
  containerWidth: number,
  options: PaneWidthOptions = {},
): number {
  return resolvePaneWidth(containerWidth, current + delta, options);
}

/**
 * Stored pane widths, made safe to use.
 *
 * Keys must be non-empty strings and values must be finite numbers; everything else is
 * dropped rather than repaired, because a pane id that no longer exists is a rename and a
 * value that is not a number is not a width. Surviving numbers are pulled into the absolute
 * range, so a corrupt or hand-edited config cannot produce an unusable layout.
 */
export function normalizePaneWidths(stored: unknown, options: PaneWidthOptions = {}): Record<string, number> {
  const min = options.min ?? PANE_MIN_WIDTH;
  const hardMax = options.max ?? PANE_MAX_WIDTH;

  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) {
    return {};
  }

  const widths: Record<string, number> = {};

  for (const [paneId, value] of Object.entries(stored as Record<string, unknown>)) {
    if (!paneId || typeof value !== 'number' || !Number.isFinite(value)) {
      continue;
    }

    widths[paneId] = clampPaneWidth(value, min, hardMax);
  }

  return widths;
}
