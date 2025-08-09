package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.*;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for safe automation modification with rollback capabilities
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
public class AutomationModificationService {

    private final AutomationBackupService backupService;
    private final AutomationRollbackService rollbackService;
    private final AutomationVersionControlService versionControlService;
    private final AutomationValidationService validationService;
    private final HomeAssistantConnectionService connectionService;
    
    // In-memory modification tracking (in production, use database)
    private final Map<String, AutomationModificationResult> activeModifications = new ConcurrentHashMap<>();

    public AutomationModificationService(AutomationBackupService backupService,
                                       AutomationRollbackService rollbackService,
                                       AutomationVersionControlService versionControlService,
                                       AutomationValidationService validationService,
                                       HomeAssistantConnectionService connectionService) {
        this.backupService = backupService;
        this.rollbackService = rollbackService;
        this.versionControlService = versionControlService;
        this.validationService = validationService;
        this.connectionService = connectionService;
    }

    /**
     * Safely modify an automation with backup and rollback capabilities
     */
    @Transactional
    public AutomationModificationResult modifyAutomation(AutomationModificationRequest request) {
        try {
            log.info("Starting safe automation modification for automation: {} by user: {}", 
                    request.getAutomationId(), request.getUserId());
            
            // Step 1: Validate the modification request
            AutomationModificationResult validation = validateModificationRequest(request);
            if (!validation.isSuccess()) {
                log.warn("Modification validation failed: {}", validation.getErrorMessage());
                return validation;
            }
            
            // Step 2: Create backup before modification
            AutomationBackup backup = backupService.createBackup(
                    request.getAutomationId(), 
                    request.getConnectionId(), 
                    request.getUserId(),
                    "Pre-modification backup"
            );
            
            if (backup == null) {
                log.error("Failed to create backup for automation: {}", request.getAutomationId());
                return AutomationModificationResult.builder()
                        .success(false)
                        .errorMessage("Failed to create backup before modification")
                        .build();
            }
            
            // Step 3: Create version snapshot
            AutomationVersion version = versionControlService.createVersion(
                    request.getAutomationId(),
                    request.getConnectionId(),
                    request.getUserId(),
                    backup.getBackupId(),
                    request.getModificationType(),
                    request.getModificationDescription()
            );
            
            // Step 4: Apply the modification
            AutomationModificationResult modificationResult = applyModification(request, backup, version);
            
            // Step 5: Track the active modification
            if (modificationResult.isSuccess()) {
                activeModifications.put(request.getAutomationId(), modificationResult);
                log.info("Successfully modified automation: {} with version: {}", 
                        request.getAutomationId(), version.getVersionId());
            }
            
            return modificationResult;
            
        } catch (Exception e) {
            log.error("Failed to modify automation: {}", request.getAutomationId(), e);
            return AutomationModificationResult.builder()
                    .success(false)
                    .errorMessage("Modification failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Rollback an automation to a previous version
     */
    @Transactional
    public AutomationModificationResult rollbackAutomation(String automationId, 
                                                          String targetVersionId, 
                                                          String userId, 
                                                          UUID connectionId) {
        try {
            log.info("Rolling back automation: {} to version: {} by user: {}", 
                    automationId, targetVersionId, userId);
            
            // Step 1: Validate rollback request
            if (!versionControlService.versionExists(targetVersionId)) {
                log.warn("Target version does not exist: {}", targetVersionId);
                return AutomationModificationResult.builder()
                        .success(false)
                        .errorMessage("Target version does not exist")
                        .build();
            }
            
            // Step 2: Create backup of current state
            AutomationBackup currentBackup = backupService.createBackup(
                    automationId, connectionId, userId, "Pre-rollback backup"
            );
            
            // Step 3: Perform rollback
            AutomationModificationResult rollbackResult = rollbackService.performRollback(
                    automationId, targetVersionId, userId, connectionId
            );
            
            if (rollbackResult.isSuccess()) {
                // Step 4: Create new version for rollback
                versionControlService.createVersion(
                        automationId, connectionId, userId, currentBackup.getBackupId(),
                        "rollback", "Rollback to version: " + targetVersionId
                );
                
                log.info("Successfully rolled back automation: {} to version: {}", 
                        automationId, targetVersionId);
            }
            
            return rollbackResult;
            
        } catch (Exception e) {
            log.error("Failed to rollback automation: {} to version: {}", automationId, targetVersionId, e);
            return AutomationModificationResult.builder()
                    .success(false)
                    .errorMessage("Rollback failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get modification history for an automation
     */
    public List<AutomationVersion> getModificationHistory(String automationId, UUID connectionId) {
        try {
            log.debug("Getting modification history for automation: {}", automationId);
            return versionControlService.getVersionHistory(automationId, connectionId);
            
        } catch (Exception e) {
            log.error("Failed to get modification history for automation: {}", automationId, e);
            return new ArrayList<>();
        }
    }

    /**
     * Get current modification status
     */
    public AutomationModificationResult getModificationStatus(String automationId) {
        return activeModifications.get(automationId);
    }

    /**
     * Cancel an active modification
     */
    @Transactional
    public AutomationModificationResult cancelModification(String automationId, String userId) {
        try {
            log.info("Cancelling modification for automation: {} by user: {}", automationId, userId);
            
            AutomationModificationResult activeMod = activeModifications.get(automationId);
            if (activeMod == null) {
                return AutomationModificationResult.builder()
                        .success(false)
                        .errorMessage("No active modification found")
                        .build();
            }
            
            // Perform rollback to previous version
            AutomationModificationResult rollbackResult = rollbackService.performRollback(
                    automationId, 
                    activeMod.getPreviousVersionId(), 
                    userId, 
                    activeMod.getConnectionId()
            );
            
            if (rollbackResult.isSuccess()) {
                activeModifications.remove(automationId);
                log.info("Successfully cancelled modification for automation: {}", automationId);
            }
            
            return rollbackResult;
            
        } catch (Exception e) {
            log.error("Failed to cancel modification for automation: {}", automationId, e);
            return AutomationModificationResult.builder()
                    .success(false)
                    .errorMessage("Failed to cancel modification: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Validate modification request
     */
    private AutomationModificationResult validateModificationRequest(AutomationModificationRequest request) {
        try {
            List<String> errors = new ArrayList<>();
            
            // Basic validation
            if (request.getAutomationId() == null || request.getAutomationId().isEmpty()) {
                errors.add("Automation ID is required");
            }
            
            if (request.getUserId() == null || request.getUserId().isEmpty()) {
                errors.add("User ID is required");
            }
            
            if (request.getConnectionId() == null) {
                errors.add("Connection ID is required");
            }
            
            if (request.getModificationType() == null || request.getModificationType().isEmpty()) {
                errors.add("Modification type is required");
            }
            
            // Validate connection exists
            if (request.getConnectionId() != null) {
                Optional<HomeAssistantConnection> connectionOpt = connectionService.getConnection(request.getConnectionId());
                if (connectionOpt.isEmpty()) {
                    errors.add("Connection not found");
                }
            }
            
            // Validate modification data
            if (request.getModificationData() == null || request.getModificationData().isEmpty()) {
                errors.add("Modification data is required");
            }
            
            boolean isValid = errors.isEmpty();
            
            return AutomationModificationResult.builder()
                    .success(isValid)
                    .errorMessage(isValid ? null : String.join("; ", errors))
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to validate modification request", e);
            return AutomationModificationResult.builder()
                    .success(false)
                    .errorMessage("Validation failed: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Apply the actual modification
     */
    private AutomationModificationResult applyModification(AutomationModificationRequest request, 
                                                         AutomationBackup backup, 
                                                         AutomationVersion version) {
        try {
            log.debug("Applying modification for automation: {} with type: {}", 
                    request.getAutomationId(), request.getModificationType());
            
            // Validate the modification data
            AutomationValidationResult validation = validationService.validateCompleteConfiguration(
                    request.getModificationData()
            );
            
            if (!validation.isValid()) {
                log.warn("Modification validation failed: {}", validation.getErrors());
                return AutomationModificationResult.builder()
                        .success(false)
                        .errorMessage("Modification validation failed: " + String.join("; ", validation.getErrors()))
                        .build();
            }
            
            // Apply modification based on type
            boolean success = false;
            String errorMessage = null;
            
            switch (request.getModificationType().toLowerCase()) {
                case "update":
                    success = updateAutomation(request);
                    break;
                case "enable":
                    success = enableAutomation(request);
                    break;
                case "disable":
                    success = disableAutomation(request);
                    break;
                case "delete":
                    success = deleteAutomation(request);
                    break;
                case "duplicate":
                    success = duplicateAutomation(request);
                    break;
                default:
                    errorMessage = "Unsupported modification type: " + request.getModificationType();
            }
            
            if (!success && errorMessage == null) {
                errorMessage = "Failed to apply modification";
            }
            
            return AutomationModificationResult.builder()
                    .success(success)
                    .errorMessage(errorMessage)
                    .automationId(request.getAutomationId())
                    .connectionId(request.getConnectionId())
                    .userId(request.getUserId())
                    .modificationType(request.getModificationType())
                    .backupId(backup.getBackupId())
                    .versionId(version.getVersionId())
                    .previousVersionId(version.getPreviousVersionId())
                    .modificationTimestamp(System.currentTimeMillis())
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to apply modification for automation: {}", request.getAutomationId(), e);
            return AutomationModificationResult.builder()
                    .success(false)
                    .errorMessage("Failed to apply modification: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update automation configuration
     */
    private boolean updateAutomation(AutomationModificationRequest request) {
        try {
            log.debug("Updating automation: {}", request.getAutomationId());
            
            // TODO: Implement actual Home Assistant API call
            // For now, simulate successful update
            return true;
            
        } catch (Exception e) {
            log.error("Failed to update automation: {}", request.getAutomationId(), e);
            return false;
        }
    }

    /**
     * Enable automation
     */
    private boolean enableAutomation(AutomationModificationRequest request) {
        try {
            log.debug("Enabling automation: {}", request.getAutomationId());
            
            // TODO: Implement actual Home Assistant API call
            // For now, simulate successful enable
            return true;
            
        } catch (Exception e) {
            log.error("Failed to enable automation: {}", request.getAutomationId(), e);
            return false;
        }
    }

    /**
     * Disable automation
     */
    private boolean disableAutomation(AutomationModificationRequest request) {
        try {
            log.debug("Disabling automation: {}", request.getAutomationId());
            
            // TODO: Implement actual Home Assistant API call
            // For now, simulate successful disable
            return true;
            
        } catch (Exception e) {
            log.error("Failed to disable automation: {}", request.getAutomationId(), e);
            return false;
        }
    }

    /**
     * Delete automation
     */
    private boolean deleteAutomation(AutomationModificationRequest request) {
        try {
            log.debug("Deleting automation: {}", request.getAutomationId());
            
            // TODO: Implement actual Home Assistant API call
            // For now, simulate successful delete
            return true;
            
        } catch (Exception e) {
            log.error("Failed to delete automation: {}", request.getAutomationId(), e);
            return false;
        }
    }

    /**
     * Duplicate automation
     */
    private boolean duplicateAutomation(AutomationModificationRequest request) {
        try {
            log.debug("Duplicating automation: {}", request.getAutomationId());
            
            // TODO: Implement actual Home Assistant API call
            // For now, simulate successful duplicate
            return true;
            
        } catch (Exception e) {
            log.error("Failed to duplicate automation: {}", request.getAutomationId(), e);
            return false;
        }
    }

    /**
     * Clean up expired modifications
     */
    public void cleanupExpiredModifications() {
        try {
            long currentTime = System.currentTimeMillis();
            long expirationTime = 24 * 60 * 60 * 1000; // 24 hours
            
            activeModifications.entrySet().removeIf(entry -> {
                AutomationModificationResult modification = entry.getValue();
                return (currentTime - modification.getModificationTimestamp()) > expirationTime;
            });
            
            log.info("Cleaned up expired modifications");
            
        } catch (Exception e) {
            log.error("Failed to cleanup expired modifications", e);
        }
    }
}
