import { useCallback, useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, BookOpen, CircleHelp, PlayCircle, RotateCcw } from 'lucide-react';
import type { PageHelpEntry } from '@/lib/help';
import { HELP_SHORTCUT_ARIA } from '@/lib/shortcuts';
import { cn } from '@/utils/cn';
import { useGuidedTour } from './GuidedTourContext';
import { useDismissableLayer } from './useDismissableLayer';

/**
 * The Help menu: one control, opened deliberately, that gathers everything the app
 * knows about helping you use it.
 *
 * It replaces the header's hover card, and the reason is the hover card's shape rather
 * than its copy. A 22rem panel that appears on hover cannot be pinned while you read
 * it, cannot be reached at all from a touch screen, and announced itself as
 * `role="tooltip"` while containing links and buttons — a tooltip may not hold
 * interactive content, and a screen reader has no way to know it should. This is a
 * real disclosure: click, Enter or Space opens it, `?` opens it from anywhere on a
 * screen, Escape and an outside press close it, and focus comes back to the trigger.
 *
 * It is a **dialog, not a menu**, and that is deliberate: `role="menu"` may only
 * contain menu items, and this holds a page-help action, a full tour list, and three
 * links. Modelling those as items would break the pattern to win an ARIA label, so Tab
 * order stays the navigation it looks like.
 *
 * The same component renders in the desktop and the mobile header, which is the other
 * half of the point: the old affordance changed shape at the `lg` breakpoint.
 */
interface HelpMenuProps {
  /** Page help for the current route, or null where the route has none. */
  entry: PageHelpEntry | null;
  /** Opens the contextual-help drawer, which is where the full page help lives. */
  onOpenPageHelp: () => void;
  /**
   * Whether the panel is open. The caller owns this rather than the component, because
   * the global `?` shortcut has to be able to open it from outside.
   */
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  /** Which edge the panel hangs from. */
  align?: 'start' | 'end';
  className?: string;
}

const LINK_CLASSES =
  'inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary';

export default function HelpMenu({
  entry,
  onOpenPageHelp,
  isOpen,
  onOpenChange,
  align = 'end',
  className,
}: HelpMenuProps) {
  const location = useLocation();
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  useDismissableLayer({ isOpen, onDismiss: close, panelRef, triggerRef });

  // A route change is this menu doing its job. Leaving it open would cover the screen
  // the user just asked for, and the drawer it can open has the same rule.
  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-keyshortcuts={HELP_SHORTCUT_ARIA}
        className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
        Help
      </button>

      {isOpen ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Help"
          className={cn(
            'absolute top-full z-40 mt-2 max-h-[min(70vh,32rem)] w-[min(24rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl backdrop-blur-md',
            align === 'end' ? 'right-0' : 'left-0',
          )}
        >
          {entry ? (
            <button
              type="button"
              onClick={() => {
                close();
                onOpenPageHelp();
              }}
              className="flex w-full items-start gap-3 rounded-xl border border-border/60 bg-background/40 p-3 text-left transition-colors hover:border-primary/40"
            >
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Help for this page</span>
                  <kbd className="rounded border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    ?
                  </kbd>
                </span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{entry.summary}</span>
              </span>
            </button>
          ) : (
            <p className="rounded-xl border border-border/60 bg-background/40 p-3 text-xs leading-5 text-muted-foreground">
              This screen has no page-level help yet. The Help Center below covers the workflow end to end.
            </p>
          )}

          <HelpMenuTours onClose={close} />
          <HelpMenuLinks onClose={close} />
        </div>
      ) : null}
    </div>
  );
}

interface HelpMenuSectionProps {
  onClose: () => void;
}

/** The tour list, started and restarted by the same rule the Help Center page uses. */
function HelpMenuTours({ onClose }: HelpMenuSectionProps) {
  const { tours, isTourCompleted, startTour, restartTour } = useGuidedTour();
  const completedCount = tours.filter((tour) => isTourCompleted(tour.id)).length;

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Guided tours</p>
        <span className="text-[11px] text-muted-foreground">
          {completedCount}/{tours.length} complete
        </span>
      </div>
      <div className="mt-2 space-y-1.5">
        {tours.map((tour) => {
          const completed = isTourCompleted(tour.id);

          return (
            <div
              key={tour.id}
              className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/30 px-2.5 py-1.5"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-foreground">{tour.title}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {tour.estimatedMinutes} min · {tour.steps.length} steps
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (completed) {
                    restartTour(tour.id);
                  } else {
                    startTour(tour.id);
                  }
                }}
                aria-label={completed ? `Restart ${tour.title}` : `Start ${tour.title}`}
                className="shrink-0 rounded-lg border border-border/60 bg-background/50 p-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {completed ? (
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <PlayCircle className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The three destinations, ordered by how much they help someone who is stuck. */
function HelpMenuLinks({ onClose }: HelpMenuSectionProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-3">
      <Link to="/help" onClick={onClose} className={LINK_CLASSES}>
        Help Center
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
      <Link to="/whats-new" onClick={onClose} className={LINK_CLASSES}>
        What&rsquo;s new
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
      <Link to="/about" onClick={onClose} className={LINK_CLASSES}>
        About
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </Link>
    </div>
  );
}
