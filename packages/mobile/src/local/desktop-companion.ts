import type { DesktopCompanionSyncDomain } from '@char-gen/shared';
import { validateDesktopCompanionUrl } from '../storage/device-config';

const PAIR_CODE_HEADER = 'X-Eidolon-Pair-Code';

interface DesktopCompanionRequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface DesktopCompanionResponse {
  ok: boolean;
  status: number;
  text: string;
}

export interface DesktopCompanionConnectionProbe {
  reachable: boolean;
  pairCodeAccepted: boolean;
  publishedSyncAvailable: boolean;
  message: string;
}

function normalizeCompanionUrl(value: string): string {
  return validateDesktopCompanionUrl(value);
}

function normalizePairCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error('Pair code is required.');
  }

  return trimmed;
}

function extractResponseError(response: DesktopCompanionResponse, fallback: string): string {
  try {
    const parsed = JSON.parse(response.text) as { message?: string; error?: string };
    return parsed.message || parsed.error || fallback;
  } catch {
    return fallback;
  }
}

function buildDesktopCompanionNetworkError(error: unknown, fallback: string): Error {
  return new Error(
    error instanceof Error && error.message
      ? `Failed to reach the desktop companion. Confirm the phone and desktop are on the same network, the LAN URL is correct, and the mobile build allows local HTTP connections. ${error.message}`
      : fallback,
  );
}

function requestDesktopCompanion(
  url: string,
  init: DesktopCompanionRequestInit,
  fallback: string,
): Promise<DesktopCompanionResponse> {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open(init.method || 'GET', url, true);

      Object.entries(init.headers ?? {}).forEach(([name, value]) => {
        xhr.setRequestHeader(name, value);
      });

      xhr.onload = () => {
        resolve({
          ok: xhr.status >= 200 && xhr.status < 300,
          status: xhr.status,
          text: xhr.responseText ?? '',
        });
      };

      xhr.onerror = () => {
        reject(buildDesktopCompanionNetworkError(new Error('Network request failed'), fallback));
      };

      xhr.ontimeout = () => {
        reject(buildDesktopCompanionNetworkError(new Error('Network request timed out'), fallback));
      };

      xhr.send(init.body ?? null);
    } catch (error) {
      reject(buildDesktopCompanionNetworkError(error, fallback));
    }
  });
}

export async function fetchWorkspaceBundleFromDesktopCompanion(url: string, pairCode: string): Promise<string> {
  const normalizedUrl = normalizeCompanionUrl(url);
  const normalizedPairCode = normalizePairCode(pairCode);
  const response = await requestDesktopCompanion(
    `${normalizedUrl}/workspace-bundle`,
    {
      method: 'GET',
      headers: {
        [PAIR_CODE_HEADER]: normalizedPairCode,
      },
    },
    'Failed to reach the desktop companion.',
  );

  if (!response.ok) {
    throw new Error(extractResponseError(response, `Desktop companion request failed with status ${response.status}`));
  }

  return response.text;
}

export async function sendWorkspaceBundleToDesktopCompanion(
  url: string,
  pairCode: string,
  bundleJson: string,
): Promise<void> {
  const normalizedUrl = normalizeCompanionUrl(url);
  const normalizedPairCode = normalizePairCode(pairCode);
  const response = await requestDesktopCompanion(
    `${normalizedUrl}/workspace-bundle`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [PAIR_CODE_HEADER]: normalizedPairCode,
      },
      body: bundleJson,
    },
    'Failed to reach the desktop companion.',
  );

  if (!response.ok) {
    throw new Error(extractResponseError(response, `Desktop companion request failed with status ${response.status}`));
  }
}

export async function fetchDesktopCompanionSyncManifest(url: string, pairCode: string): Promise<string> {
  const normalizedUrl = normalizeCompanionUrl(url);
  const normalizedPairCode = normalizePairCode(pairCode);
  const response = await requestDesktopCompanion(
    `${normalizedUrl}/sync-manifest`,
    {
      method: 'GET',
      headers: {
        [PAIR_CODE_HEADER]: normalizedPairCode,
      },
    },
    'Failed to reach the desktop companion.',
  );

  if (!response.ok) {
    throw new Error(extractResponseError(response, `Desktop companion request failed with status ${response.status}`));
  }

  return response.text;
}

