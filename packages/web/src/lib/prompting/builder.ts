/**
 * Prompt Builder
 * Builds LLM prompts for character generation, similarity, etc.
 */

import {
  buildAssetContextLines,
  buildLorebookUserPrompt,
  selectRelevantPriorAssets,
  type ChatMessage,
  type ContentMode,
  type ReferenceSuiteContext,
  type Template,
} from '@char-gen/shared';
import { loadBlueprint, resolveFeatureBlueprint, templateToAssets, topologicalSort } from './blueprint.js';
import { resolveTemplateBlueprintContent, resolveTemplateDefinition } from '../templates/browser.js';

export type { ReferenceSuiteContext };

export interface ImportedSourceContext {
  label: string;
  source: string;
  assets: Record<string, string>;
  template?: Template;
}

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

      return ['', `### ASSET BLUEPRINT: ${asset.name}`, '```md', blueprintContent, '```'].join('\n');
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
  template?: Template,
): string[] {
  const orderedNames = getOrderedTemplateAssetNames(template);
  const assetNames = orderedNames.length > 0 ? orderedNames : Object.keys(parentAssets);
  const lines: string[] = [`\n## ${label}: ${parentName}`];

  if (template) {
    lines.push(`Template: ${template.name} (${template.version})`);
  }

  assetNames.forEach((assetName) => {
    lines.push(...buildAssetContextLines(`### ${assetName}:`, assetName, parentAssets[assetName] || ''));
  });

  return lines;
}

function buildPriorAssetContext(priorName: string, priorContent: string): string[] {
  return buildAssetContextLines(`### ${priorName}:`, priorName, priorContent);
}

