package com.tappha.automation.entity;

import com.tappha.automation.dto.AutomationStatus;
import com.tappha.automation.dto.AutomationSuggestion;
import lombok.Builder;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity for automation lifecycle management
 * 
 * @author TappHA Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "automations")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Automation {

    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AutomationStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "retired_at")
    private LocalDateTime retiredAt;

    @Column(name = "retirement_reason", length = 500)
    private String retirementReason;

    @Column(name = "ai_generated")
    private Boolean aiGenerated;

    @Column(name = "ai_suggestion", columnDefinition = "TEXT")
    private String aiSuggestion;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "home_assistant_id")
    private String homeAssistantId;
} 