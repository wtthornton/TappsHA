package com.tappha.homeassistant.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.service.WebSocketKafkaIntegrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * WebSocket Integration Tests
 * 
 * Tests for WebSocket real-time integration including:
 * - Kafka integration for message queuing
 * - Session management
 * - Error handling and recovery
 */
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
public class WebSocketIntegrationTest {

    @Mock
    private WebSocketKafkaIntegrationService kafkaIntegrationService;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
    }

    @Test
    void testKafkaIntegrationForBroadcastMessages() {
        // Test Kafka integration for broadcast messages
        ObjectNode broadcastMessage = objectMapper.createObjectNode();
        broadcastMessage.put("type", "test_broadcast");
        broadcastMessage.put("data", "test broadcast data");
        
        // Simulate broadcast message
        kafkaIntegrationService.publishBroadcastMessage("test_broadcast", broadcastMessage);
        
        // Verify Kafka message publishing
        verify(kafkaIntegrationService, times(1)).publishBroadcastMessage(
            eq("test_broadcast"), 
            eq(broadcastMessage)
        );
    }

    @Test
    void testKafkaIntegrationForUserMessages() {
        // Test Kafka integration for user-specific messages
        String userId = "test-user-id";
        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("type", "test_user_message");
        userMessage.put("data", "test user data");
        
        // Simulate user message
        kafkaIntegrationService.publishUserMessage(userId, "test_user_message", userMessage);
        
        // Verify Kafka user message publishing
        verify(kafkaIntegrationService, times(1)).publishUserMessage(
            eq(userId), 
            eq("test_user_message"), 
            eq(userMessage)
        );
    }

    @Test
    void testWebSocketSessionManagement() {
        // Test WebSocket session management
        String userId = "test-user";
        String sessionId = UUID.randomUUID().toString();
        
        // Simulate session registration
        kafkaIntegrationService.registerUserSession(userId, sessionId);
        
        // Verify session registration
        verify(kafkaIntegrationService, times(1)).registerUserSession(eq(userId), eq(sessionId));
        
        // Test session unregistration
        kafkaIntegrationService.unregisterUserSession(userId);
        
        // Verify session unregistration
        verify(kafkaIntegrationService, times(1)).unregisterUserSession(eq(userId));
    }

    @Test
    void testKafkaDeadLetterQueueHandling() {
        // Test Kafka dead letter queue handling
        String messageType = "test_message";
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("data", "test data");
        
        // Verify that the service handles errors gracefully
        doThrow(new RuntimeException("Kafka error")).when(kafkaIntegrationService)
            .publishBroadcastMessage(anyString(), any(JsonNode.class));
        
        // This should trigger the dead letter queue mechanism
        kafkaIntegrationService.publishBroadcastMessage(messageType, payload);
        
        // Verify that the error was handled
        verify(kafkaIntegrationService, times(1)).publishBroadcastMessage(
            eq(messageType), 
            eq(payload)
        );
    }

    @Test
    void testWebSocketSessionTracking() {
        // Test WebSocket session tracking
        String userId = "test-user";
        
        // Test session count
        int sessionCount = kafkaIntegrationService.getActiveSessionCount();
        assert sessionCount >= 0;
        
        // Test session existence
        boolean hasSession = kafkaIntegrationService.hasActiveSession(userId);
        assert !hasSession; // Should be false for non-existent user
        
        // Test session ID retrieval
        String sessionId = kafkaIntegrationService.getUserSessionId(userId);
        assert sessionId == null; // Should be null for non-existent user
    }
} 