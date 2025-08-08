#!/usr/bin/env node

// Start Enhanced Dashboard on first available port (3001+)
const http = require('http');
const { spawn } = require('child_process');

function findFreePort(start = 3001, max = 3020) {
  return new Promise((resolve, reject) => {
    const tryPort = (p) => {
      if (p > max) return reject(new Error('No free port found'));
      const server = http.createServer();
      server.once('error', () => {
        server.close();
        tryPort(p + 1);
      });
      server.listen(p, '0.0.0.0', () => {
        server.close(() => resolve(p));
      });
    };
    tryPort(start);
  });
}

async function main() {
  const port = await findFreePort(3001, 3020);
  const env = { ...process.env, DASHBOARD_PORT: String(port) };
  console.log(`Starting Agent-OS Dashboard on port ${port}...`);
  const child = spawn('node', ['.agent-os/tools/enhanced-dashboard.js'], {
    env,
    stdio: 'inherit',
    windowsHide: true,
    detached: true,
  });
  child.unref();
  console.log(`Dashboard: http://localhost:${port}`);
  console.log(`Unified UI: http://localhost:${port}/app`);
}

main().catch((e) => {
  console.error('Failed to start dashboard:', e.message);
  process.exit(1);
});


