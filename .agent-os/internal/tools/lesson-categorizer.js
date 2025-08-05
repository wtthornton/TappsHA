#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class LessonCategorizer {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.lessonsDir = path.join(this.sourceDir, 'lessons-learned');
    this.categoriesFile = path.join(this.sourceDir, 'reports', 'lesson-categories.json');
    this.categorizationHistoryFile = path.join(this.sourceDir, 'reports', 'categorization-history.json');
  }

  async run() {
    console.log('🚀 Starting Lesson Categorizer...');
    
    try {
      // 1. Load existing categorization data
      const categorizationData = await this.loadCategorizationData();
      
      // 2. Discover lesson files
      const lessonFiles = this.discoverLessonFiles();
      console.log(`📁 Found ${lessonFiles.length} lesson files`);
      
      // 3. Categorize lessons
      const categorizationResults = await this.categorizeLessons(lessonFiles);
      
      // 4. Update categorization data
      const updatedData = this.updateCategorizationData(categorizationData, categorizationResults);
      
      // 5. Save categorization data
      await this.saveCategorizationData(updatedData);
      
      // 6. Generate categorization report
      await this.generateCategorizationReport(categorizationResults);
      
      console.log('🎉 Lesson Categorizer completed!');
      
      return {
        success: true,
        totalLessons: lessonFiles.length,
        categorizedLessons: categorizationResults.categorizedLessons.length,
        categories: Object.keys(categorizationResults.categoryStats).length
      };
    } catch (error) {
      console.error('❌ Lesson Categorizer failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadCategorizationData() {
    try {
      if (fs.existsSync(this.categoriesFile)) {
        const data = JSON.parse(fs.readFileSync(this.categoriesFile, 'utf8'));
        console.log(`📦 Loaded existing categorization data with ${data.categories.length} categories`);
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load categorization data:', error.message);
    }
    
    return {
      categories: [],
      categorizationHistory: [],
      lastUpdated: null
    };
  }

  async saveCategorizationData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.mkdirSync(path.dirname(this.categoriesFile), { recursive: true });
      fs.writeFileSync(this.categoriesFile, JSON.stringify(data, null, 2));
      console.log(`💾 Saved categorization data with ${data.categories.length} categories`);
    } catch (error) {
      console.warn('⚠️ Failed to save categorization data:', error.message);
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

  async categorizeLessons(lessonFiles) {
    const categorizedLessons = [];
    const categoryStats = {};
    
    for (const file of lessonFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const metadata = this.extractLessonMetadata(content, file);
        const categories = this.determineCategories(content, metadata);
        
        categorizedLessons.push({
          filename: path.basename(file),
          title: metadata.title,
          date: metadata.date,
          project: metadata.project,
          phase: metadata.phase,
          priority: metadata.priority,
          categories,
          tags: metadata.tags,
          qualityScore: this.calculateQualityScore(content, metadata)
        });
        
        // Update category statistics
        categories.forEach(category => {
          categoryStats[category] = (categoryStats[category] || 0) + 1;
        });
        
      } catch (error) {
        console.warn(`⚠️ Failed to categorize ${path.basename(file)}: ${error.message}`);
      }
    }
    
    return {
      categorizedLessons,
      categoryStats,
      totalLessons: lessonFiles.length,
      categorizationTimestamp: new Date().toISOString()
    };
  }

  extractLessonMetadata(content, filePath) {
    return {
      title: this.extractTitle(content),
      date: this.extractDate(content),
      project: this.extractProject(content),
      phase: this.extractPhase(content),
      priority: this.extractPriority(content),
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

  determineCategories(content, metadata) {
    const categories = new Set();
    const contentLower = content.toLowerCase();
    
    // Technical categories
    if (contentLower.includes('javascript') || contentLower.includes('typescript')) {
      categories.add('frontend');
    }
    if (contentLower.includes('java') || contentLower.includes('spring')) {
      categories.add('backend');
    }
    if (contentLower.includes('database') || contentLower.includes('sql')) {
      categories.add('database');
    }
    if (contentLower.includes('deployment') || contentLower.includes('ci/cd')) {
      categories.add('devops');
    }
    
    // Process categories
    if (contentLower.includes('testing') || contentLower.includes('test')) {
      categories.add('testing');
    }
    if (contentLower.includes('security') || contentLower.includes('auth')) {
      categories.add('security');
    }
    if (contentLower.includes('performance') || contentLower.includes('optimization')) {
      categories.add('performance');
    }
    if (contentLower.includes('architecture') || contentLower.includes('design')) {
      categories.add('architecture');
    }
    
    // Project categories
    if (contentLower.includes('cursor') || contentLower.includes('ai')) {
      categories.add('ai-integration');
    }
    if (contentLower.includes('analytics') || contentLower.includes('metrics')) {
      categories.add('analytics');
    }
    if (contentLower.includes('documentation') || contentLower.includes('template')) {
      categories.add('documentation');
    }
    
    // Priority-based categories
    if (metadata.priority === 'critical') {
      categories.add('critical');
    }
    if (metadata.priority === 'high') {
      categories.add('high-priority');
    }
    
    // Phase-based categories
    if (metadata.phase !== 'general') {
      categories.add(metadata.phase);
    }
    
    // Default category if none found
    if (categories.size === 0) {
      categories.add('general');
    }
    
    return Array.from(categories);
  }

  calculateQualityScore(content, metadata) {
    let score = 60; // Base score
    
    // Check for required sections
    if (content.includes('## Context')) score += 10;
    if (content.includes('## Action Taken')) score += 10;
    if (content.includes('## Results')) score += 10;
    if (content.includes('## Key Insights')) score += 10;
    if (content.includes('## Recommendations')) score += 10;
    
    // Check for metadata completeness
    if (metadata.title && metadata.title !== 'Unknown') score += 5;
    if (metadata.date) score += 5;
    if (metadata.project && metadata.project !== 'Unknown') score += 5;
    if (metadata.phase && metadata.phase !== 'general') score += 5;
    if (metadata.priority) score += 5;
    
    // Check for content quality
    if (metadata.keyInsights.length > 0) score += 10;
    if (metadata.recommendations.length > 0) score += 10;
    if (metadata.tags.length > 0) score += 5;
    
    // Check for code examples
    if (content.includes('```')) score += 5;
    
    // Check for proper formatting
    if (content.includes('**') || content.includes('*')) score += 5;
    
    return Math.min(100, score);
  }

  updateCategorizationData(existingData, categorizationResults) {
    const newCategorizationData = {
      timestamp: new Date().toISOString(),
      totalLessons: categorizationResults.totalLessons,
      categoryStats: categorizationResults.categoryStats,
      categorizedLessons: categorizationResults.categorizedLessons.length
    };
    
    return {
      categories: [...existingData.categories, newCategorizationData],
      categorizationHistory: [...existingData.categorizationHistory, categorizationResults.categoryStats],
      lastUpdated: new Date().toISOString()
    };
  }

  async generateCategorizationReport(categorizationResults) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalLessons: categorizationResults.totalLessons,
        categorizedLessons: categorizationResults.categorizedLessons.length,
        categories: Object.keys(categorizationResults.categoryStats).length,
        topCategories: this.getTopCategories(categorizationResults.categoryStats, 5)
      },
      categoryStats: categorizationResults.categoryStats,
      lessonQuality: this.calculateLessonQualityStats(categorizationResults.categorizedLessons),
      topLessons: this.getTopLessons(categorizationResults.categorizedLessons, 10)
    };
    
    const reportPath = path.join(this.sourceDir, 'reports', 'categorization-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated categorization report: ${reportPath}`);
  }

  getTopCategories(categoryStats, limit) {
    return Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([category, count]) => ({ category, count }));
  }

  calculateLessonQualityStats(categorizedLessons) {
    const scores = categorizedLessons.map(lesson => lesson.qualityScore);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    return {
      averageQuality: Math.round(avgScore),
      highQualityLessons: scores.filter(score => score >= 80).length,
      lowQualityLessons: scores.filter(score => score < 60).length,
      totalLessons: scores.length
    };
  }

  getTopLessons(categorizedLessons, limit) {
    return categorizedLessons
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, limit)
      .map(lesson => ({
        filename: lesson.filename,
        title: lesson.title,
        qualityScore: lesson.qualityScore,
        categories: lesson.categories,
        priority: lesson.priority
      }));
  }

  // Additional utility methods
  getLessonsByCategory(category) {
    const categorizationData = JSON.parse(fs.readFileSync(this.categoriesFile, 'utf8'));
    const latestCategorization = categorizationData.categories[categorizationData.categories.length - 1];
    
    return latestCategorization.categorizedLessons.filter(lesson => 
      lesson.categories.includes(category)
    );
  }

  getLessonRecommendations(lessonFilename) {
    const categorizationData = JSON.parse(fs.readFileSync(this.categoriesFile, 'utf8'));
    const latestCategorization = categorizationData.categories[categorizationData.categories.length - 1];
    
    const targetLesson = latestCategorization.categorizedLessons.find(lesson => 
      lesson.filename === lessonFilename
    );
    
    if (!targetLesson) return [];
    
    // Find lessons with similar categories
    return latestCategorization.categorizedLessons
      .filter(lesson => 
        lesson.filename !== lessonFilename &&
        lesson.categories.some(cat => targetLesson.categories.includes(cat))
      )
      .sort((a, b) => {
        const aSimilarity = a.categories.filter(cat => targetLesson.categories.includes(cat)).length;
        const bSimilarity = b.categories.filter(cat => targetLesson.categories.includes(cat)).length;
        return bSimilarity - aSimilarity;
      })
      .slice(0, 5);
  }
}

// Run the categorizer
if (require.main === module) {
  const categorizer = new LessonCategorizer();
  categorizer.run().catch(console.error);
}

module.exports = LessonCategorizer; 