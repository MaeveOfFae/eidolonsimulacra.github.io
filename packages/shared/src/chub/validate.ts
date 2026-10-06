/**
 * Publish preflight rules, encoding `rules/workflows/chub-package-helper.md`:
 * at least 3 accurate tags (Chub hides under-tagged public characters from search),
 * an accurate SFW/NSFW rating, greetings that respect the `<START>` convention, and
 * `{{user}}`/`{{char}}` macro hygiene in the first message.
 */
import type { ChubCharacterCreate } from './types';

export interface ChubPreflightIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

/** Errors block the publish; warnings are shown but do not. */
export function chubPreflightHasErrors(issues: ChubPreflightIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}

const MIN_PUBLIC_TAGS = 3;

export function runChubPreflight(payload: ChubCharacterCreate): ChubPreflightIssue[] {
  const issues: ChubPreflightIssue[] = [];

  if (payload.name.trim().length === 0) {
    issues.push({
      severity: 'error',
      code: 'name-required',
      message: 'The character needs a name before it can be published.',
    });
  }

  if (payload.first_message.trim().length === 0) {
    issues.push({
      severity: 'error',
      code: 'greeting-required',
      message: 'The first message (intro scene) is empty — Chub requires an opening greeting.',
    });
  }

  const isListedPublic = Boolean(payload.is_public) && !payload.is_unlisted;
  const tagCount = (payload.tags ?? []).length;
  if (isListedPublic && tagCount < MIN_PUBLIC_TAGS) {
    issues.push({
      severity: 'error',
      code: 'tags-required',
      message: `Listed public characters need at least ${MIN_PUBLIC_TAGS} tags or Chub hides them from search (found ${tagCount}). Add tags, or publish unlisted.`,
    });
  }

  if (payload.personality.trim().length === 0) {
    issues.push({
      severity: 'warning',
      code: 'empty-personality',
      message: 'The persona description (character sheet) is empty — the listing will look bare.',
    });
  }

  if (payload.description.trim().length === 0) {
    issues.push({
      severity: 'warning',
      code: 'empty-creator-notes',
      message: 'Creator notes are empty — consider adding them before publishing.',
    });
  }

  if (payload.example_dialogs.trim().length === 0) {
    issues.push({
      severity: 'warning',
      code: 'empty-example-dialogs',
      message: 'No example dialogs (post history) will be published with the card.',
    });
  }

  const greeting = payload.first_message;
  if (greeting.trim().length > 0 && !greeting.includes('{{user}}') && !greeting.includes('{{char}}')) {
    issues.push({
      severity: 'warning',
      code: 'macro-missing',
      message: 'The first message uses neither {{user}} nor {{char}} — check the greeting before publishing.',
    });
  }

  for (const [index, alternate] of (payload.alternate_greetings ?? []).entries()) {
    if (alternate.trim().length > 0 && !alternate.trimStart().startsWith('<START>')) {
      issues.push({
        severity: 'warning',
        code: 'alternate-start-marker',
        message: `Alternate greeting ${index + 1} does not start with <START>; the builder normally adds it.`,
      });
    }
  }

  return issues;
}
