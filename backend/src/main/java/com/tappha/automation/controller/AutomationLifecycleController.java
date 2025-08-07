package com.tappha.automation.controller;

import com.tappha.automation.dto.AutomationLifecycleStats;
import com.tappha.automation.dto.AutomationStateTransition;
import com.tappha.automation.dto.ChangeTrackingInfo;
import com.tappha.automation.dto.PerformanceImpactAssessment;
import com.tappha.automation.entity.Automation;
import com.tappha.automation.service.AutomationLifecycleService;
import com.tappha.automation.exception.AutomationManagementException;
import com.tappha.automation.exception.AutomationNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.CompletableFuture;

/**
 * REST Controller for Automation Lifecycle Management
 *
 * Provides endpoints for:
 * - Automation state transitions
 * - Lifecycle statistics
 * - Change tracking
 * - Performance impact assessment
 * - Version comparison
 *
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/automation-lifecycle")
@RequiredArgsConstructor
public class AutomationLifecycleController {

    private final AutomationLifecycleService automationLifecycleService;

    /**
     * Create a new automation with lifecycle management
     */
    @PostMapping("/automations")
    public ResponseEntity<Automation> createAutomation(@RequestBody Automation automation) {
        try {
            log.info("Creating automation with lifecycle management: {}", automation.getName());
            Automation createdAutomation = automationLifecycleService.createAutomation(automation);
            return ResponseEntity.ok(createdAutomation);
        } catch (AutomationManagementException e) {
            log.error("Failed to create automation: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Transition automation to a new state
     */
    @PutMapping("/automations/{automationId}/state")
    public ResponseEntity<AutomationStateTransition> transitionState(
            @PathVariable String automationId,
            @RequestParam String newStatus) {
        try {
            log.info("Transitioning automation {} to state: {}", automationId, newStatus);
            AutomationStateTransition transition = automationLifecycleService.transitionState(
                automationId, 
                com.tappha.automation.dto.AutomationStatus.valueOf(newStatus.toUpperCase())
            );
            return ResponseEntity.ok(transition);
        } catch (AutomationNotFoundException e) {
            log.error("Automation not found: {}", automationId);
            return ResponseEntity.notFound().build();
        } catch (AutomationManagementException e) {
            log.error("Failed to transition state: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IllegalArgumentException e) {
            log.error("Invalid status: {}", newStatus);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get automation lifecycle statistics
     */
    @GetMapping("/automations/{automationId}/stats")
    public ResponseEntity<AutomationLifecycleStats> getLifecycleStats(@PathVariable String automationId) {
        try {
            log.info("Getting lifecycle stats for automation: {}", automationId);
            AutomationLifecycleStats stats = automationLifecycleService.getLifecycleStats(automationId);
            return ResponseEntity.ok(stats);
        } catch (AutomationNotFoundException e) {
            log.error("Automation not found: {}", automationId);
            return ResponseEntity.notFound().build();
        } catch (AutomationManagementException e) {
            log.error("Failed to get lifecycle stats: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Track changes for an automation
     */
    @PostMapping("/automations/{automationId}/changes")
    public ResponseEntity<ChangeTrackingInfo> trackChanges(
            @PathVariable String automationId,
            @RequestParam String changeDescription,
            @RequestParam String changeType) {
        try {
            log.info("Tracking changes for automation: {}", automationId);
            ChangeTrackingInfo trackingInfo = automationLifecycleService.trackChanges(
                automationId, changeDescription, changeType);
            return ResponseEntity.ok(trackingInfo);
        } catch (AutomationNotFoundException e) {
            log.error("Automation not found: {}", automationId);
            return ResponseEntity.notFound().build();
        } catch (AutomationManagementException e) {
            log.error("Failed to track changes: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Assess performance impact of automation changes
     */
    @PostMapping("/automations/{automationId}/performance-assessment")
    public ResponseEntity<CompletableFuture<PerformanceImpactAssessment>> assessPerformanceImpact(
            @PathVariable String automationId) {
        try {
            log.info("Assessing performance impact for automation: {}", automationId);
            CompletableFuture<PerformanceImpactAssessment> assessment = 
                automationLifecycleService.assessPerformanceImpact(automationId);
            return ResponseEntity.ok(assessment);
        } catch (Exception e) {
            log.error("Failed to assess performance impact: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Compare automation versions
     */
    @GetMapping("/automations/{automationId}/versions/compare")
    public ResponseEntity<String> compareVersions(
            @PathVariable String automationId,
            @RequestParam Integer version1,
            @RequestParam Integer version2) {
        try {
            log.info("Comparing versions {} and {} for automation: {}", version1, version2, automationId);
            String diff = automationLifecycleService.compareVersions(automationId, version1, version2);
            return ResponseEntity.ok(diff);
        } catch (AutomationNotFoundException e) {
            log.error("Version not found for automation: {}", automationId);
            return ResponseEntity.notFound().build();
        } catch (AutomationManagementException e) {
            log.error("Failed to compare versions: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Automation Lifecycle Service is healthy");
    }
} 