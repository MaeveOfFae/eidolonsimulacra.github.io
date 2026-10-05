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

  const buildImports = (module) => {
    const uses = (name) => new RegExp(`\\b${name}\\b`).test(module.body);
    const blocks = [];

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
      const spec = `./${sibling.file.replace(/\.tsx?$/, '.js')}`;
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
  for (const decl of publicDecls) {
    const owner = built.find((module) => module.decls.some((d) => d.name === decl.name));
    if (!owner) {
      missing.push(decl.name);
      continue;
    }
    if (!byModule.has(owner.file)) {
      byModule.set(owner.file, []);
    }
    byModule.get(owner.file).push(decl);
  }
  if (missing.length > 0) {
    throw new Error(`Public names with no new home: ${missing.join(', ')}`);
  }

  const barrelBody = [...byModule]
    .map(([file, decls]) => {
      const spec = `./${config.dir.split('/').pop()}/${file.replace(/\.tsx?$/, '.js')}`;
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
    })
    .join('\n\n');

  writeFileSync(config.source, `${config.barrelDoc ?? ''}${barrelBody}\n`.replace(/\n/g, eol), 'utf8');

  return {
    files: built.map((module) => `${module.file}: ${module.names.length} declarations`),
    exports: publicDecls.length,
  };
}
