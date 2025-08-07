package com.tappha.safety.service;

import com.tappha.safety.dto.SafetyLimitDTO;
import com.tappha.safety.dto.SafetyThresholdDTO;
import com.tappha.safety.entity.SafetyLimit;
import com.tappha.safety.entity.SafetyThreshold;
import com.tappha.safety.repository.SafetyLimitRepository;
import com.tappha.safety.repository.SafetyThresholdRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Safety limit enforcement service
 * 
 * Provides comprehensive safety limit management including:
 * - Safety limit creation and management
 * - Approval requirement determination
 * - Safety threshold validation
 * - Automatic safety limit enforcement
 * - Safety limit customization
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Service
@Slf4j
@Transactional
public class SafetyLimitService {

    @Autowired
    private SafetyLimitRepository safetyLimitRepository;

    @Autowired
    private SafetyThresholdRepository thresholdRepository;

    /**
     * Create a new safety limit
     * 
     * @param safetyLimit The safety limit data
     * @return SafetyLimitDTO with the created limit
     */
    public SafetyLimitDTO createSafetyLimit(SafetyLimitDTO safetyLimit) {
        try {
            log.info("Creating safety limit: {} for user: {}", safetyLimit.getName(), safetyLimit.getUserId());
            
            SafetyLimit limit = SafetyLimit.builder()
                .id(UUID.randomUUID().toString())
                .userId(safetyLimit.getUserId())
                .name(safetyLimit.getName())
                .description(safetyLimit.getDescription())
                .limitType(safetyLimit.getLimitType())
                .limitValue(safetyLimit.getLimitValue())
                .approvalRequired(safetyLimit.getApprovalRequired())
                .enabled(safetyLimit.getEnabled())
                .createdAt(LocalDateTime.now())
                .build();
            
            SafetyLimit savedLimit = safetyLimitRepository.save(limit);
            log.info("Safety limit created successfully: {}", savedLimit.getId());
            
            return convertToDTO(savedLimit);
        } catch (Exception e) {
            log.error("Error creating safety limit", e);
            throw new RuntimeException("Failed to create safety limit", e);
        }
    }

