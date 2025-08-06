package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.EventProcessingMetrics;
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
 * Repository interface for EventProcessingMetrics entity
 * Provides custom query methods for event processing analytics
 */
@Repository
public interface EventProcessingMetricsRepository extends JpaRepository<EventProcessingMetrics, UUID> {
    
    /**
     * Find metrics by connection
     */
    List<EventProcessingMetrics> findByConnection(HomeAssistantConnection connection);
    
    /**
     * Find metrics by connection with pagination
     */
    Page<EventProcessingMetrics> findByConnection(HomeAssistantConnection connection, Pageable pageable);
    
    /**
     * Find metrics by connection and metric type
     */
    List<EventProcessingMetrics> findByConnectionAndMetricType(
        HomeAssistantConnection connection, 
        EventProcessingMetrics.MetricType metricType
    );
    
    /**
     * Find metrics by connection and time range
     */
    List<EventProcessingMetrics> findByConnectionAndTimestampBetween(
        HomeAssistantConnection connection,
        OffsetDateTime startTime,
        OffsetDateTime endTime
    );
    
    /**
     * Find metrics by connection, metric type, and time range
     */
    List<EventProcessingMetrics> findByConnectionAndMetricTypeAndTimestampBetween(
        HomeAssistantConnection connection,
        EventProcessingMetrics.MetricType metricType,
        OffsetDateTime startTime,
        OffsetDateTime endTime
    );
    
    /**
     * Find metrics by batch ID
     */
    List<EventProcessingMetrics> findByBatchId(UUID batchId);
    
    /**
     * Find recent metrics for a connection
     */
    @Query("SELECT m FROM EventProcessingMetrics m WHERE m.connection = :connection " +
           "ORDER BY m.timestamp DESC")
    List<EventProcessingMetrics> findRecentMetricsByConnection(
        @Param("connection") HomeAssistantConnection connection,
        Pageable pageable
    );
    
    /**
     * Get average metric value by type and time range
     */
    @Query("SELECT AVG(m.metricValue) FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection AND m.metricType = :metricType " +
           "AND m.timestamp BETWEEN :startTime AND :endTime")
    Optional<BigDecimal> getAverageMetricValue(
        @Param("connection") HomeAssistantConnection connection,
        @Param("metricType") EventProcessingMetrics.MetricType metricType,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get maximum metric value by type and time range
     */
    @Query("SELECT MAX(m.metricValue) FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection AND m.metricType = :metricType " +
           "AND m.timestamp BETWEEN :startTime AND :endTime")
    Optional<BigDecimal> getMaxMetricValue(
        @Param("connection") HomeAssistantConnection connection,
        @Param("metricType") EventProcessingMetrics.MetricType metricType,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get minimum metric value by type and time range
     */
    @Query("SELECT MIN(m.metricValue) FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection AND m.metricType = :metricType " +
           "AND m.timestamp BETWEEN :startTime AND :endTime")
    Optional<BigDecimal> getMinMetricValue(
        @Param("connection") HomeAssistantConnection connection,
        @Param("metricType") EventProcessingMetrics.MetricType metricType,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get total event count by connection and time range
     */
    @Query("SELECT SUM(m.eventCount) FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection " +
           "AND m.timestamp BETWEEN :startTime AND :endTime")
    Optional<Long> getTotalEventCount(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get total processing time by connection and time range
     */
    @Query("SELECT SUM(m.processingTimeMs) FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection " +
           "AND m.timestamp BETWEEN :startTime AND :endTime")
    Optional<Long> getTotalProcessingTime(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get average filter effectiveness by connection and time range
     */
    @Query("SELECT AVG(m.filterEffectiveness) FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection AND m.filterEffectiveness IS NOT NULL " +
           "AND m.timestamp BETWEEN :startTime AND :endTime")
    Optional<BigDecimal> getAverageFilterEffectiveness(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get metrics grouped by hour for charts
     */
    @Query("SELECT FUNCTION('DATE_TRUNC', 'hour', m.timestamp) as hour, " +
           "m.metricType, AVG(m.metricValue) as avgValue, COUNT(m) as count " +
           "FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection " +
           "AND m.timestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY FUNCTION('DATE_TRUNC', 'hour', m.timestamp), m.metricType " +
           "ORDER BY hour ASC")
    List<Object[]> getHourlyMetricsSummary(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Get performance statistics for a connection
     */
    @Query("SELECT m.metricType, " +
           "AVG(m.metricValue) as avgValue, " +
           "MIN(m.metricValue) as minValue, " +
           "MAX(m.metricValue) as maxValue, " +
           "COUNT(m) as count " +
           "FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection " +
           "AND m.timestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY m.metricType")
    List<Object[]> getPerformanceStatistics(
        @Param("connection") HomeAssistantConnection connection,
        @Param("startTime") OffsetDateTime startTime,
        @Param("endTime") OffsetDateTime endTime
    );
    
    /**
     * Delete old metrics to prevent database bloat
     */
    @Query("DELETE FROM EventProcessingMetrics m WHERE m.createdAt < :cutoffDate")
    void deleteOldMetrics(@Param("cutoffDate") OffsetDateTime cutoffDate);
    
    /**
     * Count metrics by connection and time range
     */
    long countByConnectionAndTimestampBetween(
        HomeAssistantConnection connection,
        OffsetDateTime startTime,
        OffsetDateTime endTime
    );
    
    /**
     * Find latest metric by type for a connection
     */
    @Query("SELECT m FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection AND m.metricType = :metricType " +
           "ORDER BY m.timestamp DESC")
    Optional<EventProcessingMetrics> findLatestMetricByType(
        @Param("connection") HomeAssistantConnection connection,
        @Param("metricType") EventProcessingMetrics.MetricType metricType,
        Pageable pageable
    );
    
    /**
     * Get all metrics for the last N hours
     */
    @Query("SELECT m FROM EventProcessingMetrics m " +
           "WHERE m.connection = :connection " +
           "AND m.timestamp >= :since " +
           "ORDER BY m.timestamp ASC")
    List<EventProcessingMetrics> findMetricsSince(
        @Param("connection") HomeAssistantConnection connection,
        @Param("since") OffsetDateTime since
    );
}