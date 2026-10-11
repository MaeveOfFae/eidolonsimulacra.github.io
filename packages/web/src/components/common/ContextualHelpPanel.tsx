import { X } from 'lucide-react';
import type { HelpTopic, PageHelpEntry } from '../../lib/help';
import HelpEntryBody from './HelpEntryBody';
import ModalOverlay from './ModalOverlay';

interface ContextualHelpPanelProps {
  entry: PageHelpEntry;
  topics: HelpTopic[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ContextualHelpPanel({ entry, topics, isOpen, onClose }: ContextualHelpPanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalOverlay onClose={onClose} label="Contextual help" className="z-40">
      <aside className="fixed right-0 top-0 z-40 flex h-dvh w-full max-w-[24rem] flex-col border-l border-border bg-card/96 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out translate-x-0">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Contextual Help</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">{entry.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.summary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Close help panel"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
          <HelpEntryBody
            sections={entry}
            variant="full"
            leadingLinks={[{ label: 'Open Help Center', to: '/help' }]}
            onNavigate={onClose}
          />

          {topics.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">Related help topics</h3>
              <div className="space-y-3">
                {topics.map((topic) => (
                  <article key={topic.id} className="rounded-lg border border-border/60 bg-background/40 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                          {topic.category}
                        </p>
                        <h4 className="mt-1 font-semibold text-foreground">{topic.title}</h4>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.summary}</p>
                    <div className="mt-3 space-y-2">
                      {topic.bullets.slice(0, 2).map((bullet) => (
                        <div key={bullet} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                          <p className="leading-6">{bullet}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </aside>
    </ModalOverlay>
  );
}
