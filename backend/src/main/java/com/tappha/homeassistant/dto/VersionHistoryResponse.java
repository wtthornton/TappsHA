package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for version history response
 * Represents a paginated and filtered response for version history
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionHistoryResponse {
    private List<VersionHistoryEntry> entries;
    private int totalEntries;
    private int pageNumber;
    private int pageSize;
    private int totalPages;
    private boolean hasNextPage;
    private boolean hasPreviousPage;
    private String nextPageToken;
    private String previousPageToken;
    private Map<String, Object> summary;
    private Map<String, Object> statistics;
    private Map<String, Object> filters;
    private long responseTimestamp;
    private String requestId;
    private Map<String, Object> metadata;
    private List<String> availableFilters;
    private Map<String, Object> exportOptions;
    private boolean isComplete;
    private String errorMessage;
    private Map<String, Object> debugInfo;
}
