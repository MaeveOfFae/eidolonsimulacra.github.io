import { BookOpen, Bug, ExternalLink, Github, HeartHandshake, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import DocumentPage from './DocumentPage';

const REPOSITORY_URL = 'https://github.com/MaeveOfFae/eidolonsimulacra.github.io';
const ISSUES_URL = `${REPOSITORY_URL}/issues`;
const SUPPORT_URL = 'https://ko-fi.com/maeveoffae';
const CONTACT_URL = 'mailto:contact@eidolonsimulacra.com?subject=Eidolon%20Simulacra%20Community';

const communityCards = [
  {
    href: REPOSITORY_URL,
    title: 'GitHub Repository',
    description: 'Source, release context, open work, and the current public project home.',
    icon: Github,
  },
  {
    href: ISSUES_URL,
    title: 'Issues and Requests',
    description:
      'Report bugs, request features, or track concrete work items without leaving the project record scattered across chats.',
    icon: Bug,
  },
  {
    href: SUPPORT_URL,
    title: 'Ko-fi Support',
    description: 'Support ongoing blueprint, release, and maintenance work if the project is useful to you.',
    icon: HeartHandshake,
  },
  {
    href: CONTACT_URL,
    title: 'Direct Contact',
    description:
      'Use email for direct outreach, partnership questions, or cases that do not belong in public issue tracking.',
    icon: Mail,
  },
] as const;

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
          {communityCards.map((card) => {
            const Icon = card.icon;

            return (
              <a
                key={card.title}
                href={card.href}
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
                      <p className="font-semibold text-foreground">{card.title}</p>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.description}</p>
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
            <p>
              Use GitHub issues for concrete bugs, regressions, and feature requests you want tracked in the open. Keep
              reports specific enough that they can turn into action rather than general frustration.
            </p>
            <p>
              Use direct email when the topic is sensitive, private, or operational. Use Ko-fi when the goal is support
              rather than issue tracking.
            </p>
            <p>
              This page intentionally lists only spaces that are confirmed in the current build. If Discord, forums, or
              broader sharing hubs are added later, they should land here once they are real and maintained.
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Internal references</h2>
          </div>
          <div className="mt-5 grid gap-3 text-sm">
            <Link
              to="/code-of-conduct"
              className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20"
            >
              Code of Conduct
            </Link>
            <Link
              to="/help"
              className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20"
            >
              Help Center
            </Link>
            <Link
              to="/whats-new"
              className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20"
            >
              What&apos;s New
            </Link>
            <Link
              to="/about"
              className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20"
            >
              About
            </Link>
          </div>
        </div>
      </section>
    </DocumentPage>
  );
}
