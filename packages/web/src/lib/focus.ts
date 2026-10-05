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

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** The elements Tab can reach inside a container, in DOM order. */
export function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) {
    return [];
  }

  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)];
}

/**
 * Whether a keyboard event is being typed into a field.
 *
 * Deliberately duck-typed on `tagName`/`isContentEditable` rather than using
 * `instanceof`: the global shortcuts run over events whose target can come from
 * any realm, and this keeps the check usable in tests without a DOM cast.
 */
export function isTypingTarget(target: unknown): boolean {
  if (!target || typeof target !== 'object') {
    return false;
  }

  const candidate = target as { tagName?: unknown; isContentEditable?: unknown };

  if (typeof candidate.tagName === 'string' && TYPING_TAGS.has(candidate.tagName.toUpperCase())) {
    return true;
  }

  return candidate.isContentEditable === true;
}
