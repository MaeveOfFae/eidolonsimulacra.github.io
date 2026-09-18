import type { DownloadResponse } from '@char-gen/shared';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export interface PickedTextFile {
  name: string;
  contents: string;
  mimeType?: string;
  uri: string;
}

export interface PickedCharacterImportFile {
  name: string;
  mimeType?: string;
  uri: string;
  payload: string | ArrayBuffer;
}

export interface MobileSaveResult {
  saved: boolean;
  method: 'share' | 'cancelled';
  uri: string;
}

function sanitizeFilename(filename: string): string {
  const sanitized = filename.trim().replace(/[\\/:*?"<>|]+/g, '_');
  return sanitized || 'export.txt';
}

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64ToArrayBuffer(base64: string): ArrayBuffer {
  const cleaned = base64.replace(/\s+/g, '');
  const paddedLength = Math.ceil(cleaned.length / 4) * 4;
  const normalized = cleaned.padEnd(paddedLength, '=');
  const bytes: number[] = [];

  for (let index = 0; index < normalized.length; index += 4) {
    const c0 = normalized[index];
    const c1 = normalized[index + 1];
    const c2 = normalized[index + 2];
    const c3 = normalized[index + 3];
    const b0 = BASE64_CHARS.indexOf(c0);
    const b1 = BASE64_CHARS.indexOf(c1);
    const b2 = c2 === '=' ? -1 : BASE64_CHARS.indexOf(c2);
    const b3 = c3 === '=' ? -1 : BASE64_CHARS.indexOf(c3);

    if (b0 === -1 || b1 === -1) {
      throw new Error('Invalid base64 import payload');
    }

    bytes.push((b0 << 2) | (b1 >> 4));
    if (b2 !== -1) {
      bytes.push(((b1 & 0x0F) << 4) | (b2 >> 2));
    }
    if (b2 !== -1 && b3 !== -1) {
      bytes.push(((b2 & 0x03) << 6) | b3);
    }
  }

  return Uint8Array.from(bytes).buffer;
}

function getExportDirectory(): string {
  const baseDirectory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!baseDirectory) {
    throw new Error('File export is unavailable on this device.');
  }

  return `${baseDirectory}exports`;
}

function getUtiForMimeType(mimeType: string): string | undefined {
  switch (mimeType) {
    case 'application/json':
      return 'public.json';
    case 'text/markdown':
      return 'net.daringfireball.markdown';
    case 'text/plain':
      return 'public.plain-text';
    default:
      return undefined;
  }
}

function shareFileOptions(filename: string, mimeType: string) {
  return {
    dialogTitle: filename,
    mimeType,
    UTI: getUtiForMimeType(mimeType),
  };
}

async function shareFile(uri: string, filename: string, mimeType: string): Promise<MobileSaveResult> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Native file sharing is unavailable on this device.');
  }

  try {
    await Sharing.shareAsync(uri, shareFileOptions(filename, mimeType));
    return { saved: true, method: 'share', uri };
  } catch (error) {
    if (error instanceof Error && /cancel/i.test(error.message)) {
      return { saved: false, method: 'cancelled', uri };
    }

    throw error;
  }
}

async function readBlobAsText(blob: Blob): Promise<string> {
  const maybeBlob = blob as Blob & {
    text?: () => Promise<string>;
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };

  if (typeof maybeBlob.text === 'function') {
    return maybeBlob.text();
  }

  if (typeof FileReader !== 'undefined') {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error('Failed to read export data'));
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.readAsText(blob);
    });
  }

  if (typeof maybeBlob.arrayBuffer === 'function') {
    const contents = await maybeBlob.arrayBuffer();
    return new TextDecoder().decode(contents);
  }

  throw new Error('This device cannot decode the exported file payload.');
}

async function readBlobAsBase64(blob: Blob): Promise<string> {
  const maybeBlob = blob as Blob & {
    arrayBuffer?: () => Promise<ArrayBuffer>;
  };

  if (typeof FileReader !== 'undefined') {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error('Failed to read export data'));
      reader.onload = () => {
        const value = typeof reader.result === 'string' ? reader.result : '';
        const match = value.match(/^data:[^;]+;base64,(.+)$/);
        resolve(match?.[1] ?? '');
      };
      reader.readAsDataURL(blob);
    });
  }

  if (typeof maybeBlob.arrayBuffer === 'function') {
    const bytes = new Uint8Array(await maybeBlob.arrayBuffer());
    let result = '';
    for (let index = 0; index < bytes.length; index += 3) {
      const a = bytes[index]!;
      const b = index + 1 < bytes.length ? bytes[index + 1]! : 0;
      const c = index + 2 < bytes.length ? bytes[index + 2]! : 0;
      const trio = (a << 16) | (b << 8) | c;
      result += BASE64_CHARS[(trio >> 18) & 0x3f];
      result += BASE64_CHARS[(trio >> 12) & 0x3f];
      result += index + 1 < bytes.length ? BASE64_CHARS[(trio >> 6) & 0x3f] : '=';
      result += index + 2 < bytes.length ? BASE64_CHARS[trio & 0x3f] : '=';
    }
    return result;
  }

  throw new Error('This device cannot encode the exported file payload.');
}

async function writeTextFile(contents: string, filename: string): Promise<string> {
  const directory = getExportDirectory();
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const fileUri = `${directory}/${Date.now()}-${sanitizeFilename(filename)}`;
  await FileSystem.writeAsStringAsync(fileUri, contents, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return fileUri;
}

async function writeBinaryFile(blob: Blob, filename: string): Promise<string> {
  const directory = getExportDirectory();
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const fileUri = `${directory}/${Date.now()}-${sanitizeFilename(filename)}`;
  const base64 = await readBlobAsBase64(blob);
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return fileUri;
}

export async function saveDownload(download: DownloadResponse, fallbackFilename: string): Promise<MobileSaveResult> {
  const filename = sanitizeFilename(download.filename ?? fallbackFilename);
  const mimeType = download.contentType ?? 'text/plain';
  const uri = mimeType === 'image/png'
    ? await writeBinaryFile(download.blob, filename)
    : await writeTextFile(await readBlobAsText(download.blob), filename);

  return shareFile(uri, filename, mimeType);
}

export async function saveTextFile(contents: string, filename: string, mimeType = 'text/plain'): Promise<MobileSaveResult> {
  const sanitizedFilename = sanitizeFilename(filename);
  const uri = await writeTextFile(contents, sanitizedFilename);
  return shareFile(uri, sanitizedFilename, mimeType);
}

export async function pickTextFile(types: string[] = ['*/*']): Promise<PickedTextFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: types,
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  const contents = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return {
    name: asset.name,
    contents,
    mimeType: asset.mimeType,
    uri: asset.uri,
  };
}

export async function pickCharacterImportFile(): Promise<PickedCharacterImportFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'text/markdown', 'image/png'],
    copyToCacheDirectory: true,
    multiple: false,
    base64: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  const lowerName = asset.name.toLowerCase();
  const isPng = lowerName.endsWith('.png') || asset.mimeType === 'image/png';

  if (isPng) {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      name: asset.name,
      mimeType: asset.mimeType,
      uri: asset.uri,
      payload: decodeBase64ToArrayBuffer(base64),
    };
  }

  const contents = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return {
    name: asset.name,
    mimeType: asset.mimeType,
    uri: asset.uri,
    payload: contents,
  };
}