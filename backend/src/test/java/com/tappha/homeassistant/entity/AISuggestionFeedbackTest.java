package com.tappha.homeassistant.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DisplayName("AISuggestionFeedback Entity Tests")
class AISuggestionFeedbackTest {

    private AISuggestionFeedback feedback;
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
        
        feedback = new AISuggestionFeedback();
    }

    @Test
    @DisplayName("Should create AISuggestionFeedback with default values")
    void shouldCreateAISuggestionFeedbackWithDefaults() {
        assertThat(feedback.getId()).isNull();
        assertThat(feedback.getEffectivenessRating()).isNull();
        assertThat(feedback.getUserComments()).isNull();
        assertThat(feedback.getFeedbackDate()).isNull();
        assertThat(feedback.getAutomationPerformanceData()).isNull();
    }

    @Test
    @DisplayName("Should create AISuggestionFeedback with constructor")
    void shouldCreateAISuggestionFeedbackWithConstructor() {
        Integer rating = 4;
        String comments = "Works well but could be improved";
        String performanceData = "{\"executionCount\": 15, \"failureCount\": 0}";
        
        AISuggestionFeedback newFeedback = new AISuggestionFeedback(
            suggestion,
            rating,
            comments,
            performanceData
        );

        assertThat(newFeedback.getSuggestion()).isEqualTo(suggestion);
        assertThat(newFeedback.getEffectivenessRating()).isEqualTo(rating);
        assertThat(newFeedback.getUserComments()).isEqualTo(comments);
        assertThat(newFeedback.getAutomationPerformanceData()).isEqualTo(performanceData);
        assertThat(newFeedback.getFeedbackDate()).isNotNull();
        assertThat(newFeedback.getFeedbackDate()).isBeforeOrEqualTo(OffsetDateTime.now());
    }

    @Test
    @DisplayName("Should set and get all properties")
    void shouldSetAndGetAllProperties() {
        UUID id = UUID.randomUUID();
        Integer rating = 5;
        String comments = "Excellent automation suggestion";
        String performanceData = "{\"executionCount\": 30, \"failureCount\": 1}";
        OffsetDateTime feedbackDate = OffsetDateTime.now();

        feedback.setId(id);
        feedback.setSuggestion(suggestion);
        feedback.setEffectivenessRating(rating);
        feedback.setUserComments(comments);
        feedback.setAutomationPerformanceData(performanceData);
        feedback.setFeedbackDate(feedbackDate);

        assertThat(feedback.getId()).isEqualTo(id);
        assertThat(feedback.getSuggestion()).isEqualTo(suggestion);
        assertThat(feedback.getEffectivenessRating()).isEqualTo(rating);
        assertThat(feedback.getUserComments()).isEqualTo(comments);
        assertThat(feedback.getAutomationPerformanceData()).isEqualTo(performanceData);
        assertThat(feedback.getFeedbackDate()).isEqualTo(feedbackDate);
    }

    @Test
    @DisplayName("Should implement equals and hashCode correctly")
    void shouldImplementEqualsAndHashCodeCorrectly() {
        UUID id = UUID.randomUUID();
        
        AISuggestionFeedback feedback1 = new AISuggestionFeedback();
        feedback1.setId(id);
        
        AISuggestionFeedback feedback2 = new AISuggestionFeedback();
        feedback2.setId(id);
        
        AISuggestionFeedback feedback3 = new AISuggestionFeedback();
        feedback3.setId(UUID.randomUUID());

        assertThat(feedback1).isEqualTo(feedback2);
        assertThat(feedback1).isNotEqualTo(feedback3);
        assertThat(feedback1.hashCode()).isEqualTo(feedback2.hashCode());
        assertThat(feedback1.hashCode()).isNotEqualTo(feedback3.hashCode());
    }

    @Test
    @DisplayName("Should handle null ID in equals and hashCode")
    void shouldHandleNullIdInEqualsAndHashCode() {
        AISuggestionFeedback feedback1 = new AISuggestionFeedback();
        AISuggestionFeedback feedback2 = new AISuggestionFeedback();

        assertThat(feedback1).isEqualTo(feedback2);
        assertThat(feedback1.hashCode()).isEqualTo(feedback2.hashCode());
    }

    @Test
    @DisplayName("Should generate proper toString")
    void shouldGenerateProperToString() {
        feedback.setId(UUID.randomUUID());
        feedback.setEffectivenessRating(4);
        feedback.setUserComments("Great suggestion");

        String toString = feedback.toString();
        
        assertThat(toString).contains("AISuggestionFeedback{");
        assertThat(toString).contains("id=");
        assertThat(toString).contains("effectivenessRating=4");
        assertThat(toString).contains("userComments='Great suggestion'");
    }

    @Test
    @DisplayName("Should validate effectiveness rating range")
    void shouldValidateEffectivenessRatingRange() {
        // Test valid ratings (1-5)
        assertThatNoException().isThrownBy(() -> {
            feedback.setEffectivenessRating(1);
            feedback.setEffectivenessRating(3);
            feedback.setEffectivenessRating(5);
        });
    }

    @Test
    @DisplayName("Should determine if feedback is positive")
    void shouldDetermineIfFeedbackIsPositive() {
        feedback.setEffectivenessRating(1);
        assertThat(feedback.isPositiveFeedback()).isFalse();
        
        feedback.setEffectivenessRating(2);
        assertThat(feedback.isPositiveFeedback()).isFalse();
        
        feedback.setEffectivenessRating(3);
        assertThat(feedback.isPositiveFeedback()).isFalse();
        
        feedback.setEffectivenessRating(4);
        assertThat(feedback.isPositiveFeedback()).isTrue();
        
        feedback.setEffectivenessRating(5);
        assertThat(feedback.isPositiveFeedback()).isTrue();
    }

    @Test
    @DisplayName("Should determine if feedback is negative")
    void shouldDetermineIfFeedbackIsNegative() {
        feedback.setEffectivenessRating(1);
        assertThat(feedback.isNegativeFeedback()).isTrue();
        
        feedback.setEffectivenessRating(2);
        assertThat(feedback.isNegativeFeedback()).isTrue();
        
        feedback.setEffectivenessRating(3);
        assertThat(feedback.isNegativeFeedback()).isFalse();
        
        feedback.setEffectivenessRating(4);
        assertThat(feedback.isNegativeFeedback()).isFalse();
        
        feedback.setEffectivenessRating(5);
        assertThat(feedback.isNegativeFeedback()).isFalse();
    }

    @Test
    @DisplayName("Should handle null rating in feedback assessment")
    void shouldHandleNullRatingInFeedbackAssessment() {
        feedback.setEffectivenessRating(null);
        
        assertThat(feedback.isPositiveFeedback()).isFalse();
        assertThat(feedback.isNegativeFeedback()).isFalse();
    }

    @Test
    @DisplayName("Should determine if feedback has comments")
    void shouldDetermineIfFeedbackHasComments() {
        assertThat(feedback.hasComments()).isFalse();
        
        feedback.setUserComments("");
        assertThat(feedback.hasComments()).isFalse();
        
        feedback.setUserComments("   ");
        assertThat(feedback.hasComments()).isFalse();
        
        feedback.setUserComments("Some comments");
        assertThat(feedback.hasComments()).isTrue();
    }

    @Test
    @DisplayName("Should determine if feedback has performance data")
    void shouldDetermineIfFeedbackHasPerformanceData() {
        assertThat(feedback.hasPerformanceData()).isFalse();
        
        feedback.setAutomationPerformanceData("");
        assertThat(feedback.hasPerformanceData()).isFalse();
        
        feedback.setAutomationPerformanceData("   ");
        assertThat(feedback.hasPerformanceData()).isFalse();
        
        feedback.setAutomationPerformanceData("{\"data\": \"value\"}");
        assertThat(feedback.hasPerformanceData()).isTrue();
    }

    @Test
    @DisplayName("Should handle mark feedback as processed helper method")
    void shouldHandleMarkFeedbackAsProcessedHelperMethod() {
        assertThat(feedback.getFeedbackDate()).isNull();
        
        feedback.markAsProcessed();
        
        assertThat(feedback.getFeedbackDate()).isNotNull();
        assertThat(feedback.getFeedbackDate()).isBeforeOrEqualTo(OffsetDateTime.now());
    }
}