package com.tappha.homeassistant.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Behavioral pattern analysis result
 * Contains pattern details, confidence scores, and behavioral insights
 */
@Data
@Builder
public class BehavioralPattern {
    
    private String id;
    private String patternType; // 'daily_routine', 'weekly_pattern', 'seasonal', 'anomaly'
    private String patternName; // Human-readable pattern name
    private String description; // Pattern description
    private Double confidence; // 0.0 to 1.0
    private Double privacyScore; // 0.0 to 1.0 (higher = more privacy-preserving)
    private String reasoning; // AI reasoning for the pattern
    private String context; // Context used for analysis
    private Long timestamp; // Unix timestamp
    private String userId;
    private String connectionId;
    
    // Pattern metadata
    private Map<String, Object> patternData; // Pattern-specific data
    private List<String> entities; // Entities involved in the pattern
    private List<String> timeRanges; // Time ranges when pattern occurs
    private Map<String, Object> frequency; // Frequency analysis
    
    // Privacy and security
    private Boolean isPrivacyPreserving; // Whether pattern preserves privacy
    private String privacyLevel; // 'low', 'medium', 'high'
    private Map<String, Object> privacyMetadata; // Privacy-related metadata
    
    // Timestamps
    private OffsetDateTime createdAt;
    private OffsetDateTime lastUpdated;
    private OffsetDateTime expiresAt; // When pattern expires
    
    // Metadata
    private Map<String, Object> metadata;
} 