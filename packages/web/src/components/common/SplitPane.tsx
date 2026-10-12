import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { configManager } from '@/lib/config/manager';
import { PANE_KEYBOARD_STEP, resolvePaneBounds, resolvePaneWidth, stepPaneWidth } from '@/lib/split-pane';
import { cn } from '@/utils/cn';

interface SplitPaneProps {
  /** Names this pane in the stored layout, so two split surfaces keep separate widths. */
  paneId: string;
  /** The pane whose width the divider controls. */
  primary: ReactNode;
  /** The pane that takes whatever room is left. */
  secondary: ReactNode;
  /** Accessible name for the divider itself, e.g. "Resize the draft list". */
  separatorLabel: string;
  className?: string;
}

/**
 * Two panes side by side, with a divider you can drag or type at.
 *
 * Below `xl` the panes stack and the divider is not rendered at all: a two-column split on
 * a phone is two columns of nothing, and the stacked order is the reading order. The split
 * is expressed as a CSS variable that only takes effect at `xl`, so no JavaScript has to
 * know which breakpoint is active — the stored pixel width simply does not apply while the
 * layout is stacked.
 *
 * The width is persisted at the **end** of an interaction, not during it. A write per
 * pointermove would dispatch a config-changed event on every frame and re-render every
 * listener of it; dragging is local state, and the config hears about it once.
 *
 * Accessibility follows the window-splitter pattern: the divider is a focusable
 * `role="separator"` with `aria-valuenow`/`min`/`max`, arrow keys move it, Home and End go
 * to the limits, and double-click returns it to the default. It is a real tab stop with a
 * name, which is what makes it usable without a pointer at all.
 *
 * Assumes a left-to-right layout: the pane the divider sizes is the left one, so ArrowLeft
 * narrows it. There is no RTL mode to support.
 */
export default function SplitPane({ paneId, primary, secondary, separatorLabel, className }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const primaryId = useId();
  const [containerWidth, setContainerWidth] = useState(0);
  const [width, setWidth] = useState(() => resolvePaneWidth(0, configManager.getPaneWidth(paneId)));
  const [isDragging, setIsDragging] = useState(false);

  // Measure on mount and on resize. Only the container knows how much room there is now, and
  // a width that was dragged inside a wide window has to give way when the window narrows.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const measure = () => setContainerWidth(element.getBoundingClientRect().width);
    measure();
    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
  }, []);

  // Re-resolve when the room changes, treating the current width as the preference.
  useEffect(() => {
    if (containerWidth <= 0) {
      return;
    }

    setWidth((current) => resolvePaneWidth(containerWidth, current));
  }, [containerWidth]);

  const persist = (next: number) => configManager.updatePaneWidth(paneId, next);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const bounds = resolvePaneBounds(containerWidth);
    let next: number | null = null;

    if (event.key === 'ArrowLeft') {
      next = stepPaneWidth(width, -PANE_KEYBOARD_STEP, containerWidth);
    } else if (event.key === 'ArrowRight') {
      next = stepPaneWidth(width, PANE_KEYBOARD_STEP, containerWidth);
    } else if (event.key === 'Home') {
      next = bounds.min;
    } else if (event.key === 'End') {
      next = bounds.max;
    }

    if (next === null) {
      return;
    }

    event.preventDefault();
    setWidth(next);
    // A discrete change has no drag to wait for, so it persists straight away.
    persist(next);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const separator = event.currentTarget;
    const startX = event.clientX;
    const startWidth = width;
    let latest = startWidth;

    // Pointer capture is what keeps the drag alive once the pointer leaves the 12px handle,
    // which happens almost immediately on a fast drag.
    separator.setPointerCapture?.(event.pointerId);
    setIsDragging(true);

    const handleMove = (moveEvent: PointerEvent) => {
      latest = resolvePaneWidth(containerWidth, startWidth + (moveEvent.clientX - startX));
      setWidth(latest);
    };

    const finish = (upEvent: PointerEvent) => {
      separator.releasePointerCapture?.(upEvent.pointerId);
      separator.removeEventListener('pointermove', handleMove);
      separator.removeEventListener('pointerup', finish);
      separator.removeEventListener('pointercancel', finish);
      setIsDragging(false);
      persist(latest);
    };

    separator.addEventListener('pointermove', handleMove);
    separator.addEventListener('pointerup', finish);
    separator.addEventListener('pointercancel', finish);
  };

  const resetWidth = () => {
    const next = resolvePaneWidth(containerWidth);
    setWidth(next);
    persist(next);
  };

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-0', className)}
      style={{ '--split-pane-width': `${width}px` } as CSSProperties}
    >
      <div id={primaryId} className="min-w-0 xl:shrink-0 xl:[width:var(--split-pane-width)]">
        {primary}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={separatorLabel}
        aria-controls={primaryId}
        aria-valuenow={Math.round(width)}
        aria-valuemin={resolvePaneBounds(containerWidth).min}
        aria-valuemax={resolvePaneBounds(containerWidth).max}
        aria-valuetext={`${Math.round(width)} pixels wide`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onDoubleClick={resetWidth}
        className={cn(
          'hidden w-3 shrink-0 cursor-col-resize touch-none items-center justify-center self-stretch rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:flex',
          isDragging ? 'bg-primary/25' : 'hover:bg-accent/60',
        )}
      >
        <span className={cn('h-12 w-0.5 rounded-full', isDragging ? 'bg-primary' : 'bg-border')} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1 xl:pl-4">{secondary}</div>
    </div>
  );
}
