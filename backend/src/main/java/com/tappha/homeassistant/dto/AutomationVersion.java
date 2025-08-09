package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation version
 * Represents a version of an automation configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationVersion {
    
    private String versionId;
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String backupId;
    private String modificationType;
    private String modificationDescription;
    private String previousVersionId;
    private long versionTimestamp;
    private String versionNumber;
    private Map<String, Object> versionData;
    private Map<String, Object> metadata;
}
