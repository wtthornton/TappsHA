package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Response from behavioral analysis
 * Contains analysis results, patterns, and metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralAnalysisResponse {
    
    private String id;
    private String userId;
    private String connectionId;
    private String analysisType;
    private OffsetDateTime analysisStartTime;
    private OffsetDateTime analysisEndTime;
    private Long processingTimeMs; // Time taken for analysis
    
    // Analysis results
    private List<BehavioralPattern> patterns; // Discovered patterns
    private List<BehavioralPattern> anomalies; // Anomalies detected
    private Map<String, Object> frequencyAnalysis; // Frequency analysis results
    private Map<String, Object> trendAnalysis; // Trend analysis results
    
    // Privacy and security
    private Boolean isPrivacyPreserving;
    private String privacyLevel;
    private Map<String, Object> privacyMetadata;
    private Boolean dataAnonymized;
    
    // Quality metrics
    private Double overallConfidence; // Average confidence across all patterns
    private Integer totalPatternsFound;
    private Integer totalAnomaliesFound;
    private Map<String, Object> qualityMetrics;
    
    // AI model information
    private String aiModelUsed;
    private Map<String, Object> aiModelMetadata;
    
    // Timestamps
    private OffsetDateTime createdAt;
    private OffsetDateTime expiresAt;
    
    // Metadata
    private Map<String, Object> metadata;
} 