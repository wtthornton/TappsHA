/**
 * File Processor Module
 * Handles file discovery, processing, and management functionality
 * 
 * @module FileProcessor
 */

import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import { FileInfo, ProcessingStats, ValidationResult } from '../types';
import { 
  errorHandler, 
  FileProcessingError, 
  ERROR_CODES, 
  ERROR_SEVERITY 
} from './ErrorHandler';

class FileProcessor {
  private supportedExtensions: string[] = [
    '.js', '.ts', '.jsx', '.tsx', '.java', '.py', '.go', '.rs',
    '.md', '.yml', '.yaml', '.json', '.xml', '.html', '.css', '.scss'
  ];
  
  private excludePatterns: string[] = [
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

  /**
   * Get all files in a codebase
   * @param codebasePath - Path to the codebase
   * @returns Array of file paths
   */
  getAllFiles(codebasePath: string = '.'): string[] {
    const files: string[] = [];
    
    try {
      // Use glob to find all files
      const patterns = this.supportedExtensions.map(ext => `**/*${ext}`);
      
      patterns.forEach(pattern => {
        try {
          const matches = glob.sync(pattern, {
            cwd: codebasePath,
            ignore: this.excludePatterns,
            nodir: true,
            absolute: true
          });
          
          files.push(...matches);
        } catch (error) {
          errorHandler.handleError(
            error as Error,
            'FILE_DISCOVERY',
            ERROR_SEVERITY.MEDIUM
          );
        }
      });
      
      // Remove duplicates
      return [...new Set(files)];
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'FILE_DISCOVERY',
        ERROR_SEVERITY.HIGH
      );
      return [];
    }
  }

  /**
   * Read file content safely
   * @param filePath - Path to the file
   * @returns File content or null if error
   */
  readFileContent(filePath: string): string | null {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw errorHandler.createError(
          FileProcessingError,
          `File not found: ${filePath}`,
          ERROR_CODES.FILE_NOT_FOUND,
          { file: filePath, category: 'FILE_PROCESSING' }
        );
      }

      const stats = fs.statSync(filePath);
      
      // Check file permissions
      try {
        fs.accessSync(filePath, fs.constants.R_OK);
      } catch (error) {
        throw errorHandler.createError(
          FileProcessingError,
          `Permission denied: ${filePath}`,
          ERROR_CODES.PERMISSION_DENIED,
          { file: filePath, category: 'FILE_PROCESSING' }
        );
      }
      
      // Skip files larger than 10MB to avoid memory issues
      if (stats.size > 10 * 1024 * 1024) {
        throw errorHandler.createError(
          FileProcessingError,
          `File too large: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`,
          ERROR_CODES.FILE_TOO_LARGE,
          { file: filePath, category: 'FILE_PROCESSING' }
        );
      }
      
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Validate content is not empty
      if (content.trim().length === 0) {
        console.warn(`⚠️  Empty file: ${filePath}`);
      }
      
