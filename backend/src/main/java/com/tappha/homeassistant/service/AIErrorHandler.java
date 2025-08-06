package com.tappha.homeassistant.service;

import com.tappha.homeassistant.exception.OpenAIException;
import com.tappha.homeassistant.exception.RateLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Comprehensive error handler for AI operations
 * Provides centralized error handling, logging, retry logic, and circuit breaker pattern
 */
@Service
public class AIErrorHandler implements ErrorHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(AIErrorHandler.class);
    
    // Circuit breaker configuration
    private static final int CIRCUIT_BREAKER_FAILURE_THRESHOLD = 10;
    private static final long CIRCUIT_BREAKER_TIMEOUT_MS = 60000; // 1 minute
    private static final int CIRCUIT_BREAKER_SUCCESS_THRESHOLD = 3;
    
    // Circuit breaker state
    private final AtomicInteger consecutiveFailures = new AtomicInteger(0);
    private final AtomicInteger successCount = new AtomicInteger(0);
    private final AtomicLong lastFailureTime = new AtomicLong(0);
    private volatile CircuitBreakerState circuitState = CircuitBreakerState.CLOSED;
    
    // Error metrics
    private final AtomicInteger totalErrors = new AtomicInteger(0);
    private final AtomicInteger rateLimitErrors = new AtomicInteger(0);
    private final AtomicInteger networkErrors = new AtomicInteger(0);
    private final AtomicInteger authErrors = new AtomicInteger(0);
    
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
        
        // Update metrics
        totalErrors.incrementAndGet();
        updateErrorMetrics(errorType);
        
        // Update circuit breaker state
        updateCircuitBreakerOnFailure();
        
        logError(error, "AI operation failed - Error type: " + errorType);
        
        // Check circuit breaker before determining retryability
        if (isCircuitOpen()) {
            logger.warn("Circuit breaker is OPEN - blocking AI operations");
            return false;
        }
        
        if (config.isRetryable()) {
            logger.info("Error is retryable - Type: {}, Max retries: {}, Circuit state: {}", 
                       errorType, config.getMaxRetries(), circuitState);
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
    
    /**
     * Circuit breaker state enumeration
     */
    private enum CircuitBreakerState {
        CLOSED,    // Normal operation
        OPEN,      // Blocking all requests
        HALF_OPEN  // Testing if service is recovered
    }
    
    /**
     * Update circuit breaker state on failure
     */
    private void updateCircuitBreakerOnFailure() {
        long currentTime = System.currentTimeMillis();
        lastFailureTime.set(currentTime);
        
        int failures = consecutiveFailures.incrementAndGet();
        successCount.set(0);
        
        if (failures >= CIRCUIT_BREAKER_FAILURE_THRESHOLD && circuitState == CircuitBreakerState.CLOSED) {
            circuitState = CircuitBreakerState.OPEN;
            logger.warn("Circuit breaker opened after {} consecutive failures", failures);
        }
    }
    
    /**
     * Update circuit breaker state on success
     */
    public void recordSuccess() {
        if (circuitState == CircuitBreakerState.HALF_OPEN) {
            int successes = successCount.incrementAndGet();
            if (successes >= CIRCUIT_BREAKER_SUCCESS_THRESHOLD) {
                circuitState = CircuitBreakerState.CLOSED;
                consecutiveFailures.set(0);
                successCount.set(0);
                logger.info("Circuit breaker closed after {} successful operations", successes);
            }
        } else if (circuitState == CircuitBreakerState.CLOSED) {
            consecutiveFailures.set(0);
        }
    }
    
    /**
     * Check if circuit breaker is open
     */
    private boolean isCircuitOpen() {
        if (circuitState == CircuitBreakerState.OPEN) {
            long currentTime = System.currentTimeMillis();
            if (currentTime - lastFailureTime.get() >= CIRCUIT_BREAKER_TIMEOUT_MS) {
                circuitState = CircuitBreakerState.HALF_OPEN;
                successCount.set(0);
                logger.info("Circuit breaker moved to HALF_OPEN state");
                return false;
            }
            return true;
        }
        return false;
    }
    
    /**
     * Update error metrics based on error type
     */
    private void updateErrorMetrics(String errorType) {
        switch (errorType) {
            case "rate_limit":
                rateLimitErrors.incrementAndGet();
                break;
            case "network_error":
                networkErrors.incrementAndGet();
                break;
            case "auth_error":
                authErrors.incrementAndGet();
                break;
        }
    }
    
    /**
     * Get current error metrics
     */
    public ErrorMetrics getErrorMetrics() {
        return new ErrorMetrics(
            totalErrors.get(),
            rateLimitErrors.get(),
            networkErrors.get(),
            authErrors.get(),
            consecutiveFailures.get(),
            circuitState.name()
        );
    }
    
    /**
     * Error metrics container
     */
    public static class ErrorMetrics {
        private final int totalErrors;
        private final int rateLimitErrors;
        private final int networkErrors;
        private final int authErrors;
        private final int consecutiveFailures;
        private final String circuitState;
        
        public ErrorMetrics(int totalErrors, int rateLimitErrors, int networkErrors, 
                          int authErrors, int consecutiveFailures, String circuitState) {
            this.totalErrors = totalErrors;
            this.rateLimitErrors = rateLimitErrors;
            this.networkErrors = networkErrors;
            this.authErrors = authErrors;
            this.consecutiveFailures = consecutiveFailures;
            this.circuitState = circuitState;
        }
        
        // Getters
        public int getTotalErrors() { return totalErrors; }
        public int getRateLimitErrors() { return rateLimitErrors; }
        public int getNetworkErrors() { return networkErrors; }
        public int getAuthErrors() { return authErrors; }
        public int getConsecutiveFailures() { return consecutiveFailures; }
        public String getCircuitState() { return circuitState; }
    }
} 