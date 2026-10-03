/**
 * Usage records and model pricing for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.6.2). Records live in `UsageStorage`
 * (IndexedDB in the browser, SQLite on desktop, capped at the newest 5,000
 * calls); pricing entries are user-entered per-model per-1M-token rates
 * persisted through the pricing store. Behavior is pinned by the Insights
 * component tests and `usage-db`/`pricing-store` suites below this module.
 */

import type { ModelPricing, UsageFilter, UsageRecord, UsageSummarizeOptions, UsageSummary } from '@char-gen/shared';
import { UsageStorage } from '../storage/usage-db.js';
import {
  deleteModelPricing as removeModelPricing,
  getModelPricing as readModelPricing,
  saveModelPricing as writeModelPricing,
  type SaveModelPricingInput,
} from './pricing-store.js';

export function getUsageSummary(options: UsageSummarizeOptions = {}): Promise<UsageSummary> {
  return UsageStorage.summarize(options);
}

export function getUsageRecords(filter: UsageFilter = {}): Promise<UsageRecord[]> {
  return UsageStorage.list(filter);
}

export function clearUsageRecords(): Promise<void> {
  return UsageStorage.clear();
}

export function getModelPricing(): ModelPricing[] {
  return readModelPricing();
}

export function saveModelPricing(input: SaveModelPricingInput): ModelPricing | null {
  return writeModelPricing(input);
}

export function deleteModelPricing(id: string): void {
  removeModelPricing(id);
}
