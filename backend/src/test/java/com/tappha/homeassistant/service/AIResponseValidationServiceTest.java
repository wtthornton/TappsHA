package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.AutomationContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for AIResponseValidationService
 */
@ExtendWith(MockitoExtension.class)
class AIResponseValidationServiceTest {

    private AIResponseValidationService validationService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        validationService = new AIResponseValidationService(objectMapper);
    }

    @Test
    void testValidateSuggestion_ValidSuggestion() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertTrue(result.isValid());
        assertTrue(result.getConfidenceScore().compareTo(BigDecimal.valueOf(0.6)) >= 0);
        assertTrue(result.getValidationIssues().isEmpty() || result.getValidationIssues().size() <= 2);
        
        // Check detailed scores
        assertTrue(result.getContentScore().compareTo(BigDecimal.ZERO) >= 0);
        assertTrue(result.getFormatScore().compareTo(BigDecimal.ZERO) >= 0);
        assertTrue(result.getComplianceScore().compareTo(BigDecimal.ZERO) >= 0);
        assertTrue(result.getRelevanceScore().compareTo(BigDecimal.ZERO) >= 0);
    }

    @Test
    void testValidateSuggestion_InvalidTitle() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setTitle(""); // Invalid short title
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertFalse(result.isValid());
        assertTrue(result.getValidationIssues().contains("Missing or empty title"));
        assertTrue(result.getContentScore().compareTo(BigDecimal.valueOf(0.7)) < 0);
    }

    @Test
    void testValidateSuggestion_ShortTitle() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setTitle("Short"); // Less than 10 characters
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertTrue(result.getValidationIssues().contains("Title too short (less than 10 characters)"));
    }

    @Test
    void testValidateSuggestion_InvalidDescription() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setDescription("Short desc"); // Less than 50 characters
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertTrue(result.getValidationIssues().contains("Description too short (less than 50 characters)"));
    }

    @Test
    void testValidateSuggestion_InvalidAutomationConfig() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setAutomationConfig("invalid json");
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertFalse(result.isValid());
        assertTrue(result.getValidationIssues().stream()
            .anyMatch(issue -> issue.contains("Invalid JSON in automation configuration")));
    }

    @Test
    void testValidateSuggestion_MissingRequiredKeys() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setAutomationConfig("{\"alias\": \"test\"}"); // Missing trigger and action
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertFalse(result.isValid());
        assertTrue(result.getValidationIssues().contains("Missing required key: trigger"));
        assertTrue(result.getValidationIssues().contains("Missing required key: action"));
    }

    @Test
    void testValidateSuggestion_InvalidEntityId() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setAutomationConfig("""
            {
                "trigger": [{"entity_id": "invalid-entity-id"}],
                "action": [{"service": "light.turn_on"}]
            }
            """);
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertTrue(result.getValidationIssues().stream()
            .anyMatch(issue -> issue.contains("Invalid entity ID format in trigger")));
    }

    @Test
    void testValidateSuggestion_InvalidServiceFormat() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setAutomationConfig("""
            {
                "trigger": [{"entity_id": "light.living_room"}],
                "action": [{"service": "invalid_service"}]
            }
            """);
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertTrue(result.getValidationIssues().stream()
            .anyMatch(issue -> issue.contains("Invalid service format")));
    }

    @Test
    void testValidateSuggestion_MissingTriggerAndAction() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setAutomationConfig("""
            {
                "alias": "test automation",
                "description": "test description"
            }
            """);
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertTrue(result.getValidationIssues().contains("Automation must have at least one trigger"));
        assertTrue(result.getValidationIssues().contains("Automation must have at least one action"));
    }

    @Test
    void testValidateSuggestion_ContextRelevance() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        AutomationContext context = createTestContext();
        context.setEntityIds(Arrays.asList("sensor.temperature", "climate.living_room"));

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        // The suggestion contains "light.living_room" which doesn't match context entities
        assertTrue(result.getValidationIssues().contains("Suggestion does not reference entities from context"));
    }

    @Test
    void testValidateSuggestion_ContextRelevanceMatch() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        AutomationContext context = createTestContext();
        context.setEntityIds(Arrays.asList("light.living_room", "sensor.temperature"));

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        // Should not have context relevance issues since entities match
        assertFalse(result.getValidationIssues().contains("Suggestion does not reference entities from context"));
    }

    @Test
    void testValidateSuggestion_ErrorSuggestionTitle() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setTitle("Error occurred while processing");
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertTrue(result.getValidationIssues().contains("Title suggests error or failure"));
    }

    @Test
    void testValidateSuggestion_NullContext() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, null);

        // Assert
        assertNotNull(result);
        // Should still validate other aspects even without context
        assertTrue(result.getConfidenceScore().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    void testValidateSuggestion_EmptyAutomationConfig() {
        // Arrange
        AISuggestion suggestion = createValidSuggestion();
        suggestion.setAutomationConfig("");
        AutomationContext context = createTestContext();

        // Act
        AIResponseValidationService.ValidationResult result = validationService.validateSuggestion(suggestion, context);

        // Assert
        assertNotNull(result);
        assertFalse(result.isValid());
        assertTrue(result.getValidationIssues().contains("Missing automation configuration"));
        assertEquals(BigDecimal.ZERO, result.getFormatScore());
    }

    private AISuggestion createValidSuggestion() {
        AISuggestion suggestion = new AISuggestion();
        suggestion.setTitle("Smart Energy Optimization for Living Room Lighting");
        suggestion.setDescription("This automation will automatically adjust your living room lighting based on occupancy and time of day to optimize energy usage while maintaining comfort.");
        suggestion.setAutomationConfig("""
            {
                "alias": "Smart Living Room Lighting",
                "description": "Energy-efficient lighting automation",
                "trigger": [
                    {
                        "platform": "state",
                        "entity_id": "binary_sensor.living_room_occupancy"
                    }
                ],
                "condition": [
                    {
                        "condition": "time",
                        "after": "sunset"
                    }
                ],
                "action": [
                    {
                        "service": "light.turn_on",
                        "entity_id": "light.living_room",
                        "data": {
                            "brightness_pct": 75
                        }
                    }
                ]
            }
            """);
        suggestion.setConfidenceScore(BigDecimal.valueOf(0.85));
        suggestion.setSuggestionType(AISuggestion.SuggestionType.ENERGY_OPTIMIZATION);
        return suggestion;
    }

    private AutomationContext createTestContext() {
        AutomationContext context = new AutomationContext();
        context.setContextId("test-context-" + UUID.randomUUID());
        context.setPatternType("energy_optimization");
        context.setEntityIds(Arrays.asList("light.living_room", "binary_sensor.living_room_occupancy"));
        return context;
    }
}