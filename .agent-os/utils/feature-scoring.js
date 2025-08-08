#!/usr/bin/env node

/**
 * Feature Scoring Framework
 * Extracted from real-time-metrics-maximum-impact-lessons.md
 * 
 * Provides systematic feature scoring to prevent feature creep and ensure
 * resources are allocated to maximum impact features.
 */

const fs = require('fs');
const path = require('path');

class FeatureScoringFramework {
  constructor() {
    this.scoringCriteria = {
      importance: {
        weight: 0.3,
        description: 'Business value and strategic importance',
        scale: {
          10: 'Critical for project success',
          9: 'Essential for core functionality',
          8: 'Important for user experience',
          7: 'Useful enhancement',
          6: 'Nice to have',
          5: 'Minor improvement',
          4: 'Low business value',
          3: 'Minimal impact',
          2: 'Questionable value',
          1: 'No clear value'
        }
      },
      complexity: {
        weight: 0.2,
        description: 'Development effort and technical complexity',
        scale: {
          10: 'Extremely complex, high risk',
          9: 'Very complex, multiple dependencies',
          8: 'Complex, significant effort',
          7: 'Moderately complex',
          6: 'Standard complexity',
          5: 'Straightforward implementation',
          4: 'Simple with known patterns',
          3: 'Very simple',
          2: 'Trivial implementation',
          1: 'Configuration only'
        }
      },
      impact: {
        weight: 0.5,
        description: 'Direct impact on developer productivity and coding speed',
        scale: {
          10: 'Transforms developer workflow',
          9: 'Significantly improves coding speed',
          8: 'Measurable productivity improvement',
          7: 'Noticeable improvement',
          6: 'Minor productivity gain',
          5: 'Slight improvement',
          4: 'Minimal measurable impact',
          3: 'Questionable productivity gain',
          2: 'No measurable impact',
          1: 'Potentially negative impact'
        }
      }
    };

    this.thresholds = {
      highPriority: 8.0,
      mediumPriority: 6.0,
      lowPriority: 4.0,
      eliminate: 3.0
    };
  }

  /**
   * Score a single feature
   * @param {Object} feature - Feature to score
   * @returns {Object} scoring results
   */
  scoreFeature(feature) {
    const {
      name,
      description,
      importance = 5,
      complexity = 5,
      impact = 5,
      category = 'general'
    } = feature;

    // Validate scores
    this.validateScore('importance', importance);
    this.validateScore('complexity', complexity);
    this.validateScore('impact', impact);

    // Calculate weighted score
    const weights = this.scoringCriteria;
    const weightedScore = (
      importance * weights.importance.weight +
      (11 - complexity) * weights.complexity.weight + // Invert complexity (lower is better)
      impact * weights.impact.weight
    );

    // Determine priority level
    const priority = this.determinePriority(weightedScore);
    
    // Calculate ROI (Impact / Complexity)
    const roi = impact / complexity;

    const result = {
      name,
      description,
      category,
      scores: {
        importance,
        complexity,
        impact,
        weighted: Math.round(weightedScore * 100) / 100,
        roi: Math.round(roi * 100) / 100
      },
      priority,
      recommendation: this.getRecommendation(weightedScore, impact, complexity)
    };

    return result;
  }

