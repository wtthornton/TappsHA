package com.tappha.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity for notification templates
 * 
 * Represents notification templates in the database with comprehensive
 * customization and multi-channel support
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "notification_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplate {
    
    /**
     * Unique identifier for the notification template
     */
    @Id
    private String id;
    
    /**
     * Template name
     */
    @Column(name = "name", nullable = false)
    private String name;
    
    /**
     * Template type (APPROVAL_REQUEST, SYSTEM_ALERT, etc.)
     */
    @Column(name = "type", nullable = false)
    private String type;
    
    /**
     * Title template with placeholders
     */
    @Column(name = "title_template", columnDefinition = "TEXT")
    private String titleTemplate;
    
    /**
     * Message template with placeholders
     */
    @Column(name = "message_template", columnDefinition = "TEXT")
    private String messageTemplate;
    
    /**
     * Email template with HTML formatting
     */
    @Column(name = "email_template", columnDefinition = "TEXT")
    private String emailTemplate;
    
    /**
     * Push notification template
     */
    @Column(name = "push_template", columnDefinition = "TEXT")
    private String pushTemplate;
    
    /**
     * Timestamp when the template was created
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
} 