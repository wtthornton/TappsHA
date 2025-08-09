package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for version diff result
 * Represents the result of comparing two versions with detailed differences
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionDiffResult {
    private String diffId;
    private String sourceVersionId;
    private String targetVersionId;
    private String automationId;
    private UUID connectionId;
    private long diffTimestamp;
    private String diffType; // full, incremental, summary
    private Map<String, Object> differences;
    private List<String> addedFields;
    private List<String> removedFields;
    private List<String> modifiedFields;
    private Map<String, Object> fieldChanges;
    private String changeSummary;
    private long changeCount;
    private long additionCount;
    private long deletionCount;
    private long modificationCount;
    private Map<String, Object> metadata;
    private boolean hasBreakingChanges;
    private List<String> breakingChanges;
    private boolean hasPerformanceImpact;
    private Map<String, Object> performanceImpact;
    private boolean hasSecurityImpact;
    private List<String> securityIssues;
    private String diffHash;
    private long diffSizeInBytes;
    private Map<String, Object> statistics;
    private boolean isReversible;
    private String reverseDiffId;
    private Map<String, Object> confidenceMetrics;
    private String errorMessage; // Error message if diff operation failed
}
