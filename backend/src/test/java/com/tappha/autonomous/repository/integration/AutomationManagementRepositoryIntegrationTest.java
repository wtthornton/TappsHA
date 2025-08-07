package com.tappha.autonomous.repository.integration;

import com.tappha.autonomous.entity.AutomationManagement;
import com.tappha.autonomous.entity.LifecycleState;
import com.tappha.autonomous.repository.AutomationManagementRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for AutomationManagementRepository using Testcontainers
 * 
 * Tests cover:
 * - Real database CRUD operations
 * - Custom query methods with actual data
 * - Pagination with database-level sorting
 * - Analytics queries with real data
 * - Performance metrics with actual calculations
 * - Data validation constraints
 * - Foreign key relationships
 */
@DisplayName("AutomationManagement Repository Integration Tests")
class AutomationManagementRepositoryIntegrationTest extends BaseRepositoryIntegrationTest {

    @Autowired
    private AutomationManagementRepository repository;

    private UUID testUserId;
    private String testHomeAssistantAutomationId;
    private AutomationManagement testAutomation;

    @Override
    protected void setUp() {
        super.setUp();
        testUserId = generateTestUserId();
        testHomeAssistantAutomationId = generateTestHomeAssistantAutomationId();
        
        testAutomation = new AutomationManagement();
        testAutomation.setHomeAssistantAutomationId(testHomeAssistantAutomationId);
        testAutomation.setName("Test Integration Automation");
        testAutomation.setDescription("Test automation for integration testing");
        testAutomation.setLifecycleState(LifecycleState.ACTIVE);
        testAutomation.setPerformanceScore(85.5);
        testAutomation.setLastExecutionTime(Instant.now());
        testAutomation.setExecutionCount(150);
        testAutomation.setSuccessRate(95.2);
        testAutomation.setAverageExecutionTimeMs(250);
        testAutomation.setCreatedBy(testUserId);
        testAutomation.setModifiedBy(testUserId);
        testAutomation.setVersion(1);
        testAutomation.setIsActive(true);
    }

    @Nested
    @DisplayName("Integration CRUD Operations")
    class IntegrationCrudOperations {

        @Test
        @DisplayName("Should persist and retrieve automation with real database")
        @Transactional
        void shouldPersistAndRetrieveAutomationWithRealDatabase() {
            // Given
            AutomationManagement automation = testAutomation;
            
            // When
            AutomationManagement saved = repository.save(automation);
            flushAndClear();
            
            Optional<AutomationManagement> found = repository.findById(saved.getId());
            
            // Then
            assertTrue(found.isPresent());
            assertEquals(saved.getId(), found.get().getId());
            assertEquals(automation.getName(), found.get().getName());
            assertEquals(automation.getHomeAssistantAutomationId(), found.get().getHomeAssistantAutomationId());
            assertEquals(automation.getLifecycleState(), found.get().getLifecycleState());
            assertEquals(automation.getPerformanceScore(), found.get().getPerformanceScore());
            assertEquals(automation.getSuccessRate(), found.get().getSuccessRate());
            assertEquals(automation.getExecutionCount(), found.get().getExecutionCount());
            assertEquals(automation.getAverageExecutionTimeMs(), found.get().getAverageExecutionTimeMs());
            assertEquals(automation.getCreatedBy(), found.get().getCreatedBy());
            assertEquals(automation.getModifiedBy(), found.get().getModifiedBy());
            assertEquals(automation.getVersion(), found.get().getVersion());
            assertEquals(automation.getIsActive(), found.get().getIsActive());
        }

