#!/usr/bin/env node

/**
 * Simple Metrics API for Agent-OS
 * Provides RESTful endpoints for current metrics, historical data, and trends
 */

import fs from 'fs';
import path from 'path';
import http from 'http';
import url from 'url';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SimpleMetricsAPI {
  constructor() {
    this.port = process.env.METRICS_API_PORT || 3002;
    this.metricsPath = path.join(__dirname, '../reports/live-metrics.json');
    this.historyPath = path.join(__dirname, '../reports/compliance-history.json');
    this.effectivenessPath = path.join(__dirname, '../reports/effectiveness-metrics.json');
    
    this.server = null;
    
    // Performance optimizations: Add caching
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.lastCacheCleanup = Date.now();
    
    // Performance monitoring
    this.performanceMetrics = {
      requestCount: 0,
      averageResponseTime: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  /**
   * Start the metrics API server with comprehensive endpoints
   */
  start() {
    console.log('🚀 Starting Simple Metrics API...');
    console.log(`📊 API available at: http://localhost:${this.port}`);
    console.log(`📈 Comprehensive Endpoints:`);
    console.log(`   GET /metrics - Current compliance metrics`);
    console.log(`   GET /metrics/history - Historical data with filtering`);
    console.log(`   GET /metrics/trends - Advanced trend analysis`);
    console.log(`   GET /metrics/effectiveness - Effectiveness metrics`);
    console.log(`   GET /metrics/performance - Performance metrics`);
    console.log(`   GET /metrics/violations - Violation breakdown`);
    console.log(`   GET /metrics/health - API health check`);
    console.log(`   GET /metrics/summary - Comprehensive summary`);
    console.log(`   POST /metrics/refresh - Trigger metrics refresh`);
    console.log(`   GET /metrics/config - API configuration`);
    
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    this.server.listen(this.port, () => {
      console.log(`✅ Simple metrics API running on port ${this.port}`);
      console.log(`🔄 Auto-refresh: Enabled with 30s interval`);
      this.startAutoRefresh();
    });
  }

  /**
   * Get cached data with performance monitoring
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      this.performanceMetrics.cacheHits++;
      return cached.data;
    }
    this.performanceMetrics.cacheMisses++;
    return null;
  }

  /**
   * Set cached data with timestamp
   */
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // Cleanup old cache entries periodically
    if (Date.now() - this.lastCacheCleanup > 60000) { // Every minute
      this.cleanupCache();
    }
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
    this.lastCacheCleanup = now;
  }

  /**
   * Start auto-refresh functionality with cache management
   */
  startAutoRefresh() {
    this.refreshInterval = 30000; // 30 seconds
    this.isAutoRefreshEnabled = true;
    this.lastRefreshTime = Date.now();
    
    this.refreshTimer = setInterval(() => {
      if (this.isAutoRefreshEnabled) {
        this.refreshMetrics();
        this.cleanupCache(); // Cleanup cache during refresh
      }
    }, this.refreshInterval);
    
    console.log(`🔄 Auto-refresh started with ${this.refreshInterval / 1000}s interval`);
  }

  /**
   * Refresh metrics data with performance optimizations
   */
  refreshMetrics() {
    try {
      const startTime = Date.now();
      
      // Parallel data collection for better performance
      const [metrics, history] = Promise.all([
        this.getCurrentMetrics(),
        this.getHistoricalData()
      ]);
      
      // Enhanced: Add current metrics to history with validation
      const newEntry = {
        timestamp: new Date().toISOString(),
        ...metrics
      };
      
      // Validate entry before adding
      if (this.validateMetricsEntry(newEntry)) {
        history.push(newEntry);
        
        // Optimized: Keep only last 100 entries with efficient array management
        if (history.length > 100) {
          history.splice(0, history.length - 100);
        }
        
        // Parallel file operations for better performance
        Promise.all([
          this.saveHistoricalData(history),
          this.saveCurrentMetrics(metrics)
        ]).then(() => {
          this.lastRefreshTime = Date.now();
          const refreshTime = Date.now() - startTime;
          console.log(`🔄 Metrics refreshed in ${refreshTime}ms at ${new Date().toLocaleTimeString()}`);
        }).catch(error => {
          console.error('❌ Error during metrics refresh:', error.message);
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing metrics:', error.message);
    }
  }

  /**
   * Validate metrics entry before adding to history
   */
  validateMetricsEntry(entry) {
    return entry && 
           typeof entry.timestamp === 'string' &&
           entry.timestamp.length > 0 &&
           typeof entry.totalFiles === 'number' &&
           typeof entry.totalViolations === 'number';
  }

  /**
   * Save current metrics with performance optimization
   */
  saveCurrentMetrics(metrics) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(this.metricsPath, JSON.stringify(metrics, null, 2));
        resolve();
      } catch (error) {
        console.error('❌ Error saving current metrics:', error.message);
        reject(error);
      }
    });
  }

  /**
   * Save historical data with performance optimization
   */
  saveHistoricalData(history) {
    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
        resolve();
      } catch (error) {
        console.error('❌ Error saving historical data:', error.message);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming HTTP requests with comprehensive endpoints
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

    // Route requests
    switch (pathname) {
      case '/metrics':
        this.serveCurrentMetrics(req, res);
        break;
      case '/metrics/history':
        this.serveHistoricalData(req, res);
        break;
      case '/metrics/trends':
        this.serveTrendAnalysis(req, res);
        break;
      case '/metrics/effectiveness':
        this.serveEffectivenessMetrics(req, res);
        break;
      case '/metrics/performance':
        this.servePerformanceMetrics(req, res);
        break;
      case '/metrics/violations':
        this.serveViolationMetrics(req, res);
        break;
      case '/metrics/health':
        this.serveHealthCheck(req, res);
        break;
      case '/metrics/summary':
        this.serveComprehensiveSummary(req, res);
        break;
      case '/metrics/refresh':
        this.handleRefreshRequest(req, res);
        break;
      case '/metrics/config':
        this.serveConfiguration(req, res);
        break;
      default:
        this.serveNotFound(req, res);
    }
  }

  /**
   * Serve current metrics with enhanced data and caching
   */
  serveCurrentMetrics(req, res) {
    const startTime = Date.now();
    
    try {
      // Check cache first for better performance
      const cacheKey = 'current_metrics';
      let metrics = this.getCachedData(cacheKey);
      
      if (!metrics) {
        metrics = this.getCurrentMetrics();
        this.setCachedData(cacheKey, metrics);
      }
      
      const response = {
        timestamp: new Date().toISOString(),
        status: 'success',
        data: {
          ...metrics,
          api: {
            version: '1.0.0',
            lastRefresh: this.lastRefreshTime,
            nextRefresh: this.lastRefreshTime + this.refreshInterval,
            autoRefresh: this.isAutoRefreshEnabled,
            cache: {
              hit: !!this.getCachedData(cacheKey),
              performance: this.performanceMetrics
            }
          }
        }
      };
      
      // Update performance metrics
      this.performanceMetrics.requestCount++;
      const responseTime = Date.now() - startTime;
      this.performanceMetrics.averageResponseTime = 
        (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.requestCount - 1) + responseTime) / 
        this.performanceMetrics.requestCount;
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  /**
   * Serve historical data with filtering and pagination
   */
  serveHistoricalData(req, res) {
    try {
      const { days, limit, offset, startDate, endDate } = req.query;
      const history = this.getHistoricalData();
      
      let filteredHistory = [...history];
      
      // Apply date filtering
      if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
        filteredHistory = filteredHistory.filter(entry => 
          new Date(entry.timestamp) >= cutoffDate
        );
      }
      
      if (startDate) {
        const start = new Date(startDate);
        filteredHistory = filteredHistory.filter(entry => 
          new Date(entry.timestamp) >= start
        );
      }
      
      if (endDate) {
        const end = new Date(endDate);
        filteredHistory = filteredHistory.filter(entry => 
          new Date(entry.timestamp) <= end
        );
      }
      
      // Apply pagination
      const limitNum = limit ? parseInt(limit) : filteredHistory.length;
      const offsetNum = offset ? parseInt(offset) : 0;
      const paginatedHistory = filteredHistory.slice(offsetNum, offsetNum + limitNum);
      
      const summary = this.calculateHistoricalSummary(filteredHistory);
      
      const response = {
        timestamp: new Date().toISOString(),
        status: 'success',
        data: {
          history: paginatedHistory,
          summary: summary,
          pagination: {
            total: filteredHistory.length,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < filteredHistory.length
          },
          filters: {
            days: days || null,
            startDate: startDate || null,
            endDate: endDate || null
          }
        }
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  /**
   * Serve comprehensive trend analysis with predictions
   */
  serveTrendAnalysis(req, res) {
    try {
      const parsedUrl = url.parse(req.url, true);
      const query = parsedUrl.query;
      
      // Get time period for analysis (default: last 30 days)
      const days = parseInt(query.days) || 30;
      const trends = this.calculateAdvancedTrends(days);
      
      const response = {
        timestamp: new Date().toISOString(),
        status: 'success',
        data: {
          ...trends,
          analysisPeriod: `${days} days`,
          predictions: {
            nextWeek: trends.predictions.nextWeek,
            nextMonth: trends.predictions.nextMonth,
            confidence: trends.predictions.confidence
          },
          recommendations: this.generateTrendRecommendations(trends)
        }
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  /**
   * Serve comprehensive effectiveness metrics with ROI calculations
   */
  serveEffectivenessMetrics(req, res) {
    try {
      const parsedUrl = url.parse(req.url, true);
      const query = parsedUrl.query;
      
      // Get time period for analysis (default: last 30 days)
      const days = parseInt(query.days) || 30;
      const effectiveness = this.calculateAdvancedEffectiveness(days);
      
      const response = {
        timestamp: new Date().toISOString(),
        status: 'success',
        data: {
          ...effectiveness,
          analysisPeriod: `${days} days`,
          roi: this.calculateROI(effectiveness),
          recommendations: this.generateEffectivenessRecommendations(effectiveness)
        }
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  /**
   * Serve performance metrics
   */
  servePerformanceMetrics(req, res) {
    try {
      const metrics = this.getCurrentMetrics();
      const history = this.getHistoricalData();
      
      const performance = {
        current: metrics.performance || {},
        historical: this.calculatePerformanceHistory(history),
        trends: this.calculatePerformanceTrends(history),
        bottlenecks: this.identifyPerformanceBottlenecks(metrics),
        recommendations: this.generatePerformanceRecommendations(metrics, history)
      };
      
      const response = {
        timestamp: new Date().toISOString(),
        status: 'success',
        data: performance
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  /**
   * Serve violation metrics
   */
  serveViolationMetrics(req, res) {
    try {
      const metrics = this.getCurrentMetrics();
      const history = this.getHistoricalData();
      
      const violations = {
        current: {
          total: metrics.violations || 0,
          critical: metrics.criticalViolations || 0,
          warnings: metrics.warnings || 0,
          categories: metrics.violationCategories || {}
        },
        historical: this.calculateViolationHistory(history),
        trends: this.calculateViolationTrends(history),
        breakdown: this.calculateViolationBreakdown(history),
        patterns: this.analyzeViolationPatterns(history)
      };
      
      const response = {
        timestamp: new Date().toISOString(),
        status: 'success',
        data: violations
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  /**
   * Serve health check
   */
  serveHealthCheck(req, res) {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0'
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health, null, 2));
  }

  /**
   * Serve comprehensive summary
   */
  serveComprehensiveSummary(req, res) {
    try {
      const metrics = this.getCurrentMetrics();
      const history = this.getHistoricalData();
      
      const summary = {
        overview: {
          complianceScore: metrics.complianceScore || 0,
          totalViolations: metrics.violations || 0,
          criticalViolations: metrics.criticalViolations || 0,
          filesProcessed: metrics.filesProcessed || 0,
          lastCheck: metrics.timestamp
        },
        performance: {
          executionTime: metrics.performance?.executionTime || 0,
          memoryUsage: metrics.performance?.memoryUsage || {},
          cpuUsage: metrics.performance?.cpuUsage || 0,
          efficiency: this.calculateOverallEfficiency(metrics)
        },
        trends: this.calculateTrends(),
        effectiveness: this.calculateEffectiveness(),
        recommendations: this.generateOverallRecommendations(metrics, history)
      };
      
      const response = {
        timestamp: new Date().toISOString(),
        status: 'success',
        data: summary
      };
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    } catch (error) {
      this.serveError(res, error);
    }
  }

  /**
   * Handle refresh request
   */
  handleRefreshRequest(req, res) {
    if (req.method === 'POST') {
      try {
        this.refreshMetrics();
        
        const response = {
          timestamp: new Date().toISOString(),
          status: 'success',
          message: 'Metrics refreshed successfully',
          data: {
            lastRefresh: this.lastRefreshTime,
            nextRefresh: this.lastRefreshTime + this.refreshInterval
          }
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(response, null, 2));
      } catch (error) {
        this.serveError(res, error);
      }
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  }

  /**
   * Serve API configuration
   */
  serveConfiguration(req, res) {
    const config = {
      version: '1.0.0',
      autoRefresh: {
        enabled: this.isAutoRefreshEnabled,
        interval: this.refreshInterval,
        lastRefresh: this.lastRefreshTime,
        nextRefresh: this.lastRefreshTime + this.refreshInterval
      },
      endpoints: [
        { path: '/metrics', method: 'GET', description: 'Current metrics' },
        { path: '/metrics/history', method: 'GET', description: 'Historical data' },
        { path: '/metrics/trends', method: 'GET', description: 'Trend analysis' },
        { path: '/metrics/effectiveness', method: 'GET', description: 'Effectiveness metrics' },
        { path: '/metrics/performance', method: 'GET', description: 'Performance metrics' },
        { path: '/metrics/violations', method: 'GET', description: 'Violation breakdown' },
        { path: '/metrics/health', method: 'GET', description: 'Health check' },
        { path: '/metrics/summary', method: 'GET', description: 'Comprehensive summary' },
        { path: '/metrics/refresh', method: 'POST', description: 'Trigger refresh' },
        { path: '/metrics/config', method: 'GET', description: 'API configuration' }
      ],
      features: [
        'Real-time metrics',
        'Historical data analysis',
        'Trend prediction',
        'Performance monitoring',
        'Violation tracking',
        'Effectiveness calculation',
        'Auto-refresh',
        'Comprehensive reporting'
      ]
    };
    
    const response = {
      timestamp: new Date().toISOString(),
      status: 'success',
      data: config
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response, null, 2));
  }

  /**
   * Serve 404 for unknown endpoints
   */
  serveNotFound(req, res) {
    const error = {
      error: 'Not Found',
      message: 'The requested endpoint was not found',
      availableEndpoints: [
        'GET /metrics',
        'GET /metrics/history',
        'GET /metrics/trends',
        'GET /metrics/effectiveness',
        'GET /metrics/health'
      ]
    };
    
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(error, null, 2));
  }

  /**
   * Serve error response
   */
  serveError(res, error) {
    const errorResponse = {
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    };
    
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(errorResponse, null, 2));
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics() {
    try {
      if (fs.existsSync(this.metricsPath)) {
        const metrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
        return this.enhanceMetrics(metrics);
      }
    } catch (error) {
      console.warn('⚠️ Could not read metrics file:', error.message);
    }

    // Return default metrics if file doesn't exist
    return this.getDefaultMetrics();
  }

  /**
   * Enhance metrics with additional calculations
   */
  enhanceMetrics(metrics) {
    const enhanced = { ...metrics };
    
    // Calculate additional metrics
    enhanced.totalChecks = enhanced.totalChecks || 0;
    enhanced.passedChecks = enhanced.passedChecks || 0;
    enhanced.violations = enhanced.violations || 0;
    enhanced.criticalViolations = enhanced.criticalViolations || 0;
    enhanced.warnings = enhanced.warnings || 0;
    
    // Calculate derived metrics
    enhanced.complianceRate = enhanced.totalChecks > 0 ? 
      (enhanced.passedChecks / enhanced.totalChecks) * 100 : 0;
    
    enhanced.violationRate = enhanced.totalChecks > 0 ? 
      (enhanced.violations / enhanced.totalChecks) * 100 : 0;
    
    enhanced.criticalRate = enhanced.violations > 0 ? 
      (enhanced.criticalViolations / enhanced.violations) * 100 : 0;
    
    // Add performance metrics
    enhanced.performance = enhanced.performance || {
      executionTime: 0,
      averageFileProcessingTime: 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    // Add effectiveness metrics
    enhanced.effectiveness = this.calculateEffectiveness();
    
    return enhanced;
  }

  /**
   * Get default metrics structure
   */
  getDefaultMetrics() {
    return {
      timestamp: new Date().toISOString(),
      complianceScore: 0,
      complianceRate: 0,
      totalChecks: 0,
      passedChecks: 0,
      violations: 0,
      violationRate: 0,
      criticalViolations: 0,
      criticalRate: 0,
      warnings: 0,
      performance: {
        executionTime: 0,
        averageFileProcessingTime: 0,
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      },
      effectiveness: this.calculateEffectiveness()
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
   * Get date range from historical data
   */
  getDateRange(history) {
    if (history.length === 0) {
      return { start: null, end: null };
    }

    const timestamps = history.map(entry => new Date(entry.timestamp));
    const start = new Date(Math.min(...timestamps));
    const end = new Date(Math.max(...timestamps));

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      duration: end.getTime() - start.getTime()
    };
  }

  /**
   * Calculate comprehensive summary statistics for historical data
   */
  calculateHistoricalSummary(history) {
    if (history.length === 0) {
      return {
        totalEntries: 0,
        averageComplianceScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalViolations: 0,
        totalCriticalViolations: 0,
        averageViolations: 0,
        improvementTrend: 'insufficient_data',
        scoreDistribution: {},
        violationTrends: {},
        performanceMetrics: {
          averageExecutionTime: 0,
          averageFileProcessingTime: 0,
          totalFilesProcessed: 0
        }
      };
    }

    const scores = history.map(entry => entry.complianceScore || 0);
    const violations = history.map(entry => entry.violations || 0);
    const criticalViolations = history.map(entry => entry.criticalViolations || 0);
    
    // Calculate basic statistics
    const averageComplianceScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    const totalViolations = violations.reduce((sum, v) => sum + v, 0);
    const totalCriticalViolations = criticalViolations.reduce((sum, v) => sum + v, 0);
    const averageViolations = totalViolations / history.length;
    
    // Calculate improvement trend
    const recentScores = scores.slice(-5);
    const olderScores = scores.slice(0, Math.max(0, scores.length - 5));
    let improvementTrend = 'insufficient_data';
    
    if (recentScores.length >= 3 && olderScores.length >= 3) {
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
      const improvement = recentAvg - olderAvg;
      
      if (improvement > 5) improvementTrend = 'improving';
      else if (improvement < -5) improvementTrend = 'declining';
      else improvementTrend = 'stable';
    }
    
    // Calculate score distribution
    const scoreDistribution = {
      excellent: scores.filter(score => score >= 90).length,
      good: scores.filter(score => score >= 70 && score < 90).length,
      fair: scores.filter(score => score >= 50 && score < 70).length,
      poor: scores.filter(score => score < 50).length
    };
    
    // Calculate violation trends by category
    const violationTrends = {};
    history.forEach(entry => {
      if (entry.metrics && entry.metrics.violationCategories) {
        Object.keys(entry.metrics.violationCategories).forEach(category => {
          if (!violationTrends[category]) {
            violationTrends[category] = { total: 0, critical: 0, warning: 0 };
          }
          const categoryData = entry.metrics.violationCategories[category];
          violationTrends[category].total += (categoryData.CRITICAL || 0) + (categoryData.WARNING || 0);
          violationTrends[category].critical += categoryData.CRITICAL || 0;
          violationTrends[category].warning += categoryData.WARNING || 0;
        });
      }
    });
    
    // Calculate performance metrics
    const performanceMetrics = {
      averageExecutionTime: 0,
      averageFileProcessingTime: 0,
      totalFilesProcessed: 0
    };
    
    const executionTimes = [];
    const fileProcessingTimes = [];
    let totalFiles = 0;
    
    history.forEach(entry => {
      if (entry.metrics) {
        if (entry.metrics.executionTime) {
          executionTimes.push(entry.metrics.executionTime);
        }
        if (entry.metrics.averageFileProcessingTime && entry.metrics.averageFileProcessingTime.overallAverage) {
          fileProcessingTimes.push(entry.metrics.averageFileProcessingTime.overallAverage);
        }
        if (entry.metrics.averageFileProcessingTime && entry.metrics.averageFileProcessingTime.totalFiles) {
          totalFiles += entry.metrics.averageFileProcessingTime.totalFiles;
        }
      }
    });
    
    if (executionTimes.length > 0) {
      performanceMetrics.averageExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    }
    
    if (fileProcessingTimes.length > 0) {
      performanceMetrics.averageFileProcessingTime = fileProcessingTimes.reduce((sum, time) => sum + time, 0) / fileProcessingTimes.length;
    }
    
    performanceMetrics.totalFilesProcessed = totalFiles;
    
    return {
      totalEntries: history.length,
      averageComplianceScore: Math.round(averageComplianceScore * 100) / 100,
      bestScore,
      worstScore,
      totalViolations,
      totalCriticalViolations,
      averageViolations: Math.round(averageViolations * 100) / 100,
      improvementTrend,
      scoreDistribution,
      violationTrends,
      performanceMetrics: {
        averageExecutionTime: Math.round(performanceMetrics.averageExecutionTime * 100) / 100,
        averageFileProcessingTime: Math.round(performanceMetrics.averageFileProcessingTime * 100) / 100,
        totalFilesProcessed: performanceMetrics.totalFilesProcessed
      }
    };
  }

  /**
   * Calculate trends from historical data
   */
  calculateTrends() {
    const history = this.getHistoricalData();
    
    if (history.length < 2) {
      return {
        trend: 'insufficient_data',
        slope: 0,
        confidence: 0,
        prediction: null,
        recentScores: []
      };
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
    
    // Calculate confidence based on data consistency
    const mean = sumY / n;
    const variance = recentScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / n;
    const confidence = Math.max(0, 100 - Math.sqrt(variance));
    
    // Predict next value
    const prediction = this.predictNextValue(recentScores);
    
    return {
      trend,
      slope,
      confidence: Math.round(confidence),
      prediction: Math.round(prediction),
      recentScores,
      dataPoints: n
    };
  }

  /**
   * Calculate advanced trends with multiple time periods and predictions
   */
  calculateAdvancedTrends(days = 30) {
    const history = this.getHistoricalData();
    
    if (history.length < 3) {
      return {
        trend: 'insufficient_data',
        slope: 0,
        confidence: 0,
        predictions: {
          nextWeek: null,
          nextMonth: null,
          confidence: 0
        },
        recentScores: [],
        violationTrends: {},
        performanceTrends: {},
        seasonalPatterns: {}
      };
    }

    // Filter data by time period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const filteredHistory = history.filter(entry => new Date(entry.timestamp) >= cutoffDate);
    
    if (filteredHistory.length < 3) {
      return {
        trend: 'insufficient_data',
        slope: 0,
        confidence: 0,
        predictions: {
          nextWeek: null,
          nextMonth: null,
          confidence: 0
        },
        recentScores: [],
        violationTrends: {},
        performanceTrends: {},
        seasonalPatterns: {}
      };
    }

    const scores = filteredHistory.map(entry => entry.complianceScore || 0);
    const violations = filteredHistory.map(entry => entry.violations || 0);
    const criticalViolations = filteredHistory.map(entry => entry.criticalViolations || 0);
    
    // Calculate compliance score trends
    const complianceTrend = this.calculateLinearRegression(scores);
    
    // Calculate violation trends
    const violationTrend = this.calculateLinearRegression(violations);
    const criticalViolationTrend = this.calculateLinearRegression(criticalViolations);
    
    // Calculate performance trends
    const executionTimes = filteredHistory
      .filter(entry => entry.metrics && entry.metrics.executionTime)
      .map(entry => entry.metrics.executionTime);
    
    const performanceTrend = executionTimes.length > 0 ? 
      this.calculateLinearRegression(executionTimes) : 
      { slope: 0, trend: 'stable', confidence: 0 };
    
    // Detect seasonal patterns
    const seasonalPatterns = this.detectSeasonalPatterns(filteredHistory);
    
    // Calculate predictions
    const predictions = this.calculatePredictions(scores, violations, executionTimes);
    
    // Calculate violation category trends
    const violationTrends = this.calculateViolationCategoryTrends(filteredHistory);
    
    return {
      trend: complianceTrend.trend,
      slope: complianceTrend.slope,
      confidence: complianceTrend.confidence,
      predictions,
      recentScores: scores.slice(-10),
      violationTrends: {
        total: violationTrend,
        critical: criticalViolationTrend,
        byCategory: violationTrends
      },
      performanceTrends: {
        executionTime: performanceTrend,
        fileProcessing: this.calculateFileProcessingTrends(filteredHistory)
      },
      seasonalPatterns,
      dataPoints: filteredHistory.length,
      analysisPeriod: `${days} days`
    };
  }

  /**
   * Calculate linear regression for a dataset
   */
  calculateLinearRegression(data) {
    const n = data.length;
    if (n < 2) {
      return { slope: 0, trend: 'insufficient_data', confidence: 0 };
    }
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += data[i];
      sumXY += i * data[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const trend = slope > 0.01 ? 'improving' : slope < -0.01 ? 'declining' : 'stable';
    
    // Calculate confidence based on data consistency
    const mean = sumY / n;
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / n;
    const confidence = Math.max(0, 100 - Math.sqrt(variance));
    
    return {
      slope: Math.round(slope * 1000) / 1000,
      trend,
      confidence: Math.round(confidence)
    };
  }

  /**
   * Detect seasonal patterns in the data
   */
  detectSeasonalPatterns(history) {
    if (history.length < 7) {
      return { detected: false, pattern: null, confidence: 0 };
    }
    
    // Group by day of week
    const dailyPatterns = {};
    history.forEach(entry => {
      const date = new Date(entry.timestamp);
      const dayOfWeek = date.getDay();
      if (!dailyPatterns[dayOfWeek]) {
        dailyPatterns[dayOfWeek] = [];
      }
      dailyPatterns[dayOfWeek].push(entry.complianceScore || 0);
    });
    
    // Calculate average scores by day
    const dayAverages = {};
    Object.keys(dailyPatterns).forEach(day => {
      const scores = dailyPatterns[day];
      dayAverages[day] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    });
    
    // Check for significant variation
    const values = Object.values(dayAverages);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    const hasSeasonalPattern = standardDeviation > mean * 0.1; // 10% variation threshold
    
    return {
      detected: hasSeasonalPattern,
      pattern: hasSeasonalPattern ? dayAverages : null,
      confidence: hasSeasonalPattern ? Math.round(Math.min(100, standardDeviation / mean * 1000)) : 0
    };
  }

  /**
   * Calculate predictions for different time periods
   */
  calculatePredictions(scores, violations, executionTimes) {
    if (scores.length < 3) {
      return {
        nextWeek: null,
        nextMonth: null,
        confidence: 0
      };
    }
    
    const nextWeekScore = this.predictNextValue(scores);
    const nextMonthScore = this.predictNextValue(scores, 4); // 4 weeks
    
    const nextWeekViolations = violations.length > 0 ? this.predictNextValue(violations) : null;
    const nextMonthViolations = violations.length > 0 ? this.predictNextValue(violations, 4) : null;
    
    const nextWeekPerformance = executionTimes.length > 0 ? this.predictNextValue(executionTimes) : null;
    const nextMonthPerformance = executionTimes.length > 0 ? this.predictNextValue(executionTimes, 4) : null;
    
    // Calculate confidence based on data consistency
    const scoreVariance = this.calculateVariance(scores);
    const confidence = Math.max(0, 100 - Math.sqrt(scoreVariance));
    
    return {
      nextWeek: {
        complianceScore: Math.round(nextWeekScore),
        violations: nextWeekViolations ? Math.round(nextWeekViolations) : null,
        executionTime: nextWeekPerformance ? Math.round(nextWeekPerformance) : null
      },
      nextMonth: {
        complianceScore: Math.round(nextMonthScore),
        violations: nextMonthViolations ? Math.round(nextMonthViolations) : null,
        executionTime: nextMonthPerformance ? Math.round(nextMonthPerformance) : null
      },
      confidence: Math.round(confidence)
    };
  }

  /**
   * Calculate variance of a dataset
   */
  calculateVariance(data) {
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  /**
   * Calculate violation category trends
   */
  calculateViolationCategoryTrends(history) {
    const categoryTrends = {};
    
    history.forEach(entry => {
      if (entry.metrics && entry.metrics.violationCategories) {
        Object.keys(entry.metrics.violationCategories).forEach(category => {
          if (!categoryTrends[category]) {
            categoryTrends[category] = [];
          }
          const categoryData = entry.metrics.violationCategories[category];
          const totalViolations = (categoryData.CRITICAL || 0) + (categoryData.WARNING || 0);
          categoryTrends[category].push(totalViolations);
        });
      }
    });
    
    const trends = {};
    Object.keys(categoryTrends).forEach(category => {
      if (categoryTrends[category].length > 1) {
        trends[category] = this.calculateLinearRegression(categoryTrends[category]);
      }
    });
    
    return trends;
  }

  /**
   * Calculate file processing trends
   */
  calculateFileProcessingTrends(history) {
    const processingTimes = history
      .filter(entry => entry.metrics && entry.metrics.averageFileProcessingTime)
      .map(entry => entry.metrics.averageFileProcessingTime.overallAverage || 0);
    
    return processingTimes.length > 0 ? 
      this.calculateLinearRegression(processingTimes) : 
      { slope: 0, trend: 'stable', confidence: 0 };
  }

  /**
   * Generate recommendations based on trend analysis
   */
  generateTrendRecommendations(trends) {
    const recommendations = [];
    
    // Compliance score recommendations
    if (trends.trend === 'declining') {
      recommendations.push({
        type: 'urgent',
        category: 'compliance',
        title: 'Compliance Score Declining',
        description: 'Your compliance score is trending downward. Consider reviewing recent code changes and standards adherence.',
        action: 'Review recent violations and implement fixes'
      });
    } else if (trends.trend === 'improving') {
      recommendations.push({
        type: 'positive',
        category: 'compliance',
        title: 'Compliance Improving',
        description: 'Great progress! Your compliance score is trending upward.',
        action: 'Continue current practices and consider sharing best practices'
      });
    }
    
    // Violation trend recommendations
    if (trends.violationTrends && trends.violationTrends.total && trends.violationTrends.total.trend === 'improving') {
      recommendations.push({
        type: 'positive',
        category: 'violations',
        title: 'Violations Decreasing',
        description: 'Violation count is trending downward, indicating improved code quality.',
        action: 'Maintain current quality practices'
      });
    }
    
    // Performance recommendations
    if (trends.performanceTrends && trends.performanceTrends.executionTime && trends.performanceTrends.executionTime.trend === 'declining') {
      recommendations.push({
        type: 'warning',
        category: 'performance',
        title: 'Performance Degradation',
        description: 'Execution time is increasing, which may indicate performance issues.',
        action: 'Review code complexity and optimization opportunities'
      });
    }
    
    // Seasonal pattern recommendations
    if (trends.seasonalPatterns && trends.seasonalPatterns.detected) {
      recommendations.push({
        type: 'info',
        category: 'patterns',
        title: 'Seasonal Pattern Detected',
        description: 'Compliance patterns vary by day of week, suggesting workload or team patterns.',
        action: 'Consider scheduling compliance reviews during optimal periods'
      });
    }
    
    return recommendations;
  }

  /**
   * Calculate effectiveness metrics
   */
  calculateEffectiveness() {
    // Get basic metrics without recursion
    let basicMetrics;
    try {
      if (fs.existsSync(this.metricsPath)) {
        basicMetrics = JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
      } else {
        basicMetrics = {
          complianceScore: 0,
          violations: 0,
          criticalViolations: 0
        };
      }
    } catch (error) {
      basicMetrics = {
        complianceScore: 0,
        violations: 0,
        criticalViolations: 0
      };
    }
    
    const history = this.getHistoricalData();
    
    // Calculate time saved (estimated)
    const timeSaved = this.estimateTimeSaved(basicMetrics, history);
    
    // Calculate productivity gain
    const productivityGain = this.calculateProductivityGain(basicMetrics);
    
    // Calculate standards adoption
    const standardsAdoption = this.calculateStandardsAdoption(basicMetrics);
    
    // Calculate quality improvement
    const qualityImprovement = this.calculateQualityImprovement(history);
    
    // Calculate overall effectiveness
    const overallEffectiveness = (timeSaved + productivityGain + standardsAdoption + qualityImprovement) / 4;
    
    return {
      timeSaved,
      productivityGain,
      standardsAdoption,
      qualityImprovement,
      overallEffectiveness: Math.round(overallEffectiveness),
      metrics: {
        complianceScore: basicMetrics.complianceScore || 0,
        violations: basicMetrics.violations || 0,
        criticalViolations: basicMetrics.criticalViolations || 0
      }
    };
  }

  /**
   * Calculate advanced effectiveness metrics with detailed analysis
   */
  calculateAdvancedEffectiveness(days = 30) {
    const history = this.getHistoricalData();
    
    // Filter data by time period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const filteredHistory = history.filter(entry => new Date(entry.timestamp) >= cutoffDate);
    
    if (filteredHistory.length === 0) {
      return {
        timeSaved: { hours: 0, efficiency: 0, breakdown: {} },
        productivityGain: 0,
        standardsAdoption: 0,
        qualityImprovement: 0,
        overallEffectiveness: 0,
        developerMetrics: {},
        costSavings: { estimated: 0, breakdown: {} },
        impactMetrics: {}
      };
    }
    
    // Calculate time saved with detailed breakdown
    const timeSaved = this.calculateDetailedTimeSaved(filteredHistory);
    
    // Calculate productivity gain with trends
    const productivityGain = this.calculateProductivityGainWithTrends(filteredHistory);
    
    // Calculate standards adoption with category breakdown
    const standardsAdoption = this.calculateDetailedStandardsAdoption(filteredHistory);
    
    // Calculate quality improvement with metrics
    const qualityImprovement = this.calculateDetailedQualityImprovement(filteredHistory);
    
    // Calculate developer-specific metrics
    const developerMetrics = this.calculateDeveloperMetrics(filteredHistory);
    
    // Calculate cost savings
    const costSavings = this.calculateCostSavings(timeSaved, productivityGain);
    
    // Calculate impact metrics
    const impactMetrics = this.calculateImpactMetrics(filteredHistory);
    
    // Calculate overall effectiveness
    const overallEffectiveness = Math.round(
      (timeSaved.efficiency + productivityGain.average + standardsAdoption.overall + qualityImprovement.score) / 4
    );
    
    return {
      timeSaved,
      productivityGain,
      standardsAdoption,
      qualityImprovement,
      developerMetrics,
      costSavings,
      impactMetrics,
      overallEffectiveness,
      analysisPeriod: `${days} days`,
      dataPoints: filteredHistory.length
    };
  }

  /**
   * Calculate detailed time saved with breakdown
   */
  calculateDetailedTimeSaved(history) {
    const totalChecks = history.reduce((sum, entry) => sum + (entry.totalChecks || 0), 0);
    const totalViolations = history.reduce((sum, entry) => sum + (entry.violations || 0), 0);
    const totalCriticalViolations = history.reduce((sum, entry) => sum + (entry.criticalViolations || 0), 0);
    
    // Estimate time saved per violation prevented
    const timePerViolation = 0.25; // 15 minutes per violation
    const timePerCriticalViolation = 2; // 2 hours per critical violation
    
    const timeSavedFromViolations = totalViolations * timePerViolation;
    const timeSavedFromCriticalViolations = totalCriticalViolations * timePerCriticalViolation;
    const totalTimeSaved = timeSavedFromViolations + timeSavedFromCriticalViolations;
    
    // Calculate efficiency (time saved vs time spent)
    const totalTimeSpent = history.reduce((sum, entry) => sum + (entry.metrics?.executionTime || 0), 0) / 1000 / 60; // Convert to minutes
    const efficiency = totalTimeSpent > 0 ? (totalTimeSaved / totalTimeSpent) * 100 : 0;
    
    return {
      hours: Math.round(totalTimeSaved * 100) / 100,
      efficiency: Math.round(efficiency * 100) / 100,
      breakdown: {
        violations: Math.round(timeSavedFromViolations * 100) / 100,
        criticalViolations: Math.round(timeSavedFromCriticalViolations * 100) / 100,
        totalChecks,
        totalViolations,
        totalCriticalViolations
      }
    };
  }

  /**
   * Calculate productivity gain with trends
   */
  calculateProductivityGainWithTrends(history) {
    if (history.length < 2) {
      return { average: 0, trend: 'stable', breakdown: {} };
    }
    
    const complianceScores = history.map(entry => entry.complianceScore || 0);
    const averageScore = complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length;
    
    // Calculate trend
    const recentScores = complianceScores.slice(-5);
    const olderScores = complianceScores.slice(0, Math.max(0, complianceScores.length - 5));
    let trend = 'stable';
    
    if (recentScores.length >= 3 && olderScores.length >= 3) {
      const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
      const improvement = recentAvg - olderAvg;
      
      if (improvement > 5) trend = 'improving';
      else if (improvement < -5) trend = 'declining';
    }
    
    // Calculate productivity gain based on compliance improvement
    const productivityGain = Math.max(0, (averageScore - 50) / 50 * 100); // 0-100% scale
    
    return {
      average: Math.round(productivityGain * 100) / 100,
      trend,
      breakdown: {
        averageComplianceScore: Math.round(averageScore * 100) / 100,
        recentAverage: recentScores.length > 0 ? Math.round((recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length) * 100) / 100 : 0,
        improvement: trend === 'improving' ? 'positive' : trend === 'declining' ? 'negative' : 'stable'
      }
    };
  }

  /**
   * Calculate detailed standards adoption
   */
  calculateDetailedStandardsAdoption(history) {
    const standardsUsage = {};
    let totalChecks = 0;
    let totalViolations = 0;
    
    history.forEach(entry => {
      if (entry.metrics && entry.metrics.standardsEffectiveness) {
        Object.keys(entry.metrics.standardsEffectiveness).forEach(standard => {
          if (!standardsUsage[standard]) {
            standardsUsage[standard] = {
              checks: 0,
              violations: 0,
              violationRate: 0,
              usageFrequency: 'LOW'
            };
          }
          
          const standardData = entry.metrics.standardsEffectiveness[standard];
          standardsUsage[standard].checks += standardData.checks || 0;
          standardsUsage[standard].violations += standardData.violations || 0;
          totalChecks += standardData.checks || 0;
          totalViolations += standardData.violations || 0;
        });
      }
    });
    
    // Calculate violation rates and adoption scores
    Object.keys(standardsUsage).forEach(standard => {
      const data = standardsUsage[standard];
      data.violationRate = data.checks > 0 ? (data.violations / data.checks) * 100 : 0;
      
      // Calculate adoption score (lower violation rate = higher adoption)
      data.adoptionScore = Math.max(0, 100 - data.violationRate);
      
      // Determine usage frequency
      const usageRate = data.checks / totalChecks;
      if (usageRate > 0.3) data.usageFrequency = 'HIGH';
      else if (usageRate > 0.1) data.usageFrequency = 'MEDIUM';
      else data.usageFrequency = 'LOW';
    });
    
    // Calculate overall adoption
    const adoptionScores = Object.values(standardsUsage).map(data => data.adoptionScore);
    const overallAdoption = adoptionScores.length > 0 ? 
      adoptionScores.reduce((sum, score) => sum + score, 0) / adoptionScores.length : 0;
    
    return {
      overall: Math.round(overallAdoption * 100) / 100,
      byStandard: standardsUsage,
      totalChecks,
      totalViolations
    };
  }

  /**
   * Calculate detailed quality improvement metrics
   */
  calculateDetailedQualityImprovement(history) {
    if (history.length < 2) {
      return { score: 0, trend: 'stable', metrics: {} };
    }
    
    const violations = history.map(entry => entry.violations || 0);
    const criticalViolations = history.map(entry => entry.criticalViolations || 0);
    const complianceScores = history.map(entry => entry.complianceScore || 0);
    
    // Calculate quality improvement based on violation reduction
    const averageViolations = violations.reduce((sum, v) => sum + v, 0) / violations.length;
    const averageCriticalViolations = criticalViolations.reduce((sum, v) => sum + v, 0) / criticalViolations.length;
    const averageComplianceScore = complianceScores.reduce((sum, score) => sum + score, 0) / complianceScores.length;
    
    // Calculate trend
    const recentViolations = violations.slice(-5);
    const olderViolations = violations.slice(0, Math.max(0, violations.length - 5));
    let trend = 'stable';
    
    if (recentViolations.length >= 3 && olderViolations.length >= 3) {
      const recentAvg = recentViolations.reduce((sum, v) => sum + v, 0) / recentViolations.length;
      const olderAvg = olderViolations.reduce((sum, v) => sum + v, 0) / olderViolations.length;
      const improvement = olderAvg - recentAvg; // Lower violations = improvement
      
      if (improvement > 5) trend = 'improving';
      else if (improvement < -5) trend = 'declining';
    }
    
    // Calculate quality score (0-100)
    const qualityScore = Math.max(0, 100 - (averageViolations / 100) - (averageCriticalViolations * 10));
    
    return {
      score: Math.round(qualityScore * 100) / 100,
      trend,
      metrics: {
        averageViolations: Math.round(averageViolations * 100) / 100,
        averageCriticalViolations: Math.round(averageCriticalViolations * 100) / 100,
        averageComplianceScore: Math.round(averageComplianceScore * 100) / 100,
        violationReduction: trend === 'improving' ? 'positive' : trend === 'declining' ? 'negative' : 'stable'
      }
    };
  }

  /**
   * Calculate developer-specific metrics
   */
  calculateDeveloperMetrics(history) {
    const developerStats = {};
    
    // Group by runId to identify different development sessions
    const sessions = {};
    history.forEach(entry => {
      const runId = entry.runId || 'unknown';
      if (!sessions[runId]) {
        sessions[runId] = [];
      }
      sessions[runId].push(entry);
    });
    
    // Calculate metrics per session
    Object.keys(sessions).forEach(sessionId => {
      const session = sessions[sessionId];
      const sessionStats = {
        duration: 0,
        filesProcessed: 0,
        violationsFound: 0,
        complianceScore: 0,
        efficiency: 0
      };
      
      session.forEach(entry => {
        sessionStats.filesProcessed += entry.totalChecks || 0;
        sessionStats.violationsFound += entry.violations || 0;
        sessionStats.complianceScore = Math.max(sessionStats.complianceScore, entry.complianceScore || 0);
        
        if (entry.metrics && entry.metrics.executionTime) {
          sessionStats.duration += entry.metrics.executionTime;
        }
      });
      
      // Calculate efficiency (files processed per minute)
      sessionStats.efficiency = sessionStats.duration > 0 ? 
        (sessionStats.filesProcessed / (sessionStats.duration / 1000 / 60)) : 0;
      
      developerStats[sessionId] = sessionStats;
    });
    
    // Calculate overall developer metrics
    const allSessions = Object.values(developerStats);
    const totalSessions = allSessions.length;
    const averageEfficiency = allSessions.reduce((sum, session) => sum + session.efficiency, 0) / totalSessions;
    const averageComplianceScore = allSessions.reduce((sum, session) => sum + session.complianceScore, 0) / totalSessions;
    
    return {
      sessions: developerStats,
      summary: {
        totalSessions,
        averageEfficiency: Math.round(averageEfficiency * 100) / 100,
        averageComplianceScore: Math.round(averageComplianceScore * 100) / 100,
        totalFilesProcessed: allSessions.reduce((sum, session) => sum + session.filesProcessed, 0),
        totalViolationsFound: allSessions.reduce((sum, session) => sum + session.violationsFound, 0)
      }
    };
  }

  /**
   * Calculate cost savings based on time saved and productivity gains
   */
  calculateCostSavings(timeSaved, productivityGain) {
    // Assume average developer cost of $100/hour
    const hourlyRate = 100;
    const timeSavedCost = timeSaved.hours * hourlyRate;
    const productivityCost = (productivityGain.average / 100) * 40 * hourlyRate; // 40 hours/week
    
    const totalSavings = timeSavedCost + productivityCost;
    
    return {
      estimated: Math.round(totalSavings * 100) / 100,
      breakdown: {
        timeSaved: Math.round(timeSavedCost * 100) / 100,
        productivityGain: Math.round(productivityCost * 100) / 100,
        hourlyRate
      }
    };
  }

  /**
   * Calculate impact metrics
   */
  calculateImpactMetrics(history) {
    const totalFiles = history.reduce((sum, entry) => sum + (entry.totalChecks || 0), 0);
    const totalViolations = history.reduce((sum, entry) => sum + (entry.violations || 0), 0);
    const totalCriticalViolations = history.reduce((sum, entry) => sum + (entry.criticalViolations || 0), 0);
    
    // Calculate impact scores
    const filesImpact = Math.min(100, totalFiles / 10); // Scale based on files processed
    const violationsImpact = Math.min(100, (totalViolations / 100) * 100); // Scale based on violations found
    const criticalImpact = Math.min(100, totalCriticalViolations * 20); // Higher weight for critical violations
    
    const overallImpact = (filesImpact + violationsImpact + criticalImpact) / 3;
    
    return {
      overall: Math.round(overallImpact * 100) / 100,
      breakdown: {
        filesProcessed: Math.round(filesImpact * 100) / 100,
        violationsFound: Math.round(violationsImpact * 100) / 100,
        criticalViolations: Math.round(criticalImpact * 100) / 100
      },
      totals: {
        files: totalFiles,
        violations: totalViolations,
        criticalViolations: totalCriticalViolations
      }
    };
  }

  /**
   * Calculate ROI for effectiveness metrics
   */
  calculateROI(effectiveness) {
    const costSavings = effectiveness.costSavings.estimated;
    const timeInvestment = effectiveness.timeSaved.hours * 0.1; // Assume 10% of time saved was spent on setup
    
    const roi = timeInvestment > 0 ? ((costSavings - timeInvestment) / timeInvestment) * 100 : 0;
    
    return {
      percentage: Math.round(roi * 100) / 100,
      costSavings,
      timeInvestment: Math.round(timeInvestment * 100) / 100,
      netBenefit: Math.round((costSavings - timeInvestment) * 100) / 100
    };
  }

  /**
   * Generate effectiveness recommendations
   */
  generateEffectivenessRecommendations(effectiveness) {
    const recommendations = [];
    
    // Time saved recommendations
    if (effectiveness.timeSaved.efficiency < 50) {
      recommendations.push({
        type: 'warning',
        category: 'efficiency',
        title: 'Low Time Savings Efficiency',
        description: 'The time spent on compliance checks is not providing sufficient time savings.',
        action: 'Review compliance check configuration and focus on high-impact violations'
      });
    }
    
    // Productivity recommendations
    if (effectiveness.productivityGain.average < 30) {
      recommendations.push({
        type: 'warning',
        category: 'productivity',
        title: 'Low Productivity Gain',
        description: 'Compliance improvements are not translating to significant productivity gains.',
        action: 'Focus on standards that directly impact development speed and quality'
      });
    }
    
    // Standards adoption recommendations
    if (effectiveness.standardsAdoption.overall < 70) {
      recommendations.push({
        type: 'urgent',
        category: 'adoption',
        title: 'Low Standards Adoption',
        description: 'Standards are not being effectively adopted across the codebase.',
        action: 'Review standards documentation and provide additional training'
      });
    }
    
    // Quality improvement recommendations
    if (effectiveness.qualityImprovement.score < 60) {
      recommendations.push({
        type: 'warning',
        category: 'quality',
        title: 'Quality Improvement Needed',
        description: 'Code quality is not improving significantly despite compliance checks.',
        action: 'Focus on critical violations and implement code review processes'
      });
    }
    
    // Positive recommendations
    if (effectiveness.overallEffectiveness > 80) {
      recommendations.push({
        type: 'positive',
        category: 'overall',
        title: 'Excellent Effectiveness',
        description: 'Agent-OS is providing significant value to your development process.',
        action: 'Consider expanding usage to additional projects or teams'
      });
    }
    
    return recommendations;
  }

  /**
   * Estimate time saved through automation
   */
  estimateTimeSaved(metrics, history) {
    const baseTimePerViolation = 2; // minutes
    const violationsFixed = history.length > 0 ? 
      Math.max(0, history[0].violations - metrics.violations) : 0;
    
    return Math.round(violationsFixed * baseTimePerViolation);
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
    
    return Math.round((complianceFactor + criticalFactor) / 2 * 100);
  }

  /**
   * Calculate standards adoption rate
   */
  calculateStandardsAdoption(metrics) {
    const totalChecks = metrics.totalChecks || 1;
    const passedChecks = metrics.passedChecks || 0;
    
    return Math.round((passedChecks / totalChecks) * 100);
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
    
    return Math.round(Math.max(0, recentAvg - olderAvg));
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
   * Stop the API server
   */
  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 Simple metrics API stopped');
    }
  }
}

// Export for use in other modules
export default SimpleMetricsAPI;

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const api = new SimpleMetricsAPI();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping simple metrics API...');
    api.stop();
    process.exit(0);
  });
  
  api.start();
} 