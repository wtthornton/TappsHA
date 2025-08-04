package com.tappha.homeassistant.service;

import com.tappha.homeassistant.exception.OpenAIException;
import com.tappha.homeassistant.exception.RateLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Comprehensive error handler for AI operations
 * Provides centralized error handling, logging, and retry logic
 */
@Service
public class AIErrorHandler implements ErrorHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(AIErrorHandler.class);
    
    // Retry configuration for different error types
    private static final Map<String, RetryConfig> RETRY_CONFIGS = new HashMap<>();
    
    static {
        // Rate limit errors - retry after delay
        RETRY_CONFIGS.put("rate_limit", new RetryConfig(3, 60000, true));
        
        // Network errors - retry with exponential backoff
        RETRY_CONFIGS.put("network_error", new RetryConfig(5, 1000, true));
        
        // Server errors - retry with exponential backoff
        RETRY_CONFIGS.put("server_error", new RetryConfig(3, 2000, true));
        
        // Authentication errors - don't retry
        RETRY_CONFIGS.put("auth_error", new RetryConfig(0, 0, false));
        
        // Bad request errors - don't retry
        RETRY_CONFIGS.put("bad_request", new RetryConfig(0, 0, false));
        
        // Unknown errors - retry once
        RETRY_CONFIGS.put("unknown", new RetryConfig(1, 5000, true));
    }
    
    @Override
    public boolean handleError(Exception error) {
        String errorType = classifyError(error);
        RetryConfig config = RETRY_CONFIGS.getOrDefault(errorType, RETRY_CONFIGS.get("unknown"));
        
        logError(error, "AI operation failed - Error type: " + errorType);
        
        if (config.isRetryable()) {
            logger.info("Error is retryable - Type: {}, Max retries: {}", errorType, config.getMaxRetries());
        } else {
            logger.warn("Error is not retryable - Type: {}", errorType);
        }
        
        return config.isRetryable();
    }
    
    @Override
    public void logError(Exception error, String context) {
        String errorType = classifyError(error);
        
        if (isSevereError(errorType)) {
            logger.error("SEVERE AI ERROR - {}: {}", context, error.getMessage(), error);
        } else if (isWarningError(errorType)) {
            logger.warn("AI WARNING - {}: {}", context, error.getMessage());
        } else {
            logger.info("AI INFO - {}: {}", context, error.getMessage());
        }
        
        // Log additional context for debugging
        logger.debug("Error details - Type: {}, Class: {}, Message: {}", 
            errorType, error.getClass().getSimpleName(), error.getMessage());
    }
    
    @Override
    public boolean isRetryable(Exception error) {
        String errorType = classifyError(error);
        RetryConfig config = RETRY_CONFIGS.getOrDefault(errorType, RETRY_CONFIGS.get("unknown"));
        return config.isRetryable();
    }
    
    @Override
    public long getRetryDelay(Exception error) {
        String errorType = classifyError(error);
        RetryConfig config = RETRY_CONFIGS.getOrDefault(errorType, RETRY_CONFIGS.get("unknown"));
        return config.getBaseDelay();
    }
    
    @Override
    public int getMaxRetries(Exception error) {
        String errorType = classifyError(error);
        RetryConfig config = RETRY_CONFIGS.getOrDefault(errorType, RETRY_CONFIGS.get("unknown"));
        return config.getMaxRetries();
    }
    
    /**
     * Classify error based on exception type and properties
     */
    private String classifyError(Exception error) {
        if (error instanceof RateLimitException) {
            return "rate_limit";
        } else if (error instanceof OpenAIException) {
            OpenAIException openAIError = (OpenAIException) error;
            return openAIError.getErrorCode();
        } else if (error instanceof java.net.SocketTimeoutException) {
            return "network_error";
        } else if (error instanceof java.net.ConnectException) {
            return "network_error";
        } else if (error instanceof java.net.UnknownHostException) {
            return "network_error";
        } else if (error instanceof org.springframework.web.client.ResourceAccessException) {
            return "network_error";
        } else if (error instanceof org.springframework.web.client.HttpServerErrorException) {
            return "server_error";
        } else if (error instanceof IllegalArgumentException) {
            return "bad_request";
        } else {
            return "unknown";
        }
    }
    
    /**
     * Check if error is severe (requires immediate attention)
     */
    private boolean isSevereError(String errorType) {
        return "auth_error".equals(errorType) || 
               "bad_request".equals(errorType) ||
               "server_error".equals(errorType);
    }
    
    /**
     * Check if error is a warning (should be monitored)
     */
    private boolean isWarningError(String errorType) {
        return "rate_limit".equals(errorType) || 
               "network_error".equals(errorType);
    }
    
    /**
     * Retry configuration for different error types
     */
    private static class RetryConfig {
        private final int maxRetries;
        private final long baseDelay;
        private final boolean retryable;
        
        public RetryConfig(int maxRetries, long baseDelay, boolean retryable) {
            this.maxRetries = maxRetries;
            this.baseDelay = baseDelay;
            this.retryable = retryable;
        }
        
        public int getMaxRetries() {
            return maxRetries;
        }
        
        public long getBaseDelay() {
            return baseDelay;
        }
        
        public boolean isRetryable() {
            return retryable;
        }
    }
} 