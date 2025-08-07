package com.tappha.decision.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Decision entity for decision tracking system
 *
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "decisions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Decision {
    @Id
    private String id;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "decision_type", nullable = false)
    private String decisionType;
    
    @Column(name = "context_type", nullable = false)
    private String contextType;
    
    @Column(name = "context_id", nullable = false)
    private String contextId;
    
    @Column(name = "decision", nullable = false)
    private String decision;
    
    @Column(name = "confidence", nullable = false)
    private double confidence;
    
    @Column(name = "reasoning", columnDefinition = "TEXT")
    private String reasoning;
    
    @ElementCollection
    @CollectionTable(name = "decision_metadata", joinColumns = @JoinColumn(name = "decision_id"))
    @MapKeyColumn(name = "metadata_key")
    @Column(name = "metadata_value", columnDefinition = "TEXT")
    private Map<String, Object> metadata;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
} 