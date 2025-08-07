package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.AutomationPerformanceMetrics;
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
public interface AutomationPerformanceMetricsRepository extends JpaRepository<AutomationPerformanceMetrics, UUID> {
    
    // Find by automation management ID
    List<AutomationPerformanceMetrics> findByAutomationManagementIdOrderByExecutionTimestampDesc(UUID automationManagementId);
    
    // Find by automation management ID with pagination
    Page<AutomationPerformanceMetrics> findByAutomationManagementId(UUID automationManagementId, Pageable pageable);
    
    // Find by success status
    List<AutomationPerformanceMetrics> findBySuccess(Boolean success);
    
    // Find by automation management ID and success status
    List<AutomationPerformanceMetrics> findByAutomationManagementIdAndSuccess(UUID automationManagementId, Boolean success);
    
    // Find by execution timestamp range
    List<AutomationPerformanceMetrics> findByExecutionTimestampBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by automation management ID and execution timestamp range
    List<AutomationPerformanceMetrics> findByAutomationManagementIdAndExecutionTimestampBetween(
        UUID automationManagementId, LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by execution time range (in milliseconds)
    List<AutomationPerformanceMetrics> findByExecutionTimeMsBetween(Integer minTime, Integer maxTime);
    
    // Find by execution time greater than threshold
    List<AutomationPerformanceMetrics> findByExecutionTimeMsGreaterThan(Integer threshold);
    
    // Find by trigger source
    List<AutomationPerformanceMetrics> findByTriggerSource(String triggerSource);
    
    // Find by automation management ID and trigger source
    List<AutomationPerformanceMetrics> findByAutomationManagementIdAndTriggerSource(UUID automationManagementId, String triggerSource);
    
    // Find by error message containing pattern
    List<AutomationPerformanceMetrics> findByErrorMessageContaining(String errorPattern);
    
    // Find by automation management ID and error message containing pattern
    List<AutomationPerformanceMetrics> findByAutomationManagementIdAndErrorMessageContaining(UUID automationManagementId, String errorPattern);
    
    // Count by automation management ID
    long countByAutomationManagementId(UUID automationManagementId);
    
    // Count by automation management ID and success status
    long countByAutomationManagementIdAndSuccess(UUID automationManagementId, Boolean success);
    
    // Count by success status
    long countBySuccess(Boolean success);
    
    // Find latest execution for specific automation
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.automationManagementId = :automationId " +
           "ORDER BY m.executionTimestamp DESC LIMIT 1")
    AutomationPerformanceMetrics findLatestExecutionByAutomationId(@Param("automationId") UUID automationId);
    
    // Find successful executions for specific automation
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.automationManagementId = :automationId " +
           "AND m.success = true ORDER BY m.executionTimestamp DESC")
    List<AutomationPerformanceMetrics> findSuccessfulExecutionsByAutomationId(@Param("automationId") UUID automationId);
    
    // Find failed executions for specific automation
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.automationManagementId = :automationId " +
           "AND m.success = false ORDER BY m.executionTimestamp DESC")
    List<AutomationPerformanceMetrics> findFailedExecutionsByAutomationId(@Param("automationId") UUID automationId);
    
    // Find executions with specific error pattern
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.errorMessage LIKE %:errorPattern%")
    List<AutomationPerformanceMetrics> findByErrorMessagePattern(@Param("errorPattern") String errorPattern);
    
    // Analytics: Calculate average execution time by automation
    @Query("SELECT m.automationManagementId, AVG(m.executionTimeMs) as avgExecutionTime FROM AutomationPerformanceMetrics m " +
           "WHERE m.success = true GROUP BY m.automationManagementId")
    List<Object[]> calculateAverageExecutionTimeByAutomation();
    
    // Analytics: Calculate success rate by automation
    @Query("SELECT m.automationManagementId, " +
           "COUNT(CASE WHEN m.success = true THEN 1 END) * 100.0 / COUNT(m) as successRate " +
           "FROM AutomationPerformanceMetrics m GROUP BY m.automationManagementId")
    List<Object[]> calculateSuccessRateByAutomation();
    
    // Analytics: Count executions by trigger source
    @Query("SELECT m.triggerSource, COUNT(m) FROM AutomationPerformanceMetrics m " +
           "GROUP BY m.triggerSource ORDER BY COUNT(m) DESC")
    List<Object[]> countExecutionsByTriggerSource();
    
    // Analytics: Find most common error messages
    @Query("SELECT m.errorMessage, COUNT(m) FROM AutomationPerformanceMetrics m " +
           "WHERE m.success = false AND m.errorMessage IS NOT NULL " +
           "GROUP BY m.errorMessage ORDER BY COUNT(m) DESC")
    List<Object[]> findMostCommonErrorMessages();
    
    // Analytics: Calculate performance trends over time
    @Query("SELECT DATE(m.executionTimestamp) as executionDate, " +
           "AVG(m.executionTimeMs) as avgExecutionTime, " +
           "COUNT(CASE WHEN m.success = true THEN 1 END) * 100.0 / COUNT(m) as successRate " +
           "FROM AutomationPerformanceMetrics m " +
           "WHERE m.automationManagementId = :automationId " +
           "AND m.executionTimestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY DATE(m.executionTimestamp) ORDER BY executionDate")
    List<Object[]> calculatePerformanceTrends(
        @Param("automationId") UUID automationId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    // Analytics: Find slowest executions
    @Query("SELECT m FROM AutomationPerformanceMetrics m " +
           "ORDER BY m.executionTimeMs DESC LIMIT :limit")
    List<AutomationPerformanceMetrics> findSlowestExecutions(@Param("limit") int limit);
    
    // Analytics: Find most reliable automations (highest success rate)
    @Query("SELECT m.automationManagementId, " +
           "COUNT(CASE WHEN m.success = true THEN 1 END) * 100.0 / COUNT(m) as successRate " +
           "FROM AutomationPerformanceMetrics m " +
           "GROUP BY m.automationManagementId " +
           "HAVING COUNT(m) >= :minExecutions " +
           "ORDER BY successRate DESC")
    List<Object[]> findMostReliableAutomations(@Param("minExecutions") long minExecutions);
    
    // Find executions with resource usage above threshold
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.resourceUsage ? 'cpu_usage' " +
           "AND CAST(m.resourceUsage ->> 'cpu_usage' AS DECIMAL) > :threshold")
    List<AutomationPerformanceMetrics> findByCpuUsageAboveThreshold(@Param("threshold") Double threshold);
    
    // Find executions with memory usage above threshold
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.resourceUsage ? 'memory_usage' " +
           "AND CAST(m.resourceUsage ->> 'memory_usage' AS DECIMAL) > :threshold")
    List<AutomationPerformanceMetrics> findByMemoryUsageAboveThreshold(@Param("threshold") Double threshold);
    
    // Find executions with metadata containing specific key
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.metadata ? :key")
    List<AutomationPerformanceMetrics> findByMetadataKey(@Param("key") String key);
    
    // Find executions with metadata containing specific key-value pair
    @Query("SELECT m FROM AutomationPerformanceMetrics m WHERE m.metadata ->> :key = :value")
    List<AutomationPerformanceMetrics> findByMetadataKeyValue(
        @Param("key") String key, @Param("value") String value);
}
