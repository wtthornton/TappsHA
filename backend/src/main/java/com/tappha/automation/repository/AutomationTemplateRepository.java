package com.tappha.automation.repository;

import com.tappha.automation.entity.AutomationTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Automation Template Repository
 * 
 * Provides data access methods for automation templates with comprehensive
 * querying and filtering capabilities. Supports 50+ templates.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
@Repository
public interface AutomationTemplateRepository extends JpaRepository<AutomationTemplateEntity, UUID> {
    
    /**
     * Find templates by context
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.contexts LIKE %:context%")
    List<AutomationTemplateEntity> findByContext(@Param("context") String context);
    
    /**
     * Find templates by category
     */
    List<AutomationTemplateEntity> findByCategory(String category);
    
    /**
     * Find templates by complexity level
     */
    List<AutomationTemplateEntity> findByComplexity(String complexity);
    
    /**
     * Find templates by quality score threshold
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.qualityScore >= :minScore")
    List<AutomationTemplateEntity> findByMinQualityScore(@Param("minScore") Double minScore);
    
    /**
     * Find templates by success rate threshold
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.successRate >= :minSuccessRate")
    List<AutomationTemplateEntity> findByMinSuccessRate(@Param("minSuccessRate") Double minSuccessRate);
    
    /**
     * Find default templates
     */
    List<AutomationTemplateEntity> findByIsDefaultTrue();
    
    /**
     * Find default template (single)
     */
    Optional<AutomationTemplateEntity> findDefaultTemplate();
    
    /**
     * Find templates by version
     */
    List<AutomationTemplateEntity> findByVersion(String version);
    
    /**
     * Find templates by tags
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.tags LIKE %:tag%")
    List<AutomationTemplateEntity> findByTag(@Param("tag") String tag);
    
    /**
     * Find templates by multiple tags
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.tags LIKE %:tag1% AND t.tags LIKE %:tag2%")
    List<AutomationTemplateEntity> findByMultipleTags(@Param("tag1") String tag1, @Param("tag2") String tag2);
    
    /**
     * Find templates by name containing
     */
    List<AutomationTemplateEntity> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find templates by description containing
     */
    List<AutomationTemplateEntity> findByDescriptionContainingIgnoreCase(String description);
    
    /**
     * Find templates by category and complexity
     */
    List<AutomationTemplateEntity> findByCategoryAndComplexity(String category, String complexity);
    
    /**
     * Find templates by category and minimum quality score
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.category = :category AND t.qualityScore >= :minScore")
    List<AutomationTemplateEntity> findByCategoryAndMinQualityScore(@Param("category") String category,
                                                                   @Param("minScore") Double minScore);
    
    /**
     * Find popular templates (high usage count)
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.usageCount >= :minUsage ORDER BY t.usageCount DESC")
    List<AutomationTemplateEntity> findPopularTemplates(@Param("minUsage") Integer minUsage);
    
    /**
     * Find successful templates (high success rate)
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.successRate >= :minSuccessRate ORDER BY t.successRate DESC")
    List<AutomationTemplateEntity> findSuccessfulTemplates(@Param("minSuccessRate") Double minSuccessRate);
    
    /**
     * Find templates by context and category
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.contexts LIKE %:context% AND t.category = :category")
    List<AutomationTemplateEntity> findByContextAndCategory(@Param("context") String context,
                                                          @Param("category") String category);
    
    /**
     * Find templates by context and complexity
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.contexts LIKE %:context% AND t.complexity = :complexity")
    List<AutomationTemplateEntity> findByContextAndComplexity(@Param("context") String context,
                                                            @Param("complexity") String complexity);
    
    /**
     * Find templates by context and minimum quality score
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.contexts LIKE %:context% AND t.qualityScore >= :minScore")
    List<AutomationTemplateEntity> findByContextAndMinQualityScore(@Param("context") String context,
                                                                  @Param("minScore") Double minScore);
    
    /**
     * Find templates by multiple categories
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.category IN :categories")
    List<AutomationTemplateEntity> findByCategories(@Param("categories") List<String> categories);
    
    /**
     * Find templates by multiple complexity levels
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.complexity IN :complexities")
    List<AutomationTemplateEntity> findByComplexities(@Param("complexities") List<String> complexities);
    
    /**
     * Find templates by name pattern
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.name LIKE %:pattern%")
    List<AutomationTemplateEntity> findByNamePattern(@Param("pattern") String pattern);
    
    /**
     * Find templates by description pattern
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.description LIKE %:pattern%")
    List<AutomationTemplateEntity> findByDescriptionPattern(@Param("pattern") String pattern);
    
    /**
     * Find templates with parameters
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.parameters IS NOT NULL AND t.parameters != ''")
    List<AutomationTemplateEntity> findTemplatesWithParameters();
    
    /**
     * Find templates with examples
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.examples IS NOT NULL AND t.examples != ''")
    List<AutomationTemplateEntity> findTemplatesWithExamples();
    
    /**
     * Find templates by quality score range
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.qualityScore BETWEEN :minScore AND :maxScore")
    List<AutomationTemplateEntity> findByQualityScoreRange(@Param("minScore") Double minScore,
                                                          @Param("maxScore") Double maxScore);
    
    /**
     * Find templates by success rate range
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.successRate BETWEEN :minRate AND :maxRate")
    List<AutomationTemplateEntity> findBySuccessRateRange(@Param("minRate") Double minRate,
                                                         @Param("maxRate") Double maxRate);
    
    /**
     * Find templates by usage count range
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.usageCount BETWEEN :minUsage AND :maxUsage")
    List<AutomationTemplateEntity> findByUsageCountRange(@Param("minUsage") Integer minUsage,
                                                        @Param("maxUsage") Integer maxUsage);
    
    /**
     * Count templates by category
     */
    long countByCategory(String category);
    
    /**
     * Count templates by complexity
     */
    long countByComplexity(String complexity);
    
    /**
     * Count default templates
     */
    long countByIsDefaultTrue();
    
    /**
     * Count templates by version
     */
    long countByVersion(String version);
    
    /**
     * Find templates ordered by quality score
     */
    @Query("SELECT t FROM AutomationTemplateEntity t ORDER BY t.qualityScore DESC")
    List<AutomationTemplateEntity> findAllOrderByQualityScoreDesc();
    
    /**
     * Find templates ordered by success rate
     */
    @Query("SELECT t FROM AutomationTemplateEntity t ORDER BY t.successRate DESC")
    List<AutomationTemplateEntity> findAllOrderBySuccessRateDesc();
    
    /**
     * Find templates ordered by usage count
     */
    @Query("SELECT t FROM AutomationTemplateEntity t ORDER BY t.usageCount DESC")
    List<AutomationTemplateEntity> findAllOrderByUsageCountDesc();
    
    /**
     * Find templates by category ordered by quality score
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.category = :category ORDER BY t.qualityScore DESC")
    List<AutomationTemplateEntity> findByCategoryOrderByQualityScoreDesc(@Param("category") String category);
    
    /**
     * Find templates by complexity ordered by success rate
     */
    @Query("SELECT t FROM AutomationTemplateEntity t WHERE t.complexity = :complexity ORDER BY t.successRate DESC")
    List<AutomationTemplateEntity> findByComplexityOrderBySuccessRateDesc(@Param("complexity") String complexity);
}
