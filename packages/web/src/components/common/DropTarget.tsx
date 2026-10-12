import { useEffect, useRef, useState } from 'react';

interface DropTargetProps {
  /** Called with the dropped files. The overlay is purely visual; this is the action. */
  onFiles: (files: File[]) => void;
  /** What the overlay says while a file is over the app. */
  label: string;
}

/**
 * A drop surface for the whole app frame.
 *
 * The listener is on the document rather than on a bordered box, because a drop target you
 * have to aim at is a worse target: a file dragged anywhere over the window is meant for the
 * app, and nothing else in the app accepts a drop.
 *
 * `dragenter`/`dragleave` fire for every element the pointer crosses, so the overlay is
 * driven by a depth counter instead of a boolean — without it, the panel flickers as the
 * pointer moves between children, and the drop is dismissed mid-drag.
 *
 * It ignores drags that carry no files (dragging selected text, an image from another page),
 * which is what stops the overlay appearing for a gesture that cannot be completed.
 *
 * The overlay is `aria-hidden`: it is transient, and a screen reader cannot drag a file. What
 * matters for assistive tech is the *outcome*, which the caller announces in a live region.
 */
export default function DropTarget({ onFiles, label }: DropTargetProps) {
  const [isOver, setIsOver] = useState(false);
  const depth = useRef(0);

  useEffect(() => {
    const carriesFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes('Files');

    const handleDragEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) {
        return;
      }

      depth.current += 1;
      setIsOver(true);
    };

    const handleDragOver = (event: DragEvent) => {
      if (!carriesFiles(event)) {
        return;
      }

      // Without this the browser refuses the drop and the file opens in a new tab.
      event.preventDefault();
    };

    const handleDragLeave = (event: DragEvent) => {
      if (!carriesFiles(event)) {
        return;
      }

      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) {
        setIsOver(false);
      }
    };

    const handleDrop = (event: DragEvent) => {
      depth.current = 0;
      setIsOver(false);

      if (!carriesFiles(event)) {
        return;
      }

      event.preventDefault();
      onFiles(Array.from(event.dataTransfer?.files ?? []));
    };

    document.addEventListener('dragenter', handleDragEnter);
    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('dragenter', handleDragEnter);
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('dragleave', handleDragLeave);
      document.removeEventListener('drop', handleDrop);
    };
  }, [onFiles]);

  if (!isOver) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-background/70 p-6 backdrop-blur-sm"
    >
      <p className="rounded-2xl border border-dashed border-primary/50 bg-card/95 px-6 py-4 text-center text-sm font-medium text-foreground shadow-2xl">
        {label}
      </p>
    </div>
  );
}