export async function fetchDesktopCompanionSyncDomain(
  url: string,
  pairCode: string,
  domain: DesktopCompanionSyncDomain,
): Promise<string> {
  const normalizedUrl = normalizeCompanionUrl(url);
  const normalizedPairCode = normalizePairCode(pairCode);
  const response = await requestDesktopCompanion(
    `${normalizedUrl}/sync/${domain}`,
    {
      method: 'GET',
      headers: {
        [PAIR_CODE_HEADER]: normalizedPairCode,
      },
    },
    'Failed to reach the desktop companion.',
  );

  if (!response.ok) {
    throw new Error(extractResponseError(response, `Desktop companion request failed with status ${response.status}`));
  }

  return response.text;
}

export async function sendDesktopCompanionSyncState(
  url: string,
  pairCode: string,
  syncStateJson: string,
): Promise<void> {
  const normalizedUrl = normalizeCompanionUrl(url);
  const normalizedPairCode = normalizePairCode(pairCode);
  const response = await requestDesktopCompanion(
    `${normalizedUrl}/sync-state`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [PAIR_CODE_HEADER]: normalizedPairCode,
      },
      body: syncStateJson,
    },
    'Failed to reach the desktop companion.',
  );

  if (!response.ok) {
    throw new Error(extractResponseError(response, `Desktop companion request failed with status ${response.status}`));
  }
}

export async function fetchDesktopCompanionSyncStateText(
  url: string,
  pairCode: string,
  domains: readonly DesktopCompanionSyncDomain[] = ['drafts', 'config', 'templates', 'blueprints'],
): Promise<string> {
  const manifestJson = await fetchDesktopCompanionSyncManifest(url, pairCode);
  const manifestResponse = JSON.parse(manifestJson) as {
    payload?: {
      domains?: Record<string, { available?: boolean }>;
    };
  };
  const availableDomains = manifestResponse.payload?.domains ?? {};
  const syncState = {
    app: 'eidolon-simulacra',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    manifest: manifestResponse.payload,
    payload: {} as Record<string, unknown>,
  };

  for (const domain of domains) {
    if (!availableDomains[domain]?.available) {
      continue;
    }

    const domainJson = await fetchDesktopCompanionSyncDomain(url, pairCode, domain);
    const parsedDomainResponse = JSON.parse(domainJson) as { payload?: unknown };
    if (parsedDomainResponse.payload !== undefined) {
      syncState.payload[domain] = parsedDomainResponse.payload;
    }
  }

  return JSON.stringify(syncState);
}

export async function probeDesktopCompanionConnection(
  url: string,
  pairCode: string,
): Promise<DesktopCompanionConnectionProbe> {
  const normalizedUrl = normalizeCompanionUrl(url);
  const normalizedPairCode = normalizePairCode(pairCode);

  const healthResponse = await requestDesktopCompanion(
    `${normalizedUrl}/health`,
    {
      method: 'GET',
    },
    'Failed to reach the desktop companion.',
  );

  if (!healthResponse.ok) {
    throw new Error(
      extractResponseError(
        healthResponse,
        `Desktop companion health check failed with status ${healthResponse.status}`,
      ),
    );
  }

  const manifestResponse = await requestDesktopCompanion(
    `${normalizedUrl}/sync-manifest`,
    {
      method: 'GET',
      headers: {
        [PAIR_CODE_HEADER]: normalizedPairCode,
      },
    },
    'Failed to reach the desktop companion.',
  );

  if (manifestResponse.ok) {
    return {
      reachable: true,
      pairCodeAccepted: true,
      publishedSyncAvailable: true,
      message: 'Desktop companion reachable. Pair code accepted. A published desktop sync snapshot is ready to pull.',
    };
  }

  const message = extractResponseError(
    manifestResponse,
    `Desktop companion request failed with status ${manifestResponse.status}`,
  );
  if (manifestResponse.status === 401) {
    return {
      reachable: true,
      pairCodeAccepted: false,
      publishedSyncAvailable: false,
      message:
        'Desktop companion reachable, but the pair code was rejected. Copy the current pair code from the desktop app and try again.',
    };
  }

  if (manifestResponse.status === 404) {
    return {
      reachable: true,
      pairCodeAccepted: true,
      publishedSyncAvailable: false,
      message:
        'Desktop companion reachable. Pair code accepted. Publish Live Sync from the desktop app before pulling from PC.',
    };
  }

  throw new Error(message);
}
