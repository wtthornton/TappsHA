package com.tappha.homeassistant.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for automation suggestions.
 * 
 * Contains AI-generated automation suggestions with confidence scores and metadata.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationSuggestion {

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("complexity")
    private String complexity;

    @JsonProperty("estimatedTime")
    private String estimatedTime;

    @JsonProperty("triggers")
    private List<AutomationCreationRequest.AutomationTrigger> triggers;

    @JsonProperty("conditions")
    private List<AutomationCreationRequest.AutomationCondition> conditions;

    @JsonProperty("actions")
    private List<AutomationCreationRequest.AutomationAction> actions;

    @JsonProperty("template")
    private String template;

    @JsonProperty("category")
    private String category;

    @JsonProperty("tags")
    private List<String> tags;

    @JsonProperty("requirements")
    private List<String> requirements;

    @JsonProperty("benefits")
    private List<String> benefits;

    @JsonProperty("risks")
    private List<String> risks;

    @JsonProperty("alternatives")
    private List<String> alternatives;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("aiModel")
    private String aiModel;

    @JsonProperty("modelVersion")
    private String modelVersion;

    @JsonProperty("metadata")
    private Map<String, Object> metadata;
} 