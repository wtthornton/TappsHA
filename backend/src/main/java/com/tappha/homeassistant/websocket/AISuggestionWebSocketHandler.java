package com.tappha.homeassistant.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.security.JwtTokenProvider;
import com.tappha.homeassistant.service.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket Handler for AI Suggestion Engine
 * 
 * Handles real-time communication for AI suggestions including:
 * - Authentication and session management
 * - Suggestion updates and notifications
 * - Approval and rejection workflows
 * - Real-time status updates
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Component
public class AISuggestionWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(AISuggestionWebSocketHandler.class);

    private final ObjectMapper objectMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AIService aiService;
    private final WebSocketSessionManager sessionManager;
    private final AISuggestionMessageBroker messageBroker;

    // Active sessions mapped by user ID
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    
    // Session authentication status
    private final Map<String, Boolean> authenticatedSessions = new ConcurrentHashMap<>();

    @Autowired
    public AISuggestionWebSocketHandler(ObjectMapper objectMapper, 
                                      JwtTokenProvider jwtTokenProvider,
                                      AIService aiService,
                                      WebSocketSessionManager sessionManager,
                                      AISuggestionMessageBroker messageBroker) {
        this.objectMapper = objectMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.aiService = aiService;
        this.sessionManager = sessionManager;
        this.messageBroker = messageBroker;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        logger.info("AI Suggestion WebSocket connection established: {}", sessionId);
        
        // Register session
        sessionManager.registerSession(sessionId, session);
        
        // Send welcome message
        sendWelcomeMessage(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        String payload = message.getPayload();
        
        logger.debug("Received WebSocket message from session {}: {}", sessionId, payload);
        
        try {
            JsonNode jsonMessage = objectMapper.readTree(payload);
            String messageType = jsonMessage.get("type").asText();
            
            switch (messageType) {
                case "auth":
                    handleAuthentication(session, jsonMessage);
                    break;
                case "subscribe":
                    handleSubscription(session, jsonMessage);
                    break;
                case "approve_suggestion":
                    handleSuggestionApproval(session, jsonMessage);
                    break;
                case "reject_suggestion":
                    handleSuggestionRejection(session, jsonMessage);
                    break;
                case "ping":
                    handlePing(session);
                    break;
                default:
                    handleUnknownMessage(session, messageType);
            }
            
        } catch (Exception e) {
            logger.error("Error handling WebSocket message from session {}: {}", sessionId, e.getMessage());
            sendErrorMessage(session, "Invalid message format", e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        logger.info("AI Suggestion WebSocket connection closed: {} with status: {}", sessionId, status);
        
        // Clean up session
        sessionManager.unregisterSession(sessionId);
        authenticatedSessions.remove(sessionId);
        
        // Remove from user sessions
        userSessions.entrySet().removeIf(entry -> entry.getValue().getId().equals(sessionId));
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String sessionId = session.getId();
        logger.error("WebSocket transport error for session {}: {}", sessionId, exception.getMessage());
        
        sendErrorMessage(session, "Transport error", exception.getMessage());
    }

    /**
     * Handle authentication message
     */
    private void handleAuthentication(WebSocketSession session, JsonNode message) throws IOException {
        String sessionId = session.getId();
        String token = message.get("token").asText();
        String userId = message.get("userId").asText();
        
        logger.debug("Processing authentication for session {} with user {}", sessionId, userId);
        
        if (jwtTokenProvider.validateWebSocketToken(token, userId)) {
            // Authentication successful
            authenticatedSessions.put(sessionId, true);
            userSessions.put(userId, session);
            
            // Send authentication success response
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "auth_ok");
            response.put("userId", userId);
            response.put("sessionId", sessionId);
            
            session.sendMessage(new TextMessage(response.toString()));
            logger.info("Authentication successful for session {} with user {}", sessionId, userId);
            
        } else {
            // Authentication failed
            sendErrorMessage(session, "Authentication failed", "Invalid or expired token");
            logger.warn("Authentication failed for session {} with user {}", sessionId, userId);
        }
    }

    /**
     * Handle subscription message
     */
    private void handleSubscription(WebSocketSession session, JsonNode message) throws IOException {
        String sessionId = session.getId();
        
        if (!isAuthenticated(sessionId)) {
            sendErrorMessage(session, "Authentication required", "Please authenticate first");
            return;
        }
        
        String eventType = message.get("eventType").asText();
        String connectionId = message.get("connectionId").asText();
        
        logger.debug("Processing subscription for session {}: eventType={}, connectionId={}", 
                   sessionId, eventType, connectionId);
        
        // Register subscription
        messageBroker.subscribe(sessionId, eventType, connectionId);
        
        // Send subscription confirmation
        ObjectNode response = objectMapper.createObjectNode();
        response.put("type", "subscription_ok");
        response.put("eventType", eventType);
        response.put("connectionId", connectionId);
        
        session.sendMessage(new TextMessage(response.toString()));
        logger.info("Subscription successful for session {}: {}", sessionId, eventType);
    }

    /**
     * Handle suggestion approval
     */
    private void handleSuggestionApproval(WebSocketSession session, JsonNode message) throws IOException {
        String sessionId = session.getId();
        
        if (!isAuthenticated(sessionId)) {
            sendErrorMessage(session, "Authentication required", "Please authenticate first");
            return;
        }
        
        String suggestionId = message.get("suggestionId").asText();
        String userId = message.get("userId").asText();
        String reason = message.get("reason").asText();
        
        logger.info("Processing suggestion approval: suggestionId={}, userId={}", suggestionId, userId);
        
        try {
            // TODO: Implement actual approval logic with AISuggestionApproval entity
            // For now, just send a success response
            
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "approval_result");
            response.put("suggestionId", suggestionId);
            response.put("approved", true);
            response.put("message", "Suggestion approved successfully");
            
            session.sendMessage(new TextMessage(response.toString()));
            logger.info("Suggestion approval processed: {}", suggestionId);
            
        } catch (Exception e) {
            logger.error("Error processing suggestion approval: {}", e.getMessage());
            sendErrorMessage(session, "Approval failed", e.getMessage());
        }
    }

    /**
     * Handle suggestion rejection
     */
    private void handleSuggestionRejection(WebSocketSession session, JsonNode message) throws IOException {
        String sessionId = session.getId();
        
        if (!isAuthenticated(sessionId)) {
            sendErrorMessage(session, "Authentication required", "Please authenticate first");
            return;
        }
        
        String suggestionId = message.get("suggestionId").asText();
        String userId = message.get("userId").asText();
        String reason = message.get("reason").asText();
        
        logger.info("Processing suggestion rejection: suggestionId={}, userId={}", suggestionId, userId);
        
        try {
            // TODO: Implement actual rejection logic with AISuggestionApproval entity
            // For now, just send a success response
            
            ObjectNode response = objectMapper.createObjectNode();
            response.put("type", "rejection_result");
            response.put("suggestionId", suggestionId);
            response.put("rejected", true);
            response.put("message", "Suggestion rejected successfully");
            
            session.sendMessage(new TextMessage(response.toString()));
            logger.info("Suggestion rejection processed: {}", suggestionId);
            
        } catch (Exception e) {
            logger.error("Error processing suggestion rejection: {}", e.getMessage());
            sendErrorMessage(session, "Rejection failed", e.getMessage());
        }
    }

    /**
     * Handle ping message
     */
    private void handlePing(WebSocketSession session) throws IOException {
        ObjectNode response = objectMapper.createObjectNode();
        response.put("type", "pong");
        response.put("timestamp", System.currentTimeMillis());
        
        session.sendMessage(new TextMessage(response.toString()));
    }

    /**
     * Handle unknown message type
     */
    private void handleUnknownMessage(WebSocketSession session, String messageType) throws IOException {
        logger.warn("Unknown message type received: {}", messageType);
        sendErrorMessage(session, "Unknown message type", "Message type '" + messageType + "' is not supported");
    }

    /**
     * Send welcome message
     */
    private void sendWelcomeMessage(WebSocketSession session) throws IOException {
        ObjectNode welcome = objectMapper.createObjectNode();
        welcome.put("type", "welcome");
        welcome.put("message", "AI Suggestion WebSocket connected");
        welcome.put("version", "1.0");
        welcome.put("timestamp", System.currentTimeMillis());
        
        session.sendMessage(new TextMessage(welcome.toString()));
    }

    /**
     * Send error message
     */
    private void sendErrorMessage(WebSocketSession session, String error, String details) throws IOException {
        ObjectNode errorResponse = objectMapper.createObjectNode();
        errorResponse.put("type", "error");
        errorResponse.put("error", error);
        errorResponse.put("details", details);
        errorResponse.put("timestamp", System.currentTimeMillis());
        
        session.sendMessage(new TextMessage(errorResponse.toString()));
    }

    /**
     * Check if session is authenticated
     */
    private boolean isAuthenticated(String sessionId) {
        return authenticatedSessions.getOrDefault(sessionId, false);
    }

    /**
     * Broadcast suggestion update to all authenticated sessions
     */
    public void broadcastSuggestionUpdate(AISuggestion suggestion) {
        ObjectNode update = objectMapper.createObjectNode();
        update.put("type", "ai_suggestion_update");
        update.put("suggestionId", suggestion.getId().toString());
        update.put("title", suggestion.getTitle());
        update.put("description", suggestion.getDescription());
        update.put("status", suggestion.getStatus().toString());
        update.put("confidenceScore", suggestion.getConfidenceScore().toString());
        update.put("timestamp", System.currentTimeMillis());
        
        String message = update.toString();
        
        // Broadcast to all authenticated sessions
        userSessions.values().forEach(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                }
            } catch (IOException e) {
                logger.error("Error broadcasting suggestion update: {}", e.getMessage());
            }
        });
        
        logger.debug("Broadcasted suggestion update: {}", suggestion.getId());
    }

    /**
     * Send message to specific user
     */
    public void sendToUser(String userId, String message) {
        WebSocketSession session = userSessions.get(userId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                logger.error("Error sending message to user {}: {}", userId, e.getMessage());
            }
        }
    }
} 