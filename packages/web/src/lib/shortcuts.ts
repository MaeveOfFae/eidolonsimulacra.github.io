/**
 * Global keyboard shortcuts, as pure predicates.
 *
 * The listeners themselves live in `Layout`, but the *decisions* are here so they
 * can be tested without mounting the app shell: which keys count, and — the part
 * that is easy to get wrong — which keys must be ignored because the user is
 * typing.
 */
import { isTypingTarget } from './focus';

export interface ShortcutEvent {
  key: string;
  target: unknown;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

/** ⌘K on Apple platforms, Ctrl-K elsewhere. Advertised via `aria-keyshortcuts`. */
export const PALETTE_SHORTCUT_ARIA = 'Control+K Meta+K';

/** `?` on a US layout, which is Shift+/ and advertised as such. */
export const HELP_SHORTCUT_ARIA = 'Shift+/';

function hasCommandModifier(event: ShortcutEvent): boolean {
  return event.metaKey === true || event.ctrlKey === true;
}

/** The quick-actions palette: ⌘K / Ctrl-K, and not while typing a literal "k". */
export function isPaletteShortcut(event: ShortcutEvent): boolean {
  return hasCommandModifier(event) && event.altKey !== true && event.key.toLowerCase() === 'k';
}

/**
 * `?` opens help for the current page. Ignored while typing, so a question mark
 * in a seed or a chat message stays a question mark.
 */
export function isHelpShortcut(event: ShortcutEvent): boolean {
  if (hasCommandModifier(event) || event.altKey === true) {
    return false;
  }

  if (isTypingTarget(event.target)) {
    return false;
  }

  return event.key === '?';
}
