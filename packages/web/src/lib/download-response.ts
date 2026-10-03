/**
 * Shared download-response plumbing for the browser API facade and its
 * extracted domain modules.
 *
 * Split out of `api.ts` (4.7.0) so the template, theme, and export domains can
 * build `DownloadResponse` payloads without importing the facade itself.
 */

export interface DownloadResponse {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
}

export function slugifyFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function createDownload(content: string | Uint8Array, filename: string, type: string): DownloadResponse {
  // TypeScript's DOM types reject `Uint8Array<ArrayBufferLike>` as a `BlobPart`
  // because `ArrayBufferLike` also covers `SharedArrayBuffer`. Copying through a
  // fresh view guarantees an `ArrayBuffer`-backed part without a cast.
  const parts: BlobPart[] = typeof content === 'string' ? [content] : [new Uint8Array(content)];

  return {
    blob: new Blob(parts, { type }),
    filename,
    contentType: type,
  };
}
