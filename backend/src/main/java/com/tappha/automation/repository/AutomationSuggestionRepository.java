package com.tappha.automation.repository;

import com.tappha.automation.entity.AutomationSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Automation Suggestion Repository
 * 
 * Provides data access methods for automation suggestions with approval workflow.
 * Supports comprehensive querying and filtering capabilities.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface AutomationSuggestionRepository extends JpaRepository<AutomationSuggestion, UUID> {
    
    /**
     * Find all suggestions for a specific user
     */
    List<AutomationSuggestion> findByUserId(UUID userId);
    
    /**
     * Find suggestions by status for a user
     */
    List<AutomationSuggestion> findByUserIdAndStatus(UUID userId, String status);
    
    /**
     * Find suggestions requiring approval for a user
     */
    List<AutomationSuggestion> findByUserIdAndRequiresApprovalTrue(UUID userId);
    
    /**
     * Find suggestions by confidence level
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.confidence >= :minConfidence")
    List<AutomationSuggestion> findByUserIdAndMinConfidence(@Param("userId") UUID userId, 
                                                           @Param("minConfidence") Double minConfidence);
    
    /**
     * Find suggestions by risk level
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.qualityAssessment.riskLevel = :riskLevel")
    List<AutomationSuggestion> findByUserIdAndRiskLevel(@Param("userId") UUID userId, 
                                                       @Param("riskLevel") String riskLevel);
    
    /**
     * Find suggestions created within a date range
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.createdAt BETWEEN :startDate AND :endDate")
    List<AutomationSuggestion> findByUserIdAndDateRange(@Param("userId") UUID userId,
                                                       @Param("startDate") LocalDateTime startDate,
                                                       @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find suggestions by context
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.context LIKE %:context%")
    List<AutomationSuggestion> findByUserIdAndContextContaining(@Param("userId") UUID userId,
                                                               @Param("context") String context);
    
    /**
     * Find approved suggestions for a user
     */
    List<AutomationSuggestion> findByUserIdAndStatusOrderByApprovedAtDesc(UUID userId, String status);
    
    /**
     * Find rejected suggestions for a user
     */
    List<AutomationSuggestion> findByUserIdAndStatusOrderByRejectedAtDesc(UUID userId, String status);
    
    /**
     * Count suggestions by status for a user
     */
    long countByUserIdAndStatus(UUID userId, String status);
    
    /**
     * Count suggestions requiring approval for a user
     */
    long countByUserIdAndRequiresApprovalTrue(UUID userId);
    
    /**
     * Find high-confidence suggestions for a user
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.confidence >= 0.8 ORDER BY s.confidence DESC")
    List<AutomationSuggestion> findHighConfidenceSuggestions(@Param("userId") UUID userId);
    
    /**
     * Find suggestions by template ID
     */
    List<AutomationSuggestion> findByTemplateId(UUID templateId);
    
    /**
     * Find suggestions by priority level
     */
    List<AutomationSuggestion> findByUserIdAndPriority(UUID userId, String priority);
    
    /**
     * Find recent suggestions for a user
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId ORDER BY s.createdAt DESC")
    List<AutomationSuggestion> findRecentSuggestions(@Param("userId") UUID userId);
    
    /**
     * Find suggestions with quality issues
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND (s.qualityAssessment.syntaxValid = false OR s.qualityAssessment.logicValid = false OR s.qualityAssessment.securityValid = false)")
    List<AutomationSuggestion> findSuggestionsWithQualityIssues(@Param("userId") UUID userId);
    
    /**
     * Find suggestions by category (derived from context)
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.context LIKE %:category%")
    List<AutomationSuggestion> findByUserIdAndCategory(@Param("userId") UUID userId,
                                                      @Param("category") String category);
    
    /**
     * Find suggestions with high risk level
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.qualityAssessment.riskLevel = 'HIGH'")
    List<AutomationSuggestion> findHighRiskSuggestions(@Param("userId") UUID userId);
    
    /**
     * Find suggestions pending approval
     */
    List<AutomationSuggestion> findByStatusOrderByCreatedAtAsc(String status);
    
    /**
     * Find suggestions by approval date range
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.approvedAt BETWEEN :startDate AND :endDate")
    List<AutomationSuggestion> findByUserIdAndApprovalDateRange(@Param("userId") UUID userId,
                                                               @Param("startDate") LocalDateTime startDate,
                                                               @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find suggestions by rejection reason
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.rejectionReason LIKE %:reason%")
    List<AutomationSuggestion> findByUserIdAndRejectionReasonContaining(@Param("userId") UUID userId,
                                                                        @Param("reason") String reason);
    
    /**
     * Find suggestions with specific quality assessment criteria
     */
    @Query("SELECT s FROM AutomationSuggestion s WHERE s.userId = :userId AND s.qualityAssessment.overallScore >= :minScore")
    List<AutomationSuggestion> findByUserIdAndMinQualityScore(@Param("userId") UUID userId,
                                                             @Param("minScore") Double minScore);
}
