import { isDesktopRuntime } from '../lib/runtime';

interface DownloadResponse {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
}

interface SaveResult {
  saved: boolean;
  method: 'tauri' | 'file-system-access' | 'share' | 'download' | 'new-tab' | 'cancelled';
}

interface PickFileOptions {
  accept?: string;
}

interface FilePickerAcceptType {
  description?: string;
  accept: Record<string, string[]>;
}

interface FilePickerOpenOptions {
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}

interface FilePickerSaveOptions {
  suggestedName?: string;
  excludeAcceptAllOption?: boolean;
  types?: FilePickerAcceptType[];
}

interface BrowserFileHandle {
  getFile(): Promise<File>;
}

interface BrowserWritableStream {
  write(data: Blob | BufferSource | string): Promise<void>;
  close(): Promise<void>;
}

interface BrowserSaveFileHandle {
  createWritable(): Promise<BrowserWritableStream>;
}

type FilePickerWindow = Window & {
  showOpenFilePicker?: (options?: FilePickerOpenOptions) => Promise<BrowserFileHandle[]>;
  showSaveFilePicker?: (options?: FilePickerSaveOptions) => Promise<BrowserSaveFileHandle>;
};

type ShareCapableNavigator = Navigator & {
  canShare?: (data?: ShareData) => boolean;
};

const EXTENSION_TO_MIME: Record<string, string> = {
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.zip': 'application/zip',
};

const MIME_TO_EXTENSIONS: Record<string, string[]> = {
  'application/json': ['.json'],
  'application/zip': ['.zip'],
  'image/png': ['.png'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
};

function sanitizeFilename(filename: string): string {
  const sanitized = filename.trim().replace(/[\\/:*?"<>|]+/g, '_');
  return sanitized || 'download';
}

function extensionFor(filename: string): string | null {
  const parts = filename.split('.');
  if (parts.length < 2) {
    return null;
  }

  const extension = parts.at(-1)?.trim().toLowerCase() ?? '';
  return extension ? extension : null;
}

function basename(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts.at(-1) || 'imported-file';
}

function parseAcceptTokens(accept?: string): { extensions: string[]; browserTypes?: FilePickerAcceptType[] } {
  if (!accept) {
    return { extensions: [] };
  }

  const tokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0);

  const extensions = new Set<string>();
  const browserAccept = new Map<string, Set<string>>();

  for (const token of tokens) {
    if (token.startsWith('.')) {
      extensions.add(token.slice(1));
      const mimeType = EXTENSION_TO_MIME[token];
      if (mimeType) {
        const values = browserAccept.get(mimeType) ?? new Set<string>();
        values.add(token);
        browserAccept.set(mimeType, values);
      }
      continue;
    }

    if (!token.includes('/')) {
      continue;
    }

    const knownExtensions = MIME_TO_EXTENSIONS[token] ?? [];
    if (knownExtensions.length > 0) {
      const values = browserAccept.get(token) ?? new Set<string>();
      for (const extension of knownExtensions) {
        values.add(extension);
        extensions.add(extension.slice(1));
      }
      browserAccept.set(token, values);
    }
  }

  if (browserAccept.size === 0) {
    return { extensions: Array.from(extensions) };
  }

  return {
    extensions: Array.from(extensions),
    browserTypes: [{
      description: 'Supported files',
      accept: Object.fromEntries(Array.from(browserAccept.entries()).map(([mimeType, values]) => [mimeType, Array.from(values)])),
    }],
  };
}

function inferMimeType(filename: string, fallback: string | null = null): string {
  const extension = extensionFor(filename);
  if (extension) {
    const mapped = EXTENSION_TO_MIME[`.${extension}`];
    if (mapped) {
      return mapped;
    }
  }

  return fallback ?? 'application/octet-stream';
}

function buildDialogFilters(filename: string, contentType: string | null) {
  const extension = extensionFor(filename);
  if (!extension) {
    return undefined;
  }

  const filterName = contentType ?? `${extension.toUpperCase()} file`;
  return [{ name: filterName, extensions: [extension] }];
}

function buildOpenDialogFilters(accept?: string) {
  const { extensions } = parseAcceptTokens(accept);
  if (extensions.length === 0) {
    return undefined;
  }

  return [{ name: 'Supported files', extensions }];
}

function isProbablyMobileBrowser(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const narrowViewport = window.matchMedia?.('(max-width: 1024px)').matches ?? false;
  const mobileAgent = /Android|webOS|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

  return mobileAgent || (coarsePointer && narrowViewport);
}

async function shareWithBrowser(download: DownloadResponse, filename: string): Promise<SaveResult | null> {
  const shareNavigator = navigator as ShareCapableNavigator;

  if (!isProbablyMobileBrowser() || typeof shareNavigator.share !== 'function') {
    return null;
  }

  const file = new File([download.blob], filename, {
    type: download.contentType ?? (download.blob.type || 'application/octet-stream'),
  });
  const shareData: ShareData = {
    files: [file],
    title: filename,
  };

  if (typeof shareNavigator.canShare === 'function' && !shareNavigator.canShare(shareData)) {
    return null;
  }

  try {
    await shareNavigator.share(shareData);
    return { saved: true, method: 'share' };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { saved: false, method: 'cancelled' };
    }

    return null;
  }
}

async function openInNewTab(blob: Blob): Promise<SaveResult> {
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, '_blank', 'noopener,noreferrer');

  if (popup) {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return { saved: true, method: 'new-tab' };
  }

  URL.revokeObjectURL(url);
  return { saved: false, method: 'cancelled' };
}

