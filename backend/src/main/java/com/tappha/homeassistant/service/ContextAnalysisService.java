package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for analyzing automation context to provide insights for AI suggestions
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
public class ContextAnalysisService {

    /**
     * Analyze context for patterns and insights
     */
    public Map<String, Object> analyzeContext(AutomationContext context) {
        Map<String, Object> analysis = new HashMap<>();
        
        try {
            log.debug("Analyzing context for {} events", context.getEvents().size());
            
            // 1. Analyze event patterns
            Map<String, Object> eventAnalysis = analyzeEventPatterns(context.getEvents());
            analysis.put("eventAnalysis", eventAnalysis);
            
            // 2. Analyze user context
            Map<String, Object> userAnalysis = analyzeUserContext(context.getUserContext());
            analysis.put("userAnalysis", userAnalysis);
            
            // 3. Analyze pattern data
            Map<String, Object> patternAnalysis = analyzePatternData(context.getPatternData());
            analysis.put("patternAnalysis", patternAnalysis);
            
            // 4. Calculate overall pattern strength
            double patternStrength = calculatePatternStrength(eventAnalysis, userAnalysis, patternAnalysis);
            analysis.put("patternStrength", patternStrength);
            
            // 5. Calculate pattern consistency
            double patternConsistency = calculatePatternConsistency(context.getEvents());
            analysis.put("patternConsistency", patternConsistency);
            
            // 6. Generate insights
            List<String> insights = generateInsights(eventAnalysis, userAnalysis, patternAnalysis);
            analysis.put("insights", insights);
            
            log.debug("Context analysis completed with {} insights", insights.size());
            
        } catch (Exception e) {
            log.error("Failed to analyze context", e);
            analysis.put("error", "Context analysis failed: " + e.getMessage());
        }
        
        return analysis;
    }

    /**
     * Analyze event patterns for automation insights
     */
    private Map<String, Object> analyzeEventPatterns(List<HomeAssistantEvent> events) {
        Map<String, Object> analysis = new HashMap<>();
        
        if (events.isEmpty()) {
            analysis.put("patternStrength", 0.0);
            analysis.put("patterns", new ArrayList<>());
            return analysis;
        }
        
        // Analyze entity usage patterns
        Map<String, Long> entityUsage = events.stream()
                .collect(Collectors.groupingBy(HomeAssistantEvent::getEntityId, Collectors.counting()));
        
        // Find most active entities
        List<Map.Entry<String, Long>> topEntities = entityUsage.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toList());
        
        // Analyze event type patterns
        Map<String, Long> eventTypeUsage = events.stream()
                .collect(Collectors.groupingBy(HomeAssistantEvent::getEventType, Collectors.counting()));
        
        // Calculate pattern strength based on consistency
        double patternStrength = calculateEventPatternStrength(events, entityUsage, eventTypeUsage);
        
        analysis.put("patternStrength", patternStrength);
        analysis.put("topEntities", topEntities);
        analysis.put("eventTypeUsage", eventTypeUsage);
        analysis.put("totalEvents", events.size());
        analysis.put("uniqueEntities", entityUsage.size());
        
