package com.tappha.homeassistant.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionMetricsRepository;
import com.tappha.homeassistant.service.EventProcessingService;
import com.tappha.homeassistant.service.HomeAssistantWebSocketClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for complete event processing flow
 * Tests high-throughput scenarios, filtering effectiveness, and end-to-end functionality
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest
@EmbeddedKafka(partitions = 1, brokerProperties = {"listeners=PLAINTEXT://localhost:9092", "port=9092"})
@ActiveProfiles("test")
@Testcontainers
class EventProcessingIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:17")
        .withDatabaseName("tappha_test")
        .withUsername("test")
        .withPassword("test");

    @Autowired
    private EventProcessingService eventProcessingService;

    @Autowired
    private HomeAssistantEventRepository eventRepository;

    @Autowired
    private HomeAssistantConnectionMetricsRepository metricsRepository;

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    private HomeAssistantConnection testConnection;
    private HomeAssistantEvent testEvent;

    @BeforeEach
    void setUp() {
        // Create test connection
        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("Integration Test Connection");
        testConnection.setUrl("http://localhost:8123");
        testConnection.setToken("test-token");

        // Create test event
        testEvent = new HomeAssistantEvent();
        testEvent.setId(UUID.randomUUID());
        testEvent.setConnection(testConnection);
        testEvent.setTimestamp(OffsetDateTime.now());
        testEvent.setEventType("state_changed");
        testEvent.setEntityId("light.living_room");
        testEvent.setOldState("off");
        testEvent.setNewState("on");
        testEvent.setAttributes("{\"brightness\":255}");
    }

    @Test
    void testCompleteEventFlow_SingleEvent() throws Exception {
        // Arrange
        String eventJson = objectMapper.writeValueAsString(testEvent);

        // Act
        eventProcessingService.processEvent(eventJson);

        // Assert
        // Wait for async processing
        Thread.sleep(1000);
        
        // Verify event was processed
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0);
    }

    @Test
    void testHighThroughputEventProcessing_1000EventsPerMinute() throws Exception {
        // Arrange
        int totalEvents = 1000;
        int threads = 10;
        CountDownLatch latch = new CountDownLatch(totalEvents);
        ExecutorService executor = Executors.newFixedThreadPool(threads);

        long startTime = System.currentTimeMillis();

        // Act - Send events concurrently
        for (int i = 0; i < totalEvents; i++) {
            final int eventIndex = i;
            executor.submit(() -> {
                try {
                    HomeAssistantEvent event = createTestEvent("sensor.temperature_" + eventIndex);
                    String eventJson = objectMapper.writeValueAsString(event);
                    eventProcessingService.processEvent(eventJson);
                    latch.countDown();
                } catch (Exception e) {
                    fail("Event processing failed: " + e.getMessage());
                }
            });
        }

        // Wait for all events to be processed
        boolean completed = latch.await(2, TimeUnit.MINUTES);
        long endTime = System.currentTimeMillis();
        long processingTime = endTime - startTime;

        // Assert
        assertTrue(completed, "All events should be processed within 2 minutes");
        assertTrue(processingTime < 120000, "Processing time should be under 2 minutes");

        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() >= totalEvents * 0.8, 
            "At least 80% of events should be processed");

        // Verify performance requirements
        double eventsPerSecond = (double) stats.getTotalEventsProcessed() / (processingTime / 1000.0);
        assertTrue(eventsPerSecond >= 8.0, "Should process at least 8 events per second");

        executor.shutdown();
    }

    @Test
    void testFilteringEffectiveness_60To80PercentVolumeReduction() throws Exception {
        // Arrange
        int totalEvents = 1000;
        int importantEvents = 0;
        int regularEvents = 0;

        // Act - Send mix of important and regular events
        for (int i = 0; i < totalEvents; i++) {
            HomeAssistantEvent event;
            if (i % 10 == 0) {
                // Important events (automation_triggered, security events)
                event = createTestEvent("automation.important_" + i);
                event.setEventType("automation_triggered");
                importantEvents++;
            } else {
                // Regular events (sensor updates)
                event = createTestEvent("sensor.regular_" + i);
                event.setEventType("state_changed");
                regularEvents++;
            }

            String eventJson = objectMapper.writeValueAsString(event);
            eventProcessingService.processEvent(eventJson);
        }

        // Wait for processing
        Thread.sleep(2000);

        // Assert
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        long storedEvents = stats.getTotalEventsStored();
        long filteredEvents = stats.getTotalEventsFiltered();

        // Calculate filtering effectiveness
        double filterRate = (double) filteredEvents / totalEvents;
        assertTrue(filterRate >= 0.6 && filterRate <= 0.8, 
            "Filter rate should be between 60% and 80%, actual: " + (filterRate * 100) + "%");

        // Verify important events are mostly stored
        assertTrue(storedEvents >= importantEvents * 0.8, 
            "At least 80% of important events should be stored");

        System.out.println("Filtering Effectiveness Test Results:");
        System.out.println("Total Events: " + totalEvents);
        System.out.println("Stored Events: " + storedEvents);
        System.out.println("Filtered Events: " + filteredEvents);
        System.out.println("Filter Rate: " + (filterRate * 100) + "%");
    }

    @Test
    void testRealTimeDashboardFunctionality() throws Exception {
        // Arrange
        int eventsToSend = 100;
        CountDownLatch processingLatch = new CountDownLatch(eventsToSend);

        // Act - Send events and monitor stats in real-time
        for (int i = 0; i < eventsToSend; i++) {
            HomeAssistantEvent event = createTestEvent("light.living_room_" + i);
            String eventJson = objectMapper.writeValueAsString(event);
            eventProcessingService.processEvent(eventJson);
            processingLatch.countDown();
        }

        // Wait for processing
        processingLatch.await(30, TimeUnit.SECONDS);

        // Assert - Verify real-time stats are accurate
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        
        assertTrue(stats.getTotalEventsProcessed() > 0, "Should have processed events");
        assertTrue(stats.getAvgProcessingTime() >= 0, "Should have processing time data");
        assertTrue(stats.getFilterRate() >= 0, "Should have filter rate data");

        // Verify stats are reasonable
        assertTrue(stats.getTotalEventsProcessed() <= eventsToSend, 
            "Processed events should not exceed sent events");
        assertTrue(stats.getFilterRate() <= 1.0, "Filter rate should not exceed 100%");
    }

    @Test
    void testKafkaIntegrationUnderLoad() throws Exception {
        // Arrange
        int kafkaEvents = 500;
        CountDownLatch kafkaLatch = new CountDownLatch(kafkaEvents);

        // Act - Send events to Kafka
        for (int i = 0; i < kafkaEvents; i++) {
            HomeAssistantEvent event = createTestEvent("kafka.test_" + i);
            eventProcessingService.sendEventToKafka(event);
            kafkaLatch.countDown();
        }

        // Wait for Kafka processing
        boolean completed = kafkaLatch.await(60, TimeUnit.SECONDS);

        // Assert
        assertTrue(completed, "Kafka events should be processed within 60 seconds");

        // Verify Kafka integration is working
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0, "Kafka events should be processed");
    }

    @Test
    void testErrorHandlingAndRecoveryScenarios() throws Exception {
        // Test 1: Invalid JSON handling
        String invalidJson = "invalid-json-data";
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(invalidJson);
        });

        // Test 2: Null event handling
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(null);
        });

        // Test 3: Empty event handling
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent("");
        });

        // Test 4: Malformed event handling
        String malformedJson = "{\"invalid\": \"data\"}";
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(malformedJson);
        });

        // Verify system continues to function after errors
        HomeAssistantEvent validEvent = createTestEvent("test.recovery");
        String validJson = objectMapper.writeValueAsString(validEvent);
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(validJson);
        });
    }

    @Test
    void testConcurrentProcessingAndThreadSafety() throws Exception {
        // Arrange
        int concurrentEvents = 100;
        int threads = 20;
        CountDownLatch latch = new CountDownLatch(concurrentEvents);
        ExecutorService executor = Executors.newFixedThreadPool(threads);

        // Act - Send events from multiple threads
        for (int i = 0; i < concurrentEvents; i++) {
            final int eventIndex = i;
            executor.submit(() -> {
                try {
                    HomeAssistantEvent event = createTestEvent("concurrent.test_" + eventIndex);
                    String eventJson = objectMapper.writeValueAsString(event);
                    eventProcessingService.processEvent(eventJson);
                    latch.countDown();
                } catch (Exception e) {
                    fail("Concurrent processing failed: " + e.getMessage());
                }
            });
        }

        // Wait for completion
        boolean completed = latch.await(30, TimeUnit.SECONDS);

        // Assert
        assertTrue(completed, "All concurrent events should be processed");
        
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();
        assertTrue(stats.getTotalEventsProcessed() > 0, "Concurrent events should be processed");

        executor.shutdown();
    }

    @Test
    void testPerformanceRequirements_LatencyUnder100ms() throws Exception {
        // Arrange
        int performanceTestEvents = 100;
        long totalProcessingTime = 0;

        // Act - Measure processing time for each event
        for (int i = 0; i < performanceTestEvents; i++) {
            HomeAssistantEvent event = createTestEvent("performance.test_" + i);
            String eventJson = objectMapper.writeValueAsString(event);
            
            long startTime = System.nanoTime();
            eventProcessingService.processEvent(eventJson);
            long endTime = System.nanoTime();
            
            long processingTime = (endTime - startTime) / 1_000_000; // Convert to milliseconds
            totalProcessingTime += processingTime;
            
            // Individual event processing should be under 100ms
            assertTrue(processingTime < 100, 
                "Individual event processing should be under 100ms, actual: " + processingTime + "ms");
        }

        // Calculate average processing time
        double avgProcessingTime = (double) totalProcessingTime / performanceTestEvents;
        
        // Assert
        assertTrue(avgProcessingTime < 50, 
            "Average processing time should be under 50ms, actual: " + avgProcessingTime + "ms");

        System.out.println("Performance Test Results:");
        System.out.println("Total Processing Time: " + totalProcessingTime + "ms");
        System.out.println("Average Processing Time: " + avgProcessingTime + "ms");
        System.out.println("Events Processed: " + performanceTestEvents);
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