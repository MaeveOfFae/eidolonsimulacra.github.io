/**
 * Global keyboard shortcuts, as pure predicates.
 *
 * The listeners themselves live in `Layout`, but the *decisions* are here so they
 * can be tested without mounting the app shell: which keys count, and — the part
 * that is easy to get wrong — which keys must be ignored because the user is
 * typing.
 */
import { isTypingTarget } from './focus';
import { quickActionsShortcutLabel } from './navigation/quick-actions';

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

/** How the UI prints the help key, beside the ARIA spec above so the two cannot drift. */
export const HELP_SHORTCUT_LABEL = '?';

/** How the UI prints the dismiss key. The handler matches `DISMISS_KEY` ('Escape'). */
export const DISMISS_SHORTCUT_LABEL = 'Esc';

export interface KeyboardShortcut {
  id: string;
  /** What the keys do, phrased as the instruction, not as the key name. */
  action: string;
  /** How the keys are printed. */
  keys: string;
}

/**
 * The shortcuts the app advertises, built from the constants the handlers read.
 *
 * Derived rather than declared, because that is the only thing that keeps a help sheet
 * honest: an advertised key and a handled key written as two independent strings are
 * one edit away from a sheet that names a shortcut doing nothing, and nothing fails.
 * Here the help row prints `HELP_SHORTCUT_LABEL`, which `isHelpShortcut` accepts, and
 * the palette row is the same platform-aware label the sidebar and the palette already
 * print.
 *
 * A function rather than a constant so the platform can be supplied — the default reads
 * `navigator`, and a test can pass 'MacIntel' or '' instead of faking a global.
 */
export function listKeyboardShortcuts(
  platform: string = typeof navigator === 'undefined' ? '' : navigator.platform,
): KeyboardShortcut[] {
  return [
    { id: 'palette', action: 'Open the quick-actions palette', keys: quickActionsShortcutLabel(platform) },
    { id: 'help', action: 'Open the Help menu', keys: HELP_SHORTCUT_LABEL },
    { id: 'dismiss', action: 'Close what is open — a menu, a dialog, a guided tour', keys: DISMISS_SHORTCUT_LABEL },
  ];
}
