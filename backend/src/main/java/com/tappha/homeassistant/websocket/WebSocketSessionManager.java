package com.tappha.homeassistant.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket Session Manager
 * 
 * Manages active WebSocket sessions and provides session tracking
 * functionality for the AI Suggestion Engine.
 */
@Component
public class WebSocketSessionManager {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketSessionManager.class);

    // Active sessions mapped by session ID
    private final Map<String, WebSocketSession> activeSessions = new ConcurrentHashMap<>();

    /**
     * Register a new WebSocket session
     */
    public void registerSession(String sessionId, WebSocketSession session) {
        activeSessions.put(sessionId, session);
        logger.debug("Registered WebSocket session: {}", sessionId);
    }

    /**
     * Unregister a WebSocket session
     */
    public void unregisterSession(String sessionId) {
        WebSocketSession session = activeSessions.remove(sessionId);
        if (session != null) {
            logger.debug("Unregistered WebSocket session: {}", sessionId);
        }
    }

    /**
     * Get session by ID
     */
    public WebSocketSession getSession(String sessionId) {
        return activeSessions.get(sessionId);
    }

    /**
     * Check if session exists
     */
    public boolean hasSession(String sessionId) {
        return activeSessions.containsKey(sessionId);
    }

    /**
     * Get all active sessions
     */
    public Map<String, WebSocketSession> getAllSessions() {
        return new ConcurrentHashMap<>(activeSessions);
    }

    /**
     * Get active session count
     */
    public int getActiveSessionCount() {
        return activeSessions.size();
    }

    /**
     * Clean up closed sessions
     */
    public void cleanupClosedSessions() {
        activeSessions.entrySet().removeIf(entry -> {
            WebSocketSession session = entry.getValue();
            if (!session.isOpen()) {
                logger.debug("Cleaning up closed session: {}", entry.getKey());
                return true;
            }
            return false;
        });
    }
} 