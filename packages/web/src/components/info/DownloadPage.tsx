import { Download, ExternalLink, HardDrive, Smartphone } from 'lucide-react';
import {
  downloadChannels,
  downloadRepositoryUrl,
  formatArtifactFilename,
  getInfoPage,
  getInfoPageSummary,
  isAnyDownloadPublished,
  isSiteRelativeDownload,
  unpublishedDownloadNotice,
} from '@char-gen/shared';
import { resolveInfoRuntimeScope } from '../../lib/info.js';
import DocumentPage from './DocumentPage';

const channelIcons = {
  desktop: HardDrive,
  android: Smartphone,
  ios: Smartphone,
} as const;

export default function DownloadPage() {
  const scope = resolveInfoRuntimeScope();
  const meta = getInfoPage('download');
  const summary = getInfoPageSummary('download', scope);
  const anyPublished = isAnyDownloadPublished();

  return (
    <DocumentPage eyebrow={meta.eyebrow} title={meta.title} summary={summary}>
      {anyPublished ? null : (
        <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
          <p className="text-sm leading-6 text-muted-foreground">{unpublishedDownloadNotice}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              href={downloadRepositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-4 py-2 text-foreground transition-colors hover:border-primary/40 hover:bg-accent/20"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
              Repository
            </a>
          </div>
        </section>
      )}

      <section className="grid gap-4">
        {downloadChannels.map((channel) => {
          const Icon = channelIcons[channel.id];

          return (
            <article key={channel.id} className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">{channel.name}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{channel.summary}</p>
                  </div>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {channel.downloadUrl ? 'Available' : 'Not available yet'}
                </span>
              </div>

              {channel.artifacts.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-border/50 bg-background/40 p-5">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Download className="h-4 w-4 text-primary" />
                    Files
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {channel.artifacts.map((artifact) => (
                      <li key={artifact.filename} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="text-foreground">{artifact.label}</span>
                        <code className="rounded bg-muted px-2 py-0.5 text-xs">
                          {formatArtifactFilename(artifact.filename, __APP_VERSION__)}
                        </code>
                        <span className="text-xs">{artifact.approxSize}</span>
                        {artifact.downloadUrl ? (
                          <a
                            href={artifact.downloadUrl}
                            download={isSiteRelativeDownload(artifact.downloadUrl) ? true : undefined}
                            target={isSiteRelativeDownload(artifact.downloadUrl) ? undefined : '_blank'}
                            rel={isSiteRelativeDownload(artifact.downloadUrl) ? undefined : 'noreferrer'}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            Download
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {channel.requirements.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-border/50 bg-background/40 p-5">
                  <p className="text-sm font-medium text-foreground">Needs</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    {channel.requirements.map((requirement) => (
                      <li key={requirement}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {channel.notes.length > 0 ? (
                <ul className="mt-4 space-y-2 text-xs leading-5 text-muted-foreground">
                  {channel.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : null}

              {channel.downloadUrl === null ? (
                <p className="mt-5 text-sm font-medium text-muted-foreground">{unpublishedDownloadNotice}</p>
              ) : null}

              {channel.downloadUrl ? (
                isSiteRelativeDownload(channel.downloadUrl) ? (
                  <a
                    href={channel.downloadUrl}
                    download
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    <Download className="h-4 w-4" />
                    Download {channel.name}
                  </a>
                ) : (
                  <a
                    href={channel.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    <Download className="h-4 w-4" />
                    Download {channel.name}
                  </a>
                )
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="rounded-3xl border border-border/60 bg-card/70 p-6 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-foreground">Browser build</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The browser app needs no download: it is the surface you are using now, and its data stays in this browser
          profile. The desktop build is the same app in a Tauri shell for offline use, and the mobile build is the
          companion app for generating and reviewing drafts away from the desk.
        </p>
      </section>
    </DocumentPage>
  );
}
