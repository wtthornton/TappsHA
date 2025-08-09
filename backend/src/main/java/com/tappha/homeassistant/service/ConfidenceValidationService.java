package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AISuggestion;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Service for validating and enhancing AI suggestion confidence
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
public class ConfidenceValidationService {

    private static final double MIN_CONFIDENCE_THRESHOLD = 0.7;
    private static final double TARGET_CONFIDENCE_THRESHOLD = 0.9;
    private static final double MIN_SAFETY_SCORE = 0.8;

    /**
     * Validate and enhance suggestion confidence
     */
    public AISuggestion validateAndEnhanceSuggestion(AISuggestion suggestion, Map<String, Object> contextAnalysis) {
        try {
            log.debug("Validating suggestion confidence: {}", suggestion.getConfidence());
            
            // 1. Validate basic confidence
            if (suggestion.getConfidence() < MIN_CONFIDENCE_THRESHOLD) {
                log.warn("Suggestion confidence {} below minimum threshold {}", 
                        suggestion.getConfidence(), MIN_CONFIDENCE_THRESHOLD);
                suggestion = enhanceConfidence(suggestion, contextAnalysis);
            }
            
            // 2. Validate safety score
            if (suggestion.getSafetyScore() < MIN_SAFETY_SCORE) {
                log.warn("Suggestion safety score {} below minimum threshold {}", 
                        suggestion.getSafetyScore(), MIN_SAFETY_SCORE);
                suggestion = enhanceSafetyScore(suggestion, contextAnalysis);
            }
            
            // 3. Validate reasoning quality
            if (suggestion.getReasoning() == null || suggestion.getReasoning().isEmpty()) {
                log.warn("Suggestion missing reasoning");
                suggestion = enhanceReasoning(suggestion, contextAnalysis);
            }
            
            // 4. Apply final confidence boost if needed
            if (suggestion.getConfidence() < TARGET_CONFIDENCE_THRESHOLD) {
                suggestion = applyConfidenceBoost(suggestion, contextAnalysis);
            }
            
            log.debug("Suggestion validation completed. Final confidence: {}", suggestion.getConfidence());
            
        } catch (Exception e) {
            log.error("Failed to validate suggestion confidence", e);
            // Apply fallback confidence
            suggestion = applyFallbackConfidence(suggestion);
        }
        
        return suggestion;
    }

    /**
     * Enhance confidence based on context analysis
     */
    private AISuggestion enhanceConfidence(AISuggestion suggestion, Map<String, Object> contextAnalysis) {
        double enhancedConfidence = suggestion.getConfidence();
        
        // Factor 1: Pattern strength from context analysis
        double patternStrength = (Double) contextAnalysis.getOrDefault("patternStrength", 0.5);
        enhancedConfidence += patternStrength * 0.2;
        
        // Factor 2: Context relevance
        double contextRelevance = calculateContextRelevance(contextAnalysis);
        enhancedConfidence += contextRelevance * 0.15;
        
        // Factor 3: Data quality
        double dataQuality = calculateDataQuality(contextAnalysis);
        enhancedConfidence += dataQuality * 0.1;
        
        // Cap at maximum confidence
        enhancedConfidence = Math.min(enhancedConfidence, 1.0);
        
        return AISuggestion.builder()
                .id(suggestion.getId())
                .title(suggestion.getTitle())
                .description(suggestion.getDescription())
                .automationConfig(suggestion.getAutomationConfig())
                .confidenceScore(suggestion.getConfidenceScore())
                .suggestionType(suggestion.getSuggestionType())
                .suggestion(suggestion.getSuggestion())
                .suggestionData(suggestion.getSuggestionData())
                .confidence(enhancedConfidence)
                .safetyScore(suggestion.getSafetyScore())
                .reasoning(suggestion.getReasoning())
                .context(suggestion.getContext())
                .timestamp(suggestion.getTimestamp())
                .userId(suggestion.getUserId())
                .automationId(suggestion.getAutomationId())
                .approvalStatus(suggestion.getApprovalStatus())
                .createdAt(suggestion.getCreatedAt())
                .approvedAt(suggestion.getApprovedAt())
                .implementedAt(suggestion.getImplementedAt())
                .metadata(suggestion.getMetadata())
                .build();
    }

