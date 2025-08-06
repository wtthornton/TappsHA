#!/usr/bin/env node

/**
 * Dependency Validation Utility
 * Extracted from validation-implementation-lessons.md
 * 
 * Provides reusable dependency verification and management functions
 * that can be used across all Agent OS tools and scripts.
 */

const fs = require('fs');
const path = require('path');

class DependencyValidator {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.packageJsonPath = path.join(projectRoot, 'package.json');
  }

  /**
   * Verify all required dependencies are installed
   * @param {string[]} additionalModules - Extra modules to check beyond package.json
   * @returns {Object} validation result with missing dependencies
   */
  verifyDependencies(additionalModules = []) {
    console.log('🔍 Verifying project dependencies...');
    
    const required = this.getRequiredDependencies();
    const allRequired = [...required, ...additionalModules];
    const missing = [];
    
    for (const module of allRequired) {
      try {
        require.resolve(module);
        console.log(`✅ ${module} - Found`);
      } catch (e) {
        missing.push(module);
        console.log(`❌ ${module} - Missing`);
      }
    }
    
    const result = {
      total: allRequired.length,
      missing: missing.length,
      missingModules: missing,
      passed: missing.length === 0
    };
    
    if (missing.length > 0) {
      console.error(`\n❌ Missing ${missing.length} dependencies: ${missing.join(', ')}`);
      console.log('📦 Run: npm install');
      return result;
    }
    
    console.log(`\n✅ All ${allRequired.length} dependencies verified`);
    return result;
  }

  /**
   * Get required dependencies from package.json
   * @returns {string[]} array of dependency names
   */
  getRequiredDependencies() {
    if (!fs.existsSync(this.packageJsonPath)) {
      console.warn('⚠️  No package.json found, skipping dependency check');
      return [];
    }
    
    try {
      const pkg = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      return [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {})
      ];
    } catch (error) {
      console.error('❌ Failed to parse package.json:', error.message);
      return [];
    }
  }

  /**
   * Check Node.js version compatibility
   * @param {number} minVersion - Minimum required Node.js major version
   * @returns {Object} version check result
   */
  verifyNodeVersion(minVersion = 18) {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    const result = {
      current: nodeVersion,
      required: `>=${minVersion}`,
      passed: major >= minVersion
    };
    
    if (major < minVersion) {
      console.error(`❌ Node.js ${minVersion}+ required, found ${nodeVersion}`);
      return result;
    }
    
    console.log(`✅ Node.js version ${nodeVersion} meets requirement (>=${minVersion})`);
    return result;
  }

  /**
   * Safe module require with fallback
   * @param {string} moduleName - Module to require
   * @param {*} fallback - Fallback value if module not found
   * @returns {*} module or fallback
   */
  static safeRequire(moduleName, fallback = null) {
    try {
      return require(moduleName);
    } catch (e) {
      console.warn(`⚠️  Module ${moduleName} not found, using fallback`);
      return fallback;
    }
  }

  /**
   * Comprehensive environment validation
   * @param {Object} options - Validation options
   * @returns {Object} complete validation result
   */
  validateEnvironment(options = {}) {
    const {
      minNodeVersion = 18,
      additionalModules = [],
      checkPackageJson = true
    } = options;

    console.log('🚀 Starting comprehensive environment validation...');
    
    const results = {
      timestamp: new Date().toISOString(),
      nodeVersion: this.verifyNodeVersion(minNodeVersion),
      dependencies: checkPackageJson ? this.verifyDependencies(additionalModules) : { passed: true },
      overall: false
    };
    
    results.overall = results.nodeVersion.passed && results.dependencies.passed;
    
    if (results.overall) {
      console.log('\n🎉 Environment validation passed! Ready to proceed.');
    } else {
      console.log('\n❌ Environment validation failed. Please fix issues before continuing.');
      process.exit(1);
    }
    
    return results;
  }
}

// Circular dependency detector utility
class CircularDependencyDetector {
  constructor() {
    this.callStack = [];
    this.circularDependencies = [];
  }
  
  trackCall(methodName) {
    if (this.callStack.includes(methodName)) {
      const cycle = [...this.callStack, methodName];
      this.circularDependencies.push(cycle);
      throw new Error(`Circular dependency detected: ${cycle.join(' → ')}`);
    }
    this.callStack.push(methodName);
  }
  
  endCall() {
    this.callStack.pop();
  }

  reset() {
    this.callStack = [];
    this.circularDependencies = [];
  }

  getDetectedCycles() {
    return this.circularDependencies;
  }
}

module.exports = {
  DependencyValidator,
  CircularDependencyDetector
};

// CLI usage when run directly
if (require.main === module) {
  const validator = new DependencyValidator();
  validator.validateEnvironment({
    minNodeVersion: 18,
    additionalModules: process.argv.slice(2)
  });
}