        @Test
        @DisplayName("Should update automation with real database")
        @Transactional
        void shouldUpdateAutomationWithRealDatabase() {
            // Given
            AutomationManagement saved = repository.save(testAutomation);
            flushAndClear();
            
            // When
            AutomationManagement found = repository.findById(saved.getId()).orElseThrow();
            found.setName("Updated Integration Automation");
            found.setDescription("Updated description for integration testing");
            found.setPerformanceScore(92.5);
            found.setSuccessRate(98.1);
            found.setExecutionCount(200);
            found.setAverageExecutionTimeMs(180);
            found.setVersion(2);
            found.setModifiedBy(generateTestUserId());
            
            AutomationManagement updated = repository.save(found);
            flushAndClear();
            
            // Then
            AutomationManagement retrieved = repository.findById(saved.getId()).orElseThrow();
            assertEquals("Updated Integration Automation", retrieved.getName());
            assertEquals("Updated description for integration testing", retrieved.getDescription());
            assertEquals(92.5, retrieved.getPerformanceScore());
            assertEquals(98.1, retrieved.getSuccessRate());
            assertEquals(200, retrieved.getExecutionCount());
            assertEquals(180, retrieved.getAverageExecutionTimeMs());
            assertEquals(2, retrieved.getVersion());
        }

        @Test
        @DisplayName("Should delete automation with real database")
        @Transactional
        void shouldDeleteAutomationWithRealDatabase() {
            // Given
            AutomationManagement saved = repository.save(testAutomation);
            flushAndClear();
            
            // When
            repository.deleteById(saved.getId());
            flushAndClear();
            
            // Then
            Optional<AutomationManagement> found = repository.findById(saved.getId());
            assertFalse(found.isPresent());
        }

        @Test
        @DisplayName("Should handle multiple automations with real database")
        @Transactional
        void shouldHandleMultipleAutomationsWithRealDatabase() {
            // Given
            AutomationManagement automation1 = createTestAutomation("Test Automation 1", LifecycleState.ACTIVE, 85.0);
            AutomationManagement automation2 = createTestAutomation("Test Automation 2", LifecycleState.PENDING, 75.0);
            AutomationManagement automation3 = createTestAutomation("Test Automation 3", LifecycleState.INACTIVE, 65.0);
            
            repository.saveAll(List.of(automation1, automation2, automation3));
            flushAndClear();
            
            // When
            List<AutomationManagement> allAutomations = repository.findAll();
            
            // Then
            assertEquals(3, allAutomations.size());
            assertTrue(allAutomations.stream().anyMatch(a -> a.getName().equals("Test Automation 1")));
            assertTrue(allAutomations.stream().anyMatch(a -> a.getName().equals("Test Automation 2")));
            assertTrue(allAutomations.stream().anyMatch(a -> a.getName().equals("Test Automation 3")));
        }
    }

    @Nested
    @DisplayName("Integration Custom Query Tests")
    class IntegrationCustomQueryTests {

        @Test
        @DisplayName("Should find automation by Home Assistant automation ID with real database")
        @Transactional
        void shouldFindAutomationByHomeAssistantAutomationIdWithRealDatabase() {
            // Given
            AutomationManagement saved = repository.save(testAutomation);
            flushAndClear();
            
            // When
            Optional<AutomationManagement> found = repository.findByHomeAssistantAutomationId(testHomeAssistantAutomationId);
            
            // Then
            assertTrue(found.isPresent());
            assertEquals(saved.getId(), found.get().getId());
            assertEquals(testHomeAssistantAutomationId, found.get().getHomeAssistantAutomationId());
        }

        @Test
        @DisplayName("Should find automations by lifecycle state with real database")
        @Transactional
        void shouldFindAutomationsByLifecycleStateWithRealDatabase() {
            // Given
            AutomationManagement activeAutomation = createTestAutomation("Active Automation", LifecycleState.ACTIVE, 90.0);
            AutomationManagement pendingAutomation = createTestAutomation("Pending Automation", LifecycleState.PENDING, 80.0);
            AutomationManagement inactiveAutomation = createTestAutomation("Inactive Automation", LifecycleState.INACTIVE, 70.0);
            
            repository.saveAll(List.of(activeAutomation, pendingAutomation, inactiveAutomation));
            flushAndClear();
            
            // When
            List<AutomationManagement> activeAutomations = repository.findByLifecycleState(LifecycleState.ACTIVE);
            List<AutomationManagement> pendingAutomations = repository.findByLifecycleState(LifecycleState.PENDING);
            List<AutomationManagement> inactiveAutomations = repository.findByLifecycleState(LifecycleState.INACTIVE);
            
            // Then
            assertEquals(1, activeAutomations.size());
            assertEquals(1, pendingAutomations.size());
            assertEquals(1, inactiveAutomations.size());
            assertEquals("Active Automation", activeAutomations.get(0).getName());
            assertEquals("Pending Automation", pendingAutomations.get(0).getName());
            assertEquals("Inactive Automation", inactiveAutomations.get(0).getName());
        }

