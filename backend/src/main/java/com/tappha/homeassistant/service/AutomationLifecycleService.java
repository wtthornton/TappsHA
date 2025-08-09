package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationWizardStep;
import com.tappha.homeassistant.dto.AutomationWizardSession;
import com.tappha.homeassistant.dto.AutomationValidationResult;
import com.tappha.homeassistant.entity.AutomationTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for automation lifecycle management with step-by-step wizard
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
public class AutomationLifecycleService {

    private final AutomationValidationService validationService;
    private final AutomationTemplateService templateService;
    
    // In-memory session storage (in production, use Redis or database)
    private final Map<String, AutomationWizardSession> sessions = new ConcurrentHashMap<>();

    public AutomationLifecycleService(AutomationValidationService validationService,
                                   AutomationTemplateService templateService) {
        this.validationService = validationService;
        this.templateService = templateService;
    }

    /**
     * Start a new automation creation wizard session
     */
    public AutomationWizardSession startWizardSession(String userId, UUID connectionId) {
        try {
            log.info("Starting automation wizard session for user: {} and connection: {}", userId, connectionId);
            
            String sessionId = UUID.randomUUID().toString();
            AutomationWizardSession session = AutomationWizardSession.builder()
                    .sessionId(sessionId)
                    .userId(userId)
                    .connectionId(connectionId)
                    .currentStep(0)
                    .status("active")
                    .createdAt(System.currentTimeMillis())
                    .steps(new ArrayList<>())
                    .validationResults(new HashMap<>())
                    .build();
            
            // Initialize with first step
            session.getSteps().add(createInitialStep());
            
            sessions.put(sessionId, session);
            
            log.info("Created wizard session: {} with {} steps", sessionId, session.getSteps().size());
            return session;
            
        } catch (Exception e) {
            log.error("Failed to start wizard session for user: {}", userId, e);
            throw new RuntimeException("Failed to start automation wizard session", e);
        }
    }

    /**
     * Get current wizard session
     */
    public AutomationWizardSession getSession(String sessionId) {
        AutomationWizardSession session = sessions.get(sessionId);
        if (session == null) {
            throw new RuntimeException("Wizard session not found: " + sessionId);
        }
        return session;
    }

    /**
     * Move to next step in wizard
     */
    public AutomationWizardSession nextStep(String sessionId, Map<String, Object> stepData) {
        try {
            AutomationWizardSession session = getSession(sessionId);
            
            // Validate current step
            AutomationValidationResult validation = validationService.validateStep(
                    session.getCurrentStep(), stepData, session.getConnectionId());
            
            if (!validation.isValid()) {
                log.warn("Step validation failed for session: {}", sessionId);
                session.getValidationResults().put(session.getCurrentStep(), validation);
                return session;
            }
            
            // Save step data
            session.getSteps().get(session.getCurrentStep()).setData(stepData);
            session.getValidationResults().put(session.getCurrentStep(), validation);
            
            // Move to next step
            session.setCurrentStep(session.getCurrentStep() + 1);
            
            // Add next step if not at the end
            if (session.getCurrentStep() < session.getSteps().size()) {
                log.info("Moved to step {} for session: {}", session.getCurrentStep(), sessionId);
            } else {
                // Add final step if needed
                session.getSteps().add(createFinalStep());
                log.info("Added final step for session: {}", sessionId);
            }
            
            return session;
            
        } catch (Exception e) {
            log.error("Failed to move to next step for session: {}", sessionId, e);
            throw new RuntimeException("Failed to move to next step", e);
        }
    }

    /**
     * Move to previous step in wizard
     */
    public AutomationWizardSession previousStep(String sessionId) {
        try {
            AutomationWizardSession session = getSession(sessionId);
            
            if (session.getCurrentStep() > 0) {
                session.setCurrentStep(session.getCurrentStep() - 1);
                log.info("Moved to previous step {} for session: {}", session.getCurrentStep(), sessionId);
            }
            
            return session;
            
        } catch (Exception e) {
            log.error("Failed to move to previous step for session: {}", sessionId, e);
            throw new RuntimeException("Failed to move to previous step", e);
        }
    }

    /**
     * Validate current step
     */
    public AutomationValidationResult validateCurrentStep(String sessionId, Map<String, Object> stepData) {
        try {
            AutomationWizardSession session = getSession(sessionId);
            
            AutomationValidationResult validation = validationService.validateStep(
                    session.getCurrentStep(), stepData, session.getConnectionId());
            
            // Update validation result in session
            session.getValidationResults().put(session.getCurrentStep(), validation);
            
            return validation;
            
        } catch (Exception e) {
            log.error("Failed to validate current step for session: {}", sessionId, e);
            return AutomationValidationResult.builder()
                    .isValid(false)
                    .errors(List.of("Validation failed: " + e.getMessage()))
                    .build();
        }
    }

