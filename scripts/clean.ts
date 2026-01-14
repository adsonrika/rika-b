import fs from 'node:fs';
import path from 'node:path';

type CleanOptions = {
  all: boolean;
  workspaces: boolean;
};

function parseArgs(argv: string[]): CleanOptions {
  const all = argv.includes('--all');
  const workspaces = argv.includes('--workspaces');
  return { all, workspaces };
}

function findRepoRoot(startDir: string): string {
  let current = startDir;
  while (true) {
    const marker = path.join(current, 'pnpm-workspace.yaml');
    if (fs.existsSync(marker)) {
      return current;
    }
    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
}

function isDirectory(p: string): boolean {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function rmIfExists(targetPath: string): void {
  if (!fs.existsSync(targetPath)) {
    return;
  }
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function listWorkspaceDirs(repoRoot: string): string[] {
  const candidates = [
    path.join(repoRoot, 'apps'),
    path.join(repoRoot, 'packages'),
  ];

  const dirs: string[] = [];
  for (const parent of candidates) {
    if (!isDirectory(parent)) continue;
    for (const name of fs.readdirSync(parent)) {
      const full = path.join(parent, name);
      if (!isDirectory(full)) continue;
      if (fs.existsSync(path.join(full, 'package.json'))) {
        dirs.push(full);
      }
    }
  }
  return dirs;
}

function cleanOne(dir: string, options: CleanOptions): void {
  const targets = [
    'dist',
    'coverage',
    '.turbo',
    '.cache',
    '.vite',
    '.vitest',
    'node_modules/.vite',
    'node_modules/.cache',
  ];

  for (const rel of targets) {
    rmIfExists(path.join(dir, rel));
  }

  if (options.all) {
    rmIfExists(path.join(dir, 'node_modules'));
  }
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const repoRoot = findRepoRoot(cwd);

  if (options.workspaces) {
    const workspaceDirs = listWorkspaceDirs(repoRoot);
    for (const dir of workspaceDirs) {
      cleanOne(dir, options);
    }
    cleanOne(repoRoot, options);
    return;
  }

  cleanOne(cwd, options);
}

main();
