package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Correlation Analysis Result DTO for Phase 2.2: Advanced Analytics
 * 
 * Represents correlation analysis results using Pearson correlation
 * for identifying device interaction patterns
 * Following Agent OS Standards with comprehensive correlation data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrelationAnalysisResult {

    private List<String> deviceIds;
    private LocalDateTime analyzedAt;
    private Boolean success;
    private String errorMessage;
    
    // Correlation matrix
    private Map<String, Map<String, Double>> correlationMatrix;
    
    // Strong correlations
    private List<DeviceCorrelation> strongCorrelations;
    
    // Weak correlations
    private List<DeviceCorrelation> weakCorrelations;
    
    // Correlation patterns
    private List<CorrelationPattern> correlationPatterns;
    
    // Processing metadata
    private String analysisType;
    private String modelUsed;
    private Long processingTimeMs;
    private Double confidenceScore;
    private String timeRange;
    private Integer totalDevices;
    
    /**
     * Correlation between two devices
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceCorrelation {
        private String deviceId1;
        private String deviceId2;
        private Double correlationCoefficient;
        private Double pValue;
        private String strength; // "strong", "moderate", "weak"
        private String direction; // "positive", "negative"
        private String interpretation;
        private Double confidence;
    }
    
    /**
     * Pattern of correlations across multiple devices
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CorrelationPattern {
        private String patternType; // "cluster", "chain", "hub", "isolated"
        private List<String> involvedDevices;
        private Double averageCorrelation;
        private String description;
        private Double patternStrength; // 0.0 to 1.0
        private Map<String, Object> additionalProperties;
    }
    
    /**
     * Statistical significance of correlation
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CorrelationSignificance {
        private Double correlationCoefficient;
        private Double pValue;
        private Boolean isSignificant;
        private Double confidenceInterval;
        private String interpretation;
    }
} 