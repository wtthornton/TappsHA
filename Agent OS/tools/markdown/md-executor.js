#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class MarkdownExecutor {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.cache = new Map();
    this.executors = new Map();
    this.metadata = new Map();
  }

  async run() {
    console.log('🚀 Starting Generic Markdown Executor...');
    
    try {
      // 1. Discover and register .md files
      const mdFiles = this.discoverMarkdownFiles();
      console.log(`📁 Found ${mdFiles.length} markdown files`);
      
      // 2. Register executors for different file types
      this.registerExecutors();
      
      // 3. Execute files dynamically
      const results = await this.executeFiles(mdFiles);
      console.log(`⚙️ Executed ${results.length} files`);
      
      // 4. Generate execution report
      await this.generateReport(results);
      console.log('🎉 Generic Markdown Executor completed!');
      
      return {
        success: true,
        totalFiles: mdFiles.length,
        executedFiles: results.length,
        results
      };
    } catch (error) {
      console.error('❌ Generic Markdown Executor failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  discoverMarkdownFiles() {
    const patterns = [
      path.join(this.sourceDir, 'standards', '*.md'),
      path.join(this.sourceDir, 'lessons-learned', '**', '*.md'),
      path.join(this.sourceDir, 'templates', '*.md'),
      path.join(this.sourceDir, 'agent-improvements', '*.md')
    ];
    
    let files = [];
    patterns.forEach(pattern => {
      try {
        const matches = this.globSync(pattern);
        files = files.concat(matches);
      } catch (error) {
        console.warn(`⚠️ Pattern ${pattern} not found: ${error.message}`);
      }
    });
    
    return files.filter(file => fs.existsSync(file));
  }

  globSync(pattern) {
    // Simple glob implementation for .md files
    const dir = path.dirname(pattern);
    const ext = path.extname(pattern);
    const base = path.basename(pattern, ext);
    
    if (!fs.existsSync(dir)) {
      return [];
    }
    
    const files = [];
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    items.forEach(item => {
      if (item.isFile() && item.name.endsWith('.md')) {
        if (base === '*' || item.name.startsWith(base.replace('*', ''))) {
          files.push(path.join(dir, item.name));
        }
      } else if (item.isDirectory() && pattern.includes('**')) {
        // Recursively search subdirectories
        const subPattern = pattern.replace('**', item.name);
        const subFiles = this.globSync(subPattern);
        files.push(...subFiles);
      }
    });
    
    return files;
  }

  registerExecutors() {
    // Register different types of executors based on file patterns
    this.executors.set('standards', this.executeStandardsFile.bind(this));
    this.executors.set('lessons-learned', this.executeLessonsFile.bind(this));
    this.executors.set('templates', this.executeTemplatesFile.bind(this));
    this.executors.set('agent-improvements', this.executeImprovementsFile.bind(this));
    this.executors.set('default', this.executeGenericFile.bind(this));
  }

  async executeFiles(mdFiles) {
    const results = [];
    
    for (const file of mdFiles) {
      try {
        const result = await this.executeFile(file);
        results.push(result);
      } catch (error) {
        console.warn(`⚠️ Failed to execute ${file}: ${error.message}`);
        results.push({
          file,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async executeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const metadata = this.extractMetadata(content, filePath);
    const executorType = this.determineExecutorType(filePath);
    
    // Cache the parsed content
    this.cache.set(filePath, {
      content,
      metadata,
      lastModified: fs.statSync(filePath).mtime,
      executorType
    });
    
    // Execute based on file type
    const executor = this.executors.get(executorType) || this.executors.get('default');
    const result = await executor(filePath, content, metadata);
    
    return {
      file: filePath,
      success: true,
      executorType,
      metadata,
      result
    };
  }

  determineExecutorType(filePath) {
    const relativePath = path.relative(this.sourceDir, filePath);
    
    if (relativePath.startsWith('standards')) return 'standards';
    if (relativePath.startsWith('lessons-learned')) return 'lessons-learned';
    if (relativePath.startsWith('templates')) return 'templates';
    if (relativePath.startsWith('agent-improvements')) return 'agent-improvements';
    
    return 'default';
  }

  extractMetadata(content, filePath) {
    return {
      title: this.extractTitle(content),
      date: this.extractDate(content),
      project: this.extractProject(content),
      phase: this.extractPhase(content),
      priority: this.extractPriority(content),
      tags: this.extractTags(content),
      keyInsights: this.extractKeyInsights(content),
      recommendations: this.extractRecommendations(content),
      sections: this.extractSections(content)
    };
  }

  extractTitle(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        return line.replace('# ', '').trim();
      }
    }
    return path.basename(filePath, '.md');
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

  extractSections(content) {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = null;
    
    lines.forEach(line => {
      if (line.startsWith('#')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          content: [line],
          level: (line.match(/^#+/)[0].length)
        };
      } else if (currentSection) {
        currentSection.content.push(line);
      }
    });
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  // Executor implementations
  async executeStandardsFile(filePath, content, metadata) {
    // Execute standards files - generate compliance rules
    const rules = this.generateComplianceRules(content, metadata);
    return {
      type: 'standards',
      rules,
      complianceScore: this.calculateComplianceScore(content),
      actionItems: this.extractActionItems(content)
    };
  }

  async executeLessonsFile(filePath, content, metadata) {
    // Execute lessons learned files - generate insights and recommendations
    const insights = this.extractInsights(content);
    const recommendations = this.extractRecommendations(content);
    return {
      type: 'lessons',
      insights,
      recommendations,
      impactScore: this.calculateImpactScore(content),
      applicability: this.determineApplicability(content)
    };
  }

  async executeTemplatesFile(filePath, content, metadata) {
    // Execute template files - generate reusable patterns
    const patterns = this.extractPatterns(content);
    return {
      type: 'templates',
      patterns,
      reusabilityScore: this.calculateReusabilityScore(content),
      usageExamples: this.extractUsageExamples(content)
    };
  }

  async executeImprovementsFile(filePath, content, metadata) {
    // Execute improvement files - generate enhancement suggestions
    const improvements = this.extractImprovements(content);
    return {
      type: 'improvements',
      improvements,
      priorityScore: this.calculatePriorityScore(content),
      implementationPlan: this.generateImplementationPlan(content)
    };
  }

  async executeGenericFile(filePath, content, metadata) {
    // Generic executor for any .md file
    return {
      type: 'generic',
      content: content.substring(0, 200) + '...',
      metadata,
      analysis: this.performGenericAnalysis(content)
    };
  }

  // Helper methods for different executors
  generateComplianceRules(content, metadata) {
    const rules = [];
    const sections = this.extractSections(content);
    
    sections.forEach(section => {
      if (this.isRuleWorthy(section.title, section.content.join('\n'))) {
        rules.push({
          title: section.title,
          content: section.content.join('\n'),
          type: this.determineRuleType(section.title, section.content.join('\n'))
        });
      }
    });
    
    return rules;
  }

  calculateComplianceScore(content) {
    let score = 100;
    const contentLower = content.toLowerCase();
    
    // Check for compliance indicators
    if (contentLower.includes('always') || contentLower.includes('must')) score += 10;
    if (contentLower.includes('never') || contentLower.includes('avoid')) score += 10;
    if (contentLower.includes('standard') || contentLower.includes('compliance')) score += 15;
    
    return Math.min(100, score);
  }

  extractActionItems(content) {
    const actionItems = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('- [ ]') || line.includes('TODO') || line.includes('FIXME')) {
        actionItems.push(line.trim());
      }
    });
    
    return actionItems;
  }

  extractInsights(content) {
    const insights = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('insight') || line.includes('learned') || line.includes('discovered')) {
        insights.push(line.trim());
      }
    });
    
    return insights;
  }

  calculateImpactScore(content) {
    let score = 50;
    const contentLower = content.toLowerCase();
    
    // Check for impact indicators
    if (contentLower.includes('critical') || contentLower.includes('urgent')) score += 25;
    if (contentLower.includes('high') || contentLower.includes('important')) score += 15;
    if (contentLower.includes('performance') || contentLower.includes('security')) score += 10;
    
    return Math.min(100, score);
  }

  determineApplicability(content) {
    const applicability = [];
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('javascript') || contentLower.includes('typescript')) applicability.push('frontend');
    if (contentLower.includes('java') || contentLower.includes('spring')) applicability.push('backend');
    if (contentLower.includes('database') || contentLower.includes('sql')) applicability.push('database');
    if (contentLower.includes('deployment') || contentLower.includes('ci/cd')) applicability.push('devops');
    
    return applicability.length > 0 ? applicability : ['general'];
  }

  extractPatterns(content) {
    const patterns = [];
    const sections = this.extractSections(content);
    
    sections.forEach(section => {
      if (section.title.toLowerCase().includes('pattern') || section.title.toLowerCase().includes('template')) {
        patterns.push({
          name: section.title,
          content: section.content.join('\n')
        });
      }
    });
    
    return patterns;
  }

  calculateReusabilityScore(content) {
    let score = 50;
    const contentLower = content.toLowerCase();
    
    // Check for reusability indicators
    if (contentLower.includes('template') || contentLower.includes('pattern')) score += 20;
    if (contentLower.includes('reusable') || contentLower.includes('generic')) score += 15;
    if (contentLower.includes('example') || contentLower.includes('sample')) score += 10;
    
    return Math.min(100, score);
  }

  extractUsageExamples(content) {
    const examples = [];
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    
    codeBlocks.forEach(block => {
      examples.push(block);
    });
    
    return examples;
  }

  extractImprovements(content) {
    const improvements = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('improve') || line.includes('enhance') || line.includes('optimize')) {
        improvements.push(line.trim());
      }
    });
    
    return improvements;
  }

  calculatePriorityScore(content) {
    let score = 50;
    const contentLower = content.toLowerCase();
    
    // Check for priority indicators
    if (contentLower.includes('critical') || contentLower.includes('urgent')) score += 30;
    if (contentLower.includes('high') || contentLower.includes('important')) score += 20;
    if (contentLower.includes('blocker') || contentLower.includes('bug')) score += 15;
    
    return Math.min(100, score);
  }

  generateImplementationPlan(content) {
    const plan = [];
    const sections = this.extractSections(content);
    
    sections.forEach(section => {
      if (section.title.toLowerCase().includes('task') || section.title.toLowerCase().includes('step')) {
        plan.push({
          step: section.title,
          description: section.content.join('\n').substring(0, 100) + '...'
        });
      }
    });
    
    return plan;
  }

  performGenericAnalysis(content) {
    return {
      wordCount: content.split(/\s+/).length,
      sectionCount: this.extractSections(content).length,
      hasCode: /```[\s\S]*```/.test(content),
      hasLinks: /\[.*?\]\(.*?\)/.test(content),
      hasLists: /^[-*+]\s+.+$/m.test(content)
    };
  }

  isRuleWorthy(title, content) {
    const skipKeywords = ['overview', 'introduction', 'table of contents', 'summary', 'conclusion'];
    const skipTitle = skipKeywords.some(keyword => 
      title.toLowerCase().includes(keyword)
    );
    
    const skipContent = content.length < 50;
    
    return !skipTitle && !skipContent;
  }

  determineRuleType(title, content) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    if (titleLower.includes('standard') || contentLower.includes('standard')) {
      return 'standard';
    } else if (titleLower.includes('lesson') || contentLower.includes('lesson')) {
      return 'lesson';
    } else if (titleLower.includes('template') || contentLower.includes('template')) {
      return 'template';
    } else if (titleLower.includes('rule') || contentLower.includes('rule')) {
      return 'rule';
    } else {
      return 'general';
    }
  }

  async generateReport(results) {
    const report = {
      generatedAt: new Date().toISOString(),
      totalFiles: results.length,
      successfulExecutions: results.filter(r => r.success).length,
      failedExecutions: results.filter(r => !r.success).length,
      executionTypes: {},
      summary: results.map(result => ({
        file: path.basename(result.file),
        success: result.success,
        executorType: result.executorType,
        metadata: result.metadata
      }))
    };
    
    // Count execution types
    results.forEach(result => {
      const type = result.executorType || 'unknown';
      report.executionTypes[type] = (report.executionTypes[type] || 0) + 1;
    });
    
    const reportPath = path.join(this.sourceDir, 'reports', 'md-executor-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated report: ${reportPath}`);
  }

  // Cache management
  isFileModified(filePath) {
    const cached = this.cache.get(filePath);
    if (!cached) return true;
    
    const currentModified = fs.statSync(filePath).mtime;
    return currentModified > cached.lastModified;
  }

  getCachedResult(filePath) {
    return this.cache.get(filePath);
  }

  clearCache() {
    this.cache.clear();
  }
}

// Run the executor
if (require.main === module) {
  const executor = new MarkdownExecutor();
  executor.run().catch(console.error);
}

module.exports = MarkdownExecutor; 