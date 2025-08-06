package com.tappha.homeassistant.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.dto.AISuggestion;
import com.tappha.homeassistant.dto.AutomationContext;
import com.tappha.homeassistant.dto.UserPreferences;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

/**
 * Hybrid AI Processing Service
 * 
 * Implements local-first AI processing strategy with cloud fallback
 * for the TappHA intelligence engine.
 * 
 * Processing Strategy:
 * 1. Check Redis cache for existing suggestions
 * 2. Attempt local TensorFlow Lite processing (when enabled)
 * 3. Fall back to OpenAI API for complex suggestions
 * 4. Cache results in Redis for future requests
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class HybridAIProcessingService {

    private final RedisTemplate<String, Object> aiCacheRedisTemplate;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.hybrid.enabled:true}")
    private Boolean hybridEnabled;

    @Value("${ai.hybrid.local-first:true}")
    private Boolean localFirst;

    @Value("${ai.hybrid.local-threshold:0.7}")
    private BigDecimal localThreshold;

    @Value("${ai.caching.enabled:true}")
    private Boolean cachingEnabled;

    @Value("${ai.caching.ttl:3600}")
    private Long cacheTtl;

    @Value("${ai.caching.key-prefix:ai:suggestion:}")
    private String cacheKeyPrefix;

    @Value("${ai.local.tensorflow-lite.enabled:false}")
    private Boolean tensorflowLiteEnabled;

    @Value("${ai.local.tensorflow-lite.confidence-threshold:0.7}")
    private BigDecimal tensorflowConfidenceThreshold;

    /**
     * Generate AI suggestion using hybrid processing strategy
     * 
     * @param context Automation context for suggestion generation
     * @param preferences User preferences
     * @return CompletableFuture with AI suggestion
     */
    public CompletableFuture<AISuggestion> generateSuggestion(
            AutomationContext context, UserPreferences preferences) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.debug("Starting hybrid AI suggestion generation for context: {}", context.getContextId());
                
                // Step 1: Check cache first
                if (cachingEnabled) {
                    AISuggestion cachedSuggestion = getCachedSuggestion(context, preferences);
                    if (cachedSuggestion != null) {
                        log.debug("Returning cached suggestion for context: {}", context.getContextId());
                        return cachedSuggestion;
                    }
                }

                // Step 2: Attempt local processing if enabled and local-first strategy is active
                if (hybridEnabled && localFirst && tensorflowLiteEnabled) {
                    try {
                        AISuggestion localSuggestion = processWithLocalModel(context, preferences);
                        if (localSuggestion != null && 
                            localSuggestion.getConfidenceScore().compareTo(tensorflowConfidenceThreshold) >= 0) {
                            log.debug("Local model generated high-confidence suggestion: {}", 
                                    localSuggestion.getConfidenceScore());
                            
                            // Cache the local result
                            if (cachingEnabled) {
                                cacheSuggestion(context, preferences, localSuggestion);
                            }
                            
                            return localSuggestion;
                        }
                    } catch (Exception e) {
                        log.warn("Local model processing failed, falling back to cloud: {}", e.getMessage());
                    }
                }

                // Step 3: Fall back to cloud processing (OpenAI)
                log.debug("Using cloud processing for context: {}", context.getContextId());
                AISuggestion cloudSuggestion = processWithCloudModel(context, preferences);
                
                // Cache the cloud result
                if (cachingEnabled && cloudSuggestion != null) {
                    cacheSuggestion(context, preferences, cloudSuggestion);
                }
                
                return cloudSuggestion;
                
            } catch (Exception e) {
                log.error("Error in hybrid AI processing for context: {}", context.getContextId(), e);
                throw new RuntimeException("Failed to generate AI suggestion", e);
            }
        });
    }

    /**
     * Process suggestion using local TensorFlow Lite model
     * Note: This is a placeholder implementation until TensorFlow Lite integration is complete
     */
    private AISuggestion processWithLocalModel(AutomationContext context, UserPreferences preferences) {
        log.debug("Local TensorFlow Lite processing not yet implemented");
        
        // TODO: Implement TensorFlow Lite integration
        // For now, return null to trigger cloud fallback
        return null;
    }

    /**
     * Process suggestion using cloud-based OpenAI model
     */
    private AISuggestion processWithCloudModel(AutomationContext context, UserPreferences preferences) {
        try {
            // Use the existing OpenAI client for cloud processing
            CompletableFuture<AISuggestion> future = openAIClient.generateSuggestion(context, preferences);
            return future.get(); // Block for result since we're already in an async context
        } catch (Exception e) {
            log.error("Cloud model processing failed for context: {}", context.getContextId(), e);
            throw new RuntimeException("Cloud processing failed", e);
        }
    }

    /**
     * Generate cache key for suggestion
     */
    private String generateCacheKey(AutomationContext context, UserPreferences preferences) {
        try {
            // Create a deterministic key based on context and preferences
            String contextHash = String.valueOf(
                (context.getContextId() + context.getPatternType() + context.getEntityIds()).hashCode());
            String preferencesHash = String.valueOf(preferences.hashCode());
            
            return cacheKeyPrefix + contextHash + ":" + preferencesHash;
        } catch (Exception e) {
            log.warn("Failed to generate cache key, using fallback", e);
            return cacheKeyPrefix + UUID.randomUUID().toString();
        }
    }

    /**
     * Get cached suggestion from Redis
     */
    private AISuggestion getCachedSuggestion(AutomationContext context, UserPreferences preferences) {
        try {
            String cacheKey = generateCacheKey(context, preferences);
            Object cached = aiCacheRedisTemplate.opsForValue().get(cacheKey);
            
            if (cached != null) {
                if (cached instanceof AISuggestion) {
                    return (AISuggestion) cached;
                } else {
                    // Try to deserialize from JSON
                    String json = objectMapper.writeValueAsString(cached);
                    return objectMapper.readValue(json, AISuggestion.class);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve cached suggestion for context: {}", context.getContextId(), e);
        }
        
        return null;
    }

    /**
     * Cache suggestion in Redis
     */
    private void cacheSuggestion(AutomationContext context, UserPreferences preferences, AISuggestion suggestion) {
        try {
            String cacheKey = generateCacheKey(context, preferences);
            aiCacheRedisTemplate.opsForValue().set(cacheKey, suggestion, Duration.ofSeconds(cacheTtl));
            log.debug("Cached suggestion for context: {} with key: {}", context.getContextId(), cacheKey);
        } catch (Exception e) {
            log.warn("Failed to cache suggestion for context: {}", context.getContextId(), e);
        }
    }

    /**
     * Get processing strategy information
     */
    public ProcessingStrategy getProcessingStrategy() {
        return ProcessingStrategy.builder()
                .hybridEnabled(hybridEnabled)
                .localFirst(localFirst)
                .localThreshold(localThreshold)
                .cachingEnabled(cachingEnabled)
                .tensorflowLiteEnabled(tensorflowLiteEnabled)
                .build();
    }

    /**
     * Processing strategy configuration
     */
    public static class ProcessingStrategy {
        private final Boolean hybridEnabled;
        private final Boolean localFirst;
        private final BigDecimal localThreshold;
        private final Boolean cachingEnabled;
        private final Boolean tensorflowLiteEnabled;

        private ProcessingStrategy(Boolean hybridEnabled, Boolean localFirst, BigDecimal localThreshold,
                                 Boolean cachingEnabled, Boolean tensorflowLiteEnabled) {
            this.hybridEnabled = hybridEnabled;
            this.localFirst = localFirst;
            this.localThreshold = localThreshold;
            this.cachingEnabled = cachingEnabled;
            this.tensorflowLiteEnabled = tensorflowLiteEnabled;
        }

        public static ProcessingStrategyBuilder builder() {
            return new ProcessingStrategyBuilder();
        }

        // Getters
        public Boolean getHybridEnabled() { return hybridEnabled; }
        public Boolean getLocalFirst() { return localFirst; }
        public BigDecimal getLocalThreshold() { return localThreshold; }
        public Boolean getCachingEnabled() { return cachingEnabled; }
        public Boolean getTensorflowLiteEnabled() { return tensorflowLiteEnabled; }

        public static class ProcessingStrategyBuilder {
            private Boolean hybridEnabled;
            private Boolean localFirst;
            private BigDecimal localThreshold;
            private Boolean cachingEnabled;
            private Boolean tensorflowLiteEnabled;

            public ProcessingStrategyBuilder hybridEnabled(Boolean hybridEnabled) {
                this.hybridEnabled = hybridEnabled;
                return this;
            }

            public ProcessingStrategyBuilder localFirst(Boolean localFirst) {
                this.localFirst = localFirst;
                return this;
            }

            public ProcessingStrategyBuilder localThreshold(BigDecimal localThreshold) {
                this.localThreshold = localThreshold;
                return this;
            }

            public ProcessingStrategyBuilder cachingEnabled(Boolean cachingEnabled) {
                this.cachingEnabled = cachingEnabled;
                return this;
            }

            public ProcessingStrategyBuilder tensorflowLiteEnabled(Boolean tensorflowLiteEnabled) {
                this.tensorflowLiteEnabled = tensorflowLiteEnabled;
                return this;
            }

            public ProcessingStrategy build() {
                return new ProcessingStrategy(hybridEnabled, localFirst, localThreshold, 
                                            cachingEnabled, tensorflowLiteEnabled);
            }
        }
    }
}