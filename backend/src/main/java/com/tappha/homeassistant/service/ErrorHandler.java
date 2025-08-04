package com.tappha.homeassistant.service;

/**
 * Error handler interface for managing AI-related errors
 * Provides centralized error handling and logging
 */
public interface ErrorHandler {
    
    /**
     * Handle an error and determine if it should be retried
     * @param error The exception that occurred
     * @return true if the error should be retried, false otherwise
     */
    boolean handleError(Exception error);
    
    /**
     * Log error with context information
     * @param error The exception that occurred
     * @param context Additional context information
     */
    void logError(Exception error, String context);
    
    /**
     * Check if an error is retryable
     * @param error The exception to check
     * @return true if the error is retryable, false otherwise
     */
    boolean isRetryable(Exception error);
    
    /**
     * Get retry delay for a specific error
     * @param error The exception that occurred
     * @return delay in milliseconds before retry
     */
    long getRetryDelay(Exception error);
    
    /**
     * Get maximum retry attempts for a specific error
     * @param error The exception that occurred
     * @return maximum number of retry attempts
     */
    int getMaxRetries(Exception error);
} 