        @Test
        @DisplayName("Should find active automations with real database")
        @Transactional
        void shouldFindActiveAutomationsWithRealDatabase() {
            // Given
            AutomationManagement activeAutomation1 = createTestAutomation("Active Automation 1", LifecycleState.ACTIVE, 90.0);
            AutomationManagement activeAutomation2 = createTestAutomation("Active Automation 2", LifecycleState.ACTIVE, 85.0);
            AutomationManagement inactiveAutomation = createTestAutomation("Inactive Automation", LifecycleState.INACTIVE, 70.0);
            
            repository.saveAll(List.of(activeAutomation1, activeAutomation2, inactiveAutomation));
            flushAndClear();
            
            // When
            List<AutomationManagement> activeAutomations = repository.findByIsActiveTrue();
            
            // Then
            assertEquals(2, activeAutomations.size());
            assertTrue(activeAutomations.stream().allMatch(AutomationManagement::getIsActive));
        }

        @Test
        @DisplayName("Should find automations by performance score range with real database")
        @Transactional
        void shouldFindAutomationsByPerformanceScoreRangeWithRealDatabase() {
            // Given
            AutomationManagement highPerformance = createTestAutomation("High Performance", LifecycleState.ACTIVE, 95.0);
            AutomationManagement mediumPerformance = createTestAutomation("Medium Performance", LifecycleState.ACTIVE, 75.0);
            AutomationManagement lowPerformance = createTestAutomation("Low Performance", LifecycleState.ACTIVE, 55.0);
            
            repository.saveAll(List.of(highPerformance, mediumPerformance, lowPerformance));
            flushAndClear();
            
            // When
            List<AutomationManagement> highPerfAutomations = repository.findByPerformanceScoreBetween(90.0, 100.0);
            List<AutomationManagement> mediumPerfAutomations = repository.findByPerformanceScoreBetween(70.0, 89.9);
            List<AutomationManagement> lowPerfAutomations = repository.findByPerformanceScoreBetween(50.0, 69.9);
            
            // Then
            assertEquals(1, highPerfAutomations.size());
            assertEquals(1, mediumPerfAutomations.size());
            assertEquals(1, lowPerfAutomations.size());
            assertEquals("High Performance", highPerfAutomations.get(0).getName());
            assertEquals("Medium Performance", mediumPerfAutomations.get(0).getName());
            assertEquals("Low Performance", lowPerfAutomations.get(0).getName());
        }

        @Test
        @DisplayName("Should find automations by success rate range with real database")
        @Transactional
        void shouldFindAutomationsBySuccessRateRangeWithRealDatabase() {
            // Given
            AutomationManagement highSuccess = createTestAutomation("High Success", LifecycleState.ACTIVE, 85.0);
            highSuccess.setSuccessRate(98.5);
            AutomationManagement mediumSuccess = createTestAutomation("Medium Success", LifecycleState.ACTIVE, 85.0);
            mediumSuccess.setSuccessRate(85.0);
            AutomationManagement lowSuccess = createTestAutomation("Low Success", LifecycleState.ACTIVE, 85.0);
            lowSuccess.setSuccessRate(65.0);
            
            repository.saveAll(List.of(highSuccess, mediumSuccess, lowSuccess));
            flushAndClear();
            
            // When
            List<AutomationManagement> highSuccessAutomations = repository.findBySuccessRateBetween(95.0, 100.0);
            List<AutomationManagement> mediumSuccessAutomations = repository.findBySuccessRateBetween(80.0, 94.9);
            List<AutomationManagement> lowSuccessAutomations = repository.findBySuccessRateBetween(60.0, 79.9);
            
            // Then
            assertEquals(1, highSuccessAutomations.size());
            assertEquals(1, mediumSuccessAutomations.size());
            assertEquals(1, lowSuccessAutomations.size());
            assertEquals("High Success", highSuccessAutomations.get(0).getName());
            assertEquals("Medium Success", mediumSuccessAutomations.get(0).getName());
            assertEquals("Low Success", lowSuccessAutomations.get(0).getName());
        }

