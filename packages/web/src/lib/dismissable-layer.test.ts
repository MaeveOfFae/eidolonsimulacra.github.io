import { describe, expect, it } from 'vitest';
import { DISMISS_KEY, isDismissKey, shouldDismissOnPointerDown, type ContainsNode } from './dismissable-layer';

/** A container that claims one specific node, which is all `contains` is asked. */
function containing(node: object): ContainsNode {
  return { contains: (candidate) => candidate === (node as Node) };
}

function empty(): ContainsNode {
  return { contains: () => false };
}

describe('isDismissKey', () => {
  it('dismisses on Escape only', () => {
    expect(isDismissKey(DISMISS_KEY)).toBe(true);
    expect(isDismissKey('Enter')).toBe(false);
    expect(isDismissKey(' ')).toBe(false);
    expect(isDismissKey('Tab')).toBe(false);
  });
});

describe('shouldDismissOnPointerDown', () => {
  it('dismisses a press on the page behind', () => {
    const page = {};

    expect(shouldDismissOnPointerDown({ target: page, containers: [empty(), empty()] })).toBe(true);
  });

  it('keeps the layer open for a press inside the panel', () => {
    const inside = {};
    const panel = containing(inside);

    expect(shouldDismissOnPointerDown({ target: inside, containers: [panel, empty()] })).toBe(false);
  });

  it('keeps the layer open for a press on the trigger, which owns that toggle', () => {
    const triggerNode = {};

    expect(shouldDismissOnPointerDown({ target: triggerNode, containers: [empty(), containing(triggerNode)] })).toBe(
      false,
    );
  });

  it('dismisses when there is no target to test', () => {
    expect(shouldDismissOnPointerDown({ target: null, containers: [empty()] })).toBe(true);
    expect(shouldDismissOnPointerDown({ target: undefined, containers: [empty()] })).toBe(true);
  });

  it('dismisses when the panel is not mounted, rather than assuming it is inside', () => {
    expect(shouldDismissOnPointerDown({ target: {}, containers: [null, null] })).toBe(true);
  });
});
