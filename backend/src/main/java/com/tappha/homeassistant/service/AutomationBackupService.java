package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationBackup;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for automation backup management
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
public class AutomationBackupService {

    // In-memory backup storage (in production, use database or file system)
    private final Map<String, AutomationBackup> backups = new ConcurrentHashMap<>();

    /**
     * Create a backup of an automation
     */
    public AutomationBackup createBackup(String automationId, 
                                        UUID connectionId, 
                                        String userId, 
                                        String description) {
        try {
            log.info("Creating backup for automation: {} by user: {}", automationId, userId);
            
            String backupId = UUID.randomUUID().toString();
            
            // TODO: Implement actual Home Assistant API call to get automation data
            // For now, create mock backup data
            Map<String, Object> backupData = createMockBackupData(automationId);
            
            AutomationBackup backup = AutomationBackup.builder()
                    .backupId(backupId)
                    .automationId(automationId)
                    .connectionId(connectionId)
                    .userId(userId)
                    .backupDescription(description)
                    .backupData(backupData)
                    .backupType("full")
                    .backupTimestamp(System.currentTimeMillis())
                    .backupSize(calculateBackupSize(backupData))
                    .checksum(calculateChecksum(backupData))
                    .compressed(false)
                    .metadata(new HashMap<>())
                    .build();
            
            backups.put(backupId, backup);
            
            log.info("Successfully created backup: {} for automation: {}", backupId, automationId);
            return backup;
            
        } catch (Exception e) {
            log.error("Failed to create backup for automation: {}", automationId, e);
            return null;
        }
    }

    /**
     * Get backup by ID
     */
    public AutomationBackup getBackup(String backupId) {
        try {
            log.debug("Getting backup: {}", backupId);
            return backups.get(backupId);
            
        } catch (Exception e) {
            log.error("Failed to get backup: {}", backupId, e);
            return null;
        }
    }

    /**
     * Get backups for an automation
     */
    public List<AutomationBackup> getBackupsForAutomation(String automationId) {
        try {
            log.debug("Getting backups for automation: {}", automationId);
            
            return backups.values().stream()
                    .filter(backup -> automationId.equals(backup.getAutomationId()))
                    .sorted(Comparator.comparing(AutomationBackup::getBackupTimestamp).reversed())
                    .toList();
                    
        } catch (Exception e) {
            log.error("Failed to get backups for automation: {}", automationId, e);
            return new ArrayList<>();
        }
    }

    /**
     * Restore automation from backup
     */
    public boolean restoreFromBackup(String backupId, String userId, UUID connectionId) {
        try {
            log.info("Restoring automation from backup: {} by user: {}", backupId, userId);
            
            AutomationBackup backup = getBackup(backupId);
            if (backup == null) {
                log.warn("Backup not found: {}", backupId);
                return false;
            }
            
            // TODO: Implement actual Home Assistant API call to restore automation
            // For now, simulate successful restore
            log.info("Successfully restored automation: {} from backup: {}", 
                    backup.getAutomationId(), backupId);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to restore from backup: {}", backupId, e);
            return false;
        }
    }

    /**
     * Delete backup
     */
    public boolean deleteBackup(String backupId) {
        try {
            log.info("Deleting backup: {}", backupId);
            
            AutomationBackup backup = backups.remove(backupId);
            if (backup != null) {
                log.info("Successfully deleted backup: {}", backupId);
                return true;
            } else {
                log.warn("Backup not found for deletion: {}", backupId);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Failed to delete backup: {}", backupId, e);
            return false;
        }
    }

    /**
     * Clean up old backups
     */
    public void cleanupOldBackups(int maxBackupsPerAutomation) {
        try {
            log.info("Cleaning up old backups, max per automation: {}", maxBackupsPerAutomation);
            
            // Group backups by automation ID
            Map<String, List<AutomationBackup>> backupsByAutomation = new HashMap<>();
            
            for (AutomationBackup backup : backups.values()) {
                backupsByAutomation.computeIfAbsent(backup.getAutomationId(), k -> new ArrayList<>())
                        .add(backup);
            }
            
            // Remove old backups for each automation
            for (Map.Entry<String, List<AutomationBackup>> entry : backupsByAutomation.entrySet()) {
                String automationId = entry.getKey();
                List<AutomationBackup> automationBackups = entry.getValue();
                
                if (automationBackups.size() > maxBackupsPerAutomation) {
                    // Sort by timestamp (oldest first) and remove excess
                    automationBackups.sort(Comparator.comparing(AutomationBackup::getBackupTimestamp));
                    
                    int toRemove = automationBackups.size() - maxBackupsPerAutomation;
                    for (int i = 0; i < toRemove; i++) {
                        AutomationBackup oldBackup = automationBackups.get(i);
                        deleteBackup(oldBackup.getBackupId());
                    }
                    
                    log.info("Removed {} old backups for automation: {}", toRemove, automationId);
                }
            }
            
        } catch (Exception e) {
            log.error("Failed to cleanup old backups", e);
        }
    }

    /**
     * Create mock backup data for development
     */
    private Map<String, Object> createMockBackupData(String automationId) {
        Map<String, Object> backupData = new HashMap<>();
        
        backupData.put("automationId", automationId);
        backupData.put("alias", "Mock Automation");
        backupData.put("description", "Mock automation for testing");
        backupData.put("triggers", List.of(Map.of(
                "platform", "state",
                "entity_id", "binary_sensor.motion"
        )));
        backupData.put("conditions", List.of(Map.of(
                "condition", "time",
                "after", "06:00:00",
                "before", "22:00:00"
        )));
        backupData.put("actions", List.of(Map.of(
                "service", "light.turn_on",
                "entity_id", "light.living_room"
        )));
        backupData.put("enabled", true);
        backupData.put("mode", "single");
        
        return backupData;
    }

    /**
     * Calculate backup size
     */
    private long calculateBackupSize(Map<String, Object> backupData) {
        // Simple size calculation for development
        return backupData.toString().getBytes().length;
    }

    /**
     * Calculate checksum for backup data
     */
    private String calculateChecksum(Map<String, Object> backupData) {
        // Simple checksum calculation for development
        return Integer.toHexString(backupData.toString().hashCode());
    }

    /**
     * Validate backup integrity
     */
    public boolean validateBackupIntegrity(String backupId) {
        try {
            log.debug("Validating backup integrity: {}", backupId);
            
            AutomationBackup backup = getBackup(backupId);
            if (backup == null) {
                return false;
            }
            
            // Check if checksum matches
            String calculatedChecksum = calculateChecksum(backup.getBackupData());
            boolean isValid = calculatedChecksum.equals(backup.getChecksum());
            
            log.debug("Backup integrity validation result: {} for backup: {}", isValid, backupId);
            return isValid;
            
        } catch (Exception e) {
            log.error("Failed to validate backup integrity: {}", backupId, e);
            return false;
        }
    }
}
