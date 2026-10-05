/**
 * Tab-order inspection for the per-screen keyboard sweep.
 *
 * A tab-order bug is invisible in source: it comes from CSS reordering a flex or
 * grid row (`order-*`, `*-reverse`) or from an absolutely-positioned element, so
 * what the user sees left-to-right is not what Tab walks. The only way to check
 * it is to render the screen and read the focusable elements in DOM order, which
 * is exactly what the browser follows.
 *
 * Test-only infrastructure: not shipped, and deliberately not matched by the
 * vitest test glob (no `.test` in the name).
 */
import { getFocusableElements } from '@/lib/focus';

export interface TabStop {
  tag: string;
  name: string;
}

function findExplicitLabel(element: HTMLElement): string | null {
  const id = element.getAttribute('id');
  if (!id) {
    return null;
  }

  for (const label of element.ownerDocument.querySelectorAll('label[for]')) {
    if (label.getAttribute('for') === id) {
      const text = (label.textContent ?? '').replace(/\s+/g, ' ').trim();
      if (text) {
        return text;
      }
    }
  }

  return null;
}

/**
 * Best available approximation of the accessible name, in precedence order.
 *
 * Without the wrapping-label and `htmlFor` steps a field would be reported by its
 * placeholder instead of its label, which would make every assertion read wrong
 * even though the markup was correct.
 */
function describeTabStop(element: HTMLElement): string {
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }

  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const text = element.ownerDocument.getElementById(labelledBy)?.textContent?.replace(/\s+/g, ' ').trim();
    if (text) {
      return text;
    }
  }

  const explicit = findExplicitLabel(element);
  if (explicit) {
    return explicit;
  }

  const wrapping = element.closest('label');
  if (wrapping) {
    const text = (wrapping.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (text) {
      return text;
    }
  }

  const ownText = (element.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (ownText) {
    return ownText;
  }

  // `title` is a real (last-resort) accessible name, and a programmatic file
  // input commonly carries one instead of a label.
  const title = element.getAttribute('title');
  if (title) {
    return title;
  }

  const placeholder = element.getAttribute('placeholder');
  if (placeholder) {
    return `[${placeholder}]`;
  }

  const value = (element as HTMLInputElement).value;
  if (value) {
    return `=${value}`;
  }

  return `<${element.tagName.toLowerCase()}>`;
}

/**
 * Every element Tab can reach under `root`, in the order Tab reaches it.
 *
 * Two limitations worth knowing before reading a sequence:
 *
 * - `hidden`-class elements are skipped, because Tailwind's `hidden` is
 *   `display: none` and a browser does not focus those. `getFocusableElements`
 *   cannot tell: happy-dom does not compute styles, so a layout-based filter would
 *   report *nothing* as focusable and empty every assertion.
 * - **Responsive duplicates appear once per variant.** Settings renders its section
 *   nav twice (`sm:hidden` for the compact layout, a breakpoint class for the wide
 *   one) so exactly one is visible at any viewport — but happy-dom does not apply
 *   breakpoints, so both show up here. A repeated block of the same controls is
 *   therefore not a defect; assert with `assertTabOrderAfter`, which matches the
 *   first occurrence.
 */
export function collectTabStops(root: HTMLElement = document.body): TabStop[] {
  return getFocusableElements(root)
    .filter((element) => !element.classList.contains('hidden'))
    .map((element) => ({
      tag: element.tagName.toLowerCase(),
      name: describeTabStop(element),
    }));
}

/** The sequence as `tag: name` strings, for assertions and readable failures. */
export function formatTabStops(stops: TabStop[] = collectTabStops()): string[] {
  return stops.map((stop) => `${stop.tag}: ${stop.name}`);
}

/**
 * Asserts every tab stop has a real name.
 *
 * A stop whose name fell through to the `<tag>` fallback is focusable and
 * announceable as nothing useful — the failure mode that makes a keyboard user
 * tab into a void. Reported as the offending entries rather than a boolean so the
 * failure names the element.
 */
export function findUnnamedTabStops(sequence: string[] = formatTabStops()): string[] {
  return sequence.filter((entry) => /: <[a-z]+>$/.test(entry));
}

/**
 * Asserts `needle` appears after `before` in the tab sequence — the shape most
 * tab-order checks take ("the submit button comes after the fields it submits").
 */
export function assertTabOrderAfter(sequence: string[], before: string, after: string): void {
  const beforeIndex = sequence.findIndex((entry) => entry.includes(before));
  const afterIndex = sequence.findIndex((entry) => entry.includes(after));

  if (beforeIndex === -1 || afterIndex === -1) {
    throw new Error(
      `Tab order check could not find both anchors.\n  before: ${before} (${beforeIndex})\n  after: ${after} (${afterIndex})\n  sequence: ${JSON.stringify(sequence, null, 2)}`,
    );
  }

  if (afterIndex < beforeIndex) {
    throw new Error(
      `Expected "${after}" to come after "${before}" in tab order.\n  sequence: ${JSON.stringify(sequence, null, 2)}`,
    );
  }
}
