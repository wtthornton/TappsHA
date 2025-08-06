package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

/**
 * AI-generated automation suggestion
 * Contains suggestion details, confidence scores, and metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AISuggestion {
    
    private String id;
    private String title;
    private String description;
    private String automationConfig; // JSON configuration for Home Assistant
    private BigDecimal confidenceScore; // 0.0 to 1.0
    private SuggestionType suggestionType;
    private String suggestion; // The actual AI suggestion text (legacy)
    private Map<String, Object> suggestionData;
    private Double confidence; // 0.0 to 1.0 (legacy)
    private Double safetyScore; // 0.0 to 1.0
    private String reasoning;
    private String context; // Context used to generate the suggestion
    private Long timestamp; // Unix timestamp
    private String userId;
    private String automationId;
    private String approvalStatus; // 'pending', 'approved', 'rejected'
    private OffsetDateTime createdAt;
    private OffsetDateTime approvedAt;
    private OffsetDateTime implementedAt;
    private Map<String, Object> metadata;

    /**
     * Suggestion types enum
     */
    public enum SuggestionType {
        ENERGY_OPTIMIZATION,
        COMFORT_IMPROVEMENT, 
        SECURITY_ENHANCEMENT,
        AUTOMATION_SIMPLIFICATION,
        DEVICE_INTEGRATION,
        SCHEDULE_OPTIMIZATION
    }
} 