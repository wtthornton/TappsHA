package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.service.AIService;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * AI Suggestion Controller Test
 * 
 * Tests for the AI suggestion controller including request handling and responses.
 */
@ExtendWith(MockitoExtension.class)
class AISuggestionControllerTest {

    @Mock
    private AIService aiService;

    @Mock
    private HomeAssistantEventRepository eventRepository;

    private AISuggestionController controller;

    @BeforeEach
    void setUp() {
        controller = new AISuggestionController(aiService, eventRepository);
    }

    @Test
    void testGenerateSuggestion_Success() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        String userContext = "Test context";
        int eventLimit = 100;

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("test@example.com");

        HomeAssistantConnection connection = new HomeAssistantConnection();
        connection.setId(connectionId);
        connection.setName("Test Connection");
        connection.setUser(user);

        HomeAssistantEvent event = new HomeAssistantEvent();
        event.setId(UUID.randomUUID());
        event.setConnection(connection);
        event.setEventType("state_changed");
        event.setEntityId("light.living_room");
        event.setNewState("on");
        event.setTimestamp(OffsetDateTime.now());

        List<HomeAssistantEvent> events = List.of(event);

        AISuggestion expectedSuggestion = AISuggestion.builder()
                .suggestion("Turn on the living room lights when motion is detected")
                .confidence(0.8)
                .context("Test context")
                .timestamp(System.currentTimeMillis())
                .build();

        when(eventRepository.findRecentEventsByConnectionId(connectionId, eventLimit))
                .thenReturn(events);
        when(aiService.generateSuggestion(events, userContext))
                .thenReturn(expectedSuggestion);
        when(aiService.validateSuggestion(expectedSuggestion))
                .thenReturn(true);

        // Act
        ResponseEntity<AISuggestion> response = controller.generateSuggestion(
                connectionId, userContext, eventLimit);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(expectedSuggestion.getSuggestion(), response.getBody().getSuggestion());
        assertEquals(expectedSuggestion.getConfidence(), response.getBody().getConfidence());
    }

    @Test
    void testGenerateSuggestion_NoEvents() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        String userContext = "Test context";
        int eventLimit = 100;

        when(eventRepository.findRecentEventsByConnectionId(connectionId, eventLimit))
                .thenReturn(List.of());

        // Act
        ResponseEntity<AISuggestion> response = controller.generateSuggestion(
                connectionId, userContext, eventLimit);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getSuggestion().contains("No recent events"));
        assertEquals(0.0, response.getBody().getConfidence());
    }

    @Test
    void testGenerateSuggestion_ValidationFailed() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        String userContext = "Test context";
        int eventLimit = 100;

        User user = new User();
        user.setId(UUID.randomUUID());

        HomeAssistantConnection connection = new HomeAssistantConnection();
        connection.setId(connectionId);
        connection.setUser(user);

        HomeAssistantEvent event = new HomeAssistantEvent();
        event.setId(UUID.randomUUID());
        event.setConnection(connection);
        event.setEventType("state_changed");
        event.setEntityId("light.living_room");
        event.setNewState("on");

        List<HomeAssistantEvent> events = List.of(event);

        AISuggestion suggestion = AISuggestion.builder()
                .suggestion("Test suggestion")
                .confidence(0.8)
                .context("Test context")
                .timestamp(System.currentTimeMillis())
                .build();

        when(eventRepository.findRecentEventsByConnectionId(connectionId, eventLimit))
                .thenReturn(events);
        when(aiService.generateSuggestion(events, userContext))
                .thenReturn(suggestion);
        when(aiService.validateSuggestion(suggestion))
                .thenReturn(false);

        // Act
        ResponseEntity<AISuggestion> response = controller.generateSuggestion(
                connectionId, userContext, eventLimit);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getSuggestion().contains("Unable to generate safe suggestion"));
        assertEquals(0.0, response.getBody().getConfidence());
    }

    @Test
    void testGenerateSuggestion_Exception() {
        // Arrange
        UUID connectionId = UUID.randomUUID();
        String userContext = "Test context";
        int eventLimit = 100;

        when(eventRepository.findRecentEventsByConnectionId(connectionId, eventLimit))
                .thenThrow(new RuntimeException("Test exception"));

        // Act
        ResponseEntity<AISuggestion> response = controller.generateSuggestion(
                connectionId, userContext, eventLimit);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getSuggestion().contains("An error occurred"));
        assertEquals(0.0, response.getBody().getConfidence());
    }

    @Test
    void testValidateSuggestion_Success() {
        // Arrange
        AISuggestion suggestion = AISuggestion.builder()
                .suggestion("Turn on the living room lights")
                .confidence(0.8)
                .context("Test context")
                .timestamp(System.currentTimeMillis())
                .build();

        when(aiService.validateSuggestion(suggestion)).thenReturn(true);

        // Act
        ResponseEntity<Boolean> response = controller.validateSuggestion(suggestion);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody());
    }

    @Test
    void testValidateSuggestion_Failure() {
        // Arrange
        AISuggestion suggestion = AISuggestion.builder()
                .suggestion("Delete all automations")
                .confidence(0.8)
                .context("Test context")
                .timestamp(System.currentTimeMillis())
                .build();

        when(aiService.validateSuggestion(suggestion)).thenReturn(false);

        // Act
        ResponseEntity<Boolean> response = controller.validateSuggestion(suggestion);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(response.getBody());
    }

    @Test
    void testValidateSuggestion_Exception() {
        // Arrange
        AISuggestion suggestion = AISuggestion.builder()
                .suggestion("Test suggestion")
                .confidence(0.8)
                .context("Test context")
                .timestamp(System.currentTimeMillis())
                .build();

        when(aiService.validateSuggestion(suggestion))
                .thenThrow(new RuntimeException("Test exception"));

        // Act
        ResponseEntity<Boolean> response = controller.validateSuggestion(suggestion);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertFalse(response.getBody());
    }

    @Test
    void testStoreEventEmbedding_Success() {
        // Arrange
        UUID eventId = UUID.randomUUID();
        HomeAssistantEvent event = new HomeAssistantEvent();
        event.setId(eventId);
        event.setEventType("state_changed");
        event.setEntityId("light.living_room");
        event.setNewState("on");

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));

        // Act
        ResponseEntity<Void> response = controller.storeEventEmbedding(eventId);

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(aiService).storeEventEmbedding(event);
    }

    @Test
    void testStoreEventEmbedding_EventNotFound() {
        // Arrange
        UUID eventId = UUID.randomUUID();
        when(eventRepository.findById(eventId)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Void> response = controller.storeEventEmbedding(eventId);

        // Assert
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetHealth_Success() {
        // Act
        ResponseEntity<java.util.Map<String, Object>> response = controller.getHealth();

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("healthy", response.getBody().get("status"));
        assertEquals("AI Suggestion Engine", response.getBody().get("service"));
    }
} 