package com.tappha.service;

import com.tappha.entity.AutomationTemplate;
import com.tappha.homeassistant.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Service interface for AutomationTemplate operations
 * 
 * Provides business logic for automation template management including
 * creation, retrieval, filtering, and analytics.
 * 
 * @author TappHA Team
 * @version 1.0
 * @since 2025-01-27
 */
public interface AutomationTemplateService {

    /**
     * Create a new automation template
     */
    AutomationTemplate createTemplate(AutomationTemplate template, User createdBy);

    /**
     * Update an existing automation template
     */
    AutomationTemplate updateTemplate(UUID templateId, AutomationTemplate template);

    /**
     * Get template by ID
     */
    Optional<AutomationTemplate> getTemplateById(UUID templateId);

    /**
     * Get template by name
     */
    Optional<AutomationTemplate> getTemplateByName(String name);

    /**
     * Get all active templates
     */
    List<AutomationTemplate> getAllActiveTemplates();

    /**
     * Get templates by category
     */
    List<AutomationTemplate> getTemplatesByCategory(String category);

    /**
     * Get templates by template type
     */
    List<AutomationTemplate> getTemplatesByType(String templateType);

    /**
     * Get templates by difficulty level
     */
    List<AutomationTemplate> getTemplatesByDifficulty(String difficultyLevel);

    /**
     * Get templates by safety level
     */
    List<AutomationTemplate> getTemplatesBySafetyLevel(String safetyLevel);

    /**
     * Search templates by name or description
     */
    List<AutomationTemplate> searchTemplates(String searchTerm);

    /**
     * Get templates by tags
     */
    List<AutomationTemplate> getTemplatesByTags(List<String> tags);

    /**
     * Get templates compatible with available devices
     */
    List<AutomationTemplate> getCompatibleTemplates(List<String> availableDevices, List<String> availableEntities);

    /**
     * Get most popular templates
     */
    List<AutomationTemplate> getMostPopularTemplates(int limit);

    /**
     * Get recently created templates
     */
    List<AutomationTemplate> getRecentlyCreatedTemplates(int limit);

    /**
     * Get templates with high success rate
     */
    List<AutomationTemplate> getHighSuccessRateTemplates(BigDecimal minSuccessRate);

    /**
     * Get templates with high ratings
     */
    List<AutomationTemplate> getHighRatedTemplates(BigDecimal minRating);

    /**
     * Get templates by estimated time range
     */
    List<AutomationTemplate> getTemplatesByTimeRange(Integer minTime, Integer maxTime);

    /**
     * Search templates with advanced filtering
     */
    Page<AutomationTemplate> searchTemplatesAdvanced(
            String category,
            String templateType,
            String difficultyLevel,
            String safetyLevel,
            BigDecimal minSuccessRate,
            BigDecimal minRating,
            Pageable pageable);

    /**
     * Deploy template to Home Assistant connection
     */
    boolean deployTemplate(UUID templateId, UUID connectionId, User user, Map<String, Object> parameters);

    /**
     * Test template deployment
     */
    boolean testTemplateDeployment(UUID templateId, UUID connectionId, User user, Map<String, Object> parameters);

    /**
     * Rate a template
     */
    void rateTemplate(UUID templateId, User user, Integer rating, String review);

    /**
     * Add template to favorites
     */
    void addToFavorites(UUID templateId, User user);

    /**
     * Remove template from favorites
     */
    void removeFromFavorites(UUID templateId, User user);

    /**
     * Get user's favorite templates
     */
    List<AutomationTemplate> getUserFavorites(User user);

    /**
     * Check if template is in user's favorites
     */
    boolean isTemplateFavorited(UUID templateId, User user);

    /**
     * Get template usage statistics
     */
    Map<String, Object> getTemplateUsageStatistics(UUID templateId);

    /**
     * Get template analytics
     */
    Map<String, Object> getTemplateAnalytics(UUID templateId);

    /**
     * Update template ratings and success rates
     */
    void updateTemplateMetrics(UUID templateId);

    /**
     * Get template recommendations for user
     */
    List<AutomationTemplate> getTemplateRecommendations(User user, UUID connectionId);

    /**
     * Get AI-generated templates
     */
    List<AutomationTemplate> getAIGeneratedTemplates();

    /**
     * Get basic templates
     */
    List<AutomationTemplate> getBasicTemplates();

    /**
     * Get advanced templates
     */
    List<AutomationTemplate> getAdvancedTemplates();

    /**
     * Get template statistics
     */
    Map<String, Object> getTemplateStatistics();

    /**
     * Get category statistics
     */
    Map<String, Object> getCategoryStatistics();

    /**
     * Get difficulty level statistics
     */
    Map<String, Object> getDifficultyStatistics();

    /**
     * Get safety level statistics
     */
    Map<String, Object> getSafetyStatistics();

    /**
     * Validate template parameters
     */
    boolean validateTemplateParameters(UUID templateId, Map<String, Object> parameters);

    /**
     * Get template parameter schema
     */
    Map<String, Object> getTemplateParameterSchema(UUID templateId);

    /**
     * Generate template from AI suggestion
     */
    AutomationTemplate generateTemplateFromAI(String prompt, User user);

