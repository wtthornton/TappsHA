package com.tappha.homeassistant.exception;

/**
 * Exception thrown when rate limiting is exceeded
 * Used for both OpenAI API rate limits and internal rate limiting
 */
public class RateLimitException extends RuntimeException {
    
    private final long retryAfterSeconds;
    private final int limit;
    private final int remaining;
    
    public RateLimitException(String message) {
        super(message);
        this.retryAfterSeconds = 60;
        this.limit = 0;
        this.remaining = 0;
    }
    
    public RateLimitException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
        this.limit = 0;
        this.remaining = 0;
    }
    
    public RateLimitException(String message, long retryAfterSeconds, int limit, int remaining) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
        this.limit = limit;
        this.remaining = remaining;
    }
    
    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
    
    public int getLimit() {
        return limit;
    }
    
    public int getRemaining() {
        return remaining;
    }
} 