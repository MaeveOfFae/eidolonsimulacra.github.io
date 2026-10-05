/**
 * Extract a JSX range from a screen into a presentational component.
 *
 * The component's props are typed as `Pick<ReturnType<typeof useDraftDetailState>, …>`
 * and the screen passes exactly those names, so the typecheck proves every reference in
 * both directions: a name the JSX needs but the call does not pass, and a name passed
 * that does not exist, are both compile errors. The JSX moves verbatim; the component
 * builds its own styles from the shared stylesheet.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SCREEN = 'packages/mobile/src/screens/DraftDetailScreen.tsx';
const DIR = 'packages/mobile/src/screens/draft-detail';
const HOOK_MODULE = './use-draft-detail-state';

const SECTIONS = [
  {
    name: 'DraftDetailHeader',
    from: 178,
    to: 337,
    doc: 'The draft detail header: the title and status line, the favourite and archive buttons, the tag row, the action buttons, and the export tray summary.',
  },
  {
    name: 'DraftDetailModals',
    from: 1031,
    to: 1513,
    doc: 'The draft detail modals: the metadata editor, the refinement editor, the intro picker, and the asset editor.',
  },
];

const raw = readFileSync(SCREEN, 'utf8').replace(/^\uFEFF/, '');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
let lines = raw.split(/\r?\n/);

// The state names the screen destructures: the pool the props can come from. Prettier
// wraps the list across lines, so the closing line is found first and walked back to.
const endIndex = lines.findIndex((line) => /^\s*\} = useDraftDetailState\(\);$/.test(line));
if (endIndex < 0) {
  throw new Error('Could not find the state destructure in the screen');
}
let startIndex = endIndex;
while (startIndex >= 0 && !/^\s*const \{(\s|$)/.test(lines[startIndex])) {
  startIndex -= 1;
}
const stateNames = new Set(
  lines
    .slice(startIndex, endIndex + 1)
    .join(' ')
    .replace(/^\s*const \{ /, '')
    .replace(/ \} = useDraftDetailState\(\);$/, '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean),
);

// The screen's import statements, so the section can import what it uses.
const importEnd = lines.findIndex((line) => /^[A-Za-z]/.test(line) && !/^import /.test(line));
const screenImports = lines
  .slice(0, importEnd)
  .join('\n')
  .split(/;\n/)
  .map((statement) => `${statement.trim()};`)
  .filter((statement) => /^import /.test(statement));

const deepen = (text) =>
  text.replace(/from\s+(['"])(\.\.?\/)/g, (_, quote, path) => `from ${quote}../${path.replace(/^\.\//, '')}`);

const usedIn = (block, name) => new RegExp(`(?<![\\w.$])${name}(?![\\w$])`).test(block);

/** Rebuild import statements to only the names a body actually uses. */
const pruneImports = (statements, body) =>
  statements
    .map((statement) => {
      const specifier = statement.match(/from\s+['"]([^'"]+)['"]/)?.[1] ?? '';
      const isTypeOnly = /^import type /.test(statement);
      const clause = statement
        .slice(0, statement.indexOf(' from '))
        .replace(/^import\s+/, '')
        .replace(/^type\s+/, '')
        .trim();

      if (!clause.startsWith('{')) {
        const target = clause.replace(/^\*\s*as\s+/, '').match(/[A-Za-z_$][\w$]*/)?.[0];
        return !target || usedIn(body, target) ? statement : null;
      }

      const entries = clause
        .slice(1, -1)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .filter((entry) => entry.split(/\s+/).some((word) => word !== 'as' && word !== 'type' && usedIn(body, word)));

      if (entries.length === 0) {
        return null;
      }
      return `${isTypeOnly ? 'import type' : 'import'} { ${entries.join(', ')} } from '${specifier}';`;
    })
    .filter(Boolean);

