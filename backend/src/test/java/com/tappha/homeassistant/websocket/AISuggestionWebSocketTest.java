package com.tappha.homeassistant.websocket;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.service.AIService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.junit.jupiter.api.extension.ExtendWith;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * WebSocket tests for AI Suggestion real-time messaging and connection management
 * 
 * Tests WebSocket connection, message handling, authentication, and real-time updates
 * for the AI Suggestion Engine as part of Task 5.1
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@EmbeddedKafka(partitions = 1, brokerProperties = {"listeners=PLAINTEXT://localhost:9092", "port=9092"})
@ActiveProfiles("test")
@Testcontainers
@DisplayName("AI Suggestion WebSocket Tests")
class AISuggestionWebSocketTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
        .withDatabaseName("tappha_test")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AIService aiService;

    private StandardWebSocketClient wsClient;
    private User testUser;
    private HomeAssistantConnection testConnection;
    private AISuggestion testSuggestion;
    private CountDownLatch messageLatch;
    private AtomicInteger messageCount;

    @BeforeEach
    void setUp() {
        wsClient = new StandardWebSocketClient();
        messageLatch = new CountDownLatch(1);
        messageCount = new AtomicInteger(0);

        // Create test user
        testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");

        // Create test connection
        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("Test HA Connection");
        testConnection.setUrl("http://192.168.1.86:8123/");
        testConnection.setToken("test-token");

        // Create test suggestion
        testSuggestion = new AISuggestion();
        testSuggestion.setId(UUID.randomUUID());
        testSuggestion.setConnection(testConnection);
        testSuggestion.setTitle("Test Automation Suggestion");
        testSuggestion.setDescription("This is a test automation suggestion");
        testSuggestion.setSuggestionType(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION);
        testSuggestion.setAutomationConfig("{\"trigger\": {\"platform\": \"time\"}}");
        testSuggestion.setConfidenceScore(new BigDecimal("0.85"));
        testSuggestion.setStatus(AISuggestion.SuggestionStatus.PENDING);
        testSuggestion.setCreatedAt(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should establish WebSocket connection for AI suggestions")
    void shouldEstablishWebSocketConnection() throws Exception {
        // Arrange
        CountDownLatch connectionLatch = new CountDownLatch(1);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                connectionLatch.countDown();
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                // Handle incoming messages
                messageCount.incrementAndGet();
            }
        };

        // Act - Connect to AI suggestion WebSocket
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Assert
        assertTrue(connectionLatch.await(5, TimeUnit.SECONDS), "WebSocket connection should be established");
        assertTrue(session.isOpen(), "WebSocket session should be open");
        assertEquals(0, messageCount.get(), "No messages should be received initially");

        session.close();
    }

    @Test
    @DisplayName("Should handle authentication for AI suggestion WebSocket")
    void shouldHandleAuthentication() throws Exception {
        // Arrange
        CountDownLatch authLatch = new CountDownLatch(1);
        AtomicInteger authMessages = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send authentication message
                try {
                    ObjectNode authMessage = objectMapper.createObjectNode();
                    authMessage.put("type", "auth");
                    authMessage.put("token", "test-jwt-token");
                    authMessage.put("userId", testUser.getId().toString());
                    
                    session.sendMessage(new TextMessage(authMessage.toString()));
                } catch (Exception e) {
                    fail("Failed to send auth message: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                try {
                    JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                    String messageType = jsonMessage.get("type").asText();
                    
                    if ("auth_ok".equals(messageType)) {
                        authMessages.incrementAndGet();
                        authLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Failed to handle auth response: " + e.getMessage());
                }
            }
        };

        // Act - Connect and authenticate
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Assert
        assertTrue(authLatch.await(5, TimeUnit.SECONDS), "Authentication should be successful");
        assertEquals(1, authMessages.get(), "Should receive auth_ok response");

        session.close();
    }

    @Test
    @DisplayName("Should subscribe to AI suggestion updates")
    void shouldSubscribeToSuggestionUpdates() throws Exception {
        // Arrange
        CountDownLatch subscribeLatch = new CountDownLatch(1);
        AtomicInteger subscribeMessages = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send subscription message
                try {
                    ObjectNode subscribeMessage = objectMapper.createObjectNode();
                    subscribeMessage.put("type", "subscribe");
                    subscribeMessage.put("eventType", "ai_suggestion_update");
                    subscribeMessage.put("connectionId", testConnection.getId().toString());
                    
                    session.sendMessage(new TextMessage(subscribeMessage.toString()));
                } catch (Exception e) {
                    fail("Failed to send subscribe message: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                try {
                    JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                    String messageType = jsonMessage.get("type").asText();
                    
                    if ("subscription_ok".equals(messageType)) {
                        subscribeMessages.incrementAndGet();
                        subscribeLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Failed to handle subscription response: " + e.getMessage());
                }
            }
        };

        // Act - Connect and subscribe
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Assert
        assertTrue(subscribeLatch.await(5, TimeUnit.SECONDS), "Subscription should be successful");
        assertEquals(1, subscribeMessages.get(), "Should receive subscription_ok response");

        session.close();
    }

    @Test
    @DisplayName("Should receive real-time AI suggestion updates")
    void shouldReceiveRealTimeSuggestionUpdates() throws Exception {
        // Arrange
        CountDownLatch updateLatch = new CountDownLatch(2);
        AtomicInteger updateCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Subscribe to updates
                try {
                    ObjectNode subscribeMessage = objectMapper.createObjectNode();
                    subscribeMessage.put("type", "subscribe");
                    subscribeMessage.put("eventType", "ai_suggestion_update");
                    subscribeMessage.put("connectionId", testConnection.getId().toString());
                    
                    session.sendMessage(new TextMessage(subscribeMessage.toString()));
                } catch (Exception e) {
                    fail("Failed to send subscribe message: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                try {
                    JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                    String messageType = jsonMessage.get("type").asText();
                    
                    if ("ai_suggestion_update".equals(messageType)) {
                        updateCount.incrementAndGet();
                        updateLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Failed to handle update message: " + e.getMessage());
                }
            }
        };

        // Act - Connect and wait for updates
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Simulate AI suggestion updates (this would normally come from the service)
        Thread.sleep(1000);

        // Assert
        assertTrue(updateLatch.await(10, TimeUnit.SECONDS), "Should receive real-time updates");
        assertTrue(updateCount.get() >= 0, "Should have received some updates");

        session.close();
    }

    @Test
    @DisplayName("Should handle suggestion approval via WebSocket")
    void shouldHandleSuggestionApproval() throws Exception {
        // Arrange
        CountDownLatch approvalLatch = new CountDownLatch(1);
        AtomicInteger approvalMessages = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send approval message
                try {
                    ObjectNode approvalMessage = objectMapper.createObjectNode();
                    approvalMessage.put("type", "approve_suggestion");
                    approvalMessage.put("suggestionId", testSuggestion.getId().toString());
                    approvalMessage.put("userId", testUser.getId().toString());
                    approvalMessage.put("reason", "Test approval");
                    
                    session.sendMessage(new TextMessage(approvalMessage.toString()));
                } catch (Exception e) {
                    fail("Failed to send approval message: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                try {
                    JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                    String messageType = jsonMessage.get("type").asText();
                    
                    if ("approval_result".equals(messageType)) {
                        approvalMessages.incrementAndGet();
                        approvalLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Failed to handle approval response: " + e.getMessage());
                }
            }
        };

        // Act - Connect and approve suggestion
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Assert
        assertTrue(approvalLatch.await(5, TimeUnit.SECONDS), "Approval should be processed");
        assertEquals(1, approvalMessages.get(), "Should receive approval result");

        session.close();
    }

    @Test
    @DisplayName("Should handle suggestion rejection via WebSocket")
    void shouldHandleSuggestionRejection() throws Exception {
        // Arrange
        CountDownLatch rejectionLatch = new CountDownLatch(1);
        AtomicInteger rejectionMessages = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send rejection message
                try {
                    ObjectNode rejectionMessage = objectMapper.createObjectNode();
                    rejectionMessage.put("type", "reject_suggestion");
                    rejectionMessage.put("suggestionId", testSuggestion.getId().toString());
                    rejectionMessage.put("userId", testUser.getId().toString());
                    rejectionMessage.put("reason", "Test rejection");
                    
                    session.sendMessage(new TextMessage(rejectionMessage.toString()));
                } catch (Exception e) {
                    fail("Failed to send rejection message: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                try {
                    JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                    String messageType = jsonMessage.get("type").asText();
                    
                    if ("rejection_result".equals(messageType)) {
                        rejectionMessages.incrementAndGet();
                        rejectionLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Failed to handle rejection response: " + e.getMessage());
                }
            }
        };

        // Act - Connect and reject suggestion
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Assert
        assertTrue(rejectionLatch.await(5, TimeUnit.SECONDS), "Rejection should be processed");
        assertEquals(1, rejectionMessages.get(), "Should receive rejection result");

        session.close();
    }

    @Test
    @DisplayName("Should handle WebSocket connection errors gracefully")
    void shouldHandleConnectionErrors() throws Exception {
        // Arrange
        CountDownLatch errorLatch = new CountDownLatch(1);
        AtomicInteger errorCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send invalid message to trigger error
                try {
                    ObjectNode invalidMessage = objectMapper.createObjectNode();
                    invalidMessage.put("type", "invalid_type");
                    invalidMessage.put("invalidField", "invalidValue");
                    
                    session.sendMessage(new TextMessage(invalidMessage.toString()));
                } catch (Exception e) {
                    fail("Failed to send invalid message: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                try {
                    JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                    String messageType = jsonMessage.get("type").asText();
                    
                    if ("error".equals(messageType)) {
                        errorCount.incrementAndGet();
                        errorLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Failed to handle error message: " + e.getMessage());
                }
            }

            @Override
            public void handleTransportError(WebSocketSession session, Throwable exception) {
                errorCount.incrementAndGet();
                errorLatch.countDown();
            }
        };

        // Act - Connect and trigger error
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Assert
        assertTrue(errorLatch.await(5, TimeUnit.SECONDS), "Should handle errors gracefully");
        assertTrue(errorCount.get() > 0, "Should have received error response");

        session.close();
    }

    @Test
    @DisplayName("Should handle multiple concurrent WebSocket connections")
    void shouldHandleMultipleConcurrentConnections() throws Exception {
        // Arrange
        int connectionCount = 3;
        CountDownLatch allConnectionsLatch = new CountDownLatch(connectionCount);
        AtomicInteger successfulConnections = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                successfulConnections.incrementAndGet();
                allConnectionsLatch.countDown();
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                // Handle messages normally
            }
        };

        // Act - Create multiple connections
        WebSocketSession[] sessions = new WebSocketSession[connectionCount];
        for (int i = 0; i < connectionCount; i++) {
            sessions[i] = wsClient.doHandshake(handler, 
                "ws://localhost:8080/api/ws/ai-suggestions").get();
        }

        // Assert
        assertTrue(allConnectionsLatch.await(10, TimeUnit.SECONDS), "All connections should be established");
        assertEquals(connectionCount, successfulConnections.get(), "All connections should be successful");

        // Clean up
        for (WebSocketSession session : sessions) {
            session.close();
        }
    }

    @Test
    @DisplayName("Should handle WebSocket reconnection after disconnection")
    void shouldHandleWebSocketReconnection() throws Exception {
        // Arrange
        CountDownLatch reconnectLatch = new CountDownLatch(2);
        AtomicInteger connectionCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                connectionCount.incrementAndGet();
                reconnectLatch.countDown();
                
                // Close connection after first establishment to test reconnection
                if (connectionCount.get() == 1) {
                    try {
                        Thread.sleep(1000);
                        session.close();
                    } catch (Exception e) {
                        fail("Failed to close session: " + e.getMessage());
                    }
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                // Handle messages normally
            }
        };

        // Act - Connect, disconnect, and reconnect
        WebSocketSession session1 = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Wait for first connection to close
        Thread.sleep(2000);

        // Create new connection (simulating reconnection)
        WebSocketSession session2 = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Assert
        assertTrue(reconnectLatch.await(10, TimeUnit.SECONDS), "Should handle reconnection");
        assertEquals(2, connectionCount.get(), "Should establish 2 connections");

        session1.close();
        session2.close();
    }

    @Test
    @DisplayName("Should handle WebSocket message queuing and processing")
    void shouldHandleMessageQueuing() throws Exception {
        // Arrange
        int messageCount = 10;
        CountDownLatch processingLatch = new CountDownLatch(messageCount);
        AtomicInteger processedMessages = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send multiple messages rapidly
                for (int i = 0; i < messageCount; i++) {
                    try {
                        ObjectNode message = objectMapper.createObjectNode();
                        message.put("type", "test_message");
                        message.put("index", i);
                        message.put("timestamp", System.currentTimeMillis());
                        
                        session.sendMessage(new TextMessage(message.toString()));
                        Thread.sleep(50); // Small delay between messages
                    } catch (Exception e) {
                        fail("Failed to send message: " + e.getMessage());
                    }
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                try {
                    JsonNode jsonMessage = objectMapper.readTree(message.getPayload());
                    String messageType = jsonMessage.get("type").asText();
                    
                    if ("test_message".equals(messageType)) {
                        processedMessages.incrementAndGet();
                        processingLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Failed to handle message: " + e.getMessage());
                }
            }
        };

        // Act - Connect and send messages
        long startTime = System.currentTimeMillis();
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8080/api/ws/ai-suggestions").get();

        // Wait for all messages to be processed
        boolean completed = processingLatch.await(10, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;

        // Assert
        assertTrue(completed, "All messages should be processed");
        assertEquals(messageCount, processedMessages.get(), "All messages should be processed");
        assertTrue(processingTime < 5000, "Processing should complete within reasonable time");

        session.close();
    }
} 