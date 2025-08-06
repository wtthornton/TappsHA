package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.EventProcessingBatches;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for EventProcessingBatches entity
 * Provides custom query methods for batch processing management
 */
@Repository
public interface EventProcessingBatchesRepository extends JpaRepository<EventProcessingBatches, UUID> {
    
    /**
     * Find batches by connection
     */
    List<EventProcessingBatches> findByConnection(HomeAssistantConnection connection);
    
    /**
     * Find batches by connection with pagination
     */
    Page<EventProcessingBatches> findByConnection(HomeAssistantConnection connection, Pageable pageable);
    
    /**
     * Find batches by status
     */
    List<EventProcessingBatches> findByStatus(EventProcessingBatches.BatchStatus status);
    
    /**
     * Find batches by connection and status
     */
    List<EventProcessingBatches> findByConnectionAndStatus(
        HomeAssistantConnection connection,
        EventProcessingBatches.BatchStatus status
    );
    
    /**
     * Find batches by batch type
     */
    List<EventProcessingBatches> findByBatchType(EventProcessingBatches.BatchType batchType);
    
    /**
     * Find batches by connection and batch type
     */
    List<EventProcessingBatches> findByConnectionAndBatchType(
        HomeAssistantConnection connection,
        EventProcessingBatches.BatchType batchType
    );
    
    /**
     * Find running batches
     */
    @Query("SELECT b FROM EventProcessingBatches b WHERE b.status IN ('RUNNING', 'PENDING', 'RETRYING')")
    List<EventProcessingBatches> findRunningBatches();
    
    /**
     * Find running batches by connection
     */
    @Query("SELECT b FROM EventProcessingBatches b WHERE b.connection = :connection " +
           "AND b.status IN ('RUNNING', 'PENDING', 'RETRYING')")
    List<EventProcessingBatches> findRunningBatchesByConnection(
        @Param("connection") HomeAssistantConnection connection
    );
    
    /**
     * Find failed batches that can be retried
     */
    @Query("SELECT b FROM EventProcessingBatches b WHERE b.status = 'FAILED' " +
           "AND b.retryCount < b.maxRetries " +
           "AND (b.nextRetryAt IS NULL OR b.nextRetryAt <= :now)")
    List<EventProcessingBatches> findRetryableBatches(@Param("now") OffsetDateTime now);
    
    /**
     * Find batches in time range
     */
    List<EventProcessingBatches> findByConnectionAndCreatedAtBetween(
        HomeAssistantConnection connection,
        OffsetDateTime startTime,
        OffsetDateTime endTime
    );
    
    /**
     * Find completed batches in time range
     */
    List<EventProcessingBatches> findByConnectionAndStatusAndCompletedAtBetween(
        HomeAssistantConnection connection,
        EventProcessingBatches.BatchStatus status,
        OffsetDateTime startTime,
        OffsetDateTime endTime
    );
    
    /**
     * Get recent batches by connection
     */
    @Query("SELECT b FROM EventProcessingBatches b WHERE b.connection = :connection " +
           "ORDER BY b.createdAt DESC")
    List<EventProcessingBatches> findRecentBatchesByConnection(
        @Param("connection") HomeAssistantConnection connection,
        Pageable pageable
    );
    
    /**
     * Get batch statistics by connection
     */
    @Query("SELECT b.status, COUNT(b), SUM(b.batchSize), SUM(b.processedCount), " +
           "SUM(b.successCount), SUM(b.errorCount), AVG(b.processingTimeMs) " +
           "FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection " +
           "GROUP BY b.status")
    List<Object[]> getBatchStatisticsByConnection(@Param("connection") HomeAssistantConnection connection);
    
