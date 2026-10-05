import { isTypingTarget } from './focus';
import {
  HELP_SHORTCUT_ARIA,
  isHelpShortcut,
  isPaletteShortcut,
  PALETTE_SHORTCUT_ARIA,
  type ShortcutEvent,
} from './shortcuts';

function event(overrides: Partial<ShortcutEvent> & { key: string }): ShortcutEvent {
  return { target: null, ...overrides };
}

const inputTarget = { tagName: 'INPUT', isContentEditable: false };
const textareaTarget = { tagName: 'TEXTAREA', isContentEditable: false };
const selectTarget = { tagName: 'SELECT', isContentEditable: false };
const buttonTarget = { tagName: 'BUTTON', isContentEditable: false };
const editableTarget = { tagName: 'DIV', isContentEditable: true };

describe('isTypingTarget', () => {
  it('recognises the fields a user types into', () => {
    expect(isTypingTarget(inputTarget)).toBe(true);
    expect(isTypingTarget(textareaTarget)).toBe(true);
    expect(isTypingTarget(selectTarget)).toBe(true);
    expect(isTypingTarget(editableTarget)).toBe(true);
  });

  it('is case-insensitive about the tag name', () => {
    expect(isTypingTarget({ tagName: 'input' })).toBe(true);
  });

  it('treats everything else as not typing', () => {
    expect(isTypingTarget(buttonTarget)).toBe(false);
    expect(isTypingTarget(null)).toBe(false);
    expect(isTypingTarget(undefined)).toBe(false);
    expect(isTypingTarget('input')).toBe(false);
    expect(isTypingTarget({ tagName: 'DIV', isContentEditable: false })).toBe(false);
  });
});

describe('palette shortcut', () => {
  it('accepts ⌘K and Ctrl-K, either case', () => {
    expect(isPaletteShortcut(event({ key: 'k', metaKey: true }))).toBe(true);
    expect(isPaletteShortcut(event({ key: 'K', ctrlKey: true }))).toBe(true);
  });

  it('requires the command modifier', () => {
    expect(isPaletteShortcut(event({ key: 'k' }))).toBe(false);
    expect(isPaletteShortcut(event({ key: 'k', shiftKey: true }))).toBe(false);
  });

  it('ignores other keys and modifier combinations', () => {
    expect(isPaletteShortcut(event({ key: 'j', ctrlKey: true }))).toBe(false);
    expect(isPaletteShortcut(event({ key: 'k', ctrlKey: true, altKey: true }))).toBe(false);
  });
});

describe('help shortcut', () => {
  it('accepts a bare question mark', () => {
    expect(isHelpShortcut(event({ key: '?', target: buttonTarget }))).toBe(true);
    expect(isHelpShortcut(event({ key: '?', target: null }))).toBe(true);
  });

  it('stays out of the way while the user is typing', () => {
    // The whole reason this predicate exists: "why?" in a seed must stay "why?".
    expect(isHelpShortcut(event({ key: '?', target: inputTarget }))).toBe(false);
    expect(isHelpShortcut(event({ key: '?', target: textareaTarget }))).toBe(false);
    expect(isHelpShortcut(event({ key: '?', target: editableTarget }))).toBe(false);
  });

  it('ignores the question mark with modifiers, since those are other shortcuts', () => {
    expect(isHelpShortcut(event({ key: '?', metaKey: true }))).toBe(false);
    expect(isHelpShortcut(event({ key: '?', ctrlKey: true }))).toBe(false);
    expect(isHelpShortcut(event({ key: '?', altKey: true }))).toBe(false);
  });

  it('does not fire on the unshifted slash', () => {
    expect(isHelpShortcut(event({ key: '/', shiftKey: true }))).toBe(false);
  });
});

describe('advertised shortcut names', () => {
  it('exposes the aria-keyshortcuts strings the buttons carry', () => {
    expect(PALETTE_SHORTCUT_ARIA).toBe('Control+K Meta+K');
    expect(HELP_SHORTCUT_ARIA).toBe('Shift+/');
  });
});
