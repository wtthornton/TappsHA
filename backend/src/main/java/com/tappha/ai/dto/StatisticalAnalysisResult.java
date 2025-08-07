package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Statistical Analysis Result DTO for Phase 2.2: Advanced Analytics
 * 
 * Represents statistical analysis results including moving averages,
 * standard deviation, seasonality detection, and time clustering
 * Following Agent OS Standards with comprehensive statistical data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticalAnalysisResult {

    private String deviceId;
    private LocalDateTime analyzedAt;
    private Boolean success;
    private String errorMessage;
    
    // Basic statistics
    private Double mean;
    private Double median;
    private Double standardDeviation;
    private Double variance;
    private Double minValue;
    private Double maxValue;
    private Double range;
    
    // Moving averages
    private List<MovingAverage> movingAverages;
    
    // Seasonality detection
    private SeasonalityInfo seasonalityInfo;
    
    // Time clustering results
    private List<TimeCluster> timeClusters;
    
    // Additional statistical metrics
    private Map<String, Double> additionalMetrics;
    
    // Processing metadata
    private String analysisType;
    private String modelUsed;
    private Long processingTimeMs;
    private Double confidenceScore;
    
    /**
     * Moving average calculation result
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MovingAverage {
        private String windowSize;
        private List<DataPoint> values;
        private Double averageValue;
        private Double trendDirection; // -1 for decreasing, 0 for stable, 1 for increasing
    }
    
    /**
     * Seasonality detection information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeasonalityInfo {
        private boolean hasSeasonality;
        private String seasonalityType; // "daily", "weekly", "monthly", "yearly"
        private Double seasonalityStrength; // 0.0 to 1.0
        private Integer seasonalityPeriod;
        private List<DataPoint> seasonalPattern;
    }
    
    /**
     * Time clustering result
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeCluster {
        private Integer clusterId;
        private String clusterLabel;
        private Double centroidValue;
        private List<DataPoint> clusterPoints;
        private Double clusterSize;
        private Double clusterDensity;
    }
    
    /**
     * Data point for statistical analysis
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        private LocalDateTime timestamp;
        private Double value;
        private String metric;
        private Map<String, Object> additionalProperties;
    }
} 