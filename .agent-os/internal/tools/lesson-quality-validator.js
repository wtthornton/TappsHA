#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class LessonQualityValidator {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.lessonsDir = path.join(this.sourceDir, 'lessons-learned');
    this.qualityFile = path.join(this.sourceDir, 'reports', 'lesson-quality.json');
    this.validationHistoryFile = path.join(this.sourceDir, 'reports', 'validation-history.json');
    this.schemaFile = path.join(this.sourceDir, 'templates', 'lesson-schema.json');
  }

  async run() {
    console.log('🚀 Starting Lesson Quality Validator...');
    
    try {
      // 1. Load existing quality data
      const qualityData = await this.loadQualityData();
      
      // 2. Load or create lesson schema
      const schema = await this.loadLessonSchema();
      
      // 3. Discover lesson files
      const lessonFiles = this.discoverLessonFiles();
      console.log(`📁 Found ${lessonFiles.length} lesson files`);
      
      // 4. Validate lessons
      const validationResults = await this.validateLessons(lessonFiles, schema);
      
      // 5. Update quality data
      const updatedData = this.updateQualityData(qualityData, validationResults);
      
      // 6. Save quality data
      await this.saveQualityData(updatedData);
      
      // 7. Generate quality report
      await this.generateQualityReport(validationResults);
      
      console.log('🎉 Lesson Quality Validator completed!');
      
      return {
        success: true,
        totalLessons: lessonFiles.length,
        validatedLessons: validationResults.validatedLessons.length,
        qualityScore: validationResults.averageQualityScore
      };
    } catch (error) {
      console.error('❌ Lesson Quality Validator failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadQualityData() {
    try {
      if (fs.existsSync(this.qualityFile)) {
        const data = JSON.parse(fs.readFileSync(this.qualityFile, 'utf8'));
        console.log(`📦 Loaded existing quality data with ${data.qualityHistory.length} quality records`);
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load quality data:', error.message);
    }
    
    return {
      qualityHistory: [],
      validationHistory: [],
      lastUpdated: null
    };
  }

  async saveQualityData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.mkdirSync(path.dirname(this.qualityFile), { recursive: true });
      fs.writeFileSync(this.qualityFile, JSON.stringify(data, null, 2));
      console.log(`💾 Saved quality data with ${data.qualityHistory.length} quality records`);
    } catch (error) {
      console.warn('⚠️ Failed to save quality data:', error.message);
    }
  }

  async loadLessonSchema() {
    try {
      if (fs.existsSync(this.schemaFile)) {
        const schema = JSON.parse(fs.readFileSync(this.schemaFile, 'utf8'));
        console.log(`📋 Loaded lesson schema with ${Object.keys(schema.properties).length} properties`);
        return schema;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load lesson schema:', error.message);
    }
    
    // Create default schema if not exists
    const defaultSchema = this.createDefaultSchema();
    await this.saveLessonSchema(defaultSchema);
    return defaultSchema;
  }

  async saveLessonSchema(schema) {
    try {
      fs.mkdirSync(path.dirname(this.schemaFile), { recursive: true });
      fs.writeFileSync(this.schemaFile, JSON.stringify(schema, null, 2));
      console.log(`💾 Saved lesson schema`);
    } catch (error) {
      console.warn('⚠️ Failed to save lesson schema:', error.message);
    }
  }

  createDefaultSchema() {
    return {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "required": ["title", "date", "project", "phase", "priority"],
      "properties": {
        "title": {
          "type": "string",
          "minLength": 1,
          "description": "Lesson title"
        },
        "date": {
          "type": "string",
          "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
          "description": "Lesson date in YYYY-MM-DD format"
        },
        "project": {
          "type": "string",
          "minLength": 1,
          "description": "Project name"
        },
        "phase": {
          "type": "string",
          "enum": ["planning", "development", "testing", "deployment", "maintenance", "general"],
          "description": "Development phase"
        },
        "priority": {
          "type": "string",
          "enum": ["critical", "high", "medium", "low"],
          "description": "Lesson priority"
        },
        "tags": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "description": "Lesson tags"
        },
        "sections": {
          "type": "object",
          "required": ["context", "actionTaken", "results", "keyInsights", "recommendations"],
          "properties": {
            "context": {
              "type": "string",
              "minLength": 10,
              "description": "Context section"
            },
            "actionTaken": {
              "type": "string",
              "minLength": 10,
              "description": "Action taken section"
            },
            "results": {
              "type": "string",
              "minLength": 10,
              "description": "Results section"
            },
            "keyInsights": {
              "type": "string",
              "minLength": 10,
              "description": "Key insights section"
            },
            "recommendations": {
              "type": "string",
              "minLength": 10,
              "description": "Recommendations section"
            }
          }
        }
      }
    };
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

  async validateLessons(lessonFiles, schema) {
    const validatedLessons = [];
    const validationErrors = [];
    const qualityScores = [];
    
    for (const file of lessonFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const metadata = this.extractLessonMetadata(content, file);
        const sections = this.extractLessonSections(content);
        
        // Create lesson object for validation
        const lessonObject = {
          ...metadata,
          sections
        };
        
        // Validate against schema
        const validationResult = this.validateAgainstSchema(lessonObject, schema);
        
        // Calculate quality score
        const qualityScore = this.calculateQualityScore(content, metadata, sections, validationResult);
        
        validatedLessons.push({
          filename: path.basename(file),
          title: metadata.title,
          date: metadata.date,
          project: metadata.project,
          phase: metadata.phase,
          priority: metadata.priority,
          qualityScore,
          validationResult,
          sections: Object.keys(sections),
          tags: metadata.tags,
          insights: metadata.keyInsights.length,
          recommendations: metadata.recommendations.length
        });
        
        qualityScores.push(qualityScore);
        
        if (!validationResult.isValid) {
          validationErrors.push({
            filename: path.basename(file),
            errors: validationResult.errors
          });
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to validate ${path.basename(file)}: ${error.message}`);
      }
    }
    
    const averageQualityScore = qualityScores.length > 0 
      ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length)
      : 0;
    
    return {
      validatedLessons,
      validationErrors,
      qualityScores,
      averageQualityScore,
      totalLessons: lessonFiles.length,
      validationTimestamp: new Date().toISOString()
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

  extractLessonSections(content) {
    const sections = {};
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];
    
    lines.forEach(line => {
      if (line.startsWith('## ')) {
        if (currentSection) {
          sections[currentSection] = currentContent.join('\n').trim();
        }
        // Extract section name and normalize it
        const sectionName = line.replace('## ', '').trim();
        currentSection = this.normalizeSectionName(sectionName);
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    });
    
    if (currentSection) {
      sections[currentSection] = currentContent.join('\n').trim();
    }
    
    return sections;
  }

  normalizeSectionName(sectionName) {
    // Map common section names to normalized versions
    const sectionMap = {
      'context': 'context',
      'action taken': 'actiontaken',
      'action': 'actiontaken',
      'results': 'results',
      'key insights': 'keyinsights',
      'insights': 'keyinsights',
      'recommendations': 'recommendations',
      'recommendation': 'recommendations',
      'follow-up actions': 'followupactions',
      'follow up actions': 'followupactions',
      'related lessons': 'relatedlessons',
      'tags': 'tags'
    };
    
    const normalized = sectionName.toLowerCase().trim();
    return sectionMap[normalized] || normalized.replace(/\s+/g, '');
  }

  validateAgainstSchema(lessonObject, schema) {
    const errors = [];
    
    // Check required fields
    schema.required.forEach(field => {
      if (!lessonObject[field] || lessonObject[field] === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Check field types and constraints
    Object.entries(schema.properties).forEach(([field, fieldSchema]) => {
      const value = lessonObject[field];
      
      if (value !== undefined && value !== null) {
        // Type validation
        if (fieldSchema.type === 'string' && typeof value !== 'string') {
          errors.push(`Field ${field} must be a string`);
        }
        
        // Length validation
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`Field ${field} must be at least ${fieldSchema.minLength} characters`);
        }
        
        // Pattern validation
        if (fieldSchema.pattern && !new RegExp(fieldSchema.pattern).test(value)) {
          errors.push(`Field ${field} does not match required pattern`);
        }
        
        // Enum validation
        if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
          errors.push(`Field ${field} must be one of: ${fieldSchema.enum.join(', ')}`);
        }
      }
    });
    
    // Check sections if required
    if (schema.properties.sections && lessonObject.sections) {
      const sectionSchema = schema.properties.sections;
      sectionSchema.required.forEach(sectionName => {
        if (!lessonObject.sections[sectionName] || lessonObject.sections[sectionName].length < 10) {
          errors.push(`Section ${sectionName} is required and must be at least 10 characters`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      errorCount: errors.length
    };
  }

  calculateQualityScore(content, metadata, sections, validationResult) {
    let score = 60; // Base score
    
    // Schema validation score
    if (validationResult.isValid) {
      score += 20;
    } else {
      score -= validationResult.errorCount * 5;
    }
    
    // Required sections score
    const requiredSections = ['context', 'actiontaken', 'results', 'keyinsights', 'recommendations'];
    requiredSections.forEach(section => {
      if (sections[section] && sections[section].length > 10) {
        score += 8;
      }
    });
    
    // Metadata completeness score
    if (metadata.title && metadata.title !== 'Unknown') score += 5;
    if (metadata.date) score += 5;
    if (metadata.project && metadata.project !== 'Unknown') score += 5;
    if (metadata.phase && metadata.phase !== 'general') score += 5;
    if (metadata.priority) score += 5;
    
    // Content quality score
    if (metadata.keyInsights.length > 0) score += 10;
    if (metadata.recommendations.length > 0) score += 10;
    if (metadata.tags.length > 0) score += 5;
    
    // Code examples score
    if (content.includes('```')) score += 5;
    
    // Formatting score
    if (content.includes('**') || content.includes('*')) score += 5;
    
    // Length score
    if (content.length > 500) score += 5;
    if (content.length > 1000) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  updateQualityData(existingData, validationResults) {
    const newQualityData = {
      timestamp: new Date().toISOString(),
      totalLessons: validationResults.totalLessons,
      averageQualityScore: validationResults.averageQualityScore,
      validationErrors: validationResults.validationErrors.length,
      qualityScores: validationResults.qualityScores
    };
    
    return {
      qualityHistory: [...existingData.qualityHistory, newQualityData],
      validationHistory: [...existingData.validationHistory, validationResults.validationErrors],
      lastUpdated: new Date().toISOString()
    };
  }

  async generateQualityReport(validationResults) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalLessons: validationResults.totalLessons,
        validatedLessons: validationResults.validatedLessons.length,
        averageQualityScore: validationResults.averageQualityScore,
        validationErrors: validationResults.validationErrors.length,
        topQualityLessons: this.getTopQualityLessons(validationResults.validatedLessons, 5)
      },
      qualityDistribution: this.calculateQualityDistribution(validationResults.qualityScores),
      validationErrors: validationResults.validationErrors,
      qualityTrends: this.calculateQualityTrends(validationResults.validatedLessons)
    };
    
    const reportPath = path.join(this.sourceDir, 'reports', 'quality-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated quality report: ${reportPath}`);
  }

  getTopQualityLessons(validatedLessons, limit) {
    return validatedLessons
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, limit)
      .map(lesson => ({
        filename: lesson.filename,
        title: lesson.title,
        qualityScore: lesson.qualityScore,
        phase: lesson.phase,
        priority: lesson.priority
      }));
  }

  calculateQualityDistribution(qualityScores) {
    const distribution = {
      excellent: 0, // 90-100
      good: 0,      // 80-89
      fair: 0,      // 70-79
      poor: 0,      // 60-69
      failing: 0    // 0-59
    };
    
    qualityScores.forEach(score => {
      if (score >= 90) distribution.excellent++;
      else if (score >= 80) distribution.good++;
      else if (score >= 70) distribution.fair++;
      else if (score >= 60) distribution.poor++;
      else distribution.failing++;
    });
    
    return distribution;
  }

  calculateQualityTrends(validatedLessons) {
    const trends = {
      byPhase: {},
      byPriority: {},
      bySection: {}
    };
    
    // Calculate average scores by phase
    validatedLessons.forEach(lesson => {
      if (!trends.byPhase[lesson.phase]) {
        trends.byPhase[lesson.phase] = { total: 0, count: 0 };
      }
      trends.byPhase[lesson.phase].total += lesson.qualityScore;
      trends.byPhase[lesson.phase].count++;
    });
    
    // Calculate average scores by priority
    validatedLessons.forEach(lesson => {
      if (!trends.byPriority[lesson.priority]) {
        trends.byPriority[lesson.priority] = { total: 0, count: 0 };
      }
      trends.byPriority[lesson.priority].total += lesson.qualityScore;
      trends.byPriority[lesson.priority].count++;
    });
    
    // Calculate average scores by section count
    validatedLessons.forEach(lesson => {
      const sectionCount = lesson.sections.length;
      if (!trends.bySection[sectionCount]) {
        trends.bySection[sectionCount] = { total: 0, count: 0 };
      }
      trends.bySection[sectionCount].total += lesson.qualityScore;
      trends.bySection[sectionCount].count++;
    });
    
    // Convert to averages
    Object.keys(trends.byPhase).forEach(phase => {
      trends.byPhase[phase] = Math.round(trends.byPhase[phase].total / trends.byPhase[phase].count);
    });
    
    Object.keys(trends.byPriority).forEach(priority => {
      trends.byPriority[priority] = Math.round(trends.byPriority[priority].total / trends.byPriority[priority].count);
    });
    
    Object.keys(trends.bySection).forEach(sectionCount => {
      trends.bySection[sectionCount] = Math.round(trends.bySection[sectionCount].total / trends.bySection[sectionCount].count);
    });
    
    return trends;
  }

  // Additional utility methods
  getLessonQualityRecommendations(lessonFilename) {
    const qualityData = JSON.parse(fs.readFileSync(this.qualityFile, 'utf8'));
    const latestQuality = qualityData.qualityHistory[qualityData.qualityHistory.length - 1];
    
    const targetLesson = latestQuality.validatedLessons.find(lesson => 
      lesson.filename === lessonFilename
    );
    
    if (!targetLesson) return [];
    
    const recommendations = [];
    
    // Quality-based recommendations
    if (targetLesson.qualityScore < 70) {
      recommendations.push('Add more detailed sections to improve lesson quality');
    }
    
    if (targetLesson.validationResult.errorCount > 0) {
      recommendations.push('Fix validation errors to improve lesson compliance');
    }
    
    if (targetLesson.sections.length < 5) {
      recommendations.push('Add missing required sections (Context, Action Taken, Results, Key Insights, Recommendations)');
    }
    
    if (targetLesson.insights < 2) {
      recommendations.push('Add more key insights to make the lesson more valuable');
    }
    
    if (targetLesson.recommendations < 2) {
      recommendations.push('Add more actionable recommendations');
    }
    
    return recommendations;
  }
}

// Run the validator
if (require.main === module) {
  const validator = new LessonQualityValidator();
  validator.run().catch(console.error);
}

module.exports = LessonQualityValidator; 