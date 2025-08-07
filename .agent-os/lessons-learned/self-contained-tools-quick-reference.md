# Self-Contained Tools Quick Reference

## 📋 **Document Metadata**
- **Title**: Self-Contained Tools Quick Reference
- **Created**: 2025-01-27
- **Version**: 1.0
- **Status**: Active
- **Next Review**: 2025-02-03
- **Owner**: Agent OS Development Team

## 🚀 **Quick Start Checklist**

### ✅ **Before Starting Development**
- [ ] Check `package.json` "type" field (should be "module" for ES modules)
- [ ] Use ES module `import`/`export` syntax
- [ ] Implement `fileURLToPath` for `__dirname` emulation
- [ ] Plan self-contained functionality before adding dependencies

### ✅ **Essential Patterns**

#### **ES Module Setup**
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

#### **Main Module Detection**
```javascript
if (import.meta.url === `file://${process.argv[1]}`) {
  // Tool is being run directly
}
```

#### **Self-Contained File Discovery**
```javascript
findFiles(pattern, options = {}) {
  const { cwd = '.', ignore = [] } = options;
  const files = [];
  
  const findFilesRecursive = (dir, baseDir = '') => {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.join(baseDir, item);
      const stats = fs.statSync(fullPath);
      
      // Check ignore patterns
      const shouldIgnore = ignore.some(ignorePattern => {
        if (ignorePattern.includes('**')) {
          const pattern = ignorePattern.replace('**', '.*');
          return new RegExp(pattern).test(relativePath);
        }
        return relativePath.includes(ignorePattern.replace('**', ''));
      });
      
      if (shouldIgnore) continue;
      
      if (stats.isDirectory()) {
        findFilesRecursive(fullPath, relativePath);
      } else if (stats.isFile()) {
        if (this.matchesPattern(relativePath, pattern)) {
          files.push(relativePath);
        }
      }
    }
  };
  
  findFilesRecursive(cwd);
  return files;
}
```

#### **Pattern Matching**
```javascript
matchesPattern(filePath, pattern) {
  if (pattern.includes('**')) {
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.');
    return new RegExp(regexPattern).test(filePath);
  } else if (pattern.includes('*')) {
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
    return new RegExp(regexPattern).test(filePath);
  } else {
    return filePath === pattern;
  }
}
```

## ⚠️ **Common Issues & Solutions**

### **Issue 1: `ReferenceError: require is not defined`**
**Cause**: Using CommonJS `require()` in ES module
**Solution**: Convert to ES module `import` syntax
```javascript
// ❌ Wrong
const fs = require('fs');

// ✅ Correct
import fs from 'fs';
```

### **Issue 2: `__dirname is not defined`**
**Cause**: `__dirname` not available in ES modules
**Solution**: Use `fileURLToPath` for path resolution
```javascript
// ❌ Wrong
const __dirname = path.dirname(__filename);

// ✅ Correct
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

### **Issue 3: `await` expressions only allowed in async functions**
**Cause**: Using `await` in non-async function
**Solution**: Remove unnecessary `async`/`await` or make function async
```javascript
// ❌ Wrong
const files = await this.findFiles(pattern);

// ✅ Correct (if findFiles is synchronous)
const files = this.findFiles(pattern);

// ✅ Correct (if findFiles is asynchronous)
async processFiles() {
  const files = await this.findFiles(pattern);
}
```

### **Issue 4: Method not defined**
**Cause**: Calling method that doesn't exist
**Solution**: Implement all required methods with meaningful defaults
```javascript
// ✅ Always implement placeholder methods
createStatisticalAnalysis() {
  return {
    analyzeViolationFrequency: (data) => ({
      totalViolations: 0,
      averageViolations: 0,
      trend: 'stable'
    }),
    // ... implement all required methods
  };
}
```

## 🔧 **Best Practices**

### **1. Dependency Management**
- ✅ Prefer built-in Node.js APIs
- ✅ Self-contained first, dependencies last
- ✅ Minimal external footprint
- ✅ Document expected methods when removing dependencies

### **2. Error Handling**
- ✅ Use try-catch blocks for file operations
- ✅ Provide meaningful error messages
- ✅ Graceful degradation for missing files
- ✅ Validate inputs before processing

### **3. Performance**
- ✅ Use synchronous operations when possible
- ✅ Implement proper ignore patterns
- ✅ Limit file processing scope
- ✅ Cache results when appropriate

### **4. Testing**
- ✅ Test all tools after changes
- ✅ Validate on multiple platforms
- ✅ Check linter compliance
- ✅ Verify functionality end-to-end

## 📊 **Success Metrics**

### **Quality Indicators**
- ✅ No external dependencies (except Node.js built-ins)
- ✅ Cross-platform compatibility (Windows, macOS, Linux)
- ✅ Self-contained operation
- ✅ Comprehensive error handling
- ✅ Proper documentation

### **Performance Targets**
- ✅ < 5 seconds startup time
- ✅ < 100MB memory usage
- ✅ Handle large codebases efficiently
- ✅ Real-time feedback when possible

## 📚 **References**

### **Key Documents**
- `.agent-os/agent-improvements/tech-stack.md`: Technology stack standards
- `.agent-os/templates/tool-template.js`: Reusable tool template
- `.agent-os/lessons-learned/2025-01-27-tools-self-contained-architecture-lessons.md`: Detailed lessons learned

### **Pattern Examples**
- `enhanced-dashboard.js`: Dashboard tool with real-time metrics
- `simple-metrics-api.js`: REST API for metrics
- `validation-suite.js`: Comprehensive validation engine
- `agent-os-cli.js`: Command-line interface
- `compliance-checker.js`: Standards compliance checker

---

**Next Review**: 2025-02-03
**Status**: Active
**Owner**: Agent OS Development Team 