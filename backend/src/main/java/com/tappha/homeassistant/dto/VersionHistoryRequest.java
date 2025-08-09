package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for version history request
 * Represents a request for version history with filtering and pagination options
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionHistoryRequest {
    private String automationId;
    private UUID connectionId;
    private String userId;
    private String versionNumber;
    private String modificationType;
    private long startTimestamp;
    private long endTimestamp;
    private String authorName;
    private String authorEmail;
    private boolean includeArchived;
    private boolean includeRollbacks;
    private boolean includeMajorVersions;
    private List<String> versionIds;
    private String searchQuery;
    private String sortBy; // timestamp, versionNumber, modificationType, authorName
    private String sortOrder; // asc, desc
    private int pageNumber;
    private int pageSize;
    private Map<String, Object> filters;
    private boolean includeMetadata;
    private boolean includeDiffData;
    private boolean includePerformanceMetrics;
    private boolean includeValidationResults;
    private Map<String, Object> customFilters;
}
