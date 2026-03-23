import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '../common/markdownComponents';

interface DocumentPageProps {
  eyebrow: string;
  title: string;
  summary: string;
  markdown?: string;
  children?: ReactNode;
}

export default function DocumentPage({ eyebrow, title, summary, markdown, children }: DocumentPageProps) {
  return (
    <div className="app-page space-y-8 pb-12">
      <section className="app-page-hero">
        <div className="app-page-hero-grid">
          <div className="space-y-4">
            <p className="app-page-eyebrow">{eyebrow}</p>
            <h1 className="app-page-title">{title}</h1>
            <p className="app-page-summary">{summary}</p>
          </div>
          <div className="app-panel-muted p-5">
            <p className="app-page-eyebrow">Page mode</p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              This surface is part of the same browser-first runtime as the workflow pages. Guidance, legal docs, and help content should read as part of the product, not detached support pages.
            </p>
          </div>
        </div>
      </section>

      {children ? <section className="space-y-6">{children}</section> : null}

      {markdown ? (
        <section className="app-panel space-y-4 p-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{markdown}</ReactMarkdown>
        </section>
      ) : null}
    </div>
  );
}