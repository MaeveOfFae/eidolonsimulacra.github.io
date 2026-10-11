import { describe, expect, it } from 'vitest';
import {
  CANON_LOCK_TARGET_KINDS,
  buildCanonLockConstraintLines,
  formatCanonLockLine,
  formatCanonLockScope,
  normalizeCanonLockStatement,
  normalizeCanonLockTargetKind,
} from './canon-locks';

describe('canon lock statements', () => {
  it('collapses whitespace to one trimmed line', () => {
    expect(normalizeCanonLockStatement('  Vesna keeps   her surname\n\nVale  ')).toBe('Vesna keeps her surname Vale');
    expect(normalizeCanonLockStatement('')).toBe('');
    expect(normalizeCanonLockStatement(42)).toBe('');
  });
});

describe('canon lock target kinds', () => {
  it('accepts the known kinds and defaults everything else to world', () => {
    expect(CANON_LOCK_TARGET_KINDS).toEqual(['world', 'character', 'faction', 'location', 'timeline']);
    expect(normalizeCanonLockTargetKind('character')).toBe('character');
    expect(normalizeCanonLockTargetKind('nonsense')).toBe('world');
    expect(normalizeCanonLockTargetKind(undefined)).toBe('world');
  });
});

describe('canon lock formatting', () => {
  it('prints the world scope without a label', () => {
    expect(formatCanonLockScope({ targetKind: 'world', targetLabel: 'Ashfall' })).toBe('World');
  });

  it('prints a scoped lock with its captured label, falling back to the kind', () => {
    expect(formatCanonLockScope({ targetKind: 'character', targetLabel: ' Vesna ' })).toBe('Vesna (character)');
    expect(formatCanonLockScope({ targetKind: 'faction' })).toBe('faction');
  });

  it('formats a full constraint line', () => {
    expect(formatCanonLockLine({ targetKind: 'character', targetLabel: 'Vesna', statement: 'surname is Vale' })).toBe(
      'Vesna (character): surname is Vale',
    );
    expect(formatCanonLockLine({ targetKind: 'world', statement: 'magic always costs blood' })).toBe(
      'World: magic always costs blood',
    );
  });
});

describe('buildCanonLockConstraintLines', () => {
  it('drops blank statements and de-duplicates while preserving order', () => {
    const lines = buildCanonLockConstraintLines([
      { targetKind: 'world', statement: 'magic costs blood' },
      { targetKind: 'character', targetLabel: 'Vesna', statement: 'surname is Vale' },
      { targetKind: 'world', statement: '   ' },
      { targetKind: 'character', targetLabel: 'Vesna', statement: 'surname is Vale' },
    ]);

    expect(lines).toEqual(['World: magic costs blood', 'Vesna (character): surname is Vale']);
  });

  it('returns an empty list when there are no usable locks', () => {
    expect(buildCanonLockConstraintLines([])).toEqual([]);
    expect(buildCanonLockConstraintLines([{ targetKind: 'world', statement: '' }])).toEqual([]);
  });
});
