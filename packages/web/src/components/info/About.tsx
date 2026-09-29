import {
  aboutCrossLinks,
  aboutInfoCards,
  aboutWhatItDoes,
  buildAboutQuickFacts,
  buildAboutSummary,
  buildSupportEmbedUrl,
  contactGuidance,
  supportGuidance,
} from '@char-gen/shared';
import { BookOpen, FileLock2, ShieldCheck, Scale, Info, Sparkles, Mail, Bug, Shield, Users } from 'lucide-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { resolveInfoRuntimeScope } from '../../lib/info.js';
import DocumentPage from './DocumentPage';

/** The shared card list carries routes; the browser maps each route to its icon. */
const infoCardIcons: Record<string, ComponentType<{ className?: string }>> = {
  '/whats-new': Sparkles,
  '/terms': Scale,
  '/privacy': FileLock2,
  '/license': BookOpen,
  '/security': ShieldCheck,
  '/community': Users,
};

export default function About() {
  const scope = resolveInfoRuntimeScope();
  const quickFacts = buildAboutQuickFacts({ scope, version: __APP_VERSION__ });

  return (
    <DocumentPage eyebrow="About" title="About Eidolon Simulacra" summary={buildAboutSummary(scope)}>
      <section className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-3 text-white shadow-lg shadow-primary/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{aboutWhatItDoes.title}</h2>
              <p className="text-sm text-muted-foreground">{aboutWhatItDoes.subtitle}</p>
            </div>
          </div>
          <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
            {aboutWhatItDoes.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Quick Facts</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm text-muted-foreground">
            {quickFacts.map((fact) => (
              <div key={fact.label}>
                <p className="font-medium text-foreground">{fact.label}</p>
                <p>{fact.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Info and Legal</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {aboutInfoCards.map((card) => {
            const Icon = infoCardIcons[card.to] ?? Info;
            return (
              <Link
                key={card.to}
                to={card.to}
                className="group rounded-2xl border border-border/60 bg-background/60 p-5 transition-colors hover:border-primary/40 hover:bg-accent/20"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{card.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{card.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {aboutCrossLinks.map((link) => (
            <Link key={link.to} to={link.to} className="text-primary hover:underline">
              {link.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-foreground">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Contact</h2>
        </div>
        <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{contactGuidance.intro}</p>
            <p className="flex items-center gap-2">
              <Bug className="h-4 w-4 text-primary" />
              <span>{contactGuidance.bugLine}</span>
            </p>
            <p className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>{contactGuidance.securityLine}</span>
            </p>
          </div>
          <a
            href={contactGuidance.actionHref}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
          >
            <Mail className="h-4 w-4" />
            {contactGuidance.actionLabel}
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Support the Project</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
            {supportGuidance.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              The full Ko-fi panel lives here instead of the sidebar so it has enough room to stay usable without
              crushing navigation.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-3 backdrop-blur-sm">
          <iframe
            id="kofiframe"
            src={buildSupportEmbedUrl()}
            className="block w-full border-0 bg-[#f9f9f9]"
            height="712"
            title="maeveoffae"
          />
        </div>
      </section>
    </DocumentPage>
  );
}
