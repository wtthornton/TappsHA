#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CursorAnalytics {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.analyticsFile = path.join(this.sourceDir, 'reports', 'cursor-analytics.json');
    this.dashboardFile = path.join(this.sourceDir, 'reports', 'cursor-analytics-dashboard.html');
  }

  async run() {
    console.log('📊 Starting Cursor Analytics...');
    
    try {
      // 1. Load existing analytics data
      const analyticsData = await this.loadAnalyticsData();
      
      // 2. Analyze current rule usage
      const ruleAnalysis = await this.analyzeRuleUsage();
      
      // 3. Generate effectiveness metrics
      const effectivenessMetrics = this.generateEffectivenessMetrics(ruleAnalysis);
      
      // 4. Create improvement suggestions
      const improvementSuggestions = this.generateImprovementSuggestions(ruleAnalysis);
      
      // 5. Update analytics data
      const updatedAnalytics = this.updateAnalyticsData(analyticsData, ruleAnalysis, effectivenessMetrics);
      
      // 6. Save analytics data
      await this.saveAnalyticsData(updatedAnalytics);
      
      // 7. Generate HTML dashboard
      await this.generateDashboard(updatedAnalytics);
      
      console.log('🎉 Cursor Analytics completed!');
      
      return {
        success: true,
        totalRules: ruleAnalysis.totalRules,
        effectivenessScore: effectivenessMetrics.overallScore,
        suggestions: improvementSuggestions.length
      };
    } catch (error) {
      console.error('❌ Cursor Analytics failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadAnalyticsData() {
    try {
      if (fs.existsSync(this.analyticsFile)) {
        const data = JSON.parse(fs.readFileSync(this.analyticsFile, 'utf8'));
        console.log(`📦 Loaded existing analytics data with ${data.ruleUsage.length} rule usage records`);
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load analytics data:', error.message);
    }
    
    return {
      ruleUsage: [],
      effectivenessHistory: [],
      lastUpdated: null
    };
  }

  async saveAnalyticsData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.mkdirSync(path.dirname(this.analyticsFile), { recursive: true });
      fs.writeFileSync(this.analyticsFile, JSON.stringify(data, null, 2));
      console.log(`💾 Saved analytics data with ${data.ruleUsage.length} rule usage records`);
    } catch (error) {
      console.warn('⚠️ Failed to save analytics data:', error.message);
    }
  }

  async analyzeRuleUsage() {
    const cursorRulesDir = path.join(this.sourceDir, 'cursor-rules');
    const rules = [];
    
    if (fs.existsSync(cursorRulesDir)) {
      const files = fs.readdirSync(cursorRulesDir).filter(file => file.endsWith('.mdc'));
      
      files.forEach(file => {
        const filePath = path.join(cursorRulesDir, file);
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');
        
        rules.push({
          filename: file,
          title: this.extractRuleTitle(content),
          type: this.extractRuleType(content),
          size: stats.size,
          lastModified: stats.mtime,
          usageScore: this.calculateUsageScore(content),
          effectivenessScore: this.calculateEffectivenessScore(content)
        });
      });
    }
    
    return {
      totalRules: rules.length,
      rules: rules,
      typeDistribution: this.calculateTypeDistribution(rules),
      usageTrends: this.calculateUsageTrends(rules)
    };
  }

  extractRuleTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Unknown Rule';
  }

  extractRuleType(content) {
    const typeMatch = content.match(/Type.*?(\w+)/);
    return typeMatch ? typeMatch[1].toLowerCase() : 'general';
  }

  calculateUsageScore(content) {
    let score = 50; // Base score
    
    // Check for actionable content
    const actionableKeywords = ['always', 'never', 'must', 'should', 'use', 'implement'];
    const contentLower = content.toLowerCase();
    
    actionableKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 10;
      }
    });
    
    // Check for code examples
    if (content.includes('```')) {
      score += 15;
    }
    
    // Check for references/links
    if (content.includes('http') || content.includes('[')) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  calculateEffectivenessScore(content) {
    let score = 60; // Base score
    
    // Check for clear structure
    if (content.includes('---')) {
      score += 10;
    }
    
    // Check for proper formatting
    if (content.includes('**') || content.includes('*')) {
      score += 10;
    }
    
    // Check for examples
    if (content.includes('```')) {
      score += 10;
    }
    
    // Check for actionable content
    if (content.includes('always') || content.includes('never')) {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  calculateTypeDistribution(rules) {
    const distribution = {};
    rules.forEach(rule => {
      const type = rule.type;
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  }

  calculateUsageTrends(rules) {
    const now = new Date();
    const trends = {
      recent: 0,
      medium: 0,
      old: 0
    };
    
    rules.forEach(rule => {
      const daysSinceModified = (now - new Date(rule.lastModified)) / (1000 * 60 * 60 * 24);
      
      if (daysSinceModified <= 7) {
        trends.recent++;
      } else if (daysSinceModified <= 30) {
        trends.medium++;
      } else {
        trends.old++;
      }
    });
    
    return trends;
  }

  generateEffectivenessMetrics(ruleAnalysis) {
    const totalRules = ruleAnalysis.totalRules;
    const avgUsageScore = ruleAnalysis.rules.reduce((sum, rule) => sum + rule.usageScore, 0) / totalRules;
    const avgEffectivenessScore = ruleAnalysis.rules.reduce((sum, rule) => sum + rule.effectivenessScore, 0) / totalRules;
    
    return {
      overallScore: Math.round((avgUsageScore + avgEffectivenessScore) / 2),
      usageScore: Math.round(avgUsageScore),
      effectivenessScore: Math.round(avgEffectivenessScore),
      totalRules,
      highQualityRules: ruleAnalysis.rules.filter(rule => rule.effectivenessScore >= 80).length,
      lowQualityRules: ruleAnalysis.rules.filter(rule => rule.effectivenessScore < 60).length
    };
  }

  generateImprovementSuggestions(ruleAnalysis) {
    const suggestions = [];
    
    // Analyze low-quality rules
    const lowQualityRules = ruleAnalysis.rules.filter(rule => rule.effectivenessScore < 60);
    if (lowQualityRules.length > 0) {
      suggestions.push({
        type: 'quality',
        priority: 'high',
        message: `${lowQualityRules.length} rules have low effectiveness scores (< 60). Consider improving content quality.`,
        rules: lowQualityRules.map(rule => rule.filename)
      });
    }
    
    // Analyze type distribution
    const typeDistribution = ruleAnalysis.typeDistribution;
    if (typeDistribution.general > typeDistribution.standard) {
      suggestions.push({
        type: 'distribution',
        priority: 'medium',
        message: 'Too many general rules. Consider creating more specific standard rules.',
        rules: []
      });
    }
    
    // Analyze usage trends
    const trends = ruleAnalysis.usageTrends;
    if (trends.old > trends.recent) {
      suggestions.push({
        type: 'freshness',
        priority: 'medium',
        message: `${trends.old} rules haven't been updated recently. Consider reviewing and updating.`,
        rules: []
      });
    }
    
    return suggestions;
  }

  updateAnalyticsData(existingData, ruleAnalysis, effectivenessMetrics) {
    const newUsageData = {
      timestamp: new Date().toISOString(),
      totalRules: ruleAnalysis.totalRules,
      effectivenessMetrics,
      typeDistribution: ruleAnalysis.typeDistribution,
      usageTrends: ruleAnalysis.usageTrends
    };
    
    return {
      ruleUsage: [...existingData.ruleUsage, newUsageData],
      effectivenessHistory: [...existingData.effectivenessHistory, effectivenessMetrics],
      lastUpdated: new Date().toISOString()
    };
  }

  async generateDashboard(analyticsData) {
    const latestUsage = analyticsData.ruleUsage[analyticsData.ruleUsage.length - 1];
    const latestEffectiveness = analyticsData.effectivenessHistory[analyticsData.effectivenessHistory.length - 1];
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cursor Analytics Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
        }
        .metric-card {
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
            margin: 10px 0;
        }
        .metric-label {
            color: #6c757d;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .chart-container {
            padding: 30px;
            border-top: 1px solid #e1e5e9;
        }
        .chart {
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .chart h3 {
            margin: 0 0 20px 0;
            color: #333;
        }
        .bar-chart {
            display: flex;
            align-items: end;
            height: 200px;
            gap: 10px;
            padding: 20px 0;
        }
        .bar {
            flex: 1;
            background: linear-gradient(to top, #667eea, #764ba2);
            border-radius: 4px 4px 0 0;
            position: relative;
            min-height: 20px;
        }
        .bar-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.8em;
            color: #6c757d;
        }
        .bar-value {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.9em;
            font-weight: bold;
            color: #667eea;
        }
        .suggestions {
            padding: 30px;
            border-top: 1px solid #e1e5e9;
        }
        .suggestion {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 0 4px 4px 0;
        }
        .suggestion h4 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .suggestion p {
            margin: 0;
            color: #6c757d;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cursor Analytics Dashboard</h1>
            <p>Rule Usage and Effectiveness Metrics</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-label">Total Rules</div>
                <div class="metric-value">${latestUsage?.totalRules || 0}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Overall Effectiveness</div>
                <div class="metric-value">${latestEffectiveness?.overallScore || 0}%</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">High Quality Rules</div>
                <div class="metric-value">${latestEffectiveness?.highQualityRules || 0}</div>
            </div>
            <div class="metric-card">
                <div class="metric-label">Low Quality Rules</div>
                <div class="metric-value">${latestEffectiveness?.lowQualityRules || 0}</div>
            </div>
        </div>
        
        <div class="chart-container">
            <div class="chart">
                <h3>Rule Type Distribution</h3>
                <div class="bar-chart">
                    ${this.generateTypeDistributionBars(latestUsage?.typeDistribution)}
                </div>
            </div>
            
            <div class="chart">
                <h3>Usage Trends</h3>
                <div class="bar-chart">
                    ${this.generateUsageTrendsBars(latestUsage?.usageTrends)}
                </div>
            </div>
        </div>
        
        <div class="suggestions">
            <h3>Improvement Suggestions</h3>
            ${this.generateSuggestionsHTML()}
        </div>
        
        <div class="footer">
            <p>Last updated: ${analyticsData.lastUpdated || 'Never'}</p>
            <p>Generated by Agent OS Cursor Analytics</p>
        </div>
    </div>
</body>
</html>`;
    
    fs.mkdirSync(path.dirname(this.dashboardFile), { recursive: true });
    fs.writeFileSync(this.dashboardFile, html);
    console.log(`📊 Generated dashboard: ${this.dashboardFile}`);
  }

  generateTypeDistributionBars(typeDistribution) {
    if (!typeDistribution) return '<p>No data available</p>';
    
    const maxValue = Math.max(...Object.values(typeDistribution));
    return Object.entries(typeDistribution).map(([type, count]) => {
      const height = (count / maxValue) * 100;
      return `
        <div class="bar" style="height: ${height}%">
            <div class="bar-value">${count}</div>
            <div class="bar-label">${type}</div>
        </div>
      `;
    }).join('');
  }

  generateUsageTrendsBars(usageTrends) {
    if (!usageTrends) return '<p>No data available</p>';
    
    const maxValue = Math.max(...Object.values(usageTrends));
    return Object.entries(usageTrends).map(([trend, count]) => {
      const height = (count / maxValue) * 100;
      return `
        <div class="bar" style="height: ${height}%">
            <div class="bar-value">${count}</div>
            <div class="bar-label">${trend}</div>
        </div>
      `;
    }).join('');
  }

  generateSuggestionsHTML() {
    return `
        <div class="suggestion">
            <h4>📈 Quality Improvement</h4>
            <p>Focus on improving rule content quality by adding more actionable guidance and code examples.</p>
        </div>
        <div class="suggestion">
            <h4>🔄 Regular Updates</h4>
            <p>Establish a regular review cycle to keep rules current and relevant.</p>
        </div>
        <div class="suggestion">
            <h4>📊 Usage Tracking</h4>
            <p>Implement usage tracking to identify which rules are most effective and which need improvement.</p>
        </div>
    `;
  }
}

// Run the analytics
if (require.main === module) {
  const analytics = new CursorAnalytics();
  analytics.run().catch(console.error);
}

module.exports = CursorAnalytics; 