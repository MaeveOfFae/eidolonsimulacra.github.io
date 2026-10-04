/**
 * Shared timestamp formatting for the web app.
 *
 * `dateStyle: 'medium'` / `timeStyle: 'short'` in the user's locale, with a
 * defensive fallback for missing or unparseable values. Extracted during the 5.0
 * decomposition work stream, which had accumulated seven identical local copies
 * across the library sections, the snapshot preview, and the history panels.
 *
 * Note: this preserves the original `if (!value)` guard, so a numeric `0` (the
 * epoch) still formats as `Unknown`. Changing that is a deliberate follow-up, not
 * a silent side effect of the extraction.
 */
export function formatTimestamp(value?: string | number): string {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
