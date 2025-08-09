package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationPreviewRequest;
import com.tappha.homeassistant.dto.AutomationPreviewResult;
import com.tappha.homeassistant.dto.AutomationValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for automation preview capabilities
 * Provides preview, validation, and simulation of automation changes
 */
@Slf4j
@Service
public class AutomationPreviewService {

    private final AutomationValidationService validationService;
    private final AutomationModificationService modificationService;
    private final HomeAssistantConnectionService connectionService;

    // In-memory storage for development
    private final Map<String, AutomationPreviewResult> previewHistory = new ConcurrentHashMap<>();

    public AutomationPreviewService(AutomationValidationService validationService,
                                  AutomationModificationService modificationService,
                                  HomeAssistantConnectionService connectionService) {
        this.validationService = validationService;
        this.modificationService = modificationService;
        this.connectionService = connectionService;
    }

    /**
     * Preview automation changes before applying them
     */
    public AutomationPreviewResult previewAutomationChanges(AutomationPreviewRequest request) {
        try {
            log.info("Previewing automation changes for automation: {} by user: {}", 
                    request.getAutomationId(), request.getUserId());

            String previewId = UUID.randomUUID().toString();

            // Step 1: Get current configuration
            Map<String, Object> currentConfig = getCurrentConfiguration(request.getAutomationId(), request.getConnectionId());

            // Step 2: Generate proposed configuration
            Map<String, Object> proposedConfig = generateProposedConfiguration(currentConfig, request.getProposedChanges());

            // Step 3: Calculate changes
            Map<String, Object> changes = calculateChanges(currentConfig, proposedConfig);

            // Step 4: Validate changes
            AutomationValidationResult validation = validateChanges(proposedConfig, request.getConnectionId());

            // Step 5: Simulate changes (if requested)
            Map<String, Object> simulationResults = new HashMap<>();
            List<String> simulationErrors = new ArrayList<>();
            boolean simulationSuccessful = false;

            if (request.isIncludeSimulation()) {
                simulationResults = simulateAutomationChanges(proposedConfig, request.getConnectionId());
                simulationSuccessful = simulationResults.containsKey("success") && (Boolean) simulationResults.get("success");
                if (!simulationSuccessful) {
                    simulationErrors = (List<String>) simulationResults.getOrDefault("errors", new ArrayList<>());
                }
            }

            // Step 6: Analyze impact
            Map<String, Object> impactAnalysis = analyzeImpact(request.getAutomationId(), proposedConfig, request.getConnectionId());

            // Step 7: Assess risk
            Map<String, Object> riskAssessment = assessRisk(request.getAutomationId(), proposedConfig, request.getConnectionId());

            // Step 8: Determine if changes can be applied
            boolean canApply = validation.isValid() && simulationSuccessful && 
                             (Boolean) riskAssessment.getOrDefault("lowRisk", false);

            AutomationPreviewResult result = AutomationPreviewResult.builder()
                    .success(true)
                    .automationId(request.getAutomationId())
                    .connectionId(request.getConnectionId())
                    .userId(request.getUserId())
                    .modificationType(request.getModificationType())
                    .modificationDescription(request.getModificationDescription())
                    .previewTimestamp(System.currentTimeMillis())
                    .previewId(previewId)
                    .currentConfiguration(currentConfig)
                    .proposedConfiguration(proposedConfig)
                    .changes(changes)
                    .addedFields(calculateAddedFields(currentConfig, proposedConfig))
                    .removedFields(calculateRemovedFields(currentConfig, proposedConfig))
                    .modifiedFields(calculateModifiedFields(currentConfig, proposedConfig))
                    .isValid(validation.isValid())
                    .validationErrors(validation.getErrors())
                    .validationWarnings(validation.getWarnings())
                    .validationData(validation.getValidationData())
                    .simulationSuccessful(simulationSuccessful)
                    .simulationResults(simulationResults)
                    .simulationErrors(simulationErrors)
                    .performanceMetrics(calculatePerformanceMetrics(proposedConfig))
                    .impactAnalysis(impactAnalysis)
                    .affectedEntities((List<String>) impactAnalysis.get("affectedEntities"))
                    .potentialConflicts((List<String>) impactAnalysis.get("potentialConflicts"))
                    .riskAssessment(riskAssessment)
                    .previewMetadata(request.getMetadata())
                    .canApply(canApply)
                    .applyReason(generateApplyReason(validation, simulationSuccessful, riskAssessment))
                    .build();

            // Store preview result
            previewHistory.put(previewId, result);

            log.info("Successfully previewed automation changes for automation: {} with preview ID: {}", 
                    request.getAutomationId(), previewId);
            return result;

        } catch (Exception e) {
            log.error("Failed to preview automation changes for automation: {}", request.getAutomationId(), e);
            return AutomationPreviewResult.builder()
                    .success(false)
                    .errorMessage("Failed to preview automation changes: " + e.getMessage())
                    .automationId(request.getAutomationId())
                    .connectionId(request.getConnectionId())
                    .userId(request.getUserId())
                    .build();
        }
    }

