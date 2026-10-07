import { X } from 'lucide-react';
import ModalOverlay from '../common/ModalOverlay';
import ChubPublishPanel from './ChubPublishPanel';

/**
 * The publish-to-Chub panel as a dialog, opened from the Review header so the
 * action does not live only inside the (collapsed) character-sheet card.
 * Everything the panel needs is self-contained: the draft id comes from the
 * route, config from the config manager, and a successful publish invalidates
 * the same draft query the review screen reads.
 */
export interface ChubPublishDialogProps {
  /** Whether the character sheet is approved — the panel gates its button on this. */
  approved: boolean;
  onClose: () => void;
}

export default function ChubPublishDialog({ approved, onClose }: ChubPublishDialogProps) {
  return (
    <ModalOverlay
      onClose={onClose}
      label="Publish to Chub"
      className="z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
    >
      <div className="relative flex h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg sm:h-auto sm:max-h-[min(85vh,52rem)]">
        <div className="shrink-0 border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Publish to Chub</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <ChubPublishPanel approved={approved} />
        </div>
      </div>
    </ModalOverlay>
  );
}
