/**
 * Error Handler Module
 * Provides comprehensive error handling, logging, and recovery mechanisms
 * 
 * @module ErrorHandler
 */

import * as fs from 'fs';
import * as path from 'path';
import { ComplianceError } from '../types';

// Custom error types
export class ValidationError extends Error implements ComplianceError {
  code: string;
  file?: string;
  line?: number;
  category?: string;

  constructor(message: string, code: string, file?: string, line?: number, category?: string) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.file = file;
    this.line = line;
    this.category = category;
  }
}

export class FileProcessingError extends Error implements ComplianceError {
  code: string;
  file?: string;
  line?: number;
  category?: string;

  constructor(message: string, code: string, file?: string, line?: number, category?: string) {
    super(message);
    this.name = 'FileProcessingError';
    this.code = code;
    this.file = file;
    this.line = line;
    this.category = category;
  }
}

export class AnalyticsError extends Error implements ComplianceError {
  code: string;
  file?: string;
  line?: number;
  category?: string;

  constructor(message: string, code: string, file?: string, line?: number, category?: string) {
    super(message);
    this.name = 'AnalyticsError';
    this.code = code;
    this.file = file;
    this.line = line;
    this.category = category;
  }
}

export class ConfigurationError extends Error implements ComplianceError {
  code: string;
  file?: string;
  line?: number;
  category?: string;

  constructor(message: string, code: string, file?: string, line?: number, category?: string) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = code;
    this.file = file;
    this.line = line;
    this.category = category;
  }
}

export class StandardsError extends Error implements ComplianceError {
  code: string;
  file?: string;
  line?: number;
  category?: string;

  constructor(message: string, code: string, file?: string, line?: number, category?: string) {
    super(message);
    this.name = 'StandardsError';
    this.code = code;
    this.file = file;
    this.line = line;
    this.category = category;
  }
}

// Error codes
export const ERROR_CODES = {
  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  MALFORMED_CONTENT: 'MALFORMED_CONTENT',
  
  // File processing errors
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  FILE_READ_ERROR: 'FILE_READ_ERROR',
  FILE_WRITE_ERROR: 'FILE_WRITE_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DISK_SPACE_ERROR: 'DISK_SPACE_ERROR',
  
  // Analytics errors
  DATA_CORRUPTION: 'DATA_CORRUPTION',
  INVALID_METRICS: 'INVALID_METRICS',
  BASELINE_ERROR: 'BASELINE_ERROR',
  TREND_ANALYSIS_ERROR: 'TREND_ANALYSIS_ERROR',
  
  // Configuration errors
  MISSING_CONFIG: 'MISSING_CONFIG',
  INVALID_CONFIG: 'INVALID_CONFIG',
  UNSUPPORTED_OPTION: 'UNSUPPORTED_OPTION',
  
  // Standards errors
  STANDARDS_NOT_FOUND: 'STANDARDS_NOT_FOUND',
  INVALID_STANDARD: 'INVALID_STANDARD',
  STANDARD_PARSE_ERROR: 'STANDARD_PARSE_ERROR',
  
  // System errors
  MEMORY_ERROR: 'MEMORY_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

// Error severity levels
export const ERROR_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
} as const;

// Error context interface
export interface ErrorContext {
  timestamp: string;
  module: string;
  function: string;
  file?: string;
  line?: number;
  userAgent?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  stack?: string;
}

// Error log entry interface
export interface ErrorLogEntry {
  id: string;
  timestamp: string;
  error: ComplianceError;
  context: ErrorContext;
  severity: keyof typeof ERROR_SEVERITY;
  resolved: boolean;
  resolution?: string;
}

class ErrorHandler {
  private errorLog: ErrorLogEntry[] = [];
  private maxLogSize: number = 1000;
  private logFile?: string;
  private isInitialized: boolean = false;