        @Test
        @DisplayName("Should find automations by execution count range with real database")
        @Transactional
        void shouldFindAutomationsByExecutionCountRangeWithRealDatabase() {
            // Given
            AutomationManagement highExecution = createTestAutomation("High Execution", LifecycleState.ACTIVE, 85.0);
            highExecution.setExecutionCount(500);
            AutomationManagement mediumExecution = createTestAutomation("Medium Execution", LifecycleState.ACTIVE, 85.0);
            mediumExecution.setExecutionCount(200);
            AutomationManagement lowExecution = createTestAutomation("Low Execution", LifecycleState.ACTIVE, 85.0);
            lowExecution.setExecutionCount(50);
            
            repository.saveAll(List.of(highExecution, mediumExecution, lowExecution));
            flushAndClear();
            
            // When
            List<AutomationManagement> highExecAutomations = repository.findByExecutionCountBetween(400, 1000);
            List<AutomationManagement> mediumExecAutomations = repository.findByExecutionCountBetween(150, 399);
            List<AutomationManagement> lowExecAutomations = repository.findByExecutionCountBetween(0, 149);
            
            // Then
            assertEquals(1, highExecAutomations.size());
            assertEquals(1, mediumExecAutomations.size());
            assertEquals(1, lowExecAutomations.size());
            assertEquals("High Execution", highExecAutomations.get(0).getName());
            assertEquals("Medium Execution", mediumExecAutomations.get(0).getName());
            assertEquals("Low Execution", lowExecAutomations.get(0).getName());
        }

        @Test
        @DisplayName("Should find automations by average execution time range with real database")
        @Transactional
        void shouldFindAutomationsByAverageExecutionTimeRangeWithRealDatabase() {
            // Given
            AutomationManagement fastExecution = createTestAutomation("Fast Execution", LifecycleState.ACTIVE, 85.0);
            fastExecution.setAverageExecutionTimeMs(100);
            AutomationManagement mediumExecution = createTestAutomation("Medium Execution", LifecycleState.ACTIVE, 85.0);
            mediumExecution.setAverageExecutionTimeMs(500);
            AutomationManagement slowExecution = createTestAutomation("Slow Execution", LifecycleState.ACTIVE, 85.0);
            slowExecution.setAverageExecutionTimeMs(1000);
            
            repository.saveAll(List.of(fastExecution, mediumExecution, slowExecution));
            flushAndClear();
            
            // When
            List<AutomationManagement> fastExecAutomations = repository.findByAverageExecutionTimeMsBetween(0, 200);
            List<AutomationManagement> mediumExecAutomations = repository.findByAverageExecutionTimeMsBetween(201, 800);
            List<AutomationManagement> slowExecAutomations = repository.findByAverageExecutionTimeMsBetween(801, 2000);
            
            // Then
            assertEquals(1, fastExecAutomations.size());
            assertEquals(1, mediumExecAutomations.size());
            assertEquals(1, slowExecAutomations.size());
            assertEquals("Fast Execution", fastExecAutomations.get(0).getName());
            assertEquals("Medium Execution", mediumExecAutomations.get(0).getName());
            assertEquals("Slow Execution", slowExecAutomations.get(0).getName());
        }

