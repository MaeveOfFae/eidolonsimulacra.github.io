import ThemeManagerContent from '../settings/ThemeManagerContent';

export interface ThemeEditorProps {
  showHeader?: boolean;
  showSyncControls?: boolean;
}

/**
 * Embedded theme editor used by the theme studio.
 *
 * This was a near-copy of the theme manager screen until the 5.0 work stream
 * merged the two: it now renders the shared `ThemeManagerContent` with the page
 * header and the sync panel suppressed.
 */
export default function ThemeEditor({ showHeader = true, showSyncControls = true }: ThemeEditorProps) {
  return <ThemeManagerContent showHeader={showHeader} showSyncControls={showSyncControls} />;
}
