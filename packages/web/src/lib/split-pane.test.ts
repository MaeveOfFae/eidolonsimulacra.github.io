import { describe, expect, it } from 'vitest';
import {
  PANE_DEFAULT_WIDTH,
  PANE_KEYBOARD_STEP,
  PANE_MAX_WIDTH,
  PANE_MIN_CONTENT_WIDTH,
  PANE_MIN_WIDTH,
  clampPaneWidth,
  normalizePaneWidths,
  resolvePaneBounds,
  resolvePaneWidth,
  stepPaneWidth,
} from './split-pane';

/** A wide desktop container: 1400px, so the hard cap is what limits the pane, not the room. */
const WIDE = 1400;
/** A container where the remaining room, not the cap, is the binding limit. */
const MEDIUM = 1000;

describe('split pane constants', () => {
  it('keeps the default between the floor and the cap', () => {
    expect(PANE_MIN_WIDTH).toBeLessThan(PANE_DEFAULT_WIDTH);
    expect(PANE_DEFAULT_WIDTH).toBeLessThan(PANE_MAX_WIDTH);
    expect(PANE_KEYBOARD_STEP).toBeGreaterThan(0);
    expect(PANE_MIN_CONTENT_WIDTH).toBeGreaterThan(0);
  });
});

describe('resolvePaneBounds', () => {
  it('caps the pane at its hard limit when there is room to spare', () => {
    expect(resolvePaneBounds(WIDE)).toEqual({ min: PANE_MIN_WIDTH, max: PANE_MAX_WIDTH });
  });

  it('lets the other pane keep its minimum when room runs short', () => {
    expect(resolvePaneBounds(MEDIUM)).toEqual({ min: PANE_MIN_WIDTH, max: MEDIUM - PANE_MIN_CONTENT_WIDTH });
  });

  it('lets the floor win in a container too narrow for both limits', () => {
    // 500 - 320 leaves 180, which no usable pane fits in: the floor wins and the layout is
    // a single column below `xl` anyway.
    expect(resolvePaneBounds(500)).toEqual({ min: PANE_MIN_WIDTH, max: PANE_MIN_WIDTH });
  });

  it('answers with the absolute limits before anything has been measured', () => {
    // A room calculated from a zero-width container would put the maximum below the current
    // width, and a screen reader would announce a value larger than its own maximum.
    expect(resolvePaneBounds(0)).toEqual({ min: PANE_MIN_WIDTH, max: PANE_MAX_WIDTH });
  });

  it('honours overrides for both limits', () => {
    expect(resolvePaneBounds(MEDIUM, { min: 100, max: 200, minContentWidth: 100 })).toEqual({ min: 100, max: 200 });
    expect(resolvePaneBounds(500, { min: 100, max: 900, minContentWidth: 100 })).toEqual({ min: 100, max: 400 });
  });
});

describe('resolvePaneWidth', () => {
  it('falls back to the default when nothing is stored', () => {
    expect(resolvePaneWidth(WIDE)).toBe(PANE_DEFAULT_WIDTH);
    expect(resolvePaneWidth(WIDE, undefined, { defaultWidth: 500 })).toBe(500);
  });

  it('keeps a stored width that fits', () => {
    expect(resolvePaneWidth(WIDE, 700)).toBe(700);
  });

  it('pulls a stored width into the room the container actually has', () => {
    // 900 fits a wide container but not this one, where the other pane must keep 320.
    expect(resolvePaneWidth(MEDIUM, 900)).toBe(MEDIUM - PANE_MIN_CONTENT_WIDTH);
    expect(resolvePaneWidth(WIDE, 100)).toBe(PANE_MIN_WIDTH);
  });

  it('clamps only to the absolute limits before anything has been measured', () => {
    // Clamping to a room calculated from a zero-width container would collapse the pane on
    // the first paint, so an unmeasured container trusts the stored value inside the limits.
    expect(resolvePaneWidth(0, 700)).toBe(700);
    expect(resolvePaneWidth(0, 5000)).toBe(PANE_MAX_WIDTH);
    expect(resolvePaneWidth(0, 100)).toBe(PANE_MIN_WIDTH);
  });

  it('treats a value that is not a width as no value at all', () => {
    expect(resolvePaneWidth(WIDE, Number.NaN)).toBe(PANE_DEFAULT_WIDTH);
    expect(resolvePaneWidth(WIDE, Number.POSITIVE_INFINITY)).toBe(PANE_DEFAULT_WIDTH);
  });
});

describe('stepPaneWidth', () => {
  it('moves by one step', () => {
    expect(stepPaneWidth(500, -PANE_KEYBOARD_STEP, WIDE)).toBe(500 - PANE_KEYBOARD_STEP);
    expect(stepPaneWidth(500, PANE_KEYBOARD_STEP, WIDE)).toBe(500 + PANE_KEYBOARD_STEP);
  });

  it('stops at the floor and at the ceiling rather than running past them', () => {
    expect(stepPaneWidth(PANE_MIN_WIDTH + 4, -PANE_KEYBOARD_STEP, WIDE)).toBe(PANE_MIN_WIDTH);
    expect(stepPaneWidth(PANE_MAX_WIDTH - 4, PANE_KEYBOARD_STEP, WIDE)).toBe(PANE_MAX_WIDTH);
  });

  it('respects the container it is stepping inside', () => {
    const roomMax = MEDIUM - PANE_MIN_CONTENT_WIDTH;
    expect(stepPaneWidth(roomMax - 4, PANE_KEYBOARD_STEP, MEDIUM)).toBe(roomMax);
  });
});

describe('clampPaneWidth', () => {
  it('clamps both ways and leaves what is already in range alone', () => {
    expect(clampPaneWidth(50, 100, 200)).toBe(100);
    expect(clampPaneWidth(500, 100, 200)).toBe(200);
    expect(clampPaneWidth(150, 100, 200)).toBe(150);
  });
});

describe('normalizePaneWidths', () => {
  it('answers an empty layout for anything that is not a record of numbers', () => {
    for (const stored of [undefined, null, 'nope', 42, [], ['a'], {}]) {
      expect(normalizePaneWidths(stored)).toEqual({});
    }
  });

  it('keeps the widths it can trust', () => {
    expect(normalizePaneWidths({ library: 700, compare: 500 })).toEqual({ library: 700, compare: 500 });
  });

  it('pulls out-of-range widths into range instead of discarding them', () => {
    expect(normalizePaneWidths({ narrow: 10, huge: 5000 })).toEqual({ narrow: PANE_MIN_WIDTH, huge: PANE_MAX_WIDTH });
  });

  it('drops entries that cannot be a width at all', () => {
    expect(
      normalizePaneWidths({
        text: '700',
        nan: Number.NaN,
        infinite: Number.POSITIVE_INFINITY,
        nothing: null,
        nested: { width: 700 },
        '': 500,
      }),
    ).toEqual({});
  });
});