        @Test
        @DisplayName("Should find automations by user with real database")
        @Transactional
        void shouldFindAutomationsByUserWithRealDatabase() {
            // Given
            UUID user1 = generateTestUserId();
            UUID user2 = generateTestUserId();
            
            AutomationManagement user1Automation1 = createTestAutomation("User1 Automation 1", LifecycleState.ACTIVE, 85.0);
            user1Automation1.setCreatedBy(user1);
            AutomationManagement user1Automation2 = createTestAutomation("User1 Automation 2", LifecycleState.ACTIVE, 85.0);
            user1Automation2.setCreatedBy(user1);
            AutomationManagement user2Automation = createTestAutomation("User2 Automation", LifecycleState.ACTIVE, 85.0);
            user2Automation.setCreatedBy(user2);
            
            repository.saveAll(List.of(user1Automation1, user1Automation2, user2Automation));
            flushAndClear();
            
            // When
            List<AutomationManagement> user1Automations = repository.findByCreatedBy(user1);
            List<AutomationManagement> user2Automations = repository.findByCreatedBy(user2);
            
            // Then
            assertEquals(2, user1Automations.size());
            assertEquals(1, user2Automations.size());
            assertTrue(user1Automations.stream().allMatch(a -> a.getCreatedBy().equals(user1)));
            assertTrue(user2Automations.stream().allMatch(a -> a.getCreatedBy().equals(user2)));
        }

        @Test
        @DisplayName("Should find automations by name containing with real database")
        @Transactional
        void shouldFindAutomationsByNameContainingWithRealDatabase() {
            // Given
            AutomationManagement lightAutomation = createTestAutomation("Light Control Automation", LifecycleState.ACTIVE, 85.0);
            AutomationManagement temperatureAutomation = createTestAutomation("Temperature Control Automation", LifecycleState.ACTIVE, 85.0);
            AutomationManagement securityAutomation = createTestAutomation("Security Control Automation", LifecycleState.ACTIVE, 85.0);
            
            repository.saveAll(List.of(lightAutomation, temperatureAutomation, securityAutomation));
            flushAndClear();
            
            // When
            List<AutomationManagement> controlAutomations = repository.findByNameContainingIgnoreCase("control");
            List<AutomationManagement> lightAutomations = repository.findByNameContainingIgnoreCase("light");
            List<AutomationManagement> temperatureAutomations = repository.findByNameContainingIgnoreCase("temperature");
            
            // Then
            assertEquals(3, controlAutomations.size());
            assertEquals(1, lightAutomations.size());
            assertEquals(1, temperatureAutomations.size());
            assertEquals("Light Control Automation", lightAutomations.get(0).getName());
            assertEquals("Temperature Control Automation", temperatureAutomations.get(0).getName());
        }

        @Test
        @DisplayName("Should find automations by description containing with real database")
        @Transactional
        void shouldFindAutomationsByDescriptionContainingWithRealDatabase() {
            // Given
            AutomationManagement lightAutomation = createTestAutomation("Light Automation", LifecycleState.ACTIVE, 85.0);
            lightAutomation.setDescription("Controls smart lights based on motion sensors");
            AutomationManagement temperatureAutomation = createTestAutomation("Temperature Automation", LifecycleState.ACTIVE, 85.0);
            temperatureAutomation.setDescription("Manages HVAC system based on temperature sensors");
            AutomationManagement securityAutomation = createTestAutomation("Security Automation", LifecycleState.ACTIVE, 85.0);
            securityAutomation.setDescription("Monitors security cameras and motion sensors");
            
            repository.saveAll(List.of(lightAutomation, temperatureAutomation, securityAutomation));
            flushAndClear();
            
            // When
            List<AutomationManagement> sensorAutomations = repository.findByDescriptionContainingIgnoreCase("sensor");
            List<AutomationManagement> lightAutomations = repository.findByDescriptionContainingIgnoreCase("light");
            List<AutomationManagement> temperatureAutomations = repository.findByDescriptionContainingIgnoreCase("temperature");
            
            // Then
            assertEquals(3, sensorAutomations.size());
            assertEquals(1, lightAutomations.size());
            assertEquals(1, temperatureAutomations.size());
            assertEquals("Light Automation", lightAutomations.get(0).getName());
            assertEquals("Temperature Automation", temperatureAutomations.get(0).getName());
        }
    }

