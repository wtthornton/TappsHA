# Agent OS Development Patterns and Anti-Patterns

## 🎯 Purpose
This document defines proven development patterns and anti-patterns identified through real-world implementation experience with Agent OS tools.

## ✅ Recommended Patterns

### 1. Dependency Management Pattern
```javascript
// ALWAYS verify dependencies before use
class ToolInitializer {
  constructor() {
    this.verifyDependencies();
    this.initializeComponents();
  }
  
  verifyDependencies() {
    const required = ['commander', 'chokidar', 'glob'];
    const missing = required.filter(mod => {
      try {
        require.resolve(mod);
        return false;
      } catch (e) {
        return true;
      }
    });
    
    if (missing.length > 0) {
      throw new Error(`Missing dependencies: ${missing.join(', ')}. Run: npm install`);
    }
  }
}
```

### 2. Object Initialization Pattern
```javascript
// ALWAYS initialize all objects in constructor
class ServiceClass {
  constructor() {
    // Initialize all objects that will be accessed
    this.metrics = this.getDefaultMetrics();
    this.realTimeData = this.getDefaultRealTimeData();
    this.cache = new Map();
    this.errors = [];
    
    // Initialize with defaults to prevent undefined access
    this.config = {
      timeout: 5000,
      retries: 3,
      ...this.loadConfig()
    };
  }
  
  getDefaultMetrics() {
    return {
      startTime: Date.now(),
      count: 0,
      errors: 0,
      success: 0
    };
  }
}
```

### 3. Cross-Platform Shell Execution Pattern
```javascript
// ALWAYS handle platform differences
class ShellCommand {
  static execute(command) {
    const isWindows = process.platform === 'win32';
    
    if (isWindows && command.includes('&&')) {
      // PowerShell doesn't support &&, use semicolon or separate commands
      return command.split('&&')
        .map(cmd => execSync(cmd.trim(), { encoding: 'utf8' }))
        .join('\n');
    }
    
    return execSync(command, { 
      encoding: 'utf8',
      shell: isWindows ? 'powershell.exe' : '/bin/bash'
    });
  }
}
```

### 4. Circular Dependency Prevention Pattern
```javascript
// AVOID circular dependencies by using data-only methods
class MetricsCalculator {
  // DON'T DO THIS - causes circular dependency
  calculateEffectivenessBad() {
    const metrics = this.getCurrentMetrics(); // This might call calculateEffectiveness
    return this.processMetrics(metrics);
  }
  
  // DO THIS - use data-only access
  calculateEffectivenessGood() {
    const rawData = this.readMetricsFile(); // Direct data access
    return this.processMetrics(rawData);
  }
  
  readMetricsFile() {
    try {
      return JSON.parse(fs.readFileSync(this.metricsPath, 'utf8'));
    } catch (e) {
      return this.getDefaultMetrics();
    }
  }
}
```

### 5. Robust Error Handling Pattern
```javascript
// ALWAYS implement comprehensive error handling
class RobustService {
  async performOperation(data) {
    try {
      // Validate input
      this.validateInput(data);
      
      // Main operation with fallback
      try {
        return await this.primaryOperation(data);
      } catch (primaryError) {
        console.warn('Primary operation failed, trying fallback:', primaryError.message);
        return await this.fallbackOperation(data);
      }
    } catch (error) {
      // Log error with context
      console.error('Operation failed:', {
        error: error.message,
        stack: error.stack,
        data: this.sanitizeData(data)
      });
      
      // Return safe default
      return this.getSafeDefault();
    } finally {
      // Cleanup
      this.cleanup();
    }
  }
}
```

### 6. Type Safety Pattern
```javascript
// ALWAYS document and validate types
class TypeSafeService {
  /**
   * Process metrics data
   * @param {Object} metrics - Metrics object
   * @param {number} metrics.score - Compliance score (0-100)
   * @param {Array<Object>} metrics.violations - List of violations
   * @returns {Object} Processed results
   */
  processMetrics(metrics) {
    // Validate types
    if (typeof metrics !== 'object') {
      throw new TypeError('Metrics must be an object');
    }
    
    if (typeof metrics.score !== 'number' || metrics.score < 0 || metrics.score > 100) {
      throw new TypeError('Score must be a number between 0 and 100');
    }
    
    if (!Array.isArray(metrics.violations)) {
      metrics.violations = []; // Safe default
    }
    
    return this.calculate(metrics);
  }
}
```

