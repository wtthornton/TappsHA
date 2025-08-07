package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.ApprovalWorkflow;
import com.tappha.autonomous.entity.WorkflowStatus;
import com.tappha.autonomous.entity.WorkflowType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, UUID> {
    
    // Find by automation management ID
    List<ApprovalWorkflow> findByAutomationManagementIdOrderByCreatedAtDesc(UUID automationManagementId);
    
    // Find by automation management ID with pagination
    Page<ApprovalWorkflow> findByAutomationManagementId(UUID automationManagementId, Pageable pageable);
    
    // Find by workflow type
    List<ApprovalWorkflow> findByWorkflowType(WorkflowType workflowType);
    
    // Find by workflow status
    List<ApprovalWorkflow> findByWorkflowStatus(WorkflowStatus workflowStatus);
    
    // Find by workflow type and status
    List<ApprovalWorkflow> findByWorkflowTypeAndWorkflowStatus(WorkflowType workflowType, WorkflowStatus workflowStatus);
    
    // Find by requested by user
    List<ApprovalWorkflow> findByRequestedBy(UUID requestedBy);
    
    // Find by approved by user
    List<ApprovalWorkflow> findByApprovedBy(UUID approvedBy);
    
    // Find by rejected by user
    List<ApprovalWorkflow> findByRejectedBy(UUID rejectedBy);
    
    // Find pending workflows
    List<ApprovalWorkflow> findByWorkflowStatusOrderByCreatedAtAsc(WorkflowStatus workflowStatus);
    
    // Find by creation date range
    List<ApprovalWorkflow> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by approval date range
    List<ApprovalWorkflow> findByApprovedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by automation management ID and workflow status
    List<ApprovalWorkflow> findByAutomationManagementIdAndWorkflowStatus(
        UUID automationManagementId, WorkflowStatus workflowStatus);
    
    // Find by automation management ID and workflow type
    List<ApprovalWorkflow> findByAutomationManagementIdAndWorkflowType(
        UUID automationManagementId, WorkflowType workflowType);
    
    // Count workflows by status
    long countByWorkflowStatus(WorkflowStatus workflowStatus);
    
    // Count workflows by type
    long countByWorkflowType(WorkflowType workflowType);
    
    // Count workflows by automation management ID
    long countByAutomationManagementId(UUID automationManagementId);
    
    // Find workflows with emergency stop triggered
    List<ApprovalWorkflow> findByEmergencyStopTriggeredTrue();
    
    // Find workflows with emergency stop triggered by specific user
    List<ApprovalWorkflow> findByEmergencyStopTriggeredTrueAndEmergencyStopTriggeredBy(UUID triggeredBy);
    
    // Find latest workflow for specific automation
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.automationManagementId = :automationId " +
           "ORDER BY w.createdAt DESC LIMIT 1")
    ApprovalWorkflow findLatestWorkflowByAutomationId(@Param("automationId") UUID automationId);
    
    // Find pending workflows for specific automation
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.automationManagementId = :automationId " +
           "AND w.workflowStatus = 'PENDING' ORDER BY w.createdAt ASC")
    List<ApprovalWorkflow> findPendingWorkflowsByAutomationId(@Param("automationId") UUID automationId);
    
    // Find workflows with specific approval reason pattern
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.approvalReason LIKE %:reasonPattern%")
    List<ApprovalWorkflow> findByApprovalReasonContaining(@Param("reasonPattern") String reasonPattern);
    
    // Find workflows with specific rejection reason pattern
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.rejectionReason LIKE %:reasonPattern%")
    List<ApprovalWorkflow> findByRejectionReasonContaining(@Param("reasonPattern") String reasonPattern);
    
    // Analytics: Count workflows by status in date range
    @Query("SELECT w.workflowStatus, COUNT(w) FROM ApprovalWorkflow w " +
           "WHERE w.createdAt BETWEEN :startTime AND :endTime " +
           "GROUP BY w.workflowStatus")
    List<Object[]> countWorkflowsByStatusInDateRange(
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime);
    
    // Analytics: Count workflows by type in date range
    @Query("SELECT w.workflowType, COUNT(w) FROM ApprovalWorkflow w " +
           "WHERE w.createdAt BETWEEN :startTime AND :endTime " +
           "GROUP BY w.workflowType")
    List<Object[]> countWorkflowsByTypeInDateRange(
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime);
    
    // Analytics: Find most active requesters
    @Query("SELECT w.requestedBy, COUNT(w) as requestCount FROM ApprovalWorkflow w " +
           "GROUP BY w.requestedBy ORDER BY requestCount DESC")
    List<Object[]> findMostActiveRequesters();
    
    // Analytics: Find approval/rejection frequency by user
    @Query("SELECT w.approvedBy, COUNT(w) as approvalCount FROM ApprovalWorkflow w " +
           "WHERE w.approvedBy IS NOT NULL " +
           "GROUP BY w.approvedBy ORDER BY approvalCount DESC")
    List<Object[]> findApprovalFrequencyByUser();
    
    // Analytics: Find rejection frequency by user
    @Query("SELECT w.rejectedBy, COUNT(w) as rejectionCount FROM ApprovalWorkflow w " +
           "WHERE w.rejectedBy IS NOT NULL " +
           "GROUP BY w.rejectedBy ORDER BY rejectionCount DESC")
    List<Object[]> findRejectionFrequencyByUser();
    
    // Find workflows with metadata containing specific key
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.metadata ? :key")
    List<ApprovalWorkflow> findByMetadataKey(@Param("key") String key);
    
    // Find workflows with metadata containing specific key-value pair
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.metadata ->> :key = :value")
    List<ApprovalWorkflow> findByMetadataKeyValue(
        @Param("key") String key, @Param("value") String value);
    
    // Find workflows with affected entities containing specific entity
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.affectedEntities ? :entityId")
    List<ApprovalWorkflow> findByAffectedEntity(@Param("entityId") String entityId);
}