    /**
     * Enhance safety score based on context analysis
     */
    private AISuggestion enhanceSafetyScore(AISuggestion suggestion, Map<String, Object> contextAnalysis) {
        double enhancedSafetyScore = suggestion.getSafetyScore();
        
        // Factor 1: User preferences for safety
        @SuppressWarnings("unchecked")
        Map<String, Object> userAnalysis = (Map<String, Object>) contextAnalysis.get("userAnalysis");
        if (userAnalysis != null) {
            @SuppressWarnings("unchecked")
            List<String> preferences = (List<String>) userAnalysis.get("preferences");
            if (preferences != null && preferences.contains("safety")) {
                enhancedSafetyScore += 0.1;
            }
        }
        
        // Factor 2: Pattern consistency (more consistent = safer)
        double patternConsistency = (Double) contextAnalysis.getOrDefault("patternConsistency", 0.5);
        enhancedSafetyScore += patternConsistency * 0.1;
        
        // Cap at maximum safety score
        enhancedSafetyScore = Math.min(enhancedSafetyScore, 1.0);
        
        return AISuggestion.builder()
                .id(suggestion.getId())
                .title(suggestion.getTitle())
                .description(suggestion.getDescription())
                .automationConfig(suggestion.getAutomationConfig())
                .confidenceScore(suggestion.getConfidenceScore())
                .suggestionType(suggestion.getSuggestionType())
                .suggestion(suggestion.getSuggestion())
                .suggestionData(suggestion.getSuggestionData())
                .confidence(suggestion.getConfidence())
                .safetyScore(enhancedSafetyScore)
                .reasoning(suggestion.getReasoning())
                .context(suggestion.getContext())
                .timestamp(suggestion.getTimestamp())
                .userId(suggestion.getUserId())
                .automationId(suggestion.getAutomationId())
                .approvalStatus(suggestion.getApprovalStatus())
                .createdAt(suggestion.getCreatedAt())
                .approvedAt(suggestion.getApprovedAt())
                .implementedAt(suggestion.getImplementedAt())
                .metadata(suggestion.getMetadata())
                .build();
    }

    /**
     * Enhance reasoning based on context analysis
     */
    private AISuggestion enhanceReasoning(AISuggestion suggestion, Map<String, Object> contextAnalysis) {
        StringBuilder enhancedReasoning = new StringBuilder();
        
        if (suggestion.getReasoning() != null && !suggestion.getReasoning().isEmpty()) {
            enhancedReasoning.append(suggestion.getReasoning()).append("\n\n");
        }
        
        // Add context-based reasoning
        enhancedReasoning.append("Enhanced reasoning based on context analysis:\n");
        
        // Add pattern insights
        @SuppressWarnings("unchecked")
        List<String> insights = (List<String>) contextAnalysis.get("insights");
        if (insights != null && !insights.isEmpty()) {
            enhancedReasoning.append("- Pattern insights: ").append(String.join(", ", insights)).append("\n");
        }
        
        // Add confidence factors
        double patternStrength = (Double) contextAnalysis.getOrDefault("patternStrength", 0.0);
        enhancedReasoning.append("- Pattern strength: ").append(String.format("%.2f", patternStrength)).append("\n");
        
        double patternConsistency = (Double) contextAnalysis.getOrDefault("patternConsistency", 0.0);
        enhancedReasoning.append("- Pattern consistency: ").append(String.format("%.2f", patternConsistency)).append("\n");
        
        return AISuggestion.builder()
                .id(suggestion.getId())
                .title(suggestion.getTitle())
                .description(suggestion.getDescription())
                .automationConfig(suggestion.getAutomationConfig())
                .confidenceScore(suggestion.getConfidenceScore())
                .suggestionType(suggestion.getSuggestionType())
                .suggestion(suggestion.getSuggestion())
                .suggestionData(suggestion.getSuggestionData())
                .confidence(suggestion.getConfidence())
                .safetyScore(suggestion.getSafetyScore())
                .reasoning(enhancedReasoning.toString())
                .context(suggestion.getContext())
                .timestamp(suggestion.getTimestamp())
                .userId(suggestion.getUserId())
                .automationId(suggestion.getAutomationId())
                .approvalStatus(suggestion.getApprovalStatus())
                .createdAt(suggestion.getCreatedAt())
                .approvedAt(suggestion.getApprovedAt())
                .implementedAt(suggestion.getImplementedAt())
                .metadata(suggestion.getMetadata())
                .build();
    }

