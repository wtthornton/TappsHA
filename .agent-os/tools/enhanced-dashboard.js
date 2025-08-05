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
    this.isAutoRefreshEnabled = false;
    this.refreshInterval = 30000; // Default to 30 seconds
    this.lastRefreshTime = Date.now();
    this.refreshTimer = null;
    this.startTime = Date.now();
    this.totalRequests = 0;
  }

  /**
   * Start the enhanced dashboard server with auto-refresh capabilities
   */
  start() {
    console.log('🚀 Starting Enhanced Agent-OS Dashboard...');
    console.log(`📊 Dashboard available at: http://localhost:${this.port}`);
    console.log(`📈 Real-time metrics: http://localhost:${this.port}/metrics`);
    console.log(`🔄 Auto-refresh: Enabled with configurable intervals`);
    
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Enhanced dashboard running on port ${this.port}`);
      this.generateDashboardHTML();
      this.startAutoRefresh();
    });
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
    const parsedUrl = url.parse(req.url, true);
    const { action, interval } = parsedUrl.query;
    
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
          if (newInterval >= 5000) { // Minimum 5 seconds
            this.refreshInterval = newInterval;
            this.restartAutoRefresh();
          }
        }
        break;
      case 'refresh':
        this.refreshDashboard();
        break;
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
    this.clients.forEach(client => {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        // Remove disconnected clients
        this.clients.delete(client);
      }
    });
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
   * Get current metrics with enhanced performance monitoring
   */
  getCurrentMetrics() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
        return this.enhanceMetrics(metrics);
      }
    } catch (error) {
      console.warn('⚠️  Could not load metrics:', error.message);
    }
    
    return this.getDefaultMetrics();
  }

  /**
   * Enhance metrics with performance monitoring features
   */
  enhanceMetrics(metrics) {
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
      score = Math.min(100, score + trend.magnitude);
    } else if (trend.direction === 'declining') {
      score = Math.max(0, score - trend.magnitude);
    }

    return Math.round(score);
  }

  /**
   * Calculate compliance trend with detailed analysis
   */
  calculateComplianceTrend(metrics) {
    const history = this.getHistoricalData();
    if (history.length < 2) {
      return { direction: 'stable', magnitude: 0, confidence: 0.5 };
    }

    const recentScores = history.slice(-5).map(h => h.complianceScore);
    const currentScore = metrics.complianceScore || 0;
    const previousScore = recentScores[recentScores.length - 2] || currentScore;
    
    const change = currentScore - previousScore;
    const averageChange = recentScores.reduce((sum, score, i) => {
      if (i === 0) return 0;
      return sum + (score - recentScores[i - 1]);
    }, 0) / (recentScores.length - 1);

    let direction = 'stable';
    let magnitude = Math.abs(change);
    let confidence = 0.5;

    if (change > 2) {
      direction = 'improving';
      confidence = Math.min(1, 0.5 + (change / 10));
    } else if (change < -2) {
      direction = 'declining';
      confidence = Math.min(1, 0.5 + (Math.abs(change) / 10));
    }

    // Consider volatility
    const volatility = this.calculateComplianceVolatility(metrics);
    if (volatility > 0.3) {
      confidence *= 0.8; // Reduce confidence for volatile data
    }

    return {
      direction,
      magnitude: Math.round(magnitude * 10) / 10,
      confidence: Math.round(confidence * 100) / 100,
      change,
      averageChange: Math.round(averageChange * 10) / 10,
      volatility
    };
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
    const predictedChange = trend.averageChange * 2; // Predict 2 periods ahead
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
    
    if (trend.direction === 'improving' && trend.magnitude > 5) {
      return 'pulsing';
    } else if (trend.direction === 'declining' && trend.magnitude > 5) {
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
      intensity += trend.magnitude * 0.1;
    } else if (trend.direction === 'declining') {
      intensity += trend.magnitude * 0.05;
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
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            color: #666;
            margin-bottom: 20px;
        }
        
        .status-bar {
            display: flex;
            gap: 20px;
            align-items: center;
            flex-wrap: wrap;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 25px;
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .status-indicator.online {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
        }
        
        .status-indicator.offline {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            color: white;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        .status-dot.online {
            background: #fff;
        }
        
        .status-dot.offline {
            background: #fff;
            animation: none;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
        }
        
        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .metric-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #333;
        }
        
        .metric-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
        
        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .metric-change {
            font-size: 0.9rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .metric-change.positive {
            color: #4CAF50;
        }
        
        .metric-change.negative {
            color: #f44336;
        }
        
        .metric-change.neutral {
            color: #666;
        }
        
        .compliance-ring {
            position: relative;
            width: 120px;
            height: 120px;
            margin: 0 auto 20px;
        }
        
        .compliance-ring svg {
            transform: rotate(-90deg);
        }
        
        .compliance-ring circle {
            fill: none;
            stroke-width: 8;
            stroke-linecap: round;
        }
        
        .compliance-ring .background {
            stroke: #e0e0e0;
        }
        
        .compliance-ring .progress {
            stroke: url(#gradient);
            stroke-dasharray: 283;
            stroke-dashoffset: 283;
            transition: stroke-dashoffset 1s ease;
        }
        
        .compliance-ring .center-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }
        
        .compliance-ring .score {
            font-size: 1.8rem;
            font-weight: 700;
            color: #333;
        }
        
        .compliance-ring .label {
            font-size: 0.8rem;
            color: #666;
        }
        
        .charts-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .chart-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .chart-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .chart-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #333;
        }
        
        .chart-controls {
            display: flex;
            gap: 10px;
        }
        
        .chart-control {
            padding: 5px 12px;
            border: none;
            border-radius: 15px;
            background: #f0f0f0;
            color: #666;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.8rem;
        }
        
        .chart-control.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .chart-control:hover {
            background: #e0e0e0;
        }
        
        .chart-control.active:hover {
            background: linear-gradient(135deg, #5a6fd8, #6a4190);
        }
        
        .chart-container {
            position: relative;
            height: 300px;
        }
        
        .effectiveness-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 30px;
        }
        
        .effectiveness-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .effectiveness-item {
            text-align: center;
            padding: 20px;
            border-radius: 15px;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        }
        
        .effectiveness-value {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 5px;
        }
        
        .effectiveness-label {
            font-size: 0.9rem;
            color: #666;
        }
        
        .refresh-controls {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .refresh-button {
            padding: 10px 20px;
            border: none;
            border-radius: 25px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
        }
        
        .refresh-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        
        .refresh-interval {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .refresh-interval select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 15px;
            background: white;
        }
        
        .last-updated {
            font-size: 0.9rem;
            color: #666;
        }
        
        @media (max-width: 768px) {
            .dashboard-container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .charts-section {
                grid-template-columns: 1fr;
            }
            
            .status-bar {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>🚀 Agent-OS Real-Time Dashboard</h1>
            <p>Live monitoring and analytics for your development standards compliance</p>
            <div class="status-bar">
                <div class="status-indicator online">
                    <div class="status-dot online"></div>
                    <span>Live Monitoring Active</span>
                </div>
                <div class="status-indicator online">
                    <div class="status-dot online"></div>
                    <span>API Connected</span>
                </div>
                <div class="status-indicator online">
                    <div class="status-dot online"></div>
                    <span>Real-time Updates</span>
                </div>
            </div>
        </div>
        
        <div class="refresh-controls">
            <button class="refresh-button" onclick="refreshDashboard()">
                🔄 Refresh Dashboard
            </button>
            <div class="refresh-interval">
                <span>Auto-refresh:</span>
                <select id="refreshInterval" onchange="updateRefreshInterval()">
                    <option value="30000">30 seconds</option>
                    <option value="60000" selected>1 minute</option>
                    <option value="300000">5 minutes</option>
                    <option value="900000">15 minutes</option>
                    <option value="0">Manual only</option>
                </select>
            </div>
            <div class="last-updated">
                Last updated: <span id="lastUpdated">${new Date().toLocaleTimeString()}</span>
            </div>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Compliance Score</div>
                    <div class="metric-icon" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white;">
                        📊
                    </div>
                </div>
                <div class="compliance-ring">
                    <svg width="120" height="120">
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#45a049;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                        <circle class="background" cx="60" cy="60" r="45"></circle>
                        <circle class="progress" cx="60" cy="60" r="45" 
                                style="stroke-dashoffset: ${283 - (283 * metrics.complianceScore / 100)}"></circle>
                    </svg>
                    <div class="center-text">
                        <div class="score">${metrics.complianceScore}%</div>
                        <div class="label">Compliance</div>
                    </div>
                </div>
                <div class="metric-change ${metrics.complianceTrend.change > 0 ? 'positive' : metrics.complianceTrend.change < 0 ? 'negative' : 'neutral'}">
                    ${metrics.complianceTrend.change > 0 ? '↗' : metrics.complianceTrend.change < 0 ? '↘' : '→'} 
                    ${Math.abs(metrics.complianceTrend.change).toFixed(1)}% from last check
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Violations</div>
                    <div class="metric-icon" style="background: linear-gradient(135deg, #f44336, #d32f2f); color: white;">
                        ⚠️
                    </div>
                </div>
                <div class="metric-value">${metrics.totalViolations}</div>
                <div class="metric-change ${trends.violations < 0 ? 'positive' : trends.violations > 0 ? 'negative' : 'neutral'}">
                    ${trends.violations < 0 ? '↘' : trends.violations > 0 ? '↗' : '→'} 
                    ${Math.abs(trends.violations)} from last check
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Files Processed</div>
                    <div class="metric-icon" style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white;">
                        📁
                    </div>
                </div>
                <div class="metric-value">${metrics.filesProcessed}</div>
                <div class="metric-change neutral">
                    → ${metrics.fileTypes.join(', ')}
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Performance</div>
                    <div class="metric-icon" style="background: linear-gradient(135deg, #FF9800, #F57C00); color: white;">
                        ⚡
                    </div>
                </div>
                <div class="metric-value">${metrics.averageProcessingTime}ms</div>
                <div class="metric-change ${trends.processingTime < 0 ? 'positive' : trends.processingTime > 0 ? 'negative' : 'neutral'}">
                    ${trends.processingTime < 0 ? '↘' : trends.processingTime > 0 ? '↗' : '→'} 
                    ${Math.abs(trends.processingTime)}ms from last check
                </div>
            </div>
        </div>
        
        <div class="charts-section">
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">Violation Trends</div>
                    <div class="chart-controls">
                        <button class="chart-control active" onclick="updateChart('violations', '7d')">7D</button>
                        <button class="chart-control" onclick="updateChart('violations', '30d')">30D</button>
                        <button class="chart-control" onclick="updateChart('violations', '90d')">90D</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="violationsChart"></canvas>
                </div>
            </div>
            
            <div class="chart-card">
                <div class="chart-header">
                    <div class="chart-title">Compliance History</div>
                    <div class="chart-controls">
                        <button class="chart-control active" onclick="updateChart('compliance', '7d')">7D</button>
                        <button class="chart-control" onclick="updateChart('compliance', '30d')">30D</button>
                        <button class="chart-control" onclick="updateChart('compliance', '90d')">90D</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="complianceChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="effectiveness-section">
            <h2 style="margin-bottom: 20px; color: #333;">Effectiveness Metrics</h2>
            <div class="effectiveness-grid">
                <div class="effectiveness-item">
                    <div class="effectiveness-value" style="color: #4CAF50;">${effectiveness.timeSaved}</div>
                    <div class="effectiveness-label">Hours Saved</div>
                </div>
                <div class="effectiveness-item">
                    <div class="effectiveness-value" style="color: #2196F3;">${effectiveness.productivityGain}%</div>
                    <div class="effectiveness-label">Productivity Gain</div>
                </div>
                <div class="effectiveness-item">
                    <div class="effectiveness-value" style="color: #FF9800;">${effectiveness.qualityImprovement}%</div>
                    <div class="effectiveness-label">Quality Improvement</div>
                </div>
                <div class="effectiveness-item">
                    <div class="effectiveness-value" style="color: #9C27B0;">${effectiveness.standardsAdoption}%</div>
                    <div class="effectiveness-label">Standards Adoption</div>
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
            const violationsCtx = document.getElementById('violationsChart').getContext('2d');
            const complianceCtx = document.getElementById('complianceChart').getContext('2d');
            
            violationsChart = new Chart(violationsCtx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(history.slice(-7).map(h => new Date(h.timestamp).toLocaleDateString()))},
                    datasets: [{
                        label: 'Violations',
                        data: ${JSON.stringify(history.slice(-7).map(h => h.violations))},
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
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
            
            complianceChart = new Chart(complianceCtx, {
                type: 'line',
                data: {
                    labels: ${JSON.stringify(history.slice(-7).map(h => new Date(h.timestamp).toLocaleDateString()))},
                    datasets: [{
                        label: 'Compliance Score',
                        data: ${JSON.stringify(history.slice(-7).map(h => h.complianceScore))},
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
            const complianceRing = document.querySelector('.compliance-ring .progress');
            const complianceScore = document.querySelector('.compliance-ring .score');
            const newOffset = 283 - (283 * metrics.complianceScore / 100);
            
            complianceRing.style.strokeDashoffset = newOffset;
            complianceScore.textContent = metrics.complianceScore + '%';
            
            // Update other metrics
            const metricValues = document.querySelectorAll('.metric-value');
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