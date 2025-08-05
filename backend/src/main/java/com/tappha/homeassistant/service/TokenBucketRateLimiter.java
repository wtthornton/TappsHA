package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.RateLimitStatus;
import com.tappha.homeassistant.exception.RateLimitException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Token bucket rate limiter implementation
 * Provides rate limiting for OpenAI API calls
 */
@Service
public class TokenBucketRateLimiter implements RateLimiter {
    
    private static final Logger logger = LoggerFactory.getLogger(TokenBucketRateLimiter.class);
    
    @Value("${openai.rate-limit.requests-per-minute:60}")
    private int requestsPerMinute;
    
    @Value("${openai.rate-limit.tokens-per-minute:150000}")
    private int tokensPerMinute;
    
    @Value("${openai.rate-limit.burst-size:10}")
    private int burstSize;
    
    private final AtomicInteger requestTokens;
    private final AtomicInteger tokenTokens;
    private final AtomicLong lastRequestRefill;
    private final AtomicLong lastTokenRefill;
    
    public TokenBucketRateLimiter() {
        this.requestTokens = new AtomicInteger(burstSize);
        this.tokenTokens = new AtomicInteger(tokensPerMinute);
        this.lastRequestRefill = new AtomicLong(Instant.now().getEpochSecond());
        this.lastTokenRefill = new AtomicLong(Instant.now().getEpochSecond());
    }
    
    @Override
    public boolean acquirePermission() {
        try {
            refillTokens();
            
            // Check if we have tokens available
            if (requestTokens.get() > 0 && tokenTokens.get() > 0) {
                requestTokens.decrementAndGet();
                tokenTokens.decrementAndGet();
                return true;
            }
            
            logger.warn("Rate limit exceeded - requests: {}, tokens: {}", 
                requestTokens.get(), tokenTokens.get());
            return false;
            
        } catch (Exception e) {
            logger.error("Error in rate limiter", e);
            return false;
        }
    }
    
    @Override
    public void releasePermission() {
        // Token bucket doesn't need to release tokens
        // Tokens are consumed and refilled over time
    }
    
    @Override
    public RateLimitStatus getStatus() {
        refillTokens();
        
        return RateLimitStatus.builder()
            .rateLimited(requestTokens.get() <= 0 || tokenTokens.get() <= 0)
            .limit(requestsPerMinute)
            .remaining(Math.min(requestTokens.get(), tokenTokens.get()))
            .resetTime(Instant.now().plusSeconds(60).getEpochSecond())
            .timeUntilReset(60)
            .limitType("requests_per_minute")
            .scope("api_key")
            .build();
    }
    
    @Override
    public boolean isRateLimited() {
        refillTokens();
        return requestTokens.get() <= 0 || tokenTokens.get() <= 0;
    }
    
    @Override
    public long getTimeUntilReset() {
        return 60; // 1 minute window
    }
    
    /**
     * Refill tokens based on time elapsed
     */
    private void refillTokens() {
        long now = Instant.now().getEpochSecond();
        
        // Refill request tokens
        long requestTimeElapsed = now - lastRequestRefill.get();
        if (requestTimeElapsed >= 60) { // 1 minute window
            int tokensToAdd = (int) (requestTimeElapsed / 60) * requestsPerMinute;
            int currentTokens = requestTokens.get();
            int newTokens = Math.min(currentTokens + tokensToAdd, burstSize);
            requestTokens.set(newTokens);
            lastRequestRefill.set(now);
        }
        
        // Refill token tokens
        long tokenTimeElapsed = now - lastTokenRefill.get();
        if (tokenTimeElapsed >= 60) { // 1 minute window
            int tokensToAdd = (int) (tokenTimeElapsed / 60) * tokensPerMinute;
            int currentTokens = tokenTokens.get();
            int newTokens = Math.min(currentTokens + tokensToAdd, tokensPerMinute);
            tokenTokens.set(newTokens);
            lastTokenRefill.set(now);
        }
    }
    
    /**
     * Consume tokens for a specific request
     * @param estimatedTokens Estimated tokens for the request
     * @return true if tokens were consumed, false if rate limited
     */
    public boolean consumeTokens(int estimatedTokens) {
        refillTokens();
        
        if (requestTokens.get() > 0 && tokenTokens.get() >= estimatedTokens) {
            requestTokens.decrementAndGet();
            tokenTokens.addAndGet(-estimatedTokens);
            return true;
        }
        
        return false;
    }
    
    /**
     * Get current token counts
     * @return Array with [requestTokens, tokenTokens]
     */
    public int[] getTokenCounts() {
        refillTokens();
        return new int[]{requestTokens.get(), tokenTokens.get()};
    }
    
    @Override
    public boolean allowRequest(String clientId, String operation) {
        // For now, use the general rate limiting logic
        // In a production system, you would implement per-client rate limiting
        return acquirePermission();
    }
} 