package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.AISuggestionApproval;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AISuggestionApprovalRepository extends JpaRepository<AISuggestionApproval, UUID> {
    
    /**
     * Find approval by suggestion ID
     */
    Optional<AISuggestionApproval> findBySuggestionId(UUID suggestionId);
    
    /**
     * Find approvals by user ID
     */
    List<AISuggestionApproval> findByUserId(UUID userId);
    
    /**
     * Find approvals by user ID with pagination
     */
    Page<AISuggestionApproval> findByUserId(UUID userId, Pageable pageable);
    
    /**
     * Find approvals by decision
     */
    List<AISuggestionApproval> findByDecision(AISuggestionApproval.Decision decision);
    
    /**
     * Find approvals by user ID and decision
     */
    List<AISuggestionApproval> findByUserIdAndDecision(UUID userId, AISuggestionApproval.Decision decision);
    
    /**
     * Find approvals made after a specific date
     */
    List<AISuggestionApproval> findByDecidedAtAfter(OffsetDateTime decidedAt);
    
    /**
     * Find approved suggestions that are implemented
     */
    List<AISuggestionApproval> findByDecisionAndImplementedAtIsNotNull(AISuggestionApproval.Decision decision);
    
    /**
     * Find approved suggestions that are not yet implemented
     */
    List<AISuggestionApproval> findByDecisionAndImplementedAtIsNull(AISuggestionApproval.Decision decision);
    
    /**
     * Find approvals that have been rolled back
     */
    List<AISuggestionApproval> findByRollbackAtIsNotNull();
    
    /**
     * Count approvals by user ID and decision
     */
    long countByUserIdAndDecision(UUID userId, AISuggestionApproval.Decision decision);
    
    /**
     * Find approvals for a specific connection (via suggestion)
     */
    @Query("SELECT a FROM AISuggestionApproval a WHERE a.suggestion.connection.id = :connectionId")
    List<AISuggestionApproval> findByConnectionId(@Param("connectionId") UUID connectionId);
    
    /**
     * Find recent approvals for a user
     */
    @Query("SELECT a FROM AISuggestionApproval a WHERE a.user.id = :userId " +
           "ORDER BY a.decidedAt DESC")
    List<AISuggestionApproval> findRecentApprovalsByUserId(@Param("userId") UUID userId, Pageable pageable);
    
    /**
     * Find approvals within a date range
     */
    @Query("SELECT a FROM AISuggestionApproval a WHERE a.decidedAt BETWEEN :startDate AND :endDate")
    List<AISuggestionApproval> findByDateRange(
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );
    
    /**
     * Get approval statistics for a user
     */
    @Query("SELECT a.decision, COUNT(a) FROM AISuggestionApproval a WHERE a.user.id = :userId GROUP BY a.decision")
    List<Object[]> getApprovalStatisticsByUserId(@Param("userId") UUID userId);
    
    /**
     * Find approvals that need implementation (approved but not implemented)
     */
    @Query("SELECT a FROM AISuggestionApproval a WHERE a.decision = 'APPROVED' " +
           "AND a.implementedAt IS NULL ORDER BY a.decidedAt ASC")
    List<AISuggestionApproval> findApprovalsNeedingImplementation();
    
    /**
     * Find approvals with implementation time exceeding threshold
     */
    @Query("SELECT a FROM AISuggestionApproval a WHERE a.decision = 'APPROVED' " +
           "AND a.implementedAt IS NULL AND a.decidedAt < :thresholdDate")
    List<AISuggestionApproval> findOverdueImplementations(@Param("thresholdDate") OffsetDateTime thresholdDate);
    
    /**
     * Get average implementation time for approved suggestions
     */
    @Query("SELECT AVG(EXTRACT(EPOCH FROM (a.implementedAt - a.decidedAt))) FROM AISuggestionApproval a " +
           "WHERE a.decision = 'APPROVED' AND a.implementedAt IS NOT NULL")
    Double getAverageImplementationTimeSeconds();
    
    /**
     * Find users with most approvals in a time period
     */
    @Query("SELECT a.user.id, COUNT(a) FROM AISuggestionApproval a " +
           "WHERE a.decidedAt BETWEEN :startDate AND :endDate " +
           "GROUP BY a.user.id ORDER BY COUNT(a) DESC")
    List<Object[]> findMostActiveApproversInPeriod(
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate,
        Pageable pageable
    );
}