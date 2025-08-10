#!/usr/bin/env node

/**
 * Enhanced Template Trigger Automation for Agent OS
 * Provides intelligent, context-aware template suggestions and automatic checklist generation
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class TemplateTriggerAutomation {
  constructor() {
    this.projectRoot = process.cwd();
    this.agentOsPath = path.join(this.projectRoot, '.agent-os');
    this.templatesPath = path.join(this.agentOsPath, 'templates');
    this.workflowsPath = path.join(this.agentOsPath, 'workflows');
    this.standardsPath = path.join(this.agentOsPath, 'standards');
    
    // Template registry
    this.templateRegistry = new Map();
    this.contextTriggers = new Map();
    this.automationRules = [];
    
    this.loadTemplates();
    this.loadAutomationRules();
  }

  loadTemplates() {
    try {
      if (!fs.existsSync(this.templatesPath)) {
        console.warn('⚠️  Templates directory not found');
        return;
      }

      const templateFiles = fs.readdirSync(this.templatesPath, { recursive: true });
      
      templateFiles.forEach(file => {
        if (file.endsWith('.md') || file.endsWith('.js')) {
          const templatePath = path.join(this.templatesPath, file);
          const template = this.parseTemplate(templatePath);
          
          if (template) {
            this.templateRegistry.set(template.name, template);
            
            // Register context triggers
            if (template.triggers) {
              template.triggers.forEach(trigger => {
                if (!this.contextTriggers.has(trigger)) {
                  this.contextTriggers.set(trigger, []);
                }
                this.contextTriggers.get(trigger).push(template.name);
              });
            }
          }
        }
      });
      
      console.log(`📚 Loaded ${this.templateRegistry.size} templates`);
      
    } catch (error) {
      console.error('❌ Error loading templates:', error.message);
    }
  }

  parseTemplate(templatePath) {
    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      const fileName = path.basename(templatePath, path.extname(templatePath));
      
      // Extract template metadata
      const metadata = this.extractTemplateMetadata(content);
      
      return {
        name: fileName,
        path: templatePath,
        content: content,
        type: path.extname(templatePath).substring(1),
        triggers: metadata.triggers || [],
        context: metadata.context || [],
        priority: metadata.priority || 5,
        dependencies: metadata.dependencies || [],
        ...metadata
      };
      
    } catch (error) {
      console.warn(`⚠️  Could not parse template ${templatePath}:`, error.message);
      return null;
    }
  }

  extractTemplateMetadata(content) {
    const metadata = {};
    
    // Extract triggers from comments
    const triggerMatch = content.match(/@triggers?\s*:\s*(.+)/i);
    if (triggerMatch) {
      metadata.triggers = triggerMatch[1].split(',').map(t => t.trim());
    }
    
    // Extract context from comments
    const contextMatch = content.match(/@context\s*:\s*(.+)/i);
    if (contextMatch) {
      metadata.context = contextMatch[1].split(',').map(c => c.trim());
    }
    
    // Extract priority from comments
    const priorityMatch = content.match(/@priority\s*:\s*(\d+)/i);
    if (priorityMatch) {
      metadata.priority = parseInt(priorityMatch[1]);
    }
    
    // Extract dependencies from comments
    const depsMatch = content.match(/@dependencies?\s*:\s*(.+)/i);
    if (depsMatch) {
      metadata.dependencies = depsMatch[1].split(',').map(d => d.trim());
    }
    
    return metadata;
  }

  loadAutomationRules() {
    try {
      const rulesPath = path.join(this.agentOsPath, 'config', 'automation-rules.json');
      
      if (fs.existsSync(rulesPath)) {
        const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
        this.automationRules = rules;
      } else {
        // Default automation rules
        this.automationRules = this.getDefaultAutomationRules();
      }
      
      console.log(`⚙️  Loaded ${this.automationRules.length} automation rules`);
      
    } catch (error) {
      console.warn('⚠️  Could not load automation rules, using defaults');
      this.automationRules = this.getDefaultAutomationRules();
    }
  }

  getDefaultAutomationRules() {
    return [
      {
        name: 'new-feature-trigger',
        condition: 'file_created',
        pattern: '**/features/**/*.md',
        action: 'suggest-template',
        template: 'feature-specification',
        priority: 'high'
      },
      {
        name: 'api-endpoint-trigger',
        condition: 'file_created',
        pattern: '**/src/**/*Controller.java',
        action: 'suggest-template',
        template: 'api-endpoint-checklist',
        priority: 'high'
      },
      {
        name: 'database-change-trigger',
        condition: 'file_modified',
        pattern: '**/src/**/*Entity.java',
        action: 'suggest-template',
        template: 'database-migration-checklist',
        priority: 'medium'
      },
      {
        name: 'test-file-trigger',
        condition: 'file_created',
        pattern: '**/test/**/*.java',
        action: 'suggest-template',
        template: 'test-coverage-checklist',
        priority: 'medium'
      },
      {
        name: 'security-implementation-trigger',
        condition: 'file_modified',
        pattern: '**/src/**/*Security*.java',
        action: 'suggest-template',
        template: 'security-checklist',
        priority: 'critical'
      }
    ];
  }

  async analyzeContext(contextData) {
    const suggestions = [];
    const checklists = [];
    
    try {
      console.log('🔍 Analyzing development context...');
      
      // Analyze current project state
      const projectState = await this.analyzeProjectState();
      
      // Check for template triggers
      const triggeredTemplates = this.checkTemplateTriggers(contextData, projectState);
      
      // Generate suggestions
      triggeredTemplates.forEach(template => {
        suggestions.push({
          type: 'template',
          template: template,
          reason: `Triggered by ${template.triggers.join(', ')}`,
          priority: template.priority
        });
      });
      
      // Check for automation rule triggers
      const ruleTriggers = this.checkAutomationRules(contextData, projectState);
      
      ruleTriggers.forEach(rule => {
        const template = this.templateRegistry.get(rule.template);
        if (template) {
          suggestions.push({
            type: 'automation',
            template: template,
            rule: rule,
            reason: `Automated by rule: ${rule.name}`,
            priority: rule.priority === 'critical' ? 10 : 
                     rule.priority === 'high' ? 8 : 
                     rule.priority === 'medium' ? 6 : 4
          });
        }
      });
      
      // Generate context-aware checklists
      const contextChecklists = await this.generateContextChecklists(contextData, projectState);
      checklists.push(...contextChecklists);
      
      // Sort by priority
      suggestions.sort((a, b) => b.priority - a.priority);
      
      console.log(`✅ Context analysis complete: ${suggestions.length} suggestions, ${checklists.length} checklists`);
      
      return { suggestions, checklists, projectState };
      
    } catch (error) {
      console.error('❌ Context analysis failed:', error.message);
      return { suggestions: [], checklists: [], projectState: {} };
    }
  }

  async analyzeProjectState() {
    const state = {
      phase: this.detectCurrentPhase(),
      technologies: this.detectTechnologies(),
      structure: this.analyzeProjectStructure(),
      compliance: await this.checkComplianceStatus(),
      recentChanges: this.getRecentChanges()
    };
    
    return state;
  }

  detectCurrentPhase() {
    // Check for phase indicators
    const phaseIndicators = [
      { file: '.agent-os/product/phase1-completion-status.md', phase: 'phase1' },
      { file: '.agent-os/product/phase2-completion-status.md', phase: 'phase2' },
      { file: '.agent-os/product/phase3-completion-status.md', phase: 'phase3' },
      { file: 'src', phase: 'development' },
      { file: 'backend', phase: 'development' },
      { file: 'frontend', phase: 'development' }
    ];
    
    for (const indicator of phaseIndicators) {
      if (fs.existsSync(indicator.file)) {
        return indicator.phase;
      }
    }
    
    return 'planning';
  }

  detectTechnologies() {
    const technologies = [];
    
    // Check for technology indicators
    if (fs.existsSync('package.json')) {
      try {
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        if (pkg.dependencies?.react) technologies.push('react');
        if (pkg.dependencies?.vue) technologies.push('vue');
        if (pkg.dependencies?.angular) technologies.push('angular');
        if (pkg.devDependencies?.typescript) technologies.push('typescript');
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
    if (fs.existsSync('pom.xml')) {
      technologies.push('java', 'spring');
    }
    
    if (fs.existsSync('build.gradle')) {
      technologies.push('java', 'gradle');
    }
    
    if (fs.existsSync('requirements.txt')) {
      technologies.push('python');
    }
    
    if (fs.existsSync('go.mod')) {
      technologies.push('golang');
    }
    
    return technologies;
  }

  analyzeProjectStructure() {
    const structure = {
      hasSrc: fs.existsSync('src'),
      hasBackend: fs.existsSync('backend'),
      hasFrontend: fs.existsSync('frontend'),
      hasTests: fs.existsSync('test') || fs.existsSync('tests'),
      hasDocs: fs.existsSync('docs') || fs.existsSync('documentation'),
      hasConfig: fs.existsSync('config') || fs.existsSync('configuration')
    };
    
    return structure;
  }

  async checkComplianceStatus() {
    try {
      const compliancePath = path.join(this.agentOsPath, 'tools', 'compliance-checker.js');
      
      if (fs.existsSync(compliancePath)) {
        return new Promise((resolve) => {
          const child = spawn('node', [compliancePath, '--quick', '--json'], {
            stdio: 'pipe',
            cwd: this.agentOsPath
          });
          
          let output = '';
          child.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          child.on('close', () => {
            try {
              const result = JSON.parse(output);
              resolve({
                score: result.overallScore || 0,
                status: result.overallStatus || 'unknown',
                violations: result.violations || []
              });
            } catch (error) {
              resolve({ score: 0, status: 'unknown', violations: [] });
            }
          });
        });
      }
    } catch (error) {
      // Ignore errors
    }
    
    return { score: 0, status: 'unknown', violations: [] };
  }

  getRecentChanges() {
    try {
      // Get recent file changes (last 24 hours)
      const changes = [];
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      
      const walkDir = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stats = fs.statSync(filePath);
          
          if (stats.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            walkDir(filePath);
          } else if (stats.isFile() && (now - stats.mtime.getTime()) < oneDay) {
            changes.push({
              file: filePath,
              modified: stats.mtime,
              size: stats.size
            });
          }
        });
      };
      
      walkDir(this.projectRoot);
      
      return changes.slice(0, 20); // Limit to 20 most recent
      
    } catch (error) {
      return [];
    }
  }

  checkTemplateTriggers(contextData, projectState) {
    const triggered = [];
    
    this.templateRegistry.forEach((template, name) => {
      if (this.shouldTriggerTemplate(template, contextData, projectState)) {
        triggered.push(template);
      }
    });
    
    return triggered;
  }

  shouldTriggerTemplate(template, contextData, projectState) {
    if (!template.triggers || template.triggers.length === 0) {
      return false;
    }
    
    return template.triggers.some(trigger => {
      switch (trigger) {
        case 'new-feature':
          return contextData.action === 'feature_planning';
        case 'api-development':
          return projectState.technologies.includes('spring') && contextData.context === 'backend';
        case 'frontend-component':
          return projectState.technologies.includes('react') && contextData.context === 'frontend';
        case 'database-change':
          return contextData.action === 'database_modification';
        case 'security-implementation':
          return contextData.action === 'security_work';
        case 'testing':
          return contextData.action === 'test_creation';
        case 'deployment':
          return contextData.action === 'deployment_preparation';
        default:
          return false;
      }
    });
  }

  checkAutomationRules(contextData, projectState) {
    const triggered = [];
    
    this.automationRules.forEach(rule => {
      if (this.shouldTriggerRule(rule, contextData, projectState)) {
        triggered.push(rule);
      }
    });
    
    return triggered;
  }

  shouldTriggerRule(rule, contextData, projectState) {
    // Check file pattern matches
    if (rule.pattern && contextData.filePath) {
      const minimatch = require('minimatch');
      if (!minimatch(contextData.filePath, rule.pattern)) {
        return false;
      }
    }
    
    // Check condition matches
    if (rule.condition && contextData.action) {
      if (rule.condition !== contextData.action) {
        return false;
      }
    }
    
    return true;
  }

  async generateContextChecklists(contextData, projectState) {
    const checklists = [];
    
    try {
      // Generate phase-specific checklists
      const phaseChecklist = await this.generatePhaseChecklist(projectState.phase);
      if (phaseChecklist) {
        checklists.push(phaseChecklist);
      }
      
      // Generate technology-specific checklists
      const techChecklists = await this.generateTechnologyChecklists(projectState.technologies);
      checklists.push(...techChecklists);
      
      // Generate compliance checklists
      if (projectState.compliance.score < 85) {
        const complianceChecklist = await this.generateComplianceChecklist(projectState.compliance);
        if (complianceChecklist) {
          checklists.push(complianceChecklist);
        }
      }
      
      // Generate context-specific checklists
      const contextChecklist = await this.generateContextSpecificChecklist(contextData, projectState);
      if (contextChecklist) {
        checklists.push(contextChecklist);
      }
      
    } catch (error) {
      console.warn('⚠️  Could not generate context checklists:', error.message);
    }
    
    return checklists;
  }

  async generatePhaseChecklist(phase) {
    const phaseChecklists = {
      planning: {
        title: '📋 Planning Phase Checklist',
        items: [
          '✅ Project requirements documented',
          '✅ Technology stack selected',
          '✅ Architecture designed',
          '✅ Development phases planned',
          '✅ Success metrics defined',
          '✅ Risk assessment completed'
        ]
      },
      phase1: {
        title: '🚀 Phase 1: Foundation Checklist',
        items: [
          '✅ Project structure created',
          '✅ Basic dependencies configured',
          '✅ Development environment setup',
          '✅ CI/CD pipeline configured',
          '✅ Basic testing framework setup',
          '✅ Documentation structure created'
        ]
      },
      phase2: {
        title: '🔗 Phase 2: Integration Checklist',
        items: [
          '✅ Core services implemented',
          '✅ Database schema designed',
          '✅ API endpoints created',
          '✅ Frontend components built',
          '✅ Integration tests written',
          '✅ Performance benchmarks established'
        ]
      },
      phase3: {
        title: '🎯 Phase 3: Enhancement Checklist',
        items: [
          '✅ Advanced features implemented',
          '✅ Security measures enhanced',
          '✅ Performance optimized',
          '✅ User experience refined',
          '✅ Comprehensive testing completed',
          '✅ Production deployment ready'
        ]
      }
    };
    
    return phaseChecklists[phase] || null;
  }

  async generateTechnologyChecklists(technologies) {
    const checklists = [];
    
    technologies.forEach(tech => {
      const checklist = this.getTechnologyChecklist(tech);
      if (checklist) {
        checklists.push(checklist);
      }
    });
    
    return checklists;
  }

  getTechnologyChecklist(technology) {
    const techChecklists = {
      react: {
        title: '⚛️ React Development Checklist',
        items: [
          '✅ Functional components used',
          '✅ Hooks implemented properly',
          '✅ Props validation added',
          '✅ Error boundaries implemented',
          '✅ Performance optimization applied',
          '✅ Accessibility features included'
        ]
      },
      spring: {
        title: '🍃 Spring Boot Checklist',
        items: [
          '✅ Controller-Service-Repository pattern followed',
          '✅ Input validation implemented',
          '✅ Exception handling configured',
          '✅ Security measures implemented',
          '✅ Database transactions managed',
          '✅ API documentation generated'
        ]
      },
      typescript: {
        title: '📘 TypeScript Checklist',
        items: [
          '✅ Strict mode enabled',
          '✅ Proper types defined',
          '✅ Interfaces used consistently',
          '✅ Generics implemented where appropriate',
          '✅ Error handling typed properly',
          '✅ No any types used'
        ]
      }
    };
    
    return techChecklists[technology] || null;
  }

  async generateComplianceChecklist(compliance) {
    return {
      title: '📊 Compliance Improvement Checklist',
      priority: 'high',
      items: [
        '✅ Review and fix security violations',
        '✅ Address code quality issues',
        '✅ Fix architecture violations',
        '✅ Update documentation',
        '✅ Improve test coverage',
        '✅ Run compliance check again'
      ],
      details: {
        currentScore: compliance.score,
        targetScore: 85,
        violations: compliance.violations.length
      }
    };
  }

  async generateContextSpecificChecklist(contextData, projectState) {
    if (contextData.action === 'feature_planning') {
      return {
        title: '🎯 Feature Planning Checklist',
        items: [
          '✅ Feature requirements documented',
          '✅ User stories written',
          '✅ Acceptance criteria defined',
          '✅ Technical approach planned',
          '✅ Dependencies identified',
          '✅ Success metrics defined'
        ]
      };
    }
    
    if (contextData.action === 'security_work') {
      return {
        title: '🔒 Security Implementation Checklist',
        items: [
          '✅ Input validation implemented',
          '✅ Authentication configured',
          '✅ Authorization rules defined',
          '✅ Data encryption applied',
          '✅ Security headers set',
          '✅ Vulnerability scan completed'
        ]
      };
    }
    
    return null;
  }

  async suggestTemplates(contextData) {
    const analysis = await this.analyzeContext(contextData);
    
    if (analysis.suggestions.length === 0) {
      console.log('💡 No template suggestions for current context');
      return [];
    }
    
    console.log('\n🎯 Template Suggestions:');
    analysis.suggestions.forEach((suggestion, index) => {
      console.log(`\n${index + 1}. ${suggestion.template.name} (${suggestion.type})`);
      console.log(`   Priority: ${suggestion.priority}/10`);
      console.log(`   Reason: ${suggestion.reason}`);
      
      if (suggestion.template.description) {
        console.log(`   Description: ${suggestion.template.description}`);
      }
    });
    
    return analysis.suggestions;
  }

  async generateChecklist(contextData) {
    const analysis = await this.analyzeContext(contextData);
    
    if (analysis.checklists.length === 0) {
      console.log('📋 No checklists generated for current context');
      return [];
    }
    
    console.log('\n📋 Generated Checklists:');
    analysis.checklists.forEach((checklist, index) => {
      console.log(`\n${index + 1}. ${checklist.title}`);
      if (checklist.priority) {
        console.log(`   Priority: ${checklist.priority}`);
      }
      
      checklist.items.forEach(item => {
        console.log(`   ${item}`);
      });
      
      if (checklist.details) {
        console.log(`   Details: ${JSON.stringify(checklist.details)}`);
      }
    });
    
    return analysis.checklists;
  }

  async applyTemplate(templateName, targetPath, context = {}) {
    try {
      const template = this.templateRegistry.get(templateName);
      
      if (!template) {
        throw new Error(`Template '${templateName}' not found`);
      }
      
      console.log(`📝 Applying template: ${template.name}`);
      
      // Process template content
      const processedContent = this.processTemplateContent(template.content, context);
      
      // Write to target path
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.writeFileSync(targetPath, processedContent);
      
      console.log(`✅ Template applied to: ${targetPath}`);
      
      return { success: true, path: targetPath };
      
    } catch (error) {
      console.error(`❌ Failed to apply template: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  processTemplateContent(content, context) {
    let processed = content;
    
    // Replace placeholders with context values
    Object.entries(context).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(placeholder, value);
    });
    
    // Replace common placeholders
    processed = processed
      .replace(/\{\{timestamp\}\}/g, new Date().toISOString())
      .replace(/\{\{projectName\}\}/g, path.basename(this.projectRoot))
      .replace(/\{\{agentOsVersion\}\}/g, this.getAgentOsVersion());
    
    return processed;
  }

  getAgentOsVersion() {
    try {
      const packagePath = path.join(this.agentOsPath, 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.version || '1.0.0';
      }
    } catch (error) {
      // Ignore errors
    }
    return '1.0.0';
  }

  getStatus() {
    return {
      templatesLoaded: this.templateRegistry.size,
      automationRules: this.automationRules.length,
      contextTriggers: this.contextTriggers.size,
      projectRoot: this.projectRoot
    };
  }
}

// CLI interface
async function main() {
  const automation = new TemplateTriggerAutomation();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'analyze':
      const contextData = {
        action: process.argv[3] || 'general',
        context: process.argv[4] || 'development',
        filePath: process.argv[5] || null
      };
      
      const analysis = await automation.analyzeContext(contextData);
      console.log('\n📊 Analysis Results:', JSON.stringify(analysis, null, 2));
      break;
      
    case 'suggest':
      const contextData2 = {
        action: process.argv[3] || 'general',
        context: process.argv[4] || 'development'
      };
      
      await automation.suggestTemplates(contextData2);
      break;
      
    case 'checklist':
      const contextData3 = {
        action: process.argv[3] || 'general',
        context: process.argv[4] || 'development'
      };
      
      await automation.generateChecklist(contextData3);
      break;
      
    case 'apply':
      const templateName = process.argv[3];
      const targetPath = process.argv[4];
      
      if (!templateName || !targetPath) {
        console.error('❌ Usage: node template-trigger-automation.js apply <template> <target-path>');
        process.exit(1);
      }
      
      await automation.applyTemplate(templateName, targetPath);
      break;
      
    case 'status':
      const status = automation.getStatus();
      console.log('📊 Template Automation Status:', JSON.stringify(status, null, 2));
      break;
      
    case 'help':
      console.log(`
🚀 Template Trigger Automation

Usage: node template-trigger-automation.js [command] [options]

Commands:
  analyze <action> [context] [file]    Analyze development context
  suggest <action> [context]            Suggest relevant templates
  checklist <action> [context]          Generate context checklists
  apply <template> <target-path>        Apply template to target path
  status                               Show automation status
  help                                 Show this help message

Examples:
  node template-trigger-automation.js analyze feature_planning
  node template-trigger-automation.js suggest api_development backend
  node template-trigger-automation.js checklist security_work
  node template-trigger-automation.js apply feature-specification ./features/new-feature.md
      `);
      break;
      
    default:
      console.log('💡 Run "node template-trigger-automation.js help" for usage information');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = TemplateTriggerAutomation;