async function saveWithBrowser(blob: Blob, filename: string): Promise<SaveResult> {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { saved: true, method: 'download' };
}

async function saveWithBrowserFilePicker(download: DownloadResponse, filename: string): Promise<SaveResult | null> {
  if (typeof window === 'undefined' || isProbablyMobileBrowser()) {
    return null;
  }

  const filePickerWindow = window as FilePickerWindow;
  if (typeof filePickerWindow.showSaveFilePicker !== 'function') {
    return null;
  }

  const { browserTypes } = parseAcceptTokens(download.contentType ?? undefined);

  try {
    const handle = await filePickerWindow.showSaveFilePicker({
      suggestedName: filename,
      excludeAcceptAllOption: Boolean(browserTypes?.length),
      types: browserTypes,
    });
    const writable = await handle.createWritable();
    await writable.write(download.blob);
    await writable.close();
    return { saved: true, method: 'file-system-access' };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { saved: false, method: 'cancelled' };
    }

    return null;
  }
}

async function saveWithTauri(download: DownloadResponse, filename: string): Promise<SaveResult> {
  const { invoke } = await import('@tauri-apps/api/core');
  const bytes = new Uint8Array(await download.blob.arrayBuffer());
  const saved = await invoke<boolean>('save_export', {
    defaultFilename: filename,
    filters: buildDialogFilters(filename, download.contentType),
    data: Array.from(bytes),
  });

  if (!saved) {
    return { saved: false, method: 'cancelled' };
  }

  return { saved: true, method: 'tauri' };
}

async function openWithTauri(accept?: string): Promise<File | null> {
  const [{ open }, { readFile }] = await Promise.all([
    import('@tauri-apps/plugin-dialog'),
    import('@tauri-apps/plugin-fs'),
  ]);
  const selected = await open({
    multiple: false,
    filters: buildOpenDialogFilters(accept),
  });

  if (!selected || Array.isArray(selected)) {
    return null;
  }

  const bytes = await readFile(selected);
  const name = basename(selected);
  return new File([bytes], name, { type: inferMimeType(name) });
}

async function openWithBrowserFilePicker(accept?: string): Promise<File | null> {
  if (typeof window === 'undefined' || isProbablyMobileBrowser()) {
    return null;
  }

  const filePickerWindow = window as FilePickerWindow;
  if (typeof filePickerWindow.showOpenFilePicker !== 'function') {
    return null;
  }

  const { browserTypes } = parseAcceptTokens(accept);

  try {
    const handles = await filePickerWindow.showOpenFilePicker({
      multiple: false,
      excludeAcceptAllOption: Boolean(browserTypes?.length),
      types: browserTypes,
    });
    const handle = handles[0];
    return handle ? handle.getFile() : null;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return null;
    }

    return null;
  }
}

function openWithInputFallback(options: PickFileOptions, input: HTMLInputElement): Promise<File | null> {
  const originalAccept = input.accept;

  return new Promise((resolve) => {
    let settled = false;

    const finish = (file: File | null) => {
      if (settled) {
        return;
      }

      settled = true;
      input.accept = originalAccept;
      input.value = '';
      input.removeEventListener('change', handleChange);
      input.removeEventListener('cancel', handleCancel);
      window.removeEventListener('focus', handleFocus);
      resolve(file);
    };

    const handleChange = () => finish(input.files?.[0] ?? null);
    const handleCancel = () => finish(null);
    const handleFocus = () => {
      window.setTimeout(() => {
        if (!settled && !(input.files?.length)) {
          finish(null);
        }
      }, 250);
    };

    if (options.accept) {
      input.accept = options.accept;
    }

    input.addEventListener('change', handleChange, { once: true });
    input.addEventListener('cancel', handleCancel as EventListener, { once: true });
    window.addEventListener('focus', handleFocus, { once: true });
    input.click();
  });
}

export async function saveDownload(download: DownloadResponse, fallbackFilename: string): Promise<SaveResult> {
  const filename = sanitizeFilename(download.filename ?? fallbackFilename);

  if (isDesktopRuntime()) {
    return saveWithTauri(download, filename);
  }

  const filePickerResult = await saveWithBrowserFilePicker(download, filename);
  if (filePickerResult) {
    return filePickerResult;
  }

  const shared = await shareWithBrowser(download, filename);
  if (shared) {
    return shared;
  }

  if (isProbablyMobileBrowser()) {
    const opened = await openInNewTab(download.blob);
    if (opened.saved) {
      return opened;
    }
  }

  return saveWithBrowser(download.blob, filename);
}

export async function saveBlobDownload(blob: Blob, filename: string, contentType?: string | null): Promise<SaveResult> {
  return saveDownload(
    {
      blob,
      filename,
      contentType: contentType ?? (blob.type || null),
    },
    filename
  );
}

export async function pickFile(options: PickFileOptions = {}, fallbackInput?: HTMLInputElement | null): Promise<File | null> {
  if (isDesktopRuntime()) {
    return openWithTauri(options.accept);
  }

  const picked = await openWithBrowserFilePicker(options.accept);
  if (picked) {
    return picked;
  }

  if (fallbackInput) {
    return openWithInputFallback(options, fallbackInput);
  }

  throw new Error('File import is unavailable in this browser.');
}
