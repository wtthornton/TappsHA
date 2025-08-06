package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.UserPreferences;
import com.tappha.homeassistant.exception.OpenAIException;
import com.tappha.homeassistant.exception.RateLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * OpenAI API client with rate limiting and error handling
 * 
 * Reference: https://platform.openai.com/docs/api-reference
 */
@Service
public class OpenAIClient {
    
    private static final Logger logger = LoggerFactory.getLogger(OpenAIClient.class);
    
    private final RateLimiter rateLimiter;
    private final AIErrorHandler errorHandler;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${ai.openai.api.key}")
    private String apiKey;
    
    @Value("${ai.openai.api.base-url:https://api.openai.com/v1}")
    private String baseUrl;
    
    @Value("${ai.openai.models.primary:gpt-4o-mini}")
    private String primaryModel;
    
    @Value("${ai.openai.models.fallback:gpt-3.5-turbo}")
    private String fallbackModel;
    
    @Value("${ai.openai.max-tokens:1000}")
    private int maxTokens;
    
    @Value("${ai.openai.temperature:0.7}")
    private double temperature;
    
    @Value("${ai.openai.timeout:30000}")
    private Duration timeout;
    
    @Value("${ai.openai.max-retries:3}")
    private int maxRetries;
    
    public OpenAIClient(RateLimiter rateLimiter, AIErrorHandler errorHandler) {
        this.rateLimiter = rateLimiter;
        this.errorHandler = errorHandler;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Generate AI suggestion for automation improvement
     * @param context Automation context
     * @param preferences User preferences
     * @return CompletableFuture with AI suggestion
     */
    public CompletableFuture<AISuggestion> generateSuggestion(
        AutomationContext context, UserPreferences preferences) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Validate input parameters
                validateInputs(context, preferences);
                
                // Check rate limiting
                if (!rateLimiter.acquirePermission()) {
                    throw new RateLimitException("Rate limit exceeded");
                }
                
                try {
                    // Generate suggestion
                    return generateSuggestionInternal(context, preferences);
                } finally {
                    rateLimiter.releasePermission();
                }
                
            } catch (Exception e) {
                errorHandler.logError(e, "OpenAI suggestion generation failed");
                
                if (errorHandler.isRetryable(e)) {
                    return retryWithBackoff(context, preferences, e, 0);
                } else {
                    throw new RuntimeException("Failed to generate AI suggestion", e);
                }
            }
        });
    }
    
    /**
     * Internal method to generate suggestion with model fallback logic
     */
    private AISuggestion generateSuggestionInternal(
        AutomationContext context, UserPreferences preferences) {
        
        try {
            // Try primary model first
            return generateWithModel(context, preferences, primaryModel);
            
        } catch (Exception primaryError) {
            logger.warn("Primary model ({}) failed, attempting fallback: {}", primaryModel, primaryError.getMessage());
            
            try {
                // Try fallback model
                return generateWithModel(context, preferences, fallbackModel);
                
            } catch (Exception fallbackError) {
                logger.error("Both primary and fallback models failed. Primary: {}, Fallback: {}", 
                           primaryError.getMessage(), fallbackError.getMessage());
                throw new RuntimeException("All AI models failed", fallbackError);
            }
        }
    }
    
    /**
     * Generate suggestion with specific model
     */
    private AISuggestion generateWithModel(
        AutomationContext context, UserPreferences preferences, String modelToUse) {
        
        try {
            // Prepare request
            ObjectNode requestBody = createRequestBody(context, preferences, modelToUse);
            
            // Make API call
            ResponseEntity<JsonNode> response = makeApiCall(requestBody);
            
            // Parse response
            AISuggestion result = parseSuggestionResponse(response.getBody(), context, preferences);
            
            // Record success for circuit breaker
            errorHandler.recordSuccess();
            
            return result;
            
        } catch (HttpClientErrorException e) {
            handleHttpClientError(e);
            throw e;
        } catch (HttpServerErrorException e) {
            handleHttpServerError(e);
            throw e;
        } catch (ResourceAccessException e) {
            handleNetworkError(e);
            throw e;
        }
    }
    
    /**
     * Retry with exponential backoff
     */
    private AISuggestion retryWithBackoff(
        AutomationContext context, UserPreferences preferences, 
        Exception originalError, int attempt) {
        
        if (attempt >= maxRetries) {
            throw new RuntimeException("Max retries exceeded", originalError);
        }
        
        try {
            long delay = errorHandler.getRetryDelay(originalError) * (long) Math.pow(2, attempt);
            Thread.sleep(delay);
            
            return generateSuggestionInternal(context, preferences);
            
        } catch (Exception e) {
            logger.warn("Retry attempt {} failed: {}", attempt + 1, e.getMessage());
            return retryWithBackoff(context, preferences, originalError, attempt + 1);
        }
    }
    
    /**
     * Create request body for OpenAI API
     */
    private ObjectNode createRequestBody(AutomationContext context, UserPreferences preferences, String modelToUse) {
        ObjectNode requestBody = objectMapper.createObjectNode();
        
        // Set model (use specified model or preference override)
        String effectiveModel = preferences.getPreferredModel() != null ? 
            preferences.getPreferredModel() : modelToUse;
        requestBody.put("model", effectiveModel);
        
        // Set parameters
        requestBody.put("max_tokens", maxTokens);
        requestBody.put("temperature", temperature);
        
        // Create messages
        ObjectNode systemMessage = objectMapper.createObjectNode();
        systemMessage.put("role", "system");
        systemMessage.put("content", createSystemPrompt(preferences));
        
        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", createUserPrompt(context));
        
        requestBody.set("messages", objectMapper.createArrayNode()
            .add(systemMessage)
            .add(userMessage));
        
        return requestBody;
    }
    
    /**
     * Create system prompt for AI
     */
    private String createSystemPrompt(UserPreferences preferences) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI assistant that helps optimize Home Assistant automations. ");
        prompt.append("Analyze the provided automation context and suggest improvements. ");
        prompt.append("Focus on efficiency, reliability, and user experience. ");
        prompt.append("Safety level: ").append(preferences.getSafetyLevel()).append(". ");
        prompt.append("Provide suggestions with confidence scores and safety assessments.");
        
        return prompt.toString();
    }
    
    /**
     * Create user prompt with context
     */
    private String createUserPrompt(AutomationContext context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Automation Context:\n");
        prompt.append("- Entity: ").append(context.getEntityId()).append("\n");
        prompt.append("- Event: ").append(context.getEventType()).append("\n");
        prompt.append("- Old State: ").append(context.getOldState()).append("\n");
        prompt.append("- New State: ").append(context.getNewState()).append("\n");
        prompt.append("- Timestamp: ").append(context.getTimestamp()).append("\n");
        
        if (context.getTriggerType() != null) {
            prompt.append("- Trigger: ").append(context.getTriggerType()).append("\n");
        }
        if (context.getConditionType() != null) {
            prompt.append("- Condition: ").append(context.getConditionType()).append("\n");
        }
        if (context.getActionType() != null) {
            prompt.append("- Action: ").append(context.getActionType()).append("\n");
        }
        
        prompt.append("\nPlease suggest automation improvements with the following format:\n");
        prompt.append("- Suggestion Type: [improvement/new/optimization]\n");
        prompt.append("- Confidence: [0.0-1.0]\n");
        prompt.append("- Safety Score: [0.0-1.0]\n");
        prompt.append("- Reasoning: [detailed explanation]\n");
        prompt.append("- Implementation: [specific steps]");
        
        return prompt.toString();
    }
    
    /**
     * Make API call to OpenAI
     */
    private ResponseEntity<JsonNode> makeApiCall(ObjectNode requestBody) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);
        
        HttpEntity<ObjectNode> request = new HttpEntity<>(requestBody, headers);
        String url = baseUrl + "/chat/completions";
        
        return restTemplate.exchange(url, HttpMethod.POST, request, JsonNode.class);
    }
    
    /**
     * Parse suggestion response from OpenAI
     */
    private AISuggestion parseSuggestionResponse(
        JsonNode response, AutomationContext context, UserPreferences preferences) {
        
        try {
            String content = response.get("choices").get(0).get("message").get("content").asText();
            
            // Parse the structured response
            Map<String, Object> suggestionData = parseStructuredResponse(content);
            
            return AISuggestion.builder()
                .id(UUID.randomUUID().toString())
                .suggestionType(AISuggestion.SuggestionType.ENERGY_OPTIMIZATION) // Default type
                .suggestionData(suggestionData)
                .confidence((Double) suggestionData.get("confidence"))
                .safetyScore((Double) suggestionData.get("safetyScore"))
                .reasoning((String) suggestionData.get("reasoning"))
                .userId(context.getUserId())
                .automationId(context.getAutomationId())
                .approvalStatus("pending")
                .createdAt(OffsetDateTime.now())
                .metadata(new HashMap<>())
                .build();
                
        } catch (Exception e) {
            logger.error("Failed to parse OpenAI response", e);
            throw new OpenAIException("Failed to parse AI response", e);
        }
    }
    
    /**
     * Parse structured response from AI
     */
    private Map<String, Object> parseStructuredResponse(String content) {
        Map<String, Object> result = new HashMap<>();
        
        // Simple parsing - in production, use more robust parsing
        String[] lines = content.split("\n");
        for (String line : lines) {
            if (line.contains(":")) {
                String[] parts = line.split(":", 2);
                String key = parts[0].trim().toLowerCase();
                String value = parts[1].trim();
                
                switch (key) {
                    case "suggestion type":
                        result.put("suggestionType", value);
                        break;
                    case "confidence":
                        result.put("confidence", parseDouble(value));
                        break;
                    case "safety score":
                        result.put("safetyScore", parseDouble(value));
                        break;
                    case "reasoning":
                        result.put("reasoning", value);
                        break;
                    case "implementation":
                        result.put("implementation", value);
                        break;
                }
            }
        }
        
        // Set defaults if not found
        result.putIfAbsent("suggestionType", "improvement");
        result.putIfAbsent("confidence", 0.8);
        result.putIfAbsent("safetyScore", 0.9);
        result.putIfAbsent("reasoning", "AI-generated suggestion based on automation context");
        
        return result;
    }
    
    /**
     * Parse double value safely
     */
    private Double parseDouble(String value) {
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            return 0.5; // Default value
        }
    }
    
    /**
     * Validate input parameters
     */
    private void validateInputs(AutomationContext context, UserPreferences preferences) {
        if (context == null) {
            throw new IllegalArgumentException("Automation context cannot be null");
        }
        if (preferences == null) {
            throw new IllegalArgumentException("User preferences cannot be null");
        }
        if (context.getEntityId() == null || context.getEntityId().trim().isEmpty()) {
            throw new IllegalArgumentException("Entity ID cannot be null or empty");
        }
        if (context.getEventType() == null || context.getEventType().trim().isEmpty()) {
            throw new IllegalArgumentException("Event type cannot be null or empty");
        }
    }
    
    /**
     * Handle HTTP client errors (4xx)
     */
    private void handleHttpClientError(HttpClientErrorException e) {
        if (e.getStatusCode().value() == 429) {
            // Rate limit exceeded
            throw new RateLimitException("OpenAI rate limit exceeded", e);
        } else if (e.getStatusCode().value() == 401) {
            // Authentication error
            throw new OpenAIException("OpenAI authentication failed", "auth_error", 401, e);
        } else if (e.getStatusCode().value() == 400) {
            // Bad request
            throw new OpenAIException("OpenAI bad request", "bad_request", 400, e);
        } else {
            // Other client errors
            throw new OpenAIException("OpenAI client error", "client_error", e.getStatusCode().value(), e);
        }
    }
    
    /**
     * Handle HTTP server errors (5xx)
     */
    private void handleHttpServerError(HttpServerErrorException e) {
        throw new OpenAIException("OpenAI server error", "server_error", e.getStatusCode().value(), e);
    }
    
    /**
     * Handle network errors
     */
    private void handleNetworkError(ResourceAccessException e) {
        throw new OpenAIException("OpenAI network error", "network_error", 0, e);
    }
} 