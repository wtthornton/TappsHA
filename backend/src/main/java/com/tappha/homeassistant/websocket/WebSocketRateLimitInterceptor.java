package com.tappha.homeassistant.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * WebSocket Rate Limit Interceptor
 * 
 * Implements rate limiting for WebSocket connections to prevent abuse.
 */
@Component
public class WebSocketRateLimitInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketRateLimitInterceptor.class);

    // Rate limit settings
    private static final int MAX_MESSAGES_PER_MINUTE = 100;
    private static final int MAX_CONNECTIONS_PER_IP = 5;
    private static final long RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

    // Rate limit tracking
    private final Map<String, AtomicInteger> messageCounts = new ConcurrentHashMap<>();
    private final Map<String, Long> lastResetTimes = new ConcurrentHashMap<>();
    private final Map<String, AtomicInteger> connectionCounts = new ConcurrentHashMap<>();

    /**
     * Check if message is allowed for session
     */
    public boolean isMessageAllowed(WebSocketSession session) {
        String sessionId = session.getId();
        String clientIp = getClientIp(session);
        
        // Check connection limit per IP
        if (!isConnectionAllowed(clientIp)) {
            logger.warn("Connection limit exceeded for IP: {}", clientIp);
            return false;
        }
        
        // Check message rate limit
        if (!isMessageRateAllowed(sessionId)) {
            logger.warn("Message rate limit exceeded for session: {}", sessionId);
            return false;
        }
        
        return true;
    }

    /**
     * Record message for rate limiting
     */
    public void recordMessage(WebSocketSession session) {
        String sessionId = session.getId();
        String clientIp = getClientIp(session);
        
        // Increment message count
        AtomicInteger messageCount = messageCounts.computeIfAbsent(sessionId, k -> new AtomicInteger(0));
        messageCount.incrementAndGet();
        
        // Set last reset time if not set
        lastResetTimes.computeIfAbsent(sessionId, k -> System.currentTimeMillis());
        
        logger.debug("Recorded message for session: {} (IP: {})", sessionId, clientIp);
    }

    /**
     * Record new connection
     */
    public void recordConnection(WebSocketSession session) {
        String clientIp = getClientIp(session);
        AtomicInteger connectionCount = connectionCounts.computeIfAbsent(clientIp, k -> new AtomicInteger(0));
        connectionCount.incrementAndGet();
        
        logger.debug("Recorded connection for IP: {}", clientIp);
    }

    /**
     * Record connection close
     */
    public void recordConnectionClose(WebSocketSession session) {
        String sessionId = session.getId();
        String clientIp = getClientIp(session);
        
        // Clean up message tracking
        messageCounts.remove(sessionId);
        lastResetTimes.remove(sessionId);
        
        // Decrement connection count
        AtomicInteger connectionCount = connectionCounts.get(clientIp);
        if (connectionCount != null) {
            connectionCount.decrementAndGet();
            if (connectionCount.get() <= 0) {
                connectionCounts.remove(clientIp);
            }
        }
        
        logger.debug("Recorded connection close for session: {} (IP: {})", sessionId, clientIp);
    }

    /**
     * Check if connection is allowed for IP
     */
    private boolean isConnectionAllowed(String clientIp) {
        AtomicInteger connectionCount = connectionCounts.get(clientIp);
        if (connectionCount == null) {
            return true;
        }
        return connectionCount.get() < MAX_CONNECTIONS_PER_IP;
    }

    /**
     * Check if message rate is allowed for session
     */
    private boolean isMessageRateAllowed(String sessionId) {
        AtomicInteger messageCount = messageCounts.get(sessionId);
        if (messageCount == null) {
            return true;
        }
        
        // Check if rate limit window has expired
        Long lastReset = lastResetTimes.get(sessionId);
        if (lastReset != null && System.currentTimeMillis() - lastReset > RATE_LIMIT_WINDOW_MS) {
            // Reset counter
            messageCount.set(0);
            lastResetTimes.put(sessionId, System.currentTimeMillis());
            return true;
        }
        
        return messageCount.get() < MAX_MESSAGES_PER_MINUTE;
    }

    /**
     * Get client IP address from session
     */
    private String getClientIp(WebSocketSession session) {
        try {
            // Try to get IP from handshake headers
            String forwardedFor = session.getHandshakeHeaders().getFirst("X-Forwarded-For");
            if (forwardedFor != null) {
                return forwardedFor.split(",")[0].trim();
            }
            
            // Fallback to remote address
            return session.getRemoteAddress().getAddress().getHostAddress();
        } catch (Exception e) {
            logger.warn("Could not determine client IP for session: {}", session.getId());
            return "unknown";
        }
    }

    /**
     * Get current rate limit statistics
     */
    public Map<String, Object> getRateLimitStats() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("activeSessions", messageCounts.size());
        stats.put("activeConnections", connectionCounts.size());
        stats.put("maxMessagesPerMinute", MAX_MESSAGES_PER_MINUTE);
        stats.put("maxConnectionsPerIp", MAX_CONNECTIONS_PER_IP);
        return stats;
    }
} 