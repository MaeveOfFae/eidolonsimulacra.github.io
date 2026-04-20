/**
 * Prompt Builder
 * Builds LLM prompts for character generation, similarity, etc.
 */

import type {
  ChatMessage,
  ContentMode,
  Template,
} from '@char-gen/shared';
import {
  loadBlueprint,
  resolveFeatureBlueprint,
  templateToAssets,
  topologicalSort,
} from './blueprint.js';
import { resolveTemplateBlueprintContent } from '../templates/browser.js';

type JsonPromptValue = null | boolean | number | string | JsonPromptValue[] | { [key: string]: JsonPromptValue };

function buildTemplateOverrideSection(template: Template): string {
  const assets = templateToAssets(template);
  if (assets.length === 0) {
    return '';
  }

  let orderedNames: string[];
  try {
    orderedNames = topologicalSort(assets);
  } catch {
    orderedNames = assets.map((asset) => asset.name);
  }

  const orderedAssets = orderedNames
    .map((name) => assets.find((asset) => asset.name === name))
    .filter((asset): asset is NonNullable<typeof asset> => Boolean(asset));

  const lines: string[] = [];
  lines.push('\n\n## TEMPLATE OVERRIDE\n');
  lines.push('The following active template contract is authoritative. Use it instead of the fallback template order.');
  lines.push(`Template name: ${template.name}`);
  lines.push(`Template version: ${template.version}`);
  if (template.description?.trim()) {
    lines.push(`Template description: ${template.description.trim()}`);
  }
  lines.push(`Asset count: ${orderedAssets.length}`);
  lines.push('');
  lines.push('Asset output order:');
  orderedAssets.forEach((asset, index) => {
    lines.push(`${index + 1}. ${asset.name}`);
  });
  lines.push('');
  lines.push('Declared asset contract:');
  orderedAssets.forEach((asset) => {
    const dependsOn = asset.dependsOn.length > 0 ? asset.dependsOn.join(', ') : 'none';
    lines.push(`- ${asset.name}`);
    lines.push(`  - required: ${asset.required}`);
    lines.push(`  - depends_on: ${dependsOn}`);
    if (asset.blueprintFile) {
      lines.push(`  - blueprint_file: ${asset.blueprintFile}`);
    }
    if (asset.description?.trim()) {
      lines.push(`  - description: ${asset.description.trim()}`);
    }
  });

  const blueprintSections = orderedAssets
    .map((asset) => {
      const blueprintContent = resolveTemplateBlueprintContent(template.name, asset.name)?.trim();
      if (!blueprintContent) {
        return null;
      }

      return [
        '',
        `### ASSET BLUEPRINT: ${asset.name}`,
        '```md',
        blueprintContent,
        '```',
      ].join('\n');
    })
    .filter((section): section is string => Boolean(section));

  if (blueprintSections.length > 0) {
    lines.push('');
    lines.push('Resolved asset blueprints:');
    lines.push('Follow these blueprint sources exactly for structure, placeholders, control blocks, and field names.');
    lines.push(blueprintSections.join('\n'));
  }

  return lines.join('\n');
}

function getOrderedTemplateAssetNames(template?: Template): string[] {
  if (!template) {
    return [];
  }

  const assets = templateToAssets(template);
  if (assets.length === 0) {
    return [];
  }

  try {
    return topologicalSort(assets);
  } catch {
    return assets.map((asset) => asset.name);
  }
}

function buildParentSuiteSection(
  label: string,
  parentName: string,
  parentAssets: Record<string, string>,
  template?: Template
): string[] {
  const orderedNames = getOrderedTemplateAssetNames(template);
  const assetNames = orderedNames.length > 0 ? orderedNames : Object.keys(parentAssets);
  const lines: string[] = [`\n## ${label}: ${parentName}`];

  if (template) {
    lines.push(`Template: ${template.name} (${template.version})`);
  }

  assetNames.forEach((assetName) => {
    lines.push(...buildAssetContextSection(`### ${assetName}:`, assetName, parentAssets[assetName] || ''));
  });

  return lines;
}

