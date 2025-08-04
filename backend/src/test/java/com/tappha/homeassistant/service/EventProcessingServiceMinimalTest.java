package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionMetricsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Minimal unit tests for EventProcessingService
 * Tests core functionality without complex dependencies
 */
@ExtendWith(MockitoExtension.class)
class EventProcessingServiceMinimalTest {

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    private HomeAssistantEventRepository eventRepository;

    @Mock
    private HomeAssistantConnectionMetricsRepository metricsRepository;

    private EventProcessingService eventProcessingService;

    private HomeAssistantConnection testConnection;
    private HomeAssistantEvent testEvent;

    @BeforeEach
    void setUp() {
        eventProcessingService = new EventProcessingService(
            objectMapper, kafkaTemplate, eventRepository, metricsRepository
        );

        // Create test connection
        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("Test Connection");
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
    void testGetProcessingStats_InitialState() {
        // Act
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();

        // Assert
        assertNotNull(stats);
        assertEquals(0, stats.getTotalEventsProcessed());
        assertEquals(0, stats.getTotalEventsFiltered());
        assertEquals(0, stats.getTotalEventsStored());
        assertEquals(0.0, stats.getFilterRate());
        assertEquals(0.0, stats.getAvgProcessingTime());
    }

    @Test
    void testResetStats() {
        // Act
        eventProcessingService.resetStats();
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();

        // Assert
        assertNotNull(stats);
        assertEquals(0, stats.getTotalEventsProcessed());
        assertEquals(0, stats.getTotalEventsFiltered());
        assertEquals(0, stats.getTotalEventsStored());
        assertEquals(0.0, stats.getFilterRate());
        assertEquals(0.0, stats.getAvgProcessingTime());
    }

    @Test
    void testSendEventToKafka_Success() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"state_changed\"}";
        when(objectMapper.writeValueAsString(testEvent)).thenReturn(eventJson);
        when(kafkaTemplate.send(anyString(), anyString(), anyString())).thenReturn(null);

        // Act
        eventProcessingService.sendEventToKafka(testEvent);

        // Assert
        verify(kafkaTemplate).send("homeassistant-events", "state_changed", eventJson);
        verify(objectMapper).writeValueAsString(testEvent);
    }

    @Test
    void testSendEventToKafka_Exception_FallbackToDirectStorage() throws Exception {
        // Arrange
        when(objectMapper.writeValueAsString(testEvent)).thenThrow(new RuntimeException("JSON serialization error"));

        // Act
        eventProcessingService.sendEventToKafka(testEvent);

        // Assert
        verify(eventRepository).save(testEvent);
        verify(kafkaTemplate, never()).send(anyString(), anyString(), anyString());
    }

    @Test
    void testProcessEvent_ImportantEventType_ShouldStore() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"automation_triggered\"}";
        testEvent.setEventType("automation_triggered");
        
        when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
        when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);

        // Act
        eventProcessingService.processEvent(eventJson, "homeassistant-events", 0L);

        // Assert
        verify(eventRepository).save(testEvent);
        verify(metricsRepository).save(any());
    }

    @Test
    void testProcessEvent_ImportantEntity_ShouldStore() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"entityId\":\"binary_sensor.motion\"}";
        testEvent.setEntityId("binary_sensor.motion");
        testEvent.setEventType("state_changed");
        
        when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
        when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);

        // Act
        eventProcessingService.processEvent(eventJson, "homeassistant-events", 0L);

        // Assert
        verify(eventRepository).save(testEvent);
        verify(metricsRepository).save(any());
    }

    @Test
    void testProcessEvent_NullEvent_ShouldFilter() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\"}";
        testEvent.setEventType(null); // Null event type
        
        when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
        when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);

        // Act
        eventProcessingService.processEvent(eventJson, "homeassistant-events", 0L);

        // Assert - Should be filtered out
        verifyNoInteractions(eventRepository);
        verifyNoInteractions(metricsRepository);
    }

    @Test
    void testProcessEvent_ExceptionHandling() throws Exception {
        // Arrange
        String eventJson = "invalid-json";
        when(objectMapper.readTree(eventJson)).thenThrow(new RuntimeException("JSON parsing error"));

        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(eventJson, "homeassistant-events", 0L);
        });

        // Verify no interactions with repositories
        verifyNoInteractions(eventRepository);
        verifyNoInteractions(metricsRepository);
    }
} 