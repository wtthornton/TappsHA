#!/usr/bin/env node

/**
 * Statistical Analysis Module for Compliance Checker
 * Provides statistical analysis capabilities for compliance data
 */

class StatisticalAnalysis {
  constructor() {
    this.historicalData = [];
    this.baselines = {};
  }

  loadHistoricalData() {
    // Load historical compliance data for trend analysis
    try {
      const fs = require('fs');
      const path = require('path');
      const historyPath = path.join(__dirname, '../reports/compliance-history.json');
      
      if (fs.existsSync(historyPath)) {
        this.historicalData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load historical data:', error.message);
      this.historicalData = [];
    }
  }

  calculateTrend(data, metric = 'complianceScore') {
    if (data.length < 2) return { trend: 'insufficient_data', slope: 0 };
    
    const values = data.map(entry => entry[metric] || 0);
    const n = values.length;
    
    // Calculate linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const trend = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';
    
    return { trend, slope, values: values.slice(-10) }; // Last 10 values
  }

  calculateAverage(data, metric = 'complianceScore') {
    if (data.length === 0) return 0;
    
    const values = data.map(entry => entry[metric] || 0);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateVolatility(data, metric = 'complianceScore') {
    if (data.length < 2) return 0;
    
    const values = data.map(entry => entry[metric] || 0);
    const mean = this.calculateAverage(data, metric);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }

  detectSeasonality(data, metric = 'complianceScore') {
    if (data.length < 7) return { hasSeasonality: false, period: 0 };
    
    const values = data.map(entry => entry[metric] || 0);
    const autocorrelations = [];
    
    // Calculate autocorrelations for different lags
    for (let lag = 1; lag <= Math.min(7, Math.floor(values.length / 2)); lag++) {
      let numerator = 0, denominator = 0;
      const mean = this.calculateAverage(data, metric);
      
      for (let i = lag; i < values.length; i++) {
        numerator += (values[i] - mean) * (values[i - lag] - mean);
        denominator += Math.pow(values[i] - mean, 2);
      }
      
      autocorrelations.push({
        lag,
        correlation: denominator !== 0 ? numerator / denominator : 0
      });
    }
    
    // Find the lag with highest correlation (potential seasonality)
    const maxCorrelation = Math.max(...autocorrelations.map(ac => Math.abs(ac.correlation)));
    const seasonalityPeriod = autocorrelations.find(ac => Math.abs(ac.correlation) === maxCorrelation)?.lag || 0;
    
    return {
      hasSeasonality: maxCorrelation > 0.5,
      period: seasonalityPeriod,
      strength: maxCorrelation
    };
  }

  predictNextValue(data, metric = 'complianceScore') {
    if (data.length < 3) return { prediction: null, confidence: 0 };
    
    const trend = this.calculateTrend(data, metric);
    const volatility = this.calculateVolatility(data, metric);
    const seasonality = this.detectSeasonality(data, metric);
    
    const recentValues = data.slice(-5).map(entry => entry[metric] || 0);
    const lastValue = recentValues[recentValues.length - 1];
    
    // Simple prediction based on trend
    let prediction = lastValue + trend.slope;
    
    // Adjust for seasonality if detected
    if (seasonality.hasSeasonality && seasonality.period > 0) {
      const seasonalAdjustment = recentValues[recentValues.length - seasonality.period] || lastValue;
      prediction = (prediction + seasonalAdjustment) / 2;
    }
    
    // Calculate confidence based on data quality and volatility
    const confidence = Math.max(0, Math.min(1, 1 - volatility / 100));
    
    return {
      prediction: Math.max(0, Math.min(100, prediction)),
      confidence,
      trend: trend.trend,
      volatility
    };
  }

  analyzeViolationPatterns(violations) {
    if (!violations || violations.length === 0) {
      return { patterns: [], recommendations: [] };
    }
    
    const patterns = {
      byType: {},
      byFile: {},
      bySeverity: {},
      byStandard: {}
    };
    
    violations.forEach(violation => {
      // Count by type
      patterns.byType[violation.type] = (patterns.byType[violation.type] || 0) + 1;
      
      // Count by file
      const fileName = violation.file ? violation.file.split('/').pop() : 'unknown';
      patterns.byFile[fileName] = (patterns.byFile[fileName] || 0) + 1;
      
      // Count by severity
      patterns.bySeverity[violation.severity || 'medium'] = (patterns.bySeverity[violation.severity || 'medium'] || 0) + 1;
      
      // Count by standard
      patterns.byStandard[violation.standard || 'unknown'] = (patterns.byStandard[violation.standard || 'unknown'] || 0) + 1;
    });
    
    // Generate recommendations
    const recommendations = [];
    
    // Most common violation type
    const mostCommonType = Object.entries(patterns.byType)
      .sort(([,a], [,b]) => b - a)[0];
    if (mostCommonType) {
      recommendations.push({
        type: 'focus_area',
        message: `Focus on reducing ${mostCommonType[0]} violations (${mostCommonType[1]} occurrences)`,
        priority: 'high'
      });
    }
    
    // Critical violations
    if (patterns.bySeverity.critical > 0) {
      recommendations.push({
        type: 'critical',
        message: `${patterns.bySeverity.critical} critical violations need immediate attention`,
        priority: 'critical'
      });
    }
    
    return { patterns, recommendations };
  }

  calculatePerformanceMetrics(executionTimes) {
    if (!executionTimes || Object.keys(executionTimes).length === 0) {
      return { average: 0, median: 0, p95: 0, p99: 0 };
    }
    
    const times = Object.values(executionTimes);
    const sorted = times.sort((a, b) => a - b);
    
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return { average, median, p95, p99 };
  }

  analyzeViolationFrequency(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return { frequency: 'insufficient_data', trend: 'unknown' };
    }
    
    const violations = historicalData
      .filter(entry => entry.violations && entry.violations.length > 0)
      .flatMap(entry => entry.violations);
    
    if (violations.length === 0) {
      return { frequency: 'low', trend: 'improving' };
    }
    
    // Calculate violation frequency over time
    const timeWindows = this.groupViolationsByTime(historicalData);
    const frequencyTrend = this.calculateFrequencyTrend(timeWindows);
    
    return {
      frequency: this.determineFrequencyLevel(violations.length, historicalData.length),
      trend: frequencyTrend,
      totalViolations: violations.length,
      averagePerRun: violations.length / historicalData.length,
      timeWindows
    };
  }

  groupViolationsByTime(historicalData) {
    const windows = {};
    
    historicalData.forEach(entry => {
      const date = new Date(entry.timestamp);
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
      
      if (!windows[weekKey]) {
        windows[weekKey] = { violations: 0, runs: 0 };
      }
      
      windows[weekKey].violations += entry.violations || 0;
      windows[weekKey].runs += 1;
    });
    
    return windows;
  }

  calculateFrequencyTrend(timeWindows) {
    const weeks = Object.keys(timeWindows).sort();
    if (weeks.length < 2) return 'insufficient_data';
    
    const violationRates = weeks.map(week => 
      timeWindows[week].violations / timeWindows[week].runs
    );
    
    // Simple trend calculation
    const firstHalf = violationRates.slice(0, Math.floor(violationRates.length / 2));
    const secondHalf = violationRates.slice(Math.floor(violationRates.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;
    
    if (secondAvg < firstAvg * 0.8) return 'improving';
    if (secondAvg > firstAvg * 1.2) return 'declining';
    return 'stable';
  }

  determineFrequencyLevel(totalViolations, totalRuns) {
    const averageViolations = totalViolations / totalRuns;
    
    if (averageViolations < 1) return 'low';
    if (averageViolations < 5) return 'medium';
    if (averageViolations < 10) return 'high';
    return 'very_high';
  }

  analyzeComplianceTrends(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return { trend: 'insufficient_data', stability: 'unknown', improvement: 'unknown' };
    }
    
    const complianceScores = historicalData.map(entry => entry.complianceScore || 0);
    const trend = this.calculateTrend(historicalData, 'complianceScore');
    const volatility = this.calculateVolatility(historicalData, 'complianceScore');
    
    // Calculate stability based on volatility
    let stability = 'stable';
    if (volatility > 10) stability = 'unstable';
    else if (volatility > 5) stability = 'moderate';
    
    // Calculate improvement rate
    let improvement = 'unknown';
    if (complianceScores.length >= 2) {
      const firstHalf = complianceScores.slice(0, Math.floor(complianceScores.length / 2));
      const secondHalf = complianceScores.slice(Math.floor(complianceScores.length / 2));
      
      const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
      
      const improvementRate = ((secondAvg - firstAvg) / firstAvg) * 100;
      
      if (improvementRate > 5) improvement = 'improving';
      else if (improvementRate < -5) improvement = 'declining';
      else improvement = 'stable';
    }
    
    return {
      trend: trend.trend,
      stability,
      improvement,
      volatility,
      averageScore: this.calculateAverage(historicalData, 'complianceScore'),
      recentScores: complianceScores.slice(-5)
    };
  }

  analyzePerformanceTrends(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return { trend: 'insufficient_data', efficiency: 'unknown' };
    }
    
    const executionTimes = historicalData
      .filter(entry => entry.metrics && entry.metrics.executionTime)
      .map(entry => entry.metrics.executionTime);
    
    if (executionTimes.length === 0) {
      return { trend: 'insufficient_data', efficiency: 'unknown' };
    }
    
    const trend = this.calculateTrend(executionTimes.map((time, index) => ({ executionTime: time })), 'executionTime');
    const averageTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    
    let efficiency = 'efficient';
    if (averageTime > 10000) efficiency = 'slow';
    else if (averageTime > 5000) efficiency = 'moderate';
    
    return {
      trend: trend.trend,
      efficiency,
      averageExecutionTime: averageTime,
      recentTimes: executionTimes.slice(-5)
    };
  }

  analyzeStandardsEffectiveness(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return { effectiveness: 'unknown', recommendations: [] };
    }
    
    // Analyze which standards are most/least effective
    const standardsAnalysis = {};
    const allViolations = historicalData
      .filter(entry => entry.violations && entry.violations.length > 0)
      .flatMap(entry => entry.violations);
    
    // Group violations by standard
    allViolations.forEach(violation => {
      const standard = violation.standard || 'unknown';
      if (!standardsAnalysis[standard]) {
        standardsAnalysis[standard] = { violations: 0, critical: 0, warnings: 0 };
      }
      
      standardsAnalysis[standard].violations += 1;
      if (violation.type === 'CRITICAL') {
        standardsAnalysis[standard].critical += 1;
      } else if (violation.type === 'WARNING') {
        standardsAnalysis[standard].warnings += 1;
      }
    });
    
    // Calculate effectiveness scores
    const effectivenessScores = {};
    Object.entries(standardsAnalysis).forEach(([standard, data]) => {
      const totalRuns = historicalData.length;
      const violationRate = data.violations / totalRuns;
      const criticalRate = data.critical / totalRuns;
      
      // Effectiveness score (lower violations = higher effectiveness)
      let effectiveness = 'effective';
      if (violationRate > 0.5) effectiveness = 'ineffective';
      else if (violationRate > 0.2) effectiveness = 'moderate';
      
      effectivenessScores[standard] = {
        effectiveness,
        violationRate,
        criticalRate,
        totalViolations: data.violations,
        criticalViolations: data.critical
      };
    });
    
    // Generate recommendations
    const recommendations = [];
    Object.entries(effectivenessScores).forEach(([standard, data]) => {
      if (data.effectiveness === 'ineffective') {
        recommendations.push({
          standard,
          priority: 'high',
          message: `${standard} standard is ineffective (${(data.violationRate * 100).toFixed(1)}% violation rate)`,
          action: 'Review and improve standard implementation'
        });
      } else if (data.criticalRate > 0.1) {
        recommendations.push({
          standard,
          priority: 'critical',
          message: `${standard} has high critical violation rate (${(data.criticalRate * 100).toFixed(1)}%)`,
          action: 'Immediate attention required for critical violations'
        });
      }
    });
    
    return {
      effectiveness: effectivenessScores,
      recommendations,
      totalStandards: Object.keys(effectivenessScores).length,
      averageViolationRate: Object.values(effectivenessScores)
        .reduce((sum, data) => sum + data.violationRate, 0) / Object.keys(effectivenessScores).length
    };
  }

