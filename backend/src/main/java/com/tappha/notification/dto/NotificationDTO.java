package com.tappha.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for notification data
 * 
 * Contains comprehensive notification information including:
 * - Notification details and metadata
 * - Status tracking and delivery information
 * - Timestamps for lifecycle management
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    
    /**
     * Unique identifier for the notification
     */
    private String id;
    
    /**
     * The user ID to notify
     */
    private String userId;
    
    /**
     * Type of notification (APPROVAL_REQUEST, APPROVAL_DECISION, SYSTEM_ALERT, etc.)
     */
    private String type;
    
    /**
     * Notification title
     */
    private String title;
    
    /**
     * Notification message
     */
    private String message;
    
    /**
     * Additional notification data
     */
    private Map<String, Object> data;
    
    /**
     * Priority level (LOW, MEDIUM, HIGH, CRITICAL)
     */
    private String priority;
    
    /**
     * Current status (PENDING, SENT, READ, FAILED)
     */
    private String status;
    
    /**
     * Timestamp when the notification was created
     */
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when the notification was sent
     */
    private LocalDateTime sentAt;
    
    /**
     * Timestamp when the notification was read
     */
    private LocalDateTime readAt;
} 