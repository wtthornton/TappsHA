package com.tappha.notification.repository;

import com.tappha.notification.entity.NotificationTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for notification template data access
 * 
 * Provides comprehensive query methods for notification templates including:
 * - Basic CRUD operations
 * - Type-based queries
 * - Template management queries
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, String> {
    
    /**
     * Find templates by type
     * 
     * @param type The template type
     * @return List of templates with the specified type
     */
    List<NotificationTemplate> findByType(String type);
    
    /**
     * Find template by name
     * 
     * @param name The template name
     * @return Optional of the template
     */
    Optional<NotificationTemplate> findByName(String name);
    
    /**
     * Find templates by name containing
     * 
     * @param name The name to search for
     * @return List of templates with matching names
     */
    List<NotificationTemplate> findByNameContainingIgnoreCase(String name);
    
    /**
     * Count templates by type
     * 
     * @param type The template type
     * @return Count of templates with the specified type
     */
    long countByType(String type);
} 