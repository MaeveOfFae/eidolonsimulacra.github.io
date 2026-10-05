/**
 * The split of `use-draft-detail-state.tsx` (1,432 lines) into four sibling hooks.
 *
 * Two-way partitions of this file do not exist. Cutting it into "state" and "everything
 * that writes" leaves whichever half keeps the later handlers with undefined names, at
 * every boundary — the handlers use the mutations declared above the cut, and the
 * mutations take the state declared above them, so a cut placed before the return leaves
 * the retained half above its own insertion point and the typecheck names the bindings.
 *
 * The shape that works is siblings the *screen* composes in dependency order, so no hook
 * calls another:
 *
 *     const state = useDraftDetailState();
 *     const mutations = useDraftDetailMutations(state);
 *     const derived = useDraftDetailDerived(state);
 *     const handlers = useDraftDetailHandlers(state, mutations, derived);
 *
 * A hook that calls another whose parameter is `Pick<ReturnType<typeof thatHook>, ...>`
 * makes the two return types circular (TS7023); keeping every call in the screen means
 * each `Pick` resolves against hooks that never mention their siblings.
 *
 * The derived values are their own hook because eight hundred and fifty lines of handlers
 * plus a parameter list would not fit the bar, and because the direction happens to be
 * one-way: the derived values need only the state, while one of them (`exportReadiness`)
 * is used by a handler. The single place they reached back the other way — the effect that
 * calls `resetReviewAnnotations` — is a side effect rather than a derived value, so it
 * travels with the handlers instead.
 *
 * Each region is sliced verbatim and gets exactly the parameters it uses, the imports it
 * uses, and the return the screen destructured from it — so the screen's single
 * destructure is partitioned rather than rewritten, and a name that belongs to no hook is
 * an error here rather than a blank section later.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const DIR = 'packages/mobile/src/screens/draft-detail';
const STATE_HOOK = `${DIR}/use-draft-detail-state.tsx`;
const MUTATIONS_HOOK = `${DIR}/use-draft-detail-mutations.tsx`;
const HANDLERS_HOOK = `${DIR}/use-draft-detail-handlers.tsx`;
const DERIVED_HOOK = `${DIR}/use-draft-detail-derived.tsx`;
const SCREEN = 'packages/mobile/src/screens/DraftDetailScreen.tsx';
const SECTIONS = [`${DIR}/DraftDetailHeader.tsx`, `${DIR}/DraftDetailModals.tsx`];

/**
 * Every input is read from HEAD and every output is written with the line ending the file
 * already uses, so the script is deterministic and re-runnable: a second run against an
 * already-split tree produces the same bytes rather than failing on vanished anchors.
 */
const readHead = (file) =>
  execSync(`git show HEAD:${file}`, { encoding: 'utf8', maxBuffer: 1 << 28 })
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n');

function writePreserving(file, content) {
  let crlf = false;
  try {
    crlf = readFileSync(file, 'utf8').includes('\r\n');
  } catch {
    crlf = false; // a file this script creates starts life with LF
  }
  writeFileSync(file, crlf ? content.replace(/\n/g, '\r\n') : content);
}

const source = readHead(STATE_HOOK);
const lines = source.split(/\r?\n/);
const last = lines[lines.length - 1] === '' ? lines.length - 1 : lines.length;

const find = (pattern) => {
  const index = lines.findIndex((line) => pattern.test(line));
  if (index < 0) {
    throw new Error(`Could not find ${pattern}`);
  }
  return index + 1;
};

