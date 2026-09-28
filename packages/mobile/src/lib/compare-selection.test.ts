import { beforeEach, describe, expect, it } from 'vitest';
import { clearMobileCompareSelection, getMobileCompareSelection, setMobileCompareSelection } from './compare-selection';

describe('mobile compare selection', () => {
  beforeEach(() => {
    clearMobileCompareSelection();
  });

  it('starts empty', () => {
    expect(getMobileCompareSelection()).toBeNull();
  });

  it('stores a copy of the supplied selection', () => {
    const selection = { character1Id: 'draft-a', character1Name: 'Aria' };
    setMobileCompareSelection(selection);

    selection.character1Name = 'mutated';

    expect(getMobileCompareSelection()).toEqual({ character1Id: 'draft-a', character1Name: 'Aria' });
    expect(getMobileCompareSelection()).not.toBe(selection);
  });

  it('clears the selection when set to null', () => {
    setMobileCompareSelection({ character1Id: 'draft-a', character1Name: 'Aria' });
    setMobileCompareSelection(null);

    expect(getMobileCompareSelection()).toBeNull();
  });

  it('clears the selection explicitly', () => {
    setMobileCompareSelection({ character1Id: 'draft-b', character1Name: 'Bex' });
    clearMobileCompareSelection();

    expect(getMobileCompareSelection()).toBeNull();
  });
});
