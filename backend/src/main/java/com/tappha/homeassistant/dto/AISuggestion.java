package com.tappha.homeassistant.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * AI-generated automation suggestion
 * Contains suggestion details, confidence scores, and metadata
 */
@Data
@Builder
public class AISuggestion {
    
    private String id;
    private String suggestion; // The actual AI suggestion text
    private String suggestionType; // 'improvement', 'new', 'optimization'
    private Map<String, Object> suggestionData;
    private Double confidence; // 0.0 to 1.0
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
} 