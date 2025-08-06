package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket Kafka Integration Service
 * 
 * Bridges WebSocket real-time messaging with Kafka message queuing
 * for reliable, scalable real-time communication in the AI Suggestion Engine.
 * 
 * Features:
 * - Kafka message publishing for WebSocket events
 * - Kafka message consumption for WebSocket broadcasting
 * - Message persistence and replay capabilities
 * - Load balancing across multiple WebSocket instances
 * - Dead letter queue handling for failed messages
 */
@Service
public class WebSocketKafkaIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketKafkaIntegrationService.class);

    // Kafka topics for WebSocket message queuing
    private static final String WEBSOCKET_EVENTS_TOPIC = "websocket-events";
    private static final String WEBSOCKET_BROADCAST_TOPIC = "websocket-broadcast";
    private static final String WEBSOCKET_USER_TOPIC = "websocket-user";
    private static final String WEBSOCKET_DLQ_TOPIC = "websocket-dlq";

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    // Track active WebSocket sessions for user-specific messaging
    private final Map<String, String> userSessionMap = new ConcurrentHashMap<>();

    /**
     * Publish WebSocket event to Kafka for persistence and distribution
     * 
     * @param eventType The type of WebSocket event
     * @param payload The event payload
     * @param userId Optional user ID for user-specific events
     */
    public void publishWebSocketEvent(String eventType, JsonNode payload, String userId) {
        try {
            ObjectNode event = objectMapper.createObjectNode();
            event.put("eventType", eventType);
            event.put("timestamp", Instant.now().toEpochMilli());
            event.put("userId", userId);
            event.set("payload", payload);

            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(WEBSOCKET_EVENTS_TOPIC, message);

            logger.info("Published WebSocket event to Kafka: {} for user: {}", eventType, userId);
        } catch (Exception e) {
            logger.error("Failed to publish WebSocket event to Kafka: {}", eventType, e);
            publishToDeadLetterQueue(eventType, payload, userId, e.getMessage());
        }
    }

    /**
     * Publish broadcast message to Kafka for distribution to all WebSocket instances
     * 
     * @param messageType The type of broadcast message
     * @param payload The message payload
     */
    public void publishBroadcastMessage(String messageType, JsonNode payload) {
        try {
            ObjectNode message = objectMapper.createObjectNode();
            message.put("messageType", messageType);
            message.put("timestamp", Instant.now().toEpochMilli());
            message.set("payload", payload);

            String kafkaMessage = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(WEBSOCKET_BROADCAST_TOPIC, kafkaMessage);

            logger.info("Published broadcast message to Kafka: {}", messageType);
        } catch (Exception e) {
            logger.error("Failed to publish broadcast message to Kafka: {}", messageType, e);
            publishToDeadLetterQueue(messageType, payload, null, e.getMessage());
        }
    }

    /**
     * Publish user-specific message to Kafka
     * 
     * @param userId The target user ID
     * @param messageType The type of user message
     * @param payload The message payload
     */
    public void publishUserMessage(String userId, String messageType, JsonNode payload) {
        try {
            ObjectNode message = objectMapper.createObjectNode();
            message.put("userId", userId);
            message.put("messageType", messageType);
            message.put("timestamp", Instant.now().toEpochMilli());
            message.set("payload", payload);

            String kafkaMessage = objectMapper.writeValueAsString(message);
            kafkaTemplate.send(WEBSOCKET_USER_TOPIC, kafkaMessage);

            logger.info("Published user message to Kafka: {} for user: {}", messageType, userId);
        } catch (Exception e) {
            logger.error("Failed to publish user message to Kafka: {}", messageType, e);
            publishToDeadLetterQueue(messageType, payload, userId, e.getMessage());
        }
    }

    /**
     * Register user session for WebSocket messaging
     * 
     * @param userId The user ID
     * @param sessionId The WebSocket session ID
     */
    public void registerUserSession(String userId, String sessionId) {
        userSessionMap.put(userId, sessionId);
        logger.info("Registered user session: {} -> {}", userId, sessionId);
    }

    /**
     * Unregister user session
     * 
     * @param userId The user ID
     */
    public void unregisterUserSession(String userId) {
        userSessionMap.remove(userId);
        logger.info("Unregistered user session: {}", userId);
    }

    /**
     * Kafka listener for broadcast messages
     * Distributes messages to all connected WebSocket clients
     */
    @KafkaListener(topics = WEBSOCKET_BROADCAST_TOPIC, groupId = "websocket-broadcast-group")
    public void handleBroadcastMessage(String message) {
        try {
            JsonNode messageNode = objectMapper.readTree(message);
            String messageType = messageNode.get("messageType").asText();
            JsonNode payload = messageNode.get("payload");

            // Broadcast to all connected clients
            messagingTemplate.convertAndSend("/topic/broadcast", payload);

            logger.info("Handled broadcast message: {}", messageType);
        } catch (Exception e) {
            logger.error("Failed to handle broadcast message", e);
        }
    }

    /**
     * Kafka listener for user-specific messages
     * Sends messages to specific user WebSocket sessions
     */
    @KafkaListener(topics = WEBSOCKET_USER_TOPIC, groupId = "websocket-user-group")
    public void handleUserMessage(String message) {
        try {
            JsonNode messageNode = objectMapper.readTree(message);
            String userId = messageNode.get("userId").asText();
            String messageType = messageNode.get("messageType").asText();
            JsonNode payload = messageNode.get("payload");

            // Send to specific user
            messagingTemplate.convertAndSendToUser(userId, "/queue/messages", payload);

            logger.info("Handled user message: {} for user: {}", messageType, userId);
        } catch (Exception e) {
            logger.error("Failed to handle user message", e);
        }
    }

    /**
     * Kafka listener for WebSocket events
     * Processes and logs WebSocket events for monitoring
     */
    @KafkaListener(topics = WEBSOCKET_EVENTS_TOPIC, groupId = "websocket-events-group")
    public void handleWebSocketEvent(String message) {
        try {
            JsonNode eventNode = objectMapper.readTree(message);
            String eventType = eventNode.get("eventType").asText();
            String userId = eventNode.get("userId").asText();
            JsonNode payload = eventNode.get("payload");

            // Process WebSocket event (logging, metrics, etc.)
            processWebSocketEvent(eventType, userId, payload);

            logger.info("Handled WebSocket event: {} for user: {}", eventType, userId);
        } catch (Exception e) {
            logger.error("Failed to handle WebSocket event", e);
        }
    }

    /**
     * Process WebSocket event for monitoring and analytics
     * 
     * @param eventType The event type
     * @param userId The user ID
     * @param payload The event payload
     */
    private void processWebSocketEvent(String eventType, String userId, JsonNode payload) {
        // Log event for monitoring
        logger.debug("Processing WebSocket event: {} for user: {}", eventType, userId);

        // TODO: Add metrics collection, analytics, etc.
        // This could include:
        // - Event counting and aggregation
        // - User activity tracking
        // - Performance metrics
        // - Error rate monitoring
    }

    /**
     * Publish failed message to dead letter queue
     * 
     * @param messageType The message type
     * @param payload The message payload
     * @param userId The user ID (if applicable)
     * @param errorMessage The error message
     */
    private void publishToDeadLetterQueue(String messageType, JsonNode payload, String userId, String errorMessage) {
        try {
            ObjectNode dlqMessage = objectMapper.createObjectNode();
            dlqMessage.put("messageType", messageType);
            dlqMessage.put("userId", userId);
            dlqMessage.put("errorMessage", errorMessage);
            dlqMessage.put("timestamp", Instant.now().toEpochMilli());
            dlqMessage.set("payload", payload);

            String message = objectMapper.writeValueAsString(dlqMessage);
            kafkaTemplate.send(WEBSOCKET_DLQ_TOPIC, message);

            logger.warn("Published message to dead letter queue: {}", messageType);
        } catch (Exception e) {
            logger.error("Failed to publish to dead letter queue", e);
        }
    }

    /**
     * Get current user session count
     * 
     * @return Number of active user sessions
     */
    public int getActiveSessionCount() {
        return userSessionMap.size();
    }

    /**
     * Check if user has active session
     * 
     * @param userId The user ID
     * @return True if user has active session
     */
    public boolean hasActiveSession(String userId) {
        return userSessionMap.containsKey(userId);
    }

    /**
     * Get user session ID
     * 
     * @param userId The user ID
     * @return The session ID or null if not found
     */
    public String getUserSessionId(String userId) {
        return userSessionMap.get(userId);
    }
} 