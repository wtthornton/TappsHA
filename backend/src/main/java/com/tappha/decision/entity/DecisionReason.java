package com.tappha.decision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Decision Reason entity for decision tracking system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "decision_reasons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionReason {
    @Id
    private String id;
    
    @Column(name = "decision_id", nullable = false)
    private String decisionId;
    
    @Column(name = "reasoning", columnDefinition = "TEXT", nullable = false)
    private String reasoning;
    
    @ElementCollection
    @CollectionTable(name = "decision_factors", joinColumns = @JoinColumn(name = "reason_id"))
    @Column(name = "factor", columnDefinition = "TEXT")
    private List<String> factors;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
} 