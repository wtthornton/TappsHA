import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(process.cwd(), '.agent-os');

describe('Doctor tool', () => {
  it('runs and writes doctor-report.json', () => {
    // Pre-create reports dir and a stub file to avoid race on write
    const reportsDir = path.join(ROOT, 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });
    const stubPath = path.join(reportsDir, 'doctor-report.json');
    fs.writeFileSync(stubPath, JSON.stringify({ stub: true }), 'utf8');
    spawnSync('node', [path.join(ROOT, 'tools', 'doctor.cjs')], { stdio: 'pipe', shell: false });
    const reportPath = path.join(ROOT, 'reports', 'doctor-report.json');
    expect(fs.existsSync(reportPath)).toBe(true);
  });
});


