package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AutomationModificationRequest;
import com.tappha.homeassistant.dto.AutomationModificationResult;
import com.tappha.homeassistant.dto.AutomationBackup;
import com.tappha.homeassistant.dto.AutomationVersion;
import com.tappha.homeassistant.service.AutomationModificationService;
import com.tappha.homeassistant.service.AutomationBackupService;
import com.tappha.homeassistant.service.AutomationRollbackService;
import com.tappha.homeassistant.service.AutomationVersionControlService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for automation modification operations with rollback capabilities
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@RestController
@RequestMapping("/api/v1/automation-modification")
@Slf4j
public class AutomationModificationController {

    private final AutomationModificationService modificationService;
    private final AutomationBackupService backupService;
    private final AutomationRollbackService rollbackService;
    private final AutomationVersionControlService versionControlService;

    public AutomationModificationController(AutomationModificationService modificationService,
                                          AutomationBackupService backupService,
                                          AutomationRollbackService rollbackService,
                                          AutomationVersionControlService versionControlService) {
        this.modificationService = modificationService;
        this.backupService = backupService;
        this.rollbackService = rollbackService;
        this.versionControlService = versionControlService;
    }

    /**
     * Modify an automation with safety mechanisms
     */
    @PostMapping("/modify")
    public ResponseEntity<AutomationModificationResult> modifyAutomation(
            @RequestBody AutomationModificationRequest request) {
        
        try {
            log.info("Modifying automation: {} by user: {}", request.getAutomationId(), request.getUserId());
            
            AutomationModificationResult result = modificationService.modifyAutomation(request);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            log.error("Failed to modify automation: {}", request.getAutomationId(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Rollback automation to a specific version
     */
    @PostMapping("/rollback/{automationId}")
    public ResponseEntity<AutomationModificationResult> rollbackAutomation(
            @PathVariable String automationId,
            @RequestParam String targetVersionId,
            @RequestParam String userId,
            @RequestParam UUID connectionId) {
        
        try {
            log.info("Rolling back automation: {} to version: {} by user: {}", 
                    automationId, targetVersionId, userId);
            
            AutomationModificationResult result = modificationService.rollbackAutomation(
                    automationId, targetVersionId, userId, connectionId);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            log.error("Failed to rollback automation: {} to version: {}", automationId, targetVersionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Rollback automation to previous version
     */
    @PostMapping("/rollback/{automationId}/previous")
    public ResponseEntity<AutomationModificationResult> rollbackToPrevious(
            @PathVariable String automationId,
            @RequestParam String userId,
            @RequestParam UUID connectionId) {
        
        try {
            log.info("Rolling back automation: {} to previous version by user: {}", automationId, userId);
            
            AutomationModificationResult result = modificationService.rollbackAutomation(
                    automationId, null, userId, connectionId);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            log.error("Failed to rollback automation: {} to previous version", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get modification history for an automation
     */
    @GetMapping("/history/{automationId}")
    public ResponseEntity<List<AutomationVersion>> getModificationHistory(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        try {
            log.debug("Getting modification history for automation: {}", automationId);
            
            List<AutomationVersion> history = modificationService.getModificationHistory(automationId, connectionId);
            
            return ResponseEntity.ok(history);
            
        } catch (Exception e) {
            log.error("Failed to get modification history for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get current modification status
     */
    @GetMapping("/status/{automationId}")
    public ResponseEntity<AutomationModificationResult> getModificationStatus(
            @PathVariable String automationId) {
        
        try {
            log.debug("Getting modification status for automation: {}", automationId);
            
            AutomationModificationResult status = modificationService.getModificationStatus(automationId);
            
            if (status != null) {
                return ResponseEntity.ok(status);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Failed to get modification status for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Cancel an active modification
     */
    @PostMapping("/cancel/{automationId}")
    public ResponseEntity<AutomationModificationResult> cancelModification(
            @PathVariable String automationId,
            @RequestParam String userId) {
        
        try {
            log.info("Cancelling modification for automation: {} by user: {}", automationId, userId);
            
            AutomationModificationResult result = modificationService.cancelModification(automationId, userId);
            
            if (result.isSuccess()) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            log.error("Failed to cancel modification for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get rollback targets for an automation
     */
    @GetMapping("/rollback-targets/{automationId}")
    public ResponseEntity<List<AutomationVersion>> getRollbackTargets(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        try {
            log.debug("Getting rollback targets for automation: {}", automationId);
            
            List<AutomationVersion> targets = rollbackService.getRollbackTargets(automationId, connectionId);
            
            return ResponseEntity.ok(targets);
            
        } catch (Exception e) {
            log.error("Failed to get rollback targets for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate rollback possibility
     */
    @PostMapping("/validate-rollback/{automationId}")
    public ResponseEntity<Map<String, Object>> validateRollback(
            @PathVariable String automationId,
            @RequestParam String targetVersionId,
            @RequestParam UUID connectionId) {
        
        try {
            log.debug("Validating rollback for automation: {} to version: {}", automationId, targetVersionId);
            
            boolean isValid = rollbackService.validateRollback(automationId, targetVersionId, connectionId);
            
            Map<String, Object> response = Map.of(
                    "automationId", automationId,
                    "targetVersionId", targetVersionId,
                    "isValid", isValid,
                    "validationTimestamp", System.currentTimeMillis()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to validate rollback for automation: {} to version: {}", 
                    automationId, targetVersionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backups for an automation
     */
    @GetMapping("/backups/{automationId}")
    public ResponseEntity<List<AutomationBackup>> getBackups(
            @PathVariable String automationId) {
        
        try {
            log.debug("Getting backups for automation: {}", automationId);
            
            List<AutomationBackup> backups = backupService.getBackupsForAutomation(automationId);
            
            return ResponseEntity.ok(backups);
            
        } catch (Exception e) {
            log.error("Failed to get backups for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get backup by ID
     */
    @GetMapping("/backups/backup/{backupId}")
    public ResponseEntity<AutomationBackup> getBackup(@PathVariable String backupId) {
        try {
            log.debug("Getting backup: {}", backupId);
            
            AutomationBackup backup = backupService.getBackup(backupId);
            
            if (backup != null) {
                return ResponseEntity.ok(backup);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Failed to get backup: {}", backupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Restore automation from backup
     */
    @PostMapping("/restore/{backupId}")
    public ResponseEntity<Map<String, Object>> restoreFromBackup(
            @PathVariable String backupId,
            @RequestParam String userId,
            @RequestParam UUID connectionId) {
        
        try {
            log.info("Restoring automation from backup: {} by user: {}", backupId, userId);
            
            boolean success = backupService.restoreFromBackup(backupId, userId, connectionId);
            
            Map<String, Object> response = Map.of(
                    "backupId", backupId,
                    "success", success,
                    "restoreTimestamp", System.currentTimeMillis()
            );
            
            if (success) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Failed to restore from backup: {}", backupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete backup
     */
    @DeleteMapping("/backups/{backupId}")
    public ResponseEntity<Map<String, Object>> deleteBackup(@PathVariable String backupId) {
        try {
            log.info("Deleting backup: {}", backupId);
            
            boolean success = backupService.deleteBackup(backupId);
            
            Map<String, Object> response = Map.of(
                    "backupId", backupId,
                    "success", success,
                    "deleteTimestamp", System.currentTimeMillis()
            );
            
            if (success) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Failed to delete backup: {}", backupId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Compare two versions
     */
    @PostMapping("/compare-versions")
    public ResponseEntity<Map<String, Object>> compareVersions(
            @RequestParam String versionId1,
            @RequestParam String versionId2) {
        
        try {
            log.debug("Comparing versions: {} and {}", versionId1, versionId2);
            
            Map<String, Object> comparison = versionControlService.compareVersions(versionId1, versionId2);
            
            if (comparison.containsKey("error")) {
                return ResponseEntity.badRequest().body(comparison);
            } else {
                return ResponseEntity.ok(comparison);
            }
            
        } catch (Exception e) {
            log.error("Failed to compare versions: {} and {}", versionId1, versionId2, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get version statistics for an automation
     */
    @GetMapping("/statistics/{automationId}")
    public ResponseEntity<Map<String, Object>> getVersionStatistics(
            @PathVariable String automationId,
            @RequestParam UUID connectionId) {
        
        try {
            log.debug("Getting version statistics for automation: {}", automationId);
            
            Map<String, Object> statistics = versionControlService.getVersionStatistics(automationId, connectionId);
            
            if (statistics.containsKey("error")) {
                return ResponseEntity.badRequest().body(statistics);
            } else {
                return ResponseEntity.ok(statistics);
            }
            
        } catch (Exception e) {
            log.error("Failed to get version statistics for automation: {}", automationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clean up expired modifications
     */
    @PostMapping("/cleanup")
    public ResponseEntity<Void> cleanupExpiredModifications() {
        try {
            log.info("Cleaning up expired modifications");
            
            modificationService.cleanupExpiredModifications();
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Failed to cleanup expired modifications", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clean up old backups
     */
    @PostMapping("/cleanup-backups")
    public ResponseEntity<Map<String, Object>> cleanupOldBackups(
            @RequestParam(defaultValue = "10") int maxBackupsPerAutomation) {
        
        try {
            log.info("Cleaning up old backups, max per automation: {}", maxBackupsPerAutomation);
            
            backupService.cleanupOldBackups(maxBackupsPerAutomation);
            
            Map<String, Object> response = Map.of(
                    "maxBackupsPerAutomation", maxBackupsPerAutomation,
                    "cleanupTimestamp", System.currentTimeMillis(),
                    "success", true
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to cleanup old backups", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clean up old versions
     */
    @PostMapping("/cleanup-versions")
    public ResponseEntity<Map<String, Object>> cleanupOldVersions(
            @RequestParam(defaultValue = "20") int maxVersionsPerAutomation) {
        
        try {
            log.info("Cleaning up old versions, max per automation: {}", maxVersionsPerAutomation);
            
            versionControlService.cleanupOldVersions(maxVersionsPerAutomation);
            
            Map<String, Object> response = Map.of(
                    "maxVersionsPerAutomation", maxVersionsPerAutomation,
                    "cleanupTimestamp", System.currentTimeMillis(),
                    "success", true
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to cleanup old versions", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
