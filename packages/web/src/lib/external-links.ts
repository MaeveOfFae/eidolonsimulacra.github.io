/**
 * Desktop: external links open in the user's default browser.
 *
 * One delegated click handler (installed from `main.tsx`, desktop runtimes
 * only) intercepts every http(s)/mailto anchor and routes it through the
 * opener plugin instead of letting the webview navigate itself or spawn a
 * shell window. The app's own routing is hash-based, so `#…` hrefs never
 * match and react-router is untouched — the handler covers every current and
 * future external link without touching each component.
 */
import { openUrl } from '@tauri-apps/plugin-opener';
import { isDesktopRuntime } from './runtime';

let installed = false;

/** True when a click on this anchor should leave the app for the default browser. */
export function isExternalHref(href: string | null | undefined): boolean {
  return typeof href === 'string' && /^(https?:\/\/|mailto:)/i.test(href);
}

/**
 * Delegated click handler. `open` is injectable so tests can assert the
 * hand-off without invoking the Tauri IPC bridge.
 */
export function handleExternalLinkClick(event: MouseEvent, open: (href: string) => Promise<void> = openUrl): void {
  if (event.defaultPrevented) {
    return;
  }
  const target = event.target;
  const anchor = target instanceof Element ? target.closest('a[href]') : null;
  const href = anchor?.getAttribute('href');
  if (!isExternalHref(href)) {
    return;
  }
  event.preventDefault();
  void open(href!);
}

/** Install the document-level handler. No-op outside the desktop runtime. */
export function installExternalLinkHandler(): void {
  if (installed || !isDesktopRuntime()) {
    return;
  }
  installed = true;
  document.addEventListener('click', handleExternalLinkClick);
}
