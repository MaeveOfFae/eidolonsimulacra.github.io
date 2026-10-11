import { describe, expect, it } from 'vitest';
import { isMeasurable, resolveTooltipPlacement, type TooltipPositionInput } from './tooltip-position';

/** A 1440x900 desktop viewport with the trigger sitting in the middle of it. */
function input(overrides: Partial<TooltipPositionInput> = {}): TooltipPositionInput {
  return {
    trigger: { top: 400, left: 600, width: 100, height: 32 },
    tooltip: { width: 240, height: 48 },
    viewport: { width: 1440, height: 900 },
    preferred: { side: 'bottom', align: 'center' },
    ...overrides,
  };
}

describe('resolveTooltipPlacement', () => {
  it('keeps the requested placement when it fits', () => {
    expect(resolveTooltipPlacement(input())).toEqual({ side: 'bottom', align: 'center' });
    expect(resolveTooltipPlacement(input({ preferred: { side: 'top', align: 'start' } }))).toEqual({
      side: 'top',
      align: 'start',
    });
  });

  it('flips to the other side when the requested one has no room', () => {
    const nearTheBottom = input({ trigger: { top: 860, left: 600, width: 100, height: 32 } });
    expect(resolveTooltipPlacement(nearTheBottom)).toEqual({ side: 'top', align: 'center' });

    const nearTheTop = input({
      trigger: { top: 2, left: 600, width: 100, height: 32 },
      preferred: { side: 'top', align: 'center' },
    });
    expect(resolveTooltipPlacement(nearTheTop)).toEqual({ side: 'bottom', align: 'center' });
  });

  it('keeps the requested side when neither side fits', () => {
    // A short viewport: there is no correct answer, so it does not pretend there is one.
    const cramped = input({
      trigger: { top: 60, left: 600, width: 100, height: 32 },
      tooltip: { width: 240, height: 300 },
      viewport: { width: 1440, height: 200 },
      preferred: { side: 'bottom', align: 'center' },
    });

    expect(resolveTooltipPlacement(cramped)).toEqual({ side: 'bottom', align: 'center' });
  });

  it('clamps a centered tooltip that would hang off either edge', () => {
    const rightEdge = input({ trigger: { top: 400, left: 1400, width: 32, height: 32 } });
    expect(resolveTooltipPlacement(rightEdge)).toEqual({ side: 'bottom', align: 'end' });

    const leftEdge = input({ trigger: { top: 400, left: 4, width: 32, height: 32 } });
    expect(resolveTooltipPlacement(leftEdge)).toEqual({ side: 'bottom', align: 'start' });
  });

  it('clamps a start-aligned tooltip that would overflow, and leaves fitting ones alone', () => {
    const overflowing = input({
      trigger: { top: 400, left: 1300, width: 100, height: 32 },
      preferred: { side: 'bottom', align: 'start' },
    });
    expect(resolveTooltipPlacement(overflowing).align).toBe('end');

    const fitting = input({ preferred: { side: 'bottom', align: 'start' } });
    expect(resolveTooltipPlacement(fitting).align).toBe('start');
  });

  it('clamps an end-aligned tooltip that would overflow on the left', () => {
    const overflowing = input({
      trigger: { top: 400, left: 12, width: 40, height: 32 },
      tooltip: { width: 300, height: 48 },
      preferred: { side: 'bottom', align: 'end' },
    });
    expect(resolveTooltipPlacement(overflowing).align).toBe('start');
  });

  it('counts the gap and the margin as part of the overflow', () => {
    // The trigger bottom is 847, which leaves 53px below it in a 900px viewport: a
    // 48px tooltip fits there with no gap and no margin, but not with the default
    // 6px gap and 8px margin, so the requested side is abandoned only in that case.
    const trigger = { top: 815, left: 600, width: 100, height: 32 };

    expect(resolveTooltipPlacement(input({ trigger })).side).toBe('top');
    expect(resolveTooltipPlacement(input({ trigger, gap: 0, margin: 0 })).side).toBe('bottom');
  });
});

describe('isMeasurable', () => {
  it('reports a laid-out rect as measurable and an unmeasured one as not', () => {
    expect(isMeasurable({ top: 0, left: 0, width: 100, height: 0 })).toBe(true);
    expect(isMeasurable({ top: 0, left: 0, width: 0, height: 0 })).toBe(false);
  });
});
