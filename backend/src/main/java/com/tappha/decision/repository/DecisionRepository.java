package com.tappha.decision.repository;

import com.tappha.decision.entity.Decision;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Decision Repository for decision tracking system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface DecisionRepository extends JpaRepository<Decision, String> {
    
    /**
     * Find decisions by user ID ordered by creation date descending
     *
     * @param userId The user ID
     * @param pageable The pageable object for pagination
     * @return List of decisions
     */
    List<Decision> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    /**
     * Find decisions by user ID ordered by creation date descending
     *
     * @param userId The user ID
     * @return List of decisions
     */
    List<Decision> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find decisions by user ID and decision type ordered by creation date descending
     *
     * @param userId The user ID
     * @param decisionType The decision type
     * @return List of decisions
     */
    List<Decision> findByUserIdAndDecisionTypeOrderByCreatedAtDesc(String userId, String decisionType);
    
    /**
     * Find decisions by user ID and context type ordered by creation date descending
     *
     * @param userId The user ID
     * @param contextType The context type
     * @return List of decisions
     */
    List<Decision> findByUserIdAndContextTypeOrderByCreatedAtDesc(String userId, String contextType);
    
    /**
     * Find decisions by user ID and decision type and context type ordered by creation date descending
     *
     * @param userId The user ID
     * @param decisionType The decision type
     * @param contextType The context type
     * @return List of decisions
     */
    List<Decision> findByUserIdAndDecisionTypeAndContextTypeOrderByCreatedAtDesc(String userId, String decisionType, String contextType);
    
    /**
     * Find decisions by user ID and decision ordered by creation date descending
     *
     * @param userId The user ID
     * @param decision The decision
     * @return List of decisions
     */
    List<Decision> findByUserIdAndDecisionOrderByCreatedAtDesc(String userId, String decision);
    
    /**
     * Find decisions by user ID and creation date after ordered by creation date descending
     *
     * @param userId The user ID
     * @param createdAt The creation date
     * @return List of decisions
     */
    List<Decision> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(String userId, LocalDateTime createdAt);
    
    /**
     * Find decisions by user ID and creation date between ordered by creation date descending
     *
     * @param userId The user ID
     * @param startDate The start date
     * @param endDate The end date
     * @return List of decisions
     */
    List<Decision> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(String userId, LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Count decisions by user ID
     *
     * @param userId The user ID
     * @return Count of decisions
     */
    long countByUserId(String userId);
    
    /**
     * Count decisions by user ID and decision type
     *
     * @param userId The user ID
     * @param decisionType The decision type
     * @return Count of decisions
     */
    long countByUserIdAndDecisionType(String userId, String decisionType);
    
    /**
     * Count decisions by user ID and decision
     *
     * @param userId The user ID
     * @param decision The decision
     * @return Count of decisions
     */
    long countByUserIdAndDecision(String userId, String decision);
    
    /**
     * Find decisions with high confidence (above threshold)
     *
     * @param userId The user ID
     * @param confidenceThreshold The confidence threshold
     * @return List of decisions
     */
    @Query("SELECT d FROM Decision d WHERE d.userId = :userId AND d.confidence >= :confidenceThreshold ORDER BY d.createdAt DESC")
    List<Decision> findByUserIdAndConfidenceGreaterThanEqualOrderByCreatedAtDesc(@Param("userId") String userId, @Param("confidenceThreshold") double confidenceThreshold);
    
    /**
     * Find recent decisions for a user
     *
     * @param userId The user ID
     * @param limit The limit
     * @return List of decisions
     */
    @Query("SELECT d FROM Decision d WHERE d.userId = :userId ORDER BY d.createdAt DESC")
    List<Decision> findRecentDecisionsByUserId(@Param("userId") String userId, Pageable pageable);
} 