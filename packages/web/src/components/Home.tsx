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
    <div className={`rounded-xl border px-4 py-3 ${tone === 'accent' ? 'border-primary/30 bg-primary/10' : 'border-border/60 bg-background/50'}`}>
      <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
        {label}
      </p>
      <div className="mt-2 text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
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
    <Link to={to} className="group flex flex-col rounded-2xl border border-border/60 bg-card/75 p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card/95 hover:-translate-y-0.5">
      <div className="space-y-3">
        <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground font-semibold" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {eyebrow}
        </p>
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            {title}
          </h3>
          <div className="rounded-lg border border-border/60 bg-background/60 p-2 text-primary transition-transform duration-300 group-hover:bg-primary/10 shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-medium" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {detail}
        </span>
        <span className="text-primary transition-transform duration-300 group-hover:translate-x-0.5">
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
    <Link to={to} className="group flex h-full flex-col justify-between rounded-2xl border border-border/60 bg-card/70 p-4 transition-all duration-300 hover:border-primary/35 hover:bg-card/90 hover:-translate-y-0.5">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="rounded-lg border border-border/60 bg-background/60 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary shrink-0" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{label}</h3>
          <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{description}</p>
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
    <Link to={to} className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3 transition-all duration-300 hover:border-primary/35 hover:bg-background/70">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-foreground">{name}</div>
        <div className="mt-0.5 truncate text-xs text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
          {meta}
        </div>
      </div>
      <div className="rounded-lg border border-border/60 bg-card/75 p-1.5 text-muted-foreground transition-all duration-300 group-hover:text-primary shrink-0">
        <ArrowRight className="h-3.5 w-3.5" />
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
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="home-panel home-grid-bg overflow-hidden rounded-[2rem] border border-border/60 px-6 py-8 sm:px-8 sm:py-10 xl:px-10 xl:py-12">
        <div className="pointer-events-none absolute inset-0 opacity-80">
          <div className="home-orbit absolute -left-12 top-14 h-44 w-44 rounded-full border border-primary/25 bg-primary/10 blur-2xl" />
          <div className="home-orbit absolute right-8 top-8 h-28 w-28 rounded-full border border-white/10 bg-white/10 blur-xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[color:color-mix(in_srgb,var(--app-accent)_18%,transparent)] blur-3xl" />
        </div>

        <div className="relative space-y-10">
          {/* Title and CTA Row */}
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)] xl:items-start">
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                  Your Eidolon Operating Deck
                </h1>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                  Draft, review, and export characters—all in your browser. Everything stays local until you choose otherwise.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/generate" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                  <Zap className="h-4 w-4" />
                  Start fresh draft
                </Link>
                <Link to="/drafts" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/35 hover:text-primary">
                  <FolderOpen className="h-4 w-4" />
                  View library
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-3">
              <MetricTile label="Drafts" value={stats?.total_drafts ?? '--'} tone="accent" />
              <MetricTile label="Templates" value={templatesData?.length ?? '--'} />
              <MetricTile label="Favorites" value={stats?.favorites ?? '--'} />
            </div>
          </div>

          {/* Release & Info Row */}
          <div className="grid gap-6 xl:grid-cols-2">
            {currentRelease && (
              <div className="rounded-[1.75rem] border border-border/60 bg-background/40 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      Latest Release
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-foreground">
                      {currentRelease.headline}
                    </h3>
                  </div>
                  <span className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                    v{currentRelease.version}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {currentRelease.summary}
                </p>
                <Link to="/whats-new" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                  Read notes
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            <div className="rounded-[1.75rem] border border-border/60 bg-background/40 p-5">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                How it works
              </p>
              <div className="mt-4 space-y-3">
                {[
                  'Browser-first: data stays local',
                  'Template-driven workflows',
                  'Review before export',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-foreground/80">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Lanes */}
      <section className="space-y-5">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            The main workflow
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Follow the core path: configure access, choose template, generate, then review and export.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
          {WORKFLOW_LANES.map((lane) => (
            <LaneCard key={lane.to} {...lane} />
          ))}
        </div>
      </section>

      {/* Recent Drafts & Quick Links */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="rounded-[1.75rem] border border-border/60 p-6 sm:p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {recentDrafts.length > 0 ? 'Your recent drafts' : 'No drafts yet'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {recentDrafts.length > 0
                ? 'Quick access to your latest work. Use the library for the full list.'
                : 'Start with a fresh draft or import from the library.'}
            </p>
          </div>

          {recentDrafts.length > 0 ? (
            <div className="grid gap-2">
              {recentDrafts.map((draft: DraftMetadata) => (
                <RecentDraftCard
                  key={draft.review_id}
                  to={`/drafts/${encodeURIComponent(draft.review_id)}`}
                  name={draft.character_name || draft.seed}
                  meta={`${draft.template_name || 'V2/V3'} • ${draft.mode || 'SFW'}`}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/40 p-6 text-center text-sm text-muted-foreground">
              <p>Generate your first draft or check the library.</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/drafts" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
              View full library
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/data" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
              Data backup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Start & Roadmap */}
        <aside className="space-y-6">
          {/* Guided Tour */}
          <section className="rounded-[1.75rem] border border-border/60 p-6">
            <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              {activeTour && activeTourStep
                ? 'Continue tour'
                : nextIncompleteTour
                  ? 'Try a tour'
                  : 'Tours done'}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {completedTours}/{guidedTours.length} completed
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {activeTour ? (
                <button
                  type="button"
                  onClick={goToCurrentStep}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume
                </button>
              ) : nextIncompleteTour ? (
                <button
                  type="button"
                  onClick={() => startTour(nextIncompleteTour.id)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <PlayCircle className="h-4 w-4" />
                  Start
                </button>
              ) : null}

              {nextIncompleteTour ? (
                <button
                  type="button"
                  onClick={() => restartTour(nextIncompleteTour.id)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-border/60 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restart
                </button>
              ) : null}
            </div>
          </section>

          {/* Upcoming Features */}
          {upcomingUpdates.length > 0 && (
            <section className="rounded-[1.75rem] border border-border/60 p-6">
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Coming soon
              </h3>
              <div className="mt-4 space-y-3">
                {upcomingUpdates.map((update) => (
                  <div key={update.id} className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <h4 className="text-sm font-medium text-foreground">{update.title}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{update.summary}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </section>

      {/* Secondary Tools */}
      <section className="space-y-5">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            More tools
          </h2>
          <p className="mt-2 text-base text-muted-foreground">
            Advanced features for seeding, validation, batch runs, and character analysis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {EXPLORATION_ACTIONS.map((action) => (
            <ActionLink key={action.to} {...action} />
          ))}
        </div>
      </section>

      {/* Storage & Release Notes */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <div className="rounded-[1.75rem] border border-border/60 p-6 sm:p-7">
          <h2 className="text-2xl font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
            Browser-local storage
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Everything is stored locally in your browser unless you export or back up. This means full privacy, but also your responsibility.
          </p>

          <div className="mt-6 space-y-3">
            {[
              'Back up before clearing site data',
              'Use Data Manager for imports/exports',
              'API keys are stored securely in your profile',
            ].map((note) => (
              <div key={note} className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-sm text-foreground/90">
                {note}
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/data" className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              Data Manager
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/privacy" className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/35 hover:text-primary">
              Privacy details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {/* Recent Release Notes */}
          {releaseNotes.length > 0 && (
            <section className="rounded-[1.75rem] border border-border/60 p-6">
              <h3 className="text-lg font-semibold text-foreground" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                Recent updates
              </h3>
              <div className="mt-4 space-y-3">
                {releaseNotes.slice(0, 2).map((entry) => (
                  <div key={entry.version} className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/12 px-2 py-1 text-[10px] uppercase tracking-[0.18em] font-medium text-primary" style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                        {entry.badge}
                      </span>
                      <span className="text-xs text-muted-foreground">v{entry.version}</span>
                    </div>
                    <h4 className="mt-2 text-sm font-semibold text-foreground">{entry.headline}</h4>
                  </div>
                ))}
              </div>
              <Link to="/whats-new" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                View all updates
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}
