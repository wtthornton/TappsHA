package com.tappha.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Frequency Analysis Result DTO for Phase 2.2: Advanced Analytics
 * 
 * Represents frequency analysis results using Fast Fourier Transform (FFT)
 * for identifying periodic patterns in device usage
 * Following Agent OS Standards with comprehensive frequency data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FrequencyAnalysisResult {

    private String deviceId;
    private LocalDateTime analyzedAt;
    private Boolean success;
    private String errorMessage;
    
    // FFT analysis results
    private List<FrequencyComponent> frequencyComponents;
    private List<Double> powerSpectrum;
    private List<Double> frequencies;
    
    // Dominant frequencies
    private List<DominantFrequency> dominantFrequencies;
    
    // Periodic patterns
    private List<PeriodicPattern> periodicPatterns;
    
    // Processing metadata
    private String analysisType;
    private String modelUsed;
    private Long processingTimeMs;
    private Double confidenceScore;
    private Integer fftSize;
    private Double samplingRate;
    
    /**
     * Frequency component from FFT analysis
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FrequencyComponent {
        private Double frequency;
        private Double amplitude;
        private Double phase;
        private Double power;
        private String period; // e.g., "24h", "7d", "30d"
    }
    
    /**
     * Dominant frequency identified in the signal
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DominantFrequency {
        private Double frequency;
        private Double amplitude;
        private String period;
        private Double significance; // 0.0 to 1.0
        private String interpretation; // e.g., "daily pattern", "weekly pattern"
    }
    
    /**
     * Periodic pattern identified in the time series
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PeriodicPattern {
        private String patternType; // "daily", "weekly", "monthly", "yearly"
        private Double period;
        private Double strength; // 0.0 to 1.0
        private String description;
        private List<DataPoint> patternData;
    }
    
    /**
     * Data point for frequency analysis
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