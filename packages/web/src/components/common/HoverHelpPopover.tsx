import { Link } from 'react-router-dom';
import { ArrowRight, CircleHelp, PlayCircle, TriangleAlert } from 'lucide-react';
import type { HelpActionLink } from '../../lib/help';
import { cn } from '../../utils/cn';

interface HoverHelpPopoverProps {
  title: string;
  summary: string;
  label?: string;
  keyActions?: string[];
  pitfalls?: string[];
  actions?: HelpActionLink[];
  actionLabel?: string;
  onAction?: () => void;
  onTriggerClick?: () => void;
  className?: string;
  triggerClassName?: string;
  align?: 'start' | 'end';
}

export default function HoverHelpPopover({
  title,
  summary,
  label,
  keyActions = [],
  pitfalls = [],
  actions = [],
  actionLabel,
  onAction,
  onTriggerClick,
  className,
  triggerClassName,
  align = 'start',
}: HoverHelpPopoverProps) {
  return (
    <div className={cn('group relative inline-flex', className)}>
      <button
        type="button"
        onClick={onTriggerClick}
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary',
          triggerClassName,
        )}
      >
        <CircleHelp className="h-3.5 w-3.5" />
        {label ? <span>{label}</span> : null}
      </button>

      <div
        role="tooltip"
        className={cn(
          'pointer-events-none invisible absolute top-full z-30 mt-3 w-[22rem] max-w-[min(22rem,calc(100vw-2rem))] translate-y-1 rounded-2xl border border-border/70 bg-card/98 p-4 opacity-0 shadow-2xl backdrop-blur-md transition-[opacity,transform,visibility] duration-200 ease-out group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100',
          align === 'end' ? 'right-0' : 'left-0',
        )}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Hover Help</p>
          <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>

        {keyActions.length > 0 && (
          <section className="mt-4 rounded-xl border border-border/60 bg-background/40 p-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">What to do</h4>
            <div className="mt-2 space-y-2">
              {keyActions.slice(0, 3).map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <p className="leading-5">{item}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {pitfalls.length > 0 && (
          <section className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 text-foreground">
              <TriangleAlert className="h-3.5 w-3.5 text-amber-500" />
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em]">Avoid</h4>
            </div>
            <div className="mt-2 space-y-2">
              {pitfalls.slice(0, 2).map((item) => (
                <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <p className="leading-5">{item}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(actions.length > 0 || (actionLabel && onAction)) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actionLabel && onAction && (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                {actionLabel}
              </button>
            )}

            {actions.slice(0, 2).map((action) => (
              <Link
                key={`${title}-${action.to}`}
                to={action.to}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {action.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}