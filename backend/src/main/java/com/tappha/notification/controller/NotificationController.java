package com.tappha.notification.controller;

import com.tappha.notification.dto.NotificationDTO;
import com.tappha.notification.dto.NotificationTemplateDTO;
import com.tappha.notification.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for notification endpoints
 * 
 * Provides endpoints for:
 * - Notification management and retrieval
 * - Notification template management
 * - Delivery statistics
 * - Notification status updates
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@RestController
@RequestMapping("/api/v1/notifications")
@Slf4j
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    /**
     * Get notifications for a user
     * 
     * @param userId The user ID
     * @return List of NotificationDTO
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable String userId) {
        try {
            log.info("Retrieving notifications for user: {}", userId);
            List<NotificationDTO> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error retrieving notifications for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get unread notifications for a user
     * 
     * @param userId The user ID
     * @return List of unread NotificationDTO
     */
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable String userId) {
        try {
            log.info("Retrieving unread notifications for user: {}", userId);
            List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            log.error("Error retrieving unread notifications for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Mark notification as read
     * 
     * @param notificationId The notification ID
     * @return NotificationDTO with updated status
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable String notificationId) {
        try {
            log.info("Marking notification as read: {}", notificationId);
            NotificationDTO notification = notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", notificationId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Send approval notification
     * 
     * @param userId The user ID to notify
     * @param notificationType The type of notification
     * @param data The notification data
     * @return NotificationDTO with the sent notification
     */
    @PostMapping("/send/approval")
    public ResponseEntity<NotificationDTO> sendApprovalNotification(
            @RequestParam String userId,
            @RequestParam String notificationType,
            @RequestBody Map<String, Object> data) {
        try {
            log.info("Sending approval notification to user: {} - type: {}", userId, notificationType);
            NotificationDTO notification = notificationService.sendApprovalNotification(userId, notificationType, data);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error sending approval notification", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Send system alert
     * 
     * @param userId The user ID to notify
     * @param alertType The type of alert
     * @param alertData The alert data
     * @return NotificationDTO with the sent notification
     */
    @PostMapping("/send/alert")
    public ResponseEntity<NotificationDTO> sendSystemAlert(
            @RequestParam String userId,
            @RequestParam String alertType,
            @RequestBody Map<String, Object> alertData) {
        try {
            log.info("Sending system alert to user: {} - type: {}", userId, alertType);
            NotificationDTO notification = notificationService.sendSystemAlert(userId, alertType, alertData);
            return ResponseEntity.ok(notification);
        } catch (Exception e) {
            log.error("Error sending system alert", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create notification template
     * 
     * @param template The template data
     * @return NotificationTemplateDTO with the created template
     */
    @PostMapping("/templates")
    public ResponseEntity<NotificationTemplateDTO> createTemplate(@RequestBody NotificationTemplateDTO template) {
        try {
            log.info("Creating notification template: {}", template.getName());
            NotificationTemplateDTO createdTemplate = notificationService.createTemplate(template);
            return ResponseEntity.ok(createdTemplate);
        } catch (Exception e) {
            log.error("Error creating notification template", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get delivery statistics for a user
     * 
     * @param userId The user ID
     * @return Map with delivery statistics
     */
    @GetMapping("/user/{userId}/statistics")
    public ResponseEntity<Map<String, Object>> getDeliveryStatistics(@PathVariable String userId) {
        try {
            log.info("Retrieving delivery statistics for user: {}", userId);
            Map<String, Object> statistics = notificationService.getDeliveryStatistics(userId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            log.error("Error retrieving delivery statistics for user: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 