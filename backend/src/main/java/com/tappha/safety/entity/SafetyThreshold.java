package com.tappha.safety.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for safety thresholds
 * 
 * Represents safety thresholds in the database with comprehensive
 * validation and enforcement capabilities
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "safety_thresholds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafetyThreshold {
    
    /**
     * Unique identifier for the safety threshold
     */
    @Id
    private String id;
    
    /**
     * The user ID who owns this threshold
     */
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    /**
     * Safety threshold name
     */
    @Column(name = "name", nullable = false)
    private String name;
    
    /**
     * Type of safety threshold (AUTOMATION_CHANGE, PERFORMANCE_IMPACT, SAFETY_CRITICAL, etc.)
     */
    @Column(name = "type", nullable = false)
    private String type;
    
    /**
     * Maximum allowed value for this threshold
     */
    @Column(name = "max_value", nullable = false)
    private Double maxValue;
    
    /**
     * Safety threshold description
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * Whether this safety threshold is enabled
     */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled;
    
    /**
     * Timestamp when the safety threshold was created
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
} 