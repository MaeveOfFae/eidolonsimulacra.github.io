import { useEffect } from 'react';
import { isDesktopRuntime } from '@/lib/runtime';
import { classifyDroppedFile, fileNameFromPath } from './file-drop';

/**
 * Desktop file drops, through the native webview.
 *
 * Tauri intercepts OS drops at the webview level (`dragDropEnabled`, which defaults to true
 * and is set explicitly in `tauri.conf.json`), so HTML5 `drop` events never fire in the
 * desktop shell: the same gesture arrives here instead, as native paths.
 *
 * Paths are turned into real `File` objects before they are handed on, so the browser path
 * and the desktop path converge on one handler and one classification. The bytes are only
 * read for files whose *name* already classified as something the app imports — a dropped
 * folder or an archive is answered from its name without touching the disk.
 *
 * The Tauri APIs are imported lazily and only in the desktop runtime, so a web build never
 * loads them, and every failure is reported rather than thrown: a drop that cannot be
 * handled should say so, not break the shell.
 */
export function useDesktopFileDrop(onFiles: (files: File[]) => void): void {
  useEffect(() => {
    if (!isDesktopRuntime()) {
      return;
    }

    let unlisten: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      try {
        const { getCurrentWebview } = await import('@tauri-apps/api/webview');
        const { readFile } = await import('@tauri-apps/plugin-fs');

        const stop = await getCurrentWebview().onDragDropEvent((event) => {
          // The published payload type is a union whose members both carry `position` twice,
          // so narrowing on `type` alone does not satisfy the compiler. Reading it as the
          // shape this handler actually needs keeps the unreliability in one place.
          const payload = event.payload as { type?: string; paths?: string[] };
          if (payload.type !== 'drop' || !payload.paths || payload.paths.length === 0) {
            return;
          }

          const droppedPaths = payload.paths;

          void (async () => {
            const files: File[] = [];

            for (const path of droppedPaths) {
              const name = fileNameFromPath(path);
              if (classifyDroppedFile({ name }).kind === 'unknown') {
                continue;
              }

              try {
                const bytes = await readFile(path);
                files.push(new File([bytes], name));
              } catch (error) {
                console.warn(`Could not read the dropped file ${name}:`, error);
              }
            }

            if (files.length > 0) {
              onFiles(files);
            }
          })();
        });

        if (cancelled) {
          stop();
        } else {
          unlisten = stop;
        }
      } catch (error) {
        console.warn('Desktop file drops are unavailable:', error);
      }
    })();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [onFiles]);
}
