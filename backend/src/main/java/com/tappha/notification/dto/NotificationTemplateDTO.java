package com.tappha.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for notification template data
 * 
 * Contains notification template information including:
 * - Template details and customization
 * - Multi-channel template support
 * - Template metadata
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplateDTO {
    
    /**
     * Unique identifier for the notification template
     */
    private String id;
    
    /**
     * Template name
     */
    private String name;
    
    /**
     * Template type (APPROVAL_REQUEST, SYSTEM_ALERT, etc.)
     */
    private String type;
    
    /**
     * Title template with placeholders
     */
    private String titleTemplate;
    
    /**
     * Message template with placeholders
     */
    private String messageTemplate;
    
    /**
     * Email template with HTML formatting
     */
    private String emailTemplate;
    
    /**
     * Push notification template
     */
    private String pushTemplate;
    
    /**
     * Timestamp when the template was created
     */
    private LocalDateTime createdAt;
} 