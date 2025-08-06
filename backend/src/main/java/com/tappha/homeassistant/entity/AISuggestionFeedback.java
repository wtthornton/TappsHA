package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_suggestion_feedback")
public class AISuggestionFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggestion_id", nullable = false)
    private AISuggestion suggestion;
    
    @Min(1)
    @Max(5)
    @Column(name = "effectiveness_rating")
    private Integer effectivenessRating;
    
    @Column(name = "user_comments", columnDefinition = "TEXT")
    private String userComments;
    
    @CreationTimestamp
    @Column(name = "feedback_date", nullable = false, updatable = false)
    private OffsetDateTime feedbackDate;
    
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "automation_performance_data")
    private String automationPerformanceData;
    
    // Default constructor
    public AISuggestionFeedback() {}
    
    // Constructor with required fields
    public AISuggestionFeedback(AISuggestion suggestion, Integer effectivenessRating, 
                               String userComments, String automationPerformanceData) {
        this.suggestion = suggestion;
        this.effectivenessRating = effectivenessRating;
        this.userComments = userComments;
        this.automationPerformanceData = automationPerformanceData;
        this.feedbackDate = OffsetDateTime.now();
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public AISuggestion getSuggestion() {
        return suggestion;
    }
    
    public void setSuggestion(AISuggestion suggestion) {
        this.suggestion = suggestion;
    }
    
    public Integer getEffectivenessRating() {
        return effectivenessRating;
    }
    
    public void setEffectivenessRating(Integer effectivenessRating) {
        this.effectivenessRating = effectivenessRating;
    }
    
    public String getUserComments() {
        return userComments;
    }
    
    public void setUserComments(String userComments) {
        this.userComments = userComments;
    }
    
    public OffsetDateTime getFeedbackDate() {
        return feedbackDate;
    }
    
    public void setFeedbackDate(OffsetDateTime feedbackDate) {
        this.feedbackDate = feedbackDate;
    }
    
    public String getAutomationPerformanceData() {
        return automationPerformanceData;
    }
    
    public void setAutomationPerformanceData(String automationPerformanceData) {
        this.automationPerformanceData = automationPerformanceData;
    }
    
    // Helper methods
    public boolean isPositiveFeedback() {
        return effectivenessRating != null && effectivenessRating >= 4;
    }
    
    public boolean isNegativeFeedback() {
        return effectivenessRating != null && effectivenessRating <= 2;
    }
    
    public boolean hasComments() {
        return userComments != null && !userComments.trim().isEmpty();
    }
    
    public boolean hasPerformanceData() {
        return automationPerformanceData != null && !automationPerformanceData.trim().isEmpty();
    }
    
    public void markAsProcessed() {
        this.feedbackDate = OffsetDateTime.now();
    }
    
    @Override
    public String toString() {
        return "AISuggestionFeedback{" +
                "id=" + id +
                ", effectivenessRating=" + effectivenessRating +
                ", userComments='" + userComments + '\'' +
                ", feedbackDate=" + feedbackDate +
                ", hasPerformanceData=" + hasPerformanceData() +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        AISuggestionFeedback that = (AISuggestionFeedback) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}