const created = [];
// Bottom-up, so a cut never invalidates the line numbers of a later one.
for (const section of [...SECTIONS].reverse()) {
  const body = lines.slice(section.from - 1, section.to).join('\n');
  // `colors` and `styles` are the component's own (it builds them from the shared
  // stylesheet), so they are never props.
  const props = [...stateNames]
    .filter((name) => name !== 'colors' && name !== 'styles')
    .filter((name) => usedIn(body, name))
    .sort();

  const imports = pruneImports(screenImports, body).map(deepen);

  const component = `/**
 * ${section.doc}
 *
 * Extracted from \`DraftDetailScreen\` verbatim: the screen passes the state it renders
 * as \`Pick<ReturnType<typeof useDraftDetailState>, …>\`, so a missing prop and a missing
 * state entry are both compile errors rather than blank sections.
 */
import { useMemo } from 'react';
${imports.join('\n')}
import { useTheme } from '../../theme/ThemeProvider';
import { useDraftDetailState } from './use-draft-detail-state';
import { buildStyles } from './styles';

type Props = Pick<ReturnType<typeof useDraftDetailState>, ${props.map((name) => `'${name}'`).join(' | ')}>;

export default function ${section.name}({ ${props.join(', ')} }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => buildStyles(colors), [colors]);
${props.includes('draft') ? '\n  // The screen only renders this once its loading and error guards have passed.\n  if (!draft) {\n    return null;\n  }\n' : ''}
  return (
    <>
${body}
    </>
  );
}
`;

  mkdirSync(DIR, { recursive: true });
  writeFileSync(`${DIR}/${section.name}.tsx`, `${component}`.replace(/\n/g, eol), 'utf8');
  created.push({ ...section, props });

  // Replace the range in the screen with the component usage.
  const usage = `      <${section.name} {...{ ${props.join(', ')} }} />`;
  lines = [...lines.slice(0, section.from - 1), usage, ...lines.slice(section.to)];
}

// The state hook's type has to be nameable in the section props.
if (!screenImports.some((statement) => statement.includes('useDraftDetailState'))) {
  lines.splice(
    lines.findIndex((line) => /^import /.test(line)),
    0,
    `import { useDraftDetailState } from '${HOOK_MODULE}';`,
  );
}
for (const section of created.slice().reverse()) {
  lines.splice(
    lines.findIndex((line) => /^import /.test(line)),
    0,
    `import ${section.name} from './draft-detail/${section.name}';`,
  );
}

// The screen's own imports are now over-broad: the sections took their usages with
// them, so each statement is rebuilt to the names the screen still uses.
{
  const firstImport = lines.findIndex((line) => /^import /.test(line));
  let lastImport = firstImport;
  for (let index = firstImport; index < lines.length; index += 1) {
    if (/^import |^} from |^\s|^$/.test(lines[index])) {
      if (/^} from /.test(lines[index])) {
        lastImport = index;
      }
      continue;
    }
    break;
  }

  const blockText = lines.slice(firstImport, lastImport + 1).join('\n');
  const restText = lines.slice(lastImport + 1).join('\n');
  const statements = blockText
    .split(/;\n/)
    .map((s) => `${s.trim()};`)
    .filter((s) => /^import /.test(s));

  const keptStatements = statements
    .map((statement) => {
      const specifier = statement.match(/from\s+['"]([^'"]+)['"]/)?.[1] ?? '';
      const isTypeOnly = /^import type /.test(statement);
      const clause = statement
        .slice(0, statement.indexOf(' from '))
        .replace(/^import\s+/, '')
        .replace(/^type\s+/, '')
        .trim();

      if (!clause.startsWith('{')) {
        const target = clause.replace(/^\*\s*as\s+/, '').match(/[A-Za-z_$][\w$]*/)?.[0];
        return !target || usedIn(restText, target) ? statement : null;
      }

      const entries = clause
        .slice(1, -1)
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
        .filter((entry) =>
          entry.split(/\s+/).some((word) => word !== 'as' && word !== 'type' && usedIn(restText, word)),
        );

      if (entries.length === 0) {
        return null;
      }
      return `${isTypeOnly ? 'import type' : 'import'} { ${entries.join(', ')} } from '${specifier}';`;
    })
    .filter(Boolean);

  lines = [...keptStatements, ...lines.slice(lastImport + 1)];
}

writeFileSync(SCREEN, `${lines.join('\n')}\n`, 'utf8');
for (const section of created) {
  console.log(`${section.name}: ${section.to - section.from + 1} lines, ${section.props.length} props`);
}
console.log(`screen: ${lines.length} lines`);
