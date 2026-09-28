const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder('utf-8').decode(bytes);
  }

  let result = '';
  for (let index = 0; index < bytes.length; index += 1) {
    result += String.fromCharCode(bytes[index] ?? 0);
  }
  return result;
}

function encodeUtf8(value: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(value);
  }

  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

function createCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let current = index;
    for (let bit = 0; bit < 8; bit += 1) {
      current = (current & 1) === 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
    }
    table[index] = current >>> 0;
  }

  return table;
}

const CRC32_TABLE = createCrc32Table();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC32_TABLE[(crc ^ bytes[index]!) & 0xff]! ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function encodeBytesToBase64(bytes: Uint8Array): string {
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

function decodeBase64ToBytes(base64: string): Uint8Array | null {
  try {
    const cleaned = base64.replace(/\s+/g, '');
    const paddedLength = Math.ceil(cleaned.length / 4) * 4;
    const normalized = cleaned.padEnd(paddedLength, '=');
    const bytes: number[] = [];

    for (let index = 0; index < normalized.length; index += 4) {
      const c0 = normalized[index]!;
      const c1 = normalized[index + 1]!;
      const c2 = normalized[index + 2]!;
      const c3 = normalized[index + 3]!;
      const b0 = BASE64_CHARS.indexOf(c0);
      const b1 = BASE64_CHARS.indexOf(c1);
      const b2 = c2 === '=' ? -1 : BASE64_CHARS.indexOf(c2);
      const b3 = c3 === '=' ? -1 : BASE64_CHARS.indexOf(c3);

      if (b0 === -1 || b1 === -1) {
        return null;
      }

      bytes.push((b0 << 2) | (b1 >> 4));
      if (b2 !== -1) {
        bytes.push(((b1 & 0x0f) << 4) | (b2 >> 2));
      }
      if (b2 !== -1 && b3 !== -1) {
        bytes.push(((b2 & 0x03) << 6) | b3);
      }
    }

    return Uint8Array.from(bytes);
  } catch {
    return null;
  }
}

function createChunk(chunkType: string, chunkData: Uint8Array): Uint8Array {
  const typeBytes = encodeUtf8(chunkType);
  if (typeBytes.length !== 4) {
    throw new Error(`Invalid PNG chunk type: ${chunkType}`);
  }

  const chunk = new Uint8Array(12 + chunkData.length);
  const view = new DataView(chunk.buffer);

  view.setUint32(0, chunkData.length);
  chunk.set(typeBytes, 4);
  chunk.set(chunkData, 8);
  view.setUint32(8 + chunkData.length, crc32(concatUint8Arrays([typeBytes, chunkData])));

  return chunk;
}

function findIendOffset(bytes: Uint8Array): number {
  if (!hasPngSignature(bytes)) {
    throw new Error('Invalid PNG signature');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = PNG_SIGNATURE.length;

  while (offset + 12 <= bytes.length) {
    const chunkLength = view.getUint32(offset);
    const chunkType = decodeUtf8(bytes.slice(offset + 4, offset + 8));

    if (chunkType === 'IEND') {
      return offset;
    }

    offset += 12 + chunkLength;
  }

  throw new Error('PNG file is missing an IEND chunk');
}

function stripExistingCharaTextChunks(bytes: Uint8Array): Uint8Array {
  if (!hasPngSignature(bytes)) {
    throw new Error('Invalid PNG signature');
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts: Uint8Array[] = [bytes.slice(0, PNG_SIGNATURE.length)];
  let offset = PNG_SIGNATURE.length;

  while (offset + 12 <= bytes.length) {
    const chunkLength = view.getUint32(offset);
    const chunkType = decodeUtf8(bytes.slice(offset + 4, offset + 8));
    const chunkEnd = offset + 12 + chunkLength;
    const chunkBytes = bytes.slice(offset, chunkEnd);

    let keepChunk = true;
    if (chunkType === 'tEXt') {
      const chunkData = bytes.slice(offset + 8, offset + 8 + chunkLength);
      const separatorIndex = chunkData.indexOf(0);
      if (separatorIndex !== -1) {
        const keyword = decodeUtf8(chunkData.slice(0, separatorIndex));
        if (keyword === 'chara') {
          keepChunk = false;
        }
      }
    }

    if (keepChunk) {
      parts.push(chunkBytes);
    }

    offset = chunkEnd;
    if (chunkType === 'IEND') {
      break;
    }
  }

  return concatUint8Arrays(parts);
}

export function hasPngSignature(bytes: Uint8Array): boolean {
  if (bytes.length < PNG_SIGNATURE.length) {
    return false;
  }

  for (let index = 0; index < PNG_SIGNATURE.length; index += 1) {
    if (bytes[index] !== PNG_SIGNATURE[index]) {
      return false;
    }
  }

  return true;
}

export function extractPngCharaChunk(buffer: ArrayBuffer): string | null {
  const bytes = new Uint8Array(buffer);
  if (!hasPngSignature(bytes)) {
    return null;
  }

  const view = new DataView(buffer);
  let offset = PNG_SIGNATURE.length;

  while (offset + 12 <= bytes.length) {
    const chunkLength = view.getUint32(offset);
    const chunkType = decodeUtf8(bytes.slice(offset + 4, offset + 8));

    if (chunkType === 'tEXt') {
      const chunkData = bytes.slice(offset + 8, offset + 8 + chunkLength);
      const separatorIndex = chunkData.indexOf(0);

      if (separatorIndex !== -1) {
        const keyword = decodeUtf8(chunkData.slice(0, separatorIndex));
        if (keyword === 'chara') {
          const textBytes = chunkData.slice(separatorIndex + 1);
          const decoded = decodeBase64ToBytes(decodeUtf8(textBytes));
          return decoded ? decodeUtf8(decoded) : null;
        }
      }
    }

    offset += 12 + chunkLength;
    if (chunkType === 'IEND') {
      break;
    }
  }

  return null;
}

export function pngBytesToDataUrl(bytes: Uint8Array): string {
  return `data:image/png;base64,${encodeBytesToBase64(bytes)}`;
}

export function parseEmbeddedPngBytes(value: string | undefined): Uint8Array | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const dataUrlMatch = trimmed.match(/^data:image\/png;base64,(.+)$/i);
  if (dataUrlMatch?.[1]) {
    const decoded = decodeBase64ToBytes(dataUrlMatch[1]);
    return decoded && hasPngSignature(decoded) ? decoded : null;
  }

  const decoded = decodeBase64ToBytes(trimmed);
  return decoded && hasPngSignature(decoded) ? decoded : null;
}

export function buildPngCardBytes(baseImageBytes: Uint8Array, cardJsonText: string): Uint8Array {
  if (!hasPngSignature(baseImageBytes)) {
    throw new Error('Draft image must be a valid PNG file');
  }

  const normalizedBase = stripExistingCharaTextChunks(baseImageBytes);

  const encodedJson = encodeBytesToBase64(encodeUtf8(cardJsonText));
  const textChunk = createChunk(
    'tEXt',
    concatUint8Arrays([encodeUtf8('chara'), new Uint8Array([0]), encodeUtf8(encodedJson)]),
  );

  const iendOffset = findIendOffset(normalizedBase);
  return concatUint8Arrays([normalizedBase.slice(0, iendOffset), textChunk, normalizedBase.slice(iendOffset)]);
}
