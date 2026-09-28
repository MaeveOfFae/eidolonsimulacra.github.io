import { describe, expect, it } from 'vitest';
import {
  DESKTOP_COMPANION_PAIRING_SCHEME,
  LEGACY_DESKTOP_COMPANION_PAIRING_SCHEME,
  buildDesktopCompanionPairingLink,
  buildDesktopCompanionPairingPayload,
  parseDesktopCompanionPairingLink,
} from './companion-pairing';

const desktopPairing = {
  url: 'http://192.168.1.20:48231/',
  pairCode: 'ab12cd34',
  deviceId: 'desktop-alpha',
  name: 'Studio PC',
};

describe('desktop companion pairing helpers', () => {
  it('builds and parses the current pairing link format', () => {
    const pairingLink = buildDesktopCompanionPairingLink(desktopPairing);

    expect(pairingLink.startsWith(`${DESKTOP_COMPANION_PAIRING_SCHEME}?`)).toBe(true);
    expect(parseDesktopCompanionPairingLink(pairingLink)).toEqual({
      url: 'http://192.168.1.20:48231',
      pairCode: 'AB12CD34',
      deviceId: 'desktop-alpha',
      name: 'Studio PC',
    });
  });

  it('builds a scan-safe JSON payload for QR codes', () => {
    const payload = buildDesktopCompanionPairingPayload(desktopPairing);

    expect(payload.startsWith('{')).toBe(true);
    expect(parseDesktopCompanionPairingLink(payload)).toEqual({
      url: 'http://192.168.1.20:48231',
      pairCode: 'AB12CD34',
      deviceId: 'desktop-alpha',
      name: 'Studio PC',
    });
  });

  it('parses legacy and triple-slash pairing links', () => {
    const query = 'url=http%3A%2F%2F192.168.1.20%3A48231%2F&code=ab12cd34&deviceId=desktop-alpha&name=Studio+PC';

    expect(parseDesktopCompanionPairingLink(`${LEGACY_DESKTOP_COMPANION_PAIRING_SCHEME}?${query}`)).toEqual({
      url: 'http://192.168.1.20:48231',
      pairCode: 'AB12CD34',
      deviceId: 'desktop-alpha',
      name: 'Studio PC',
    });
    expect(
      parseDesktopCompanionPairingLink(`${DESKTOP_COMPANION_PAIRING_SCHEME.replace('://', ':///')}?${query}`),
    ).toEqual({
      url: 'http://192.168.1.20:48231',
      pairCode: 'AB12CD34',
      deviceId: 'desktop-alpha',
      name: 'Studio PC',
    });
  });

  it('rejects missing and malformed pairing data', () => {
    expect(parseDesktopCompanionPairingLink('')).toBeNull();
    expect(parseDesktopCompanionPairingLink('{"url":"http://192.168.1.20:48231"}')).toBeNull();
    expect(
      parseDesktopCompanionPairingLink(`${DESKTOP_COMPANION_PAIRING_SCHEME}?url=http%3A%2F%2F192.168.1.20%3A48231`),
    ).toBeNull();
    expect(() => buildDesktopCompanionPairingLink({ url: '', pairCode: 'AB12CD34' })).toThrow(
      'Desktop companion pairing requires both a URL and pair code.',
    );
  });
});
