#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class LessonTemplateGenerator {
  constructor() {
    this.sourceDir = path.join(__dirname, '..');
    this.templatesDir = path.join(this.sourceDir, 'templates');
    this.generatedTemplatesDir = path.join(this.sourceDir, 'lessons-learned', 'templates');
    this.templateConfigFile = path.join(this.sourceDir, 'reports', 'template-generation.json');
  }

  async run() {
    console.log('🚀 Starting Lesson Template Generator...');
    
    try {
      // 1. Load existing template data
      const templateData = await this.loadTemplateData();
      
      // 2. Create template directory structure
      await this.createTemplateDirectories();
      
      // 3. Generate lesson templates
      const generationResults = await this.generateLessonTemplates();
      
      // 4. Update template data
      const updatedData = this.updateTemplateData(templateData, generationResults);
      
      // 5. Save template data
      await this.saveTemplateData(updatedData);
      
      // 6. Generate template report
      await this.generateTemplateReport(generationResults);
      
      console.log('🎉 Lesson Template Generator completed!');
      
      return {
        success: true,
        totalTemplates: generationResults.templates.length,
        generatedTemplates: generationResults.templates.length,
        templateTypes: Object.keys(generationResults.templateTypes).length
      };
    } catch (error) {
      console.error('❌ Lesson Template Generator failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async loadTemplateData() {
    try {
      if (fs.existsSync(this.templateConfigFile)) {
        const data = JSON.parse(fs.readFileSync(this.templateConfigFile, 'utf8'));
        console.log(`📦 Loaded existing template data with ${data.templateHistory.length} template records`);
        return data;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load template data:', error.message);
    }
    
    return {
      templateHistory: [],
      generationHistory: [],
      lastUpdated: null
    };
  }

  async saveTemplateData(data) {
    try {
      data.lastUpdated = new Date().toISOString();
      fs.mkdirSync(path.dirname(this.templateConfigFile), { recursive: true });
      fs.writeFileSync(this.templateConfigFile, JSON.stringify(data, null, 2));
      console.log(`💾 Saved template data with ${data.templateHistory.length} template records`);
    } catch (error) {
      console.warn('⚠️ Failed to save template data:', error.message);
    }
  }

  async createTemplateDirectories() {
    const directories = [
      this.generatedTemplatesDir,
      path.join(this.generatedTemplatesDir, 'technical'),
      path.join(this.generatedTemplatesDir, 'process'),
      path.join(this.generatedTemplatesDir, 'project'),
      path.join(this.generatedTemplatesDir, 'general')
    ];
    
    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    });
  }

  async generateLessonTemplates() {
    const templates = [];
    const templateTypes = {};
    
    // Generate different types of lesson templates
    const templateDefinitions = [
      {
        type: 'technical',
        name: 'technical-lesson-template.md',
        title: 'Technical Lesson Template',
        description: 'Template for technical lessons learned',
        sections: ['context', 'actionTaken', 'results', 'keyInsights', 'recommendations', 'followUpActions'],
        tags: ['technical', 'implementation', 'coding']
      },
      {
        type: 'process',
        name: 'process-lesson-template.md',
        title: 'Process Lesson Template',
        description: 'Template for process improvement lessons',
        sections: ['context', 'actionTaken', 'results', 'keyInsights', 'recommendations', 'followUpActions'],
        tags: ['process', 'workflow', 'improvement']
      },
      {
        type: 'project',
        name: 'project-lesson-template.md',
        title: 'Project Lesson Template',
        description: 'Template for project management lessons',
        sections: ['context', 'actionTaken', 'results', 'keyInsights', 'recommendations', 'followUpActions'],
        tags: ['project', 'management', 'planning']
      },
      {
        type: 'general',
        name: 'general-lesson-template.md',
        title: 'General Lesson Template',
        description: 'Template for general lessons learned',
        sections: ['context', 'actionTaken', 'results', 'keyInsights', 'recommendations'],
        tags: ['general', 'learning', 'improvement']
      },
      {
        type: 'critical',
        name: 'critical-lesson-template.md',
        title: 'Critical Lesson Template',
        description: 'Template for critical lessons that need immediate attention',
        sections: ['context', 'actionTaken', 'results', 'keyInsights', 'recommendations', 'followUpActions', 'relatedLessons'],
        tags: ['critical', 'urgent', 'blocker']
      }
    ];
    
    for (const templateDef of templateDefinitions) {
      try {
        const templateContent = this.generateTemplateContent(templateDef);
        const templatePath = path.join(this.generatedTemplatesDir, templateDef.type, templateDef.name);
        
        fs.writeFileSync(templatePath, templateContent);
        
        templates.push({
          filename: templateDef.name,
          type: templateDef.type,
          title: templateDef.title,
          description: templateDef.description,
          sections: templateDef.sections,
          tags: templateDef.tags,
          path: templatePath
        });
        
        templateTypes[templateDef.type] = (templateTypes[templateDef.type] || 0) + 1;
        
        console.log(`📝 Generated template: ${templateDef.name}`);
        
      } catch (error) {
        console.warn(`⚠️ Failed to generate template ${templateDef.name}: ${error.message}`);
      }
    }
    
    return {
      templates,
      templateTypes,
      totalTemplates: templates.length,
      generationTimestamp: new Date().toISOString()
    };
  }

  generateTemplateContent(templateDef) {
    const today = new Date().toISOString().split('T')[0];
    
    let content = `# ${templateDef.title}

**Date**: ${today}  
**Project**: [Project Name]  
**Phase**: [planning/development/testing/deployment/maintenance]  
**Priority**: [critical/high/medium/low]  

## Context
[Describe the situation, problem, or challenge that led to this lesson]

## Action Taken
[Describe what was done to address the situation]

## Results
[Describe the outcomes, both positive and negative]

## Key Insights
[Document the key learnings and insights gained]

## Recommendations
[Provide actionable recommendations for future similar situations]

`;

    // Add optional sections based on template type
    if (templateDef.sections.includes('followUpActions')) {
      content += `## Follow-up Actions
[Document specific actions that need to be taken]

`;
    }
    
    if (templateDef.sections.includes('relatedLessons')) {
      content += `## Related Lessons
[Link to related lessons learned]

`;
    }
    
    content += `## Tags
${templateDef.tags.map(tag => `- ${tag}`).join('\n')}

---
**Template Type**: ${templateDef.type}  
**Generated**: ${new Date().toISOString()}  
**Version**: 1.0  
`;

    return content;
  }

  updateTemplateData(existingData, generationResults) {
    const newTemplateData = {
      timestamp: new Date().toISOString(),
      totalTemplates: generationResults.totalTemplates,
      templateTypes: generationResults.templateTypes,
      generatedTemplates: generationResults.templates.length
    };
    
    return {
      templateHistory: [...existingData.templateHistory, newTemplateData],
      generationHistory: [...existingData.generationHistory, generationResults.templates],
      lastUpdated: new Date().toISOString()
    };
  }

  async generateTemplateReport(generationResults) {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalTemplates: generationResults.totalTemplates,
        generatedTemplates: generationResults.templates.length,
        templateTypes: Object.keys(generationResults.templateTypes).length,
        topTemplateTypes: this.getTopTemplateTypes(generationResults.templateTypes, 5)
      },
      templateTypes: generationResults.templateTypes,
      templates: generationResults.templates.map(template => ({
        filename: template.filename,
        type: template.type,
        title: template.title,
        sections: template.sections.length,
        tags: template.tags.length
      }))
    };
    
    const reportPath = path.join(this.sourceDir, 'reports', 'template-generation-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Generated template report: ${reportPath}`);
  }

  getTopTemplateTypes(templateTypes, limit) {
    return Object.entries(templateTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([type, count]) => ({ type, count }));
  }

  // Additional utility methods
  getTemplateByType(templateType) {
    const templatePath = path.join(this.generatedTemplatesDir, templateType);
    const templates = [];
    
    if (fs.existsSync(templatePath)) {
      const files = fs.readdirSync(templatePath).filter(file => file.endsWith('.md'));
      files.forEach(file => {
        templates.push({
          filename: file,
          path: path.join(templatePath, file),
          type: templateType
        });
      });
    }
    
    return templates;
  }

  createLessonFromTemplate(templatePath, lessonData) {
    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      let lessonContent = templateContent;
      
      // Replace template placeholders with actual data
      Object.entries(lessonData).forEach(([key, value]) => {
        const placeholder = `[${key}]`;
        lessonContent = lessonContent.replace(new RegExp(placeholder, 'g'), value);
      });
      
      return lessonContent;
    } catch (error) {
      console.error(`❌ Failed to create lesson from template: ${error.message}`);
      return null;
    }
  }

  getAvailableTemplates() {
    const templates = [];
    const templateTypes = ['technical', 'process', 'project', 'general', 'critical'];
    
    templateTypes.forEach(type => {
      const typeTemplates = this.getTemplateByType(type);
      templates.push(...typeTemplates);
    });
    
    return templates;
  }

  validateTemplate(templatePath) {
    try {
      const content = fs.readFileSync(templatePath, 'utf8');
      const errors = [];
      
      // Check for required sections
      const requiredSections = ['## Context', '## Action Taken', '## Results', '## Key Insights', '## Recommendations'];
      requiredSections.forEach(section => {
        if (!content.includes(section)) {
          errors.push(`Missing required section: ${section}`);
        }
      });
      
      // Check for template metadata
      if (!content.includes('**Date**:')) {
        errors.push('Missing date field');
      }
      
      if (!content.includes('**Project**:')) {
        errors.push('Missing project field');
      }
      
      if (!content.includes('**Phase**:')) {
        errors.push('Missing phase field');
      }
      
      if (!content.includes('**Priority**:')) {
        errors.push('Missing priority field');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        errorCount: errors.length
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Failed to read template: ${error.message}`],
        errorCount: 1
      };
    }
  }
}

// Run the generator
if (require.main === module) {
  const generator = new LessonTemplateGenerator();
  generator.run().catch(console.error);
}

module.exports = LessonTemplateGenerator; 