  calculateRiskScores(violations, historicalData) {
    if (!violations || violations.length === 0) {
      return { overallRisk: 'low', riskAreas: {} };
    }
    
    const riskAreas = {
      critical: { score: 0, violations: [] },
      security: { score: 0, violations: [] },
      performance: { score: 0, violations: [] },
      compliance: { score: 0, violations: [] },
      quality: { score: 0, violations: [] }
    };
    
    // Categorize violations by risk area
    violations.forEach(violation => {
      const message = violation.message.toLowerCase();
      const type = violation.type || 'WARNING';
      
      // Critical violations
      if (type === 'CRITICAL') {
        riskAreas.critical.score += 10;
        riskAreas.critical.violations.push(violation);
      }
      
      // Security violations
      if (message.includes('security') || message.includes('vulnerability') ||
          message.includes('authentication') || message.includes('authorization') ||
          message.includes('encryption') || message.includes('owasp')) {
        riskAreas.security.score += type === 'CRITICAL' ? 8 : 4;
        riskAreas.security.violations.push(violation);
      }
      
      // Performance violations
      if (message.includes('performance') || message.includes('slow') ||
          message.includes('optimization') || message.includes('memory') ||
          message.includes('cpu') || message.includes('timeout')) {
        riskAreas.performance.score += type === 'CRITICAL' ? 6 : 3;
        riskAreas.performance.violations.push(violation);
      }
      
      // Compliance violations
      if (message.includes('compliance') || message.includes('standard') ||
          message.includes('requirement') || message.includes('policy')) {
        riskAreas.compliance.score += type === 'CRITICAL' ? 5 : 2;
        riskAreas.compliance.violations.push(violation);
      }
      
      // Quality violations
      if (message.includes('quality') || message.includes('maintainability') ||
          message.includes('readability') || message.includes('complexity')) {
        riskAreas.quality.score += type === 'CRITICAL' ? 4 : 2;
        riskAreas.quality.violations.push(violation);
      }
    });
    
    // Calculate overall risk score
    const totalRiskScore = Object.values(riskAreas).reduce((sum, area) => sum + area.score, 0);
    
    let overallRisk = 'low';
    if (totalRiskScore > 50) overallRisk = 'critical';
    else if (totalRiskScore > 30) overallRisk = 'high';
    else if (totalRiskScore > 15) overallRisk = 'medium';
    
    return {
      overallRisk,
      riskAreas,
      totalRiskScore,
      riskLevel: this.determineRiskLevel(totalRiskScore)
    };
  }

