/**
 * Focus utilities shared by the keyboard-facing surfaces.
 *
 * `getFocusableElements` is deliberately not filtered by visibility: collapsed
 * content in this codebase is conditionally rendered rather than
 * `display: none`, and a layout-based filter (`offsetParent`, `getClientRects`)
 * reports nothing under happy-dom, which would silently empty a focus trap in
 * tests while appearing to work in a browser.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** The elements Tab can reach inside a container, in DOM order. */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
}
