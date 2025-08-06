package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.AISuggestion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AISuggestionRepository extends JpaRepository<AISuggestion, UUID> {
    
    /**
     * Find all suggestions for a specific Home Assistant connection
     */
    List<AISuggestion> findByConnectionId(UUID connectionId);
    
    /**
     * Find suggestions for a specific connection with pagination
     */
    Page<AISuggestion> findByConnectionId(UUID connectionId, Pageable pageable);
    
    /**
     * Find suggestions by status
     */
    List<AISuggestion> findByStatus(AISuggestion.SuggestionStatus status);
    
    /**
     * Find suggestions by connection ID and status
     */
    List<AISuggestion> findByConnectionIdAndStatus(UUID connectionId, AISuggestion.SuggestionStatus status);
    
    /**
     * Find suggestions by suggestion type
     */
    List<AISuggestion> findBySuggestionType(AISuggestion.SuggestionType suggestionType);
    
    /**
     * Find suggestions created after a specific date
     */
    List<AISuggestion> findByCreatedAtAfter(OffsetDateTime createdAt);
    
    /**
     * Find suggestions with confidence score greater than threshold
     */
    List<AISuggestion> findByConfidenceScoreGreaterThan(BigDecimal threshold);
    
    /**
     * Count suggestions by connection ID and status
     */
    long countByConnectionIdAndStatus(UUID connectionId, AISuggestion.SuggestionStatus status);
    
    /**
     * Find pending suggestions ordered by confidence score (highest first)
     */
    @Query("SELECT s FROM AISuggestion s WHERE s.status = 'PENDING' ORDER BY s.confidenceScore DESC")
    List<AISuggestion> findPendingSuggestionsOrderByConfidenceDesc();
    
    /**
     * Find suggestions for a connection within a date range
     */
    @Query("SELECT s FROM AISuggestion s WHERE s.connection.id = :connectionId " +
           "AND s.createdAt BETWEEN :startDate AND :endDate")
    List<AISuggestion> findByConnectionIdAndDateRange(
        @Param("connectionId") UUID connectionId,
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );
    
    /**
     * Find suggestions that need processing (approved but not implemented)
     */
    @Query("SELECT s FROM AISuggestion s WHERE s.status = 'APPROVED' AND s.processedAt IS NULL")
    List<AISuggestion> findSuggestionsNeedingProcessing();
    
    /**
     * Get suggestion statistics for a connection
     */
    @Query("SELECT s.status, COUNT(s) FROM AISuggestion s WHERE s.connection.id = :connectionId GROUP BY s.status")
    List<Object[]> getSuggestionStatisticsByConnectionId(@Param("connectionId") UUID connectionId);
    
    /**
     * Find recent suggestions for a user (via their connections)
     */
    @Query("SELECT s FROM AISuggestion s WHERE s.connection.user.id = :userId " +
           "ORDER BY s.createdAt DESC")
    List<AISuggestion> findRecentSuggestionsByUserId(@Param("userId") UUID userId, Pageable pageable);
    
    /**
     * Find suggestions with high confidence that haven't been reviewed
     */
    @Query("SELECT s FROM AISuggestion s WHERE s.status = 'PENDING' " +
           "AND s.confidenceScore >= :minConfidence " +
           "ORDER BY s.createdAt ASC")
    List<AISuggestion> findHighConfidencePendingSuggestions(@Param("minConfidence") BigDecimal minConfidence);
    
    /**
     * Delete old processed suggestions (for cleanup)
     */
    @Query("DELETE FROM AISuggestion s WHERE s.processedAt < :cutoffDate " +
           "AND s.status IN ('IMPLEMENTED', 'FAILED', 'ROLLED_BACK')")
    void deleteOldProcessedSuggestions(@Param("cutoffDate") OffsetDateTime cutoffDate);
}