package com.tappha.homeassistant.exception;

/**
 * Exception thrown when OpenAI API encounters an error
 * 
 * Reference: https://platform.openai.com/docs/guides/error-codes
 */
public class OpenAIException extends RuntimeException {
    
    private final String errorCode;
    private final int statusCode;
    
    public OpenAIException(String message) {
        super(message);
        this.errorCode = "unknown";
        this.statusCode = 500;
    }
    
    public OpenAIException(String message, String errorCode, int statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
    
    public OpenAIException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "unknown";
        this.statusCode = 500;
    }
    
    public OpenAIException(String message, String errorCode, int statusCode, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public int getStatusCode() {
        return statusCode;
    }
} 