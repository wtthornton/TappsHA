package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Test class for AISuggestion entity
 * 
 * Tests the AI suggestion entity for the AI Suggestion Engine
 * as part of Task 1.1: Write tests for AI suggestion entities and repositories
 */
public class AISuggestionTest {

    private AISuggestion aiSuggestion;
    private HomeAssistantConnection testConnection;

    @BeforeEach
    void setUp() {
        testConnection = new HomeAssistantConnection();
        testConnection.setId(UUID.randomUUID());
        testConnection.setName("Test HA Connection");
        testConnection.setUrl("http://192.168.1.86:8123/");

        aiSuggestion = new AISuggestion();
        aiSuggestion.setId(UUID.randomUUID());
        aiSuggestion.setConnection(testConnection);
        aiSuggestion.setTitle("Test Automation Suggestion");
        aiSuggestion.setDescription("This is a test automation suggestion");
        aiSuggestion.setSuggestionType(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION);
        aiSuggestion.setAutomationConfig("{\"trigger\": {\"platform\": \"time\"}}");
        aiSuggestion.setConfidenceScore(new BigDecimal("0.85"));
        aiSuggestion.setStatus(AISuggestion.SuggestionStatus.PENDING);
        aiSuggestion.setCreatedAt(OffsetDateTime.now());
    }

    @Test
    void testAISuggestionCreation() {
        assertNotNull(aiSuggestion);
        assertNotNull(aiSuggestion.getId());
        assertEquals("Test Automation Suggestion", aiSuggestion.getTitle());
        assertEquals("This is a test automation suggestion", aiSuggestion.getDescription());
        assertEquals(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION, aiSuggestion.getSuggestionType());
        assertEquals(new BigDecimal("0.85"), aiSuggestion.getConfidenceScore());
        assertEquals(AISuggestion.SuggestionStatus.PENDING, aiSuggestion.getStatus());
    }

    @Test
    void testAISuggestionConnectionRelationship() {
        assertNotNull(aiSuggestion.getConnection());
        assertEquals(testConnection.getId(), aiSuggestion.getConnection().getId());
        assertEquals("Test HA Connection", aiSuggestion.getConnection().getName());
    }

    @Test
    void testAISuggestionStatusTransitions() {
        // Test status transitions
        aiSuggestion.setStatus(AISuggestion.SuggestionStatus.APPROVED);
        assertEquals(AISuggestion.SuggestionStatus.APPROVED, aiSuggestion.getStatus());

        aiSuggestion.setStatus(AISuggestion.SuggestionStatus.REJECTED);
        assertEquals(AISuggestion.SuggestionStatus.REJECTED, aiSuggestion.getStatus());

        aiSuggestion.setStatus(AISuggestion.SuggestionStatus.IMPLEMENTED);
        assertEquals(AISuggestion.SuggestionStatus.IMPLEMENTED, aiSuggestion.getStatus());
    }

    @Test
    void testAISuggestionConfidenceScoreValidation() {
        // Test valid confidence scores
        aiSuggestion.setConfidenceScore(new BigDecimal("0.0"));
        assertEquals(new BigDecimal("0.0"), aiSuggestion.getConfidenceScore());

        aiSuggestion.setConfidenceScore(new BigDecimal("1.0"));
        assertEquals(new BigDecimal("1.0"), aiSuggestion.getConfidenceScore());

        aiSuggestion.setConfidenceScore(new BigDecimal("0.75"));
        assertEquals(new BigDecimal("0.75"), aiSuggestion.getConfidenceScore());
    }

    @Test
    void testAISuggestionTimestamps() {
        OffsetDateTime now = OffsetDateTime.now();
        aiSuggestion.setCreatedAt(now);

        assertEquals(now, aiSuggestion.getCreatedAt());
    }

    @Test
    void testAISuggestionSuggestionTypes() {
        // Test different suggestion types
        aiSuggestion.setSuggestionType(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION);
        assertEquals(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION, aiSuggestion.getSuggestionType());

        aiSuggestion.setSuggestionType(AISuggestion.SuggestionType.NEW_AUTOMATION);
        assertEquals(AISuggestion.SuggestionType.NEW_AUTOMATION, aiSuggestion.getSuggestionType());

        aiSuggestion.setSuggestionType(AISuggestion.SuggestionType.ENERGY_OPTIMIZATION);
        assertEquals(AISuggestion.SuggestionType.ENERGY_OPTIMIZATION, aiSuggestion.getSuggestionType());

        aiSuggestion.setSuggestionType(AISuggestion.SuggestionType.COMFORT_IMPROVEMENT);
        assertEquals(AISuggestion.SuggestionType.COMFORT_IMPROVEMENT, aiSuggestion.getSuggestionType());
    }

    @Test
    void testAISuggestionEquality() {
        AISuggestion suggestion1 = new AISuggestion();
        suggestion1.setId(aiSuggestion.getId());
        suggestion1.setTitle(aiSuggestion.getTitle());

        AISuggestion suggestion2 = new AISuggestion();
        suggestion2.setId(aiSuggestion.getId());
        suggestion2.setTitle(aiSuggestion.getTitle());

        assertEquals(suggestion1.getId(), suggestion2.getId());
        assertEquals(suggestion1.getTitle(), suggestion2.getTitle());
    }

    @Test
    void testAISuggestionToString() {
        String toString = aiSuggestion.toString();
        assertNotNull(toString);
        assertTrue(toString.contains("AISuggestion"));
        assertTrue(toString.contains(aiSuggestion.getId().toString()));
        assertTrue(toString.contains(aiSuggestion.getTitle()));
    }
}