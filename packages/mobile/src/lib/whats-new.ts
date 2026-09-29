/**
 * Mobile release-note presentation logic.
 *
 * Pure so it can be unit-tested in the node Vitest environment: the note data
 * comes from `@char-gen/shared` and the navigation calls stay in the screen.
 */

import type { ReleaseNoteEntry } from '@char-gen/shared';
import { isMobileTabDestination, mapWebRouteToMobileDestination, type MobileTabDestination } from './route-targets';

/** Mobile tabs a release-note link can deep-link into (mirrors `RootTabParamList`). */
export type ReleaseNoteDestination = MobileTabDestination;

export function getCurrentReleaseNote(notes: readonly ReleaseNoteEntry[]): ReleaseNoteEntry | null {
  return notes[0] ?? null;
}

/**
 * Maps a shared release-note link target (a web route) onto a mobile tab.
 * Release notes only offer tab destinations, so Home-stack screens are treated
 * as unreachable here and the screen renders those links as inert text.
 */
export function mapReleaseNoteRoute(to: string): ReleaseNoteDestination | null {
  const destination = mapWebRouteToMobileDestination(to);
  if (destination && isMobileTabDestination(destination)) {
    return destination;
  }

  return null;
}

export function formatReleaseDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function buildWhatsNewPreview(notes: readonly ReleaseNoteEntry[]): string {
  const current = getCurrentReleaseNote(notes);
  if (!current) {
    return 'No release notes yet';
  }

  return `v${current.version} • ${current.badge}`;
}
