package com.tappha.homeassistant.service;

import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.HomeAssistantConnectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Pattern Analysis Service Test
 * 
 * Tests for the pattern analysis service including time-series analysis
 * and pattern recognition algorithms.
 */
@ExtendWith(MockitoExtension.class)
class PatternAnalysisServiceTest {

    @Mock
    private HomeAssistantEventRepository eventRepository;

    @Mock
    private HomeAssistantConnectionRepository connectionRepository;

    private PatternAnalysisService patternAnalysisService;

    @BeforeEach
    void setUp() {
        patternAnalysisService = new PatternAnalysisService(eventRepository, connectionRepository);
    }

    @Test
    void testAnalyzePatterns_Success() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        HomeAssistantConnection connection = new HomeAssistantConnection();
        connection.setId(connectionId);
        
        List<HomeAssistantEvent> events = createSampleEvents();
        
        when(connectionRepository.findById(connectionId)).thenReturn(Optional.of(connection));
        when(eventRepository.findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class)))
            .thenReturn(events);
        
        // Act
        Map<String, Object> result = patternAnalysisService.analyzePatterns(connectionId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("1_day"));
        assertTrue(result.containsKey("1_week"));
        assertTrue(result.containsKey("1_month"));
        assertTrue(result.containsKey("6_months"));
        assertTrue(result.containsKey("1_year"));
        assertTrue(result.containsKey("overall_confidence"));
        assertTrue(result.containsKey("cross_interval_analysis"));
        
        // Verify confidence is between 0 and 1
        double confidence = (Double) result.get("overall_confidence");
        assertTrue(confidence >= 0.0 && confidence <= 1.0);
        
        verify(connectionRepository).findById(connectionId);
        verify(eventRepository, times(5)).findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    @Test
    void testAnalyzePatterns_ConnectionNotFound() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        when(connectionRepository.findById(connectionId)).thenReturn(Optional.empty());
        
        // Act
        Map<String, Object> result = patternAnalysisService.analyzePatterns(connectionId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertEquals(0.0, result.get("overall_confidence"));
        
        verify(connectionRepository).findById(connectionId);
        verify(eventRepository, never()).findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    @Test
    void testAnalyzePatterns_NoEvents() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        HomeAssistantConnection connection = new HomeAssistantConnection();
        connection.setId(connectionId);
        
        when(connectionRepository.findById(connectionId)).thenReturn(Optional.of(connection));
        when(eventRepository.findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class)))
            .thenReturn(new ArrayList<>());
        
        // Act
        Map<String, Object> result = patternAnalysisService.analyzePatterns(connectionId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("1_day"));
        
        Map<String, Object> dayAnalysis = (Map<String, Object>) result.get("1_day");
        assertEquals(0, dayAnalysis.get("total_events"));
        assertEquals(0.0, dayAnalysis.get("confidence"));
        
        verify(connectionRepository).findById(connectionId);
        verify(eventRepository, times(5)).findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    @Test
    void testAnalyzePatterns_Exception() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        when(connectionRepository.findById(connectionId))
            .thenThrow(new RuntimeException("Database error"));
        
        // Act
        Map<String, Object> result = patternAnalysisService.analyzePatterns(connectionId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.containsKey("error"));
        assertEquals(0.0, result.get("overall_confidence"));
        
        verify(connectionRepository).findById(connectionId);
    }

    @Test
    void testGetRealTimeAlerts_Success() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        List<HomeAssistantEvent> events = createSampleEvents();
        
        when(eventRepository.findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class)))
            .thenReturn(events);
        
        // Act
        List<Map<String, Object>> alerts = patternAnalysisService.getRealTimeAlerts(connectionId);
        
        // Assert
        assertNotNull(alerts);
        // Alerts may be empty if no anomalies detected
        assertTrue(alerts.isEmpty() || alerts.stream().allMatch(alert -> 
            alert.containsKey("type") && alert.containsKey("severity") && alert.containsKey("message")));
        
        verify(eventRepository).findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    @Test
    void testGetRealTimeAlerts_NoEvents() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        when(eventRepository.findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class)))
            .thenReturn(new ArrayList<>());
        
        // Act
        List<Map<String, Object>> alerts = patternAnalysisService.getRealTimeAlerts(connectionId);
        
        // Assert
        assertNotNull(alerts);
        assertTrue(alerts.isEmpty());
        
        verify(eventRepository).findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    @Test
    void testGetRealTimeAlerts_Exception() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        when(eventRepository.findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class)))
            .thenThrow(new RuntimeException("Database error"));
        
        // Act
        List<Map<String, Object>> alerts = patternAnalysisService.getRealTimeAlerts(connectionId);
        
        // Assert
        assertNotNull(alerts);
        assertTrue(alerts.isEmpty());
        
        verify(eventRepository).findByConnectionIdAndTimestampBetween(any(UUID.class), any(OffsetDateTime.class), any(OffsetDateTime.class));
    }

    /**
     * Create sample events for testing
     */
    private List<HomeAssistantEvent> createSampleEvents() {
        List<HomeAssistantEvent> events = new ArrayList<>();
        Instant baseTime = Instant.now().minusSeconds(3600); // 1 hour ago
        
        // Create events for different hours to simulate daily patterns
        for (int i = 0; i < 24; i++) {
            HomeAssistantEvent event = new HomeAssistantEvent();
            event.setId(UUID.randomUUID());
            event.setEntityId("light.living_room");
            event.setEventType("state_changed");
            event.setOldState("off");
            event.setNewState("on");
            event.setTimestamp(OffsetDateTime.ofInstant(baseTime.plusSeconds(i * 3600), java.time.ZoneOffset.UTC));
            events.add(event);
        }
        
        // Add some events for different entities
        for (int i = 0; i < 10; i++) {
            HomeAssistantEvent event = new HomeAssistantEvent();
            event.setId(UUID.randomUUID());
            event.setEntityId("switch.kitchen");
            event.setEventType("state_changed");
            event.setOldState("off");
            event.setNewState("on");
            event.setTimestamp(OffsetDateTime.ofInstant(baseTime.plusSeconds(i * 7200), java.time.ZoneOffset.UTC));
            events.add(event);
        }
        
        return events;
    }
} 