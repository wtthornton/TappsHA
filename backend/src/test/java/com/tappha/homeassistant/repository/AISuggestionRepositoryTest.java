package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("AISuggestionRepository Tests")
class AISuggestionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AISuggestionRepository suggestionRepository;

    private User testUser;
    private HomeAssistantConnection testConnection;
    private AISuggestion testSuggestion;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User("test@example.com", "Test User");
        testUser = entityManager.persistAndFlush(testUser);

        // Create test connection
        testConnection = new HomeAssistantConnection(
            "Test Connection",
            "http://localhost:8123",
            "encrypted_token",
            testUser
        );
        testConnection = entityManager.persistAndFlush(testConnection);

        // Create test suggestion
        testSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION,
            "Test Suggestion",
            "Test Description",
            "{\"test\": \"config\"}",
            new BigDecimal("0.89")
        );
        testSuggestion = entityManager.persistAndFlush(testSuggestion);

        entityManager.clear();
    }

    @Test
    @DisplayName("Should save and find suggestion by ID")
    void shouldSaveAndFindSuggestionById() {
        Optional<AISuggestion> found = suggestionRepository.findById(testSuggestion.getId());
        
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test Suggestion");
        assertThat(found.get().getConnection().getId()).isEqualTo(testConnection.getId());
    }

    @Test
    @DisplayName("Should find suggestions by connection ID")
    void shouldFindSuggestionsByConnectionId() {
        // Create additional suggestion for same connection
        AISuggestion additionalSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.NEW_AUTOMATION,
            "Additional Suggestion",
            "Additional Description",
            "{\"additional\": \"config\"}",
            new BigDecimal("0.75")
        );
        entityManager.persistAndFlush(additionalSuggestion);

        List<AISuggestion> suggestions = suggestionRepository.findByConnectionId(testConnection.getId());
        
        assertThat(suggestions).hasSize(2);
        assertThat(suggestions).extracting(AISuggestion::getTitle)
            .containsExactlyInAnyOrder("Test Suggestion", "Additional Suggestion");
    }

    @Test
    @DisplayName("Should find suggestions by connection ID with pagination")
    void shouldFindSuggestionsByConnectionIdWithPagination() {
        // Create multiple suggestions
        for (int i = 1; i <= 5; i++) {
            AISuggestion suggestion = new AISuggestion(
                testConnection,
                AISuggestion.SuggestionType.SCHEDULE_ADJUSTMENT,
                "Suggestion " + i,
                "Description " + i,
                "{\"config\": " + i + "}",
                new BigDecimal("0.8" + i)
            );
            entityManager.persistAndFlush(suggestion);
        }

        Pageable pageable = PageRequest.of(0, 3);
        Page<AISuggestion> page = suggestionRepository.findByConnectionId(testConnection.getId(), pageable);
        
        assertThat(page.getContent()).hasSize(3);
        assertThat(page.getTotalElements()).isEqualTo(6); // 5 new + 1 original
        assertThat(page.getTotalPages()).isEqualTo(2);
        assertThat(page.hasNext()).isTrue();
    }

    @Test
    @DisplayName("Should find suggestions by status")
    void shouldFindSuggestionsByStatus() {
        // Create suggestion with different status
        AISuggestion approvedSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.TRIGGER_REFINEMENT,
            "Approved Suggestion",
            "Approved Description",
            "{\"approved\": \"config\"}",
            new BigDecimal("0.92")
        );
        approvedSuggestion.setStatus(AISuggestion.SuggestionStatus.APPROVED);
        entityManager.persistAndFlush(approvedSuggestion);

        List<AISuggestion> pendingSuggestions = suggestionRepository.findByStatus(AISuggestion.SuggestionStatus.PENDING);
        List<AISuggestion> approvedSuggestions = suggestionRepository.findByStatus(AISuggestion.SuggestionStatus.APPROVED);
        
        assertThat(pendingSuggestions).hasSize(1);
        assertThat(pendingSuggestions.get(0).getTitle()).isEqualTo("Test Suggestion");
        
        assertThat(approvedSuggestions).hasSize(1);
        assertThat(approvedSuggestions.get(0).getTitle()).isEqualTo("Approved Suggestion");
    }

    @Test
    @DisplayName("Should find suggestions by connection ID and status")
    void shouldFindSuggestionsByConnectionIdAndStatus() {
        // Create suggestions with different statuses
        AISuggestion approvedSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.NEW_AUTOMATION,
            "Approved Suggestion",
            "Approved Description",
            "{\"approved\": \"config\"}",
            new BigDecimal("0.88")
        );
        approvedSuggestion.setStatus(AISuggestion.SuggestionStatus.APPROVED);
        entityManager.persistAndFlush(approvedSuggestion);

        List<AISuggestion> pendingSuggestions = suggestionRepository.findByConnectionIdAndStatus(
            testConnection.getId(), 
            AISuggestion.SuggestionStatus.PENDING
        );
        
        List<AISuggestion> approvedSuggestions = suggestionRepository.findByConnectionIdAndStatus(
            testConnection.getId(), 
            AISuggestion.SuggestionStatus.APPROVED
        );
        
        assertThat(pendingSuggestions).hasSize(1);
        assertThat(pendingSuggestions.get(0).getTitle()).isEqualTo("Test Suggestion");
        
        assertThat(approvedSuggestions).hasSize(1);
        assertThat(approvedSuggestions.get(0).getTitle()).isEqualTo("Approved Suggestion");
    }

    @Test
    @DisplayName("Should find suggestions by suggestion type")
    void shouldFindSuggestionsBySuggestionType() {
        // Create suggestion with different type
        AISuggestion newAutomationSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.NEW_AUTOMATION,
            "New Automation Suggestion",
            "New Automation Description",
            "{\"new\": \"automation\"}",
            new BigDecimal("0.85")
        );
        entityManager.persistAndFlush(newAutomationSuggestion);

        List<AISuggestion> optimizationSuggestions = suggestionRepository.findBySuggestionType(
            AISuggestion.SuggestionType.AUTOMATION_OPTIMIZATION
        );
        
        List<AISuggestion> newAutomationSuggestions = suggestionRepository.findBySuggestionType(
            AISuggestion.SuggestionType.NEW_AUTOMATION
        );
        
        assertThat(optimizationSuggestions).hasSize(1);
        assertThat(optimizationSuggestions.get(0).getTitle()).isEqualTo("Test Suggestion");
        
        assertThat(newAutomationSuggestions).hasSize(1);
        assertThat(newAutomationSuggestions.get(0).getTitle()).isEqualTo("New Automation Suggestion");
    }

    @Test
    @DisplayName("Should find suggestions created after specific date")
    void shouldFindSuggestionsCreatedAfter() {
        OffsetDateTime yesterday = OffsetDateTime.now().minusDays(1);
        OffsetDateTime tomorrow = OffsetDateTime.now().plusDays(1);

        List<AISuggestion> suggestionsAfterYesterday = suggestionRepository.findByCreatedAtAfter(yesterday);
        List<AISuggestion> suggestionsAfterTomorrow = suggestionRepository.findByCreatedAtAfter(tomorrow);
        
        assertThat(suggestionsAfterYesterday).hasSize(1);
        assertThat(suggestionsAfterTomorrow).isEmpty();
    }

    @Test
    @DisplayName("Should find suggestions by confidence score greater than threshold")
    void shouldFindSuggestionsByConfidenceScoreGreaterThan() {
        // Create suggestion with lower confidence
        AISuggestion lowConfidenceSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.SCHEDULE_ADJUSTMENT,
            "Low Confidence Suggestion",
            "Low Confidence Description",
            "{\"low\": \"confidence\"}",
            new BigDecimal("0.60")
        );
        entityManager.persistAndFlush(lowConfidenceSuggestion);

        List<AISuggestion> highConfidenceSuggestions = suggestionRepository.findByConfidenceScoreGreaterThan(
            new BigDecimal("0.80")
        );
        
        List<AISuggestion> mediumConfidenceSuggestions = suggestionRepository.findByConfidenceScoreGreaterThan(
            new BigDecimal("0.50")
        );
        
        assertThat(highConfidenceSuggestions).hasSize(1);
        assertThat(highConfidenceSuggestions.get(0).getTitle()).isEqualTo("Test Suggestion");
        
        assertThat(mediumConfidenceSuggestions).hasSize(2);
    }

    @Test
    @DisplayName("Should count suggestions by connection ID and status")
    void shouldCountSuggestionsByConnectionIdAndStatus() {
        // Create additional suggestions with different statuses
        AISuggestion approvedSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.NEW_AUTOMATION,
            "Approved Suggestion",
            "Approved Description",
            "{\"approved\": \"config\"}",
            new BigDecimal("0.88")
        );
        approvedSuggestion.setStatus(AISuggestion.SuggestionStatus.APPROVED);
        entityManager.persistAndFlush(approvedSuggestion);

        long pendingCount = suggestionRepository.countByConnectionIdAndStatus(
            testConnection.getId(), 
            AISuggestion.SuggestionStatus.PENDING
        );
        
        long approvedCount = suggestionRepository.countByConnectionIdAndStatus(
            testConnection.getId(), 
            AISuggestion.SuggestionStatus.APPROVED
        );
        
        assertThat(pendingCount).isEqualTo(1);
        assertThat(approvedCount).isEqualTo(1);
    }

    @Test
    @DisplayName("Should delete suggestion by ID")
    void shouldDeleteSuggestionById() {
        UUID suggestionId = testSuggestion.getId();
        
        assertThat(suggestionRepository.findById(suggestionId)).isPresent();
        
        suggestionRepository.deleteById(suggestionId);
        
        assertThat(suggestionRepository.findById(suggestionId)).isEmpty();
    }

    @Test
    @DisplayName("Should cascade delete suggestions when connection is deleted")
    void shouldCascadeDeleteSuggestionsWhenConnectionDeleted() {
        UUID suggestionId = testSuggestion.getId();
        UUID connectionId = testConnection.getId();
        
        assertThat(suggestionRepository.findById(suggestionId)).isPresent();
        
        // Delete connection through entity manager to test cascade
        HomeAssistantConnection connection = entityManager.find(HomeAssistantConnection.class, connectionId);
        entityManager.remove(connection);
        entityManager.flush();
        
        assertThat(suggestionRepository.findById(suggestionId)).isEmpty();
    }
}