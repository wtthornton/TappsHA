package com.tappha.homeassistant.exception;

/**
 * Exception thrown when Home Assistant WebSocket operations fail
 */
public class HomeAssistantWebSocketException extends RuntimeException {
    
    public HomeAssistantWebSocketException(String message) {
        super(message);
    }
    
    public HomeAssistantWebSocketException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public HomeAssistantWebSocketException(Throwable cause) {
        super(cause);
    }
} 