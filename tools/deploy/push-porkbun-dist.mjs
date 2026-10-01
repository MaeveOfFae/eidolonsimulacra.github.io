#!/usr/bin/env node

import { mkdtemp, readdir, rm, mkdir, cp, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

function usage() {
  console.log(`Usage: node ./tools/deploy/push-porkbun-dist.mjs [options]

Push the current web dist output to a deploy-only branch.

Options:
  --build            Run pnpm build:web before pushing
  --branch NAME      Target branch (default: porkbun-deploy)
  --remote NAME      Remote name (default: origin)
  --source PATH      Dist directory to publish (default: packages/web/dist)
  --message TEXT     Commit message (default: Publish web dist build)
  --help             Show this help text

Examples:
  node ./tools/deploy/push-porkbun-dist.mjs --build
  node ./tools/deploy/push-porkbun-dist.mjs --remote origin --branch porkbun-deploy`);
}

function getExecutable(name) {
  if (process.platform === 'win32') {
    if (name === 'pnpm') {
      return 'pnpm.cmd';
    }
  }

  return name;
}

function run(command, args, options = {}) {
  const executable = getExecutable(command);
  const result = spawnSync(executable, args, {
    cwd: options.cwd,
    // Windows: Node (>= 18.20 / 20.12, CVE-2024-27980) refuses to spawn
    // `.cmd`/`.bat` shims such as pnpm.cmd without a shell. Only the pnpm
    // invocation goes through this path, and its arguments are fixed by this
    // script, so shell mode is safe here.
    shell: process.platform === 'win32' && executable.endsWith('.cmd'),
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : (options.stdio ?? 'inherit'),
    encoding: 'utf8',
  });

  if (result.error) {
    throw result.error;
  }

  if (!options.allowFailure && result.status !== 0) {
    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    const output = stderr || stdout;
    throw new Error(output || `${command} ${args.join(' ')} failed with exit code ${result.status}`);
  }

  return result;
}

function requireOptionValue(args, index, flag) {
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`Missing value for ${flag}`);
  }
  return value;
}

function parseArgs(argv) {
  const options = {
    branch: 'porkbun-deploy',
    remote: 'origin',
    sourceDir: 'packages/web/dist',
    commitMessage: 'Publish web dist build',
    runBuild: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case '--build':
        options.runBuild = true;
        break;
      case '--branch':
        options.branch = requireOptionValue(argv, index, arg);
        index += 1;
        break;
      case '--remote':
        options.remote = requireOptionValue(argv, index, arg);
        index += 1;
        break;
      case '--source':
        options.sourceDir = requireOptionValue(argv, index, arg);
        index += 1;
        break;
      case '--message':
        options.commitMessage = requireOptionValue(argv, index, arg);
        index += 1;
        break;
      case '--help':
      case '-h':
        usage();
        process.exit(0);
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

async function removeTopLevelEntries(targetDir, keepNames) {
  const entries = await readdir(targetDir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    if (keepNames.has(entry.name)) {
      return;
    }

    await rm(path.join(targetDir, entry.name), { recursive: true, force: true });
  }));
}

async function copyTopLevelEntries(sourceDir, targetDir, skipNames) {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    if (skipNames.has(entry.name)) {
      return;
    }

    await cp(path.join(sourceDir, entry.name), path.join(targetDir, entry.name), {
      recursive: true,
      force: true,
    });
  }));
}

async function copyDirectoryContents(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    await cp(path.join(sourceDir, entry.name), path.join(targetDir, entry.name), {
      recursive: true,
      force: true,
    });
  }));
}

function branchExists(repoRoot, remote, branch) {
  const result = run('git', ['-C', repoRoot, 'show-ref', '--verify', '--quiet', `refs/remotes/${remote}/${branch}`], {
    allowFailure: true,
    capture: true,
  });

  return result.status === 0;
}

