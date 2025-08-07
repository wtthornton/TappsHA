package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.AutomationManagement;
import com.tappha.autonomous.entity.LifecycleState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for AutomationManagement entity.
 * 
 * Provides:
 * - Basic CRUD operations
 * - Custom queries for lifecycle management
 * - Performance analytics queries
 * - Audit trail queries
 */
@Repository
public interface AutomationManagementRepository extends JpaRepository<AutomationManagement, UUID> {

    /**
     * Find automation by Home Assistant automation ID
     */
    Optional<AutomationManagement> findByHomeAssistantAutomationId(String homeAssistantAutomationId);

    /**
     * Find automations by lifecycle state
     */
    List<AutomationManagement> findByLifecycleState(LifecycleState lifecycleState);

    /**
     * Find automations by lifecycle state with pagination
     */
    Page<AutomationManagement> findByLifecycleState(LifecycleState lifecycleState, Pageable pageable);

    /**
     * Find active automations
     */
    List<AutomationManagement> findByIsActiveTrue();

    /**
     * Find automations by active status with pagination
     */
    Page<AutomationManagement> findByIsActive(Boolean isActive, Pageable pageable);

    /**
     * Find automations by performance score range
     */
    List<AutomationManagement> findByPerformanceScoreBetween(Double minScore, Double maxScore);

    /**
     * Find automations with performance score above threshold
     */
    List<AutomationManagement> findByPerformanceScoreGreaterThan(Double threshold);

    /**
     * Find automations with performance score below threshold
     */
    List<AutomationManagement> findByPerformanceScoreLessThan(Double threshold);

    /**
     * Find automations by success rate range
     */
    List<AutomationManagement> findBySuccessRateBetween(Double minRate, Double maxRate);

    /**
     * Find automations by execution count range
     */
    List<AutomationManagement> findByExecutionCountBetween(Integer minCount, Integer maxCount);

    /**
     * Find automations by average execution time range
     */
    List<AutomationManagement> findByAverageExecutionTimeMsBetween(Integer minTime, Integer maxTime);

    /**
     * Find automations by last execution time after given instant
     */
    List<AutomationManagement> findByLastExecutionTimeAfter(Instant after);

    /**
     * Find automations by last execution time before given instant
     */
    List<AutomationManagement> findByLastExecutionTimeBefore(Instant before);

    /**
     * Find automations by last execution time between given instants
     */
    List<AutomationManagement> findByLastExecutionTimeBetween(Instant start, Instant end);

    /**
     * Find automations by created by user
     */
    List<AutomationManagement> findByCreatedBy(UUID createdBy);

    /**
     * Find automations by modified by user
     */
    List<AutomationManagement> findByModifiedBy(UUID modifiedBy);

    /**
     * Find automations by version
     */
    List<AutomationManagement> findByVersion(Integer version);

    /**
     * Find automations by version greater than
     */
    List<AutomationManagement> findByVersionGreaterThan(Integer version);

    /**
     * Find automations by name containing (case-insensitive)
     */
    List<AutomationManagement> findByNameContainingIgnoreCase(String name);

    /**
     * Find automations by description containing (case-insensitive)
     */
    List<AutomationManagement> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Find automations by lifecycle state and active status
     */
    List<AutomationManagement> findByLifecycleStateAndIsActive(LifecycleState lifecycleState, Boolean isActive);

    /**
     * Find automations by lifecycle state and performance score above threshold
     */
    List<AutomationManagement> findByLifecycleStateAndPerformanceScoreGreaterThan(LifecycleState lifecycleState, Double threshold);

    /**
     * Find automations by lifecycle state and success rate above threshold
     */
    List<AutomationManagement> findByLifecycleStateAndSuccessRateGreaterThan(LifecycleState lifecycleState, Double threshold);

    /**
     * Count automations by lifecycle state
     */
    long countByLifecycleState(LifecycleState lifecycleState);

    /**
     * Count active automations
     */
    long countByIsActiveTrue();

    /**
     * Count automations by performance score above threshold
     */
    long countByPerformanceScoreGreaterThan(Double threshold);

    /**
     * Count automations by success rate above threshold
     */
    long countBySuccessRateGreaterThan(Double threshold);

    /**
     * Count automations by execution count above threshold
     */
    long countByExecutionCountGreaterThan(Integer threshold);

    /**
     * Count automations by average execution time above threshold
     */
    long countByAverageExecutionTimeMsGreaterThan(Integer threshold);

    /**
     * Count automations by created by user
     */
    long countByCreatedBy(UUID createdBy);

    /**
     * Count automations by modified by user
     */
    long countByModifiedBy(UUID modifiedBy);

    /**
     * Check if automation exists by Home Assistant automation ID
     */
    boolean existsByHomeAssistantAutomationId(String homeAssistantAutomationId);

    /**
     * Check if automation exists by name
     */
    boolean existsByName(String name);

    /**
     * Check if automation exists by lifecycle state
     */
    boolean existsByLifecycleState(LifecycleState lifecycleState);

    /**
     * Check if automation exists by active status
     */
    boolean existsByIsActive(Boolean isActive);

    // Custom Queries

