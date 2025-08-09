#!/usr/bin/env node
// Install Agent-OS git hooks
const fs = require('fs');
const path = require('path');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function makeExecutable(filePath) {
  try {
    fs.chmodSync(filePath, 0o755);
  } catch (_e) {
    // ignore on Windows
  }
}

function main() {
  const repoRoot = process.cwd();
  const srcHook = path.join(repoRoot, '.agent-os', 'hooks', 'pre-commit');
  const destHook = path.join(repoRoot, '.git', 'hooks', 'pre-commit');

  if (!fs.existsSync(srcHook)) {
    console.error('Source hook not found:', srcHook);
    process.exit(1);
  }
  if (!fs.existsSync(path.join(repoRoot, '.git'))) {
    console.error('Not a git repository: .git missing');
    process.exit(1);
  }

  copyFile(srcHook, destHook);
  makeExecutable(destHook);
  console.log('Installed pre-commit hook to', destHook);
}

main();


