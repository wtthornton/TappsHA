#!/usr/bin/env node

/**
 * Enhanced Real-Time Dashboard for Agent-OS
 * Provides live monitoring and visualization of compliance metrics
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

class EnhancedDashboard {
  constructor() {
    this.port = process.env.DASHBOARD_PORT || 3001;
    this.dashboardPath = path.join(__dirname, '../reports/dashboard');
    this.metricsPath = path.join(__dirname, '../reports/live-metrics.json');
    this.historyPath = path.join(__dirname, '../reports/compliance-history.json');
    
    // Ensure dashboard directory exists
    if (!fs.existsSync(this.dashboardPath)) {
      fs.mkdirSync(this.dashboardPath, { recursive: true });
    }
    
    this.server = null;
    this.clients = new Set();
  }

  /**
   * Start the enhanced dashboard server
   */
  start() {
    console.log('🚀 Starting Enhanced Agent-OS Dashboard...');
    console.log(`📊 Dashboard available at: http://localhost:${this.port}`);
    console.log(`📈 Real-time metrics: http://localhost:${this.port}/metrics`);
    
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Enhanced dashboard running on port ${this.port}`);
      this.generateDashboardHTML();
    });
  }

  /**
   * Handle incoming HTTP requests
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
      case '/metrics':
        this.serveMetrics(req, res);
        break;
      case '/history':
        this.serveHistory(req, res);
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
      default:
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
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
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(history, null, 2));
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
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    // Add client to set
    this.clients.add(res);

    // Send initial data
    const metrics = this.getCurrentMetrics();
    res.write(`data: ${JSON.stringify(metrics)}\n\n`);

    // Remove client when connection closes
    req.on('close', () => {
      this.clients.delete(res);
    });
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        return JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️ Could not read metrics file:', error.message);
    }

    // Return default metrics if file doesn't exist
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
      }
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
   * Calculate trends from historical data
   */
  calculateTrends() {
    const history = this.getHistoricalData();
    if (history.length < 2) {
      return { trend: 'insufficient_data', slope: 0 };
    }

    const recentScores = history.slice(-10).map(entry => entry.complianceScore || 0);
    const n = recentScores.length;
    
    // Calculate linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += recentScores[i];
      sumXY += i * recentScores[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const trend = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';
    
    return {
      trend,
      slope,
      recentScores,
      prediction: this.predictNextValue(recentScores)
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
   * Generate the main dashboard HTML
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agent-OS Real-Time Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            color: white;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .metric-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0,0,0,0.15);
        }

        .metric-card.compliance-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }

        .metric-card.compliance-card .metric-title {
            color: rgba(255,255,255,0.8);
        }

        .metric-card.compliance-card .metric-value {
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .compliance-ring {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: conic-gradient(
                from 0deg,
                rgba(255,255,255,0.3) 0deg,
                rgba(255,255,255,0.8) var(--compliance-percentage),
                rgba(255,255,255,0.3) var(--compliance-percentage),
                rgba(255,255,255,0.3) 360deg
            );
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 600;
        }

        .compliance-ring::before {
            content: '';
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
        }

        .compliance-ring::after {
            content: attr(data-percentage);
            position: absolute;
            font-size: 0.7rem;
            font-weight: 700;
        }

        .compliance-animation {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .compliance-improving {
            animation: improving 1s ease-out;
        }

        @keyframes improving {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .compliance-declining {
            animation: declining 1s ease-out;
        }

        @keyframes declining {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
        }

        .metric-title {
            font-size: 0.9rem;
            text-transform: uppercase;
            color: #666;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .metric-trend {
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        .trend-stable { color: #6b7280; }

        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .chart-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }

        .chart-title {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #333;
        }

        .effectiveness-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }

        .effectiveness-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            text-align: center;
        }

        .effectiveness-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }

        .effectiveness-value {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .effectiveness-label {
            font-size: 0.9rem;
            color: #666;
        }

        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }

        .status-live { background: #10b981; }
        .status-warning { background: #f59e0b; }
        .status-error { background: #ef4444; }

        .refresh-info {
            text-align: center;
            color: white;
            opacity: 0.8;
            font-size: 0.9rem;
            margin-top: 20px;
        }

        .refresh-controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 15px;
            margin-top: 10px;
        }

        .refresh-button {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }

        .refresh-button:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }

        .refresh-button:active {
            transform: translateY(0);
        }

        .refresh-button.refreshing {
            background: rgba(255,255,255,0.4);
            pointer-events: none;
        }

        .refresh-interval {
            display: flex;
            align-items: center;
            gap: 8px;
            color: white;
            font-size: 0.8rem;
        }

        .refresh-interval select {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .refresh-interval select option {
            background: #333;
            color: white;
        }

        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .metric-value {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Agent-OS Real-Time Dashboard</h1>
            <p>Live monitoring of compliance, performance, and effectiveness metrics</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card compliance-card" id="complianceCard">
                <div class="compliance-ring" id="complianceRing" data-percentage="0%"></div>
                <div class="metric-title">Compliance Score</div>
                <div class="metric-value" id="complianceScore">--</div>
                <div class="metric-trend" id="complianceTrend">
                    <span class="status-indicator status-live"></span>
                    <span>Loading...</span>
                </div>
                <div class="metric-details" id="complianceDetails" style="margin-top: 10px; font-size: 0.8rem; opacity: 0.8;">
                    <div>Last Check: <span id="lastCheckTime">--</span></div>
                    <div>Next Prediction: <span id="nextPrediction">--</span></div>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-title">Total Violations</div>
                <div class="metric-value" id="totalViolations">--</div>
                <div class="metric-trend" id="violationsTrend">
                    <span class="status-indicator status-live"></span>
                    <span>Loading...</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-title">Critical Violations</div>
                <div class="metric-value" id="criticalViolations">--</div>
                <div class="metric-trend" id="criticalTrend">
                    <span class="status-indicator status-live"></span>
                    <span>Loading...</span>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-title">Performance (ms)</div>
                <div class="metric-value" id="performance">--</div>
                <div class="metric-trend" id="performanceTrend">
                    <span class="status-indicator status-live"></span>
                    <span>Loading...</span>
                </div>
                <div class="metric-details" style="margin-top: 10px; font-size: 0.8rem; opacity: 0.8;">
                    <div>Avg: <span id="avgPerformance">--</span>ms</div>
                    <div>Peak: <span id="peakPerformance">--</span>ms</div>
                </div>
            </div>
        </div>

        <div class="charts-grid">
            <div class="chart-card">
                <div class="chart-title">Compliance Trend</div>
                <canvas id="complianceChart" width="400" height="200"></canvas>
            </div>

            <div class="chart-card">
                <div class="chart-title">Violation Breakdown</div>
                <canvas id="violationsChart" width="400" height="200"></canvas>
            </div>
        </div>

        <div class="violation-summary" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333;">Violation Summary</h3>
                <div class="status-indicator status-live"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                <div style="text-align: center; padding: 10px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #ef4444;" id="criticalCount">0</div>
                    <div style="font-size: 0.8rem; color: #666;">Critical</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #f59e0b;" id="warningCount">0</div>
                    <div style="font-size: 0.8rem; color: #666;">Warnings</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #ecfdf5; border-radius: 8px; border-left: 4px solid #10b981;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;" id="passedCount">0</div>
                    <div style="font-size: 0.8rem; color: #666;">Passed</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;" id="codeStyleCount">0</div>
                    <div style="font-size: 0.8rem; color: #666;">Code Style</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #f5f3ff; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #8b5cf6;" id="securityCount">0</div>
                    <div style="font-size: 0.8rem; color: #666;">Security</div>
                </div>
                <div style="text-align: center; padding: 10px; background: #ecfeff; border-radius: 8px; border-left: 4px solid #06b6d4;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: #06b6d4;" id="architectureCount">0</div>
                    <div style="font-size: 0.8rem; color: #666;">Architecture</div>
                </div>
            </div>
        </div>

        <div class="performance-metrics" style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #333;">Performance Metrics</h3>
                <div class="status-indicator status-live"></div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="text-align: center; padding: 15px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: #0ea5e9;" id="executionTime">--</div>
                    <div style="font-size: 0.8rem; color: #666;">Execution Time (ms)</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: #22c55e;" id="fileProcessingTime">--</div>
                    <div style="font-size: 0.8rem; color: #666;">Avg File Processing (ms)</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: #f59e0b;" id="memoryUsage">--</div>
                    <div style="font-size: 0.8rem; color: #666;">Memory Usage (MB)</div>
                </div>
                <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <div style="font-size: 1.2rem; font-weight: 700; color: #ef4444;" id="cpuUsage">--</div>
                    <div style="font-size: 0.8rem; color: #666;">CPU Usage (%)</div>
                </div>
            </div>
        </div>

        <div class="effectiveness-grid">
            <div class="effectiveness-card">
                <div class="effectiveness-icon">⏱️</div>
                <div class="effectiveness-value" id="timeSaved">--</div>
                <div class="effectiveness-label">Time Saved (min)</div>
            </div>

            <div class="effectiveness-card">
                <div class="effectiveness-icon">📈</div>
                <div class="effectiveness-value" id="productivityGain">--</div>
                <div class="effectiveness-label">Productivity Gain (%)</div>
            </div>

            <div class="effectiveness-card">
                <div class="effectiveness-icon">✅</div>
                <div class="effectiveness-value" id="standardsAdoption">--</div>
                <div class="effectiveness-label">Standards Adoption (%)</div>
            </div>

            <div class="effectiveness-card">
                <div class="effectiveness-icon">🎯</div>
                <div class="effectiveness-value" id="qualityImprovement">--</div>
                <div class="effectiveness-label">Quality Improvement (%)</div>
            </div>
        </div>

        <div class="refresh-info">
            <span class="status-indicator status-live"></span>
            Auto-refreshing every <span id="refreshInterval">30</span> seconds • Last updated: <span id="lastUpdated">--</span>
            <br>
            <small style="opacity: 0.7;">Real-time compliance monitoring active • Next update in: <span id="countdown">30</span>s</small>
            
            <div class="refresh-controls">
                <button class="refresh-button" id="manualRefresh" onclick="manualRefresh()">
                    🔄 Refresh Now
                </button>
                <div class="refresh-interval">
                    <label>Interval:</label>
                    <select id="intervalSelect" onchange="changeRefreshInterval()">
                        <option value="10">10 seconds</option>
                        <option value="30" selected>30 seconds</option>
                        <option value="60">1 minute</option>
                        <option value="300">5 minutes</option>
                        <option value="0">Manual only</option>
                    </select>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Global variables
        let complianceChart, violationsChart;
        let lastMetrics = {};

        // Initialize charts
        function initializeCharts() {
            const complianceCtx = document.getElementById('complianceChart').getContext('2d');
            const violationsCtx = document.getElementById('violationsChart').getContext('2d');

            complianceChart = new Chart(complianceCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Compliance Score',
                        data: [],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });

            violationsChart = new Chart(violationsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Critical Violations', 'Warnings', 'Passed Checks', 'Code Style', 'Security', 'Architecture'],
                    datasets: [{
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: [
                            '#ef4444', // Critical - Red
                            '#f59e0b', // Warnings - Orange
                            '#10b981', // Passed - Green
                            '#3b82f6', // Code Style - Blue
                            '#8b5cf6', // Security - Purple
                            '#06b6d4'  // Architecture - Cyan
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true
                    }
                }
            });
        }

        // Update metrics display
        function updateMetrics(metrics) {
            // Update compliance score with enhanced real-time display
            const complianceScore = Math.round(metrics.complianceScore || 0);
            const complianceScoreElement = document.getElementById('complianceScore');
            const complianceCard = document.getElementById('complianceCard');
            const complianceRing = document.getElementById('complianceRing');
            const lastCheckTime = document.getElementById('lastCheckTime');
            const nextPrediction = document.getElementById('nextPrediction');
            
            // Update compliance score with animation
            const previousScore = parseInt(complianceScoreElement.textContent) || 0;
            complianceScoreElement.textContent = complianceScore + '%';
            
            // Update compliance ring
            const percentage = complianceScore;
            complianceRing.style.setProperty('--compliance-percentage', percentage + 'deg');
            complianceRing.setAttribute('data-percentage', percentage + '%');
            
            // Add animation based on score change
            if (complianceScore > previousScore) {
                complianceCard.classList.add('compliance-improving');
                setTimeout(() => complianceCard.classList.remove('compliance-improving'), 1000);
            } else if (complianceScore < previousScore) {
                complianceCard.classList.add('compliance-declining');
                setTimeout(() => complianceCard.classList.remove('compliance-declining'), 1000);
            }
            
            // Update compliance details
            const trends = metrics.trends || {};
            const prediction = trends.prediction || complianceScore;
            lastCheckTime.textContent = new Date(metrics.timestamp || Date.now()).toLocaleTimeString();
            nextPrediction.textContent = Math.round(prediction) + '%';
            
            // Update other metrics
            document.getElementById('totalViolations').textContent = 
                metrics.violations || 0;
            document.getElementById('criticalViolations').textContent = 
                metrics.criticalViolations || 0;
            document.getElementById('performance').textContent = 
                Math.round(metrics.performance?.executionTime || 0);
            
            // Update violation summary
            const violationCategories = metrics.violationCategories || {};
            document.getElementById('criticalCount').textContent = metrics.criticalViolations || 0;
            document.getElementById('warningCount').textContent = metrics.warnings || 0;
            document.getElementById('passedCount').textContent = metrics.passedChecks || 0;
            document.getElementById('codeStyleCount').textContent = violationCategories.codeStyle || 0;
            document.getElementById('securityCount').textContent = violationCategories.security || 0;
            document.getElementById('architectureCount').textContent = violationCategories.architecture || 0;
            
            // Update performance metrics
            const performance = metrics.performance || {};
            const executionTime = Math.round(performance.executionTime || 0);
            const avgFileProcessing = Math.round(performance.averageFileProcessingTime || 0);
            const memoryUsage = Math.round((performance.memoryUsage || 0) / 1024 / 1024); // Convert to MB
            const cpuUsage = Math.round(performance.cpuUsage || 0);
            
            document.getElementById('executionTime').textContent = executionTime;
            document.getElementById('fileProcessingTime').textContent = avgFileProcessing;
            document.getElementById('memoryUsage').textContent = memoryUsage;
            document.getElementById('cpuUsage').textContent = cpuUsage;
            
            // Update performance card details
            document.getElementById('avgPerformance').textContent = avgFileProcessing;
            document.getElementById('peakPerformance').textContent = executionTime;

            // Update effectiveness metrics
            const effectiveness = metrics.effectiveness || {};
            document.getElementById('timeSaved').textContent = 
                Math.round(effectiveness.timeSaved || 0);
            document.getElementById('productivityGain').textContent = 
                Math.round(effectiveness.productivityGain || 0);
            document.getElementById('standardsAdoption').textContent = 
                Math.round(effectiveness.standardsAdoption || 0);
            document.getElementById('qualityImprovement').textContent = 
                Math.round(effectiveness.qualityImprovement || 0);

            // Update last updated time
            document.getElementById('lastUpdated').textContent = 
                new Date(metrics.timestamp || Date.now()).toLocaleTimeString();

            // Update trends
            updateTrends(metrics);
        }

        // Update trend indicators
        function updateTrends(metrics) {
            const trends = metrics.trends || {};
            
            // Enhanced compliance trend with detailed information
            const complianceTrend = document.getElementById('complianceTrend');
            const trendDirection = trends.trend === 'improving' ? 'up' : trends.trend === 'declining' ? 'down' : 'stable';
            const trendStatus = trends.trend === 'improving' ? 'live' : trends.trend === 'declining' ? 'error' : 'warning';
            const slopeValue = Math.round(trends.slope * 100) / 100;
            const trendIcon = trends.trend === 'improving' ? '📈' : trends.trend === 'declining' ? '📉' : '➡️';
            
            complianceTrend.innerHTML = \`
                <span class="status-indicator status-\${trendStatus}"></span>
                <span class="trend-\${trendDirection}">
                    \${trendIcon} \${trends.trend || 'stable'} (\${slopeValue > 0 ? '+' : ''}\${slopeValue})
                </span>
            \`;
            
            // Add pulse animation for improving trends
            if (trends.trend === 'improving') {
                const complianceCard = document.getElementById('complianceCard');
                complianceCard.classList.add('compliance-animation');
                setTimeout(() => complianceCard.classList.remove('compliance-animation'), 2000);
            }

            // Violations trend
            const violationsTrend = document.getElementById('violationsTrend');
            const violationChange = (lastMetrics.violations || 0) - (metrics.violations || 0);
            violationsTrend.innerHTML = \`
                <span class="status-indicator status-\${violationChange > 0 ? 'live' : violationChange < 0 ? 'error' : 'warning'}"></span>
                <span class="trend-\${violationChange > 0 ? 'up' : violationChange < 0 ? 'down' : 'stable'}">
                    \${violationChange > 0 ? 'Decreasing' : violationChange < 0 ? 'Increasing' : 'Stable'}
                </span>
            \`;

            // Critical violations trend
            const criticalTrend = document.getElementById('criticalTrend');
            const criticalChange = (lastMetrics.criticalViolations || 0) - (metrics.criticalViolations || 0);
            criticalTrend.innerHTML = \`
                <span class="status-indicator status-\${criticalChange > 0 ? 'live' : criticalChange < 0 ? 'error' : 'warning'}"></span>
                <span class="trend-\${criticalChange > 0 ? 'up' : criticalChange < 0 ? 'down' : 'stable'}">
                    \${criticalChange > 0 ? 'Decreasing' : criticalChange < 0 ? 'Increasing' : 'Stable'}
                </span>
            \`;

            // Performance trend
            const performanceTrend = document.getElementById('performanceTrend');
            const performanceChange = (lastMetrics.performance?.executionTime || 0) - (metrics.performance?.executionTime || 0);
            performanceTrend.innerHTML = \`
                <span class="status-indicator status-\${performanceChange < 0 ? 'live' : performanceChange > 0 ? 'error' : 'warning'}"></span>
                <span class="trend-\${performanceChange < 0 ? 'up' : performanceChange > 0 ? 'down' : 'stable'}">
                    \${performanceChange < 0 ? 'Improving' : performanceChange > 0 ? 'Slower' : 'Stable'}
                </span>
            \`;

            lastMetrics = metrics;
        }

        // Update charts
        function updateCharts(metrics) {
            // Update compliance chart
            const history = metrics.history || [];
            const labels = history.slice(-10).map((_, index) => \`\${index + 1}\`);
            const data = history.slice(-10).map(entry => entry.complianceScore || 0);

            complianceChart.data.labels = labels;
            complianceChart.data.datasets[0].data = data;
            complianceChart.update();

            // Update violations chart with detailed breakdown
            const totalChecks = metrics.totalChecks || 0;
            const passedChecks = metrics.passedChecks || 0;
            const warnings = metrics.warnings || 0;
            const critical = metrics.criticalViolations || 0;
            
            // Get violation categories from metrics
            const violationCategories = metrics.violationCategories || {};
            const codeStyleViolations = violationCategories.codeStyle || 0;
            const securityViolations = violationCategories.security || 0;
            const architectureViolations = violationCategories.architecture || 0;
            
            // Update chart data with detailed breakdown
            violationsChart.data.datasets[0].data = [
                critical,           // Critical Violations
                warnings,           // Warnings
                passedChecks,       // Passed Checks
                codeStyleViolations, // Code Style
                securityViolations,  // Security
                architectureViolations // Architecture
            ];
            
            // Update chart title with summary
            const chartTitle = document.querySelector('.chart-card:nth-child(2) .chart-title');
            if (chartTitle) {
                const totalViolations = critical + warnings + codeStyleViolations + securityViolations + architectureViolations;
                chartTitle.textContent = `Violation Breakdown (${totalViolations} total)`;
            }
            
            violationsChart.update('active');
        }

        // Fetch and update metrics
        async function fetchMetrics() {
            try {
                const response = await fetch('/metrics');
                const metrics = await response.json();
                
                updateMetrics(metrics);
                updateCharts(metrics);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        }

        // Global variables for refresh control
        let refreshInterval = 30;
        let countdown = 30;
        let refreshTimer = null;
        let countdownTimer = null;

        // Initialize dashboard
        function init() {
            initializeCharts();
            fetchMetrics();
            startAutoRefresh();
        }

        // Start auto-refresh with current interval
        function startAutoRefresh() {
            if (refreshTimer) {
                clearInterval(refreshTimer);
            }
            if (countdownTimer) {
                clearInterval(countdownTimer);
            }
            
            if (refreshInterval > 0) {
                countdown = refreshInterval;
                updateCountdown();
                
                countdownTimer = setInterval(() => {
                    countdown--;
                    updateCountdown();
                    
                    if (countdown <= 0) {
                        countdown = refreshInterval;
                        fetchMetrics();
                    }
                }, 1000);
            }
        }

        // Update countdown display
        function updateCountdown() {
            const countdownElement = document.getElementById('countdown');
            const refreshIntervalElement = document.getElementById('refreshInterval');
            
            if (countdownElement) {
                countdownElement.textContent = refreshInterval > 0 ? countdown : '--';
            }
            if (refreshIntervalElement) {
                refreshIntervalElement.textContent = refreshInterval;
            }
        }

        // Manual refresh function
        function manualRefresh() {
            const button = document.getElementById('manualRefresh');
            button.classList.add('refreshing');
            button.textContent = '🔄 Refreshing...';
            
            fetchMetrics().finally(() => {
                setTimeout(() => {
                    button.classList.remove('refreshing');
                    button.textContent = '🔄 Refresh Now';
                }, 1000);
            });
        }

        // Change refresh interval
        function changeRefreshInterval() {
            const select = document.getElementById('intervalSelect');
            refreshInterval = parseInt(select.value);
            startAutoRefresh();
        }

        // Start when page loads
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>`;
  }

  /**
   * Update live metrics for all connected clients
   */
  updateLiveMetrics(metrics) {
    const eventData = `data: ${JSON.stringify(metrics)}\n\n`;
    
    this.clients.forEach(client => {
      try {
        client.write(eventData);
      } catch (error) {
        // Remove disconnected clients
        this.clients.delete(client);
      }
    });
  }

  /**
   * Stop the dashboard server
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Enhanced dashboard stopped');
    }
  }
}

// Export for use in other modules
module.exports = EnhancedDashboard;

// CLI execution
if (require.main === module) {
  const dashboard = new EnhancedDashboard();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping enhanced dashboard...');
    dashboard.stop();
    process.exit(0);
  });
  
  dashboard.start();
} 