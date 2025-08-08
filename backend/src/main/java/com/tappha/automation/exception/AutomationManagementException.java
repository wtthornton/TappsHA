package com.tappha.automation.exception;

/**
 * Exception thrown when there are issues with automation management operations
 */
public class AutomationManagementException extends RuntimeException {
    
    public AutomationManagementException(String message) {
        super(message);
    }
    
    public AutomationManagementException(String message, Throwable cause) {
        super(message, cause);
    }
} 