  /**
   * Initialize error handler
   * @param logFile - Optional log file path
   */
  initialize(logFile?: string): void {
    this.logFile = logFile;
    this.isInitialized = true;
    
    // Set up global error handlers
    this.setupGlobalHandlers();
    
    console.log('✅ Error handler initialized');
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      this.handleError(error, 'UNCAUGHT_EXCEPTION');
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.handleError(reason, 'UNHANDLED_REJECTION');
    });

    // Handle process warnings
    process.on('warning', (warning: Error) => {
      this.handleWarning(warning);
    });
  }

  /**
   * Create a new error with proper context
   * @param errorClass - Error class to instantiate
   * @param message - Error message
   * @param code - Error code
   * @param context - Additional context
   * @returns New error instance
   */
  createError<T extends ComplianceError>(
    errorClass: new (message: string, code: string, file?: string, line?: number, category?: string) => T,
    message: string,
    code: string,
    context?: {
      file?: string;
      line?: number;
      category?: string;
    }
  ): T {
    return new errorClass(
      message,
      code,
      context?.file,
      context?.line,
      context?.category
    );
  }

  /**
   * Handle and log an error
   * @param error - Error to handle
   * @param context - Additional context
   * @param severity - Error severity
   */
  handleError(error: Error | ComplianceError, context?: string, severity: keyof typeof ERROR_SEVERITY = 'MEDIUM'): void {
    if (!this.isInitialized) {
      console.error('❌ Error handler not initialized');
      return;
    }

    const complianceError = this.ensureComplianceError(error);
    const errorContext = this.createErrorContext(context);
    const logEntry = this.createLogEntry(complianceError, errorContext, severity);

    // Add to log
    this.errorLog.push(logEntry);
    this.trimLog();

    // Log to console
    this.logToConsole(logEntry);

    // Write to file if configured
    if (this.logFile) {
      this.writeToLogFile(logEntry);
    }

    // Handle critical errors
    if (severity === 'CRITICAL') {
      this.handleCriticalError(logEntry);
    }
  }

  /**
   * Handle warnings
   * @param warning - Warning to handle
   */
  handleWarning(warning: Error): void {
    console.warn(`⚠️  Warning: ${warning.message}`);
    
    if (warning.stack) {
      console.warn(`Stack: ${warning.stack}`);
    }
  }

  /**
   * Ensure error is a ComplianceError
   * @param error - Error to convert
   * @returns ComplianceError instance
   */
  private ensureComplianceError(error: Error | ComplianceError): ComplianceError {
    if ('code' in error) {
      return error as ComplianceError;
    }

    // Convert regular Error to ComplianceError
    const complianceError = new Error(error.message) as ComplianceError;
    complianceError.code = ERROR_CODES.UNKNOWN_ERROR;
    complianceError.name = error.name;
    complianceError.stack = error.stack;
    
    return complianceError;
  }

  /**
   * Create error context
   * @param context - Additional context
   * @returns Error context object
   */
  private createErrorContext(context?: string): ErrorContext {
    return {
      timestamp: new Date().toISOString(),
      module: this.getCallingModule(),
      function: this.getCallingFunction(),
      memoryUsage: process.memoryUsage(),
      stack: new Error().stack
    };
  }

  /**
   * Get calling module name
   * @returns Module name
   */
  private getCallingModule(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    const lines = stack.split('\n');
    const callerLine = lines[3]; // Skip Error constructor, this function, and handleError
    
    if (callerLine) {
      const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        const modulePath = match[2];
        return path.basename(modulePath, path.extname(modulePath));
      }
    }
    
    return 'unknown';
  }

  /**
   * Get calling function name
   * @returns Function name
   */
  private getCallingFunction(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';

    const lines = stack.split('\n');
    const callerLine = lines[3]; // Skip Error constructor, this function, and handleError
    
    if (callerLine) {
      const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        return match[1];
      }
    }
    
    return 'unknown';
  }

  /**
   * Create log entry
   * @param error - Error object
   * @param context - Error context
   * @param severity - Error severity
   * @returns Log entry
   */
  private createLogEntry(error: ComplianceError, context: ErrorContext, severity: keyof typeof ERROR_SEVERITY): ErrorLogEntry {
    return {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      error,
      context,
      severity,
      resolved: false
    };
  }

  /**
   * Generate unique error ID
   * @returns Error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log error to console
   * @param logEntry - Log entry to display
   */
  private logToConsole(logEntry: ErrorLogEntry): void {
    const { error, context, severity } = logEntry;
    const severityIcon = this.getSeverityIcon(severity);
    
    console.error(`${severityIcon} [${severity}] ${error.name}: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    console.error(`   Module: ${context.module}`);
    console.error(`   Function: ${context.function}`);
    
    if (error.file) {
      console.error(`   File: ${error.file}`);
    }
    
    if (error.line) {
      console.error(`   Line: ${error.line}`);
    }
    
    if (error.stack) {
      console.error(`   Stack: ${error.stack}`);
    }
  }

  /**
   * Get severity icon
   * @param severity - Error severity
   * @returns Icon string
   */
  private getSeverityIcon(severity: keyof typeof ERROR_SEVERITY): string {
    switch (severity) {
      case 'CRITICAL': return '💥';
      case 'HIGH': return '🚨';
      case 'MEDIUM': return '⚠️';
      case 'LOW': return 'ℹ️';
      default: return '❓';
    }
  }

  /**
   * Write error to log file
   * @param logEntry - Log entry to write
   */
  private writeToLogFile(logEntry: ErrorLogEntry): void {
    if (!this.logFile) return;

    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('❌ Failed to write to error log file:', error);
    }
  }

  /**
   * Handle critical errors
   * @param logEntry - Critical error log entry
   */
  private handleCriticalError(logEntry: ErrorLogEntry): void {
    console.error('💥 Critical error detected!');
    console.error('   This may indicate a serious system issue.');
    console.error('   Consider restarting the application.');
    
    // Could implement additional critical error handling here
    // such as sending alerts, creating crash dumps, etc.
  }

  /**
   * Trim error log to prevent memory issues
   */
  private trimLog(): void {
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize / 2);
    }
  }

  /**
   * Get error statistics
   * @returns Error statistics
   */
  getErrorStatistics(): {
    total: number;
    bySeverity: Record<string, number>;
    byCode: Record<string, number>;
    byModule: Record<string, number>;
    unresolved: number;
  } {
    const stats = {
      total: this.errorLog.length,
      bySeverity: {} as Record<string, number>,
      byCode: {} as Record<string, number>,
      byModule: {} as Record<string, number>,
      unresolved: 0
    };

    this.errorLog.forEach(entry => {
      // Count by severity
      stats.bySeverity[entry.severity] = (stats.bySeverity[entry.severity] || 0) + 1;
      
      // Count by error code
      stats.byCode[entry.error.code] = (stats.byCode[entry.error.code] || 0) + 1;
      
      // Count by module
      stats.byModule[entry.context.module] = (stats.byModule[entry.context.module] || 0) + 1;
      
      // Count unresolved
      if (!entry.resolved) {
        stats.unresolved++;
      }
    });

    return stats;
  }

  /**
   * Mark error as resolved
   * @param errorId - Error ID to resolve
   * @param resolution - Resolution description
   */
  resolveError(errorId: string, resolution?: string): boolean {
    const entry = this.errorLog.find(e => e.id === errorId);
    if (entry) {
      entry.resolved = true;
      entry.resolution = resolution;
      return true;
    }
    return false;
  }

  /**
   * Get recent errors
   * @param count - Number of recent errors to return
   * @returns Recent error log entries
   */
  getRecentErrors(count: number = 10): ErrorLogEntry[] {
    return this.errorLog.slice(-count);
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
  }

  /**
   * Export error log
   * @returns Error log as JSON
   */
  exportLog(): string {
    return JSON.stringify(this.errorLog, null, 2);
  }

  /**
   * Import error log
   * @param logData - Error log data
   */
  importLog(logData: string): void {
    try {
      const importedLog = JSON.parse(logData) as ErrorLogEntry[];
      this.errorLog = [...this.errorLog, ...importedLog];
      this.trimLog();
    } catch (error) {
      throw this.createError(
        ConfigurationError,
        'Failed to import error log: Invalid JSON format',
        ERROR_CODES.INVALID_CONFIG
      );
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export error classes and constants
export {
  ValidationError,
  FileProcessingError,
  AnalyticsError,
  ConfigurationError,
  StandardsError,
  ERROR_CODES,
  ERROR_SEVERITY
};

export type { ErrorContext, ErrorLogEntry }; 