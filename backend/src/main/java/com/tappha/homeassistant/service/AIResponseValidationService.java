package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.AutomationContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * AI Response Validation and Confidence Scoring Service
 * 
 * Validates AI-generated suggestions and calculates confidence scores
 * based on multiple factors including content quality, format compliance,
 * and Home Assistant automation structure.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AIResponseValidationService {

    private final ObjectMapper objectMapper;

    // Validation patterns for Home Assistant automation config
    private static final Pattern ENTITY_ID_PATTERN = Pattern.compile("^[a-z_][a-z0-9_]*\\.[a-z0-9_]+$");
    private static final Pattern SERVICE_PATTERN = Pattern.compile("^[a-z_][a-z0-9_]*\\.[a-z0-9_]+$");
    
    // Required keys in automation config
    private static final List<String> REQUIRED_AUTOMATION_KEYS = Arrays.asList(
        "trigger", "action"
    );
    
    // Optional but recommended keys
    private static final List<String> RECOMMENDED_AUTOMATION_KEYS = Arrays.asList(
        "alias", "description", "condition"
    );

    /**
     * Validate AI suggestion and calculate comprehensive confidence score
     * 
     * @param suggestion AI suggestion to validate
     * @param context Original automation context
     * @return ValidationResult with score and issues
     */
    public ValidationResult validateSuggestion(AISuggestion suggestion, AutomationContext context) {
        log.debug("Validating AI suggestion: {}", suggestion.getId());
        
        ValidationResult result = new ValidationResult();
        List<String> issues = new ArrayList<>();
        
        // Content validation (30% of score)
        BigDecimal contentScore = validateContent(suggestion, issues);
        
        // Format validation (25% of score)
        BigDecimal formatScore = validateFormat(suggestion, issues);
        
        // Home Assistant compliance (25% of score)
        BigDecimal complianceScore = validateHomeAssistantCompliance(suggestion, issues);
        
        // Context relevance (20% of score)
        BigDecimal relevanceScore = validateContextRelevance(suggestion, context, issues);
        
        // Calculate weighted confidence score
        BigDecimal totalScore = contentScore.multiply(BigDecimal.valueOf(0.30))
                .add(formatScore.multiply(BigDecimal.valueOf(0.25)))
                .add(complianceScore.multiply(BigDecimal.valueOf(0.25)))
                .add(relevanceScore.multiply(BigDecimal.valueOf(0.20)));
        
        result.setConfidenceScore(totalScore.setScale(2, RoundingMode.HALF_UP));
        result.setValidationIssues(issues);
        result.setValid(totalScore.compareTo(BigDecimal.valueOf(0.6)) >= 0 && issues.size() <= 2);
        
        // Set detailed scores for debugging
        result.setContentScore(contentScore);
        result.setFormatScore(formatScore);
        result.setComplianceScore(complianceScore);
        result.setRelevanceScore(relevanceScore);
        
        log.debug("Validation completed for suggestion {}. Score: {}, Valid: {}, Issues: {}", 
                suggestion.getId(), totalScore, result.isValid(), issues.size());
        
        return result;
    }

    /**
     * Validate suggestion content quality
     */
    private BigDecimal validateContent(AISuggestion suggestion, List<String> issues) {
        BigDecimal score = BigDecimal.ONE;
        
        // Check title quality
        if (suggestion.getTitle() == null || suggestion.getTitle().trim().isEmpty()) {
            issues.add("Missing or empty title");
            score = score.subtract(BigDecimal.valueOf(0.3));
        } else if (suggestion.getTitle().length() < 10) {
            issues.add("Title too short (less than 10 characters)");
            score = score.subtract(BigDecimal.valueOf(0.2));
        }
        
        // Check description quality
        if (suggestion.getDescription() == null || suggestion.getDescription().trim().isEmpty()) {
            issues.add("Missing or empty description");
            score = score.subtract(BigDecimal.valueOf(0.4));
        } else if (suggestion.getDescription().length() < 50) {
            issues.add("Description too short (less than 50 characters)");
            score = score.subtract(BigDecimal.valueOf(0.2));
        }
        
        // Check for meaningful content
        if (suggestion.getTitle() != null && 
            (suggestion.getTitle().toLowerCase().contains("error") || 
             suggestion.getTitle().toLowerCase().contains("failed"))) {
            issues.add("Title suggests error or failure");
            score = score.subtract(BigDecimal.valueOf(0.3));
        }
        
        return score.max(BigDecimal.ZERO);
    }

    /**
     * Validate automation configuration format
     */
    private BigDecimal validateFormat(AISuggestion suggestion, List<String> issues) {
        BigDecimal score = BigDecimal.ONE;
        
        try {
            if (suggestion.getAutomationConfig() == null || suggestion.getAutomationConfig().trim().isEmpty()) {
                issues.add("Missing automation configuration");
                return BigDecimal.ZERO;
            }
            
            // Parse automation config as JSON
            JsonNode config = objectMapper.readTree(suggestion.getAutomationConfig());
            
            if (!config.isObject()) {
                issues.add("Automation config is not a valid JSON object");
                return BigDecimal.valueOf(0.2);
            }
            
            // Check for required keys
            for (String requiredKey : REQUIRED_AUTOMATION_KEYS) {
                if (!config.has(requiredKey)) {
                    issues.add("Missing required key: " + requiredKey);
                    score = score.subtract(BigDecimal.valueOf(0.4));
                }
            }
            
            // Bonus for recommended keys
            int recommendedKeysPresent = 0;
            for (String recommendedKey : RECOMMENDED_AUTOMATION_KEYS) {
                if (config.has(recommendedKey)) {
                    recommendedKeysPresent++;
                }
            }
            
            if (recommendedKeysPresent == 0) {
                score = score.subtract(BigDecimal.valueOf(0.1));
            }
            
        } catch (Exception e) {
            issues.add("Invalid JSON in automation configuration: " + e.getMessage());
            return BigDecimal.valueOf(0.1);
        }
        
        return score.max(BigDecimal.ZERO);
    }

    /**
     * Validate Home Assistant specific compliance
     */
    private BigDecimal validateHomeAssistantCompliance(AISuggestion suggestion, List<String> issues) {
        BigDecimal score = BigDecimal.ONE;
        
        try {
            JsonNode config = objectMapper.readTree(suggestion.getAutomationConfig());
            
            // Validate entity IDs in triggers and actions
            score = score.subtract(validateEntityIds(config, issues));
            
            // Validate services in actions
            score = score.subtract(validateServices(config, issues));
            
            // Check for common Home Assistant patterns
            score = score.subtract(validateHomeAssistantPatterns(config, issues));
            
        } catch (Exception e) {
            log.warn("Error validating Home Assistant compliance: {}", e.getMessage());
            score = score.subtract(BigDecimal.valueOf(0.5));
        }
        
        return score.max(BigDecimal.ZERO);
    }

    /**
     * Validate entity IDs in configuration
     */
    private BigDecimal validateEntityIds(JsonNode config, List<String> issues) {
        BigDecimal penalty = BigDecimal.ZERO;
        
        // Check triggers for entity IDs
        if (config.has("trigger") && config.get("trigger").isArray()) {
            for (JsonNode trigger : config.get("trigger")) {
                if (trigger.has("entity_id")) {
                    String entityId = trigger.get("entity_id").asText();
                    if (!ENTITY_ID_PATTERN.matcher(entityId).matches()) {
                        issues.add("Invalid entity ID format in trigger: " + entityId);
                        penalty = penalty.add(BigDecimal.valueOf(0.2));
                    }
                }
            }
        }
        
        // Check actions for entity IDs
        if (config.has("action") && config.get("action").isArray()) {
            for (JsonNode action : config.get("action")) {
                if (action.has("entity_id")) {
                    String entityId = action.get("entity_id").asText();
                    if (!ENTITY_ID_PATTERN.matcher(entityId).matches()) {
                        issues.add("Invalid entity ID format in action: " + entityId);
                        penalty = penalty.add(BigDecimal.valueOf(0.2));
                    }
                }
            }
        }
        
        return penalty;
    }

    /**
     * Validate service calls in actions
     */
    private BigDecimal validateServices(JsonNode config, List<String> issues) {
        BigDecimal penalty = BigDecimal.ZERO;
        
        if (config.has("action") && config.get("action").isArray()) {
            for (JsonNode action : config.get("action")) {
                if (action.has("service")) {
                    String service = action.get("service").asText();
                    if (!SERVICE_PATTERN.matcher(service).matches()) {
                        issues.add("Invalid service format: " + service);
                        penalty = penalty.add(BigDecimal.valueOf(0.3));
                    }
                }
            }
        }
        
        return penalty;
    }

    /**
     * Validate common Home Assistant automation patterns
     */
    private BigDecimal validateHomeAssistantPatterns(JsonNode config, List<String> issues) {
        BigDecimal penalty = BigDecimal.ZERO;
        
        // Check for reasonable automation structure
        if (!config.has("trigger") || !config.get("trigger").isArray() || 
            config.get("trigger").size() == 0) {
            issues.add("Automation must have at least one trigger");
            penalty = penalty.add(BigDecimal.valueOf(0.3));
        }
        
        if (!config.has("action") || !config.get("action").isArray() || 
            config.get("action").size() == 0) {
            issues.add("Automation must have at least one action");
            penalty = penalty.add(BigDecimal.valueOf(0.3));
        }
        
        return penalty;
    }

    /**
     * Validate context relevance
     */
    private BigDecimal validateContextRelevance(AISuggestion suggestion, AutomationContext context, List<String> issues) {
        BigDecimal score = BigDecimal.ONE;
        
        if (context == null) {
            return score;
        }
        
        // Check if suggestion mentions relevant entities from context
        if (context.getEntityIds() != null && !context.getEntityIds().isEmpty()) {
            boolean mentionsContextEntities = false;
            String automationConfig = suggestion.getAutomationConfig().toLowerCase();
            
            for (String entityId : context.getEntityIds()) {
                if (automationConfig.contains(entityId.toLowerCase())) {
                    mentionsContextEntities = true;
                    break;
                }
            }
            
            if (!mentionsContextEntities) {
                issues.add("Suggestion does not reference entities from context");
                score = score.subtract(BigDecimal.valueOf(0.4));
            }
        }
        
        // Check if suggestion type matches context pattern
        if (context.getPatternType() != null && suggestion.getSuggestionType() != null) {
            // This would need to be implemented based on specific pattern type mappings
            // For now, we'll assume they're relevant if both are present
        }
        
        return score.max(BigDecimal.ZERO);
    }

    /**
     * Validation result container
     */
    public static class ValidationResult {
        private BigDecimal confidenceScore;
        private boolean valid;
        private List<String> validationIssues;
        
        // Detailed scores for debugging
        private BigDecimal contentScore;
        private BigDecimal formatScore;
        private BigDecimal complianceScore;
        private BigDecimal relevanceScore;

        // Constructors
        public ValidationResult() {
            this.validationIssues = new ArrayList<>();
        }

        // Getters and setters
        public BigDecimal getConfidenceScore() { return confidenceScore; }
        public void setConfidenceScore(BigDecimal confidenceScore) { this.confidenceScore = confidenceScore; }
        
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        
        public List<String> getValidationIssues() { return validationIssues; }
        public void setValidationIssues(List<String> validationIssues) { this.validationIssues = validationIssues; }
        
        public BigDecimal getContentScore() { return contentScore; }
        public void setContentScore(BigDecimal contentScore) { this.contentScore = contentScore; }
        
        public BigDecimal getFormatScore() { return formatScore; }
        public void setFormatScore(BigDecimal formatScore) { this.formatScore = formatScore; }
        
        public BigDecimal getComplianceScore() { return complianceScore; }
        public void setComplianceScore(BigDecimal complianceScore) { this.complianceScore = complianceScore; }
        
        public BigDecimal getRelevanceScore() { return relevanceScore; }
        public void setRelevanceScore(BigDecimal relevanceScore) { this.relevanceScore = relevanceScore; }
    }
}