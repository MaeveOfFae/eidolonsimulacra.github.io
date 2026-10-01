/**
 * Scenario presets (named launcher configurations).
 *
 * Same pattern as saved searches: records persist through the shared
 * persistence layer (browser localStorage, desktop app data on Tauri),
 * normalize through the shared contract, and a changed event lets components
 * react without prop drilling.
 */

import {
  createScenarioPresetId,
  normalizeInstructionLines,
  normalizeScenarioPresetRecord,
  upsertScenarioPreset,
  type ContentMode,
  type ScenarioPresetRecord,
} from '@char-gen/shared';
import { readPersistedJson, writePersistedJson } from '../persistence/storage.js';

const SCENARIO_PRESETS_STORAGE_KEY = 'eidolon.web.generationLauncher.scenarioPresets';

export const SCENARIO_PRESETS_CHANGED_EVENT = 'eidolon:scenario-presets-changed';

function emitScenarioPresetsChanged(records: ScenarioPresetRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(SCENARIO_PRESETS_CHANGED_EVENT, { detail: { count: records.length } }));
}

export function getScenarioPresets(): ScenarioPresetRecord[] {
  const raw = readPersistedJson<unknown>(SCENARIO_PRESETS_STORAGE_KEY, []);
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((entry) => normalizeScenarioPresetRecord(entry))
    .filter((entry): entry is ScenarioPresetRecord => entry !== null);
}

function writeScenarioPresets(records: ScenarioPresetRecord[]): void {
  writePersistedJson(SCENARIO_PRESETS_STORAGE_KEY, [], records);
  emitScenarioPresetsChanged(records);
}

export interface SaveScenarioPresetInput {
  name: string;
  description?: string;
  templateName?: string;
  mode?: ContentMode;
  additionalInstructions: string[];
}

export function saveScenarioPreset(input: SaveScenarioPresetInput): ScenarioPresetRecord | null {
  const name = input.name.trim();
  if (!name) {
    return null;
  }

  const record: ScenarioPresetRecord = {
    id: createScenarioPresetId(),
    name,
    additionalInstructions: normalizeInstructionLines(input.additionalInstructions),
    createdAt: new Date().toISOString(),
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
    ...(input.templateName?.trim() ? { templateName: input.templateName.trim() } : {}),
    ...(input.mode ? { mode: input.mode } : {}),
  };

  writeScenarioPresets(upsertScenarioPreset(getScenarioPresets(), record));

  return record;
}

export function deleteScenarioPreset(id: string): void {
  writeScenarioPresets(getScenarioPresets().filter((entry) => entry.id !== id));
}