    /**
     * Get current automation configuration
     */
    private Map<String, Object> getCurrentConfiguration(String automationId, UUID connectionId) {
        log.debug("Getting current configuration for automation: {}", automationId);

        // In real implementation, this would fetch from Home Assistant API
        Map<String, Object> config = new HashMap<>();
        config.put("automation_id", automationId);
        config.put("alias", "Test Automation");
        config.put("description", "Test automation for preview");
        config.put("trigger", Map.of("platform", "time", "at", "08:00"));
        config.put("condition", List.of(Map.of("condition", "time", "after", "08:00")));
        config.put("action", List.of(Map.of("service", "light.turn_on", "target", Map.of("entity_id", "light.living_room"))));

        return config;
    }

    /**
     * Generate proposed configuration based on changes
     */
    private Map<String, Object> generateProposedConfiguration(Map<String, Object> currentConfig, Map<String, Object> proposedChanges) {
        log.debug("Generating proposed configuration");

        Map<String, Object> proposedConfig = new HashMap<>(currentConfig);

        if (proposedChanges != null) {
            // Apply proposed changes to current configuration
            for (Map.Entry<String, Object> entry : proposedChanges.entrySet()) {
                proposedConfig.put(entry.getKey(), entry.getValue());
            }
        }

        return proposedConfig;
    }

    /**
     * Calculate differences between current and proposed configurations
     */
    private Map<String, Object> calculateChanges(Map<String, Object> currentConfig, Map<String, Object> proposedConfig) {
        log.debug("Calculating changes between configurations");

        Map<String, Object> changes = new HashMap<>();
        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(currentConfig.keySet());
        allKeys.addAll(proposedConfig.keySet());

        for (String key : allKeys) {
            Object currentValue = currentConfig.get(key);
            Object proposedValue = proposedConfig.get(key);

            if (!Objects.equals(currentValue, proposedValue)) {
                changes.put(key, Map.of(
                        "current", currentValue,
                        "proposed", proposedValue,
                        "changed", true
                ));
            }
        }

        return changes;
    }

    /**
     * Validate proposed configuration
     */
    private AutomationValidationResult validateChanges(Map<String, Object> proposedConfig, UUID connectionId) {
        log.debug("Validating proposed configuration");

        return validationService.validateCompleteConfiguration(proposedConfig);
    }

    /**
     * Simulate automation changes
     */
    private Map<String, Object> simulateAutomationChanges(Map<String, Object> proposedConfig, UUID connectionId) {
        log.debug("Simulating automation changes");

        Map<String, Object> simulationResults = new HashMap<>();

        try {
            // Simulate trigger evaluation
            boolean triggerValid = simulateTriggerEvaluation(proposedConfig);
            simulationResults.put("triggerValid", triggerValid);

            // Simulate condition evaluation
            boolean conditionValid = simulateConditionEvaluation(proposedConfig);
            simulationResults.put("conditionValid", conditionValid);

            // Simulate action execution
            boolean actionValid = simulateActionExecution(proposedConfig);
            simulationResults.put("actionValid", actionValid);

            // Calculate execution time
            long executionTime = calculateExecutionTime(proposedConfig);
            simulationResults.put("executionTime", executionTime);

            // Check resource usage
            Map<String, Object> resourceUsage = calculateResourceUsage(proposedConfig);
            simulationResults.put("resourceUsage", resourceUsage);

            simulationResults.put("success", triggerValid && conditionValid && actionValid);
            simulationResults.put("simulationTimestamp", System.currentTimeMillis());

        } catch (Exception e) {
            log.error("Simulation failed", e);
            simulationResults.put("success", false);
            simulationResults.put("errors", List.of("Simulation failed: " + e.getMessage()));
        }

        return simulationResults;
    }

    /**
     * Simulate trigger evaluation
     */
    private boolean simulateTriggerEvaluation(Map<String, Object> config) {
        // Simulate trigger validation
        return config.containsKey("trigger") && config.get("trigger") != null;
    }

    /**
     * Simulate condition evaluation
     */
    private boolean simulateConditionEvaluation(Map<String, Object> config) {
        // Simulate condition validation
        return config.containsKey("condition") && config.get("condition") != null;
    }

