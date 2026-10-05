import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { getFocusableElements } from '@/lib/focus';

/**
 * Nested dialogs are real here — the Asset Designer opens the blueprint browser —
 * so the body class is reference-counted rather than added and removed per
 * dialog. Otherwise the inner dialog unmounting would unlock scrolling behind the
 * outer one that is still open.
 */
let openDialogCount = 0;

function lockBodyScroll(): void {
  openDialogCount += 1;
  if (openDialogCount === 1) {
    document.body.classList.add('modal-open');
  }
}

function unlockBodyScroll(): void {
  openDialogCount = Math.max(0, openDialogCount - 1);
  if (openDialogCount === 0) {
    document.body.classList.remove('modal-open');
  }
}

interface ModalOverlayProps {
  /** Escape and backdrop clicks call this. */
  onClose: () => void;
  /** Accessible name for the dialog. */
  label: string;
  /**
   * Wrapper classes. The caller keeps its own layout (`z-50 flex items-center`,
   * anchoring, padding) so retrofitting does not move anything on screen.
   */
  className?: string;
  /** While false, Escape and backdrop clicks are ignored (e.g. mid-submit). */
  dismissible?: boolean;
  /**
   * While false, Tab is left alone. The guided tour sets this: the whole point of
   * a coach mark is that the user can Tab to the control it highlights.
   */
  trapFocus?: boolean;
  children: ReactNode;
}

/**
 * The shared keyboard contract for every dialog in the app.
 *
 * Before this existed, 13 dialogs rendered their own backdrop and only one of
 * them handled Escape, so a keyboard user could open a dialog and then Tab
 * straight into the page behind it. This owns the four things that were missing:
 *
 *   1. Escape closes (when dismissible),
 *   2. focus moves into the dialog on open — first focusable, else the container,
 *   3. Tab and Shift-Tab wrap at the ends instead of leaving the dialog,
 *   4. focus returns to whatever was focused before the dialog opened.
 *
 * On (3): the wrap is keyed off the first and last focusable, which is what makes
 * Tab leave. A key event originating *outside* the container never bubbles here,
 * so this deliberately does not claim to recover focus that something else moved
 * away — the full-screen overlay and its backdrop already block the pointer path.
 *
 * It also owns the `modal-open` body class, so nesting two dialogs (Asset Designer
 * opens the blueprint browser) can no longer unlock scrolling early.
 */
export default function ModalOverlay({
  onClose,
  label,
  className,
  dismissible = true,
  trapFocus = true,
  children,
}: ModalOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const [firstFocusable] = getFocusableElements(container);
    (firstFocusable ?? container)?.focus();
    lockBodyScroll();

    return () => {
      unlockBodyScroll();
      // Only restore when the original target is still mounted — the dialog may
      // have navigated away or the trigger may have been unmounted with it.
      if (previouslyFocused && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      if (dismissible) {
        event.stopPropagation();
        onClose();
      }
      return;
    }

    if (event.key !== 'Tab' || !trapFocus) {
      return;
    }

    const container = containerRef.current;
    const focusables = getFocusableElements(container);
    if (focusables.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn('fixed inset-0 outline-none', className)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={dismissible ? onClose : undefined} />
      {children}
    </div>
  );
}
