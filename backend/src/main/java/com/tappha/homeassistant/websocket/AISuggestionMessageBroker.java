package com.tappha.homeassistant.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AI Suggestion Message Broker
 * 
 * Handles message routing and subscription management for AI suggestion
 * WebSocket communications.
 */
@Component
public class AISuggestionMessageBroker {

    private static final Logger logger = LoggerFactory.getLogger(AISuggestionMessageBroker.class);

    private final ObjectMapper objectMapper;

    // Subscriptions mapped by event type and connection ID
    private final Map<String, Set<String>> eventSubscriptions = new ConcurrentHashMap<>();
    
    // Session subscriptions mapped by session ID
    private final Map<String, Set<String>> sessionSubscriptions = new ConcurrentHashMap<>();

    public AISuggestionMessageBroker(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Subscribe to an event type
     */
    public void subscribe(String sessionId, String eventType, String connectionId) {
        // Add to event subscriptions
        eventSubscriptions.computeIfAbsent(eventType, k -> ConcurrentHashMap.newKeySet())
                .add(sessionId);
        
        // Add to session subscriptions
        sessionSubscriptions.computeIfAbsent(sessionId, k -> ConcurrentHashMap.newKeySet())
                .add(eventType);
        
        logger.debug("Session {} subscribed to event type {} for connection {}", 
                   sessionId, eventType, connectionId);
    }

    /**
     * Unsubscribe from an event type
     */
    public void unsubscribe(String sessionId, String eventType) {
        // Remove from event subscriptions
        Set<String> sessions = eventSubscriptions.get(eventType);
        if (sessions != null) {
            sessions.remove(sessionId);
            if (sessions.isEmpty()) {
                eventSubscriptions.remove(eventType);
            }
        }
        
        // Remove from session subscriptions
        Set<String> events = sessionSubscriptions.get(sessionId);
        if (events != null) {
            events.remove(eventType);
            if (events.isEmpty()) {
                sessionSubscriptions.remove(sessionId);
            }
        }
        
        logger.debug("Session {} unsubscribed from event type {}", sessionId, eventType);
    }

    /**
     * Unsubscribe session from all events
     */
    public void unsubscribeAll(String sessionId) {
        Set<String> events = sessionSubscriptions.remove(sessionId);
        if (events != null) {
            for (String eventType : events) {
                Set<String> sessions = eventSubscriptions.get(eventType);
                if (sessions != null) {
                    sessions.remove(sessionId);
                    if (sessions.isEmpty()) {
                        eventSubscriptions.remove(eventType);
                    }
                }
            }
        }
        
        logger.debug("Session {} unsubscribed from all events", sessionId);
    }

    /**
     * Get sessions subscribed to an event type
     */
    public Set<String> getSubscribers(String eventType) {
        return eventSubscriptions.getOrDefault(eventType, ConcurrentHashMap.newKeySet());
    }

    /**
     * Get event types subscribed by a session
     */
    public Set<String> getSessionSubscriptions(String sessionId) {
        return sessionSubscriptions.getOrDefault(sessionId, ConcurrentHashMap.newKeySet());
    }

    /**
     * Check if session is subscribed to event type
     */
    public boolean isSubscribed(String sessionId, String eventType) {
        Set<String> events = sessionSubscriptions.get(sessionId);
        return events != null && events.contains(eventType);
    }

    /**
     * Get subscription count for an event type
     */
    public int getSubscriptionCount(String eventType) {
        Set<String> sessions = eventSubscriptions.get(eventType);
        return sessions != null ? sessions.size() : 0;
    }

    /**
     * Get total subscription count
     */
    public int getTotalSubscriptionCount() {
        return sessionSubscriptions.size();
    }

    /**
     * Broadcast message to all subscribers of an event type
     */
    public void broadcastToEventType(String eventType, String message) {
        Set<String> subscribers = getSubscribers(eventType);
        logger.debug("Broadcasting to {} subscribers for event type: {}", subscribers.size(), eventType);
        
        // This would typically use the WebSocketSessionManager to send messages
        // For now, just log the broadcast
        logger.info("Broadcasting message to {} subscribers for event type {}", subscribers.size(), eventType);
    }

    /**
     * Send message to specific session
     */
    public void sendToSession(String sessionId, String message) {
        logger.debug("Sending message to session: {}", sessionId);
        // This would typically use the WebSocketSessionManager to send the message
        logger.info("Sending message to session {}", sessionId);
    }
} 