async function syncBranchWorktrees({ repoRoot, remote, branch, tempDir }) {
  const branchRef = `refs/heads/${branch}`;
  const result = run('git', ['-C', repoRoot, 'worktree', 'list', '--porcelain'], { capture: true });
  const lines = result.stdout.split(/\r?\n/);

  let worktreePath = '';
  let worktreeBranch = '';

  for (const line of lines) {
    if (line.startsWith('worktree ')) {
      worktreePath = line.slice('worktree '.length);
      worktreeBranch = '';
      continue;
    }

    if (!line.startsWith('branch ')) {
      continue;
    }

    worktreeBranch = line.slice('branch '.length);

    if (worktreeBranch !== branchRef || !worktreePath || worktreePath === tempDir) {
      continue;
    }

    console.log(`Syncing local deploy worktree: ${worktreePath}`);

    run('git', ['-C', worktreePath, 'fetch', remote, branch], {
      allowFailure: true,
      stdio: 'ignore',
    });

    const mergeResult = run('git', ['-C', worktreePath, 'merge', '--ff-only', `${remote}/${branch}`], {
      allowFailure: true,
      stdio: 'ignore',
    });

    if (mergeResult.status !== 0) {
      console.error(`Warning: could not fast-forward ${worktreePath} to ${remote}/${branch}.`);
      console.error(`Warning: run git -C "${worktreePath}" reset --hard "${remote}/${branch}" if you want to force it into sync.`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = run('git', ['rev-parse', '--show-toplevel'], { capture: true }).stdout.trim();
  const sourcePath = path.resolve(repoRoot, options.sourceDir);

  if (options.runBuild) {
    console.log('Building web app...');
    run('pnpm', ['build:web'], { cwd: repoRoot });
  }

  let sourceStats;
  try {
    sourceStats = await stat(sourcePath);
  } catch {
    sourceStats = null;
  }

  if (!sourceStats?.isDirectory()) {
    throw new Error(`Dist directory not found: ${sourcePath}\nRun pnpm build:web first or use --build.`);
  }

  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'porkbun-deploy-'));

  const cleanup = async () => {
    run('git', ['-C', repoRoot, 'worktree', 'remove', '--force', tempDir], {
      allowFailure: true,
      stdio: 'ignore',
    });
    await rm(tempDir, { recursive: true, force: true });
  };

  process.on('SIGINT', () => {
    cleanup().finally(() => process.exit(130));
  });

  process.on('SIGTERM', () => {
    cleanup().finally(() => process.exit(143));
  });

  try {
    console.log('Preparing deploy worktree...');
    run('git', ['-C', repoRoot, 'fetch', options.remote, options.branch], {
      allowFailure: true,
      stdio: 'ignore',
    });

    const baseRef = branchExists(repoRoot, options.remote, options.branch)
      ? `${options.remote}/${options.branch}`
      : 'HEAD';

    run('git', ['-C', repoRoot, 'worktree', 'add', '--detach', tempDir, baseRef], {
      stdio: 'ignore',
    });

    await removeTopLevelEntries(tempDir, new Set(['.git', 'assets']));
    await copyTopLevelEntries(sourcePath, tempDir, new Set(['assets']));

    const assetsPath = path.join(sourcePath, 'assets');
    let assetsStats;
    try {
      assetsStats = await stat(assetsPath);
    } catch {
      assetsStats = null;
    }

    if (assetsStats?.isDirectory()) {
      const tempAssetsPath = path.join(tempDir, 'assets');
      await mkdir(tempAssetsPath, { recursive: true });
      await copyDirectoryContents(assetsPath, tempAssetsPath);
    }

    run('git', ['-C', tempDir, 'add', '-A']);

    const diffResult = run('git', ['-C', tempDir, 'diff', '--cached', '--quiet'], {
      allowFailure: true,
      capture: true,
    });

    if (diffResult.status === 0) {
      await syncBranchWorktrees({
        repoRoot,
        remote: options.remote,
        branch: options.branch,
        tempDir,
      });
      console.log(`No deploy changes detected. ${options.branch} already matches ${options.sourceDir}.`);
      return;
    }

    if (diffResult.status !== 1) {
      throw new Error('Unable to determine deploy diff status.');
    }

    run('git', ['-C', tempDir, 'commit', '-m', options.commitMessage], {
      stdio: 'ignore',
    });

    console.log(`Pushing ${options.sourceDir} to ${options.remote}/${options.branch}...`);
    run('git', ['-C', tempDir, 'push', '--force-with-lease', options.remote, `HEAD:refs/heads/${options.branch}`]);

    await syncBranchWorktrees({
      repoRoot,
      remote: options.remote,
      branch: options.branch,
      tempDir,
    });

    console.log(`Done. Published ${options.sourceDir} to ${options.remote}/${options.branch}.`);
  } finally {
    await cleanup();
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});