package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.ApprovalWorkflow;
import com.tappha.autonomous.entity.AutomationManagement;
import com.tappha.autonomous.entity.WorkflowStatus;
import com.tappha.autonomous.entity.WorkflowType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApprovalWorkflowRepository extends JpaRepository<ApprovalWorkflow, UUID> {
    
    // Find by automation management
    List<ApprovalWorkflow> findByAutomationManagementOrderByRequestTimestampDesc(AutomationManagement automationManagement);
    
    // Find by automation management ID
    @Query("SELECT w FROM ApprovalWorkflow w WHERE w.automationManagement.id = :automationManagementId")
    List<ApprovalWorkflow> findByAutomationManagementId(@Param("automationManagementId") UUID automationManagementId);
    
    // Find by automation management with pagination
    Page<ApprovalWorkflow> findByAutomationManagement(AutomationManagement automationManagement, Pageable pageable);
    
    // Find by workflow type
    List<ApprovalWorkflow> findByWorkflowType(WorkflowType workflowType);
    
    // Find by workflow type with pagination
    Page<ApprovalWorkflow> findByWorkflowType(WorkflowType workflowType, Pageable pageable);
    
    // Find by status
    List<ApprovalWorkflow> findByStatus(WorkflowStatus status);
    
    // Find by status with pagination
    Page<ApprovalWorkflow> findByStatus(WorkflowStatus status, Pageable pageable);
    
    // Find by workflow type and status
    List<ApprovalWorkflow> findByWorkflowTypeAndStatus(WorkflowType workflowType, WorkflowStatus status);
    
    // Find by requested by user
    List<ApprovalWorkflow> findByRequestedBy(UUID requestedBy);
    
    // Find by approved by user
    List<ApprovalWorkflow> findByApprovedBy(UUID approvedBy);
    
    // Find by rejected by user
    List<ApprovalWorkflow> findByRejectedBy(UUID rejectedBy);
    
    // Find by request timestamp range
    List<ApprovalWorkflow> findByRequestTimestampBetween(Instant startTime, Instant endTime);
    
    // Find by approval timestamp range
    List<ApprovalWorkflow> findByApprovalTimestampBetween(Instant startTime, Instant endTime);
    
    // Find by rejection timestamp range
    List<ApprovalWorkflow> findByRejectionTimestampBetween(Instant startTime, Instant endTime);
    
    // Find by automation management and status
    List<ApprovalWorkflow> findByAutomationManagementAndStatus(
        AutomationManagement automationManagement, WorkflowStatus status);
    
    // Find by automation management and workflow type
    List<ApprovalWorkflow> findByAutomationManagementAndWorkflowType(
        AutomationManagement automationManagement, WorkflowType workflowType);
    
    // Count workflows by status
    long countByStatus(WorkflowStatus status);
    
    // Count workflows by type
    long countByWorkflowType(WorkflowType workflowType);
    
    // Count workflows by automation management
    long countByAutomationManagement(AutomationManagement automationManagement);
    
    // Find workflows with emergency stop triggered
    List<ApprovalWorkflow> findByEmergencyStopTriggeredTrue();
    
    // Count workflows with emergency stop triggered
    long countByEmergencyStopTriggeredTrue();
    
    // Find by requested by user
    long countByRequestedBy(UUID requestedBy);
    
    // Find by approved by user
    long countByApprovedBy(UUID approvedBy);
    
    // Find by rejected by user
    long countByRejectedBy(UUID rejectedBy);
    
    // Analytics: Count workflows by type in date range
    @Query("SELECT w.workflowType, COUNT(w) FROM ApprovalWorkflow w " +
           "WHERE w.requestTimestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY w.workflowType")
    List<Object[]> countWorkflowsByTypeInDateRange(
        @Param("startTime") Instant startTime, 
        @Param("endTime") Instant endTime);
    
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