const SIGNATURE = find(/^export function useDraftDetailState\(\) \{$/);
const MUTATIONS = find(/^  const createSafeguardSnapshot = async/);
const HANDLERS = find(/^  const handleDelete = \(\) => \{$/);
const DERIVED = find(/^  const revisionSnapshots = useMemo\(/);
const RETURN = find(/^  return \{$/);

/** 1-based inclusive. */
const text = (from, to) => lines.slice(from - 1, to).join('\n');

const header = text(1, SIGNATURE - 1);

/**
 * The review-reset effect is the one place in the derived tail that reaches back into a
 * handler (`resetReviewAnnotations`). It is a side effect rather than a derived value, so it
 * travels with the handlers: leaving it here would make the two hooks depend on each other,
 * and moving it is what keeps every `Pick` one-directional.
 */
const RESET_CALL = lines.findIndex((line) => /^    resetReviewAnnotations\(\);$/.test(line)) + 1;
if (RESET_CALL < 1) {
  throw new Error('Could not find the review-reset effect');
}
let resetStart = RESET_CALL;
while (resetStart > 1 && !/^  useEffect\(\(\) => \{$/.test(lines[resetStart - 1])) {
  resetStart -= 1;
}
let resetEnd = RESET_CALL;
while (resetEnd < RETURN && !/^  \}, \[[^\]]*resetReviewAnnotations[^\]]*\]\);$/.test(lines[resetEnd - 1])) {
  resetEnd += 1;
}
const resetEffect = text(resetStart, resetEnd);

const regions = {
  state: text(SIGNATURE + 1, MUTATIONS - 1),
  mutations: text(MUTATIONS, HANDLERS - 1),
  handlers: `${text(HANDLERS, DERIVED - 1)}\n${resetEffect}`,
  derived: `${text(DERIVED, resetStart - 1)}\n${text(resetEnd + 1, RETURN - 1)}`,
};
const returnBlock = text(RETURN, last);

/**
 * Identifiers in comments and strings are not uses; an apostrophe in prose is not code.
 * A template literal is not a use either — but its `${...}` interpolations are code, so
 * they are kept: `${EXPORT_EXTENSIONS[preset]}` in a download filename is a real reference.
 */
const strip = (value) =>
  value
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(^|[^:])\/\/[^\n]*/gm, '$1 ')
    .replace(/'(?:[^'\\\n]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""')
    .replace(/`(?:[^`\\]|\\.)*`/g, (literal) => {
      const interpolations = [...literal.matchAll(/\$\{([^}]*)\}/g)].map((match) => match[1]);
      return interpolations.length === 0 ? '``' : ` ${interpolations.join(' ')} `;
    });

const stripped = Object.fromEntries(Object.entries(regions).map(([key, body]) => [key, strip(body)]));
const used = (key, name) => new RegExp(`(?<![\\w.$])${name}(?![\\w$])`).test(stripped[key]);

/**
 * Names a region rebinds itself: a `catch (error)` binding is not a use of the `error` the
 * state hook declares, so it must not become a parameter (the linter says so exactly).
 */
const boundIn = (key) =>
  new Set([
    ...[...stripped[key].matchAll(/\bcatch\s*\(\s*(\w+)/g)].map((match) => match[1]),
    ...[...stripped[key].matchAll(/\b(?:const|let|var)\s+(\w+)/g)].map((match) => match[1]),
    ...[...stripped[key].matchAll(/\(([^()]*)\)\s*=>/g)].flatMap((match) =>
      match[1]
        .split(',')
        .map((entry) => entry.split(/[:=]/)[0].trim().replace(/^\.\.\./, ''))
        .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name)),
    ),
    ...[...stripped[key].matchAll(/(?:^|[\s(,])([A-Za-z_$][\w$]*)\s*=>/g)].map((match) => match[1]),
  ]);
const bound = Object.fromEntries(Object.keys(regions).map((key) => [key, boundIn(key)]));

/** A parameter is a use the region has not shadowed with a binding of its own. */
const needed = (key, name) => used(key, name) && !bound[key].has(name);

const KIND = /^ {2}(?:export )?(?:async )?(?:function|const|let|class|interface|type) (\w+)/gm;
const DESTRUCTURED = /^ {2}const (\{[^}]*\}|\[[^\]]*\]) =/gm;

/** Names a region declares at its own top level, destructured ones included. */
function declares(body) {
  const names = new Set([...body.matchAll(KIND)].map((match) => match[1]));
  for (const match of body.matchAll(DESTRUCTURED)) {
    for (const entry of match[1].slice(1, -1).split(',')) {
      const name = entry.split('=')[0].split(':').pop().trim().replace(/^\.\.\./, '');
      if (/^[A-Za-z_$][\w$]*$/.test(name)) {
        names.add(name);
      }
    }
  }
  return names;
}

const declared = {
  state: declares(regions.state),
  mutations: declares(regions.mutations),
  handlers: declares(regions.handlers),
  derived: declares(regions.derived),
};

const HOOK = {
  state: 'useDraftDetailState',
  mutations: 'useDraftDetailMutations',
  handlers: 'useDraftDetailHandlers',
  derived: 'useDraftDetailDerived',
};

/**
 * Who takes whom. Measured, not assumed: the derived values need only the state, the
 * mutations need only the state, one derived value (`exportReadiness`) is used by a
 * handler, and the handlers' region is the only one that uses the mutations.
 */
const SIBLINGS = {
  state: [],
  mutations: ['state'],
  derived: ['state'],
  handlers: ['state', 'mutations', 'derived'],
};

/** Import statements of the original file, multi-line ones kept whole. */
function parseImports(headerText) {
  const statements = [];
  let current = null;
  for (const line of headerText.split('\n')) {
    if (current === null) {
      if (/^import /.test(line)) {
        current = [line];
        if (line.trimEnd().endsWith(';')) {
          statements.push(current.join('\n'));
          current = null;
        }
      }
      continue;
    }
    current.push(line);
    if (line.trimEnd().endsWith(';')) {
      statements.push(current.join('\n'));
      current = null;
    }
  }
  return statements;
}

const importStatements = parseImports(header);
const imported = new Set();
for (const statement of importStatements) {
  const clause = statement
    .slice(0, statement.lastIndexOf(' from '))
    .replace(/^import\s+(?:type\s+)?/, '')
    .trim();
  const names = clause.startsWith('{')
    ? clause
        .slice(1, -1)
        .split(',')
        .map((entry) => entry.trim().split(/\s+/).pop())
        .filter(Boolean)
    : [clause.split(/\s+as\s+/).pop().trim()];
  for (const name of names) {
    imported.add(name);
  }
}

const moduleTypes = new Set([...header.matchAll(/^(?:export )?(?:interface|type) (\w+)/gm)].map((match) => match[1]));

/** The original file's imports, pruned to the names one region uses — plus re-exports. */
function importsFor(key, keep = new Set()) {
  return importStatements
    .map((statement) => {
      const specifier = statement.match(/from\s+['"]([^'"]+)['"]/)?.[1] ?? '';
      const isTypeOnly = /^import type /.test(statement);
      const clause = statement
        .slice(0, statement.lastIndexOf(' from '))
        .replace(/^import\s+(?:type\s+)?/, '')
        .trim();
      if (clause.startsWith('{')) {
        const keepEntry = (entry) => {
          const name = entry.split(/\s+/).pop();
          return used(key, name) || keep.has(name);
        };
        const entries = clause
          .slice(1, -1)
          .split(',')
          .map((entry) => entry.trim())
          .filter((entry) => entry && keepEntry(entry));
        return entries.length === 0
          ? null
          : `import ${isTypeOnly ? 'type ' : ''}{ ${entries.join(', ')} } from '${specifier}';`;
      }
      const name = clause.split(/\s+as\s+/).pop().trim();
      return used(key, name) || keep.has(name) ? `import ${clause} from '${specifier}';` : null;
    })
    .filter(Boolean)
    .join('\n');
}

/** The state or mutations a region uses, as one group per owning hook. */
function paramsFor(key, owners) {
  return owners
    .map((owner) => ({ owner, names: [...declared[owner]].filter((name) => needed(key, name)).sort() }))
    .filter((group) => group.names.length > 0);
}

const pick = ({ owner, names }) =>
  `Pick<ReturnType<typeof ${HOOK[owner]}>, ${names.map((name) => `'${name}'`).join(' | ')}>`;

/** The names a hook returns: what it declares, limited to what the screen destructured. */
const returned = [...returnBlock.matchAll(/^ {4}(\w+),$/gm)].map((match) => match[1]);
const ownerOf = (name) => Object.keys(declared).find((key) => declared[key].has(name)) ?? null;

const returns = { state: new Set(), mutations: new Set(), derived: new Set(), handlers: new Set() };
const unowned = [];
for (const name of returned) {
  const owner = ownerOf(name);
  if (owner) {
    returns[owner].add(name);
  } else if (imported.has(name) || moduleTypes.has(name)) {
    // Helpers the original hook re-exported stay on the state hook, which keeps the header.
    returns.state.add(name);
  } else {
    unowned.push(name);
  }
}
if (unowned.length > 0) {
  throw new Error(`The screen destructures names no region declares: ${unowned.join(', ')}`);
}
for (const name of returned) {
  if (!Object.values(returns).some((set) => set.has(name))) {
    throw new Error(`Partitioned away, so the screen would lose it: ${name}`);
  }
}

const returnObject = (names) => ['  return {', ...[...names].sort().map((name) => `    ${name},`), '  };'].join('\n');

/** Local types the region uses, which live in the state hook's header. */
function localTypeImports(key) {
  const names = [...moduleTypes].filter((name) => used(key, name)).sort();
  return names.length === 0 ? '' : `import type { ${names.join(', ')} } from './use-draft-detail-state';`;
}

const path = (key) => (key === 'state' ? './use-draft-detail-state' : `./use-draft-detail-${key}`);

/** One sibling hook: its imports, its parameters, its verbatim region, its return. */
function hookFile({ key, doc, params }) {
  const groups = params.filter((group) => group.owner !== key);
  const parameter = groups.map((group) => `  { ${group.names.join(', ')} }: ${pick(group)}`).join(',\n');
  const importBlock = [
    importsFor(key),
    localTypeImports(key),
    groups.length > 0
      ? [...new Set(groups.map((group) => group.owner))]
          .map((owner) => `import type { ${HOOK[owner]} } from '${path(owner)}';`)
          .join('\n')
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const declaration =
    groups.length > 0 ? `export function ${HOOK[key]}(\n${parameter},\n) {` : `export function ${HOOK[key]}() {`;
  return [
    ['/**', ...doc.map((line) => (line ? ` * ${line}` : ' *')), ' */'].join('\n'),
    importBlock,
    [declaration, regions[key], '', returnObject(declared[key]), '}'].join('\n'),
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}

/**
 * `react-hooks/exhaustive-deps` cannot see that the setters this hook takes as parameters
 * are `useState` setters from the state hook, so it reports them as missing dependencies.
 * They are stable, so listing them changes nothing at runtime — and listing them is the
 * rule's own suggestion, which beats disabling the rule across eight hundred moved lines.
 * Each pair is the original text and the text the rule asks for.
 */
const DEPENDENCY_FIXES = [
  [
    '  }, [draft?.metadata.review_annotations]);',
    '  }, [\n    draft?.metadata.review_annotations,\n    setReviewAssetNotesDraft,\n    setReviewAssetScoresDraft,\n    setReviewNotesDraft,\n    setReviewSaveFeedback,\n  ]);',
  ],
  ['  }, [draft, historySnapshotId, revisionSnapshots]);', '  }, [draft, historySnapshotId, revisionSnapshots, setSelectedSnapshotId]);'],
  [
    '  }, [compareSnapshotId, compareSnapshotOptions, draft]);',
    '  }, [compareSnapshotId, compareSnapshotOptions, draft, setCompareSnapshotId]);',
  ],
  [
    '  }, [draft, selectedSnapshotCandidateAssets]);',
    '  }, [draft, selectedSnapshotCandidateAssets, setSelectedSnapshotAssetName]);',
  ],
  [
    '      setPendingCompareSelection(getMobileCompareSelection());\n    }, []),',
    '      setPendingCompareSelection(getMobileCompareSelection());\n    }, [setPendingCompareSelection]),',
  ],
];

const appliedFixes = new Set();

/** Applies whichever of the fixes this text contains; the count is asserted afterwards. */
function applyDependencyFixes(text) {
  let out = text;
  for (const [from, to] of DEPENDENCY_FIXES) {
    if (out.includes(from)) {
      out = out.replace(from, to);
      appliedFixes.add(from);
    }
  }
  return out;
}

/**
 * The split changes what these files are, so the paragraph that describes them is rewritten
 * as well — in the script, so a re-run reproduces the committed bytes.
 */
const STATE_DOC = [
  " * The draft detail screen's helpers and state: the asset and review-annotation types,\n * the saved-intro parsing, the export tables, and everything the screen keeps in state\n * — the draft queries and mutations, the review editors, the comparison and lineage\n * data, and the export flow.\n *\n * Cut out of `DraftDetailScreen` verbatim — the screen keeps its JSX and destructures\n * what it renders, so the two halves cannot drift: a name the JSX needs is either on\n * this hook's return or a typecheck error.",
  " * The draft detail screen's state: the asset types, the draft and template queries, the\n * review editors, the snapshot comparison and lineage state, and the refs an intro\n * generation is cancelled through.\n *\n * Halved out of what was one hook: `useDraftDetailMutations`, `useDraftDetailDerived` and\n * `useDraftDetailHandlers` take what they need from this one as parameters, so the screen\n * composes a one-way chain and no hook calls another. A name the JSX needs is on one of the\n * four returns, or it is a typecheck error.",
];

const SECTION_DOC = [
  /Extracted from `DraftDetailScreen` verbatim: the screen passes the state it renders\n \* as `Pick<ReturnType<typeof useDraftDetailState>, …>`, so a missing prop and a missing\n \* state entry are both compile errors rather than blank sections\./,
  'Extracted from `DraftDetailScreen` verbatim: the screen passes the state it renders as\n * `Pick`s of the three draft-detail hooks — state, mutations and handlers — so a missing\n * prop and a missing state entry are both compile errors rather than blank sections.',
];

function docRewrite(text, file, pair) {
  const [from, to] = pair;
  const present = from instanceof RegExp ? from.test(text) : text.includes(from);
  if (!present) {
    throw new Error(`The doc paragraph in ${file} is not the one this split expects`);
  }
  return text.replace(from, to);
}

const mutationsHook = hookFile({
  key: 'mutations',
  doc: [
    'The draft detail mutations: every write the screen can make — the metadata and asset',
    'edits, the archives and deletes, the snapshots and restores — and the safeguard',
    'snapshot they share.',
    '',
    'Split out of `use-draft-detail-state` verbatim, with the state it works on taken as a',
    'parameter so the screen composes it after the state and before the handlers.',
  ],
  params: paramsFor('mutations', SIBLINGS.mutations),
});

const handlersHook = applyDependencyFixes(
  hookFile({
    key: 'handlers',
    doc: [
      'The draft detail handlers: the export flow, the intro, refinement and asset editors,',
      'the review annotations, the snapshot comparison, and the metadata and archive actions',
      'the header and the modals call.',
      '',
      'Split out of `use-draft-detail-state` verbatim. It takes the state, the mutations and the',
      'derived values as parameters, which makes the hooks a one-way chain the screen composes',
      'rather than a set of hooks that call each other.',
    ],
    params: paramsFor('handlers', SIBLINGS.handlers),
  }),
  HANDLERS_HOOK,
);

const derivedHook = applyDependencyFixes(
  hookFile({
    key: 'derived',
    doc: [
      'The values the draft detail screen derives for rendering: the revision snapshots and their',
      'comparison, the review annotations and scores, the related-draft lookup, and the export',
      'readiness the header reads.',
      '',
      'Split out of `use-draft-detail-state` verbatim. It needs only the state — a handler needs',
      'one of its values (`exportReadiness`), which is why it comes before the handlers.',
    ],
    params: paramsFor('derived', SIBLINGS.derived),
  }),
);

if (appliedFixes.size !== DEPENDENCY_FIXES.length) {
  throw new Error(`Applied ${appliedFixes.size} of ${DEPENDENCY_FIXES.length} dependency fixes`);
}

/**
 * The state hook keeps the header — the doc comment and the exported asset types stay put
 * — but its import block is pruned to what it still uses, plus the helpers it re-exports
 * for the screen. Everything else moved to the sibling that uses it.
 */
const importStart = lines.findIndex((line) => /^import /.test(line)) + 1;
let importEnd = importStart;
while (importEnd <= SIGNATURE - 1 && lines[importEnd - 1].trim() !== '') {
  importEnd += 1;
}
const stateTail = text(importEnd, SIGNATURE - 1);
/** The retained header tail counts as a use too: `AssetScoreMap` needs its score type. */
const stateKeeps = new Set([...returns.state, ...[...stateTail.matchAll(/\b[A-Za-z_$][\w$]*\b/g)].map((match) => match[0])]);
const stateHeader = [text(1, importStart - 1), importsFor('state', stateKeeps), stateTail].join('\n');

const stateHook = [
  stateHeader.trimEnd(),
  '',
  'export function useDraftDetailState() {',
  regions.state,
  '',
  // Everything it declares, so a sibling's `Pick` of this hook is always satisfiable,
  // plus the imported helpers the screen destructures from it.
  returnObject(new Set([...declared.state, ...returns.state])),
  '}',
  '',
].join('\n');

const hooks = {
  state: { file: STATE_HOOK, text: docRewrite(stateHook, STATE_HOOK, STATE_DOC) },
  mutations: { file: MUTATIONS_HOOK, text: mutationsHook },
  handlers: { file: HANDLERS_HOOK, text: handlersHook },
  derived: { file: DERIVED_HOOK, text: derivedHook },
};

/**
 * Proof the split moved code and changed none of it: each region is in its file as it was,
 * apart from the dependency arrays the lint rule asks for, which are listed above.
 */
for (const [key, { file, text }] of Object.entries(hooks)) {
  const expected = key === 'handlers' || key === 'derived' ? applyDependencyFixes(regions[key]) : regions[key];
  if (!text.includes(expected)) {
    throw new Error(`The ${key} region is not verbatim in ${file}`);
  }
  writePreserving(file, text);
}

// --- the screen: one call per hook, the same names as before, from the hook that owns them

const screen = readHead(SCREEN);
const screenLines = screen.split('\n');
const destructureStart = screenLines.findIndex((line) => /^  const \{$/.test(line));
const destructureEnd = screenLines.findIndex((line) => /^  \} = useDraftDetailState\(\);$/.test(line));
if (destructureStart < 0 || destructureEnd < 0) {
  throw new Error('Could not find the screen destructure');
}

const destructured = screenLines
  .slice(destructureStart + 1, destructureEnd)
  .map((line) => line.trim().replace(/,$/, ''))
  .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));

const owned = (name, key) => ownerOf(name) === key || (key === 'state' && ownerOf(name) === null);
const calls = [
  '  const state = useDraftDetailState();',
  '  const mutations = useDraftDetailMutations(state);',
  '  const derived = useDraftDetailDerived(state);',
  '  const handlers = useDraftDetailHandlers(state, mutations, derived);',
  ...Object.keys(returns)
    .map((key) => ({ key, names: destructured.filter((name) => owned(name, key)) }))
    .filter((group) => group.names.length > 0)
    .map((group) => `  const { ${group.names.join(', ')} } = ${group.key};`),
];

const screenOut = [...screenLines.slice(0, destructureStart), ...calls, ...screenLines.slice(destructureEnd + 1)];
const hookImport = screenOut.findIndex((line) => /^import \{ useDraftDetailState \}/.test(line));
if (hookImport < 0) {
  throw new Error('Could not find the screen hook import');
}
screenOut.splice(
  hookImport,
  1,
  `import { useDraftDetailDerived } from './draft-detail/use-draft-detail-derived';`,
  `import { useDraftDetailHandlers } from './draft-detail/use-draft-detail-handlers';`,
  `import { useDraftDetailMutations } from './draft-detail/use-draft-detail-mutations';`,
  `import { useDraftDetailState } from './draft-detail/use-draft-detail-state';`,
);
writePreserving(SCREEN, screenOut.join('\n'));

// --- the sections: Props becomes the three hooks' picks, one per owner

for (const file of SECTIONS) {
  const section = readHead(file);
  const match = section.match(/type Props = Pick<\n  ReturnType<typeof useDraftDetailState>,\n((?:  \| '[^']+'\n)+)>;/);
  if (!match) {
    throw new Error(`Could not find the Props type in ${file}`);
  }
  const names = [...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]);
  const groups = Object.keys(returns)
    .map((key) => ({ key, names: names.filter((name) => owned(name, key)) }))
    .filter((group) => group.names.length > 0);
  const replacement = [
    'type Props =',
    ...groups.map(
      (group, index) =>
        `  Pick<ReturnType<typeof ${HOOK[group.key]}>, ${group.names.map((name) => `'${name}'`).join(' | ')}>${
          index === groups.length - 1 ? ';' : ' &'
        }`,
    ),
  ].join('\n');
  const imports = groups
    .map((group) => `import type { ${HOOK[group.key]} } from '${path(group.key)}';`)
    .join('\n');
  const rewritten = docRewrite(
    section
      .replace(match[0], replacement)
      .replace(/import \{ useDraftDetailState \} from '\.\/use-draft-detail-state';/, imports),
    file,
    SECTION_DOC,
  );
  writePreserving(file, rewritten);
}

// --- report

console.log(`dependency arrays: ${DEPENDENCY_FIXES.length} listed as the lint rule asks`);

for (const key of Object.keys(regions)) {
  const groups = paramsFor(key, Object.keys(regions)).filter((group) => group.owner !== key);
  console.log(
    `${key}: ${regions[key].split('\n').length} lines in, ${returns[key].size} out, params ${groups
      .map((group) => `${group.owner}(${group.names.length})`)
      .join(' + ') || 'none'}`,
  );
}
console.log(
  `screen: ${destructured.length} destructured -> ${Object.keys(returns)
    .map((key) => `${key}(${destructured.filter((name) => owned(name, key)).length})`)
    .join(' ')}`,
);

// Prettier last: the generated wrappers are not laid out by hand, and `endOfLine: auto`
// keeps each file's own line endings.
execSync(`pnpm exec prettier --write ${[STATE_HOOK, MUTATIONS_HOOK, HANDLERS_HOOK, DERIVED_HOOK, SCREEN, ...SECTIONS].join(' ')}`, {
  stdio: 'inherit',
});
