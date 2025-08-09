package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation modification request
 * Represents a request to modify an automation with safety mechanisms
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationModificationRequest {
    
    private String automationId;
    private String userId;
    private UUID connectionId;
    private String modificationType; // update, enable, disable, delete, duplicate, rollback
    private String modificationDescription;
    private Map<String, Object> modificationData;
    private Map<String, Object> metadata;
    private boolean requireApproval;
    private String approvalWorkflowId;
}