    /**
     * Complete wizard and create automation
     */
    public Map<String, Object> completeWizard(String sessionId) {
        try {
            AutomationWizardSession session = getSession(sessionId);
            
            log.info("Completing wizard session: {} with {} steps", sessionId, session.getSteps().size());
            
            // Validate all steps
            List<String> allErrors = new ArrayList<>();
            for (int i = 0; i < session.getSteps().size(); i++) {
                AutomationWizardStep step = session.getSteps().get(i);
                if (step.getData() != null) {
                    AutomationValidationResult validation = validationService.validateStep(
                            i, step.getData(), session.getConnectionId());
                    if (!validation.isValid()) {
                        allErrors.addAll(validation.getErrors());
                    }
                }
            }
            
            if (!allErrors.isEmpty()) {
                log.warn("Wizard completion failed with {} errors", allErrors.size());
                return Map.of(
                        "success", false,
                        "errors", allErrors,
                        "sessionId", sessionId
                );
            }
            
            // Create automation from wizard data
            Map<String, Object> automationConfig = buildAutomationConfig(session);
            
            // TODO: Save automation to database
            String automationId = UUID.randomUUID().toString();
            
            // Mark session as completed
            session.setStatus("completed");
            session.setCompletedAt(System.currentTimeMillis());
            
            log.info("Successfully completed wizard session: {} with automation: {}", sessionId, automationId);
            
            return Map.of(
                    "success", true,
                    "automationId", automationId,
                    "automationConfig", automationConfig,
                    "sessionId", sessionId
            );
            
        } catch (Exception e) {
            log.error("Failed to complete wizard session: {}", sessionId, e);
            return Map.of(
                    "success", false,
                    "errors", List.of("Failed to complete wizard: " + e.getMessage()),
                    "sessionId", sessionId
            );
        }
    }

    /**
     * Get available templates for wizard
     */
    public List<AutomationTemplate> getAvailableTemplates(String sessionId) {
        try {
            AutomationWizardSession session = getSession(sessionId);
            return templateService.getTemplatesForConnection(session.getConnectionId());
            
        } catch (Exception e) {
            log.error("Failed to get templates for session: {}", sessionId, e);
            return new ArrayList<>();
        }
    }

    /**
     * Create initial wizard step
     */
    private AutomationWizardStep createInitialStep() {
        return AutomationWizardStep.builder()
                .stepNumber(0)
                .title("Automation Type Selection")
                .description("Choose the type of automation you want to create")
                .type("template_selection")
                .required(true)
                .validationRules(Map.of(
                        "templateId", "required",
                        "templateName", "required"
                ))
                .build();
    }

    /**
     * Create final wizard step
     */
    private AutomationWizardStep createFinalStep() {
        return AutomationWizardStep.builder()
                .stepNumber(4)
                .title("Review and Create")
                .description("Review your automation configuration and create it")
                .type("review_and_create")
                .required(true)
                .validationRules(Map.of(
                        "confirmed", "required"
                ))
                .build();
    }

    /**
     * Build automation configuration from wizard data
     */
    private Map<String, Object> buildAutomationConfig(AutomationWizardSession session) {
        Map<String, Object> config = new HashMap<>();
        
        // Extract data from each step
        for (AutomationWizardStep step : session.getSteps()) {
            if (step.getData() != null) {
                switch (step.getType()) {
                    case "template_selection":
                        config.put("templateId", step.getData().get("templateId"));
                        config.put("templateName", step.getData().get("templateName"));
                        break;
                    case "trigger_configuration":
                        config.put("triggers", step.getData().get("triggers"));
                        break;
                    case "condition_configuration":
                        config.put("conditions", step.getData().get("conditions"));
                        break;
                    case "action_configuration":
                        config.put("actions", step.getData().get("actions"));
                        break;
                    case "review_and_create":
                        config.put("confirmed", step.getData().get("confirmed"));
                        break;
                }
            }
        }
        
        // Add metadata
        config.put("createdBy", session.getUserId());
        config.put("connectionId", session.getConnectionId());
        config.put("createdAt", System.currentTimeMillis());
        config.put("wizardSessionId", session.getSessionId());
        
        return config;
    }

    /**
     * Clean up expired sessions
     */
    public void cleanupExpiredSessions() {
        try {
            long currentTime = System.currentTimeMillis();
            long expirationTime = 24 * 60 * 60 * 1000; // 24 hours
            
            sessions.entrySet().removeIf(entry -> {
                AutomationWizardSession session = entry.getValue();
                return (currentTime - session.getCreatedAt()) > expirationTime;
            });
            
            log.info("Cleaned up expired wizard sessions");
            
        } catch (Exception e) {
            log.error("Failed to cleanup expired sessions", e);
        }
    }
}
