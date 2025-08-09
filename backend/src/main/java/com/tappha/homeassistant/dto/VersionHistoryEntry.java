package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

/**
 * DTO for version history entry
 * Represents a detailed entry in the version history tracking system
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionHistoryEntry {
    private String entryId;
    private String versionId;
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String versionNumber;
    private String modificationType;
    private String modificationDescription;
    private long versionTimestamp;
    private String previousVersionId;
    private String backupId;
    private Map<String, Object> versionData;
    private Map<String, Object> changes;
    private Map<String, Object> metadata;
    private String changeSummary;
    private String authorName;
    private String authorEmail;
    private boolean isMajorVersion;
    private boolean isRollback;
    private String rollbackReason;
    private Map<String, Object> performanceMetrics;
    private Map<String, Object> validationResults;
    private String commitMessage;
    private String branchName;
    private String tagName;
    private Map<String, Object> diffData;
    private long sizeInBytes;
    private String checksum;
    private boolean isArchived;
    private long archivedAt;
    private String archiveReason;
}
