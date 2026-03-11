import { Link } from 'react-router-dom';
import { ArrowRight, Clock3 } from 'lucide-react';
import DocumentPage from './DocumentPage';
import { roadmapGroups } from '@/lib/roadmap';
import { releaseNotes } from '@/lib/whats-new';

function formatReleaseDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function WhatsNewPage() {
  const upcomingUpdates = roadmapGroups
    .filter((group) => group.status !== 'implemented')
    .slice(0, 6)
    .map((group) => ({
      id: group.id,
      title: group.title,
      summary: group.items[0],
      link: group.ownerFiles[0],
    }));

  return (
    <DocumentPage
      eyebrow="Release Notes"
      title="What's New"
      summary="Current release notes for the browser app plus the next staged updates already tracked in the roadmap."
    >
      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Current Release Line</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The app is currently shipping on v{__APP_VERSION__}.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
            Browser workspace • v{__APP_VERSION__}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {releaseNotes.map((entry) => (
          <article
            key={entry.version}
            className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {entry.badge}
              </span>
              <span className="rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                v{entry.version}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {formatReleaseDate(entry.releasedOn)}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-semibold text-foreground">{entry.headline}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">{entry.summary}</p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {entry.highlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl border border-border/50 bg-background/40 p-4 text-sm leading-6 text-muted-foreground">
                  {highlight}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {entry.links.map((link) => (
                <Link
                  key={`${entry.version}-${link.to}`}
                  to={link.to}
                  className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Upcoming Updates</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These are the next visible feature areas already staged in the active roadmap.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Planned
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {upcomingUpdates.map((update) => (
            <div key={update.id} className="rounded-2xl border border-border/50 bg-background/40 p-5">
              <h3 className="font-semibold text-foreground">{update.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{update.summary}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Owner surface: {update.link.split('/').slice(-1)[0]}
              </p>
            </div>
          ))}
        </div>
      </section>
    </DocumentPage>
  );
}