function buildImportedSourceSection(
  importedSource: ImportedSourceContext,
  options: { assetName?: string; template?: Template } = {},
): string[] {
  const referenceTemplate = options.template ?? importedSource.template;
  const relevantAssets =
    options.assetName && referenceTemplate
      ? selectRelevantPriorAssets(referenceTemplate, options.assetName, importedSource.assets)
      : { ...importedSource.assets };

  if (options.assetName) {
    const currentAsset = importedSource.assets[options.assetName];
    if (typeof currentAsset === 'string' && currentAsset.trim().length > 0) {
      relevantAssets[options.assetName] = currentAsset;
    }
  }

  const orderedNames = getOrderedTemplateAssetNames(referenceTemplate);
  const assetNames =
    orderedNames.length > 0
      ? orderedNames.filter((assetName) => assetName in relevantAssets)
      : Object.keys(relevantAssets);
  const remainingAssetNames = Object.keys(relevantAssets).filter((assetName) => !assetNames.includes(assetName));
  const finalAssetNames = [...assetNames, ...remainingAssetNames];

  if (finalAssetNames.length === 0) {
    return [];
  }

  const lines: string[] = [
    '\n## Imported Character Source Material',
    `Source label: ${importedSource.label}`,
    `Imported from: ${importedSource.source}`,
    'Treat the following imported card assets as source material for this rehash.',
    'Preserve compatible facts, tone, relationship logic, and constraints when they fit the active seed and blueprint.',
    'Do not copy them blindly as final output; rewrite them into the requested asset format.',
  ];

  if (referenceTemplate) {
    lines.push(`Template context: ${referenceTemplate.name} (${referenceTemplate.version})`);
  }

  finalAssetNames.forEach((assetName) => {
    lines.push(
      ...buildAssetContextLines(`### ${assetName}:`, assetName, relevantAssets[assetName] || '', {
        jsonInstruction:
          'Treat the extracted fields below as imported source material. Do not assume access to any external file.',
      }),
    );
  });

  return lines;
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
  additionalInstructions: string[] = [],
  referenceSuites: ReferenceSuiteContext[] = [],
  importedSource?: ImportedSourceContext,
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

  if (importedSource) {
    userLines.push(...buildImportedSourceSection(importedSource, { template }));
  }

  if (referenceSuites.length > 0) {
    userLines.push('');
    userLines.push('CONNECTED CHARACTER REFERENCES:');
    userLines.push(
      'Treat these suites as secondary canon anchors for continuity, shared setting pressure, and existing entanglements.',
    );
    userLines.push('Do not let them override the active seed or collapse the new character into a duplicate.');

    referenceSuites.forEach((suite, index) => {
      userLines.push(...buildParentSuiteSection(`REFERENCE ${index + 1}`, suite.label, suite.assets, suite.template));
    });
  }

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
  additionalInstructions: string[] = [],
  referenceSuites: ReferenceSuiteContext[] = [],
  templateName?: string,
  importedSource?: ImportedSourceContext,
): Promise<[system: string, user: string]> {
  // Load blueprint content
  const blueprint = blueprintContent || (await loadBlueprint(assetName, baseUrl));

  const systemPrompt = `# BLUEPRINT: ${assetName}\n\n${blueprint}`;
  const relevantPriorAssets = selectRelevantPriorAssets(
    templateName ? resolveTemplateDefinition(templateName) : undefined,
    assetName,
    priorAssets,
  );

  const userLines: string[] = [];
  userLines.push(`TARGET ASSET: ${assetName}`);
  userLines.push(`TASK: Generate only the requested ${assetName} asset.`);
  userLines.push(
    'Do not regenerate, restate, or summarize any other asset unless it is quoted below as supporting context.',
  );

  if (assetName === 'a1111') {
    userLines.push(
      'OUTPUT: Return only the final raw A1111 prompt lines. Do not write narration, scene prose, explanations, headings, labels, or code fences.',
    );
  }

  if (mode) {
    userLines.push('');
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

  if (referenceSuites.length > 0) {
    userLines.push('\n---\n## Connected Character References:\n');
    userLines.push(
      'Treat these suites as established canon anchors for relationship continuity, shared world state, and cross-character consistency.',
    );
    userLines.push(
      'Use them to keep the new character interconnected without duplicating an existing suite or overriding the active seed.',
    );

    referenceSuites.forEach((suite, index) => {
      userLines.push(...buildParentSuiteSection(`REFERENCE ${index + 1}`, suite.label, suite.assets, suite.template));
    });
  }

  if (importedSource) {
    userLines.push(
      ...buildImportedSourceSection(importedSource, {
        assetName,
        template: templateName ? resolveTemplateDefinition(templateName) : undefined,
      }),
    );
  }

  // Add prior assets as context
  if (Object.keys(relevantPriorAssets).length > 0) {
    userLines.push('\n---\n## Prior Assets (for context):\n');
    for (const [priorName, priorContent] of Object.entries(relevantPriorAssets)) {
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
  blueprintContent?: string,
): Promise<[system: string, user: string]> {
  const systemPrompt = blueprintContent?.trim() || (await resolveFeatureBlueprint('seed_generation'));

  return [systemPrompt, genreLines];
}

export async function buildLorebookPrompt(
  referenceSuites: ReferenceSuiteContext[],
  options: {
    focus?: string;
    blueprintContent?: string;
  } = {},
): Promise<[system: string, user: string]> {
  const systemPrompt = options.blueprintContent?.trim() || (await resolveFeatureBlueprint('worldbook_generation'));
  const userPrompt = buildLorebookUserPrompt(referenceSuites, { focus: options.focus });

  return [systemPrompt, userPrompt];
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
  },
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
  userLines.push("Provide a deep analysis of these two characters' relationship potential.");
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
  blueprintOverride?: string,
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
  userLines.push(
    "Analyze how these two parents would shape a new character's upbringing and generate the offspring's SEED.",
  );
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
  baseUrl?: string,
): Promise<string> {
  // Asset labels for friendly names
  const assetLabels: Record<string, string> = {
    system_prompt: 'System Prompt',
    post_history: 'Post History',
    character_sheet: 'Character Sheet',
    intro_scene: 'Intro Scene',
    creator_notes: 'Creator Notes',
    intro_page: 'Creator Notes',
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

${buildAssetContextLines(`## Current Asset: ${label}`, assetName, currentContent, {
  jsonInstruction:
    'Use the extracted fields below as the active asset content. Do not assume access to any external file.',
}).join('\n')}

${buildAssetContextLines('## Character Sheet (for context)', 'character_sheet', characterSheet, {
  jsonInstruction:
    'Use the extracted character-sheet fields below to maintain consistency. Do not assume access to any external file.',
}).join('\n')}

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
  conversationHistory?: ChatMessage[],
): ChatMessage[] {
  const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }

  messages.push({ role: 'user', content: userPrompt });

  return messages;
}
