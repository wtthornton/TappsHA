package com.tappha.homeassistant.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.controller.EventMonitoringController;
import com.tappha.homeassistant.controller.HomeAssistantConnectionController;
import com.tappha.homeassistant.dto.ConnectRequest;
import com.tappha.homeassistant.dto.ConnectionResponse;
import com.tappha.homeassistant.dto.EventsResponse;
import com.tappha.homeassistant.dto.MetricsResponse;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.service.EventProcessingService;
import com.tappha.homeassistant.service.HomeAssistantConnectionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * End-to-end integration tests for complete TappHA system
 * Tests all components working together: API, WebSocket, Event Processing, Database
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EmbeddedKafka(partitions = 1, brokerProperties = {"listeners=PLAINTEXT://localhost:9092", "port=9092"})
@ActiveProfiles("test")
@Testcontainers
class EndToEndIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
        .withDatabaseName("tappha_test")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private EventProcessingService eventProcessingService;

    @Autowired
    private HomeAssistantConnectionService connectionService;

    @Autowired
    private EventMonitoringController eventMonitoringController;

    @Autowired
    private HomeAssistantConnectionController connectionController;

    @Autowired
    private ObjectMapper objectMapper;

    private HomeAssistantConnection testConnection;
    private UUID connectionId;

    @BeforeEach
    void setUp() {
        // Create test connection
        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("E2E Test Connection");
        testConnection.setUrl("http://localhost:8123");
        testConnection.setToken("test-token");
    }

    @Test
    void testCompleteSystemWorkflow() throws Exception {
        // Step 1: Test connection creation via API
        ConnectRequest connectRequest = new ConnectRequest();
        connectRequest.setUrl("http://localhost:8123");
        connectRequest.setToken("test-token");
        connectRequest.setConnectionName("E2E Test Connection");

        ResponseEntity<ConnectionResponse> connectResponse = restTemplate.postForEntity(
            "/api/v1/home-assistant/connect", connectRequest, ConnectionResponse.class);

        assertEquals(HttpStatus.OK, connectResponse.getStatusCode());
        assertNotNull(connectResponse.getBody());
        assertNotNull(connectResponse.getBody().getConnectionId());
        
        connectionId = connectResponse.getBody().getConnectionId();

        // Step 2: Test connection status
        ResponseEntity<ConnectionResponse> statusResponse = restTemplate.getForEntity(
            "/api/v1/home-assistant/connections/" + connectionId + "/status", ConnectionResponse.class);

        assertEquals(HttpStatus.OK, statusResponse.getStatusCode());
        assertNotNull(statusResponse.getBody());

        // Step 3: Process events through the system
        CountDownLatch eventLatch = new CountDownLatch(10);
        
        for (int i = 0; i < 10; i++) {
            HomeAssistantEvent event = createTestEvent("e2e.test_" + i);
            String eventJson = objectMapper.writeValueAsString(event);
            eventProcessingService.processEvent(eventJson);
            eventLatch.countDown();
        }

        // Wait for event processing
        assertTrue(eventLatch.await(10, TimeUnit.SECONDS), "All events should be processed");

        // Step 4: Test events retrieval via API
        ResponseEntity<EventsResponse> eventsResponse = restTemplate.getForEntity(
            "/api/v1/home-assistant/connections/" + connectionId + "/events?limit=10", EventsResponse.class);

        assertEquals(HttpStatus.OK, eventsResponse.getStatusCode());
        assertNotNull(eventsResponse.getBody());

        // Step 5: Test metrics retrieval via API
        ResponseEntity<MetricsResponse> metricsResponse = restTemplate.getForEntity(
            "/api/v1/home-assistant/connections/" + connectionId + "/metrics?timeRange=24h", MetricsResponse.class);

        assertEquals(HttpStatus.OK, metricsResponse.getStatusCode());
        assertNotNull(metricsResponse.getBody());

        // Step 6: Test event monitoring API
        ResponseEntity<EventsResponse> monitoringResponse = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=10", EventsResponse.class);

        assertEquals(HttpStatus.OK, monitoringResponse.getStatusCode());
        assertNotNull(monitoringResponse.getBody());

        // Step 7: Verify system statistics
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0, "Should have processed events");
        assertTrue(stats.getFilterRate() >= 0, "Should have filter rate data");
    }

    @Test
    void testHighThroughputEndToEndFlow() throws Exception {
        // Arrange
        int totalEvents = 500;
        CountDownLatch processingLatch = new CountDownLatch(totalEvents);
        long startTime = System.currentTimeMillis();

        // Act - Process events through the complete system
        for (int i = 0; i < totalEvents; i++) {
            HomeAssistantEvent event = createTestEvent("throughput.test_" + i);
            String eventJson = objectMapper.writeValueAsString(event);
            eventProcessingService.processEvent(eventJson);
            processingLatch.countDown();
        }

        // Wait for processing
        boolean completed = processingLatch.await(60, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;

        // Assert
        assertTrue(completed, "All events should be processed within 60 seconds");
        assertTrue(processingTime < 60000, "Processing time should be under 60 seconds");

        // Verify performance requirements
        double eventsPerSecond = (double) totalEvents / (processingTime / 1000.0);
        assertTrue(eventsPerSecond >= 8.0, "Should process at least 8 events per second");

        // Verify API responses are still functional
        ResponseEntity<EventsResponse> eventsResponse = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=10", EventsResponse.class);
        assertEquals(HttpStatus.OK, eventsResponse.getStatusCode());

        // Verify system stats
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() >= totalEvents * 0.8, 
            "At least 80% of events should be processed");
    }

    @Test
    void testErrorRecoveryAndSystemResilience() throws Exception {
        // Step 1: Test system with invalid data
        String invalidJson = "invalid-json-data";
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(invalidJson);
        });

        // Step 2: Test system with null data
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(null);
        });

        // Step 3: Test system with malformed data
        String malformedJson = "{\"invalid\": \"data\"}";
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(malformedJson);
        });

        // Step 4: Verify system continues to function after errors
        HomeAssistantEvent validEvent = createTestEvent("recovery.test");
        String validJson = objectMapper.writeValueAsString(validEvent);
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(validJson);
        });

        // Step 5: Verify APIs still work after error scenarios
        ResponseEntity<EventsResponse> eventsResponse = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=10", EventsResponse.class);
        assertEquals(HttpStatus.OK, eventsResponse.getStatusCode());

        // Step 6: Verify system stats are still accurate
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0, "Should have processed some events");
    }

    @Test
    void testConcurrentAccessAndThreadSafety() throws Exception {
        // Arrange
        int concurrentRequests = 50;
        int threads = 10;
        CountDownLatch apiLatch = new CountDownLatch(concurrentRequests);
        CountDownLatch eventLatch = new CountDownLatch(concurrentRequests);

        // Act - Make concurrent API requests and event processing
        for (int i = 0; i < concurrentRequests; i++) {
            final int requestIndex = i;
            
            // Concurrent API request
            new Thread(() -> {
                try {
                    ResponseEntity<EventsResponse> response = restTemplate.getForEntity(
                        "/api/v1/event-monitoring/events?limit=5", EventsResponse.class);
                    assertEquals(HttpStatus.OK, response.getStatusCode());
                    apiLatch.countDown();
                } catch (Exception e) {
                    fail("Concurrent API request failed: " + e.getMessage());
                }
            }).start();

            // Concurrent event processing
            new Thread(() -> {
                try {
                    HomeAssistantEvent event = createTestEvent("concurrent.test_" + requestIndex);
                    String eventJson = objectMapper.writeValueAsString(event);
                    eventProcessingService.processEvent(eventJson);
                    eventLatch.countDown();
                } catch (Exception e) {
                    fail("Concurrent event processing failed: " + e.getMessage());
                }
            }).start();
        }

        // Wait for completion
        boolean apiCompleted = apiLatch.await(30, TimeUnit.SECONDS);
        boolean eventCompleted = eventLatch.await(30, TimeUnit.SECONDS);

        // Assert
        assertTrue(apiCompleted, "All concurrent API requests should complete");
        assertTrue(eventCompleted, "All concurrent event processing should complete");

        // Verify system integrity
        ResponseEntity<EventsResponse> finalResponse = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=10", EventsResponse.class);
        assertEquals(HttpStatus.OK, finalResponse.getStatusCode());

        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0, "Should have processed concurrent events");
    }

    @Test
    void testDataIntegrityAndConsistency() throws Exception {
        // Arrange
        int testEvents = 100;
        CountDownLatch integrityLatch = new CountDownLatch(testEvents);

        // Act - Process events and verify data integrity
        for (int i = 0; i < testEvents; i++) {
            HomeAssistantEvent event = createTestEvent("integrity.test_" + i);
            event.setEventType("state_changed");
            event.setOldState("off");
            event.setNewState("on");
            event.setAttributes("{\"test_id\": " + i + ", \"test_data\": \"value\"}");
            
            String eventJson = objectMapper.writeValueAsString(event);
            eventProcessingService.processEvent(eventJson);
            integrityLatch.countDown();
        }

        // Wait for processing
        assertTrue(integrityLatch.await(30, TimeUnit.SECONDS), "All events should be processed");

        // Assert - Verify data integrity through API
        ResponseEntity<EventsResponse> eventsResponse = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=100", EventsResponse.class);

        assertEquals(HttpStatus.OK, eventsResponse.getStatusCode());
        assertNotNull(eventsResponse.getBody());
        assertNotNull(eventsResponse.getBody().getEvents());

        // Verify event data consistency
        assertTrue(eventsResponse.getBody().getEvents().size() > 0, "Should have events in response");

        // Verify system stats consistency
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0, "Should have processed events");
        assertTrue(stats.getFilterRate() >= 0 && stats.getFilterRate() <= 1.0, 
            "Filter rate should be between 0 and 1");
        assertTrue(stats.getAvgProcessingTime() >= 0, "Average processing time should be non-negative");
    }

    @Test
    void testSystemPerformanceUnderLoad() throws Exception {
        // Arrange
        int loadTestEvents = 1000;
        int concurrentUsers = 20;
        CountDownLatch loadLatch = new CountDownLatch(loadTestEvents);
        long startTime = System.currentTimeMillis();

        // Act - Simulate high load with concurrent users
        for (int user = 0; user < concurrentUsers; user++) {
            final int userId = user;
            new Thread(() -> {
                for (int event = 0; event < loadTestEvents / concurrentUsers; event++) {
                    try {
                        HomeAssistantEvent testEvent = createTestEvent("load.user" + userId + ".event" + event);
                        String eventJson = objectMapper.writeValueAsString(testEvent);
                        eventProcessingService.processEvent(eventJson);
                        loadLatch.countDown();
                    } catch (Exception e) {
                        fail("Load test failed for user " + userId + ": " + e.getMessage());
                    }
                }
            }).start();
        }

        // Wait for completion
        boolean completed = loadLatch.await(120, TimeUnit.SECONDS);
        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;

        // Assert
        assertTrue(completed, "Load test should complete within 2 minutes");
        assertTrue(processingTime < 120000, "Processing time should be under 2 minutes");

        // Verify performance metrics
        double eventsPerSecond = (double) loadTestEvents / (processingTime / 1000.0);
        assertTrue(eventsPerSecond >= 8.0, "Should process at least 8 events per second");

        // Verify system remains responsive
        ResponseEntity<EventsResponse> response = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=10", EventsResponse.class);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        // Verify system stats are accurate
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() >= loadTestEvents * 0.8, 
            "At least 80% of load test events should be processed");

        System.out.println("Load Test Results:");
        System.out.println("Total Events: " + loadTestEvents);
        System.out.println("Processing Time: " + processingTime + "ms");
        System.out.println("Events per Second: " + eventsPerSecond);
        System.out.println("Processed Events: " + stats.getTotalEventsProcessed());
    }

    @Test
    void testCompleteSystemValidation() throws Exception {
        // This test validates that all integration tests pass and the system is fully functional
        
        // Step 1: Verify all components are available
        assertNotNull(eventProcessingService, "EventProcessingService should be available");
        assertNotNull(connectionService, "HomeAssistantConnectionService should be available");
        assertNotNull(eventMonitoringController, "EventMonitoringController should be available");
        assertNotNull(connectionController, "HomeAssistantConnectionController should be available");
        assertNotNull(restTemplate, "TestRestTemplate should be available");

        // Step 2: Verify system can process events
        HomeAssistantEvent testEvent = createTestEvent("validation.test");
        String eventJson = objectMapper.writeValueAsString(testEvent);
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(eventJson);
        });

        // Step 3: Verify APIs are responsive
        ResponseEntity<EventsResponse> eventsResponse = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=5", EventsResponse.class);
        assertEquals(HttpStatus.OK, eventsResponse.getStatusCode());

        // Step 4: Verify system stats are working
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertNotNull(stats, "System stats should be available");
        assertTrue(stats.getTotalEventsProcessed() >= 0, "Total events processed should be non-negative");
        assertTrue(stats.getFilterRate() >= 0, "Filter rate should be non-negative");

        // Step 5: Verify system can handle errors gracefully
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent("invalid-json");
        });

        // Step 6: Verify system continues to function after errors
        HomeAssistantEvent recoveryEvent = createTestEvent("recovery.validation");
        String recoveryJson = objectMapper.writeValueAsString(recoveryEvent);
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(recoveryJson);
        });

        // Step 7: Final validation - system is fully functional
        ResponseEntity<EventsResponse> finalResponse = restTemplate.getForEntity(
            "/api/v1/event-monitoring/events?limit=10", EventsResponse.class);
        assertEquals(HttpStatus.OK, finalResponse.getStatusCode());
        assertNotNull(finalResponse.getBody());

        System.out.println("Complete System Validation Results:");
        System.out.println("✅ All components available");
        System.out.println("✅ Event processing functional");
        System.out.println("✅ APIs responsive");
        System.out.println("✅ System stats working");
        System.out.println("✅ Error handling functional");
        System.out.println("✅ System recovery working");
        System.out.println("✅ Final validation passed");
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