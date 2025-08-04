/**
 * TypeScript interfaces for Agent OS Compliance Checker
 * Defines all data structures and types used throughout the application
 */

// Violation types
export interface Violation {
  file: string;
  line: number;
  type: 'CRITICAL' | 'WARNING' | 'ERROR';
  category: string;
  message: string;
  standard: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

// Validation result types
export interface ValidationResult {
  filePath: string;
  content: string | null;
  result: Violation[] | null;
  processingTime: number;
  success: boolean;
  error?: string;
}

// File information types
export interface FileInfo {
  path: string;
  relativePath: string;
  name: string;
  extension: string;
  size: number;
  modified: Date;
  isDirectory: boolean;
  isFile: boolean;
}

// Processing statistics types
export interface ProcessingStats {
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  totalProcessingTime: number;
  averageProcessingTime: number;
  byExtension: Record<string, ExtensionStats>;
  errors: ProcessingError[];
}

export interface ExtensionStats {
  count: number;
  successCount: number;
  totalTime: number;
}

export interface ProcessingError {
  file: string;
  error: string;
}

// Analytics types
export interface Metrics {
  startTime: number;
  executionTime: number;
  fileProcessingTimes: Record<string, FileProcessingTime>;
  validationExecutionTimes: Record<string, ValidationExecutionTime[]>;
  violationCategories: Record<string, ViolationCategoryCounts>;
  standardsEffectiveness: Record<string, StandardEffectiveness>;
  historicalData: HistoricalEntry[];
  performanceBaselines: PerformanceBaselines;
}

export interface FileProcessingTime {
  time: number;
  size: number;
  timestamp: number;
}

export interface ValidationExecutionTime {
  time: number;
  timestamp: number;
}

export interface ViolationCategoryCounts {
  CRITICAL: number;
  WARNING: number;
  ERROR: number;
}

export interface StandardEffectiveness {
  totalChecks: number;
  violations: number;
  effectiveness: number;
}

export interface HistoricalEntry {
  timestamp: string;
  runId: string;
  complianceScore: number;
  totalChecks: number;
  passedChecks: number;
  violations: number;
  criticalViolations: number;
  warnings: number;
  metrics: HistoricalMetrics;
  dataIntegrity: DataIntegrity;
}

export interface HistoricalMetrics {
  executionTime: number;
  averageFileProcessingTime: number;
  violationCategories: Record<string, ViolationCategoryCounts>;
  standardsEffectiveness: Record<string, StandardEffectiveness>;
  filesProcessed: number;
}

export interface DataIntegrity {
  checksum: string;
  version: string;
  validated: boolean;
}

export interface PerformanceBaselines {
  fileProcessing: FileProcessingBaselines;
  validation: ValidationBaselines;
  overall: OverallBaselines;
}

export interface FileProcessingBaselines {
  small: BaselineMetrics;
  medium: BaselineMetrics;
  large: BaselineMetrics;
}

export interface ValidationBaselines {
  codeStyle: BaselineMetrics;
  security: BaselineMetrics;
  architecture: BaselineMetrics;
  testing: BaselineMetrics;
}

export interface OverallBaselines {
  executionTime: BaselineMetrics;
  memoryUsage: BaselineMetrics;
}

export interface BaselineMetrics {
  avg: number;
  max: number;
  min: number;
}

// Report types
export interface ComplianceReport {
  summary: ReportSummary;
  violations: ViolationReport;
  analytics: AnalyticsReport;
  recommendations: Recommendation[];
}

export interface ReportSummary {
  complianceScore: number;
  totalFiles: number;
  totalViolations: number;
  totalChecks: number;
  passedChecks: number;
  processingTime: number;
}

export interface ViolationReport {
  total: number;
  bySeverity: Record<string, number>;
  byCategory: Record<string, number>;
  byStandard: Record<string, number>;
  list: Violation[];
}

export interface AnalyticsReport {
  summary: AnalyticsSummary;
  violations: ViolationAnalytics;
  performance: PerformanceAnalytics;
  trends: TrendAnalysis;
  recommendations: Recommendation[];
}

export interface AnalyticsSummary {
  complianceScore: number;
  totalFiles: number;
  totalViolations: number;
  executionTime: number;
  averageProcessingTime: number;
}

export interface ViolationAnalytics {
  byCategory: Record<string, ViolationCategoryCounts>;
  bySeverity: Record<string, number>;
  byStandard: Record<string, number>;
}

export interface PerformanceAnalytics {
  fileProcessing: FileProcessingAnalytics;
  validation: ValidationAnalytics;
  baselines: BaselineComparison;
}

export interface FileProcessingAnalytics {
  averageTime: number;
  maxTime: number;
  minTime: number;
  averageSize: number;
  totalFiles: number;
}

export interface ValidationAnalytics {
  [key: string]: ValidationTypeAnalytics;
}

export interface ValidationTypeAnalytics {
  averageTime: number;
  maxTime: number;
  minTime: number;
  totalRuns: number;
}

export interface BaselineComparison {
  fileProcessing?: 'SLOW' | 'FAST' | 'NORMAL';
}

export interface TrendAnalysis {
  complianceScore?: TrendData;
  violations?: TrendData;
  message?: string;
}

export interface TrendData {
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  average: number;
}

export interface Recommendation {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  category: string;
  message: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Validation types
export interface ValidationStatistics {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  successRate: number;
}

// Standards types
export interface Standards {
  [key: string]: string;
}

// Configuration types
export interface ComplianceCheckerConfig {
  supportedExtensions: string[];
  excludePatterns: string[];
  maxConcurrency: number;
  maxFileSize: number;
  strictMode: boolean;
}

// Error types
export interface ComplianceError extends Error {
  code: string;
  file?: string;
  line?: number;
  category?: string;
}

// Module exports
export type {
  Violation,
  ValidationResult,
  FileInfo,
  ProcessingStats,
  ExtensionStats,
  ProcessingError,
  Metrics,
  FileProcessingTime,
  ValidationExecutionTime,
  ViolationCategoryCounts,
  StandardEffectiveness,
  HistoricalEntry,
  HistoricalMetrics,
  DataIntegrity,
  PerformanceBaselines,
  FileProcessingBaselines,
  ValidationBaselines,
  OverallBaselines,
  BaselineMetrics,
  ComplianceReport,
  ReportSummary,
  ViolationReport,
  AnalyticsReport,
  AnalyticsSummary,
  ViolationAnalytics,
  PerformanceAnalytics,
  FileProcessingAnalytics,
  ValidationAnalytics,
  ValidationTypeAnalytics,
  BaselineComparison,
  TrendAnalysis,
  TrendData,
  Recommendation,
  ValidationStatistics,
  Standards,
  ComplianceCheckerConfig,
  ComplianceError
}; 