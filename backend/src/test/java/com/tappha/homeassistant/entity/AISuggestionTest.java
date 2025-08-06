package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("AISuggestion Entity Tests")
class AISuggestionTest {

    private AISuggestion aiSuggestion;
    private HomeAssistantConnection connection;
    private User user;

    @BeforeEach
    void setUp() {
        user = new User("test@example.com", "Test User");
        user.setId(UUID.randomUUID());
        
        connection = new HomeAssistantConnection("Test Connection", "http://localhost:8123", "encrypted_token", user);
        connection.setId(UUID.randomUUID());
        
        aiSuggestion = new AISuggestion();
    }

    @Test
    @DisplayName("Should create AISuggestion with default values")
    void shouldCreateAISuggestionWithDefaults() {
        assertThat(aiSuggestion.getId()).isNull();
        assertThat(aiSuggestion.getStatus()).isEqualTo(AISuggestion.SuggestionStatus.PENDING);
        assertThat(aiSuggestion.getCreatedAt()).isNull();
        assertThat(aiSuggestion.getProcessedAt()).isNull();
    }

    @Test
    @DisplayName("Should create AISuggestion with constructor")
    void shouldCreateAISuggestionWithConstructor() {
        String title = "Optimize Living Room Lighting";
        String description = "Adjust lighting based on usage patterns";
        String automationConfig = "{\"trigger\": {\"platform\": \"time\"}}";
        
        AISuggestion suggestion = new AISuggestion(
            connection,
            AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION,
            title,
            description,
            automationConfig,
            new BigDecimal("0.89")
        );

        assertThat(suggestion.getConnection()).isEqualTo(connection);
        assertThat(suggestion.getSuggestionType()).isEqualTo(AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION);
        assertThat(suggestion.getTitle()).isEqualTo(title);
        assertThat(suggestion.getDescription()).isEqualTo(description);
        assertThat(suggestion.getAutomationConfig()).isEqualTo(automationConfig);
        assertThat(suggestion.getConfidenceScore()).isEqualTo(new BigDecimal("0.89"));
        assertThat(suggestion.getStatus()).isEqualTo(AISuggestion.SuggestionStatus.PENDING);
    }

    @Test
    @DisplayName("Should set and get all properties")
    void shouldSetAndGetAllProperties() {
        UUID id = UUID.randomUUID();
        String title = "Test Suggestion";
        String description = "Test Description";
        String automationConfig = "{\"test\": \"config\"}";
        BigDecimal confidenceScore = new BigDecimal("0.95");
        OffsetDateTime now = OffsetDateTime.now();

        aiSuggestion.setId(id);
        aiSuggestion.setConnection(connection);
        aiSuggestion.setSuggestionType(AISuggestion.SuggestionType.NEW_AUTOMATION);
        aiSuggestion.setTitle(title);
        aiSuggestion.setDescription(description);
        aiSuggestion.setAutomationConfig(automationConfig);
        aiSuggestion.setConfidenceScore(confidenceScore);
        aiSuggestion.setStatus(AISuggestion.SuggestionStatus.APPROVED);
        aiSuggestion.setCreatedAt(now);
        aiSuggestion.setProcessedAt(now);

        assertThat(aiSuggestion.getId()).isEqualTo(id);
        assertThat(aiSuggestion.getConnection()).isEqualTo(connection);
        assertThat(aiSuggestion.getSuggestionType()).isEqualTo(AISuggestion.SuggestionType.NEW_AUTOMATION);
        assertThat(aiSuggestion.getTitle()).isEqualTo(title);
        assertThat(aiSuggestion.getDescription()).isEqualTo(description);
        assertThat(aiSuggestion.getAutomationConfig()).isEqualTo(automationConfig);
        assertThat(aiSuggestion.getConfidenceScore()).isEqualTo(confidenceScore);
        assertThat(aiSuggestion.getStatus()).isEqualTo(AISuggestion.SuggestionStatus.APPROVED);
        assertThat(aiSuggestion.getCreatedAt()).isEqualTo(now);
        assertThat(aiSuggestion.getProcessedAt()).isEqualTo(now);
    }

    @Test
    @DisplayName("Should validate suggestion types")
    void shouldValidateSuggestionTypes() {
        assertThat(AISuggestion.SuggestionType.values()).containsExactly(
            AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION,
            AISuggestion.SuggestionType.NEW_AUTOMATION,
            AISuggestion.SuggestionType.SCHEDULE_ADJUSTMENT,
            AISuggestion.SuggestionType.TRIGGER_REFINEMENT
        );
    }

