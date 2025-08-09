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
      import('fs').then(fs => {
        import('path').then(path => {
          const historyPath = path.join(__dirname, '../reports/compliance-history.json');
          
          if (fs.existsSync(historyPath)) {
            this.historicalData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
          }
        });
      });
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

  // Alias for predictComplianceScore to maintain compatibility
  predictComplianceScore(data) {
    return this.predictNextValue(data, 'complianceScore');
  }

  // Generate statistical insights for compliance analysis
  generateStatisticalInsights(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        insights: [],
        trends: [],
        recommendations: []
      };
    }

    const insights = [];
    const trends = [];
    const recommendations = [];

    // Analyze compliance trend
    const complianceTrend = this.calculateTrend(historicalData, 'complianceScore');
    if (complianceTrend.trend === 'improving') {
      insights.push({
        type: 'positive',
        message: 'Compliance score is improving over time',
        confidence: 'high'
      });
    } else if (complianceTrend.trend === 'declining') {
      insights.push({
        type: 'warning',
        message: 'Compliance score is declining - immediate action needed',
        confidence: 'high'
      });
      recommendations.push({
        priority: 'high',
        action: 'Review recent changes that may have impacted compliance',
        description: 'Compliance score is declining, investigate root causes'
      });
    }

    // Analyze performance trends
    const performanceTrend = this.calculateTrend(historicalData, 'executionTime');
    if (performanceTrend.trend === 'slowing') {
      insights.push({
        type: 'performance',
        message: 'Compliance checking performance is degrading',
        confidence: 'medium'
      });
      recommendations.push({
        priority: 'medium',
        action: 'Optimize compliance checking performance',
        description: 'Consider file filtering and caching strategies'
      });
    }

    // Analyze volatility
    const volatility = this.calculateVolatility(historicalData, 'complianceScore');
    if (volatility > 20) {
      insights.push({
        type: 'volatility',
        message: 'High compliance score volatility detected',
        confidence: 'medium'
      });
      recommendations.push({
        priority: 'medium',
        action: 'Stabilize compliance practices',
        description: 'Implement consistent coding standards and review processes'
      });
    }

    return {
      insights,
      trends: [complianceTrend, performanceTrend],
      recommendations
    };
  }

  // Identify violation patterns in historical data
  identifyViolationPatterns(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        patterns: [],
        frequency: {},
        severity: {}
      };
    }

    const patterns = [];
    const frequency = {};
    const severity = {};

    // Extract all violations from historical data
    const allViolations = [];
    historicalData.forEach(entry => {
      if (entry.violations && Array.isArray(entry.violations)) {
        allViolations.push(...entry.violations);
      }
    });

    // Analyze violation patterns
    allViolations.forEach(violation => {
      if (!violation) return;

      const type = violation.type || 'UNKNOWN';
      const sev = violation.severity || 'MEDIUM';

      // Count frequency
      frequency[type] = (frequency[type] || 0) + 1;
      severity[sev] = (severity[sev] || 0) + 1;

      // Identify patterns
      if (type.includes('ESLINT') || type.includes('LINT')) {
        patterns.push({
          category: 'code_quality',
          type: type,
          message: violation.message || 'Code quality issue',
          count: frequency[type]
        });
      } else if (type.includes('SECURITY') || type.includes('VULNERABILITY')) {
        patterns.push({
          category: 'security',
          type: type,
          message: violation.message || 'Security issue',
          count: frequency[type]
        });
      } else if (type.includes('PERFORMANCE') || type.includes('OPTIMIZATION')) {
        patterns.push({
          category: 'performance',
          type: type,
          message: violation.message || 'Performance issue',
          count: frequency[type]
        });
      } else {
        patterns.push({
          category: 'other',
          type: type,
          message: violation.message || 'Other issue',
          count: frequency[type]
        });
      }
    });

    return {
      patterns: patterns.slice(0, 10), // Top 10 patterns
      frequency,
      severity
    };
  }

  // Detect recurring compliance issues
  detectRecurringComplianceIssues(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        recurringIssues: [],
        frequency: {},
        recommendations: []
      };
    }

    const issueFrequency = {};
    const recurringIssues = [];
    const recommendations = [];

    // Extract all violations and track frequency
    historicalData.forEach(entry => {
      if (entry.violations && Array.isArray(entry.violations)) {
        entry.violations.forEach(violation => {
          if (!violation) return;

          const issueKey = `${violation.type || 'UNKNOWN'}:${violation.message || 'NO_MESSAGE'}`;
          issueFrequency[issueKey] = (issueFrequency[issueKey] || 0) + 1;
        });
      }
    });

    // Identify recurring issues (appearing more than once)
    Object.entries(issueFrequency).forEach(([issueKey, count]) => {
      if (count > 1) {
        const [type, message] = issueKey.split(':', 2);
        recurringIssues.push({
          type: type,
          message: message,
          frequency: count,
          severity: this.determineIssueSeverity(type, count)
        });
      }
    });

    // Sort by frequency (most frequent first)
    recurringIssues.sort((a, b) => b.frequency - a.frequency);

    // Generate recommendations for top recurring issues
    const topIssues = recurringIssues.slice(0, 5);
    topIssues.forEach(issue => {
      recommendations.push({
        priority: issue.severity === 'HIGH' ? 'high' : 'medium',
        action: `Address recurring ${issue.type} issue`,
        description: `${issue.message} (appears ${issue.frequency} times)`,
        recommendation: this.generateIssueRecommendation(issue)
      });
    });

    return {
      recurringIssues: recurringIssues.slice(0, 10), // Top 10 recurring issues
      frequency: issueFrequency,
      recommendations
    };
  }

  // Determine issue severity based on type and frequency
  determineIssueSeverity(type, frequency) {
    if (frequency >= 5) return 'HIGH';
    if (frequency >= 3) return 'MEDIUM';
    return 'LOW';
  }

  // Generate specific recommendations for issues
  generateIssueRecommendation(issue) {
    const type = issue.type.toLowerCase();
    
    if (type.includes('eslint') || type.includes('lint')) {
      return 'Review and fix code style issues. Consider updating ESLint configuration.';
    } else if (type.includes('security') || type.includes('vulnerability')) {
      return 'Address security vulnerabilities immediately. Review dependencies and update if necessary.';
    } else if (type.includes('performance') || type.includes('optimization')) {
      return 'Optimize code for better performance. Consider code review and refactoring.';
    } else {
      return 'Review and address the recurring issue. Consider implementing automated checks.';
    }
  }

  // Build violation clustering analysis
  buildViolationClusteringAnalysis(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        clusters: [],
        clusterMetrics: {},
        recommendations: []
      };
    }

    const clusters = [];
    const clusterMetrics = {};
    const recommendations = [];

    // Extract all violations for clustering
    const allViolations = [];
    historicalData.forEach(entry => {
      if (entry.violations && Array.isArray(entry.violations)) {
        entry.violations.forEach(violation => {
          if (!violation) return;
          allViolations.push({
            ...violation,
            timestamp: entry.timestamp || Date.now(),
            complianceScore: entry.complianceScore || 0
          });
        });
      }
    });

    // Simple clustering by violation type and severity
    const clusterMap = new Map();
    
    allViolations.forEach(violation => {
      const clusterKey = `${violation.type || 'UNKNOWN'}_${violation.severity || 'MEDIUM'}`;
      
      if (!clusterMap.has(clusterKey)) {
        clusterMap.set(clusterKey, {
          type: violation.type || 'UNKNOWN',
          severity: violation.severity || 'MEDIUM',
          violations: [],
          count: 0,
          avgComplianceScore: 0,
          timeRange: { start: Date.now(), end: 0 }
        });
      }
      
      const cluster = clusterMap.get(clusterKey);
      cluster.violations.push(violation);
      cluster.count++;
      cluster.avgComplianceScore = (cluster.avgComplianceScore * (cluster.count - 1) + violation.complianceScore) / cluster.count;
      
      if (violation.timestamp < cluster.timeRange.start) {
        cluster.timeRange.start = violation.timestamp;
      }
      if (violation.timestamp > cluster.timeRange.end) {
        cluster.timeRange.end = violation.timestamp;
      }
    });

    // Convert clusters to array and calculate metrics
    clusterMap.forEach((cluster, key) => {
      clusters.push({
        id: key,
        ...cluster,
        timeSpan: cluster.timeRange.end - cluster.timeRange.start,
        frequency: cluster.count / Math.max(1, (cluster.timeRange.end - cluster.timeRange.start) / (1000 * 60 * 60 * 24)) // violations per day
      });
    });

    // Sort clusters by frequency (most frequent first)
    clusters.sort((a, b) => b.frequency - a.frequency);

    // Generate cluster metrics
    clusterMetrics.totalClusters = clusters.length;
    clusterMetrics.totalViolations = allViolations.length;
    clusterMetrics.avgClusterSize = clusters.length > 0 ? allViolations.length / clusters.length : 0;
    clusterMetrics.mostFrequentCluster = clusters[0] || null;
    clusterMetrics.highSeverityClusters = clusters.filter(c => c.severity === 'HIGH').length;

    // Generate recommendations based on clustering
    if (clusters.length > 0) {
      const topCluster = clusters[0];
      if (topCluster.frequency > 1) {
        recommendations.push({
          priority: 'high',
          action: `Address high-frequency ${topCluster.type} violations`,
          description: `${topCluster.count} violations in ${topCluster.type} cluster`,
          recommendation: `Focus on fixing ${topCluster.type} issues to reduce violation frequency`
        });
      }

      const highSeverityClusters = clusters.filter(c => c.severity === 'HIGH');
      if (highSeverityClusters.length > 0) {
        recommendations.push({
          priority: 'critical',
          action: 'Address high-severity violation clusters',
          description: `${highSeverityClusters.length} high-severity clusters detected`,
          recommendation: 'Prioritize fixing high-severity violations to improve compliance'
        });
      }
    }

    return {
      clusters: clusters.slice(0, 10), // Top 10 clusters
      clusterMetrics,
      recommendations
    };
  }

  // Predict compliance issues based on historical data
  predictComplianceIssues(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        predictions: [],
        confidence: 0,
        recommendations: []
      };
    }

    const predictions = [];
    const recommendations = [];

    // Analyze recent trends
    const recentData = historicalData.slice(-10);
    const complianceTrend = this.calculateTrend(recentData, 'complianceScore');
    const violationTrend = this.analyzeViolationFrequency(recentData);

    // Predict based on trends
    if (complianceTrend.trend === 'declining') {
      predictions.push({
        type: 'compliance_decline',
        probability: 0.8,
        timeframe: 'next_week',
        description: 'Compliance score is declining, likely to continue',
        severity: 'high'
      });

      recommendations.push({
        priority: 'critical',
        action: 'Address declining compliance trend',
        description: 'Compliance score is decreasing over time',
        recommendation: 'Review recent changes and implement immediate fixes'
      });
    }

    // Predict based on violation patterns
    const recurringIssues = this.detectRecurringComplianceIssues(historicalData);
    if (recurringIssues.recurringIssues.length > 0) {
      const topIssue = recurringIssues.recurringIssues[0];
      predictions.push({
        type: 'recurring_issue',
        probability: 0.9,
        timeframe: 'next_run',
        description: `Recurring issue: ${topIssue.type} violations`,
        severity: topIssue.severity || 'medium'
      });

      recommendations.push({
        priority: 'high',
        action: `Address recurring ${topIssue.type} violations`,
        description: `${topIssue.frequency} occurrences of ${topIssue.type} violations`,
        recommendation: 'Implement automated checks to prevent recurrence'
      });
    }

    // Calculate overall confidence
    const confidence = predictions.length > 0 ? 
      predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length : 0;

    return {
      predictions: predictions.slice(0, 5), // Top 5 predictions
      confidence: Math.round(confidence * 100),
      recommendations
    };
  }

  // Create simple forecasting for compliance trends
  createSimpleForecasting(historicalData, periods = 3) {
    if (!historicalData || historicalData.length === 0) {
      return {
        forecasts: [],
        confidence: 0,
        methodology: 'insufficient_data'
      };
    }

    const forecasts = [];
    const methodology = 'simple_linear_regression';

    // Extract compliance scores
    const scores = historicalData.map(entry => entry.complianceScore || 0);
    const recentScores = scores.slice(-10); // Use last 10 data points

    if (recentScores.length < 3) {
      return {
        forecasts: [],
        confidence: 0,
        methodology: 'insufficient_data'
      };
    }

    // Calculate simple linear trend
    const n = recentScores.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = recentScores.reduce((sum, score) => sum + score, 0);
    const sumXY = recentScores.reduce((sum, score, index) => sum + (score * (index + 1)), 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Generate forecasts
    for (let i = 1; i <= periods; i++) {
      const predictedScore = Math.max(0, Math.min(100, intercept + slope * (n + i)));
      const confidence = Math.max(0.1, 1 - (i * 0.1)); // Decreasing confidence over time

      forecasts.push({
        period: i,
        predictedScore: Math.round(predictedScore),
        confidence: Math.round(confidence * 100),
        trend: slope > 0 ? 'improving' : slope < 0 ? 'declining' : 'stable',
        methodology
      });
    }

    // Calculate overall confidence based on data quality
    const dataQuality = Math.min(1, recentScores.length / 10);
    const trendConsistency = 1 - Math.abs(slope) / 10; // More stable trends = higher confidence
    const overallConfidence = Math.round((dataQuality * 0.6 + trendConsistency * 0.4) * 100);

    return {
      forecasts,
      confidence: overallConfidence,
      methodology
    };
  }

  // Implement risk assessment based on trends
  implementRiskAssessmentBasedOnTrends(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        riskLevel: 'unknown',
        riskFactors: [],
        recommendations: [],
        confidence: 0
      };
    }

    const riskFactors = [];
    const recommendations = [];
    let overallRiskScore = 0;
    let riskFactorsCount = 0;

    // Analyze compliance trend
    const complianceTrend = this.calculateTrend(historicalData, 'complianceScore');
    if (complianceTrend.trend === 'declining') {
      riskFactors.push({
        factor: 'declining_compliance',
        severity: 'high',
        description: 'Compliance score is decreasing over time',
        impact: 'High risk of continued decline'
      });
      overallRiskScore += 0.8;
      riskFactorsCount++;
    }

    // Analyze violation frequency
    const violationTrend = this.analyzeViolationFrequency(historicalData);
    if (violationTrend.trend === 'increasing') {
      riskFactors.push({
        factor: 'increasing_violations',
        severity: 'medium',
        description: 'Number of violations is increasing',
        impact: 'Medium risk of continued violations'
      });
      overallRiskScore += 0.6;
      riskFactorsCount++;
    }

    // Analyze recent performance
    const recentData = historicalData.slice(-5);
    const avgRecentScore = recentData.reduce((sum, entry) => sum + (entry.complianceScore || 0), 0) / recentData.length;
    
    if (avgRecentScore < 70) {
      riskFactors.push({
        factor: 'low_compliance_score',
        severity: 'high',
        description: `Average compliance score is ${Math.round(avgRecentScore)}%`,
        impact: 'High risk of compliance issues'
      });
      overallRiskScore += 0.9;
      riskFactorsCount++;
    }

    // Analyze volatility
    const volatility = this.calculateVolatility(historicalData, 'complianceScore');
    if (volatility > 15) {
      riskFactors.push({
        factor: 'high_volatility',
        severity: 'medium',
        description: 'Compliance scores are highly variable',
        impact: 'Medium risk of unpredictable compliance'
      });
      overallRiskScore += 0.5;
      riskFactorsCount++;
    }

    // Determine overall risk level
    const averageRiskScore = riskFactorsCount > 0 ? overallRiskScore / riskFactorsCount : 0;
    let riskLevel = 'low';
    
    if (averageRiskScore >= 0.7) {
      riskLevel = 'high';
    } else if (averageRiskScore >= 0.4) {
      riskLevel = 'medium';
    }

    // Generate recommendations based on risk factors
    if (riskLevel === 'high') {
      recommendations.push({
        priority: 'critical',
        action: 'Immediate intervention required',
        description: 'High-risk compliance situation detected',
        recommendation: 'Review all recent changes and implement immediate fixes'
      });
    }

    if (complianceTrend.trend === 'declining') {
      recommendations.push({
        priority: 'high',
        action: 'Address declining compliance trend',
        description: 'Compliance is decreasing over time',
        recommendation: 'Investigate root causes and implement corrective measures'
      });
    }

    if (avgRecentScore < 70) {
      recommendations.push({
        priority: 'high',
        action: 'Improve compliance score',
        description: `Current average score is ${Math.round(avgRecentScore)}%`,
        recommendation: 'Focus on fixing critical violations first'
      });
    }

    const confidence = Math.round((1 - (riskFactorsCount * 0.1)) * 100);

    return {
      riskLevel,
      riskFactors,
      recommendations,
      confidence: Math.max(confidence, 10)
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
      // Add proper null/undefined checks for violation properties
      if (!violation) return;
      
      const message = (violation.message || '').toLowerCase();
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

  // Build confidence scoring for predictions
  buildConfidenceScoringForPredictions(predictions, historicalData) {
    if (!predictions || predictions.length === 0) {
      return {
        confidenceScores: [],
        overallConfidence: 0,
        reliabilityMetrics: {}
      };
    }

    const confidenceScores = [];
    let totalConfidence = 0;

    predictions.forEach((prediction, index) => {
      let confidence = 0;
      const factors = [];

      // Factor 1: Historical data availability
      const dataPoints = historicalData ? historicalData.length : 0;
      const dataConfidence = Math.min(dataPoints / 10, 1) * 30; // Max 30% for data availability
      factors.push({ name: 'data_availability', score: dataConfidence, weight: 0.3 });

      // Factor 2: Prediction type confidence
      let typeConfidence = 0;
      switch (prediction.type) {
        case 'compliance_decline':
        case 'compliance_improvement':
          typeConfidence = 25;
          break;
        case 'recurring_issue':
          typeConfidence = 35;
          break;
        case 'performance_degradation':
          typeConfidence = 20;
          break;
        case 'security_risk':
          typeConfidence = 40;
          break;
        default:
          typeConfidence = 15;
      }
      factors.push({ name: 'prediction_type', score: typeConfidence, weight: 0.25 });

      // Factor 3: Historical accuracy (simplified)
      const historicalAccuracy = prediction.probability || 0.5;
      const accuracyConfidence = historicalAccuracy * 25; // Max 25% for historical accuracy
      factors.push({ name: 'historical_accuracy', score: accuracyConfidence, weight: 0.25 });

      // Factor 4: Data quality
      const dataQuality = historicalData && historicalData.length > 5 ? 20 : 10;
      factors.push({ name: 'data_quality', score: dataQuality, weight: 0.2 });

      // Calculate weighted confidence
      confidence = factors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0);
      confidence = Math.min(confidence, 100); // Cap at 100%

      confidenceScores.push({
        predictionIndex: index,
        prediction: prediction,
        confidence: Math.round(confidence),
        factors: factors,
        reliability: confidence > 70 ? 'high' : confidence > 40 ? 'medium' : 'low'
      });

      totalConfidence += confidence;
    });

    // Calculate overall confidence
    const overallConfidence = confidenceScores.length > 0 ? 
      Math.round(totalConfidence / confidenceScores.length) : 0;

    // Calculate reliability metrics
    const reliabilityMetrics = {
      highConfidencePredictions: confidenceScores.filter(cs => cs.reliability === 'high').length,
      mediumConfidencePredictions: confidenceScores.filter(cs => cs.reliability === 'medium').length,
      lowConfidencePredictions: confidenceScores.filter(cs => cs.reliability === 'low').length,
      averageConfidence: overallConfidence,
      confidenceDistribution: {
        high: confidenceScores.filter(cs => cs.confidence >= 70).length,
        medium: confidenceScores.filter(cs => cs.confidence >= 40 && cs.confidence < 70).length,
        low: confidenceScores.filter(cs => cs.confidence < 40).length
      }
    };

    return {
      confidenceScores: confidenceScores,
      overallConfidence: overallConfidence,
      reliabilityMetrics: reliabilityMetrics
    };
  }

  // Implement pattern-based suggestions
  implementPatternBasedSuggestions(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        suggestions: [],
        patterns: [],
        recommendations: []
      };
    }

    const suggestions = [];
    const patterns = [];
    const recommendations = [];

    // Analyze compliance patterns
    const complianceTrend = this.calculateTrend(historicalData, 'complianceScore');
    if (complianceTrend.trend === 'declining') {
      suggestions.push({
        type: 'compliance_improvement',
        priority: 'high',
        description: 'Compliance score is declining',
        action: 'Review recent changes and implement immediate fixes',
        expectedImpact: 'medium'
      });
    }

    // Analyze violation patterns
    const violationPatterns = this.analyzeViolationPatterns(historicalData);
    if (violationPatterns.recurringIssues && violationPatterns.recurringIssues.length > 0) {
      const topIssue = violationPatterns.recurringIssues[0];
      suggestions.push({
        type: 'violation_prevention',
        priority: 'high',
        description: `Recurring ${topIssue.type} violations`,
        action: `Implement automated checks for ${topIssue.type} violations`,
        expectedImpact: 'high'
      });
    }

    // Analyze performance patterns
    const performanceData = historicalData.filter(entry => 
      entry.metrics && typeof entry.metrics.executionTime === 'number'
    );
    
    if (performanceData.length > 0) {
      const avgExecutionTime = performanceData.reduce((sum, entry) => 
        sum + entry.metrics.executionTime, 0) / performanceData.length;
      
      if (avgExecutionTime > 5000) { // 5 seconds
        suggestions.push({
          type: 'performance_optimization',
          priority: 'medium',
          description: 'Slow compliance checking performance',
          action: 'Optimize file processing and analysis algorithms',
          expectedImpact: 'high'
        });
      }
    }

    // Generate pattern-based recommendations
    patterns.push({
      type: 'compliance_trend',
      trend: complianceTrend.trend,
      confidence: complianceTrend.confidence,
      description: `Compliance score is ${complianceTrend.trend}`
    });

    if (violationPatterns.recurringIssues) {
      patterns.push({
        type: 'violation_patterns',
        recurringIssues: violationPatterns.recurringIssues.length,
        topIssue: violationPatterns.recurringIssues[0]?.type || 'unknown',
        description: 'Recurring violation patterns detected'
      });
    }

    // Generate actionable recommendations
    recommendations.push({
      category: 'immediate',
      actions: suggestions.filter(s => s.priority === 'high').map(s => s.action),
      description: 'High-priority actions to improve compliance'
    });

    if (suggestions.filter(s => s.priority === 'medium').length > 0) {
      recommendations.push({
        category: 'medium_term',
        actions: suggestions.filter(s => s.priority === 'medium').map(s => s.action),
        description: 'Medium-priority improvements for system optimization'
      });
    }

    return {
      suggestions: suggestions.slice(0, 10), // Top 10 suggestions
      patterns: patterns,
      recommendations: recommendations
    };
  }
}

export default StatisticalAnalysis; 