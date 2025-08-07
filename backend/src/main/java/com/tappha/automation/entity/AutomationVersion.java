package com.tappha.automation.entity;

import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for automation version control
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "automation_versions")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AutomationVersion {

    @Id
    private String id;

    @Column(name = "automation_id", nullable = false)
    private String automationId;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String configuration;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "ai_generated")
    private Boolean aiGenerated;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
} 