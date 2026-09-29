import { describe, expect, it } from 'vitest';
import { releaseNotes, type ReleaseNoteEntry } from './whats-new';

function compareSemver(left: string, right: string): number {
  const [leftMajor, leftMinor, leftPatch] = left.split('.').map(Number);
  const [rightMajor, rightMinor, rightPatch] = right.split('.').map(Number);

  if (leftMajor !== rightMajor) return leftMajor - rightMajor;
  if (leftMinor !== rightMinor) return leftMinor - rightMinor;
  return leftPatch - rightPatch;
}

function isValidSemver(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function isValidReleaseDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

describe('release notes data', () => {
  it('is a non-empty list', () => {
    expect(releaseNotes.length).toBeGreaterThan(0);
  });

  it('uses unique semver versions in descending order', () => {
    const versions = releaseNotes.map((entry) => entry.version);

    expect(new Set(versions).size).toBe(versions.length);
    versions.forEach((version) => expect(isValidSemver(version)).toBe(true));
    for (let index = 1; index < versions.length; index += 1) {
      expect(compareSemver(versions[index - 1], versions[index])).toBeGreaterThan(0);
    }
  });

  it('marks exactly the newest entry as the current release', () => {
    expect(releaseNotes[0].badge).toBe('Current release');
    releaseNotes.slice(1).forEach((entry) => expect(entry.badge).toBe('Previous release'));
  });

  it('carries a parseable release date for every entry', () => {
    releaseNotes.forEach((entry) => expect(isValidReleaseDate(entry.releasedOn)).toBe(true));
  });

  it('keeps every entry narratively complete', () => {
    releaseNotes.forEach((entry: ReleaseNoteEntry) => {
      expect(entry.headline.trim().length).toBeGreaterThan(0);
      expect(entry.summary.trim().length).toBeGreaterThan(0);
      expect(entry.highlights.length).toBeGreaterThan(0);
      entry.highlights.forEach((highlight) => expect(highlight.trim().length).toBeGreaterThan(0));
    });
  });

  it('keeps link targets as in-app routes', () => {
    releaseNotes.forEach((entry) => {
      expect(entry.links.length).toBeGreaterThan(0);
      entry.links.forEach((link) => {
        expect(link.label.trim().length).toBeGreaterThan(0);
        expect(link.to.startsWith('/')).toBe(true);
      });
    });
  });
});
