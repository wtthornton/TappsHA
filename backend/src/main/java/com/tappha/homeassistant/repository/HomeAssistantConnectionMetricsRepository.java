package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.HomeAssistantConnectionMetrics;
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

@Repository
public interface HomeAssistantConnectionMetricsRepository extends JpaRepository<HomeAssistantConnectionMetrics, UUID> {
    
    /**
     * Find all metrics for a specific connection
     * @param connectionId the connection ID
     * @return list of metrics
     */
    List<HomeAssistantConnectionMetrics> findByConnectionId(UUID connectionId);
    
    /**
     * Find all metrics for a specific connection with pagination
     * @param connectionId the connection ID
     * @param pageable pagination parameters
     * @return page of metrics
     */
    Page<HomeAssistantConnectionMetrics> findByConnectionId(UUID connectionId, Pageable pageable);
    
    /**
     * Find metrics by connection ID and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @return list of metrics
     */
    List<HomeAssistantConnectionMetrics> findByConnectionIdAndMetricType(UUID connectionId, HomeAssistantConnectionMetrics.MetricType metricType);
    
    /**
     * Find metrics by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of metrics
     */
    List<HomeAssistantConnectionMetrics> findByConnectionIdAndTimestampBetween(UUID connectionId, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find metrics by connection ID, metric type, and timestamp range
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @param startTime the start time
     * @param endTime the end time
     * @return list of metrics
     */
    List<HomeAssistantConnectionMetrics> findByConnectionIdAndMetricTypeAndTimestampBetween(
            UUID connectionId, HomeAssistantConnectionMetrics.MetricType metricType, OffsetDateTime startTime, OffsetDateTime endTime);
    
    /**
     * Find the latest metric for a specific connection and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @return Optional containing the latest metric if found
     */
    @Query("SELECT m FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.metricType = :metricType ORDER BY m.timestamp DESC")
    List<HomeAssistantConnectionMetrics> findLatestByConnectionIdAndMetricType(
            @Param("connectionId") UUID connectionId, @Param("metricType") HomeAssistantConnectionMetrics.MetricType metricType, Pageable pageable);
    
    /**
     * Find the latest metric for a specific connection
     * @param connectionId the connection ID
     * @return Optional containing the latest metric if found
     */
    @Query("SELECT m FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId ORDER BY m.timestamp DESC")
    List<HomeAssistantConnectionMetrics> findLatestByConnectionId(@Param("connectionId") UUID connectionId, Pageable pageable);
    
    /**
     * Find metrics with values above a threshold for a specific connection and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @param threshold the threshold value
     * @return list of metrics
     */
    List<HomeAssistantConnectionMetrics> findByConnectionIdAndMetricTypeAndMetricValueGreaterThan(
            UUID connectionId, HomeAssistantConnectionMetrics.MetricType metricType, BigDecimal threshold);
    
    /**
     * Find metrics with values below a threshold for a specific connection and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @param threshold the threshold value
     * @return list of metrics
     */
    List<HomeAssistantConnectionMetrics> findByConnectionIdAndMetricTypeAndMetricValueLessThan(
            UUID connectionId, HomeAssistantConnectionMetrics.MetricType metricType, BigDecimal threshold);
    
    /**
     * Calculate average metric value for a specific connection and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @return average metric value
     */
    @Query("SELECT AVG(m.metricValue) FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.metricType = :metricType")
    Optional<BigDecimal> calculateAverageByConnectionIdAndMetricType(
            @Param("connectionId") UUID connectionId, @Param("metricType") HomeAssistantConnectionMetrics.MetricType metricType);
    
    /**
     * Calculate average metric value for a specific connection and metric type within a time range
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @param startTime the start time
     * @param endTime the end time
     * @return average metric value
     */
    @Query("SELECT AVG(m.metricValue) FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.metricType = :metricType AND m.timestamp BETWEEN :startTime AND :endTime")
    Optional<BigDecimal> calculateAverageByConnectionIdAndMetricTypeAndTimestampBetween(
            @Param("connectionId") UUID connectionId, 
            @Param("metricType") HomeAssistantConnectionMetrics.MetricType metricType,
            @Param("startTime") OffsetDateTime startTime,
            @Param("endTime") OffsetDateTime endTime);
    
    /**
     * Find maximum metric value for a specific connection and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @return maximum metric value
     */
    @Query("SELECT MAX(m.metricValue) FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.metricType = :metricType")
    Optional<BigDecimal> findMaxByConnectionIdAndMetricType(
            @Param("connectionId") UUID connectionId, @Param("metricType") HomeAssistantConnectionMetrics.MetricType metricType);
    
    /**
     * Find minimum metric value for a specific connection and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @return minimum metric value
     */
    @Query("SELECT MIN(m.metricValue) FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.metricType = :metricType")
    Optional<BigDecimal> findMinByConnectionIdAndMetricType(
            @Param("connectionId") UUID connectionId, @Param("metricType") HomeAssistantConnectionMetrics.MetricType metricType);
    
    /**
     * Count metrics by connection ID and metric type
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @return count of metrics
     */
    long countByConnectionIdAndMetricType(UUID connectionId, HomeAssistantConnectionMetrics.MetricType metricType);
    
    /**
     * Find metrics by connection ID ordered by timestamp descending
     * @param connectionId the connection ID
     * @param pageable pagination parameters
     * @return page of metrics
     */
    @Query("SELECT m FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId ORDER BY m.timestamp DESC")
    Page<HomeAssistantConnectionMetrics> findByConnectionIdOrderByTimestampDesc(@Param("connectionId") UUID connectionId, Pageable pageable);
    
    /**
     * Find metrics by connection ID and metric type ordered by timestamp descending
     * @param connectionId the connection ID
     * @param metricType the metric type
     * @param pageable pagination parameters
     * @return page of metrics
     */
    @Query("SELECT m FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.metricType = :metricType ORDER BY m.timestamp DESC")
    Page<HomeAssistantConnectionMetrics> findByConnectionIdAndMetricTypeOrderByTimestampDesc(
            @Param("connectionId") UUID connectionId, @Param("metricType") HomeAssistantConnectionMetrics.MetricType metricType, Pageable pageable);
} 