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
import org.springframework.kafka.support.SendResult;
import org.springframework.util.concurrent.ListenableFuture;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import com.fasterxml.jackson.core.JsonProcessingException;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.doReturn;

/**
 * Unit tests for EventProcessingService
 * Tests event processing, filtering, and Kafka integration
 */
@ExtendWith(MockitoExtension.class)
class EventProcessingServiceTest {

    @Mock
    private ObjectMapper objectMapper;

    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @Mock
    private HomeAssistantEventRepository eventRepository;

    @Mock
    private HomeAssistantConnectionMetricsRepository metricsRepository;

    @Mock
    private CompletableFuture<SendResult<String, String>> sendResultFuture;

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
    void testSendEventToKafka_Success() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"state_changed\"}";
        testEvent.setEventType("state_changed");
        
        when(objectMapper.writeValueAsString(testEvent)).thenReturn(eventJson);
        when(kafkaTemplate.send(anyString(), anyString(), eq(eventJson))).thenReturn(sendResultFuture);
        when(sendResultFuture.get()).thenReturn(mock(SendResult.class));

        // Act
        eventProcessingService.sendEventToKafka(testEvent);

        // Assert
        verify(kafkaTemplate).send("homeassistant-events", "state_changed", eventJson);
        verify(sendResultFuture).get();
    }

    @Test
    void testSendEventToKafka_Failure_FallbackToDirectStorage() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"state_changed\"}";
        testEvent.setEventType("state_changed");
        
        when(objectMapper.writeValueAsString(testEvent)).thenReturn(eventJson);
        when(kafkaTemplate.send(anyString(), anyString(), eq(eventJson))).thenReturn(sendResultFuture);
        when(sendResultFuture.get()).thenThrow(new RuntimeException("Kafka send failed"));

        // Act
        eventProcessingService.sendEventToKafka(testEvent);

        // Assert - Should fallback to direct storage
        verify(kafkaTemplate).send("homeassistant-events", "state_changed", eventJson);
        verify(eventRepository).save(testEvent);
    }

    @Test
    void testSendEventToKafka_Exception_FallbackToDirectStorage() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"state_changed\"}";
        testEvent.setEventType("state_changed");
        
        when(objectMapper.writeValueAsString(testEvent)).thenReturn(eventJson);
        when(kafkaTemplate.send(anyString(), anyString(), eq(eventJson))).thenThrow(new RuntimeException("Kafka exception"));

        // Act
        eventProcessingService.sendEventToKafka(testEvent);

        // Assert - Should fallback to direct storage
        verify(kafkaTemplate).send("homeassistant-events", "state_changed", eventJson);
        verify(eventRepository).save(testEvent);
    }

    @Test
    void testProcessEvent_ImportantEventType_ShouldStore() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"automation_triggered\"}";
        testEvent.setEventType("automation_triggered");
        
        doReturn(mock(com.fasterxml.jackson.databind.JsonNode.class)).when(objectMapper).readTree(eventJson);
        doReturn(testEvent).when(objectMapper).treeToValue(any(), eq(HomeAssistantEvent.class));

        // Act
        eventProcessingService.processEvent(eventJson);

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
        eventProcessingService.processEvent(eventJson);

        // Assert
        verify(eventRepository).save(testEvent);
        verify(metricsRepository).save(any());
    }

    @Test
    void testProcessEvent_HighFrequencyEvent_ShouldFilter() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"state_changed\"}";
        testEvent.setEventType("state_changed");
        testEvent.setEntityId("sensor.temperature");
        
        when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
        when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);

        // Act - Send the same event type multiple times to trigger frequency filtering
        for (int i = 0; i < 15; i++) {
            eventProcessingService.processEvent(eventJson);
        }

        // Assert - Should be filtered out after high frequency threshold
        verify(eventRepository, atMost(10)).save(any()); // Some events should be filtered
    }

    @Test
    void testProcessEvent_SignificantStateChange_ShouldStore() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"oldState\":\"off\",\"newState\":\"on\"}";
        testEvent.setEventType("state_changed");
        testEvent.setEntityId("switch.garage");
        testEvent.setOldState("off");
        testEvent.setNewState("on");
        
        when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
        when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);

        // Act
        eventProcessingService.processEvent(eventJson);

        // Assert
        verify(eventRepository).save(testEvent);
        verify(metricsRepository).save(any());
    }

    @Test
    void testProcessEvent_RegularEvent_MayBeFiltered() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"state_changed\"}";
        testEvent.setEventType("state_changed");
        testEvent.setEntityId("sensor.humidity");
        
        try {
            when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
            when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            // Mock setup exception
        }

        // Act
        eventProcessingService.processEvent(eventJson);

        // Assert - May be filtered based on random sampling
        // We can't predict the exact outcome due to random sampling, but we can verify the method doesn't throw
        verifyNoInteractions(eventRepository);
    }

    @Test
    void testGetProcessingStats() {
        // Arrange - Process some events first
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"automation_triggered\"}";
        testEvent.setEventType("automation_triggered");
        
        try {
            when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
            when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            // Mock setup exception
        }

        // Act
        eventProcessingService.processEvent(eventJson);
        EventProcessingService.EventProcessingStats stats = eventProcessingService.getProcessingStats();

        // Assert
        assertNotNull(stats);
        assertEquals(1, stats.getTotalEventsProcessed());
        assertTrue(stats.getTotalEventsStored() >= 0);
        assertTrue(stats.getFilterRate() >= 0);
        assertTrue(stats.getAvgProcessingTime() >= 0);
    }

    @Test
    void testResetStats() {
        // Arrange - Process some events first
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\",\"eventType\":\"automation_triggered\"}";
        testEvent.setEventType("automation_triggered");
        
        try {
            when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
            when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            // Mock setup exception
        }

        eventProcessingService.processEvent(eventJson);
        
        // Verify stats are not zero
        EventProcessingService.EventProcessingStats statsBefore = eventProcessingService.getProcessingStats();
        assertTrue(statsBefore.getTotalEventsProcessed() > 0);

        // Act
        eventProcessingService.resetStats();
        EventProcessingService.EventProcessingStats statsAfter = eventProcessingService.getProcessingStats();

        // Assert
        assertEquals(0, statsAfter.getTotalEventsProcessed());
        assertEquals(0, statsAfter.getTotalEventsFiltered());
        assertEquals(0, statsAfter.getTotalEventsStored());
        assertEquals(0, statsAfter.getFilterRate());
    }

    @Test
    void testProcessEvent_ExceptionHandling() throws Exception {
        // Arrange
        String eventJson = "invalid-json";
        when(objectMapper.readTree(eventJson)).thenThrow(new RuntimeException("JSON parsing error"));

        // Act & Assert - Should not throw exception
        assertDoesNotThrow(() -> {
            eventProcessingService.processEvent(eventJson);
        });

        // Verify no interactions with repositories
        verifyNoInteractions(eventRepository);
        verifyNoInteractions(metricsRepository);
    }

    @Test
    void testProcessEvent_NullEvent_ShouldFilter() throws Exception {
        // Arrange
        String eventJson = "{\"id\":\"" + testEvent.getId() + "\"}";
        testEvent.setEventType(null); // Null event type
        
        try {
            when(objectMapper.readTree(eventJson)).thenReturn(mock(com.fasterxml.jackson.databind.JsonNode.class));
            when(objectMapper.treeToValue(any(), eq(HomeAssistantEvent.class))).thenReturn(testEvent);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            // Mock setup exception
        }

        // Act
        eventProcessingService.processEvent(eventJson);

        // Assert - Should be filtered out
        verifyNoInteractions(eventRepository);
        verifyNoInteractions(metricsRepository);
    }
} 