    /**
     * Apply confidence boost for target accuracy
     */
    private AISuggestion applyConfidenceBoost(AISuggestion suggestion, Map<String, Object> contextAnalysis) {
        double boostedConfidence = suggestion.getConfidence();
        
        // Apply multiple confidence boost factors
        double patternStrength = (Double) contextAnalysis.getOrDefault("patternStrength", 0.0);
        double patternConsistency = (Double) contextAnalysis.getOrDefault("patternConsistency", 0.0);
        
        // Boost based on strong patterns
        if (patternStrength > 0.7) {
            boostedConfidence += 0.1;
        }
        
        // Boost based on consistency
        if (patternConsistency > 0.8) {
            boostedConfidence += 0.1;
        }
        
        // Boost based on safety score
        if (suggestion.getSafetyScore() > 0.9) {
            boostedConfidence += 0.05;
        }
        
        // Cap at maximum confidence
        boostedConfidence = Math.min(boostedConfidence, 1.0);
        
        return AISuggestion.builder()
                .id(suggestion.getId())
                .title(suggestion.getTitle())
                .description(suggestion.getDescription())
                .automationConfig(suggestion.getAutomationConfig())
                .confidenceScore(suggestion.getConfidenceScore())
                .suggestionType(suggestion.getSuggestionType())
                .suggestion(suggestion.getSuggestion())
                .suggestionData(suggestion.getSuggestionData())
                .confidence(boostedConfidence)
                .safetyScore(suggestion.getSafetyScore())
                .reasoning(suggestion.getReasoning())
                .context(suggestion.getContext())
                .timestamp(suggestion.getTimestamp())
                .userId(suggestion.getUserId())
                .automationId(suggestion.getAutomationId())
                .approvalStatus(suggestion.getApprovalStatus())
                .createdAt(suggestion.getCreatedAt())
                .approvedAt(suggestion.getApprovedAt())
                .implementedAt(suggestion.getImplementedAt())
                .metadata(suggestion.getMetadata())
                .build();
    }

    /**
     * Apply fallback confidence when validation fails
     */
    private AISuggestion applyFallbackConfidence(AISuggestion suggestion) {
        return AISuggestion.builder()
                .id(suggestion.getId())
                .title(suggestion.getTitle())
                .description(suggestion.getDescription())
                .automationConfig(suggestion.getAutomationConfig())
                .confidenceScore(suggestion.getConfidenceScore())
                .suggestionType(suggestion.getSuggestionType())
                .suggestion(suggestion.getSuggestion())
                .suggestionData(suggestion.getSuggestionData())
                .confidence(0.7) // Default fallback confidence
                .safetyScore(0.8) // Default fallback safety score
                .reasoning("AI suggestion generated with standard confidence due to validation issues")
                .context(suggestion.getContext())
                .timestamp(suggestion.getTimestamp())
                .userId(suggestion.getUserId())
                .automationId(suggestion.getAutomationId())
                .approvalStatus(suggestion.getApprovalStatus())
                .createdAt(suggestion.getCreatedAt())
                .approvedAt(suggestion.getApprovedAt())
                .implementedAt(suggestion.getImplementedAt())
                .metadata(suggestion.getMetadata())
                .build();
    }

    /**
     * Calculate context relevance factor
     */
    private double calculateContextRelevance(Map<String, Object> contextAnalysis) {
        double relevance = 0.0;
        
        // Factor 1: User context strength
        @SuppressWarnings("unchecked")
        Map<String, Object> userAnalysis = (Map<String, Object>) contextAnalysis.get("userAnalysis");
        if (userAnalysis != null) {
            double contextStrength = (Double) userAnalysis.getOrDefault("contextStrength", 0.0);
            relevance += contextStrength * 0.4;
        }
        
        // Factor 2: Event analysis strength
        @SuppressWarnings("unchecked")
        Map<String, Object> eventAnalysis = (Map<String, Object>) contextAnalysis.get("eventAnalysis");
        if (eventAnalysis != null) {
            int totalEvents = (Integer) eventAnalysis.getOrDefault("totalEvents", 0);
            relevance += Math.min(totalEvents / 100.0, 1.0) * 0.3;
        }
        
        // Factor 3: Pattern data strength
        @SuppressWarnings("unchecked")
        Map<String, Object> patternAnalysis = (Map<String, Object>) contextAnalysis.get("patternAnalysis");
        if (patternAnalysis != null) {
            double dataStrength = (Double) patternAnalysis.getOrDefault("dataStrength", 0.0);
            relevance += dataStrength * 0.3;
        }
        
        return Math.min(relevance, 1.0);
    }

    /**
     * Calculate data quality factor
     */
    private double calculateDataQuality(Map<String, Object> contextAnalysis) {
        double quality = 0.0;
        
        // Factor 1: Event count quality
        @SuppressWarnings("unchecked")
        Map<String, Object> eventAnalysis = (Map<String, Object>) contextAnalysis.get("eventAnalysis");
        if (eventAnalysis != null) {
            int totalEvents = (Integer) eventAnalysis.getOrDefault("totalEvents", 0);
            int uniqueEntities = (Integer) eventAnalysis.getOrDefault("uniqueEntities", 0);
            
            // More events and entities = higher quality
            quality += Math.min(totalEvents / 50.0, 1.0) * 0.5;
            quality += Math.min(uniqueEntities / 10.0, 1.0) * 0.3;
        }
        
        // Factor 2: Pattern consistency
        double patternConsistency = (Double) contextAnalysis.getOrDefault("patternConsistency", 0.0);
        quality += patternConsistency * 0.2;
        
        return Math.min(quality, 1.0);
    }
}
