package com.tappha.autonomous.repository.integration;

import com.tappha.autonomous.entity.ApprovalWorkflow;
import com.tappha.autonomous.entity.AutomationManagement;
import com.tappha.autonomous.entity.LifecycleState;
import com.tappha.autonomous.entity.WorkflowStatus;
import com.tappha.autonomous.entity.WorkflowType;
import com.tappha.autonomous.repository.ApprovalWorkflowRepository;
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
 * Integration tests for ApprovalWorkflowRepository using Testcontainers
 * 
 * Tests cover:
 * - Real database CRUD operations
 * - Custom query methods with actual data
 * - Pagination with database-level sorting
 * - Analytics queries with real data
 * - Workflow state management
 * - Emergency stop functionality
 * - Data validation constraints
 * - Foreign key relationships
 */
@DisplayName("ApprovalWorkflow Repository Integration Tests")
class ApprovalWorkflowRepositoryIntegrationTest extends BaseRepositoryIntegrationTest {

    @Autowired
    private ApprovalWorkflowRepository repository;

    @Autowired
    private AutomationManagementRepository automationRepository;

    private UUID testUserId;
    private UUID testAutomationId;
    private ApprovalWorkflow testWorkflow;

    @Override
    protected void setUp() {
        super.setUp();
        testUserId = generateTestUserId();
        
        // Create a test automation first
        AutomationManagement automation = createTestAutomation();
        testAutomationId = automation.getId();
        
        testWorkflow = new ApprovalWorkflow();
        testWorkflow.setAutomationManagement(automation);
        testWorkflow.setWorkflowType(WorkflowType.CREATION);
        testWorkflow.setStatus(WorkflowStatus.PENDING);
        testWorkflow.setRequestedBy(testUserId);
        testWorkflow.setRequestTimestamp(Instant.now());
        testWorkflow.setApprovalNotes("Test workflow for integration testing");
        testWorkflow.setEmergencyStopTriggered(false);
    }

    @Nested
    @DisplayName("Integration CRUD Operations")
    class IntegrationCrudOperations {

        @Test
        @DisplayName("Should persist and retrieve workflow with real database")
        @Transactional
        void shouldPersistAndRetrieveWorkflowWithRealDatabase() {
            // Given
            ApprovalWorkflow workflow = testWorkflow;
            
            // When
            ApprovalWorkflow saved = repository.save(workflow);
            flushAndClear();
            
            Optional<ApprovalWorkflow> found = repository.findById(saved.getId());
            
            // Then
            assertTrue(found.isPresent());
            assertEquals(saved.getId(), found.get().getId());
            assertEquals(workflow.getAutomationManagementId(), found.get().getAutomationManagementId());
            assertEquals(workflow.getWorkflowType(), found.get().getWorkflowType());
            assertEquals(workflow.getStatus(), found.get().getStatus());
            assertEquals(workflow.getRequestedBy(), found.get().getRequestedBy());
            assertEquals(workflow.getRequestReason(), found.get().getRequestReason());
            assertEquals(workflow.getEmergencyStopTriggered(), found.get().getEmergencyStopTriggered());
        }

        @Test
        @DisplayName("Should update workflow with real database")
        @Transactional
        void shouldUpdateWorkflowWithRealDatabase() {
            // Given
            ApprovalWorkflow saved = repository.save(testWorkflow);
            flushAndClear();
            
            // When
            ApprovalWorkflow found = repository.findById(saved.getId()).orElseThrow();
            found.setStatus(WorkflowStatus.APPROVED);
            found.setApprovedBy(generateTestUserId());
            found.setApprovalTimestamp(Instant.now());
            found.setApprovalReason("Approved for integration testing");
            
            ApprovalWorkflow updated = repository.save(found);
            flushAndClear();
            
            // Then
            ApprovalWorkflow retrieved = repository.findById(saved.getId()).orElseThrow();
            assertEquals(WorkflowStatus.APPROVED, retrieved.getStatus());
            assertNotNull(retrieved.getApprovedBy());
            assertNotNull(retrieved.getApprovalTimestamp());
            assertEquals("Approved for integration testing", retrieved.getApprovalReason());
        }

