/**
 * Info / legal page metadata and the composed About-page content.
 *
 * Every browser page under `packages/web/src/components/info/` and every mobile
 * info screen reads its title, eyebrow, and summary from here, so the two
 * surfaces cannot drift apart on the copy a user actually reads.
 */

import {
  buildAboutSummary,
  buildPrivacySummary,
  codeOfConductDocumentText,
  licenseDocumentText,
  securityDocumentText,
  termsMarkdown,
  buildPrivacyMarkdown,
  type InfoRuntimeScope,
} from './legal';

export type InfoPageId = 'about' | 'community' | 'license' | 'terms' | 'privacy' | 'security' | 'code-of-conduct';

export interface InfoPageMeta {
  id: InfoPageId;
  /** The browser route this page owns; mobile maps it onto its own screen. */
  webPath: string;
  eyebrow: string;
  title: string;
  /** `markdown` pages render one document; `composed` pages build their own layout. */
  kind: 'markdown' | 'composed';
}

export const infoPages: InfoPageMeta[] = [
  { id: 'about', webPath: '/about', eyebrow: 'About', title: 'About Eidolon Simulacra', kind: 'composed' },
  { id: 'community', webPath: '/community', eyebrow: 'Community', title: 'Community', kind: 'composed' },
  { id: 'license', webPath: '/license', eyebrow: 'License', title: 'License', kind: 'markdown' },
  { id: 'terms', webPath: '/terms', eyebrow: 'Legal', title: 'Terms of Use', kind: 'markdown' },
  { id: 'privacy', webPath: '/privacy', eyebrow: 'Privacy', title: 'Privacy', kind: 'markdown' },
  { id: 'security', webPath: '/security', eyebrow: 'Security', title: 'Security', kind: 'markdown' },
  {
    id: 'code-of-conduct',
    webPath: '/code-of-conduct',
    eyebrow: 'Community',
    title: 'Code of Conduct',
    kind: 'markdown',
  },
];

const STATIC_SUMMARIES: Record<Exclude<InfoPageId, 'about' | 'privacy'>, string> = {
  community:
    'The public-facing project spaces that already exist today: repository, issue tracking, support, and the contributor ground rules that keep those spaces usable.',
  license: 'This page mirrors the repository license shipped with the project.',
  terms: 'Operational terms for using the app, generated outputs, exports, and third-party provider integrations.',
  security: 'Security guidance, supported versions, and vulnerability reporting information.',
  'code-of-conduct': 'Community participation standards and enforcement guidance for contributors and maintainers.',
};

export function getInfoPage(id: InfoPageId): InfoPageMeta {
  const page = infoPages.find((entry) => entry.id === id);

  if (!page) {
    throw new Error(`Unknown info page: ${id}`);
  }

  return page;
}

export function getInfoPageByPath(webPath: string): InfoPageMeta | null {
  const normalized = webPath.trim().toLowerCase();
  return infoPages.find((page) => page.webPath === normalized) ?? null;
}

export function getInfoPageSummary(id: InfoPageId, scope: InfoRuntimeScope): string {
  if (id === 'about') {
    return buildAboutSummary(scope);
  }

  if (id === 'privacy') {
    return buildPrivacySummary(scope);
  }

  return STATIC_SUMMARIES[id];
}

/** The subset of pages that render a single markdown document. */
export type MarkdownInfoPageId = 'license' | 'terms' | 'privacy' | 'security' | 'code-of-conduct';

const MARKDOWN_PAGE_IDS: readonly MarkdownInfoPageId[] = ['license', 'terms', 'privacy', 'security', 'code-of-conduct'];

export function isMarkdownInfoPageId(id: InfoPageId): id is MarkdownInfoPageId {
  return (MARKDOWN_PAGE_IDS as readonly string[]).includes(id);
}

/** The rendered document for a markdown page. Exhaustive, so it always returns a string. */
export function getInfoPageDocument(id: MarkdownInfoPageId, scope: InfoRuntimeScope): string {
  switch (id) {
    case 'license':
      return licenseDocumentText;
    case 'security':
      return securityDocumentText;
    case 'code-of-conduct':
      return codeOfConductDocumentText;
    case 'terms':
      return termsMarkdown;
    case 'privacy':
      return buildPrivacyMarkdown(scope);
  }
}