function isJsonRecord(value: JsonPromptValue): value is { [key: string]: JsonPromptValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeJsonScalar(value: null | boolean | number | string): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return null;
    }

    return normalized.length > 240 ? `${normalized.slice(0, 237)}...` : normalized;
  }

  return String(value);
}

function collectJsonContextLines(
  value: JsonPromptValue,
  path: string,
  lines: string[],
  depth: number = 0
): void {
  if (lines.length >= 60 || depth > 4) {
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return;
    }

    const scalarValues = value
      .map((entry) => (entry === null || typeof entry === 'boolean' || typeof entry === 'number' || typeof entry === 'string'
        ? normalizeJsonScalar(entry)
        : null))
      .filter((entry): entry is string => Boolean(entry));

    if (scalarValues.length === value.length) {
      lines.push(`- ${path}: ${scalarValues.slice(0, 8).join(', ')}`);
      if (value.length > 8) {
        lines.push(`- ${path}: (${value.length - 8} more values omitted)`);
      }
      return;
    }

    value.slice(0, 3).forEach((entry, index) => {
      collectJsonContextLines(entry, `${path}[${index}]`, lines, depth + 1);
    });

    if (value.length > 3) {
      lines.push(`- ${path}: (${value.length - 3} more items omitted)`);
    }
    return;
  }

  if (isJsonRecord(value)) {
    const entries = Object.entries(value);
    entries.slice(0, 15).forEach(([key, entryValue]) => {
      const nextPath = path ? `${path}.${key}` : key;
      collectJsonContextLines(entryValue, nextPath, lines, depth + 1);
    });

    if (entries.length > 15 && lines.length < 60) {
      lines.push(`- ${path || 'root'}: (${entries.length - 15} more fields omitted)`);
    }
    return;
  }

  const normalized = normalizeJsonScalar(value);
  if (!normalized) {
    return;
  }

  lines.push(`- ${path}: ${normalized}`);
}

function buildAssetContextSection(
  heading: string,
  assetName: string,
  assetContent: string,
  jsonInstruction: string = 'Use the extracted fields below. Do not assume access to any external file.'
): string[] {
  const structuredHeading = heading.endsWith(':') ? heading.slice(0, -1) : heading;
  const trimmed = assetContent.trim();
  if (!trimmed) {
    return [heading, '```', '', '```', ''];
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as JsonPromptValue;
      const structuredLines: string[] = [];
      collectJsonContextLines(parsed, '', structuredLines);

      if (structuredLines.length > 0) {
        return [
          `${structuredHeading} (structured JSON context):`,
          jsonInstruction,
          ...structuredLines,
          '',
        ];
      }
    } catch {
      // Fall back to raw text below when the asset only looks like JSON.
    }
  }

  return [heading, '```', assetContent, '```', ''];
}

function buildPriorAssetContext(priorName: string, priorContent: string): string[] {
  return buildAssetContextSection(`### ${priorName}:`, priorName, priorContent);
}

/**
 * Build orchestrator prompt for character generation
 */
export async function buildOrchestratorPrompt(
  seed: string,
  mode: ContentMode | null = null,
  template?: Template,
  baseUrl?: string,
  blueprintOverride?: string,
  additionalInstructions: string[] = []
): Promise<[system: string, user: string]> {
  // Load orchestrator blueprint - respects settings and override
  let orchestrator = await resolveFeatureBlueprint('orchestration', blueprintOverride, baseUrl);

  if (template && template.assets.length > 0) {
    orchestrator += buildTemplateOverrideSection(template);
  }

  const systemPrompt = orchestrator;

  const userLines: string[] = [];
  if (mode) {
    userLines.push(`Mode: ${mode}`);
  }
  userLines.push(`SEED: ${seed}`);

  if (additionalInstructions.length > 0) {
    userLines.push('');
    userLines.push('ADDITIONAL RULES:');
    additionalInstructions.forEach((instruction) => {
      userLines.push(`- ${instruction}`);
    });
  }

  return [systemPrompt, userLines.join('\n')];
}

