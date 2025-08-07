package com.tappha.safety.repository;

import com.tappha.safety.entity.SafetyLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for safety limit data access
 * 
 * Provides comprehensive query methods for safety limits including:
 * - Basic CRUD operations
 * - User-specific queries
 * - Type-based queries
 * - Enabled/disabled queries
 * 
 * @author Agent OS Development Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface SafetyLimitRepository extends JpaRepository<SafetyLimit, String> {
    
    /**
     * Find safety limits by user ID ordered by creation date
     * 
     * @param userId The user ID
     * @return List of safety limits for the user
     */
    List<SafetyLimit> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find enabled safety limits by user ID
     * 
     * @param userId The user ID
     * @return List of enabled safety limits for the user
     */
    List<SafetyLimit> findByUserIdAndEnabledTrue(String userId);
    
    /**
     * Find safety limits by user ID and type
     * 
     * @param userId The user ID
     * @param limitType The limit type
     * @return List of safety limits with the specified type
     */
    List<SafetyLimit> findByUserIdAndLimitType(String userId, String limitType);
    
    /**
     * Find safety limits by type
     * 
     * @param limitType The limit type
     * @return List of safety limits with the specified type
     */
    List<SafetyLimit> findByLimitType(String limitType);
    
    /**
     * Count safety limits by user ID
     * 
     * @param userId The user ID
     * @return Count of safety limits for the user
     */
    long countByUserId(String userId);
    
    /**
     * Count enabled safety limits by user ID
     * 
     * @param userId The user ID
     * @return Count of enabled safety limits for the user
     */
    long countByUserIdAndEnabledTrue(String userId);
} 