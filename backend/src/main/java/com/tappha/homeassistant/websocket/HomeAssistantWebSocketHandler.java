package com.tappha.homeassistant.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;

/**
 * Home Assistant WebSocket Handler
 * 
 * Handles WebSocket connections for Home Assistant integration
 * and real-time event processing.
 */
@Component
public class HomeAssistantWebSocketHandler extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(HomeAssistantWebSocketHandler.class);

    private final ObjectMapper objectMapper;
    private final JwtTokenProvider jwtTokenProvider;

    public HomeAssistantWebSocketHandler(ObjectMapper objectMapper, JwtTokenProvider jwtTokenProvider) {
        this.objectMapper = objectMapper;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = session.getId();
        logger.info("Home Assistant WebSocket connection established: {}", sessionId);
        
        // Send welcome message
        sendWelcomeMessage(session);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String sessionId = session.getId();
        String payload = message.getPayload();
        
        logger.debug("Received Home Assistant WebSocket message from session {}: {}", sessionId, payload);
        
        // Handle Home Assistant specific messages
        // This would typically parse and process Home Assistant events
        logger.info("Processing Home Assistant message: {}", payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = session.getId();
        logger.info("Home Assistant WebSocket connection closed: {} with status: {}", sessionId, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String sessionId = session.getId();
        logger.error("Home Assistant WebSocket transport error for session {}: {}", sessionId, exception.getMessage());
    }

    /**
     * Send welcome message
     */
    private void sendWelcomeMessage(WebSocketSession session) throws IOException {
        var welcome = objectMapper.createObjectNode();
        welcome.put("type", "welcome");
        welcome.put("message", "Home Assistant WebSocket connected");
        welcome.put("version", "1.0");
        welcome.put("timestamp", System.currentTimeMillis());
        
        session.sendMessage(new TextMessage(welcome.toString()));
    }
} 