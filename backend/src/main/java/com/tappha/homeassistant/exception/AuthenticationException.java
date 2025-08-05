package com.tappha.homeassistant.exception;

/**
 * Custom exception for authentication failures
 * 
 * Used for invalid credentials, expired tokens, and other
 * authentication-related errors with OWASP Top-10 compliance.
 */
public class AuthenticationException extends RuntimeException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
} 