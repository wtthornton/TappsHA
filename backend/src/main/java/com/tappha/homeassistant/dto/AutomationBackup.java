package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for automation backup
 * Represents a backup of an automation configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationBackup {
    
    private String backupId;
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String backupDescription;
    private Map<String, Object> backupData;
    private String backupType; // full, incremental, differential
    private long backupTimestamp;
    private long backupSize;
    private String checksum;
    private boolean compressed;
    private Map<String, Object> metadata;
}
