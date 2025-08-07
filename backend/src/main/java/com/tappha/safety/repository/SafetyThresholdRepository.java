package com.tappha.safety.repository;

import com.tappha.safety.entity.SafetyThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for safety threshold data access
 * 
 * Provides comprehensive query methods for safety thresholds including:
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
public interface SafetyThresholdRepository extends JpaRepository<SafetyThreshold, String> {
    
    /**
     * Find safety thresholds by user ID ordered by creation date
     * 
     * @param userId The user ID
     * @return List of safety thresholds for the user
     */
    List<SafetyThreshold> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find enabled safety thresholds by user ID
     * 
     * @param userId The user ID
     * @return List of enabled safety thresholds for the user
     */
    List<SafetyThreshold> findByUserIdAndEnabledTrue(String userId);
    
    /**
     * Find safety threshold by user ID and type
     * 
     * @param userId The user ID
     * @param type The threshold type
     * @return Optional of the safety threshold
     */
    Optional<SafetyThreshold> findByUserIdAndType(String userId, String type);
    
    /**
     * Find safety thresholds by type
     * 
     * @param type The threshold type
     * @return List of safety thresholds with the specified type
     */
    List<SafetyThreshold> findByType(String type);
    
    /**
     * Count safety thresholds by user ID
     * 
     * @param userId The user ID
     * @return Count of safety thresholds for the user
     */
    long countByUserId(String userId);
    
    /**
     * Count enabled safety thresholds by user ID
     * 
     * @param userId The user ID
     * @return Count of enabled safety thresholds for the user
     */
    long countByUserIdAndEnabledTrue(String userId);
} 