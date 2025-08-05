package com.tappha.homeassistant.exception;

/**
 * Custom exception for rate limiting violations
 * 
 * Used when users exceed rate limits for authentication attempts
 * and other API operations with OWASP Top-10 compliance.
 */
public class RateLimitException extends RuntimeException {

    public RateLimitException(String message) {
        super(message);
    }

    public RateLimitException(String message, Throwable cause) {
        super(message, cause);
    }
} 