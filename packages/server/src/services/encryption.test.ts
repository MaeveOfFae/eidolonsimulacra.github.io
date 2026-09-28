import { describe, expect, it } from 'vitest';
import { decryptApiKeys, encryptApiKeys } from './encryption.js';

describe('api key encryption', () => {
  it('round-trips an api key map', () => {
    const apiKeys = { openai: 'sk-test-123', anthropic: 'sk-ant-456' };
    const { encrypted, nonce } = encryptApiKeys(apiKeys);

    expect(decryptApiKeys(encrypted, nonce)).toEqual(apiKeys);
  });

  it('handles an empty api key map', () => {
    const { encrypted, nonce } = encryptApiKeys({});

    expect(decryptApiKeys(encrypted, nonce)).toEqual({});
  });

  it('uses a fresh nonce and ciphertext for each call', () => {
    const apiKeys = { openai: 'sk-test-123' };
    const first = encryptApiKeys(apiKeys);
    const second = encryptApiKeys(apiKeys);

    expect(first.nonce.equals(second.nonce)).toBe(false);
    expect(first.encrypted.equals(second.encrypted)).toBe(false);
  });

  it('rejects a tampered payload instead of returning wrong data', () => {
    const { encrypted, nonce } = encryptApiKeys({ openai: 'sk-test-123' });
    const tampered = Buffer.from(encrypted);
    tampered[tampered.length - 1] = tampered[tampered.length - 1] ^ 0xff;

    expect(() => decryptApiKeys(tampered, nonce)).toThrow();
  });
});