    /**
     * Simulate action execution
     */
    private boolean simulateActionExecution(Map<String, Object> config) {
        // Simulate action validation
        return config.containsKey("action") && config.get("action") != null;
    }

    /**
     * Calculate execution time for automation
     */
    private long calculateExecutionTime(Map<String, Object> config) {
        // Simulate execution time calculation
        return 150; // milliseconds
    }

    /**
     * Calculate resource usage for automation
     */
    private Map<String, Object> calculateResourceUsage(Map<String, Object> config) {
        Map<String, Object> usage = new HashMap<>();
        usage.put("cpu", 0.5); // CPU usage percentage
        usage.put("memory", 10); // Memory usage in MB
        usage.put("network", 1); // Network requests
        return usage;
    }

    /**
     * Analyze impact of proposed changes
     */
    private Map<String, Object> analyzeImpact(String automationId, Map<String, Object> proposedConfig, UUID connectionId) {
        log.debug("Analyzing impact of proposed changes for automation: {}", automationId);

        Map<String, Object> impactAnalysis = new HashMap<>();

        // Identify affected entities
        List<String> affectedEntities = identifyAffectedEntities(proposedConfig);
        impactAnalysis.put("affectedEntities", affectedEntities);

        // Check for potential conflicts
        List<String> potentialConflicts = identifyPotentialConflicts(automationId, proposedConfig, connectionId);
        impactAnalysis.put("potentialConflicts", potentialConflicts);

        // Calculate impact score
        int impactScore = calculateImpactScore(affectedEntities, potentialConflicts);
        impactAnalysis.put("impactScore", impactScore);

        // Determine impact level
        String impactLevel = determineImpactLevel(impactScore);
        impactAnalysis.put("impactLevel", impactLevel);

        return impactAnalysis;
    }

    /**
     * Identify entities affected by automation changes
     */
    private List<String> identifyAffectedEntities(Map<String, Object> config) {
        List<String> entities = new ArrayList<>();

        // Extract entity IDs from actions
        if (config.containsKey("action")) {
            Object action = config.get("action");
            if (action instanceof List) {
                for (Object actionItem : (List<?>) action) {
                    if (actionItem instanceof Map) {
                        Map<String, Object> actionMap = (Map<String, Object>) actionItem;
                        if (actionMap.containsKey("target") && actionMap.get("target") instanceof Map) {
                            Map<String, Object> target = (Map<String, Object>) actionMap.get("target");
                            if (target.containsKey("entity_id")) {
                                entities.add(target.get("entity_id").toString());
                            }
                        }
                    }
                }
            }
        }

        return entities;
    }

    /**
     * Identify potential conflicts with other automations
     */
    private List<String> identifyPotentialConflicts(String automationId, Map<String, Object> config, UUID connectionId) {
        List<String> conflicts = new ArrayList<>();

        // Simulate conflict detection
        // In real implementation, this would check against other automations
        if (config.containsKey("action")) {
            conflicts.add("Potential conflict with automation_001");
        }

        return conflicts;
    }

    /**
     * Calculate impact score based on affected entities and conflicts
     */
    private int calculateImpactScore(List<String> affectedEntities, List<String> potentialConflicts) {
        int score = 0;
        score += affectedEntities.size() * 10;
        score += potentialConflicts.size() * 20;
        return Math.min(score, 100);
    }

    /**
     * Determine impact level based on score
     */
    private String determineImpactLevel(int impactScore) {
        if (impactScore < 20) return "LOW";
        if (impactScore < 50) return "MEDIUM";
        if (impactScore < 80) return "HIGH";
        return "CRITICAL";
    }

    /**
     * Assess risk of proposed changes
     */
    private Map<String, Object> assessRisk(String automationId, Map<String, Object> proposedConfig, UUID connectionId) {
        log.debug("Assessing risk of proposed changes for automation: {}", automationId);

        Map<String, Object> riskAssessment = new HashMap<>();

        // Calculate risk score
        int riskScore = calculateRiskScore(proposedConfig);
        riskAssessment.put("riskScore", riskScore);

        // Determine risk level
        String riskLevel = determineRiskLevel(riskScore);
        riskAssessment.put("riskLevel", riskLevel);

        // Check for high-risk operations
        boolean hasHighRiskOperations = checkHighRiskOperations(proposedConfig);
        riskAssessment.put("hasHighRiskOperations", hasHighRiskOperations);

        // Determine if risk is acceptable
        boolean lowRisk = riskScore < 50 && !hasHighRiskOperations;
        riskAssessment.put("lowRisk", lowRisk);

        return riskAssessment;
    }

