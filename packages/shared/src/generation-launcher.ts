/**
 * Generation launcher presets and constraints.
 *
 * A scenario preset bundles the launcher's own settings — template, content
 * mode, and additional instruction lines — under a name so a recurring
 * workflow (fast draft, high-structure pack, art-focused run) is one click.
 * The constraint builder turns a data-driven catalog (tone, pacing, style,
 * content handling, framing) into deterministic additional-instruction lines
 * that ride the same `additional_instructions` path the launcher already
 * sends; there is deliberately no second instruction channel.
 */

import type { ContentMode } from './types';

const CONTENT_MODES: readonly ContentMode[] = ['SFW', 'NSFW', 'Platform-Safe', 'Auto'];

export interface ScenarioPresetRecord {
  id: string;
  name: string;
  description?: string;
  templateName?: string;
  mode?: ContentMode;
  additionalInstructions: string[];
  createdAt: string;
}

export const MAX_SCENARIO_PRESETS = 30;

export function createScenarioPresetId(): string {
  return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Trim, drop empties, and de-duplicate instruction lines. */
export function normalizeInstructionLines(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const lines: string[] = [];

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }
    const trimmed = entry.trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    lines.push(trimmed);
  }

  return lines;
}

export function normalizeScenarioPresetRecord(value: unknown): ScenarioPresetRecord | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const id = typeof raw.id === 'string' && raw.id.trim().length > 0 ? raw.id.trim() : null;
  const name = typeof raw.name === 'string' && raw.name.trim().length > 0 ? raw.name.trim() : null;

  if (!id || !name) {
    return null;
  }

  const mode = CONTENT_MODES.includes(raw.mode as ContentMode) ? (raw.mode as ContentMode) : undefined;
  const createdAt =
    typeof raw.createdAt === 'string' && !Number.isNaN(new Date(raw.createdAt).getTime())
      ? raw.createdAt
      : new Date().toISOString();

  const preset: ScenarioPresetRecord = {
    id,
    name,
    additionalInstructions: normalizeInstructionLines(raw.additionalInstructions ?? raw.additional_instructions),
    createdAt,
  };

  if (typeof raw.description === 'string' && raw.description.trim()) {
    preset.description = raw.description.trim();
  }
  if (typeof raw.templateName === 'string' && raw.templateName.trim()) {
    preset.templateName = raw.templateName.trim();
  }
  if (mode) {
    preset.mode = mode;
  }

  return preset;
}

/** Add or replace a preset by id, newest first, capped at `limit`. */
export function upsertScenarioPreset(
  records: readonly ScenarioPresetRecord[],
  record: ScenarioPresetRecord,
  limit: number = MAX_SCENARIO_PRESETS,
): ScenarioPresetRecord[] {
  return [record, ...records.filter((entry) => entry.id !== record.id)].slice(0, Math.max(0, limit));
}

export interface ScenarioLauncherState {
  templateName?: string;
  mode?: ContentMode;
  additionalInstructions?: string[];
}

/**
 * Apply a preset to launcher state. Template and mode only override when the
 * preset defines them; instruction lines are the preset's own baseline and
 * replace the current list (constraint-builder selections are transient and
 * re-apply on top).
 */
export function applyScenarioPreset(
  preset: ScenarioPresetRecord,
  current: ScenarioLauncherState,
): ScenarioLauncherState {
  return {
    templateName: preset.templateName ?? current.templateName,
    mode: preset.mode ?? current.mode,
    additionalInstructions: normalizeInstructionLines(preset.additionalInstructions),
  };
}

export interface ConstraintOption {
  id: string;
  label: string;
  instruction: string;
}

export interface ConstraintCategory {
  id: string;
  label: string;
  options: ConstraintOption[];
}

/**
 * Data-driven constraint catalog. Each selected option contributes exactly one
 * deterministic additional-instruction line; the catalog owns the wording so
 * the launcher UI stays a picker, not a prompt editor.
 */
export const CONSTRAINT_CATEGORIES: readonly ConstraintCategory[] = [
  {
    id: 'tone',
    label: 'Tone',
    options: [
      { id: 'dark', label: 'Dark & severe', instruction: 'Keep the tone dark and severe; do not soften outcomes.' },
      { id: 'warm', label: 'Warm & gentle', instruction: 'Keep the tone warm and gentle without losing the stakes.' },
      { id: 'wry', label: 'Wry & playful', instruction: 'Let dry wit color the narration without turning it comedic.' },
      {
        id: 'cold',
        label: 'Coldly professional',
        instruction: 'Keep the narration coldly professional and unornamented.',
      },
    ],
  },
  {
    id: 'pacing',
    label: 'Pacing',
    options: [
      { id: 'slow-burn', label: 'Slow burn', instruction: 'Escalate slowly; hold back the biggest reveals.' },
      {
        id: 'brisk',
        label: 'Brisk & eventful',
        instruction: 'Move briskly; let events drive the pacing over reflection.',
      },
      {
        id: 'measured',
        label: 'Measured & introspective',
        instruction: 'Favor measured, introspective pacing over plot momentum.',
      },
    ],
  },
  {
    id: 'style',
    label: 'Style emphasis',
    options: [
      { id: 'grounded', label: 'Grounded realism', instruction: 'Prefer grounded realism in detail and behavior.' },
      {
        id: 'theatrical',
        label: 'Heightened & theatrical',
        instruction: 'Lean into heightened, theatrical language and gesture.',
      },
      {
        id: 'minimal',
        label: 'Minimalist prose',
        instruction: 'Keep prose minimal; cut ornamentation and adjectives.',
      },
      { id: 'sensory', label: 'Rich sensory detail', instruction: 'Anchor scenes in rich, specific sensory detail.' },
    ],
  },
  {
    id: 'content-handling',
    label: 'Content handling',
    options: [
      {
        id: 'implicit-violence',
        label: 'Keep violence implicit',
        instruction: 'Keep violence implicit; imply rather than depict.',
      },
      {
        id: 'implicit-intimacy',
        label: 'Keep intimacy implicit',
        instruction: 'Keep intimacy implicit; fade before explicit detail.',
      },
      {
        id: 'subtext',
        label: 'Favor subtext',
        instruction: 'Favor subtext over statement; let meaning sit under the line.',
      },
    ],
  },
  {
    id: 'framing',
    label: 'Narrative framing',
    options: [
      {
        id: 'tension-endings',
        label: 'End scenes on tension',
        instruction: 'End every scene on unresolved tension, not closure.',
      },
      {
        id: 'user-catalyst',
        label: 'Treat {{user}} as catalyst',
        instruction: 'Treat {{user}} as the catalyst; never narrate their inner state.',
      },
      {
        id: 'dialogue-forward',
        label: 'Dialogue-forward',
        instruction: 'Prefer dialogue over exposition to carry information.',
      },
    ],
  },
];

/**
 * Compose the selected constraints into additional-instruction lines, in
 * catalog order. Unknown category or option ids are ignored, and duplicate
 * lines collapse.
 */
export function buildConstraintInstructions(selections: Readonly<Record<string, readonly string[]>>): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();

  for (const category of CONSTRAINT_CATEGORIES) {
    const selected = selections[category.id];
    if (!Array.isArray(selected)) {
      continue;
    }

    const selectedIds = new Set(selected);
    for (const option of category.options) {
      if (!selectedIds.has(option.id) || seen.has(option.instruction)) {
        continue;
      }
      seen.add(option.instruction);
      lines.push(option.instruction);
    }
  }

  return lines;
}
