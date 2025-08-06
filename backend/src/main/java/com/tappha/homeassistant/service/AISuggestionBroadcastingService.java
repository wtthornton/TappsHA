package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.AIBatchProcessing;
import com.tappha.homeassistant.websocket.AISuggestionMessageBroker;
import com.tappha.homeassistant.websocket.WebSocketSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

/**
 * AI Suggestion Broadcasting Service
 * 
 * Provides comprehensive message broadcasting capabilities for AI suggestion
 * status updates, batch processing notifications, and system health updates.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
public class AISuggestionBroadcastingService {

    private static final Logger logger = LoggerFactory.getLogger(AISuggestionBroadcastingService.class);

    private final ObjectMapper objectMapper;
    private final AISuggestionMessageBroker messageBroker;
    private final WebSocketSessionManager sessionManager;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public AISuggestionBroadcastingService(ObjectMapper objectMapper,
                                         AISuggestionMessageBroker messageBroker,
                                         WebSocketSessionManager sessionManager,
                                         SimpMessagingTemplate messagingTemplate) {
        this.objectMapper = objectMapper;
        this.messageBroker = messageBroker;
        this.sessionManager = sessionManager;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcast suggestion creation notification
     * 
     * @param suggestion The AI suggestion that was created
     */
    public void broadcastSuggestionCreated(AISuggestion suggestion) {
        ObjectNode message = createSuggestionMessage(suggestion, "SUGGESTION_CREATED");
        
        // Broadcast to all subscribers
        broadcastToEventType("ai_suggestions", message.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/ai-suggestions", message);
        
        logger.info("Broadcasted suggestion created notification: {}", suggestion.getId());
    }

    /**
     * Broadcast suggestion status update
     * 
     * @param suggestion The AI suggestion with updated status
     */
    public void broadcastSuggestionStatusUpdate(AISuggestion suggestion) {
        ObjectNode message = createSuggestionMessage(suggestion, "SUGGESTION_STATUS_UPDATED");
        
        // Broadcast to all subscribers
        broadcastToEventType("ai_suggestions", message.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/ai-suggestions", message);
        
        logger.info("Broadcasted suggestion status update: {} - {}", suggestion.getId(), suggestion.getStatus());
    }

    /**
     * Broadcast suggestion approval notification
     * 
     * @param suggestion The AI suggestion that was approved
     * @param userId The user who approved the suggestion
     * @param reason The approval reason
     */
    public void broadcastSuggestionApproved(AISuggestion suggestion, String userId, String reason) {
        ObjectNode message = createSuggestionMessage(suggestion, "SUGGESTION_APPROVED");
        message.put("approvedBy", userId);
        message.put("approvalReason", reason);
        message.put("approvedAt", System.currentTimeMillis());
        
        // Broadcast to all subscribers
        broadcastToEventType("ai_suggestions", message.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/ai-suggestions", message);
        
        logger.info("Broadcasted suggestion approved notification: {} by user {}", suggestion.getId(), userId);
    }

    /**
     * Broadcast suggestion rejection notification
     * 
     * @param suggestion The AI suggestion that was rejected
     * @param userId The user who rejected the suggestion
     * @param reason The rejection reason
     */
    public void broadcastSuggestionRejected(AISuggestion suggestion, String userId, String reason) {
        ObjectNode message = createSuggestionMessage(suggestion, "SUGGESTION_REJECTED");
        message.put("rejectedBy", userId);
        message.put("rejectionReason", reason);
        message.put("rejectedAt", System.currentTimeMillis());
        
        // Broadcast to all subscribers
        broadcastToEventType("ai_suggestions", message.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/ai-suggestions", message);
        
        logger.info("Broadcasted suggestion rejected notification: {} by user {}", suggestion.getId(), userId);
    }

    /**
     * Broadcast batch processing status update
     * 
     * @param batch The batch processing entity
     * @param progress The current progress percentage (0-100)
     * @param message The status message
     */
    public void broadcastBatchStatusUpdate(AIBatchProcessing batch, int progress, String message) {
        ObjectNode statusMessage = objectMapper.createObjectNode();
        statusMessage.put("type", "BATCH_STATUS_UPDATE");
        statusMessage.put("batchId", batch.getId().toString());
        statusMessage.put("status", batch.getStatus().toString());
        statusMessage.put("progress", progress);
        statusMessage.put("message", message);
        statusMessage.put("suggestionsGenerated", batch.getSuggestionsGenerated());
        statusMessage.put("errorsCount", batch.getErrorsCount());
        statusMessage.put("timestamp", System.currentTimeMillis());
        
        // Broadcast to all subscribers
        broadcastToEventType("batch_processing", statusMessage.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/batch-status", statusMessage);
        
        logger.info("Broadcasted batch status update: {} - {}% - {}", batch.getId(), progress, message);
    }

    /**
     * Broadcast batch processing completion
     * 
     * @param batch The completed batch processing entity
     * @param results The processing results summary
     */
    public void broadcastBatchCompleted(AIBatchProcessing batch, JsonNode results) {
        ObjectNode completionMessage = objectMapper.createObjectNode();
        completionMessage.put("type", "BATCH_COMPLETED");
        completionMessage.put("batchId", batch.getId().toString());
        completionMessage.put("status", batch.getStatus().toString());
        completionMessage.put("suggestionsGenerated", batch.getSuggestionsGenerated());
        completionMessage.put("errorsCount", batch.getErrorsCount());
        completionMessage.put("completionTime", System.currentTimeMillis());
        completionMessage.set("results", results);
        
        // Broadcast to all subscribers
        broadcastToEventType("batch_processing", completionMessage.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/batch-status", completionMessage);
        
        logger.info("Broadcasted batch completion: {} - {} suggestions generated", batch.getId(), batch.getSuggestionsGenerated());
    }

    /**
     * Broadcast batch processing error
     * 
     * @param batch The batch processing entity that encountered an error
     * @param error The error message
     * @param errorCode The error code
     */
    public void broadcastBatchError(AIBatchProcessing batch, String error, String errorCode) {
        ObjectNode errorMessage = objectMapper.createObjectNode();
        errorMessage.put("type", "BATCH_ERROR");
        errorMessage.put("batchId", batch.getId().toString());
        errorMessage.put("status", batch.getStatus().toString());
        errorMessage.put("error", error);
        errorMessage.put("errorCode", errorCode);
        errorMessage.put("timestamp", System.currentTimeMillis());
        
        // Broadcast to all subscribers
        broadcastToEventType("batch_processing", errorMessage.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/batch-status", errorMessage);
        
        logger.error("Broadcasted batch error: {} - {} ({})", batch.getId(), error, errorCode);
    }

    /**
     * Broadcast system health update
     * 
     * @param aiModelStatus The AI model status (ONLINE, OFFLINE, ERROR)
     * @param batchProcessingStatus The batch processing status (IDLE, ACTIVE, ERROR)
     * @param activeConnections The number of active WebSocket connections
     * @param systemMetrics Additional system metrics
     */
    public void broadcastSystemHealthUpdate(String aiModelStatus, String batchProcessingStatus, 
                                         int activeConnections, JsonNode systemMetrics) {
        ObjectNode healthMessage = objectMapper.createObjectNode();
        healthMessage.put("type", "SYSTEM_HEALTH_UPDATE");
        healthMessage.put("aiModelStatus", aiModelStatus);
        healthMessage.put("batchProcessingStatus", batchProcessingStatus);
        healthMessage.put("activeConnections", activeConnections);
        healthMessage.put("timestamp", System.currentTimeMillis());
        healthMessage.set("metrics", systemMetrics);
        
        // Broadcast to all subscribers
        broadcastToEventType("system_health", healthMessage.toString());
        
        // Also broadcast via STOMP for WebSocket clients
        messagingTemplate.convertAndSend("/topic/system-health", healthMessage);
        
        logger.debug("Broadcasted system health update: AI={}, Batch={}, Connections={}", 
                   aiModelStatus, batchProcessingStatus, activeConnections);
    }

    /**
     * Send suggestion update to specific user
     * 
     * @param userId The user ID to send the update to
     * @param suggestion The AI suggestion to send
     * @param messageType The type of message (CREATED, UPDATED, APPROVED, REJECTED)
     */
    public void sendSuggestionUpdateToUser(String userId, AISuggestion suggestion, String messageType) {
        ObjectNode message = createSuggestionMessage(suggestion, messageType);
        
        // Send to specific user via STOMP
        messagingTemplate.convertAndSendToUser(userId, "/queue/ai-suggestions", message);
        
        logger.debug("Sent suggestion update to user: userId={}, suggestionId={}, type={}", 
                   userId, suggestion.getId(), messageType);
    }

    /**
     * Send batch status update to specific user
     * 
     * @param userId The user ID to send the update to
     * @param batch The batch processing entity
     * @param progress The current progress percentage
     * @param message The status message
     */
    public void sendBatchStatusUpdateToUser(String userId, AIBatchProcessing batch, int progress, String message) {
        ObjectNode statusMessage = objectMapper.createObjectNode();
        statusMessage.put("type", "BATCH_STATUS_UPDATE");
        statusMessage.put("batchId", batch.getId().toString());
        statusMessage.put("status", batch.getStatus().toString());
        statusMessage.put("progress", progress);
        statusMessage.put("message", message);
        statusMessage.put("timestamp", System.currentTimeMillis());
        
        // Send to specific user via STOMP
        messagingTemplate.convertAndSendToUser(userId, "/queue/batch-status", statusMessage);
        
        logger.debug("Sent batch status update to user: userId={}, batchId={}, progress={}%", 
                   userId, batch.getId(), progress);
    }

    /**
     * Send system health update to specific user
     * 
     * @param userId The user ID to send the update to
     * @param aiModelStatus The AI model status
     * @param batchProcessingStatus The batch processing status
     * @param activeConnections The number of active connections
     */
    public void sendSystemHealthUpdateToUser(String userId, String aiModelStatus, 
                                           String batchProcessingStatus, int activeConnections) {
        ObjectNode healthMessage = objectMapper.createObjectNode();
        healthMessage.put("type", "SYSTEM_HEALTH_UPDATE");
        healthMessage.put("aiModelStatus", aiModelStatus);
        healthMessage.put("batchProcessingStatus", batchProcessingStatus);
        healthMessage.put("activeConnections", activeConnections);
        healthMessage.put("timestamp", System.currentTimeMillis());
        
        // Send to specific user via STOMP
        messagingTemplate.convertAndSendToUser(userId, "/queue/system-health", healthMessage);
        
        logger.debug("Sent system health update to user: userId={}, AI={}, Batch={}, Connections={}", 
                   userId, aiModelStatus, batchProcessingStatus, activeConnections);
    }

    /**
     * Broadcast to all subscribers of a specific event type
     * 
     * @param eventType The event type to broadcast to
     * @param message The message to broadcast
     */
    private void broadcastToEventType(String eventType, String message) {
        Set<String> subscribers = messageBroker.getSubscribers(eventType);
        
        for (String sessionId : subscribers) {
            try {
                sessionManager.sendMessageToSession(sessionId, message);
            } catch (Exception e) {
                logger.error("Failed to send message to session {}: {}", sessionId, e.getMessage());
                // Remove failed session from subscriptions
                messageBroker.unsubscribe(sessionId, eventType);
            }
        }
        
        logger.debug("Broadcasted message to {} subscribers for event type: {}", subscribers.size(), eventType);
    }

    /**
     * Create a standardized suggestion message
     * 
     * @param suggestion The AI suggestion
     * @param messageType The type of message
     * @return ObjectNode containing the message
     */
    private ObjectNode createSuggestionMessage(AISuggestion suggestion, String messageType) {
        ObjectNode message = objectMapper.createObjectNode();
        message.put("type", messageType);
        message.put("suggestionId", suggestion.getId().toString());
        message.put("title", suggestion.getTitle());
        message.put("description", suggestion.getDescription());
        message.put("status", suggestion.getStatus().toString());
        message.put("confidenceScore", suggestion.getConfidenceScore().toString());
        message.put("createdAt", suggestion.getCreatedAt().toInstant().toEpochMilli());
        message.put("timestamp", System.currentTimeMillis());
        
        return message;
    }

    /**
     * Get current subscription statistics
     * 
     * @return ObjectNode containing subscription statistics
     */
    public ObjectNode getSubscriptionStatistics() {
        ObjectNode stats = objectMapper.createObjectNode();
        stats.put("totalSubscriptions", messageBroker.getTotalSubscriptionCount());
        stats.put("aiSuggestionsSubscribers", messageBroker.getSubscriptionCount("ai_suggestions"));
        stats.put("batchProcessingSubscribers", messageBroker.getSubscriptionCount("batch_processing"));
        stats.put("systemHealthSubscribers", messageBroker.getSubscriptionCount("system_health"));
        stats.put("activeSessions", sessionManager.getActiveSessionCount());
        stats.put("timestamp", System.currentTimeMillis());
        
        return stats;
    }
} 