/**
 * Build asset prompt for single asset generation
 */
export async function buildAssetPrompt(
  assetName: string,
  seed: string,
  mode: ContentMode | null = null,
  priorAssets: Record<string, string> = {},
  blueprintContent: string | null = null,
  baseUrl?: string,
  additionalInstructions: string[] = []
): Promise<[system: string, user: string]> {
  // Load blueprint content
  const blueprint = blueprintContent || await loadBlueprint(assetName, baseUrl);

  const systemPrompt = `# BLUEPRINT: ${assetName}\n\n${blueprint}`;

  const userLines: string[] = [];
  if (mode) {
    userLines.push(`Mode: ${mode}`);
  }
  userLines.push(`SEED: ${seed}`);

  if (additionalInstructions.length > 0) {
    userLines.push('');
    userLines.push('ADDITIONAL INSTRUCTIONS:');
    additionalInstructions.forEach((instruction, index) => {
      if (index > 0) {
        userLines.push('');
      }
      userLines.push(instruction);
    });
  }

  // Add prior assets as context
  if (priorAssets && Object.keys(priorAssets).length > 0) {
    userLines.push('\n---\n## Prior Assets (for context):\n');
    for (const [priorName, priorContent] of Object.entries(priorAssets)) {
      userLines.push(...buildPriorAssetContext(priorName, priorContent));
    }
  }

  return [systemPrompt, userLines.join('\n')];
}

/**
 * Build seed generation prompt
 */
export async function buildSeedGenPrompt(
  genreLines: string,
  blueprintContent?: string
): Promise<[system: string, user: string]> {
  const systemPrompt = blueprintContent?.trim() || await resolveFeatureBlueprint('seed_generation');

  return [systemPrompt, genreLines];
}

/**
 * Build similarity analysis prompt
 */
