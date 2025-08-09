import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { spawn } from 'child_process';
import path from 'path';

function get(url: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }>{
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function waitForServer(url: string, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await get(url);
      if (res.status >= 200 && res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('Server did not become ready');
}

describe.skip('Enhanced Dashboard routes', () => {
  const port = 3019;
  let child: any;

  beforeAll(async () => {
    const cwd = path.resolve(__dirname, '../../');
    child = spawn('node', ['./tools/enhanced-dashboard.js'], {
      cwd,
      env: { ...process.env, DASHBOARD_PORT: String(port) },
      stdio: 'ignore',
      detached: true,
      windowsHide: true,
    });
    await waitForServer(`http://localhost:${port}/api/status`, 20000);
  });

  afterAll(() => {
    try { process.kill(child.pid); } catch {}
  });

  it('redirects / to /app', async () => {
    const res = await get(`http://localhost:${port}/`);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/app');
  });

  it('serves unified /app HTML', async () => {
    const res = await get(`http://localhost:${port}/app`);
    expect(res.status).toBe(200);
    expect(res.body).toContain('Agent‑OS Control Center');
  });

  it('exposes doctor json', async () => {
    const res = await get(`http://localhost:${port}/doctor`);
    // If no report available, we still expect JSON with error
    expect(res.status === 200 || res.status === 404).toBe(true);
    expect(res.headers['content-type']).toContain('application/json');
  });
});


