package com.tappha.automation.exception;

/**
 * Exception for when automation is not found
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
public class AutomationNotFoundException extends RuntimeException {

    public AutomationNotFoundException(String message) {
        super(message);
    }

    public AutomationNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
} 