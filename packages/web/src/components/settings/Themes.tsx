import ThemeManagerContent from './ThemeManagerContent';

/**
 * Theme manager screen (`/settings/themes`).
 *
 * The body lives in `ThemeManagerContent`, which this screen shares with the theme
 * studio's `ThemeEditor` embed — the two were ~93% identical before the 5.0 work
 * stream merged them.
 */
export default function Themes() {
  return <ThemeManagerContent />;
}
