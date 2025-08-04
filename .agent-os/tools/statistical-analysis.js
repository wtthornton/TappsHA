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
    const xValues = Array.from({length: n}, (_, i) => i);
    
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
      totalEntries: violationCounts.length
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
      currentScore: scores[scores.length - 1] || 0
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
      currentScore: currentScore
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
      trends: {}
    };

    Object.entries(standardsAnalysis).forEach(([standard, data]) => {
      if (data.violationRates.length > 0) {
        const avgViolationRate = this.calculateMean(data.violationRates);
        const trend = this.calculateTrend(data.violationRates);
        
        results.trends[standard] = {
          averageViolationRate: Math.round(avgViolationRate),
          trend: trend,
          totalChecks: data.checks.reduce((sum, val) => sum + val, 0)
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
          : 'Monitor for improvement opportunities'
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
          : 'Review and improve compliance practices'
      });
    }

    // Analyze standards effectiveness
    const standardsAnalysis = this.analyzeStandardsEffectiveness(historicalData);
    if (standardsAnalysis.needsImprovement.length > 0) {
      insights.push({
        type: 'standards_effectiveness',
        priority: 'HIGH',
        message: `Standards needing improvement: ${standardsAnalysis.needsImprovement.join(', ')}`,
        action: 'Review and update standards documentation'
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
        violationTrend: Math.round(violationTrend * 100) / 100
      }
    };
  }
}

module.exports = StatisticalAnalysis; 