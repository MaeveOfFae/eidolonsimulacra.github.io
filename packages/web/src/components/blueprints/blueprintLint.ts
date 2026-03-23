export interface BlueprintLintContext {
  category?: 'core' | 'system' | 'template' | 'example' | 'custom';
  path?: string;
  featureCategory?: string;
}

export interface BlueprintLintIssue {
  severity: 'error' | 'warning';
  message: string;
  line: number;
}

function getLineNumber(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function shouldWarnForMissingCodeBlock(context?: BlueprintLintContext): boolean {
  if (!context) {
    return true;
  }

  if (context.category === 'example' || context.category === 'template') {
    return true;
  }

  if (context.category === 'system' || context.category === 'core') {
    return context.path?.includes('/generator') ?? true;
  }

  return false;
}

function getShortContentThreshold(context?: BlueprintLintContext): number {
  switch (context?.category) {
    case 'example':
      return 120;
    case 'template':
      return 160;
    case 'system':
    case 'core':
      return 180;
    default:
      return 100;
  }
}

export function lintBlueprintContent(content: string, context?: BlueprintLintContext): BlueprintLintIssue[] {
  const issues: BlueprintLintIssue[] = [];
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatterMatch) {
    issues.push({ severity: 'warning', message: 'Missing YAML frontmatter block. Browser tools will fall back to heading-derived metadata.', line: 1 });
  } else {
    const frontmatter = frontmatterMatch[1];
    for (const field of ['name', 'description', 'version']) {
      if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
        const headerStart = frontmatterMatch.index ?? 0;
        const fieldLineIndex = headerStart + frontmatterMatch[0].split('\n').findIndex((line) => line === '---');
        issues.push({ severity: 'warning', message: `Frontmatter is missing ${field}.`, line: Math.max(1, fieldLineIndex + 1) });
      }
    }
  }

  const hasCodeBlock = /```[\s\S]*?```/g.test(content);
  if (!hasCodeBlock && shouldWarnForMissingCodeBlock(context)) {
    const bodyStart = frontmatterMatch ? (frontmatterMatch[0].length + 1) : 0;
    issues.push({ severity: 'warning', message: 'No fenced example or output block detected.', line: getLineNumber(content, bodyStart) });
  }

  if (content.length < getShortContentThreshold(context)) {
    issues.push({ severity: 'warning', message: 'Blueprint content is unusually short.', line: 1 });
  }

  return issues;
}