  determineRiskLevel(score) {
    if (score > 50) return 'critical';
    if (score > 30) return 'high';
    if (score > 15) return 'medium';
    return 'low';
  }

  generateInsights(data, violations, performanceMetrics) {
    const insights = [];
    
    // Compliance trend insights
    const trend = this.calculateTrend(data);
    if (trend.trend === 'improving') {
      insights.push({
        type: 'positive',
        message: 'Compliance score is improving over time',
        confidence: 'high'
      });
    } else if (trend.trend === 'declining') {
      insights.push({
        type: 'warning',
        message: 'Compliance score is declining - immediate action needed',
        confidence: 'high'
      });
    }
    
    // Performance insights
    if (performanceMetrics.p95 > 5000) { // 5 seconds
      insights.push({
        type: 'performance',
        message: 'Compliance checking performance is slow (P95 > 5s)',
        confidence: 'medium'
      });
    }
    
    // Violation insights
    if (violations && violations.length > 0) {
      const criticalViolations = violations.filter(v => v.type === 'CRITICAL').length;
      if (criticalViolations > 0) {
        insights.push({
          type: 'critical',
          message: `${criticalViolations} critical violations detected`,
          confidence: 'high'
        });
      }
    }
    
    return insights;
  }
}

module.exports = StatisticalAnalysis; 