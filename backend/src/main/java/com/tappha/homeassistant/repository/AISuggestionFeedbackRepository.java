package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.AISuggestionFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AISuggestionFeedbackRepository extends JpaRepository<AISuggestionFeedback, UUID> {
    
    /**
     * Find feedback by suggestion ID
     */
    List<AISuggestionFeedback> findBySuggestionId(UUID suggestionId);
    
    /**
     * Find feedback by effectiveness rating
     */
    List<AISuggestionFeedback> findByEffectivenessRating(Integer rating);
    
    /**
     * Find feedback with rating greater than or equal to threshold
     */
    List<AISuggestionFeedback> findByEffectivenessRatingGreaterThanEqual(Integer threshold);
    
    /**
     * Find feedback with rating less than or equal to threshold
     */
    List<AISuggestionFeedback> findByEffectivenessRatingLessThanEqual(Integer threshold);
    
    /**
     * Find feedback submitted after a specific date
     */
    List<AISuggestionFeedback> findByFeedbackDateAfter(OffsetDateTime feedbackDate);
    
    /**
     * Find feedback within a date range
     */
    List<AISuggestionFeedback> findByFeedbackDateBetween(OffsetDateTime startDate, OffsetDateTime endDate);
    
    /**
     * Find feedback that includes user comments
     */
    @Query("SELECT f FROM AISuggestionFeedback f WHERE f.userComments IS NOT NULL AND TRIM(f.userComments) != ''")
    List<AISuggestionFeedback> findFeedbackWithComments();
    
    /**
     * Find feedback that includes performance data
     */
    @Query("SELECT f FROM AISuggestionFeedback f WHERE f.automationPerformanceData IS NOT NULL")
    List<AISuggestionFeedback> findFeedbackWithPerformanceData();
    
    /**
     * Find feedback for a specific connection (via suggestion)
     */
    @Query("SELECT f FROM AISuggestionFeedback f WHERE f.suggestion.connection.id = :connectionId")
    List<AISuggestionFeedback> findByConnectionId(@Param("connectionId") UUID connectionId);
    
    /**
     * Find feedback for a specific user (via suggestion connection)
     */
    @Query("SELECT f FROM AISuggestionFeedback f WHERE f.suggestion.connection.user.id = :userId")
    List<AISuggestionFeedback> findByUserId(@Param("userId") UUID userId);
    
    /**
     * Find feedback for a specific user with pagination
     */
    @Query("SELECT f FROM AISuggestionFeedback f WHERE f.suggestion.connection.user.id = :userId " +
           "ORDER BY f.feedbackDate DESC")
    Page<AISuggestionFeedback> findByUserId(@Param("userId") UUID userId, Pageable pageable);
    
    /**
     * Find recent feedback
     */
    @Query("SELECT f FROM AISuggestionFeedback f ORDER BY f.feedbackDate DESC")
    List<AISuggestionFeedback> findRecentFeedback(Pageable pageable);
    
    /**
     * Get average effectiveness rating
     */
    @Query("SELECT AVG(f.effectivenessRating) FROM AISuggestionFeedback f WHERE f.effectivenessRating IS NOT NULL")
    Double getAverageEffectivenessRating();
    
    /**
     * Get average effectiveness rating for a specific suggestion type
     */
    @Query("SELECT AVG(f.effectivenessRating) FROM AISuggestionFeedback f " +
           "WHERE f.suggestion.suggestionType = :suggestionType AND f.effectivenessRating IS NOT NULL")
    Double getAverageEffectivenessRatingBySuggestionType(
        @Param("suggestionType") com.tappha.homeassistant.entity.AISuggestion.SuggestionType suggestionType
    );
    
    /**
     * Get feedback statistics by rating
     */
    @Query("SELECT f.effectivenessRating, COUNT(f) FROM AISuggestionFeedback f " +
           "WHERE f.effectivenessRating IS NOT NULL GROUP BY f.effectivenessRating ORDER BY f.effectivenessRating")
    List<Object[]> getFeedbackStatisticsByRating();
    
    /**
     * Count positive feedback (rating >= 4)
     */
    @Query("SELECT COUNT(f) FROM AISuggestionFeedback f WHERE f.effectivenessRating >= 4")
    long countPositiveFeedback();
    
    /**
     * Count negative feedback (rating <= 2)
     */
    @Query("SELECT COUNT(f) FROM AISuggestionFeedback f WHERE f.effectivenessRating <= 2")
    long countNegativeFeedback();
    
    /**
     * Find feedback for suggestions with specific confidence score range
     */
    @Query("SELECT f FROM AISuggestionFeedback f WHERE f.suggestion.confidenceScore BETWEEN :minConfidence AND :maxConfidence")
    List<AISuggestionFeedback> findByConfidenceScoreRange(
        @Param("minConfidence") java.math.BigDecimal minConfidence,
        @Param("maxConfidence") java.math.BigDecimal maxConfidence
    );
    
    /**
     * Get feedback trends over time
     */
    @Query("SELECT DATE_TRUNC('month', f.feedbackDate), AVG(f.effectivenessRating) " +
           "FROM AISuggestionFeedback f WHERE f.effectivenessRating IS NOT NULL " +
           "AND f.feedbackDate BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE_TRUNC('month', f.feedbackDate) " +
           "ORDER BY DATE_TRUNC('month', f.feedbackDate)")
    List<Object[]> getFeedbackTrendsMonthly(
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );
    
    /**
     * Find feedback with specific keywords in comments
     */
    @Query("SELECT f FROM AISuggestionFeedback f WHERE LOWER(f.userComments) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<AISuggestionFeedback> findByCommentKeyword(@Param("keyword") String keyword);
    
    /**
     * Delete old feedback records (for cleanup)
     */
    @Query("DELETE FROM AISuggestionFeedback f WHERE f.feedbackDate < :cutoffDate")
    void deleteOldFeedback(@Param("cutoffDate") OffsetDateTime cutoffDate);
}