    @Nested
    @DisplayName("Integration Pagination Tests")
    class IntegrationPaginationTests {

        @Test
        @DisplayName("Should find automations with pagination and real database")
        @Transactional
        void shouldFindAutomationsWithPaginationAndRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Automation 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 2", LifecycleState.ACTIVE, 86.0),
                createTestAutomation("Automation 3", LifecycleState.ACTIVE, 87.0),
                createTestAutomation("Automation 4", LifecycleState.ACTIVE, 88.0),
                createTestAutomation("Automation 5", LifecycleState.ACTIVE, 89.0)
            );
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            Pageable pageable = PageRequest.of(0, 2, Sort.by("name"));
            Page<AutomationManagement> firstPage = repository.findAll(pageable);
            
            Pageable secondPageable = PageRequest.of(1, 2, Sort.by("name"));
            Page<AutomationManagement> secondPage = repository.findAll(secondPageable);
            
            // Then
            assertEquals(2, firstPage.getContent().size());
            assertEquals(5, firstPage.getTotalElements());
            assertEquals(3, firstPage.getTotalPages());
            assertEquals(2, secondPage.getContent().size());
            assertEquals(5, secondPage.getTotalElements());
            assertEquals(3, secondPage.getTotalPages());
        }

        @Test
        @DisplayName("Should find automations by lifecycle state with pagination and real database")
        @Transactional
        void shouldFindAutomationsByLifecycleStateWithPaginationAndRealDatabase() {
            // Given
            List<AutomationManagement> activeAutomations = List.of(
                createTestAutomation("Active 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Active 2", LifecycleState.ACTIVE, 86.0),
                createTestAutomation("Active 3", LifecycleState.ACTIVE, 87.0)
            );
            
            List<AutomationManagement> pendingAutomations = List.of(
                createTestAutomation("Pending 1", LifecycleState.PENDING, 75.0),
                createTestAutomation("Pending 2", LifecycleState.PENDING, 76.0)
            );
            
            repository.saveAll(activeAutomations);
            repository.saveAll(pendingAutomations);
            flushAndClear();
            
            // When
            Pageable pageable = PageRequest.of(0, 2, Sort.by("name"));
            Page<AutomationManagement> activePage = repository.findByLifecycleState(LifecycleState.ACTIVE, pageable);
            Page<AutomationManagement> pendingPage = repository.findByLifecycleState(LifecycleState.PENDING, pageable);
            
            // Then
            assertEquals(2, activePage.getContent().size());
            assertEquals(3, activePage.getTotalElements());
            assertEquals(2, activePage.getTotalPages());
            assertEquals(2, pendingPage.getContent().size());
            assertEquals(2, pendingPage.getTotalElements());
            assertEquals(1, pendingPage.getTotalPages());
        }

        @Test
        @DisplayName("Should find active automations with pagination and real database")
        @Transactional
        void shouldFindActiveAutomationsWithPaginationAndRealDatabase() {
            // Given
            List<AutomationManagement> activeAutomations = List.of(
                createTestAutomation("Active 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Active 2", LifecycleState.ACTIVE, 86.0),
                createTestAutomation("Active 3", LifecycleState.ACTIVE, 87.0),
                createTestAutomation("Active 4", LifecycleState.ACTIVE, 88.0)
            );
            
            AutomationManagement inactiveAutomation = createTestAutomation("Inactive", LifecycleState.INACTIVE, 70.0);
            
            repository.saveAll(activeAutomations);
            repository.save(inactiveAutomation);
            flushAndClear();
            
            // When
            Pageable pageable = PageRequest.of(0, 2, Sort.by("name"));
            Page<AutomationManagement> activePage = repository.findByIsActive(true, pageable);
            
            // Then
            assertEquals(2, activePage.getContent().size());
            assertEquals(4, activePage.getTotalElements());
            assertEquals(2, activePage.getTotalPages());
            assertTrue(activePage.getContent().stream().allMatch(AutomationManagement::getIsActive));
        }
    }

    @Nested
    @DisplayName("Integration Analytics Tests")
    class IntegrationAnalyticsTests {

        @Test
        @DisplayName("Should get average performance score with real database")
        @Transactional
        void shouldGetAveragePerformanceScoreWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Automation 1", LifecycleState.ACTIVE, 80.0),
                createTestAutomation("Automation 2", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 3", LifecycleState.ACTIVE, 90.0)
            );
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            Double averageScore = repository.getAveragePerformanceScore();
            
            // Then
            assertNotNull(averageScore);
            assertEquals(85.0, averageScore, 0.1);
        }

        @Test
        @DisplayName("Should get average success rate with real database")
        @Transactional
        void shouldGetAverageSuccessRateWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Automation 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 2", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 3", LifecycleState.ACTIVE, 85.0)
            );
            
            automations.get(0).setSuccessRate(90.0);
            automations.get(1).setSuccessRate(95.0);
            automations.get(2).setSuccessRate(85.0);
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            Double averageSuccessRate = repository.getAverageSuccessRate();
            
            // Then
            assertNotNull(averageSuccessRate);
            assertEquals(90.0, averageSuccessRate, 0.1);
        }

        @Test
        @DisplayName("Should get average execution count with real database")
        @Transactional
        void shouldGetAverageExecutionCountWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Automation 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 2", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 3", LifecycleState.ACTIVE, 85.0)
            );
            
            automations.get(0).setExecutionCount(100);
            automations.get(1).setExecutionCount(200);
            automations.get(2).setExecutionCount(300);
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            Double averageExecutionCount = repository.getAverageExecutionCount();
            
            // Then
            assertNotNull(averageExecutionCount);
            assertEquals(200.0, averageExecutionCount, 0.1);
        }

        @Test
        @DisplayName("Should get average execution time with real database")
        @Transactional
        void shouldGetAverageExecutionTimeWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Automation 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 2", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 3", LifecycleState.ACTIVE, 85.0)
            );
            
            automations.get(0).setAverageExecutionTimeMs(100);
            automations.get(1).setAverageExecutionTimeMs(200);
            automations.get(2).setAverageExecutionTimeMs(300);
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            Double averageExecutionTime = repository.getAverageExecutionTime();
            
            // Then
            assertNotNull(averageExecutionTime);
            assertEquals(200.0, averageExecutionTime, 0.1);
        }

        @Test
        @DisplayName("Should get total execution count with real database")
        @Transactional
        void shouldGetTotalExecutionCountWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Automation 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 2", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Automation 3", LifecycleState.ACTIVE, 85.0)
            );
            
            automations.get(0).setExecutionCount(100);
            automations.get(1).setExecutionCount(200);
            automations.get(2).setExecutionCount(300);
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            Long totalExecutionCount = repository.getTotalExecutionCount();
            
            // Then
            assertNotNull(totalExecutionCount);
            assertEquals(600L, totalExecutionCount);
        }

        @Test
        @DisplayName("Should get count by lifecycle state with real database")
        @Transactional
        void shouldGetCountByLifecycleStateWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Active 1", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Active 2", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Pending 1", LifecycleState.PENDING, 75.0),
                createTestAutomation("Inactive 1", LifecycleState.INACTIVE, 65.0),
                createTestAutomation("Retired 1", LifecycleState.RETIRED, 55.0)
            );
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            Long activeCount = repository.countByLifecycleState(LifecycleState.ACTIVE);
            Long pendingCount = repository.countByLifecycleState(LifecycleState.PENDING);
            Long inactiveCount = repository.countByLifecycleState(LifecycleState.INACTIVE);
            Long retiredCount = repository.countByLifecycleState(LifecycleState.RETIRED);
            
            // Then
            assertEquals(2L, activeCount);
            assertEquals(1L, pendingCount);
            assertEquals(1L, inactiveCount);
            assertEquals(1L, retiredCount);
        }

        @Test
        @DisplayName("Should get performance scores with real database")
        @Transactional
        void shouldGetPerformanceScoresWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("High Performance", LifecycleState.ACTIVE, 95.0),
                createTestAutomation("Medium Performance", LifecycleState.ACTIVE, 75.0),
                createTestAutomation("Low Performance", LifecycleState.ACTIVE, 55.0)
            );
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            List<Double> scores = repository.getPerformanceScores();
            
            // Then
            assertNotNull(scores);
            assertEquals(3, scores.size());
            assertTrue(scores.contains(95.0));
            assertTrue(scores.contains(75.0));
            assertTrue(scores.contains(55.0));
        }

        @Test
        @DisplayName("Should get success rates with real database")
        @Transactional
        void shouldGetSuccessRatesWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("High Success", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Medium Success", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Low Success", LifecycleState.ACTIVE, 85.0)
            );
            
            automations.get(0).setSuccessRate(98.0);
            automations.get(1).setSuccessRate(85.0);
            automations.get(2).setSuccessRate(65.0);
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            List<Double> rates = repository.getSuccessRates();
            
            // Then
            assertNotNull(rates);
            assertEquals(3, rates.size());
            assertTrue(rates.contains(98.0));
            assertTrue(rates.contains(85.0));
            assertTrue(rates.contains(65.0));
        }

        @Test
        @DisplayName("Should get execution counts with real database")
        @Transactional
        void shouldGetExecutionCountsWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("High Execution", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Medium Execution", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Low Execution", LifecycleState.ACTIVE, 85.0)
            );
            
            automations.get(0).setExecutionCount(500);
            automations.get(1).setExecutionCount(200);
            automations.get(2).setExecutionCount(50);
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            List<Integer> counts = repository.getExecutionCounts();
            
            // Then
            assertNotNull(counts);
            assertEquals(3, counts.size());
            assertTrue(counts.contains(500));
            assertTrue(counts.contains(200));
            assertTrue(counts.contains(50));
        }

        @Test
        @DisplayName("Should get average execution times with real database")
        @Transactional
        void shouldGetAverageExecutionTimesWithRealDatabase() {
            // Given
            List<AutomationManagement> automations = List.of(
                createTestAutomation("Fast Execution", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Medium Execution", LifecycleState.ACTIVE, 85.0),
                createTestAutomation("Slow Execution", LifecycleState.ACTIVE, 85.0)
            );
            
            automations.get(0).setAverageExecutionTimeMs(100);
            automations.get(1).setAverageExecutionTimeMs(500);
            automations.get(2).setAverageExecutionTimeMs(1000);
            
            repository.saveAll(automations);
            flushAndClear();
            
            // When
            List<Integer> times = repository.getAverageExecutionTimes();
            
            // Then
            assertNotNull(times);
            assertEquals(3, times.size());
            assertTrue(times.contains(100));
            assertTrue(times.contains(500));
            assertTrue(times.contains(1000));
        }
    }



    /**
     * Helper method to create test automation with specified parameters
     */
    private AutomationManagement createTestAutomation(String name, LifecycleState state, double performanceScore) {
        AutomationManagement automation = new AutomationManagement();
        automation.setHomeAssistantAutomationId(generateTestHomeAssistantAutomationId());
        automation.setName(name);
        automation.setDescription("Test automation for " + name);
        automation.setLifecycleState(state);
        automation.setPerformanceScore(performanceScore);
        automation.setLastExecutionTime(Instant.now());
        automation.setExecutionCount(100);
        automation.setSuccessRate(85.0);
        automation.setAverageExecutionTimeMs(250);
        automation.setCreatedBy(generateTestUserId());
        automation.setModifiedBy(generateTestUserId());
        automation.setVersion(1);
        automation.setIsActive(true);
        return automation;
    }
}
