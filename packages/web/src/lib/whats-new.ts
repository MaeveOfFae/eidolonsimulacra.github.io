/**
 * Re-export shim over `@char-gen/shared`'s `whats-new` module.
 *
 * The release-note data now lives in shared so the mobile app renders the same
 * source. `tools/generation/generate-release-notes.mjs` writes the shared module
 * directly; this file only preserves the `@/lib/whats-new` import path.
 */

export { releaseNotes } from '@char-gen/shared';
export type { ReleaseNoteEntry, ReleaseNoteLink } from '@char-gen/shared';
