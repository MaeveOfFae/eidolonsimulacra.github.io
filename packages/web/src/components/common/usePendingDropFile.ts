import { useEffect, useRef } from 'react';
import { PENDING_DROP_EVENT, takePendingDrop } from '@/lib/desktop/pending-drop';
import type { DroppedFileKind } from '@/lib/desktop/file-drop';

/**
 * Imports a file the user dropped, whichever way it arrives.
 *
 * Two paths lead to the same screen and both have to be covered:
 *
 *  - the drop happened on another screen, so this one was navigated to and is mounting;
 *  - the drop happened on this screen, which is already mounted and will never remount.
 *
 * `takePendingDrop` hands the file over exactly once, so the two paths cannot double-import
 * when a navigation triggers them in the same tick.
 *
 * The handler is held in a ref: a screen passing an inline closure would otherwise resubscribe
 * on every render, and a drop landing in that window would be missed.
 */
export function usePendingDropFile(kind: DroppedFileKind, onFile: (file: File) => void): void {
  const handlerRef = useRef(onFile);
  handlerRef.current = onFile;

  useEffect(() => {
    const consume = () => {
      const drop = takePendingDrop(kind);
      if (drop) {
        handlerRef.current(drop.file);
      }
    };

    consume();
    window.addEventListener(PENDING_DROP_EVENT, consume);
    return () => window.removeEventListener(PENDING_DROP_EVENT, consume);
  }, [kind]);
}