    /**
     * Find automations with high performance (score > 80)
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.performanceScore > 80 AND a.isActive = true")
    List<AutomationManagement> findHighPerformanceAutomations();

    /**
     * Find automations with low performance (score < 50)
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.performanceScore < 50 AND a.isActive = true")
    List<AutomationManagement> findLowPerformanceAutomations();

    /**
     * Find automations that haven't executed recently (more than 7 days ago)
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.lastExecutionTime < :cutoffDate AND a.isActive = true")
    List<AutomationManagement> findInactiveAutomations(@Param("cutoffDate") Instant cutoffDate);

    /**
     * Find automations with high execution count (top 10)
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.isActive = true ORDER BY a.executionCount DESC")
    Page<AutomationManagement> findMostExecutedAutomations(Pageable pageable);

    /**
     * Find automations with high success rate (top 10)
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.isActive = true ORDER BY a.successRate DESC")
    Page<AutomationManagement> findMostSuccessfulAutomations(Pageable pageable);

    /**
     * Find automations by multiple lifecycle states
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.lifecycleState IN :states")
    List<AutomationManagement> findByLifecycleStates(@Param("states") List<LifecycleState> states);

    /**
     * Find automations by performance score range with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.performanceScore BETWEEN :minScore AND :maxScore")
    Page<AutomationManagement> findByPerformanceScoreRange(
            @Param("minScore") Double minScore,
            @Param("maxScore") Double maxScore,
            Pageable pageable);

    /**
     * Find automations by success rate range with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.successRate BETWEEN :minRate AND :maxRate")
    Page<AutomationManagement> findBySuccessRateRange(
            @Param("minRate") Double minRate,
            @Param("maxRate") Double maxRate,
            Pageable pageable);

    /**
     * Find automations by execution count range with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.executionCount BETWEEN :minCount AND :maxCount")
    Page<AutomationManagement> findByExecutionCountRange(
            @Param("minCount") Integer minCount,
            @Param("maxCount") Integer maxCount,
            Pageable pageable);

    /**
     * Find automations by average execution time range with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.averageExecutionTimeMs BETWEEN :minTime AND :maxTime")
    Page<AutomationManagement> findByAverageExecutionTimeRange(
            @Param("minTime") Integer minTime,
            @Param("maxTime") Integer maxTime,
            Pageable pageable);

    /**
     * Find automations by last execution time range with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.lastExecutionTime BETWEEN :startTime AND :endTime")
    Page<AutomationManagement> findByLastExecutionTimeRange(
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime,
            Pageable pageable);

    /**
     * Find automations by created date range with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.createdAt BETWEEN :startDate AND :endDate")
    Page<AutomationManagement> findByCreatedDateRange(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    /**
     * Find automations by updated date range with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.updatedAt BETWEEN :startDate AND :endDate")
    Page<AutomationManagement> findByUpdatedDateRange(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable);

    /**
     * Find automations by user with pagination
     */
    @Query("SELECT a FROM AutomationManagement a WHERE a.createdBy = :userId OR a.modifiedBy = :userId")
    Page<AutomationManagement> findByUser(
            @Param("userId") UUID userId,
            Pageable pageable);

    /**
     * Find automations by name or description containing text (case-insensitive)
     */
    @Query("SELECT a FROM AutomationManagement a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :searchText, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    Page<AutomationManagement> findBySearchText(
            @Param("searchText") String searchText,
            Pageable pageable);

    // Analytics Queries

    /**
     * Get average performance score
     */
    @Query("SELECT AVG(a.performanceScore) FROM AutomationManagement a WHERE a.isActive = true")
    Double getAveragePerformanceScore();

    /**
     * Get average success rate
     */
    @Query("SELECT AVG(a.successRate) FROM AutomationManagement a WHERE a.isActive = true")
    Double getAverageSuccessRate();

    /**
     * Get average execution count
     */
    @Query("SELECT AVG(a.executionCount) FROM AutomationManagement a WHERE a.isActive = true")
    Double getAverageExecutionCount();

    /**
     * Get average execution time
     */
    @Query("SELECT AVG(a.averageExecutionTimeMs) FROM AutomationManagement a WHERE a.isActive = true")
    Double getAverageExecutionTime();

    /**
     * Get total execution count
     */
    @Query("SELECT SUM(a.executionCount) FROM AutomationManagement a WHERE a.isActive = true")
    Long getTotalExecutionCount();

    /**
     * Get count by lifecycle state
     */
    @Query("SELECT a.lifecycleState, COUNT(a) FROM AutomationManagement a GROUP BY a.lifecycleState")
    List<Object[]> getCountByLifecycleState();

    /**
     * Get performance score distribution
     */
    @Query("SELECT a.performanceScore FROM AutomationManagement a WHERE a.isActive = true AND a.performanceScore IS NOT NULL")
    List<Double> getPerformanceScores();

    /**
     * Get success rate distribution
     */
    @Query("SELECT a.successRate FROM AutomationManagement a WHERE a.isActive = true AND a.successRate IS NOT NULL")
    List<Double> getSuccessRates();

    /**
     * Get execution count distribution
     */
    @Query("SELECT a.executionCount FROM AutomationManagement a WHERE a.isActive = true AND a.executionCount IS NOT NULL")
    List<Integer> getExecutionCounts();

    /**
     * Get average execution time distribution
     */
    @Query("SELECT a.averageExecutionTimeMs FROM AutomationManagement a WHERE a.isActive = true AND a.averageExecutionTimeMs IS NOT NULL")
    List<Integer> getAverageExecutionTimes();
}
