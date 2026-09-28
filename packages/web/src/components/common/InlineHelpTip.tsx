import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import HoverHelpPopover from './HoverHelpPopover';
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
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 px-3 py-2',
        className,
      )}
    >
      <HoverHelpPopover
        title={title}
        summary={description}
        label={title}
        actionLabel={actionLabel}
        onAction={onAction}
        triggerClassName="border-none bg-transparent px-0 py-0 text-sm font-semibold shadow-none hover:bg-transparent"
      />
      <button
        type="button"
        onClick={() => dismissTip(tipId)}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground"
        aria-label="Dismiss help tip"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
