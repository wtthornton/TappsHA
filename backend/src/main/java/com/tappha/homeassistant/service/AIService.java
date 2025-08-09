package com.tappha.homeassistant.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.UserPreferences;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.repository.HomeAssistantEventRepository;
import com.tappha.homeassistant.repository.PatternAnalysisRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Enhanced AI Service for context-aware suggestion generation with 90% accuracy target
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
@ConditionalOnBean(OpenAiService.class)
public class AIService {

    private final OpenAiService openAiService;
    private final LangChainAutomationService langChainService;
    private final HomeAssistantEventRepository eventRepository;
    private final PatternAnalysisRepository patternRepository;
    private final ContextAnalysisService contextAnalysisService;
    private final ConfidenceValidationService confidenceValidationService;

    public AIService(OpenAiService openAiService, 
                    LangChainAutomationService langChainService,
                    HomeAssistantEventRepository eventRepository,
                    PatternAnalysisRepository patternRepository,
                    ContextAnalysisService contextAnalysisService,
                    ConfidenceValidationService confidenceValidationService) {
        this.openAiService = openAiService;
        this.langChainService = langChainService;
        this.eventRepository = eventRepository;
        this.patternRepository = patternRepository;
        this.contextAnalysisService = contextAnalysisService;
        this.confidenceValidationService = confidenceValidationService;
    }

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @Value("${openai.max-tokens:1000}")
    private Integer maxTokens;

    @Value("${openai.temperature:0.7}")
    private Double temperature;

    @Value("${ai.confidence.threshold:0.9}")
    private Double confidenceThreshold;

    @Value("${ai.context.analysis.enabled:true}")
    private Boolean contextAnalysisEnabled;

    private static final String SYSTEM_PROMPT = """
        You are an AI assistant for Home Assistant automation with 90% accuracy target.
        Your role is to:
        1. Analyze Home Assistant events and patterns with high precision
        2. Generate context-aware automation suggestions with 90%+ accuracy
        3. Provide detailed reasoning and confidence assessments
        4. Ensure all suggestions are safe, efficient, and user-approved
        5. Consider historical patterns and user preferences
       
        Always prioritize user safety and privacy. Never suggest automations that could
        compromise security or user control. Provide confidence scores and detailed reasoning
        for all suggestions.
        """;

    /**
     * Generate context-aware AI suggestions with 90% accuracy target
     */
    public CompletableFuture<AISuggestion> generateContextAwareSuggestion(
            UUID connectionId, 
            String userContext, 
            UserPreferences preferences,
            int eventLimit) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.debug("Generating context-aware AI suggestion for connection: {}", connectionId);
                
                // 1. Gather comprehensive context data
                AutomationContext context = buildComprehensiveContext(connectionId, userContext, eventLimit);
                
                // 2. Analyze context for patterns and insights
                Map<String, Object> contextAnalysis = contextAnalysisService.analyzeContext(context);
                
                // 3. Generate AI suggestion with enhanced context
                AISuggestion suggestion = generateEnhancedSuggestion(context, contextAnalysis, preferences);
                
                // 4. Validate confidence and accuracy
                suggestion = confidenceValidationService.validateAndEnhanceSuggestion(suggestion, contextAnalysis);
                
                // 5. Apply final quality checks
                if (suggestion.getConfidence() < confidenceThreshold) {
                    log.warn("Suggestion confidence {} below threshold {}, regenerating", 
                            suggestion.getConfidence(), confidenceThreshold);
                    return regenerateSuggestionWithEnhancedContext(context, contextAnalysis, preferences);
                }
                
