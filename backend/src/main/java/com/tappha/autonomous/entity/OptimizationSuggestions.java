package com.tappha.autonomous.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing AI-generated optimization suggestions for automations.
 *
 * This entity manages:
 * - AI-generated optimization recommendations
 * - Performance, efficiency, safety, and user experience suggestions
 * - Review status and implementation tracking
 * - Confidence scores and impact assessments
 */
@Entity
@Table(name = "optimization_suggestions", indexes = {
    @Index(name = "idx_optimization_suggestions_automation_id", columnList = "automation_management_id"),
    @Index(name = "idx_optimization_suggestions_type", columnList = "suggestion_type"),
    @Index(name = "idx_optimization_suggestions_review_status", columnList = "review_status"),
    @Index(name = "idx_optimization_suggestions_created_at", columnList = "created_at")
})
@EntityListeners(AuditingEntityListener.class)
public class OptimizationSuggestions {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "automation_management_id", nullable = false)
    private AutomationManagement automationManagement;

    @NotNull
    @Column(name = "suggestion_type", nullable = false)
    private String suggestionType; // 'PERFORMANCE', 'EFFICIENCY', 'SAFETY', 'USER_EXPERIENCE'

    @NotNull
    @Column(name = "suggestion_title", nullable = false)
    private String suggestionTitle;

    @NotNull
    @Column(name = "suggestion_description", columnDefinition = "TEXT", nullable = false)
    private String suggestionDescription;

    @Column(name = "current_value", columnDefinition = "TEXT")
    private String currentValue;

    @Column(name = "suggested_value", columnDefinition = "TEXT")
    private String suggestedValue;

    @Column(name = "expected_impact")
    private String expectedImpact; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

    @Column(name = "confidence_score", precision = 5, scale = 2)
    private Double confidenceScore;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "review_status")
    private String reviewStatus = "PENDING"; // 'PENDING', 'APPROVED', 'REJECTED', 'IMPLEMENTED'

    @Column(name = "implementation_notes", columnDefinition = "TEXT")
    private String implementationNotes;

    // Default constructor
    public OptimizationSuggestions() {
        this.createdAt = Instant.now();
    }

    // Constructor with required fields
    public OptimizationSuggestions(AutomationManagement automationManagement, String suggestionType, String suggestionTitle, String suggestionDescription) {
        this();
        this.automationManagement = automationManagement;
        this.suggestionType = suggestionType;
        this.suggestionTitle = suggestionTitle;
        this.suggestionDescription = suggestionDescription;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public AutomationManagement getAutomationManagement() {
        return automationManagement;
    }

    public void setAutomationManagement(AutomationManagement automationManagement) {
        this.automationManagement = automationManagement;
    }

    public String getSuggestionType() {
        return suggestionType;
    }

    public void setSuggestionType(String suggestionType) {
        this.suggestionType = suggestionType;
    }

    public String getSuggestionTitle() {
        return suggestionTitle;
    }

    public void setSuggestionTitle(String suggestionTitle) {
        this.suggestionTitle = suggestionTitle;
    }

    public String getSuggestionDescription() {
        return suggestionDescription;
    }

    public void setSuggestionDescription(String suggestionDescription) {
        this.suggestionDescription = suggestionDescription;
    }

    public String getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(String currentValue) {
        this.currentValue = currentValue;
    }

    public String getSuggestedValue() {
        return suggestedValue;
    }

    public void setSuggestedValue(String suggestedValue) {
        this.suggestedValue = suggestedValue;
    }

    public String getExpectedImpact() {
        return expectedImpact;
    }

    public void setExpectedImpact(String expectedImpact) {
        this.expectedImpact = expectedImpact;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public UUID getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(UUID reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public String getImplementationNotes() {
        return implementationNotes;
    }

    public void setImplementationNotes(String implementationNotes) {
        this.implementationNotes = implementationNotes;
    }

    // Business Logic Methods
    /**
     * Creates a performance optimization suggestion
     */
    public static OptimizationSuggestions createPerformanceSuggestion(
            AutomationManagement automationManagement,
            String title,
            String description,
            String currentValue,
            String suggestedValue,
            String expectedImpact,
            Double confidenceScore) {
        
        OptimizationSuggestions suggestion = new OptimizationSuggestions(automationManagement, "PERFORMANCE", title, description);
        suggestion.setCurrentValue(currentValue);
        suggestion.setSuggestedValue(suggestedValue);
        suggestion.setExpectedImpact(expectedImpact);
        suggestion.setConfidenceScore(confidenceScore);
        return suggestion;
    }

    /**
     * Creates an efficiency optimization suggestion
     */
    public static OptimizationSuggestions createEfficiencySuggestion(
            AutomationManagement automationManagement,
            String title,
            String description,
            String currentValue,
            String suggestedValue,
            String expectedImpact,
            Double confidenceScore) {
        
        OptimizationSuggestions suggestion = new OptimizationSuggestions(automationManagement, "EFFICIENCY", title, description);
        suggestion.setCurrentValue(currentValue);
        suggestion.setSuggestedValue(suggestedValue);
        suggestion.setExpectedImpact(expectedImpact);
        suggestion.setConfidenceScore(confidenceScore);
        return suggestion;
    }

    /**
     * Creates a safety optimization suggestion
     */
    public static OptimizationSuggestions createSafetySuggestion(
            AutomationManagement automationManagement,
            String title,
            String description,
            String currentValue,
            String suggestedValue,
            String expectedImpact,
            Double confidenceScore) {
        
        OptimizationSuggestions suggestion = new OptimizationSuggestions(automationManagement, "SAFETY", title, description);
        suggestion.setCurrentValue(currentValue);
        suggestion.setSuggestedValue(suggestedValue);
        suggestion.setExpectedImpact(expectedImpact);
        suggestion.setConfidenceScore(confidenceScore);
        return suggestion;
    }

    /**
     * Creates a user experience optimization suggestion
     */
    public static OptimizationSuggestions createUserExperienceSuggestion(
            AutomationManagement automationManagement,
            String title,
            String description,
            String currentValue,
            String suggestedValue,
            String expectedImpact,
            Double confidenceScore) {
        
        OptimizationSuggestions suggestion = new OptimizationSuggestions(automationManagement, "USER_EXPERIENCE", title, description);
        suggestion.setCurrentValue(currentValue);
        suggestion.setSuggestedValue(suggestedValue);
        suggestion.setExpectedImpact(expectedImpact);
        suggestion.setConfidenceScore(confidenceScore);
        return suggestion;
    }

    /**
     * Approves the suggestion
     */
    public void approve(UUID reviewedBy, String implementationNotes) {
        this.reviewStatus = "APPROVED";
        this.reviewedBy = reviewedBy;
        this.reviewedAt = Instant.now();
        this.implementationNotes = implementationNotes;
    }

    /**
     * Rejects the suggestion
     */
    public void reject(UUID reviewedBy, String implementationNotes) {
        this.reviewStatus = "REJECTED";
        this.reviewedBy = reviewedBy;
        this.reviewedAt = Instant.now();
        this.implementationNotes = implementationNotes;
    }

    /**
     * Marks the suggestion as implemented
     */
    public void markAsImplemented(UUID reviewedBy, String implementationNotes) {
        this.reviewStatus = "IMPLEMENTED";
        this.reviewedBy = reviewedBy;
        this.reviewedAt = Instant.now();
        this.implementationNotes = implementationNotes;
    }

    /**
     * Checks if suggestion is pending review
     */
    public boolean isPending() {
        return "PENDING".equals(reviewStatus);
    }

    /**
     * Checks if suggestion is approved
     */
    public boolean isApproved() {
        return "APPROVED".equals(reviewStatus);
    }

    /**
     * Checks if suggestion is rejected
     */
    public boolean isRejected() {
        return "REJECTED".equals(reviewStatus);
    }

    /**
     * Checks if suggestion is implemented
     */
    public boolean isImplemented() {
        return "IMPLEMENTED".equals(reviewStatus);
    }

    /**
     * Checks if this is a performance suggestion
     */
    public boolean isPerformanceSuggestion() {
        return "PERFORMANCE".equals(suggestionType);
    }

    /**
     * Checks if this is an efficiency suggestion
     */
    public boolean isEfficiencySuggestion() {
        return "EFFICIENCY".equals(suggestionType);
    }

    /**
     * Checks if this is a safety suggestion
     */
    public boolean isSafetySuggestion() {
        return "SAFETY".equals(suggestionType);
    }

    /**
     * Checks if this is a user experience suggestion
     */
    public boolean isUserExperienceSuggestion() {
        return "USER_EXPERIENCE".equals(suggestionType);
    }

    /**
     * Checks if suggestion has high confidence (>= 80)
     */
    public boolean isHighConfidence() {
        return confidenceScore != null && confidenceScore >= 80.0;
    }

    /**
     * Checks if suggestion has low confidence (< 50)
     */
    public boolean isLowConfidence() {
        return confidenceScore != null && confidenceScore < 50.0;
    }

    /**
     * Checks if suggestion has critical impact
     */
    public boolean isCriticalImpact() {
        return "CRITICAL".equals(expectedImpact);
    }

    /**
     * Checks if suggestion has high impact
     */
    public boolean isHighImpact() {
        return "HIGH".equals(expectedImpact);
    }

    /**
     * Gets suggestion age in days
     */
    public Long getSuggestionAgeDays() {
        return (Instant.now().toEpochMilli() - createdAt.toEpochMilli()) / (24L * 60 * 60 * 1000);
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OptimizationSuggestions that = (OptimizationSuggestions) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    // ToString
    @Override
    public String toString() {
        return "OptimizationSuggestions{" +
                "id=" + id +
                ", automationManagementId=" + (automationManagement != null ? automationManagement.getId() : null) +
                ", suggestionType='" + suggestionType + '\'' +
                ", suggestionTitle='" + suggestionTitle + '\'' +
                ", expectedImpact='" + expectedImpact + '\'' +
                ", confidenceScore=" + confidenceScore +
                ", reviewStatus='" + reviewStatus + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
