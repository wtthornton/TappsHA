package com.tappha.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entity for notifications
 * 
 * Represents notifications in the database with comprehensive
 * lifecycle management and delivery tracking
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    /**
     * Unique identifier for the notification
     */
    @Id
    private String id;
    
    /**
     * The user ID to notify
     */
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    /**
     * Type of notification (APPROVAL_REQUEST, APPROVAL_DECISION, SYSTEM_ALERT, etc.)
     */
    @Column(name = "type", nullable = false)
    private String type;
    
    /**
     * Notification title
     */
    @Column(name = "title", nullable = false)
    private String title;
    
    /**
     * Notification message
     */
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    /**
     * Additional notification data as JSON
     */
    @Column(name = "data", columnDefinition = "TEXT")
    private String data;
    
    /**
     * Priority level (LOW, MEDIUM, HIGH, CRITICAL)
     */
    @Column(name = "priority")
    private String priority;
    
    /**
     * Current status (PENDING, SENT, READ, FAILED)
     */
    @Column(name = "status", nullable = false)
    private String status;
    
    /**
     * Timestamp when the notification was created
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    /**
     * Timestamp when the notification was sent
     */
    @Column(name = "sent_at")
    private LocalDateTime sentAt;
    
    /**
     * Timestamp when the notification was read
     */
    @Column(name = "read_at")
    private LocalDateTime readAt;
} 