  /**
   * Score multiple features and provide analysis
   * @param {Object[]} features - Array of features to score
   * @returns {Object} comprehensive scoring analysis
   */
  scoreFeatures(features) {
    console.log(`🎯 Scoring ${features.length} features...`);
    
    const scoredFeatures = features.map(feature => this.scoreFeature(feature));
    
    // Sort by priority and weighted score
    scoredFeatures.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = ['HIGH', 'MEDIUM', 'LOW', 'ELIMINATE'];
        return priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
      }
      return b.scores.weighted - a.scores.weighted;
    });

    const analysis = this.analyzeResults(scoredFeatures);
    
    return {
      features: scoredFeatures,
      analysis,
      recommendations: this.generateRecommendations(scoredFeatures, analysis)
    };
  }

  /**
   * Analyze scoring results
   * @param {Object[]} scoredFeatures - Features with scores
   * @returns {Object} analysis results
   */
  analyzeResults(scoredFeatures) {
    const analysis = {
      total: scoredFeatures.length,
      priorityDistribution: {},
      averageScores: {},
      maxImpactFeatures: [],
      eliminationCandidates: [],
      quickWins: [], // High impact, low complexity
      strategicFeatures: [] // High impact, high complexity
    };

    // Priority distribution
    const priorities = ['HIGH', 'MEDIUM', 'LOW', 'ELIMINATE'];
    priorities.forEach(priority => {
      analysis.priorityDistribution[priority] = scoredFeatures.filter(f => f.priority === priority).length;
    });

    // Average scores
    analysis.averageScores = {
      importance: this.calculateAverage(scoredFeatures, 'importance'),
      complexity: this.calculateAverage(scoredFeatures, 'complexity'),
      impact: this.calculateAverage(scoredFeatures, 'impact'),
      weighted: this.calculateAverage(scoredFeatures, 'weighted')
    };

    // Maximum impact features (impact >= 8)
    analysis.maxImpactFeatures = scoredFeatures
      .filter(f => f.scores.impact >= 8)
      .slice(0, 5);

    // Elimination candidates (weighted score < elimination threshold)
    analysis.eliminationCandidates = scoredFeatures
      .filter(f => f.scores.weighted < this.thresholds.eliminate);

    // Quick wins (high impact, low complexity)
    analysis.quickWins = scoredFeatures
      .filter(f => f.scores.impact >= 7 && f.scores.complexity <= 4)
      .slice(0, 10);

    // Strategic features (high impact, high complexity)
    analysis.strategicFeatures = scoredFeatures
      .filter(f => f.scores.impact >= 8 && f.scores.complexity >= 7)
      .slice(0, 5);

    return analysis;
  }

  /**
   * Generate implementation recommendations
   * @param {Object[]} scoredFeatures - Features with scores
   * @param {Object} analysis - Analysis results
   * @returns {Object} recommendations
   */
  generateRecommendations(scoredFeatures, analysis) {
    const recommendations = {
      implementationOrder: [],
      phaseOrganization: {},
      resourceAllocation: {},
      riskAssessment: {}
    };

    // Implementation order (top 10 by weighted score)
    recommendations.implementationOrder = scoredFeatures
      .filter(f => f.priority !== 'ELIMINATE')
      .slice(0, 10)
      .map(f => ({
        name: f.name,
        score: f.scores.weighted,
        priority: f.priority,
        justification: f.recommendation
      }));

    // Phase organization
    recommendations.phaseOrganization = {
      phase1: scoredFeatures.filter(f => f.scores.weighted >= this.thresholds.highPriority),
      phase2: scoredFeatures.filter(f => 
        f.scores.weighted >= this.thresholds.mediumPriority && 
        f.scores.weighted < this.thresholds.highPriority
      ),
      phase3: scoredFeatures.filter(f => 
        f.scores.weighted >= this.thresholds.lowPriority && 
        f.scores.weighted < this.thresholds.mediumPriority
      ),
      deferred: scoredFeatures.filter(f => f.scores.weighted < this.thresholds.lowPriority)
    };

    // Resource allocation suggestions
    const totalEffort = scoredFeatures
      .filter(f => f.priority !== 'ELIMINATE')
      .reduce((sum, f) => sum + f.scores.complexity, 0);

    recommendations.resourceAllocation = {
      totalEffort,
      highPriorityEffort: recommendations.phaseOrganization.phase1
        .reduce((sum, f) => sum + f.scores.complexity, 0),
      effortSaved: analysis.eliminationCandidates
        .reduce((sum, f) => sum + f.scores.complexity, 0),
      recommendedFocus: analysis.quickWins.length > 0 ? 'quick wins' : 'strategic features'
    };

    return recommendations;
  }

  /**
   * Validate individual score
   * @param {string} criterion - Scoring criterion
   * @param {number} score - Score to validate
   */
  validateScore(criterion, score) {
    if (typeof score !== 'number' || score < 1 || score > 10) {
      throw new Error(`Invalid ${criterion} score: ${score}. Must be number between 1-10`);
    }
  }

  /**
   * Determine priority level based on weighted score
   * @param {number} weightedScore - Calculated weighted score
   * @returns {string} priority level
   */
  determinePriority(weightedScore) {
    if (weightedScore >= this.thresholds.highPriority) return 'HIGH';
    if (weightedScore >= this.thresholds.mediumPriority) return 'MEDIUM';
    if (weightedScore >= this.thresholds.lowPriority) return 'LOW';
    return 'ELIMINATE';
  }

  /**
   * Get implementation recommendation
   * @param {number} weightedScore - Weighted score
   * @param {number} impact - Impact score
   * @param {number} complexity - Complexity score
   * @returns {string} recommendation
   */
  getRecommendation(weightedScore, impact, complexity) {
    if (weightedScore < this.thresholds.eliminate) {
      return 'Eliminate - insufficient value for effort required';
    }
    
    if (impact >= 8 && complexity <= 4) {
      return 'Quick win - high impact, low effort';
    }
    
    if (impact >= 8 && complexity >= 7) {
      return 'Strategic investment - high impact, requires significant effort';
    }
    
    if (weightedScore >= this.thresholds.highPriority) {
      return 'High priority - implement in Phase 1';
    }
    
    if (weightedScore >= this.thresholds.mediumPriority) {
      return 'Medium priority - implement in Phase 2';
    }
    
    return 'Low priority - defer to later phases';
  }

  /**
   * Calculate average score for a criterion
   * @param {Object[]} features - Features with scores
   * @param {string} criterion - Score criterion to average
   * @returns {number} average score
   */
  calculateAverage(features, criterion) {
    const sum = features.reduce((total, feature) => {
      return total + (criterion === 'weighted' ? feature.scores[criterion] : feature.scores[criterion]);
    }, 0);
    return Math.round((sum / features.length) * 100) / 100;
  }

  /**
   * Generate detailed scoring report
   * @param {Object} results - Scoring results
   * @param {string} outputPath - Path to save report
   */
  generateReport(results, outputPath = null) {
    const { features, analysis, recommendations } = results;
    
    console.log('\n📊 FEATURE SCORING REPORT');
    console.log('='.repeat(60));
    
    // Summary
    console.log(`\n📈 SUMMARY`);
    console.log(`Total Features: ${analysis.total}`);
    console.log(`High Priority: ${analysis.priorityDistribution.HIGH}`);
    console.log(`Medium Priority: ${analysis.priorityDistribution.MEDIUM}`);
    console.log(`Low Priority: ${analysis.priorityDistribution.LOW}`);
    console.log(`Eliminate: ${analysis.priorityDistribution.ELIMINATE}`);
    
    // Top features
    console.log(`\n🎯 TOP 5 FEATURES BY SCORE:`);
    features.slice(0, 5).forEach((feature, index) => {
      console.log(`${index + 1}. ${feature.name} (${feature.scores.weighted}/10) - ${feature.priority}`);
    });
    
    // Quick wins
    if (analysis.quickWins.length > 0) {
      console.log(`\n⚡ QUICK WINS (High Impact, Low Complexity):`);
      analysis.quickWins.slice(0, 5).forEach((feature, index) => {
        console.log(`${index + 1}. ${feature.name} (Impact: ${feature.scores.impact}, Complexity: ${feature.scores.complexity})`);
      });
    }
    
    // Elimination candidates
    if (analysis.eliminationCandidates.length > 0) {
      console.log(`\n❌ ELIMINATION CANDIDATES:`);
      analysis.eliminationCandidates.forEach((feature, index) => {
        console.log(`${index + 1}. ${feature.name} (Score: ${feature.scores.weighted}/10)`);
      });
    }
    
    // Effort savings
    console.log(`\n💰 RESOURCE OPTIMIZATION:`);
    console.log(`Total Effort Units: ${recommendations.resourceAllocation.totalEffort}`);
    console.log(`High Priority Effort: ${recommendations.resourceAllocation.highPriorityEffort}`);
    console.log(`Effort Saved by Elimination: ${recommendations.resourceAllocation.effortSaved}`);
    console.log(`Recommended Focus: ${recommendations.resourceAllocation.recommendedFocus}`);
    
    // Save detailed report if path provided
    if (outputPath) {
      const reportData = {
        timestamp: new Date().toISOString(),
        summary: analysis,
        features,
        recommendations
      };
      
      fs.writeFileSync(outputPath, JSON.stringify(reportData, null, 2));
      console.log(`\n📄 Detailed report saved: ${outputPath}`);
    }
    
    return results;
  }

  /**
   * Load features from JSON file
   * @param {string} filePath - Path to features JSON file
   * @returns {Object[]} array of features
   */
  loadFeaturesFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Features file not found: ${filePath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(data) ? data : data.features || [];
  }

  /**
   * Create feature template for scoring
   * @returns {Object} feature template
   */
  createFeatureTemplate() {
    return {
      name: '',
      description: '',
      category: 'general',
      importance: 5, // 1-10 scale
      complexity: 5, // 1-10 scale
      impact: 5      // 1-10 scale (on developer productivity)
    };
  }
}

export default FeatureScoringFramework;

// CLI usage when run directly
// ESM export; CLI block removed for test environment compatibility