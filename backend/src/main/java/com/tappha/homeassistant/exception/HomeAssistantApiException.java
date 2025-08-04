package com.tappha.homeassistant.exception;

/**
 * Exception thrown when Home Assistant API operations fail
 */
public class HomeAssistantApiException extends RuntimeException {
    
    private final int statusCode;
    
    public HomeAssistantApiException(String message) {
        super(message);
        this.statusCode = 0;
    }
    
    public HomeAssistantApiException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
    
    public HomeAssistantApiException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }
    
    public HomeAssistantApiException(String message, Throwable cause) {
        super(message, cause);
        this.statusCode = 0;
    }
    
    /**
     * Get the HTTP status code associated with this exception
     * @return HTTP status code, or 0 if not available
     */
    public int getStatusCode() {
        return statusCode;
    }
    
    /**
     * Check if this exception represents an authentication error
     * @return true if status code is 401 or 403
     */
    public boolean isAuthenticationError() {
        return statusCode == 401 || statusCode == 403;
    }
    
    /**
     * Check if this exception represents a not found error
     * @return true if status code is 404
     */
    public boolean isNotFoundError() {
        return statusCode == 404;
    }
    
    /**
     * Check if this exception represents a server error
     * @return true if status code is 5xx
     */
    public boolean isServerError() {
        return statusCode >= 500 && statusCode < 600;
    }
    
    /**
     * Check if this exception represents a client error
     * @return true if status code is 4xx
     */
    public boolean isClientError() {
        return statusCode >= 400 && statusCode < 500;
    }
} 