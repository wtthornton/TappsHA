package com.tappha.homeassistant.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import com.tappha.homeassistant.dto.BehavioralAnalysisRequest;
import com.tappha.homeassistant.dto.BehavioralAnalysisResponse;
import com.tappha.homeassistant.dto.BehavioralPattern;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Behavioral Analysis Service for Intelligence Engine
 * 
 * Handles behavioral pattern analysis with privacy-preserving techniques
 * and GPT-4o Mini integration for the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BehavioralAnalysisService {

    private final OpenAiService openAiService;
    private final HomeAssistantEventRepository eventRepository;

    @Value("${openai.model.behavioral:gpt-4o-mini}")
    private String behavioralModel;

    @Value("${openai.max-tokens.behavioral:1500}")
    private Integer maxTokens;

    @Value("${openai.temperature.behavioral:0.3}")
    private Double temperature;

    @Value("${openai.model.behavioral.gpt4o-mini:gpt-4o-mini}")
    private String gpt4oMiniModel;

    @Value("${openai.model.behavioral.gpt4o:gpt-4o}")
    private String gpt4oModel;

    private static final String BEHAVIORAL_SYSTEM_PROMPT = """
        You are an AI assistant for behavioral pattern analysis in Home Assistant. Your role is to:
        1. Analyze Home Assistant events to identify behavioral patterns
        2. Detect anomalies and unusual behavior
        3. Provide privacy-preserving analysis
        4. Generate insights that respect user privacy and security
        
        Always prioritize user privacy and data protection. Never reveal sensitive information
        or create patterns that could compromise user security.
        
        Focus on:
        - Daily routines and patterns
        - Weekly and monthly trends
        - Anomaly detection
        - Privacy-preserving insights
        - Actionable recommendations
        """;

    /**
     * Perform behavioral analysis based on request parameters
     */
    public BehavioralAnalysisResponse analyzeBehavior(BehavioralAnalysisRequest request) {
        long startTime = System.currentTimeMillis();
        
        try {
            log.debug("Starting behavioral analysis for user: {}, connection: {}", 
                    request.getUserId(), request.getConnectionId());
            
            // Validate and set defaults
            validateAndSetDefaults(request);
            
            // Retrieve events for analysis
            List<HomeAssistantEvent> events = retrieveEventsForAnalysis(request);
            
            if (events.isEmpty()) {
                log.warn("No events found for behavioral analysis");
                return createEmptyResponse(request);
            }
            
            // Apply privacy-preserving techniques
            List<HomeAssistantEvent> processedEvents = applyPrivacyPreservingTechniques(events, request);
            
            // Perform pattern analysis
            List<BehavioralPattern> patterns = analyzePatterns(processedEvents, request);
            
            // Detect anomalies
            List<BehavioralPattern> anomalies = detectAnomalies(processedEvents, request);
            
            // Perform frequency analysis
            Map<String, Object> frequencyAnalysis = performFrequencyAnalysis(processedEvents);
            
            // Perform trend analysis
            Map<String, Object> trendAnalysis = performTrendAnalysis(processedEvents);
            
            // Calculate quality metrics
            Map<String, Object> qualityMetrics = calculateQualityMetrics(patterns, anomalies);
            
            long processingTime = System.currentTimeMillis() - startTime;
            
            return BehavioralAnalysisResponse.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(request.getUserId())
                    .connectionId(request.getConnectionId())
                    .analysisType(request.getAnalysisType())
                    .analysisStartTime(request.getStartTime())
                    .analysisEndTime(request.getEndTime())
                    .processingTimeMs(processingTime)
                    .patterns(patterns)
                    .anomalies(anomalies)
                    .frequencyAnalysis(frequencyAnalysis)
                    .trendAnalysis(trendAnalysis)
                    .isPrivacyPreserving(request.getEnablePrivacyPreserving())
                    .privacyLevel(request.getPrivacyLevel())
                    .dataAnonymized(request.getAnonymizeData())
                    .overallConfidence(calculateOverallConfidence(patterns))
                    .totalPatternsFound(patterns.size())
                    .totalAnomaliesFound(anomalies.size())
                    .qualityMetrics(qualityMetrics)
                    .aiModelUsed(request.getAiModel())
                    .createdAt(OffsetDateTime.now())
                    .expiresAt(OffsetDateTime.now().plusDays(30)) // Patterns expire after 30 days
                    .build();
                    
        } catch (Exception e) {
            log.error("Error performing behavioral analysis", e);
            throw new RuntimeException("Failed to perform behavioral analysis", e);
        }
    }

    /**
     * Validate request and set default values
     */
    private void validateAndSetDefaults(BehavioralAnalysisRequest request) {
        if (request.getEnablePrivacyPreserving() == null) {
            request.setEnablePrivacyPreserving(true);
        }
        if (request.getPrivacyLevel() == null) {
            request.setPrivacyLevel("high");
        }
        if (request.getAnonymizeData() == null) {
            request.setAnonymizeData(true);
        }
        if (request.getMinConfidenceThreshold() == null) {
            request.setMinConfidenceThreshold(70);
        }
        if (request.getMaxPatternsToReturn() == null) {
            request.setMaxPatternsToReturn(10);
        }
        if (request.getIncludeAnomalies() == null) {
            request.setIncludeAnomalies(true);
        }
        if (request.getIncludeFrequencyAnalysis() == null) {
            request.setIncludeFrequencyAnalysis(true);
        }
        if (request.getAiModel() == null) {
            request.setAiModel(behavioralModel);
        }
        if (request.getTemperature() == null) {
            request.setTemperature(temperature);
        }
        if (request.getMaxTokens() == null) {
            request.setMaxTokens(maxTokens);
        }
    }

    /**
     * Retrieve events for analysis based on request parameters
     */
    private List<HomeAssistantEvent> retrieveEventsForAnalysis(BehavioralAnalysisRequest request) {
        // This would be implemented with actual repository queries
        // For now, return empty list as placeholder
        log.debug("Retrieving events for analysis from {} to {}", 
                request.getStartTime(), request.getEndTime());
        return new ArrayList<>();
    }

    /**
     * Apply enhanced privacy-preserving techniques to events
     */
    private List<HomeAssistantEvent> applyPrivacyPreservingTechniques(
            List<HomeAssistantEvent> events, BehavioralAnalysisRequest request) {
        
        if (!request.getEnablePrivacyPreserving()) {
            return events;
        }
        
        log.debug("Applying enhanced privacy-preserving techniques to {} events", events.size());
        
        // Apply multiple layers of privacy protection
        List<HomeAssistantEvent> processedEvents = events.stream()
                .map(event -> anonymizeEvent(event, request.getPrivacyLevel()))
                .collect(Collectors.toList());
        
        // Apply differential privacy if enabled
        if (request.getAnonymizeData()) {
            processedEvents = applyDifferentialPrivacy(processedEvents, request.getPrivacyLevel());
        }
        
        // Apply data minimization
        processedEvents = applyDataMinimization(processedEvents, request.getPrivacyLevel());
        
        // Apply temporal anonymization
        processedEvents = applyTemporalAnonymization(processedEvents, request.getPrivacyLevel());
        
        return processedEvents;
    }

    /**
     * Apply differential privacy techniques to events
     */
    private List<HomeAssistantEvent> applyDifferentialPrivacy(
            List<HomeAssistantEvent> events, String privacyLevel) {
        
        log.debug("Applying differential privacy with level: {}", privacyLevel);
        
        return events.stream()
                .map(event -> {
                    HomeAssistantEvent anonymized = new HomeAssistantEvent();
                    anonymized.setId(event.getId());
                    anonymized.setConnection(event.getConnection());
                    anonymized.setTimestamp(event.getTimestamp());
                    anonymized.setCreatedAt(event.getCreatedAt());
                    
                    // Add noise to timestamps for differential privacy
                    if ("high".equals(privacyLevel)) {
                        // Add random noise to timestamps (±30 minutes)
                        long noiseMinutes = (long) (Math.random() * 60 - 30);
                        anonymized.setTimestamp(event.getTimestamp().plusMinutes(noiseMinutes));
                    }
                    
                    // Anonymize entity IDs with differential privacy
                    String anonymizedEntityId = anonymizeEntityWithNoise(event.getEntityId(), privacyLevel);
                    anonymized.setEntityId(anonymizedEntityId);
                    
                    // Anonymize states with noise
                    anonymized.setOldState(anonymizeStateWithNoise(event.getOldState(), privacyLevel));
                    anonymized.setNewState(anonymizeStateWithNoise(event.getNewState(), privacyLevel));
                    
                    return anonymized;
                })
                .collect(Collectors.toList());
    }

    /**
     * Apply data minimization techniques
     */
    private List<HomeAssistantEvent> applyDataMinimization(
            List<HomeAssistantEvent> events, String privacyLevel) {
        
        log.debug("Applying data minimization with level: {}", privacyLevel);
        
        return events.stream()
                .map(event -> {
                    HomeAssistantEvent minimized = new HomeAssistantEvent();
                    minimized.setId(event.getId());
                    minimized.setConnection(event.getConnection());
                    minimized.setTimestamp(event.getTimestamp());
                    minimized.setCreatedAt(event.getCreatedAt());
                    
                    switch (privacyLevel.toLowerCase()) {
                        case "high":
                            // Minimal data retention
                            minimized.setEventType("state_changed");
                            minimized.setEntityId("entity_" + Math.abs(event.getEntityId().hashCode()));
                            minimized.setOldState("unknown");
                            minimized.setNewState("unknown");
                            break;
                        case "medium":
                            // Moderate data retention
                            minimized.setEventType(event.getEventType());
                            minimized.setEntityId("entity_" + Math.abs(event.getEntityId().hashCode()));
                            minimized.setOldState(event.getOldState());
                            minimized.setNewState(event.getNewState());
                            break;
                        case "low":
                            // Full data retention
                            minimized.setEventType(event.getEventType());
                            minimized.setEntityId(event.getEntityId());
                            minimized.setOldState(event.getOldState());
                            minimized.setNewState(event.getNewState());
                            break;
                        default:
                            // Default to high privacy
                            minimized.setEventType("state_changed");
                            minimized.setEntityId("entity_" + Math.abs(event.getEntityId().hashCode()));
                            minimized.setOldState("unknown");
                            minimized.setNewState("unknown");
                    }
                    
                    return minimized;
                })
                .collect(Collectors.toList());
    }

    /**
     * Apply temporal anonymization techniques
     */
    private List<HomeAssistantEvent> applyTemporalAnonymization(
            List<HomeAssistantEvent> events, String privacyLevel) {
        
        log.debug("Applying temporal anonymization with level: {}", privacyLevel);
        
        return events.stream()
                .map(event -> {
                    HomeAssistantEvent temporalAnonymized = new HomeAssistantEvent();
                    temporalAnonymized.setId(event.getId());
                    temporalAnonymized.setConnection(event.getConnection());
                    temporalAnonymized.setCreatedAt(event.getCreatedAt());
                    
                    // Apply temporal anonymization based on privacy level
                    switch (privacyLevel.toLowerCase()) {
                        case "high":
                            // Round to nearest hour
                            temporalAnonymized.setTimestamp(
                                    event.getTimestamp().withMinute(0).withSecond(0).withNano(0));
                            break;
                        case "medium":
                            // Round to nearest 15 minutes
                            int minute = event.getTimestamp().getMinute();
                            int roundedMinute = (minute / 15) * 15;
                            temporalAnonymized.setTimestamp(
                                    event.getTimestamp().withMinute(roundedMinute).withSecond(0).withNano(0));
                            break;
                        case "low":
                            // Round to nearest minute
                            temporalAnonymized.setTimestamp(
                                    event.getTimestamp().withSecond(0).withNano(0));
                            break;
                        default:
                            // Default to high privacy
                            temporalAnonymized.setTimestamp(
                                    event.getTimestamp().withMinute(0).withSecond(0).withNano(0));
                    }
                    
                    // Copy other fields
                    temporalAnonymized.setEventType(event.getEventType());
                    temporalAnonymized.setEntityId(event.getEntityId());
                    temporalAnonymized.setOldState(event.getOldState());
                    temporalAnonymized.setNewState(event.getNewState());
                    
                    return temporalAnonymized;
                })
                .collect(Collectors.toList());
    }

    /**
     * Anonymize entity ID with noise for differential privacy
     */
    private String anonymizeEntityWithNoise(String entityId, String privacyLevel) {
        if (entityId == null) {
            return "unknown_entity";
        }
        
        // Add noise to entity ID hash
        int baseHash = Math.abs(entityId.hashCode());
        int noise = 0;
        
        switch (privacyLevel.toLowerCase()) {
            case "high":
                noise = (int) (Math.random() * 1000); // High noise
                break;
            case "medium":
                noise = (int) (Math.random() * 100); // Medium noise
                break;
            case "low":
                noise = (int) (Math.random() * 10); // Low noise
                break;
        }
        
        return "entity_" + (baseHash + noise);
    }

    /**
     * Anonymize state with noise for differential privacy
     */
    private String anonymizeStateWithNoise(String state, String privacyLevel) {
        if (state == null) {
            return "unknown";
        }
        
        // Add noise to state values
        switch (privacyLevel.toLowerCase()) {
            case "high":
                // High privacy: return generic state
                if (state.toLowerCase().contains("on")) {
                    return "active";
                } else if (state.toLowerCase().contains("off")) {
                    return "inactive";
                } else {
                    return "unknown";
                }
            case "medium":
                // Medium privacy: add noise to state
                if (Math.random() < 0.1) { // 10% chance to add noise
                    return state + "_noise";
                }
                return state;
            case "low":
                // Low privacy: minimal noise
                return state;
            default:
                return "unknown";
        }
    }

    /**
     * Anonymize event data based on privacy level
     */
    private HomeAssistantEvent anonymizeEvent(HomeAssistantEvent event, String privacyLevel) {
        HomeAssistantEvent anonymized = new HomeAssistantEvent();
        anonymized.setId(event.getId());
        anonymized.setConnection(event.getConnection());
        anonymized.setTimestamp(event.getTimestamp());
        anonymized.setCreatedAt(event.getCreatedAt());
        
        switch (privacyLevel.toLowerCase()) {
            case "high":
                // High privacy: minimal data retention
                anonymized.setEventType("state_changed");
                anonymized.setEntityId("entity_" + Math.abs(event.getEntityId().hashCode()));
                anonymized.setOldState("unknown");
                anonymized.setNewState("unknown");
                break;
            case "medium":
                // Medium privacy: retain some context
                anonymized.setEventType(event.getEventType());
                anonymized.setEntityId("entity_" + Math.abs(event.getEntityId().hashCode()));
                anonymized.setOldState(event.getOldState());
                anonymized.setNewState(event.getNewState());
                break;
            case "low":
                // Low privacy: retain most data
                anonymized.setEventType(event.getEventType());
                anonymized.setEntityId(event.getEntityId());
                anonymized.setOldState(event.getOldState());
                anonymized.setNewState(event.getNewState());
                break;
            default:
                // Default to high privacy
                anonymized.setEventType("state_changed");
                anonymized.setEntityId("entity_" + Math.abs(event.getEntityId().hashCode()));
                anonymized.setOldState("unknown");
                anonymized.setNewState("unknown");
        }
        
        return anonymized;
    }

    /**
     * Analyze patterns using GPT-4o Mini with enhanced integration
     */
    private List<BehavioralPattern> analyzePatterns(
            List<HomeAssistantEvent> events, BehavioralAnalysisRequest request) {
        
        try {
            log.debug("Analyzing patterns using GPT-4o Mini for {} events", events.size());
            
            // Create context from events
            String eventContext = createBehavioralContext(events);
            
            // Create prompt for pattern analysis
            String prompt = buildPatternAnalysisPrompt(eventContext, request);
            
            // Determine the best model to use based on request and data size
            String modelToUse = determineOptimalModel(request, events.size());
            
            // Generate AI response with enhanced GPT-4o Mini integration
            ChatCompletionRequest aiRequest = ChatCompletionRequest.builder()
                    .model(modelToUse)
                    .messages(List.of(
                            new ChatMessage("system", BEHAVIORAL_SYSTEM_PROMPT),
                            new ChatMessage("user", prompt)
                    ))
                    .maxTokens(calculateOptimalTokens(request, events.size()))
                    .temperature(calculateOptimalTemperature(request, events.size()))
                    .build();
            
            var response = openAiService.createChatCompletion(aiRequest);
            String analysis = response.getChoices().get(0).getMessage().getContent();
            
            // Parse patterns from AI response with enhanced parsing
            return parsePatternsFromResponse(analysis, events, request);
            
        } catch (Exception e) {
            log.error("Error analyzing patterns with GPT-4o Mini", e);
            return new ArrayList<>();
        }
    }

    /**
     * Determine the optimal model based on request parameters and data size
     */
    private String determineOptimalModel(BehavioralAnalysisRequest request, int eventCount) {
        // Use GPT-4o Mini for most cases (cost-effective)
        if (request.getAiModel() != null && request.getAiModel().equals(gpt4oModel)) {
            return gpt4oModel;
        }
        
        // Use GPT-4o Mini for smaller datasets or privacy-focused analysis
        if (eventCount < 100 || "high".equals(request.getPrivacyLevel())) {
            return gpt4oMiniModel;
        }
        
        // Use GPT-4o for complex analysis with large datasets
        if (eventCount > 500 && "comprehensive".equals(request.getAnalysisType())) {
            return gpt4oModel;
        }
        
        // Default to GPT-4o Mini for cost efficiency
        return gpt4oMiniModel;
    }

    /**
     * Calculate optimal token count based on request and data size
     */
    private Integer calculateOptimalTokens(BehavioralAnalysisRequest request, int eventCount) {
        if (request.getMaxTokens() != null) {
            return request.getMaxTokens();
        }
        
        // Adjust tokens based on data size and analysis type
        if (eventCount < 50) {
            return 800; // Smaller response for small datasets
        } else if (eventCount < 200) {
            return 1200; // Medium response for medium datasets
        } else {
            return 1500; // Larger response for large datasets
        }
    }

    /**
     * Calculate optimal temperature based on request and analysis type
     */
    private Double calculateOptimalTemperature(BehavioralAnalysisRequest request, int eventCount) {
        if (request.getTemperature() != null) {
            return request.getTemperature();
        }
        
        // Lower temperature for more focused analysis
        if ("privacy-focused".equals(request.getAnalysisType()) || "high".equals(request.getPrivacyLevel())) {
            return 0.2;
        }
        
        // Higher temperature for creative pattern discovery
        if ("comprehensive".equals(request.getAnalysisType()) || eventCount > 300) {
            return 0.4;
        }
        
        // Default temperature for balanced analysis
        return 0.3;
    }

    /**
     * Create behavioral context from events
     */
    private String createBehavioralContext(List<HomeAssistantEvent> events) {
        return events.stream()
                .map(event -> String.format("Time: %s, Entity: %s, Event: %s, State: %s -> %s", 
                        event.getTimestamp(),
                        event.getEntityId(),
                        event.getEventType(),
                        event.getOldState(),
                        event.getNewState()))
                .collect(Collectors.joining("\n"));
    }

    /**
     * Build prompt for pattern analysis
     */
    private String buildPatternAnalysisPrompt(String eventContext, BehavioralAnalysisRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Analyze the following Home Assistant events for behavioral patterns:\n\n");
        prompt.append(eventContext).append("\n\n");
        
        prompt.append("Please identify:\n");
        prompt.append("1. Daily routines and patterns\n");
        prompt.append("2. Weekly and monthly trends\n");
        prompt.append("3. Seasonal patterns\n");
        prompt.append("4. Privacy-preserving insights\n");
        prompt.append("5. Actionable recommendations\n\n");
        
        prompt.append("Analysis parameters:\n");
        prompt.append("- Privacy level: ").append(request.getPrivacyLevel()).append("\n");
        prompt.append("- Confidence threshold: ").append(request.getMinConfidenceThreshold()).append("%\n");
        prompt.append("- Max patterns: ").append(request.getMaxPatternsToReturn()).append("\n");
        
        prompt.append("\nProvide your analysis in a structured format that can be parsed programmatically.");
        
        return prompt.toString();
    }

    /**
     * Parse patterns from AI response with enhanced GPT-4o Mini integration
     */
    private List<BehavioralPattern> parsePatternsFromResponse(
            String analysis, List<HomeAssistantEvent> events, BehavioralAnalysisRequest request) {
        
        List<BehavioralPattern> patterns = new ArrayList<>();
        
        try {
            log.debug("Parsing patterns from GPT-4o Mini response: {} characters", analysis.length());
            
            // Enhanced pattern parsing for GPT-4o Mini responses
            String[] lines = analysis.split("\n");
            String currentPattern = null;
            String currentDescription = null;
            String currentReasoning = null;
            
            for (String line : lines) {
                String trimmedLine = line.trim();
                
                // Look for pattern indicators
                if (trimmedLine.toLowerCase().contains("pattern:") || 
                    trimmedLine.toLowerCase().contains("behavior:") ||
                    trimmedLine.toLowerCase().contains("routine:")) {
                    
                    // Save previous pattern if exists
                    if (currentPattern != null) {
                        patterns.add(createEnhancedPatternFromText(
                                currentPattern, currentDescription, currentReasoning, events, request));
                    }
                    
                    // Extract new pattern
                    currentPattern = extractPatternName(trimmedLine);
                    currentDescription = "";
                    currentReasoning = "";
                    
                } else if (trimmedLine.toLowerCase().contains("description:") && currentPattern != null) {
                    currentDescription = extractDescription(trimmedLine);
                    
                } else if (trimmedLine.toLowerCase().contains("reasoning:") && currentPattern != null) {
                    currentReasoning = extractReasoning(trimmedLine);
                    
                } else if (trimmedLine.toLowerCase().contains("confidence:") && currentPattern != null) {
                    // Extract confidence if provided
                    double confidence = extractConfidence(trimmedLine);
                    if (confidence > 0) {
                        // Update the last pattern's confidence
                        if (!patterns.isEmpty()) {
                            patterns.get(patterns.size() - 1).setConfidence(confidence);
                        }
                    }
                }
            }
            
            // Add the last pattern
            if (currentPattern != null) {
                patterns.add(createEnhancedPatternFromText(
                        currentPattern, currentDescription, currentReasoning, events, request));
            }
            
            log.debug("Parsed {} patterns from GPT-4o Mini response", patterns.size());
            
        } catch (Exception e) {
            log.error("Error parsing patterns from GPT-4o Mini response", e);
        }
        
        return patterns.stream()
                .filter(pattern -> pattern.getConfidence() >= request.getMinConfidenceThreshold() / 100.0)
                .limit(request.getMaxPatternsToReturn())
                .collect(Collectors.toList());
    }

    /**
     * Extract pattern name from line
     */
    private String extractPatternName(String line) {
        if (line.contains(":")) {
            return line.substring(line.indexOf(":") + 1).trim();
        }
        return line.trim();
    }

    /**
     * Extract description from line
     */
    private String extractDescription(String line) {
        if (line.contains(":")) {
            return line.substring(line.indexOf(":") + 1).trim();
        }
        return line.trim();
    }

    /**
     * Extract reasoning from line
     */
    private String extractReasoning(String line) {
        if (line.contains(":")) {
            return line.substring(line.indexOf(":") + 1).trim();
        }
        return line.trim();
    }

    /**
     * Extract confidence from line
     */
    private double extractConfidence(String line) {
        try {
            if (line.contains(":")) {
                String confidenceStr = line.substring(line.indexOf(":") + 1).trim();
                // Remove percentage sign if present
                confidenceStr = confidenceStr.replace("%", "").trim();
                return Double.parseDouble(confidenceStr) / 100.0;
            }
        } catch (NumberFormatException e) {
            log.debug("Could not parse confidence from line: {}", line);
        }
        return 0.0;
    }

    /**
     * Create enhanced pattern from text with GPT-4o Mini insights
     */
    private BehavioralPattern createEnhancedPatternFromText(
            String patternText, String description, String reasoning, 
            List<HomeAssistantEvent> events, BehavioralAnalysisRequest request) {
        
        return BehavioralPattern.builder()
                .id(UUID.randomUUID().toString())
                .patternType(determinePatternType(patternText))
                .patternName(patternText)
                .description(description != null ? description : "Pattern detected by GPT-4o Mini analysis")
                .confidence(calculateEnhancedConfidence(patternText, events, request))
                .privacyScore(calculatePrivacyScore(patternText, request.getPrivacyLevel()))
                .reasoning(reasoning != null ? reasoning : "GPT-4o Mini behavioral analysis")
                .context("Enhanced behavioral analysis using GPT-4o Mini")
                .timestamp(System.currentTimeMillis())
                .userId(request.getUserId())
                .connectionId(request.getConnectionId())
                .entities(extractEntities(patternText))
                .timeRanges(extractTimeRanges(patternText))
                .isPrivacyPreserving(request.getEnablePrivacyPreserving())
                .privacyLevel(request.getPrivacyLevel())
                .createdAt(OffsetDateTime.now())
                .lastUpdated(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusDays(30))
                .build();
    }

    /**
     * Calculate enhanced confidence with GPT-4o Mini insights
     */
    private Double calculateEnhancedConfidence(String patternText, List<HomeAssistantEvent> events, 
                                             BehavioralAnalysisRequest request) {
        // Base confidence calculation
        double baseConfidence = calculatePatternConfidence(patternText, events);
        
        // Enhance confidence based on GPT-4o Mini model characteristics
        if (request.getAiModel() != null && request.getAiModel().contains("gpt-4o-mini")) {
            // GPT-4o Mini tends to be more conservative, so we adjust confidence
            baseConfidence = Math.min(baseConfidence * 1.1, 1.0);
        }
        
        // Adjust based on pattern complexity
        if (patternText.length() > 100) {
            baseConfidence = Math.min(baseConfidence * 1.05, 1.0);
        }
        
        return baseConfidence;
    }

    /**
     * Create pattern from parsed text
     */
    private BehavioralPattern createPatternFromText(
            String patternText, String description, List<HomeAssistantEvent> events, 
            BehavioralAnalysisRequest request) {
        
        return BehavioralPattern.builder()
                .id(UUID.randomUUID().toString())
                .patternType(determinePatternType(patternText))
                .patternName(patternText)
                .description(description != null ? description : "Pattern detected from behavioral analysis")
                .confidence(calculatePatternConfidence(patternText, events))
                .privacyScore(calculatePrivacyScore(patternText, request.getPrivacyLevel()))
                .reasoning("AI-generated pattern analysis")
                .context("Behavioral analysis of Home Assistant events")
                .timestamp(System.currentTimeMillis())
                .userId(request.getUserId())
                .connectionId(request.getConnectionId())
                .entities(extractEntities(patternText))
                .timeRanges(extractTimeRanges(patternText))
                .isPrivacyPreserving(request.getEnablePrivacyPreserving())
                .privacyLevel(request.getPrivacyLevel())
                .createdAt(OffsetDateTime.now())
                .lastUpdated(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusDays(30))
                .build();
    }

    /**
     * Determine pattern type from text
     */
    private String determinePatternType(String patternText) {
        String text = patternText.toLowerCase();
        if (text.contains("daily") || text.contains("routine")) {
            return "daily_routine";
        } else if (text.contains("weekly")) {
            return "weekly_pattern";
        } else if (text.contains("monthly") || text.contains("seasonal")) {
            return "seasonal";
        } else {
            return "custom";
        }
    }

    /**
     * Calculate pattern confidence
     */
    private Double calculatePatternConfidence(String patternText, List<HomeAssistantEvent> events) {
        // Simple confidence calculation based on pattern complexity and event count
        double baseConfidence = 0.7;
        double eventFactor = Math.min(events.size() / 100.0, 0.3);
        double complexityFactor = Math.min(patternText.length() / 200.0, 0.2);
        
        return Math.min(baseConfidence + eventFactor + complexityFactor, 1.0);
    }

    /**
     * Calculate privacy score
     */
    private Double calculatePrivacyScore(String patternText, String privacyLevel) {
        switch (privacyLevel.toLowerCase()) {
            case "high":
                return 0.9;
            case "medium":
                return 0.7;
            case "low":
                return 0.5;
            default:
                return 0.8;
        }
    }

    /**
     * Extract entities from pattern text
     */
    private List<String> extractEntities(String patternText) {
        // Simple entity extraction - in production, this would be more sophisticated
        List<String> entities = new ArrayList<>();
        String[] words = patternText.split("\\s+");
        for (String word : words) {
            if (word.contains(".") && word.contains("_")) {
                entities.add(word);
            }
        }
        return entities;
    }

    /**
     * Extract time ranges from pattern text
     */
    private List<String> extractTimeRanges(String patternText) {
        // Simple time range extraction - in production, this would be more sophisticated
        List<String> timeRanges = new ArrayList<>();
        if (patternText.toLowerCase().contains("morning")) {
            timeRanges.add("06:00-12:00");
        }
        if (patternText.toLowerCase().contains("afternoon")) {
            timeRanges.add("12:00-18:00");
        }
        if (patternText.toLowerCase().contains("evening")) {
            timeRanges.add("18:00-22:00");
        }
        if (patternText.toLowerCase().contains("night")) {
            timeRanges.add("22:00-06:00");
        }
        return timeRanges;
    }

    /**
     * Detect anomalies in events
     */
    private List<BehavioralPattern> detectAnomalies(
            List<HomeAssistantEvent> events, BehavioralAnalysisRequest request) {
        
        if (!request.getIncludeAnomalies()) {
            return new ArrayList<>();
        }
        
        log.debug("Detecting anomalies in {} events", events.size());
        
        List<BehavioralPattern> anomalies = new ArrayList<>();
        
        // Simple anomaly detection - in production, this would use more sophisticated algorithms
        Map<String, Long> entityFrequency = events.stream()
                .collect(Collectors.groupingBy(HomeAssistantEvent::getEntityId, Collectors.counting()));
        
        double avgFrequency = entityFrequency.values().stream()
                .mapToLong(Long::longValue)
                .average()
                .orElse(0.0);
        
        entityFrequency.forEach((entityId, frequency) -> {
            if (frequency > avgFrequency * 2) { // Anomaly: much higher frequency
                anomalies.add(createAnomalyPattern(entityId, "high_frequency", events, request));
            } else if (frequency < avgFrequency * 0.5) { // Anomaly: much lower frequency
                anomalies.add(createAnomalyPattern(entityId, "low_frequency", events, request));
            }
        });
        
        return anomalies;
    }

    /**
     * Create anomaly pattern
     */
    private BehavioralPattern createAnomalyPattern(
            String entityId, String anomalyType, List<HomeAssistantEvent> events, 
            BehavioralAnalysisRequest request) {
        
        return BehavioralPattern.builder()
                .id(UUID.randomUUID().toString())
                .patternType("anomaly")
                .patternName("Anomaly: " + entityId + " - " + anomalyType)
                .description("Detected unusual behavior pattern for entity: " + entityId)
                .confidence(0.8)
                .privacyScore(0.9)
                .reasoning("Statistical anomaly detection")
                .context("Anomaly detection in behavioral analysis")
                .timestamp(System.currentTimeMillis())
                .userId(request.getUserId())
                .connectionId(request.getConnectionId())
                .entities(List.of(entityId))
                .isPrivacyPreserving(request.getEnablePrivacyPreserving())
                .privacyLevel(request.getPrivacyLevel())
                .createdAt(OffsetDateTime.now())
                .lastUpdated(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusDays(7)) // Anomalies expire sooner
                .build();
    }

    /**
     * Perform frequency analysis
     */
    private Map<String, Object> performFrequencyAnalysis(List<HomeAssistantEvent> events) {
        Map<String, Object> frequencyAnalysis = new HashMap<>();
        
        // Entity frequency
        Map<String, Long> entityFrequency = events.stream()
                .collect(Collectors.groupingBy(HomeAssistantEvent::getEntityId, Collectors.counting()));
        frequencyAnalysis.put("entityFrequency", entityFrequency);
        
        // Event type frequency
        Map<String, Long> eventTypeFrequency = events.stream()
                .collect(Collectors.groupingBy(HomeAssistantEvent::getEventType, Collectors.counting()));
        frequencyAnalysis.put("eventTypeFrequency", eventTypeFrequency);
        
        // Time-based frequency (hourly)
        Map<Integer, Long> hourlyFrequency = events.stream()
                .collect(Collectors.groupingBy(
                        event -> event.getTimestamp().getHour(), 
                        Collectors.counting()));
        frequencyAnalysis.put("hourlyFrequency", hourlyFrequency);
        
        return frequencyAnalysis;
    }

    /**
     * Perform trend analysis
     */
    private Map<String, Object> performTrendAnalysis(List<HomeAssistantEvent> events) {
        Map<String, Object> trendAnalysis = new HashMap<>();
        
        // Simple trend analysis - in production, this would be more sophisticated
        if (events.size() > 1) {
            events.sort(Comparator.comparing(HomeAssistantEvent::getTimestamp));
            
            HomeAssistantEvent first = events.get(0);
            HomeAssistantEvent last = events.get(events.size() - 1);
            
            long daysBetween = ChronoUnit.DAYS.between(first.getTimestamp(), last.getTimestamp());
            double eventsPerDay = (double) events.size() / Math.max(daysBetween, 1);
            
            trendAnalysis.put("eventsPerDay", eventsPerDay);
            trendAnalysis.put("totalDays", daysBetween);
            trendAnalysis.put("totalEvents", events.size());
        }
        
        return trendAnalysis;
    }

    /**
     * Calculate quality metrics
     */
    private Map<String, Object> calculateQualityMetrics(
            List<BehavioralPattern> patterns, List<BehavioralPattern> anomalies) {
        
        Map<String, Object> metrics = new HashMap<>();
        
        // Pattern quality metrics
        if (!patterns.isEmpty()) {
            double avgConfidence = patterns.stream()
                    .mapToDouble(BehavioralPattern::getConfidence)
                    .average()
                    .orElse(0.0);
            
            double avgPrivacyScore = patterns.stream()
                    .mapToDouble(BehavioralPattern::getPrivacyScore)
                    .average()
                    .orElse(0.0);
            
            metrics.put("averagePatternConfidence", avgConfidence);
            metrics.put("averagePrivacyScore", avgPrivacyScore);
            metrics.put("patternQualityScore", (avgConfidence + avgPrivacyScore) / 2.0);
        }
        
        // Anomaly quality metrics
        if (!anomalies.isEmpty()) {
            double avgAnomalyConfidence = anomalies.stream()
                    .mapToDouble(BehavioralPattern::getConfidence)
                    .average()
                    .orElse(0.0);
            
            metrics.put("averageAnomalyConfidence", avgAnomalyConfidence);
            metrics.put("anomalyDetectionRate", (double) anomalies.size() / patterns.size());
        }
        
        return metrics;
    }

    /**
     * Calculate overall confidence
     */
    private Double calculateOverallConfidence(List<BehavioralPattern> patterns) {
        if (patterns.isEmpty()) {
            return 0.0;
        }
        
        return patterns.stream()
                .mapToDouble(BehavioralPattern::getConfidence)
                .average()
                .orElse(0.0);
    }

    /**
     * Create empty response when no events found
     */
    private BehavioralAnalysisResponse createEmptyResponse(BehavioralAnalysisRequest request) {
        return BehavioralAnalysisResponse.builder()
                .id(UUID.randomUUID().toString())
                .userId(request.getUserId())
                .connectionId(request.getConnectionId())
                .analysisType(request.getAnalysisType())
                .analysisStartTime(request.getStartTime())
                .analysisEndTime(request.getEndTime())
                .processingTimeMs(0L)
                .patterns(new ArrayList<>())
                .anomalies(new ArrayList<>())
                .frequencyAnalysis(new HashMap<>())
                .trendAnalysis(new HashMap<>())
                .isPrivacyPreserving(request.getEnablePrivacyPreserving())
                .privacyLevel(request.getPrivacyLevel())
                .dataAnonymized(request.getAnonymizeData())
                .overallConfidence(0.0)
                .totalPatternsFound(0)
                .totalAnomaliesFound(0)
                .qualityMetrics(new HashMap<>())
                .aiModelUsed(request.getAiModel())
                .createdAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusDays(30))
                .build();
    }
} 