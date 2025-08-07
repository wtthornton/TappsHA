package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Time Series Data DTO for Phase 2.2: Advanced Analytics
 * 
 * Represents time-series data with aggregated metrics and metadata
 * Following Agent OS Standards with comprehensive data structure
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesData {

    private String deviceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String granularity;
    private LocalDateTime analyzedAt;
    private Boolean success;
    private String errorMessage;
    
    // Time-series data points
    private List<TimeSeriesPoint> dataPoints;
    
    // Aggregated metrics
    private Map<String, Double> aggregatedMetrics;
    
    // Metadata
    private String dataSource;
    private String processingModel;
    private Long processingTimeMs;
    private Integer totalDataPoints;
    
    /**
     * Individual time-series data point
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeSeriesPoint {
        private LocalDateTime timestamp;
        private Double value;
        private String metric;
        private String unit;
        private Map<String, Object> additionalProperties;
    }
} 