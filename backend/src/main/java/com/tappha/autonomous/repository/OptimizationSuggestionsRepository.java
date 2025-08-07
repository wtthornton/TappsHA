package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.OptimizationSuggestions;
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
public interface OptimizationSuggestionsRepository extends JpaRepository<OptimizationSuggestions, UUID> {
    
    // Find by automation management ID
    List<OptimizationSuggestions> findByAutomationManagementIdOrderByCreatedAtDesc(UUID automationManagementId);
    
    // Find by automation management ID with pagination
    Page<OptimizationSuggestions> findByAutomationManagementId(UUID automationManagementId, Pageable pageable);
    
    // Find by suggestion type
    List<OptimizationSuggestions> findBySuggestionType(String suggestionType);
    
    // Find by automation management ID and suggestion type
    List<OptimizationSuggestions> findByAutomationManagementIdAndSuggestionType(UUID automationManagementId, String suggestionType);
    
    // Find by review status
    List<OptimizationSuggestions> findByReviewStatus(String reviewStatus);
    
    // Find by automation management ID and review status
    List<OptimizationSuggestions> findByAutomationManagementIdAndReviewStatus(UUID automationManagementId, String reviewStatus);
    
    // Find by suggestion type and review status
    List<OptimizationSuggestions> findBySuggestionTypeAndReviewStatus(String suggestionType, String reviewStatus);
    
    // Find by automation management ID, suggestion type and review status
    List<OptimizationSuggestions> findByAutomationManagementIdAndSuggestionTypeAndReviewStatus(
        UUID automationManagementId, String suggestionType, String reviewStatus);
    
    // Find by confidence score range
    List<OptimizationSuggestions> findByConfidenceScoreBetween(Double minScore, Double maxScore);
    
    // Find by confidence score greater than threshold
    List<OptimizationSuggestions> findByConfidenceScoreGreaterThan(Double threshold);
    
    // Find by automation management ID and confidence score greater than threshold
    List<OptimizationSuggestions> findByAutomationManagementIdAndConfidenceScoreGreaterThan(UUID automationManagementId, Double threshold);
    
    // Find by impact level
    List<OptimizationSuggestions> findByImpactLevel(String impactLevel);
    
    // Find by automation management ID and impact level
    List<OptimizationSuggestions> findByAutomationManagementIdAndImpactLevel(UUID automationManagementId, String impactLevel);
    
    // Find by created by user
    List<OptimizationSuggestions> findByCreatedBy(UUID createdBy);
    
    // Find by automation management ID and created by user
    List<OptimizationSuggestions> findByAutomationManagementIdAndCreatedBy(UUID automationManagementId, UUID createdBy);
    
    // Find by reviewed by user
    List<OptimizationSuggestions> findByReviewedBy(UUID reviewedBy);
    
    // Find by automation management ID and reviewed by user
    List<OptimizationSuggestions> findByAutomationManagementIdAndReviewedBy(UUID automationManagementId, UUID reviewedBy);
    
    // Find by creation date range
    List<OptimizationSuggestions> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by automation management ID and creation date range
    List<OptimizationSuggestions> findByAutomationManagementIdAndCreatedAtBetween(
        UUID automationManagementId, LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by review date range
    List<OptimizationSuggestions> findByReviewedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by automation management ID and review date range
    List<OptimizationSuggestions> findByAutomationManagementIdAndReviewedAtBetween(
        UUID automationManagementId, LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by title containing pattern
    List<OptimizationSuggestions> findByTitleContaining(String titlePattern);
    
    // Find by automation management ID and title containing pattern
    List<OptimizationSuggestions> findByAutomationManagementIdAndTitleContaining(UUID automationManagementId, String titlePattern);
    
    // Find by description containing pattern
    List<OptimizationSuggestions> findByDescriptionContaining(String descriptionPattern);
    
    // Find by automation management ID and description containing pattern
    List<OptimizationSuggestions> findByAutomationManagementIdAndDescriptionContaining(UUID automationManagementId, String descriptionPattern);
    
    // Count by automation management ID
    long countByAutomationManagementId(UUID automationManagementId);
    
    // Count by suggestion type
    long countBySuggestionType(String suggestionType);
    
    // Count by review status
    long countByReviewStatus(String reviewStatus);
    
    // Count by automation management ID and suggestion type
    long countByAutomationManagementIdAndSuggestionType(UUID automationManagementId, String suggestionType);
    
    // Count by automation management ID and review status
    long countByAutomationManagementIdAndReviewStatus(UUID automationManagementId, String reviewStatus);
    
    // Find latest suggestion for specific automation
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.automationManagementId = :automationId " +
           "ORDER BY o.createdAt DESC LIMIT 1")
    OptimizationSuggestions findLatestSuggestionByAutomationId(@Param("automationId") UUID automationId);
    
    // Find approved suggestions for specific automation
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.automationManagementId = :automationId " +
           "AND o.reviewStatus = 'APPROVED' ORDER BY o.createdAt DESC")
    List<OptimizationSuggestions> findApprovedSuggestionsByAutomationId(@Param("automationId") UUID automationId);
    
