import { afterEach, describe, expect, it, vi } from 'vitest';
import { MODEL_PRICING_CHANGED_EVENT, deleteModelPricing, getModelPricing, saveModelPricing } from './pricing-store';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('model pricing store', () => {
  it('starts empty and ignores corrupt storage', () => {
    expect(getModelPricing()).toEqual([]);

    localStorage.setItem('eidolon.web.usage.modelPricing', '{not json');
    expect(getModelPricing()).toEqual([]);
  });

  it('saves an entry, emits the changed event, and reads it back normalized', () => {
    const listener = vi.fn();
    window.addEventListener(MODEL_PRICING_CHANGED_EVENT, listener);

    const saved = saveModelPricing({
      model: ' gpt-4o ',
      inputCostPer1kTokens: 0.0025,
      outputCostPer1kTokens: 0.01,
      currency: 'usd',
    });

    expect(saved).toMatchObject({ model: 'gpt-4o', currency: 'USD', inputCostPer1kTokens: 0.0025 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getModelPricing()).toEqual([saved]);
  });

  it('rejects invalid input without writing', () => {
    expect(
      saveModelPricing({ model: '   ', inputCostPer1kTokens: 1, outputCostPer1kTokens: 1, currency: 'USD' }),
    ).toBeNull();
    expect(
      saveModelPricing({ model: 'gpt-4o', inputCostPer1kTokens: -1, outputCostPer1kTokens: 1, currency: 'USD' }),
    ).toBeNull();
    expect(getModelPricing()).toEqual([]);
  });

  it('updates an existing entry by id, keeping createdAt, and deletes by id', () => {
    const first = saveModelPricing({
      model: 'gpt-4o',
      inputCostPer1kTokens: 0.0025,
      outputCostPer1kTokens: 0.01,
      currency: 'USD',
    });
    expect(first).not.toBeNull();

    const updated = saveModelPricing({
      id: first!.id,
      model: 'gpt-4o',
      inputCostPer1kTokens: 0.005,
      outputCostPer1kTokens: 0.02,
      currency: 'USD',
    });

    expect(updated).toMatchObject({ id: first!.id, inputCostPer1kTokens: 0.005, createdAt: first!.createdAt });
    expect(getModelPricing()).toHaveLength(1);

    deleteModelPricing(first!.id);
    expect(getModelPricing()).toEqual([]);
  });

  it('drops malformed stored records on read', () => {
    localStorage.setItem(
      'eidolon.web.usage.modelPricing',
      JSON.stringify([
        { id: 'x' },
        {
          id: 'ok',
          model: 'gpt-4o',
          inputCostPer1kTokens: 1,
          outputCostPer1kTokens: 2,
          currency: 'USD',
          createdAt: '2026-09-01T00:00:00.000Z',
        },
      ]),
    );

    const all = getModelPricing();
    expect(all).toHaveLength(1);
    expect(all[0]?.model).toBe('gpt-4o');
  });
});
