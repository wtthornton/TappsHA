package com.tappha.autonomous.repository;

import com.tappha.autonomous.entity.AutomationBackup;
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
public interface AutomationBackupRepository extends JpaRepository<AutomationBackup, UUID> {
    
    // Find by automation management ID
    List<AutomationBackup> findByAutomationManagementIdOrderByCreatedAtDesc(UUID automationManagementId);
    
    // Find by automation management ID with pagination
    Page<AutomationBackup> findByAutomationManagementId(UUID automationManagementId, Pageable pageable);
    
    // Find by backup type
    List<AutomationBackup> findByBackupType(String backupType);
    
    // Find by automation management ID and backup type
    List<AutomationBackup> findByAutomationManagementIdAndBackupType(UUID automationManagementId, String backupType);
    
    // Find by creation date range
    List<AutomationBackup> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by automation management ID and creation date range
    List<AutomationBackup> findByAutomationManagementIdAndCreatedAtBetween(
        UUID automationManagementId, LocalDateTime startTime, LocalDateTime endTime);
    
    // Find by backup size range (in bytes)
    List<AutomationBackup> findByBackupSizeBytesBetween(Long minSize, Long maxSize);
    
    // Find by backup size greater than threshold
    List<AutomationBackup> findByBackupSizeBytesGreaterThan(Long threshold);
    
    // Find by created by user
    List<AutomationBackup> findByCreatedBy(UUID createdBy);
    
    // Find by automation management ID and created by user
    List<AutomationBackup> findByAutomationManagementIdAndCreatedBy(UUID automationManagementId, UUID createdBy);
    
    // Find by backup name containing pattern
    List<AutomationBackup> findByBackupNameContaining(String namePattern);
    
    // Find by automation management ID and backup name containing pattern
    List<AutomationBackup> findByAutomationManagementIdAndBackupNameContaining(UUID automationManagementId, String namePattern);
    
    // Count by automation management ID
    long countByAutomationManagementId(UUID automationManagementId);
    
    // Count by backup type
    long countByBackupType(String backupType);
    
    // Count by automation management ID and backup type
    long countByAutomationManagementIdAndBackupType(UUID automationManagementId, String backupType);
    
    // Find latest backup for specific automation
    @Query("SELECT b FROM AutomationBackup b WHERE b.automationManagementId = :automationId " +
           "ORDER BY b.createdAt DESC LIMIT 1")
    AutomationBackup findLatestBackupByAutomationId(@Param("automationId") UUID automationId);
    
    // Find latest backup by type for specific automation
    @Query("SELECT b FROM AutomationBackup b WHERE b.automationManagementId = :automationId " +
           "AND b.backupType = :backupType ORDER BY b.createdAt DESC LIMIT 1")
    AutomationBackup findLatestBackupByAutomationIdAndType(
        @Param("automationId") UUID automationId, @Param("backupType") String backupType);
    
    // Find backups with specific description pattern
    @Query("SELECT b FROM AutomationBackup b WHERE b.backupDescription LIKE %:descriptionPattern%")
    List<AutomationBackup> findByBackupDescriptionContaining(@Param("descriptionPattern") String descriptionPattern);
    
    // Find backups with specific description pattern for automation
    @Query("SELECT b FROM AutomationBackup b WHERE b.automationManagementId = :automationId " +
           "AND b.backupDescription LIKE %:descriptionPattern%")
    List<AutomationBackup> findByAutomationManagementIdAndBackupDescriptionContaining(
        @Param("automationId") UUID automationId, @Param("descriptionPattern") String descriptionPattern);
    
    // Analytics: Calculate total backup size by automation
    @Query("SELECT b.automationManagementId, SUM(b.backupSizeBytes) as totalSize FROM AutomationBackup b " +
           "GROUP BY b.automationManagementId")
    List<Object[]> calculateTotalBackupSizeByAutomation();
    
    // Analytics: Count backups by type
    @Query("SELECT b.backupType, COUNT(b) FROM AutomationBackup b " +
           "GROUP BY b.backupType ORDER BY COUNT(b) DESC")
    List<Object[]> countBackupsByType();
    
    // Analytics: Calculate backup frequency by automation
    @Query("SELECT b.automationManagementId, COUNT(b) as backupCount FROM AutomationBackup b " +
           "GROUP BY b.automationManagementId ORDER BY backupCount DESC")
    List<Object[]> calculateBackupFrequencyByAutomation();
    
    // Analytics: Find largest backups
    @Query("SELECT b FROM AutomationBackup b ORDER BY b.backupSizeBytes DESC LIMIT :limit")
    List<AutomationBackup> findLargestBackups(@Param("limit") int limit);
    
    // Analytics: Calculate backup trends over time
    @Query("SELECT DATE(b.createdAt) as backupDate, COUNT(b) as backupCount, " +
           "AVG(b.backupSizeBytes) as avgBackupSize FROM AutomationBackup b " +
           "WHERE b.automationManagementId = :automationId " +
           "AND b.createdAt BETWEEN :startTime AND :endTime " +
           "GROUP BY DATE(b.createdAt) ORDER BY backupDate")
    List<Object[]> calculateBackupTrends(
        @Param("automationId") UUID automationId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
    
    // Find backups older than specified days
    @Query("SELECT b FROM AutomationBackup b WHERE b.createdAt < :cutoffDate")
    List<AutomationBackup> findBackupsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find backups by automation management ID older than specified days
    @Query("SELECT b FROM AutomationBackup b WHERE b.automationManagementId = :automationId " +
           "AND b.createdAt < :cutoffDate")
    List<AutomationBackup> findBackupsByAutomationIdOlderThan(
        @Param("automationId") UUID automationId, @Param("cutoffDate") LocalDateTime cutoffDate);
    
    // Find backups with metadata containing specific key
    @Query("SELECT b FROM AutomationBackup b WHERE b.backupMetadata ? :key")
    List<AutomationBackup> findByBackupMetadataKey(@Param("key") String key);
    
    // Find backups with metadata containing specific key-value pair
    @Query("SELECT b FROM AutomationBackup b WHERE b.backupMetadata ->> :key = :value")
    List<AutomationBackup> findByBackupMetadataKeyValue(
        @Param("key") String key, @Param("value") String value);
    
    // Find backups with backup data containing specific key
    @Query("SELECT b FROM AutomationBackup b WHERE b.backupData ? :key")
    List<AutomationBackup> findByBackupDataKey(@Param("key") String key);
    
    // Find backups with backup data containing specific key-value pair
    @Query("SELECT b FROM AutomationBackup b WHERE b.backupData ->> :key = :value")
    List<AutomationBackup> findByBackupDataKeyValue(
        @Param("key") String key, @Param("value") String value);
    
    // Find backups created by specific user in date range
    @Query("SELECT b FROM AutomationBackup b WHERE b.createdBy = :userId " +
           "AND b.createdAt BETWEEN :startTime AND :endTime")
    List<AutomationBackup> findByCreatedByAndDateRange(
        @Param("userId") UUID userId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime);
}
