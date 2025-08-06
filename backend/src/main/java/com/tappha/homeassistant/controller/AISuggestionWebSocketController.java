package com.tappha.homeassistant.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.security.JwtTokenProvider;
import com.tappha.homeassistant.service.AIService;
import com.tappha.homeassistant.service.WebSocketKafkaIntegrationService;
import com.tappha.homeassistant.websocket.AISuggestionWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * WebSocket Controller for AI Suggestion Engine
 * 
 * Provides real-time notification endpoints and WebSocket message handling
 * for AI suggestion updates, approvals, and status changes.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Controller
@RequestMapping("/ws/ai-suggestions")
public class AISuggestionWebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(AISuggestionWebSocketController.class);

    private final ObjectMapper objectMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final AIService aiService;
    private final AISuggestionWebSocketHandler webSocketHandler;
    private final SimpMessagingTemplate messagingTemplate;
    private final WebSocketKafkaIntegrationService kafkaIntegrationService;

    @Autowired
    public AISuggestionWebSocketController(ObjectMapper objectMapper,
                                         JwtTokenProvider jwtTokenProvider,
                                         AIService aiService,
                                         AISuggestionWebSocketHandler webSocketHandler,
                                         SimpMessagingTemplate messagingTemplate,
                                         WebSocketKafkaIntegrationService kafkaIntegrationService) {
        this.objectMapper = objectMapper;
        this.jwtTokenProvider = jwtTokenProvider;
        this.aiService = aiService;
        this.webSocketHandler = webSocketHandler;
        this.messagingTemplate = messagingTemplate;
        this.kafkaIntegrationService = kafkaIntegrationService;
    }

    /**
     * Handle WebSocket message for suggestion approval
     * 
     * @param message JSON message containing suggestion approval details
     * @return Response message
     */
    @MessageMapping("/approve-suggestion")
    @SendToUser("/queue/approval-result")
    public ObjectNode handleSuggestionApproval(@RequestBody JsonNode message) {
        String suggestionId = message.get("suggestionId").asText();
        String userId = message.get("userId").asText();
        String reason = message.get("reason").asText();
        
        logger.info("Processing suggestion approval via WebSocket: suggestionId={}, userId={}", suggestionId, userId);
        
        ObjectNode response = objectMapper.createObjectNode();
        
        try {
            // TODO: Implement actual approval logic with AISuggestionApproval entity
            // For now, just send a success response
            
            response.put("type", "approval_result");
            response.put("suggestionId", suggestionId);
            response.put("approved", true);
            response.put("message", "Suggestion approved successfully");
            response.put("timestamp", System.currentTimeMillis());
            
            logger.info("Suggestion approval processed via WebSocket: {}", suggestionId);
            
        } catch (Exception e) {
            logger.error("Error processing suggestion approval via WebSocket: {}", e.getMessage());
            response.put("type", "approval_result");
            response.put("suggestionId", suggestionId);
            response.put("approved", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
        }
        
        return response;
    }

    /**
     * Handle WebSocket message for suggestion rejection
     * 
     * @param message JSON message containing suggestion rejection details
     * @return Response message
     */
    @MessageMapping("/reject-suggestion")
    @SendToUser("/queue/rejection-result")
    public ObjectNode handleSuggestionRejection(@RequestBody JsonNode message) {
        String suggestionId = message.get("suggestionId").asText();
        String userId = message.get("userId").asText();
        String reason = message.get("reason").asText();
        
        logger.info("Processing suggestion rejection via WebSocket: suggestionId={}, userId={}", suggestionId, userId);
        
        ObjectNode response = objectMapper.createObjectNode();
        
        try {
            // TODO: Implement actual rejection logic with AISuggestionApproval entity
            // For now, just send a success response
            
            response.put("type", "rejection_result");
            response.put("suggestionId", suggestionId);
            response.put("rejected", true);
            response.put("message", "Suggestion rejected successfully");
            response.put("timestamp", System.currentTimeMillis());
            
            logger.info("Suggestion rejection processed via WebSocket: {}", suggestionId);
            
        } catch (Exception e) {
            logger.error("Error processing suggestion rejection via WebSocket: {}", e.getMessage());
            response.put("type", "rejection_result");
            response.put("suggestionId", suggestionId);
            response.put("rejected", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
        }
        
        return response;
    }

    /**
     * Handle WebSocket message for subscription to suggestion updates
     * 
     * @param message JSON message containing subscription details
     * @return Response message
     */
    @MessageMapping("/subscribe-suggestions")
    @SendToUser("/queue/subscription-result")
    public ObjectNode handleSuggestionSubscription(@RequestBody JsonNode message) {
        String userId = message.get("userId").asText();
        String connectionId = message.get("connectionId").asText();
        
        logger.info("Processing suggestion subscription via WebSocket: userId={}, connectionId={}", userId, connectionId);
        
        ObjectNode response = objectMapper.createObjectNode();
        
        try {
            // Register subscription for real-time updates
            // TODO: Implement subscription management
            
            response.put("type", "subscription_result");
            response.put("subscribed", true);
            response.put("userId", userId);
            response.put("connectionId", connectionId);
            response.put("message", "Successfully subscribed to suggestion updates");
            response.put("timestamp", System.currentTimeMillis());
            
            logger.info("Suggestion subscription processed via WebSocket: userId={}", userId);
            
        } catch (Exception e) {
            logger.error("Error processing suggestion subscription via WebSocket: {}", e.getMessage());
            response.put("type", "subscription_result");
            response.put("subscribed", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
        }
        
        return response;
    }

    /**
     * Handle WebSocket message for unsubscription from suggestion updates
     * 
     * @param message JSON message containing unsubscription details
     * @return Response message
     */
    @MessageMapping("/unsubscribe-suggestions")
    @SendToUser("/queue/unsubscription-result")
    public ObjectNode handleSuggestionUnsubscription(@RequestBody JsonNode message) {
        String userId = message.get("userId").asText();
        String connectionId = message.get("connectionId").asText();
        
        logger.info("Processing suggestion unsubscription via WebSocket: userId={}, connectionId={}", userId, connectionId);
        
        ObjectNode response = objectMapper.createObjectNode();
        
        try {
            // Unregister subscription
            // TODO: Implement subscription management
            
            response.put("type", "unsubscription_result");
            response.put("unsubscribed", true);
            response.put("userId", userId);
            response.put("connectionId", connectionId);
            response.put("message", "Successfully unsubscribed from suggestion updates");
            response.put("timestamp", System.currentTimeMillis());
            
            logger.info("Suggestion unsubscription processed via WebSocket: userId={}", userId);
            
        } catch (Exception e) {
            logger.error("Error processing suggestion unsubscription via WebSocket: {}", e.getMessage());
            response.put("type", "unsubscription_result");
            response.put("unsubscribed", false);
            response.put("error", e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
        }
        
        return response;
    }

    /**
     * Broadcast suggestion update to all subscribed users
     * 
     * @param suggestion The AI suggestion to broadcast
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
        
        // Broadcast to all users subscribed to suggestion updates
        messagingTemplate.convertAndSend("/topic/ai-suggestions", update);
        
        // Publish to Kafka for persistence and distribution
        kafkaIntegrationService.publishBroadcastMessage("ai_suggestion_update", update);
        
        logger.debug("Broadcasted suggestion update via WebSocket: {}", suggestion.getId());
    }

    /**
     * Send suggestion update to specific user
     * 
     * @param userId The user ID to send the update to
     * @param suggestion The AI suggestion to send
     */
    public void sendSuggestionUpdateToUser(String userId, AISuggestion suggestion) {
        ObjectNode update = objectMapper.createObjectNode();
        update.put("type", "ai_suggestion_update");
        update.put("suggestionId", suggestion.getId().toString());
        update.put("title", suggestion.getTitle());
        update.put("description", suggestion.getDescription());
        update.put("status", suggestion.getStatus().toString());
        update.put("confidenceScore", suggestion.getConfidenceScore().toString());
        update.put("timestamp", System.currentTimeMillis());
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(userId, "/queue/ai-suggestions", update);
        
        // Publish to Kafka for user-specific messaging
        kafkaIntegrationService.publishUserMessage(userId, "ai_suggestion_update", update);
        
        logger.debug("Sent suggestion update to user via WebSocket: userId={}, suggestionId={}", userId, suggestion.getId());
    }

    /**
     * Broadcast batch processing status update
     * 
     * @param batchId The batch ID
     * @param status The processing status
     * @param progress The progress percentage (0-100)
     * @param message The status message
     */
    public void broadcastBatchStatusUpdate(String batchId, String status, int progress, String message) {
        ObjectNode update = objectMapper.createObjectNode();
        update.put("type", "batch_status_update");
        update.put("batchId", batchId);
        update.put("status", status);
        update.put("progress", progress);
        update.put("message", message);
        update.put("timestamp", System.currentTimeMillis());
        
        // Broadcast to all users subscribed to batch updates
        messagingTemplate.convertAndSend("/topic/batch-status", update);
        
        // Publish to Kafka for persistence and distribution
        kafkaIntegrationService.publishBroadcastMessage("batch_status_update", update);
        
        logger.debug("Broadcasted batch status update via WebSocket: batchId={}, status={}, progress={}%", 
                   batchId, status, progress);
    }

    /**
     * Send batch status update to specific user
     * 
     * @param userId The user ID to send the update to
     * @param batchId The batch ID
     * @param status The processing status
     * @param progress The progress percentage (0-100)
     * @param message The status message
     */
    public void sendBatchStatusUpdateToUser(String userId, String batchId, String status, int progress, String message) {
        ObjectNode update = objectMapper.createObjectNode();
        update.put("type", "batch_status_update");
        update.put("batchId", batchId);
        update.put("status", status);
        update.put("progress", progress);
        update.put("message", message);
        update.put("timestamp", System.currentTimeMillis());
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(userId, "/queue/batch-status", update);
        
        // Publish to Kafka for user-specific messaging
        kafkaIntegrationService.publishUserMessage(userId, "batch_status_update", update);
        
        logger.debug("Sent batch status update to user via WebSocket: userId={}, batchId={}, status={}, progress={}%", 
                   userId, batchId, status, progress);
    }

    /**
     * Broadcast system health update
     * 
     * @param aiModelStatus The AI model status
     * @param batchProcessingStatus The batch processing status
     * @param activeConnections The number of active connections
     */
    public void broadcastSystemHealthUpdate(String aiModelStatus, String batchProcessingStatus, int activeConnections) {
        ObjectNode update = objectMapper.createObjectNode();
        update.put("type", "system_health_update");
        update.put("aiModelStatus", aiModelStatus);
        update.put("batchProcessingStatus", batchProcessingStatus);
        update.put("activeConnections", activeConnections);
        update.put("timestamp", System.currentTimeMillis());
        
        // Broadcast to all users subscribed to system health updates
        messagingTemplate.convertAndSend("/topic/system-health", update);
        
        logger.debug("Broadcasted system health update via WebSocket: aiModelStatus={}, batchProcessingStatus={}, activeConnections={}", 
                   aiModelStatus, batchProcessingStatus, activeConnections);
    }

    /**
     * Send system health update to specific user
     * 
     * @param userId The user ID to send the update to
     * @param aiModelStatus The AI model status
     * @param batchProcessingStatus The batch processing status
     * @param activeConnections The number of active connections
     */
    public void sendSystemHealthUpdateToUser(String userId, String aiModelStatus, String batchProcessingStatus, int activeConnections) {
        ObjectNode update = objectMapper.createObjectNode();
        update.put("type", "system_health_update");
        update.put("aiModelStatus", aiModelStatus);
        update.put("batchProcessingStatus", batchProcessingStatus);
        update.put("activeConnections", activeConnections);
        update.put("timestamp", System.currentTimeMillis());
        
        // Send to specific user
        messagingTemplate.convertAndSendToUser(userId, "/queue/system-health", update);
        
        logger.debug("Sent system health update to user via WebSocket: userId={}, aiModelStatus={}, batchProcessingStatus={}, activeConnections={}", 
                   userId, aiModelStatus, batchProcessingStatus, activeConnections);
    }
} 