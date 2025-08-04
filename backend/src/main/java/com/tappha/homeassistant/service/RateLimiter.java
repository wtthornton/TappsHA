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
} 