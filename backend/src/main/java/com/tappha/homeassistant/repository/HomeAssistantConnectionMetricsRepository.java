package com.tappha.homeassistant.repository;

import com.tappha.homeassistant.entity.HomeAssistantConnectionMetrics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeAssistantConnectionMetricsRepository extends JpaRepository<HomeAssistantConnectionMetrics, UUID> {
    
    /**
     * Find average latency by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return Optional containing the average latency
     */
    @Query("SELECT AVG(m.metricValue) FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.timestamp BETWEEN :startTime AND :endTime AND m.metricType = 'LATENCY'")
    Optional<Double> findAverageLatencyByConnectionIdAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                                                        @Param("startTime") LocalDateTime startTime, 
                                                                        @Param("endTime") LocalDateTime endTime);
    
    /**
     * Find metrics by connection ID and timestamp range
     * @param connectionId the connection ID
     * @param startTime the start time
     * @param endTime the end time
     * @return list of metrics
     */
    @Query("SELECT m FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId AND m.timestamp BETWEEN :startTime AND :endTime ORDER BY m.timestamp DESC")
    java.util.List<HomeAssistantConnectionMetrics> findByConnectionIdAndTimestampBetween(@Param("connectionId") UUID connectionId, 
                                                                                        @Param("startTime") LocalDateTime startTime, 
                                                                                        @Param("endTime") LocalDateTime endTime);
    
    /**
     * Find the latest metrics for a connection
     * @param connectionId the connection ID
     * @return Optional containing the latest metrics
     */
    @Query("SELECT m FROM HomeAssistantConnectionMetrics m WHERE m.connection.id = :connectionId ORDER BY m.timestamp DESC")
    Optional<HomeAssistantConnectionMetrics> findLatestByConnectionId(@Param("connectionId") UUID connectionId);
    
    /**
     * Find recent metrics with pagination
     * @param page page number
     * @param size page size
     * @return list of recent metrics
     */
    @Query("SELECT m FROM HomeAssistantConnectionMetrics m ORDER BY m.timestamp DESC")
    java.util.List<HomeAssistantConnectionMetrics> findRecentMetrics(@Param("page") int page, @Param("size") int size);
} 