export function unwrapSingleCodeFence(content: string): string {
  const trimmed = content.trim();
  const match = trimmed.match(/^```[^\r\n]*\r?\n([\s\S]*?)\r?\n```$/);

  if (!match) {
    return trimmed;
  }

  return match[1]?.trim() ?? '';
}