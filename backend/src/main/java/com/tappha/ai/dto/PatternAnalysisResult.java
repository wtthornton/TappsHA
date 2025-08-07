package com.tappha.ai.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Pattern Analysis Result DTO
 * 
 * Contains results of multi-dimensional pattern analysis
 * Following Agent OS Standards with comprehensive analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatternAnalysisResult {

    /**
     * Device ID that was analyzed
     */
    private String deviceId;

    /**
     * Analysis timestamp
     */
    private LocalDateTime analyzedAt;

    /**
     * Overall confidence score for the analysis
     */
    private Double overallConfidence;

    /**
     * Pattern analysis for different time intervals
     */
    private Map<String, TimeIntervalPattern> timeIntervalPatterns;

    /**
     * Identified behavioral patterns
     */
    private List<BehavioralPattern> behavioralPatterns;

    /**
     * Predictive insights
     */
    private List<PredictionInsight> predictions;

    /**
     * Anomaly detection results
     */
    private List<AnomalyDetection> anomalies;

    /**
     * Model used for analysis
     */
    private String modelUsed;

    /**
     * Processing time in milliseconds
     */
    private Long processingTimeMs;

    /**
     * Privacy level used for analysis
     */
    private String privacyLevel;

    /**
     * Success status of the analysis
     */
    private Boolean success;

    /**
     * Error message if any issues occurred
     */
    private String errorMessage;

    /**
     * Time Interval Pattern DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeIntervalPattern {
        private String interval; // 1 day, 1 week, 1 month, 6 months, 1 year
        private Double confidence;
        private String patternDescription;
        private Map<String, Object> patternData;
    }

    /**
     * Behavioral Pattern DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BehavioralPattern {
        private String patternId;
        private String patternName;
        private String description;
        private Double confidence;
        private String timeOfDay;
        private String dayOfWeek;
        private Map<String, Object> patternDetails;
    }

    /**
     * Prediction Insight DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionInsight {
        private String predictionId;
        private String predictionType;
        private String description;
        private Double confidence;
        private LocalDateTime predictedTime;
        private Map<String, Object> predictionData;
    }

    /**
     * Anomaly Detection DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnomalyDetection {
        private String anomalyId;
        private String anomalyType;
        private String description;
        private Double severity;
        private LocalDateTime detectedAt;
        private Map<String, Object> anomalyData;
    }
} 