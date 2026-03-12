import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, LifeBuoy, PlayCircle, RotateCcw, Sparkles, Target } from 'lucide-react';
import DocumentPage from './DocumentPage';
import { guidedTours, gettingStartedSteps, helpCategories, helpTopics } from '@/lib/help';
import { useGuidedTour } from '../common/GuidedTourContext';

const categoryIcons = {
  'Getting Started': Sparkles,
  Concepts: BookOpen,
  Troubleshooting: LifeBuoy,
} as const;

export default function HelpCenterPage() {
  const { helpState, isTourCompleted, restartTour, startTour } = useGuidedTour();
  const completedTourCount = guidedTours.filter((tour) => isTourCompleted(tour.id)).length;
  const remainingTourCount = guidedTours.length - completedTourCount;

  return (
    <DocumentPage
      eyebrow="Help"
      title="Help Center"
      summary="Plain-language guidance for getting started, understanding the core concepts, and recovering from the most common blockers in the browser app."
    >
      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Progress</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This shows how much of the in-app help system you have already cleared in this browser profile.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {completedTourCount}/{guidedTours.length} tours complete
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Tours</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{completedTourCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Completed guided tours. {remainingTourCount > 0 ? `${remainingTourCount} still available.` : 'All current tours are complete.'}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Starter Guide</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{helpState.first_run_completed ? 'Done' : 'Open'}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {helpState.first_run_completed
                ? 'The first-run path has been completed in this browser profile.'
                : 'The first-run path is still available from Home and Help Center.'}
            </p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/40 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Tips</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{helpState.dismissed_tips.length}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Dismissed inline tips. {helpState.show_inline_tips ? 'Inline tips are currently enabled.' : 'Inline tips are currently hidden.'}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-border/50 bg-background/40 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Recommended next step
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {remainingTourCount > 0
              ? 'Continue with the next incomplete guided tour below, then use the page-level help strips and inline tips on each workflow screen.'
              : 'Use the page-level help strips and inline tips as needed. The current guided-tour set is fully complete for this browser profile.'}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Guided Tours</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These tours move you page by page through the browser workflow instead of leaving you to guess the next step.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {guidedTours.map((tour) => {
            const completed = isTourCompleted(tour.id);

            return (
              <article key={tour.id} className="rounded-2xl border border-border/50 bg-background/40 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{tour.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{tour.summary}</p>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {tour.estimatedMinutes} min
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>{tour.audience}</p>
                  <p>{tour.steps.length} guided steps</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => (completed ? restartTour(tour.id) : startTour(tour.id))}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {completed ? <RotateCcw className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                    {completed ? 'Restart tour' : 'Start tour'}
                  </button>
                  {completed && (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Start Here</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              If this is your first time in the app, follow these steps in order.
            </p>
          </div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Open Settings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gettingStartedSteps.map((step, index) => (
            <div key={step.id} className="rounded-2xl border border-border/50 bg-background/40 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step {index + 1}</p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              <Link
                to={step.to}
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                {step.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {helpCategories.map((category) => {
        const Icon = categoryIcons[category];
        const topics = helpTopics.filter((topic) => topic.category === category);

        return (
          <section key={category} className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{category}</h2>
                <p className="text-sm text-muted-foreground">
                  {category === 'Getting Started'
                    ? 'Use these guides when you want the app to tell you what to do next.'
                    : category === 'Concepts'
                      ? 'These explain the terms and workflow choices that confuse new users most often.'
                      : 'Use these when something behaves differently than you expect.'}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {topics.map((topic) => (
                <article key={topic.id} className="rounded-2xl border border-border/50 bg-background/40 p-5">
                  <h3 className="text-lg font-semibold text-foreground">{topic.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.summary}</p>
                  <div className="mt-4 space-y-2">
                    {topic.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <div className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                        <p className="leading-6">{bullet}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {topic.actions.map((action) => (
                      <Link
                        key={`${topic.id}-${action.to}`}
                        to={action.to}
                        className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {action.label}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </DocumentPage>
  );
}