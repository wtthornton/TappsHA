/**
 * File Processor Module
 * Handles file discovery, processing, and management functionality
 * 
 * @module FileProcessor
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class FileProcessor {
  constructor() {
    this.supportedExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.java', '.py', '.go', '.rs',
      '.md', '.yml', '.yaml', '.json', '.xml', '.html', '.css', '.scss'
    ];
    
    this.excludePatterns = [
      'node_modules/**',
      '.git/**',
      'dist/**',
      'build/**',
      'target/**',
      '*.min.js',
      '*.bundle.js',
      'coverage/**',
      '.nyc_output/**'
    ];
  }

  /**
   * Get all files in a codebase
   * @param {string} codebasePath - Path to the codebase
   * @returns {Array} Array of file paths
   */
  getAllFiles(codebasePath = '.') {
    const files = [];
    
    try {
      // Use glob to find all files
      const patterns = this.supportedExtensions.map(ext => `**/*${ext}`);
      
      patterns.forEach(pattern => {
        const matches = glob.sync(pattern, {
          cwd: codebasePath,
          ignore: this.excludePatterns,
          nodir: true,
          absolute: true
        });
        
        files.push(...matches);
      });
      
      // Remove duplicates
      return [...new Set(files)];
    } catch (error) {
      console.warn('⚠️  Error discovering files:', error.message);
      return [];
    }
  }

  /**
   * Read file content safely
   * @param {string} filePath - Path to the file
   * @returns {string|null} File content or null if error
   */
  readFileContent(filePath) {
    try {
      const stats = fs.statSync(filePath);
      
      // Skip files larger than 1MB to avoid memory issues
      if (stats.size > 1024 * 1024) {
        console.warn(`⚠️  Skipping large file: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        return null;
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      return content;
    } catch (error) {
      console.warn(`⚠️  Could not read file ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Get file information
   * @param {string} filePath - Path to the file
   * @returns {Object} File information object
   */
  getFileInfo(filePath) {
    try {
      const stats = fs.statSync(filePath);
      const extension = path.extname(filePath).toLowerCase();
      const relativePath = path.relative(process.cwd(), filePath);
      
      return {
        path: filePath,
        relativePath: relativePath,
        name: path.basename(filePath),
        extension: extension,
        size: stats.size,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      };
    } catch (error) {
      console.warn(`⚠️  Could not get file info for ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Check if file should be processed
   * @param {string} filePath - Path to the file
   * @returns {boolean} Whether file should be processed
   */
  shouldProcessFile(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    
    // Check if file extension is supported
    if (!this.supportedExtensions.includes(extension)) {
      return false;
    }
    
    // Check if file is excluded by patterns
    const relativePath = path.relative(process.cwd(), filePath);
    for (const pattern of this.excludePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if file path matches a pattern
   * @param {string} filePath - File path to check
   * @param {string} pattern - Pattern to match against
   * @returns {boolean} Whether file matches pattern
   */
  matchesPattern(filePath, pattern) {
    // Simple pattern matching - can be enhanced with proper glob matching
    const normalizedPattern = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*');
    const regex = new RegExp(normalizedPattern);
    return regex.test(filePath);
  }

  /**
   * Process a single file
   * @param {string} filePath - Path to the file
   * @param {Function} processor - Processing function to apply
   * @returns {Object|null} Processing result or null if error
   */
  processFile(filePath, processor) {
    if (!this.shouldProcessFile(filePath)) {
      return null;
    }
    
    const startTime = Date.now();
    
    try {
      const content = this.readFileContent(filePath);
      if (content === null) {
        return null;
      }
      
      const result = processor(filePath, content);
      const processingTime = Date.now() - startTime;
      
      return {
        filePath: filePath,
        content: content,
        result: result,
        processingTime: processingTime,
        success: true
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        filePath: filePath,
        content: null,
        result: null,
        processingTime: processingTime,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process multiple files in parallel
   * @param {Array} filePaths - Array of file paths
   * @param {Function} processor - Processing function to apply
   * @param {number} maxConcurrency - Maximum concurrent operations
   * @returns {Array} Array of processing results
   */
  async processFilesParallel(filePaths, processor, maxConcurrency = 4) {
    const results = [];
    const chunks = this.chunkArray(filePaths, maxConcurrency);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(filePath => 
        new Promise(resolve => {
          const result = this.processFile(filePath, processor);
          resolve(result);
        })
      );
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults.filter(result => result !== null));
    }
    
    return results;
  }

  /**
   * Process multiple files sequentially
   * @param {Array} filePaths - Array of file paths
   * @param {Function} processor - Processing function to apply
   * @returns {Array} Array of processing results
   */
  processFilesSequential(filePaths, processor) {
    const results = [];
    
    for (const filePath of filePaths) {
      const result = this.processFile(filePath, processor);
      if (result !== null) {
        results.push(result);
      }
    }
    
    return results;
  }

  /**
   * Split array into chunks
   * @param {Array} array - Array to split
   * @param {number} chunkSize - Size of each chunk
   * @returns {Array} Array of chunks
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get file statistics
   * @param {Array} filePaths - Array of file paths
   * @returns {Object} File statistics
   */
  getFileStatistics(filePaths) {
    const stats = {
      totalFiles: filePaths.length,
      byExtension: {},
      bySize: {
        small: 0,    // < 1KB
        medium: 0,   // 1KB - 10KB
        large: 0     // > 10KB
      },
      totalSize: 0
    };
    
    filePaths.forEach(filePath => {
      const fileInfo = this.getFileInfo(filePath);
      if (fileInfo) {
        // Count by extension
        const extension = fileInfo.extension;
        stats.byExtension[extension] = (stats.byExtension[extension] || 0) + 1;
        
        // Count by size
        const sizeKB = fileInfo.size / 1024;
        if (sizeKB < 1) {
          stats.bySize.small++;
        } else if (sizeKB < 10) {
          stats.bySize.medium++;
        } else {
          stats.bySize.large++;
        }
        
        stats.totalSize += fileInfo.size;
      }
    });
    
    return stats;
  }

  /**
   * Filter files by criteria
   * @param {Array} filePaths - Array of file paths
   * @param {Object} criteria - Filter criteria
   * @returns {Array} Filtered file paths
   */
  filterFiles(filePaths, criteria = {}) {
    let filtered = filePaths;
    
    // Filter by extension
    if (criteria.extensions) {
      filtered = filtered.filter(filePath => {
        const extension = path.extname(filePath).toLowerCase();
        return criteria.extensions.includes(extension);
      });
    }
    
    // Filter by size
    if (criteria.maxSize) {
      filtered = filtered.filter(filePath => {
        const fileInfo = this.getFileInfo(filePath);
        return fileInfo && fileInfo.size <= criteria.maxSize;
      });
    }
    
    // Filter by path pattern
    if (criteria.pathPattern) {
      const regex = new RegExp(criteria.pathPattern);
      filtered = filtered.filter(filePath => regex.test(filePath));
    }
    
    return filtered;
  }

  /**
   * Set supported file extensions
   * @param {Array} extensions - Array of file extensions
   */
  setSupportedExtensions(extensions) {
    this.supportedExtensions = extensions.map(ext => 
      ext.startsWith('.') ? ext : `.${ext}`
    );
  }

  /**
   * Add exclude pattern
   * @param {string} pattern - Pattern to exclude
   */
  addExcludePattern(pattern) {
    this.excludePatterns.push(pattern);
  }

  /**
   * Remove exclude pattern
   * @param {string} pattern - Pattern to remove
   */
  removeExcludePattern(pattern) {
    const index = this.excludePatterns.indexOf(pattern);
    if (index > -1) {
      this.excludePatterns.splice(index, 1);
    }
  }

  /**
   * Get processing statistics
   * @param {Array} results - Processing results
   * @returns {Object} Processing statistics
   */
  getProcessingStatistics(results) {
    const stats = {
      totalFiles: results.length,
      successfulFiles: results.filter(r => r.success).length,
      failedFiles: results.filter(r => !r.success).length,
      totalProcessingTime: results.reduce((sum, r) => sum + r.processingTime, 0),
      averageProcessingTime: 0,
      byExtension: {},
      errors: []
    };
    
    if (stats.totalFiles > 0) {
      stats.averageProcessingTime = stats.totalProcessingTime / stats.totalFiles;
    }
    
    // Group by extension
    results.forEach(result => {
      const extension = path.extname(result.filePath).toLowerCase();
      if (!stats.byExtension[extension]) {
        stats.byExtension[extension] = {
          count: 0,
          successCount: 0,
          totalTime: 0
        };
      }
      
      stats.byExtension[extension].count++;
      stats.byExtension[extension].totalTime += result.processingTime;
      
      if (result.success) {
        stats.byExtension[extension].successCount++;
      }
    });
    
    // Collect errors
    results.forEach(result => {
      if (!result.success && result.error) {
        stats.errors.push({
          file: result.filePath,
          error: result.error
        });
      }
    });
    
    return stats;
  }
}

module.exports = FileProcessor; 