package com.tappha.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Objects;
import java.util.Map;
import java.util.UUID;

/**
 * Template Parameter Entity for Phase 3: Autonomous Management
 * 
 * Represents parameters that can be customized for automation templates.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "template_parameters")
public class TemplateParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private AutomationTemplate template;

    @NotBlank(message = "Parameter name is required")
    @Size(max = 100, message = "Parameter name must be less than 100 characters")
    @Column(name = "parameter_name", nullable = false)
    private String parameterName;

    @NotBlank(message = "Parameter type is required")
    @Size(max = 50, message = "Parameter type must be less than 50 characters")
    @Column(name = "parameter_type", nullable = false)
    private String parameterType; // 'string', 'number', 'boolean', 'entity', 'time'

    @NotBlank(message = "Display name is required")
    @Size(max = 255, message = "Display name must be less than 255 characters")
    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "required", nullable = false)
    private Boolean required = false;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_rules")
    private Map<String, Object> validationRules;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options")
    private Map<String, Object> options;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    // Constructors
    public TemplateParameter() {
        this.createdAt = OffsetDateTime.now();
    }

    public TemplateParameter(String parameterName, String parameterType, String displayName) {
        this();
        this.parameterName = parameterName;
        this.parameterType = parameterType;
        this.displayName = displayName;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AutomationTemplate getTemplate() {
        return template;
    }

    public void setTemplate(AutomationTemplate template) {
        this.template = template;
    }

    public String getParameterName() {
        return parameterName;
    }

    public void setParameterName(String parameterName) {
        this.parameterName = parameterName;
    }

    public String getParameterType() {
        return parameterType;
    }

    public void setParameterType(String parameterType) {
        this.parameterType = parameterType;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public Boolean getRequired() {
        return required;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    public Map<String, Object> getValidationRules() {
        return validationRules;
    }

    public void setValidationRules(Map<String, Object> validationRules) {
        this.validationRules = validationRules;
    }

    public Map<String, Object> getOptions() {
        return options;
    }

    public void setOptions(Map<String, Object> options) {
        this.options = options;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Helper methods
    public boolean isValidValue(Object value) {
        if (value == null) {
            return !required;
        }

        // Type validation
        switch (parameterType) {
            case "string":
                return value instanceof String;
            case "number":
                return value instanceof Number;
            case "boolean":
                return value instanceof Boolean;
            case "entity":
                return value instanceof String;
            case "time":
                return value instanceof String;
            default:
                return true;
        }
    }

    public Object getTypedDefaultValue() {
        if (defaultValue == null) {
            return null;
        }

        switch (parameterType) {
            case "string":
            case "entity":
            case "time":
                return defaultValue;
            case "number":
                try {
                    return Double.parseDouble(defaultValue);
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            case "boolean":
                return Boolean.parseBoolean(defaultValue);
            default:
                return defaultValue;
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TemplateParameter that = (TemplateParameter) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "TemplateParameter{" +
                "id=" + id +
                ", parameterName='" + parameterName + '\'' +
                ", parameterType='" + parameterType + '\'' +
                ", displayName='" + displayName + '\'' +
                ", required=" + required +
                ", sortOrder=" + sortOrder +
                '}';
    }
}
