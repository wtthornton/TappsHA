package com.tappha.homeassistant.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_suggestion_approvals")
public class AISuggestionApproval {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggestion_id", nullable = false)
    private AISuggestion suggestion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Decision decision;
    
    @Column(name = "decision_reason", columnDefinition = "TEXT")
    private String decisionReason;
    
    @CreationTimestamp
    @Column(name = "decided_at", nullable = false, updatable = false)
    private OffsetDateTime decidedAt;
    
    @Column(name = "implemented_at")
    private OffsetDateTime implementedAt;
    
    @Column(name = "rollback_at")
    private OffsetDateTime rollbackAt;
    
    public enum Decision {
        APPROVED,
        REJECTED,
        DEFERRED
    }
    
    // Default constructor
    public AISuggestionApproval() {}
    
    // Constructor with required fields
    public AISuggestionApproval(AISuggestion suggestion, User user, Decision decision, String decisionReason) {
        this.suggestion = suggestion;
        this.user = user;
        this.decision = decision;
        this.decisionReason = decisionReason;
        this.decidedAt = OffsetDateTime.now();
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
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Decision getDecision() {
        return decision;
    }
    
    public void setDecision(Decision decision) {
        this.decision = decision;
    }
    
    public String getDecisionReason() {
        return decisionReason;
    }
    
    public void setDecisionReason(String decisionReason) {
        this.decisionReason = decisionReason;
    }
    
    public OffsetDateTime getDecidedAt() {
        return decidedAt;
    }
    
    public void setDecidedAt(OffsetDateTime decidedAt) {
        this.decidedAt = decidedAt;
    }
    
    public OffsetDateTime getImplementedAt() {
        return implementedAt;
    }
    
    public void setImplementedAt(OffsetDateTime implementedAt) {
        this.implementedAt = implementedAt;
    }
    
    public OffsetDateTime getRollbackAt() {
        return rollbackAt;
    }
    
    public void setRollbackAt(OffsetDateTime rollbackAt) {
        this.rollbackAt = rollbackAt;
    }
    
    // Helper methods
    public void markAsImplemented() {
        this.implementedAt = OffsetDateTime.now();
    }
    
    public void markAsRolledBack() {
        this.rollbackAt = OffsetDateTime.now();
    }
    
    public boolean isApproved() {
        return decision == Decision.APPROVED;
    }
    
    public boolean isRejected() {
        return decision == Decision.REJECTED;
    }
    
    public boolean isDeferred() {
        return decision == Decision.DEFERRED;
    }
    
    public boolean isImplemented() {
        return implementedAt != null;
    }
    
    public boolean isRolledBack() {
        return rollbackAt != null;
    }
    
    @Override
    public String toString() {
        return "AISuggestionApproval{" +
                "id=" + id +
                ", decision=" + decision +
                ", decisionReason='" + decisionReason + '\'' +
                ", decidedAt=" + decidedAt +
                ", implementedAt=" + implementedAt +
                ", rollbackAt=" + rollbackAt +
                '}';
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        AISuggestionApproval that = (AISuggestionApproval) o;
        return id != null ? id.equals(that.id) : that.id == null;
    }
    
    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}