/**
 * Public project links and community copy.
 *
 * These URLs and descriptions were previously duplicated between the browser
 * About and Community pages; both surfaces now read this list and only decide
 * how to render it (web uses anchors and an embedded support panel, mobile uses
 * buttons that open the system browser).
 */

export const PROJECT_REPOSITORY_URL = 'https://github.com/MaeveOfFae/eidolonsimulacra.github.io';
export const PROJECT_ISSUES_URL = `${PROJECT_REPOSITORY_URL}/issues`;
export const PROJECT_SUPPORT_URL = 'https://ko-fi.com/maeveoffae';
export const PROJECT_CONTACT_EMAIL = 'contact@eidolonsimulacra.com';

export function buildProjectMailto(subject: string): string {
  return `mailto:${PROJECT_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function buildSupportEmbedUrl(): string {
  return `${PROJECT_SUPPORT_URL}/?hidefeed=true&widget=true&embed=true&preview=true`;
}

/** Icon keys so each surface can pick its own icon set for the same resource. */
export type ProjectResourceIcon = 'repository' | 'issues' | 'support' | 'contact';

export interface ProjectResource {
  id: string;
  icon: ProjectResourceIcon;
  title: string;
  description: string;
  href: string;
  /** True when the link leaves the app and should open externally. */
  external: boolean;
}

export const communityResources: ProjectResource[] = [
  {
    id: 'repository',
    icon: 'repository',
    title: 'GitHub Repository',
    description: 'Source, release context, open work, and the current public project home.',
    href: PROJECT_REPOSITORY_URL,
    external: true,
  },
  {
    id: 'issues',
    icon: 'issues',
    title: 'Issues and Requests',
    description:
      'Report bugs, request features, or track concrete work items without leaving the project record scattered across chats.',
    href: PROJECT_ISSUES_URL,
    external: true,
  },
  {
    id: 'support',
    icon: 'support',
    title: 'Ko-fi Support',
    description: 'Support ongoing blueprint, release, and maintenance work if the project is useful to you.',
    href: PROJECT_SUPPORT_URL,
    external: true,
  },
  {
    id: 'contact',
    icon: 'contact',
    title: 'Direct Contact',
    description:
      'Use email for direct outreach, partnership questions, or cases that do not belong in public issue tracking.',
    href: buildProjectMailto('Eidolon Simulacra Community'),
    external: true,
  },
];

export const communityGuidance: string[] = [
  'Use GitHub issues for concrete bugs, regressions, and feature requests you want tracked in the open. Keep reports specific enough that they can turn into action rather than general frustration.',
  'Use direct email when the topic is sensitive, private, or operational. Use Ko-fi when the goal is support rather than issue tracking.',
  'This page intentionally lists only spaces that are confirmed in the current build. If Discord, forums, or broader sharing hubs are added later, they should land here once they are real and maintained.',
];

export const supportGuidance: string[] = [
  'If Eidolon Simulacra is useful to you, Ko-fi is the cleanest way to back ongoing blueprint work, browser tooling, and release upkeep.',
  'Support helps fund template updates, validation improvements, UI polish, and the less glamorous maintenance work that keeps the compiler stack stable.',
  // The browser page carries a third paragraph about why the Ko-fi panel sits in
  // the page body instead of the sidebar. That is browser-layout copy, so it
  // deliberately stays in the web component rather than here.
];

export const contactGuidance = {
  intro: 'Found a bug or security issue? We want to hear about it.',
  bugLine: 'Report bugs and get help with issues',
  securityLine: 'Report security vulnerabilities responsibly',
  actionLabel: 'Contact Us',
  actionHref: buildProjectMailto('Bug Report or Security Issue'),
};
