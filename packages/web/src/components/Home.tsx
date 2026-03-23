import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Baby,
  BookOpen,
  CheckCircle2,
  Dice1,
  FileText,
  FolderOpen,
  GitBranch,
  GitCompare,
  Layers,
  PlayCircle,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import type { DraftMetadata } from '@char-gen/shared';
import { api } from '@/lib/api';
import { getGuidedTour, gettingStartedSteps, guidedTours } from '@/lib/help';
import { roadmapGroups } from '@/lib/roadmap';
import { releaseNotes } from '@/lib/whats-new';
import { useGuidedTour } from './common/GuidedTourContext';
import { useAssistantScreenContext } from './common/useAssistantContext';
import AutomationPlaceholder from './common/AutomationPlaceholder';
import OnboardingPlaceholder from './common/OnboardingPlaceholder';

const RECENT_DRAFT_LIMIT = 6;

const WORKFLOW_LANES = [
  {
    to: '/settings',
    eyebrow: 'Setup',
    title: 'Wire the model path first',
    description: 'Provider keys, model choice, and browser persistence all live here. Most first-run failures start with skipping this step.',
    detail: 'Settings, keys, model routing',
    icon: ShieldCheck,
  },
  {
    to: '/templates',
    eyebrow: 'Structure',
    title: 'Lock the asset graph',
    description: 'Templates decide which assets exist and how they export. Treat them as workflow contracts, not decorative presets.',
    detail: 'Official V2/V3 and Aksho paths',
    icon: Layers,
  },
  {
    to: '/generate',
    eyebrow: 'Draft',
    title: 'Generate the first usable pack',
    description: 'Move from one concrete seed to a full character pack, then treat the result as something to review instead of something to trust blindly.',
    detail: 'Seed, mode, template, generation',
    icon: Sparkles,
  },
  {
    to: '/drafts',
    eyebrow: 'Review',
    title: 'Reopen, compare, and export',
    description: 'The draft library is the working queue for validation, cleanup, favorites, and export handoff.',
    detail: 'Review, validate, export',
    icon: FolderOpen,
  },
] as const;

const EXPLORATION_ACTIONS = [
  {
    to: '/seed-generator',
    label: 'Seed Generator',
    description: 'Brainstorm concepts before committing to a draft run.',
    icon: Dice1,
  },
  {
    to: '/validation',
    label: 'Validation',
    description: 'Catch broken structure before export.',
    icon: ShieldCheck,
  },
  {
    to: '/batch',
    label: 'Batch',
    description: 'Run multiple seeds in sequence when throughput matters.',
    icon: Layers,
  },
  {
    to: '/similarity',
    label: 'Compare',
    description: 'Inspect overlap before your library starts to blur.',
    icon: GitCompare,
  },
  {
    to: '/lineage',
    label: 'Lineage',
    description: 'Trace family-tree style relationships.',
    icon: GitBranch,
  },
  {
    to: '/blueprints',
    label: 'Blueprints',
    description: 'Inspect the advanced contract layer carefully.',
    icon: BookOpen,
  },
  {
    to: '/offspring',
    label: 'Offspring',
    description: 'Combine character inputs into a derived result.',
    icon: Baby,
  },
  {
    to: '/help',
    label: 'Help Center',
    description: 'Use the guided path when you do not want to guess.',
    icon: FileText,
  },
] as const;

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  summary: string;
}

function SectionHeader({ eyebrow, title, summary }: SectionHeaderProps) {
  return (
    <div className="max-w-3xl space-y-3">
      <p className="home-kicker">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        {title}
      </h2>
      <p className="text-sm leading-7 text-muted-foreground sm:text-base">{summary}</p>
    </div>
  );
}

interface MetricTileProps {
  label: string;
  value: string | number;
  tone?: 'default' | 'accent';
}

