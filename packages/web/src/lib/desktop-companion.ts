import { buildDesktopCompanionPairingLink, buildDesktopCompanionPairingPayload } from '@char-gen/shared';
import type { DesktopCompanionIdentity } from './desktop-companion-settings';
import { isDesktopRuntime } from './runtime';

export interface DesktopCompanionStatus {
  running: boolean;
  bindHost: string;
  port: number;
  pairCode: string;
  localIp: string | null;
  localUrl: string | null;
  outgoingBundleAvailable: boolean;
  outgoingBundleBytes: number;
  outgoingBundlePublishedAtMs: number | null;
  incomingBundleAvailable: boolean;
  incomingBundleBytes: number;
  incomingBundleReceivedAtMs: number | null;
  lastError: string | null;
}

const EMPTY_STATUS: DesktopCompanionStatus = {
  running: false,
  bindHost: '0.0.0.0',
  port: 0,
  pairCode: '',
  localIp: null,
  localUrl: null,
  outgoingBundleAvailable: false,
  outgoingBundleBytes: 0,
  outgoingBundlePublishedAtMs: null,
  incomingBundleAvailable: false,
  incomingBundleBytes: 0,
  incomingBundleReceivedAtMs: null,
  lastError: null,
};

async function invokeDesktopCompanion<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isDesktopRuntime()) {
    throw new Error('Desktop companion commands are only available in the desktop app.');
  }

  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
}

export async function getDesktopCompanionStatus(): Promise<DesktopCompanionStatus> {
  if (!isDesktopRuntime()) {
    return EMPTY_STATUS;
  }

  return invokeDesktopCompanion<DesktopCompanionStatus>('desktop_companion_status');
}

export async function rotateDesktopCompanionPairCode(): Promise<DesktopCompanionStatus> {
  return invokeDesktopCompanion<DesktopCompanionStatus>('desktop_companion_rotate_pair_code');
}

export async function publishWorkspaceBundleToDesktopCompanion(bundleJson: string): Promise<DesktopCompanionStatus> {
  return invokeDesktopCompanion<DesktopCompanionStatus>('desktop_companion_publish_workspace_bundle', { bundleJson });
}

export async function takeIncomingWorkspaceBundleFromDesktopCompanion(): Promise<string | null> {
  return invokeDesktopCompanion<string | null>('desktop_companion_take_incoming_workspace_bundle');
}

export async function peekIncomingWorkspaceBundleFromDesktopCompanion(): Promise<string | null> {
  return invokeDesktopCompanion<string | null>('desktop_companion_peek_incoming_workspace_bundle');
}

export function buildDesktopCompanionPairingText(
  status: Pick<DesktopCompanionStatus, 'localUrl' | 'pairCode'>,
  identity?: Partial<DesktopCompanionIdentity>,
): string | null {
  if (!status.localUrl || !status.pairCode) {
    return null;
  }

  return buildDesktopCompanionPairingLink({
    url: status.localUrl,
    pairCode: status.pairCode,
    ...(identity?.deviceId ? { deviceId: identity.deviceId } : {}),
    ...(identity?.name ? { name: identity.name } : {}),
  });
}

export function buildDesktopCompanionPairingQrText(
  status: Pick<DesktopCompanionStatus, 'localUrl' | 'pairCode'>,
  identity?: Partial<DesktopCompanionIdentity>,
): string | null {
  if (!status.localUrl || !status.pairCode) {
    return null;
  }

  return buildDesktopCompanionPairingPayload({
    url: status.localUrl,
    pairCode: status.pairCode,
    ...(identity?.deviceId ? { deviceId: identity.deviceId } : {}),
    ...(identity?.name ? { name: identity.name } : {}),
  });
}