    /**
     * Get batch statistics by connection and time range
     */
    @Query("SELECT b.status, COUNT(b), SUM(b.batchSize), SUM(b.processedCount), " +
           "SUM(b.successCount), SUM(b.errorCount), AVG(b.processingTimeMs) " +
           "FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection " +
           "AND b.createdAt BETWEEN :startTime AND :endTime " +
           "GROUP BY b.status")
    List<Object[]> getBatchStatisticsByConnectionAndTimeRange(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get average processing time by connection
     */
    @Query("SELECT AVG(b.processingTimeMs) FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection AND b.status = 'COMPLETED' " +
           "AND b.processingTimeMs IS NOT NULL")
    Optional<Double> getAverageProcessingTime(@Param("connection") HomeAssistantConnection connection);
    
    /**
     * Get average filter effectiveness by connection
     */
    @Query("SELECT AVG(b.filterEffectiveness) FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection AND b.status = 'COMPLETED' " +
           "AND b.filterEffectiveness IS NOT NULL")
    Optional<BigDecimal> getAverageFilterEffectiveness(
        @Param("connection") HomeAssistantConnection connection
    );
    
    /**
     * Get total events processed by connection
     */
    @Query("SELECT SUM(b.processedCount) FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection AND b.status = 'COMPLETED'")
    Optional<Long> getTotalEventsProcessed(@Param("connection") HomeAssistantConnection connection);
    
    /**
     * Get total events processed by connection and time range
     */
    @Query("SELECT SUM(b.processedCount) FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection AND b.status = 'COMPLETED' " +
           "AND b.completedAt BETWEEN :startTime AND :endTime")
    Optional<Long> getTotalEventsProcessedInTimeRange(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get success rate by connection
     */
    @Query("SELECT (CAST(SUM(b.successCount) AS DOUBLE) / CAST(SUM(b.processedCount) AS DOUBLE)) * 100 " +
           "FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection AND b.status = 'COMPLETED' " +
           "AND b.processedCount > 0")
    Optional<Double> getSuccessRate(@Param("connection") HomeAssistantConnection connection);
    
    /**
     * Get error rate by connection
     */
    @Query("SELECT (CAST(SUM(b.errorCount) AS DOUBLE) / CAST(SUM(b.processedCount) AS DOUBLE)) * 100 " +
           "FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection AND b.status = 'COMPLETED' " +
           "AND b.processedCount > 0")
    Optional<Double> getErrorRate(@Param("connection") HomeAssistantConnection connection);
    
    /**
     * Find batches by Kafka topic and partition
     */
    List<EventProcessingBatches> findByKafkaTopicAndKafkaPartition(String kafkaTopic, Integer kafkaPartition);
    
    /**
     * Find batches by Kafka offset range
     */
    @Query("SELECT b FROM EventProcessingBatches b " +
           "WHERE b.kafkaTopic = :topic AND b.kafkaPartition = :partition " +
           "AND b.kafkaOffsetStart <= :offset AND b.kafkaOffsetEnd >= :offset")
    List<EventProcessingBatches> findBatchesByKafkaOffset(
        @Param("topic") String kafkaTopic,
        @Param("partition") Integer kafkaPartition,
        @Param("offset") Long offset
    );
    
    /**
     * Get processing throughput by hour
     */
    @Query("SELECT FUNCTION('DATE_TRUNC', 'hour', b.completedAt) as hour, " +
           "SUM(b.processedCount) as totalProcessed, " +
           "AVG(b.processingTimeMs) as avgProcessingTime " +
           "FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection AND b.status = 'COMPLETED' " +
           "AND b.completedAt BETWEEN :startTime AND :endTime " +
           "GROUP BY FUNCTION('DATE_TRUNC', 'hour', b.completedAt) " +
           "ORDER BY hour ASC")
    List<Object[]> getHourlyThroughputStats(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Count batches by status
     */
    long countByConnectionAndStatus(HomeAssistantConnection connection, EventProcessingBatches.BatchStatus status);
    
    /**
     * Count active batches (running, pending, retrying)
     */
    @Query("SELECT COUNT(b) FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection " +
           "AND b.status IN ('RUNNING', 'PENDING', 'RETRYING')")
    long countActiveBatches(@Param("connection") HomeAssistantConnection connection);
    
    /**
     * Find oldest pending batch
     */
    @Query("SELECT b FROM EventProcessingBatches b " +
           "WHERE b.status = 'PENDING' " +
           "ORDER BY b.createdAt ASC")
    Optional<EventProcessingBatches> findOldestPendingBatch(Pageable pageable);
    
    /**
     * Find longest running batch
     */
    @Query("SELECT b FROM EventProcessingBatches b " +
           "WHERE b.status = 'RUNNING' " +
           "ORDER BY b.startedAt ASC")
    Optional<EventProcessingBatches> findLongestRunningBatch(Pageable pageable);
    
    /**
     * Delete old completed batches to prevent database bloat
     */
    @Query("DELETE FROM EventProcessingBatches b " +
           "WHERE b.status IN ('COMPLETED', 'FAILED', 'CANCELLED') " +
           "AND b.completedAt < :cutoffDate")
    void deleteOldBatches(@Param("cutoffDate") OffsetDateTime cutoffDate);
    
    /**
     * Find batches that are stuck (running for too long)
     */
    @Query("SELECT b FROM EventProcessingBatches b " +
           "WHERE b.status = 'RUNNING' " +
           "AND b.startedAt < :cutoffTime")
    List<EventProcessingBatches> findStuckBatches(@Param("cutoffTime") OffsetDateTime cutoffTime);
    
    /**
     * Get daily batch summary
     */
    @Query("SELECT FUNCTION('DATE_TRUNC', 'day', b.createdAt) as day, " +
           "COUNT(b) as totalBatches, " +
           "SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedBatches, " +
           "SUM(CASE WHEN b.status = 'FAILED' THEN 1 ELSE 0 END) as failedBatches, " +
           "SUM(b.processedCount) as totalProcessed " +
           "FROM EventProcessingBatches b " +
           "WHERE b.connection = :connection " +
           "AND b.createdAt BETWEEN :startTime AND :endTime " +
           "GROUP BY FUNCTION('DATE_TRUNC', 'day', b.createdAt) " +
           "ORDER BY day ASC")
    List<Object[]> getDailyBatchSummary(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
}