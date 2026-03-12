import { CircleHelp, PlayCircle, X } from 'lucide-react';
import { useGuidedTour } from './GuidedTourContext';

interface InlineHelpTipProps {
  tipId: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function InlineHelpTip({
  tipId,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: InlineHelpTipProps) {
  const { dismissTip, helpState } = useGuidedTour();

  if (!helpState.show_inline_tips || helpState.dismissed_tips.includes(tipId)) {
    return null;
  }

  return (
    <aside className={`rounded-2xl border border-primary/20 bg-primary/5 p-4 ${className ?? ''}`.trim()}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <CircleHelp className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => dismissTip(tipId)}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
          aria-label="Dismiss help tip"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {actionLabel && onAction && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <PlayCircle className="h-4 w-4" />
            {actionLabel}
          </button>
        </div>
      )}
    </aside>
  );
}