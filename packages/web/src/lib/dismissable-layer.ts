/**
 * The decisions a non-modal dismissable layer makes, as pure functions.
 *
 * `ModalOverlay` owns this whole contract for dialogs — Escape, a focus trap, focus
 * return, a body scroll lock — and none of it fits a help panel that sits in the
 * header while the page stays usable. Its wiring does not need restating; the two
 * decisions that can actually be wrong do, so they live here where a test can reach
 * them without mounting the app shell.
 */

/** Escape dismisses. Named so the intent is greppable from the hook that reads it. */
export const DISMISS_KEY = 'Escape';

export function isDismissKey(key: string): boolean {
  return key === DISMISS_KEY;
}

/**
 * The minimum of `Element` this module needs.
 *
 * Structural rather than `Element` so the decision can be tested with plain objects:
 * `contains` is the only part of the DOM that is being asked about, and happy-dom
 * would happily hand out a real node for a question about the rule.
 */
export interface ContainsNode {
  contains(node: Node | null): boolean;
}

/**
 * Whether a pointer event should dismiss an open layer.
 *
 * A press inside the panel is the user using the layer; a press on the trigger is the
 * user closing it the way they opened it, which the trigger's own click handler owns —
 * dismissing here as well would make the two fight and the panel would never open. Any
 * other press is on the page behind, and dismisses.
 *
 * A missing target counts as a dismissal: the alternative is a panel that ignores a
 * press that started nowhere, which is the failure worth avoiding.
 */
export function shouldDismissOnPointerDown(options: {
  /** Where the press started. Typed loosely because the boundary is the DOM's. */
  target: unknown;
  /** The panel and the trigger: anything inside these is not "the page behind". */
  containers: readonly (ContainsNode | null)[];
}): boolean {
  const { target, containers } = options;

  if (target === null || target === undefined) {
    return true;
  }

  return !containers.some((container) => container?.contains(target as Node) === true);
}