function MetricTile({ label, value, tone = 'default' }: MetricTileProps) {
  return (
    <div className={`rounded-2xl border px-4 py-4 ${tone === 'accent' ? 'border-primary/30 bg-primary/10' : 'border-border/60 bg-background/55'}`}>
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
        {label}
      </p>
      <div className="mt-2 text-3xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
        {value}
      </div>
    </div>
  );
}

interface LaneCardProps {
  to: string;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}

function LaneCard({ to, eyebrow, title, description, detail, icon: Icon }: LaneCardProps) {
  return (
    <Link to={to} className="home-rail-card group rounded-[1.75rem] border border-border/60 bg-card/75 p-5 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
            {eyebrow}
          </p>
          <h3 className="text-xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            {title}
          </h3>
          <p className="text-sm leading-7 text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-background/65 p-3 text-primary transition-transform duration-300 group-hover:-translate-y-1">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {detail}
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
          Open
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

interface ActionLinkProps {
  to: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

function ActionLink({ to, label, description, icon: Icon }: ActionLinkProps) {
  return (
    <Link to={to} className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-card/90">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-xl border border-border/60 bg-background/60 p-2.5 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{label}</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </Link>
  );
}

interface RecentDraftCardProps {
  to: string;
  name: string;
  meta: string;
}

function RecentDraftCard({ to, name, meta }: RecentDraftCardProps) {
  return (
    <Link to={to} className="group flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/55 px-4 py-4 transition-all duration-300 hover:border-primary/35 hover:bg-background/80">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground sm:text-base">{name}</div>
        <div className="mt-1 truncate text-xs uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {meta}
        </div>
      </div>
      <div className="rounded-xl border border-border/60 bg-card/75 p-2 text-muted-foreground transition-all duration-300 group-hover:border-primary/35 group-hover:text-primary">
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}

export default function Home() {
  const { activeStepIndex, activeTourId, goToCurrentStep, isTourCompleted, restartTour, startTour } = useGuidedTour();
  const { data: statsData } = useQuery({
    queryKey: ['drafts', 'stats', RECENT_DRAFT_LIMIT],
    queryFn: () => api.getDrafts({ limit: RECENT_DRAFT_LIMIT }),
  });

  const { data: templatesData } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.listTemplates(),
  });

  useAssistantScreenContext({
    draft_count: statsData?.stats?.total_drafts ?? 0,
    favorite_count: statsData?.stats?.favorites ?? 0,
    template_count: templatesData?.length ?? 0,
    recent_drafts: (statsData?.drafts ?? []).slice(0, 5).map((draft: DraftMetadata) => draft.character_name || draft.seed),
  });

  const upcomingUpdates = roadmapGroups
    .filter((group) => group.status !== 'implemented')
    .slice(0, 3)
    .map((group) => ({
      id: group.id,
      title: group.title,
      summary: group.items[0],
    }));

  const stats = statsData?.stats;
  const recentDrafts = statsData?.drafts ?? [];
  const currentRelease = releaseNotes[0] ?? null;
  const completedTours = guidedTours.filter((tour) => isTourCompleted(tour.id)).length;
  const nextIncompleteTour = guidedTours.find((tour) => !isTourCompleted(tour.id)) ?? null;
  const activeTour = activeTourId ? getGuidedTour(activeTourId) : null;
  const activeTourStep = activeTour?.steps[activeStepIndex] ?? null;

  return (
    <div className="space-y-10 pb-12">
      <section className="home-panel home-grid-bg overflow-hidden rounded-[2rem] border border-border/60 px-6 py-7 sm:px-8 sm:py-9 xl:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="home-orbit absolute -left-12 top-14 h-44 w-44 rounded-full border border-primary/25 bg-primary/10 blur-2xl" />
          <div className="home-orbit absolute right-8 top-8 h-28 w-28 rounded-full border border-white/10 bg-white/10 blur-xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[color:color-mix(in_srgb,var(--app-accent)_18%,transparent)] blur-3xl" />
        </div>

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)] xl:items-start">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="home-kicker">Browser-first character foundry</span>
              <span className="rounded-full border border-border/60 bg-background/55 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                v{__APP_VERSION__}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                One launch surface for blueprint-safe drafting, review, and export.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                The browser app is the product surface. Drafts, templates, help state, and theme customizations live in this browser profile, so Home should tell you what matters now and where to move next.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/generate" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                <Zap className="h-4 w-4" />
                Start a fresh draft
              </Link>
              <Link to="/drafts" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary">
                <FolderOpen className="h-4 w-4" />
                Open draft library
              </Link>
              <Link to="/settings" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary">
                <Settings className="h-4 w-4" />
                Configure provider
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricTile label="Drafts" value={stats?.total_drafts ?? '--'} tone="accent" />
              <MetricTile label="Templates" value={templatesData?.length ?? '--'} />
              <MetricTile label="Favorites" value={stats?.favorites ?? '--'} />
            </div>
          </div>

          <div className="space-y-4 rounded-[1.75rem] border border-border/60 bg-card/70 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="home-kicker">Operating model</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Current browser workspace
                </h2>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-primary" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                Live
              </div>
            </div>

            <div className="grid gap-3">
              {[
                'Home is the launchpad, not a splash page.',
                'Templates decide structure before prompt polish matters.',
                'Review and validation are normal steps, not failure recovery.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/50 px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-foreground/90">{item}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-border/60 bg-background/55 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    Current release
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {currentRelease?.headline ?? 'Release line available'}
                  </h3>
                </div>
                <span className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">
                  {currentRelease ? `v${currentRelease.version}` : `v${__APP_VERSION__}`}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {currentRelease?.summary ?? 'Check What\'s New for the latest product changes and browser workflow notes.'}
              </p>
              <Link to="/whats-new" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                Read release notes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Workflow lanes"
          title="The page now behaves like an operating deck, not a static dashboard."
          summary="The safe path is still the same: configure access, choose structure, generate, then review. The layout makes that order obvious without forcing a tutorial on people who already know the system."
        />

        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          {WORKFLOW_LANES.map((lane) => (
            <LaneCard key={lane.to} {...lane} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <section className="home-panel rounded-[1.75rem] border border-border/60 p-6 sm:p-7">
          <SectionHeader
            eyebrow="Workspace snapshot"
            title={recentDrafts.length > 0 ? 'Your recent draft queue is back in the foreground.' : 'No recent drafts yet. The first useful action is still clear.'}
            summary={recentDrafts.length > 0
              ? 'Recent work should be one click away. This section is intentionally narrow: reopen what matters, then move back into review instead of hunting through the side nav.'
              : 'If this browser profile is clean, start in Settings or Generate. Once drafts exist, this area becomes the reopen queue.'}
          />

          {recentDrafts.length > 0 ? (
            <div className="mt-6 grid gap-3">
              {recentDrafts.map((draft: DraftMetadata) => (
                <RecentDraftCard
                  key={draft.review_id}
                  to={`/drafts/${encodeURIComponent(draft.review_id)}`}
                  name={draft.character_name || draft.seed}
                  meta={`${draft.template_name || 'V2/V3 Card'} / ${draft.mode || 'SFW'}`}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-border/70 bg-background/40 p-6 text-sm leading-7 text-muted-foreground">
              Generate a first draft or import one from Data Manager. Home will surface it here automatically once the library has content.
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/drafts" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
              View full draft library
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/data" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
              Browser backup tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="home-panel rounded-[1.75rem] border border-border/60 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="home-kicker">Guided path</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  {activeTour && activeTourStep
                    ? `Continue ${activeTour.title}`
                    : nextIncompleteTour
                      ? `Next up: ${nextIncompleteTour.title}`
                      : 'All guided tours complete'}
                </h2>
              </div>
              <span className="rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                {completedTours}/{guidedTours.length}
              </span>
            </div>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {activeTour && activeTourStep
                ? `Step ${activeStepIndex + 1} of ${activeTour.steps.length}. ${activeTourStep.description}`
                : nextIncompleteTour
                  ? nextIncompleteTour.summary
                  : 'The walkthrough set is complete. Use Help Center or restart a tour if you want the structured path again.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {activeTour ? (
                <button
                  type="button"
                  onClick={goToCurrentStep}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume current step
                </button>
              ) : nextIncompleteTour ? (
                <button
                  type="button"
                  onClick={() => startTour(nextIncompleteTour.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start next tour
                </button>
              ) : null}

              {nextIncompleteTour ? (
                <button
                  type="button"
                  onClick={() => restartTour(nextIncompleteTour.id)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary"
                >
                  <RotateCcw className="h-4 w-4" />
                  Restart tour
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3">
              {gettingStartedSteps.slice(0, 3).map((step, index) => (
                <Link key={step.id} to={step.to} className="rounded-2xl border border-border/60 bg-background/55 p-4 transition-colors hover:border-primary/35">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    <Target className="h-3.5 w-3.5 text-primary" />
                    Step {index + 1}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
            <OnboardingPlaceholder templateName={templatesData?.[0]?.name} />
          </section>
        </aside>
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <SectionHeader
            eyebrow="Launch anywhere"
            title="Secondary tools stay reachable, but they no longer compete with the main flow."
            summary="These routes matter once you know why you are opening them. The grid keeps them visible without letting them overpower the structure-critical steps above."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {EXPLORATION_ACTIONS.map((action) => (
              <ActionLink key={action.to} {...action} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="home-panel rounded-[1.75rem] border border-border/60 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="home-kicker">Release signal</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  What changed recently
                </h2>
              </div>
              <span className="rounded-full border border-border/60 bg-background/55 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                v{__APP_VERSION__}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {releaseNotes.slice(0, 2).map((entry) => (
                <article key={entry.version} className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/12 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-primary" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {entry.badge}
                    </span>
                    <span className="rounded-full border border-border/60 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      v{entry.version}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-foreground">{entry.headline}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="home-panel rounded-[1.75rem] border border-border/60 p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="home-kicker">Roadmap pressure</p>
                <h2 className="mt-2 text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Upcoming updates
                </h2>
              </div>
              <span className="rounded-full border border-border/60 bg-background/55 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                Planned
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {upcomingUpdates.map((update) => (
                <div key={update.id} className="rounded-2xl border border-border/60 bg-background/50 p-4">
                  <h3 className="text-sm font-semibold text-foreground sm:text-base">{update.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{update.summary}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)]">
        <div className="home-panel rounded-[1.75rem] border border-border/60 p-6 sm:p-7">
          <SectionHeader
            eyebrow="Automation surface"
            title="The home page still exposes guidance and automation, but in a calmer place."
            summary="The previous version mixed onboarding, quick actions, news, and stats at the same visual weight. This revision separates the main operating path from optional helpers so the first decision is obvious."
          />
          <div className="mt-6">
            <AutomationPlaceholder workflowName="draft validation queue" />
          </div>
        </div>

        <div className="home-panel rounded-[1.75rem] border border-border/60 p-6">
          <p className="home-kicker">Storage reality</p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Browser-local by default
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            This build stores drafts, theme customizations, and help state in the browser profile unless you explicitly export, back up, or hand content to a provider during generation.
          </p>

          <div className="mt-5 space-y-3">
            {[
              'Back up before clearing site data or switching devices.',
              'Use Data Manager when you need migration or recovery.',
              'Treat exported backups and stored API keys as sensitive material.',
            ].map((note) => (
              <div key={note} className="rounded-2xl border border-border/60 bg-background/55 px-4 py-3 text-sm leading-6 text-foreground/90">
                {note}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/data" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Open Data Manager
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/privacy" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary">
              Read privacy details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
