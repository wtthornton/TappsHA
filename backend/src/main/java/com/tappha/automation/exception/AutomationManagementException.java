package com.tappha.automation.exception;

/**
 * Exception for automation management operations
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
public class AutomationManagementException extends RuntimeException {

    public AutomationManagementException(String message) {
        super(message);
    }

    public AutomationManagementException(String message, Throwable cause) {
        super(message, cause);
    }
} 