package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation retirement request
 * Represents a request to gracefully retire an automation with dependency resolution
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationRetirementRequest {
    private String automationId;
    private String userId;
    private UUID connectionId;
    private String retirementReason;
    private String retirementType; // immediate, scheduled, gradual
    private long scheduledRetirementTime; // for scheduled retirement
    private boolean forceRetirement; // bypass dependency checks
    private boolean createReplacement; // create replacement automation
    private Map<String, Object> replacementConfig;
    private Map<String, Object> metadata;
    private boolean requireApproval;
    private String approvalWorkflowId;
}
