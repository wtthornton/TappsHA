package com.tappha.homeassistant.config;

import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AI Infrastructure Configuration
 * 
 * Configures OpenAI API integration and pgvector support
 * for the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Configuration
public class AIConfig {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.api.base-url:https://api.openai.com/v1}")
    private String openaiBaseUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    @Value("${openai.max-tokens:1000}")
    private Integer maxTokens;

    @Value("${openai.temperature:0.7}")
    private Double temperature;

    /**
     * Configure OpenAI service for AI operations
     */
    @Bean
    public OpenAiService openAiService() {
        return new OpenAiService(openaiApiKey);
    }
} 