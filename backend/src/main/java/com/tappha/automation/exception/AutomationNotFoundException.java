package com.tappha.automation.exception;

/**
 * Exception thrown when an automation is not found
 */
public class AutomationNotFoundException extends RuntimeException {
    
    public AutomationNotFoundException(String message) {
        super(message);
    }
    
    public AutomationNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
} 