    /**
     * Check if approval is required for an automation change
     * 
     * @param userId The user ID
     * @param automationId The automation ID
     * @param changeType The type of change
     * @param changeData The change data
     * @return Map with approval requirement details
     */
    public Map<String, Object> checkApprovalRequirement(String userId, String automationId, String changeType, Map<String, Object> changeData) {
        try {
            log.info("Checking approval requirement for user: {} - automation: {} - change: {}", userId, automationId, changeType);
            
            List<SafetyLimit> userLimits = safetyLimitRepository.findByUserIdAndEnabledTrue(userId);
            boolean approvalRequired = false;
            String reason = "";
            
            for (SafetyLimit limit : userLimits) {
                if (isApprovalRequired(limit, changeType, changeData)) {
                    approvalRequired = true;
                    reason = String.format("Safety limit '%s' requires approval for this change", limit.getName());
                    break;
                }
            }
            
            Map<String, Object> result = Map.of(
                "approvalRequired", approvalRequired,
                "reason", reason,
                "automationId", automationId,
                "changeType", changeType,
                "checkedAt", LocalDateTime.now()
            );
            
            log.info("Approval requirement check result: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Error checking approval requirement", e);
            return Map.of(
                "approvalRequired", true,
                "reason", "Error checking safety limits - approval required for safety",
                "automationId", automationId,
                "changeType", changeType,
                "checkedAt", LocalDateTime.now()
            );
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
    public Map<String, Object> validateSafetyThreshold(String userId, String automationId, String thresholdType, double currentValue) {
        try {
            log.info("Validating safety threshold for user: {} - automation: {} - type: {} - value: {}", 
                userId, automationId, thresholdType, currentValue);
            
            Optional<SafetyThreshold> thresholdOpt = thresholdRepository.findByUserIdAndType(userId, thresholdType);
            
            if (thresholdOpt.isEmpty()) {
                return Map.of(
                    "valid", true,
                    "reason", "No safety threshold configured for this type",
                    "automationId", automationId,
                    "thresholdType", thresholdType,
                    "currentValue", currentValue
                );
            }
            
            SafetyThreshold threshold = thresholdOpt.get();
            boolean valid = currentValue <= threshold.getMaxValue();
            String reason = valid ? "Within safety limits" : "Exceeds safety threshold";
            
            Map<String, Object> result = Map.of(
                "valid", valid,
                "reason", reason,
                "automationId", automationId,
                "thresholdType", thresholdType,
                "currentValue", currentValue,
                "maxValue", threshold.getMaxValue(),
                "thresholdName", threshold.getName()
            );
            
            log.info("Safety threshold validation result: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Error validating safety threshold", e);
            return Map.of(
                "valid", false,
                "reason", "Error validating safety threshold - failing safe",
                "automationId", automationId,
                "thresholdType", thresholdType,
                "currentValue", currentValue
            );
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
    @Async
    public Map<String, Object> enforceSafetyLimits(String userId, String automationId, String changeType, Map<String, Object> changeData) {
        try {
            log.info("Enforcing safety limits for user: {} - automation: {} - change: {}", userId, automationId, changeType);
            
            // Check approval requirements
            Map<String, Object> approvalCheck = checkApprovalRequirement(userId, automationId, changeType, changeData);
            
            // Validate safety thresholds
            Map<String, Object> thresholdValidation = validateSafetyThreshold(userId, automationId, "AUTOMATION_CHANGE", 1.0);
            
            boolean allowed = (Boolean) approvalCheck.get("approvalRequired") == false && 
                            (Boolean) thresholdValidation.get("valid") == true;
            
            Map<String, Object> result = Map.of(
                "allowed", allowed,
                "approvalRequired", approvalCheck.get("approvalRequired"),
                "approvalReason", approvalCheck.get("reason"),
                "thresholdValid", thresholdValidation.get("valid"),
                "thresholdReason", thresholdValidation.get("reason"),
                "automationId", automationId,
                "changeType", changeType,
                "enforcedAt", LocalDateTime.now()
            );
            
            log.info("Safety limit enforcement result: {}", result);
            return result;
        } catch (Exception e) {
            log.error("Error enforcing safety limits", e);
            return Map.of(
                "allowed", false,
                "reason", "Error enforcing safety limits - failing safe",
                "automationId", automationId,
                "changeType", changeType,
                "enforcedAt", LocalDateTime.now()
            );
        }
    }

    /**
     * Get safety limits for a user
     * 
     * @param userId The user ID
     * @return List of SafetyLimitDTO
     */
    public List<SafetyLimitDTO> getUserSafetyLimits(String userId) {
        try {
            List<SafetyLimit> limits = safetyLimitRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return limits.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving safety limits for user: {}", userId, e);
            return List.of();
        }
    }

    /**
     * Update safety limit
     * 
     * @param limitId The safety limit ID
     * @param safetyLimit The updated safety limit data
     * @return SafetyLimitDTO with the updated limit
     */
    public SafetyLimitDTO updateSafetyLimit(String limitId, SafetyLimitDTO safetyLimit) {
        try {
            Optional<SafetyLimit> limitOpt = safetyLimitRepository.findById(limitId);
            if (limitOpt.isEmpty()) {
                throw new RuntimeException("Safety limit not found: " + limitId);
            }
            
            SafetyLimit limit = limitOpt.get();
            limit.setName(safetyLimit.getName());
            limit.setDescription(safetyLimit.getDescription());
            limit.setLimitType(safetyLimit.getLimitType());
            limit.setLimitValue(safetyLimit.getLimitValue());
            limit.setApprovalRequired(safetyLimit.getApprovalRequired());
            limit.setEnabled(safetyLimit.getEnabled());
            
            SafetyLimit updatedLimit = safetyLimitRepository.save(limit);
            log.info("Safety limit updated successfully: {}", updatedLimit.getId());
            
            return convertToDTO(updatedLimit);
        } catch (Exception e) {
            log.error("Error updating safety limit: {}", limitId, e);
            throw new RuntimeException("Failed to update safety limit", e);
        }
    }

    /**
     * Create safety threshold
     * 
     * @param threshold The threshold data
     * @return SafetyThresholdDTO with the created threshold
     */
    public SafetyThresholdDTO createSafetyThreshold(SafetyThresholdDTO threshold) {
        try {
            log.info("Creating safety threshold: {} for user: {}", threshold.getName(), threshold.getUserId());
            
            SafetyThreshold safetyThreshold = SafetyThreshold.builder()
                .id(UUID.randomUUID().toString())
                .userId(threshold.getUserId())
                .name(threshold.getName())
                .type(threshold.getType())
                .maxValue(threshold.getMaxValue())
                .description(threshold.getDescription())
                .enabled(threshold.getEnabled())
                .createdAt(LocalDateTime.now())
                .build();
            
            SafetyThreshold savedThreshold = thresholdRepository.save(safetyThreshold);
            log.info("Safety threshold created successfully: {}", savedThreshold.getId());
            
            return convertThresholdToDTO(savedThreshold);
        } catch (Exception e) {
            log.error("Error creating safety threshold", e);
            throw new RuntimeException("Failed to create safety threshold", e);
        }
    }

    /**
     * Check if approval is required based on safety limit
     * 
     * @param limit The safety limit
     * @param changeType The type of change
     * @param changeData The change data
     * @return True if approval is required
     */
    private boolean isApprovalRequired(SafetyLimit limit, String changeType, Map<String, Object> changeData) {
        if (!limit.getApprovalRequired()) {
            return false;
        }
        
        switch (limit.getLimitType()) {
            case "AUTOMATION_CREATION":
                return changeType.equals("CREATE");
            case "AUTOMATION_MODIFICATION":
                return changeType.equals("MODIFY");
            case "AUTOMATION_DELETION":
                return changeType.equals("DELETE");
            case "PERFORMANCE_IMPACT":
                return checkPerformanceImpact(changeData, limit.getLimitValue());
            case "SAFETY_CRITICAL":
                return checkSafetyCritical(changeData, limit.getLimitValue());
            default:
                return false;
        }
    }

    /**
     * Check performance impact against limit
     * 
     * @param changeData The change data
     * @param limitValue The limit value
     * @return True if performance impact exceeds limit
     */
    private boolean checkPerformanceImpact(Map<String, Object> changeData, double limitValue) {
        try {
            Double impact = (Double) changeData.get("performanceImpact");
            return impact != null && impact > limitValue;
        } catch (Exception e) {
            log.warn("Error checking performance impact", e);
            return false;
        }
    }

    /**
     * Check if change is safety critical
     * 
     * @param changeData The change data
     * @param limitValue The limit value
     * @return True if change is safety critical
     */
    private boolean checkSafetyCritical(Map<String, Object> changeData, double limitValue) {
        try {
            Boolean safetyCritical = (Boolean) changeData.get("safetyCritical");
            return safetyCritical != null && safetyCritical;
        } catch (Exception e) {
            log.warn("Error checking safety critical", e);
            return false;
        }
    }

    /**
     * Convert SafetyLimit entity to DTO
     * 
     * @param limit The SafetyLimit entity
     * @return SafetyLimitDTO
     */
    private SafetyLimitDTO convertToDTO(SafetyLimit limit) {
        return SafetyLimitDTO.builder()
            .id(limit.getId())
            .userId(limit.getUserId())
            .name(limit.getName())
            .description(limit.getDescription())
            .limitType(limit.getLimitType())
            .limitValue(limit.getLimitValue())
            .approvalRequired(limit.getApprovalRequired())
            .enabled(limit.getEnabled())
            .createdAt(limit.getCreatedAt())
            .build();
    }

    /**
     * Convert SafetyThreshold entity to DTO
     * 
     * @param threshold The SafetyThreshold entity
     * @return SafetyThresholdDTO
     */
    private SafetyThresholdDTO convertThresholdToDTO(SafetyThreshold threshold) {
        return SafetyThresholdDTO.builder()
            .id(threshold.getId())
            .userId(threshold.getUserId())
            .name(threshold.getName())
            .type(threshold.getType())
            .maxValue(threshold.getMaxValue())
            .description(threshold.getDescription())
            .enabled(threshold.getEnabled())
            .createdAt(threshold.getCreatedAt())
            .build();
    }
} 