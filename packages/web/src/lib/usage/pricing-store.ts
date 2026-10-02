/**
 * User-editable per-model pricing (what the user actually pays, per 1M tokens).
 *
 * Same pattern as saved searches and scenario presets: records persist through
 * the shared persistence layer (browser localStorage, desktop app data on
 * Tauri), normalize through the shared contract, and a changed event lets
 * components react without prop drilling.
 */

import { createModelPricingId, normalizeModelPricing, upsertModelPricing, type ModelPricing } from '@char-gen/shared';
import { readPersistedJson, writePersistedJson } from '../persistence/storage.js';

const MODEL_PRICING_STORAGE_KEY = 'eidolon.web.usage.modelPricing';

export const MODEL_PRICING_CHANGED_EVENT = 'eidolon:model-pricing-changed';

function emitModelPricingChanged(records: ModelPricing[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(MODEL_PRICING_CHANGED_EVENT, { detail: { count: records.length } }));
}

export function getModelPricing(): ModelPricing[] {
  const raw = readPersistedJson<unknown>(MODEL_PRICING_STORAGE_KEY, []);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map((entry) => normalizeModelPricing(entry)).filter((entry): entry is ModelPricing => entry !== null);
}

function writeModelPricing(records: ModelPricing[]): void {
  writePersistedJson(MODEL_PRICING_STORAGE_KEY, [], records);
  emitModelPricingChanged(records);
}

export interface SaveModelPricingInput {
  /** Existing id when editing; omitted to create a new entry. */
  id?: string;
  model: string;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  currency: string;
}

/**
 * Create or update a pricing entry. Returns the normalized record, or null
 * when the input is invalid (blank model, negative or non-finite rates).
 */
export function saveModelPricing(input: SaveModelPricingInput): ModelPricing | null {
  const existing = input.id ? getModelPricing().find((entry) => entry.id === input.id) : undefined;

  const candidate = normalizeModelPricing({
    id: input.id?.trim() || createModelPricingId(),
    model: input.model,
    inputCostPerMillionTokens: input.inputCostPerMillionTokens,
    outputCostPerMillionTokens: input.outputCostPerMillionTokens,
    currency: input.currency,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  });

  if (!candidate) {
    return null;
  }

  writeModelPricing(upsertModelPricing(getModelPricing(), candidate));

  return candidate;
}

export function deleteModelPricing(id: string): void {
  writeModelPricing(getModelPricing().filter((entry) => entry.id !== id));
}
