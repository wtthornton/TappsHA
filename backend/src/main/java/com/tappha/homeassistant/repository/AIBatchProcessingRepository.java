package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.AIBatchProcessing;
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
public interface AIBatchProcessingRepository extends JpaRepository<AIBatchProcessing, UUID> {
    
    /**
     * Find batch processing by batch ID
     */
    Optional<AIBatchProcessing> findByBatchId(String batchId);
    
    /**
     * Find batch processing records by status
     */
    List<AIBatchProcessing> findByStatus(AIBatchProcessing.BatchStatus status);
    
    /**
     * Find batch processing records by status with pagination
     */
    Page<AIBatchProcessing> findByStatus(AIBatchProcessing.BatchStatus status, Pageable pageable);
    
    /**
     * Find batch processing records started after a specific date
     */
    List<AIBatchProcessing> findByStartTimeAfter(OffsetDateTime startTime);
    
    /**
     * Find batch processing records within a date range
     */
    List<AIBatchProcessing> findByStartTimeBetween(OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find batch processing records by pattern data source
     */
    List<AIBatchProcessing> findByPatternDataSource(String patternDataSource);
    
    /**
     * Find currently running batch processes
     */
    List<AIBatchProcessing> findByStatusAndEndTimeIsNull(AIBatchProcessing.BatchStatus status);
    
    /**
     * Find completed batch processes with suggestions generated greater than threshold
     */
    List<AIBatchProcessing> findByStatusAndSuggestionsGeneratedGreaterThan(
        AIBatchProcessing.BatchStatus status, 
        Integer threshold
    );
    
    /**
     * Count batch processes by status
     */
    long countByStatus(AIBatchProcessing.BatchStatus status);
    
    /**
     * Find most recent batch processes
     */
    @Query("SELECT b FROM AIBatchProcessing b ORDER BY b.startTime DESC")
    List<AIBatchProcessing> findMostRecentBatches(Pageable pageable);
    
    /**
     * Find batch processes that have been running longer than threshold
     */
    @Query("SELECT b FROM AIBatchProcessing b WHERE b.status = 'RUNNING' " +
           "AND b.startTime < :thresholdTime")
    List<AIBatchProcessing> findLongRunningBatches(@Param("thresholdTime") OffsetDateTime thresholdTime);
    
    /**
     * Get batch processing statistics for a time period
     */
    @Query("SELECT b.status, COUNT(b), AVG(b.suggestionsGenerated), AVG(b.errorsCount) " +
           "FROM AIBatchProcessing b WHERE b.startTime BETWEEN :startDate AND :endDate " +
           "GROUP BY b.status")
    List<Object[]> getBatchStatisticsForPeriod(
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );
    
    /**
     * Find batches with high error rates
     */
    @Query("SELECT b FROM AIBatchProcessing b WHERE b.status IN ('COMPLETED', 'FAILED') " +
           "AND (CAST(b.errorsCount AS double) / CAST(b.suggestionsGenerated AS double)) > :errorRateThreshold")
    List<AIBatchProcessing> findBatchesWithHighErrorRate(@Param("errorRateThreshold") Double errorRateThreshold);
    
    /**
     * Get average processing time for completed batches
     * TODO: Fix PostgreSQL-specific EXTRACT function - temporarily commented out
     */
    /*
    @Query("SELECT AVG(EXTRACT(EPOCH FROM (b.endTime - b.startTime))) FROM AIBatchProcessing b " +
           "WHERE b.status = 'COMPLETED' AND b.endTime IS NOT NULL")
    Double getAverageProcessingTimeSeconds();
    */
    
    /**
     * Find batches by date range and pattern data source
     */
    @Query("SELECT b FROM AIBatchProcessing b WHERE b.startTime BETWEEN :startDate AND :endDate " +
           "AND (:patternDataSource IS NULL OR b.patternDataSource = :patternDataSource)")
    List<AIBatchProcessing> findByDateRangeAndPatternDataSource(
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate,
        @Param("patternDataSource") String patternDataSource
    );
    
    /**
     * Get total suggestions generated in a time period
     */
    @Query("SELECT SUM(b.suggestionsGenerated) FROM AIBatchProcessing b " +
           "WHERE b.startTime BETWEEN :startDate AND :endDate")
    Long getTotalSuggestionsGeneratedInPeriod(
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );
    
    /**
     * Find batches that need cleanup (old finished batches)
     */
    @Query("SELECT b FROM AIBatchProcessing b WHERE b.endTime < :cutoffDate " +
           "AND b.status IN ('COMPLETED', 'FAILED', 'CANCELLED')")
    List<AIBatchProcessing> findBatchesForCleanup(@Param("cutoffDate") OffsetDateTime cutoffDate);
    
    /**
     * Get success rate for batches in a time period
     */
    @Query("SELECT " +
           "COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(b) " +
           "FROM AIBatchProcessing b WHERE b.startTime BETWEEN :startDate AND :endDate")
    Double getSuccessRateForPeriod(
        @Param("startDate") OffsetDateTime startDate,
        @Param("endDate") OffsetDateTime endDate
    );
    
    /**
     * Find top N recent batch processing records ordered by start time descending
     */
    List<AIBatchProcessing> findTop10ByOrderByStartTimeDesc();
}