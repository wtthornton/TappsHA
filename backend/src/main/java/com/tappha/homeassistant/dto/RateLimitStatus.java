package com.tappha.homeassistant.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Rate limit status information
 * Contains current rate limit state and limits
 */
@Data
@Builder
public class RateLimitStatus {
    
    private boolean rateLimited;
    private int limit;
    private int remaining;
    private long resetTime;
    private long timeUntilReset;
    private String limitType; // 'requests_per_minute', 'tokens_per_minute', etc.
    private String scope; // 'user', 'global', 'api_key'
} 