    @Test
    @DisplayName("Should validate suggestion statuses")
    void shouldValidateSuggestionStatuses() {
        assertThat(AISuggestion.SuggestionStatus.values()).containsExactly(
            AISuggestion.SuggestionStatus.PENDING,
            AISuggestion.SuggestionStatus.APPROVED,
            AISuggestion.SuggestionStatus.REJECTED,
            AISuggestion.SuggestionStatus.IMPLEMENTED,
            AISuggestion.SuggestionStatus.FAILED,
            AISuggestion.SuggestionStatus.ROLLED_BACK
        );
    }

    @Test
    @DisplayName("Should implement equals and hashCode correctly")
    void shouldImplementEqualsAndHashCodeCorrectly() {
        UUID id = UUID.randomUUID();
        
        AISuggestion suggestion1 = new AISuggestion();
        suggestion1.setId(id);
        
        AISuggestion suggestion2 = new AISuggestion();
        suggestion2.setId(id);
        
        AISuggestion suggestion3 = new AISuggestion();
        suggestion3.setId(UUID.randomUUID());

        assertThat(suggestion1).isEqualTo(suggestion2);
        assertThat(suggestion1).isNotEqualTo(suggestion3);
        assertThat(suggestion1.hashCode()).isEqualTo(suggestion2.hashCode());
        assertThat(suggestion1.hashCode()).isNotEqualTo(suggestion3.hashCode());
    }

    @Test
    @DisplayName("Should handle null ID in equals and hashCode")
    void shouldHandleNullIdInEqualsAndHashCode() {
        AISuggestion suggestion1 = new AISuggestion();
        AISuggestion suggestion2 = new AISuggestion();

        assertThat(suggestion1).isEqualTo(suggestion2);
        assertThat(suggestion1.hashCode()).isEqualTo(suggestion2.hashCode());
    }

    @Test
    @DisplayName("Should generate proper toString")
    void shouldGenerateProperToString() {
        aiSuggestion.setId(UUID.randomUUID());
        aiSuggestion.setTitle("Test Suggestion");
        aiSuggestion.setSuggestionType(AISuggestion.SuggestionType.NEW_AUTOMATION);
        aiSuggestion.setStatus(AISuggestion.SuggestionStatus.PENDING);

        String toString = aiSuggestion.toString();
        
        assertThat(toString).contains("AISuggestion{");
        assertThat(toString).contains("id=");
        assertThat(toString).contains("title='Test Suggestion'");
        assertThat(toString).contains("suggestionType=NEW_AUTOMATION");
        assertThat(toString).contains("status=PENDING");
    }

    @Test
    @DisplayName("Should validate confidence score range")
    void shouldValidateConfidenceScoreRange() {
        // Test valid confidence scores
        assertThatNoException().isThrownBy(() -> {
            aiSuggestion.setConfidenceScore(new BigDecimal("0.00"));
            aiSuggestion.setConfidenceScore(new BigDecimal("0.50"));
            aiSuggestion.setConfidenceScore(new BigDecimal("1.00"));
        });
    }

    @Test
    @DisplayName("Should handle mark as processed helper method")
    void shouldHandleMarkAsProcessedHelperMethod() {
        aiSuggestion.markAsProcessed();
        
        assertThat(aiSuggestion.getProcessedAt()).isNotNull();
        assertThat(aiSuggestion.getProcessedAt()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should handle mark as implemented helper method")
    void shouldHandleMarkAsImplementedHelperMethod() {
        aiSuggestion.markAsImplemented();
        
        assertThat(aiSuggestion.getStatus()).isEqualTo(AISuggestion.SuggestionStatus.IMPLEMENTED);
        assertThat(aiSuggestion.getProcessedAt()).isNotNull();
    }

    @Test
    @DisplayName("Should handle mark as failed helper method")
    void shouldHandleMarkAsFailedHelperMethod() {
        aiSuggestion.markAsFailed();
        
        assertThat(aiSuggestion.getStatus()).isEqualTo(AISuggestion.SuggestionStatus.FAILED);
        assertThat(aiSuggestion.getProcessedAt()).isNotNull();
    }
}