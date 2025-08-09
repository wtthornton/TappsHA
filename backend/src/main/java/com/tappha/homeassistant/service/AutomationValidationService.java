package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationValidationResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.UUID;

/**
 * Service for validating automation wizard steps and configurations
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
public class AutomationValidationService {

    /**
     * Validate a specific wizard step
     */
    public AutomationValidationResult validateStep(int stepNumber, Map<String, Object> stepData, UUID connectionId) {
        try {
            log.debug("Validating step {} for connection: {}", stepNumber, connectionId);
            
            List<String> errors = new ArrayList<>();
            List<String> warnings = new ArrayList<>();
            Map<String, Object> validationData = new HashMap<>();
            
            // Step-specific validation
            switch (stepNumber) {
                case 0: // Template selection
                    validateTemplateSelection(stepData, errors, warnings, validationData);
                    break;
                case 1: // Trigger configuration
                    validateTriggerConfiguration(stepData, errors, warnings, validationData);
                    break;
                case 2: // Condition configuration
                    validateConditionConfiguration(stepData, errors, warnings, validationData);
                    break;
                case 3: // Action configuration
                    validateActionConfiguration(stepData, errors, warnings, validationData);
                    break;
                case 4: // Review and create
                    validateReviewAndCreate(stepData, errors, warnings, validationData);
                    break;
                default:
                    errors.add("Invalid step number: " + stepNumber);
            }
            
            boolean isValid = errors.isEmpty();
            
            return AutomationValidationResult.builder()
                    .isValid(isValid)
                    .errors(errors)
                    .warnings(warnings)
                    .validationData(validationData)
                    .validationTimestamp(System.currentTimeMillis())
                    .validationType("step_validation")
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to validate step {} for connection: {}", stepNumber, connectionId, e);
            return AutomationValidationResult.builder()
                    .isValid(false)
                    .errors(List.of("Validation failed: " + e.getMessage()))
                    .validationTimestamp(System.currentTimeMillis())
                    .validationType("step_validation")
                    .build();
        }
    }

    /**
     * Validate template selection step
     */
    private void validateTemplateSelection(Map<String, Object> stepData, 
                                        List<String> errors, 
                                        List<String> warnings,
                                        Map<String, Object> validationData) {
        
        // Required fields
        if (!stepData.containsKey("templateId") || stepData.get("templateId") == null) {
            errors.add("Template ID is required");
        }
        
        if (!stepData.containsKey("templateName") || stepData.get("templateName") == null) {
            errors.add("Template name is required");
        }
        
        // Template ID format validation
        if (stepData.containsKey("templateId")) {
            String templateId = stepData.get("templateId").toString();
            try {
                UUID.fromString(templateId);
            } catch (IllegalArgumentException e) {
                errors.add("Invalid template ID format");
            }
        }
        
        // Template name length validation
        if (stepData.containsKey("templateName")) {
            String templateName = stepData.get("templateName").toString();
            if (templateName.length() < 3) {
                errors.add("Template name must be at least 3 characters long");
            }
            if (templateName.length() > 100) {
                errors.add("Template name must be less than 100 characters");
            }
        }
        
        validationData.put("templateId", stepData.get("templateId"));
        validationData.put("templateName", stepData.get("templateName"));
    }

    /**
     * Validate trigger configuration step
     */
    private void validateTriggerConfiguration(Map<String, Object> stepData, 
                                          List<String> errors, 
                                          List<String> warnings,
                                          Map<String, Object> validationData) {
        
        // Required fields
        if (!stepData.containsKey("triggers") || stepData.get("triggers") == null) {
            errors.add("At least one trigger is required");
            return;
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> triggers = (List<Map<String, Object>>) stepData.get("triggers");
        
        if (triggers.isEmpty()) {
            errors.add("At least one trigger is required");
        }
        
        // Validate each trigger
        for (int i = 0; i < triggers.size(); i++) {
            Map<String, Object> trigger = triggers.get(i);
            validateTrigger(trigger, errors, warnings, i);
        }
        
        validationData.put("triggerCount", triggers.size());
        validationData.put("triggers", triggers);
    }

    /**
     * Validate condition configuration step
     */
    private void validateConditionConfiguration(Map<String, Object> stepData, 
                                            List<String> errors, 
                                            List<String> warnings,
                                            Map<String, Object> validationData) {
        
        // Conditions are optional, but if provided, validate them
        if (stepData.containsKey("conditions") && stepData.get("conditions") != null) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> conditions = (List<Map<String, Object>>) stepData.get("conditions");
            
            // Validate each condition
            for (int i = 0; i < conditions.size(); i++) {
                Map<String, Object> condition = conditions.get(i);
                validateCondition(condition, errors, warnings, i);
            }
            
            validationData.put("conditionCount", conditions.size());
            validationData.put("conditions", conditions);
        } else {
            validationData.put("conditionCount", 0);
        }
    }

    /**
     * Validate action configuration step
     */
    private void validateActionConfiguration(Map<String, Object> stepData, 
                                         List<String> errors, 
                                         List<String> warnings,
                                         Map<String, Object> validationData) {
        
        // Required fields
        if (!stepData.containsKey("actions") || stepData.get("actions") == null) {
            errors.add("At least one action is required");
            return;
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> actions = (List<Map<String, Object>>) stepData.get("actions");
        
        if (actions.isEmpty()) {
            errors.add("At least one action is required");
        }
        
        // Validate each action
        for (int i = 0; i < actions.size(); i++) {
            Map<String, Object> action = actions.get(i);
            validateAction(action, errors, warnings, i);
        }
        
        validationData.put("actionCount", actions.size());
        validationData.put("actions", actions);
    }

    /**
     * Validate review and create step
     */
    private void validateReviewAndCreate(Map<String, Object> stepData, 
                                       List<String> errors, 
                                       List<String> warnings,
                                       Map<String, Object> validationData) {
        
        // Required fields
        if (!stepData.containsKey("confirmed") || !Boolean.TRUE.equals(stepData.get("confirmed"))) {
            errors.add("You must confirm the automation creation");
        }
        
        validationData.put("confirmed", stepData.get("confirmed"));
    }

    /**
     * Validate individual trigger
     */
    private void validateTrigger(Map<String, Object> trigger, 
                               List<String> errors, 
                               List<String> warnings, 
                               int index) {
        
        if (!trigger.containsKey("type") || trigger.get("type") == null) {
            errors.add("Trigger " + index + ": Type is required");
        }
        
        if (!trigger.containsKey("entityId") || trigger.get("entityId") == null) {
            errors.add("Trigger " + index + ": Entity ID is required");
        }
        
        // Validate trigger type
        if (trigger.containsKey("type")) {
            String type = trigger.get("type").toString();
            List<String> validTypes = List.of("state", "time", "numeric_state", "template", "zone");
            if (!validTypes.contains(type)) {
                errors.add("Trigger " + index + ": Invalid trigger type: " + type);
            }
        }
        
        // Validate entity ID format
        if (trigger.containsKey("entityId")) {
            String entityId = trigger.get("entityId").toString();
            if (!entityId.contains(".")) {
                errors.add("Trigger " + index + ": Invalid entity ID format");
            }
        }
    }

    /**
     * Validate individual condition
     */
    private void validateCondition(Map<String, Object> condition, 
                                 List<String> errors, 
                                 List<String> warnings, 
                                 int index) {
        
        if (!condition.containsKey("type") || condition.get("type") == null) {
            errors.add("Condition " + index + ": Type is required");
        }
        
        if (!condition.containsKey("entityId") || condition.get("entityId") == null) {
            errors.add("Condition " + index + ": Entity ID is required");
        }
        
        // Validate condition type
        if (condition.containsKey("type")) {
            String type = condition.get("type").toString();
            List<String> validTypes = List.of("state", "numeric_state", "template", "time");
            if (!validTypes.contains(type)) {
                errors.add("Condition " + index + ": Invalid condition type: " + type);
            }
        }
    }

    /**
     * Validate individual action
     */
    private void validateAction(Map<String, Object> action, 
                              List<String> errors, 
                              List<String> warnings, 
                              int index) {
        
        if (!action.containsKey("type") || action.get("type") == null) {
            errors.add("Action " + index + ": Type is required");
        }
        
        if (!action.containsKey("entityId") || action.get("entityId") == null) {
            errors.add("Action " + index + ": Entity ID is required");
        }
        
        // Validate action type
        if (action.containsKey("type")) {
            String type = action.get("type").toString();
            List<String> validTypes = List.of("service", "delay", "wait_template", "wait_for_trigger");
            if (!validTypes.contains(type)) {
                errors.add("Action " + index + ": Invalid action type: " + type);
            }
        }
        
        // Validate service call
        if (action.containsKey("type") && "service".equals(action.get("type"))) {
            if (!action.containsKey("service") || action.get("service") == null) {
                errors.add("Action " + index + ": Service is required for service actions");
            }
        }
    }

    /**
     * Validate complete automation configuration
     */
    public AutomationValidationResult validateCompleteConfiguration(Map<String, Object> config) {
        try {
            log.debug("Validating complete automation configuration");
            
            List<String> errors = new ArrayList<>();
            List<String> warnings = new ArrayList<>();
            Map<String, Object> validationData = new HashMap<>();
            
            // Validate required sections
            if (!config.containsKey("triggers") || config.get("triggers") == null) {
                errors.add("Automation must have at least one trigger");
            }
            
            if (!config.containsKey("actions") || config.get("actions") == null) {
                errors.add("Automation must have at least one action");
            }
            
            // Validate automation ID
            if (!config.containsKey("automationId") || config.get("automationId") == null) {
                errors.add("Automation ID is required");
            }
            
            // Validate user ID
            if (!config.containsKey("createdBy") || config.get("createdBy") == null) {
                errors.add("Creator user ID is required");
            }
            
            boolean isValid = errors.isEmpty();
            
            return AutomationValidationResult.builder()
                    .isValid(isValid)
                    .errors(errors)
                    .warnings(warnings)
                    .validationData(validationData)
                    .validationTimestamp(System.currentTimeMillis())
                    .validationType("complete_validation")
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to validate complete configuration", e);
            return AutomationValidationResult.builder()
                    .isValid(false)
                    .errors(List.of("Complete validation failed: " + e.getMessage()))
                    .validationTimestamp(System.currentTimeMillis())
                    .validationType("complete_validation")
                    .build();
        }
    }
}
