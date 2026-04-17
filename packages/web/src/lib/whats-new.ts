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
    version: '3.3.2',
    releasedOn: '2024-06-17',
    badge: 'Current release',
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