package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.security.JwtTokenProvider;
import com.tappha.homeassistant.websocket.WebSocketSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * WebSocket Security Service
 * 
 * Provides comprehensive authentication, session management, and security
 * features for WebSocket connections in the AI Suggestion Engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
public class WebSocketSecurityService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketSecurityService.class);

    private final JwtTokenProvider jwtTokenProvider;
    private final WebSocketSessionManager sessionManager;
    private final ObjectMapper objectMapper;

    // Session authentication status
    private final Map<String, Boolean> authenticatedSessions = new ConcurrentHashMap<>();
    
    // User session mapping
    private final Map<String, String> userSessionMapping = new ConcurrentHashMap<>();
    
    // Session creation timestamps
    private final Map<String, Instant> sessionCreationTimes = new ConcurrentHashMap<>();
    
    // Session last activity timestamps
    private final Map<String, Instant> sessionLastActivity = new ConcurrentHashMap<>();
    
    // Rate limiting counters
    private final Map<String, Integer> messageCounters = new ConcurrentHashMap<>();
    private final Map<String, Instant> rateLimitResetTimes = new ConcurrentHashMap<>();
    
    // Configuration
    private static final int MAX_MESSAGES_PER_MINUTE = 100;
    private static final int SESSION_TIMEOUT_MINUTES = 30;
    private static final int RATE_LIMIT_WINDOW_MINUTES = 1;
    
    // Scheduled executor for cleanup tasks
    private final ScheduledExecutorService cleanupExecutor = Executors.newScheduledThreadPool(1);

    @Autowired
    public WebSocketSecurityService(JwtTokenProvider jwtTokenProvider,
                                  WebSocketSessionManager sessionManager,
                                  ObjectMapper objectMapper) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.sessionManager = sessionManager;
        this.objectMapper = objectMapper;
        
        // Start cleanup scheduler
        startCleanupScheduler();
    }

    /**
     * Authenticate WebSocket session
     * 
     * @param session The WebSocket session
     * @param authMessage The authentication message
     * @return Authentication result
     */
    public AuthenticationResult authenticateSession(WebSocketSession session, JsonNode authMessage) {
        String sessionId = session.getId();
        
        try {
            String token = authMessage.get("token").asText();
            String userId = authMessage.get("userId").asText();
            
            logger.debug("Authenticating session {} for user {}", sessionId, userId);
            
            // Validate JWT token
            if (!jwtTokenProvider.validateToken(token)) {
                logger.warn("Invalid JWT token for session {}: {}", sessionId, userId);
                return new AuthenticationResult(false, "Invalid token", null);
            }
            
            // Verify user ID matches token
            String tokenUserId = jwtTokenProvider.getUserIdFromToken(token);
            if (!userId.equals(tokenUserId)) {
                logger.warn("User ID mismatch for session {}: expected {}, got {}", sessionId, tokenUserId, userId);
                return new AuthenticationResult(false, "User ID mismatch", null);
            }
            
            // Mark session as authenticated
            authenticatedSessions.put(sessionId, true);
            userSessionMapping.put(userId, sessionId);
            sessionCreationTimes.put(sessionId, Instant.now());
            sessionLastActivity.put(sessionId, Instant.now());
            
            logger.info("Session {} authenticated successfully for user {}", sessionId, userId);
            return new AuthenticationResult(true, "Authentication successful", userId);
            
        } catch (Exception e) {
            logger.error("Authentication failed for session {}: {}", sessionId, e.getMessage());
            return new AuthenticationResult(false, "Authentication failed: " + e.getMessage(), null);
        }
    }

    /**
     * Validate session authentication
     * 
     * @param sessionId The session ID
     * @return true if session is authenticated
     */
    public boolean isSessionAuthenticated(String sessionId) {
        return authenticatedSessions.getOrDefault(sessionId, false);
    }

    /**
     * Get user ID for session
     * 
     * @param sessionId The session ID
     * @return User ID or null if not found
     */
    public String getUserIdForSession(String sessionId) {
        for (Map.Entry<String, String> entry : userSessionMapping.entrySet()) {
            if (entry.getValue().equals(sessionId)) {
                return entry.getKey();
            }
        }
        return null;
    }

    /**
     * Update session activity
     * 
     * @param sessionId The session ID
     */
    public void updateSessionActivity(String sessionId) {
        sessionLastActivity.put(sessionId, Instant.now());
    }

    /**
     * Check rate limiting for session
     * 
     * @param sessionId The session ID
     * @return true if rate limit exceeded
     */
    public boolean isRateLimitExceeded(String sessionId) {
        Instant now = Instant.now();
        Instant resetTime = rateLimitResetTimes.get(sessionId);
        
        // Reset counter if window has passed
        if (resetTime == null || now.isAfter(resetTime)) {
            messageCounters.put(sessionId, 0);
            rateLimitResetTimes.put(sessionId, now.plusSeconds(RATE_LIMIT_WINDOW_MINUTES * 60));
        }
        
        // Check current count
        int currentCount = messageCounters.getOrDefault(sessionId, 0);
        if (currentCount >= MAX_MESSAGES_PER_MINUTE) {
            logger.warn("Rate limit exceeded for session: {}", sessionId);
            return true;
        }
        
        // Increment counter
        messageCounters.put(sessionId, currentCount + 1);
        return false;
    }

    /**
     * Clean up expired sessions
     */
    public void cleanupExpiredSessions() {
        Instant cutoff = Instant.now().minusSeconds(SESSION_TIMEOUT_MINUTES * 60);
        
        // Clean up sessions that haven't had activity
        sessionLastActivity.entrySet().removeIf(entry -> {
            String sessionId = entry.getKey();
            Instant lastActivity = entry.getValue();
            
            if (lastActivity.isBefore(cutoff)) {
                logger.info("Cleaning up expired session: {}", sessionId);
                cleanupSession(sessionId);
                return true;
            }
            return false;
        });
        
        // Clean up rate limiting data for inactive sessions
        messageCounters.entrySet().removeIf(entry -> {
            String sessionId = entry.getKey();
            return !sessionLastActivity.containsKey(sessionId);
        });
        
        rateLimitResetTimes.entrySet().removeIf(entry -> {
            String sessionId = entry.getKey();
            return !sessionLastActivity.containsKey(sessionId);
        });
    }

    /**
     * Clean up a specific session
     * 
     * @param sessionId The session ID to clean up
     */
    public void cleanupSession(String sessionId) {
        // Remove from authenticated sessions
        authenticatedSessions.remove(sessionId);
        
        // Remove from user session mapping
        userSessionMapping.entrySet().removeIf(entry -> entry.getValue().equals(sessionId));
        
        // Remove from timestamps
        sessionCreationTimes.remove(sessionId);
        sessionLastActivity.remove(sessionId);
        
        // Remove from rate limiting
        messageCounters.remove(sessionId);
        rateLimitResetTimes.remove(sessionId);
        
        // Unregister from session manager
        sessionManager.unregisterSession(sessionId);
        
        logger.debug("Cleaned up session: {}", sessionId);
    }

    /**
     * Get session statistics
     * 
     * @return ObjectNode containing session statistics
     */
    public ObjectNode getSessionStatistics() {
        ObjectNode stats = objectMapper.createObjectNode();
        stats.put("totalSessions", authenticatedSessions.size());
        stats.put("activeSessions", sessionManager.getActiveSessionCount());
        stats.put("uniqueUsers", userSessionMapping.size());
        stats.put("timestamp", System.currentTimeMillis());
        
        return stats;
    }

    /**
     * Send authentication error message
     * 
     * @param session The WebSocket session
     * @param error The error message
     * @param details Additional error details
     */
    public void sendAuthenticationError(WebSocketSession session, String error, String details) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "AUTHENTICATION_ERROR");
            errorMessage.put("error", error);
            errorMessage.put("details", details);
            errorMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new org.springframework.web.socket.TextMessage(errorMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Failed to send authentication error to session {}: {}", session.getId(), e.getMessage());
        }
    }

    /**
     * Send rate limit error message
     * 
     * @param session The WebSocket session
     * @param retryAfterSeconds Seconds to wait before retrying
     */
    public void sendRateLimitError(WebSocketSession session, int retryAfterSeconds) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "RATE_LIMIT_ERROR");
            errorMessage.put("message", "Rate limit exceeded");
            errorMessage.put("retryAfter", retryAfterSeconds);
            errorMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new org.springframework.web.socket.TextMessage(errorMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Failed to send rate limit error to session {}: {}", session.getId(), e.getMessage());
        }
    }

    /**
     * Validate message format and content
     * 
     * @param message The message to validate
     * @return Validation result
     */
    public ValidationResult validateMessage(JsonNode message) {
        try {
            // Check for required fields
            if (!message.has("type")) {
                return new ValidationResult(false, "Missing required field: type");
            }
            
            String messageType = message.get("type").asText();
            if (messageType == null || messageType.trim().isEmpty()) {
                return new ValidationResult(false, "Message type cannot be empty");
            }
            
            // Validate message size
            String messageString = message.toString();
            if (messageString.length() > 8192) { // 8KB limit
                return new ValidationResult(false, "Message too large (max 8KB)");
            }
            
            // Validate specific message types
            switch (messageType) {
                case "auth":
                    if (!message.has("token") || !message.has("userId")) {
                        return new ValidationResult(false, "Auth message missing required fields: token, userId");
                    }
                    break;
                case "subscribe":
                    if (!message.has("eventType")) {
                        return new ValidationResult(false, "Subscribe message missing required field: eventType");
                    }
                    break;
                case "approve_suggestion":
                case "reject_suggestion":
                    if (!message.has("suggestionId") || !message.has("userId")) {
                        return new ValidationResult(false, "Suggestion action missing required fields: suggestionId, userId");
                    }
                    break;
                case "ping":
                    // Ping messages are always valid
                    break;
                default:
                    // Unknown message types are allowed but logged
                    logger.debug("Unknown message type received: {}", messageType);
            }
            
            return new ValidationResult(true, "Message validation successful");
            
        } catch (Exception e) {
            logger.error("Message validation failed: {}", e.getMessage());
            return new ValidationResult(false, "Message validation failed: " + e.getMessage());
        }
    }

    /**
     * Start the cleanup scheduler
     */
    private void startCleanupScheduler() {
        cleanupExecutor.scheduleAtFixedRate(
            this::cleanupExpiredSessions,
            1, // Initial delay
            5, // Period
            TimeUnit.MINUTES
        );
        
        logger.info("WebSocket security cleanup scheduler started");
    }

    /**
     * Shutdown the service
     */
    public void shutdown() {
        cleanupExecutor.shutdown();
        try {
            if (!cleanupExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
                cleanupExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            cleanupExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        logger.info("WebSocket security service shutdown complete");
    }

    /**
     * Authentication result class
     */
    public static class AuthenticationResult {
        private final boolean success;
        private final String message;
        private final String userId;

        public AuthenticationResult(boolean success, String message, String userId) {
            this.success = success;
            this.message = message;
            this.userId = userId;
        }

        public boolean isSuccess() { return success; }
        public String getMessage() { return message; }
        public String getUserId() { return userId; }
    }

    /**
     * Validation result class
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String message;

        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() { return valid; }
        public String getMessage() { return message; }
    }
} 