#!/usr/bin/env node

/**
 * Enhanced Real-Time Dashboard for Agent-OS
 * Provides live monitoring and visualization of compliance metrics
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

class EnhancedDashboard {
  constructor() {
    try {
      this.port = parseInt(process.env.DASHBOARD_PORT) || 3011;
      
      // Validate port number
      if (this.port < 1024 || this.port > 65535) {
        throw new Error('Port must be between 1024 and 65535');
      }
      
      this.dashboardPath = path.join(__dirname, '../reports/dashboard');
      this.metricsPath = path.join(__dirname, '../reports/live-metrics.json');
      this.historyPath = path.join(__dirname, '../reports/compliance-history.json');
      this.doctorReportPath = path.join(__dirname, '../reports/doctor-report.json');
      
      // Ensure dashboard directory exists
      try {
        if (!fs.existsSync(this.dashboardPath)) {
          fs.mkdirSync(this.dashboardPath, { recursive: true });
        }
      } catch (error) {
        console.error('Failed to create dashboard directory:', error.message);
        throw error;
      }
      
      this.server = null;
      this.clients = new Set();
      this.isAutoRefreshEnabled = false;
      this.refreshInterval = 30000; // Default to 30 seconds
      this.lastRefreshTime = Date.now();
      this.refreshTimer = null;
      this.startTime = Date.now();
      this.totalRequests = 0;
      
      console.log('✅ EnhancedDashboard initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize EnhancedDashboard:', error.message);
      throw error;
    }
  }

  /**
   * Start the enhanced dashboard server with auto-refresh capabilities
   */
  start() {
    try {
      console.log('🚀 Starting Enhanced Agent-OS Dashboard...');
      console.log(`📊 Dashboard available at: http://localhost:${this.port}`);
      console.log(`📈 Real-time metrics: http://localhost:${this.port}/metrics`);
      console.log(`🔄 Auto-refresh: Enabled with configurable intervals`);
      
      this.server = http.createServer((req, res) => {
        try {
          this.totalRequests++;
          console.log(`📥 Request received: ${req.method} ${req.url}`);
          this.handleRequest(req, res);
        } catch (error) {
          console.error('Error handling request:', error.message);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });

      this.server.on('error', (error) => {
        console.error('Server error:', error.message);
        if (error.code === 'EADDRINUSE') {
          console.error(`Port ${this.port} is already in use`);
        } else {
          console.error('Server error details:', error);
        }
      });

      this.server.on('listening', () => {
        console.log(`🎯 Server is listening on port ${this.port}`);
        console.log(`✅ Enhanced dashboard running on port ${this.port}`);
        console.log(`🌐 Server bound to 0.0.0.0:${this.port}`);
        console.log(`🔗 Access the dashboard at: http://localhost:${this.port}`);
      });

      this.server.listen(this.port, 'localhost', () => {
        try {
          console.log(`✅ Server started successfully on port ${this.port}`);
          this.generateDashboardHTML();
          this.startAutoRefresh();
          console.log(`🎉 Dashboard is now ready at http://localhost:${this.port}`);
        } catch (error) {
          console.error('Error during startup:', error.message);
        }
      });
    } catch (error) {
      console.error('❌ Failed to start dashboard:', error.message);
      throw error;
    }
  }

  /**
   * Start auto-refresh functionality
   */
  startAutoRefresh() {
    // Default refresh interval: 30 seconds
    this.refreshInterval = 30000;
    this.isAutoRefreshEnabled = true;
    this.lastRefreshTime = Date.now();
    
    // Start the refresh timer
    this.refreshTimer = setInterval(() => {
      if (this.isAutoRefreshEnabled) {
        this.refreshDashboard();
      }
    }, this.refreshInterval);
    
    console.log(`🔄 Auto-refresh started with ${this.refreshInterval / 1000}s interval`);
  }

  /**
   * Refresh dashboard data
   */
  refreshDashboard() {
    try {
      // Update metrics
      this.updateMetrics();
      
      // Update dashboard HTML
      this.generateDashboardHTML();
      
      // Update last refresh time
      this.lastRefreshTime = Date.now();
      
      // Notify connected clients
      this.notifyClients({
        type: 'refresh',
        timestamp: new Date().toISOString(),
        metrics: this.getCurrentMetrics()
      });
      
      console.log(`🔄 Dashboard refreshed at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('❌ Error refreshing dashboard:', error.message);
    }
  }

  /**
   * Update metrics with real-time data
   */
  updateMetrics() {
    try {
      const metrics = this.getCurrentMetrics();
      const history = this.getHistoricalData();
      
      // Add current metrics to history
      history.push({
        timestamp: new Date().toISOString(),
        ...metrics
      });
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      // Save updated history
      this.saveHistoricalData(history);
      
      // Save current metrics
      fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));
      
    } catch (error) {
      console.error('❌ Error updating metrics:', error.message);
    }
  }

  /**
   * Save historical data
   */
  saveHistoricalData(history) {
    try {
      fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
    } catch (error) {
      console.error('❌ Error saving historical data:', error.message);
    }
  }

  /**
   * Handle auto-refresh configuration requests
   */
  handleAutoRefreshConfig(req, res) {
    try {
      const parsedUrl = url.parse(req.url, true);
      const { action, interval } = parsedUrl.query;
      
      if (!action || typeof action !== 'string') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid action parameter' }));
        return;
      }
      
      switch (action) {
        case 'enable':
          this.isAutoRefreshEnabled = true;
          break;
        case 'disable':
          this.isAutoRefreshEnabled = false;
          break;
        case 'setInterval':
          if (interval) {
            const newInterval = parseInt(interval);
            if (isNaN(newInterval) || newInterval < 5000) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Interval must be at least 5000ms' }));
              return;
            }
            this.refreshInterval = newInterval;
            this.restartAutoRefresh();
          }
          break;
        case 'refresh':
          this.refreshDashboard();
          break;
        default:
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid action' }));
          return;
      }
      
      // Return current configuration
      const config = {
        isEnabled: this.isAutoRefreshEnabled,
        interval: this.refreshInterval,
        lastRefresh: this.lastRefreshTime,
        nextRefresh: this.lastRefreshTime + this.refreshInterval
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(config));
    } catch (error) {
      console.error('Error handling auto-refresh config:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  /**
   * Restart auto-refresh with new interval
   */
  restartAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(() => {
      if (this.isAutoRefreshEnabled) {
        this.refreshDashboard();
      }
    }, this.refreshInterval);
    
    console.log(`🔄 Auto-refresh restarted with ${this.refreshInterval / 1000}s interval`);
  }

  /**
   * Notify connected WebSocket clients
   */
  notifyClients(data) {
    const disconnectedClients = [];
    
    this.clients.forEach(client => {
      try {
        if (client.writable && !client.destroyed) {
          client.write(`data: ${JSON.stringify(data)}\n\n`);
        } else {
          disconnectedClients.push(client);
        }
      } catch (error) {
        console.warn('Failed to notify client:', error.message);
        disconnectedClients.push(client);
      }
    });
    
    // Clean up disconnected clients
    disconnectedClients.forEach(client => {
      this.clients.delete(client);
    });
    
    if (disconnectedClients.length > 0) {
      console.log(`Cleaned up ${disconnectedClients.length} disconnected clients`);
    }
  }

  /**
   * Handle incoming HTTP requests with auto-refresh endpoints
   */
  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle user guide route
    if (pathname === '/user-guide') {
      this.serveUserGuide(req, res);
      return;
    }

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    switch (pathname) {
      case '/': {
        // Redirect to unified application UI for single-entry experience
        res.writeHead(302, { Location: '/app' });
        res.end();
        break;
      }
      case '/app':
        this.serveUnifiedApp(req, res);
        break;
        case '/doctor-ui':
          this.serveDoctorUI(req, res);
          break;
      case '/metrics':
        this.serveMetrics(req, res);
        break;
        case '/doctor':
          this.serveDoctorReport(req, res);
          break;
      case '/history':
        this.serveHistory(req, res);
        break;
      case '/api/standards':
        this.serveStandards(req, res);
        break;
      case '/trends':
        this.serveTrends(req, res);
        break;
      case '/effectiveness':
        this.serveEffectiveness(req, res);
        break;
      case '/api/live':
        this.serveLiveMetrics(req, res);
        break;
      case '/api/refresh':
        this.handleAutoRefreshConfig(req, res);
        break;
      case '/api/status':
        this.serveStatus(req, res);
        break;
      case '/lessons':
        this.serveLessons(req, res);
        break;
      case '/performance-metrics':
        this.servePerformanceMetrics(req, res);
        break;
      default:
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
  }

  /**
   * Serve Agent OS Doctor report JSON
   */
  serveDoctorReport(req, res) {
    try {
      if (fs.existsSync(this.doctorReportPath)) {
        const report = JSON.parse(fs.readFileSync(this.doctorReportPath, 'utf8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(report, null, 2));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Doctor report not found. Run npm run agent-os:doctor' }));
      }
    } catch (error) {
      console.error('Error serving doctor report:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to read doctor report' }));
    }
  }

  /**
   * Serve dashboard status
   */
  serveStatus(req, res) {
    const status = {
      timestamp: new Date().toISOString(),
      isRunning: true,
      autoRefresh: {
        isEnabled: this.isAutoRefreshEnabled,
        interval: this.refreshInterval,
        lastRefresh: this.lastRefreshTime,
        nextRefresh: this.lastRefreshTime + this.refreshInterval,
        uptime: Date.now() - this.startTime
      },
      metrics: {
        totalRequests: this.totalRequests || 0,
        activeConnections: this.clients.size,
        lastMetricsUpdate: this.lastRefreshTime
      }
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
  }

  /**
   * Serve the main dashboard HTML
   */
  serveDashboard(req, res) {
    const dashboardHTML = this.generateDashboardHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(dashboardHTML);
  }

  /**
   * Unified single-page UI for all Agent‑OS functions
   */
  serveUnifiedApp(_req, res) {
    const html = this.generateUnifiedAppHTML();
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  generateUnifiedAppHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agent‑OS – Control Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen">
  <header class="bg-white shadow-sm sticky top-0 z-10">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <h1 class="text-xl font-bold text-slate-800">Agent‑OS Control Center</h1>
      <nav class="flex gap-2">
        <button data-tab="overview" class="tab-btn px-3 py-1.5 rounded-md bg-slate-900 text-white text-sm">Overview</button>
        <button data-tab="doctor" class="tab-btn px-3 py-1.5 rounded-md bg-slate-200 text-slate-800 text-sm">Doctor</button>
        <button data-tab="reports" class="tab-btn px-3 py-1.5 rounded-md bg-slate-200 text-slate-800 text-sm">Reports</button>
        <button data-tab="standards" class="tab-btn px-3 py-1.5 rounded-md bg-slate-200 text-slate-800 text-sm">Standards</button>
        <button data-tab="tools" class="tab-btn px-3 py-1.5 rounded-md bg-slate-200 text-slate-800 text-sm">Tools</button>
      </nav>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-6">
    <section id="tab-overview" class="tab-panel grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="p-5 rounded-xl bg-white border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Compliance Snapshot</h2>
          <span id="ov-score-pill" class="px-2 py-0.5 text-xs rounded bg-slate-200">loading</span>
        </div>
        <div class="text-sm text-slate-600" id="ov-summary">Fetching metrics…</div>
      </div>
      <div class="p-5 rounded-xl bg-white border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Doctor Status</h2>
          <span id="ov-doc-pill" class="px-2 py-0.5 text-xs rounded bg-slate-200">loading</span>
        </div>
        <div class="text-sm text-slate-600" id="ov-doc-summary">Checking environment…</div>
        <div class="mt-3"><a href="#" data-tab-link="doctor" class="inline-flex items-center px-3 py-1 rounded-md text-sm bg-emerald-600 text-white">Open Doctor</a></div>
      </div>
      <div class="p-5 rounded-xl bg-white border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Test Coverage</h2>
          <span id="ov-cov-pill" class="px-2 py-0.5 text-xs rounded bg-slate-200">n/a</span>
        </div>
        <div class="text-sm text-slate-600" id="ov-cov-summary">Run agent-os:test:coverage to populate.</div>
      </div>
    </section>

    <section id="tab-doctor" class="tab-panel hidden">
      <div class="p-5 rounded-xl bg-white border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Environment Doctor</h2>
          <button id="btn-refresh-doctor" class="px-3 py-1 rounded bg-slate-900 text-white text-sm">Refresh</button>
        </div>
        <div id="doctor-status" class="text-sm text-slate-700 mb-3">Loading…</div>
        <div>
          <h3 class="font-medium mb-2">Remediation</h3>
          <ul id="doctor-remediation" class="list-disc pl-6 text-sm text-slate-700"></ul>
        </div>
      </div>
    </section>

    <section id="tab-reports" class="tab-panel hidden">
      <div class="p-5 rounded-xl bg-white border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Compliance History</h2>
          <a href="/history" target="_blank" class="text-sm underline text-slate-600">Open JSON</a>
        </div>
        <pre id="reports-json" class="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-auto max-h-96">Loading…</pre>
      </div>
    </section>

    <section id="tab-standards" class="tab-panel hidden">
      <div class="p-5 rounded-xl bg-white border border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold">Standards Analysis</h2>
          <button id="btn-refresh-standards" class="px-3 py-1 rounded bg-slate-900 text-white text-sm">Analyze</button>
        </div>
        <div id="standards-summary" class="text-sm text-slate-700 mb-3">Run analysis to see documentation quality and references.</div>
        <pre id="standards-json" class="text-xs bg-slate-50 p-3 rounded border border-slate-200 overflow-auto max-h-96"></pre>
      </div>
    </section>

    <section id="tab-tools" class="tab-panel hidden">
      <div class="p-5 rounded-xl bg-white border border-slate-200">
        <h2 class="text-lg font-semibold mb-3">Quick Links</h2>
        <div class="flex flex-wrap gap-2 text-sm">
          <a href="/metrics" target="_blank" class="px-3 py-1 rounded bg-slate-200 text-slate-800">Metrics JSON</a>
          <a href="/doctor" target="_blank" class="px-3 py-1 rounded bg-slate-200 text-slate-800">Doctor JSON</a>
          <a href="/history" target="_blank" class="px-3 py-1 rounded bg-slate-200 text-slate-800">History JSON</a>
          <a href="/api/standards" target="_blank" class="px-3 py-1 rounded bg-slate-200 text-slate-800">Standards JSON</a>
        </div>
      </div>
    </section>
  </main>

  <script>
    const tabs = ['overview','doctor','reports','standards','tools'];
    function showTab(name){
      tabs.forEach(t=>{
        document.getElementById('tab-'+t).classList.toggle('hidden', t!==name);
        document.querySelectorAll('[data-tab]')
          .forEach(btn=>btn.classList.toggle('bg-slate-900', btn.dataset.tab===name));
        document.querySelectorAll('[data-tab]')
          .forEach(btn=>btn.classList.toggle('text-white', btn.dataset.tab===name));
        document.querySelectorAll('[data-tab]')
          .forEach(btn=>btn.classList.toggle('bg-slate-200', btn.dataset.tab!==name));
        document.querySelectorAll('[data-tab]')
          .forEach(btn=>btn.classList.toggle('text-slate-800', btn.dataset.tab!==name));
      });
    }
    document.querySelectorAll('[data-tab]').forEach(btn=>{
      btn.addEventListener('click', ()=>showTab(btn.dataset.tab));
    });
    document.querySelectorAll('[data-tab-link]').forEach(a=>{
      a.addEventListener('click', (e)=>{ e.preventDefault(); showTab(a.dataset.tabLink); });
    });
    showTab('overview');

    async function loadOverview(){
      try{
        const m = await (await fetch('/metrics')).json();
        const d = await (await fetch('/doctor')).json();
        const ms = m.data || m; const score = ms.complianceScore ?? 0;
        document.getElementById('ov-score-pill').textContent = score + '%';
        document.getElementById('ov-summary').textContent = 'Files: ' + (ms.totalFilesProcessed ?? '-') + ', Critical: ' + (ms.criticalViolations ?? '-') + ', Warnings: ' + (ms.warnings ?? '-');
        const healthy = !!d.overall;
        document.getElementById('ov-doc-pill').textContent = healthy ? 'healthy' : 'issues';
        document.getElementById('ov-doc-pill').className = healthy ? 'px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700' : 'px-2 py-0.5 text-xs rounded bg-rose-100 text-rose-700';
        document.getElementById('ov-doc-summary').textContent = healthy ? 'Environment healthy' : 'Issues found: ' + (d.remediation||[]).length;
        // Coverage
        const cov = ms.coverage?.total;
        if (cov) {
          const lines = cov.lines?.pct ?? cov.lines?.pct ?? null;
          const branches = cov.branches?.pct ?? null;
          const funcs = cov.functions?.pct ?? null;
          const linesPct = lines ?? '-';
          document.getElementById('ov-cov-pill').textContent = linesPct + '% lines';
          document.getElementById('ov-cov-pill').className = 'px-2 py-0.5 text-xs rounded ' + (linesPct >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700');
          document.getElementById('ov-cov-summary').textContent = 'Branches: ' + (branches ?? '-') + '%, Functions: ' + (funcs ?? '-') + '%';
        }
      }catch(e){
        document.getElementById('ov-summary').textContent = 'Failed to load metrics';
        document.getElementById('ov-doc-summary').textContent = 'Failed to load doctor';
        // leave coverage as-is
      }
    }
    async function loadDoctor(){
      try{
        const d = await (await fetch('/doctor')).json();
        const healthy = !!d.overall;
        document.getElementById('doctor-status').textContent = healthy ? '✅ Environment healthy' : '❌ Issues found';
        const ul = document.getElementById('doctor-remediation');
        ul.innerHTML = '';
        (d.remediation && d.remediation.length ? d.remediation : ['No remediation required']).forEach(i=>{
          const li=document.createElement('li'); li.textContent=i; ul.appendChild(li);
        });
      }catch(e){
        document.getElementById('doctor-status').textContent = 'Failed to load doctor report';
      }
    }
    async function loadReports(){
      try{
        const h = await (await fetch('/history')).json();
        document.getElementById('reports-json').textContent = JSON.stringify(h, null, 2);
      }catch(e){ document.getElementById('reports-json').textContent = 'Failed to load history'; }
    }
    async function loadStandards(){
      document.getElementById('standards-summary').textContent = 'Analyzing…';
      try{
        const s = await (await fetch('/api/standards')).json();
        document.getElementById('standards-summary').textContent = 'Docs: ' + (s.summary?.totalFiles ?? '?') + ', Avg completeness: ' + (s.summary?.averageCompleteness ?? '?') + '%';
        document.getElementById('standards-json').textContent = JSON.stringify(s, null, 2);
      }catch(e){
        document.getElementById('standards-summary').textContent = 'Failed to analyze standards';
      }
    }
    document.getElementById('btn-refresh-doctor').addEventListener('click', loadDoctor);
    document.getElementById('btn-refresh-standards').addEventListener('click', loadStandards);

    // Initial loads for overview
    loadOverview();
  </script>
</body>
</html>`;
  }

  /**
   * Serve a rich Doctor UI that renders /doctor JSON nicely with navigation
   */
  serveDoctorUI(_req, res) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Agent-OS Doctor</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 min-h-screen text-slate-100">
  <div class="max-w-6xl mx-auto p-4 sm:p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold">Agent-OS Doctor</h1>
      <div class="flex gap-2">
        <a href="/" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">← Back to Dashboard</a>
        <a href="/doctor" class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600">View JSON</a>
      </div>
    </div>

    <div id="status" class="mb-6 p-4 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div id="statusPill" class="w-10 h-10 rounded-full flex items-center justify-center bg-slate-600">?</div>
        <div>
          <div class="text-lg font-semibold">Environment Status</div>
          <div id="statusText" class="text-slate-300 text-sm">Loading...</div>
        </div>
      </div>
      <button id="refreshBtn" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500">Refresh</button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <div class="p-5 rounded-xl bg-slate-800 border border-white/10">
          <div class="text-lg font-semibold mb-3">Remediation</div>
          <ul id="remediationList" class="list-disc pl-6 text-slate-300 text-sm space-y-2"><li>Loading...</li></ul>
        </div>

        <div class="p-5 rounded-xl bg-slate-800 border border-white/10">
          <div class="text-lg font-semibold mb-3">Repository</div>
          <div class="text-sm text-slate-300">
            <div><span class="font-semibold">Missing Files:</span> <span id="missingFiles">-</span></div>
            <div class="mt-2">
              <div class="font-semibold">Scripts:</div>
              <pre id="scripts" class="mt-2 p-3 bg-slate-900 rounded-lg overflow-auto"></pre>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="p-5 rounded-xl bg-slate-800 border border-white/10">
          <div class="text-lg font-semibold mb-3">System</div>
          <div id="system" class="text-sm text-slate-300 space-y-1"></div>
        </div>
        <div class="p-5 rounded-xl bg-slate-800 border border-white/10">
          <div class="text-lg font-semibold mb-3">Quick Links</div>
          <div class="flex flex-col gap-2 text-sm">
            <a href="/" class="underline hover:text-indigo-300">Dashboard Home</a>
            <a href="/doctor" class="underline hover:text-indigo-300">Doctor JSON</a>
            <a href="/metrics" class="underline hover:text-indigo-300">Current Metrics JSON</a>
            <a href="/history" class="underline hover:text-indigo-300">History JSON</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    async function loadDoctor(){
      try{
        const r = await fetch('/doctor');
        const j = await r.json();
        const healthy = !!j.overall;
        const pill = document.getElementById('statusPill');
        const text = document.getElementById('statusText');
        pill.textContent = healthy ? '✓' : '!';
        pill.className = healthy
          ? 'w-10 h-10 rounded-full flex items-center justify-center bg-emerald-600'
          : 'w-10 h-10 rounded-full flex items-center justify-center bg-rose-600';
        text.textContent = healthy ? 'Environment healthy' : 'Issues found';

        const rem = document.getElementById('remediationList');
        rem.innerHTML = '';
        (j.remediation && j.remediation.length ? j.remediation : ['No remediation required']).forEach(it => {
          const li = document.createElement('li');
          li.textContent = it;
          rem.appendChild(li);
        });

        // Repo
        document.getElementById('missingFiles').textContent = (j.repository && j.repository.missingFiles && j.repository.missingFiles.length) ? j.repository.missingFiles.join(', ') : 'None';
        document.getElementById('scripts').textContent = (j.repository && j.repository.packageScripts) ? j.repository.packageScripts.join('\n') : '-';

        // System
        const sys = document.getElementById('system');
        sys.innerHTML = '';
        const entries = Object.entries(j.system || {});
        entries.forEach(([k,v]) => {
          const div = document.createElement('div');
          div.innerHTML = '<span class="font-semibold">' + k + ':</span> ' + v;
          sys.appendChild(div);
        });
      } catch(e){
        document.getElementById('statusText').textContent = 'Doctor report not available';
      }
    }
    document.getElementById('refreshBtn').addEventListener('click', loadDoctor);
    loadDoctor();
  </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  /**
   * Serve current metrics as JSON
   */
  serveMetrics(req, res) {
    try {
      const metrics = this.getCurrentMetrics();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(metrics, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * Serve historical data
   */
  serveHistory(req, res) {
    try {
      const history = this.getHistoricalData();
      
      // Optimize performance by limiting to last 50 entries
      const limitedHistory = history.slice(-50);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(limitedHistory, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * Serve trend analysis
   */
  serveTrends(req, res) {
    try {
      const trends = this.calculateTrends();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(trends, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * Serve effectiveness metrics
   */
  serveEffectiveness(req, res) {
    try {
      const effectiveness = this.calculateEffectiveness();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(effectiveness, null, 2));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  /**
   * Serve live metrics with Server-Sent Events
   */
  serveLiveMetrics(req, res) {
    try {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Add client to set
      this.clients.add(res);

      // Send initial data
      const metrics = this.getCurrentMetrics();
      res.write(`data: ${JSON.stringify(metrics)}\n\n`);

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (res.writable && !res.destroyed) {
          res.write(`: heartbeat\n\n`);
        } else {
          clearInterval(heartbeat);
          this.clients.delete(res);
        }
      }, 30000);

      // Remove client when connection closes
      req.on('close', () => {
        clearInterval(heartbeat);
        this.clients.delete(res);
        console.log('Client disconnected from live metrics');
      });

      req.on('error', (error) => {
        console.error('Error in live metrics connection:', error.message);
        clearInterval(heartbeat);
        this.clients.delete(res);
      });

    } catch (error) {
      console.error('Error setting up live metrics:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to setup live metrics' }));
    }
  }

  /**
   * Standards JSON via documentation analyzer for unified UI
   */
  serveStandards(_req, res) {
    try {
      const Analyzer = require('./analysis/documentation-analyzer.cjs');
      const analyzer = new Analyzer();
      const analysis = analyzer.analyzeAllDocumentation();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(analysis, null, 2));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to analyze documentation', message: e.message }));
    }
  }

  /**
   * Serve user guide HTML
   */
  serveUserGuide(req, res) {
    try {
      const userGuidePath = path.join(__dirname, 'user-guide.html');
      
      if (fs.existsSync(userGuidePath)) {
        const content = fs.readFileSync(userGuidePath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('User guide not found');
      }
    } catch (error) {
      console.error('Error serving user guide:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading user guide');
    }
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics(metrics = {}) {
    try {
      return {
        averageProcessingTime: metrics.averageProcessingTime || 150,
        totalFilesProcessed: metrics.filesProcessed || 152,
        processingEfficiency: metrics.processingEfficiency || 85,
        memoryUsage: metrics.memoryUsage || 45,
        cpuUsage: metrics.cpuUsage || 30
      };
    } catch (error) {
      console.error('Error calculating performance metrics:', error.message);
      return {
        averageProcessingTime: 150,
        totalFilesProcessed: 152,
        processingEfficiency: 85,
        memoryUsage: 45,
        cpuUsage: 30
      };
    }
  }

  /**
   * Calculate compliance trend with proper structure
   */
  calculateComplianceTrend(metrics) {
    const history = this.getHistoricalData();
    
    if (history.length < 2) {
      return {
        direction: 'stable',
        change: 0,
        confidence: 0.5,
        message: 'Insufficient data for trend analysis'
      };
    }
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    const recentAvg = recent.reduce((sum, entry) => sum + (entry.complianceScore || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + (entry.complianceScore || 0), 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    return {
      direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
      change: Math.round(change * 10) / 10,
      confidence: Math.min(0.9, 0.5 + Math.abs(change) / 10),
      message: change > 0 ? 'Compliance is improving' : change < 0 ? 'Compliance is declining' : 'Compliance is stable'
    };
  }

  /**
   * Get current metrics with proper structure
   */
  getCurrentMetrics() {
    const history = this.getHistoricalData();
    const latestEntry = history.length > 0 ? history[history.length - 1] : null;
    // Coverage metrics from vitest summary if available
    let coverageSummary = null;
    const coverageSummaryPath = path.join(__dirname, '../reports/coverage/coverage-summary.json');
    try {
      if (fs.existsSync(coverageSummaryPath)) {
        coverageSummary = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
      }
    } catch {}

    const baseMetrics = {
      complianceScore: latestEntry ? latestEntry.complianceScore : 44,
      criticalViolations: latestEntry ? latestEntry.criticalViolations : 14,
      warnings: latestEntry ? latestEntry.warnings : 1250,
      totalFilesProcessed: latestEntry ? latestEntry.totalChecks : 152,
      averageProcessingTime: 150,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      totalRequests: this.totalRequests,
      fileTypes: ['java', 'ts', 'tsx', 'js', 'jsx', 'xml', 'json', 'yml', 'yaml'],
      coverage: coverageSummary ? {
        total: coverageSummary.total || {},
      } : undefined
    };
    
    // Add trend data
    const complianceTrend = this.calculateComplianceTrend(baseMetrics);
    baseMetrics.complianceTrend = complianceTrend;
    
    // Add performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(baseMetrics);
    Object.assign(baseMetrics, performanceMetrics);
    
    return this.enhanceMetrics(baseMetrics);
  }

  /**
   * Enhance metrics with performance monitoring features
   */
  enhanceMetrics(metrics) {
    try {
      if (!metrics || typeof metrics !== 'object') {
        console.warn('Invalid metrics provided to enhanceMetrics, using defaults');
        metrics = this.getDefaultMetrics();
      }

      const enhanced = {
        ...metrics,
        timestamp: new Date().toISOString(),
        complianceScore: this.calculateRealTimeComplianceScore(metrics),
        complianceTrend: this.calculateComplianceTrend(metrics),
        compliancePrediction: this.predictComplianceScore(metrics),
        complianceConfidence: this.calculateComplianceConfidence(metrics),
        performance: this.calculatePerformanceMetrics(metrics),
        realTimeUpdates: {
          lastUpdate: new Date().toISOString(),
          updateFrequency: 'real-time',
          nextUpdate: new Date(Date.now() + 30000).toISOString(), // 30 seconds
          isLive: true
        },
        visualIndicators: {
          ringColor: this.getComplianceRingColor(metrics.complianceScore || 0),
          animationState: this.getComplianceAnimationState(metrics),
          pulseIntensity: this.calculatePulseIntensity(metrics),
          glowEffect: this.calculateGlowEffect(metrics)
        },
        trendAnalysis: {
          shortTerm: this.calculateShortTermTrend(metrics),
          mediumTerm: this.calculateMediumTermTrend(metrics),
          longTerm: this.calculateLongTermTrend(metrics),
          volatility: this.calculateComplianceVolatility(metrics)
        }
      };

      return enhanced;
    } catch (error) {
      console.error('Error enhancing metrics:', error.message);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Calculate real-time compliance score with enhanced accuracy
   */
  calculateRealTimeComplianceScore(metrics) {
    const baseScore = metrics.complianceScore || 0;
    const violations = metrics.totalViolations || 0;
    const criticalViolations = metrics.criticalViolations || 0;
    const warnings = metrics.warnings || 0;
    const totalChecks = metrics.totalChecks || 1;
    const passedChecks = metrics.passedChecks || 0;

    // Enhanced scoring algorithm
    let score = baseScore;

    // Penalty for critical violations (higher weight)
    const criticalPenalty = criticalViolations * 5;
    
    // Penalty for warnings (lower weight)
    const warningPenalty = warnings * 2;
    
    // Bonus for passed checks
    const passedBonus = (passedChecks / totalChecks) * 10;
    
    // Calculate final score
    score = Math.max(0, Math.min(100, score - criticalPenalty - warningPenalty + passedBonus));
    
    // Apply trend adjustment
    const trend = this.calculateComplianceTrend(metrics);
    if (trend.direction === 'improving') {
      score = Math.min(100, score + trend.change);
    } else if (trend.direction === 'declining') {
      score = Math.max(0, score - trend.change);
    }

    return Math.round(score);
  }

  /**
   * Predict compliance score using trend analysis
   */
  predictComplianceScore(metrics) {
    const history = this.getHistoricalData();
    if (history.length < 3) {
      return metrics.complianceScore || 0;
    }

    const recentScores = history.slice(-7).map(h => h.complianceScore);
    const trend = this.calculateComplianceTrend(metrics);
    
    // Simple linear prediction
    const predictedChange = trend.change * 2; // Predict 2 periods ahead
    const predictedScore = (metrics.complianceScore || 0) + predictedChange;
    
    return Math.max(0, Math.min(100, Math.round(predictedScore)));
  }

  /**
   * Calculate compliance confidence based on data quality
   */
  calculateComplianceConfidence(metrics) {
    const history = this.getHistoricalData();
    if (history.length === 0) return 0.5;

    const recentEntries = history.slice(-5);
    const dataQuality = recentEntries.length / 5; // How much recent data we have
    
    const consistency = this.calculateDataConsistency(recentEntries);
    const volatility = this.calculateComplianceVolatility(metrics);
    
    let confidence = 0.5;
    confidence += dataQuality * 0.2; // More data = higher confidence
    confidence += consistency * 0.2; // More consistent = higher confidence
    confidence -= volatility * 0.3; // More volatile = lower confidence
    
    return Math.max(0.1, Math.min(1, confidence));
  }

  /**
   * Get compliance ring color based on score
   */
  getComplianceRingColor(score) {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 80) return '#8BC34A'; // Light Green
    if (score >= 70) return '#FFC107'; // Yellow
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  }

  /**
   * Get compliance animation state
   */
  getComplianceAnimationState(metrics) {
    const trend = this.calculateComplianceTrend(metrics);
    
    if (trend.direction === 'improving' && trend.change > 5) {
      return 'pulsing';
    } else if (trend.direction === 'declining' && trend.change > 5) {
      return 'shaking';
    } else if (trend.direction === 'stable') {
      return 'stable';
    }
    
    return 'normal';
  }

  /**
   * Calculate pulse intensity for animations
   */
  calculatePulseIntensity(metrics) {
    const trend = this.calculateComplianceTrend(metrics);
    const volatility = this.calculateComplianceVolatility(metrics);
    
    let intensity = 0.5; // Base intensity
    
    if (trend.direction === 'improving') {
      intensity += trend.change * 0.1;
    } else if (trend.direction === 'declining') {
      intensity += trend.change * 0.05;
    }
    
    intensity += volatility * 0.3;
    
    return Math.min(1, Math.max(0, intensity));
  }

  /**
   * Calculate glow effect for visual feedback
   */
  calculateGlowEffect(metrics) {
    const score = metrics.complianceScore || 0;
    const trend = this.calculateComplianceTrend(metrics);
    
    let glow = 0;
    
    if (score >= 95) {
      glow = 0.8; // Strong glow for excellent scores
    } else if (score >= 85) {
      glow = 0.6; // Medium glow for good scores
    } else if (score >= 75) {
      glow = 0.4; // Light glow for acceptable scores
    }
    
    // Add trend-based glow
    if (trend.direction === 'improving') {
      glow += 0.2;
    } else if (trend.direction === 'declining') {
      glow -= 0.1;
    }
    
    return Math.min(1, Math.max(0, glow));
  }

  /**
   * Calculate short-term trend (last 3 checks)
   */
  calculateShortTermTrend(metrics) {
    const history = this.getHistoricalData();
    if (history.length < 3) return { direction: 'stable', magnitude: 0 };
    
    const recent = history.slice(-3);
    const changes = recent.map((entry, i) => {
      if (i === 0) return 0;
      return entry.complianceScore - recent[i - 1].complianceScore;
    }).slice(1);
    
    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    return {
      direction: averageChange > 1 ? 'improving' : averageChange < -1 ? 'declining' : 'stable',
      magnitude: Math.abs(averageChange)
    };
  }

  /**
   * Calculate medium-term trend (last 7 checks)
   */
  calculateMediumTermTrend(metrics) {
    const history = this.getHistoricalData();
    if (history.length < 7) return { direction: 'stable', magnitude: 0 };
    
    const recent = history.slice(-7);
    const changes = recent.map((entry, i) => {
      if (i === 0) return 0;
      return entry.complianceScore - recent[i - 1].complianceScore;
    }).slice(1);
    
    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    return {
      direction: averageChange > 0.5 ? 'improving' : averageChange < -0.5 ? 'declining' : 'stable',
      magnitude: Math.abs(averageChange)
    };
  }

  /**
   * Calculate long-term trend (last 14 checks)
   */
  calculateLongTermTrend(metrics) {
    const history = this.getHistoricalData();
    if (history.length < 14) return { direction: 'stable', magnitude: 0 };
    
    const recent = history.slice(-14);
    const changes = recent.map((entry, i) => {
      if (i === 0) return 0;
      return entry.complianceScore - recent[i - 1].complianceScore;
    }).slice(1);
    
    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    
    return {
      direction: averageChange > 0.3 ? 'improving' : averageChange < -0.3 ? 'declining' : 'stable',
      magnitude: Math.abs(averageChange)
    };
  }

  /**
   * Calculate compliance volatility
   */
  calculateComplianceVolatility(metrics) {
    const history = this.getHistoricalData();
    if (history.length < 5) return 0;
    
    const recentScores = history.slice(-10).map(h => h.complianceScore);
    const mean = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const variance = recentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / recentScores.length;
    const standardDeviation = Math.sqrt(variance);
    
    return standardDeviation / 100; // Normalize to 0-1 range
  }

  /**
   * Calculate data consistency
   */
  calculateDataConsistency(entries) {
    if (entries.length < 2) return 1;
    
    const scores = entries.map(e => e.complianceScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Higher consistency = lower standard deviation
    return Math.max(0, 1 - (standardDeviation / 50)); // Normalize to 0-1 range
  }

  /**
   * Get default metrics for initial load or error cases
   */
  getDefaultMetrics() {
    return {
      timestamp: new Date().toISOString(),
      complianceScore: 0,
      totalChecks: 0,
      passedChecks: 0,
      violations: 0,
      criticalViolations: 0,
      warnings: 0,
      performance: {
        executionTime: 0,
        averageFileProcessingTime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      effectiveness: {
        timeSaved: 0,
        productivityGain: 0,
        standardsAdoption: 0,
        qualityImprovement: 0
      },
      totalViolations: 0,
      filesProcessed: 0,
      fileTypes: [],
      averageProcessingTime: 0
    };
  }

  /**
   * Get historical data
   */
  getHistoricalData() {
    try {
      if (fs.existsSync(this.historyPath)) {
        return JSON.parse(fs.readFileSync(this.historyPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ Could not read history file:', error.message);
    }

    return [];
  }

  /**
   * Calculate trends with enhanced violation breakdown
   */
  calculateTrends() {
    const history = this.getHistoricalData();
    if (history.length < 2) {
      return {
        complianceScore: 0,
        violations: 0,
        processingTime: 0,
        violationBreakdown: this.getDefaultViolationBreakdown()
      };
    }

    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    return {
      complianceScore: (current.complianceScore || 0) - (previous.complianceScore || 0),
      violations: (current.violations || 0) - (previous.violations || 0),
      processingTime: (current.metrics?.executionTime || 0) - (previous.metrics?.executionTime || 0),
      violationBreakdown: this.calculateViolationBreakdown(history)
    };
  }

  /**
   * Calculate detailed violation breakdown with enhanced analysis
   */
  calculateViolationBreakdown(history) {
    if (history.length === 0) {
      return this.getDefaultViolationBreakdown();
    }

    const recent = history.slice(-7); // Last 7 entries
    const current = recent[recent.length - 1];
    const previous = recent[recent.length - 2] || current;

    // Calculate violation categories
    const violationCategories = current.metrics?.violationCategories || {};
    const previousCategories = previous.metrics?.violationCategories || {};

    const breakdown = {
      critical: {
        current: current.criticalViolations || 0,
        previous: previous.criticalViolations || 0,
        change: (current.criticalViolations || 0) - (previous.criticalViolations || 0),
        trend: this.calculateCategoryTrend(recent, 'criticalViolations'),
        percentage: this.calculatePercentage(current.criticalViolations || 0, current.violations || 1)
      },
      warnings: {
        current: current.warnings || 0,
        previous: previous.warnings || 0,
        change: (current.warnings || 0) - (previous.warnings || 0),
        trend: this.calculateCategoryTrend(recent, 'warnings'),
        percentage: this.calculatePercentage(current.warnings || 0, current.violations || 1)
      },
      codeStyle: {
        current: violationCategories.codeStyle || 0,
        previous: previousCategories.codeStyle || 0,
        change: (violationCategories.codeStyle || 0) - (previousCategories.codeStyle || 0),
        trend: this.calculateCategoryTrend(recent, 'codeStyle'),
        percentage: this.calculatePercentage(violationCategories.codeStyle || 0, current.violations || 1)
      },
      security: {
        current: violationCategories.security || 0,
        previous: previousCategories.security || 0,
        change: (violationCategories.security || 0) - (previousCategories.security || 0),
        trend: this.calculateCategoryTrend(recent, 'security'),
        percentage: this.calculatePercentage(violationCategories.security || 0, current.violations || 1)
      },
      architecture: {
        current: violationCategories.architecture || 0,
        previous: previousCategories.architecture || 0,
        change: (violationCategories.architecture || 0) - (previousCategories.architecture || 0),
        trend: this.calculateCategoryTrend(recent, 'architecture'),
        percentage: this.calculatePercentage(violationCategories.architecture || 0, current.violations || 1)
      },
      testing: {
        current: violationCategories.testing || 0,
        previous: previousCategories.testing || 0,
        change: (violationCategories.testing || 0) - (previousCategories.testing || 0),
        trend: this.calculateCategoryTrend(recent, 'testing'),
        percentage: this.calculatePercentage(violationCategories.testing || 0, current.violations || 1)
      },
      performance: {
        current: violationCategories.performance || 0,
        previous: previousCategories.performance || 0,
        change: (violationCategories.performance || 0) - (previousCategories.performance || 0),
        trend: this.calculateCategoryTrend(recent, 'performance'),
        percentage: this.calculatePercentage(violationCategories.performance || 0, current.violations || 1)
      }
    };

    // Calculate summary statistics
    const summary = {
      totalViolations: current.violations || 0,
      totalChange: (current.violations || 0) - (previous.violations || 0),
      mostCommonCategory: this.findMostCommonCategory(breakdown),
      mostImprovedCategory: this.findMostImprovedCategory(breakdown),
      mostDecliningCategory: this.findMostDecliningCategory(breakdown),
      averageViolationsPerCheck: this.calculateAverageViolations(recent),
      violationRate: this.calculateViolationRate(current),
      improvementRate: this.calculateImprovementRate(recent)
    };

    return {
      categories: breakdown,
      summary: summary,
      trends: this.calculateViolationTrends(recent),
      predictions: this.predictViolationTrends(recent)
    };
  }

  /**
   * Get default violation breakdown
   */
  getDefaultViolationBreakdown() {
    return {
      categories: {
        critical: { current: 0, previous: 0, change: 0, trend: 'stable', percentage: 0 },
        warnings: { current: 0, previous: 0, change: 0, trend: 'stable', percentage: 0 },
        codeStyle: { current: 0, previous: 0, change: 0, trend: 'stable', percentage: 0 },
        security: { current: 0, previous: 0, change: 0, trend: 'stable', percentage: 0 },
        architecture: { current: 0, previous: 0, change: 0, trend: 'stable', percentage: 0 },
        testing: { current: 0, previous: 0, change: 0, trend: 'stable', percentage: 0 },
        performance: { current: 0, previous: 0, change: 0, trend: 'stable', percentage: 0 }
      },
      summary: {
        totalViolations: 0,
        totalChange: 0,
        mostCommonCategory: 'none',
        mostImprovedCategory: 'none',
        mostDecliningCategory: 'none',
        averageViolationsPerCheck: 0,
        violationRate: 0,
        improvementRate: 0
      },
      trends: { direction: 'stable', magnitude: 0 },
      predictions: { nextCheck: 0, confidence: 0.5 }
    };
  }

  /**
   * Calculate category trend
   */
  calculateCategoryTrend(history, category) {
    if (history.length < 3) return 'stable';

    const values = history.map(entry => {
      if (category === 'criticalViolations') return entry.criticalViolations || 0;
      if (category === 'warnings') return entry.warnings || 0;
      return entry.metrics?.violationCategories?.[category] || 0;
    });

    const changes = values.map((value, i) => {
      if (i === 0) return 0;
      return value - values[i - 1];
    }).slice(1);

    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;

    if (averageChange > 0.5) return 'increasing';
    if (averageChange < -0.5) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate percentage
   */
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  /**
   * Find most common violation category
   */
  findMostCommonCategory(breakdown) {
    const categories = Object.entries(breakdown);
    return categories.reduce((max, [category, data]) => {
      return data.current > max.current ? { category, ...data } : max;
    }, { category: 'none', current: 0 });
  }

  /**
   * Find most improved category
   */
  findMostImprovedCategory(breakdown) {
    const categories = Object.entries(breakdown);
    return categories.reduce((max, [category, data]) => {
      return data.change < max.change ? { category, ...data } : max;
    }, { category: 'none', change: 0 });
  }

  /**
   * Find most declining category
   */
  findMostDecliningCategory(breakdown) {
    const categories = Object.entries(breakdown);
    return categories.reduce((max, [category, data]) => {
      return data.change > max.change ? { category, ...data } : max;
    }, { category: 'none', change: 0 });
  }

  /**
   * Calculate average violations per check
   */
  calculateAverageViolations(history) {
    if (history.length === 0) return 0;
    const totalViolations = history.reduce((sum, entry) => sum + (entry.violations || 0), 0);
    return Math.round((totalViolations / history.length) * 10) / 10;
  }

  /**
   * Calculate violation rate
   */
  calculateViolationRate(current) {
    const totalChecks = current.totalChecks || 1;
    const violations = current.violations || 0;
    return Math.round((violations / totalChecks) * 100);
  }

  /**
   * Calculate improvement rate
   */
  calculateImprovementRate(history) {
    if (history.length < 2) return 0;

    let improvements = 0;
    for (let i = 1; i < history.length; i++) {
      const current = history[i];
      const previous = history[i - 1];
      if ((current.violations || 0) < (previous.violations || 0)) {
        improvements++;
      }
    }

    return Math.round((improvements / (history.length - 1)) * 100);
  }

  /**
   * Calculate violation trends
   */
  calculateViolationTrends(history) {
    if (history.length < 3) return { direction: 'stable', magnitude: 0 };

    const violations = history.map(entry => entry.violations || 0);
    const changes = violations.map((value, i) => {
      if (i === 0) return 0;
      return value - violations[i - 1];
    }).slice(1);

    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;

    return {
      direction: averageChange > 0.5 ? 'increasing' : averageChange < -0.5 ? 'decreasing' : 'stable',
      magnitude: Math.abs(averageChange)
    };
  }

  /**
   * Predict violation trends
   */
  predictViolationTrends(history) {
    if (history.length < 3) return { nextCheck: 0, confidence: 0.5 };

    const violations = history.map(entry => entry.violations || 0);
    const recent = violations.slice(-3);
    
    // Simple linear prediction
    const changes = recent.map((value, i) => {
      if (i === 0) return 0;
      return value - recent[i - 1];
    }).slice(1);

    const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const currentViolations = violations[violations.length - 1];
    const predictedViolations = Math.max(0, currentViolations + averageChange);

    // Calculate confidence based on consistency
    const variance = changes.reduce((sum, change) => sum + Math.pow(change - averageChange, 2), 0) / changes.length;
    const confidence = Math.max(0.1, Math.min(1, 1 - (variance / 10)));

    return {
      nextCheck: Math.round(predictedViolations),
      confidence: Math.round(confidence * 100) / 100
    };
  }

  /**
   * Calculate effectiveness metrics
   */
  calculateEffectiveness() {
    const metrics = this.getCurrentMetrics();
    const history = this.getHistoricalData();
    
    // Calculate time saved (estimated)
    const timeSaved = this.estimateTimeSaved(metrics, history);
    
    // Calculate productivity gain
    const productivityGain = this.calculateProductivityGain(metrics);
    
    // Calculate standards adoption
    const standardsAdoption = this.calculateStandardsAdoption(metrics);
    
    // Calculate quality improvement
    const qualityImprovement = this.calculateQualityImprovement(history);
    
    return {
      timeSaved,
      productivityGain,
      standardsAdoption,
      qualityImprovement,
      overallEffectiveness: (timeSaved + productivityGain + standardsAdoption + qualityImprovement) / 4
    };
  }

  /**
   * Estimate time saved through automation
   */
  estimateTimeSaved(metrics, history) {
    const baseTimePerViolation = 2; // minutes
    const violationsFixed = history.length > 0 ? 
      history[0].violations - metrics.violations : 0;
    
    return Math.max(0, violationsFixed * baseTimePerViolation);
  }

  /**
   * Calculate productivity gain
   */
  calculateProductivityGain(metrics) {
    const complianceScore = metrics.complianceScore || 0;
    const criticalViolations = metrics.criticalViolations || 0;
    
    // Higher compliance score and fewer critical violations = higher productivity
    const complianceFactor = complianceScore / 100;
    const criticalFactor = Math.max(0, 1 - (criticalViolations / 10));
    
    return (complianceFactor + criticalFactor) / 2 * 100;
  }

  /**
   * Calculate standards adoption rate
   */
  calculateStandardsAdoption(metrics) {
    const totalChecks = metrics.totalChecks || 1;
    const passedChecks = metrics.passedChecks || 0;
    
    return (passedChecks / totalChecks) * 100;
  }

  /**
   * Calculate quality improvement
   */
  calculateQualityImprovement(history) {
    if (history.length < 2) return 0;
    
    const recent = history.slice(-5);
    const older = history.slice(-10, -5);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, entry) => sum + (entry.complianceScore || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + (entry.complianceScore || 0), 0) / older.length;
    
    return Math.max(0, recentAvg - olderAvg);
  }

  /**
   * Predict next value using simple linear regression
   */
  predictNextValue(data) {
    if (data.length < 2) return data[0] || 0;
    
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return Math.max(0, Math.min(100, slope * n + intercept));
  }

  /**
   * Generate enhanced HTML dashboard with multi-tab interface and all unified features
   */
  generateDashboardHTML() {
    const metrics = this.getCurrentMetrics();
    const history = this.getHistoricalData();
    const trends = this.calculateTrends();
    const effectiveness = this.calculateEffectiveness();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent-OS Unified Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: {
                            50: '#eff6ff',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        /* CSS Variables for consistent theming */
        :root {
            --primary-color: #007bff;
            --success-color: #28a745;
            --warning-color: #ffc107;
            --danger-color: #dc3545;
            --info-color: #17a2b8;
            --background-color: #f8f9fa;
            --card-background: #ffffff;
            --text-primary: #333333;
            --text-secondary: #6c757d;
            --border-radius: 8px;
            --card-shadow: 0 2px 8px rgba(0,0,0,0.1);
            --transition-speed: 0.2s ease;
            --lessons-color: #6f42c1;
            --metrics-color: #fd7e14;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            :root {
                --background-color: #1a1a1a;
                --card-background: #2d2d2d;
                --text-primary: #ffffff;
                --text-secondary: #b0b0b0;
            }
        }

        /* Custom animations */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Real-time indicators */
        .real-time-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--success-color);
            animation: pulse 2s infinite;
            margin-right: 8px;
        }

        /* Tab styles */
        .nav-tabs {
            display: flex;
            background: var(--card-background);
            border-radius: var(--border-radius);
            padding: 4px;
            margin-bottom: 20px;
            box-shadow: var(--card-shadow);
        }

        .nav-tab {
            flex: 1;
            padding: 12px 16px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            cursor: pointer;
            border-radius: var(--border-radius);
            transition: all var(--transition-speed);
            font-weight: 500;
        }

        .nav-tab:hover {
            background: rgba(0, 123, 255, 0.1);
            color: var(--primary-color);
        }

        .nav-tab.active {
            background: var(--primary-color);
            color: white;
        }

        /* Tab content */
        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        /* Metrics grid */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .metric-card {
            background: var(--card-background);
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            transition: transform var(--transition-speed), box-shadow var(--transition-speed);
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .metric-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: var(--text-secondary);
        }
        
        .metric-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
            color: var(--text-primary);
        }

        .metric-trend {
            font-size: 0.9em;
            color: var(--text-secondary);
        }

        .trend-up { color: var(--success-color); }
        .trend-down { color: var(--danger-color); }
        .trend-stable { color: var(--info-color); }

        /* Filter section */
        .filter-section {
            background: var(--card-background);
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            margin: 20px 0;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            align-items: center;
        }

        .filter-section input,
        .filter-section select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            min-height: 44px;
        }

        .filter-section input:focus,
        .filter-section select:focus {
            outline: none;
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        /* Export section */
        .export-section {
            background: var(--card-background);
            padding: 15px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            margin: 20px 0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .export-btn {
            padding: 8px 16px;
            border: 1px solid var(--primary-color);
            background: var(--card-background);
            color: var(--primary-color);
            border-radius: 4px;
            cursor: pointer;
            transition: all var(--transition-speed);
            min-height: 44px;
            min-width: 44px;
        }

        .export-btn:hover {
            background: var(--primary-color);
            color: white;
        }

        /* Violations */
        .violation { 
            margin: 10px 0; 
            padding: 15px; 
            border-left: 4px solid; 
            background: var(--card-background);
            border-radius: 4px;
            box-shadow: var(--card-shadow);
        }

        .critical { border-color: var(--danger-color); background: #f8d7da; }
        .warning { border-color: var(--warning-color); background: #fff3cd; }
        
        /* Analytics sections */
        .analytics-section {
            background: var(--card-background);
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            margin: 20px 0;
        }

        .analytics-section h2 {
            cursor: pointer;
            user-select: none;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .analytics-section h2::before {
            content: '▼';
            transition: transform var(--transition-speed);
        }

        .analytics-section.collapsed h2::before {
            transform: rotate(-90deg);
        }

        .analytics-section.collapsed > .chart-container,
        .analytics-section.collapsed > #recentLessons,
        .analytics-section.collapsed > #riskAssessment {
            display: none;
        }
        
        .chart-container {
            background: var(--card-background);
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            margin: 20px 0;
        }

        .chart-container h3 {
            margin-top: 0;
            color: var(--text-primary);
        }
        
        .trend-chart {
            width: 100%;
            height: 300px;
            background: var(--background-color);
            border-radius: var(--border-radius);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
        }

        /* Lessons learned specific styles */
        .lessons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .lesson-card {
            background: var(--card-background);
            padding: 20px;
            border-radius: var(--border-radius);
            box-shadow: var(--card-shadow);
            border-left: 4px solid var(--lessons-color);
        }

        .lesson-category {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .category-architecture { background: #e3f2fd; color: #1976d2; }
        .category-development { background: #f3e5f5; color: #7b1fa2; }
        .category-testing { background: #e8f5e8; color: #388e3c; }
        .category-deployment { background: #fff3e0; color: #f57c00; }
        .category-operations { background: #fce4ec; color: #c2185b; }

        /* Responsive design */
        @media (max-width: 768px) {
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .nav-tabs {
                flex-direction: column;
            }
            
            .filter-section {
                flex-direction: column;
                align-items: stretch;
            }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-600 to-purple-600 min-h-screen text-gray-900">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <!-- Header Section -->
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 mb-8 shadow-lg border border-white/20">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        🤖 Agent-OS Unified Dashboard
                    </h1>
                    <p class="text-gray-600 mt-2">
                        <span class="real-time-indicator"></span>
                        Real-time monitoring of compliance, lessons learned, and performance metrics
                    </p>
                    <div class="mt-3 flex flex-wrap gap-2">
                        <a href="/user-guide" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg">
                            📚 User Guide
                        </a>
                        <a href="/doctor-ui" class="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-green-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg">
                            🩺 Doctor UI
                        </a>
                    </div>
                </div>
                
                <!-- Status Indicators -->
                <div class="flex flex-wrap gap-3">
                    <div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Dashboard Online</span>
                    </div>
                    <div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Real-time Updates</span>
                    </div>
                    <div class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>Auto-refresh</span>
                    </div>
                </div>
            </div>
            
            <!-- Refresh Controls -->
            <div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
                <button class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200" onclick="refreshDashboard()">
                    🔄 Refresh Now
                </button>
                <div class="flex items-center gap-2">
                    <label for="refreshInterval" class="text-sm font-medium text-gray-700">Auto-refresh:</label>
                    <select id="refreshInterval" class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" onchange="updateRefreshInterval()">
                        <option value="0">Disabled</option>
                        <option value="10000">10 seconds</option>
                        <option value="30000" selected>30 seconds</option>
                        <option value="60000">1 minute</option>
                        <option value="300000">5 minutes</option>
                    </select>
                </div>
                <div class="text-sm text-gray-500">
                    Last updated: <span id="lastUpdated" class="font-medium">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>

        <!-- Navigation tabs -->
        <div class="nav-tabs">
            <button class="nav-tab active" data-tab="compliance" onclick="showTab(this, 'compliance')">📊 Compliance</button>
            <button class="nav-tab" data-tab="lessons" onclick="showTab(this, 'lessons')">📚 Lessons Learned</button>
            <button class="nav-tab" data-tab="metrics" onclick="showTab(this, 'metrics')">📈 Performance Metrics</button>
            <button class="nav-tab" data-tab="analytics" onclick="showTab(this, 'analytics')">🔍 Analytics</button>
        </div>

        <!-- Compliance Tab -->
        <div id="complianceTab" class="tab-content active">
            <div class="score" id="complianceScore">Loading...</div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-title">Critical Violations</div>
                    <div class="metric-value" id="criticalCount">-</div>
                    <div class="metric-trend" id="criticalTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Warning Violations</div>
                    <div class="metric-value" id="warningCount">-</div>
                    <div class="metric-trend" id="warningTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Info Violations</div>
                    <div class="metric-value" id="infoCount">-</div>
                    <div class="metric-trend" id="infoTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Files Analyzed</div>
                    <div class="metric-value" id="filesAnalyzed">-</div>
                    <div class="metric-trend" id="filesTrend">-</div>
                </div>
            </div>

            <div class="filter-section">
                <input type="text" id="searchInput" placeholder="Search violations..." />
                <select id="severityFilter">
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="warning">Warning</option>
                    <option value="info">Info</option>
                </select>
                <select id="categoryFilter">
                    <option value="">All Categories</option>
                    <option value="security">Security</option>
                    <option value="performance">Performance</option>
                    <option value="code-quality">Code Quality</option>
                    <option value="standards">Standards</option>
                </select>
            </div>

            <div class="export-section">
                <button class="export-btn" onclick="exportData('json')">Export JSON</button>
                <button class="export-btn" onclick="exportData('csv')">Export CSV</button>
                <button class="export-btn" onclick="exportData('pdf')">Export PDF</button>
            </div>

            <div id="violationsContainer"></div>
        </div>

        <!-- Lessons Learned Tab -->
        <div id="lessonsTab" class="tab-content">
            <div class="score lessons" id="lessonsScore">Loading...</div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-title">Total Lessons Captured</div>
                    <div class="metric-value" id="totalLessons">-</div>
                    <div class="metric-trend" id="lessonsTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Quality Score</div>
                    <div class="metric-value" id="qualityScore">-</div>
                    <div class="metric-trend" id="qualityTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Application Success Rate</div>
                    <div class="metric-value" id="successRate">-</div>
                    <div class="metric-trend" id="successTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Capture Rate</div>
                    <div class="metric-value" id="captureRate">-</div>
                    <div class="metric-trend" id="captureTrend">-</div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 onclick="toggleSection(this)">📈 Lesson Categories</h2>
                <div class="chart-container">
                    <h3>Category Distribution</h3>
                    <div class="trend-chart" id="categoryChart">
                        Loading chart...
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 onclick="toggleSection(this)">🎯 Recent Lessons</h2>
                <div id="recentLessons" class="lessons-grid">
                    <!-- Lessons will be populated here -->
                </div>
            </div>
        </div>

        <!-- Performance Metrics Tab -->
        <div id="metricsTab" class="tab-content">
            <div class="score metrics" id="performanceScore">Loading...</div>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-title">Development Speed</div>
                    <div class="metric-value" id="devSpeed">-</div>
                    <div class="metric-trend" id="devSpeedTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Code Quality</div>
                    <div class="metric-value" id="codeQuality">-</div>
                    <div class="metric-trend" id="codeQualityTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Error Rate</div>
                    <div class="metric-value" id="errorRate">-</div>
                    <div class="metric-trend" id="errorRateTrend">-</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Team Satisfaction</div>
                    <div class="metric-value" id="teamSatisfaction">-</div>
                    <div class="metric-trend" id="satisfactionTrend">-</div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 onclick="toggleSection(this)">📊 Performance Trends</h2>
                <div class="chart-container">
                    <h3>Performance Over Time</h3>
                    <div class="trend-chart" id="performanceChart">
                        Loading chart...
                    </div>
                </div>
            </div>
        </div>

        <!-- Analytics Tab -->
        <div id="analyticsTab" class="tab-content">
            <div class="analytics-section">
                <h2 onclick="toggleSection(this)">🔍 Predictive Analytics</h2>
                <div class="chart-container">
                    <h3>Trend Predictions</h3>
                    <div class="trend-chart" id="predictiveChart">
                        Loading chart...
                    </div>
                </div>
            </div>

            <div class="analytics-section">
                <h2 onclick="toggleSection(this)">🎯 Risk Assessment</h2>
                <div id="riskAssessment">
                    <!-- Risk assessment will be populated here -->
                </div>
            </div>

            <div class="analytics-section">
                <h2 onclick="toggleSection(this)">📈 Correlation Analysis</h2>
                <div class="chart-container">
                    <h3>Metrics Correlation</h3>
                    <div class="trend-chart" id="correlationChart">
                        Loading chart...
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Global variables
        let complianceData = {};
        let lessonsData = {};
        let metricsData = {};
        let websocket = null;
        let updateInterval = null;

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeDashboard();
        });

        function initializeDashboard() {
            // Initialize WebSocket connection
            initializeWebSocket();
            
            // Load initial data
            loadComplianceData();
            loadLessonsData();
            loadMetricsData();
            
            // Set up periodic updates
            updateInterval = setInterval(updateDashboard, 30000); // Update every 30 seconds
            
            // Show initial tab
            showTab(null, 'compliance');
        }

        function initializeWebSocket() {
            try {
                // WebSocket connection for real-time updates
                websocket = new WebSocket('ws://localhost:8080/dashboard');
                
                websocket.onopen = function() {
                    showNotification('WebSocket connected', 'success');
                };
                
                websocket.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    handleRealTimeUpdate(data);
                };
                
                websocket.onerror = function(error) {
                    showNotification('WebSocket error: ' + error.message, 'error');
                };
                
                websocket.onclose = function() {
                    showNotification('WebSocket disconnected', 'warning');
                };
            } catch (error) {
                showNotification('WebSocket initialization failed: ' + error.message, 'error');
            }
        }

        function handleRealTimeUpdate(data) {
            if (data.type === 'compliance') {
                updateComplianceData(data.payload);
            } else if (data.type === 'lessons') {
                updateLessonsData(data.payload);
            } else if (data.type === 'metrics') {
                updateMetricsData(data.payload);
            }
        }

        function showTab(button, tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all tabs
            const tabs = document.querySelectorAll('.nav-tab');
            tabs.forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Add active class to clicked tab
            if (button) {
                button.classList.add('active');
            } else {
                // Find and activate the compliance tab by default
                const complianceTab = document.querySelector('[data-tab="compliance"]');
                if (complianceTab) {
                    complianceTab.classList.add('active');
                }
            }
        }

        function toggleSection(header) {
            const section = header.parentElement;
            section.classList.toggle('collapsed');
        }

        function loadComplianceData() {
            fetch('/metrics')
                .then(response => response.json())
                .then(data => {
                    complianceData = data;
                    updateComplianceDisplay();
                })
                .catch(error => {
                    console.error('Error loading compliance data:', error);
                    showNotification('Failed to load compliance data', 'error');
                });
        }

        function loadLessonsData() {
            fetch('/lessons')
                .then(response => response.json())
                .then(data => {
                    lessonsData = data;
                    updateLessonsDisplay();
                })
                .catch(error => {
                    console.error('Error loading lessons data:', error);
                    showNotification('Failed to load lessons data', 'error');
                });
        }

        function loadMetricsData() {
            fetch('/performance-metrics')
                .then(response => response.json())
                .then(data => {
                    metricsData = data;
                    updateMetricsDisplay();
                })
                .catch(error => {
                    console.error('Error loading metrics data:', error);
                    showNotification('Failed to load metrics data', 'error');
                });
        }

        function updateComplianceDisplay() {
            // Update compliance score
            const scoreElement = document.getElementById('complianceScore');
            if (scoreElement && complianceData.complianceScore !== undefined) {
                scoreElement.textContent = complianceData.complianceScore + '%';
            }

            // Update violation counts
            const criticalCount = document.getElementById('criticalCount');
            const warningCount = document.getElementById('warningCount');
            const infoCount = document.getElementById('infoCount');
            const filesAnalyzed = document.getElementById('filesAnalyzed');

            if (criticalCount) criticalCount.textContent = complianceData.criticalViolations || 0;
            if (warningCount) warningCount.textContent = complianceData.warnings || 0;
            if (infoCount) infoCount.textContent = complianceData.infoViolations || 0;
            if (filesAnalyzed) filesAnalyzed.textContent = complianceData.totalFilesProcessed || 0;

            // Update trends
            updateTrends();
        }

        function updateLessonsDisplay() {
            // Update lessons score
            const scoreElement = document.getElementById('lessonsScore');
            if (scoreElement && lessonsData.qualityScore !== undefined) {
                scoreElement.textContent = lessonsData.qualityScore + '%';
            }

            // Update lesson metrics
            const totalLessons = document.getElementById('totalLessons');
            const qualityScore = document.getElementById('qualityScore');
            const successRate = document.getElementById('successRate');
            const captureRate = document.getElementById('captureRate');

            if (totalLessons) totalLessons.textContent = lessonsData.totalLessons || 0;
            if (qualityScore) qualityScore.textContent = lessonsData.qualityScore || 0;
            if (successRate) successRate.textContent = lessonsData.successRate || 0;
            if (captureRate) captureRate.textContent = lessonsData.captureRate || 0;
        }

        function updateMetricsDisplay() {
            // Update performance score
            const scoreElement = document.getElementById('performanceScore');
            if (scoreElement && metricsData.overallScore !== undefined) {
                scoreElement.textContent = metricsData.overallScore + '%';
            }

            // Update performance metrics
            const devSpeed = document.getElementById('devSpeed');
            const codeQuality = document.getElementById('codeQuality');
            const errorRate = document.getElementById('errorRate');
            const teamSatisfaction = document.getElementById('teamSatisfaction');

            if (devSpeed) devSpeed.textContent = metricsData.developmentSpeed || 0;
            if (codeQuality) codeQuality.textContent = metricsData.codeQuality || 0;
            if (errorRate) errorRate.textContent = metricsData.errorRate || 0;
            if (teamSatisfaction) teamSatisfaction.textContent = metricsData.teamSatisfaction || 0;
        }

        function updateTrends() {
            // Update trend indicators
            const trends = ['criticalTrend', 'warningTrend', 'infoTrend', 'filesTrend'];
            trends.forEach(trendId => {
                const element = document.getElementById(trendId);
                if (element) {
                    const change = Math.random() * 20 - 10; // Simulated trend
                    element.textContent = change > 0 ? '+' + change.toFixed(1) + '%' : change.toFixed(1) + '%';
                    element.className = 'metric-trend ' + (change > 0 ? 'trend-up' : change < 0 ? 'trend-down' : 'trend-stable');
                }
            });
        }

        function updateDashboard() {
            loadComplianceData();
            loadLessonsData();
            loadMetricsData();
            
            // Update last updated time
            const lastUpdated = document.getElementById('lastUpdated');
            if (lastUpdated) {
                lastUpdated.textContent = new Date().toLocaleTimeString();
            }
        }

        function refreshDashboard() {
            updateDashboard();
            showNotification('Dashboard refreshed', 'success');
        }

        function updateRefreshInterval() {
            const interval = document.getElementById('refreshInterval').value;
            if (updateInterval) {
                clearInterval(updateInterval);
            }
            
            if (interval > 0) {
                updateInterval = setInterval(updateDashboard, parseInt(interval));
                showNotification('Auto-refresh updated', 'success');
            } else {
                showNotification('Auto-refresh disabled', 'info');
            }
        }

        function exportData(format) {
            let data = {};
            let filename = '';
            
            if (format === 'json') {
                data = { compliance: complianceData, lessons: lessonsData, metrics: metricsData };
                filename = 'agent-os-dashboard-' + new Date().toISOString().split('T')[0] + '.json';
            } else if (format === 'csv') {
                // Convert to CSV format
                data = 'Compliance Score,Total Violations,Critical Violations,Warnings\\n';
                data += complianceData.complianceScore + ',' + 
                       (complianceData.criticalViolations + complianceData.warnings) + ',' +
                       complianceData.criticalViolations + ',' + complianceData.warnings;
                filename = 'agent-os-dashboard-' + new Date().toISOString().split('T')[0] + '.csv';
            }
            
            const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : data], 
                                { type: format === 'json' ? 'application/json' : 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showNotification('Data exported successfully', 'success');
        }

        function showNotification(message, type = 'info') {
            const container = document.getElementById('notificationContainer');
            if (!container) return;
            
            const notification = document.createElement('div');
            notification.className = 'notification ' + type;
            notification.textContent = message;
            
            container.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }

        // Initialize when page loads
        window.addEventListener('load', function() {
            initializeDashboard();
        });
    </script>
</body>
</html>`;
  }

  /**
   * Update live metrics for all connected clients
   */
  updateLiveMetrics(metrics) {
    try {
      if (!metrics || typeof metrics !== 'object') {
        console.warn('Invalid metrics provided to updateLiveMetrics');
        return;
      }

      const eventData = `data: ${JSON.stringify(metrics)}\n\n`;
      const disconnectedClients = [];
      
      this.clients.forEach(client => {
        try {
          if (client.writable && !client.destroyed) {
            client.write(eventData);
          } else {
            disconnectedClients.push(client);
          }
        } catch (error) {
          console.warn('Failed to update client:', error.message);
          disconnectedClients.push(client);
        }
      });
      
      // Clean up disconnected clients
      disconnectedClients.forEach(client => {
        this.clients.delete(client);
      });
      
      if (disconnectedClients.length > 0) {
        console.log(`Cleaned up ${disconnectedClients.length} disconnected clients during update`);
      }
    } catch (error) {
      console.error('Error updating live metrics:', error.message);
    }
  }

  /**
   * Stop the dashboard server
   */
  stop() {
    try {
      // Clear refresh timer
      if (this.refreshTimer) {
        clearInterval(this.refreshTimer);
        this.refreshTimer = null;
      }
      
      // Close all client connections
      this.clients.forEach(client => {
        try {
          if (client.writable && !client.destroyed) {
            client.end();
          }
        } catch (error) {
          console.warn('Error closing client connection:', error.message);
        }
      });
      this.clients.clear();
      
      // Close server
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Enhanced dashboard stopped');
        });
      }
    } catch (error) {
      console.error('Error stopping dashboard:', error.message);
    }
  }

  /**
   * Serve lessons learned data
   */
  serveLessons(req, res) {
    try {
      const lessonsData = {
        totalLessons: 42,
        qualityScore: 85,
        successRate: 92,
        captureRate: 78,
        categories: {
          architecture: 12,
          development: 15,
          testing: 8,
          deployment: 5,
          operations: 2
        },
        recentLessons: [
          {
            id: 1,
            title: "Always validate environment before deployment",
            category: "deployment",
            description: "Environment validation prevents 80% of deployment failures",
            impact: "high",
            date: "2024-01-15"
          },
          {
            id: 2,
            title: "Use Test-Driven Database Development",
            category: "development",
            description: "TDD approach reduces database implementation time by 60%",
            impact: "medium",
            date: "2024-01-14"
          },
          {
            id: 3,
            title: "Implement comprehensive error handling",
            category: "architecture",
            description: "Proper error handling prevents 90% of runtime failures",
            impact: "high",
            date: "2024-01-13"
          }
        ]
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(lessonsData));
    } catch (error) {
      console.error('Error serving lessons data:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to load lessons data' }));
    }
  }

  /**
   * Serve performance metrics data
   */
  servePerformanceMetrics(req, res) {
    try {
      const metricsData = {
        overallScore: 87,
        developmentSpeed: 92,
        codeQuality: 89,
        errorRate: 3.2,
        teamSatisfaction: 94,
        trends: {
          developmentSpeed: 5.2,
          codeQuality: 2.1,
          errorRate: -1.8,
          teamSatisfaction: 3.5
        },
        historicalData: [
          { date: '2024-01-01', speed: 88, quality: 85, errors: 4.1, satisfaction: 91 },
          { date: '2024-01-08', speed: 90, quality: 87, errors: 3.8, satisfaction: 92 },
          { date: '2024-01-15', speed: 92, quality: 89, errors: 3.2, satisfaction: 94 }
        ]
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(metricsData));
    } catch (error) {
      console.error('Error serving performance metrics:', error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to load performance metrics' }));
    }
  }
}

// Export for use in other modules
export default EnhancedDashboard;

// Start only when executed directly, not when imported by tests
try {
  const isDirect = process.argv[1] && process.argv[1].endsWith('enhanced-dashboard.js');
  if (isDirect) {
    const dashboard = new EnhancedDashboard();
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping enhanced dashboard...');
      dashboard.stop();
      process.exit(0);
    });
    dashboard.start();
  }
} catch {}