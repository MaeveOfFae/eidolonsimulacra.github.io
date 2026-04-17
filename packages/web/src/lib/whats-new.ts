export interface ReleaseNoteLink {
  label: string;
  to: string;
}

export interface ReleaseNoteEntry {
  version: string;
  releasedOn: string;
  badge: string;
  headline: string;
  summary: string;
  highlights: string[];
  links: ReleaseNoteLink[];
}

// Generated and maintained by tools/generation/generate-release-notes.mjs.
export const releaseNotes: ReleaseNoteEntry[] = [
  {
    version: '3.3.3',
    releasedOn: '2026-04-17',
    badge: 'Current release',
    headline: 'Platform and UI update',
    summary: 'This release packages 12 recent commits focused on platform, UI, and templates.',
    highlights: [
      'Enhance draft review and refinement process',
      'Add Kofi overlay styling to ensure proper positioning on the screen',
      'Refactor Ko-fi overlay integration and improve contextual help panel accessibility',
      'Add Ko-fi overlay widget for donations support',
      'Implement character import functionality with support for multiple formats',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
    ],
  },
  {
    version: '3.3.2',
    releasedOn: '2024-06-17',
    badge: 'Previous release',
    headline: 'Platform and templates update',
    summary: 'This release packages 12 recent commits focused on platform, templates, and themes.',
    highlights: [
      'Implement archiving functionality for seeds and seed runs',
      'Added draft import handling with character sheet and lorebook asset extraction',
    ],
    links: [
      { label: 'Open generation', to: '/generate' },
      { label: 'Review templates', to: '/templates' },
    ],
  },
];