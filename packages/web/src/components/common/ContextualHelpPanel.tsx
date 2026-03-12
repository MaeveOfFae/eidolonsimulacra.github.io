import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, TriangleAlert, X } from 'lucide-react';
import type { HelpTopic, PageHelpEntry } from '../../lib/help';

interface ContextualHelpPanelProps {
  entry: PageHelpEntry;
  topics: HelpTopic[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ContextualHelpPanel({ entry, topics, isOpen, onClose }: ContextualHelpPanelProps) {
  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={onClose} />}
      <aside
        className={`fixed right-0 top-0 z-40 flex h-dvh w-full max-w-xl flex-col border-l border-border bg-card/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Contextual Help</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">{entry.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.summary}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto p-5">
          <section className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">What to do on this page</h3>
            </div>
            <div className="mt-4 space-y-3">
              {entry.keyActions.map((action) => (
                <div key={action} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                  <p className="leading-6">{action}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2 text-foreground">
              <TriangleAlert className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold">Common mistakes to avoid</h3>
            </div>
            <div className="mt-4 space-y-3">
              {entry.pitfalls.map((pitfall) => (
                <div key={pitfall} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="mt-2 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <p className="leading-6">{pitfall}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-background/40 p-4">
            <h3 className="font-semibold text-foreground">Useful next steps</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/help"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                Open Help Center
                <ArrowRight className="h-4 w-4" />
              </Link>
              {entry.actions.map((action) => (
                <Link
                  key={`${entry.id}-${action.to}`}
                  to={action.to}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </section>

          {topics.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Related help topics</h3>
              <div className="space-y-3">
                {topics.map((topic) => (
                  <article key={topic.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{topic.category}</p>
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
    </>
  );
}