### 7. Async Operation Pattern
```javascript
// ALWAYS handle async operations properly
class AsyncService {
  async processFiles(files) {
    const results = [];
    const errors = [];
    
    // Process in parallel with error handling
    const promises = files.map(async (file) => {
      try {
        const result = await this.processFile(file);
        results.push(result);
        return { success: true, file, result };
      } catch (error) {
        errors.push({ file, error: error.message });
        return { success: false, file, error: error.message };
      }
    });
    
    // Wait for all with timeout
    const outcomes = await Promise.allSettled(promises);
    
    return {
      results,
      errors,
      summary: {
        total: files.length,
        successful: results.length,
        failed: errors.length
      }
    };
  }
}
```

## ❌ Anti-Patterns to Avoid

### 1. Unverified Dependencies Anti-Pattern
```javascript
// DON'T DO THIS
const commander = require('commander'); // Might fail if not installed

// DO THIS
try {
  const commander = require('commander');
} catch (error) {
  console.error('Required module not found. Run: npm install');
  process.exit(1);
}
```

### 2. Uninitialized Object Access Anti-Pattern
```javascript
// DON'T DO THIS
class BadService {
  someMethod() {
    this.data.value = 10; // data might be undefined
  }
}

// DO THIS
class GoodService {
  constructor() {
    this.data = { value: 0 };
  }
  
  someMethod() {
    this.data.value = 10; // data is always initialized
  }
}
```

### 3. Platform-Specific Commands Anti-Pattern
```javascript
// DON'T DO THIS
execSync('cd dir && npm install'); // Fails on PowerShell

// DO THIS
execSync('cd dir');
execSync('npm install');
// OR use path.join and proper cwd option
execSync('npm install', { cwd: path.join(__dirname, 'dir') });
```

### 4. Circular Method Calls Anti-Pattern
```javascript
// DON'T DO THIS
class BadCalculator {
  getMetrics() {
    return this.enhance(this.data);
  }
  
  enhance(data) {
    const metrics = this.getMetrics(); // Circular!
    return { ...data, ...metrics };
  }
}

// DO THIS
class GoodCalculator {
  getMetrics() {
    const rawData = this.loadData();
    return this.enhance(rawData);
  }
  
  enhance(data) {
    // Process without calling getMetrics
    return { ...data, enhanced: true };
  }
}
```

### 5. Silent Failure Anti-Pattern
```javascript
// DON'T DO THIS
function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (e) {
    // Silent failure - no indication of error
    return '';
  }
}

// DO THIS
function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch (e) {
    console.warn(`Could not read file ${path}:`, e.message);
    return null; // Explicit null for failure
  }
}
```

### 6. Type Assumption Anti-Pattern
```javascript
// DON'T DO THIS
function process(data) {
  return data.map(item => item.value); // Assumes data is array
}

// DO THIS
function process(data) {
  if (!Array.isArray(data)) {
    console.warn('Expected array, got:', typeof data);
    return [];
  }
  return data.map(item => item?.value || 0);
}
```

## 🛠️ Implementation Guidelines

### Pre-Development Checklist
- [ ] Dependencies verified and installed
- [ ] Target platform identified (Windows/Unix)
- [ ] Object initialization planned
- [ ] Error handling strategy defined
- [ ] Type validation implemented
- [ ] Circular dependencies checked

### Code Review Checklist
- [ ] All objects initialized in constructor
- [ ] Error handling for all external operations
- [ ] Platform-specific code handled
- [ ] No circular dependencies
- [ ] Types documented and validated
- [ ] Fallback mechanisms in place

### Testing Requirements
- [ ] Test on Windows PowerShell
- [ ] Test on Unix/bash
- [ ] Test with missing dependencies
- [ ] Test with invalid input types
- [ ] Test error recovery paths
- [ ] Test async operation handling

## 📊 Pattern Effectiveness Metrics

### Success Indicators
- Zero unhandled exceptions
- 100% dependency verification
- Cross-platform compatibility
- No circular dependency errors
- Graceful error recovery
- Type safety maintained

### Failure Indicators
- Unhandled promise rejections
- Module not found errors
- Platform-specific failures
- Stack overflow errors
- Silent failures
- Type errors in production

## 🔄 Continuous Improvement

### Monthly Review Items
1. Review error logs for patterns
2. Update anti-patterns list
3. Refine error handling strategies
4. Improve type validation
5. Enhance cross-platform support

### Quarterly Updates
1. Major pattern revisions
2. New pattern adoption
3. Tool compatibility updates
4. Performance optimization patterns
5. Security pattern updates

---

## 📝 Document Metadata
- **Created**: December 2024
- **Version**: 1.0.0
- **Status**: Active
- **Owner**: Agent OS Team
- **Review Cycle**: Monthly
- **Last Updated**: December 2024

## ✅ Enforcement
These patterns are **MANDATORY** for all Agent OS development. Code reviews must verify compliance with these patterns before approval.