        return analysis;
    }

    /**
     * Analyze user context for preferences and requirements
     */
    private Map<String, Object> analyzeUserContext(String userContext) {
        Map<String, Object> analysis = new HashMap<>();
        
        if (userContext == null || userContext.isEmpty()) {
            analysis.put("contextStrength", 0.0);
            analysis.put("preferences", new ArrayList<>());
            return analysis;
        }
        
        // Extract key preferences from user context
        List<String> preferences = extractPreferences(userContext);
        
        // Calculate context strength based on detail level
        double contextStrength = Math.min(userContext.length() / 100.0, 1.0);
        
        analysis.put("contextStrength", contextStrength);
        analysis.put("preferences", preferences);
        analysis.put("contextLength", userContext.length());
        
        return analysis;
    }

    /**
     * Analyze pattern data from previous analysis
     */
    private Map<String, Object> analyzePatternData(Map<String, Object> patternData) {
        Map<String, Object> analysis = new HashMap<>();
        
        if (patternData == null || patternData.isEmpty()) {
            analysis.put("dataStrength", 0.0);
            analysis.put("patterns", new ArrayList<>());
            return analysis;
        }
        
        // Extract pattern information
        List<String> patterns = new ArrayList<>();
        double dataStrength = 0.0;
        
        for (Map.Entry<String, Object> entry : patternData.entrySet()) {
            if (entry.getValue() instanceof Number) {
                dataStrength += ((Number) entry.getValue()).doubleValue();
            } else if (entry.getValue() instanceof String) {
                patterns.add((String) entry.getValue());
            }
        }
        
        // Normalize data strength
        dataStrength = Math.min(dataStrength / patternData.size(), 1.0);
        
        analysis.put("dataStrength", dataStrength);
        analysis.put("patterns", patterns);
        analysis.put("patternCount", patternData.size());
        
        return analysis;
    }

    /**
     * Calculate overall pattern strength
     */
    private double calculatePatternStrength(Map<String, Object> eventAnalysis, 
                                         Map<String, Object> userAnalysis, 
                                         Map<String, Object> patternAnalysis) {
        
        double eventStrength = (Double) eventAnalysis.getOrDefault("patternStrength", 0.0);
        double userStrength = (Double) userAnalysis.getOrDefault("contextStrength", 0.0);
        double dataStrength = (Double) patternAnalysis.getOrDefault("dataStrength", 0.0);
        
        // Weighted combination
        return (eventStrength * 0.5 + userStrength * 0.3 + dataStrength * 0.2);
    }

    /**
     * Calculate pattern consistency across events
     */
    private double calculatePatternConsistency(List<HomeAssistantEvent> events) {
        if (events.size() < 2) {
            return 0.0;
        }
        
        // Group events by entity and time window
        Map<String, List<HomeAssistantEvent>> entityEvents = events.stream()
                .collect(Collectors.groupingBy(HomeAssistantEvent::getEntityId));
        
        double totalConsistency = 0.0;
        int entityCount = 0;
        
        for (List<HomeAssistantEvent> entityEventList : entityEvents.values()) {
            if (entityEventList.size() > 1) {
                double entityConsistency = calculateEntityConsistency(entityEventList);
                totalConsistency += entityConsistency;
                entityCount++;
            }
        }
        
        return entityCount > 0 ? totalConsistency / entityCount : 0.0;
    }

    /**
     * Calculate consistency for a specific entity
     */
    private double calculateEntityConsistency(List<HomeAssistantEvent> entityEvents) {
        if (entityEvents.size() < 2) {
            return 0.0;
        }
        
        // Sort by timestamp
        entityEvents.sort(Comparator.comparing(HomeAssistantEvent::getTimestamp));
        
        // Calculate time intervals between events
        List<Long> intervals = new ArrayList<>();
        for (int i = 1; i < entityEvents.size(); i++) {
            long interval = entityEvents.get(i).getTimestamp().toEpochSecond() - 
                          entityEvents.get(i - 1).getTimestamp().toEpochSecond();
            intervals.add(interval);
        }
        
        if (intervals.isEmpty()) {
            return 0.0;
        }
        
        // Calculate standard deviation of intervals
        double mean = intervals.stream().mapToLong(Long::longValue).average().orElse(0.0);
        double variance = intervals.stream()
                .mapToDouble(interval -> Math.pow(interval - mean, 2))
                .average()
                .orElse(0.0);
        double stdDev = Math.sqrt(variance);
        
        // Lower standard deviation = higher consistency
        double consistency = Math.max(0.0, 1.0 - (stdDev / mean));
        
        return Math.min(consistency, 1.0);
    }

    /**
     * Calculate event pattern strength
     */
    private double calculateEventPatternStrength(List<HomeAssistantEvent> events,
                                              Map<String, Long> entityUsage,
                                              Map<String, Long> eventTypeUsage) {
        
        if (events.isEmpty()) {
            return 0.0;
        }
        
        // Factor 1: Event frequency (more events = stronger patterns)
        double eventFrequency = Math.min(events.size() / 50.0, 1.0);
        
        // Factor 2: Entity diversity (more diverse = stronger patterns)
        double entityDiversity = Math.min(entityUsage.size() / 10.0, 1.0);
        
        // Factor 3: Event type consistency (consistent types = stronger patterns)
        double eventTypeConsistency = calculateEventTypeConsistency(eventTypeUsage);
        
        // Weighted combination
        return (eventFrequency * 0.4 + entityDiversity * 0.3 + eventTypeConsistency * 0.3);
    }

    /**
     * Calculate event type consistency
     */
    private double calculateEventTypeConsistency(Map<String, Long> eventTypeUsage) {
        if (eventTypeUsage.isEmpty()) {
            return 0.0;
        }
        
        long totalEvents = eventTypeUsage.values().stream().mapToLong(Long::longValue).sum();
        long maxEvents = eventTypeUsage.values().stream().mapToLong(Long::longValue).max().orElse(0L);
        
        // Higher consistency when one event type dominates
        return totalEvents > 0 ? (double) maxEvents / totalEvents : 0.0;
    }

    /**
     * Extract preferences from user context
     */
    private List<String> extractPreferences(String userContext) {
        List<String> preferences = new ArrayList<>();
        
        // Simple keyword extraction
        String[] keywords = {"safety", "efficiency", "energy", "comfort", "security", "automation", "manual"};
        
        for (String keyword : keywords) {
            if (userContext.toLowerCase().contains(keyword)) {
                preferences.add(keyword);
            }
        }
        
        return preferences;
    }

    /**
     * Generate insights from analysis
     */
    private List<String> generateInsights(Map<String, Object> eventAnalysis,
                                        Map<String, Object> userAnalysis,
                                        Map<String, Object> patternAnalysis) {
        
        List<String> insights = new ArrayList<>();
        
        // Event-based insights
        @SuppressWarnings("unchecked")
        List<Map.Entry<String, Long>> topEntities = (List<Map.Entry<String, Long>>) eventAnalysis.get("topEntities");
        if (topEntities != null && !topEntities.isEmpty()) {
            insights.add("Most active entity: " + topEntities.get(0).getKey());
        }
        
        // User preference insights
        @SuppressWarnings("unchecked")
        List<String> preferences = (List<String>) userAnalysis.get("preferences");
        if (preferences != null && !preferences.isEmpty()) {
            insights.add("User preferences: " + String.join(", ", preferences));
        }
        
        // Pattern insights
        double patternStrength = (Double) eventAnalysis.getOrDefault("patternStrength", 0.0);
        if (patternStrength > 0.7) {
            insights.add("Strong usage patterns detected");
        } else if (patternStrength > 0.4) {
            insights.add("Moderate usage patterns detected");
        } else {
            insights.add("Limited usage patterns detected");
        }
        
        return insights;
    }
}
