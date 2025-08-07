package com.tappha.homeassistant.config;

import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * AI Infrastructure Configuration
 * 
 * Configures OpenAI API integration, Redis caching, and hybrid processing
 * for the TappHA intelligence engine.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Configuration
@EnableScheduling
public class AIConfig {

    @Value("${ai.openai.api.key:}")
    private String openaiApiKey;

    @Value("${ai.openai.api.base-url:https://api.openai.com/v1}")
    private String openaiBaseUrl;

    @Value("${ai.openai.models.primary:gpt-4o-mini}")
    private String openaiPrimaryModel;

    @Value("${ai.openai.models.fallback:gpt-3.5-turbo}")
    private String openaiFallbackModel;

    @Value("${ai.openai.max-tokens:1000}")
    private Integer maxTokens;

    @Value("${ai.openai.temperature:0.7}")
    private Double temperature;

    @Value("${ai.hybrid.enabled:true}")
    private Boolean hybridEnabled;

    @Value("${ai.caching.enabled:true}")
    private Boolean cachingEnabled;

    /**
     * Configure OpenAI service for AI operations
     */
    @Bean
    public OpenAiService openAiService() {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty()) {
            // Return a mock service when API key is not provided
            // This will be handled by the AIService to use local processing only
            return new OpenAiService("mock-key-for-local-only");
        }
        return new OpenAiService(openaiApiKey);
    }

    /**
     * Configure Redis template for AI response caching
     */
    @Bean
    public RedisTemplate<String, Object> aiCacheRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        
        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Use JSON serializer for values
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        template.afterPropertiesSet();
        return template;
    }
} 