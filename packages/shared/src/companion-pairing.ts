export const DESKTOP_COMPANION_PAIRING_SCHEME = 'eidolon-simulacra://pair';
export const LEGACY_DESKTOP_COMPANION_PAIRING_SCHEME = 'eidolon-companion://pair';

const DESKTOP_COMPANION_PAIRING_PREFIXES = [
  DESKTOP_COMPANION_PAIRING_SCHEME,
  `${DESKTOP_COMPANION_PAIRING_SCHEME.replace('://', ':///')}`,
  LEGACY_DESKTOP_COMPANION_PAIRING_SCHEME,
  `${LEGACY_DESKTOP_COMPANION_PAIRING_SCHEME.replace('://', ':///')}`,
];

export interface DesktopCompanionPairingRecord {
  url: string;
  pairCode: string;
  deviceId?: string;
  name?: string;
}

function normalizePairingRecord(record: DesktopCompanionPairingRecord): DesktopCompanionPairingRecord {
  const url = normalizeUrl(record.url);
  const pairCode = normalizePairCode(record.pairCode);
  const deviceId = typeof record.deviceId === 'string' ? record.deviceId.trim() : '';
  const name = typeof record.name === 'string' ? record.name.trim() : '';

  if (!url || !pairCode) {
    throw new Error('Desktop companion pairing requires both a URL and pair code.');
  }

  return {
    url,
    pairCode,
    ...(deviceId ? { deviceId } : {}),
    ...(name ? { name } : {}),
  };
}

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function normalizePairCode(value: string): string {
  return value.trim().toUpperCase();
}

function encodeQueryComponent(value: string): string {
  return encodeURIComponent(value);
}

function decodeQueryComponent(value: string): string {
  return decodeURIComponent(value.replace(/\+/g, ' '));
}

function buildPairingQuery(entries: Array<[string, string]>): string {
  return entries.map(([key, value]) => `${encodeQueryComponent(key)}=${encodeQueryComponent(value)}`).join('&');
}

function parsePairingQuery(query: string): Record<string, string> {
  const params: Record<string, string> = {};

  for (const segment of query.split('&')) {
    if (!segment) {
      continue;
    }

    const [rawKey, ...rawValueParts] = segment.split('=');
    if (!rawKey) {
      continue;
    }

    const key = decodeQueryComponent(rawKey);
    if (!key || key in params) {
      continue;
    }

    params[key] = decodeQueryComponent(rawValueParts.join('='));
  }

  return params;
}

export function buildDesktopCompanionPairingLink(record: DesktopCompanionPairingRecord): string {
  const normalized = normalizePairingRecord(record);

  const query = buildPairingQuery([
    ['url', normalized.url],
    ['code', normalized.pairCode],
    ...(normalized.deviceId ? [['deviceId', normalized.deviceId] as [string, string]] : []),
    ...(normalized.name ? [['name', normalized.name] as [string, string]] : []),
  ]);

  return `${DESKTOP_COMPANION_PAIRING_SCHEME}?${query}`;
}

export function buildDesktopCompanionPairingPayload(record: DesktopCompanionPairingRecord): string {
  return JSON.stringify(normalizePairingRecord(record));
}

export function parseDesktopCompanionPairingLink(input: string): DesktopCompanionPairingRecord | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  if (DESKTOP_COMPANION_PAIRING_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    try {
      const query = trimmed.split('?')[1] || '';
      const params = parsePairingQuery(query);
      const url = normalizeUrl(params.url || '');
      const pairCode = normalizePairCode(params.code || '');
      const deviceId = (params.deviceId || '').trim();
      const name = (params.name || '').trim();
      return url && pairCode
        ? {
            url,
            pairCode,
            ...(deviceId ? { deviceId } : {}),
            ...(name ? { name } : {}),
          }
        : null;
    } catch {
      return null;
    }
  }

  try {
    const parsed = JSON.parse(trimmed) as {
      url?: unknown;
      pairCode?: unknown;
      pair_code?: unknown;
      deviceId?: unknown;
      device_id?: unknown;
      name?: unknown;
    };
    const url = typeof parsed.url === 'string' ? normalizeUrl(parsed.url) : '';
    const pairCodeSource =
      typeof parsed.pairCode === 'string'
        ? parsed.pairCode
        : typeof parsed.pair_code === 'string'
          ? parsed.pair_code
          : '';
    const pairCode = normalizePairCode(pairCodeSource);
    const deviceIdSource =
      typeof parsed.deviceId === 'string'
        ? parsed.deviceId
        : typeof parsed.device_id === 'string'
          ? parsed.device_id
          : '';
    const deviceId = deviceIdSource.trim();
    const name = typeof parsed.name === 'string' ? parsed.name.trim() : '';
    return url && pairCode
      ? {
          url,
          pairCode,
          ...(deviceId ? { deviceId } : {}),
          ...(name ? { name } : {}),
        }
      : null;
  } catch {
    return null;
  }
}