export function buildSimilarityPrompt(
  profile1: {
    name?: string;
    age?: number;
    gender?: string;
    species?: string;
    occupation?: string;
    role?: string;
    power_level?: string;
    mode?: string;
    personality_traits?: string[];
    core_values?: string[];
    motivations?: string[];
    goals?: string[];
    fears?: string[];
  },
  profile2: {
    name?: string;
    age?: number;
    gender?: string;
    species?: string;
    occupation?: string;
    role?: string;
    power_level?: string;
    mode?: string;
    personality_traits?: string[];
    core_values?: string[];
    motivations?: string[];
    goals?: string[];
    fears?: string[];
  }
): [system: string, user: string] {
  const systemPrompt = `You are an expert character analyst specializing in understanding character relationships, dynamics, and narrative potential. Your task is to deeply analyze two characters and provide insights about how they would interact in a story.

You will receive structured character profiles containing:
- Basic information (name, age, gender, species, occupation)
- Personality traits
- Core values and beliefs
- Motivations and goals
- Fears and weaknesses
- Narrative role and power level

Your analysis should focus on:

1. **Narrative Dynamics**: How these characters would interact, tension or harmony between them, and what makes their relationship interesting for readers.

2. **Story Opportunities**: Specific plot hooks, conflicts, or situations that would arise from their relationship.

3. **Scene Suggestions**: 2-3 specific scene ideas that would showcase their dynamic (setting, situation, what happens).

4. **Dialogue Style**: How they would talk to each other - conversational patterns, tone, verbal conflicts, etc.

5. **Relationship Arc**: How their relationship might evolve over a story - beginning, middle, and end states.

Provide your response as JSON with this structure:

${'```'}json
{
  "narrative_dynamics": "2-3 paragraphs describing core dynamic",
  "story_opportunities": [
    "opportunity 1",
    "opportunity 2",
    "opportunity 3"
  ],
  "scene_suggestions": [
    "Scene 1 description with setting and action",
    "Scene 2 description with setting and action",
    "Scene 3 description with setting and action"
  ],
  "dialogue_style": "Description of their conversational patterns",
  "relationship_arc": "Description of how their relationship would develop"
}
${'```'}

Be specific, insightful, and focus on narrative potential. Consider:
- Would they clash or complement each other?
- What secrets or conflicts could emerge?
- How would they challenge each other to grow?
- What would readers find compelling about their relationship?
- What themes or conflicts would their relationship explore?`;

  const userLines: string[] = [];

  // Character 1
  userLines.push(`## CHARACTER 1: ${profile1.name || 'Character 1'}`);
  userLines.push(`**Age**: ${profile1.age || 'Unknown'}`);
  userLines.push(`**Gender**: ${profile1.gender || 'Unknown'}`);
  userLines.push(`**Species**: ${profile1.species || 'Unknown'}`);
  userLines.push(`**Occupation**: ${profile1.occupation || 'Unknown'}`);
  userLines.push(`**Role**: ${profile1.role || 'Unknown'}`);
  userLines.push(`**Power Level**: ${profile1.power_level || 'Unknown'}`);
  userLines.push(`**Mode**: ${profile1.mode || 'Unknown'}`);

  if (profile1.personality_traits && profile1.personality_traits.length > 0) {
    userLines.push(`**Personality Traits**: ${profile1.personality_traits.slice(0, 10).join(', ')}`);
  }
  if (profile1.core_values && profile1.core_values.length > 0) {
    userLines.push(`**Core Values**: ${profile1.core_values.slice(0, 10).join(', ')}`);
  }
  if (profile1.motivations && profile1.motivations.length > 0) {
    userLines.push(`**Motivations**: ${profile1.motivations.slice(0, 10).join(', ')}`);
  }
  if (profile1.goals && profile1.goals.length > 0) {
    userLines.push(`**Goals**: ${profile1.goals.slice(0, 10).join(', ')}`);
  }
  if (profile1.fears && profile1.fears.length > 0) {
    userLines.push(`**Fears**: ${profile1.fears.slice(0, 10).join(', ')}`);
  }

  // Character 2
  userLines.push(`\n## CHARACTER 2: ${profile2.name || 'Character 2'}`);
  userLines.push(`**Age**: ${profile2.age || 'Unknown'}`);
  userLines.push(`**Gender**: ${profile2.gender || 'Unknown'}`);
  userLines.push(`**Species**: ${profile2.species || 'Unknown'}`);
  userLines.push(`**Occupation**: ${profile2.occupation || 'Unknown'}`);
  userLines.push(`**Role**: ${profile2.role || 'Unknown'}`);
  userLines.push(`**Power Level**: ${profile2.power_level || 'Unknown'}`);
  userLines.push(`**Mode**: ${profile2.mode || 'Unknown'}`);

  if (profile2.personality_traits && profile2.personality_traits.length > 0) {
    userLines.push(`**Personality Traits**: ${profile2.personality_traits.slice(0, 10).join(', ')}`);
  }
  if (profile2.core_values && profile2.core_values.length > 0) {
    userLines.push(`**Core Values**: ${profile2.core_values.slice(0, 10).join(', ')}`);
  }
  if (profile2.motivations && profile2.motivations.length > 0) {
    userLines.push(`**Motivations**: ${profile2.motivations.slice(0, 10).join(', ')}`);
  }
  if (profile2.goals && profile2.goals.length > 0) {
    userLines.push(`**Goals**: ${profile2.goals.slice(0, 10).join(', ')}`);
  }
  if (profile2.fears && profile2.fears.length > 0) {
    userLines.push(`**Fears**: ${profile2.fears.slice(0, 10).join(', ')}`);
  }

  userLines.push('\n## TASK');
  userLines.push('Provide a deep analysis of these two characters\' relationship potential.');
  userLines.push('Return your response as valid JSON following the structure specified in the system prompt.');

  return [systemPrompt, userLines.join('\n')];
}

/**
 * Build offspring generation prompt
 */
