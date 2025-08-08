package com.tappha.automation.validation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Automation Quality Validator
 * 
 * Comprehensive validation framework for automation quality including:
 * - Syntax validation for Home Assistant automation format
 * - Logic validation for automation flow
 * - Security validation for safety checks
 * - Performance validation for optimization
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Component
@Slf4j
public class AutomationQualityValidator {
    
    // Patterns for validation
    private static final Pattern TRIGGER_PATTERN = Pattern.compile("trigger:", Pattern.CASE_INSENSITIVE);
    private static final Pattern ACTION_PATTERN = Pattern.compile("action:", Pattern.CASE_INSENSITIVE);
    private static final Pattern CONDITION_PATTERN = Pattern.compile("condition:", Pattern.CASE_INSENSITIVE);
    private static final Pattern DESCRIPTION_PATTERN = Pattern.compile("description:", Pattern.CASE_INSENSITIVE);
    private static final Pattern ALIAS_PATTERN = Pattern.compile("alias:", Pattern.CASE_INSENSITIVE);
    
    // Security patterns
    private static final Pattern SERVICE_CALL_PATTERN = Pattern.compile("service:", Pattern.CASE_INSENSITIVE);
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("script\\.", Pattern.CASE_INSENSITIVE);
    private static final Pattern SCENE_PATTERN = Pattern.compile("scene\\.", Pattern.CASE_INSENSITIVE);
    private static final Pattern LOCK_PATTERN = Pattern.compile("lock\\.", Pattern.CASE_INSENSITIVE);
    private static final Pattern CLIMATE_PATTERN = Pattern.compile("climate\\.", Pattern.CASE_INSENSITIVE);
    
    // Performance patterns
    private static final Pattern TIMEOUT_PATTERN = Pattern.compile("timeout:", Pattern.CASE_INSENSITIVE);
    private static final Pattern MAX_PATTERN = Pattern.compile("max:", Pattern.CASE_INSENSITIVE);
    private static final Pattern DELAY_PATTERN = Pattern.compile("delay:", Pattern.CASE_INSENSITIVE);
    
    /**
     * Validate automation syntax
     * 
     * @param automation Automation configuration in YAML format
     * @return true if syntax is valid, false otherwise
     */
    public boolean validateSyntax(String automation) {
        if (automation == null || automation.trim().isEmpty()) {
            log.warn("Automation is null or empty");
            return false;
        }
        
        try {
            // Check for required sections
            boolean hasTrigger = TRIGGER_PATTERN.matcher(automation).find();
            boolean hasAction = ACTION_PATTERN.matcher(automation).find();
            
            if (!hasTrigger) {
                log.warn("Automation missing trigger section");
                return false;
            }
            
            if (!hasAction) {
                log.warn("Automation missing action section");
                return false;
            }
            
            // Check for basic YAML structure
            if (!isValidYamlStructure(automation)) {
                log.warn("Automation has invalid YAML structure");
                return false;
            }
            
            // Check for required fields in trigger
            if (!validateTriggerSection(automation)) {
                log.warn("Automation trigger section is invalid");
                return false;
            }
            
            // Check for required fields in action
            if (!validateActionSection(automation)) {
                log.warn("Automation action section is invalid");
                return false;
            }
            
            log.info("Automation syntax validation passed");
            return true;
            
        } catch (Exception e) {
            log.error("Error during syntax validation", e);
            return false;
        }
    }
    
    /**
     * Validate automation logic
     * 
     * @param automation Automation configuration in YAML format
     * @return true if logic is valid, false otherwise
     */
    public boolean validateLogic(String automation) {
        if (automation == null || automation.trim().isEmpty()) {
            return false;
        }
        
        try {
            // Check for logical consistency
            boolean hasValidLogic = true;
            
            // Check for infinite loops (repeated triggers without conditions)
            if (hasInfiniteLoopRisk(automation)) {
                log.warn("Automation has infinite loop risk");
                hasValidLogic = false;
            }
            
            // Check for conflicting actions
            if (hasConflictingActions(automation)) {
                log.warn("Automation has conflicting actions");
                hasValidLogic = false;
            }
            
            // Check for proper condition logic
            if (!validateConditionLogic(automation)) {
                log.warn("Automation has invalid condition logic");
                hasValidLogic = false;
            }
            
            // Check for proper error handling
            if (!hasErrorHandling(automation)) {
                log.warn("Automation lacks error handling");
                hasValidLogic = false;
            }
            
            log.info("Automation logic validation completed: {}", hasValidLogic);
            return hasValidLogic;
            
        } catch (Exception e) {
            log.error("Error during logic validation", e);
            return false;
        }
    }
    
