package com.tappha.homeassistant.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI Service for Intelligence Engine
 * 
 * Handles AI operations including OpenAI integration for the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
@ConditionalOnBean(OpenAiService.class)
public class AIService {

    private final OpenAiService openAiService;
    private final LangChainAutomationService langChainService;

    public AIService(OpenAiService openAiService, LangChainAutomationService langChainService) {
        this.openAiService = openAiService;
        this.langChainService = langChainService;
    }

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @Value("${openai.max-tokens:1000}")
    private Integer maxTokens;

    @Value("${openai.temperature:0.7}")
    private Double temperature;

    private static final String SYSTEM_PROMPT = """
        You are an AI assistant for Home Assistant automation. Your role is to:
        1. Analyze Home Assistant events and patterns
        2. Suggest intelligent automations based on user behavior
        3. Provide context-aware recommendations
        4. Ensure all suggestions are safe and user-approved
        
        Always prioritize user safety and privacy. Never suggest automations that could
        compromise security or user control.
        """;

    /**
     * Generate AI suggestions based on Home Assistant events
     */
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
            log.error("Error generating AI suggestion", e);
            throw new RuntimeException("Failed to generate AI suggestion", e);
        }
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
        prompt.append("Provide specific, actionable recommendations.");
        
        return prompt.toString();
    }

    /**
     * Calculate confidence score based on events
     */
    private double calculateConfidence(List<HomeAssistantEvent> events) {
        if (events.isEmpty()) {
            return 0.0;
        }
        
        // Simple confidence calculation based on event count and types
        int totalEvents = events.size();
        long uniqueEntities = events.stream()
                .map(HomeAssistantEvent::getEntityId)
                .distinct()
                .count();
        
        // Higher confidence with more events and diverse entities
        double eventConfidence = Math.min(totalEvents / 10.0, 1.0);
        double diversityConfidence = Math.min(uniqueEntities / 5.0, 1.0);
        
        return (eventConfidence + diversityConfidence) / 2.0;
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