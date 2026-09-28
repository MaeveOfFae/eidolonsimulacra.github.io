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

function getFieldLineNumber(frontmatterBlock: string, field: string): number | null {
  const lines = frontmatterBlock.split('\n');
  const lineIndex = lines.findIndex((line) => new RegExp(`^${field}:`).test(line));
  return lineIndex === -1 ? null : lineIndex + 2;
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
  const normalizedContent = content.replace(/\r\n?/g, '\n');
  const frontmatterMatch = normalizedContent.match(/^---\n([\s\S]*?)\n---/);
  const requiredFrontmatterFields = ['name', 'description', 'version', 'invokable', 'always'];

  if (!frontmatterMatch) {
    issues.push({
      severity: 'warning',
      message: 'Missing YAML frontmatter block. Browser tools will fall back to heading-derived metadata.',
      line: 1,
    });
  } else {
    const frontmatter = frontmatterMatch[1];
    for (const field of requiredFrontmatterFields) {
      if (!new RegExp(`^${field}:`, 'm').test(frontmatter)) {
        issues.push({ severity: 'warning', message: `Frontmatter is missing ${field}.`, line: 2 });
      }
    }

    if (context?.category === 'system' && !/^feature_category:/m.test(frontmatter)) {
      issues.push({
        severity: 'warning',
        message: 'System blueprints should declare feature_category in frontmatter.',
        line: 2,
      });
    }

    const invokableLine = getFieldLineNumber(frontmatter, 'invokable');
    const alwaysLine = getFieldLineNumber(frontmatter, 'always');

    if (invokableLine !== null && !/^invokable:\s*(true|false)\s*$/m.test(frontmatter)) {
      issues.push({ severity: 'warning', message: 'Frontmatter invokable should be a boolean.', line: invokableLine });
    }

    if (alwaysLine !== null && !/^always:\s*(true|false)\s*$/m.test(frontmatter)) {
      issues.push({ severity: 'warning', message: 'Frontmatter always should be a boolean.', line: alwaysLine });
    }
  }

  const bodyStartIndex = frontmatterMatch ? frontmatterMatch[0].length + 1 : 0;
  const body = normalizedContent.slice(bodyStartIndex).trimStart();
  const bodyOffset = body.length === 0 ? bodyStartIndex : normalizedContent.indexOf(body, bodyStartIndex);

  if (body.length === 0) {
    issues.push({
      severity: 'warning',
      message: 'Blueprint body is empty.',
      line: getLineNumber(normalizedContent, bodyStartIndex),
    });
  } else if (!body.startsWith('# ')) {
    issues.push({
      severity: 'warning',
      message: 'Blueprint body should start with a top-level heading.',
      line: getLineNumber(normalizedContent, bodyOffset),
    });
  }

  const hasCodeBlock = /```[\s\S]*?```/g.test(normalizedContent);
  if (!hasCodeBlock && shouldWarnForMissingCodeBlock(context)) {
    issues.push({
      severity: 'warning',
      message: 'No fenced example or output block detected.',
      line: getLineNumber(normalizedContent, bodyStartIndex),
    });
  }

  const fenceMarkers = normalizedContent.match(/^```.*$/gm) ?? [];
  if (fenceMarkers.length % 2 !== 0) {
    issues.push({
      severity: 'warning',
      message: 'Unbalanced fenced code block detected.',
      line: getLineNumber(normalizedContent, normalizedContent.lastIndexOf('```')),
    });
  }

  if (normalizedContent.length < getShortContentThreshold(context)) {
    issues.push({ severity: 'warning', message: 'Blueprint content is unusually short.', line: 1 });
  }

  return issues;
}
