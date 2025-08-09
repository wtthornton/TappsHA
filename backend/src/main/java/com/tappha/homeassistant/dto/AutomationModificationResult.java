package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation modification result
 * Represents the result of an automation modification operation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationModificationResult {
    
    private boolean success;
    private String errorMessage;
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String modificationType;
    private String backupId;
    private String versionId;
    private String previousVersionId;
    private long modificationTimestamp;
    private Map<String, Object> resultData;
    private Map<String, Object> metadata;
}
