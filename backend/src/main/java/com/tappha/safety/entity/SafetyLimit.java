package com.tappha.safety.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for safety limits
 * 
 * Represents safety limits in the database with comprehensive
 * configuration and enforcement capabilities
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "safety_limits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafetyLimit {
    
    /**
     * Unique identifier for the safety limit
     */
    @Id
    private String id;
    
    /**
     * The user ID who owns this limit
     */
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    /**
     * Safety limit name
     */
    @Column(name = "name", nullable = false)
    private String name;
    
    /**
     * Safety limit description
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * Type of safety limit (AUTOMATION_CREATION, AUTOMATION_MODIFICATION, AUTOMATION_DELETION, PERFORMANCE_IMPACT, SAFETY_CRITICAL)
     */
    @Column(name = "limit_type", nullable = false)
    private String limitType;
    
    /**
     * The limit value for this safety limit
     */
    @Column(name = "limit_value", nullable = false)
    private Double limitValue;
    
    /**
     * Whether approval is required when this limit is triggered
     */
    @Column(name = "approval_required", nullable = false)
    private Boolean approvalRequired;
    
    /**
     * Whether this safety limit is enabled
     */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled;
    
    /**
     * Timestamp when the safety limit was created
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
} 