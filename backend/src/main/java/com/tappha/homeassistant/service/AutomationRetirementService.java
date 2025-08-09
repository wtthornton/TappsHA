package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationRetirementRequest;
import com.tappha.homeassistant.dto.AutomationRetirementResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for managing graceful automation retirement
 * Handles retirement process with dependency resolution and safety mechanisms
 */
@Slf4j
@Service
public class AutomationRetirementService {
    
    private final AutomationDependencyService dependencyService;
    private final AutomationBackupService backupService;
    private final AutomationModificationService modificationService;
    
    // In-memory storage for development
    private final Map<String, AutomationRetirementRequest> activeRetirements = new ConcurrentHashMap<>();
    private final Map<String, AutomationRetirementResult> retirementHistory = new ConcurrentHashMap<>();
    
    public AutomationRetirementService(AutomationDependencyService dependencyService,
                                    AutomationBackupService backupService,
                                    AutomationModificationService modificationService) {
        this.dependencyService = dependencyService;
        this.backupService = backupService;
        this.modificationService = modificationService;
    }
    
    /**
     * Initiate automation retirement process
     */
    public AutomationRetirementResult initiateRetirement(AutomationRetirementRequest request) {
        log.info("Initiating retirement for automation: {}", request.getAutomationId());
        
        try {
            // Validate retirement request
            if (!validateRetirementRequest(request)) {
                return AutomationRetirementResult.builder()
                        .success(false)
                        .errorMessage("Invalid retirement request")
                        .automationId(request.getAutomationId())
                        .connectionId(request.getConnectionId())
                        .userId(request.getUserId())
                        .build();
            }
            
            // Analyze dependencies
            Map<String, Object> dependencyAnalysis = dependencyService.analyzeDependencies(
                    request.getAutomationId(), request.getConnectionId());
            
            // Resolve dependencies
            Map<String, Object> dependencyResolution = dependencyService.resolveDependenciesForRetirement(
                    request.getAutomationId(), request.getConnectionId(), request.isForceRetirement());
            
            // Check if retirement is possible
            boolean canRetire = (Boolean) dependencyResolution.get("canRetire");
            if (!canRetire && !request.isForceRetirement()) {
                return AutomationRetirementResult.builder()
                        .success(false)
                        .errorMessage("Cannot retire automation due to unresolved dependencies")
                        .automationId(request.getAutomationId())
                        .connectionId(request.getConnectionId())
                        .userId(request.getUserId())
                        .resolvedDependencies((List<String>) dependencyResolution.get("resolvedDependencies"))
                        .unresolvedDependencies((List<String>) dependencyResolution.get("unresolvedDependencies"))
                        .affectedAutomations((List<String>) dependencyResolution.get("affectedAutomations"))
                        .dependencyAnalysis(dependencyAnalysis)
                        .build();
            }
            
            // Create backup before retirement
            String backupId = createPreRetirementBackup(request);
            
            // Perform retirement based on type
            AutomationRetirementResult result = performRetirement(request, dependencyResolution, backupId);
            
            // Store retirement history
            retirementHistory.put(request.getAutomationId(), result);
            
            return result;
            
        } catch (Exception e) {
            log.error("Error during retirement process: {}", e.getMessage(), e);
            return AutomationRetirementResult.builder()
                    .success(false)
                    .errorMessage("Error during retirement process: " + e.getMessage())
                    .automationId(request.getAutomationId())
                    .connectionId(request.getConnectionId())
                    .userId(request.getUserId())
                    .build();
        }
    }
    
    /**
     * Perform retirement based on type
     */
    private AutomationRetirementResult performRetirement(AutomationRetirementRequest request,
                                                       Map<String, Object> dependencyResolution,
                                                       String backupId) {
        String retirementType = request.getRetirementType();
        
        switch (retirementType) {
            case "immediate":
                return performImmediateRetirement(request, dependencyResolution, backupId);
            case "scheduled":
                return performScheduledRetirement(request, dependencyResolution, backupId);
            case "gradual":
                return performGradualRetirement(request, dependencyResolution, backupId);
            default:
                return AutomationRetirementResult.builder()
                        .success(false)
                        .errorMessage("Invalid retirement type: " + retirementType)
                        .automationId(request.getAutomationId())
                        .connectionId(request.getConnectionId())
                        .userId(request.getUserId())
                        .build();
        }
    }
    
