package com.tappha.approval.repository;

import com.tappha.approval.entity.ApprovalDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for approval decision data access
 * 
 * Provides comprehensive query methods for approval decisions including:
 * - Basic CRUD operations
 * - Request-specific queries
 * - Decision-based queries
 * - User-specific queries
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface ApprovalDecisionRepository extends JpaRepository<ApprovalDecision, String> {
    
    /**
     * Find approval decisions by request ID
     * 
     * @param requestId The approval request ID
     * @return List of approval decisions for the request
     */
    List<ApprovalDecision> findByRequestId(String requestId);
    
    /**
     * Find approval decisions by decision type
     * 
     * @param decision The decision type (APPROVED, REJECTED)
     * @return List of approval decisions with the specified type
     */
    List<ApprovalDecision> findByDecision(String decision);
    
    /**
     * Find approval decisions by user who made the decision
     * 
     * @param decidedBy The user who made the decision
     * @return List of approval decisions made by the user
     */
    List<ApprovalDecision> findByDecidedBy(String decidedBy);
    
    /**
     * Find the latest decision for a request
     * 
     * @param requestId The approval request ID
     * @return Optional of the latest approval decision for the request
     */
    @Query("SELECT ad FROM ApprovalDecision ad WHERE ad.requestId = :requestId ORDER BY ad.decidedAt DESC")
    List<ApprovalDecision> findLatestByRequestId(@Param("requestId") String requestId);
    
    /**
     * Count approval decisions by decision type
     * 
     * @param decision The decision type to count
     * @return Count of approval decisions with the specified type
     */
    long countByDecision(String decision);
    
    /**
     * Count approval decisions by user
     * 
     * @param decidedBy The user who made the decisions
     * @return Count of approval decisions made by the user
     */
    long countByDecidedBy(String decidedBy);
    
    /**
     * Count approval decisions for a request
     * 
     * @param requestId The approval request ID
     * @return Count of approval decisions for the request
     */
    long countByRequestId(String requestId);
} 