export async function buildOffspringPrompt(
  parent1Assets: Record<string, string>,
  parent2Assets: Record<string, string>,
  parent1Name: string,
  parent2Name: string,
  mode: ContentMode | null = null,
  parent1Template?: Template,
  parent2Template?: Template,
  baseUrl?: string,
  blueprintOverride?: string
): Promise<[system: string, user: string]> {
  // Load offspring generator blueprint - respects settings and override
  const systemPrompt = await resolveFeatureBlueprint('offspring_generation', blueprintOverride, baseUrl);

  const userLines: string[] = [];

  if (mode) {
    userLines.push(`Mode: ${mode}`);
  }

  userLines.push(...buildParentSuiteSection('PARENT 1', parent1Name, parent1Assets, parent1Template));
  userLines.push(...buildParentSuiteSection('PARENT 2', parent2Name, parent2Assets, parent2Template));

  // Instruction
  userLines.push('\n## INSTRUCTION:');
  userLines.push('Analyze how these two parents would shape a new character\'s upbringing and generate the offspring\'s SEED.');
  userLines.push('Treat each parent suite according to the template contract shown in the provided assets.');

  return [systemPrompt, userLines.join('\n')];
}

/**
 * Build refinement chat system prompt
 */
export async function buildRefinementSystemPrompt(
  assetName: string,
  currentContent: string,
  characterSheet: string,
  baseUrl?: string
): Promise<string> {
  // Asset labels for friendly names
  const assetLabels: Record<string, string> = {
    system_prompt: 'System Prompt',
    post_history: 'Post History',
    character_sheet: 'Character Sheet',
    intro_scene: 'Intro Scene',
    intro_page: 'Intro Page',
    a1111: 'A1111 Image Prompt',
    suno: 'Suno Music Prompt',
  };

  const label = assetLabels[assetName] || assetName;

  // Load blueprint for this asset
  let blueprint: string;
  try {
    blueprint = await loadBlueprint(assetName, baseUrl);
  } catch {
    blueprint = '(Blueprint not found)';
  }

  const prompt = `You are an expert assistant helping refine a character asset: **${label}**.

The user is working on an Eidolon Simulacra project using the blueprint system. You have access to:
1. The blueprint specification for this asset
2. The current asset content
3. The character sheet (for maintaining consistency)

## Blueprint Specification for ${label}:

\`\`\`markdown
${blueprint}
\`\`\`

${buildAssetContextSection(`## Current Asset: ${label}`, assetName, currentContent, 'Use the extracted fields below as the active asset content. Do not assume access to any external file.').join('\n')}

${buildAssetContextSection('## Character Sheet (for context)', 'character_sheet', characterSheet, 'Use the extracted character-sheet fields below to maintain consistency. Do not assume access to any external file.').join('\n')}

## Your Role:

- **Discuss**: Answer questions about the asset, explain choices, suggest improvements
- **Refine**: When requested, provide an edited version of the asset
- **Maintain Consistency**: Ensure edits align with the character sheet and blueprint requirements
- **Follow Blueprint**: Strictly adhere to the format, rules, and constraints specified in the blueprint above
- **Format**: When providing an edited version, return only the finished asset content with no surrounding code fences or commentary

## Key Guidelines:

- **Never narrate {{user}} actions, thoughts, emotions, sensations, decisions, or consent**
- Preserve the asset's required format and structure exactly as specified in the blueprint
- Keep tone and voice consistent with the character's established personality
- Respect all "Hard Rules" and constraints from the blueprint
- Maintain token limits where specified
- For system_prompt and post_history: paragraph-only, ≤300 tokens, no headers/lists
- For character_sheet: maintain field order and structure exactly
- For intro_scene: second-person narrative, end with open loop
- For a1111/suno: follow the modular prompt format exactly (including [Control] blocks)

If the user asks for changes, provide the complete edited asset content only. Otherwise, discuss and advise.`;

  return prompt;
}

/**
 * Format messages for LLM API
 */
export function formatMessages(
  systemPrompt: string,
  userPrompt: string,
  conversationHistory?: ChatMessage[]
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  messages.push({ role: 'user', content: userPrompt });

  return messages;
}