/** The rendered document for a markdown page, or null for a composed page. */
export function getInfoPageMarkdown(id: InfoPageId, scope: InfoRuntimeScope): string | null {
  return isMarkdownInfoPageId(id) ? getInfoPageDocument(id, scope) : null;
}

export const aboutWhatItDoes = {
  title: 'What It Does',
  subtitle: 'Structured generation, validation, review, and export in one browser workspace.',
  paragraphs: [
    'The app compiles template-aware drafts from a single seed, keeps asset dependencies in order, and exposes review, validation, lineage, similarity, and export flows directly in the browser.',
    'Sensitive settings like API keys and draft content are stored client-side by default. Model requests go directly to the selected provider configuration in the active session.',
    'The repository also contains the blueprint source, rules, presets, and shared TypeScript utilities that power the browser runtime.',
  ],
};

export interface AboutQuickFact {
  label: string;
  value: string;
}

const QUICK_FACT_SURFACE: Record<InfoRuntimeScope, string> = {
  browser: 'Browser-first React app with shared generation and export utilities.',
  desktop: 'Desktop shell around the React generation workspace and export utilities.',
  mobile: 'Expo React Native app over the local device API and shared blueprint compiler.',
};

const QUICK_FACT_STORAGE: Record<InfoRuntimeScope, string> = {
  browser: 'Local browser storage and IndexedDB, with migration support from pre-rebrand keys.',
  desktop:
    'Desktop app data plus local browser-style runtime caches, with migration support from older IndexedDB drafts.',
  mobile: 'On-device storage in the app sandbox, with workspace bundling for cross-device transfer.',
};

const QUICK_FACT_VERSION_SUFFIX: Record<InfoRuntimeScope, string> = {
  browser: 'browser generation stack.',
  desktop: 'desktop generation stack.',
  mobile: 'mobile companion build.',
};

/**
 * Quick-fact rows. The version comes from the caller because each surface owns
 * its own build version (web's `__APP_VERSION__` build constant, mobile's
 * `app.json`), and reporting one surface's version on another would be a lie.
 */
export function buildAboutQuickFacts({
  scope,
  version,
}: {
  scope: InfoRuntimeScope;
  version: string;
}): AboutQuickFact[] {
  return [
    { label: 'Current surface', value: QUICK_FACT_SURFACE[scope] },
    { label: 'Primary workflow', value: 'Seed to reviewed asset pack with template-aware dependency handling.' },
    { label: 'Storage model', value: QUICK_FACT_STORAGE[scope] },
    { label: 'Version line', value: `v${version} ${QUICK_FACT_VERSION_SUFFIX[scope]}` },
  ];
}

/** Cards linking the other info pages, mirroring the browser About page. */
export const aboutInfoCards: { to: string; title: string; description: string }[] = [
  {
    to: '/whats-new',
    title: "What's New",
    description: 'Release notes, current version line, and upcoming staged updates.',
  },
  {
    to: '/terms',
    title: 'Terms of Use',
    description: 'Ground rules for using the web app, exports, and generated content responsibly.',
  },
  {
    to: '/privacy',
    title: 'Privacy',
    description: 'What stays in your browser, what reaches model providers, and where sensitive data lives.',
  },
  {
    to: '/license',
    title: 'License',
    description: 'The repository license text and current attribution requirements.',
  },
  {
    to: '/security',
    title: 'Security',
    description: 'How to report vulnerabilities and handle provider keys safely.',
  },
  {
    to: '/community',
    title: 'Community',
    description: 'Repository, issue tracking, support links, and the current public project spaces.',
  },
];

/** The in-app destinations the Community page lists under "Internal references". */
export const communityInternalLinks: { to: string; title: string }[] = [
  { to: '/code-of-conduct', title: 'Code of Conduct' },
  { to: '/help', title: 'Help Center' },
  { to: '/whats-new', title: "What's New" },
  { to: '/about', title: 'About' },
];

/** The in-app destinations the About page cross-links to in its footer row. */
export const aboutCrossLinks: { to: string; title: string }[] = [
  { to: '/community', title: 'Community' },
  { to: '/code-of-conduct', title: 'Code of Conduct' },
  { to: '/settings', title: 'Settings' },
  { to: '/data', title: 'Data Manager' },
];