    /**
     * Perform immediate retirement
     */
    private AutomationRetirementResult performImmediateRetirement(AutomationRetirementRequest request,
                                                               Map<String, Object> dependencyResolution,
                                                               String backupId) {
        log.info("Performing immediate retirement for automation: {}", request.getAutomationId());
        
        // Disable automation
        boolean disabled = disableAutomation(request.getAutomationId(), request.getConnectionId());
        
        // Create replacement if requested
        String replacementId = null;
        if (request.isCreateReplacement()) {
            replacementId = createReplacementAutomation(request);
        }
        
        // Remove dependencies
        List<String> resolvedDependencies = (List<String>) dependencyResolution.get("resolvedDependencies");
        for (String dependencyId : resolvedDependencies) {
            dependencyService.removeDependency(dependencyId);
        }
        
        return AutomationRetirementResult.builder()
                .success(true)
                .automationId(request.getAutomationId())
                .connectionId(request.getConnectionId())
                .userId(request.getUserId())
                .retirementType("immediate")
                .retirementReason(request.getRetirementReason())
                .retirementTimestamp(System.currentTimeMillis())
                .forceRetirement(request.isForceRetirement())
                .createReplacement(request.isCreateReplacement())
                .replacementAutomationId(replacementId)
                .resolvedDependencies(resolvedDependencies)
                .unresolvedDependencies((List<String>) dependencyResolution.get("unresolvedDependencies"))
                .affectedAutomations((List<String>) dependencyResolution.get("affectedAutomations"))
                .dependencyAnalysis(dependencyService.analyzeDependencies(request.getAutomationId(), request.getConnectionId()))
                .safetyValidation(validateRetirementSafety(request))
                .resultData(Map.of("disabled", disabled, "backupId", backupId))
                .metadata(request.getMetadata())
                .build();
    }
    
    /**
     * Perform scheduled retirement
     */
    private AutomationRetirementResult performScheduledRetirement(AutomationRetirementRequest request,
                                                               Map<String, Object> dependencyResolution,
                                                               String backupId) {
        log.info("Scheduling retirement for automation: {} at {}", 
                request.getAutomationId(), request.getScheduledRetirementTime());
        
        // Store active retirement for scheduled execution
        activeRetirements.put(request.getAutomationId(), request);
        
        return AutomationRetirementResult.builder()
                .success(true)
                .automationId(request.getAutomationId())
                .connectionId(request.getConnectionId())
                .userId(request.getUserId())
                .retirementType("scheduled")
                .retirementReason(request.getRetirementReason())
                .retirementTimestamp(System.currentTimeMillis())
                .scheduledRetirementTime(request.getScheduledRetirementTime())
                .forceRetirement(request.isForceRetirement())
                .createReplacement(request.isCreateReplacement())
                .resolvedDependencies((List<String>) dependencyResolution.get("resolvedDependencies"))
                .unresolvedDependencies((List<String>) dependencyResolution.get("unresolvedDependencies"))
                .affectedAutomations((List<String>) dependencyResolution.get("affectedAutomations"))
                .dependencyAnalysis(dependencyService.analyzeDependencies(request.getAutomationId(), request.getConnectionId()))
                .safetyValidation(validateRetirementSafety(request))
                .resultData(Map.of("scheduled", true, "backupId", backupId))
                .metadata(request.getMetadata())
                .build();
    }
    
    /**
     * Perform gradual retirement
     */
    private AutomationRetirementResult performGradualRetirement(AutomationRetirementRequest request,
                                                             Map<String, Object> dependencyResolution,
                                                             String backupId) {
        log.info("Initiating gradual retirement for automation: {}", request.getAutomationId());
        
        // Store active retirement for gradual execution
        activeRetirements.put(request.getAutomationId(), request);
        
        // Start gradual retirement process
        startGradualRetirementProcess(request);
        
        return AutomationRetirementResult.builder()
                .success(true)
                .automationId(request.getAutomationId())
                .connectionId(request.getConnectionId())
                .userId(request.getUserId())
                .retirementType("gradual")
                .retirementReason(request.getRetirementReason())
                .retirementTimestamp(System.currentTimeMillis())
                .forceRetirement(request.isForceRetirement())
                .createReplacement(request.isCreateReplacement())
                .resolvedDependencies((List<String>) dependencyResolution.get("resolvedDependencies"))
                .unresolvedDependencies((List<String>) dependencyResolution.get("unresolvedDependencies"))
                .affectedAutomations((List<String>) dependencyResolution.get("affectedAutomations"))
                .dependencyAnalysis(dependencyService.analyzeDependencies(request.getAutomationId(), request.getConnectionId()))
                .safetyValidation(validateRetirementSafety(request))
                .resultData(Map.of("gradual", true, "backupId", backupId))
                .metadata(request.getMetadata())
                .build();
    }
    
