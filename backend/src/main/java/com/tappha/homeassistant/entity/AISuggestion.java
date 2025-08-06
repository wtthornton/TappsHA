package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ai_suggestions")
public class AISuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "connection_id", nullable = false)
    private HomeAssistantConnection connection;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "suggestion_type", nullable = false)
    private SuggestionType suggestionType;
    
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "automation_config", nullable = false)
    private String automationConfig;
    
    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "1.0", inclusive = true)
    @Column(name = "confidence_score", precision = 3, scale = 2)
    private BigDecimal confidenceScore;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SuggestionStatus status = SuggestionStatus.PENDING;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @Column(name = "processed_at")
    private OffsetDateTime processedAt;
    
    @OneToMany(mappedBy = "suggestion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AISuggestionApproval> approvals = new ArrayList<>();
    
    @OneToMany(mappedBy = "suggestion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AISuggestionFeedback> feedback = new ArrayList<>();
    
    public enum SuggestionType {
        AUTOMATION_OPTIMIZATION,
        NEW_AUTOMATION,
        SCHEDULE_ADJUSTMENT,
        TRIGGER_REFINEMENT
    }
    
    public enum SuggestionStatus {
        PENDING,
        APPROVED,
        REJECTED,
        IMPLEMENTED,
        FAILED,
        ROLLED_BACK
    }
    
    // Default constructor
    public AISuggestion() {}
    
    // Constructor with required fields
    public AISuggestion(HomeAssistantConnection connection, SuggestionType suggestionType, 
                       String title, String description, String automationConfig, 
                       BigDecimal confidenceScore) {
        this.connection = connection;
        this.suggestionType = suggestionType;
        this.title = title;
        this.description = description;
        this.automationConfig = automationConfig;
        this.confidenceScore = confidenceScore;
    }
    
    // Getters and Setters
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public HomeAssistantConnection getConnection() {
        return connection;
    }
    
    public void setConnection(HomeAssistantConnection connection) {
        this.connection = connection;
    }
    
    public SuggestionType getSuggestionType() {
        return suggestionType;
    }
    
    public void setSuggestionType(SuggestionType suggestionType) {
        this.suggestionType = suggestionType;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getAutomationConfig() {
        return automationConfig;
    }
    
    public void setAutomationConfig(String automationConfig) {
        this.automationConfig = automationConfig;
    }
    
    public BigDecimal getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(BigDecimal confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public SuggestionStatus getStatus() {
        return status;
    }
    
    public void setStatus(SuggestionStatus status) {
        this.status = status;
    }
    
    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public OffsetDateTime getProcessedAt() {
        return processedAt;
    }
    
    public void setProcessedAt(OffsetDateTime processedAt) {
        this.processedAt = processedAt;
    }
    
    public List<AISuggestionApproval> getApprovals() {
        return approvals;
    }
    
    public void setApprovals(List<AISuggestionApproval> approvals) {
        this.approvals = approvals;
    }
    
    public List<AISuggestionFeedback> getFeedback() {
        return feedback;
    }
    
    public void setFeedback(List<AISuggestionFeedback> feedback) {
        this.feedback = feedback;
    }
    
    // Helper methods
    public void addApproval(AISuggestionApproval approval) {
        approvals.add(approval);
        approval.setSuggestion(this);
    }
    
    public void addFeedback(AISuggestionFeedback feedback) {
        this.feedback.add(feedback);
        feedback.setSuggestion(this);
    }
    
    public void markAsProcessed() {
        this.processedAt = OffsetDateTime.now();
    }
    
    public void markAsImplemented() {
        this.status = SuggestionStatus.IMPLEMENTED;
        markAsProcessed();
    }
    
    public void markAsFailed() {
        this.status = SuggestionStatus.FAILED;
        markAsProcessed();
    }
    
    public boolean isPending() {
        return status == SuggestionStatus.PENDING;
    }
    
    public boolean isApproved() {
        return status == SuggestionStatus.APPROVED;
    }
    
    public boolean isImplemented() {
        return status == SuggestionStatus.IMPLEMENTED;
    }
    
    public boolean isProcessed() {
        return processedAt != null;
    }
    
    @Override
    public String toString() {
        return "AISuggestion{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", suggestionType=" + suggestionType +
                ", status=" + status +
                ", confidenceScore=" + confidenceScore +
                ", createdAt=" + createdAt +
                ", processedAt=" + processedAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        AISuggestion that = (AISuggestion) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}