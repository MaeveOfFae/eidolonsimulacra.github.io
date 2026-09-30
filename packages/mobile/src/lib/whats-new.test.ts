import { describe, expect, it } from 'vitest';
import { releaseNotes, type ReleaseNoteEntry } from '@char-gen/shared';
import { buildWhatsNewPreview, formatReleaseDate, getCurrentReleaseNote, mapReleaseNoteRoute } from './whats-new';

function buildEntry(overrides: Partial<ReleaseNoteEntry> = {}): ReleaseNoteEntry {
  return {
    version: '9.9.9',
    releasedOn: '2026-01-01',
    badge: 'Current release',
    headline: 'Synthetic test entry',
    summary: 'Fixture data, not a real release.',
    highlights: ['One highlight'],
    links: [{ label: 'Open generation', to: '/generate' }],
    ...overrides,
  };
}

describe('getCurrentReleaseNote', () => {
  it('returns the newest entry', () => {
    const notes = [buildEntry({ version: '9.9.9' }), buildEntry({ version: '9.9.8', badge: 'Previous release' })];

    expect(getCurrentReleaseNote(notes)?.version).toBe('9.9.9');
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

  it('maps routes onto Home-stack screens mobile now ships', () => {
    expect(mapReleaseNoteRoute('/help')).toBe('HelpCenter');
    expect(mapReleaseNoteRoute('/themes')).toBe('ThemePicker');
    expect(mapReleaseNoteRoute('/about')).toBe('About');
  });

  it('returns null for routes mobile cannot deep-link into', () => {
    expect(mapReleaseNoteRoute('/worlds')).toBeNull();
    expect(mapReleaseNoteRoute('/help/tours')).toBeNull();
    expect(mapReleaseNoteRoute('/data')).toBeNull();
    expect(mapReleaseNoteRoute('')).toBeNull();
    expect(mapReleaseNoteRoute('https://example.com')).toBeNull();
  });

  it('tolerates surrounding whitespace and casing', () => {
    expect(mapReleaseNoteRoute(' /Generate ')).toBe('Generate');
  });

  it('maps every route currently present in the shared data to a reachable destination', () => {
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
    const entry = buildEntry();

    // Derived from the fixture rather than pinned to a literal so a version bump
    // cannot break this test.
    expect(buildWhatsNewPreview([entry])).toBe(`v${entry.version} • ${entry.badge}`);
  });

  it('previews the real shared release line without hardcoding it', () => {
    const current = getCurrentReleaseNote(releaseNotes);

    expect(current).not.toBeNull();
    expect(buildWhatsNewPreview(releaseNotes)).toBe(`v${current?.version} • ${current?.badge}`);
  });

  it('falls back to a placeholder when there are no notes', () => {
    expect(buildWhatsNewPreview([])).toBe('No release notes yet');
  });
});
