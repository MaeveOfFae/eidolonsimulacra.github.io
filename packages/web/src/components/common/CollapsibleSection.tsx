import { type ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  preview?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  defaultExpanded?: boolean;
  forceExpanded?: boolean;
  density?: 'comfortable' | 'compact';
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export default function CollapsibleSection({
  title,
  subtitle,
  preview,
  meta,
  actions,
  defaultExpanded = false,
  forceExpanded = false,
  density = 'comfortable',
  className,
  bodyClassName,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isExpanded = forceExpanded || expanded;
  const compact = density === 'compact';

  return (
    <section
      className={cn(
        'overflow-hidden border border-border/70 bg-card/75 transition-[border-color,box-shadow,background-color] duration-200',
        compact ? 'rounded-[1.05rem]' : 'rounded-[1.4rem]',
        isExpanded
          ? 'border-primary/20 bg-card/85 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.52)]'
          : 'shadow-[0_14px_30px_-34px_rgba(15,23,42,0.38)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3 transition-colors',
          compact ? 'px-3 py-3.5 sm:px-4 sm:py-4' : 'px-4 py-4 sm:px-5 sm:py-5',
          isExpanded ? 'bg-background/10' : 'hover:bg-background/10',
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={cn('flex min-w-0 flex-1 items-start text-left', compact ? 'gap-3' : 'gap-4')}
          aria-expanded={isExpanded}
        >
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className={cn(
                  'font-semibold tracking-tight text-foreground',
                  compact ? 'text-[0.95rem] sm:text-base' : 'text-base sm:text-lg',
                )}
              >
                {title}
              </h2>
              {meta}
            </div>
            {subtitle ? (
              <p
                className={cn(
                  'max-w-3xl text-muted-foreground',
                  compact ? 'text-[0.78rem] leading-5' : 'text-sm leading-6',
                )}
              >
                {subtitle}
              </p>
            ) : null}
            {!isExpanded && preview ? (
              <div
                className={cn(
                  'line-clamp-2 pt-1 text-muted-foreground/95',
                  compact ? 'text-[0.78rem] leading-5' : 'text-sm leading-6',
                )}
              >
                {preview}
              </div>
            ) : null}
          </div>
          <span
            className={cn(
              'mt-0.5 rounded-full border border-border/70 bg-background/60 text-muted-foreground transition-colors',
              compact ? 'p-1' : 'p-1.5',
              isExpanded ? 'border-primary/20 bg-primary/10 text-primary' : 'hover:bg-background/80',
            )}
          >
            {isExpanded ? (
              <ChevronUp className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            ) : (
              <ChevronDown className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
            )}
          </span>
        </button>

        {actions ? <div className="hidden shrink-0 items-center gap-2 sm:flex sm:self-center">{actions}</div> : null}
      </div>

      {isExpanded ? (
        <div
          className={cn(
            'border-t border-border/50',
            compact ? 'px-3 py-3 sm:px-4 sm:py-4' : 'px-4 py-4 sm:px-5 sm:py-5',
            bodyClassName,
          )}
        >
          {children}
        </div>
      ) : null}
      {actions ? <div className="flex justify-end border-t border-border/50 px-4 py-3 sm:hidden">{actions}</div> : null}
    </section>
  );
}