    /**
     * Clone template
     */
    AutomationTemplate cloneTemplate(UUID templateId, String newName, User user);

    /**
     * Archive template
     */
    void archiveTemplate(UUID templateId, User user);

    /**
     * Restore archived template
     */
    void restoreTemplate(UUID templateId, User user);

    /**
     * Get archived templates
     */
    List<AutomationTemplate> getArchivedTemplates();

    /**
     * Get template version history
     */
    List<AutomationTemplate> getTemplateVersionHistory(UUID templateId);

    /**
     * Compare template versions
     */
    Map<String, Object> compareTemplateVersions(UUID templateId1, UUID templateId2);

    /**
     * Export template
     */
    String exportTemplate(UUID templateId);

    /**
     * Import template
     */
    AutomationTemplate importTemplate(String templateData, User user);

    /**
     * Bulk import templates
     */
    List<AutomationTemplate> bulkImportTemplates(List<String> templateDataList, User user);

    /**
     * Get template deployment history
     */
    List<Map<String, Object>> getTemplateDeploymentHistory(UUID templateId);

    /**
     * Get user's template usage history
     */
    List<Map<String, Object>> getUserTemplateUsageHistory(User user);

    /**
     * Get connection template usage history
     */
    List<Map<String, Object>> getConnectionTemplateUsageHistory(UUID connectionId);

    /**
     * Get template performance metrics
     */
    Map<String, Object> getTemplatePerformanceMetrics(UUID templateId);

    /**
     * Get template compatibility matrix
     */
    Map<String, Object> getTemplateCompatibilityMatrix(UUID templateId);

    /**
     * Get template dependencies
     */
    List<String> getTemplateDependencies(UUID templateId);

    /**
     * Check template compatibility with connection
     */
    boolean checkTemplateCompatibility(UUID templateId, UUID connectionId);

    /**
     * Get template deployment preview
     */
    Map<String, Object> getTemplateDeploymentPreview(UUID templateId, Map<String, Object> parameters);

    /**
     * Validate template before deployment
     */
    Map<String, Object> validateTemplateForDeployment(UUID templateId, UUID connectionId, Map<String, Object> parameters);

    /**
     * Get template deployment status
     */
    String getTemplateDeploymentStatus(UUID templateId, UUID connectionId);

    /**
     * Rollback template deployment
     */
    boolean rollbackTemplateDeployment(UUID templateId, UUID connectionId, User user);

    /**
     * Get template deployment logs
     */
    List<Map<String, Object>> getTemplateDeploymentLogs(UUID templateId, UUID connectionId);

    /**
     * Get template error logs
     */
    List<Map<String, Object>> getTemplateErrorLogs(UUID templateId);

    /**
     * Get template success stories
     */
    List<Map<String, Object>> getTemplateSuccessStories(UUID templateId);

    /**
     * Get template user feedback
     */
    List<Map<String, Object>> getTemplateUserFeedback(UUID templateId);

    /**
     * Get template improvement suggestions
     */
    List<String> getTemplateImprovementSuggestions(UUID templateId);

    /**
     * Get template best practices
     */
    List<String> getTemplateBestPractices(UUID templateId);

    /**
     * Get template troubleshooting guide
     */
    Map<String, Object> getTemplateTroubleshootingGuide(UUID templateId);

    /**
     * Get template documentation
     */
    Map<String, Object> getTemplateDocumentation(UUID templateId);

    /**
     * Get template examples
     */
    List<Map<String, Object>> getTemplateExamples(UUID templateId);

    /**
     * Get template variations
     */
    List<AutomationTemplate> getTemplateVariations(UUID templateId);

    /**
     * Get template alternatives
     */
    List<AutomationTemplate> getTemplateAlternatives(UUID templateId);

    /**
     * Get template prerequisites
     */
    List<String> getTemplatePrerequisites(UUID templateId);

    /**
     * Get template post-deployment steps
     */
    List<String> getTemplatePostDeploymentSteps(UUID templateId);

    /**
     * Get template maintenance schedule
     */
    Map<String, Object> getTemplateMaintenanceSchedule(UUID templateId);

    /**
     * Get template update notifications
     */
    List<Map<String, Object>> getTemplateUpdateNotifications(UUID templateId);

    /**
     * Get template community feedback
     */
    List<Map<String, Object>> getTemplateCommunityFeedback(UUID templateId);

    /**
     * Get template expert reviews
     */
    List<Map<String, Object>> getTemplateExpertReviews(UUID templateId);

    /**
     * Get template certification status
     */
    Map<String, Object> getTemplateCertificationStatus(UUID templateId);

    /**
     * Get template security assessment
     */
    Map<String, Object> getTemplateSecurityAssessment(UUID templateId);

    /**
     * Get template performance benchmarks
     */
    Map<String, Object> getTemplatePerformanceBenchmarks(UUID templateId);

    /**
     * Get template cost analysis
     */
    Map<String, Object> getTemplateCostAnalysis(UUID templateId);

    /**
     * Get template energy impact
     */
    Map<String, Object> getTemplateEnergyImpact(UUID templateId);

    /**
     * Get template environmental impact
     */
    Map<String, Object> getTemplateEnvironmentalImpact(UUID templateId);
}