    /**
     * Validate automation security
     * 
     * @param automation Automation configuration in YAML format
     * @return true if security checks pass, false otherwise
     */
    public boolean validateSecurity(String automation) {
        if (automation == null || automation.trim().isEmpty()) {
            return false;
        }
        
        try {
            boolean isSecure = true;
            
            // Check for high-risk operations
            if (hasHighRiskOperations(automation)) {
                log.warn("Automation contains high-risk operations");
                isSecure = false;
            }
            
            // Check for proper authentication
            if (!hasProperAuthentication(automation)) {
                log.warn("Automation lacks proper authentication");
                isSecure = false;
            }
            
            // Check for proper authorization
            if (!hasProperAuthorization(automation)) {
                log.warn("Automation lacks proper authorization");
                isSecure = false;
            }
            
            // Check for input validation
            if (!hasInputValidation(automation)) {
                log.warn("Automation lacks input validation");
                isSecure = false;
            }
            
            // Check for safe defaults
            if (!hasSafeDefaults(automation)) {
                log.warn("Automation lacks safe defaults");
                isSecure = false;
            }
            
            log.info("Automation security validation completed: {}", isSecure);
            return isSecure;
            
        } catch (Exception e) {
            log.error("Error during security validation", e);
            return false;
        }
    }
    
    /**
     * Validate automation performance
     * 
     * @param automation Automation configuration in YAML format
     * @return true if performance requirements are met, false otherwise
     */
    public boolean validatePerformance(String automation) {
        if (automation == null || automation.trim().isEmpty()) {
            return false;
        }
        
        try {
            boolean isPerformant = true;
            
            // Check for performance optimizations
            if (!hasPerformanceOptimizations(automation)) {
                log.warn("Automation lacks performance optimizations");
                isPerformant = false;
            }
            
            // Check for resource usage
            if (hasHighResourceUsage(automation)) {
                log.warn("Automation has high resource usage");
                isPerformant = false;
            }
            
            // Check for proper timeouts
            if (!hasProperTimeouts(automation)) {
                log.warn("Automation lacks proper timeouts");
                isPerformant = false;
            }
            
            // Check for efficient triggers
            if (!hasEfficientTriggers(automation)) {
                log.warn("Automation has inefficient triggers");
                isPerformant = false;
            }
            
            log.info("Automation performance validation completed: {}", isPerformant);
            return isPerformant;
            
        } catch (Exception e) {
            log.error("Error during performance validation", e);
            return false;
        }
    }
    
    /**
     * Check if automation has valid YAML structure
     */
    private boolean isValidYamlStructure(String automation) {
        // Basic YAML structure validation
        String[] lines = automation.split("\n");
        int indentLevel = 0;
        
        for (String line : lines) {
            if (line.trim().isEmpty()) continue;
            
            int currentIndent = getIndentLevel(line);
            
            // Check for proper indentation
            if (currentIndent > indentLevel + 2) {
                return false; // Too much indentation
            }
            
            indentLevel = currentIndent;
        }
        
        return true;
    }
    
    /**
     * Validate trigger section
     */
    private boolean validateTriggerSection(String automation) {
        // Check for valid trigger types
        String[] validTriggers = {
            "platform:", "event:", "time:", "numeric_state:", "state:", 
            "zone:", "geo_location:", "mqtt:", "webhook:", "device:"
        };
        
        boolean hasValidTrigger = false;
        for (String trigger : validTriggers) {
            if (automation.toLowerCase().contains(trigger.toLowerCase())) {
                hasValidTrigger = true;
                break;
            }
        }
        
        return hasValidTrigger;
    }
    
    /**
     * Validate action section
     */
    private boolean validateActionSection(String automation) {
        // Check for valid action types
        String[] validActions = {
            "service:", "delay:", "wait_template:", "wait_for:", "repeat:",
            "choose:", "stop:", "continue:", "break:"
        };
        
        boolean hasValidAction = false;
        for (String action : validActions) {
            if (automation.toLowerCase().contains(action.toLowerCase())) {
                hasValidAction = true;
                break;
            }
        }
        
        return hasValidAction;
    }
    
