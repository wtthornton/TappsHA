package com.tappha.automation.controller;

import com.tappha.automation.dto.*;
import com.tappha.automation.service.AutomationManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * REST controller for automation management operations
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/automations")
@RequiredArgsConstructor
public class AutomationManagementController {

    private final AutomationManagementService automationManagementService;

    /**
     * Create new automation with AI assistance
     * 
     * @param request Automation creation request
     * @return Automation creation result
     */
    @PostMapping
    public ResponseEntity<AutomationCreationResult> createAutomation(
            @Valid @RequestBody AutomationCreationRequest request) {
        log.info("Creating automation: {}", request.getAutomationName());
        
        try {
            AutomationCreationResult result = automationManagementService.createAutomation(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to create automation: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Modify existing automation with AI assistance
     * 
     * @param automationId ID of automation to modify
     * @param modification Modification request
     * @return Automation modification result
     */
    @PutMapping("/{automationId}")
    public ResponseEntity<AutomationModificationResult> modifyAutomation(
            @PathVariable String automationId,
            @Valid @RequestBody AutomationModificationRequest modification) {
        log.info("Modifying automation: {}", automationId);
        
        try {
            AutomationModificationResult result = automationManagementService.modifyAutomation(automationId, modification);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to modify automation {}: {}", automationId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get automation information with complete lifecycle data
     * 
     * @param automationId ID of automation
     * @return Complete automation information
     */
    @GetMapping("/{automationId}")
    public ResponseEntity<AutomationInfo> getAutomationInfo(@PathVariable String automationId) {
        log.debug("Getting automation info: {}", automationId);
        
        try {
            AutomationInfo info = automationManagementService.getAutomationInfo(automationId);
            return ResponseEntity.ok(info);
        } catch (Exception e) {
            log.error("Failed to get automation info {}: {}", automationId, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Retire automation with cleanup
     * 
     * @param automationId ID of automation to retire
     * @param reason Retirement reason
     * @return Retirement result
     */
    @DeleteMapping("/{automationId}")
    public ResponseEntity<AutomationRetirementResult> retireAutomation(
            @PathVariable String automationId,
            @RequestParam String reason) {
        log.info("Retiring automation: {} - {}", automationId, reason);
        
        try {
            AutomationRetirementResult result = automationManagementService.retireAutomation(automationId, reason);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to retire automation {}: {}", automationId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get automation lifecycle statistics
     * 
     * @param automationId ID of automation
     * @return Lifecycle statistics
     */
    @GetMapping("/{automationId}/stats")
    public ResponseEntity<AutomationLifecycleStats> getLifecycleStats(@PathVariable String automationId) {
        log.debug("Getting lifecycle stats: {}", automationId);
        
        try {
            AutomationLifecycleStats stats = automationManagementService.getLifecycleStats(automationId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get lifecycle stats {}: {}", automationId, e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }
} 