import { describe, expect, it } from 'vitest';
import { releaseNotes, type ReleaseNoteEntry } from '@char-gen/shared';
import { buildWhatsNewPreview, formatReleaseDate, getCurrentReleaseNote, mapReleaseNoteRoute } from './whats-new';

function buildEntry(overrides: Partial<ReleaseNoteEntry> = {}): ReleaseNoteEntry {
  return {
    version: '3.3.5',
    releasedOn: '2026-04-20',
    badge: 'Current release',
    headline: 'Platform and UI update',
    summary: 'This release packages recent commits.',
    highlights: ['One highlight'],
    links: [{ label: 'Open generation', to: '/generate' }],
    ...overrides,
  };
}

describe('getCurrentReleaseNote', () => {
  it('returns the newest entry', () => {
    const notes = [buildEntry({ version: '3.3.5' }), buildEntry({ version: '3.3.4', badge: 'Previous release' })];

    expect(getCurrentReleaseNote(notes)?.version).toBe('3.3.5');
  });

  it('returns null when there are no notes', () => {
    expect(getCurrentReleaseNote([])).toBeNull();
  });

  it('resolves the newest entry from the shared data', () => {
    expect(getCurrentReleaseNote(releaseNotes)?.badge).toBe('Current release');
  });
});

describe('mapReleaseNoteRoute', () => {
  it('maps the shared web routes onto mobile tabs', () => {
    expect(mapReleaseNoteRoute('/generate')).toBe('Generate');
    expect(mapReleaseNoteRoute('/templates')).toBe('Templates');
    expect(mapReleaseNoteRoute('/drafts')).toBe('Drafts');
    expect(mapReleaseNoteRoute('/settings')).toBe('Settings');
    expect(mapReleaseNoteRoute('/home')).toBe('Home');
  });

  it('returns null for routes mobile cannot deep-link into', () => {
    expect(mapReleaseNoteRoute('/worlds')).toBeNull();
    expect(mapReleaseNoteRoute('/help/tours')).toBeNull();
    expect(mapReleaseNoteRoute('')).toBeNull();
    expect(mapReleaseNoteRoute('https://example.com')).toBeNull();
  });

  it('tolerates surrounding whitespace and casing', () => {
    expect(mapReleaseNoteRoute(' /Generate ')).toBe('Generate');
  });

  it('maps every route currently present in the shared data to a known tab', () => {
    // If tooling ever introduces a route mobile cannot reach, this fails before
    // the change ships so the screen never renders a dead link.
    releaseNotes.forEach((entry) => {
      entry.links.forEach((link) => {
        expect(mapReleaseNoteRoute(link.to)).not.toBeNull();
      });
    });
  });
});

describe('formatReleaseDate', () => {
  it('formats an ISO date as a long human-readable date', () => {
    expect(formatReleaseDate('2026-04-20')).toBe('April 20, 2026');
    expect(formatReleaseDate('2024-06-17')).toBe('June 17, 2024');
  });

  it('returns the raw value when it is not a valid date', () => {
    expect(formatReleaseDate('not-a-date')).toBe('not-a-date');
  });
});

describe('buildWhatsNewPreview', () => {
  it('summarizes the current version for the home entry point', () => {
    expect(buildWhatsNewPreview([buildEntry()])).toBe('v3.3.5 • Current release');
  });

  it('falls back to a placeholder when there are no notes', () => {
    expect(buildWhatsNewPreview([])).toBe('No release notes yet');
  });
});