    /**
     * Check for infinite loop risk
     */
    private boolean hasInfiniteLoopRisk(String automation) {
        // Check for triggers that could cause infinite loops
        String[] loopTriggers = {
            "state:", "numeric_state:", "zone:"
        };
        
        boolean hasLoopTrigger = false;
        for (String trigger : loopTriggers) {
            if (automation.toLowerCase().contains(trigger.toLowerCase())) {
                hasLoopTrigger = true;
                break;
            }
        }
        
        // If no conditions are present with loop triggers, it's risky
        if (hasLoopTrigger && !CONDITION_PATTERN.matcher(automation).find()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check for conflicting actions
     */
    private boolean hasConflictingActions(String automation) {
        // Check for potentially conflicting service calls
        String[] conflictingServices = {
            "light.turn_on", "light.turn_off",
            "climate.set_temperature", "climate.set_preset_mode",
            "lock.lock", "lock.unlock"
        };
        
        int serviceCount = 0;
        for (String service : conflictingServices) {
            if (automation.toLowerCase().contains(service.toLowerCase())) {
                serviceCount++;
            }
        }
        
        return serviceCount > 1;
    }
    
    /**
     * Validate condition logic
     */
    private boolean validateConditionLogic(String automation) {
        // Check for proper condition structure
        if (CONDITION_PATTERN.matcher(automation).find()) {
            // Check for valid condition types
            String[] validConditions = {
                "condition:", "and:", "or:", "not:", "numeric_state:", 
                "state:", "time:", "zone:", "template:"
            };
            
            boolean hasValidCondition = false;
            for (String condition : validConditions) {
                if (automation.toLowerCase().contains(condition.toLowerCase())) {
                    hasValidCondition = true;
                    break;
                }
            }
            
            return hasValidCondition;
        }
        
        return true; // No conditions is valid
    }
    
    /**
     * Check for error handling
     */
    private boolean hasErrorHandling(String automation) {
        // Check for error handling patterns
        String[] errorHandlingPatterns = {
            "continue_on_error:", "default:", "error_trace:",
            "timeout:", "max:", "retry:"
        };
        
        for (String pattern : errorHandlingPatterns) {
            if (automation.toLowerCase().contains(pattern.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for high-risk operations
     */
    private boolean hasHighRiskOperations(String automation) {
        // Check for high-risk service calls
        String[] highRiskServices = {
            "script.turn_on", "scene.turn_on", "lock.unlock",
            "climate.set_temperature", "switch.turn_on"
        };
        
        for (String service : highRiskServices) {
            if (automation.toLowerCase().contains(service.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for proper authentication
     */
    private boolean hasProperAuthentication(String automation) {
        // Check for authentication patterns
        String[] authPatterns = {
            "auth:", "token:", "api_key:", "username:", "password:"
        };
        
        for (String pattern : authPatterns) {
            if (automation.toLowerCase().contains(pattern.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for proper authorization
     */
    private boolean hasProperAuthorization(String automation) {
        // Check for authorization patterns
        String[] authzPatterns = {
            "permission:", "role:", "group:", "user:"
        };
        
        for (String pattern : authzPatterns) {
            if (automation.toLowerCase().contains(pattern.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for input validation
     */
    private boolean hasInputValidation(String automation) {
        // Check for input validation patterns
        String[] validationPatterns = {
            "validate:", "check:", "verify:", "ensure:"
        };
        
        for (String pattern : validationPatterns) {
            if (automation.toLowerCase().contains(pattern.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for safe defaults
     */
    private boolean hasSafeDefaults(String automation) {
        // Check for safe default patterns
        String[] safeDefaultPatterns = {
            "default:", "fallback:", "else:", "otherwise:"
        };
        
        for (String pattern : safeDefaultPatterns) {
            if (automation.toLowerCase().contains(pattern.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for performance optimizations
     */
    private boolean hasPerformanceOptimizations(String automation) {
        // Check for performance optimization patterns
        String[] optimizationPatterns = {
            "timeout:", "max:", "delay:", "throttle:", "debounce:"
        };
        
        for (String pattern : optimizationPatterns) {
            if (automation.toLowerCase().contains(pattern.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for high resource usage
     */
    private boolean hasHighResourceUsage(String automation) {
        // Check for resource-intensive operations
        String[] resourceIntensivePatterns = {
            "repeat:", "while:", "for:", "loop:"
        };
        
        for (String pattern : resourceIntensivePatterns) {
            if (automation.toLowerCase().contains(pattern.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check for proper timeouts
     */
    private boolean hasProperTimeouts(String automation) {
        return TIMEOUT_PATTERN.matcher(automation).find();
    }
    
    /**
     * Check for efficient triggers
     */
    private boolean hasEfficientTriggers(String automation) {
        // Check for efficient trigger types
        String[] efficientTriggers = {
            "time:", "webhook:", "mqtt:", "device:"
        };
        
        for (String trigger : efficientTriggers) {
            if (automation.toLowerCase().contains(trigger.toLowerCase())) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Get indentation level of a line
     */
    private int getIndentLevel(String line) {
        int indent = 0;
        for (char c : line.toCharArray()) {
            if (c == ' ' || c == '\t') {
                indent++;
            } else {
                break;
            }
        }
        return indent;
    }
}