        @Test
        @DisplayName("Should delete workflow with real database")
        @Transactional
        void shouldDeleteWorkflowWithRealDatabase() {
            // Given
            ApprovalWorkflow saved = repository.save(testWorkflow);
            flushAndClear();
            
            // When
            repository.deleteById(saved.getId());
            flushAndClear();
            
            // Then
            Optional<ApprovalWorkflow> found = repository.findById(saved.getId());
            assertFalse(found.isPresent());
        }

        @Test
        @DisplayName("Should handle multiple workflows with real database")
        @Transactional
        void shouldHandleMultipleWorkflowsWithRealDatabase() {
            // Given
            ApprovalWorkflow workflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING);
            ApprovalWorkflow workflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED);
            ApprovalWorkflow workflow3 = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.REJECTED);
            
            repository.saveAll(List.of(workflow1, workflow2, workflow3));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> allWorkflows = repository.findAll();
            
            // Then
            assertEquals(3, allWorkflows.size());
            assertTrue(allWorkflows.stream().anyMatch(w -> w.getWorkflowType() == WorkflowType.CREATION));
            assertTrue(allWorkflows.stream().anyMatch(w -> w.getWorkflowType() == WorkflowType.MODIFICATION));
            assertTrue(allWorkflows.stream().anyMatch(w -> w.getWorkflowType() == WorkflowType.RETIREMENT));
        }
    }

    @Nested
    @DisplayName("Integration Custom Query Tests")
    class IntegrationCustomQueryTests {

        @Test
        @DisplayName("Should find workflows by automation management ID with real database")
        @Transactional
        void shouldFindWorkflowsByAutomationManagementIdWithRealDatabase() {
            // Given
            ApprovalWorkflow saved = repository.save(testWorkflow);
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> found = repository.findByAutomationManagementId(testAutomationId);
            
            // Then
            assertEquals(1, found.size());
            assertEquals(saved.getId(), found.get(0).getId());
            assertEquals(testAutomationId, found.get(0).getAutomationManagementId());
        }

        @Test
        @DisplayName("Should find workflows by status with real database")
        @Transactional
        void shouldFindWorkflowsByStatusWithRealDatabase() {
            // Given
            ApprovalWorkflow pendingWorkflow = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING);
            ApprovalWorkflow approvedWorkflow = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED);
            ApprovalWorkflow rejectedWorkflow = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.REJECTED);
            
            repository.saveAll(List.of(pendingWorkflow, approvedWorkflow, rejectedWorkflow));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> pendingWorkflows = repository.findByStatus(WorkflowStatus.PENDING);
            List<ApprovalWorkflow> approvedWorkflows = repository.findByStatus(WorkflowStatus.APPROVED);
            List<ApprovalWorkflow> rejectedWorkflows = repository.findByStatus(WorkflowStatus.REJECTED);
            
            // Then
            assertEquals(1, pendingWorkflows.size());
            assertEquals(1, approvedWorkflows.size());
            assertEquals(1, rejectedWorkflows.size());
            assertEquals(WorkflowStatus.PENDING, pendingWorkflows.get(0).getStatus());
            assertEquals(WorkflowStatus.APPROVED, approvedWorkflows.get(0).getStatus());
            assertEquals(WorkflowStatus.REJECTED, rejectedWorkflows.get(0).getStatus());
        }

        @Test
        @DisplayName("Should find workflows by workflow type with real database")
        @Transactional
        void shouldFindWorkflowsByWorkflowTypeWithRealDatabase() {
            // Given
            ApprovalWorkflow creationWorkflow = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING);
            ApprovalWorkflow modificationWorkflow = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING);
            ApprovalWorkflow retirementWorkflow = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.PENDING);
            
            repository.saveAll(List.of(creationWorkflow, modificationWorkflow, retirementWorkflow));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> creationWorkflows = repository.findByWorkflowType(WorkflowType.CREATION);
            List<ApprovalWorkflow> modificationWorkflows = repository.findByWorkflowType(WorkflowType.MODIFICATION);
            List<ApprovalWorkflow> retirementWorkflows = repository.findByWorkflowType(WorkflowType.RETIREMENT);
            
            // Then
            assertEquals(1, creationWorkflows.size());
            assertEquals(1, modificationWorkflows.size());
            assertEquals(1, retirementWorkflows.size());
            assertEquals(WorkflowType.CREATION, creationWorkflows.get(0).getWorkflowType());
            assertEquals(WorkflowType.MODIFICATION, modificationWorkflows.get(0).getWorkflowType());
            assertEquals(WorkflowType.RETIREMENT, retirementWorkflows.get(0).getWorkflowType());
        }

        @Test
        @DisplayName("Should find pending workflows with real database")
        @Transactional
        void shouldFindPendingWorkflowsWithRealDatabase() {
            // Given
            ApprovalWorkflow pendingWorkflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING);
            ApprovalWorkflow pendingWorkflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING);
            ApprovalWorkflow approvedWorkflow = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.APPROVED);
            
            repository.saveAll(List.of(pendingWorkflow1, pendingWorkflow2, approvedWorkflow));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> pendingWorkflows = repository.findByStatus(WorkflowStatus.PENDING);
            
            // Then
            assertEquals(2, pendingWorkflows.size());
            assertTrue(pendingWorkflows.stream().allMatch(w -> w.getStatus() == WorkflowStatus.PENDING));
        }

        @Test
        @DisplayName("Should find workflows by requested by user with real database")
        @Transactional
        void shouldFindWorkflowsByRequestedByUserWithRealDatabase() {
            // Given
            UUID user1 = generateTestUserId();
            UUID user2 = generateTestUserId();
            
            ApprovalWorkflow user1Workflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING);
            user1Workflow1.setRequestedBy(user1);
            ApprovalWorkflow user1Workflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING);
            user1Workflow2.setRequestedBy(user1);
            ApprovalWorkflow user2Workflow = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.PENDING);
            user2Workflow.setRequestedBy(user2);
            
            repository.saveAll(List.of(user1Workflow1, user1Workflow2, user2Workflow));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> user1Workflows = repository.findByRequestedBy(user1);
            List<ApprovalWorkflow> user2Workflows = repository.findByRequestedBy(user2);
            
            // Then
            assertEquals(2, user1Workflows.size());
            assertEquals(1, user2Workflows.size());
            assertTrue(user1Workflows.stream().allMatch(w -> w.getRequestedBy().equals(user1)));
            assertTrue(user2Workflows.stream().allMatch(w -> w.getRequestedBy().equals(user2)));
        }

        @Test
        @DisplayName("Should find workflows by approved by user with real database")
        @Transactional
        void shouldFindWorkflowsByApprovedByUserWithRealDatabase() {
            // Given
            UUID approver1 = generateTestUserId();
            UUID approver2 = generateTestUserId();
            
            ApprovalWorkflow approvedWorkflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.APPROVED);
            approvedWorkflow1.setApprovedBy(approver1);
            approvedWorkflow1.setApprovalTimestamp(Instant.now());
            ApprovalWorkflow approvedWorkflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED);
            approvedWorkflow2.setApprovedBy(approver1);
            approvedWorkflow2.setApprovalTimestamp(Instant.now());
            ApprovalWorkflow approvedWorkflow3 = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.APPROVED);
            approvedWorkflow3.setApprovedBy(approver2);
            approvedWorkflow3.setApprovalTimestamp(Instant.now());
            
            repository.saveAll(List.of(approvedWorkflow1, approvedWorkflow2, approvedWorkflow3));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> approver1Workflows = repository.findByApprovedBy(approver1);
            List<ApprovalWorkflow> approver2Workflows = repository.findByApprovedBy(approver2);
            
            // Then
            assertEquals(2, approver1Workflows.size());
            assertEquals(1, approver2Workflows.size());
            assertTrue(approver1Workflows.stream().allMatch(w -> w.getApprovedBy().equals(approver1)));
            assertTrue(approver2Workflows.stream().allMatch(w -> w.getApprovedBy().equals(approver2)));
        }

        @Test
        @DisplayName("Should find workflows by rejected by user with real database")
        @Transactional
        void shouldFindWorkflowsByRejectedByUserWithRealDatabase() {
            // Given
            UUID rejecter1 = generateTestUserId();
            UUID rejecter2 = generateTestUserId();
            
            ApprovalWorkflow rejectedWorkflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.REJECTED);
            rejectedWorkflow1.setRejectedBy(rejecter1);
            rejectedWorkflow1.setRejectionTimestamp(Instant.now());
            ApprovalWorkflow rejectedWorkflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.REJECTED);
            rejectedWorkflow2.setRejectedBy(rejecter1);
            rejectedWorkflow2.setRejectionTimestamp(Instant.now());
            ApprovalWorkflow rejectedWorkflow3 = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.REJECTED);
            rejectedWorkflow3.setRejectedBy(rejecter2);
            rejectedWorkflow3.setRejectionTimestamp(Instant.now());
            
            repository.saveAll(List.of(rejectedWorkflow1, rejectedWorkflow2, rejectedWorkflow3));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> rejecter1Workflows = repository.findByRejectedBy(rejecter1);
            List<ApprovalWorkflow> rejecter2Workflows = repository.findByRejectedBy(rejecter2);
            
            // Then
            assertEquals(2, rejecter1Workflows.size());
            assertEquals(1, rejecter2Workflows.size());
            assertTrue(rejecter1Workflows.stream().allMatch(w -> w.getRejectedBy().equals(rejecter1)));
            assertTrue(rejecter2Workflows.stream().allMatch(w -> w.getRejectedBy().equals(rejecter2)));
        }

        @Test
        @DisplayName("Should find emergency stop workflows with real database")
        @Transactional
        void shouldFindEmergencyStopWorkflowsWithRealDatabase() {
            // Given
            ApprovalWorkflow emergencyWorkflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING);
            emergencyWorkflow1.setEmergencyStopTriggered(true);
            ApprovalWorkflow emergencyWorkflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED);
            emergencyWorkflow2.setEmergencyStopTriggered(true);
            ApprovalWorkflow normalWorkflow = createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.PENDING);
            normalWorkflow.setEmergencyStopTriggered(false);
            
            repository.saveAll(List.of(emergencyWorkflow1, emergencyWorkflow2, normalWorkflow));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> emergencyWorkflows = repository.findByEmergencyStopTriggeredTrue();
            
            // Then
            assertEquals(2, emergencyWorkflows.size());
            assertTrue(emergencyWorkflows.stream().allMatch(ApprovalWorkflow::getEmergencyStopTriggered));
        }

        @Test
        @DisplayName("Should find workflows by request timestamp range with real database")
        @Transactional
        void shouldFindWorkflowsByRequestTimestampRangeWithRealDatabase() {
            // Given
            Instant now = Instant.now();
            Instant oneHourAgo = now.minusSeconds(3600);
            Instant twoHoursAgo = now.minusSeconds(7200);
            
            ApprovalWorkflow recentWorkflow = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING);
            recentWorkflow.setRequestTimestamp(now);
            ApprovalWorkflow oldWorkflow = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING);
            oldWorkflow.setRequestTimestamp(twoHoursAgo);
            
            repository.saveAll(List.of(recentWorkflow, oldWorkflow));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> recentWorkflows = repository.findByRequestTimestampBetween(oneHourAgo, now.plusSeconds(1));
            List<ApprovalWorkflow> oldWorkflows = repository.findByRequestTimestampBetween(twoHoursAgo.minusSeconds(1), oneHourAgo);
            
            // Then
            assertEquals(1, recentWorkflows.size());
            assertEquals(1, oldWorkflows.size());
            assertEquals(now, recentWorkflows.get(0).getRequestTimestamp());
            assertEquals(twoHoursAgo, oldWorkflows.get(0).getRequestTimestamp());
        }

        @Test
        @DisplayName("Should find workflows by approval timestamp range with real database")
        @Transactional
        void shouldFindWorkflowsByApprovalTimestampRangeWithRealDatabase() {
            // Given
            Instant now = Instant.now();
            Instant oneHourAgo = now.minusSeconds(3600);
            
            ApprovalWorkflow approvedWorkflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.APPROVED);
            approvedWorkflow1.setApprovedBy(generateTestUserId());
            approvedWorkflow1.setApprovalTimestamp(now);
            ApprovalWorkflow approvedWorkflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED);
            approvedWorkflow2.setApprovedBy(generateTestUserId());
            approvedWorkflow2.setApprovalTimestamp(oneHourAgo);
            
            repository.saveAll(List.of(approvedWorkflow1, approvedWorkflow2));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> recentApprovedWorkflows = repository.findByApprovalTimestampBetween(oneHourAgo, now.plusSeconds(1));
            
            // Then
            assertEquals(2, recentApprovedWorkflows.size());
            assertTrue(recentApprovedWorkflows.stream().allMatch(w -> w.getApprovalTimestamp() != null));
        }

        @Test
        @DisplayName("Should find workflows by rejection timestamp range with real database")
        @Transactional
        void shouldFindWorkflowsByRejectionTimestampRangeWithRealDatabase() {
            // Given
            Instant now = Instant.now();
            Instant oneHourAgo = now.minusSeconds(3600);
            
            ApprovalWorkflow rejectedWorkflow1 = createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.REJECTED);
            rejectedWorkflow1.setRejectedBy(generateTestUserId());
            rejectedWorkflow1.setRejectionTimestamp(now);
            ApprovalWorkflow rejectedWorkflow2 = createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.REJECTED);
            rejectedWorkflow2.setRejectedBy(generateTestUserId());
            rejectedWorkflow2.setRejectionTimestamp(oneHourAgo);
            
            repository.saveAll(List.of(rejectedWorkflow1, rejectedWorkflow2));
            flushAndClear();
            
            // When
            List<ApprovalWorkflow> recentRejectedWorkflows = repository.findByRejectionTimestampBetween(oneHourAgo, now.plusSeconds(1));
            
            // Then
            assertEquals(2, recentRejectedWorkflows.size());
            assertTrue(recentRejectedWorkflows.stream().allMatch(w -> w.getRejectionTimestamp() != null));
        }
    }

    @Nested
    @DisplayName("Integration Pagination Tests")
    class IntegrationPaginationTests {

        @Test
        @DisplayName("Should find workflows with pagination and real database")
        @Transactional
        void shouldFindWorkflowsWithPaginationAndRealDatabase() {
            // Given
            List<ApprovalWorkflow> workflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.APPROVED),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED)
            );
            
            repository.saveAll(workflows);
            flushAndClear();
            
            // When
            Pageable pageable = PageRequest.of(0, 2, Sort.by("requestTimestamp"));
            Page<ApprovalWorkflow> firstPage = repository.findAll(pageable);
            
            Pageable secondPageable = PageRequest.of(1, 2, Sort.by("requestTimestamp"));
            Page<ApprovalWorkflow> secondPage = repository.findAll(secondPageable);
            
            // Then
            assertEquals(2, firstPage.getContent().size());
            assertEquals(5, firstPage.getTotalElements());
            assertEquals(3, firstPage.getTotalPages());
            assertEquals(2, secondPage.getContent().size());
            assertEquals(5, secondPage.getTotalElements());
            assertEquals(3, secondPage.getTotalPages());
        }

        @Test
        @DisplayName("Should find workflows by status with pagination and real database")
        @Transactional
        void shouldFindWorkflowsByStatusWithPaginationAndRealDatabase() {
            // Given
            List<ApprovalWorkflow> pendingWorkflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.PENDING)
            );
            
            List<ApprovalWorkflow> approvedWorkflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.APPROVED),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED)
            );
            
            repository.saveAll(pendingWorkflows);
            repository.saveAll(approvedWorkflows);
            flushAndClear();
            
            // When
            Pageable pageable = PageRequest.of(0, 2, Sort.by("requestTimestamp"));
            Page<ApprovalWorkflow> pendingPage = repository.findByStatus(WorkflowStatus.PENDING, pageable);
            Page<ApprovalWorkflow> approvedPage = repository.findByStatus(WorkflowStatus.APPROVED, pageable);
            
            // Then
            assertEquals(2, pendingPage.getContent().size());
            assertEquals(3, pendingPage.getTotalElements());
            assertEquals(2, pendingPage.getTotalPages());
            assertEquals(2, approvedPage.getContent().size());
            assertEquals(2, approvedPage.getTotalElements());
            assertEquals(1, approvedPage.getTotalPages());
        }

        @Test
        @DisplayName("Should find workflows by workflow type with pagination and real database")
        @Transactional
        void shouldFindWorkflowsByWorkflowTypeWithPaginationAndRealDatabase() {
            // Given
            List<ApprovalWorkflow> creationWorkflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.APPROVED),
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.REJECTED)
            );
            
            List<ApprovalWorkflow> modificationWorkflows = List.of(
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED)
            );
            
            repository.saveAll(creationWorkflows);
            repository.saveAll(modificationWorkflows);
            flushAndClear();
            
            // When
            Pageable pageable = PageRequest.of(0, 2, Sort.by("requestTimestamp"));
            Page<ApprovalWorkflow> creationPage = repository.findByWorkflowType(WorkflowType.CREATION, pageable);
            Page<ApprovalWorkflow> modificationPage = repository.findByWorkflowType(WorkflowType.MODIFICATION, pageable);
            
            // Then
            assertEquals(2, creationPage.getContent().size());
            assertEquals(3, creationPage.getTotalElements());
            assertEquals(2, creationPage.getTotalPages());
            assertEquals(2, modificationPage.getContent().size());
            assertEquals(2, modificationPage.getTotalElements());
            assertEquals(1, modificationPage.getTotalPages());
        }
    }

    @Nested
    @DisplayName("Integration Analytics Tests")
    class IntegrationAnalyticsTests {

        @Test
        @DisplayName("Should get count by status with real database")
        @Transactional
        void shouldGetCountByStatusWithRealDatabase() {
            // Given
            List<ApprovalWorkflow> workflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.APPROVED),
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.REJECTED),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.CANCELLED)
            );
            
            repository.saveAll(workflows);
            flushAndClear();
            
            // When
            Long pendingCount = repository.countByStatus(WorkflowStatus.PENDING);
            Long approvedCount = repository.countByStatus(WorkflowStatus.APPROVED);
            Long rejectedCount = repository.countByStatus(WorkflowStatus.REJECTED);
            Long cancelledCount = repository.countByStatus(WorkflowStatus.CANCELLED);
            
            // Then
            assertEquals(2L, pendingCount);
            assertEquals(1L, approvedCount);
            assertEquals(1L, rejectedCount);
            assertEquals(1L, cancelledCount);
        }

        @Test
        @DisplayName("Should get count by workflow type with real database")
        @Transactional
        void shouldGetCountByWorkflowTypeWithRealDatabase() {
            // Given
            List<ApprovalWorkflow> workflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.APPROVED),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.REJECTED)
            );
            
            repository.saveAll(workflows);
            flushAndClear();
            
            // When
            Long creationCount = repository.countByWorkflowType(WorkflowType.CREATION);
            Long modificationCount = repository.countByWorkflowType(WorkflowType.MODIFICATION);
            Long retirementCount = repository.countByWorkflowType(WorkflowType.RETIREMENT);
            
            // Then
            assertEquals(2L, creationCount);
            assertEquals(1L, modificationCount);
            assertEquals(1L, retirementCount);
        }

        @Test
        @DisplayName("Should get count of emergency stop workflows with real database")
        @Transactional
        void shouldGetCountOfEmergencyStopWorkflowsWithRealDatabase() {
            // Given
            List<ApprovalWorkflow> workflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.PENDING)
            );
            
            workflows.get(0).setEmergencyStopTriggered(true);
            workflows.get(2).setEmergencyStopTriggered(true);
            
            repository.saveAll(workflows);
            flushAndClear();
            
            // When
            Long emergencyCount = repository.countByEmergencyStopTriggeredTrue();
            
            // Then
            assertEquals(2L, emergencyCount);
        }

        @Test
        @DisplayName("Should get count by requested by user with real database")
        @Transactional
        void shouldGetCountByRequestedByUserWithRealDatabase() {
            // Given
            UUID user1 = generateTestUserId();
            UUID user2 = generateTestUserId();
            
            List<ApprovalWorkflow> workflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.PENDING),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.PENDING)
            );
            
            workflows.get(0).setRequestedBy(user1);
            workflows.get(1).setRequestedBy(user1);
            workflows.get(2).setRequestedBy(user2);
            
            repository.saveAll(workflows);
            flushAndClear();
            
            // When
            Long user1Count = repository.countByRequestedBy(user1);
            Long user2Count = repository.countByRequestedBy(user2);
            
            // Then
            assertEquals(2L, user1Count);
            assertEquals(1L, user2Count);
        }

        @Test
        @DisplayName("Should get count by approved by user with real database")
        @Transactional
        void shouldGetCountByApprovedByUserWithRealDatabase() {
            // Given
            UUID approver1 = generateTestUserId();
            UUID approver2 = generateTestUserId();
            
            List<ApprovalWorkflow> workflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.APPROVED),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.APPROVED),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.APPROVED)
            );
            
            workflows.get(0).setApprovedBy(approver1);
            workflows.get(0).setApprovalTimestamp(Instant.now());
            workflows.get(1).setApprovedBy(approver1);
            workflows.get(1).setApprovalTimestamp(Instant.now());
            workflows.get(2).setApprovedBy(approver2);
            workflows.get(2).setApprovalTimestamp(Instant.now());
            
            repository.saveAll(workflows);
            flushAndClear();
            
            // When
            Long approver1Count = repository.countByApprovedBy(approver1);
            Long approver2Count = repository.countByApprovedBy(approver2);
            
            // Then
            assertEquals(2L, approver1Count);
            assertEquals(1L, approver2Count);
        }

        @Test
        @DisplayName("Should get count by rejected by user with real database")
        @Transactional
        void shouldGetCountByRejectedByUserWithRealDatabase() {
            // Given
            UUID rejecter1 = generateTestUserId();
            UUID rejecter2 = generateTestUserId();
            
            List<ApprovalWorkflow> workflows = List.of(
                createTestWorkflow(WorkflowType.CREATION, WorkflowStatus.REJECTED),
                createTestWorkflow(WorkflowType.MODIFICATION, WorkflowStatus.REJECTED),
                createTestWorkflow(WorkflowType.RETIREMENT, WorkflowStatus.REJECTED)
            );
            
            workflows.get(0).setRejectedBy(rejecter1);
            workflows.get(0).setRejectionTimestamp(Instant.now());
            workflows.get(1).setRejectedBy(rejecter1);
            workflows.get(1).setRejectionTimestamp(Instant.now());
            workflows.get(2).setRejectedBy(rejecter2);
            workflows.get(2).setRejectionTimestamp(Instant.now());
            
            repository.saveAll(workflows);
            flushAndClear();
            
            // When
            Long rejecter1Count = repository.countByRejectedBy(rejecter1);
            Long rejecter2Count = repository.countByRejectedBy(rejecter2);
            
            // Then
            assertEquals(2L, rejecter1Count);
            assertEquals(1L, rejecter2Count);
        }
    }

    /**
     * Helper method to create test automation
     */
    private AutomationManagement createTestAutomation() {
        AutomationManagement automation = new AutomationManagement();
        automation.setHomeAssistantAutomationId(generateTestHomeAssistantAutomationId());
        automation.setName("Test Automation for Workflow");
        automation.setDescription("Test automation for workflow integration testing");
        automation.setLifecycleState(LifecycleState.ACTIVE);
        automation.setPerformanceScore(85.0);
        automation.setLastExecutionTime(Instant.now());
        automation.setExecutionCount(100);
        automation.setSuccessRate(85.0);
        automation.setAverageExecutionTimeMs(250);
        automation.setCreatedBy(generateTestUserId());
        automation.setModifiedBy(generateTestUserId());
        automation.setVersion(1);
        automation.setIsActive(true);
        
        return automationRepository.save(automation);
    }

    /**
     * Helper method to create test workflow with specified parameters
     */
    private ApprovalWorkflow createTestWorkflow(WorkflowType type, WorkflowStatus status) {
        ApprovalWorkflow workflow = new ApprovalWorkflow();
        workflow.setAutomationManagementId(testAutomationId);
        workflow.setWorkflowType(type);
        workflow.setStatus(status);
        workflow.setRequestedBy(generateTestUserId());
        workflow.setRequestTimestamp(Instant.now());
        workflow.setRequestReason("Test workflow for " + type + " with status " + status);
        workflow.setEmergencyStopTriggered(false);
        workflow.setMetadata("{\"test\": \"integration\", \"type\": \"" + type + "\", \"status\": \"" + status + "\"}");
        return workflow;
    }
}
