package com.tappha.approval.repository;

import com.tappha.approval.entity.ApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for approval request data access
 * 
 * Provides comprehensive query methods for approval requests including:
 * - Basic CRUD operations
 * - Status-based queries
 * - Automation-specific queries
 * - Delegation queries
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface ApprovalRequestRepository extends JpaRepository<ApprovalRequest, String> {
    
    /**
     * Find approval requests by automation ID
     * 
     * @param automationId The automation ID
     * @return List of approval requests for the automation
     */
    List<ApprovalRequest> findByAutomationId(String automationId);
    
    /**
     * Find approval requests by status
     * 
     * @param status The status to filter by
     * @return List of approval requests with the specified status
     */
    List<ApprovalRequest> findByStatus(String status);
    
    /**
     * Find approval requests by requested user
     * 
     * @param requestedBy The user who requested the approval
     * @return List of approval requests requested by the user
     */
    List<ApprovalRequest> findByRequestedBy(String requestedBy);
    
    /**
     * Find approval requests by delegated user
     * 
     * @param delegatedTo The user to whom the approval was delegated
     * @return List of approval requests delegated to the user
     */
    List<ApprovalRequest> findByDelegatedTo(String delegatedTo);
    
    /**
     * Find approval requests by priority
     * 
     * @param priority The priority level
     * @return List of approval requests with the specified priority
     */
    List<ApprovalRequest> findByPriority(String priority);
    
    /**
     * Find approval requests by request type
     * 
     * @param requestType The type of request
     * @return List of approval requests with the specified type
     */
    List<ApprovalRequest> findByRequestType(String requestType);
    
    /**
     * Find pending approval requests for a specific automation
     * 
     * @param automationId The automation ID
     * @return List of pending approval requests for the automation
     */
    @Query("SELECT ar FROM ApprovalRequest ar WHERE ar.automationId = :automationId AND ar.status = 'PENDING'")
    List<ApprovalRequest> findPendingByAutomationId(@Param("automationId") String automationId);
    
    /**
     * Find high priority approval requests
     * 
     * @return List of high priority approval requests
     */
    @Query("SELECT ar FROM ApprovalRequest ar WHERE ar.priority IN ('HIGH', 'CRITICAL') AND ar.status = 'PENDING'")
    List<ApprovalRequest> findHighPriorityPending();
    
    /**
     * Count approval requests by status
     * 
     * @param status The status to count
     * @return Count of approval requests with the specified status
     */
    long countByStatus(String status);
    
    /**
     * Count approval requests by automation ID
     * 
     * @param automationId The automation ID
     * @return Count of approval requests for the automation
     */
    long countByAutomationId(String automationId);
} 