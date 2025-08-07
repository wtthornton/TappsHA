package com.tappha.ai.config;

import com.theokanning.openai.service.OpenAiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.time.Duration;
import java.util.concurrent.Executor;

/**
 * AI Configuration for Phase 2: Intelligence Engine
 * 
 * Configures:
 * - OpenAI service integration
 * - Async processing for AI operations
 * - Thread pool configuration for AI tasks
 * - Privacy and safety settings
 * 
 * Following Agent OS Standards with comprehensive configuration
 */
@Configuration
@EnableAsync
public class AIConfig {

    @Value("${openai.api.key}")
    private String openaiApiKey;

    @Value("${openai.timeout:30}")
    private Integer openaiTimeout;

    @Value("${ai.async.core-pool-size:5}")
    private Integer corePoolSize;

    @Value("${ai.async.max-pool-size:10}")
    private Integer maxPoolSize;

    @Value("${ai.async.queue-capacity:25}")
    private Integer queueCapacity;

    /**
     * Configure OpenAI service
     */
    @Bean
    public OpenAiService openAiService() {
        return new OpenAiService(openaiApiKey, Duration.ofSeconds(openaiTimeout));
    }

    /**
     * Configure async executor for AI operations
     */
    @Bean("aiTaskExecutor")
    public Executor aiTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(corePoolSize);
        executor.setMaxPoolSize(maxPoolSize);
        executor.setQueueCapacity(queueCapacity);
        executor.setThreadNamePrefix("AI-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }

    /**
     * Configure AI privacy settings
     */
    @Bean
    public AIPrivacyConfig aiPrivacyConfig() {
        return AIPrivacyConfig.builder()
            .localProcessingEnabled(true)
            .cloudAugmentationEnabled(false)
            .dataRetentionDays(7)
            .privacyLevel("local-only")
            .build();
    }

    /**
     * Configure AI safety settings
     */
    @Bean
    public AISafetyConfig aiSafetyConfig() {
        return AISafetyConfig.builder()
            .safetyThreshold(0.8)
            .emergencyStopEnabled(true)
            .userApprovalRequired(true)
            .maxSuggestionsPerRequest(5)
            .build();
    }

    /**
     * AI Privacy Configuration
     */
    public static class AIPrivacyConfig {
        private final boolean localProcessingEnabled;
        private final boolean cloudAugmentationEnabled;
        private final int dataRetentionDays;
        private final String privacyLevel;

        public AIPrivacyConfig(boolean localProcessingEnabled, boolean cloudAugmentationEnabled, 
                             int dataRetentionDays, String privacyLevel) {
            this.localProcessingEnabled = localProcessingEnabled;
            this.cloudAugmentationEnabled = cloudAugmentationEnabled;
            this.dataRetentionDays = dataRetentionDays;
            this.privacyLevel = privacyLevel;
        }

        public static Builder builder() {
            return new Builder();
        }

        public boolean isLocalProcessingEnabled() { return localProcessingEnabled; }
        public boolean isCloudAugmentationEnabled() { return cloudAugmentationEnabled; }
        public int getDataRetentionDays() { return dataRetentionDays; }
        public String getPrivacyLevel() { return privacyLevel; }

        public static class Builder {
            private boolean localProcessingEnabled = true;
            private boolean cloudAugmentationEnabled = false;
            private int dataRetentionDays = 7;
            private String privacyLevel = "local-only";

            public Builder localProcessingEnabled(boolean enabled) {
                this.localProcessingEnabled = enabled;
                return this;
            }

            public Builder cloudAugmentationEnabled(boolean enabled) {
                this.cloudAugmentationEnabled = enabled;
                return this;
            }

            public Builder dataRetentionDays(int days) {
                this.dataRetentionDays = days;
                return this;
            }

            public Builder privacyLevel(String level) {
                this.privacyLevel = level;
                return this;
            }

            public AIPrivacyConfig build() {
                return new AIPrivacyConfig(localProcessingEnabled, cloudAugmentationEnabled, 
                                         dataRetentionDays, privacyLevel);
            }
        }
    }

    /**
     * AI Safety Configuration
     */
    public static class AISafetyConfig {
        private final double safetyThreshold;
        private final boolean emergencyStopEnabled;
        private final boolean userApprovalRequired;
        private final int maxSuggestionsPerRequest;

        public AISafetyConfig(double safetyThreshold, boolean emergencyStopEnabled, 
                            boolean userApprovalRequired, int maxSuggestionsPerRequest) {
            this.safetyThreshold = safetyThreshold;
            this.emergencyStopEnabled = emergencyStopEnabled;
            this.userApprovalRequired = userApprovalRequired;
            this.maxSuggestionsPerRequest = maxSuggestionsPerRequest;
        }

        public static Builder builder() {
            return new Builder();
        }

        public double getSafetyThreshold() { return safetyThreshold; }
        public boolean isEmergencyStopEnabled() { return emergencyStopEnabled; }
        public boolean isUserApprovalRequired() { return userApprovalRequired; }
        public int getMaxSuggestionsPerRequest() { return maxSuggestionsPerRequest; }

        public static class Builder {
            private double safetyThreshold = 0.8;
            private boolean emergencyStopEnabled = true;
            private boolean userApprovalRequired = true;
            private int maxSuggestionsPerRequest = 5;

            public Builder safetyThreshold(double threshold) {
                this.safetyThreshold = threshold;
                return this;
            }

            public Builder emergencyStopEnabled(boolean enabled) {
                this.emergencyStopEnabled = enabled;
                return this;
            }

            public Builder userApprovalRequired(boolean required) {
                this.userApprovalRequired = required;
                return this;
            }

            public Builder maxSuggestionsPerRequest(int max) {
                this.maxSuggestionsPerRequest = max;
                return this;
            }

            public AISafetyConfig build() {
                return new AISafetyConfig(safetyThreshold, emergencyStopEnabled, 
                                        userApprovalRequired, maxSuggestionsPerRequest);
            }
        }
    }
} 