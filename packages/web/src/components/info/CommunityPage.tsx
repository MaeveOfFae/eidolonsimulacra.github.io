import type { ProjectResourceIcon } from '@char-gen/shared';
import { communityGuidance, communityInternalLinks, communityResources } from '@char-gen/shared';
import { BookOpen, Bug, ExternalLink, Github, HeartHandshake, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import DocumentPage from './DocumentPage';

/** The shared resource list carries icon keys; the browser maps them to lucide icons. */
const communityIcons: Record<ProjectResourceIcon, ComponentType<{ className?: string }>> = {
  repository: Github,
  issues: Bug,
  support: HeartHandshake,
  contact: Mail,
};

export default function CommunityPage() {
  return (
    <DocumentPage
      eyebrow="Community"
      title="Community"
      summary="The public-facing project spaces that already exist today: repository, issue tracking, support, and the contributor ground rules that keep those spaces usable."
    >
      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">What exists right now</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {communityResources.map((resource) => {
            const Icon = communityIcons[resource.icon];

            return (
              <a
                key={resource.id}
                href={resource.href}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-border/60 bg-background/60 p-5 transition-colors hover:border-primary/40 hover:bg-accent/20"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{resource.title}</p>
                      {resource.external ? (
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{resource.description}</p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">How to use those spaces</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
            {communityGuidance.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Internal references</h2>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            {communityInternalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </DocumentPage>
  );
}
