package com.tappha.backup.controller;

import com.tappha.backup.dto.BackupDTO;
import com.tappha.backup.dto.BackupValidationDTO;
import com.tappha.backup.dto.RestoreRequestDTO;
import com.tappha.backup.service.ConfigurationBackupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Configuration Backup Controller
 *
 * Provides REST endpoints for configuration backup management including:
 * - Automatic and manual backup creation
 * - Backup validation and integrity checks
 * - Backup restoration and rollback
 * - Backup history and statistics
 * - Backup cleanup and management
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@RestController
@RequestMapping("/api/v1/backups")
@Slf4j
public class ConfigurationBackupController {

    @Autowired
    private ConfigurationBackupService backupService;

    /**
     * Create automatic backup before configuration changes
     *
     * @param userId The user ID
     * @param changeType The type of change
     * @param changeDescription Description of the change
     * @return ResponseEntity with backup information
     */
    @PostMapping("/automatic")
    public ResponseEntity<BackupDTO> createAutomaticBackup(
            @RequestParam String userId,
            @RequestParam String changeType,
            @RequestParam String changeDescription) {
        try {
            log.info("Creating automatic backup for user: {} - changeType: {}", userId, changeType);
            BackupDTO backup = backupService.createAutomaticBackup(userId, changeType, changeDescription);
            return ResponseEntity.ok(backup);
        } catch (Exception e) {
            log.error("Error creating automatic backup for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create manual backup
     *
     * @param userId The user ID
     * @param backupDescription Description of the backup
     * @return ResponseEntity with backup information
     */
    @PostMapping("/manual")
    public ResponseEntity<BackupDTO> createManualBackup(
            @RequestParam String userId,
            @RequestParam String backupDescription) {
        try {
            log.info("Creating manual backup for user: {} - description: {}", userId, backupDescription);
            BackupDTO backup = backupService.createManualBackup(userId, backupDescription);
            return ResponseEntity.ok(backup);
        } catch (Exception e) {
            log.error("Error creating manual backup for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate backup integrity
     *
     * @param backupId The backup ID
     * @return ResponseEntity with validation results
     */
    @GetMapping("/{backupId}/validate")
    public ResponseEntity<BackupValidationDTO> validateBackup(@PathVariable String backupId) {
        try {
            log.info("Validating backup: {}", backupId);
            BackupValidationDTO validation = backupService.validateBackup(backupId);
            return ResponseEntity.ok(validation);
        } catch (Exception e) {
            log.error("Error validating backup: {}", backupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Restore configuration from backup
     *
     * @param restoreRequest The restore request
     * @return ResponseEntity with restore information
     */
    @PostMapping("/restore")
    public ResponseEntity<BackupDTO> restoreFromBackup(@RequestBody RestoreRequestDTO restoreRequest) {
        try {
            log.info("Restoring configuration from backup: {} for user: {}", 
                restoreRequest.getBackupId(), restoreRequest.getUserId());
            BackupDTO backup = backupService.restoreFromBackup(restoreRequest);
            return ResponseEntity.ok(backup);
        } catch (Exception e) {
            log.error("Error restoring configuration from backup: {}", restoreRequest.getBackupId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backup history for a user
     *
     * @param userId The user ID
     * @param limit The maximum number of backups to return (default: 50)
     * @return ResponseEntity with backup history
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<BackupDTO>> getBackupHistory(
            @PathVariable String userId,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            log.info("Retrieving backup history for user: {} with limit: {}", userId, limit);
            List<BackupDTO> history = backupService.getBackupHistory(userId, limit);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Error retrieving backup history for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backup by ID
     *
     * @param backupId The backup ID
     * @return ResponseEntity with backup information
     */
    @GetMapping("/{backupId}")
    public ResponseEntity<BackupDTO> getBackupById(@PathVariable String backupId) {
        try {
            log.info("Retrieving backup: {}", backupId);
            Optional<BackupDTO> backup = backupService.getBackupById(backupId);
            return backup.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error retrieving backup: {}", backupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete backup
     *
     * @param backupId The backup ID
     * @return ResponseEntity with deletion result
     */
    @DeleteMapping("/{backupId}")
    public ResponseEntity<Map<String, Object>> deleteBackup(@PathVariable String backupId) {
        try {
            log.info("Deleting backup: {}", backupId);
            boolean deleted = backupService.deleteBackup(backupId);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Backup deleted successfully", "backupId", backupId));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error deleting backup: {}", backupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backup statistics for a user
     *
     * @param userId The user ID
     * @return ResponseEntity with backup statistics
     */
    @GetMapping("/statistics/{userId}")
    public ResponseEntity<Map<String, Object>> getBackupStatistics(@PathVariable String userId) {
        try {
            log.info("Getting backup statistics for user: {}", userId);
            Map<String, Object> statistics = backupService.getBackupStatistics(userId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error getting backup statistics for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clean up old backups
     *
     * @param daysToKeep Number of days to keep backups (default: 30)
     * @return ResponseEntity with cleanup results
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldBackups(
            @RequestParam(defaultValue = "30") int daysToKeep) {
        try {
            log.info("Cleaning up backups older than {} days", daysToKeep);
            int deletedCount = backupService.cleanupOldBackups(daysToKeep);
            return ResponseEntity.ok(Map.of(
                "message", "Backup cleanup completed",
                "deletedCount", deletedCount,
                "daysToKeep", daysToKeep
            ));
        } catch (Exception e) {
            log.error("Error during backup cleanup", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backup validation cache status
     *
     * @param backupId The backup ID
     * @return ResponseEntity with validation cache status
     */
    @GetMapping("/{backupId}/validation-cache")
    public ResponseEntity<Map<String, Object>> getValidationCacheStatus(@PathVariable String backupId) {
        try {
            log.info("Getting validation cache status for backup: {}", backupId);
            // This would return the cached validation result if available
            return ResponseEntity.ok(Map.of(
                "backupId", backupId,
                "cacheStatus", "available",
                "timestamp", System.currentTimeMillis()
            ));
        } catch (Exception e) {
            log.error("Error getting validation cache status for backup: {}", backupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Export backup data for audit
     *
     * @param userId The user ID
     * @param startDate The start date
     * @param endDate The end date
     * @return ResponseEntity with backup data for export
     */
    @GetMapping("/export/{userId}")
    public ResponseEntity<List<BackupDTO>> exportBackupData(
            @PathVariable String userId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            log.info("Exporting backup data for user: {} from {} to {}", userId, startDate, endDate);
            // This would implement export functionality
            List<BackupDTO> backups = backupService.getBackupHistory(userId, 1000); // Get all backups
            return ResponseEntity.ok(backups);
        } catch (Exception e) {
            log.error("Error exporting backup data for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backup health status
     *
     * @return ResponseEntity with backup system health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getBackupHealth() {
        try {
            log.info("Getting backup system health status");
            return ResponseEntity.ok(Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis(),
                "backupDirectory", "backups",
                "totalBackups", 0, // This would be calculated
                "lastBackup", null, // This would be retrieved
                "systemStatus", "operational"
            ));
        } catch (Exception e) {
            log.error("Error getting backup system health", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 