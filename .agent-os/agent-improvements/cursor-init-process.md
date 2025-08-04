# Cursor Init Process - Agent OS Framework

## Overview
This document defines the Cursor init process for the .agent-os framework. The process converts .md files into .mdc rules that Cursor can use, ensuring all rules are generated from Markdown documentation.

## Process Flow

### 1. **Source File Discovery**
```javascript
// cursor-init.js - Source file discovery
const discoverSourceFiles = () => {
  // Scan .agent-os directory for .md files
  // Identify rule-worthy content
  // Map file relationships
  return sourceFiles;
};
```

### 2. **Content Analysis**
```javascript
// cursor-init.js - Content analysis
const analyzeContent = (sourceFiles) => {
  // Parse Markdown content
  // Extract rule-worthy sections
  // Identify patterns and standards
  return analyzedContent;
};
```

### 3. **Rule Generation**
```javascript
// cursor-init.js - Rule generation
const generateRules = (analyzedContent) => {
  // Convert .md content to .mdc format
  // Apply Cursor-specific formatting
  // Validate rule syntax
  return generatedRules;
};
```

### 4. **Rule Validation**
```javascript
// cursor-init.js - Rule validation
const validateRules = (generatedRules) => {
  // Check syntax correctness
  // Verify content completeness
  // Test rule effectiveness
  return validatedRules;
};
```

## File Structure

### Source Files (.md)
```
.agent-os/
├── standards/
│   ├── tech-stack.md
│   ├── code-style.md
│   ├── best-practices.md
│   └── enforcement.md
├── lessons-learned/
│   ├── categories/
│   └── templates/
└── templates/
    └── task-list-template.md
```

### Generated Files (.mdc)
```
.cursor/
├── rules/
│   ├── tech-stack.mdc
│   ├── code-style.mdc
│   ├── best-practices.mdc
│   └── enforcement.mdc
└── generated/
    └── lessons-learned-rules.mdc
```

## Implementation

### cursor-init.js
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CursorInit {
  constructor() {
    this.sourceDir = '.agent-os';
    this.outputDir = '.cursor/rules';
    this.generatedDir = '.cursor/generated';
  }

  async run() {
    console.log('🚀 Starting Cursor init process...');
    
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
  }

  discoverSourceFiles() {
    const patterns = [
      `${this.sourceDir}/standards/*.md`,
      `${this.sourceDir}/lessons-learned/**/*.md`,
      `${this.sourceDir}/templates/*.md`
    ];
    
    let files = [];
    patterns.forEach(pattern => {
      const matches = glob.sync(pattern);
      files = files.concat(matches);
    });
    
    return files;
  }

  analyzeContent(sourceFiles) {
    const analyzed = [];
    
    sourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const analysis = this.parseMarkdownContent(content, file);
      analyzed.push(analysis);
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
      metadata: this.extractMetadata(content)
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
          content: [line]
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
    
    // Apply rule formatting
    const ruleContent = this.formatAsRule(title, content);
    
    return {
      title,
      content: ruleContent,
      source: section
    };
  }

  formatAsRule(title, content) {
    // Format content as Cursor rule
    return `# ${title}

${content}

---
**Generated by Agent OS Cursor Init Process**
**Source**: .agent-os framework
**Last Updated**: ${new Date().toISOString()}
`;
  }

  generateRules(analyzedContent) {
    const rules = [];
    
    analyzedContent.forEach(analysis => {
      analysis.rules.forEach(rule => {
        rules.push({
          filename: this.generateRuleFilename(rule.title),
          content: rule.content,
          source: rule.source
        });
      });
    });
    
    return rules;
  }

  generateRuleFilename(title) {
    // Convert title to filename
    return title
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
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async writeOutput(validatedRules) {
    // Ensure output directories exist
    this.ensureDirectories();
    
    // Write rules to .cursor/rules/
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
      rules: validatedRules.map(rule => ({
        filename: rule.filename,
        title: rule.title,
        source: rule.source?.filePath
      }))
    };
    
    const summaryPath = path.join(this.generatedDir, 'init-summary.json');
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
```

## Usage

### Command Line
```bash
# Run Cursor init process
node .agent-os/tools/cursor-init.js

# Run with specific options
node .agent-os/tools/cursor-init.js --source=.agent-os --output=.cursor/rules
```

### Package.json Script
```json
{
  "scripts": {
    "cursor:init": "node .agent-os/tools/cursor-init.js",
    "cursor:watch": "node .agent-os/tools/cursor-init.js --watch"
  }
}
```

## Configuration

### .cursor-init.json
```json
{
  "sourceDirectories": [
    ".agent-os/standards",
    ".agent-os/lessons-learned",
    ".agent-os/templates"
  ],
  "outputDirectory": ".cursor/rules",
  "generatedDirectory": ".cursor/generated",
  "excludePatterns": [
    "**/node_modules/**",
    "**/.git/**"
  ],
  "ruleTemplates": {
    "standards": "standard-rule-template.mdc",
    "lessons": "lesson-rule-template.mdc",
    "templates": "template-rule-template.mdc"
  }
}
```

## Integration

### With Existing Tools
- **compliance-checker.js**: Validate generated rules
- **cursor-integration.js**: Use generated rules for validation
- **documentation-analyzer.js**: Analyze source content quality

### With CI/CD
```yaml
# .github/workflows/cursor-init.yml
name: Cursor Init Process
on:
  push:
    paths:
      - '.agent-os/**'
  schedule:
    - cron: '0 0 * * *' # Daily

jobs:
  cursor-init:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run cursor:init
      - run: git add .cursor/
      - run: git commit -m "Update Cursor rules" || true
      - run: git push || true
```

## Success Metrics

### Implementation Goals
- **Rule Generation**: 100% of .md files converted to .mdc rules
- **Validation Success**: 95% of generated rules pass validation
- **Content Coverage**: 100% of rule-worthy content included
- **Performance**: < 30 seconds for full init process

### Quality Standards
- **Rule Completeness**: All required sections present
- **Syntax Correctness**: Valid .mdc format
- **Content Accuracy**: Faithful to source .md files
- **Metadata Completeness**: All metadata fields populated

---

**Document Status**: ✅ **Active**  
**Next Review**: 2025-02-03  
**Owner**: Development Team  
**Approved**: Development Team 