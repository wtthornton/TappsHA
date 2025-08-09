#!/usr/bin/env node

// Agent OS Fast Checks (CommonJS)
// Runs quick, non-interactive validations intended for pre-commit usage.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, args, options = {}) {
  const res = spawnSync(command, args, { stdio: 'inherit', ...options });
  return res.status === 0;
}

function main() {
  console.log('⚡ Agent OS Fast Checks');
  console.log('=======================');

  // 1) Environment & basic repo readiness
  const doctorOk = run('node', ['.agent-os/tools/doctor.cjs']);

  // 2) Verify doctor report exists
  const reportPath = path.join(process.cwd(), '.agent-os', 'reports', 'doctor-report.json');
  const hasReport = fs.existsSync(reportPath);

  const ok = doctorOk && hasReport;
  console.log(`\nFast Checks Overall: ${ok ? '✅ OK' : '❌ Issues Found'}`);
  process.exit(ok ? 0 : 1);
}

try {
  main();
} catch (e) {
  console.error('Fast checks failed:', e.message);
  process.exit(1);
}


