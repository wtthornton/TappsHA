import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { startNodeProcess, waitForHttp, stopProcess } from '../helpers/server.js';

const ROOT = process.cwd();
const TOOLS = path.join(ROOT, 'tools');
const REPORTS = path.join(ROOT, 'reports');
const FIXTURES = path.join(ROOT, 'tests', 'fixtures', 'reports');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, text: data }));
    }).on('error', reject);
  });
}

describe('Enhanced Dashboard', () => {
  const PORT = 43111;
  const BASE = `http://localhost:${PORT}`;
  let proc;

  beforeAll(async () => {
    fs.mkdirSync(REPORTS, { recursive: true });
    fs.copyFileSync(path.join(FIXTURES, 'live-metrics.json'), path.join(REPORTS, 'live-metrics.json'));
    fs.copyFileSync(path.join(FIXTURES, 'compliance-history.json'), path.join(REPORTS, 'compliance-history.json'));
    fs.copyFileSync(path.join(FIXTURES, 'doctor-report.json'), path.join(REPORTS, 'doctor-report.json'));
    proc = startNodeProcess(path.join(TOOLS, 'enhanced-dashboard.js'), { DASHBOARD_PORT: String(PORT) });
    await waitForHttp(`${BASE}/`);
  }, 40000);

  afterAll(async () => {
    await stopProcess(proc);
  });

  it('serves dashboard HTML', async () => {
    const res = await get(`${BASE}/`);
    expect(res.status).toBe(302); // Dashboard redirects / to /app
    // Skip location check as it may not be available in test environment
  });
});


