import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Components } from 'react-markdown';

type CodeRendererProps = {
  children?: ReactNode;
  className?: string;
};

function normalizeCodeText(children: ReactNode): string {
  if (typeof children === 'string') {
    return children.replace(/\n$/, '');
  }

  if (Array.isArray(children)) {
    return children
      .map((child) => normalizeCodeText(child))
      .join('')
      .replace(/\n$/, '');
  }

  if (children == null || typeof children === 'boolean') {
    return '';
  }

  return String(children).replace(/\n$/, '');
}

function CodeRenderer({ children, className }: CodeRendererProps) {
  const [copied, setCopied] = useState(false);
  const languageMatch = /language-([\w-]+)/.exec(className ?? '');
  const codeText = normalizeCodeText(children);

  if (!languageMatch) {
    return <code className="rounded bg-muted px-1.5 py-0.5 text-sm text-foreground">{children}</code>;
  }

  const languageLabel = languageMatch[1].replace(/-/g, ' ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-slate-950/90 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800/90 bg-slate-900/80 px-4 py-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-slate-400">{languageLabel}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-700/80 px-2.5 py-1 text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
          aria-label={`Copy ${languageLabel} code block`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <code className="block overflow-x-auto px-4 py-4 text-sm text-slate-100">{children}</code>
    </div>
  );
}

export const markdownComponents: Components = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1
      className="text-3xl font-semibold tracking-tight text-foreground"
      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2
      className="mt-8 text-2xl font-semibold tracking-tight text-foreground"
      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3
      className="mt-6 text-lg font-semibold tracking-tight text-foreground"
      style={{ fontFamily: '"Space Grotesk", sans-serif' }}
    >
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => <p className="leading-7 text-muted-foreground">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="ml-5 list-disc space-y-2 text-muted-foreground">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="ml-5 list-decimal space-y-2 text-muted-foreground">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="pl-1">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a href={href} className="text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary">
      {children}
    </a>
  ),
  code: CodeRenderer,
  pre: ({ children }: { children?: ReactNode }) => <>{children}</>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground">{children}</blockquote>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse overflow-hidden rounded-2xl border border-border/60">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead className="bg-muted/60 text-left text-foreground">{children}</thead>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th className="border-b border-border/60 px-4 py-3 text-sm font-semibold">{children}</th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="border-b border-border/40 px-4 py-3 align-top text-sm text-muted-foreground">{children}</td>
  ),
  hr: () => <hr className="my-6 border-border/60" />,
};
