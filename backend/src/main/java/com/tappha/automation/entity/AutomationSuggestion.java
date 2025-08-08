package com.tappha.automation.entity;

import com.tappha.automation.dto.QualityAssessment;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Automation Suggestion Entity
 * 
 * Stores automation suggestions with approval workflow and quality assessment.
 * Supports user feedback integration and learning mechanisms.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "automation_suggestions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutomationSuggestion {
    
    /**
     * Unique identifier for the suggestion
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    /**
     * User ID who owns this suggestion
     */
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    /**
     * Generated automation configuration in YAML format
     */
    @Column(name = "automation", columnDefinition = "TEXT", nullable = false)
    private String automation;
    
    /**
     * Context description for the automation
     */
    @Column(name = "context", columnDefinition = "TEXT")
    private String context;
    
    /**
     * Quality assessment of the generated automation
     */
    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "syntaxValid", column = @Column(name = "syntax_valid")),
        @AttributeOverride(name = "logicValid", column = @Column(name = "logic_valid")),
        @AttributeOverride(name = "securityValid", column = @Column(name = "security_valid")),
        @AttributeOverride(name = "performanceValid", column = @Column(name = "performance_valid")),
        @AttributeOverride(name = "riskLevel", column = @Column(name = "risk_level")),
        @AttributeOverride(name = "confidenceScore", column = @Column(name = "confidence_score")),
        @AttributeOverride(name = "validationMessages", column = @Column(name = "validation_messages", columnDefinition = "TEXT")),
        @AttributeOverride(name = "securityWarnings", column = @Column(name = "security_warnings", columnDefinition = "TEXT")),
        @AttributeOverride(name = "performanceRecommendations", column = @Column(name = "performance_recommendations", columnDefinition = "TEXT")),
        @AttributeOverride(name = "overallScore", column = @Column(name = "overall_score"))
    })
    private QualityAssessment qualityAssessment;
    
    /**
     * Current status of the suggestion (PENDING_APPROVAL, APPROVED, REJECTED)
     */
    @Column(name = "status", nullable = false)
    private String status;
    
    /**
     * Whether this suggestion requires explicit approval
     */
    @Column(name = "requires_approval", nullable = false)
    private Boolean requiresApproval;
    
    /**
     * Confidence score (0.0 to 1.0) for the suggestion
     */
    @Column(name = "confidence", nullable = false)
    private Double confidence;
    
    /**
     * When the suggestion was created
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    /**
     * When the suggestion was approved (if applicable)
     */
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    /**
     * When the suggestion was rejected (if applicable)
     */
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;
    
    /**
     * Reason for rejection (if applicable)
     */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    /**
     * Additional metadata about the suggestion
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    /**
     * Template ID used for generation
     */
    @Column(name = "template_id")
    private UUID templateId;
    
    /**
     * User preferences used for generation
     */
    @Column(name = "user_preferences", columnDefinition = "TEXT")
    private String userPreferences;
    
    /**
     * Requirements used for generation
     */
    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;
    
    /**
     * Priority level for the automation (LOW, MEDIUM, HIGH)
     */
    @Column(name = "priority")
    private String priority;
    
    /**
     * Notes or constraints for the automation
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}
