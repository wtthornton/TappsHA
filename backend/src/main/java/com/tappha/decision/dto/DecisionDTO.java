package com.tappha.decision.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Decision DTO for decision tracking system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionDTO {
    private String id;
    private String userId;
    private String decisionType;
    private String contextType;
    private String contextId;
    private String decision;
    private double confidence;
    private String reasoning;
    private List<String> factors;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
} 