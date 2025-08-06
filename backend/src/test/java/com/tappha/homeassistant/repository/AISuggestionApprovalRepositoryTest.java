package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.AISuggestion;
import com.tappha.homeassistant.entity.AISuggestionApproval;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

@DataJpaTest
@ActiveProfiles("test")
@DisplayName("AISuggestionApprovalRepository Tests")
class AISuggestionApprovalRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AISuggestionApprovalRepository approvalRepository;

    private User testUser;
    private HomeAssistantConnection testConnection;
    private AISuggestion testSuggestion;
    private AISuggestionApproval testApproval;

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

        // Create test approval
        testApproval = new AISuggestionApproval(
            testSuggestion,
            testUser,
            AISuggestionApproval.Decision.APPROVED,
            "Looks good to me"
        );
        testApproval = entityManager.persistAndFlush(testApproval);

        entityManager.clear();
    }

    @Test
    @DisplayName("Should find approval by suggestion ID")
    void shouldFindApprovalBySuggestionId() {
        Optional<AISuggestionApproval> found = approvalRepository.findBySuggestionId(testSuggestion.getId());
        
        assertThat(found).isPresent();
        assertThat(found.get().getDecision()).isEqualTo(AISuggestionApproval.Decision.APPROVED);
        assertThat(found.get().getDecisionReason()).isEqualTo("Looks good to me");
    }

    @Test
    @DisplayName("Should find approvals by user ID")
    void shouldFindApprovalsByUserId() {
        // Create additional approval for same user
        AISuggestion additionalSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.NEW_AUTOMATION,
            "Additional Suggestion",
            "Additional Description",
            "{\"additional\": \"config\"}",
            new BigDecimal("0.75")
        );
        additionalSuggestion = entityManager.persistAndFlush(additionalSuggestion);

        AISuggestionApproval additionalApproval = new AISuggestionApproval(
            additionalSuggestion,
            testUser,
            AISuggestionApproval.Decision.REJECTED,
            "Not quite right"
        );
        entityManager.persistAndFlush(additionalApproval);

        List<AISuggestionApproval> approvals = approvalRepository.findByUserId(testUser.getId());
        
        assertThat(approvals).hasSize(2);
        assertThat(approvals).extracting(AISuggestionApproval::getDecision)
            .containsExactlyInAnyOrder(
                AISuggestionApproval.Decision.APPROVED,
                AISuggestionApproval.Decision.REJECTED
            );
    }

    @Test
    @DisplayName("Should find approvals by decision")
    void shouldFindApprovalsByDecision() {
        // Create approval with different decision
        AISuggestion rejectedSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.TRIGGER_REFINEMENT,
            "Rejected Suggestion",
            "Rejected Description",
            "{\"rejected\": \"config\"}",
            new BigDecimal("0.60")
        );
        rejectedSuggestion = entityManager.persistAndFlush(rejectedSuggestion);

        AISuggestionApproval rejectedApproval = new AISuggestionApproval(
            rejectedSuggestion,
            testUser,
            AISuggestionApproval.Decision.REJECTED,
            "Doesn't fit our needs"
        );
        entityManager.persistAndFlush(rejectedApproval);

        List<AISuggestionApproval> approvedApprovals = approvalRepository.findByDecision(
            AISuggestionApproval.Decision.APPROVED
        );
        List<AISuggestionApproval> rejectedApprovals = approvalRepository.findByDecision(
            AISuggestionApproval.Decision.REJECTED
        );
        
        assertThat(approvedApprovals).hasSize(1);
        assertThat(approvedApprovals.get(0).getDecisionReason()).isEqualTo("Looks good to me");
        
        assertThat(rejectedApprovals).hasSize(1);
        assertThat(rejectedApprovals.get(0).getDecisionReason()).isEqualTo("Doesn't fit our needs");
    }

    @Test
    @DisplayName("Should find approvals by user ID and decision")
    void shouldFindApprovalsByUserIdAndDecision() {
        List<AISuggestionApproval> userApprovedApprovals = approvalRepository.findByUserIdAndDecision(
            testUser.getId(),
            AISuggestionApproval.Decision.APPROVED
        );
        List<AISuggestionApproval> userRejectedApprovals = approvalRepository.findByUserIdAndDecision(
            testUser.getId(),
            AISuggestionApproval.Decision.REJECTED
        );
        
        assertThat(userApprovedApprovals).hasSize(1);
        assertThat(userRejectedApprovals).isEmpty();
    }

    @Test
    @DisplayName("Should find approvals decided after specific date")
    void shouldFindApprovalsDecidedAfter() {
        OffsetDateTime yesterday = OffsetDateTime.now().minusDays(1);
        OffsetDateTime tomorrow = OffsetDateTime.now().plusDays(1);

        List<AISuggestionApproval> approvalsAfterYesterday = approvalRepository.findByDecidedAtAfter(yesterday);
        List<AISuggestionApproval> approvalsAfterTomorrow = approvalRepository.findByDecidedAtAfter(tomorrow);
        
        assertThat(approvalsAfterYesterday).hasSize(1);
        assertThat(approvalsAfterTomorrow).isEmpty();
    }

    @Test
    @DisplayName("Should find approved suggestions that are implemented")
    void shouldFindApprovedSuggestionsImplemented() {
        // Mark approval as implemented
        testApproval.markAsImplemented();
        entityManager.persistAndFlush(testApproval);

        List<AISuggestionApproval> implementedApprovals = approvalRepository.findByDecisionAndImplementedAtIsNotNull(
            AISuggestionApproval.Decision.APPROVED
        );
        
        assertThat(implementedApprovals).hasSize(1);
        assertThat(implementedApprovals.get(0).isImplemented()).isTrue();
    }

    @Test
    @DisplayName("Should find approved suggestions not yet implemented")
    void shouldFindApprovedSuggestionsNotImplemented() {
        List<AISuggestionApproval> notImplementedApprovals = approvalRepository.findByDecisionAndImplementedAtIsNull(
            AISuggestionApproval.Decision.APPROVED
        );
        
        assertThat(notImplementedApprovals).hasSize(1);
        assertThat(notImplementedApprovals.get(0).isImplemented()).isFalse();
    }

    @Test
    @DisplayName("Should count approvals by user ID and decision")
    void shouldCountApprovalsByUserIdAndDecision() {
        long approvedCount = approvalRepository.countByUserIdAndDecision(
            testUser.getId(),
            AISuggestionApproval.Decision.APPROVED
        );
        long rejectedCount = approvalRepository.countByUserIdAndDecision(
            testUser.getId(),
            AISuggestionApproval.Decision.REJECTED
        );
        
        assertThat(approvedCount).isEqualTo(1);
        assertThat(rejectedCount).isZero();
    }

    @Test
    @DisplayName("Should find approvals by connection ID")
    void shouldFindApprovalsByConnectionId() {
        List<AISuggestionApproval> connectionApprovals = approvalRepository.findByConnectionId(testConnection.getId());
        
        assertThat(connectionApprovals).hasSize(1);
        assertThat(connectionApprovals.get(0).getSuggestion().getConnection().getId())
            .isEqualTo(testConnection.getId());
    }

    @Test
    @DisplayName("Should find recent approvals by user ID with pagination")
    void shouldFindRecentApprovalsByUserIdWithPagination() {
        Pageable pageable = PageRequest.of(0, 10);
        List<AISuggestionApproval> recentApprovals = approvalRepository.findRecentApprovalsByUserId(
            testUser.getId(),
            pageable
        );
        
        assertThat(recentApprovals).hasSize(1);
        assertThat(recentApprovals.get(0).getUser().getId()).isEqualTo(testUser.getId());
    }

    @Test
    @DisplayName("Should find approvals within date range")
    void shouldFindApprovalsByDateRange() {
        OffsetDateTime yesterday = OffsetDateTime.now().minusDays(1);
        OffsetDateTime tomorrow = OffsetDateTime.now().plusDays(1);

        List<AISuggestionApproval> approvalsInRange = approvalRepository.findByDateRange(yesterday, tomorrow);
        
        assertThat(approvalsInRange).hasSize(1);
    }

    @Test
    @DisplayName("Should get approval statistics by user ID")
    void shouldGetApprovalStatisticsByUserId() {
        // Create additional approval with different decision
        AISuggestion rejectedSuggestion = new AISuggestion(
            testConnection,
            AISuggestion.SuggestionType.SCHEDULE_ADJUSTMENT,
            "Rejected Suggestion",
            "Rejected Description",
            "{\"rejected\": \"config\"}",
            new BigDecimal("0.55")
        );
        rejectedSuggestion = entityManager.persistAndFlush(rejectedSuggestion);

        AISuggestionApproval rejectedApproval = new AISuggestionApproval(
            rejectedSuggestion,
            testUser,
            AISuggestionApproval.Decision.REJECTED,
            "Not suitable"
        );
        entityManager.persistAndFlush(rejectedApproval);

        List<Object[]> statistics = approvalRepository.getApprovalStatisticsByUserId(testUser.getId());
        
        assertThat(statistics).hasSize(2);
        // Statistics should contain [Decision, Count] pairs
        assertThat(statistics).anySatisfy(stat -> {
            assertThat(stat[0]).isEqualTo(AISuggestionApproval.Decision.APPROVED);
            assertThat(stat[1]).isEqualTo(1L);
        });
        assertThat(statistics).anySatisfy(stat -> {
            assertThat(stat[0]).isEqualTo(AISuggestionApproval.Decision.REJECTED);
            assertThat(stat[1]).isEqualTo(1L);
        });
    }

    @Test
    @DisplayName("Should find approvals needing implementation")
    void shouldFindApprovalsNeedingImplementation() {
        List<AISuggestionApproval> needingImplementation = approvalRepository.findApprovalsNeedingImplementation();
        
        assertThat(needingImplementation).hasSize(1);
        assertThat(needingImplementation.get(0).getDecision()).isEqualTo(AISuggestionApproval.Decision.APPROVED);
        assertThat(needingImplementation.get(0).isImplemented()).isFalse();
    }

    @Test
    @DisplayName("Should cascade delete approval when suggestion is deleted")
    void shouldCascadeDeleteApprovalWhenSuggestionDeleted() {
        Long suggestionId = (Long) entityManager.getId(testSuggestion);
        Long approvalId = (Long) entityManager.getId(testApproval);
        
        assertThat(approvalRepository.findById(testApproval.getId())).isPresent();
        
        // Delete suggestion through entity manager to test cascade
        AISuggestion suggestion = entityManager.find(AISuggestion.class, testSuggestion.getId());
        entityManager.remove(suggestion);
        entityManager.flush();
        
        assertThat(approvalRepository.findById(testApproval.getId())).isEmpty();
    }
}