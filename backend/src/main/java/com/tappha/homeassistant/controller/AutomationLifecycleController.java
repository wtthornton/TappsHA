package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.AutomationWizardSession;
import com.tappha.homeassistant.dto.AutomationValidationResult;
import com.tappha.homeassistant.entity.AutomationTemplate;
import com.tappha.homeassistant.service.AutomationLifecycleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Controller for automation lifecycle management with step-by-step wizard
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@RestController
@RequestMapping("/api/v1/automation-lifecycle")
@Slf4j
public class AutomationLifecycleController {

    private final AutomationLifecycleService lifecycleService;

    public AutomationLifecycleController(AutomationLifecycleService lifecycleService) {
        this.lifecycleService = lifecycleService;
    }

    /**
     * Start a new automation creation wizard session
     */
    @PostMapping("/wizard/start")
    public ResponseEntity<AutomationWizardSession> startWizardSession(
            @RequestParam String userId,
            @RequestParam UUID connectionId) {
        
        try {
            log.info("Starting automation wizard session for user: {} and connection: {}", userId, connectionId);
            
            AutomationWizardSession session = lifecycleService.startWizardSession(userId, connectionId);
            
            return ResponseEntity.ok(session);
            
        } catch (Exception e) {
            log.error("Failed to start wizard session for user: {} and connection: {}", userId, connectionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get current wizard session
     */
    @GetMapping("/wizard/session/{sessionId}")
    public ResponseEntity<AutomationWizardSession> getWizardSession(@PathVariable String sessionId) {
        try {
            log.debug("Getting wizard session: {}", sessionId);
            
            AutomationWizardSession session = lifecycleService.getSession(sessionId);
            
            return ResponseEntity.ok(session);
            
        } catch (Exception e) {
            log.error("Failed to get wizard session: {}", sessionId, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Move to next step in wizard
     */
    @PostMapping("/wizard/next/{sessionId}")
    public ResponseEntity<AutomationWizardSession> nextStep(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> stepData) {
        
        try {
            log.debug("Moving to next step for session: {}", sessionId);
            
            AutomationWizardSession session = lifecycleService.nextStep(sessionId, stepData);
            
            return ResponseEntity.ok(session);
            
        } catch (Exception e) {
            log.error("Failed to move to next step for session: {}", sessionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Move to previous step in wizard
     */
    @PostMapping("/wizard/previous/{sessionId}")
    public ResponseEntity<AutomationWizardSession> previousStep(@PathVariable String sessionId) {
        try {
            log.debug("Moving to previous step for session: {}", sessionId);
            
            AutomationWizardSession session = lifecycleService.previousStep(sessionId);
            
            return ResponseEntity.ok(session);
            
        } catch (Exception e) {
            log.error("Failed to move to previous step for session: {}", sessionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate current step
     */
    @PostMapping("/wizard/validate/{sessionId}")
    public ResponseEntity<AutomationValidationResult> validateCurrentStep(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> stepData) {
        
        try {
            log.debug("Validating current step for session: {}", sessionId);
            
            AutomationValidationResult validation = lifecycleService.validateCurrentStep(sessionId, stepData);
            
            return ResponseEntity.ok(validation);
            
        } catch (Exception e) {
            log.error("Failed to validate current step for session: {}", sessionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Complete wizard and create automation
     */
    @PostMapping("/wizard/complete/{sessionId}")
    public ResponseEntity<Map<String, Object>> completeWizard(@PathVariable String sessionId) {
        try {
            log.info("Completing wizard session: {}", sessionId);
            
            Map<String, Object> result = lifecycleService.completeWizard(sessionId);
            
            if ((Boolean) result.get("success")) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
            
        } catch (Exception e) {
            log.error("Failed to complete wizard session: {}", sessionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get available templates for wizard
     */
    @GetMapping("/wizard/templates/{sessionId}")
    public ResponseEntity<List<AutomationTemplate>> getAvailableTemplates(@PathVariable String sessionId) {
        try {
            log.debug("Getting available templates for session: {}", sessionId);
            
            List<AutomationTemplate> templates = lifecycleService.getAvailableTemplates(sessionId);
            
            return ResponseEntity.ok(templates);
            
        } catch (Exception e) {
            log.error("Failed to get templates for session: {}", sessionId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get templates by category
     */
    @GetMapping("/templates/category/{category}")
    public ResponseEntity<List<AutomationTemplate>> getTemplatesByCategory(@PathVariable String category) {
        try {
            log.debug("Getting templates by category: {}", category);
            
            // TODO: Implement category-based template retrieval
            // For now, return empty list
            return ResponseEntity.ok(List.of());
            
        } catch (Exception e) {
            log.error("Failed to get templates by category: {}", category, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get template by ID
     */
    @GetMapping("/templates/{templateId}")
    public ResponseEntity<AutomationTemplate> getTemplateById(@PathVariable UUID templateId) {
        try {
            log.debug("Getting template by ID: {}", templateId);
            
            // TODO: Implement template retrieval by ID
            // For now, return 404
            return ResponseEntity.notFound().build();
            
        } catch (Exception e) {
            log.error("Failed to get template by ID: {}", templateId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Save template
     */
    @PostMapping("/templates")
    public ResponseEntity<AutomationTemplate> saveTemplate(@RequestBody AutomationTemplate template) {
        try {
            log.info("Saving template: {}", template.getName());
            
            // TODO: Implement template saving
            // For now, return the template as-is
            return ResponseEntity.ok(template);
            
        } catch (Exception e) {
            log.error("Failed to save template: {}", template.getName(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete template
     */
    @DeleteMapping("/templates/{templateId}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID templateId) {
        try {
            log.info("Deleting template: {}", templateId);
            
            // TODO: Implement template deletion
            // For now, return success
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Failed to delete template: {}", templateId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get template categories
     */
    @GetMapping("/templates/categories")
    public ResponseEntity<List<String>> getTemplateCategories() {
        try {
            log.debug("Getting template categories");
            
            List<String> categories = List.of("energy", "security", "comfort", "convenience", "custom");
            
            return ResponseEntity.ok(categories);
            
        } catch (Exception e) {
            log.error("Failed to get template categories", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get template types
     */
    @GetMapping("/templates/types")
    public ResponseEntity<List<String>> getTemplateTypes() {
        try {
            log.debug("Getting template types");
            
            List<String> types = List.of("basic", "advanced", "custom");
            
            return ResponseEntity.ok(types);
            
        } catch (Exception e) {
            log.error("Failed to get template types", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clean up expired sessions
     */
    @PostMapping("/wizard/cleanup")
    public ResponseEntity<Void> cleanupExpiredSessions() {
        try {
            log.info("Cleaning up expired wizard sessions");
            
            lifecycleService.cleanupExpiredSessions();
            
            return ResponseEntity.ok().build();
            
        } catch (Exception e) {
            log.error("Failed to cleanup expired sessions", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
