package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.EmergencyStopLog;
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
public interface EmergencyStopLogRepository extends JpaRepository<EmergencyStopLog, UUID> {
    
    // Find by automation management ID
    List<EmergencyStopLog> findByAutomationManagementIdOrderByStopTimestampDesc(UUID automationManagementId);
    
    // Find by automation management ID with pagination
    Page<EmergencyStopLog> findByAutomationManagementId(UUID automationManagementId, Pageable pageable);
    
    // Find by stop type
    List<EmergencyStopLog> findByStopType(String stopType);
    
    // Find by automation management ID and stop type
    List<EmergencyStopLog> findByAutomationManagementIdAndStopType(UUID automationManagementId, String stopType);
    
    // Find by triggered by user
    List<EmergencyStopLog> findByTriggeredBy(UUID triggeredBy);
    
    // Find by automation management ID and triggered by user
    List<EmergencyStopLog> findByAutomationManagementIdAndTriggeredBy(UUID automationManagementId, UUID triggeredBy);
    
    // Find by stop timestamp range
    List<EmergencyStopLog> findByStopTimestampBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by automation management ID and stop timestamp range
    List<EmergencyStopLog> findByAutomationManagementIdAndStopTimestampBetween(
        UUID automationManagementId, LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by stop reason containing pattern
    List<EmergencyStopLog> findByStopReasonContaining(String reasonPattern);
    
    // Find by automation management ID and stop reason containing pattern
    List<EmergencyStopLog> findByAutomationManagementIdAndStopReasonContaining(UUID automationManagementId, String reasonPattern);
    
    // Find by recovery status
    List<EmergencyStopLog> findByRecoveryStatus(String recoveryStatus);
    
    // Find by automation management ID and recovery status
    List<EmergencyStopLog> findByAutomationManagementIdAndRecoveryStatus(UUID automationManagementId, String recoveryStatus);
    
    // Count by automation management ID
    long countByAutomationManagementId(UUID automationManagementId);
    
    // Count by stop type
    long countByStopType(String stopType);
    
    // Count by automation management ID and stop type
    long countByAutomationManagementIdAndStopType(UUID automationManagementId, String stopType);
    
    // Count by recovery status
    long countByRecoveryStatus(String recoveryStatus);
    
    // Find latest emergency stop for specific automation
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.automationManagementId = :automationId " +
           "ORDER BY e.stopTimestamp DESC LIMIT 1")
    EmergencyStopLog findLatestEmergencyStopByAutomationId(@Param("automationId") UUID automationId);
    
    // Find emergency stops with specific reason pattern
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.stopReason LIKE %:reasonPattern%")
    List<EmergencyStopLog> findByStopReasonPattern(@Param("reasonPattern") String reasonPattern);
    
    // Find emergency stops with recovery actions containing pattern
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.recoveryActions LIKE %:actionPattern%")
    List<EmergencyStopLog> findByRecoveryActionsContaining(@Param("actionPattern") String actionPattern);
    
    // Analytics: Count emergency stops by type
    @Query("SELECT e.stopType, COUNT(e) FROM EmergencyStopLog e " +
           "GROUP BY e.stopType ORDER BY COUNT(e) DESC")
    List<Object[]> countEmergencyStopsByType();
    
    // Analytics: Count emergency stops by recovery status
    @Query("SELECT e.recoveryStatus, COUNT(e) FROM EmergencyStopLog e " +
           "GROUP BY e.recoveryStatus ORDER BY COUNT(e) DESC")
    List<Object[]> countEmergencyStopsByRecoveryStatus();
    
    // Analytics: Find most frequent emergency stop triggers
    @Query("SELECT e.triggeredBy, COUNT(e) as stopCount FROM EmergencyStopLog e " +
           "WHERE e.triggeredBy IS NOT NULL " +
           "GROUP BY e.triggeredBy ORDER BY stopCount DESC")
    List<Object[]> findMostFrequentEmergencyStopTriggers();
    
    // Analytics: Calculate emergency stop trends over time
    @Query("SELECT DATE(e.stopTimestamp) as stopDate, COUNT(e) as stopCount, " +
           "COUNT(CASE WHEN e.recoveryStatus = 'COMPLETED' THEN 1 END) as recoveryCount " +
           "FROM EmergencyStopLog e " +
           "WHERE e.automationManagementId = :automationId " +
           "AND e.stopTimestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY DATE(e.stopTimestamp) ORDER BY stopDate")
    List<Object[]> calculateEmergencyStopTrends(
        @Param("automationId") UUID automationId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    // Analytics: Find automations with most emergency stops
    @Query("SELECT e.automationManagementId, COUNT(e) as stopCount FROM EmergencyStopLog e " +
           "GROUP BY e.automationManagementId ORDER BY stopCount DESC")
    List<Object[]> findAutomationsWithMostEmergencyStops();
    
    // Find emergency stops older than specified days
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.stopTimestamp < :cutoffDate")
    List<EmergencyStopLog> findEmergencyStopsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find emergency stops by automation management ID older than specified days
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.automationManagementId = :automationId " +
           "AND e.stopTimestamp < :cutoffDate")
    List<EmergencyStopLog> findEmergencyStopsByAutomationIdOlderThan(
        @Param("automationId") UUID automationId, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find emergency stops with metadata containing specific key
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.metadata ? :key")
    List<EmergencyStopLog> findByMetadataKey(@Param("key") String key);
    
    // Find emergency stops with metadata containing specific key-value pair
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.metadata ->> :key = :value")
    List<EmergencyStopLog> findByMetadataKeyValue(
        @Param("key") String key, @Param("value") String value);
    
    // Find emergency stops with affected automations containing specific automation
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.affectedAutomations ? :automationId")
    List<EmergencyStopLog> findByAffectedAutomation(@Param("automationId") String automationId);
    
    // Find emergency stops with recovery actions containing specific action
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.recoveryActions ? :actionKey")
    List<EmergencyStopLog> findByRecoveryAction(@Param("actionKey") String actionKey);
    
    // Find emergency stops with recovery actions containing specific action-value pair
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.recoveryActions ->> :actionKey = :actionValue")
    List<EmergencyStopLog> findByRecoveryActionValue(
        @Param("actionKey") String actionKey, @Param("actionValue") String actionValue);
    
    // Find emergency stops triggered by specific user in date range
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.triggeredBy = :userId " +
           "AND e.stopTimestamp BETWEEN :startTime AND :endTime")
    List<EmergencyStopLog> findByTriggeredByAndDateRange(
        @Param("userId") UUID userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    // Find unresolved emergency stops (not completed recovery)
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.recoveryStatus != 'COMPLETED' " +
           "ORDER BY e.stopTimestamp DESC")
    List<EmergencyStopLog> findUnresolvedEmergencyStops();
    
    // Find unresolved emergency stops for specific automation
    @Query("SELECT e FROM EmergencyStopLog e WHERE e.automationManagementId = :automationId " +
           "AND e.recoveryStatus != 'COMPLETED' ORDER BY e.stopTimestamp DESC")
    List<EmergencyStopLog> findUnresolvedEmergencyStopsByAutomationId(@Param("automationId") UUID automationId);
}
