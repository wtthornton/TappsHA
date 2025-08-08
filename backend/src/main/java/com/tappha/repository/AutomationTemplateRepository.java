package com.tappha.repository;

import com.tappha.entity.AutomationTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for AutomationTemplate entity
 * 
 * Provides data access methods for automation templates with advanced querying capabilities.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface AutomationTemplateRepository extends JpaRepository<AutomationTemplate, UUID> {

    /**
     * Find templates by category
     */
    List<AutomationTemplate> findByCategoryAndIsActiveTrue(String category);

    /**
     * Find templates by template type
     */
    List<AutomationTemplate> findByTemplateTypeAndIsActiveTrue(String templateType);

    /**
     * Find templates by difficulty level
     */
    List<AutomationTemplate> findByDifficultyLevelAndIsActiveTrue(String difficultyLevel);

    /**
     * Find templates by safety level
     */
    List<AutomationTemplate> findBySafetyLevelAndIsActiveTrue(String safetyLevel);

    /**
     * Find templates by name containing (case-insensitive)
     */
    List<AutomationTemplate> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);

    /**
     * Find templates by description containing (case-insensitive)
     */
    List<AutomationTemplate> findByDescriptionContainingIgnoreCaseAndIsActiveTrue(String description);

    /**
     * Find templates by tags containing
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND :tag = ANY(t.tags)")
    List<AutomationTemplate> findByTagAndIsActiveTrue(@Param("tag") String tag);

    /**
     * Find templates by multiple tags
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND EXISTS (SELECT 1 FROM t.tags tag WHERE tag IN :tags)")
    List<AutomationTemplate> findByTagsAndIsActiveTrue(@Param("tags") List<String> tags);

    /**
     * Find templates by required devices
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND :device = ANY(t.requiredDevices)")
    List<AutomationTemplate> findByRequiredDeviceAndIsActiveTrue(@Param("device") String device);

    /**
     * Find templates by required entities
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND :entity = ANY(t.requiredEntities)")
    List<AutomationTemplate> findByRequiredEntityAndIsActiveTrue(@Param("entity") String entity);

    /**
     * Find templates with high success rate
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND t.successRate >= :minSuccessRate ORDER BY t.successRate DESC")
    List<AutomationTemplate> findByHighSuccessRate(@Param("minSuccessRate") BigDecimal minSuccessRate);

    /**
     * Find templates with high average rating
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND t.averageRating >= :minRating ORDER BY t.averageRating DESC")
    List<AutomationTemplate> findByHighRating(@Param("minRating") BigDecimal minRating);

    /**
     * Find most popular templates (by usage count)
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true ORDER BY t.usageCount DESC")
    List<AutomationTemplate> findMostPopularTemplates(Pageable pageable);

    /**
     * Find recently created templates
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true ORDER BY t.createdAt DESC")
    List<AutomationTemplate> findRecentlyCreatedTemplates(Pageable pageable);

    /**
     * Find templates by estimated time range
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND t.estimatedTimeMinutes BETWEEN :minTime AND :maxTime")
    List<AutomationTemplate> findByEstimatedTimeRange(@Param("minTime") Integer minTime, @Param("maxTime") Integer maxTime);

    /**
     * Find templates compatible with available devices
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND " +
           "(t.requiredDevices IS NULL OR t.requiredDevices = '{}' OR " +
           "EXISTS (SELECT 1 FROM t.requiredDevices device WHERE device IN :availableDevices))")
    List<AutomationTemplate> findCompatibleWithDevices(@Param("availableDevices") List<String> availableDevices);

    /**
     * Find templates compatible with available entities
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND " +
           "(t.requiredEntities IS NULL OR t.requiredEntities = '{}' OR " +
           "EXISTS (SELECT 1 FROM t.requiredEntities entity WHERE entity IN :availableEntities))")
    List<AutomationTemplate> findCompatibleWithEntities(@Param("availableEntities") List<String> availableEntities);

    /**
     * Search templates by multiple criteria
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND " +
           "(:category IS NULL OR t.category = :category) AND " +
           "(:templateType IS NULL OR t.templateType = :templateType) AND " +
           "(:difficultyLevel IS NULL OR t.difficultyLevel = :difficultyLevel) AND " +
           "(:safetyLevel IS NULL OR t.safetyLevel = :safetyLevel) AND " +
           "(:minSuccessRate IS NULL OR t.successRate >= :minSuccessRate) AND " +
           "(:minRating IS NULL OR t.averageRating >= :minRating)")
    Page<AutomationTemplate> searchTemplates(
            @Param("category") String category,
            @Param("templateType") String templateType,
            @Param("difficultyLevel") String difficultyLevel,
            @Param("safetyLevel") String safetyLevel,
            @Param("minSuccessRate") BigDecimal minSuccessRate,
            @Param("minRating") BigDecimal minRating,
            Pageable pageable);

    /**
     * Find templates by name (exact match)
     */
    Optional<AutomationTemplate> findByNameAndIsActiveTrue(String name);

    /**
     * Check if template exists by name
     */
    boolean existsByNameAndIsActiveTrue(String name);

    /**
     * Count templates by category
     */
    @Query("SELECT t.category, COUNT(t) FROM AutomationTemplate t WHERE t.isActive = true GROUP BY t.category")
    List<Object[]> countByCategory();

    /**
     * Count templates by difficulty level
     */
    @Query("SELECT t.difficultyLevel, COUNT(t) FROM AutomationTemplate t WHERE t.isActive = true GROUP BY t.difficultyLevel")
    List<Object[]> countByDifficultyLevel();

    /**
     * Count templates by safety level
     */
    @Query("SELECT t.safetyLevel, COUNT(t) FROM AutomationTemplate t WHERE t.isActive = true GROUP BY t.safetyLevel")
    List<Object[]> countBySafetyLevel();

    /**
     * Get average success rate by category
     */
    @Query("SELECT t.category, AVG(t.successRate) FROM AutomationTemplate t WHERE t.isActive = true GROUP BY t.category")
    List<Object[]> getAverageSuccessRateByCategory();

    /**
     * Get average rating by category
     */
    @Query("SELECT t.category, AVG(t.averageRating) FROM AutomationTemplate t WHERE t.isActive = true GROUP BY t.category")
    List<Object[]> getAverageRatingByCategory();

    /**
     * Find templates that need rating updates
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND " +
           "(t.averageRating IS NULL OR t.successRate IS NULL)")
    List<AutomationTemplate> findTemplatesNeedingRatingUpdates();

    /**
     * Find templates created by specific user
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND t.createdBy.id = :userId")
    List<AutomationTemplate> findByCreatedBy(@Param("userId") UUID userId);

    /**
     * Find AI-generated templates
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND t.templateType = 'ai_generated'")
    List<AutomationTemplate> findAIGeneratedTemplates();

    /**
     * Find basic templates
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND t.templateType = 'basic'")
    List<AutomationTemplate> findBasicTemplates();

    /**
     * Find advanced templates
     */
    @Query("SELECT t FROM AutomationTemplate t WHERE t.isActive = true AND t.templateType = 'advanced'")
    List<AutomationTemplate> findAdvancedTemplates();

    /**
     * Get template statistics
     */
    @Query("SELECT " +
           "COUNT(t) as totalTemplates, " +
           "COUNT(CASE WHEN t.templateType = 'basic' THEN 1 END) as basicTemplates, " +
           "COUNT(CASE WHEN t.templateType = 'advanced' THEN 1 END) as advancedTemplates, " +
           "COUNT(CASE WHEN t.templateType = 'ai_generated' THEN 1 END) as aiGeneratedTemplates, " +
           "AVG(t.successRate) as avgSuccessRate, " +
           "AVG(t.averageRating) as avgRating, " +
           "SUM(t.usageCount) as totalUsage " +
           "FROM AutomationTemplate t WHERE t.isActive = true")
    Object[] getTemplateStatistics();
}
