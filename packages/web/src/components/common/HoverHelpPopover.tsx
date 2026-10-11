import { CircleHelp, PlayCircle } from 'lucide-react';
import { HELP_ENTRY_EYEBROWS, type HelpActionLink } from '../../lib/help';
import { cn } from '../../utils/cn';
import HelpEntryBody from './HelpEntryBody';

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
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {HELP_ENTRY_EYEBROWS.compact}
          </p>
          <h3 className="mt-2 text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{summary}</p>
        </div>

        <HelpEntryBody
          sections={{ keyActions, pitfalls, actions }}
          variant="compact"
          extraAction={
            actionLabel && onAction ? (
              <button
                type="button"
                onClick={onAction}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                {actionLabel}
              </button>
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
