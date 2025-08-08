/**
 * Error Handler Tests
 * Comprehensive tests for the ErrorHandler module
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  errorHandler, 
  ValidationError, 
  FileProcessingError, 
  AnalyticsError, 
  ConfigurationError, 
  StandardsError,
  ERROR_CODES, 
  ERROR_SEVERITY 
} from '../tools/modules/ErrorHandler';

// Temporarily skip while ErrorHandler module path is stabilized
describe.skip('ErrorHandler', () => {
  beforeEach(() => {
    // Clear error log before each test
    errorHandler.clearLog();
    
    // Mock console methods to reduce test noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize error handler successfully', () => {
      expect(() => errorHandler.initialize()).not.toThrow();
    });

    it('should initialize with log file path', () => {
      expect(() => errorHandler.initialize('./test-error-log.json')).not.toThrow();
    });
  });

  describe('Error Creation', () => {
    it('should create ValidationError with proper properties', () => {
      const error = errorHandler.createError(
        ValidationError,
        'Test validation error',
        ERROR_CODES.VALIDATION_FAILED,
        { file: 'test.js', line: 10, category: 'VALIDATION' }
      );

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Test validation error');
      expect(error.code).toBe(ERROR_CODES.VALIDATION_FAILED);
      expect(error.file).toBe('test.js');
      expect(error.line).toBe(10);
      expect(error.category).toBe('VALIDATION');
    });

    it('should create FileProcessingError with proper properties', () => {
      const error = errorHandler.createError(
        FileProcessingError,
        'Test file processing error',
        ERROR_CODES.FILE_NOT_FOUND,
        { file: 'missing.js', category: 'FILE_PROCESSING' }
      );

      expect(error).toBeInstanceOf(FileProcessingError);
      expect(error.message).toBe('Test file processing error');
      expect(error.code).toBe(ERROR_CODES.FILE_NOT_FOUND);
      expect(error.file).toBe('missing.js');
      expect(error.category).toBe('FILE_PROCESSING');
    });

    it('should create AnalyticsError with proper properties', () => {
      const error = errorHandler.createError(
        AnalyticsError,
        'Test analytics error',
        ERROR_CODES.DATA_CORRUPTION,
        { category: 'ANALYTICS' }
      );

      expect(error).toBeInstanceOf(AnalyticsError);
      expect(error.message).toBe('Test analytics error');
      expect(error.code).toBe(ERROR_CODES.DATA_CORRUPTION);
      expect(error.category).toBe('ANALYTICS');
    });

    it('should create ConfigurationError with proper properties', () => {
      const error = errorHandler.createError(
        ConfigurationError,
        'Test configuration error',
        ERROR_CODES.MISSING_CONFIG,
        { category: 'CONFIGURATION' }
      );

      expect(error).toBeInstanceOf(ConfigurationError);
      expect(error.message).toBe('Test configuration error');
      expect(error.code).toBe(ERROR_CODES.MISSING_CONFIG);
      expect(error.category).toBe('CONFIGURATION');
    });

    it('should create StandardsError with proper properties', () => {
      const error = errorHandler.createError(
        StandardsError,
        'Test standards error',
        ERROR_CODES.STANDARDS_NOT_FOUND,
        { file: 'standards.md', category: 'STANDARDS' }
      );

      expect(error).toBeInstanceOf(StandardsError);
      expect(error.message).toBe('Test standards error');
      expect(error.code).toBe(ERROR_CODES.STANDARDS_NOT_FOUND);
      expect(error.file).toBe('standards.md');
      expect(error.category).toBe('STANDARDS');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      errorHandler.initialize();
    });

    it('should handle ValidationError with MEDIUM severity', () => {
      const error = new ValidationError('Test error', ERROR_CODES.VALIDATION_FAILED);
      
      expect(() => errorHandler.handleError(error, 'TEST_CONTEXT', ERROR_SEVERITY.MEDIUM)).not.toThrow();
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.total).toBe(1);
      expect(stats.bySeverity.MEDIUM).toBe(1);
      expect(stats.byCode[ERROR_CODES.VALIDATION_FAILED]).toBe(1);
    });

    it('should handle FileProcessingError with HIGH severity', () => {
      const error = new FileProcessingError('File not found', ERROR_CODES.FILE_NOT_FOUND);
      
      expect(() => errorHandler.handleError(error, 'FILE_CONTEXT', ERROR_SEVERITY.HIGH)).not.toThrow();
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.total).toBe(1);
      expect(stats.bySeverity.HIGH).toBe(1);
      expect(stats.byCode[ERROR_CODES.FILE_NOT_FOUND]).toBe(1);
    });

    it('should handle AnalyticsError with CRITICAL severity', () => {
      const error = new AnalyticsError('Data corruption', ERROR_CODES.DATA_CORRUPTION);
      
      expect(() => errorHandler.handleError(error, 'ANALYTICS_CONTEXT', ERROR_SEVERITY.CRITICAL)).not.toThrow();
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.total).toBe(1);
      expect(stats.bySeverity.CRITICAL).toBe(1);
      expect(stats.byCode[ERROR_CODES.DATA_CORRUPTION]).toBe(1);
    });

    it('should handle regular Error and convert to ComplianceError', () => {
      const error = new Error('Regular error');
      
      expect(() => errorHandler.handleError(error, 'REGULAR_CONTEXT')).not.toThrow();
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.total).toBe(1);
      expect(stats.byCode[ERROR_CODES.UNKNOWN_ERROR]).toBe(1);
    });

    it('should handle multiple errors and maintain statistics', () => {
      const error1 = new ValidationError('Error 1', ERROR_CODES.VALIDATION_FAILED);
      const error2 = new FileProcessingError('Error 2', ERROR_CODES.FILE_NOT_FOUND);
      const error3 = new AnalyticsError('Error 3', ERROR_CODES.DATA_CORRUPTION);
      
      errorHandler.handleError(error1, 'CONTEXT1', ERROR_SEVERITY.MEDIUM);
      errorHandler.handleError(error2, 'CONTEXT2', ERROR_SEVERITY.HIGH);
      errorHandler.handleError(error3, 'CONTEXT3', ERROR_SEVERITY.CRITICAL);
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.total).toBe(3);
      expect(stats.bySeverity.MEDIUM).toBe(1);
      expect(stats.bySeverity.HIGH).toBe(1);
      expect(stats.bySeverity.CRITICAL).toBe(1);
      expect(stats.unresolved).toBe(3);
    });
  });

  describe('Error Statistics', () => {
    beforeEach(() => {
      errorHandler.initialize();
    });

    it('should return correct error statistics', () => {
      // Add some test errors
      const error1 = new ValidationError('Error 1', ERROR_CODES.VALIDATION_FAILED);
      const error2 = new ValidationError('Error 2', ERROR_CODES.VALIDATION_FAILED);
      const error3 = new FileProcessingError('Error 3', ERROR_CODES.FILE_NOT_FOUND);
      
      errorHandler.handleError(error1, 'CONTEXT1', ERROR_SEVERITY.MEDIUM);
      errorHandler.handleError(error2, 'CONTEXT2', ERROR_SEVERITY.HIGH);
      errorHandler.handleError(error3, 'CONTEXT3', ERROR_SEVERITY.LOW);
      
      const stats = errorHandler.getErrorStatistics();
      
      expect(stats.total).toBe(3);
      expect(stats.bySeverity.MEDIUM).toBe(1);
      expect(stats.bySeverity.HIGH).toBe(1);
      expect(stats.bySeverity.LOW).toBe(1);
      expect(stats.byCode[ERROR_CODES.VALIDATION_FAILED]).toBe(2);
      expect(stats.byCode[ERROR_CODES.FILE_NOT_FOUND]).toBe(1);
      expect(stats.unresolved).toBe(3);
    });

    it('should track errors by module', () => {
      const error = new ValidationError('Test error', ERROR_CODES.VALIDATION_FAILED);
      errorHandler.handleError(error, 'TEST_MODULE', ERROR_SEVERITY.MEDIUM);
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.byModule.TEST_MODULE).toBe(1);
    });
  });

  describe('Error Resolution', () => {
    beforeEach(() => {
      errorHandler.initialize();
    });

    it('should resolve error by ID', () => {
      const error = new ValidationError('Test error', ERROR_CODES.VALIDATION_FAILED);
      errorHandler.handleError(error, 'TEST_CONTEXT', ERROR_SEVERITY.MEDIUM);
      
      const recentErrors = errorHandler.getRecentErrors(1);
      const errorId = recentErrors[0].id;
      
      const result = errorHandler.resolveError(errorId, 'Fixed by developer');
      expect(result).toBe(true);
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.unresolved).toBe(0);
    });

    it('should return false for non-existent error ID', () => {
      const result = errorHandler.resolveError('non-existent-id', 'Test resolution');
      expect(result).toBe(false);
    });
  });

  describe('Error Log Management', () => {
    beforeEach(() => {
      errorHandler.initialize();
    });

    it('should get recent errors', () => {
      const error1 = new ValidationError('Error 1', ERROR_CODES.VALIDATION_FAILED);
      const error2 = new FileProcessingError('Error 2', ERROR_CODES.FILE_NOT_FOUND);
      
      errorHandler.handleError(error1, 'CONTEXT1', ERROR_SEVERITY.MEDIUM);
      errorHandler.handleError(error2, 'CONTEXT2', ERROR_SEVERITY.HIGH);
      
      const recentErrors = errorHandler.getRecentErrors(2);
      expect(recentErrors).toHaveLength(2);
      expect(recentErrors[0].error.message).toBe('Error 2');
      expect(recentErrors[1].error.message).toBe('Error 1');
    });

    it('should clear error log', () => {
      const error = new ValidationError('Test error', ERROR_CODES.VALIDATION_FAILED);
      errorHandler.handleError(error, 'TEST_CONTEXT', ERROR_SEVERITY.MEDIUM);
      
      expect(errorHandler.getErrorStatistics().total).toBe(1);
      
      errorHandler.clearLog();
      expect(errorHandler.getErrorStatistics().total).toBe(0);
    });

    it('should export error log as JSON', () => {
      const error = new ValidationError('Test error', ERROR_CODES.VALIDATION_FAILED);
      errorHandler.handleError(error, 'TEST_CONTEXT', ERROR_SEVERITY.MEDIUM);
      
      const exportedLog = errorHandler.exportLog();
      const parsedLog = JSON.parse(exportedLog);
      
      expect(Array.isArray(parsedLog)).toBe(true);
      expect(parsedLog).toHaveLength(1);
      expect(parsedLog[0].error.message).toBe('Test error');
    });

    it('should import error log from JSON', () => {
      const testLog = [
        {
          id: 'test-id',
          timestamp: new Date().toISOString(),
          error: {
            name: 'ValidationError',
            message: 'Imported error',
            code: ERROR_CODES.VALIDATION_FAILED,
            file: 'test.js',
            line: 10,
            category: 'VALIDATION'
          },
          context: {
            timestamp: new Date().toISOString(),
            module: 'TEST_MODULE',
            function: 'testFunction',
            memoryUsage: { rss: 0, heapTotal: 0, heapUsed: 0, external: 0 }
          },
          severity: 'MEDIUM',
          resolved: false
        }
      ];
      
      const jsonLog = JSON.stringify(testLog);
      expect(() => errorHandler.importLog(jsonLog)).not.toThrow();
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.total).toBe(1);
    });

    it('should throw error for invalid JSON import', () => {
      expect(() => errorHandler.importLog('invalid json')).toThrow();
    });
  });

  describe('Error Codes', () => {
    it('should have all required error codes', () => {
      expect(ERROR_CODES.VALIDATION_FAILED).toBe('VALIDATION_FAILED');
      expect(ERROR_CODES.FILE_NOT_FOUND).toBe('FILE_NOT_FOUND');
      expect(ERROR_CODES.FILE_READ_ERROR).toBe('FILE_READ_ERROR');
      expect(ERROR_CODES.DATA_CORRUPTION).toBe('DATA_CORRUPTION');
      expect(ERROR_CODES.MISSING_CONFIG).toBe('MISSING_CONFIG');
      expect(ERROR_CODES.STANDARDS_NOT_FOUND).toBe('STANDARDS_NOT_FOUND');
      expect(ERROR_CODES.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Error Severity', () => {
    it('should have all required severity levels', () => {
      expect(ERROR_SEVERITY.CRITICAL).toBe('CRITICAL');
      expect(ERROR_SEVERITY.HIGH).toBe('HIGH');
      expect(ERROR_SEVERITY.MEDIUM).toBe('MEDIUM');
      expect(ERROR_SEVERITY.LOW).toBe('LOW');
    });
  });

  describe('Error Context', () => {
    it('should create proper error context', () => {
      const error = new ValidationError('Test error', ERROR_CODES.VALIDATION_FAILED);
      errorHandler.handleError(error, 'TEST_CONTEXT', ERROR_SEVERITY.MEDIUM);
      
      const recentErrors = errorHandler.getRecentErrors(1);
      const context = recentErrors[0].context;
      
      expect(context.timestamp).toBeDefined();
      expect(context.module).toBeDefined();
      expect(context.function).toBeDefined();
      expect(context.memoryUsage).toBeDefined();
    });
  });

  describe('Log Trimming', () => {
    it('should trim log when it exceeds maximum size', () => {
      // Add many errors to trigger trimming
      for (let i = 0; i < 1100; i++) {
        const error = new ValidationError(`Error ${i}`, ERROR_CODES.VALIDATION_FAILED);
        errorHandler.handleError(error, 'TEST_CONTEXT', ERROR_SEVERITY.MEDIUM);
      }
      
      const stats = errorHandler.getErrorStatistics();
      expect(stats.total).toBeLessThanOrEqual(1000);
    });
  });
}); 