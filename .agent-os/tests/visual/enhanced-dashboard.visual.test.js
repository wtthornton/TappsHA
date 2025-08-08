import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { startNodeProcess, waitForHttp, stopProcess } from '../helpers/server.js';

let puppeteer;

const ROOT = process.cwd();
const TOOLS = path.join(ROOT, 'tools');
const REPORTS = path.join(ROOT, 'reports');
const FIXTURES = path.join(ROOT, 'tests', 'fixtures', 'reports');
const SNAP_DIR = path.join(ROOT, 'tests', 'visual', '__snapshots__');
const DIFF_DIR = path.join(ROOT, 'tests', 'visual', '__diffs__');

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }

describe('Enhanced Dashboard Visual', () => {
  const PORT = 43111;
  const BASE = `http://localhost:${PORT}`;
  let proc;
  let browser;
  let page;

  beforeAll(async () => {
    puppeteer = await import('puppeteer');
    ensureDir(REPORTS);
    ensureDir(SNAP_DIR);
    ensureDir(DIFF_DIR);
    fs.copyFileSync(path.join(FIXTURES, 'live-metrics.json'), path.join(REPORTS, 'live-metrics.json'));
    fs.copyFileSync(path.join(FIXTURES, 'compliance-history.json'), path.join(REPORTS, 'compliance-history.json'));
    fs.copyFileSync(path.join(FIXTURES, 'doctor-report.json'), path.join(REPORTS, 'doctor-report.json'));
    proc = startNodeProcess(path.join(TOOLS, 'enhanced-dashboard.js'), { DASHBOARD_PORT: String(PORT) });
    await waitForHttp(`${BASE}/`);
    browser = await puppeteer.launch({ headless: 'new' });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
  }, 90000);

  afterAll(async () => {
    if (browser) await browser.close();
    await stopProcess(proc);
  });

  it.skip('renders overview stable layout', async () => {
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    // Wait for any chart element to appear, not just mainChart
    await page.waitForSelector('canvas', { timeout: 30000 });
    const shotPath = path.join(DIFF_DIR, 'enhanced-dashboard-overview.png');
    await page.screenshot({ path: shotPath, fullPage: true });

    const baselinePath = path.join(SNAP_DIR, 'enhanced-dashboard-overview.png');
    if (!fs.existsSync(baselinePath)) {
      fs.copyFileSync(shotPath, baselinePath);
      expect(true).toBe(true);
      return;
    }

    const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
    const img2 = PNG.sync.read(fs.readFileSync(shotPath));
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    const numDiff = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.05 });
    const diffRatio = numDiff / (width * height);
    const diffPath = path.join(DIFF_DIR, 'enhanced-dashboard-overview-diff.png');
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    expect(diffRatio).toBeLessThanOrEqual(0.005);
  });
});


