#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class CursorRuleOptimizer {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.performanceFile = path.join(this.sourceDir, 'reports', 'rule-performance.json');
    this.recommendationsFile = path.join(this.sourceDir, 'reports', 'rule-recommendations.json');
    this.optimizationHistoryFile = path.join(this.sourceDir, 'reports', 'optimization-history.json');
  }

  async run() {
    console.log('🚀 Starting Cursor Rule Optimizer...');
    
    try {
      // 1. Load existing performance data
      const performanceData = await this.loadPerformanceData();
      
      // 2. Analyze current rule performance
      const ruleAnalysis = await this.analyzeRulePerformance();
      
      // 3. Generate improvement recommendations
      const recommendations = this.generateRecommendations(ruleAnalysis);
      
      // 4. Update performance data
      const updatedPerformance = this.updatePerformanceData(performanceData, ruleAnalysis);
      
      // 5. Save performance data
      await this.savePerformanceData(updatedPerformance);
      
      // 6. Save recommendations
      await this.saveRecommendations(recommendations);
      
      // 7. Generate optimization report
      await this.generateOptimizationReport(ruleAnalysis, recommendations);
      
      console.log('🎉 Cursor Rule Optimizer completed!');
      
      return {
        success: true,
        totalRules: ruleAnalysis.totalRules,
        optimizedRules: recommendations.optimizedRules.length,
        recommendations: recommendations.suggestions.length
      };
    } catch (error) {
      console.error('❌ Cursor Rule Optimizer failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadPerformanceData() {
    try {
      if (fs.existsSync(this.performanceFile)) {
        const data = JSON.parse(fs.readFileSync(this.performanceFile, 'utf8'));
        console.log(`📦 Loaded existing performance data with ${data.rulePerformance.length} rule performance records`);
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load performance data:', error.message);
    }
    
    return {
      rulePerformance: [],
      optimizationHistory: [],
      lastUpdated: null
    };
  }

  async savePerformanceData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.mkdirSync(path.dirname(this.performanceFile), { recursive: true });
      fs.writeFileSync(this.performanceFile, JSON.stringify(data, null, 2));
      console.log(`💾 Saved performance data with ${data.rulePerformance.length} rule performance records`);
    } catch (error) {
      console.warn('⚠️ Failed to save performance data:', error.message);
    }
  }

  async analyzeRulePerformance() {
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
          performanceScore: this.calculatePerformanceScore(content),
          optimizationScore: this.calculateOptimizationScore(content),
          complexityScore: this.calculateComplexityScore(content),
          clarityScore: this.calculateClarityScore(content)
        });
      });
    }
    
    return {
      totalRules: rules.length,
      rules: rules,
      performanceMetrics: this.calculatePerformanceMetrics(rules),
      optimizationOpportunities: this.identifyOptimizationOpportunities(rules)
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

  calculatePerformanceScore(content) {
    let score = 60; // Base score
    
    // Check for actionable content
    const actionableKeywords = ['always', 'never', 'must', 'should', 'use', 'implement'];
    const contentLower = content.toLowerCase();
    
    actionableKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 8;
      }
    });
    
    // Check for code examples
    if (content.includes('```')) {
      score += 15;
    }
    
    // Check for clear structure
    if (content.includes('---')) {
      score += 10;
    }
    
    // Check for proper formatting
    if (content.includes('**') || content.includes('*')) {
      score += 7;
    }
    
    return Math.min(100, score);
  }

  calculateOptimizationScore(content) {
    let score = 70; // Base score
    
    // Check for optimization indicators
    const optimizationKeywords = ['optimize', 'improve', 'enhance', 'better', 'efficient'];
    const contentLower = content.toLowerCase();
    
    optimizationKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 5;
      }
    });
    
    // Check for specific guidance
    if (content.includes('example') || content.includes('sample')) {
      score += 10;
    }
    
    // Check for references
    if (content.includes('http') || content.includes('[')) {
      score += 8;
    }
    
    // Check for clear sections
    const sectionCount = (content.match(/^#{2,3}\s+/gm) || []).length;
    score += Math.min(12, sectionCount * 3);
    
    return Math.min(100, score);
  }

  calculateComplexityScore(content) {
    let score = 50; // Base score (lower is better for complexity)
    
    // Check for complexity indicators
    const complexityKeywords = ['complex', 'complicated', 'difficult', 'advanced', 'expert'];
    const contentLower = content.toLowerCase();
    
    complexityKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 10; // Higher score = more complex
      }
    });
    
    // Check for code complexity
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    codeBlocks.forEach(block => {
      const lines = block.split('\n').length;
      if (lines > 10) {
        score += 5; // Complex code blocks
      }
    });
    
    // Check for long paragraphs
    const paragraphs = content.split('\n\n');
    paragraphs.forEach(paragraph => {
      if (paragraph.length > 200) {
        score += 3; // Long paragraphs
      }
    });
    
    return Math.min(100, score);
  }

  calculateClarityScore(content) {
    let score = 70; // Base score
    
    // Check for clarity indicators
    const clarityKeywords = ['clear', 'simple', 'easy', 'straightforward', 'obvious'];
    const contentLower = content.toLowerCase();
    
    clarityKeywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 8;
      }
    });
    
    // Check for examples
    if (content.includes('example') || content.includes('sample')) {
      score += 12;
    }
    
    // Check for step-by-step instructions
    if (content.includes('1.') || content.includes('2.') || content.includes('3.')) {
      score += 10;
    }
    
    // Check for visual formatting
    if (content.includes('**') || content.includes('*') || content.includes('`')) {
      score += 8;
    }
    
    return Math.min(100, score);
  }

  calculatePerformanceMetrics(rules) {
    const totalRules = rules.length;
    const avgPerformance = rules.reduce((sum, rule) => sum + rule.performanceScore, 0) / totalRules;
    const avgOptimization = rules.reduce((sum, rule) => sum + rule.optimizationScore, 0) / totalRules;
    const avgComplexity = rules.reduce((sum, rule) => sum + rule.complexityScore, 0) / totalRules;
    const avgClarity = rules.reduce((sum, rule) => sum + rule.clarityScore, 0) / totalRules;
    
    return {
      totalRules,
      averagePerformance: Math.round(avgPerformance),
      averageOptimization: Math.round(avgOptimization),
      averageComplexity: Math.round(avgComplexity),
      averageClarity: Math.round(avgClarity),
      highPerformanceRules: rules.filter(rule => rule.performanceScore >= 80).length,
      lowPerformanceRules: rules.filter(rule => rule.performanceScore < 60).length,
      optimizationOpportunities: rules.filter(rule => rule.optimizationScore < 70).length
    };
  }

  identifyOptimizationOpportunities(rules) {
    const opportunities = [];
    
    rules.forEach(rule => {
      const issues = [];
      
      if (rule.performanceScore < 60) {
        issues.push('Low performance score');
      }
      
      if (rule.optimizationScore < 70) {
        issues.push('Optimization needed');
      }
      
      if (rule.complexityScore > 70) {
        issues.push('High complexity');
      }
      
      if (rule.clarityScore < 60) {
        issues.push('Low clarity');
      }
      
      if (issues.length > 0) {
        opportunities.push({
          filename: rule.filename,
          title: rule.title,
          type: rule.type,
          issues,
          priority: this.calculatePriority(rule)
        });
      }
    });
    
    return opportunities.sort((a, b) => b.priority - a.priority);
  }

  calculatePriority(rule) {
    let priority = 0;
    
    // Performance issues are highest priority
    if (rule.performanceScore < 60) priority += 30;
    if (rule.performanceScore < 70) priority += 20;
    
    // Optimization opportunities
    if (rule.optimizationScore < 70) priority += 15;
    
    // Clarity issues
    if (rule.clarityScore < 60) priority += 10;
    
    // Complexity issues
    if (rule.complexityScore > 70) priority += 10;
    
    return priority;
  }

  generateRecommendations(ruleAnalysis) {
    const recommendations = {
      optimizedRules: [],
      suggestions: [],
      priorityActions: []
    };
    
    // Generate specific recommendations for each optimization opportunity
    ruleAnalysis.optimizationOpportunities.forEach(opportunity => {
      const recommendation = this.generateRuleRecommendation(opportunity);
      recommendations.suggestions.push(recommendation);
      
      if (opportunity.priority >= 40) {
        recommendations.priorityActions.push({
          rule: opportunity.filename,
          action: recommendation.action,
          priority: opportunity.priority
        });
      }
    });
    
    // Generate general optimization suggestions
    recommendations.suggestions.push(...this.generateGeneralRecommendations(ruleAnalysis));
    
    return recommendations;
  }

  generateRuleRecommendation(opportunity) {
    const issues = opportunity.issues;
    let action = '';
    let description = '';
    
    if (issues.includes('Low performance score')) {
      action = 'Improve rule performance';
      description = 'Add more actionable content, code examples, and clear guidance';
    } else if (issues.includes('Optimization needed')) {
      action = 'Optimize rule content';
      description = 'Add specific examples, step-by-step instructions, and best practices';
    } else if (issues.includes('High complexity')) {
      action = 'Simplify rule complexity';
      description = 'Break down complex concepts into simpler, more digestible parts';
    } else if (issues.includes('Low clarity')) {
      action = 'Improve rule clarity';
      description = 'Add examples, use clearer language, and improve formatting';
    }
    
    return {
      rule: opportunity.filename,
      title: opportunity.title,
      type: opportunity.type,
      action,
      description,
      priority: opportunity.priority,
      issues: opportunity.issues
    };
  }

  generateGeneralRecommendations(ruleAnalysis) {
    const recommendations = [];
    
    // Performance-based recommendations
    if (ruleAnalysis.performanceMetrics.lowPerformanceRules > 0) {
      recommendations.push({
        type: 'performance',
        action: 'Improve low-performance rules',
        description: `${ruleAnalysis.performanceMetrics.lowPerformanceRules} rules have performance scores below 60. Focus on adding actionable content and code examples.`,
        priority: 'high'
      });
    }
    
    // Optimization-based recommendations
    if (ruleAnalysis.performanceMetrics.optimizationOpportunities > 0) {
      recommendations.push({
        type: 'optimization',
        action: 'Optimize rule content',
        description: `${ruleAnalysis.performanceMetrics.optimizationOpportunities} rules need optimization. Add specific examples and step-by-step guidance.`,
        priority: 'medium'
      });
    }
    
    // Clarity-based recommendations
    const lowClarityRules = ruleAnalysis.rules.filter(rule => rule.clarityScore < 60).length;
    if (lowClarityRules > 0) {
      recommendations.push({
        type: 'clarity',
        action: 'Improve rule clarity',
        description: `${lowClarityRules} rules have low clarity scores. Use simpler language and add more examples.`,
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  updatePerformanceData(existingData, ruleAnalysis) {
    const newPerformanceData = {
      timestamp: new Date().toISOString(),
      totalRules: ruleAnalysis.totalRules,
      performanceMetrics: ruleAnalysis.performanceMetrics,
      optimizationOpportunities: ruleAnalysis.optimizationOpportunities.length
    };
    
    return {
      rulePerformance: [...existingData.rulePerformance, newPerformanceData],
      optimizationHistory: [...existingData.optimizationHistory, ruleAnalysis.performanceMetrics],
      lastUpdated: new Date().toISOString()
    };
  }

  async saveRecommendations(recommendations) {
    try {
      fs.mkdirSync(path.dirname(this.recommendationsFile), { recursive: true });
      fs.writeFileSync(this.recommendationsFile, JSON.stringify(recommendations, null, 2));
      console.log(`💾 Saved recommendations with ${recommendations.suggestions.length} suggestions`);
    } catch (error) {
      console.warn('⚠️ Failed to save recommendations:', error.message);
    }
  }

  async generateOptimizationReport(ruleAnalysis, recommendations) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalRules: ruleAnalysis.totalRules,
        performanceMetrics: ruleAnalysis.performanceMetrics,
        optimizationOpportunities: ruleAnalysis.optimizationOpportunities.length,
        recommendations: recommendations.suggestions.length,
        priorityActions: recommendations.priorityActions.length
      },
      topOptimizationOpportunities: ruleAnalysis.optimizationOpportunities.slice(0, 10),
      recommendations: recommendations.suggestions,
      priorityActions: recommendations.priorityActions
    };
    
    const reportPath = path.join(this.sourceDir, 'reports', 'optimization-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated optimization report: ${reportPath}`);
  }

  // Automated rule update functionality
  async updateRuleFromMd(mdFilePath, ruleFilename) {
    try {
      const mdContent = fs.readFileSync(mdFilePath, 'utf8');
      const ruleContent = this.convertMdToRule(mdContent);
      
      const rulePath = path.join(this.sourceDir, 'cursor-rules', ruleFilename);
      fs.writeFileSync(rulePath, ruleContent);
      
      console.log(`✅ Updated rule: ${ruleFilename}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to update rule ${ruleFilename}:`, error.message);
      return false;
    }
  }

  convertMdToRule(mdContent) {
    const title = this.extractTitleFromMd(mdContent);
    const type = this.determineRuleType(mdContent);
    
    return `# ${title}

${mdContent}

---
**Generated by Agent OS Cursor Rule Optimizer**
**Source**: .agent-os framework
**Last Updated**: ${new Date().toISOString()}
**Type**: ${type}
`;
  }

  extractTitleFromMd(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : 'Unknown Rule';
  }

  determineRuleType(content) {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('standard') || contentLower.includes('compliance')) {
      return 'standard';
    } else if (contentLower.includes('lesson') || contentLower.includes('learned')) {
      return 'lesson';
    } else if (contentLower.includes('template') || contentLower.includes('pattern')) {
      return 'template';
    } else if (contentLower.includes('rule') || contentLower.includes('guideline')) {
      return 'rule';
    } else {
      return 'general';
    }
  }

  // Batch update functionality
  async batchUpdateRules(mdFiles) {
    console.log('🔄 Starting batch rule update...');
    
    const results = [];
    for (const mdFile of mdFiles) {
      const ruleFilename = path.basename(mdFile, '.md') + '.mdc';
      const success = await this.updateRuleFromMd(mdFile, ruleFilename);
      results.push({
        mdFile,
        ruleFile: ruleFilename,
        success
      });
    }
    
    console.log(`✅ Batch update completed: ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
  }
}

// Run the optimizer
if (require.main === module) {
  const optimizer = new CursorRuleOptimizer();
  optimizer.run().catch(console.error);
}

module.exports = CursorRuleOptimizer; 