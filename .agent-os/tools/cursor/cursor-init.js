#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Added glob module

class CursorInit {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.outputDir = path.join(__dirname, '..', 'cursor-rules');
    this.generatedDir = path.join(__dirname, '..', 'reports');
  }

  async run() {
    console.log('🚀 Starting Cursor init process...');
    
    try {
      // 1. Discover source files
      const sourceFiles = this.discoverSourceFiles();
      console.log(`📁 Found ${sourceFiles.length} source files`);
      
      // 2. Analyze content
      const analyzedContent = this.analyzeContent(sourceFiles);
      console.log(`📊 Analyzed ${analyzedContent.length} content sections`);
      
      // 3. Generate rules
      const generatedRules = this.generateRules(analyzedContent);
      console.log(`⚙️ Generated ${generatedRules.length} rules`);
      
      // 4. Validate rules
      const validatedRules = this.validateRules(generatedRules);
      console.log(`✅ Validated ${validatedRules.length} rules`);
      
      // 5. Write output
      await this.writeOutput(validatedRules);
      console.log('🎉 Cursor init process completed!');
      
      return {
        success: true,
        totalFiles: sourceFiles.length,
        totalRules: validatedRules.length
      };
    } catch (error) {
      console.error('❌ Cursor init process failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  discoverSourceFiles() {
    const patterns = [
      path.join(this.sourceDir, 'standards', '*.md'),
      path.join(this.sourceDir, 'lessons-learned', '*.md'),
      path.join(this.sourceDir, 'agent-improvements', '*.md'),
      path.join(this.sourceDir, 'templates', '*.md'),
      path.join(this.sourceDir, 'product', '*.md'),
      path.join(this.sourceDir, 'specs', '*.md'),
      path.join(this.sourceDir, 'process', '*.md'),
      path.join(this.sourceDir, 'test', '*.md'),
      path.join(this.sourceDir, 'dashboard', '*.md'),
      path.join(this.sourceDir, 'reports', '*.md'),
      path.join(this.sourceDir, 'documentation', '*.md'),
      path.join(this.sourceDir, 'instructions', '*.md'),
      path.join(this.sourceDir, 'checklists', '*.md'),
    ];

    // Check if we should include .agent-os files
    const includeAgentOS = process.argv.includes('--include-agent-os') || process.argv.includes('-a');
    
    let files = [];
    patterns.forEach(pattern => {
      const found = glob.sync(pattern);
      files = files.concat(found);
    });

    // Filter out .agent-os files unless explicitly requested
    if (!includeAgentOS) {
      files = files.filter(file => !file.includes('.agent-os'));
    }

    // Prioritize product files over standards files
    files = this.prioritizeProductFiles(files);

    return files;
  }


  prioritizeProductFiles(files) {
    const fileMap = new Map();
    const productFiles = [];
    const standardsFiles = [];
    
    // Separate files by directory
    files.forEach(file => {
      const relativePath = path.relative(this.sourceDir, file);
      const filename = path.basename(file);
      
      if (relativePath.startsWith('product/')) {
        productFiles.push({ file, filename });
      } else if (relativePath.startsWith('standards/')) {
        standardsFiles.push({ file, filename });
      } else {
        // Keep all other files
        fileMap.set(relativePath, file);
      }
    });
    
    // For each standards file, check if there's a product equivalent
    standardsFiles.forEach(({ file, filename }) => {
      const productEquivalent = productFiles.find(p => p.filename === filename);
      
      if (productEquivalent) {
        // Product file exists, skip standards file
        console.log(` Skipping standards/${filename} in favor of product/${filename}`);
        fileMap.set(`product/${filename}`, productEquivalent.file);
      } else {
        // No product equivalent, keep standards file
        fileMap.set(`standards/${filename}`, file);
      }
    });
    
    // Add all product files
    productFiles.forEach(({ file, filename }) => {
      fileMap.set(`product/${filename}`, file);
    });
    
    return Array.from(fileMap.values());
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

  analyzeContent(sourceFiles) {
    const analyzed = [];
    
    sourceFiles.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const analysis = this.parseMarkdownContent(content, file);
        analyzed.push(analysis);
      } catch (error) {
        console.warn(`⚠️ Failed to analyze ${file}: ${error.message}`);
      }
    });
    
    return analyzed;
  }

  parseMarkdownContent(content, filePath) {
    // Parse Markdown and extract rule-worthy content
    const sections = this.extractSections(content);
    const rules = this.extractRules(sections);
    
    return {
      filePath,
      sections,
      rules,
      metadata: this.extractMetadata(content, filePath)
    };
  }

  extractSections(content) {
    // Extract sections based on headers
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

  extractRules(sections) {
    // Extract rules from sections
    const rules = [];
    
    sections.forEach(section => {
      const ruleContent = this.convertToRule(section);
      if (ruleContent) {
        rules.push(ruleContent);
      }
    });
    
    return rules;
  }

  convertToRule(section) {
    // Convert section to Cursor rule format
    const title = section.title;
    const content = section.content.join('\n');
    
    // Skip sections that are not rule-worthy
    if (this.isNotRuleWorthy(title, content)) {
      return null;
    }
    
    // Apply rule formatting
    const ruleContent = this.formatAsRule(title, content);
    
    return {
      title,
      content: ruleContent,
      source: section,
      type: this.determineRuleType(title, content)
    };
  }

  isNotRuleWorthy(title, content) {
    const skipKeywords = ['overview', 'introduction', 'table of contents', 'summary', 'conclusion'];
    const skipTitle = skipKeywords.some(keyword => 
      (title || '').toLowerCase().includes(keyword)
    );
    
    const skipContent = (content || '').length < 50; // Too short to be a meaningful rule
    
    return skipTitle || skipContent;
  }

  determineRuleType(title, content) {
    const titleLower = (title || '').toLowerCase();
    const contentLower = (content || '').toLowerCase();
    
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

  formatAsRule(title, content) {
    // Format content as Cursor rule
    return `# ${title}

${content}

---
**Generated by Agent OS Cursor Init Process**
**Source**: .agent-os framework
**Last Updated**: ${new Date().toISOString()}
**Type**: ${this.determineRuleType(title, content)}
`;
  }

  extractMetadata(content, filePath) {
    const metadata = {
      title: this.extractTitle(content),
      date: this.extractDate(content),
      project: this.extractProject(content),
      phase: this.extractPhase(content),
      priority: this.extractPriority(content),
      tags: this.extractTags(content),
      keyInsights: this.extractKeyInsights(content),
      recommendations: this.extractRecommendations(content)
    };
    
    return metadata;
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
    
    const contentLower = (content || '').toLowerCase();
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
    
    const contentLower = (content || '').toLowerCase();
    for (const [priority, keywords] of Object.entries(priorityKeywords)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return priority;
      }
    }
    return 'medium';
  }

  extractTags(content) {
    const tags = [];
    const contentLower = (content || '').toLowerCase();
    
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

  generateRules(analyzedContent) {
    const rules = [];
    
    analyzedContent.forEach(analysis => {
      analysis.rules.forEach(rule => {
        rules.push({
          filename: this.generateRuleFilename(rule.title),
          content: rule.content,
          source: rule.source,
          type: rule.type,
          metadata: analysis.metadata
        });
      });
    });
    
    return rules;
  }

  generateRuleFilename(title) {
    // Convert title to filename
    return (title || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '.mdc';
  }

  validateRules(generatedRules) {
    const validated = [];
    
    generatedRules.forEach(rule => {
      const validation = this.validateRule(rule);
      if (validation.isValid) {
        validated.push(rule);
      } else {
        console.warn(`⚠️ Rule validation failed for ${rule.filename}: ${validation.errors.join(', ')}`);
      }
    });
    
    return validated;
  }

  validateRule(rule) {
    const errors = [];
    const warnings = [];
    
    // Check for required content
    if (!rule.content || rule.content.trim().length === 0) {
      errors.push('Empty content');
    }
    
    // Check for valid filename
    if (!rule.filename || rule.filename.length === 0) {
      errors.push('Invalid filename');
    }
    
    // Check for required sections
    if (!rule.content.includes('---')) {
      errors.push('Missing metadata section');
    }
    
    // Check for minimum content length
    if (rule.content.length < 100) {
      errors.push('Content too short');
    }
    
    // Enhanced validation checks
    const validation = this.performEnhancedValidation(rule);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: this.calculateRuleScore(rule, errors.length, warnings.length)
    };
  }

  performEnhancedValidation(rule) {
    const errors = [];
    const warnings = [];
    
    // Check for proper Cursor rule format
    if (!this.isValidCursorRuleFormat(rule.content)) {
      errors.push('Invalid Cursor rule format');
    }
    
    // Check for required metadata fields
    const metadataValidation = this.validateMetadata(rule.content);
    errors.push(...metadataValidation.errors);
    warnings.push(...metadataValidation.warnings);
    
    // Check for rule content quality
    const qualityValidation = this.validateRuleQuality(rule.content);
    errors.push(...qualityValidation.errors);
    warnings.push(...qualityValidation.warnings);
    
    // Check for rule type consistency
    if (!this.isRuleTypeConsistent(rule)) {
      warnings.push('Rule type may not be consistent with content');
    }
    
    return { errors, warnings };
  }

  isValidCursorRuleFormat(content) {
    // Check for basic Cursor rule structure
    const hasHeader = /^#\s+.+/.test(content);
    const hasMetadata = content.includes('---');
    const hasGeneratedBy = content.includes('Generated by');
    
    return hasHeader && hasMetadata && hasGeneratedBy;
  }

  validateMetadata(content) {
    const errors = [];
    const warnings = [];
    
    // Check for required metadata fields
    const requiredFields = ['Generated by', 'Source', 'Last Updated', 'Type'];
    const missingFields = requiredFields.filter(field => !content.includes(field));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required metadata fields: ${missingFields.join(', ')}`);
    }
    
    // Check for valid date format
    const dateMatch = content.match(/Last Updated.*?(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) {
      warnings.push('Invalid or missing date format');
    }
    
    // Check for valid type
    const typeMatch = content.match(/Type.*?(\w+)/);
    if (typeMatch) {
      const validTypes = ['general', 'standard', 'rule', 'lesson', 'template'];
      if (!validTypes.includes(typeMatch[1].toLowerCase())) {
        warnings.push(`Invalid rule type: ${typeMatch[1]}`);
      }
    }
    
    return { errors, warnings };
  }

  validateRuleQuality(content) {
    const errors = [];
    const warnings = [];
    
    // Check for actionable content
    if (!this.hasActionableContent(content)) {
      warnings.push('Rule may lack actionable content');
    }
    
    // Check for proper formatting
    if (!this.hasProperFormatting(content)) {
      warnings.push('Rule formatting could be improved');
    }
    
    // Check for code examples (if applicable)
    if (this.shouldHaveCodeExamples(content) && !this.hasCodeExamples(content)) {
      warnings.push('Rule could benefit from code examples');
    }
    
    // Check for links and references
    if (!this.hasReferences(content)) {
      warnings.push('Rule could benefit from references or links');
    }
    
    return { errors, warnings };
  }

  hasActionableContent(content) {
    const actionableKeywords = [
      'always', 'never', 'must', 'should', 'use', 'implement',
      'follow', 'apply', 'ensure', 'validate', 'test', 'check'
    ];
    
    const contentLower = (content || '').toLowerCase();
    return actionableKeywords.some(keyword => contentLower.includes(keyword));
  }

  hasProperFormatting(content) {
    // Check for proper markdown formatting
    const hasHeaders = /^#{1,3}\s+.+$/m.test(content);
    const hasLists = /^[-*+]\s+.+$/m.test(content);
    const hasCodeBlocks = /```[\s\S]*```/.test(content);
    
    return hasHeaders || hasLists || hasCodeBlocks;
  }

  shouldHaveCodeExamples(content) {
    const codeKeywords = ['javascript', 'typescript', 'java', 'spring', 'react', 'node'];
    const contentLower = (content || '').toLowerCase();
    return codeKeywords.some(keyword => contentLower.includes(keyword));
  }

  hasCodeExamples(content) {
    return /```[\s\S]*```/.test(content) || /`[^`]+`/.test(content);
  }

  hasReferences(content) {
    return /\[.*?\]\(.*?\)/.test(content) || /https?:\/\/.*/.test(content);
  }

  isRuleTypeConsistent(rule) {
    const titleLower = (rule.title || '').toLowerCase();
    const contentLower = (rule.content || '').toLowerCase();
    const type = rule.type;
    
    // Check if rule type matches content
    switch (type) {
      case 'standard':
        return titleLower.includes('standard') || contentLower.includes('standard');
      case 'lesson':
        return titleLower.includes('lesson') || contentLower.includes('lesson') || contentLower.includes('learned');
      case 'template':
        return titleLower.includes('template') || contentLower.includes('template');
      case 'rule':
        return titleLower.includes('rule') || contentLower.includes('rule');
      default:
        return true;
    }
  }

  calculateRuleScore(rule, errorCount, warningCount) {
    let score = 100;
    
    // Deduct points for errors and warnings
    score -= (errorCount * 20);
    score -= (warningCount * 5);
    
    // Bonus points for quality indicators
    if (this.hasActionableContent(rule.content)) score += 10;
    if (this.hasProperFormatting(rule.content)) score += 5;
    if (this.hasCodeExamples(rule.content)) score += 10;
    if (this.hasReferences(rule.content)) score += 5;
    
    return Math.max(0, Math.min(100, score));
  }

  async writeOutput(validatedRules) {
    // Ensure output directories exist
    this.ensureDirectories();
    
    // Write rules to cursor-rules/
    validatedRules.forEach(rule => {
      const outputPath = path.join(this.outputDir, rule.filename);
      fs.writeFileSync(outputPath, rule.content);
      console.log(`📝 Wrote ${rule.filename}`);
    });
    
    // Generate summary
    await this.generateSummary(validatedRules);
  }

  ensureDirectories() {
    [this.outputDir, this.generatedDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async generateSummary(validatedRules) {
    const summary = {
      generatedAt: new Date().toISOString(),
      totalRules: validatedRules.length,
      rulesByType: {},
      rules: validatedRules.map(rule => ({
        filename: rule.filename,
        title: rule.title,
        type: rule.type,
        source: rule.source?.filePath
      }))
    };
    
    // Count rules by type
    validatedRules.forEach(rule => {
      const type = rule.type || 'unknown';
      summary.rulesByType[type] = (summary.rulesByType[type] || 0) + 1;
    });
    
    const summaryPath = path.join(this.generatedDir, 'cursor-init-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`📊 Generated summary: ${summaryPath}`);
  }
}

// Run the init process
if (require.main === module) {
  const init = new CursorInit();
  init.run().catch(console.error);
}

module.exports = CursorInit; 

