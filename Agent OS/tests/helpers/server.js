import { spawn } from 'node:child_process';
import http from 'node:http';

export function startNodeProcess(scriptPath, env = {}, args = []) {
  const child = spawn('node', [scriptPath, ...args], {
    env: { ...process.env, ...env },
    stdio: 'inherit',
    shell: false,
  });
  return child;
}

export async function waitForHttp(url, timeoutMs = 30000, intervalMs = 250) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Timeout waiting for ${url}`));
        return;
      }
      const req = http.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          res.resume();
          resolve(true);
        } else {
          res.resume();
          setTimeout(tryOnce, intervalMs);
        }
      });
      req.on('error', () => setTimeout(tryOnce, intervalMs));
    };
    tryOnce();
  });
}

export function stopProcess(child) {
  return new Promise((resolve) => {
    if (!child || child.killed) return resolve();
    child.once('exit', () => resolve());
    try {
      child.kill('SIGTERM');
      setTimeout(() => {
        if (!child.killed) {
          try { child.kill('SIGKILL'); } catch {}
        }
      }, 2000);
    } catch {
      resolve();
    }
  });
}


