#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class LessonImpactTracker {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.lessonsDir = path.join(this.sourceDir, 'lessons-learned');
    this.reportsDir = path.join(this.sourceDir, 'reports');
    this.impactFile = path.join(this.reportsDir, 'lesson-impact.json');
    this.impactHistoryFile = path.join(this.reportsDir, 'impact-history.json');
    this.statisticalAnalysisFile = path.join(__dirname, 'statistical-analysis.js');
  }

  async run() {
    console.log('🚀 Starting Lesson Impact Tracker...');
    
    try {
      // 1. Load existing impact data
      const impactData = await this.loadImpactData();
      
      // 2. Discover lesson files
      const lessonFiles = this.discoverLessonFiles();
      console.log(`📁 Found ${lessonFiles.length} lesson files`);
      
      // 3. Analyze lesson impact
      const impactResults = await this.analyzeLessonImpact(lessonFiles);
      
      // 4. Update impact data
      const updatedData = this.updateImpactData(impactData, impactResults);
      
      // 5. Save impact data
      await this.saveImpactData(updatedData);
      
      // 6. Generate impact report
      await this.generateImpactReport(impactResults);
      
      console.log('🎉 Lesson Impact Tracker completed!');
      
      return {
        success: true,
        totalLessons: lessonFiles.length,
        analyzedLessons: impactResults.analyzedLessons.length,
        impactScore: impactResults.averageImpactScore
      };
    } catch (error) {
      console.error('❌ Lesson Impact Tracker failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadImpactData() {
    try {
      if (fs.existsSync(this.impactFile)) {
        const data = JSON.parse(fs.readFileSync(this.impactFile, 'utf8'));
        console.log(`📦 Loaded existing impact data with ${data.impactHistory.length} impact records`);
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load impact data:', error.message);
    }
    
    return {
      impactHistory: [],
      impactMetrics: [],
      lastUpdated: null
    };
  }

  async saveImpactData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.mkdirSync(path.dirname(this.impactFile), { recursive: true });
      fs.writeFileSync(this.impactFile, JSON.stringify(data, null, 2));
      console.log(`💾 Saved impact data with ${data.impactHistory.length} impact records`);
    } catch (error) {
      console.warn('⚠️ Failed to save impact data:', error.message);
    }
  }

  discoverLessonFiles() {
    const files = [];
    
    if (fs.existsSync(this.lessonsDir)) {
      const items = fs.readdirSync(this.lessonsDir, { withFileTypes: true });
      
      items.forEach(item => {
        if (item.isFile() && item.name.endsWith('.md')) {
          files.push(path.join(this.lessonsDir, item.name));
        }
      });
    }
    
    return files;
  }

  async analyzeLessonImpact(lessonFiles) {
    const analyzedLessons = [];
    const impactScores = [];
    const overallImpactMetrics = {
      technicalImpact: 0,
      processImpact: 0,
      projectImpact: 0,
      qualityImpact: 0,
      adoptionImpact: 0
    };
    
    for (const file of lessonFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const metadata = this.extractLessonMetadata(content, file);
        const impactScore = this.calculateImpactScore(content, metadata);
        const lessonImpactMetrics = this.calculateImpactMetrics(content, metadata);
        
        analyzedLessons.push({
          filename: path.basename(file),
          title: metadata.title,
          date: metadata.date,
          project: metadata.project,
          phase: metadata.phase,
          priority: metadata.priority,
          impactScore,
          impactMetrics: lessonImpactMetrics,
          categories: metadata.categories,
          tags: metadata.tags,
          insights: metadata.keyInsights.length,
          recommendations: metadata.recommendations.length
        });
        
        impactScores.push(impactScore);
        
        // Update overall impact metrics
        Object.keys(lessonImpactMetrics).forEach(key => {
          if (lessonImpactMetrics[key]) {
            this.updateImpactMetric(overallImpactMetrics, key, lessonImpactMetrics[key]);
          }
        });
        
      } catch (error) {
        console.warn(`⚠️ Failed to analyze impact for ${path.basename(file)}: ${error.message}`);
      }
    }
    
    const averageImpactScore = impactScores.length > 0 
      ? Math.round(impactScores.reduce((sum, score) => sum + score, 0) / impactScores.length)
      : 0;
    
    return {
      analyzedLessons,
      impactScores,
      averageImpactScore,
      impactMetrics: overallImpactMetrics,
      totalLessons: lessonFiles.length,
      analysisTimestamp: new Date().toISOString()
    };
  }

  extractLessonMetadata(content, filePath) {
    return {
      title: this.extractTitle(content),
      date: this.extractDate(content),
      project: this.extractProject(content),
      phase: this.extractPhase(content),
      priority: this.extractPriority(content),
      categories: this.extractCategories(content),
      tags: this.extractTags(content),
      keyInsights: this.extractKeyInsights(content),
      recommendations: this.extractRecommendations(content)
    };
  }

  extractTitle(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : path.basename(filePath, '.md');
  }

  extractDate(content) {
    const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
  }

  extractProject(content) {
    if (content.includes('Agent OS') || content.includes('.agent-os')) {
      return 'Agent OS';
    }
    return 'Unknown';
  }

  extractPhase(content) {
    const phaseKeywords = {
      'planning': ['plan', 'planning', 'strategy'],
      'development': ['develop', 'implementation', 'coding'],
      'testing': ['test', 'testing', 'validation'],
      'deployment': ['deploy', 'deployment', 'production'],
      'maintenance': ['maintain', 'maintenance', 'support']
    };
    
    const contentLower = content.toLowerCase();
    for (const [phase, keywords] of Object.entries(phaseKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return phase;
      }
    }
    return 'general';
  }

  extractPriority(content) {
    const priorityKeywords = {
      'critical': ['critical', 'urgent', 'blocker'],
      'high': ['high', 'important', 'priority'],
      'medium': ['medium', 'normal'],
      'low': ['low', 'minor', 'nice-to-have']
    };
    
    const contentLower = content.toLowerCase();
    for (const [priority, keywords] of Object.entries(priorityKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return priority;
      }
    }
    return 'medium';
  }

  extractCategories(content) {
    const categories = [];
    const contentLower = content.toLowerCase();
    
    const categoryKeywords = {
      'technical': ['javascript', 'typescript', 'java', 'spring', 'react'],
      'process': ['workflow', 'process', 'procedure', 'methodology'],
      'project': ['project', 'management', 'planning', 'strategy'],
      'quality': ['quality', 'testing', 'validation', 'compliance'],
      'adoption': ['adoption', 'implementation', 'deployment', 'rollout']
    };
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        categories.push(category);
      }
    });
    
    return categories;
  }

  extractTags(content) {
    const tags = [];
    const contentLower = content.toLowerCase();
    
    const tagKeywords = [
      'technical', 'performance', 'security', 'ux', 'process', 'team',
      'spring-boot', 'react', 'testing', 'deployment', 'monitoring',
      'cursor', 'ai', 'automation', 'quality', 'compliance'
    ];
    
    tagKeywords.forEach(tag => {
      if (contentLower.includes(tag)) {
        tags.push(tag);
      }
    });
    
    return tags;
  }

  extractKeyInsights(content) {
    const insights = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('insight') || line.includes('learned') || line.includes('discovered')) {
        insights.push(line.trim());
      }
    });
    
    return insights;
  }

  extractRecommendations(content) {
    const recommendations = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('recommend') || line.includes('should') || line.includes('must')) {
        recommendations.push(line.trim());
      }
    });
    
    return recommendations;
  }

  calculateImpactScore(content, metadata) {
    let score = 50; // Base score
    
    // Priority-based impact
    switch (metadata.priority) {
      case 'critical': score += 30; break;
      case 'high': score += 20; break;
      case 'medium': score += 10; break;
      case 'low': score += 5; break;
    }
    
    // Phase-based impact
    switch (metadata.phase) {
      case 'planning': score += 15; break;
      case 'development': score += 20; break;
      case 'testing': score += 15; break;
      case 'deployment': score += 25; break;
      case 'maintenance': score += 10; break;
    }
    
    // Content quality impact
    if (metadata.keyInsights.length > 0) score += 10;
    if (metadata.recommendations.length > 0) score += 10;
    if (metadata.categories.length > 0) score += 5;
    if (metadata.tags.length > 0) score += 5;
    
    // Technical impact indicators
    if (content.includes('production') || content.includes('deploy')) score += 10;
    if (content.includes('critical') || content.includes('urgent')) score += 10;
    if (content.includes('success') || content.includes('improved')) score += 5;
    if (content.includes('failure') || content.includes('error')) score += 5;
    
    // Length and detail impact
    if (content.length > 1000) score += 5;
    if (content.includes('```')) score += 5;
    if (content.includes('**') || content.includes('*')) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  calculateImpactMetrics(content, metadata) {
    const metrics = {
      technicalImpact: 0,
      processImpact: 0,
      projectImpact: 0,
      qualityImpact: 0,
      adoptionImpact: 0
    };
    
    const contentLower = content.toLowerCase();
    
    // Technical impact
    if (contentLower.includes('javascript') || contentLower.includes('typescript') || 
        contentLower.includes('java') || contentLower.includes('spring')) {
      metrics.technicalImpact = 25;
    }
    
    // Process impact
    if (contentLower.includes('workflow') || contentLower.includes('process') || 
        contentLower.includes('procedure') || contentLower.includes('methodology')) {
      metrics.processImpact = 25;
    }
    
    // Project impact
    if (contentLower.includes('project') || contentLower.includes('management') || 
        contentLower.includes('planning') || contentLower.includes('strategy')) {
      metrics.projectImpact = 25;
    }
    
    // Quality impact
    if (contentLower.includes('quality') || contentLower.includes('testing') || 
        contentLower.includes('validation') || contentLower.includes('compliance')) {
      metrics.qualityImpact = 25;
    }
    
    // Adoption impact
    if (contentLower.includes('adoption') || contentLower.includes('implementation') || 
        contentLower.includes('deployment') || contentLower.includes('rollout')) {
      metrics.adoptionImpact = 25;
    }
    
    return metrics;
  }

  updateImpactMetric(metrics, key, value) {
    if (!metrics[key]) {
      metrics[key] = { total: 0, count: 0 };
    }
    metrics[key].total += value;
    metrics[key].count += 1;
  }

  updateImpactData(existingData, impactResults) {
    const newImpactData = {
      timestamp: new Date().toISOString(),
      totalLessons: impactResults.totalLessons,
      averageImpactScore: impactResults.averageImpactScore,
      impactScores: impactResults.impactScores,
      impactMetrics: impactResults.impactMetrics
    };
    
    return {
      impactHistory: [...existingData.impactHistory, newImpactData],
      impactMetrics: [...existingData.impactMetrics, impactResults.impactMetrics],
      lastUpdated: new Date().toISOString()
    };
  }

  async generateImpactReport(impactResults) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalLessons: impactResults.totalLessons,
        analyzedLessons: impactResults.analyzedLessons.length,
        averageImpactScore: impactResults.averageImpactScore,
        topImpactLessons: this.getTopImpactLessons(impactResults.analyzedLessons, 5)
      },
      impactDistribution: this.calculateImpactDistribution(impactResults.impactScores),
      impactMetrics: this.calculateAverageImpactMetrics(impactResults.analyzedLessons),
      impactTrends: this.calculateImpactTrends(impactResults.analyzedLessons)
    };
    
    const reportPath = path.join(this.reportsDir, 'impact-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated impact report: ${reportPath}`);
  }

  getTopImpactLessons(analyzedLessons, limit) {
    return analyzedLessons
      .sort((a, b) => b.impactScore - a.impactScore)
      .slice(0, limit)
      .map(lesson => ({
        filename: lesson.filename,
        title: lesson.title,
        impactScore: lesson.impactScore,
        phase: lesson.phase,
        priority: lesson.priority
      }));
  }

  calculateImpactDistribution(impactScores) {
    const distribution = {
      high: 0,    // 80-100
      medium: 0,  // 60-79
      low: 0,     // 40-59
      minimal: 0  // 0-39
    };
    
    impactScores.forEach(score => {
      if (score >= 80) distribution.high++;
      else if (score >= 60) distribution.medium++;
      else if (score >= 40) distribution.low++;
      else distribution.minimal++;
    });
    
    return distribution;
  }

  calculateAverageImpactMetrics(analyzedLessons) {
    const metrics = {
      technicalImpact: 0,
      processImpact: 0,
      projectImpact: 0,
      qualityImpact: 0,
      adoptionImpact: 0
    };
    
    analyzedLessons.forEach(lesson => {
      Object.keys(lesson.impactMetrics).forEach(key => {
        if (lesson.impactMetrics[key]) {
          metrics[key] += lesson.impactMetrics[key];
        }
      });
    });
    
    // Calculate averages
    Object.keys(metrics).forEach(key => {
      metrics[key] = Math.round(metrics[key] / analyzedLessons.length);
    });
    
    return metrics;
  }

  calculateImpactTrends(analyzedLessons) {
    const trends = {
      byPhase: {},
      byPriority: {},
      byCategory: {}
    };
    
    // Calculate average impact scores by phase
    analyzedLessons.forEach(lesson => {
      if (!trends.byPhase[lesson.phase]) {
        trends.byPhase[lesson.phase] = { total: 0, count: 0 };
      }
      trends.byPhase[lesson.phase].total += lesson.impactScore;
      trends.byPhase[lesson.phase].count++;
    });
    
    // Calculate average impact scores by priority
    analyzedLessons.forEach(lesson => {
      if (!trends.byPriority[lesson.priority]) {
        trends.byPriority[lesson.priority] = { total: 0, count: 0 };
      }
      trends.byPriority[lesson.priority].total += lesson.impactScore;
      trends.byPriority[lesson.priority].count++;
    });
    
    // Calculate average impact scores by category
    analyzedLessons.forEach(lesson => {
      lesson.categories.forEach(category => {
        if (!trends.byCategory[category]) {
          trends.byCategory[category] = { total: 0, count: 0 };
        }
        trends.byCategory[category].total += lesson.impactScore;
        trends.byCategory[category].count++;
      });
    });
    
    // Convert to averages
    Object.keys(trends.byPhase).forEach(phase => {
      trends.byPhase[phase] = Math.round(trends.byPhase[phase].total / trends.byPhase[phase].count);
    });
    
    Object.keys(trends.byPriority).forEach(priority => {
      trends.byPriority[priority] = Math.round(trends.byPriority[priority].total / trends.byPriority[priority].count);
    });
    
    Object.keys(trends.byCategory).forEach(category => {
      trends.byCategory[category] = Math.round(trends.byCategory[category].total / trends.byCategory[category].count);
    });
    
    return trends;
  }

  // Additional utility methods
  getLessonImpactRecommendations(lessonFilename) {
    const impactData = JSON.parse(fs.readFileSync(this.impactFile, 'utf8'));
    const latestImpact = impactData.impactHistory[impactData.impactHistory.length - 1];
    
    const targetLesson = latestImpact.analyzedLessons.find(lesson => 
      lesson.filename === lessonFilename
    );
    
    if (!targetLesson) return [];
    
    const recommendations = [];
    
    // Impact-based recommendations
    if (targetLesson.impactScore < 60) {
      recommendations.push('Add more actionable recommendations to increase lesson impact');
    }
    
    if (targetLesson.insights < 2) {
      recommendations.push('Add more key insights to make the lesson more impactful');
    }
    
    if (targetLesson.recommendations < 2) {
      recommendations.push('Add more specific recommendations for future implementation');
    }
    
    if (targetLesson.categories.length < 2) {
      recommendations.push('Add more categories to increase lesson discoverability and impact');
    }
    
    return recommendations;
  }
}

// Run the tracker
if (require.main === module) {
  const tracker = new LessonImpactTracker();
  tracker.run().catch(console.error);
}

module.exports = LessonImpactTracker; 