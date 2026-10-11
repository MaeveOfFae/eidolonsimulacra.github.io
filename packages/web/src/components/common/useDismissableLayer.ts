import { useEffect, type RefObject } from 'react';
import { isDismissKey, shouldDismissOnPointerDown } from '@/lib/dismissable-layer';

interface DismissableLayerOptions {
  isOpen: boolean;
  onDismiss: () => void;
  /** The panel. A press inside it is the user using the layer, not leaving it. */
  panelRef: RefObject<HTMLElement | null>;
  /** The trigger: a press here is the toggle the trigger already owns. */
  triggerRef: RefObject<HTMLElement | null>;
}

/**
 * Escape and outside-press dismissal for a non-modal layer, with focus put back.
 *
 * `ModalOverlay` is the wrong shape to reuse: it traps focus, locks body scroll, and
 * blocks the page, which is right for a dialog and wrong for a panel that lives in the
 * header while the page stays usable. What it gets right is worth keeping, so this
 * mirrors its two decisions that matter to a keyboard user — Escape dismisses, and
 * focus returns to where it was — and adds the outside-press rule it does not need.
 *
 * `mousedown` rather than `pointerdown`: it is the portable subset of "a press started
 * somewhere", and it fires on touch too. Nothing here needs the extra information a
 * pointer event carries.
 */
export function useDismissableLayer({ isOpen, onDismiss, panelRef, triggerRef }: DismissableLayerOptions) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const shouldDismiss = shouldDismissOnPointerDown({
        target: event.target,
        containers: [panelRef.current, triggerRef.current],
      });

      if (shouldDismiss) {
        onDismiss();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isDismissKey(event.key)) {
        return;
      }

      event.stopPropagation();
      onDismiss();
      triggerRef.current?.focus();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onDismiss, panelRef, triggerRef]);
}
