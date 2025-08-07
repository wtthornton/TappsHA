package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.AutomationLifecycleHistory;
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
public interface AutomationLifecycleHistoryRepository extends JpaRepository<AutomationLifecycleHistory, UUID> {
    
    // Find by automation management ID
    List<AutomationLifecycleHistory> findByAutomationManagementIdOrderByTransitionTimestampDesc(UUID automationManagementId);
    
    // Find by automation management ID with pagination
    Page<AutomationLifecycleHistory> findByAutomationManagementId(UUID automationManagementId, Pageable pageable);
    
    // Find by previous state
    List<AutomationLifecycleHistory> findByPreviousState(String previousState);
    
    // Find by new state
    List<AutomationLifecycleHistory> findByNewState(String newState);
    
    // Find by state transition (previous -> new)
    List<AutomationLifecycleHistory> findByPreviousStateAndNewState(String previousState, String newState);
    
    // Find by transitioned by user
    List<AutomationLifecycleHistory> findByTransitionedBy(UUID transitionedBy);
    
    // Find by transition timestamp range
    List<AutomationLifecycleHistory> findByTransitionTimestampBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by automation management ID and timestamp range
    List<AutomationLifecycleHistory> findByAutomationManagementIdAndTransitionTimestampBetween(
        UUID automationManagementId, LocalDateTime startTime, LocalDateTime endTime);
    
    // Count transitions by automation management ID
    long countByAutomationManagementId(UUID automationManagementId);
    
    // Count transitions by state
    long countByNewState(String newState);
    
    // Find latest transition for each automation
    @Query("SELECT h FROM AutomationLifecycleHistory h WHERE h.id IN " +
           "(SELECT MAX(h2.id) FROM AutomationLifecycleHistory h2 GROUP BY h2.automationManagementId)")
    List<AutomationLifecycleHistory> findLatestTransitionsForAllAutomations();
    
    // Find latest transition for specific automation
    @Query("SELECT h FROM AutomationLifecycleHistory h WHERE h.automationManagementId = :automationId " +
           "ORDER BY h.transitionTimestamp DESC LIMIT 1")
    AutomationLifecycleHistory findLatestTransitionByAutomationId(@Param("automationId") UUID automationId);
    
    // Find transitions with specific reason pattern
    @Query("SELECT h FROM AutomationLifecycleHistory h WHERE h.transitionReason LIKE %:reasonPattern%")
    List<AutomationLifecycleHistory> findByTransitionReasonContaining(@Param("reasonPattern") String reasonPattern);
    
    // Analytics: Count transitions by state in date range
    @Query("SELECT h.newState, COUNT(h) FROM AutomationLifecycleHistory h " +
           "WHERE h.transitionTimestamp BETWEEN :startTime AND :endTime " +
           "GROUP BY h.newState")
    List<Object[]> countTransitionsByStateInDateRange(
        @Param("startTime") LocalDateTime startTime, 
        @Param("endTime") LocalDateTime endTime);
    
    // Analytics: Find most active automations (most transitions)
    @Query("SELECT h.automationManagementId, COUNT(h) as transitionCount FROM AutomationLifecycleHistory h " +
           "GROUP BY h.automationManagementId ORDER BY transitionCount DESC")
    List<Object[]> findMostActiveAutomations();
    
    // Analytics: Find transition frequency by user
    @Query("SELECT h.transitionedBy, COUNT(h) as transitionCount FROM AutomationLifecycleHistory h " +
           "WHERE h.transitionedBy IS NOT NULL " +
           "GROUP BY h.transitionedBy ORDER BY transitionCount DESC")
    List<Object[]> findTransitionFrequencyByUser();
    
    // Find transitions with metadata containing specific key
    @Query("SELECT h FROM AutomationLifecycleHistory h WHERE h.metadata ? :key")
    List<AutomationLifecycleHistory> findByMetadataKey(@Param("key") String key);
    
    // Find transitions with metadata containing specific key-value pair
    @Query("SELECT h FROM AutomationLifecycleHistory h WHERE h.metadata ->> :key = :value")
    List<AutomationLifecycleHistory> findByMetadataKeyValue(
        @Param("key") String key, @Param("value") String value);
}
