#!/usr/bin/env node

/**
 * Agent OS Doctor
 * Quick environment and repository readiness validator.
 * - Validates Node version and installed deps via DependencyValidator
 * - Prints actionable remediation steps
 * - Writes JSON report to .agent-os/reports/doctor-report.json
 * - Uses CrossPlatformShell for cross-platform consistency
 */

import fs from 'node:fs';
import path from 'node:path';
import dep from '../utils/dependency-validator.js';
import CrossPlatformShell from '../utils/cross-platform-shell.js';

const { DependencyValidator } = dep;

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(process.cwd(), relativePath));
}

function readJsonSafe(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_e) {
    return fallback;
  }
}

function main() {
  const projectRoot = process.cwd();
  const reportsDir = path.join(projectRoot, '.agent-os', 'reports');
  ensureDirectory(reportsDir);

  const shell = new CrossPlatformShell();
  const validator = new DependencyValidator(projectRoot);

  const remediation = [];

  // 1) Environment validation
  let envResult;
  try {
    envResult = validator.validateEnvironment({ minNodeVersion: 18 });
  } catch (e) {
    // validateEnvironment may exit(1); guard for programmatic use
    envResult = {
      timestamp: new Date().toISOString(),
      nodeVersion: { current: process.version, required: '>=18', passed: false },
      dependencies: { passed: false },
      overall: false,
      error: e.message
    };
  }

  if (!envResult.nodeVersion?.passed) {
    remediation.push('Install Node.js >= 18 and re-run: https://nodejs.org');
  }
  if (!envResult.dependencies?.passed) {
    remediation.push('Install project dependencies: npm install');
  }

  // 2) Repository structure checks
  const requiredFiles = [
    '.agent-os/instructions/create-spec.md',
    '.agent-os/standards/tech-stack.md',
    '.agent-os/standards/code-style.md',
    '.agent-os/standards/best-practices.md'
  ];
  const missingFiles = requiredFiles.filter(f => !fileExists(f));
  if (missingFiles.length > 0) {
    remediation.push(`Missing required Agent OS docs: ${missingFiles.join(', ')}`);
  }

  // 3) Root package.json script checks
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = readJsonSafe(pkgPath, {});
  const scripts = pkg.scripts || {};
  const requiredScripts = ['agent-os:setup', 'agent-os:validate', 'agent-os:status'];
  const missingScripts = requiredScripts.filter(s => !scripts[s]);
  if (missingScripts.length > 0) {
    remediation.push(`Add missing npm scripts: ${missingScripts.join(', ')}`);
  }

  // 4) Tooling checks (npm/git availability)
  const tooling = {
    npm: shell.commandExists('npm'),
    git: shell.commandExists('git')
  };
  if (!tooling.npm) remediation.push('Install npm and ensure it is on PATH');
  if (!tooling.git) remediation.push('Install git and ensure it is on PATH');

  // 5) Compose report
  const report = {
    timestamp: new Date().toISOString(),
    system: shell.getSystemInfo(),
    environment: envResult,
    repository: {
      requiredFiles,
      missingFiles,
      packageScripts: Object.keys(scripts)
    },
    tooling,
    remediation,
    overall: envResult.overall && missingFiles.length === 0 && missingScripts.length === 0 && tooling.npm && tooling.git
  };

  const reportPath = path.join(reportsDir, 'doctor-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  // 6) Console summary
  console.log('\n🩺 Agent OS Doctor Summary');
  console.log(`Report: ${path.relative(projectRoot, reportPath)}`);
  console.log(`Overall: ${report.overall ? '✅ Healthy' : '❌ Issues Found'}`);

  if (remediation.length > 0) {
    console.log('\nSuggested Remediation:');
    for (const step of remediation) {
      console.log(`- ${step}`);
    }
  } else {
    console.log('\nNo remediation required. You are good to go!');
  }
}

try {
  main();
} catch (error) {
  console.error('Doctor encountered an unexpected error:', error.message);
  process.exit(1);
}


