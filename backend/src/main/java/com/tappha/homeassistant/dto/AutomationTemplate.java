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
 * DTO for automation templates.
 * 
 * Contains pre-defined automation templates for common use cases.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationTemplate {

    @JsonProperty("id")
    private String id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("description")
    private String description;

    @JsonProperty("category")
    private String category;

    @JsonProperty("complexity")
    private String complexity;

    @JsonProperty("estimatedTime")
    private String estimatedTime;

    @JsonProperty("popularity")
    private Integer popularity;

    @JsonProperty("rating")
    private Double rating;

    @JsonProperty("triggers")
    private List<AutomationCreationRequest.AutomationTrigger> triggers;

    @JsonProperty("conditions")
    private List<AutomationCreationRequest.AutomationCondition> conditions;

    @JsonProperty("actions")
    private List<AutomationCreationRequest.AutomationAction> actions;

    @JsonProperty("variables")
    private Map<String, Object> variables;

    @JsonProperty("requirements")
    private List<String> requirements;

    @JsonProperty("benefits")
    private List<String> benefits;

    @JsonProperty("examples")
    private List<String> examples;

    @JsonProperty("tags")
    private List<String> tags;

    @JsonProperty("author")
    private String author;

    @JsonProperty("version")
    private String version;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt;

    @JsonProperty("updatedAt")
    private LocalDateTime updatedAt;

    @JsonProperty("isActive")
    private Boolean isActive;
} 