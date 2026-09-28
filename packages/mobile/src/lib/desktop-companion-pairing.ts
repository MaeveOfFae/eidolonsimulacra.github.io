import { parseDesktopCompanionPairingLink, type DesktopCompanionPairingRecord } from '@char-gen/shared';
import {
  saveRememberedDesktopCompanion,
  updateStoredDesktopCompanionSettings,
  type RememberedDesktopCompanion,
} from '../storage/device-config';

export interface AppliedDesktopCompanionPairingLink {
  pairing: DesktopCompanionPairingRecord;
  rememberedCompanions: RememberedDesktopCompanion[];
}

export function applyDesktopCompanionPairingLink(input: string): AppliedDesktopCompanionPairingLink | null {
  const pairing = parseDesktopCompanionPairingLink(input);
  if (!pairing) {
    return null;
  }

  updateStoredDesktopCompanionSettings({
    url: pairing.url,
    pair_code: pairing.pairCode,
  });

  const rememberedCompanions = saveRememberedDesktopCompanion({
    id: pairing.deviceId,
    name: pairing.name || undefined,
    url: pairing.url,
    pair_code: pairing.pairCode,
  });

  return {
    pairing,
    rememberedCompanions,
  };
}
