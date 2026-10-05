/**
 * Generic source splitter: moves verbatim line ranges into modules behind a barrel.
 *
 * Used for the 5.1 decomposition of the remaining oversized files. It only ever
 * moves text and generates imports/barrels — no rewriting — and it records each
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

const KIND_RE = /^(?:export )?(async function|function|const|let|class|interface|type) (\w+)/;
const TYPE_KINDS = new Set(['interface', 'type']);

export function split(config) {
  const raw = readFileSync(config.source, 'utf8');
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

  const built = config.modules.map((module) => {
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

  /**
   * Comments and string literals mention identifiers the code does not use. Stripping
   * both is what makes the per-name import filter accurate; if it ever strips too much,
   * the typecheck says so at once.
   */
  const stripComments = (text) =>
    text
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^[ \t]*\/\/.*$/gm, '')
      .replace(/'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"/g, "''");

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
  const head = execSync(`git show HEAD:${config.source}`, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const publicDecls = [
    ...head.replace(/\r\n/g, '\n').matchAll(/^export (async function|function|const|class|interface|type) (\w+)/gm),
  ].map((match) => ({ kind: match[1], name: match[2] }));

  const byModule = new Map();
  const missing = [];
  // With `keep`, names declared in the retained body stay in the source file, so they
  // are not expected to have a new home.
  const keepBodyText = config.keep ? slice(config.keep.from, config.keep.to) : '';
  for (const decl of publicDecls) {
    const home = built.find((module) => module.decls.some((d) => d.name === decl.name));
    if (!home) {
      if (config.keep && new RegExp(`\\b${decl.name}\\b`).test(keepBodyText)) {
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

  const barrelBody = [...byModule].map(([file, decls]) => blockFor(rename(file), decls)).join('\n\n');

  writeFileSync(config.source, `${config.barrelDoc ?? ''}${barrelBody}\n`.replace(/\n/g, eol), 'utf8');

  return {
    files: built.map((module) => `${module.file}: ${module.names.length} declarations`),
    exports: publicDecls.length,
  };
}
