import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Circle, PlayCircle, RotateCcw } from 'lucide-react';
import { configManager } from '../../lib/config/manager';
import { GETTING_STARTED_GUIDE_ID, GETTING_STARTED_TOUR_ID, gettingStartedSteps } from '../../lib/help';
import { useGuidedTour } from './GuidedTourContext';

export interface OnboardingPlaceholderProps {
  templateName?: string;
}

export function OnboardingPlaceholder({ templateName }: OnboardingPlaceholderProps) {
  const { helpState, startTour, restartTour } = useGuidedTour();
  const completedGuide = helpState.completed_guides.includes(GETTING_STARTED_GUIDE_ID) || helpState.first_run_completed;

  const markComplete = () => {
    const nextCompleted = Array.from(new Set([...helpState.completed_guides, GETTING_STARTED_GUIDE_ID]));
    configManager.updateHelpState({
      completed_guides: nextCompleted,
      first_run_completed: true,
    });
  };

  const restartGuide = () => {
    configManager.updateHelpState({
      first_run_completed: false,
      completed_guides: helpState.completed_guides.filter((guideId) => guideId !== GETTING_STARTED_GUIDE_ID),
    });
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card/70 p-5 text-sm text-muted-foreground backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Getting Started</p>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            {completedGuide ? 'Your starter guide is ready to revisit' : 'Follow this first-run path'}
          </h3>
          <p className="mt-2 leading-6">
            {completedGuide
              ? 'You already completed the basics. Reopen the guide anytime if you need a refresher or want to walk someone else through the app.'
              : 'This walkthrough is written for people who do not want to guess. Follow the steps in order and you can reach a usable first draft without leaving the app.'}
          </p>
        </div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {completedGuide ? 'Completed' : 'Recommended'}
        </span>
      </div>

      <div className="mt-4 rounded-xl border border-border/50 bg-background/40 p-4">
        <p className="font-medium text-foreground">Suggested starting template</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {templateName
            ? `${templateName} is available right now, so you can use it as your first walkthrough target.`
            : 'Start with one of the official templates before trying custom template or blueprint work.'}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {gettingStartedSteps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 p-4">
            {completedGuide ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Step {index + 1}</span>
                <h4 className="font-medium text-foreground">{step.title}</h4>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
              <Link to={step.to} className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                {step.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => (completedGuide ? restartTour(GETTING_STARTED_TOUR_ID) : startTour(GETTING_STARTED_TOUR_ID))}
          className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <PlayCircle className="h-4 w-4" />
          {completedGuide ? 'Run guided tour again' : 'Start guided tour'}
        </button>
        <Link
          to="/help"
          className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          Open Help Center
          <ArrowRight className="h-4 w-4" />
        </Link>
        {completedGuide ? (
          <button
            type="button"
            onClick={restartGuide}
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <RotateCcw className="h-4 w-4" />
            Restart guide
          </button>
        ) : (
          <button
            type="button"
            onClick={markComplete}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <CheckCircle2 className="h-4 w-4" />
            Mark guide complete
          </button>
        )}
      </div>
    </section>
  );
}

export default OnboardingPlaceholder;