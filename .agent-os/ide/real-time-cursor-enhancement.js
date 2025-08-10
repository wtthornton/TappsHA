#!/usr/bin/env node

/**
 * Real-Time Cursor Enhancement for Agent OS
 * Provides immediate feedback, validation, and guidance during development
 */

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const { spawn } = require('child_process');

class RealTimeCursorEnhancement {
  constructor() {
    this.projectRoot = process.cwd();
    this.agentOsPath = path.join(this.projectRoot, '.agent-os');
    this.watcher = null;
    this.isActive = false;
    this.lastValidation = new Map();
    this.validationQueue = [];
    this.isProcessing = false;
    
    // Configuration
    this.config = {
      watchPatterns: [
        '**/*.{js,ts,jsx,tsx,java,kt,py,go,rs,php}',
        '**/*.{md,yml,yaml,json,xml}',
        '**/Dockerfile*',
        '**/package.json',
        '**/pom.xml',
        '**/build.gradle'
      ],
      ignorePatterns: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/target/**',
        '**/.agent-os/internal/**'
      ],
      validationDelay: 1000, // ms
      maxConcurrentValidations: 3
    };
    
    this.loadConfiguration();
  }

  loadConfiguration() {
    try {
      const configPath = path.join(this.agentOsPath, 'config', 'real-time.json');
      if (fs.existsSync(configPath)) {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      console.warn('⚠️  Could not load real-time configuration, using defaults');
    }
  }

  async start() {
    if (this.isActive) {
      console.log('🔄 Real-time enhancement already active');
      return;
    }

    console.log('🚀 Starting Real-Time Cursor Enhancement...');
    console.log(`📁 Watching: ${this.projectRoot}`);
    
    try {
      await this.initializeWatcher();
      await this.startBackgroundValidation();
      this.isActive = true;
      
      console.log('✅ Real-time enhancement active');
      console.log('💡 Start coding to receive immediate feedback and validation!');
      
      // Keep the process alive
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
      
    } catch (error) {
      console.error('❌ Failed to start real-time enhancement:', error.message);
      throw error;
    }
  }

  async initializeWatcher() {
    return new Promise((resolve, reject) => {
      try {
        this.watcher = chokidar.watch(this.config.watchPatterns, {
          ignored: this.config.ignorePatterns,
          persistent: true,
          ignoreInitial: true,
          awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100
          }
        });

        this.watcher
          .on('ready', () => {
            console.log('   ✅ File watcher initialized');
            resolve();
          })
          .on('add', (filePath) => this.handleFileChange(filePath, 'add'))
          .on('change', (filePath) => this.handleFileChange(filePath, 'change'))
          .on('unlink', (filePath) => this.handleFileChange(filePath, 'delete'))
          .on('error', (error) => {
            console.error('   ❌ File watcher error:', error.message);
            reject(error);
          });

      } catch (error) {
        reject(error);
      }
    });
  }

  handleFileChange(filePath, eventType) {
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // Skip if it's an Agent OS internal file
    if (relativePath.startsWith('.agent-os/internal/')) {
      return;
    }

    console.log(`📝 ${eventType.toUpperCase()}: ${relativePath}`);
    
    // Queue validation with debouncing
    this.queueValidation(filePath, eventType);
  }

  queueValidation(filePath, eventType) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const now = Date.now();
    
    // Clear existing timeout for this file
    if (this.lastValidation.has(relativePath)) {
      clearTimeout(this.lastValidation.get(relativePath).timeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(() => {
      this.processValidation(filePath, eventType);
    }, this.config.validationDelay);
    
    this.lastValidation.set(relativePath, {
      timeout,
      timestamp: now,
      eventType
    });
  }

  async processValidation(filePath, eventType) {
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // Remove from lastValidation map
    this.lastValidation.delete(relativePath);
    
    // Add to validation queue
    this.validationQueue.push({
      filePath,
      relativePath,
      eventType,
      timestamp: Date.now()
    });
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processValidationQueue();
    }
  }

  async processValidationQueue() {
    if (this.isProcessing || this.validationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      while (this.validationQueue.length > 0) {
        const batch = this.validationQueue.splice(0, this.config.maxConcurrentValidations);
        
        // Process batch concurrently
        const promises = batch.map(item => this.validateFile(item));
        await Promise.allSettled(promises);
        
        // Small delay between batches
        if (this.validationQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      console.error('❌ Validation queue processing error:', error.message);
    } finally {
      this.isProcessing = false;
      
      // Process any new items that arrived while processing
      if (this.validationQueue.length > 0) {
        setImmediate(() => this.processValidationQueue());
      }
    }
  }

  async validateFile(validationItem) {
    const { filePath, relativePath, eventType } = validationItem;
    
    try {
      console.log(`🔍 Validating: ${relativePath}`);
      
      // Determine validation type based on file extension
      const validationType = this.getValidationType(filePath);
      
      // Run appropriate validation
      const result = await this.runValidation(filePath, validationType);
      
      // Process validation results
      await this.processValidationResults(filePath, result, validationType);
      
      console.log(`✅ Validation complete: ${relativePath}`);
      
    } catch (error) {
      console.error(`❌ Validation failed for ${relativePath}:`, error.message);
    }
  }

  getValidationType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
      return 'frontend';
    } else if (['.java', '.kt'].includes(ext)) {
      return 'backend';
    } else if (['.py'].includes(ext)) {
      return 'python';
    } else if (['.go'].includes(ext)) {
      return 'golang';
    } else if (['.rs'].includes(ext)) {
      return 'rust';
    } else if (['.php'].includes(ext)) {
      return 'php';
    } else if (['.yml', '.yaml'].includes(ext)) {
      return 'configuration';
    } else if (['.md'].includes(ext)) {
      return 'documentation';
    } else {
      return 'general';
    }
  }

  async runValidation(filePath, validationType) {
    const relativePath = path.relative(this.projectRoot, filePath);
    
    try {
      switch (validationType) {
        case 'frontend':
          return await this.validateFrontendFile(filePath);
        case 'backend':
          return await this.validateBackendFile(filePath);
        case 'configuration':
          return await this.validateConfigurationFile(filePath);
        case 'documentation':
          return await this.validateDocumentationFile(filePath);
        default:
          return await this.validateGeneralFile(filePath);
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: [],
        suggestions: []
      };
    }
  }

  async validateFrontendFile(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Security validation
    if (content.includes('process.env.API_KEY') || content.includes('sk-')) {
      results.errors.push('🚨 SECURITY: Potential hardcoded API key detected');
      results.valid = false;
    }

    // Code quality validation
    if (content.includes('TODO') || content.includes('FIXME')) {
      results.warnings.push('⚠️  Code contains TODO/FIXME items');
    }

    if (content.includes('console.log(') && !content.includes('// DEBUG')) {
      results.warnings.push('⚠️  Console.log statements should be removed in production');
    }

    // Architecture validation
    if (content.includes('document.getElementById') && !content.includes('useEffect')) {
      results.suggestions.push('💡 Consider using React hooks instead of direct DOM manipulation');
    }

    // Testing validation
    if (content.includes('export') && !content.includes('test') && !content.includes('spec')) {
      results.suggestions.push('💡 Consider adding tests for exported functions');
    }

    return results;
  }

  async validateBackendFile(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Security validation
    if (content.includes('password = "') || content.includes('token = "') || content.includes('secret = "')) {
      results.errors.push('🚨 SECURITY: Hardcoded credentials detected');
      results.valid = false;
    }

    // Architecture validation
    if (content.includes('@Controller') && content.includes('@Repository')) {
      results.errors.push('🚨 ARCHITECTURE: Controller should not directly use Repository');
      results.valid = false;
    }

    if (content.includes('@Service') && !content.includes('@Autowired')) {
      results.warnings.push('⚠️  Service should use dependency injection');
    }

    // Validation annotations
    if (content.includes('@RequestBody') && !content.includes('@Valid')) {
      results.warnings.push('⚠️  Request body should include @Valid annotation');
    }

    // Testing validation
    if (content.includes('@Test') && !content.includes('@DataJpaTest')) {
      results.suggestions.push('💡 Consider using @DataJpaTest for repository tests');
    }

    return results;
  }

  async validateConfigurationFile(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Security validation
    if (content.includes('password:') || content.includes('secret:') || content.includes('key:')) {
      results.warnings.push('⚠️  Configuration contains sensitive fields - ensure they use environment variables');
    }

    // YAML validation
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
      try {
        const yaml = require('js-yaml');
        yaml.load(content);
      } catch (error) {
        results.errors.push('🚨 YAML syntax error: ' + error.message);
        results.valid = false;
      }
    }

    return results;
  }

  async validateDocumentationFile(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Documentation quality
    if (content.length < 100) {
      results.warnings.push('⚠️  Documentation file is very short - consider adding more details');
    }

    if (content.includes('TODO') || content.includes('FIXME')) {
      results.warnings.push('⚠️  Documentation contains incomplete sections');
    }

    return results;
  }

  async validateGeneralFile(filePath) {
    const relativePath = path.relative(this.projectRoot, filePath);
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // General file size validation
    const stats = fs.statSync(filePath);
    if (stats.size > 1024 * 1024) { // 1MB
      results.warnings.push('⚠️  File is very large - consider splitting into smaller files');
    }

    return results;
  }

  async processValidationResults(filePath, result, validationType) {
    const relativePath = path.relative(this.projectRoot, filePath);
    
    // Display results
    if (result.errors.length > 0) {
      console.log(`❌ ${relativePath} - ${result.errors.length} errors:`);
      result.errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (result.warnings.length > 0) {
      console.log(`⚠️  ${relativePath} - ${result.warnings.length} warnings:`);
      result.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (result.suggestions.length > 0) {
      console.log(`💡 ${relativePath} - ${result.suggestions.length} suggestions:`);
      result.suggestions.forEach(suggestion => console.log(`   ${suggestion}`));
    }
    
    // Save results for reporting
    await this.saveValidationResults(filePath, result, validationType);
    
    // Trigger compliance check if critical errors found
    if (result.errors.length > 0) {
      await this.triggerComplianceCheck();
    }
  }

  async saveValidationResults(filePath, result, validationType) {
    try {
      const resultsDir = path.join(this.agentOsPath, 'validation-results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }
      
      const resultFile = path.join(resultsDir, `${path.basename(filePath)}.validation.json`);
      const resultData = {
        filePath,
        validationType,
        timestamp: new Date().toISOString(),
        ...result
      };
      
      fs.writeFileSync(resultFile, JSON.stringify(resultData, null, 2));
      
    } catch (error) {
      console.warn('⚠️  Could not save validation results:', error.message);
    }
  }

  async triggerComplianceCheck() {
    try {
      const compliancePath = path.join(this.agentOsPath, 'tools', 'compliance-checker.js');
      
      if (fs.existsSync(compliancePath)) {
        console.log('🔍 Triggering compliance check...');
        
        const child = spawn('node', [compliancePath, '--quick'], {
          stdio: 'pipe',
          cwd: this.agentOsPath
        });
        
        child.stdout.on('data', (data) => {
          console.log(`📊 Compliance: ${data.toString().trim()}`);
        });
        
        child.stderr.on('data', (data) => {
          console.error(`❌ Compliance error: ${data.toString().trim()}`);
        });
        
      }
    } catch (error) {
      console.warn('⚠️  Could not trigger compliance check:', error.message);
    }
  }

  async startBackgroundValidation() {
    // Start periodic full project validation
    setInterval(async () => {
      if (this.isActive) {
        await this.runFullProjectValidation();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    console.log('   ✅ Background validation scheduled');
  }

  async runFullProjectValidation() {
    try {
      console.log('🔍 Running full project validation...');
      
      const compliancePath = path.join(this.agentOsPath, 'tools', 'compliance-checker.js');
      if (fs.existsSync(compliancePath)) {
        const child = spawn('node', [compliancePath, '--silent'], {
          stdio: 'pipe',
          cwd: this.agentOsPath
        });
        
        child.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Full project validation completed successfully');
          } else {
            console.log('⚠️  Full project validation found issues');
          }
        });
      }
      
    } catch (error) {
      console.warn('⚠️  Full project validation failed:', error.message);
    }
  }

  async stop() {
    if (!this.isActive) {
      return;
    }

    console.log('🔄 Stopping Real-Time Cursor Enhancement...');
    
    try {
      if (this.watcher) {
        await this.watcher.close();
        this.watcher = null;
      }
      
      this.isActive = false;
      console.log('✅ Real-time enhancement stopped');
      
    } catch (error) {
      console.error('❌ Error stopping real-time enhancement:', error.message);
    }
  }

  getStatus() {
    return {
      active: this.isActive,
      watchedFiles: this.watcher ? this.watcher.getWatched() : {},
      validationQueue: this.validationQueue.length,
      lastValidations: Array.from(this.lastValidation.entries()).map(([file, data]) => ({
        file,
        timestamp: data.timestamp,
        eventType: data.eventType
      }))
    };
  }
}

// CLI interface
async function main() {
  const enhancement = new RealTimeCursorEnhancement();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'start':
      await enhancement.start();
      break;
      
    case 'stop':
      await enhancement.stop();
      break;
      
    case 'status':
      const status = enhancement.getStatus();
      console.log('📊 Real-Time Enhancement Status:', JSON.stringify(status, null, 2));
      break;
      
    case 'help':
      console.log(`
🚀 Real-Time Cursor Enhancement

Usage: node real-time-cursor-enhancement.js [command]

Commands:
  start     Start real-time enhancement (default)
  stop      Stop real-time enhancement
  status    Show enhancement status
  help      Show this help message

Examples:
  node real-time-cursor-enhancement.js start    # Start enhancement
  node real-time-cursor-enhancement.js status   # Check status
  node real-time-cursor-enhancement.js stop     # Stop enhancement
      `);
      break;
      
    default:
      await enhancement.start();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = RealTimeCursorEnhancement;