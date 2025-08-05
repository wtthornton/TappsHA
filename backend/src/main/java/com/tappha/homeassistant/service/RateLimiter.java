package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.RateLimitStatus;

/**
 * Rate limiter interface for controlling API request rates
 * Used for OpenAI API and internal rate limiting
 */
public interface RateLimiter {
    
    /**
     * Attempt to acquire permission for a request
     * @return true if permission granted, false if rate limited
     */
    boolean acquirePermission();
    
    /**
     * Release permission after request completion
     */
    void releasePermission();
    
    /**
     * Get current rate limit status
     * @return Rate limit information
     */
    RateLimitStatus getStatus();
    
    /**
     * Check if rate limit is currently exceeded
     * @return true if rate limited, false otherwise
     */
    boolean isRateLimited();
    
    /**
     * Get time until rate limit resets
     * @return seconds until reset
     */
    long getTimeUntilReset();
    
    /**
     * Check if request is allowed for specific client and operation
     * @param clientId the client identifier (IP, user ID, etc.)
     * @param operation the operation type (login, api_call, etc.)
     * @return true if request is allowed, false if rate limited
     */
    boolean allowRequest(String clientId, String operation);
} 