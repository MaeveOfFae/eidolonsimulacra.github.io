import { describe, expect, it } from 'vitest';
import { APIError } from '@char-gen/shared';
import { getErrorMessage } from './errors';

describe('getErrorMessage', () => {
  it('prefers the APIError message', () => {
    expect(getErrorMessage(new APIError(400, 'Draft not found'), 'fallback')).toBe('Draft not found');
  });

  it('falls back to a standard Error message', () => {
    expect(getErrorMessage(new Error('Network unavailable'), 'fallback')).toBe('Network unavailable');
  });

  it('reads a string detail before error and message', () => {
    expect(getErrorMessage({ detail: 'detail wins', error: 'error loses', message: 'message loses' }, 'fallback')).toBe(
      'detail wins',
    );
  });

  it('reads an error field when detail is absent', () => {
    expect(getErrorMessage({ error: 'error wins', message: 'message loses' }, 'fallback')).toBe('error wins');
  });

  it('reads a message field when detail and error are absent', () => {
    expect(getErrorMessage({ message: 'message wins' }, 'fallback')).toBe('message wins');
  });

  it('ignores blank string fields', () => {
    expect(getErrorMessage({ detail: '   ', error: '', message: '   ' }, 'fallback')).toBe('fallback');
  });

  it('uses the fallback for unknown values', () => {
    expect(getErrorMessage(undefined, 'fallback')).toBe('fallback');
    expect(getErrorMessage(null, 'fallback')).toBe('fallback');
    expect(getErrorMessage(42, 'fallback')).toBe('fallback');
    expect(getErrorMessage({ detail: 123 }, 'fallback')).toBe('fallback');
  });

  it('uses the fallback for an empty Error message', () => {
    expect(getErrorMessage(new Error(''), 'fallback')).toBe('fallback');
  });
});
