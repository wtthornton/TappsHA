package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.AutomationManagement;
import com.tappha.autonomous.entity.LifecycleState;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Repository tests for AutomationManagement entity
 * 
 * Tests cover:
 * - Basic CRUD operations
 * - Custom query methods
 * - Pagination functionality
 * - Analytics queries
 * - Performance metrics queries
 */
@DataJpaTest
@ActiveProfiles("test")
@DisplayName("AutomationManagement Repository Tests")
class AutomationManagementRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AutomationManagementRepository repository;

    private AutomationManagement testAutomation;
    private UUID userId;
    private String homeAssistantAutomationId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        homeAssistantAutomationId = UUID.randomUUID().toString();
        
        testAutomation = new AutomationManagement();
        testAutomation.setHomeAssistantAutomationId(homeAssistantAutomationId);
        testAutomation.setName("Test Automation");
        testAutomation.setDescription("Test automation description");
        testAutomation.setLifecycleState(LifecycleState.ACTIVE);
        testAutomation.setPerformanceScore(85.5);
        testAutomation.setLastExecutionTime(Instant.now());
        testAutomation.setExecutionCount(150);
        testAutomation.setSuccessRate(95.2);
        testAutomation.setAverageExecutionTimeMs(250);
        testAutomation.setCreatedBy(userId);
        testAutomation.setModifiedBy(userId);
        testAutomation.setVersion(1);
        testAutomation.setIsActive(true);
    }

    @Nested
    @DisplayName("Basic CRUD Operations")
    class BasicCrudOperations {

        @Test
        @DisplayName("Should save automation")
        void shouldSaveAutomation() {
            // When
            AutomationManagement saved = repository.save(testAutomation);
            
            // Then
            assertNotNull(saved.getId());
            assertEquals(testAutomation.getName(), saved.getName());
            assertEquals(testAutomation.getHomeAssistantAutomationId(), saved.getHomeAssistantAutomationId());
            assertEquals(testAutomation.getLifecycleState(), saved.getLifecycleState());
        }

        @Test
        @DisplayName("Should find automation by ID")
        void shouldFindAutomationById() {
            // Given
            AutomationManagement saved = repository.save(testAutomation);
            
            // When
            Optional<AutomationManagement> found = repository.findById(saved.getId());
            
            // Then
            assertTrue(found.isPresent());
            assertEquals(saved.getId(), found.get().getId());
            assertEquals(saved.getName(), found.get().getName());
        }

        @Test
        @DisplayName("Should update automation")
        void shouldUpdateAutomation() {
            // Given
            AutomationManagement saved = repository.save(testAutomation);
            String updatedName = "Updated Automation Name";
            
            // When
            saved.setName(updatedName);
            saved.setPerformanceScore(92.0);
            AutomationManagement updated = repository.save(saved);
            
            // Then
            assertEquals(updatedName, updated.getName());
            assertEquals(92.0, updated.getPerformanceScore());
            assertEquals(saved.getId(), updated.getId());
        }

        @Test
        @DisplayName("Should delete automation")
        void shouldDeleteAutomation() {
            // Given
            AutomationManagement saved = repository.save(testAutomation);
            
            // When
            repository.delete(saved);
            
            // Then
            Optional<AutomationManagement> found = repository.findById(saved.getId());
            assertFalse(found.isPresent());
        }

        @Test
        @DisplayName("Should find all automations")
        void shouldFindAllAutomations() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement secondAutomation = new AutomationManagement();
            secondAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            secondAutomation.setName("Second Automation");
            secondAutomation.setLifecycleState(LifecycleState.ACTIVE);
            repository.save(secondAutomation);
            
            // When
            List<AutomationManagement> allAutomations = repository.findAll();
            
            // Then
            assertTrue(allAutomations.size() >= 2);
        }
    }

    @Nested
    @DisplayName("Find By Methods")
    class FindByMethods {

        @Test
        @DisplayName("Should find automation by Home Assistant automation ID")
        void shouldFindAutomationByHomeAssistantAutomationId() {
            // Given
            repository.save(testAutomation);
            
            // When
            Optional<AutomationManagement> found = repository.findByHomeAssistantAutomationId(homeAssistantAutomationId);
            
            // Then
            assertTrue(found.isPresent());
            assertEquals(homeAssistantAutomationId, found.get().getHomeAssistantAutomationId());
        }

        @Test
        @DisplayName("Should find automations by lifecycle state")
        void shouldFindAutomationsByLifecycleState() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement pendingAutomation = new AutomationManagement();
            pendingAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            pendingAutomation.setName("Pending Automation");
            pendingAutomation.setLifecycleState(LifecycleState.PENDING);
            repository.save(pendingAutomation);
            
            // When
            List<AutomationManagement> activeAutomations = repository.findByLifecycleState(LifecycleState.ACTIVE);
            List<AutomationManagement> pendingAutomations = repository.findByLifecycleState(LifecycleState.PENDING);
            
            // Then
            assertTrue(activeAutomations.size() >= 1);
            assertTrue(pendingAutomations.size() >= 1);
        }

        @Test
        @DisplayName("Should find active automations")
        void shouldFindActiveAutomations() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement inactiveAutomation = new AutomationManagement();
            inactiveAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            inactiveAutomation.setName("Inactive Automation");
            inactiveAutomation.setIsActive(false);
            repository.save(inactiveAutomation);
            
            // When
            List<AutomationManagement> activeAutomations = repository.findByIsActiveTrue();
            
            // Then
            assertTrue(activeAutomations.size() >= 1);
            activeAutomations.forEach(automation -> assertTrue(automation.getIsActive()));
        }

        @Test
        @DisplayName("Should find automations by performance score range")
        void shouldFindAutomationsByPerformanceScoreRange() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement highPerformanceAutomation = new AutomationManagement();
            highPerformanceAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            highPerformanceAutomation.setName("High Performance Automation");
            highPerformanceAutomation.setPerformanceScore(95.0);
            repository.save(highPerformanceAutomation);
            
            // When
            List<AutomationManagement> highPerformanceAutomations = repository.findByPerformanceScoreBetween(90.0, 100.0);
            
            // Then
            assertTrue(highPerformanceAutomations.size() >= 1);
            highPerformanceAutomations.forEach(automation -> 
                assertTrue(automation.getPerformanceScore() >= 90.0 && automation.getPerformanceScore() <= 100.0));
        }

        @Test
        @DisplayName("Should find automations by success rate range")
        void shouldFindAutomationsBySuccessRateRange() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement highSuccessAutomation = new AutomationManagement();
            highSuccessAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            highSuccessAutomation.setName("High Success Automation");
            highSuccessAutomation.setSuccessRate(98.5);
            repository.save(highSuccessAutomation);
            
            // When
            List<AutomationManagement> highSuccessAutomations = repository.findBySuccessRateBetween(95.0, 100.0);
            
            // Then
            assertTrue(highSuccessAutomations.size() >= 1);
            highSuccessAutomations.forEach(automation -> 
                assertTrue(automation.getSuccessRate() >= 95.0 && automation.getSuccessRate() <= 100.0));
        }

        @Test
        @DisplayName("Should find automations by execution count range")
        void shouldFindAutomationsByExecutionCountRange() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement highExecutionAutomation = new AutomationManagement();
            highExecutionAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            highExecutionAutomation.setName("High Execution Automation");
            highExecutionAutomation.setExecutionCount(1000);
            repository.save(highExecutionAutomation);
            
            // When
            List<AutomationManagement> highExecutionAutomations = repository.findByExecutionCountBetween(500, 1500);
            
            // Then
            assertTrue(highExecutionAutomations.size() >= 1);
            highExecutionAutomations.forEach(automation -> 
                assertTrue(automation.getExecutionCount() >= 500 && automation.getExecutionCount() <= 1500));
        }

        @Test
        @DisplayName("Should find automations by average execution time range")
        void shouldFindAutomationsByAverageExecutionTimeRange() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement slowAutomation = new AutomationManagement();
            slowAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            slowAutomation.setName("Slow Automation");
            slowAutomation.setAverageExecutionTimeMs(1000);
            repository.save(slowAutomation);
            
            // When
            List<AutomationManagement> slowAutomations = repository.findByAverageExecutionTimeMsBetween(500, 1500);
            
            // Then
            assertTrue(slowAutomations.size() >= 1);
            slowAutomations.forEach(automation -> 
                assertTrue(automation.getAverageExecutionTimeMs() >= 500 && automation.getAverageExecutionTimeMs() <= 1500));
        }

        @Test
        @DisplayName("Should find automations by user")
        void shouldFindAutomationsByUser() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<AutomationManagement> userAutomations = repository.findByCreatedBy(userId);
            
            // Then
            assertTrue(userAutomations.size() >= 1);
            userAutomations.forEach(automation -> assertEquals(userId, automation.getCreatedBy()));
        }

        @Test
        @DisplayName("Should find automations by name containing")
        void shouldFindAutomationsByNameContaining() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<AutomationManagement> foundAutomations = repository.findByNameContainingIgnoreCase("Test");
            
            // Then
            assertTrue(foundAutomations.size() >= 1);
            foundAutomations.forEach(automation -> 
                assertTrue(automation.getName().toLowerCase().contains("test")));
        }

        @Test
        @DisplayName("Should find automations by description containing")
        void shouldFindAutomationsByDescriptionContaining() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<AutomationManagement> foundAutomations = repository.findByDescriptionContainingIgnoreCase("description");
            
            // Then
            assertTrue(foundAutomations.size() >= 1);
            foundAutomations.forEach(automation -> 
                assertTrue(automation.getDescription().toLowerCase().contains("description")));
        }
    }

    @Nested
    @DisplayName("Pagination Tests")
    class PaginationTests {

        @Test
        @DisplayName("Should find automations with pagination")
        void shouldFindAutomationsWithPagination() {
            // Given
            for (int i = 0; i < 5; i++) {
                AutomationManagement automation = new AutomationManagement();
                automation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
                automation.setName("Automation " + i);
                automation.setLifecycleState(LifecycleState.ACTIVE);
                repository.save(automation);
            }
            
            // When
            Pageable pageable = PageRequest.of(0, 3);
            Page<AutomationManagement> page = repository.findAll(pageable);
            
            // Then
            assertEquals(3, page.getContent().size());
            assertTrue(page.getTotalElements() >= 5);
            assertTrue(page.getTotalPages() >= 2);
        }

        @Test
        @DisplayName("Should find automations by lifecycle state with pagination")
        void shouldFindAutomationsByLifecycleStateWithPagination() {
            // Given
            for (int i = 0; i < 5; i++) {
                AutomationManagement automation = new AutomationManagement();
                automation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
                automation.setName("Active Automation " + i);
                automation.setLifecycleState(LifecycleState.ACTIVE);
                repository.save(automation);
            }
            
            // When
            Pageable pageable = PageRequest.of(0, 3);
            Page<AutomationManagement> page = repository.findByLifecycleState(LifecycleState.ACTIVE, pageable);
            
            // Then
            assertEquals(3, page.getContent().size());
            assertTrue(page.getTotalElements() >= 5);
            page.getContent().forEach(automation -> assertEquals(LifecycleState.ACTIVE, automation.getLifecycleState()));
        }

        @Test
        @DisplayName("Should find automations by active status with pagination")
        void shouldFindAutomationsByActiveStatusWithPagination() {
            // Given
            for (int i = 0; i < 5; i++) {
                AutomationManagement automation = new AutomationManagement();
                automation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
                automation.setName("Active Automation " + i);
                automation.setIsActive(true);
                repository.save(automation);
            }
            
            // When
            Pageable pageable = PageRequest.of(0, 3);
            Page<AutomationManagement> page = repository.findByIsActive(true, pageable);
            
            // Then
            assertEquals(3, page.getContent().size());
            assertTrue(page.getTotalElements() >= 5);
            page.getContent().forEach(automation -> assertTrue(automation.getIsActive()));
        }
    }

    @Nested
    @DisplayName("Count Methods")
    class CountMethods {

        @Test
        @DisplayName("Should count automations by lifecycle state")
        void shouldCountAutomationsByLifecycleState() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement pendingAutomation = new AutomationManagement();
            pendingAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            pendingAutomation.setName("Pending Automation");
            pendingAutomation.setLifecycleState(LifecycleState.PENDING);
            repository.save(pendingAutomation);
            
            // When
            long activeCount = repository.countByLifecycleState(LifecycleState.ACTIVE);
            long pendingCount = repository.countByLifecycleState(LifecycleState.PENDING);
            
            // Then
            assertTrue(activeCount >= 1);
            assertTrue(pendingCount >= 1);
        }

        @Test
        @DisplayName("Should count active automations")
        void shouldCountActiveAutomations() {
            // Given
            repository.save(testAutomation);
            
            // When
            long activeCount = repository.countByIsActiveTrue();
            
            // Then
            assertTrue(activeCount >= 1);
        }

        @Test
        @DisplayName("Should count automations by performance score threshold")
        void shouldCountAutomationsByPerformanceScoreThreshold() {
            // Given
            repository.save(testAutomation);
            
            // When
            long highPerformanceCount = repository.countByPerformanceScoreGreaterThan(80.0);
            
            // Then
            assertTrue(highPerformanceCount >= 1);
        }

        @Test
        @DisplayName("Should count automations by success rate threshold")
        void shouldCountAutomationsBySuccessRateThreshold() {
            // Given
            repository.save(testAutomation);
            
            // When
            long highSuccessCount = repository.countBySuccessRateGreaterThan(90.0);
            
            // Then
            assertTrue(highSuccessCount >= 1);
        }

        @Test
        @DisplayName("Should count automations by execution count threshold")
        void shouldCountAutomationsByExecutionCountThreshold() {
            // Given
            repository.save(testAutomation);
            
            // When
            long highExecutionCount = repository.countByExecutionCountGreaterThan(100);
            
            // Then
            assertTrue(highExecutionCount >= 1);
        }

        @Test
        @DisplayName("Should count automations by average execution time threshold")
        void shouldCountAutomationsByAverageExecutionTimeThreshold() {
            // Given
            repository.save(testAutomation);
            
            // When
            long slowExecutionCount = repository.countByAverageExecutionTimeMsGreaterThan(200);
            
            // Then
            assertTrue(slowExecutionCount >= 1);
        }

        @Test
        @DisplayName("Should count automations by user")
        void shouldCountAutomationsByUser() {
            // Given
            repository.save(testAutomation);
            
            // When
            long userCount = repository.countByCreatedBy(userId);
            
            // Then
            assertTrue(userCount >= 1);
        }
    }

    @Nested
    @DisplayName("Exists Methods")
    class ExistsMethods {

        @Test
        @DisplayName("Should check if automation exists by Home Assistant automation ID")
        void shouldCheckIfAutomationExistsByHomeAssistantAutomationId() {
            // Given
            repository.save(testAutomation);
            
            // When
            boolean exists = repository.existsByHomeAssistantAutomationId(homeAssistantAutomationId);
            boolean notExists = repository.existsByHomeAssistantAutomationId("non-existent-id");
            
            // Then
            assertTrue(exists);
            assertFalse(notExists);
        }

        @Test
        @DisplayName("Should check if automation exists by name")
        void shouldCheckIfAutomationExistsByName() {
            // Given
            repository.save(testAutomation);
            
            // When
            boolean exists = repository.existsByName("Test Automation");
            boolean notExists = repository.existsByName("Non-existent Automation");
            
            // Then
            assertTrue(exists);
            assertFalse(notExists);
        }

        @Test
        @DisplayName("Should check if automation exists by lifecycle state")
        void shouldCheckIfAutomationExistsByLifecycleState() {
            // Given
            repository.save(testAutomation);
            
            // When
            boolean exists = repository.existsByLifecycleState(LifecycleState.ACTIVE);
            boolean notExists = repository.existsByLifecycleState(LifecycleState.RETIRED);
            
            // Then
            assertTrue(exists);
            assertFalse(notExists);
        }

        @Test
        @DisplayName("Should check if automation exists by active status")
        void shouldCheckIfAutomationExistsByActiveStatus() {
            // Given
            repository.save(testAutomation);
            
            // When
            boolean exists = repository.existsByIsActive(true);
            boolean notExists = repository.existsByIsActive(false);
            
            // Then
            assertTrue(exists);
            assertFalse(notExists);
        }
    }

    @Nested
    @DisplayName("Custom Query Tests")
    class CustomQueryTests {

        @Test
        @DisplayName("Should find high performance automations")
        void shouldFindHighPerformanceAutomations() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement highPerformanceAutomation = new AutomationManagement();
            highPerformanceAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            highPerformanceAutomation.setName("High Performance Automation");
            highPerformanceAutomation.setPerformanceScore(85.0);
            highPerformanceAutomation.setIsActive(true);
            repository.save(highPerformanceAutomation);
            
            // When
            List<AutomationManagement> highPerformanceAutomations = repository.findHighPerformanceAutomations();
            
            // Then
            assertTrue(highPerformanceAutomations.size() >= 1);
            highPerformanceAutomations.forEach(automation -> {
                assertTrue(automation.getPerformanceScore() > 80);
                assertTrue(automation.getIsActive());
            });
        }

        @Test
        @DisplayName("Should find low performance automations")
        void shouldFindLowPerformanceAutomations() {
            // Given
            AutomationManagement lowPerformanceAutomation = new AutomationManagement();
            lowPerformanceAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            lowPerformanceAutomation.setName("Low Performance Automation");
            lowPerformanceAutomation.setPerformanceScore(40.0);
            lowPerformanceAutomation.setIsActive(true);
            repository.save(lowPerformanceAutomation);
            
            // When
            List<AutomationManagement> lowPerformanceAutomations = repository.findLowPerformanceAutomations();
            
            // Then
            assertTrue(lowPerformanceAutomations.size() >= 1);
            lowPerformanceAutomations.forEach(automation -> {
                assertTrue(automation.getPerformanceScore() < 50);
                assertTrue(automation.getIsActive());
            });
        }

        @Test
        @DisplayName("Should find inactive automations")
        void shouldFindInactiveAutomations() {
            // Given
            AutomationManagement oldAutomation = new AutomationManagement();
            oldAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            oldAutomation.setName("Old Automation");
            oldAutomation.setLastExecutionTime(Instant.now().minusSeconds(8 * 24 * 3600)); // 8 days ago
            oldAutomation.setIsActive(true);
            repository.save(oldAutomation);
            
            // When
            Instant cutoffDate = Instant.now().minusSeconds(7 * 24 * 3600); // 7 days ago
            List<AutomationManagement> inactiveAutomations = repository.findInactiveAutomations(cutoffDate);
            
            // Then
            assertTrue(inactiveAutomations.size() >= 1);
            inactiveAutomations.forEach(automation -> {
                assertTrue(automation.getLastExecutionTime().isBefore(cutoffDate));
                assertTrue(automation.getIsActive());
            });
        }

        @Test
        @DisplayName("Should find most executed automations")
        void shouldFindMostExecutedAutomations() {
            // Given
            repository.save(testAutomation);
            
            // When
            Pageable pageable = PageRequest.of(0, 10);
            Page<AutomationManagement> mostExecutedAutomations = repository.findMostExecutedAutomations(pageable);
            
            // Then
            assertTrue(mostExecutedAutomations.getContent().size() >= 1);
            mostExecutedAutomations.getContent().forEach(automation -> assertTrue(automation.getIsActive()));
        }

        @Test
        @DisplayName("Should find most successful automations")
        void shouldFindMostSuccessfulAutomations() {
            // Given
            repository.save(testAutomation);
            
            // When
            Pageable pageable = PageRequest.of(0, 10);
            Page<AutomationManagement> mostSuccessfulAutomations = repository.findMostSuccessfulAutomations(pageable);
            
            // Then
            assertTrue(mostSuccessfulAutomations.getContent().size() >= 1);
            mostSuccessfulAutomations.getContent().forEach(automation -> assertTrue(automation.getIsActive()));
        }

        @Test
        @DisplayName("Should find automations by multiple lifecycle states")
        void shouldFindAutomationsByMultipleLifecycleStates() {
            // Given
            repository.save(testAutomation);
            
            AutomationManagement pendingAutomation = new AutomationManagement();
            pendingAutomation.setHomeAssistantAutomationId(UUID.randomUUID().toString());
            pendingAutomation.setName("Pending Automation");
            pendingAutomation.setLifecycleState(LifecycleState.PENDING);
            repository.save(pendingAutomation);
            
            // When
            List<LifecycleState> states = List.of(LifecycleState.ACTIVE, LifecycleState.PENDING);
            List<AutomationManagement> foundAutomations = repository.findByLifecycleStates(states);
            
            // Then
            assertTrue(foundAutomations.size() >= 2);
            foundAutomations.forEach(automation -> assertTrue(states.contains(automation.getLifecycleState())));
        }
    }

    @Nested
    @DisplayName("Analytics Query Tests")
    class AnalyticsQueryTests {

        @Test
        @DisplayName("Should get average performance score")
        void shouldGetAveragePerformanceScore() {
            // Given
            repository.save(testAutomation);
            
            // When
            Double averagePerformanceScore = repository.getAveragePerformanceScore();
            
            // Then
            assertNotNull(averagePerformanceScore);
            assertTrue(averagePerformanceScore > 0);
        }

        @Test
        @DisplayName("Should get average success rate")
        void shouldGetAverageSuccessRate() {
            // Given
            repository.save(testAutomation);
            
            // When
            Double averageSuccessRate = repository.getAverageSuccessRate();
            
            // Then
            assertNotNull(averageSuccessRate);
            assertTrue(averageSuccessRate > 0);
        }

        @Test
        @DisplayName("Should get average execution count")
        void shouldGetAverageExecutionCount() {
            // Given
            repository.save(testAutomation);
            
            // When
            Double averageExecutionCount = repository.getAverageExecutionCount();
            
            // Then
            assertNotNull(averageExecutionCount);
            assertTrue(averageExecutionCount > 0);
        }

        @Test
        @DisplayName("Should get average execution time")
        void shouldGetAverageExecutionTime() {
            // Given
            repository.save(testAutomation);
            
            // When
            Double averageExecutionTime = repository.getAverageExecutionTime();
            
            // Then
            assertNotNull(averageExecutionTime);
            assertTrue(averageExecutionTime > 0);
        }

        @Test
        @DisplayName("Should get total execution count")
        void shouldGetTotalExecutionCount() {
            // Given
            repository.save(testAutomation);
            
            // When
            Long totalExecutionCount = repository.getTotalExecutionCount();
            
            // Then
            assertNotNull(totalExecutionCount);
            assertTrue(totalExecutionCount > 0);
        }

        @Test
        @DisplayName("Should get count by lifecycle state")
        void shouldGetCountByLifecycleState() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<Object[]> countByLifecycleState = repository.getCountByLifecycleState();
            
            // Then
            assertNotNull(countByLifecycleState);
            assertTrue(countByLifecycleState.size() > 0);
        }

        @Test
        @DisplayName("Should get performance scores distribution")
        void shouldGetPerformanceScoresDistribution() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<Double> performanceScores = repository.getPerformanceScores();
            
            // Then
            assertNotNull(performanceScores);
            assertTrue(performanceScores.size() > 0);
        }

        @Test
        @DisplayName("Should get success rates distribution")
        void shouldGetSuccessRatesDistribution() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<Double> successRates = repository.getSuccessRates();
            
            // Then
            assertNotNull(successRates);
            assertTrue(successRates.size() > 0);
        }

        @Test
        @DisplayName("Should get execution counts distribution")
        void shouldGetExecutionCountsDistribution() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<Integer> executionCounts = repository.getExecutionCounts();
            
            // Then
            assertNotNull(executionCounts);
            assertTrue(executionCounts.size() > 0);
        }

        @Test
        @DisplayName("Should get average execution times distribution")
        void shouldGetAverageExecutionTimesDistribution() {
            // Given
            repository.save(testAutomation);
            
            // When
            List<Integer> averageExecutionTimes = repository.getAverageExecutionTimes();
            
            // Then
            assertNotNull(averageExecutionTimes);
            assertTrue(averageExecutionTimes.size() > 0);
        }
    }
}
