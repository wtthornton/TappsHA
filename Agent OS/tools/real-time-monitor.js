#!/usr/bin/env node

/**
 * Real-Time Monitor for Agent-OS
 * Provides live performance dashboards, violation tracking, and performance alerts
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RealTimeMonitor {
  constructor() {
    this.port = process.env.MONITOR_PORT || 3003;
    this.wsPort = process.env.MONITOR_WS_PORT || 3004;
    this.metricsPath = path.join(__dirname, '../reports/live-metrics.json');
    this.historyPath = path.join(__dirname, '../reports/compliance-history.json');
    
    this.server = null;
    this.wss = null;
    this.clients = new Set();
    
    // Real-time monitoring data
    this.liveData = {
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        responseTime: 0,
        throughput: 0
      },
      violations: {
        total: 0,
        critical: 0,
        warnings: 0,
        trends: []
      },
      alerts: [],
      trends: {
        complianceScore: [],
        violationCount: [],
        responseTime: []
      }
    };
    
    // Alert thresholds
    this.thresholds = {
      cpuUsage: 80, // %
      memoryUsage: 85, // %
      responseTime: 1000, // ms
      violationIncrease: 20, // %
      complianceDrop: 10 // %
    };
    
    // Performance tracking
    this.performanceHistory = [];
    this.alertHistory = [];
  }

  /**
   * Start the real-time monitoring server
   */
  start() {
    console.log('🚀 Starting Real-Time Monitor...');
    console.log(`📊 Dashboard available at: http://localhost:${this.port}`);
    console.log(`🔌 WebSocket available at: ws://localhost:${this.wsPort}`);
    console.log(`📈 Real-Time Features:`);
    console.log(`   - Live performance metrics`);
    console.log(`   - Real-time violation tracking`);
    console.log(`   - Performance alerts and notifications`);
    console.log(`   - Trend analysis and predictions`);
    console.log(`   - Resource usage monitoring`);
    
    // Start HTTP server for dashboard
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Real-time monitor running on port ${this.port}`);
    });
    
    // Start WebSocket server for real-time updates
    this.wss = new WebSocketServer({ port: this.wsPort }, () => {
      console.log(`✅ WebSocket server running on port ${this.wsPort}`);
    });
    
    this.wss.on('connection', (ws) => {
      this.handleWebSocketConnection(ws);
    });
    
    // Start monitoring loops
    this.startPerformanceMonitoring();
    this.startViolationTracking();
    this.startAlertSystem();
  }

  /**
   * Handle WebSocket connections
   */
  handleWebSocketConnection(ws) {
    console.log('🔌 New WebSocket client connected');
    this.clients.add(ws);
    
    // Send initial data
    ws.send(JSON.stringify({
      type: 'init',
      data: this.liveData
    }));
    
    ws.on('close', () => {
      console.log('🔌 WebSocket client disconnected');
      this.clients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
      this.clients.delete(ws);
    });
  }

  /**
   * Broadcast data to all connected clients
   */
  broadcast(data) {
    const message = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Start performance monitoring loop
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 5000); // Update every 5 seconds
  }

  /**
   * Start violation tracking loop
   */
  startViolationTracking() {
    setInterval(() => {
      this.updateViolationMetrics();
    }, 10000); // Update every 10 seconds
  }

  /**
   * Start alert system
   */
  startAlertSystem() {
    setInterval(() => {
      this.checkAlerts();
    }, 15000); // Check every 15 seconds
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = this.getCPUUsage();
      
      this.liveData.performance = {
        cpuUsage: Math.round(cpuUsage),
        memoryUsage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        responseTime: this.calculateAverageResponseTime(),
        throughput: this.calculateThroughput()
      };
      
      // Add to history
      this.performanceHistory.push({
        timestamp: Date.now(),
        ...this.liveData.performance
      });
      
      // Keep only last 100 entries
      if (this.performanceHistory.length > 100) {
        this.performanceHistory.shift();
      }
      
      // Broadcast update
      this.broadcast({
        type: 'performance',
        data: this.liveData.performance
      });
      
    } catch (error) {
      console.error('❌ Error updating performance metrics:', error.message);
    }
  }

  /**
   * Update violation metrics
   */
  updateViolationMetrics() {
    try {
      const metrics = this.getCurrentMetrics();
      const history = this.getHistoricalData();
      
      if (metrics && history.length > 0) {
        const recentViolations = history.slice(-5).map(h => h.totalViolations || 0);
        const violationTrend = this.calculateTrend(recentViolations);
        
        this.liveData.violations = {
          total: metrics.totalViolations || 0,
          critical: metrics.criticalViolations || 0,
          warnings: metrics.warningViolations || 0,
          trends: violationTrend
        };
        
        // Update trends
        this.liveData.trends.complianceScore.push(metrics.complianceScore || 0);
        this.liveData.trends.violationCount.push(metrics.totalViolations || 0);
        this.liveData.trends.responseTime.push(this.liveData.performance.responseTime);
        
        // Keep only last 20 entries for trends
        if (this.liveData.trends.complianceScore.length > 20) {
          this.liveData.trends.complianceScore.shift();
          this.liveData.trends.violationCount.shift();
          this.liveData.trends.responseTime.shift();
        }
        
        // Broadcast update
        this.broadcast({
          type: 'violations',
          data: this.liveData.violations
        });
        
        this.broadcast({
          type: 'trends',
          data: this.liveData.trends
        });
      }
    } catch (error) {
      console.error('❌ Error updating violation metrics:', error.message);
    }
  }

  /**
   * Check for alerts and send notifications
   */
  checkAlerts() {
    const alerts = [];
    
    // Check CPU usage
    if (this.liveData.performance.cpuUsage > this.thresholds.cpuUsage) {
      alerts.push({
        type: 'warning',
        message: `High CPU usage: ${this.liveData.performance.cpuUsage}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check memory usage
    if (this.liveData.performance.memoryUsage > this.thresholds.memoryUsage) {
      alerts.push({
        type: 'warning',
        message: `High memory usage: ${this.liveData.performance.memoryUsage}%`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check response time
    if (this.liveData.performance.responseTime > this.thresholds.responseTime) {
      alerts.push({
        type: 'warning',
        message: `Slow response time: ${this.liveData.performance.responseTime}ms`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check violation increase
    if (this.liveData.violations.trends.length > 1) {
      const recentIncrease = this.liveData.violations.trends[this.liveData.violations.trends.length - 1];
      if (recentIncrease > this.thresholds.violationIncrease) {
        alerts.push({
          type: 'alert',
          message: `Violation increase detected: ${recentIncrease}%`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Add new alerts
    if (alerts.length > 0) {
      this.liveData.alerts.push(...alerts);
      
      // Keep only last 50 alerts
      if (this.liveData.alerts.length > 50) {
        this.liveData.alerts.splice(0, this.liveData.alerts.length - 50);
      }
      
      // Broadcast alerts
      this.broadcast({
        type: 'alerts',
        data: alerts
      });
      
      console.log(`🚨 ${alerts.length} new alerts generated`);
    }
  }

  /**
   * Calculate CPU usage (simplified)
   */
  getCPUUsage() {
    // Simplified CPU usage calculation
    const startUsage = process.cpuUsage();
    const startTime = Date.now();
    
    // Simulate some work
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.random();
    }
    
    const endUsage = process.cpuUsage(startUsage);
    const endTime = Date.now();
    
    const cpuUsage = (endUsage.user + endUsage.system) / ((endTime - startTime) * 1000);
    return Math.min(100, Math.max(0, cpuUsage * 100));
  }

  /**
   * Calculate average response time
   */
  calculateAverageResponseTime() {
    if (this.performanceHistory.length === 0) return 0;
    
    const recent = this.performanceHistory.slice(-10);
    const avg = recent.reduce((sum, entry) => sum + entry.responseTime, 0) / recent.length;
    return Math.round(avg);
  }

  /**
   * Calculate throughput
   */
  calculateThroughput() {
    if (this.performanceHistory.length < 2) return 0;
    
    const recent = this.performanceHistory.slice(-5);
    const requestsPerSecond = recent.length / 5; // 5 second window
    return Math.round(requestsPerSecond);
  }

  /**
   * Calculate trend from data points
   */
  calculateTrend(data) {
    if (data.length < 2) return 0;
    
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return Math.round(slope * 100); // Convert to percentage
  }

  /**
   * Get current metrics from compliance checker
   */
  getCurrentMetrics() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        const data = fs.readFileSync(this.metricsPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Error reading current metrics:', error.message);
    }
    return null;
  }

  /**
   * Get historical data
   */
  getHistoricalData() {
    try {
      if (fs.existsSync(this.historyPath)) {
        const data = fs.readFileSync(this.historyPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('❌ Error reading historical data:', error.message);
    }
    return [];
  }

  /**
   * Handle HTTP requests for dashboard
   */
  handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    switch (pathname) {
      case '/':
        this.serveDashboard(req, res);
        break;
      case '/api/live-data':
        this.serveLiveData(req, res);
        break;
      case '/api/alerts':
        this.serveAlerts(req, res);
        break;
      case '/api/performance':
        this.servePerformance(req, res);
        break;
      case '/api/violations':
        this.serveViolations(req, res);
        break;
      default:
        this.serveNotFound(req, res);
    }
  }

  /**
   * Serve dashboard HTML
   */
  serveDashboard(req, res) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Agent OS Real-Time Monitor</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: #333; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { font-size: 2em; font-weight: bold; color: #333; }
        .label { color: #666; margin-bottom: 10px; }
        .alert { background: #ffebee; border-left: 4px solid #f44336; padding: 10px; margin: 10px 0; }
        .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; margin: 10px 0; }
        .chart { height: 200px; background: #f9f9f9; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Agent OS Real-Time Monitor</h1>
            <p>Live performance metrics and violation tracking</p>
        </div>
        
        <div class="grid">
            <div class="card">
                <div class="label">CPU Usage</div>
                <div class="metric" id="cpu-usage">--</div>
            </div>
            <div class="card">
                <div class="label">Memory Usage</div>
                <div class="metric" id="memory-usage">--</div>
            </div>
            <div class="card">
                <div class="label">Response Time</div>
                <div class="metric" id="response-time">--</div>
            </div>
            <div class="card">
                <div class="label">Total Violations</div>
                <div class="metric" id="total-violations">--</div>
            </div>
        </div>
        
        <div class="card">
            <h3>🚨 Recent Alerts</h3>
            <div id="alerts"></div>
        </div>
        
        <div class="grid">
            <div class="card">
                <h3>📈 Performance Trends</h3>
                <div class="chart" id="performance-chart">Chart loading...</div>
            </div>
            <div class="card">
                <h3>📊 Violation Trends</h3>
                <div class="chart" id="violation-chart">Chart loading...</div>
            </div>
        </div>
    </div>
    
    <script>
        const ws = new WebSocket('ws://localhost:3004');
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            
            switch(data.type) {
                case 'init':
                    updateDashboard(data.data);
                    break;
                case 'performance':
                    updatePerformance(data.data);
                    break;
                case 'violations':
                    updateViolations(data.data);
                    break;
                case 'alerts':
                    updateAlerts(data.data);
                    break;
            }
        };
        
        function updateDashboard(data) {
            updatePerformance(data.performance);
            updateViolations(data.violations);
            updateAlerts(data.alerts);
        }
        
        function updatePerformance(data) {
            document.getElementById('cpu-usage').textContent = data.cpuUsage + '%';
            document.getElementById('memory-usage').textContent = data.memoryUsage + '%';
            document.getElementById('response-time').textContent = data.responseTime + 'ms';
        }
        
        function updateViolations(data) {
            document.getElementById('total-violations').textContent = data.total;
        }
        
        function updateAlerts(alerts) {
            const container = document.getElementById('alerts');
            alerts.forEach(alert => {
                const div = document.createElement('div');
                div.className = alert.type;
                div.innerHTML = \`<strong>\${alert.type.toUpperCase()}:</strong> \${alert.message}\`;
                container.appendChild(div);
            });
        }
    </script>
</body>
</html>`;
    
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  /**
   * Serve live data API
   */
  serveLiveData(req, res) {
    const response = {
      timestamp: new Date().toISOString(),
      status: 'success',
      data: this.liveData
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  /**
   * Serve alerts API
   */
  serveAlerts(req, res) {
    const response = {
      timestamp: new Date().toISOString(),
      status: 'success',
      data: this.liveData.alerts
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  /**
   * Serve performance API
   */
  servePerformance(req, res) {
    const response = {
      timestamp: new Date().toISOString(),
      status: 'success',
      data: this.liveData.performance
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  /**
   * Serve violations API
   */
  serveViolations(req, res) {
    const response = {
      timestamp: new Date().toISOString(),
      status: 'success',
      data: this.liveData.violations
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  /**
   * Serve 404
   */
  serveNotFound(req, res) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      error: 'Not Found',
      message: 'Endpoint not found'
    }));
  }

  /**
   * Stop the monitor
   */
  stop() {
    if (this.server) {
      this.server.close();
    }
    if (this.wss) {
      this.wss.close();
    }
    console.log('🛑 Real-time monitor stopped');
  }
}

// Export for use in other modules
export default RealTimeMonitor;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new RealTimeMonitor();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping real-time monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  monitor.start();
}
