type TauriAwareWindow = Window &
  typeof globalThis & {
    __TAURI__?: unknown;
    __TAURI_INTERNALS__?: unknown;
  };

export function isDesktopRuntime(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const tauriWindow = window as TauriAwareWindow;
  return Boolean(tauriWindow.__TAURI__ || tauriWindow.__TAURI_INTERNALS__);
}

export function prefersExpandedDesktopChrome(): boolean {
  if (!isDesktopRuntime()) {
    return false;
  }

  return window.matchMedia?.('(min-width: 1280px)').matches ?? false;
}

export function isSelfContainedDesktopRuntime(): boolean {
  return isDesktopRuntime();
}
