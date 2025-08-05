package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Request for behavioral analysis
 * Contains parameters for behavioral pattern analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BehavioralAnalysisRequest {
    
    private String userId;
    private String connectionId;
    private String analysisType; // 'daily', 'weekly', 'monthly', 'custom'
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private List<String> entityIds; // Specific entities to analyze
    private List<String> eventTypes; // Specific event types to analyze
    
    // Privacy settings
    private Boolean enablePrivacyPreserving; // Default: true
    private String privacyLevel; // 'low', 'medium', 'high' (Default: 'high')
    private Boolean anonymizeData; // Default: true
    private Boolean enableLocalProcessing; // Default: true
    
    // Analysis parameters
    private Integer minConfidenceThreshold; // 0-100 (Default: 70)
    private Integer maxPatternsToReturn; // Default: 10
    private Boolean includeAnomalies; // Default: true
    private Boolean includeFrequencyAnalysis; // Default: true
    
    // AI model settings
    private String aiModel; // 'gpt-4o-mini', 'gpt-4o' (Default: 'gpt-4o-mini')
    private Double temperature; // 0.0-1.0 (Default: 0.3)
    private Integer maxTokens; // Default: 1000
    
    // Custom parameters
    private Map<String, Object> customParameters;
} 