    /**
     * Validate retirement request
     */
    private boolean validateRetirementRequest(AutomationRetirementRequest request) {
        if (request.getAutomationId() == null || request.getAutomationId().isEmpty()) {
            return false;
        }
        
        if (request.getConnectionId() == null) {
            return false;
        }
        
        if (request.getRetirementType() == null || request.getRetirementType().isEmpty()) {
            return false;
        }
        
        if ("scheduled".equals(request.getRetirementType()) && request.getScheduledRetirementTime() <= 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Create pre-retirement backup
     */
    private String createPreRetirementBackup(AutomationRetirementRequest request) {
        log.info("Creating pre-retirement backup for automation: {}", request.getAutomationId());
        
        // Create backup using existing backup service
        var backup = backupService.createBackup(
                request.getAutomationId(),
                request.getConnectionId(),
                request.getUserId(),
                "Pre-retirement backup"
        );
        
        return backup != null ? backup.getBackupId() : null;
    }
    
    /**
     * Disable automation
     */
    private boolean disableAutomation(String automationId, UUID connectionId) {
        log.info("Disabling automation: {}", automationId);
        
        // Simulate disabling automation
        // In real implementation, this would call Home Assistant API
        return true;
    }
    
    /**
     * Create replacement automation
     */
    private String createReplacementAutomation(AutomationRetirementRequest request) {
        log.info("Creating replacement automation for: {}", request.getAutomationId());
        
        if (request.getReplacementConfig() == null) {
            log.warn("No replacement configuration provided");
            return null;
        }
        
        // Simulate creating replacement automation
        // In real implementation, this would use the automation creation service
        String replacementId = "replacement_" + request.getAutomationId() + "_" + System.currentTimeMillis();
        
        log.info("Created replacement automation: {}", replacementId);
        return replacementId;
    }
    
    /**
     * Validate retirement safety
     */
    private Map<String, Object> validateRetirementSafety(AutomationRetirementRequest request) {
        Map<String, Object> safetyValidation = new HashMap<>();
        
        // Check if automation is critical
        boolean isCritical = checkIfCriticalAutomation(request.getAutomationId(), request.getConnectionId());
        
        // Check if retirement time is appropriate
        boolean isAppropriateTime = checkRetirementTime(request.getScheduledRetirementTime());
        
        // Check system health
        boolean systemHealthy = checkSystemHealth(request.getConnectionId());
        
        safetyValidation.put("isCritical", isCritical);
        safetyValidation.put("isAppropriateTime", isAppropriateTime);
        safetyValidation.put("systemHealthy", systemHealthy);
        safetyValidation.put("overallSafe", !isCritical && isAppropriateTime && systemHealthy);
        safetyValidation.put("validationTimestamp", System.currentTimeMillis());
        
        return safetyValidation;
    }
    
    /**
     * Check if automation is critical
     */
    private boolean checkIfCriticalAutomation(String automationId, UUID connectionId) {
        // Simulate critical automation check
        // In real implementation, this would check automation tags, usage patterns, etc.
        return automationId.contains("critical") || automationId.contains("security");
    }
    
    /**
     * Check if retirement time is appropriate
     */
    private boolean checkRetirementTime(long scheduledTime) {
        if (scheduledTime <= 0) {
            return true; // Immediate retirement
        }
        
        // Check if scheduled time is in the future and reasonable
        long currentTime = System.currentTimeMillis();
        long timeDiff = scheduledTime - currentTime;
        
        // Allow scheduling up to 30 days in advance
        return timeDiff > 0 && timeDiff <= 30 * 24 * 60 * 60 * 1000L;
    }
    
    /**
     * Check system health
     */
    private boolean checkSystemHealth(UUID connectionId) {
        // Simulate system health check
        // In real implementation, this would check Home Assistant connection status
        return true;
    }
    
    /**
     * Start gradual retirement process
     */
    private void startGradualRetirementProcess(AutomationRetirementRequest request) {
        log.info("Starting gradual retirement process for automation: {}", request.getAutomationId());
        
        // In real implementation, this would start a background process
        // that gradually reduces automation activity over time
    }
    
    /**
     * Get retirement status
     */
    public AutomationRetirementResult getRetirementStatus(String automationId) {
        return retirementHistory.get(automationId);
    }
    
    /**
     * Cancel retirement
     */
    public boolean cancelRetirement(String automationId, String userId) {
        log.info("Canceling retirement for automation: {}", automationId);
        
        AutomationRetirementRequest request = activeRetirements.remove(automationId);
        if (request != null) {
            // Restore automation if it was disabled
            // In real implementation, this would re-enable the automation
            return true;
        }
        
        return false;
    }
    
    /**
     * Get active retirements
     */
    public List<AutomationRetirementRequest> getActiveRetirements(UUID connectionId) {
        return activeRetirements.values().stream()
                .filter(req -> req.getConnectionId().equals(connectionId))
                .toList();
    }
    
    /**
     * Get retirement history
     */
    public List<AutomationRetirementResult> getRetirementHistory(UUID connectionId) {
        return retirementHistory.values().stream()
                .filter(result -> result.getConnectionId().equals(connectionId))
                .toList();
    }
    
    /**
     * Cleanup expired retirements
     */
    public void cleanupExpiredRetirements() {
        long currentTime = System.currentTimeMillis();
        long expirationTime = 30 * 24 * 60 * 60 * 1000L; // 30 days
        
        activeRetirements.entrySet().removeIf(entry -> {
            AutomationRetirementRequest request = entry.getValue();
            if ("scheduled".equals(request.getRetirementType())) {
                return currentTime - request.getScheduledRetirementTime() > expirationTime;
            }
            return false;
        });
    }
}
