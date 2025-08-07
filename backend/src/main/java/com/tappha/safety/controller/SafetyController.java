package com.tappha.safety.controller;

import com.tappha.safety.dto.SafetyLimitDTO;
import com.tappha.safety.dto.SafetyThresholdDTO;
import com.tappha.safety.service.SafetyLimitService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for safety endpoints
 * 
 * Provides endpoints for:
 * - Safety limit management
 * - Safety threshold management
 * - Approval requirement checking
 * - Safety limit enforcement
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@RestController
@RequestMapping("/api/v1/safety")
@Slf4j
public class SafetyController {

    @Autowired
    private SafetyLimitService safetyLimitService;

    /**
     * Create a new safety limit
     * 
     * @param safetyLimit The safety limit data
     * @return SafetyLimitDTO with the created limit
     */
    @PostMapping("/limits")
    public ResponseEntity<SafetyLimitDTO> createSafetyLimit(@RequestBody SafetyLimitDTO safetyLimit) {
        try {
            log.info("Creating safety limit: {}", safetyLimit.getName());
            SafetyLimitDTO createdLimit = safetyLimitService.createSafetyLimit(safetyLimit);
            return ResponseEntity.ok(createdLimit);
        } catch (Exception e) {
            log.error("Error creating safety limit", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get safety limits for a user
     * 
     * @param userId The user ID
     * @return List of SafetyLimitDTO
     */
    @GetMapping("/limits/user/{userId}")
    public ResponseEntity<List<SafetyLimitDTO>> getUserSafetyLimits(@PathVariable String userId) {
        try {
            log.info("Retrieving safety limits for user: {}", userId);
            List<SafetyLimitDTO> limits = safetyLimitService.getUserSafetyLimits(userId);
            return ResponseEntity.ok(limits);
        } catch (Exception e) {
            log.error("Error retrieving safety limits for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update safety limit
     * 
     * @param limitId The safety limit ID
     * @param safetyLimit The updated safety limit data
     * @return SafetyLimitDTO with the updated limit
     */
    @PutMapping("/limits/{limitId}")
    public ResponseEntity<SafetyLimitDTO> updateSafetyLimit(@PathVariable String limitId, @RequestBody SafetyLimitDTO safetyLimit) {
        try {
            log.info("Updating safety limit: {}", limitId);
            SafetyLimitDTO updatedLimit = safetyLimitService.updateSafetyLimit(limitId, safetyLimit);
            return ResponseEntity.ok(updatedLimit);
        } catch (Exception e) {
            log.error("Error updating safety limit: {}", limitId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Check approval requirement for an automation change
     * 
     * @param userId The user ID
     * @param automationId The automation ID
     * @param changeType The type of change
     * @param changeData The change data
     * @return Map with approval requirement details
     */
    @PostMapping("/check-approval")
    public ResponseEntity<Map<String, Object>> checkApprovalRequirement(
            @RequestParam String userId,
            @RequestParam String automationId,
            @RequestParam String changeType,
            @RequestBody Map<String, Object> changeData) {
        try {
            log.info("Checking approval requirement for user: {} - automation: {} - change: {}", userId, automationId, changeType);
            Map<String, Object> result = safetyLimitService.checkApprovalRequirement(userId, automationId, changeType, changeData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error checking approval requirement", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Validate safety threshold for an automation
     * 
     * @param userId The user ID
     * @param automationId The automation ID
     * @param thresholdType The type of threshold to check
     * @param currentValue The current value
     * @return Map with validation results
     */
    @PostMapping("/validate-threshold")
    public ResponseEntity<Map<String, Object>> validateSafetyThreshold(
            @RequestParam String userId,
            @RequestParam String automationId,
            @RequestParam String thresholdType,
            @RequestParam Double currentValue) {
        try {
            log.info("Validating safety threshold for user: {} - automation: {} - type: {} - value: {}", 
                userId, automationId, thresholdType, currentValue);
            Map<String, Object> result = safetyLimitService.validateSafetyThreshold(userId, automationId, thresholdType, currentValue);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error validating safety threshold", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Enforce safety limits for an automation change
     * 
     * @param userId The user ID
     * @param automationId The automation ID
     * @param changeType The type of change
     * @param changeData The change data
     * @return Map with enforcement results
     */
    @PostMapping("/enforce-limits")
    public ResponseEntity<Map<String, Object>> enforceSafetyLimits(
            @RequestParam String userId,
            @RequestParam String automationId,
            @RequestParam String changeType,
            @RequestBody Map<String, Object> changeData) {
        try {
            log.info("Enforcing safety limits for user: {} - automation: {} - change: {}", userId, automationId, changeType);
            Map<String, Object> result = safetyLimitService.enforceSafetyLimits(userId, automationId, changeType, changeData);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error enforcing safety limits", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create a new safety threshold
     * 
     * @param threshold The safety threshold data
     * @return SafetyThresholdDTO with the created threshold
     */
    @PostMapping("/thresholds")
    public ResponseEntity<SafetyThresholdDTO> createSafetyThreshold(@RequestBody SafetyThresholdDTO threshold) {
        try {
            log.info("Creating safety threshold: {}", threshold.getName());
            SafetyThresholdDTO createdThreshold = safetyLimitService.createSafetyThreshold(threshold);
            return ResponseEntity.ok(createdThreshold);
        } catch (Exception e) {
            log.error("Error creating safety threshold", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 