    // Find rejected suggestions for specific automation
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.automationManagementId = :automationId " +
           "AND o.reviewStatus = 'REJECTED' ORDER BY o.createdAt DESC")
    List<OptimizationSuggestions> findRejectedSuggestionsByAutomationId(@Param("automationId") UUID automationId);
    
    // Find suggestions with specific title pattern
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.title LIKE %:titlePattern%")
    List<OptimizationSuggestions> findByTitlePattern(@Param("titlePattern") String titlePattern);
    
    // Find suggestions with specific description pattern
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.description LIKE %:descriptionPattern%")
    List<OptimizationSuggestions> findByDescriptionPattern(@Param("descriptionPattern") String descriptionPattern);
    
    // Analytics: Count suggestions by type
    @Query("SELECT o.suggestionType, COUNT(o) FROM OptimizationSuggestions o " +
           "GROUP BY o.suggestionType ORDER BY COUNT(o) DESC")
    List<Object[]> countSuggestionsByType();
    
    // Analytics: Count suggestions by review status
    @Query("SELECT o.reviewStatus, COUNT(o) FROM OptimizationSuggestions o " +
           "GROUP BY o.reviewStatus ORDER BY COUNT(o) DESC")
    List<Object[]> countSuggestionsByReviewStatus();
    
    // Analytics: Count suggestions by impact level
    @Query("SELECT o.impactLevel, COUNT(o) FROM OptimizationSuggestions o " +
           "GROUP BY o.impactLevel ORDER BY COUNT(o) DESC")
    List<Object[]> countSuggestionsByImpactLevel();
    
    // Analytics: Calculate average confidence score by suggestion type
    @Query("SELECT o.suggestionType, AVG(o.confidenceScore) as avgConfidence FROM OptimizationSuggestions o " +
           "GROUP BY o.suggestionType ORDER BY avgConfidence DESC")
    List<Object[]> calculateAverageConfidenceBySuggestionType();
    
    // Analytics: Find most active suggestion creators
    @Query("SELECT o.createdBy, COUNT(o) as suggestionCount FROM OptimizationSuggestions o " +
           "WHERE o.createdBy IS NOT NULL " +
           "GROUP BY o.createdBy ORDER BY suggestionCount DESC")
    List<Object[]> findMostActiveSuggestionCreators();
    
    // Analytics: Find most active suggestion reviewers
    @Query("SELECT o.reviewedBy, COUNT(o) as reviewCount FROM OptimizationSuggestions o " +
           "WHERE o.reviewedBy IS NOT NULL " +
           "GROUP BY o.reviewedBy ORDER BY reviewCount DESC")
    List<Object[]> findMostActiveSuggestionReviewers();
    
    // Analytics: Calculate suggestion trends over time
    @Query("SELECT DATE(o.createdAt) as suggestionDate, COUNT(o) as suggestionCount, " +
           "COUNT(CASE WHEN o.reviewStatus = 'APPROVED' THEN 1 END) as approvedCount " +
           "FROM OptimizationSuggestions o " +
           "WHERE o.automationManagementId = :automationId " +
           "AND o.createdAt BETWEEN :startTime AND :endTime " +
           "GROUP BY DATE(o.createdAt) ORDER BY suggestionDate")
    List<Object[]> calculateSuggestionTrends(
        @Param("automationId") UUID automationId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    // Analytics: Find automations with most suggestions
    @Query("SELECT o.automationManagementId, COUNT(o) as suggestionCount FROM OptimizationSuggestions o " +
           "GROUP BY o.automationManagementId ORDER BY suggestionCount DESC")
    List<Object[]> findAutomationsWithMostSuggestions();
    
    // Analytics: Find highest confidence suggestions
    @Query("SELECT o FROM OptimizationSuggestions o " +
           "ORDER BY o.confidenceScore DESC LIMIT :limit")
    List<OptimizationSuggestions> findHighestConfidenceSuggestions(@Param("limit") int limit);
    
    // Analytics: Find suggestions with highest impact
    @Query("SELECT o FROM OptimizationSuggestions o " +
           "WHERE o.impactLevel = 'HIGH' ORDER BY o.confidenceScore DESC")
    List<OptimizationSuggestions> findHighImpactSuggestions();
    
    // Find suggestions older than specified days
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.createdAt < :cutoffDate")
    List<OptimizationSuggestions> findSuggestionsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find suggestions by automation management ID older than specified days
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.automationManagementId = :automationId " +
           "AND o.createdAt < :cutoffDate")
    List<OptimizationSuggestions> findSuggestionsByAutomationIdOlderThan(
        @Param("automationId") UUID automationId, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find suggestions with metadata containing specific key
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.metadata ? :key")
    List<OptimizationSuggestions> findByMetadataKey(@Param("key") String key);
    
    // Find suggestions with metadata containing specific key-value pair
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.metadata ->> :key = :value")
    List<OptimizationSuggestions> findByMetadataKeyValue(
        @Param("key") String key, @Param("value") String value);
    
    // Find suggestions created by specific user in date range
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.createdBy = :userId " +
           "AND o.createdAt BETWEEN :startTime AND :endTime")
    List<OptimizationSuggestions> findByCreatedByAndDateRange(
        @Param("userId") UUID userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    // Find suggestions reviewed by specific user in date range
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.reviewedBy = :userId " +
           "AND o.reviewedAt BETWEEN :startTime AND :endTime")
    List<OptimizationSuggestions> findByReviewedByAndDateRange(
        @Param("userId") UUID userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    // Find pending suggestions (not reviewed)
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.reviewStatus = 'PENDING' " +
           "ORDER BY o.createdAt ASC")
    List<OptimizationSuggestions> findPendingSuggestions();
    
    // Find pending suggestions for specific automation
    @Query("SELECT o FROM OptimizationSuggestions o WHERE o.automationManagementId = :automationId " +
           "AND o.reviewStatus = 'PENDING' ORDER BY o.createdAt ASC")
    List<OptimizationSuggestions> findPendingSuggestionsByAutomationId(@Param("automationId") UUID automationId);
}