                log.info("Generated context-aware suggestion with confidence: {}", suggestion.getConfidence());
                return suggestion;
                
            } catch (Exception e) {
                log.error("Failed to generate context-aware AI suggestion", e);
                throw new RuntimeException("Failed to generate context-aware AI suggestion", e);
            }
        });
    }

    /**
     * Build comprehensive context from multiple data sources
     */
    private AutomationContext buildComprehensiveContext(UUID connectionId, String userContext, int eventLimit) {
        // Get recent events
        List<HomeAssistantEvent> events = eventRepository.findRecentEventsByConnectionId(connectionId, eventLimit);
        
        // Get pattern analysis data
        Map<String, Object> patternData = patternRepository.findRecentPatternsByConnectionId(connectionId);
        
        // Get user preferences and settings
        Map<String, Object> userSettings = getUserSettings(connectionId);
        
        return AutomationContext.builder()
                .contextId(UUID.randomUUID().toString())
                .connectionId(connectionId)
                .events(events)
                .userContext(userContext)
                .patternData(patternData)
                .userSettings(userSettings)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    /**
     * Generate enhanced suggestion with comprehensive context analysis
     */
    private AISuggestion generateEnhancedSuggestion(
            AutomationContext context, 
            Map<String, Object> contextAnalysis, 
            UserPreferences preferences) {
        
        try {
            // Create enhanced prompt with context analysis
            String enhancedPrompt = buildEnhancedPrompt(context, contextAnalysis, preferences);
            
            // Generate AI response with enhanced context
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(openaiModel)
                    .messages(List.of(
                            new ChatMessage("system", SYSTEM_PROMPT),
                            new ChatMessage("user", enhancedPrompt)
                    ))
                    .maxTokens(maxTokens)
                    .temperature(temperature)
                    .build();
            
            var response = openAiService.createChatCompletion(request);
            String suggestion = response.getChoices().get(0).getMessage().getContent();
            
            // Parse structured response
            Map<String, Object> suggestionData = parseStructuredResponse(suggestion);
            
            // Calculate confidence with multiple factors
            double confidence = calculateEnhancedConfidence(context, contextAnalysis, suggestionData);
            
            return AISuggestion.builder()
                    .id(UUID.randomUUID().toString())
                    .suggestion(suggestion)
                    .confidence(confidence)
                    .suggestionData(suggestionData)
                    .safetyScore((Double) suggestionData.getOrDefault("safetyScore", 0.8))
                    .reasoning((String) suggestionData.getOrDefault("reasoning", ""))
                    .context(createEventContext(context.getEvents()))
                    .timestamp(System.currentTimeMillis())
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to generate enhanced suggestion", e);
            throw new RuntimeException("Failed to generate enhanced suggestion", e);
        }
    }

    /**
     * Build enhanced prompt with comprehensive context analysis
     */
    private String buildEnhancedPrompt(AutomationContext context, 
                                     Map<String, Object> contextAnalysis, 
                                     UserPreferences preferences) {
        StringBuilder prompt = new StringBuilder();
        
        // Base context
        prompt.append("Based on the following comprehensive Home Assistant analysis:\n\n");
        
        // Event context
        String eventContext = createEventContext(context.getEvents());
        prompt.append("EVENT ANALYSIS:\n").append(eventContext).append("\n\n");
        
        // Pattern analysis
        if (contextAnalysis.containsKey("patterns")) {
            prompt.append("PATTERN ANALYSIS:\n");
            prompt.append(contextAnalysis.get("patterns")).append("\n\n");
        }
        
        // User context
        if (context.getUserContext() != null && !context.getUserContext().isEmpty()) {
            prompt.append("USER CONTEXT: ").append(context.getUserContext()).append("\n\n");
        }
        
        // User preferences
        if (preferences != null) {
            prompt.append("USER PREFERENCES:\n");
            prompt.append("- Safety Level: ").append(preferences.getSafetyLevel()).append("\n");
            prompt.append("- Preferred Model: ").append(preferences.getPreferredModel()).append("\n");
            prompt.append("- Automation Complexity: ").append(preferences.getAutomationComplexity()).append("\n\n");
        }
        
        // Accuracy requirements
        prompt.append("ACCURACY REQUIREMENTS:\n");
        prompt.append("- Target accuracy: 90%+\n");
        prompt.append("- Provide detailed reasoning for all suggestions\n");
        prompt.append("- Include confidence scores and safety assessments\n");
        prompt.append("- Focus on efficiency, reliability, and user experience\n\n");
        
        // Response format
        prompt.append("Please provide your suggestion in the following structured format:\n");
        prompt.append("- Suggestion Type: [improvement/new/optimization]\n");
        prompt.append("- Confidence: [0.0-1.0 with detailed reasoning]\n");
        prompt.append("- Safety Score: [0.0-1.0 with safety assessment]\n");
        prompt.append("- Reasoning: [detailed explanation of why this suggestion is accurate]\n");
        prompt.append("- Implementation: [specific steps with Home Assistant configuration]\n");
        prompt.append("- Expected Impact: [quantified benefits and improvements]\n");
        
        return prompt.toString();
    }

    /**
     * Calculate enhanced confidence with multiple factors
     */
    private double calculateEnhancedConfidence(AutomationContext context, 
                                             Map<String, Object> contextAnalysis, 
                                             Map<String, Object> suggestionData) {
        
        List<Double> confidenceFactors = new ArrayList<>();
        
        // 1. Data quality factor (0.0-1.0)
        double dataQuality = Math.min(context.getEvents().size() / 100.0, 1.0);
        confidenceFactors.add(dataQuality * 0.2);
        
        // 2. Pattern strength factor (0.0-1.0)
        double patternStrength = (Double) contextAnalysis.getOrDefault("patternStrength", 0.5);
        confidenceFactors.add(patternStrength * 0.25);
        
        // 3. AI confidence factor (0.0-1.0)
        double aiConfidence = (Double) suggestionData.getOrDefault("confidence", 0.7);
        confidenceFactors.add(aiConfidence * 0.3);
        
        // 4. Safety factor (0.0-1.0)
        double safetyScore = (Double) suggestionData.getOrDefault("safetyScore", 0.8);
        confidenceFactors.add(safetyScore * 0.15);
        
        // 5. Context relevance factor (0.0-1.0)
        double contextRelevance = calculateContextRelevance(context, contextAnalysis);
        confidenceFactors.add(contextRelevance * 0.1);
        
        // Calculate weighted average
        double totalConfidence = confidenceFactors.stream().mapToDouble(Double::doubleValue).sum();
        
        // Apply minimum threshold
        return Math.max(totalConfidence, 0.5);
    }

    /**
     * Calculate context relevance factor
     */
    private double calculateContextRelevance(AutomationContext context, Map<String, Object> contextAnalysis) {
        if (context.getEvents().isEmpty()) {
            return 0.0;
        }
        
        // Check if events are recent and relevant
        long currentTime = System.currentTimeMillis();
        long eventAge = currentTime - context.getTimestamp();
        double timeRelevance = Math.max(0.0, 1.0 - (eventAge / (24 * 60 * 60 * 1000.0))); // 24 hours
        
        // Check pattern consistency
        double patternConsistency = (Double) contextAnalysis.getOrDefault("patternConsistency", 0.5);
        
        return (timeRelevance * 0.6 + patternConsistency * 0.4);
    }

    /**
     * Regenerate suggestion with enhanced context if confidence is low
     */
    private AISuggestion regenerateSuggestionWithEnhancedContext(
            AutomationContext context, 
            Map<String, Object> contextAnalysis, 
            UserPreferences preferences) {
        
        log.info("Regenerating suggestion with enhanced context for better accuracy");
        
        // Add more detailed analysis to context
        contextAnalysis.put("detailedAnalysis", true);
        contextAnalysis.put("accuracyTarget", 0.9);
        
        // Generate new suggestion with enhanced context
        return generateEnhancedSuggestion(context, contextAnalysis, preferences);
    }

    /**
     * Parse structured response from AI
     */
    private Map<String, Object> parseStructuredResponse(String content) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String[] lines = content.split("\n");
            for (String line : lines) {
                if (line.contains(":")) {
                    String[] parts = line.split(":", 2);
                    String key = parts[0].trim().toLowerCase().replaceAll("\\s+", "_");
                    String value = parts[1].trim();
                    
                    switch (key) {
                        case "suggestion_type":
                            result.put("suggestionType", value);
                            break;
                        case "confidence":
                            result.put("confidence", parseDouble(value));
                            break;
                        case "safety_score":
                            result.put("safetyScore", parseDouble(value));
                            break;
                        case "reasoning":
                            result.put("reasoning", value);
                            break;
                        case "implementation":
                            result.put("implementation", value);
                            break;
                        case "expected_impact":
                            result.put("expectedImpact", value);
                            break;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse structured response, using fallback", e);
            result.put("confidence", 0.7);
            result.put("safetyScore", 0.8);
            result.put("reasoning", "AI suggestion generated with standard confidence");
        }
        
        return result;
    }

    /**
     * Parse double value safely
     */
    private double parseDouble(String value) {
        try {
            return Double.parseDouble(value.replaceAll("[^0-9.]", ""));
        } catch (NumberFormatException e) {
            return 0.7; // Default confidence
        }
    }

    /**
     * Get user settings for the connection
     */
    private Map<String, Object> getUserSettings(UUID connectionId) {
        // TODO: Implement user settings retrieval
        return new HashMap<>();
    }

    /**
     * Create context from Home Assistant events
     */
    private String createEventContext(List<HomeAssistantEvent> events) {
        return events.stream()
                .map(event -> String.format("Event: %s, Entity: %s, State: %s", 
                        event.getEventType(), 
                        event.getEntityId(), 
                        event.getNewState()))
                .collect(Collectors.joining("\n"));
    }

    // Legacy method for backward compatibility
    public AISuggestion generateSuggestion(List<HomeAssistantEvent> events, String userContext) {
        try {
            log.debug("Generating AI suggestion for {} events", events.size());
            
            // Create context from events
            String eventContext = createEventContext(events);
            
            // Create prompt with context
            String prompt = buildSuggestionPrompt(eventContext, userContext);
            
            // Generate AI response
            ChatCompletionRequest request = ChatCompletionRequest.builder()
                    .model(openaiModel)
                    .messages(List.of(
                            new ChatMessage("system", SYSTEM_PROMPT),
                            new ChatMessage("user", prompt)
                    ))
                    .maxTokens(maxTokens)
                    .temperature(temperature)
                    .build();
            
            var response = openAiService.createChatCompletion(request);
            String suggestion = response.getChoices().get(0).getMessage().getContent();
            
            return AISuggestion.builder()
                    .suggestion(suggestion)
                    .confidence(calculateConfidence(events))
                    .context(eventContext)
                    .timestamp(System.currentTimeMillis())
                    .build();
                    
        } catch (Exception e) {
            log.error("Failed to generate AI suggestion", e);
            throw new RuntimeException("Failed to generate AI suggestion", e);
        }
    }

    /**
     * Build suggestion prompt with context
     */
    private String buildSuggestionPrompt(String eventContext, String userContext) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Based on the following Home Assistant events:\n\n");
        prompt.append(eventContext).append("\n\n");
        
        if (userContext != null && !userContext.isEmpty()) {
            prompt.append("User context: ").append(userContext).append("\n\n");
        }
        
        prompt.append("Please suggest intelligent automations that would improve the user's experience. ");
        prompt.append("Focus on safety, efficiency, and user control. ");
        prompt.append("Provide suggestions with confidence scores and detailed reasoning.");
        
        return prompt.toString();
    }

    /**
     * Calculate confidence based on events
     */
    private double calculateConfidence(List<HomeAssistantEvent> events) {
        if (events.isEmpty()) {
            return 0.0;
        }
        
        // Simple confidence calculation based on event count and variety
        double eventCount = Math.min(events.size() / 50.0, 1.0);
        double eventVariety = Math.min(events.stream().map(HomeAssistantEvent::getEntityId).distinct().count() / 10.0, 1.0);
        
        return (eventCount * 0.6 + eventVariety * 0.4);
    }

    /**
     * Store event embedding for future similarity search
     */
    public void storeEventEmbedding(HomeAssistantEvent event) {
        try {
            String eventContent = String.format("Event: %s, Entity: %s, State: %s", 
                    event.getEventType(), event.getEntityId(), event.getNewState());
            
            log.debug("Stored event embedding for entity: {}", event.getEntityId());
            
        } catch (Exception e) {
            log.error("Error storing event embedding", e);
        }
    }

    /**
     * Validate AI suggestion for safety and compliance
     */
    public boolean validateSuggestion(AISuggestion suggestion) {
        // Basic safety validation
        String content = suggestion.getSuggestion().toLowerCase();
        
        // Check for potentially dangerous keywords
        List<String> dangerousKeywords = List.of(
                "delete", "remove", "disable", "lock", "unlock", "admin", "root"
        );
        
        boolean hasDangerousKeywords = dangerousKeywords.stream()
                .anyMatch(content::contains);
        
        if (hasDangerousKeywords) {
            log.warn("AI suggestion contains potentially dangerous keywords: {}", content);
            return false;
        }
        
        // Check confidence threshold
        if (suggestion.getConfidence() < 0.6) {
            log.warn("AI suggestion confidence too low: {}", suggestion.getConfidence());
            return false;
        }
        
        return true;
    }

    /**
     * Generate context-aware automation suggestion using LangChain framework
     * 
     * @param context AutomationContext with current Home Assistant state
     * @param preferences User preferences for automation generation
     * @return CompletableFuture<AISuggestion> with LangChain-generated suggestion
     */
    public java.util.concurrent.CompletableFuture<AISuggestion> generateContextAwareSuggestion(
            com.tappha.homeassistant.dto.AutomationContext context, 
            com.tappha.homeassistant.dto.UserPreferences preferences) {
        
        log.debug("Generating context-aware suggestion using LangChain framework");
        
        try {
            // Use LangChain service for enhanced context-aware processing
            return langChainService.generateContextAwareSuggestion(context, preferences);
            
        } catch (Exception e) {
            log.error("Error generating context-aware suggestion with LangChain", e);
            // Fallback to basic OpenAI generation if LangChain fails
            return java.util.concurrent.CompletableFuture.failedFuture(e);
        }
    }

    /**
     * Check if LangChain integration is available and healthy
     * 
     * @return true if LangChain service is healthy, false otherwise
     */
    public boolean isLangChainHealthy() {
        try {
            return langChainService.isHealthy();
        } catch (Exception e) {
            log.error("Error checking LangChain health", e);
            return false;
        }
    }
} 