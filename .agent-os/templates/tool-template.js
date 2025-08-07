#!/usr/bin/env node

/**
 * Agent OS Tool Template
 * Self-contained tool following Agent OS standards
 * 
 * Usage: node tool-name.js [options]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ToolName {
  constructor() {
    this.config = this.loadConfig();
    this.metrics = {
      startTime: Date.now(),
      executionTime: 0,
      filesProcessed: 0,
      errors: 0,
      warnings: 0
    };
  }

  /**
   * Load configuration from file system
   */
  loadConfig() {
    const configPath = path.join(__dirname, '../config/tool-config.json');
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('⚠️  Could not load config:', error.message);
    }
    return this.getDefaultConfig();
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      // Add your default configuration here
      enabled: true,
      verbose: false,
      outputPath: '../reports/',
      maxFiles: 1000
    };
  }

  /**
   * Self-contained file discovery using built-in Node.js APIs
   */
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

  /**
   * Built-in pattern matching without external libraries
   */
  matchesPattern(filePath, pattern) {
    if (pattern.includes('**')) {
      // Handle glob patterns like '**/*.md'
      const regexPattern = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
        .replace(/\./g, '\\.');
      return new RegExp(regexPattern).test(filePath);
    } else if (pattern.includes('*')) {
      // Handle simple wildcard patterns
      const regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
      return new RegExp(regexPattern).test(filePath);
    } else {
      // Exact match
      return filePath === pattern;
    }
  }

  /**
   * Main processing method
   */
  async processFiles(targetPath = '.') {
    console.log('🔍 Starting tool processing...');
    
    try {
      // Find files to process
      const patterns = [
        '**/*.js',
        '**/*.ts',
        '**/*.md'
        // Add your file patterns here
      ];

      const ignorePatterns = [
        'node_modules/**',
        'target/**',
        'dist/**',
        '.git/**'
      ];

      let totalFiles = 0;
      let processedFiles = 0;

      for (const pattern of patterns) {
        const files = this.findFiles(pattern, { 
          cwd: targetPath, 
          ignore: ignorePatterns 
        });
        
        for (const file of files) {
          try {
            const fullPath = path.join(targetPath, file);
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Process the file content here
            const result = this.processFile(file, content);
            
            if (result.success) {
              processedFiles++;
            } else {
              this.metrics.errors++;
            }
            
            totalFiles++;
          } catch (error) {
            console.warn(`⚠️  Could not process file: ${file}`, error.message);
            this.metrics.errors++;
          }
        }
      }

      // Update metrics
      this.metrics.executionTime = Date.now() - this.metrics.startTime;
      this.metrics.filesProcessed = processedFiles;

      // Generate report
      this.generateReport();

      return {
        totalFiles,
        processedFiles,
        errors: this.metrics.errors,
        warnings: this.metrics.warnings,
        executionTime: this.metrics.executionTime
      };

    } catch (error) {
      console.error('❌ Tool processing failed:', error.message);
      throw error;
    }
  }

  /**
   * Process individual file
   */
  processFile(filePath, content) {
    try {
      // Add your file processing logic here
      const result = {
        file: filePath,
        success: true,
        issues: [],
        suggestions: []
      };

      // Example processing logic:
      // - Validate content
      // - Check for issues
      // - Generate suggestions
      
      return result;
    } catch (error) {
      return {
        file: filePath,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      tool: 'ToolName',
      metrics: this.metrics,
      config: this.config
    };

    // Save report to file
    const reportPath = path.join(__dirname, this.config.outputPath, 'tool-report.json');
    try {
      // Ensure directory exists
      const reportDir = path.dirname(reportPath);
      if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
      }
      
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log('📊 Report saved to:', reportPath);
    } catch (error) {
      console.warn('⚠️  Could not save report:', error.message);
    }

    return report;
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
🚀 Tool Name - Self-contained Agent OS Tool
==========================================

Usage: node tool-name.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose output
  --path <path>  Specify target path (default: current directory)

Examples:
  node tool-name.js
  node tool-name.js --verbose
  node tool-name.js --path /path/to/files

Features:
  - Self-contained operation (no external dependencies)
  - Cross-platform compatibility
  - Real-time processing
  - Comprehensive reporting
  - Agent OS standards compliance
    `);
  }
}

// CLI execution
const tool = new ToolName();
const args = process.argv.slice(2);

// Parse command line arguments
const options = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  help: args.includes('--help') || args.includes('-h'),
  path: args.find(arg => arg.startsWith('--path='))?.split('=')[1] || '.'
};

if (options.help) {
  tool.showHelp();
  process.exit(0);
}

// Run the tool
if (import.meta.url === `file://${process.argv[1]}`) {
  tool.processFiles(options.path)
    .then(result => {
      console.log('✅ Tool completed successfully');
      console.log(`📊 Processed ${result.processedFiles}/${result.totalFiles} files`);
      console.log(`⏱️  Execution time: ${result.executionTime}ms`);
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('❌ Tool failed:', error.message);
      process.exit(1);
    });
}

export default ToolName; 