package com.tappha.notification.repository;

import com.tappha.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for notification data access
 * 
 * Provides comprehensive query methods for notifications including:
 * - Basic CRUD operations
 * - User-specific queries
 * - Status-based queries
 * - Delivery tracking queries
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    
    /**
     * Find notifications by user ID ordered by creation date
     * 
     * @param userId The user ID
     * @return List of notifications for the user
     */
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find unread notifications by user ID
     * 
     * @param userId The user ID
     * @return List of unread notifications for the user
     */
    List<Notification> findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(String userId);
    
    /**
     * Find notifications by user ID and status
     * 
     * @param userId The user ID
     * @param status The status to filter by
     * @return List of notifications with the specified status
     */
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);
    
    /**
     * Find notifications by type
     * 
     * @param type The notification type
     * @return List of notifications with the specified type
     */
    List<Notification> findByTypeOrderByCreatedAtDesc(String type);
    
    /**
     * Find notifications by priority
     * 
     * @param priority The priority level
     * @return List of notifications with the specified priority
     */
    List<Notification> findByPriorityOrderByCreatedAtDesc(String priority);
    
    /**
     * Count notifications by user ID
     * 
     * @param userId The user ID
     * @return Count of notifications for the user
     */
    long countByUserId(String userId);
    
    /**
     * Count notifications by user ID and status
     * 
     * @param userId The user ID
     * @param status The status to count
     * @return Count of notifications with the specified status
     */
    long countByUserIdAndStatus(String userId, String status);
    
    /**
     * Count unread notifications by user ID
     * 
     * @param userId The user ID
     * @return Count of unread notifications for the user
     */
    long countByUserIdAndReadAtIsNull(String userId);
} 