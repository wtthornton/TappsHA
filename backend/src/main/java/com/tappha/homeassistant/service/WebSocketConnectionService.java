package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.websocket.WebSocketSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * WebSocket Connection Service
 * 
 * Provides comprehensive connection handling, error recovery, and
 * connection health monitoring for WebSocket connections.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
public class WebSocketConnectionService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConnectionService.class);

    private final WebSocketSecurityService securityService;
    private final WebSocketSessionManager sessionManager;
    private final ObjectMapper objectMapper;

    // Connection health tracking
    private final Map<String, ConnectionHealth> connectionHealth = new ConcurrentHashMap<>();
    
    // Reconnection attempts tracking
    private final Map<String, Integer> reconnectionAttempts = new ConcurrentHashMap<>();
    
    // Connection error tracking
    private final Map<String, ConnectionError> connectionErrors = new ConcurrentHashMap<>();
    
    // Heartbeat tracking
    private final Map<String, Instant> lastHeartbeat = new ConcurrentHashMap<>();
    
    // Configuration
    private static final int MAX_RECONNECTION_ATTEMPTS = 5;
    private static final int HEARTBEAT_TIMEOUT_SECONDS = 60;
    private static final int RECONNECTION_DELAY_SECONDS = 5;
    private static final int HEALTH_CHECK_INTERVAL_SECONDS = 30;
    
    // Scheduled executor for health checks
    private final ScheduledExecutorService healthCheckExecutor = Executors.newScheduledThreadPool(1);

    @Autowired
    public WebSocketConnectionService(WebSocketSecurityService securityService,
                                   WebSocketSessionManager sessionManager,
                                   ObjectMapper objectMapper) {
        this.securityService = securityService;
        this.sessionManager = sessionManager;
        this.objectMapper = objectMapper;
        
        // Start health check scheduler
        startHealthCheckScheduler();
    }

    /**
     * Handle new WebSocket connection
     * 
     * @param session The WebSocket session
     */
    public void handleConnectionEstablished(WebSocketSession session) {
        String sessionId = session.getId();
        
        try {
            // Register session
            sessionManager.registerSession(sessionId, session);
            
            // Initialize connection health
            connectionHealth.put(sessionId, new ConnectionHealth(ConnectionStatus.CONNECTING));
            lastHeartbeat.put(sessionId, Instant.now());
            
            // Send welcome message
            sendWelcomeMessage(session);
            
            logger.info("WebSocket connection established: {}", sessionId);
            
        } catch (Exception e) {
            logger.error("Error handling connection establishment for session {}: {}", sessionId, e.getMessage());
            handleConnectionError(session, "Connection establishment failed", e);
        }
    }

    /**
     * Handle WebSocket connection closure
     * 
     * @param session The WebSocket session
     * @param status The close status
     */
    public void handleConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = session.getId();
        
        try {
            // Update connection health
            ConnectionHealth health = connectionHealth.get(sessionId);
            if (health != null) {
                health.setStatus(ConnectionStatus.CLOSED);
                health.setCloseStatus(status);
                health.setClosedAt(Instant.now());
            }
            
            // Clean up session
            securityService.cleanupSession(sessionId);
            connectionHealth.remove(sessionId);
            lastHeartbeat.remove(sessionId);
            reconnectionAttempts.remove(sessionId);
            connectionErrors.remove(sessionId);
            
            logger.info("WebSocket connection closed: {} with status: {}", sessionId, status);
            
        } catch (Exception e) {
            logger.error("Error handling connection closure for session {}: {}", sessionId, e.getMessage());
        }
    }

    /**
     * Handle WebSocket transport error
     * 
     * @param session The WebSocket session
     * @param exception The transport exception
     */
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        String sessionId = session.getId();
        
        try {
            // Record connection error
            ConnectionError error = new ConnectionError(exception.getMessage(), exception.getClass().getSimpleName());
            connectionErrors.put(sessionId, error);
            
            // Update connection health
            ConnectionHealth health = connectionHealth.get(sessionId);
            if (health != null) {
                health.setStatus(ConnectionStatus.ERROR);
                health.setLastError(error);
            }
            
            // Send error message to client
            sendConnectionError(session, "Transport error", exception.getMessage());
            
            logger.error("WebSocket transport error for session {}: {}", sessionId, exception.getMessage());
            
        } catch (Exception e) {
            logger.error("Error handling transport error for session {}: {}", sessionId, e.getMessage());
        }
    }

    /**
     * Handle WebSocket message
     * 
     * @param session The WebSocket session
     * @param message The message content
     */
    public void handleMessage(WebSocketSession session, String message) {
        String sessionId = session.getId();
        
        try {
            // Update session activity
            securityService.updateSessionActivity(sessionId);
            lastHeartbeat.put(sessionId, Instant.now());
            
            // Parse message
            JsonNode jsonMessage = objectMapper.readTree(message);
            
            // Validate message
            WebSocketSecurityService.ValidationResult validation = securityService.validateMessage(jsonMessage);
            if (!validation.isValid()) {
                sendValidationError(session, validation.getMessage());
                return;
            }
            
            // Check rate limiting
            if (securityService.isRateLimitExceeded(sessionId)) {
                securityService.sendRateLimitError(session, 60);
                return;
            }
            
            // Update connection health
            ConnectionHealth health = connectionHealth.get(sessionId);
            if (health != null) {
                health.setStatus(ConnectionStatus.CONNECTED);
                health.setLastActivity(Instant.now());
            }
            
            // Handle message based on type
            String messageType = jsonMessage.get("type").asText();
            handleMessageByType(session, jsonMessage, messageType);
            
        } catch (Exception e) {
            logger.error("Error handling message for session {}: {}", sessionId, e.getMessage());
            handleConnectionError(session, "Message handling failed", e);
        }
    }

    /**
     * Handle message by type
     * 
     * @param session The WebSocket session
     * @param message The parsed message
     * @param messageType The message type
     */
    private void handleMessageByType(WebSocketSession session, JsonNode message, String messageType) {
        String sessionId = session.getId();
        
        switch (messageType) {
            case "auth":
                handleAuthentication(session, message);
                break;
            case "ping":
                handlePing(session);
                break;
            case "heartbeat":
                handleHeartbeat(session);
                break;
            case "subscribe":
                handleSubscription(session, message);
                break;
            case "unsubscribe":
                handleUnsubscription(session, message);
                break;
            default:
                logger.debug("Unknown message type received: {} for session: {}", messageType, sessionId);
                sendUnknownMessageError(session, messageType);
        }
    }

    /**
     * Handle authentication message
     * 
     * @param session The WebSocket session
     * @param message The authentication message
     */
    private void handleAuthentication(WebSocketSession session, JsonNode message) {
        String sessionId = session.getId();
        
        try {
            // Authenticate session
            WebSocketSecurityService.AuthenticationResult result = securityService.authenticateSession(session, message);
            
            if (result.isSuccess()) {
                // Update connection health
                ConnectionHealth health = connectionHealth.get(sessionId);
                if (health != null) {
                    health.setStatus(ConnectionStatus.AUTHENTICATED);
                    health.setUserId(result.getUserId());
                }
                
                // Send authentication success
                sendAuthenticationSuccess(session, result.getUserId());
                
                logger.info("Session {} authenticated successfully for user {}", sessionId, result.getUserId());
                
            } else {
                // Send authentication error
                securityService.sendAuthenticationError(session, "Authentication failed", result.getMessage());
                
                logger.warn("Authentication failed for session {}: {}", sessionId, result.getMessage());
            }
            
        } catch (Exception e) {
            logger.error("Error handling authentication for session {}: {}", sessionId, e.getMessage());
            securityService.sendAuthenticationError(session, "Authentication error", e.getMessage());
        }
    }

    /**
     * Handle ping message
     * 
     * @param session The WebSocket session
     */
    private void handlePing(WebSocketSession session) {
        try {
            ObjectNode pongMessage = objectMapper.createObjectNode();
            pongMessage.put("type", "pong");
            pongMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(pongMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending pong response: {}", e.getMessage());
        }
    }

    /**
     * Handle heartbeat message
     * 
     * @param session The WebSocket session
     */
    private void handleHeartbeat(WebSocketSession session) {
        String sessionId = session.getId();
        lastHeartbeat.put(sessionId, Instant.now());
        
        // Update connection health
        ConnectionHealth health = connectionHealth.get(sessionId);
        if (health != null) {
            health.setLastHeartbeat(Instant.now());
        }
    }

    /**
     * Handle subscription message
     * 
     * @param session The WebSocket session
     * @param message The subscription message
     */
    private void handleSubscription(WebSocketSession session, JsonNode message) {
        String sessionId = session.getId();
        
        // Check authentication
        if (!securityService.isSessionAuthenticated(sessionId)) {
            securityService.sendAuthenticationError(session, "Authentication required", "Please authenticate first");
            return;
        }
        
        try {
            String eventType = message.get("eventType").asText();
            
            // TODO: Implement subscription logic
            // For now, just send success response
            
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "subscription_success");
            response.put("eventType", eventType);
            response.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(response.toString()));
            
            logger.info("Subscription successful for session {}: {}", sessionId, eventType);
            
        } catch (Exception e) {
            logger.error("Error handling subscription for session {}: {}", sessionId, e.getMessage());
            sendSubscriptionError(session, e.getMessage());
        }
    }

    /**
     * Handle unsubscription message
     * 
     * @param session The WebSocket session
     * @param message The unsubscription message
     */
    private void handleUnsubscription(WebSocketSession session, JsonNode message) {
        String sessionId = session.getId();
        
        // Check authentication
        if (!securityService.isSessionAuthenticated(sessionId)) {
            securityService.sendAuthenticationError(session, "Authentication required", "Please authenticate first");
            return;
        }
        
        try {
            String eventType = message.get("eventType").asText();
            
            // TODO: Implement unsubscription logic
            // For now, just send success response
            
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "unsubscription_success");
            response.put("eventType", eventType);
            response.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(response.toString()));
            
            logger.info("Unsubscription successful for session {}: {}", sessionId, eventType);
            
        } catch (Exception e) {
            logger.error("Error handling unsubscription for session {}: {}", sessionId, e.getMessage());
            sendUnsubscriptionError(session, e.getMessage());
        }
    }

    /**
     * Handle connection error
     * 
     * @param session The WebSocket session
     * @param error The error message
     * @param exception The exception
     */
    private void handleConnectionError(WebSocketSession session, String error, Exception exception) {
        String sessionId = session.getId();
        
        try {
            // Record error
            ConnectionError connectionError = new ConnectionError(error, exception.getClass().getSimpleName());
            connectionErrors.put(sessionId, connectionError);
            
            // Update connection health
            ConnectionHealth health = connectionHealth.get(sessionId);
            if (health != null) {
                health.setStatus(ConnectionStatus.ERROR);
                health.setLastError(connectionError);
            }
            
            // Send error message
            sendConnectionError(session, error, exception.getMessage());
            
        } catch (Exception e) {
            logger.error("Error handling connection error for session {}: {}", sessionId, e.getMessage());
        }
    }

    /**
     * Check connection health
     */
    public void checkConnectionHealth() {
        Instant now = Instant.now();
        Instant heartbeatTimeout = now.minusSeconds(HEARTBEAT_TIMEOUT_SECONDS);
        
        connectionHealth.entrySet().removeIf(entry -> {
            String sessionId = entry.getKey();
            ConnectionHealth health = entry.getValue();
            Instant lastHeartbeatTime = lastHeartbeat.get(sessionId);
            
            // Check for heartbeat timeout
            if (lastHeartbeatTime != null && lastHeartbeatTime.isBefore(heartbeatTimeout)) {
                logger.warn("Connection heartbeat timeout for session: {}", sessionId);
                health.setStatus(ConnectionStatus.TIMEOUT);
                
                // Try to close the session
                try {
                    WebSocketSession session = sessionManager.getSession(sessionId);
                    if (session != null && session.isOpen()) {
                        session.close(CloseStatus.GOING_AWAY);
                    }
                } catch (Exception e) {
                    logger.error("Error closing timed out session {}: {}", sessionId, e.getMessage());
                }
                
                return true;
            }
            
            return false;
        });
    }

    /**
     * Send welcome message
     * 
     * @param session The WebSocket session
     */
    private void sendWelcomeMessage(WebSocketSession session) {
        try {
            ObjectNode welcome = objectMapper.createObjectNode();
            welcome.put("type", "welcome");
            welcome.put("message", "WebSocket connection established");
            welcome.put("sessionId", session.getId());
            welcome.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(welcome.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending welcome message: {}", e.getMessage());
        }
    }

    /**
     * Send authentication success message
     * 
     * @param session The WebSocket session
     * @param userId The user ID
     */
    private void sendAuthenticationSuccess(WebSocketSession session, String userId) {
        try {
            ObjectNode success = objectMapper.createObjectNode();
            success.put("type", "auth_success");
            success.put("userId", userId);
            success.put("sessionId", session.getId());
            success.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(success.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending authentication success: {}", e.getMessage());
        }
    }

    /**
     * Send connection error message
     * 
     * @param session The WebSocket session
     * @param error The error message
     * @param details The error details
     */
    private void sendConnectionError(WebSocketSession session, String error, String details) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "connection_error");
            errorMessage.put("error", error);
            errorMessage.put("details", details);
            errorMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(errorMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending connection error: {}", e.getMessage());
        }
    }

    /**
     * Send validation error message
     * 
     * @param session The WebSocket session
     * @param message The validation error message
     */
    private void sendValidationError(WebSocketSession session, String message) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "validation_error");
            errorMessage.put("message", message);
            errorMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(errorMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending validation error: {}", e.getMessage());
        }
    }

    /**
     * Send unknown message error
     * 
     * @param session The WebSocket session
     * @param messageType The unknown message type
     */
    private void sendUnknownMessageError(WebSocketSession session, String messageType) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "unknown_message_error");
            errorMessage.put("message", "Unknown message type: " + messageType);
            errorMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(errorMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending unknown message error: {}", e.getMessage());
        }
    }

    /**
     * Send subscription error
     * 
     * @param session The WebSocket session
     * @param message The error message
     */
    private void sendSubscriptionError(WebSocketSession session, String message) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "subscription_error");
            errorMessage.put("message", message);
            errorMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(errorMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending subscription error: {}", e.getMessage());
        }
    }

    /**
     * Send unsubscription error
     * 
     * @param session The WebSocket session
     * @param message The error message
     */
    private void sendUnsubscriptionError(WebSocketSession session, String message) {
        try {
            ObjectNode errorMessage = objectMapper.createObjectNode();
            errorMessage.put("type", "unsubscription_error");
            errorMessage.put("message", message);
            errorMessage.put("timestamp", System.currentTimeMillis());
            
            session.sendMessage(new TextMessage(errorMessage.toString()));
            
        } catch (IOException e) {
            logger.error("Error sending unsubscription error: {}", e.getMessage());
        }
    }

    /**
     * Start health check scheduler
     */
    private void startHealthCheckScheduler() {
        healthCheckExecutor.scheduleAtFixedRate(
            this::checkConnectionHealth,
            HEALTH_CHECK_INTERVAL_SECONDS,
            HEALTH_CHECK_INTERVAL_SECONDS,
            TimeUnit.SECONDS
        );
        
        logger.info("WebSocket connection health check scheduler started");
    }

    /**
     * Shutdown the service
     */
    public void shutdown() {
        healthCheckExecutor.shutdown();
        try {
            if (!healthCheckExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
                healthCheckExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            healthCheckExecutor.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        logger.info("WebSocket connection service shutdown complete");
    }

    /**
     * Connection status enum
     */
    public enum ConnectionStatus {
        CONNECTING,
        CONNECTED,
        AUTHENTICATED,
        ERROR,
        TIMEOUT,
        CLOSED
    }

    /**
     * Connection health class
     */
    public static class ConnectionHealth {
        private ConnectionStatus status;
        private String userId;
        private Instant lastActivity;
        private Instant lastHeartbeat;
        private ConnectionError lastError;
        private CloseStatus closeStatus;
        private Instant closedAt;

        public ConnectionHealth(ConnectionStatus status) {
            this.status = status;
            this.lastActivity = Instant.now();
        }

        // Getters and setters
        public ConnectionStatus getStatus() { return status; }
        public void setStatus(ConnectionStatus status) { this.status = status; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public Instant getLastActivity() { return lastActivity; }
        public void setLastActivity(Instant lastActivity) { this.lastActivity = lastActivity; }
        public Instant getLastHeartbeat() { return lastHeartbeat; }
        public void setLastHeartbeat(Instant lastHeartbeat) { this.lastHeartbeat = lastHeartbeat; }
        public ConnectionError getLastError() { return lastError; }
        public void setLastError(ConnectionError lastError) { this.lastError = lastError; }
        public CloseStatus getCloseStatus() { return closeStatus; }
        public void setCloseStatus(CloseStatus closeStatus) { this.closeStatus = closeStatus; }
        public Instant getClosedAt() { return closedAt; }
        public void setClosedAt(Instant closedAt) { this.closedAt = closedAt; }
    }

    /**
     * Connection error class
     */
    public static class ConnectionError {
        private final String message;
        private final String type;
        private final Instant timestamp;

        public ConnectionError(String message, String type) {
            this.message = message;
            this.type = type;
            this.timestamp = Instant.now();
        }

        public String getMessage() { return message; }
        public String getType() { return type; }
        public Instant getTimestamp() { return timestamp; }
    }
} 