    /**
     * Calculate risk score for proposed configuration
     */
    private int calculateRiskScore(Map<String, Object> config) {
        int score = 0;

        // Check for potentially dangerous actions
        if (config.containsKey("action")) {
            Object action = config.get("action");
            if (action instanceof List) {
                for (Object actionItem : (List<?>) action) {
                    if (actionItem instanceof Map) {
                        Map<String, Object> actionMap = (Map<String, Object>) actionItem;
                        String service = actionMap.getOrDefault("service", "").toString();
                        
                        // High-risk services
                        if (service.contains("lock") || service.contains("alarm")) {
                            score += 30;
                        }
                        // Medium-risk services
                        else if (service.contains("switch") || service.contains("light")) {
                            score += 15;
                        }
                    }
                }
            }
        }

        return Math.min(score, 100);
    }

    /**
     * Determine risk level based on score
     */
    private String determineRiskLevel(int riskScore) {
        if (riskScore < 20) return "LOW";
        if (riskScore < 50) return "MEDIUM";
        if (riskScore < 80) return "HIGH";
        return "CRITICAL";
    }

    /**
     * Check for high-risk operations
     */
    private boolean checkHighRiskOperations(Map<String, Object> config) {
        if (config.containsKey("action")) {
            Object action = config.get("action");
            if (action instanceof List) {
                for (Object actionItem : (List<?>) action) {
                    if (actionItem instanceof Map) {
                        Map<String, Object> actionMap = (Map<String, Object>) actionItem;
                        String service = actionMap.getOrDefault("service", "").toString();
                        
                        // Check for high-risk services
                        if (service.contains("lock") || service.contains("alarm") || 
                            service.contains("delete") || service.contains("restart")) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Calculate added fields
     */
    private List<String> calculateAddedFields(Map<String, Object> currentConfig, Map<String, Object> proposedConfig) {
        List<String> addedFields = new ArrayList<>();
        
        for (String key : proposedConfig.keySet()) {
            if (!currentConfig.containsKey(key)) {
                addedFields.add(key);
            }
        }
        
        return addedFields;
    }

    /**
     * Calculate removed fields
     */
    private List<String> calculateRemovedFields(Map<String, Object> currentConfig, Map<String, Object> proposedConfig) {
        List<String> removedFields = new ArrayList<>();
        
        for (String key : currentConfig.keySet()) {
            if (!proposedConfig.containsKey(key)) {
                removedFields.add(key);
            }
        }
        
        return removedFields;
    }

    /**
     * Calculate modified fields
     */
    private List<String> calculateModifiedFields(Map<String, Object> currentConfig, Map<String, Object> proposedConfig) {
        List<String> modifiedFields = new ArrayList<>();
        
        for (String key : currentConfig.keySet()) {
            if (proposedConfig.containsKey(key) && !Objects.equals(currentConfig.get(key), proposedConfig.get(key))) {
                modifiedFields.add(key);
            }
        }
        
        return modifiedFields;
    }

    /**
     * Calculate performance metrics
     */
    private Map<String, Object> calculatePerformanceMetrics(Map<String, Object> config) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("estimatedExecutionTime", 150); // milliseconds
        metrics.put("memoryUsage", 10); // MB
        metrics.put("cpuUsage", 0.5); // percentage
        metrics.put("networkRequests", 1);
        return metrics;
    }

    /**
     * Generate apply reason
     */
    private String generateApplyReason(AutomationValidationResult validation, boolean simulationSuccessful, Map<String, Object> riskAssessment) {
        if (!validation.isValid()) {
            return "Cannot apply: Validation failed";
        }
        if (!simulationSuccessful) {
            return "Cannot apply: Simulation failed";
        }
        if (!(Boolean) riskAssessment.getOrDefault("lowRisk", false)) {
            return "Cannot apply: Risk too high";
        }
        return "Can apply: All checks passed";
    }

    /**
     * Get preview result by ID
     */
    public AutomationPreviewResult getPreviewResult(String previewId) {
        return previewHistory.get(previewId);
    }

    /**
     * Get preview history for an automation
     */
    public List<AutomationPreviewResult> getPreviewHistory(String automationId, UUID connectionId) {
        return previewHistory.values().stream()
                .filter(result -> result.getAutomationId().equals(automationId) && 
                                result.getConnectionId().equals(connectionId))
                .toList();
    }

    /**
     * Cleanup old preview results
     */
    public void cleanupOldPreviews() {
        long currentTime = System.currentTimeMillis();
        long expirationTime = 24 * 60 * 60 * 1000L; // 24 hours

        previewHistory.entrySet().removeIf(entry -> {
            AutomationPreviewResult result = entry.getValue();
            return currentTime - result.getPreviewTimestamp() > expirationTime;
        });
    }
}
