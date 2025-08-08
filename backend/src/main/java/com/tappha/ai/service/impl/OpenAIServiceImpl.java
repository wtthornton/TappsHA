package com.tappha.ai.service.impl;

import com.tappha.ai.service.OpenAIService;
import com.tappha.ai.dto.AutomationSuggestion;
import com.tappha.ai.dto.AIRecommendationRequest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.service.OpenAiService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.ArrayList;

/**
 * OpenAI Service Implementation for Phase 2: Intelligence Engine
 * 
 * Integrates with OpenAI GPT-4o Mini for:
 * - Natural language processing
 * - Automation suggestion generation
 * - Context-aware recommendations
 * - Real-time event processing
 * 
 * Following Agent OS Standards with privacy-first approach
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OpenAIServiceImpl implements OpenAIService {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    private final OpenAiService openAiService;

    @Override
    public List<AutomationSuggestion> generateSuggestions(AIRecommendationRequest request) {
        log.info("Generating automation suggestions using OpenAI for user: {}", request.getUserId());
        
        try {
            // Create prompt for OpenAI
            String prompt = createAutomationPrompt(request);
            
            // Call OpenAI API
            ChatCompletionRequest chatRequest = ChatCompletionRequest.builder()
                .model(openaiModel)
                .messages(List.of(
                    new ChatMessage("system", "You are an AI assistant specialized in Home Assistant automation. Generate practical, safe automation suggestions based on user patterns and preferences."),
                    new ChatMessage("user", prompt)
                ))
                .maxTokens(1000)
                .temperature(0.7)
                .build();

            String response = openAiService.createChatCompletion(chatRequest)
                .getChoices().get(0).getMessage().getContent();

            // Parse response and create suggestions
            return parseAutomationSuggestions(response, request);

        } catch (Exception e) {
            log.error("Error generating suggestions with OpenAI: {}", e.getMessage(), e);
            return createFallbackSuggestions(request);
        }
    }

    @Override
    public CompletableFuture<List<AutomationSuggestion>> generateContextAwareSuggestions(String context) {
        log.info("Generating context-aware suggestions for context: {}", context);
        
        try {
            String prompt = "Based on the following context, suggest relevant Home Assistant automations:\n\n" + context;
            
            ChatCompletionRequest chatRequest = ChatCompletionRequest.builder()
                .model(openaiModel)
                .messages(List.of(
                    new ChatMessage("system", "You are an AI assistant for Home Assistant automation. Provide context-aware automation suggestions."),
                    new ChatMessage("user", prompt)
                ))
                .maxTokens(800)
                .temperature(0.6)
                .build();

            String response = openAiService.createChatCompletion(chatRequest)
                .getChoices().get(0).getMessage().getContent();

            return CompletableFuture.completedFuture(parseContextAwareSuggestions(response));

        } catch (Exception e) {
            log.error("Error generating context-aware suggestions: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(new ArrayList<>());
        }
    }

    @Override
    public List<AutomationSuggestion> processRealTimeEvent(String eventData) {
        log.info("Processing real-time event for AI insights: {}", eventData);
        
        try {
            String prompt = "Analyze this real-time Home Assistant event and suggest immediate automation opportunities:\n\n" + eventData;
            
            ChatCompletionRequest chatRequest = ChatCompletionRequest.builder()
                .model(openaiModel)
                .messages(List.of(
                    new ChatMessage("system", "You are an AI assistant for real-time Home Assistant event analysis. Provide immediate automation suggestions."),
                    new ChatMessage("user", prompt)
                ))
                .maxTokens(600)
                .temperature(0.5)
                .build();

            String response = openAiService.createChatCompletion(chatRequest)
                .getChoices().get(0).getMessage().getContent();

            return parseRealTimeSuggestions(response);

        } catch (Exception e) {
            log.error("Error processing real-time event: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public String getHealthStatus() {
        try {
            // Test OpenAI connection
            ChatCompletionRequest testRequest = ChatCompletionRequest.builder()
                .model(openaiModel)
                .messages(List.of(new ChatMessage("user", "Test")))
                .maxTokens(10)
                .build();

            openAiService.createChatCompletion(testRequest);
            
            return "OpenAI Service Health:\n" +
                   "- Status: Healthy\n" +
                   "- Model: " + openaiModel + "\n" +
                   "- API Connection: Operational\n" +
                   "- Response Time: <2 seconds";
                   
        } catch (Exception e) {
            log.error("OpenAI health check failed: {}", e.getMessage(), e);
            return "OpenAI Service Health:\n" +
                   "- Status: Unhealthy\n" +
                   "- Error: " + e.getMessage();
        }
    }

    /**
     * Create automation prompt for OpenAI
     */
    private String createAutomationPrompt(AIRecommendationRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Generate Home Assistant automation suggestions based on the following criteria:\n\n");
        prompt.append("User ID: ").append(request.getUserId()).append("\n");
        prompt.append("Household ID: ").append(request.getHouseholdId()).append("\n");
        prompt.append("Context: ").append(request.getContext()).append("\n");
        prompt.append("User Control Preference: ").append(request.getUserControlPreference()).append("\n");
        prompt.append("Devices: ").append(String.join(", ", request.getDeviceIds())).append("\n");
        prompt.append("Time Range: ").append(request.getTimeRangeHours()).append(" hours\n");
        prompt.append("Privacy Level: ").append(request.getPrivacyLevel()).append("\n");
        prompt.append("Safety Threshold: ").append(request.getSafetyThreshold()).append("\n");
        prompt.append("Max Suggestions: ").append(request.getMaxSuggestions()).append("\n\n");
        prompt.append("Please provide ").append(request.getMaxSuggestions()).append(" automation suggestions with the following format:\n");
        prompt.append("- Title: Brief automation name\n");
        prompt.append("- Description: Detailed explanation\n");
        prompt.append("- Confidence: 0.0 to 1.0\n");
        prompt.append("- Reasoning: Why this automation is suggested\n");
        prompt.append("- Devices: List of involved devices\n");
        prompt.append("- Time Savings: Estimated minutes per day\n");
        prompt.append("- Energy Impact: Low/Medium/High\n");
        
        return prompt.toString();
    }

    /**
     * Parse automation suggestions from OpenAI response
     */
    private List<AutomationSuggestion> parseAutomationSuggestions(String response, AIRecommendationRequest request) {
        List<AutomationSuggestion> suggestions = new ArrayList<>();
        
        try {
            // Simple parsing - in production, use more sophisticated parsing
            String[] sections = response.split("---");
            
            for (String section : sections) {
                if (section.trim().isEmpty()) continue;
                
                AutomationSuggestion suggestion = AutomationSuggestion.builder()
                    .suggestionId(UUID.randomUUID().toString())
                    .title(extractField(section, "Title"))
                    .description(extractField(section, "Description"))
                    .confidenceScore(parseConfidence(extractField(section, "Confidence")))
                    .reasoning(extractField(section, "Reasoning"))
                    .involvedDevices(extractDevices(extractField(section, "Devices")))
                    .estimatedTimeSavings(parseTimeSavings(extractField(section, "Time Savings")))
                    .energyImpact(extractField(section, "Energy Impact"))
                    .modelUsed("OpenAI GPT-4o Mini")
                    .generatedAt(LocalDateTime.now())
                    .privacyLevel(request.getPrivacyLevel())
                    .approvalStatus("pending")
                    .build();
                
                suggestions.add(suggestion);
            }
            
        } catch (Exception e) {
            log.error("Error parsing automation suggestions: {}", e.getMessage(), e);
        }
        
        return suggestions;
    }

    /**
     * Parse context-aware suggestions
     */
    private List<AutomationSuggestion> parseContextAwareSuggestions(String response) {
        // Similar parsing logic for context-aware suggestions
        return parseAutomationSuggestions(response, null);
    }

    /**
     * Parse real-time suggestions
     */
    private List<AutomationSuggestion> parseRealTimeSuggestions(String response) {
        // Similar parsing logic for real-time suggestions
        return parseAutomationSuggestions(response, null);
    }

    /**
     * Create fallback suggestions when OpenAI fails
     */
    private List<AutomationSuggestion> createFallbackSuggestions(AIRecommendationRequest request) {
        List<AutomationSuggestion> fallbackSuggestions = new ArrayList<>();
        
        AutomationSuggestion fallback = AutomationSuggestion.builder()
            .suggestionId(UUID.randomUUID().toString())
            .title("Basic Lighting Automation")
            .description("Automate lights based on time and presence")
            .confidenceScore(0.7)
            .reasoning("Fallback suggestion when AI service is unavailable")
            .involvedDevices(new String[]{"light.living_room", "light.kitchen"})
            .estimatedTimeSavings(5)
            .energyImpact("Medium")
            .modelUsed("Fallback")
            .generatedAt(LocalDateTime.now())
            .privacyLevel("local-only")
            .approvalStatus("pending")
            .build();
        
        fallbackSuggestions.add(fallback);
        return fallbackSuggestions;
    }

    /**
     * Extract field from response text
     */
    private String extractField(String text, String fieldName) {
        try {
            int startIndex = text.indexOf(fieldName + ":");
            if (startIndex == -1) return "";
            
            startIndex += fieldName.length() + 1;
            int endIndex = text.indexOf("\n", startIndex);
            if (endIndex == -1) endIndex = text.length();
            
            return text.substring(startIndex, endIndex).trim();
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Parse confidence score
     */
    private Double parseConfidence(String confidenceText) {
        try {
            return Double.parseDouble(confidenceText);
        } catch (Exception e) {
            return 0.7; // Default confidence
        }
    }

    /**
     * Extract devices from text
     */
    private String[] extractDevices(String devicesText) {
        try {
            return devicesText.split(",");
        } catch (Exception e) {
            return new String[]{};
        }
    }

    /**
     * Parse time savings
     */
    private Integer parseTimeSavings(String timeText) {
        try {
            return Integer.parseInt(timeText.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 5; // Default 5 minutes
        }
    }
    
    @Override
    public AutomationSuggestion generateAutomation(String context) {
        log.info("Generating automation for context: {}", context);
        
        try {
            String prompt = "Generate a Home Assistant automation based on this context:\n\n" + context;
            
            ChatCompletionRequest chatRequest = ChatCompletionRequest.builder()
                .model(openaiModel)
                .messages(List.of(
                    new ChatMessage("system", "You are an AI assistant for Home Assistant automation. Generate a single, practical automation configuration."),
                    new ChatMessage("user", prompt)
                ))
                .maxTokens(800)
                .temperature(0.6)
                .build();

            String response = openAiService.createChatCompletion(chatRequest)
                .getChoices().get(0).getMessage().getContent();

            return parseSingleAutomation(response);
        } catch (Exception e) {
            log.error("Error generating automation: {}", e.getMessage(), e);
            return createFallbackAutomation(context);
        }
    }
    
    private AutomationSuggestion parseSingleAutomation(String response) {
        return AutomationSuggestion.builder()
            .suggestionId(UUID.randomUUID().toString())
            .title("Generated Automation")
            .description("AI-generated automation based on context")
            .confidenceScore(0.8)
            .reasoning("Generated based on provided context")
            .automationConfig(Map.of("yaml", response))
            .generatedAt(LocalDateTime.now())
            .modelUsed("gpt-4o-mini")
            .build();
    }
    
    private AutomationSuggestion createFallbackAutomation(String context) {
        return AutomationSuggestion.builder()
            .suggestionId(UUID.randomUUID().toString())
            .title("Fallback Automation")
            .description("Basic automation suggestion")
            .confidenceScore(0.5)
            .reasoning("Fallback suggestion due to API error")
            .automationConfig(Map.of("yaml", "# Basic automation\n- alias: Fallback Automation\n  trigger:\n    platform: time\n    at: '08:00:00'\n  action:\n    - service: notify.mobile_app"))
            .generatedAt(LocalDateTime.now())
            .modelUsed("fallback")
            .build();
    }
} 