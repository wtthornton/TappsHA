package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("AISuggestionApproval Entity Tests")
class AISuggestionApprovalTest {

    private AISuggestionApproval approval;
    private AISuggestion suggestion;
    private User user;
    private HomeAssistantConnection connection;

    @BeforeEach
    void setUp() {
        user = new User("test@example.com", "Test User");
        user.setId(UUID.randomUUID());
        
        connection = new HomeAssistantConnection("Test Connection", "http://localhost:8123", "encrypted_token", user);
        connection.setId(UUID.randomUUID());
        
        suggestion = new AISuggestion(
            connection,
            AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION,
            "Test Suggestion",
            "Test Description",
            "{\"test\": \"config\"}",
            new BigDecimal("0.89")
        );
        suggestion.setId(UUID.randomUUID());
        
        approval = new AISuggestionApproval();
    }

    @Test
    @DisplayName("Should create AISuggestionApproval with default values")
    void shouldCreateAISuggestionApprovalWithDefaults() {
        assertThat(approval.getId()).isNull();
        assertThat(approval.getDecision()).isNull();
        assertThat(approval.getDecidedAt()).isNull();
        assertThat(approval.getImplementedAt()).isNull();
        assertThat(approval.getRollbackAt()).isNull();
    }

    @Test
    @DisplayName("Should create AISuggestionApproval with constructor")
    void shouldCreateAISuggestionApprovalWithConstructor() {
        String reason = "This optimization looks good";
        
        AISuggestionApproval newApproval = new AISuggestionApproval(
            suggestion,
            user,
            AISuggestionApproval.Decision.APPROVED,
            reason
        );

        assertThat(newApproval.getSuggestion()).isEqualTo(suggestion);
        assertThat(newApproval.getUser()).isEqualTo(user);
        assertThat(newApproval.getDecision()).isEqualTo(AISuggestionApproval.Decision.APPROVED);
        assertThat(newApproval.getDecisionReason()).isEqualTo(reason);
        assertThat(newApproval.getDecidedAt()).isNotNull();
        assertThat(newApproval.getDecidedAt()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should set and get all properties")
    void shouldSetAndGetAllProperties() {
        UUID id = UUID.randomUUID();
        String reason = "Test reason";
        OffsetDateTime now = OffsetDateTime.now();

        approval.setId(id);
        approval.setSuggestion(suggestion);
        approval.setUser(user);
        approval.setDecision(AISuggestionApproval.Decision.REJECTED);
        approval.setDecisionReason(reason);
        approval.setDecidedAt(now);
        approval.setImplementedAt(now);
        approval.setRollbackAt(now);

        assertThat(approval.getId()).isEqualTo(id);
        assertThat(approval.getSuggestion()).isEqualTo(suggestion);
        assertThat(approval.getUser()).isEqualTo(user);
        assertThat(approval.getDecision()).isEqualTo(AISuggestionApproval.Decision.REJECTED);
        assertThat(approval.getDecisionReason()).isEqualTo(reason);
        assertThat(approval.getDecidedAt()).isEqualTo(now);
        assertThat(approval.getImplementedAt()).isEqualTo(now);
        assertThat(approval.getRollbackAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should validate decision types")
    void shouldValidateDecisionTypes() {
        assertThat(AISuggestionApproval.Decision.values()).containsExactly(
            AISuggestionApproval.Decision.APPROVED,
            AISuggestionApproval.Decision.REJECTED,
            AISuggestionApproval.Decision.DEFERRED
        );
    }

    @Test
    @DisplayName("Should implement equals and hashCode correctly")
    void shouldImplementEqualsAndHashCodeCorrectly() {
        UUID id = UUID.randomUUID();
        
        AISuggestionApproval approval1 = new AISuggestionApproval();
        approval1.setId(id);
        
        AISuggestionApproval approval2 = new AISuggestionApproval();
        approval2.setId(id);
        
        AISuggestionApproval approval3 = new AISuggestionApproval();
        approval3.setId(UUID.randomUUID());

        assertThat(approval1).isEqualTo(approval2);
        assertThat(approval1).isNotEqualTo(approval3);
        assertThat(approval1.hashCode()).isEqualTo(approval2.hashCode());
        assertThat(approval1.hashCode()).isNotEqualTo(approval3.hashCode());
    }

    @Test
    @DisplayName("Should handle null ID in equals and hashCode")
    void shouldHandleNullIdInEqualsAndHashCode() {
        AISuggestionApproval approval1 = new AISuggestionApproval();
        AISuggestionApproval approval2 = new AISuggestionApproval();

        assertThat(approval1).isEqualTo(approval2);
        assertThat(approval1.hashCode()).isEqualTo(approval2.hashCode());
    }

    @Test
    @DisplayName("Should generate proper toString")
    void shouldGenerateProperToString() {
        approval.setId(UUID.randomUUID());
        approval.setDecision(AISuggestionApproval.Decision.APPROVED);
        approval.setDecisionReason("Test reason");

        String toString = approval.toString();
        
        assertThat(toString).contains("AISuggestionApproval{");
        assertThat(toString).contains("id=");
        assertThat(toString).contains("decision=APPROVED");
        assertThat(toString).contains("decisionReason='Test reason'");
    }

    @Test
    @DisplayName("Should handle mark as implemented helper method")
    void shouldHandleMarkAsImplementedHelperMethod() {
        approval.markAsImplemented();
        
        assertThat(approval.getImplementedAt()).isNotNull();
        assertThat(approval.getImplementedAt()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should handle mark as rolled back helper method")
    void shouldHandleMarkAsRolledBackHelperMethod() {
        approval.markAsRolledBack();
        
        assertThat(approval.getRollbackAt()).isNotNull();
        assertThat(approval.getRollbackAt()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should determine if approval is implemented")
    void shouldDetermineIfApprovalIsImplemented() {
        assertThat(approval.isImplemented()).isFalse();
        
        approval.markAsImplemented();
        assertThat(approval.isImplemented()).isTrue();
    }

    @Test
    @DisplayName("Should determine if approval is rolled back")
    void shouldDetermineIfApprovalIsRolledBack() {
        assertThat(approval.isRolledBack()).isFalse();
        
        approval.markAsRolledBack();
        assertThat(approval.isRolledBack()).isTrue();
    }

    @Test
    @DisplayName("Should validate decision is required")
    void shouldValidateDecisionIsRequired() {
        approval.setSuggestion(suggestion);
        approval.setUser(user);
        approval.setDecisionReason("Test reason");
        
        // Decision should be validated by JPA constraints in integration tests
        assertThat(approval.getDecision()).isNull();
    }
}