      return content;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'FILE_READ',
        ERROR_SEVERITY.MEDIUM
      );
      return null;
    }
  }

  /**
   * Get file information
   * @param filePath - Path to the file
   * @returns File information object
   */
  getFileInfo(filePath: string): FileInfo | null {
    try {
      if (!fs.existsSync(filePath)) {
        throw errorHandler.createError(
          FileProcessingError,
          `File not found: ${filePath}`,
          ERROR_CODES.FILE_NOT_FOUND,
          { file: filePath, category: 'FILE_PROCESSING' }
        );
      }

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
      errorHandler.handleError(
        error as Error,
        'FILE_INFO',
        ERROR_SEVERITY.MEDIUM
      );
      return null;
    }
  }

  /**
   * Check if file should be processed
   * @param filePath - Path to the file
   * @returns True if file should be processed
   */
  shouldProcessFile(filePath: string): boolean {
    try {
      const extension = path.extname(filePath).toLowerCase();
      
      // Check if extension is supported
      if (!this.supportedExtensions.includes(extension)) {
        return false;
      }
      
      // Check if file matches any exclude patterns
      for (const pattern of this.excludePatterns) {
        if (this.matchesPattern(filePath, pattern)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'FILE_FILTER',
        ERROR_SEVERITY.LOW
      );
      return false;
    }
  }

  /**
   * Check if file matches pattern
   * @param filePath - Path to the file
   * @param pattern - Pattern to match against
   * @returns True if file matches pattern
   */
  matchesPattern(filePath: string, pattern: string): boolean {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      return glob.hasMagic(pattern) ? 
        glob.sync(pattern, { cwd: process.cwd() }).includes(relativePath) :
        relativePath.includes(pattern.replace('**', ''));
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'PATTERN_MATCH',
        ERROR_SEVERITY.LOW
      );
      return false;
    }
  }

  /**
   * Process a single file
   * @param filePath - Path to the file
   * @param processor - Processing function to apply
   * @returns Processing result or null if error
   */
  processFile(filePath: string, processor: (filePath: string, content: string) => any): ValidationResult | null {
    if (!this.shouldProcessFile(filePath)) {
      return null;
    }
    
    const startTime = Date.now();
    
    try {
      const content = this.readFileContent(filePath);
      if (content === null) {
        return {
          filePath,
          content: null,
          result: null,
          processingTime: Date.now() - startTime,
          success: false,
          error: 'Failed to read file content'
        };
      }
      
      const result = processor(filePath, content);
      const processingTime = Date.now() - startTime;
      
      return {
        filePath,
        content,
        result,
        processingTime,
        success: true
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      errorHandler.handleError(
        error as Error,
        'FILE_PROCESSING',
        ERROR_SEVERITY.MEDIUM
      );
      
      return {
        filePath,
        content: null,
        result: null,
        processingTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Process multiple files in parallel
   * @param filePaths - Array of file paths
   * @param processor - Processing function to apply
   * @param maxConcurrency - Maximum concurrent operations
   * @returns Array of processing results
   */
  async processFilesParallel(
    filePaths: string[], 
    processor: (filePath: string, content: string) => any, 
    maxConcurrency: number = 4
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    const chunks = this.chunkArray(filePaths, maxConcurrency);
    
    try {
      for (const chunk of chunks) {
        const chunkPromises = chunk.map(filePath => 
          new Promise<ValidationResult | null>((resolve) => {
            try {
              const result = this.processFile(filePath, processor);
              resolve(result);
            } catch (error) {
              errorHandler.handleError(
                error as Error,
                'PARALLEL_PROCESSING',
                ERROR_SEVERITY.MEDIUM
              );
              resolve(null);
            }
          })
        );
        
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults.filter(result => result !== null) as ValidationResult[]);
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'PARALLEL_PROCESSING',
        ERROR_SEVERITY.HIGH
      );
    }
    
    return results;
  }

  /**
   * Process multiple files sequentially
   * @param filePaths - Array of file paths
   * @param processor - Processing function to apply
   * @returns Array of processing results
   */
  processFilesSequential(filePaths: string[], processor: (filePath: string, content: string) => any): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    try {
      for (const filePath of filePaths) {
        try {
          const result = this.processFile(filePath, processor);
          if (result) {
            results.push(result);
          }
        } catch (error) {
          errorHandler.handleError(
            error as Error,
            'SEQUENTIAL_PROCESSING',
            ERROR_SEVERITY.MEDIUM
          );
        }
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'SEQUENTIAL_PROCESSING',
        ERROR_SEVERITY.HIGH
      );
    }
    
    return results;
  }

  /**
   * Split array into chunks
   * @param array - Array to split
   * @param chunkSize - Size of each chunk
   * @returns Array of chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get file statistics
   * @param filePaths - Array of file paths
   * @returns File statistics
   */
  getFileStatistics(filePaths: string[]): ProcessingStats {
    const stats: ProcessingStats = {
      totalFiles: filePaths.length,
      successfulFiles: 0,
      failedFiles: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      byExtension: {},
      errors: []
    };
    
    try {
      filePaths.forEach(filePath => {
        try {
          const fileInfo = this.getFileInfo(filePath);
          if (fileInfo) {
            stats.successfulFiles++;
            stats.totalProcessingTime += 0; // Will be updated during processing
            
            // Track by extension
            const ext = fileInfo.extension;
            if (!stats.byExtension[ext]) {
              stats.byExtension[ext] = {
                count: 0,
                successCount: 0,
                totalTime: 0
              };
            }
            stats.byExtension[ext].count++;
          } else {
            stats.failedFiles++;
            stats.errors.push({
              file: filePath,
              error: 'Failed to get file info'
            });
          }
        } catch (error) {
          stats.failedFiles++;
          stats.errors.push({
            file: filePath,
            error: error instanceof Error ? error.message : String(error)
          });
          
          errorHandler.handleError(
            error as Error,
            'FILE_STATISTICS',
            ERROR_SEVERITY.LOW
          );
        }
      });
      
      stats.averageProcessingTime = stats.totalFiles > 0 ? 
        stats.totalProcessingTime / stats.totalFiles : 0;
        
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'FILE_STATISTICS',
        ERROR_SEVERITY.MEDIUM
      );
    }
    
    return stats;
  }

  /**
   * Filter files based on criteria
   * @param filePaths - Array of file paths
   * @param criteria - Filter criteria
   * @returns Filtered file paths
   */
  filterFiles(filePaths: string[], criteria: {
    extensions?: string[];
    minSize?: number;
    maxSize?: number;
    excludePatterns?: string[];
  } = {}): string[] {
    try {
      return filePaths.filter(filePath => {
        try {
          const fileInfo = this.getFileInfo(filePath);
          if (!fileInfo) return false;
          
          // Filter by extension
          if (criteria.extensions && !criteria.extensions.includes(fileInfo.extension)) {
            return false;
          }
          
          // Filter by size
          if (criteria.minSize && fileInfo.size < criteria.minSize) {
            return false;
          }
          
          if (criteria.maxSize && fileInfo.size > criteria.maxSize) {
            return false;
          }
          
          // Filter by exclude patterns
          if (criteria.excludePatterns) {
            for (const pattern of criteria.excludePatterns) {
              if (this.matchesPattern(filePath, pattern)) {
                return false;
              }
            }
          }
          
          return true;
        } catch (error) {
          errorHandler.handleError(
            error as Error,
            'FILE_FILTER',
            ERROR_SEVERITY.LOW
          );
          return false;
        }
      });
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'FILE_FILTER',
        ERROR_SEVERITY.MEDIUM
      );
      return [];
    }
  }

  /**
   * Set supported file extensions
   * @param extensions - Array of file extensions
   */
  setSupportedExtensions(extensions: string[]): void {
    try {
      this.supportedExtensions = extensions.map(ext => 
        ext.startsWith('.') ? ext : `.${ext}`
      );
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'CONFIGURATION',
        ERROR_SEVERITY.MEDIUM
      );
    }
  }

  /**
   * Add exclude pattern
   * @param pattern - Pattern to exclude
   */
  addExcludePattern(pattern: string): void {
    try {
      if (!this.excludePatterns.includes(pattern)) {
        this.excludePatterns.push(pattern);
      }
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'CONFIGURATION',
        ERROR_SEVERITY.LOW
      );
    }
  }

  /**
   * Remove exclude pattern
   * @param pattern - Pattern to remove
   */
  removeExcludePattern(pattern: string): void {
    try {
      this.excludePatterns = this.excludePatterns.filter(p => p !== pattern);
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'CONFIGURATION',
        ERROR_SEVERITY.LOW
      );
    }
  }

  /**
   * Get processing statistics from results
   * @param results - Processing results
   * @returns Processing statistics
   */
  getProcessingStatistics(results: ValidationResult[]): ProcessingStats {
    const stats: ProcessingStats = {
      totalFiles: results.length,
      successfulFiles: 0,
      failedFiles: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0,
      byExtension: {},
      errors: []
    };
    
    try {
      results.forEach(result => {
        if (result.success) {
          stats.successfulFiles++;
          stats.totalProcessingTime += result.processingTime;
          
          const ext = path.extname(result.filePath).toLowerCase();
          if (!stats.byExtension[ext]) {
            stats.byExtension[ext] = {
              count: 0,
              successCount: 0,
              totalTime: 0
            };
          }
          stats.byExtension[ext].count++;
          stats.byExtension[ext].successCount++;
          stats.byExtension[ext].totalTime += result.processingTime;
        } else {
          stats.failedFiles++;
          if (result.error) {
            stats.errors.push({
              file: result.filePath,
              error: result.error
            });
          }
        }
      });
      
      stats.averageProcessingTime = stats.totalFiles > 0 ? 
        stats.totalProcessingTime / stats.totalFiles : 0;
        
    } catch (error) {
      errorHandler.handleError(
        error as Error,
        'PROCESSING_STATISTICS',
        ERROR_SEVERITY.MEDIUM
      );
    }
    
    return stats;
  }
}

export default FileProcessor; 