package com.tappha.notification.service;

import com.tappha.notification.dto.NotificationDTO;
import com.tappha.notification.dto.NotificationTemplateDTO;
import com.tappha.notification.entity.Notification;
import com.tappha.notification.entity.NotificationTemplate;
import com.tappha.notification.repository.NotificationRepository;
import com.tappha.notification.repository.NotificationTemplateRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Comprehensive notification service
 * 
 * Provides comprehensive notification mechanisms including:
 * - Email notification service for approval requests
 * - In-app notification system
 * - Push notification support
 * - Notification templates and customization
 * - Notification delivery tracking
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Service
@Slf4j
@Transactional
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationTemplateRepository templateRepository;

    @Autowired
    private EmailNotificationService emailService;

    @Autowired
    private PushNotificationService pushService;

    /**
     * Send notification for approval request
     * 
     * @param userId The user ID to notify
     * @param notificationType The type of notification
     * @param data The notification data
     * @return NotificationDTO with the sent notification
     */
    @Async
    public NotificationDTO sendApprovalNotification(String userId, String notificationType, Map<String, Object> data) {
        try {
            log.info("Sending approval notification to user: {} - type: {}", userId, notificationType);
            
            // Create notification record
            Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .type(notificationType)
                .title(generateTitle(notificationType, data))
                .message(generateMessage(notificationType, data))
                .data(data)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
            
            Notification savedNotification = notificationRepository.save(notification);
            
            // Send via different channels
            sendEmailNotification(savedNotification);
            sendInAppNotification(savedNotification);
            sendPushNotification(savedNotification);
            
            // Update status to sent
            savedNotification.setStatus("SENT");
            savedNotification.setSentAt(LocalDateTime.now());
            notificationRepository.save(savedNotification);
            
            log.info("Notification sent successfully: {}", savedNotification.getId());
            
            return convertToDTO(savedNotification);
        } catch (Exception e) {
            log.error("Error sending approval notification to user: {}", userId, e);
            throw new RuntimeException("Failed to send notification", e);
        }
    }

    /**
     * Send system alert notification
     * 
     * @param userId The user ID to notify
     * @param alertType The type of alert
     * @param alertData The alert data
     * @return NotificationDTO with the sent notification
     */
    @Async
    public NotificationDTO sendSystemAlert(String userId, String alertType, Map<String, Object> alertData) {
        try {
            log.info("Sending system alert to user: {} - type: {}", userId, alertType);
            
            Notification notification = Notification.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .type("SYSTEM_ALERT")
                .title(generateAlertTitle(alertType, alertData))
                .message(generateAlertMessage(alertType, alertData))
                .data(alertData)
                .priority("HIGH")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
            
            Notification savedNotification = notificationRepository.save(notification);
            
            // Send via all channels for system alerts
            sendEmailNotification(savedNotification);
            sendInAppNotification(savedNotification);
            sendPushNotification(savedNotification);
            
            savedNotification.setStatus("SENT");
            savedNotification.setSentAt(LocalDateTime.now());
            notificationRepository.save(savedNotification);
            
            return convertToDTO(savedNotification);
        } catch (Exception e) {
            log.error("Error sending system alert to user: {}", userId, e);
            throw new RuntimeException("Failed to send system alert", e);
        }
    }

    /**
     * Get notifications for a user
     * 
     * @param userId The user ID
     * @return List of NotificationDTO
     */
    public List<NotificationDTO> getUserNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            return notifications.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving notifications for user: {}", userId, e);
            return List.of();
        }
    }

    /**
     * Get unread notifications for a user
     * 
     * @param userId The user ID
     * @return List of unread NotificationDTO
     */
    public List<NotificationDTO> getUnreadNotifications(String userId) {
        try {
            List<Notification> notifications = notificationRepository.findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId);
            return notifications.stream()
                .map(this::convertToDTO)
                .toList();
        } catch (Exception e) {
            log.error("Error retrieving unread notifications for user: {}", userId, e);
            return List.of();
        }
    }

    /**
     * Mark notification as read
     * 
     * @param notificationId The notification ID
     * @return NotificationDTO with updated status
     */
    public NotificationDTO markAsRead(String notificationId) {
        try {
            Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
            if (notificationOpt.isEmpty()) {
                throw new RuntimeException("Notification not found: " + notificationId);
            }
            
            Notification notification = notificationOpt.get();
            notification.setReadAt(LocalDateTime.now());
            notification.setStatus("READ");
            
            Notification updatedNotification = notificationRepository.save(notification);
            return convertToDTO(updatedNotification);
        } catch (Exception e) {
            log.error("Error marking notification as read: {}", notificationId, e);
            throw new RuntimeException("Failed to mark notification as read", e);
        }
    }

    /**
     * Create notification template
     * 
     * @param template The template data
     * @return NotificationTemplateDTO with the created template
     */
    public NotificationTemplateDTO createTemplate(NotificationTemplateDTO template) {
        try {
            log.info("Creating notification template: {}", template.getName());
            
            NotificationTemplate notificationTemplate = NotificationTemplate.builder()
                .id(UUID.randomUUID().toString())
                .name(template.getName())
                .type(template.getType())
                .titleTemplate(template.getTitleTemplate())
                .messageTemplate(template.getMessageTemplate())
                .emailTemplate(template.getEmailTemplate())
                .pushTemplate(template.getPushTemplate())
                .createdAt(LocalDateTime.now())
                .build();
            
            NotificationTemplate savedTemplate = templateRepository.save(notificationTemplate);
            return convertTemplateToDTO(savedTemplate);
        } catch (Exception e) {
            log.error("Error creating notification template", e);
            throw new RuntimeException("Failed to create notification template", e);
        }
    }

    /**
     * Get notification delivery statistics
     * 
     * @param userId The user ID
     * @return Map with delivery statistics
     */
    public Map<String, Object> getDeliveryStatistics(String userId) {
        try {
            long totalNotifications = notificationRepository.countByUserId(userId);
            long sentNotifications = notificationRepository.countByUserIdAndStatus(userId, "SENT");
            long readNotifications = notificationRepository.countByUserIdAndStatus(userId, "READ");
            long failedNotifications = notificationRepository.countByUserIdAndStatus(userId, "FAILED");
            
            return Map.of(
                "total", totalNotifications,
                "sent", sentNotifications,
                "read", readNotifications,
                "failed", failedNotifications,
                "deliveryRate", totalNotifications > 0 ? (double) sentNotifications / totalNotifications : 0.0
            );
        } catch (Exception e) {
            log.error("Error getting delivery statistics for user: {}", userId, e);
            return Map.of();
        }
    }

    /**
     * Send email notification
     * 
     * @param notification The notification to send
     */
    private void sendEmailNotification(Notification notification) {
        try {
            emailService.sendNotification(notification);
            log.debug("Email notification sent: {}", notification.getId());
        } catch (Exception e) {
            log.error("Error sending email notification: {}", notification.getId(), e);
            notification.setStatus("FAILED");
            notificationRepository.save(notification);
        }
    }

    /**
     * Send in-app notification
     * 
     * @param notification The notification to send
     */
    private void sendInAppNotification(Notification notification) {
        try {
            // In-app notifications are stored in the database and retrieved by the frontend
            log.debug("In-app notification stored: {}", notification.getId());
        } catch (Exception e) {
            log.error("Error storing in-app notification: {}", notification.getId(), e);
        }
    }

    /**
     * Send push notification
     * 
     * @param notification The notification to send
     */
    private void sendPushNotification(Notification notification) {
        try {
            pushService.sendNotification(notification);
            log.debug("Push notification sent: {}", notification.getId());
        } catch (Exception e) {
            log.error("Error sending push notification: {}", notification.getId(), e);
        }
    }

    /**
     * Generate notification title
     * 
     * @param notificationType The notification type
     * @param data The notification data
     * @return Generated title
     */
    private String generateTitle(String notificationType, Map<String, Object> data) {
        switch (notificationType) {
            case "APPROVAL_REQUEST":
                return "New Approval Request";
            case "APPROVAL_DECISION":
                return "Approval Decision";
            case "SYSTEM_ALERT":
                return "System Alert";
            default:
                return "Notification";
        }
    }

    /**
     * Generate notification message
     * 
     * @param notificationType The notification type
     * @param data The notification data
     * @return Generated message
     */
    private String generateMessage(String notificationType, Map<String, Object> data) {
        switch (notificationType) {
            case "APPROVAL_REQUEST":
                return String.format("You have a new approval request for automation: %s", 
                    data.get("automationId"));
            case "APPROVAL_DECISION":
                return String.format("Your approval request has been %s", 
                    data.get("decision"));
            case "SYSTEM_ALERT":
                return String.format("System alert: %s", data.get("message"));
            default:
                return "You have a new notification";
        }
    }

    /**
     * Generate alert title
     * 
     * @param alertType The alert type
     * @param alertData The alert data
     * @return Generated alert title
     */
    private String generateAlertTitle(String alertType, Map<String, Object> alertData) {
        switch (alertType) {
            case "HIGH_FAILURE_RATE":
                return "High Failure Rate Alert";
            case "SLOW_RESPONSE_TIME":
                return "Slow Response Time Alert";
            case "SYSTEM_ERROR":
                return "System Error Alert";
            default:
                return "System Alert";
        }
    }

    /**
     * Generate alert message
     * 
     * @param alertType The alert type
     * @param alertData The alert data
     * @return Generated alert message
     */
    private String generateAlertMessage(String alertType, Map<String, Object> alertData) {
        switch (alertType) {
            case "HIGH_FAILURE_RATE":
                return String.format("Automation %s has a high failure rate: %.1f%%", 
                    alertData.get("automationId"), alertData.get("failureRate"));
            case "SLOW_RESPONSE_TIME":
                return String.format("Automation %s has slow response time: %.0fms", 
                    alertData.get("automationId"), alertData.get("responseTime"));
            case "SYSTEM_ERROR":
                return String.format("System error: %s", alertData.get("error"));
            default:
                return String.format("Alert: %s", alertData.get("message"));
        }
    }

    /**
     * Convert Notification entity to DTO
     * 
     * @param notification The Notification entity
     * @return NotificationDTO
     */
    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
            .id(notification.getId())
            .userId(notification.getUserId())
            .type(notification.getType())
            .title(notification.getTitle())
            .message(notification.getMessage())
            .data(notification.getData())
            .priority(notification.getPriority())
            .status(notification.getStatus())
            .createdAt(notification.getCreatedAt())
            .sentAt(notification.getSentAt())
            .readAt(notification.getReadAt())
            .build();
    }

    /**
     * Convert NotificationTemplate entity to DTO
     * 
     * @param template The NotificationTemplate entity
     * @return NotificationTemplateDTO
     */
    private NotificationTemplateDTO convertTemplateToDTO(NotificationTemplate template) {
        return NotificationTemplateDTO.builder()
            .id(template.getId())
            .name(template.getName())
            .type(template.getType())
            .titleTemplate(template.getTitleTemplate())
            .messageTemplate(template.getMessageTemplate())
            .emailTemplate(template.getEmailTemplate())
            .pushTemplate(template.getPushTemplate())
            .createdAt(template.getCreatedAt())
            .build();
    }
} 