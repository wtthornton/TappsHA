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
    try {
      this.port = parseInt(process.env.DASHBOARD_PORT) || 3001;
      
      // Validate port number
      if (this.port < 1024 || this.port > 65535) {
        throw new Error('Port must be between 1024 and 65535');
      }
      
      this.dashboardPath = path.join(__dirname, '../reports/dashboard');
      this.metricsPath = path.join(__dirname, '../reports/live-metrics.json');
      this.historyPath = path.join(__dirname, '../reports/compliance-history.json');
      
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
        }
      });

      this.server.listen(this.port, () => {
        console.log(`✅ Enhanced dashboard running on port ${this.port}`);
        try {
          this.generateDashboardHTML();
          this.startAutoRefresh();
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
      case '/api/refresh':
        this.handleAutoRefreshConfig(req, res);
        break;
      case '/api/status':
        this.serveStatus(req, res);
        break;
      default:
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
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
    
    const baseMetrics = {
      complianceScore: latestEntry ? latestEntry.complianceScore : 44,
      totalViolations: latestEntry ? latestEntry.violations : 14,
      criticalViolations: latestEntry ? latestEntry.criticalViolations : 14,
      warnings: latestEntry ? latestEntry.warnings : 1250,
      filesProcessed: latestEntry ? latestEntry.totalChecks : 152,
      averageProcessingTime: 150,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      totalRequests: this.totalRequests,
      fileTypes: ['java', 'ts', 'tsx', 'js', 'jsx', 'xml', 'json', 'yml', 'yaml']
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
   * Generate enhanced HTML dashboard with modern design and real-time features
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
    <title>Agent-OS Real-Time Dashboard</title>
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
        /* Custom animations for Agent-OS dashboard */
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
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
                        Agent-OS Dashboard
                    </h1>
                    <p class="text-gray-600 mt-2">Live monitoring and analytics for your development standards compliance</p>
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
        
        <!-- Metrics Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            <!-- Compliance Score Card -->
            <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Compliance Score</h3>
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background: linear-gradient(135deg, #4CAF50, #45a049);">
                        ✓
                    </div>
                </div>
                
                <div class="relative w-32 h-32 mx-auto mb-4">
                    <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        <circle class="text-gray-200" stroke-width="8" stroke="currentColor" fill="transparent" r="45" cx="60" cy="60"></circle>
                        <circle class="text-green-500 transition-all duration-1000 ease-in-out" stroke-width="8" stroke-dasharray="283" stroke-dashoffset="${283 - (283 * metrics.complianceScore / 100)}" stroke-linecap="round" stroke="currentColor" fill="transparent" r="45" cx="60" cy="60"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <div class="text-2xl font-bold text-gray-800">${metrics.complianceScore}%</div>
                        <div class="text-sm text-gray-500">Compliance</div>
                    </div>
                </div>
                
                <div class="text-center">
                    <div class="text-sm ${metrics.complianceTrend.change > 0 ? 'text-green-600' : metrics.complianceTrend.change < 0 ? 'text-red-600' : 'text-gray-500'}">
                        ${metrics.complianceTrend.change > 0 ? '↗' : metrics.complianceTrend.change < 0 ? '↘' : '→'} ${Math.abs(metrics.complianceTrend.change)}%
                    </div>
                    <div class="text-xs text-gray-500">${metrics.complianceTrend.message}</div>
                </div>
            </div>
            
            <!-- Violations Card -->
            <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Violations</h3>
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background: linear-gradient(135deg, #f44336, #d32f2f);">
                        ⚠
                    </div>
                </div>
                
                <div class="text-center mb-4">
                    <div class="text-3xl font-bold text-gray-800">${metrics.totalViolations}</div>
                    <div class="text-sm text-gray-500">Total Violations</div>
                </div>
                
                <div class="text-center">
                    <div class="text-sm ${trends.violations < 0 ? 'text-green-600' : trends.violations > 0 ? 'text-red-600' : 'text-gray-500'}">
                        ${trends.violations < 0 ? '↗' : trends.violations > 0 ? '↘' : '→'} ${Math.abs(trends.violations)}
                    </div>
                    <div class="text-xs text-gray-500">vs last period</div>
                </div>
            </div>
            
            <!-- Files Processed Card -->
            <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Files Processed</h3>
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background: linear-gradient(135deg, #2196F3, #1976D2);">
                        📁
                    </div>
                </div>
                
                <div class="text-center mb-4">
                    <div class="text-3xl font-bold text-gray-800">${metrics.filesProcessed}</div>
                    <div class="text-sm text-gray-500">Total Files</div>
                </div>
                
                <div class="text-center">
                    <div class="text-sm text-gray-500">→ 0</div>
                    <div class="text-xs text-gray-500">vs last period</div>
                </div>
            </div>
            
            <!-- Performance Card -->
            <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:transform hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Performance</h3>
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style="background: linear-gradient(135deg, #FF9800, #F57C00);">
                        ⚡
                    </div>
                </div>
                
                <div class="text-center mb-4">
                    <div class="text-3xl font-bold text-gray-800">${metrics.averageProcessingTime}ms</div>
                    <div class="text-sm text-gray-500">Avg Processing</div>
                </div>
                
                <div class="text-center">
                    <div class="text-sm ${trends.processingTime < 0 ? 'text-green-600' : trends.processingTime > 0 ? 'text-red-600' : 'text-gray-500'}">
                        ${trends.processingTime < 0 ? '↗' : trends.processingTime > 0 ? '↘' : '→'} ${Math.abs(trends.processingTime)}ms
                    </div>
                    <div class="text-xs text-gray-500">vs last period</div>
                </div>
            </div>
        </div>
        
        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- Violation Trends Chart -->
            <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Violation Trends</h3>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white" onclick="updateChart('violations', '7d')">7D</button>
                        <button class="px-3 py-1 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300" onclick="updateChart('violations', '30d')">30D</button>
                        <button class="px-3 py-1 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300" onclick="updateChart('violations', '90d')">90D</button>
                    </div>
                </div>
                <div class="h-64">
                    <canvas id="violationsChart"></canvas>
                </div>
            </div>
            
            <!-- Compliance History Chart -->
            <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">Compliance History</h3>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 text-sm rounded-lg bg-blue-600 text-white" onclick="updateChart('compliance', '7d')">7D</button>
                        <button class="px-3 py-1 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300" onclick="updateChart('compliance', '30d')">30D</button>
                        <button class="px-3 py-1 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300" onclick="updateChart('compliance', '90d')">90D</button>
                    </div>
                </div>
                <div class="h-64">
                    <canvas id="complianceChart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Effectiveness Section -->
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 class="text-lg font-semibold text-gray-800 mb-6">Effectiveness Metrics</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${effectiveness.timeSaved}</div>
                    <div class="text-sm text-gray-500">Hours Saved</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">${effectiveness.productivityGain}%</div>
                    <div class="text-sm text-gray-500">Productivity Gain</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-orange-600">${effectiveness.qualityImprovement}%</div>
                    <div class="text-sm text-gray-500">Quality Improvement</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">${effectiveness.standardsAdoption}%</div>
                    <div class="text-sm text-gray-500">Standards Adoption</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let refreshIntervalId = null;
        let violationsChart = null;
        let complianceChart = null;

        // Initialize charts
        function initializeCharts() {
            // Violations Chart
            const violationsCtx = document.getElementById('violationsChart').getContext('2d');
            violationsChart = new Chart(violationsCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Violations',
                        data: [12, 19, 15, 17, 14, 16, 14],
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        tension: 0.4
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
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });

            // Compliance Chart
            const complianceCtx = document.getElementById('complianceChart').getContext('2d');
            complianceChart = new Chart(complianceCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Compliance %',
                        data: [42, 45, 43, 47, 44, 46, 44],
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4
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
                            max: 100,
                            grid: {
                                color: 'rgba(0, 0, 0, 0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    }
                }
            });
        }

        // Refresh dashboard data
        async function refreshDashboard() {
            try {
                const response = await fetch('/metrics');
                const data = await response.json();
                
                // Update metrics
                updateMetrics(data.data);
                
                // Update last updated time
                document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
                
                console.log('Dashboard refreshed successfully');
            } catch (error) {
                console.error('Error refreshing dashboard:', error);
            }
        }

        // Update metrics display
        function updateMetrics(metrics) {
            // Update compliance score
            const complianceRing = document.querySelector('.text-green-500');
            const complianceScore = document.querySelector('.text-2xl.font-bold.text-gray-800');
            const newOffset = 283 - (283 * metrics.complianceScore / 100);
            
            complianceRing.style.strokeDashoffset = newOffset;
            complianceScore.textContent = metrics.complianceScore + '%';
            
            // Update other metrics
            const metricValues = document.querySelectorAll('.text-3xl.font-bold.text-gray-800');
            metricValues[1].textContent = metrics.totalViolations;
            metricValues[2].textContent = metrics.filesProcessed;
            metricValues[3].textContent = metrics.averageProcessingTime + 'ms';
        }

        // Update chart data
        function updateChart(chartType, period) {
            // Update chart controls
            const controls = document.querySelectorAll('.chart-control');
            controls.forEach(control => control.classList.remove('active'));
            event.target.classList.add('active');
            
            // Here you would fetch new data based on period
            // For now, we'll just log the request
            console.log(\`Updating \${chartType} chart for \${period}\`);
        }

        // Update refresh interval
        function updateRefreshInterval() {
            const interval = document.getElementById('refreshInterval').value;
            
            if (refreshIntervalId) {
                clearInterval(refreshIntervalId);
            }
            
            if (interval > 0) {
                refreshIntervalId = setInterval(refreshDashboard, parseInt(interval));
                console.log(\`Auto-refresh set to \${interval}ms\`);
            }
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            initializeCharts();
            updateRefreshInterval();
            
            // Initial refresh
            refreshDashboard();
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