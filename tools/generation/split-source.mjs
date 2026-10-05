/**
 * Generic source splitter: moves verbatim line ranges into modules behind a barrel.
 *
 * Used for the 5.1 decomposition of the remaining oversized files. It only ever
 * moves text and generates imports/barrels â€” no rewriting â€” and it records each
 * declaration's *kind* so type-only re-exports use `export type`, which
 * `isolatedModules` requires (learned the hard way on the lore split).
 *
 * Config shape:
 *   source: path to the file being split
 *   dir:    directory for the extracted modules
 *   modules: [{ file, from, to, doc }]
 *   external: [{ specifier, names: [...] }]  // candidate imports, resolved per module
 *   comments: line ranges that are documentation to keep with a module (optional)
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';

const KIND_RE = /^(?:export )?(async function|function|const|let|class|interface|type) (\w+)/;
const TYPE_KINDS = new Set(['interface', 'type']);

export function split(config) {
  const raw = readFileSync(config.source, 'utf8').replace(/^\uFEFF/, '');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const slice = (from, to) => lines.slice(from - 1, to).join('\n');

  /** Every top-level declaration in a body, with its kind. */
  const declarations = (body) =>
    [...body.matchAll(new RegExp(KIND_RE.source, 'gm'))].map((match) => ({
      kind: match[1],
      name: match[2],
    }));

  /** Add `export` where a declaration is not already exported. */
  const exportify = (body, names) =>
    names.reduce((out, name) => {
      if (new RegExp(`^export (?:async function|function|const|let|class|interface|type) ${name}\\b`, 'm').test(out)) {
        return out;
      }
      const pattern = new RegExp(`^(async function|function|const|let|class|interface|type) ${name}\\b`, 'm');
      if (!pattern.test(out)) {
        throw new Error(`No top-level declaration for ${name}`);
      }
      return out.replace(pattern, `export $1 ${name}`);
    }, body);

  const built = (config.modules ?? []).map((module) => {
    const body = slice(module.from, module.to);
    const decls = declarations(body);
    return { ...module, body, decls, names: decls.map((d) => d.name) };
  });

  const bodies = new Map(built.map((module) => [module.file, exportify(module.body, module.names)]));

  /** Parse the source's import block into statements with their imported names. */
  const parseSourceImports = () => {
    const statements = [];
    let current = null;

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^import /.test(line)) {
        if (current) {
          statements.push(current);
        }
        current = line;
      } else if (current && /^(?:\s|\})/.test(line)) {
        current += `\n${line}`;
        if (/;\s*$/.test(line) && /from\s+['"]/.test(current)) {
          statements.push(current);
          current = null;
        }
      } else if (current) {
        statements.push(current);
        current = null;
      } else if (/^(?:const|function|class|interface|type|export|let|var|async|@) /.test(line)) {
        break;
      }
    }
    if (current) {
      statements.push(current);
    }

    const keywords = new Set(['import', 'type', 'from', 'as']);
    return statements
      .filter((text) => /from\s+['"]/.test(text))
      .map((text) => {
        const specifier = text.match(/from\s+['"]([^'"]+)['"]/)?.[1] ?? '';
        const names = [...text.slice(0, text.indexOf('from')).matchAll(/\b([A-Za-z_$][\w$]*)\b/g)]
          .map((match) => match[1])
          .filter((name) => !keywords.has(name));
        return { text: text.trimEnd(), specifier, names };
      });
  };

  const sourceImports = parseSourceImports();

  /** True when the extracted module lives in a different directory and paths must deepen. */
  const moduleIsElsewhere = relative(dirname(config.source), config.dir) !== '';

  /**
   * Comments and string literals mention identifiers the code does not use. Stripping
   * both is what makes the per-name import filter accurate; if it ever strips too much,
   * the typecheck says so at once. The string patterns are deliberately line-scoped:
   * an apostrophe in a sentence ("the screen's state") must not open a string that
   * swallows real code further down.
   */
  const stripComments = (text) =>
    text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
      .replace(/'[^'\n]*'|"[^"\n]*"/g, "''");

  /**
   * Rebuild an import statement with only the names a body uses. Filtering whole
   * statements is not enough: a file's shared imports are usually one long brace list,
   * so keeping the statement keeps every unused name in it.
   */
  const selectNames = (statement, uses) => {
    const isTypeOnly = /^import\s+type\s/.test(statement.text);
    const clause = statement.text
      .slice(0, statement.text.indexOf(' from '))
      .replace(/^import\s+/, '')
      .replace(/^type\s+/, '')
      .trim();

    // Default, namespace (`* as X`) and any other clause: find the bound identifier.
    if (!clause.startsWith('{')) {
      const target = clause.replace(/^\*\s*as\s+/, '').match(/[A-Za-z_$][\w$]*/)?.[0];
      // Unparseable clauses are kept rather than dropped: lint will flag an unused one,
      // whereas dropping a used one breaks the build with no clue why.
      return !target || uses(target) ? statement.text : null;
    }

    const inner = clause.slice(clause.indexOf('{') + 1, clause.lastIndexOf('}'));
    const entries = inner
      .split(',')
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      // `X as Y` is kept when either side is used; `type` is a modifier, not a name.
      .filter((entry) => entry.split(/\s+/).some((word) => word !== 'as' && word !== 'type' && uses(word)));

    if (entries.length === 0) {
      return null;
    }
    return `${isTypeOnly ? 'import type' : 'import'} { ${entries.join(', ')} } from '${statement.specifier}';`;
  };

  /** One directory deeper: `./x` -> `../x`, `../y` -> `../../y`, packages untouched. */
  const deepen = (text) =>
    text.replace(/from\s+(['"])(\.\.?\/)/g, (_, quote, path) => `from ${quote}../${path.replace(/^\.\//, '')}`);

  /** A sibling module's specifier: `./x` from inside the directory, `./dir/x` from the source. */
  const siblingSpec = (file, fromSource) =>
    `${fromSource ? `./${config.dir.split('/').pop()}/` : './'}${file.replace(/\.tsx?$/, config.extension ?? '.js')}`;

  const buildImports = (module) => {
    const body = stripComments(module.body);
    const uses = (name) => new RegExp(`\\b${name}\\b`).test(body);
    const blocks = [];

    // What the source file already imported, resolved per module by usage.
    for (const statement of sourceImports) {
      const selected = selectNames(statement, uses);
      if (selected) {
        blocks.push(deepen(selected));
      }
    }

    for (const group of config.external ?? []) {
      const needed = group.names.filter(uses).sort();
      if (needed.length > 0) {
        blocks.push(
          `import ${group.typeOnly ? 'type ' : ''}{\n${needed.map((n) => `  ${n},`).join('\n')}\n} from '${group.specifier}';`,
        );
      }
    }

    for (const sibling of built) {
      if (sibling.file === module.file) {
        continue;
      }
      const extension = config.extension ?? '.js';
      const spec = `./${sibling.file.replace(/\.tsx?$/, extension)}`;
      const wanted = sibling.decls.filter((decl) => uses(decl.name));
      const values = wanted
        .filter((decl) => !TYPE_KINDS.has(decl.kind))
        .map((decl) => decl.name)
        .sort();
      const types = wanted
        .filter((decl) => TYPE_KINDS.has(decl.kind))
        .map((decl) => decl.name)
        .sort();

      if (values.length > 0) {
        blocks.push(`import {\n${values.map((n) => `  ${n},`).join('\n')}\n} from '${spec}';`);
      }
      if (types.length > 0) {
        blocks.push(`import type {\n${types.map((n) => `  ${n},`).join('\n')}\n} from '${spec}';`);
      }
    }

    return blocks.join('\n');
  };

  mkdirSync(config.dir, { recursive: true });
  for (const module of built) {
    const content = `/**\n * ${module.doc}\n *\n * Split out of \`${config.source.split('/').pop()}\`, which is now a barrel over these modules.\n */\n${buildImports(module)}\n\n${bodies.get(module.file)}\n`;
    writeFileSync(`${config.dir}/${module.file}`, content.replace(/\n/g, eol), 'utf8');
  }

  // The barrel, generated from the pre-split export list so nothing is dropped.
  const head = execSync(`git show HEAD:${config.source}`, {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  }).replace(/^\uFEFF/, '');
  const publicDecls = [
    ...head.replace(/\r\n/g, '\n').matchAll(/^export (async function|function|const|class|interface|type) (\w+)/gm),
  ].map((match) => ({ kind: match[1], name: match[2] }));

  const byModule = new Map();
  const missing = [];
  // Names declared in the retained part of the file stay where they are, so they are not
  // expected to have a new home â€” this applies to `keep` and to a `cut`.
  const keepBodyText = config.keep
    ? slice(config.keep.from, config.keep.to)
    : config.cut
      ? lines.filter((_, index) => !config.cut.some(({ from, to }) => index + 1 >= from && index + 1 <= to)).join('\n')
      : '';
  for (const decl of publicDecls) {
    const home = built.find((module) => module.decls.some((d) => d.name === decl.name));
    if (!home) {
      if ((config.keep || config.cut) && new RegExp(`\\b${decl.name}\\b`).test(keepBodyText)) {
        continue;
      }
      missing.push(decl.name);
      continue;
    }
    if (!byModule.has(home.file)) {
      byModule.set(home.file, []);
    }
    byModule.get(home.file).push(decl);
  }
  if (missing.length > 0) {
    throw new Error(`Public names with no new home: ${missing.join(', ')}`);
  }

  const headLines = head.replace(/\r\n/g, '\n').split('\n');

  const rename = (file) => `./${config.dir.split('/').pop()}/${file.replace(/\.tsx?$/, config.extension ?? '.js')}`;

  const blockFor = (spec, decls) => {
    const values = decls.filter((d) => !TYPE_KINDS.has(d.kind)).map((d) => d.name);
    const types = decls.filter((d) => TYPE_KINDS.has(d.kind)).map((d) => d.name);
    const blocks = [];
    if (values.length > 0) {
      blocks.push(`export {\n${values.map((n) => `  ${n},`).join('\n')}\n} from '${spec}';`);
    }
    if (types.length > 0) {
      blocks.push(`export type {\n${types.map((n) => `  ${n},`).join('\n')}\n} from '${spec}';`);
    }
    return blocks.join('\n');
  };

  const moduleFor = new Map();
  for (const [file, decls] of byModule) {
    for (const decl of decls) {
      moduleFor.set(decl.name, file);
    }
  }

  // With `keep`, the source file stays what it was and only the extracted parts leave it.
  if (config.keep) {
    const keepBody = slice(config.keep.from, config.keep.to);
    const firstImport = headLines.findIndex((line) => /^import /.test(line));
    const header = headLines
      .slice(0, firstImport < 0 ? 0 : firstImport)
      .join('\n')
      .replace(/\n+$/, '');

    const keepBodyCode = stripComments(keepBody);
    const uses = (name) => new RegExp(`\\b${name}\\b`).test(keepBodyCode);
    const imports = [];

    // The original import block, rebuilt to the names the retained body still uses.
    if (config.keepImports !== false && firstImport >= 0) {
      for (const statement of sourceImports) {
        const selected = selectNames(statement, uses);
        if (selected) {
          imports.push(selected);
        }
      }
    }

    for (const group of config.keepExternal ?? []) {
      const needed = group.names.filter(uses).sort();
      if (needed.length > 0) {
        imports.push(
          `import ${group.typeOnly ? 'type ' : ''}{\n${needed.map((n) => `  ${n},`).join('\n')}\n} from '${group.specifier}';`,
        );
      }
    }
    for (const module of built) {
      const wanted = module.decls.filter((decl) => uses(decl.name));
      const values = wanted
        .filter((d) => !TYPE_KINDS.has(d.kind))
        .map((d) => d.name)
        .sort();
      const types = wanted
        .filter((d) => TYPE_KINDS.has(d.kind))
        .map((d) => d.name)
        .sort();
      const spec = siblingSpec(module.file, true);
      if (values.length > 0) {
        imports.push(`import {\n${values.map((n) => `  ${n},`).join('\n')}\n} from '${spec}';`);
      }
      if (types.length > 0) {
        imports.push(`import type {\n${types.map((n) => `  ${n},`).join('\n')}\n} from '${spec}';`);
      }
    }

    // Anything public that moved out is re-exported, so the module's surface holds.
    const moved = publicDecls.filter((decl) => !uses(decl.name));
    const grouped = new Map();
    for (const decl of moved) {
      const file = moduleFor.get(decl.name);
      if (!grouped.has(file)) {
        grouped.set(file, []);
      }
      grouped.get(file).push(decl);
    }
    const reexports = [...grouped].map(([file, decls]) => blockFor(rename(file), decls));

    writeFileSync(
      config.source,
      `${header}\n\n${[...imports, ...reexports].join('\n')}\n\n${keepBody}\n`.replace(/\n/g, eol),
      'utf8',
    );

    return {
      files: built.map((module) => `${module.file}: ${module.names.length} declarations`),
      exports: publicDecls.length,
      kept: `${keepBody.split('\n').length} lines kept, ${moved.length} exports re-exported`,
    };
  }

  // --- With `cut`, an interior range (or several) leaves the file, which keeps the rest.
  if (config.cut) {
    const cuts = config.cut;
    const inCut = (index) => cuts.some(({ from, to }) => index + 1 >= from && index + 1 <= to);

    const firstImportIndex = headLines.findIndex((line) => /^import /.test(line));
    const importEnd = (() => {
      let index = firstImportIndex;
      while (index < headLines.length) {
        const line = headLines[index];
        if (
          /^(?:import |\} from |^$|\s)/.test(line) &&
          !/^(?:const|function|class|interface|type|export|let|var|async) /.test(line)
        ) {
          index += 1;
          continue;
        }
        break;
      }
      return index;
    })();

    const header = headLines
      .slice(0, firstImportIndex < 0 ? 0 : firstImportIndex)
      .join('\n')
      .replace(/\n+$/, '');
    const rawLines = config.source.includes('.tsx') ? lines : lines;
    const cutBody = rawLines.filter((_, index) => inCut(index)).join('\n');
    const retainedBody = rawLines.filter((_, index) => index >= importEnd && !inCut(index)).join('\n');

    const module = config.cutModule;
    const wrap = module.wrap;

    /** Strip the common leading indent so a range taken from inside a function becomes
     *  module-level code. */
    const dedent = (text) => {
      const rows = text.split('\n').filter((line) => line.trim() !== '');
      const indent = Math.min(...rows.map((line) => line.match(/^ */)[0].length));
      return text
        .split('\n')
        .map((line) => line.slice(indent))
        .join('\n');
    };

    // A cut with no `wrap` is a plain module: the range is dedented, exported, and the
    // source imports whatever it still uses.
    if (!wrap) {
      const dedented = dedent(cutBody);
      const cutDecls = [
        ...dedented.matchAll(/^(?:export )?(async function|function|const|let|class|interface|type) (\w+)/gm),
      ].map((match) => ({ kind: match[1], name: match[2] }));
      const exportedBody = exportify(
        dedented,
        cutDecls.map((decl) => decl.name),
      );

      const moduleImports = sourceImports
        .map((statement) => selectNames(statement, (name) => new RegExp(`\\b${name}\\b`).test(stripComments(dedented))))
        .filter(Boolean)
        .map((statement) => (moduleIsElsewhere ? deepen(statement) : statement));

      for (const group of config.external ?? []) {
        const needed = group.names.filter((name) => new RegExp(`\\b${name}\\b`).test(stripComments(dedented)));
        if (needed.length > 0) {
          moduleImports.push(
            `import ${group.typeOnly ? 'type ' : ''}{\n${needed.map((n) => `  ${n},`).join('\n')}\n} from '${group.specifier}';`,
          );
        }
      }

      const relDir = relative(dirname(config.source), config.dir).replace(/\\/g, '/');
      const moduleSpec = `${relDir.startsWith('.') ? relDir : `./${relDir}`}/${module.file.replace(/\.tsx?$/, config.extension ?? '.js')}`;
      const retainedUses = (name) => new RegExp(`\\b${name}\\b`).test(stripComments(retainedBody));
      const values = cutDecls.filter((decl) => !TYPE_KINDS.has(decl.kind) && retainedUses(decl.name));
      const types = cutDecls.filter((decl) => TYPE_KINDS.has(decl.kind) && retainedUses(decl.name));
      const importLines = [
        ...(values.length > 0
          ? [`import {\n${values.map((decl) => `  ${decl.name},`).join('\n')}\n} from '${moduleSpec}';`]
          : []),
        ...(types.length > 0
          ? [`import type {\n${types.map((decl) => `  ${decl.name},`).join('\n')}\n} from '${moduleSpec}';`]
          : []),
      ];

      const sourceImportsFor = sourceImports
        .map((statement) =>
          selectNames(statement, (name) => new RegExp(`\\b${name}\\b`).test(stripComments(retainedBody))),
        )
        .filter(Boolean);

      mkdirSync(config.dir, { recursive: true });
      writeFileSync(
        `${config.dir}/${module.file}`,
        `${module.doc}\n\n${moduleImports.join('\n')}\n\n${exportedBody}\n`.replace(/\n/g, eol),
        'utf8',
      );
      writeFileSync(
        config.source,
        `${header}\n\n${sourceImportsFor.join('\n')}\n${importLines.join('\n')}\n\n${retainedBody}\n`.replace(
          /\n/g,
          eol,
        ),
        'utf8',
      );

      return {
        files: [`${module.file}: ${cutDecls.length} declarations`],
        exports: publicDecls.length,
        kept: `${retainedBody.split('\n').length} lines retained, ${cutDecls.length} moved to a module`,
      };
    }

    // Values the retained body needs handed back. Anchored at one indent level, which is
    // where a component body keeps its state and handlers â€” matching column 0 here (as
    // the top-level module scans do) would find only the file's own types.
    const cutDecls = [
      ...cutBody.matchAll(/^ {0,2}(?:export )?(async function|function|const|let|class|interface|type) (\w+)/gm),
    ].map((match) => ({ kind: match[1], name: match[2] }));

    // Destructured state (`const { colors } = useTheme()`, `const [seed, setSeed] = useState()`)
    // is where most of a component's locals come from, so those names count too.
    const destructured = [...cutBody.matchAll(/^ {0,2}const (\{[^}]*\}|\[[^\]]*\]) =/gm)].flatMap((match) =>
      match[1]
        .slice(1, -1)
        .split(',')
        .map((entry) =>
          entry
            .split('=')[0]
            .split(':')
            .pop()
            .trim()
            .replace(/^\.\.\./, ''),
        )
        .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name)),
    );
    for (const name of destructured) {
      if (!cutDecls.some((decl) => decl.name === name)) {
        cutDecls.push({ kind: 'const', name });
      }
    }

    const retainedUses = (name) => new RegExp(`\\b${name}\\b`).test(stripComments(retainedBody));

    // Type declarations have to sit at module scope to be exportable, so they are split
    // out of the cut body and hoisted above the hook; only values can be returned.
    const cutLines = cutBody.split('\n');
    const typeBlocks = [];
    const valueLines = [];
    for (let index = 0; index < cutLines.length; index += 1) {
      const line = cutLines[index];
      if (/^(?:export )?(?:type|interface) /.test(line)) {
        let depth = 0;
        let block = [line];
        const opensBrace = line.includes('{');
        if (opensBrace) {
          depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
          while (depth > 0 && index + 1 < cutLines.length) {
            index += 1;
            block.push(cutLines[index]);
            depth += (cutLines[index].match(/\{/g) ?? []).length - (cutLines[index].match(/\}/g) ?? []).length;
          }
        } else if (!/;\s*$/.test(line)) {
          while (index + 1 < cutLines.length && !/;\s*$/.test(cutLines[index])) {
            index += 1;
            block.push(cutLines[index]);
          }
        }
        typeBlocks.push(block.join('\n'));
        continue;
      }
      valueLines.push(line);
    }

    const typeNames = typeBlocks
      .map((block) => block.match(/^(?:export )?(?:type|interface) (\w+)/)?.[1])
      .filter(Boolean);
    const exportedTypes = typeBlocks.map((block) => (/^export /.test(block) ? block : `export ${block}`)).join('\n\n');

    const hookDecls = new Set(cutDecls.map((decl) => decl.name));
    const returned = cutDecls
      .filter((decl) => !TYPE_KINDS.has(decl.kind))
      .map((decl) => decl.name)
      .filter((name, index, all) => all.indexOf(name) === index && hookDecls.has(name) && retainedUses(name))
      .sort();

    const moduleImports = sourceImports
      .map((statement) => selectNames(statement, (name) => new RegExp(`\\b${name}\\b`).test(stripComments(cutBody))))
      .filter(Boolean)
      .map((statement) => (moduleIsElsewhere ? deepen(statement) : statement));

    for (const group of config.external ?? []) {
      const needed = group.names.filter((name) =>
        new RegExp(`\\b${name}\\b`).test(stripComments(`${wrap.open}\n${cutBody}`)),
      );
      if (needed.length > 0) {
        moduleImports.push(
          `import ${group.typeOnly ? 'type ' : ''}{\n${needed.map((n) => `  ${n},`).join('\n')}\n} from '${group.specifier}';`,
        );
      }
    }

    const content = `${module.doc}\n\n${moduleImports.join('\n')}\n${exportedTypes ? `\n${exportedTypes}\n` : ''}\n${wrap.open}\n${valueLines.join('\n')}\n\n  return {\n${returned
      .map((name) => `    ${name},`)
      .join('\n')}\n  };\n${wrap.close}\n`;

    mkdirSync(config.dir, { recursive: true });
    writeFileSync(`${config.dir}/${module.file}`, content.replace(/\n/g, eol), 'utf8');

    const sourceImportsFor = sourceImports
      .map((statement) =>
        selectNames(statement, (name) => new RegExp(`\\b${name}\\b`).test(stripComments(retainedBody))),
      )
      .filter(Boolean);
    const relDirForSpec = relative(dirname(config.source), config.dir).replace(/\\/g, '/');
    const moduleSpec = `${relDirForSpec.startsWith('.') ? relDirForSpec : `./${relDirForSpec}`}/${module.file.replace(/\.tsx?$/, config.extension ?? '.js')}`;
    const typeImports = typeNames.filter(retainedUses).sort();
    const moduleImportLines = [
      `import { ${wrap.importName} } from '${moduleSpec}';`,
      ...(typeImports.length > 0 ? [`import type { ${typeImports.join(', ')} } from '${moduleSpec}';`] : []),
    ].join('\n');

    // The destructure belongs inside the hook: after its signature when the first retained
    // line is not the signature (a file can begin with type declarations).
    const retainedLines = retainedBody.split('\n');
    const insertPattern = config.cutInsertAfter ? new RegExp(config.cutInsertAfter) : null;
    const beforePattern = config.cutInsertBefore ? new RegExp(config.cutInsertBefore) : null;
    let insertIndex = 0;
    if (beforePattern) {
      const found = retainedLines.findIndex((line) => beforePattern.test(line));
      insertIndex = found >= 0 ? found : 0;
    } else if (insertPattern) {
      const found = retainedLines.findIndex((line) => insertPattern.test(line));
      insertIndex = found >= 0 ? found + 1 : 0;
    } else {
      retainedLines.shift();
    }
    const destructure = `  const { ${returned.join(', ')} } = ${wrap.importName}(${config.cutCall ?? ''});`;

    writeFileSync(
      config.source,
      `${header}\n\n${sourceImportsFor.join('\n')}\n${moduleImportLines}\n\n${retainedLines
        .slice(0, insertIndex)
        .join('\n')}\n${destructure}\n${retainedLines.slice(insertIndex).join('\n')}\n`.replace(/\n/g, eol),
      'utf8',
    );

    return {
      files: [`${module.file}: ${returned.length} returned, ${moduleImports.length} imports`],
      exports: publicDecls.length,
      kept: `${retainedBody.split('\n').length} lines retained, ${cutBody.split('\n').length} cut`,
    };
  }

  const barrelBody = [...byModule].map(([file, decls]) => blockFor(rename(file), decls)).join('\n\n');

  writeFileSync(config.source, `${config.barrelDoc ?? ''}${barrelBody}\n`.replace(/\n/g, eol), 'utf8');

  return {
    files: built.map((module) => `${module.file}: ${module.names.length} declarations`),
    exports: publicDecls.length,
  };
}
