package com.tappha.homeassistant.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;

/**
 * WebSocket Error Handler
 * 
 * Handles WebSocket errors and provides standardized error responses.
 */
@Component
public class WebSocketErrorHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketErrorHandler.class);

    private final ObjectMapper objectMapper;

    public WebSocketErrorHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Send error message to WebSocket session
     */
    public void sendError(WebSocketSession session, String errorCode, String message) {
        try {
            var errorResponse = objectMapper.createObjectNode();
            errorResponse.put("type", "error");
            errorResponse.put("code", errorCode);
            errorResponse.put("message", message);
            errorResponse.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(errorResponse.toString()));
            logger.warn("Sent error to session {}: {} - {}", session.getId(), errorCode, message);
            
        } catch (IOException e) {
            logger.error("Failed to send error message to session {}: {}", session.getId(), e.getMessage());
        }
    }

    /**
     * Send authentication error
     */
    public void sendAuthError(WebSocketSession session, String reason) {
        sendError(session, "AUTH_ERROR", "Authentication failed: " + reason);
    }

    /**
     * Send rate limit error
     */
    public void sendRateLimitError(WebSocketSession session) {
        sendError(session, "RATE_LIMIT_ERROR", "Rate limit exceeded. Please try again later.");
    }

    /**
     * Send invalid message error
     */
    public void sendInvalidMessageError(WebSocketSession session, String details) {
        sendError(session, "INVALID_MESSAGE", "Invalid message format: " + details);
    }

    /**
     * Send server error
     */
    public void sendServerError(WebSocketSession session, String details) {
        sendError(session, "SERVER_ERROR", "Internal server error: " + details);
    }

    /**
     * Send connection error
     */
    public void sendConnectionError(WebSocketSession session, String details) {
        sendError(session, "CONNECTION_ERROR", "Connection error: " + details);
    }

    /**
     * Log error with context
     */
    public void logError(String sessionId, String errorCode, String message, Throwable exception) {
        logger.error("WebSocket error for session {}: {} - {} - {}", 
                   sessionId, errorCode, message, exception.getMessage(), exception);
    }

    /**
     * Get error statistics
     */
    public Map<String, Object> getErrorStats() {
        Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("errorHandler", "WebSocketErrorHandler");
        stats.put("version", "1.0");
        return stats;
    }
} 