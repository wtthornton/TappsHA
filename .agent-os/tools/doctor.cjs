#!/usr/bin/env node

/**
 * Agent OS Doctor (CommonJS)
 * Quick environment and repository readiness validator.
 * - Validates Node version and installed deps via DependencyValidator
 * - Prints actionable remediation steps
 * - Writes JSON report to .agent-os/reports/doctor-report.json
 * - Uses CrossPlatformShell for cross-platform consistency
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Minimal inline shell helpers to avoid ESM/CJS interop issues
function commandExists(cmd) {
  try {
    if (process.platform === 'win32') {
      execSync(`powershell -Command "Get-Command ${cmd}"`, { stdio: 'ignore' });
    } else {
      execSync(`which ${cmd}`, { stdio: 'ignore' });
    }
    return true;
  } catch (_e) {
    return false;
  }
}

function getSystemInfo() {
  return {
    platform: process.platform,
    isWindows: process.platform === 'win32',
    shell: process.platform === 'win32' ? 'powershell.exe' : '/bin/bash',
    pathSeparator: process.platform === 'win32' ? '\\' : '/',
    nodeVersion: process.version,
    architecture: process.arch,
    homedir: os.homedir(),
    hostname: os.hostname(),
    cpus: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB'
  };
}

// Minimal inline environment validator
function verifyNodeVersion(minVersion = 18) {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split('.')[0]);
  return { current: nodeVersion, required: `>=${minVersion}`, passed: major >= minVersion };
}

function getRequiredDependencies(packageJsonPath) {
  if (!fs.existsSync(packageJsonPath)) return [];
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {})
    ];
  } catch (_e) {
    return [];
  }
}

function verifyDependencies(packageJsonPath) {
  const required = getRequiredDependencies(packageJsonPath);
  const missing = [];
  for (const mod of required) {
    try {
      require.resolve(mod);
    } catch (_e) {
      missing.push(mod);
    }
  }
  return {
    total: required.length,
    missing: missing.length,
    missingModules: missing,
    passed: missing.length === 0
  };
}

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

  const remediation = [];

  // 1) Environment validation
  let envResult;
  try {
    const node = verifyNodeVersion(18);
    const deps = verifyDependencies(path.join(projectRoot, 'package.json'));
    envResult = {
      timestamp: new Date().toISOString(),
      nodeVersion: node,
      dependencies: deps,
      overall: node.passed && deps.passed
    };
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

  if (!envResult.nodeVersion || !envResult.nodeVersion.passed) {
    remediation.push('Install Node.js >= 18 and re-run: https://nodejs.org');
  }
  if (!envResult.dependencies || !envResult.dependencies.passed) {
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
    npm: commandExists('npm'),
    git: commandExists('git')
  };
  if (!tooling.npm) remediation.push('Install npm and ensure it is on PATH');
  if (!tooling.git) remediation.push('Install git and ensure it is on PATH');

  // 5) Compose report
  const report = {
    timestamp: new Date().toISOString(),
    system: getSystemInfo(),
    environment: envResult,
    repository: {
      requiredFiles,
      missingFiles,
      packageScripts: Object.keys(scripts)
    },
    tooling,
    remediation,
    overall: Boolean(envResult.overall) && missingFiles.length === 0 && missingScripts.length === 0 && tooling.npm && tooling.git
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


