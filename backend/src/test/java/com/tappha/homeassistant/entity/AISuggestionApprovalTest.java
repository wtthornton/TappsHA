package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Test class for AISuggestionApproval entity
 * 
 * Tests the AI suggestion approval entity for the AI Suggestion Engine
 * as part of Task 1.1: Write tests for AI suggestion entities and repositories
 */
public class AISuggestionApprovalTest {

    private AISuggestionApproval approval;
    private AISuggestion suggestion;
    private HomeAssistantConnection connection;

    @BeforeEach
    void setUp() {
        connection = new HomeAssistantConnection();
        connection.setId(UUID.randomUUID());
        connection.setName("Test HA Connection");
        connection.setUrl("http://192.168.1.86:8123/");

        suggestion = new AISuggestion();
        suggestion.setId(UUID.randomUUID());
        suggestion.setConnection(connection);
        suggestion.setTitle("Test Automation Suggestion");
        suggestion.setDescription("This is a test automation suggestion");
        suggestion.setSuggestionType(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION);
        suggestion.setAutomationConfig("{\"trigger\": {\"platform\": \"time\"}}");
        suggestion.setConfidenceScore(new java.math.BigDecimal("0.85"));
        suggestion.setStatus(AISuggestion.SuggestionStatus.PENDING);

        User testUser = new User();
        testUser.setId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");

        approval = new AISuggestionApproval();
        approval.setId(UUID.randomUUID());
        approval.setSuggestion(suggestion);
        approval.setUser(testUser);
        approval.setDecision(AISuggestionApproval.Decision.APPROVED);
        approval.setDecisionReason("This suggestion looks good");
        approval.setDecidedAt(OffsetDateTime.now());
    }

    @Test
    void testAISuggestionApprovalCreation() {
        assertNotNull(approval);
        assertNotNull(approval.getId());
        assertTrue(approval.isApproved());
        assertEquals("This suggestion looks good", approval.getDecisionReason());
        assertEquals("test@example.com", approval.getUser().getEmail());
        assertNotNull(approval.getDecidedAt());
    }

    @Test
    void testAISuggestionApprovalSuggestionRelationship() {
        assertNotNull(approval.getSuggestion());
        assertEquals(suggestion.getId(), approval.getSuggestion().getId());
        assertEquals("Test Automation Suggestion", approval.getSuggestion().getTitle());
    }

    @Test
    void testAISuggestionApprovalStatusTransitions() {
        // Test approval status
        approval.setDecision(AISuggestionApproval.Decision.APPROVED);
        assertTrue(approval.isApproved());

        approval.setDecision(AISuggestionApproval.Decision.REJECTED);
        assertFalse(approval.isApproved());
        assertTrue(approval.isRejected());
    }

    @Test
    void testAISuggestionApprovalRejection() {
        approval.setDecision(AISuggestionApproval.Decision.REJECTED);
        approval.setDecisionReason("This suggestion is not suitable");

        assertFalse(approval.isApproved());
        assertTrue(approval.isRejected());
        assertEquals("This suggestion is not suitable", approval.getDecisionReason());
    }

    @Test
    void testAISuggestionApprovalTimestamps() {
        OffsetDateTime now = OffsetDateTime.now();
        approval.setDecidedAt(now);

        assertEquals(now, approval.getDecidedAt());
    }

    @Test
    void testAISuggestionApprovalEquality() {
        AISuggestionApproval approval1 = new AISuggestionApproval();
        approval1.setId(approval.getId());
        approval1.setDecision(approval.getDecision());

        AISuggestionApproval approval2 = new AISuggestionApproval();
        approval2.setId(approval.getId());
        approval2.setDecision(approval.getDecision());

        assertEquals(approval1.getId(), approval2.getId());
        assertEquals(approval1.getDecision(), approval2.getDecision());
    }

    @Test
    void testAISuggestionApprovalToString() {
        String toString = approval.toString();
        assertNotNull(toString);
        assertTrue(toString.contains("AISuggestionApproval"));
        assertTrue(toString.contains(approval.getId().toString()));
        assertTrue(toString.contains(approval.getDecision().toString()));
    }

    @Test
    void testAISuggestionApprovalWithNullValues() {
        AISuggestionApproval nullApproval = new AISuggestionApproval();
        nullApproval.setId(UUID.randomUUID());

        assertNotNull(nullApproval.getId());
        assertNull(nullApproval.getSuggestion());
        assertNull(nullApproval.getDecisionReason());
        assertNull(nullApproval.getUser());
        assertNull(nullApproval.getDecidedAt());
    }
}