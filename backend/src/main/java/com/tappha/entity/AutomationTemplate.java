package com.tappha.entity;

import com.tappha.homeassistant.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

/**
 * Automation Template Entity for Phase 3: Autonomous Management
 * 
 * Represents automation templates that can be used to create automations
 * with predefined configurations and customizable parameters.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "automation_templates")
public class AutomationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Template name is required")
    @Size(max = 255, message = "Template name must be less than 255 characters")
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotBlank(message = "Category is required")
    @Size(max = 100, message = "Category must be less than 100 characters")
    @Column(name = "category", nullable = false)
    private String category;

    @NotBlank(message = "Template type is required")
    @Size(max = 50, message = "Template type must be less than 50 characters")
    @Column(name = "template_type", nullable = false)
    private String templateType; // 'basic', 'advanced', 'ai_generated'

    @NotNull(message = "Template data is required")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "template_data", nullable = false)
    private Map<String, Object> templateData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameters")
    private Map<String, Object> parameters;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "tags", columnDefinition = "TEXT[]")
    private String[] tags;

    @NotBlank(message = "Difficulty level is required")
    @Size(max = 20, message = "Difficulty level must be less than 20 characters")
    @Column(name = "difficulty_level", nullable = false)
    private String difficultyLevel; // 'beginner', 'intermediate', 'advanced'

    @Column(name = "estimated_time_minutes")
    private Integer estimatedTimeMinutes;

    @NotBlank(message = "Safety level is required")
    @Size(max = 20, message = "Safety level must be less than 20 characters")
    @Column(name = "safety_level", nullable = false)
    private String safetyLevel; // 'low', 'medium', 'high'

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "required_devices", columnDefinition = "TEXT[]")
    private String[] requiredDevices;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "required_entities", columnDefinition = "TEXT[]")
    private String[] requiredEntities;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @Column(name = "success_rate", precision = 5, scale = 2)
    private BigDecimal successRate;

    @Column(name = "average_rating", precision = 3, scale = 2)
    private BigDecimal averageRating;

    // Relationships
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TemplateParameter> templateParameters = new ArrayList<>();

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TemplateUsage> templateUsages = new ArrayList<>();

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TemplateRating> templateRatings = new ArrayList<>();

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TemplateFavorite> templateFavorites = new ArrayList<>();

    // Constructors
    public AutomationTemplate() {
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public AutomationTemplate(String name, String description, String category, String templateType) {
        this();
        this.name = name;
        this.description = description;
        this.category = category;
        this.templateType = templateType;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public Map<String, Object> getTemplateData() {
        return templateData;
    }

    public void setTemplateData(Map<String, Object> templateData) {
        this.templateData = templateData;
    }

    public Map<String, Object> getParameters() {
        return parameters;
    }

    public void setParameters(Map<String, Object> parameters) {
        this.parameters = parameters;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public String getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(String difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public Integer getEstimatedTimeMinutes() {
        return estimatedTimeMinutes;
    }

    public void setEstimatedTimeMinutes(Integer estimatedTimeMinutes) {
        this.estimatedTimeMinutes = estimatedTimeMinutes;
    }

    public String getSafetyLevel() {
        return safetyLevel;
    }

    public void setSafetyLevel(String safetyLevel) {
        this.safetyLevel = safetyLevel;
    }

    public String[] getRequiredDevices() {
        return requiredDevices;
    }

    public void setRequiredDevices(String[] requiredDevices) {
        this.requiredDevices = requiredDevices;
    }

    public String[] getRequiredEntities() {
        return requiredEntities;
    }

    public void setRequiredEntities(String[] requiredEntities) {
        this.requiredEntities = requiredEntities;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public BigDecimal getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(BigDecimal successRate) {
        this.successRate = successRate;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public List<TemplateParameter> getTemplateParameters() {
        return templateParameters;
    }

    public void setTemplateParameters(List<TemplateParameter> templateParameters) {
        this.templateParameters = templateParameters;
    }

    public List<TemplateUsage> getTemplateUsages() {
        return templateUsages;
    }

    public void setTemplateUsages(List<TemplateUsage> templateUsages) {
        this.templateUsages = templateUsages;
    }

    public List<TemplateRating> getTemplateRatings() {
        return templateRatings;
    }

    public void setTemplateRatings(List<TemplateRating> templateRatings) {
        this.templateRatings = templateRatings;
    }

    public List<TemplateFavorite> getTemplateFavorites() {
        return templateFavorites;
    }

    public void setTemplateFavorites(List<TemplateFavorite> templateFavorites) {
        this.templateFavorites = templateFavorites;
    }

    // Helper methods
    public void incrementUsageCount() {
        this.usageCount++;
    }

    public void updateSuccessRate() {
        if (templateUsages.isEmpty()) {
            this.successRate = BigDecimal.ZERO;
            return;
        }

        long successfulDeployments = templateUsages.stream()
                .filter(TemplateUsage::getDeploymentSuccess)
                .count();

        this.successRate = BigDecimal.valueOf(successfulDeployments)
                .divide(BigDecimal.valueOf(templateUsages.size()), 2, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    public void updateAverageRating() {
        if (templateRatings.isEmpty()) {
            this.averageRating = BigDecimal.ZERO;
            return;
        }

        double averageRatingValue = templateRatings.stream()
                .mapToInt(TemplateRating::getRating)
                .average()
                .orElse(0.0);

        this.averageRating = BigDecimal.valueOf(averageRatingValue).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    public boolean hasRequiredDevices(List<String> availableDevices) {
        if (requiredDevices == null || requiredDevices.length == 0) {
            return true;
        }

        return Arrays.stream(requiredDevices)
                .allMatch(requiredDevice -> availableDevices.stream()
                        .anyMatch(availableDevice -> availableDevice.toLowerCase().contains(requiredDevice.toLowerCase())));
    }

    public boolean hasRequiredEntities(List<String> availableEntities) {
        if (requiredEntities == null || requiredEntities.length == 0) {
            return true;
        }

        return Arrays.stream(requiredEntities)
                .allMatch(requiredEntity -> availableEntities.contains(requiredEntity));
    }

    public boolean isCompatibleWithUser(User user) {
        // Check if user has required devices and entities
        // This is a simplified check - in real implementation, you'd check against user's actual devices
        return true;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AutomationTemplate that = (AutomationTemplate) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "AutomationTemplate{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category='" + category + '\'' +
                ", templateType='" + templateType + '\'' +
                ", difficultyLevel='" + difficultyLevel + '\'' +
                ", safetyLevel='" + safetyLevel + '\'' +
                ", isActive=" + isActive +
                ", usageCount=" + usageCount +
                ", successRate=" + successRate +
                ", averageRating=" + averageRating +
                '}';
    }
}
