/**
 * Simple Statistical Analysis Module
 * Provides basic statistical functions for analytics using vanilla JavaScript
 * No external dependencies - uses only built-in JavaScript Math functions
 */

class StatisticalAnalysis {
  constructor() {
    this.historicalData = [];
  }

  // Load historical data from compliance reports
  loadHistoricalData() {
    const fs = require('fs');
    const path = require('path');
    
    try {
      const historyPath = path.join(__dirname, '../reports/compliance-history.json');
      if (fs.existsSync(historyPath)) {
        this.historicalData = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load historical data for statistical analysis:', error.message);
      this.historicalData = [];
    }
  }

  // Calculate mean (average) of a dataset
  calculateMean(data) {
    if (!data || data.length === 0) return 0;
    const sum = data.reduce((acc, val) => acc + val, 0);
    return sum / data.length;
  }

  // Calculate median of a dataset
  calculateMedian(data) {
    if (!data || data.length === 0) return 0;
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid];
  }

  // Calculate standard deviation
  calculateStandardDeviation(data) {
    if (!data || data.length === 0) return 0;
    const mean = this.calculateMean(data);
    const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
    const variance = this.calculateMean(squaredDiffs);
    return Math.sqrt(variance);
  }

  // Calculate trend (slope) of a dataset
  calculateTrend(data) {
    if (!data || data.length < 2) return 0;
    
    const n = data.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    
    const sumX = xValues.reduce((acc, val) => acc + val, 0);
    const sumY = data.reduce((acc, val) => acc + val, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + (x * data[i]), 0);
    const sumXX = xValues.reduce((acc, x) => acc + (x * x), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // Detect outliers using IQR method
  detectOutliers(data) {
    if (!data || data.length < 4) return [];
    
    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - (1.5 * iqr);
    const upperBound = q3 + (1.5 * iqr);
    
    return data.filter(val => val < lowerBound || val > upperBound);
  }

  // Calculate correlation coefficient between two datasets
  calculateCorrelation(data1, data2) {
    if (!data1 || !data2 || data1.length !== data2.length || data1.length === 0) return 0;
    
    const mean1 = this.calculateMean(data1);
    const mean2 = this.calculateMean(data2);
    
    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;
    
    for (let i = 0; i < data1.length; i++) {
      const diff1 = data1[i] - mean1;
      const diff2 = data2[i] - mean2;
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  // Analyze violation frequency patterns
  analyzeViolationFrequency(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return { trend: 'insufficient_data', frequency: 0, pattern: 'none' };
    }

    const violationCounts = historicalData.map(entry => entry.violations || 0);
    const trend = this.calculateTrend(violationCounts);
    const mean = this.calculateMean(violationCounts);
    const outliers = this.detectOutliers(violationCounts);

    let pattern = 'stable';
    if (trend > 0.5) pattern = 'increasing';
    else if (trend < -0.5) pattern = 'decreasing';
    else if (outliers.length > 0) pattern = 'sporadic';

    return {
      trend: trend,
      averageViolations: Math.round(mean),
      pattern: pattern,
      outliers: outliers.length,
      totalEntries: violationCounts.length,
    };
  }

  // Analyze compliance score trends
  analyzeComplianceTrends(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return { trend: 'insufficient_data', improvement: 0, volatility: 0 };
    }

    const scores = historicalData.map(entry => entry.complianceScore || 0);
    const trend = this.calculateTrend(scores);
    const mean = this.calculateMean(scores);
    const stdDev = this.calculateStandardDeviation(scores);

    // Calculate improvement rate
    const recentScores = scores.slice(-5);
    const olderScores = scores.slice(-10, -5);
    const recentAvg = this.calculateMean(recentScores);
    const olderAvg = this.calculateMean(olderScores);
    const improvement = recentAvg - olderAvg;

    return {
      trend: trend,
      averageScore: Math.round(mean),
      improvement: Math.round(improvement),
      volatility: Math.round(stdDev),
      currentScore: scores[scores.length - 1] || 0,
    };
  }

  // Predict future compliance score based on trends
  predictComplianceScore(historicalData, daysAhead = 7) {
    if (!historicalData || historicalData.length < 5) {
      return { prediction: 'insufficient_data', confidence: 0 };
    }

    const scores = historicalData.map(entry => entry.complianceScore || 0);
    const trend = this.calculateTrend(scores);
    const currentScore = scores[scores.length - 1];
    
    // Simple linear prediction
    const predictedScore = currentScore + (trend * daysAhead);
    
    // Calculate confidence based on trend consistency
    const recentScores = scores.slice(-5);
    const trendConsistency = this.calculateStandardDeviation(recentScores);
    const confidence = Math.max(0, 100 - (trendConsistency * 2));

    return {
      prediction: Math.max(0, Math.min(100, Math.round(predictedScore))),
      confidence: Math.round(confidence),
      trend: trend,
      currentScore: currentScore,
    };
  }

  // Analyze standards effectiveness patterns
  analyzeStandardsEffectiveness(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return { mostEffective: [], needsImprovement: [], trends: {} };
    }

    const standardsAnalysis = {};
    
    // Analyze each standard's effectiveness over time
    historicalData.forEach(entry => {
      if (entry.metrics && entry.metrics.standardsEffectiveness) {
        Object.entries(entry.metrics.standardsEffectiveness).forEach(([standard, data]) => {
          if (!standardsAnalysis[standard]) {
            standardsAnalysis[standard] = { violationRates: [], checks: [] };
          }
          
          if (data.checks > 0) {
            const violationRate = (data.violations / data.checks) * 100;
            standardsAnalysis[standard].violationRates.push(violationRate);
            standardsAnalysis[standard].checks.push(data.checks);
          }
        });
      }
    });

    const results = {
      mostEffective: [],
      needsImprovement: [],
      trends: {},
    };

    Object.entries(standardsAnalysis).forEach(([standard, data]) => {
      if (data.violationRates.length > 0) {
        const avgViolationRate = this.calculateMean(data.violationRates);
        const trend = this.calculateTrend(data.violationRates);
        
        results.trends[standard] = {
          averageViolationRate: Math.round(avgViolationRate),
          trend: trend,
          totalChecks: data.checks.reduce((sum, val) => sum + val, 0),
        };

        if (avgViolationRate < 10) {
          results.mostEffective.push(standard);
        } else if (avgViolationRate > 30) {
          results.needsImprovement.push(standard);
        }
      }
    });

    return results;
  }

  // Generate statistical insights
  generateStatisticalInsights(historicalData) {
    const insights = [];
    
    // Analyze violation frequency
    const violationAnalysis = this.analyzeViolationFrequency(historicalData);
    if (violationAnalysis.pattern !== 'none') {
      insights.push({
        type: 'violation_pattern',
        priority: violationAnalysis.pattern === 'increasing' ? 'HIGH' : 'MEDIUM',
        message: `Violation pattern is ${violationAnalysis.pattern} (${violationAnalysis.averageViolations} avg)`,
        action: violationAnalysis.pattern === 'increasing' 
          ? 'Focus on reducing violations immediately' 
          : 'Monitor for improvement opportunities',
      });
    }

    // Analyze compliance trends
    const complianceAnalysis = this.analyzeComplianceTrends(historicalData);
    if (complianceAnalysis.improvement !== 0) {
      insights.push({
        type: 'compliance_trend',
        priority: complianceAnalysis.improvement > 0 ? 'LOW' : 'MEDIUM',
        message: `Compliance ${complianceAnalysis.improvement > 0 ? 'improving' : 'declining'} by ${Math.abs(complianceAnalysis.improvement)}%`,
        action: complianceAnalysis.improvement > 0 
          ? 'Continue current practices' 
          : 'Review and improve compliance practices',
      });
    }

    // Analyze standards effectiveness
    const standardsAnalysis = this.analyzeStandardsEffectiveness(historicalData);
    if (standardsAnalysis.needsImprovement.length > 0) {
      insights.push({
        type: 'standards_effectiveness',
        priority: 'HIGH',
        message: `Standards needing improvement: ${standardsAnalysis.needsImprovement.join(', ')}`,
        action: 'Review and update standards documentation',
      });
    }

    return insights;
  }

  // Calculate risk scores based on statistical patterns
  calculateRiskScores(historicalData) {
    const riskScores = {};
    
    if (!historicalData || historicalData.length === 0) {
      return { overallRisk: 'LOW', factors: [] };
    }

    const scores = historicalData.map(entry => entry.complianceScore || 0);
    const violations = historicalData.map(entry => entry.violations || 0);
    
    // Calculate risk factors
    const avgScore = this.calculateMean(scores);
    const scoreVolatility = this.calculateStandardDeviation(scores);
    const violationTrend = this.calculateTrend(violations);
    const recentDecline = scores.slice(-3).some(score => score < avgScore - 10);

    let overallRisk = 'LOW';
    const riskFactors = [];

    if (avgScore < 70) {
      overallRisk = 'HIGH';
      riskFactors.push('Low average compliance score');
    } else if (avgScore < 85) {
      overallRisk = 'MEDIUM';
      riskFactors.push('Moderate compliance score');
    }

    if (scoreVolatility > 15) {
      overallRisk = Math.max(overallRisk === 'HIGH' ? 'HIGH' : 'MEDIUM', overallRisk);
      riskFactors.push('High score volatility');
    }

    if (violationTrend > 2) {
      overallRisk = 'HIGH';
      riskFactors.push('Increasing violation trend');
    }

    if (recentDecline) {
      overallRisk = Math.max(overallRisk === 'HIGH' ? 'HIGH' : 'MEDIUM', overallRisk);
      riskFactors.push('Recent score decline');
    }

    return {
      overallRisk: overallRisk,
      factors: riskFactors,
      metrics: {
        averageScore: Math.round(avgScore),
        volatility: Math.round(scoreVolatility),
        violationTrend: Math.round(violationTrend * 100) / 100,
      },
    };
  }

  // Identify common violation patterns
  identifyViolationPatterns(historicalData) {
    if (!historicalData || historicalData.length === 0) {
      return {
        patterns: [],
        message: 'Insufficient data for pattern analysis',
      };
    }

    const patterns = [];
    const recentData = historicalData.slice(-10); // Analyze last 10 entries
    
    // Pattern 1: Consistent violation types
    const violationCategories = {};
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.violationCategories) {
        Object.entries(entry.metrics.violationCategories).forEach(([category, counts]) => {
          if (!violationCategories[category]) {
            violationCategories[category] = { CRITICAL: 0, WARNING: 0, total: 0 };
          }
          violationCategories[category].CRITICAL += counts.CRITICAL || 0;
          violationCategories[category].WARNING += counts.WARNING || 0;
          violationCategories[category].total += (counts.CRITICAL || 0) + (counts.WARNING || 0);
        });
      }
    });

    // Identify dominant violation categories
    Object.entries(violationCategories).forEach(([category, counts]) => {
      if (counts.total > 10) { // Threshold for pattern recognition
        patterns.push({
          type: 'DOMINANT_CATEGORY',
          category: category,
          frequency: counts.total,
          criticalRate: counts.CRITICAL / counts.total,
          description: `${category} violations are consistently high (${counts.total} total)`,
        });
      }
    });

    // Pattern 2: Compliance score trends
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const trend = this.calculateTrend(complianceScores);
    
    if (Math.abs(trend) > 5) {
      patterns.push({
        type: 'SCORE_TREND',
        direction: trend > 0 ? 'IMPROVING' : 'DECLINING',
        magnitude: Math.abs(trend),
        description: `Compliance score is ${trend > 0 ? 'improving' : 'declining'} by ${Math.abs(trend).toFixed(1)}% per run`,
      });
    }

    // Pattern 3: Violation count patterns
    const violationCounts = recentData.map(entry => entry.violations);
    const avgViolations = this.calculateMean(violationCounts);
    const violationStdDev = this.calculateStandardDeviation(violationCounts);
    
    if (violationStdDev > avgViolations * 0.5) {
      patterns.push({
        type: 'VOLATILE_VIOLATIONS',
        average: avgViolations,
        volatility: violationStdDev,
        description: `High volatility in violation counts (avg: ${avgViolations.toFixed(1)}, std dev: ${violationStdDev.toFixed(1)})`,
      });
    }

    // Pattern 4: Critical vs Warning ratio
    let totalCritical = 0;
    let totalWarnings = 0;
    
    recentData.forEach(entry => {
      if (entry.criticalViolations) totalCritical += entry.criticalViolations;
      if (entry.warnings) totalWarnings += entry.warnings;
    });
    
    const criticalRatio = totalCritical / (totalCritical + totalWarnings);
    if (criticalRatio > 0.1) { // More than 10% are critical
      patterns.push({
        type: 'HIGH_CRITICAL_RATIO',
        ratio: criticalRatio,
        criticalCount: totalCritical,
        warningCount: totalWarnings,
        description: `High ratio of critical violations (${(criticalRatio * 100).toFixed(1)}%)`,
      });
    }

    return {
      patterns: patterns,
      totalPatterns: patterns.length,
      dominantCategory: patterns.find(p => p.type === 'DOMINANT_CATEGORY')?.category || 'none',
      trendDirection: patterns.find(p => p.type === 'SCORE_TREND')?.direction || 'stable',
    };
  }

  // Enhanced: Detect recurring compliance issues
  detectRecurringComplianceIssues(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return {
        recurringIssues: [],
        message: 'Insufficient data for recurring issue analysis (need at least 3 runs)',
      };
    }

    const recurringIssues = [];
    const recentData = historicalData.slice(-5); // Analyze last 5 runs
    
    // Issue 1: Persistent low compliance scores
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const avgCompliance = this.calculateMean(complianceScores);
    const lowComplianceThreshold = 70; // Below 70% is concerning
    
    if (avgCompliance < lowComplianceThreshold) {
      recurringIssues.push({
        type: 'PERSISTENT_LOW_COMPLIANCE',
        averageScore: avgCompliance,
        threshold: lowComplianceThreshold,
        severity: avgCompliance < 50 ? 'CRITICAL' : avgCompliance < 60 ? 'HIGH' : 'MEDIUM',
        description: `Consistently low compliance scores (avg: ${avgCompliance.toFixed(1)}%)`,
        recommendation: 'Review and update coding standards, provide team training',
      });
    }

    // Issue 2: Increasing violation trends
    const violationCounts = recentData.map(entry => entry.violations);
    const violationTrend = this.calculateTrend(violationCounts);
    
    if (violationTrend > 5) { // Increasing by more than 5 violations per run
      recurringIssues.push({
        type: 'INCREASING_VIOLATIONS',
        trend: violationTrend,
        severity: violationTrend > 10 ? 'HIGH' : 'MEDIUM',
        description: `Violations are increasing by ${violationTrend.toFixed(1)} per run`,
        recommendation: 'Implement stricter code review process, add automated checks',
      });
    }

    // Issue 3: High critical violation ratio
    let totalCritical = 0;
    let totalViolations = 0;
    
    recentData.forEach(entry => {
      if (entry.criticalViolations) totalCritical += entry.criticalViolations;
      if (entry.violations) totalViolations += entry.violations;
    });
    
    const criticalRatio = totalViolations > 0 ? totalCritical / totalViolations : 0;
    if (criticalRatio > 0.15) { // More than 15% are critical
      recurringIssues.push({
        type: 'HIGH_CRITICAL_RATIO',
        ratio: criticalRatio,
        criticalCount: totalCritical,
        totalViolations: totalViolations,
        severity: criticalRatio > 0.25 ? 'CRITICAL' : 'HIGH',
        description: `High ratio of critical violations (${(criticalRatio * 100).toFixed(1)}%)`,
        recommendation: 'Prioritize fixing critical issues, implement security training',
      });
    }

    // Issue 4: Volatile compliance scores
    const complianceStdDev = this.calculateStandardDeviation(complianceScores);
    const complianceVolatility = complianceStdDev / avgCompliance;
    
    if (complianceVolatility > 0.2) { // More than 20% volatility
      recurringIssues.push({
        type: 'VOLATILE_COMPLIANCE',
        volatility: complianceVolatility,
        averageScore: avgCompliance,
        stdDev: complianceStdDev,
        severity: complianceVolatility > 0.3 ? 'HIGH' : 'MEDIUM',
        description: `High compliance score volatility (${(complianceVolatility * 100).toFixed(1)}% variation)`,
        recommendation: 'Standardize development practices, implement consistent code review',
      });
    }

    // Issue 5: Specific violation category persistence
    const violationCategories = {};
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.violationCategories) {
        Object.entries(entry.metrics.violationCategories).forEach(([category, counts]) => {
          if (!violationCategories[category]) {
            violationCategories[category] = { total: 0, runs: 0 };
          }
          violationCategories[category].total += (counts.CRITICAL || 0) + (counts.WARNING || 0);
          violationCategories[category].runs++;
        });
      }
    });

    Object.entries(violationCategories).forEach(([category, data]) => {
      const avgViolationsPerRun = data.total / data.runs;
      if (avgViolationsPerRun > 10 && data.runs >= 3) { // More than 10 violations per run on average
        recurringIssues.push({
          type: 'PERSISTENT_CATEGORY_VIOLATIONS',
          category: category,
          averagePerRun: avgViolationsPerRun,
          totalRuns: data.runs,
          severity: avgViolationsPerRun > 20 ? 'HIGH' : 'MEDIUM',
          description: `Persistent ${category} violations (${avgViolationsPerRun.toFixed(1)} avg per run)`,
          recommendation: `Focus on ${category} standards, provide specific training`,
        });
      }
    });

    return {
      recurringIssues: recurringIssues,
      totalIssues: recurringIssues.length,
      criticalIssues: recurringIssues.filter(issue => issue.severity === 'CRITICAL').length,
      highIssues: recurringIssues.filter(issue => issue.severity === 'HIGH').length,
      mediumIssues: recurringIssues.filter(issue => issue.severity === 'MEDIUM').length,
    };
  }

  // Build violation clustering analysis
  buildViolationClusteringAnalysis(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return {
        clusters: [],
        patterns: [],
        insights: [],
        message: 'Insufficient data for clustering analysis (need at least 3 runs)',
      };
    }

    const clusters = [];
    const patterns = [];
    const insights = [];
    const recentData = historicalData.slice(-10); // Analyze last 10 runs

    // Cluster 1: File-based violations
    const fileViolations = {};
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.fileProcessingTimes) {
        Object.entries(entry.metrics.fileProcessingTimes).forEach(([filePath, data]) => {
          if (data.violations && data.violations > 0) {
            const fileType = filePath.split('.').pop() || 'unknown';
            if (!fileViolations[fileType]) {
              fileViolations[fileType] = { total: 0, files: 0, avgViolations: 0 };
            }
            fileViolations[fileType].total += data.violations;
            fileViolations[fileType].files++;
          }
        });
      }
    });

    Object.entries(fileViolations).forEach(([fileType, data]) => {
      data.avgViolations = data.total / data.files;
      if (data.avgViolations > 5) { // More than 5 violations per file on average
        clusters.push({
          type: 'FILE_TYPE_CLUSTER',
          category: fileType,
          averageViolations: data.avgViolations,
          totalFiles: data.files,
          totalViolations: data.total,
          severity: data.avgViolations > 15 ? 'HIGH' : 'MEDIUM',
          description: `${fileType} files have high violation rates (${data.avgViolations.toFixed(1)} avg per file)`,
          recommendation: `Focus on ${fileType} file standards, provide specific linting rules`,
        });
      }
    });

    // Cluster 2: Time-based violation patterns
    const timePatterns = {};
    recentData.forEach((entry, index) => {
      const runNumber = recentData.length - index; // Most recent = 1
      if (entry.violations) {
        timePatterns[runNumber] = entry.violations;
      }
    });

    const violationTrend = this.calculateTrend(Object.values(timePatterns));
    if (Math.abs(violationTrend) > 2) {
      patterns.push({
        type: 'TIME_BASED_PATTERN',
        trend: violationTrend > 0 ? 'INCREASING' : 'DECREASING',
        magnitude: Math.abs(violationTrend),
        description: `Violations are ${violationTrend > 0 ? 'increasing' : 'decreasing'} over time`,
        recommendation: violationTrend > 0 
          ? 'Implement stricter review process' 
          : 'Continue current improvement practices',
      });
    }

    // Cluster 3: Severity-based clustering
    let totalCritical = 0;
    let totalWarnings = 0;
    let totalViolations = 0;

    recentData.forEach(entry => {
      if (entry.criticalViolations) totalCritical += entry.criticalViolations;
      if (entry.warnings) totalWarnings += entry.warnings;
      if (entry.violations) totalViolations += entry.violations;
    });

    const criticalRatio = totalViolations > 0 ? totalCritical / totalViolations : 0;
    const warningRatio = totalViolations > 0 ? totalWarnings / totalViolations : 0;

    if (criticalRatio > 0.1) {
      clusters.push({
        type: 'SEVERITY_CLUSTER',
        category: 'CRITICAL',
        ratio: criticalRatio,
        count: totalCritical,
        severity: criticalRatio > 0.2 ? 'CRITICAL' : 'HIGH',
        description: `High ratio of critical violations (${(criticalRatio * 100).toFixed(1)}%)`,
        recommendation: 'Prioritize critical issue fixes, implement security training',
      });
    }

    if (warningRatio > 0.5) {
      clusters.push({
        type: 'SEVERITY_CLUSTER',
        category: 'WARNING',
        ratio: warningRatio,
        count: totalWarnings,
        severity: 'MEDIUM',
        description: `High ratio of warning violations (${(warningRatio * 100).toFixed(1)}%)`,
        recommendation: 'Review warning patterns, improve code quality standards',
      });
    }

    // Cluster 4: Compliance score clustering
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const avgCompliance = this.calculateMean(complianceScores);
    const complianceStdDev = this.calculateStandardDeviation(complianceScores);

    if (complianceStdDev > 10) {
      clusters.push({
        type: 'COMPLIANCE_CLUSTER',
        category: 'VOLATILE',
        averageScore: avgCompliance,
        stdDev: complianceStdDev,
        severity: complianceStdDev > 20 ? 'HIGH' : 'MEDIUM',
        description: `High compliance score volatility (std dev: ${complianceStdDev.toFixed(1)})`,
        recommendation: 'Standardize development practices, implement consistent review process',
      });
    }

    // Generate insights from clusters
    if (clusters.length > 0) {
      const highSeverityClusters = clusters.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL');
      if (highSeverityClusters.length > 0) {
        insights.push({
          type: 'HIGH_SEVERITY_CLUSTERS',
          priority: 'HIGH',
          message: `${highSeverityClusters.length} high-severity violation clusters detected`,
          action: 'Address high-severity clusters immediately',
        });
      }

      const fileTypeClusters = clusters.filter(c => c.type === 'FILE_TYPE_CLUSTER');
      if (fileTypeClusters.length > 0) {
        insights.push({
          type: 'FILE_TYPE_INSIGHT',
          priority: 'MEDIUM',
          message: `${fileTypeClusters.length} file types with high violation rates`,
          action: 'Focus on improving standards for problematic file types',
        });
      }
    }

    // Pattern insights
    if (patterns.length > 0) {
      const increasingPatterns = patterns.filter(p => p.trend === 'INCREASING');
      if (increasingPatterns.length > 0) {
        insights.push({
          type: 'TREND_INSIGHT',
          priority: 'HIGH',
          message: 'Detected increasing violation trends',
          action: 'Implement immediate intervention strategies',
        });
      }
    }

    return {
      clusters: clusters,
      patterns: patterns,
      insights: insights,
      totalClusters: clusters.length,
      totalPatterns: patterns.length,
      totalInsights: insights.length,
      highSeverityClusters: clusters.filter(c => c.severity === 'HIGH' || c.severity === 'CRITICAL').length,
      fileTypeClusters: clusters.filter(c => c.type === 'FILE_TYPE_CLUSTER').length,
      severityClusters: clusters.filter(c => c.type === 'SEVERITY_CLUSTER').length,
    };
  }

  // Predict compliance issues based on patterns
  predictComplianceIssues(historicalData) {
    if (!historicalData || historicalData.length < 5) {
      return {
        predictions: [],
        confidence: 0,
        message: 'Insufficient data for issue prediction (need at least 5 runs)',
      };
    }

    const predictions = [];
    const recentData = historicalData.slice(-10); // Analyze last 10 runs
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const violationCounts = recentData.map(entry => entry.violations || 0);
    const criticalViolations = recentData.map(entry => entry.criticalViolations || 0);

    // Prediction 1: Compliance score trend prediction
    const scoreTrend = this.calculateTrend(complianceScores);
    const currentScore = complianceScores[complianceScores.length - 1];
    const scoreStdDev = this.calculateStandardDeviation(complianceScores);
    
    if (Math.abs(scoreTrend) > 2) {
      const predictedScore = currentScore + (scoreTrend * 3); // Predict 3 runs ahead
      const confidence = Math.max(0, 100 - (scoreStdDev * 2));
      
      predictions.push({
        type: 'COMPLIANCE_SCORE_PREDICTION',
        issue: predictedScore < 70 ? 'LOW_COMPLIANCE_RISK' : 'STABLE_COMPLIANCE',
        probability: predictedScore < 70 ? 'HIGH' : 'LOW',
        confidence: Math.round(confidence),
        description: `Compliance score predicted to be ${Math.round(predictedScore)}% in 3 runs`,
        recommendation: predictedScore < 70 
          ? 'Implement immediate compliance improvement measures' 
          : 'Continue current practices',
      });
    }

    // Prediction 2: Violation count trend prediction
    const violationTrend = this.calculateTrend(violationCounts);
    const currentViolations = violationCounts[violationCounts.length - 1];
    const violationStdDev = this.calculateStandardDeviation(violationCounts);
    
    if (Math.abs(violationTrend) > 5) {
      const predictedViolations = currentViolations + (violationTrend * 3);
      const confidence = Math.max(0, 100 - (violationStdDev * 2));
      
      predictions.push({
        type: 'VIOLATION_COUNT_PREDICTION',
        issue: predictedViolations > currentViolations * 1.2 ? 'INCREASING_VIOLATIONS' : 'DECREASING_VIOLATIONS',
        probability: predictedViolations > currentViolations * 1.2 ? 'HIGH' : 'MEDIUM',
        confidence: Math.round(confidence),
        description: `Violations predicted to be ${Math.round(predictedViolations)} in 3 runs`,
        recommendation: predictedViolations > currentViolations * 1.2
          ? 'Implement stricter code review and automated checks'
          : 'Continue current improvement practices',
      });
    }

    // Prediction 3: Critical violation risk prediction
    const criticalTrend = this.calculateTrend(criticalViolations);
    const currentCritical = criticalViolations[criticalViolations.length - 1];
    const criticalStdDev = this.calculateStandardDeviation(criticalViolations);
    
    if (criticalTrend > 0 || currentCritical > 5) {
      const predictedCritical = currentCritical + (criticalTrend * 3);
      const confidence = Math.max(0, 100 - (criticalStdDev * 3));
      
      predictions.push({
        type: 'CRITICAL_VIOLATION_PREDICTION',
        issue: predictedCritical > 10 ? 'HIGH_CRITICAL_RISK' : 'MODERATE_CRITICAL_RISK',
        probability: predictedCritical > 10 ? 'HIGH' : 'MEDIUM',
        confidence: Math.round(confidence),
        description: `Critical violations predicted to be ${Math.round(predictedCritical)} in 3 runs`,
        recommendation: predictedCritical > 10
          ? 'Immediate security review and critical issue prioritization required'
          : 'Monitor critical violations and implement preventive measures',
      });
    }

    // Prediction 4: File type violation prediction
    const fileTypeViolations = {};
    recentData.forEach(entry => {
      if (entry.metrics && entry.metrics.fileProcessingTimes) {
        Object.entries(entry.metrics.fileProcessingTimes).forEach(([filePath, data]) => {
          if (data.violations && data.violations > 0) {
            const fileType = filePath.split('.').pop() || 'unknown';
            if (!fileTypeViolations[fileType]) {
              fileTypeViolations[fileType] = [];
            }
            fileTypeViolations[fileType].push(data.violations);
          }
        });
      }
    });

    Object.entries(fileTypeViolations).forEach(([fileType, violations]) => {
      if (violations.length >= 3) {
        const trend = this.calculateTrend(violations);
        const avgViolations = this.calculateMean(violations);
        const predictedViolations = avgViolations + (trend * 3);
        
        if (predictedViolations > avgViolations * 1.3) {
          predictions.push({
            type: 'FILE_TYPE_VIOLATION_PREDICTION',
            issue: 'INCREASING_FILE_TYPE_VIOLATIONS',
            probability: 'MEDIUM',
            confidence: 75,
            description: `${fileType} files predicted to have ${Math.round(predictedViolations)} violations in 3 runs`,
            recommendation: `Focus on ${fileType} file standards and provide specific training`,
          });
        }
      }
    });

    // Prediction 5: Standards effectiveness prediction
    const standardsAnalysis = this.analyzeStandardsEffectiveness(historicalData);
    if (standardsAnalysis.needsImprovement.length > 0) {
      predictions.push({
        type: 'STANDARDS_EFFECTIVENESS_PREDICTION',
        issue: 'STANDARDS_DETERIORATION',
        probability: 'HIGH',
        confidence: 85,
        description: `${standardsAnalysis.needsImprovement.length} standards showing deterioration`,
        recommendation: 'Review and update standards documentation, provide team training',
      });
    }

    // Calculate overall confidence
    const totalConfidence = predictions.reduce((sum, pred) => sum + pred.confidence, 0);
    const overallConfidence = predictions.length > 0 ? Math.round(totalConfidence / predictions.length) : 0;

    return {
      predictions: predictions,
      totalPredictions: predictions.length,
      highProbabilityPredictions: predictions.filter(p => p.probability === 'HIGH').length,
      mediumProbabilityPredictions: predictions.filter(p => p.probability === 'MEDIUM').length,
      lowProbabilityPredictions: predictions.filter(p => p.probability === 'LOW').length,
      confidence: overallConfidence,
      criticalPredictions: predictions.filter(p => p.issue.includes('CRITICAL') || p.issue.includes('HIGH')).length,
    };
  }
  
  // Enhanced: Create simple forecasting using historical data
  createSimpleForecasting(historicalData, forecastPeriods = 3) {
    if (!historicalData || historicalData.length < 5) {
      return {
        forecasts: [],
        confidence: 'LOW',
        message: 'Insufficient historical data for forecasting (minimum 5 data points required)',
      };
    }

    const forecasts = [];
    const recentData = historicalData.slice(-Math.min(10, historicalData.length));

    // Forecast compliance scores
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const scoreForecast = this.generateLinearForecast(complianceScores, forecastPeriods);
    
    forecasts.push({
      type: 'COMPLIANCE_SCORE_FORECAST',
      metric: 'Compliance Score',
      currentValue: complianceScores[complianceScores.length - 1],
      forecast: scoreForecast,
      trend: this.calculateTrend(complianceScores),
      confidence: this.calculateForecastConfidence(complianceScores),
      recommendation: this.generateForecastRecommendation(scoreForecast, 'compliance score'),
    });

    // Forecast violation counts
    const violationCounts = recentData.map(entry => entry.violations);
    const violationForecast = this.generateLinearForecast(violationCounts, forecastPeriods);
    
    forecasts.push({
      type: 'VIOLATION_COUNT_FORECAST',
      metric: 'Violation Count',
      currentValue: violationCounts[violationCounts.length - 1],
      forecast: violationForecast,
      trend: this.calculateTrend(violationCounts),
      confidence: this.calculateForecastConfidence(violationCounts),
      recommendation: this.generateForecastRecommendation(violationForecast, 'violation count'),
    });

    // Forecast critical violations
    const criticalViolations = recentData.map(entry => entry.criticalViolations);
    const criticalForecast = this.generateLinearForecast(criticalViolations, forecastPeriods);
    
    forecasts.push({
      type: 'CRITICAL_VIOLATION_FORECAST',
      metric: 'Critical Violations',
      currentValue: criticalViolations[criticalViolations.length - 1],
      forecast: criticalForecast,
      trend: this.calculateTrend(criticalViolations),
      confidence: this.calculateForecastConfidence(criticalViolations),
      recommendation: this.generateForecastRecommendation(criticalForecast, 'critical violations'),
    });

    // Forecast execution time
    const executionTimes = recentData.map(entry => entry.metrics?.executionTime || 0);
    const executionForecast = this.generateLinearForecast(executionTimes, forecastPeriods);
    
    forecasts.push({
      type: 'EXECUTION_TIME_FORECAST',
      metric: 'Execution Time (ms)',
      currentValue: executionTimes[executionTimes.length - 1],
      forecast: executionForecast,
      trend: this.calculateTrend(executionTimes),
      confidence: this.calculateForecastConfidence(executionTimes),
      recommendation: this.generateForecastRecommendation(executionForecast, 'execution time'),
    });

    // Forecast file processing performance
    const fileProcessingTimes = recentData.map(entry => entry.metrics?.averageFileProcessingTime || 0);
    const fileProcessingForecast = this.generateLinearForecast(fileProcessingTimes, forecastPeriods);
    
    forecasts.push({
      type: 'FILE_PROCESSING_FORECAST',
      metric: 'Average File Processing Time (ms)',
      currentValue: fileProcessingTimes[fileProcessingTimes.length - 1],
      forecast: fileProcessingForecast,
      trend: this.calculateTrend(fileProcessingTimes),
      confidence: this.calculateForecastConfidence(fileProcessingTimes),
      recommendation: this.generateForecastRecommendation(fileProcessingForecast, 'file processing time'),
    });

    return {
      forecasts,
      confidence: this.calculateOverallForecastConfidence(forecasts),
      message: `Generated ${forecasts.length} forecasts for ${forecastPeriods} periods ahead`,
      dataPoints: recentData.length,
      forecastPeriods,
    };
  }
  
  // Generate linear forecast using simple linear regression
  generateLinearForecast(data, periods) {
    if (data.length < 2) return [];
    
    const n = data.length;
    const xValues = Array.from({ length: n }, (_, i) => i);
    
    // Calculate linear regression parameters
    const sumX = xValues.reduce((acc, val) => acc + val, 0);
    const sumY = data.reduce((acc, val) => acc + val, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + (x * data[i]), 0);
    const sumXX = xValues.reduce((acc, x) => acc + (x * x), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate forecasts
    const forecasts = [];
    for (let i = 1; i <= periods; i++) {
      const forecastValue = intercept + slope * (n + i - 1);
      forecasts.push(Math.max(0, Math.round(forecastValue))); // Ensure non-negative values
    }
    
    return forecasts;
  }
  
  // Calculate forecast confidence based on data consistency
  calculateForecastConfidence(data) {
    if (data.length < 3) return 'LOW';
    
    const stdDev = this.calculateStandardDeviation(data);
    const mean = this.calculateMean(data);
    const coefficientOfVariation = stdDev / mean;
    
    if (coefficientOfVariation < 0.1) return 'HIGH';
    if (coefficientOfVariation < 0.3) return 'MEDIUM';
    return 'LOW';
  }
  
  // Generate forecast recommendations
  generateForecastRecommendation(forecast, metricName) {
    const trend = forecast[forecast.length - 1] - forecast[0];
    const improvement = trend < 0;
    
    if (improvement) {
      return `Forecast shows improvement in ${metricName}. Continue current practices.`;
    } else {
      return `Forecast shows potential degradation in ${metricName}. Consider preventive measures.`;
    }
  }
  
  // Calculate overall forecast confidence
  calculateOverallForecastConfidence(forecasts) {
    const confidences = forecasts.map(f => f.confidence);
    const highConfidence = confidences.filter(c => c === 'HIGH').length;
    const mediumConfidence = confidences.filter(c => c === 'MEDIUM').length;
    
    if (highConfidence >= forecasts.length * 0.7) return 'HIGH';
    if (highConfidence + mediumConfidence >= forecasts.length * 0.7) return 'MEDIUM';
    return 'LOW';
  }
  
  // Enhanced: Implement risk assessment based on trends
  implementRiskAssessmentBasedOnTrends(historicalData) {
    if (!historicalData || historicalData.length < 5) {
      return {
        message: 'Insufficient data for trend-based risk assessment (minimum 5 data points required)',
        riskAssessment: {},
        trendAnalysis: {},
        riskPredictions: [],
        mitigationStrategies: [],
      };
    }

    const recentData = historicalData.slice(-Math.min(10, historicalData.length));
    const riskAssessment = {};
    const trendAnalysis = {};
    const riskPredictions = [];
    const mitigationStrategies = [];

    // Analyze compliance score trends and risks
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const scoreTrend = this.calculateTrend(complianceScores);
    const scoreVolatility = this.calculateStandardDeviation(complianceScores) / this.calculateMean(complianceScores);
    
    trendAnalysis.complianceScore = {
      trend: scoreTrend,
      trendDirection: scoreTrend > 0 ? 'IMPROVING' : scoreTrend < 0 ? 'DECLINING' : 'STABLE',
      volatility: Math.round(scoreVolatility * 100),
      riskLevel: this.calculateTrendBasedRisk(scoreTrend, scoreVolatility, complianceScores[complianceScores.length - 1]),
    };

    // Analyze violation count trends and risks
    const violationCounts = recentData.map(entry => entry.violations);
    const violationTrend = this.calculateTrend(violationCounts);
    const violationVolatility = this.calculateStandardDeviation(violationCounts) / this.calculateMean(violationCounts);
    
    trendAnalysis.violationCount = {
      trend: violationTrend,
      trendDirection: violationTrend > 0 ? 'INCREASING' : violationTrend < 0 ? 'DECREASING' : 'STABLE',
      volatility: Math.round(violationVolatility * 100),
      riskLevel: this.calculateTrendBasedRisk(violationTrend, violationVolatility, violationCounts[violationCounts.length - 1]),
    };

    // Analyze critical violation trends and risks
    const criticalViolations = recentData.map(entry => entry.criticalViolations);
    const criticalTrend = this.calculateTrend(criticalViolations);
    const criticalVolatility = this.calculateStandardDeviation(criticalViolations) / this.calculateMean(criticalViolations);
    
    trendAnalysis.criticalViolations = {
      trend: criticalTrend,
      trendDirection: criticalTrend > 0 ? 'INCREASING' : criticalTrend < 0 ? 'DECREASING' : 'STABLE',
      volatility: Math.round(criticalVolatility * 100),
      riskLevel: this.calculateTrendBasedRisk(criticalTrend, criticalVolatility, criticalViolations[criticalViolations.length - 1]),
    };

    // Generate risk predictions based on trends
    if (trendAnalysis.complianceScore.riskLevel === 'HIGH') {
      riskPredictions.push({
        type: 'COMPLIANCE_SCORE_RISK',
        risk: 'HIGH',
        probability: 'HIGH',
        description: 'Compliance score showing declining trend with high volatility',
        impact: 'CRITICAL',
        timeframe: 'IMMEDIATE',
        mitigation: 'Implement comprehensive compliance review and team training',
      });
    }

    if (trendAnalysis.violationCount.riskLevel === 'HIGH') {
      riskPredictions.push({
        type: 'VIOLATION_COUNT_RISK',
        risk: 'HIGH',
        probability: 'HIGH',
        description: 'Violation count showing increasing trend',
        impact: 'HIGH',
        timeframe: 'SHORT_TERM',
        mitigation: 'Implement stricter code review and automated compliance checks',
      });
    }

    if (trendAnalysis.criticalViolations.riskLevel === 'HIGH') {
      riskPredictions.push({
        type: 'CRITICAL_VIOLATION_RISK',
        risk: 'CRITICAL',
        probability: 'HIGH',
        description: 'Critical violations showing increasing trend',
        impact: 'CRITICAL',
        timeframe: 'IMMEDIATE',
        mitigation: 'Immediate security review and critical issue prioritization required',
      });
    }

    // Generate mitigation strategies
    const highRiskAreas = Object.entries(trendAnalysis).filter(([area, data]) => data.riskLevel === 'HIGH');
    
    if (highRiskAreas.length > 0) {
      mitigationStrategies.push({
        priority: 'IMMEDIATE',
        strategy: 'Comprehensive Risk Mitigation',
        actions: [
          'Implement immediate compliance review',
          'Establish stricter code review process',
          'Add automated compliance checks to CI/CD',
          'Provide team training on standards',
          'Set up monitoring for risk indicators',
        ],
        expectedOutcome: 'Reduce risk levels within 2-4 weeks',
        successMetrics: ['Reduced violation count', 'Improved compliance score', 'Decreased critical violations'],
      });
    }

    // Calculate overall risk assessment
    const riskLevels = Object.values(trendAnalysis).map(data => data.riskLevel);
    const highRiskCount = riskLevels.filter(level => level === 'HIGH').length;
    const overallRiskLevel = highRiskCount >= 2 ? 'HIGH' : highRiskCount === 1 ? 'MEDIUM' : 'LOW';

    riskAssessment.overallRisk = {
      level: overallRiskLevel,
      score: Math.round((highRiskCount / riskLevels.length) * 100),
      trendAnalysis: trendAnalysis,
      riskPredictions: riskPredictions,
      mitigationStrategies: mitigationStrategies,
    };

    return {
      riskAssessment,
      trendAnalysis,
      riskPredictions,
      mitigationStrategies,
      dataPoints: recentData.length,
      confidence: this.calculateRiskAssessmentConfidence(recentData),
    };
  }
  
  // Calculate trend-based risk level
  calculateTrendBasedRisk(trend, volatility, currentValue) {
    const trendRisk = trend < 0 ? Math.abs(trend) * 10 : 0;
    const volatilityRisk = volatility > 0.3 ? 30 : volatility > 0.1 ? 15 : 0;
    const valueRisk = currentValue < 50 ? 40 : currentValue < 70 ? 20 : 0;
    
    const totalRisk = trendRisk + volatilityRisk + valueRisk;
    
    if (totalRisk > 60) return 'HIGH';
    if (totalRisk > 30) return 'MEDIUM';
    return 'LOW';
  }
  
  // Calculate risk assessment confidence
  calculateRiskAssessmentConfidence(data) {
    if (data.length < 5) return 'LOW';
    if (data.length < 8) return 'MEDIUM';
    return 'HIGH';
  }
  
  // Enhanced: Build confidence scoring for predictions
  buildConfidenceScoringForPredictions(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return {
        message: 'Insufficient data for confidence scoring (minimum 3 data points required)',
        confidenceScores: {},
        predictionReliability: 'LOW',
        recommendations: [],
      };
    }

    const recentData = historicalData.slice(-Math.min(10, historicalData.length));
    const confidenceScores = {};
    const recommendations = [];

    // Calculate confidence for compliance score predictions
    const complianceScores = recentData.map(entry => entry.complianceScore);
    const scoreConfidence = this.calculatePredictionConfidence(complianceScores, 'compliance score');
    
    confidenceScores.complianceScore = {
      confidence: scoreConfidence.level,
      score: scoreConfidence.score,
      factors: scoreConfidence.factors,
      reliability: scoreConfidence.reliability,
    };

    // Calculate confidence for violation count predictions
    const violationCounts = recentData.map(entry => entry.violations);
    const violationConfidence = this.calculatePredictionConfidence(violationCounts, 'violation count');
    
    confidenceScores.violationCount = {
      confidence: violationConfidence.level,
      score: violationConfidence.score,
      factors: violationConfidence.factors,
      reliability: violationConfidence.reliability,
    };

    // Calculate confidence for critical violation predictions
    const criticalViolations = recentData.map(entry => entry.criticalViolations);
    const criticalConfidence = this.calculatePredictionConfidence(criticalViolations, 'critical violations');
    
    confidenceScores.criticalViolations = {
      confidence: criticalConfidence.level,
      score: criticalConfidence.score,
      factors: criticalConfidence.factors,
      reliability: criticalConfidence.reliability,
    };

    // Calculate confidence for execution time predictions
    const executionTimes = recentData.map(entry => entry.metrics?.executionTime || 0);
    const executionConfidence = this.calculatePredictionConfidence(executionTimes, 'execution time');
    
    confidenceScores.executionTime = {
      confidence: executionConfidence.level,
      score: executionConfidence.score,
      factors: executionConfidence.factors,
      reliability: executionConfidence.reliability,
    };

    // Generate recommendations based on confidence levels
    Object.entries(confidenceScores).forEach(([metric, data]) => {
      if (data.confidence === 'LOW') {
        recommendations.push(`Low confidence in ${metric} predictions - collect more data`);
      } else if (data.confidence === 'MEDIUM') {
        recommendations.push(`Medium confidence in ${metric} predictions - consider with caution`);
      } else {
        recommendations.push(`High confidence in ${metric} predictions - reliable for decision making`);
      }
    });

    // Calculate overall prediction reliability
    const confidenceLevels = Object.values(confidenceScores).map(data => data.confidence);
    const highConfidenceCount = confidenceLevels.filter(level => level === 'HIGH').length;
    const overallReliability = highConfidenceCount >= confidenceLevels.length * 0.7 ? 'HIGH' : 
      highConfidenceCount >= confidenceLevels.length * 0.4 ? 'MEDIUM' : 'LOW';

    return {
      confidenceScores,
      predictionReliability: overallReliability,
      recommendations,
      dataPoints: recentData.length,
      overallConfidenceScore: Math.round(this.calculateMean(Object.values(confidenceScores).map(c => c.score))),
    };
  }
  
  // Calculate prediction confidence for a specific metric
  calculatePredictionConfidence(data, metricName) {
    if (data.length < 3) {
      return {
        level: 'LOW',
        score: 0,
        factors: ['Insufficient data points'],
        reliability: 'UNRELIABLE',
      };
    }

    const factors = [];
    let confidenceScore = 100;

    // Factor 1: Data consistency (lower standard deviation = higher confidence)
    const stdDev = this.calculateStandardDeviation(data);
    const mean = this.calculateMean(data);
    const coefficientOfVariation = stdDev / mean;
    
    if (coefficientOfVariation > 0.5) {
      confidenceScore -= 30;
      factors.push('High data volatility');
    } else if (coefficientOfVariation > 0.2) {
      confidenceScore -= 15;
      factors.push('Moderate data volatility');
    } else {
      factors.push('Low data volatility');
    }

    // Factor 2: Data points (more data = higher confidence)
    if (data.length < 5) {
      confidenceScore -= 25;
      factors.push('Limited data points');
    } else if (data.length < 8) {
      confidenceScore -= 10;
      factors.push('Moderate data points');
    } else {
      factors.push('Sufficient data points');
    }

    // Factor 3: Trend consistency (consistent trends = higher confidence)
    const trend = this.calculateTrend(data);
    const trendConsistency = this.calculateTrendConsistency(data);
    
    if (trendConsistency < 0.7) {
      confidenceScore -= 20;
      factors.push('Inconsistent trends');
    } else {
      factors.push('Consistent trends');
    }

    // Factor 4: Outlier presence (fewer outliers = higher confidence)
    const outliers = this.detectOutliers(data);
    const outlierRatio = outliers.length / data.length;
    
    if (outlierRatio > 0.3) {
      confidenceScore -= 20;
      factors.push('High outlier presence');
    } else if (outlierRatio > 0.1) {
      confidenceScore -= 10;
      factors.push('Moderate outlier presence');
    } else {
      factors.push('Low outlier presence');
    }

    // Determine confidence level
    let confidenceLevel = 'LOW';
    if (confidenceScore >= 80) confidenceLevel = 'HIGH';
    else if (confidenceScore >= 60) confidenceLevel = 'MEDIUM';

    // Determine reliability
    let reliability = 'UNRELIABLE';
    if (confidenceScore >= 80) reliability = 'RELIABLE';
    else if (confidenceScore >= 60) reliability = 'MODERATELY_RELIABLE';

    return {
      level: confidenceLevel,
      score: Math.max(0, confidenceScore),
      factors,
      reliability,
    };
  }
  
  // Calculate trend consistency
  calculateTrendConsistency(data) {
    if (data.length < 4) return 0;
    
    const segments = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, segments);
    const secondHalf = data.slice(-segments);
    
    const firstTrend = this.calculateTrend(firstHalf);
    const secondTrend = this.calculateTrend(secondHalf);
    
    // Calculate similarity between trends
    const trendSimilarity = 1 - Math.abs(firstTrend - secondTrend) / Math.max(Math.abs(firstTrend), Math.abs(secondTrend), 1);
    return Math.max(0, trendSimilarity);
  }

  // Enhanced: Implement pattern-based suggestions
  implementPatternBasedSuggestions(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return {
        message: 'Insufficient data for pattern-based suggestions (minimum 3 data points required)',
        suggestions: [],
        patternAnalysis: {},
        priorityLevels: {},
      };
    }

    const recentData = historicalData.slice(-Math.min(15, historicalData.length));
    const suggestions = [];
    const patternAnalysis = {};
    const priorityLevels = { HIGH: [], MEDIUM: [], LOW: [] };

    // Analyze context-aware patterns
    const contextPatterns = this.analyzeContextAwarePatterns(recentData);
    patternAnalysis.contextPatterns = contextPatterns;

    // Analyze historical trend patterns
    const trendPatterns = this.analyzeHistoricalTrendPatterns(recentData);
    patternAnalysis.trendPatterns = trendPatterns;

    // Analyze file type patterns
    const fileTypePatterns = this.analyzeFileTypePatterns(recentData);
    patternAnalysis.fileTypePatterns = fileTypePatterns;

    // Analyze severity patterns
    const severityPatterns = this.analyzeSeverityPatterns(recentData);
    patternAnalysis.severityPatterns = severityPatterns;

    // Analyze recurring pattern detection
    const recurringPatterns = this.analyzeRecurringPatterns(recentData);
    patternAnalysis.recurringPatterns = recurringPatterns;

    // Generate suggestions based on patterns
    suggestions.push(...this.generateContextBasedSuggestions(contextPatterns));
    suggestions.push(...this.generateTrendBasedSuggestions(trendPatterns));
    suggestions.push(...this.generateFileTypeBasedSuggestions(fileTypePatterns));
    suggestions.push(...this.generateSeverityBasedSuggestions(severityPatterns));
    suggestions.push(...this.generateRecurringPatternSuggestions(recurringPatterns));

    // Categorize suggestions by priority
    suggestions.forEach(suggestion => {
      if (suggestion.impact === 'HIGH' || suggestion.urgency === 'IMMEDIATE') {
        priorityLevels.HIGH.push(suggestion);
      } else if (suggestion.impact === 'MEDIUM' || suggestion.urgency === 'SHORT_TERM') {
        priorityLevels.MEDIUM.push(suggestion);
      } else {
        priorityLevels.LOW.push(suggestion);
      }
    });

    return {
      suggestions,
      patternAnalysis,
      priorityLevels,
      totalSuggestions: suggestions.length,
      highPriorityCount: priorityLevels.HIGH.length,
      mediumPriorityCount: priorityLevels.MEDIUM.length,
      lowPriorityCount: priorityLevels.LOW.length,
      dataPoints: recentData.length,
    };
  }

  // Analyze context-aware patterns
  analyzeContextAwarePatterns(data) {
    const patterns = {
      complianceDecline: false,
      violationSpikes: false,
      criticalIssueTrends: false,
      performanceDegradation: false,
      standardsAdoption: false,
    };

    const complianceScores = data.map(entry => entry.complianceScore);
    const violationCounts = data.map(entry => entry.violations);
    const criticalViolations = data.map(entry => entry.criticalViolations);

    // Detect compliance decline patterns
    const recentScores = complianceScores.slice(-3);
    if (recentScores.length >= 3 && recentScores[0] > recentScores[2]) {
      patterns.complianceDecline = true;
    }

    // Detect violation spikes
    const avgViolations = this.calculateMean(violationCounts);
    const recentViolations = violationCounts.slice(-2);
    if (recentViolations.some(v => v > avgViolations * 1.5)) {
      patterns.violationSpikes = true;
    }

    // Detect critical issue trends
    const criticalTrend = this.calculateTrend(criticalViolations);
    if (criticalTrend > 0) {
      patterns.criticalIssueTrends = true;
    }

    // Detect performance degradation
    const executionTimes = data.map(entry => entry.metrics?.executionTime || 0);
    const avgExecutionTime = this.calculateMean(executionTimes);
    const recentExecutionTimes = executionTimes.slice(-2);
    if (recentExecutionTimes.some(t => t > avgExecutionTime * 1.3)) {
      patterns.performanceDegradation = true;
    }

    return patterns;
  }

  // Analyze historical trend patterns
  analyzeHistoricalTrendPatterns(data) {
    const patterns = {
      improvingTrend: false,
      decliningTrend: false,
      stableTrend: false,
      cyclicalPattern: false,
      seasonalPattern: false,
    };

    const complianceScores = data.map(entry => entry.complianceScore);
    const trend = this.calculateTrend(complianceScores);
    const volatility = this.calculateStandardDeviation(complianceScores) / this.calculateMean(complianceScores);

    if (trend > 0.5) {
      patterns.improvingTrend = true;
    } else if (trend < -0.5) {
      patterns.decliningTrend = true;
    } else {
      patterns.stableTrend = true;
    }

    // Detect cyclical patterns (simplified)
    if (volatility > 0.2 && data.length >= 6) {
      patterns.cyclicalPattern = true;
    }

    return patterns;
  }

  // Analyze file type patterns
  analyzeFileTypePatterns(data) {
    const patterns = {
      javaFileIssues: false,
      typescriptFileIssues: false,
      markdownFileIssues: false,
      configurationFileIssues: false,
      testFileIssues: false,
    };

    // Analyze based on file processing metrics if available
    data.forEach(entry => {
      if (entry.metrics?.fileTypeMetrics) {
        const fileMetrics = entry.metrics.fileTypeMetrics;
        
        if (fileMetrics.java && fileMetrics.java.violations > 0) {
          patterns.javaFileIssues = true;
        }
        if (fileMetrics.typescript && fileMetrics.typescript.violations > 0) {
          patterns.typescriptFileIssues = true;
        }
        if (fileMetrics.markdown && fileMetrics.markdown.violations > 0) {
          patterns.markdownFileIssues = true;
        }
      }
    });

    return patterns;
  }

  // Analyze severity patterns
  analyzeSeverityPatterns(data) {
    const patterns = {
      highSeverityIssues: false,
      mediumSeverityIssues: false,
      lowSeverityIssues: false,
      criticalIssues: false,
      mixedSeverityIssues: false,
    };

    data.forEach(entry => {
      if (entry.criticalViolations > 0) {
        patterns.criticalIssues = true;
      }
      if (entry.violations > 10) {
        patterns.highSeverityIssues = true;
      } else if (entry.violations > 5) {
        patterns.mediumSeverityIssues = true;
      } else if (entry.violations > 0) {
        patterns.lowSeverityIssues = true;
      }
    });

    const severityCounts = [
      patterns.criticalIssues,
      patterns.highSeverityIssues,
      patterns.mediumSeverityIssues,
      patterns.lowSeverityIssues,
    ].filter(Boolean).length;

    if (severityCounts > 2) {
      patterns.mixedSeverityIssues = true;
    }

    return patterns;
  }

  // Analyze recurring patterns
  analyzeRecurringPatterns(data) {
    const patterns = {
      recurringViolations: false,
      recurringPerformanceIssues: false,
      recurringComplianceIssues: false,
      recurringCriticalIssues: false,
      recurringFileTypeIssues: false,
    };

    // Detect recurring violations
    const violationCounts = data.map(entry => entry.violations);
    const avgViolations = this.calculateMean(violationCounts);
    const highViolationCount = violationCounts.filter(v => v > avgViolations).length;
    
    if (highViolationCount >= Math.ceil(data.length * 0.6)) {
      patterns.recurringViolations = true;
    }

    // Detect recurring performance issues
    const executionTimes = data.map(entry => entry.metrics?.executionTime || 0);
    const avgExecutionTime = this.calculateMean(executionTimes);
    const slowExecutionCount = executionTimes.filter(t => t > avgExecutionTime * 1.2).length;
    
    if (slowExecutionCount >= Math.ceil(data.length * 0.5)) {
      patterns.recurringPerformanceIssues = true;
    }

    // Detect recurring compliance issues
    const complianceScores = data.map(entry => entry.complianceScore);
    const lowComplianceCount = complianceScores.filter(s => s < 80).length;
    
    if (lowComplianceCount >= Math.ceil(data.length * 0.5)) {
      patterns.recurringComplianceIssues = true;
    }

    // Detect recurring critical issues
    const criticalViolations = data.map(entry => entry.criticalViolations);
    const criticalIssueCount = criticalViolations.filter(c => c > 0).length;
    
    if (criticalIssueCount >= Math.ceil(data.length * 0.3)) {
      patterns.recurringCriticalIssues = true;
    }

    return patterns;
  }

  // Generate context-based suggestions
  generateContextBasedSuggestions(contextPatterns) {
    const suggestions = [];

    if (contextPatterns.complianceDecline) {
      suggestions.push({
        type: 'COMPLIANCE_DECLINE_MITIGATION',
        title: 'Address Declining Compliance Score',
        description: 'Compliance score has been declining over recent checks',
        impact: 'HIGH',
        urgency: 'IMMEDIATE',
        actions: [
          'Review recent code changes for compliance violations',
          'Implement stricter code review process',
          'Provide team training on standards',
          'Add automated compliance checks to CI/CD pipeline',
        ],
        expectedOutcome: 'Improve compliance score within 1-2 weeks',
        successMetrics: ['Increased compliance score', 'Reduced violation count'],
      });
    }

    if (contextPatterns.violationSpikes) {
      suggestions.push({
        type: 'VIOLATION_SPIKE_RESPONSE',
        title: 'Address Violation Spike',
        description: 'Unusual increase in violations detected',
        impact: 'HIGH',
        urgency: 'IMMEDIATE',
        actions: [
          'Investigate recent code changes',
          'Review violation types and patterns',
          'Implement immediate fixes for critical violations',
          'Establish violation monitoring alerts',
        ],
        expectedOutcome: 'Reduce violations to normal levels',
        successMetrics: ['Reduced violation count', 'Stable violation trend'],
      });
    }

    if (contextPatterns.criticalIssueTrends) {
      suggestions.push({
        type: 'CRITICAL_ISSUE_MITIGATION',
        title: 'Address Critical Issue Trend',
        description: 'Critical violations showing increasing trend',
        impact: 'CRITICAL',
        urgency: 'IMMEDIATE',
        actions: [
          'Prioritize critical issue resolution',
          'Implement security review process',
          'Add critical issue monitoring',
          'Establish emergency response procedures',
        ],
        expectedOutcome: 'Eliminate all critical violations',
        successMetrics: ['Zero critical violations', 'Improved security posture'],
      });
    }

    if (contextPatterns.performanceDegradation) {
      suggestions.push({
        type: 'PERFORMANCE_OPTIMIZATION',
        title: 'Optimize Performance',
        description: 'Performance degradation detected in compliance checks',
        impact: 'MEDIUM',
        urgency: 'SHORT_TERM',
        actions: [
          'Optimize compliance check algorithms',
          'Implement caching for repeated checks',
          'Review file processing efficiency',
          'Consider parallel processing for large codebases',
        ],
        expectedOutcome: 'Improve execution time by 20-30%',
        successMetrics: ['Reduced execution time', 'Improved processing efficiency'],
      });
    }

    return suggestions;
  }

  // Generate trend-based suggestions
  generateTrendBasedSuggestions(trendPatterns) {
    const suggestions = [];

    if (trendPatterns.decliningTrend) {
      suggestions.push({
        type: 'TREND_REVERSAL_STRATEGY',
        title: 'Reverse Declining Trend',
        description: 'Compliance trend is declining and needs immediate attention',
        impact: 'HIGH',
        urgency: 'IMMEDIATE',
        actions: [
          'Implement comprehensive compliance review',
          'Establish daily compliance monitoring',
          'Provide immediate team training',
          'Set up compliance improvement milestones',
        ],
        expectedOutcome: 'Reverse declining trend within 2-3 weeks',
        successMetrics: ['Positive trend direction', 'Improved compliance score'],
      });
    }

    if (trendPatterns.cyclicalPattern) {
      suggestions.push({
        type: 'CYCLICAL_PATTERN_MANAGEMENT',
        title: 'Manage Cyclical Compliance Patterns',
        description: 'Compliance shows cyclical patterns that need management',
        impact: 'MEDIUM',
        urgency: 'SHORT_TERM',
        actions: [
          'Implement consistent compliance practices',
          'Establish regular compliance reviews',
          'Create compliance maintenance schedule',
          'Monitor for pattern triggers',
        ],
        expectedOutcome: 'Stabilize compliance patterns',
        successMetrics: ['Reduced volatility', 'More consistent compliance'],
      });
    }

    if (trendPatterns.improvingTrend) {
      suggestions.push({
        type: 'TREND_MAINTENANCE',
        title: 'Maintain Improving Trend',
        description: 'Compliance is improving - maintain momentum',
        impact: 'MEDIUM',
        urgency: 'ONGOING',
        actions: [
          'Continue current improvement practices',
          'Document successful strategies',
          'Share best practices across team',
          'Set higher compliance targets',
        ],
        expectedOutcome: 'Maintain and accelerate improvement',
        successMetrics: ['Continued improvement', 'Higher compliance targets'],
      });
    }

    return suggestions;
  }

  // Generate file type-based suggestions
  generateFileTypeBasedSuggestions(fileTypePatterns) {
    const suggestions = [];

    if (fileTypePatterns.javaFileIssues) {
      suggestions.push({
        type: 'JAVA_FILE_OPTIMIZATION',
        title: 'Address Java File Compliance Issues',
        description: 'Java files showing compliance violations',
        impact: 'MEDIUM',
        urgency: 'SHORT_TERM',
        actions: [
          'Review Java coding standards',
          'Implement Java-specific linting rules',
          'Add Java code quality checks',
          'Provide Java development best practices training',
        ],
        expectedOutcome: 'Improve Java file compliance',
        successMetrics: ['Reduced Java violations', 'Improved Java code quality'],
      });
    }

    if (fileTypePatterns.typescriptFileIssues) {
      suggestions.push({
        type: 'TYPESCRIPT_FILE_OPTIMIZATION',
        title: 'Address TypeScript File Compliance Issues',
        description: 'TypeScript files showing compliance violations',
        impact: 'MEDIUM',
        urgency: 'SHORT_TERM',
        actions: [
          'Review TypeScript coding standards',
          'Implement TypeScript-specific linting',
          'Add TypeScript type checking',
          'Provide TypeScript best practices training',
        ],
        expectedOutcome: 'Improve TypeScript file compliance',
        successMetrics: ['Reduced TypeScript violations', 'Improved type safety'],
      });
    }

    if (fileTypePatterns.markdownFileIssues) {
      suggestions.push({
        type: 'MARKDOWN_FILE_OPTIMIZATION',
        title: 'Address Markdown File Compliance Issues',
        description: 'Markdown files showing compliance violations',
        impact: 'LOW',
        urgency: 'ONGOING',
        actions: [
          'Review documentation standards',
          'Implement markdown linting rules',
          'Add documentation quality checks',
          'Provide documentation best practices training',
        ],
        expectedOutcome: 'Improve documentation quality',
        successMetrics: ['Reduced documentation violations', 'Improved documentation quality'],
      });
    }

    return suggestions;
  }

  // Generate severity-based suggestions
  generateSeverityBasedSuggestions(severityPatterns) {
    const suggestions = [];

    if (severityPatterns.criticalIssues) {
      suggestions.push({
        type: 'CRITICAL_ISSUE_RESOLUTION',
        title: 'Resolve Critical Issues Immediately',
        description: 'Critical violations detected that require immediate attention',
        impact: 'CRITICAL',
        urgency: 'IMMEDIATE',
        actions: [
          'Prioritize critical issue resolution',
          'Implement immediate fixes',
          'Establish critical issue monitoring',
          'Review security and compliance procedures',
        ],
        expectedOutcome: 'Eliminate all critical violations',
        successMetrics: ['Zero critical violations', 'Improved security posture'],
      });
    }

    if (severityPatterns.highSeverityIssues) {
      suggestions.push({
        type: 'HIGH_SEVERITY_ISSUE_MANAGEMENT',
        title: 'Manage High Severity Issues',
        description: 'High severity violations need attention',
        impact: 'HIGH',
        urgency: 'SHORT_TERM',
        actions: [
          'Review high severity violations',
          'Implement fixes for high priority issues',
          'Establish severity-based prioritization',
          'Monitor high severity issue trends',
        ],
        expectedOutcome: 'Reduce high severity violations',
        successMetrics: ['Reduced high severity violations', 'Improved code quality'],
      });
    }

    if (severityPatterns.mixedSeverityIssues) {
      suggestions.push({
        type: 'MIXED_SEVERITY_ISSUE_MANAGEMENT',
        title: 'Manage Mixed Severity Issues',
        description: 'Multiple severity levels of violations detected',
        impact: 'MEDIUM',
        urgency: 'SHORT_TERM',
        actions: [
          'Implement severity-based prioritization',
          'Address critical and high severity first',
          'Establish systematic issue resolution process',
          'Monitor severity distribution trends',
        ],
        expectedOutcome: 'Systematic resolution of all severity levels',
        successMetrics: ['Reduced overall violations', 'Balanced severity distribution'],
      });
    }

    return suggestions;
  }

  // Generate recurring pattern suggestions
  generateRecurringPatternSuggestions(recurringPatterns) {
    const suggestions = [];

    if (recurringPatterns.recurringViolations) {
      suggestions.push({
        type: 'RECURRING_VIOLATION_PREVENTION',
        title: 'Prevent Recurring Violations',
        description: 'Violations are recurring frequently',
        impact: 'HIGH',
        urgency: 'SHORT_TERM',
        actions: [
          'Analyze violation root causes',
          'Implement preventive measures',
          'Add automated violation detection',
          'Establish violation prevention training',
        ],
        expectedOutcome: 'Reduce recurring violations',
        successMetrics: ['Reduced violation frequency', 'Improved prevention measures'],
      });
    }

    if (recurringPatterns.recurringPerformanceIssues) {
      suggestions.push({
        type: 'RECURRING_PERFORMANCE_OPTIMIZATION',
        title: 'Optimize Recurring Performance Issues',
        description: 'Performance issues are recurring frequently',
        impact: 'MEDIUM',
        urgency: 'SHORT_TERM',
        actions: [
          'Identify performance bottlenecks',
          'Implement performance optimizations',
          'Add performance monitoring',
          'Establish performance best practices',
        ],
        expectedOutcome: 'Improve consistent performance',
        successMetrics: ['Improved performance consistency', 'Reduced performance issues'],
      });
    }

    if (recurringPatterns.recurringCriticalIssues) {
      suggestions.push({
        type: 'RECURRING_CRITICAL_ISSUE_PREVENTION',
        title: 'Prevent Recurring Critical Issues',
        description: 'Critical issues are recurring frequently',
        impact: 'CRITICAL',
        urgency: 'IMMEDIATE',
        actions: [
          'Implement critical issue prevention',
          'Add critical issue monitoring',
          'Establish emergency response procedures',
          'Review and improve security measures',
        ],
        expectedOutcome: 'Eliminate recurring critical issues',
        successMetrics: ['Zero recurring critical issues', 'Improved security measures'],
      });
    }

    return suggestions;
  }
}

module.exports = StatisticalAnalysis; 