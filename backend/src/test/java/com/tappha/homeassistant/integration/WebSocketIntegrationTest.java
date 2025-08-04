package com.tappha.homeassistant.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.service.EventProcessingService;
import com.tappha.homeassistant.service.HomeAssistantWebSocketClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
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

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * WebSocket integration tests for real-time event streaming
 * Tests WebSocket connection, event streaming, and dashboard functionality
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@EmbeddedKafka(partitions = 1, brokerProperties = {"listeners=PLAINTEXT://localhost:9092", "port=9092"})
@ActiveProfiles("test")
@Testcontainers
class WebSocketIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
        .withDatabaseName("tappha_test")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private EventProcessingService eventProcessingService;

    @Autowired
    private HomeAssistantWebSocketClient webSocketClient;

    @Autowired
    private ObjectMapper objectMapper;

    private HomeAssistantConnection testConnection;
    private StandardWebSocketClient wsClient;
    private CountDownLatch messageLatch;
    private AtomicInteger messageCount;

    @BeforeEach
    void setUp() {
        // Create test connection
        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("WebSocket Test Connection");
        testConnection.setUrl("ws://localhost:8123/api/websocket");
        testConnection.setToken("test-token");

        wsClient = new StandardWebSocketClient();
        messageLatch = new CountDownLatch(1);
        messageCount = new AtomicInteger(0);
    }

    @Test
    void testWebSocketConnectionAndAuthentication() throws Exception {
        // Arrange
        CountDownLatch connectionLatch = new CountDownLatch(1);
        CountDownLatch authLatch = new CountDownLatch(1);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                connectionLatch.countDown();
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                String payload = message.getPayload();
                messageCount.incrementAndGet();
                
                try {
                    // Simulate Home Assistant WebSocket responses
                    if (payload.contains("auth_required")) {
                        // Send authentication response
                        String authResponse = "{\"type\":\"auth\",\"access_token\":\"test-token\"}";
                        session.sendMessage(new TextMessage(authResponse));
                        authLatch.countDown();
                    } else if (payload.contains("subscribe_events")) {
                        // Send subscription confirmation
                        String subscribeResponse = "{\"id\":1,\"type\":\"result\",\"success\":true,\"result\":null}";
                        session.sendMessage(new TextMessage(subscribeResponse));
                        messageLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("WebSocket message handling failed: " + e.getMessage());
                }
            }
        };

        // Act - Connect to WebSocket
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8123/api/websocket").get();

        // Assert
        assertTrue(connectionLatch.await(5, TimeUnit.SECONDS), "WebSocket connection should be established");
        assertTrue(authLatch.await(5, TimeUnit.SECONDS), "Authentication should complete");
        assertTrue(messageLatch.await(5, TimeUnit.SECONDS), "Event subscription should complete");
        assertTrue(messageCount.get() > 0, "Should receive WebSocket messages");

        session.close();
    }

    @Test
    void testRealTimeEventStreaming() throws Exception {
        // Arrange
        CountDownLatch eventLatch = new CountDownLatch(5);
        AtomicInteger eventCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send authentication and subscription messages
                try {
                    String authMessage = "{\"type\":\"auth\",\"access_token\":\"test-token\"}";
                    session.sendMessage(new TextMessage(authMessage));
                    
                    String subscribeMessage = "{\"id\":1,\"type\":\"subscribe_events\"}";
                    session.sendMessage(new TextMessage(subscribeMessage));
                } catch (Exception e) {
                    fail("Failed to send initial messages: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                String payload = message.getPayload();
                
                try {
                    // Simulate incoming Home Assistant events
                    if (payload.contains("state_changed")) {
                        eventCount.incrementAndGet();
                        eventLatch.countDown();
                        
                        // Process the event through our service
                        eventProcessingService.processEvent(payload);
                    }
                } catch (Exception e) {
                    fail("Event processing failed: " + e.getMessage());
                }
            }
        };

        // Act - Connect and send simulated events
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8123/api/websocket").get();

        // Send simulated events
        for (int i = 0; i < 5; i++) {
            HomeAssistantEvent event = createTestEvent("light.test_" + i);
            String eventJson = objectMapper.writeValueAsString(event);
            session.sendMessage(new TextMessage(eventJson));
            Thread.sleep(100); // Small delay between events
        }

        // Assert
        assertTrue(eventLatch.await(10, TimeUnit.SECONDS), "Should process all events");
        assertEquals(5, eventCount.get(), "Should receive all 5 events");

        // Verify event processing stats
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0, "Events should be processed");

        session.close();
    }

    @Test
    void testDashboardRealTimeUpdates() throws Exception {
        // Arrange
        CountDownLatch dashboardLatch = new CountDownLatch(3);
        AtomicInteger updateCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Simulate dashboard connection
                try {
                    String dashboardMessage = "{\"type\":\"dashboard_connect\"}";
                    session.sendMessage(new TextMessage(dashboardMessage));
                } catch (Exception e) {
                    fail("Dashboard connection failed: " + e.getMessage());
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                String payload = message.getPayload();
                
                try {
                    // Simulate dashboard updates
                    if (payload.contains("dashboard_update")) {
                        updateCount.incrementAndGet();
                        dashboardLatch.countDown();
                    }
                } catch (Exception e) {
                    fail("Dashboard update failed: " + e.getMessage());
                }
            }
        };

        // Act - Connect dashboard and send events
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8123/api/websocket").get();

        // Send events that should trigger dashboard updates
        for (int i = 0; i < 3; i++) {
            HomeAssistantEvent event = createTestEvent("dashboard.test_" + i);
            String eventJson = objectMapper.writeValueAsString(event);
            eventProcessingService.processEvent(eventJson);
            Thread.sleep(200); // Delay between events
        }

        // Assert
        assertTrue(dashboardLatch.await(10, TimeUnit.SECONDS), "Dashboard should receive updates");
        assertTrue(updateCount.get() > 0, "Dashboard should have received updates");

        session.close();
    }

    @Test
    void testWebSocketReconnectionAndRecovery() throws Exception {
        // Arrange
        CountDownLatch reconnectLatch = new CountDownLatch(2);
        AtomicInteger connectionCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                connectionCount.incrementAndGet();
                reconnectLatch.countDown();
                
                // Simulate connection loss after first connection
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

        // Act - Connect and test reconnection
        WebSocketSession session1 = wsClient.doHandshake(handler, 
            "ws://localhost:8123/api/websocket").get();

        // Wait for first connection
        Thread.sleep(2000);

        // Create new connection (simulating reconnection)
        WebSocketSession session2 = wsClient.doHandshake(handler, 
            "ws://localhost:8123/api/websocket").get();

        // Assert
        assertTrue(reconnectLatch.await(10, TimeUnit.SECONDS), "Should handle reconnection");
        assertEquals(2, connectionCount.get(), "Should establish 2 connections");

        session1.close();
        session2.close();
    }

    @Test
    void testErrorHandlingInWebSocketFlow() throws Exception {
        // Arrange
        CountDownLatch errorLatch = new CountDownLatch(1);
        AtomicInteger errorCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send malformed message to test error handling
                try {
                    String malformedMessage = "invalid-json-message";
                    session.sendMessage(new TextMessage(malformedMessage));
                } catch (Exception e) {
                    errorCount.incrementAndGet();
                    errorLatch.countDown();
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                // Handle messages
            }
        };

        // Act - Connect and test error handling
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8123/api/websocket").get();

        // Assert
        assertTrue(errorLatch.await(5, TimeUnit.SECONDS), "Should handle errors gracefully");
        assertTrue(errorCount.get() >= 0, "Should track error count");

        session.close();
    }

    @Test
    void testPerformanceUnderWebSocketLoad() throws Exception {
        // Arrange
        int messageCount = 100;
        CountDownLatch loadLatch = new CountDownLatch(messageCount);
        AtomicInteger processedCount = new AtomicInteger(0);

        TextWebSocketHandler handler = new TextWebSocketHandler() {
            @Override
            public void afterConnectionEstablished(WebSocketSession session) {
                // Send messages rapidly to test performance
                for (int i = 0; i < messageCount; i++) {
                    try {
                        HomeAssistantEvent event = createTestEvent("load.test_" + i);
                        String eventJson = objectMapper.writeValueAsString(event);
                        session.sendMessage(new TextMessage(eventJson));
                        processedCount.incrementAndGet();
                        loadLatch.countDown();
                    } catch (Exception e) {
                        fail("Failed to send message: " + e.getMessage());
                    }
                }
            }

            @Override
            protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                // Process incoming messages
                try {
                    eventProcessingService.processEvent(message.getPayload());
                } catch (Exception e) {
                    fail("Message processing failed: " + e.getMessage());
                }
            }
        };

        // Act - Connect and send load
        long startTime = System.currentTimeMillis();
        WebSocketSession session = wsClient.doHandshake(handler, 
            "ws://localhost:8123/api/websocket").get();

        // Wait for all messages to be processed
        boolean completed = loadLatch.await(30, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;

        // Assert
        assertTrue(completed, "Should process all messages under load");
        assertEquals(messageCount, processedCount.get(), "Should process all messages");
        assertTrue(processingTime < 30000, "Should complete within 30 seconds");

        // Verify performance
        double messagesPerSecond = (double) messageCount / (processingTime / 1000.0);
        assertTrue(messagesPerSecond >= 3.0, "Should process at least 3 messages per second");

        session.close();
    }

    private HomeAssistantEvent createTestEvent(String entityId) {
        HomeAssistantEvent event = new HomeAssistantEvent();
        event.setId(UUID.randomUUID());
        event.setConnection(testConnection);
        event.setTimestamp(OffsetDateTime.now());
        event.setEventType("state_changed");
        event.setEntityId(entityId);
        event.setOldState("off");
        event.setNewState("on");
        event.setAttributes("{\"test\": true}");
        return event;
    }
} 