package com.tappha.homeassistant.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.tappha.homeassistant.entity.HomeAssistantConnection;
import com.tappha.homeassistant.entity.HomeAssistantEvent;
import com.tappha.homeassistant.exception.HomeAssistantWebSocketException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.WebSocketClient;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for managing WebSocket connections to Home Assistant
 * Handles real-time event subscription and message processing
 */
@Service
public class HomeAssistantWebSocketClient {
    
    private static final Logger logger = LoggerFactory.getLogger(HomeAssistantWebSocketClient.class);
    
    private final ObjectMapper objectMapper;
    private final WebSocketClient webSocketClient;
    private final Map<UUID, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
    private final Map<UUID, ConnectionState> connectionStates = new ConcurrentHashMap<>();
    private final AtomicLong messageIdCounter = new AtomicLong(1);
    
    @Value("${tappha.homeassistant.websocket.heartbeat-interval:30000}")
    private long heartbeatInterval;
    
    @Value("${tappha.homeassistant.websocket.reconnect-delay:5000}")
    private long reconnectDelay;
    
    @Value("${tappha.homeassistant.websocket.max-reconnect-attempts:10}")
    private int maxReconnectAttempts;
    
    public HomeAssistantWebSocketClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.webSocketClient = new StandardWebSocketClient();
    }
    
    /**
     * Connect to Home Assistant WebSocket
     * @param connection Home Assistant connection
     * @return true if connection successful
     */
    public boolean connect(HomeAssistantConnection connection) {
        try {
            String wsUrl = connection.getUrl().replace("http", "ws") + "/api/websocket";
            URI uri = URI.create(wsUrl);
            
            logger.info("Connecting to Home Assistant WebSocket: {}", wsUrl);
            
            WebSocketHandler handler = new HomeAssistantWebSocketHandler(connection);
            WebSocketSession session = webSocketClient.doHandshake(handler, null, uri).get();
            
            activeSessions.put(connection.getId(), session);
            connectionStates.put(connection.getId(), ConnectionState.CONNECTING);
            
            // Send authentication message
            sendAuthMessage(connection);
            
            // Subscribe to events
            subscribeToEvents(connection);
            
            connectionStates.put(connection.getId(), ConnectionState.CONNECTED);
            connection.setStatus(HomeAssistantConnection.ConnectionStatus.CONNECTED);
            connection.updateLastConnected();
            
            logger.info("Successfully connected to Home Assistant WebSocket for connection: {}", connection.getId());
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to connect to Home Assistant WebSocket for connection: {}", connection.getId(), e);
            connectionStates.put(connection.getId(), ConnectionState.ERROR);
            connection.setStatus(HomeAssistantConnection.ConnectionStatus.ERROR);
            return false;
        }
    }
    
    /**
     * Disconnect from Home Assistant WebSocket
     * @param connectionId Connection ID
     */
    public void disconnect(UUID connectionId) {
        try {
            WebSocketSession session = activeSessions.remove(connectionId);
            if (session != null && session.isOpen()) {
                session.close();
                logger.info("Disconnected from Home Assistant WebSocket for connection: {}", connectionId);
            }
            
            connectionStates.remove(connectionId);
            
        } catch (Exception e) {
            logger.error("Error disconnecting from Home Assistant WebSocket for connection: {}", connectionId, e);
        }
    }
    
    /**
     * Send message to Home Assistant WebSocket
     * @param connectionId Connection ID
     * @param message Message to send
     * @return true if message sent successfully
     */
    public boolean sendMessage(UUID connectionId, String message) {
        try {
            WebSocketSession session = activeSessions.get(connectionId);
            if (session != null && session.isOpen()) {
                session.sendMessage(new TextMessage(message));
                return true;
            } else {
                logger.warn("WebSocket session not available for connection: {}", connectionId);
                return false;
            }
        } catch (Exception e) {
            logger.error("Error sending message to Home Assistant WebSocket for connection: {}", connectionId, e);
            return false;
        }
    }
    
    /**
     * Get connection state
     * @param connectionId Connection ID
     * @return Connection state
     */
    public ConnectionState getConnectionState(UUID connectionId) {
        return connectionStates.getOrDefault(connectionId, ConnectionState.DISCONNECTED);
    }
    
    /**
     * Check if connection is active
     * @param connectionId Connection ID
     * @return true if connection is active
     */
    public boolean isConnected(UUID connectionId) {
        WebSocketSession session = activeSessions.get(connectionId);
        return session != null && session.isOpen();
    }
    
    /**
     * Send authentication message
     * @param connection Home Assistant connection
     */
    private void sendAuthMessage(HomeAssistantConnection connection) {
        try {
            ObjectNode authMessage = objectMapper.createObjectNode();
            authMessage.put("type", "auth");
            authMessage.put("access_token", connection.getEncryptedToken()); // Note: This should be decrypted in production
            
            String message = objectMapper.writeValueAsString(authMessage);
            sendMessage(connection.getId(), message);
            
        } catch (Exception e) {
            logger.error("Error sending authentication message for connection: {}", connection.getId(), e);
            throw new HomeAssistantWebSocketException("Failed to authenticate with Home Assistant", e);
        }
    }
    
    /**
     * Subscribe to Home Assistant events
     * @param connection Home Assistant connection
     */
    private void subscribeToEvents(HomeAssistantConnection connection) {
        try {
            ObjectNode subscribeMessage = objectMapper.createObjectNode();
            subscribeMessage.put("id", messageIdCounter.getAndIncrement());
            subscribeMessage.put("type", "subscribe_events");
            
            String message = objectMapper.writeValueAsString(subscribeMessage);
            sendMessage(connection.getId(), message);
            
        } catch (Exception e) {
            logger.error("Error subscribing to events for connection: {}", connection.getId(), e);
            throw new HomeAssistantWebSocketException("Failed to subscribe to Home Assistant events", e);
        }
    }
    
    /**
     * Send ping message for heartbeat
     * @param connectionId Connection ID
     */
    public void sendPing(UUID connectionId) {
        try {
            ObjectNode pingMessage = objectMapper.createObjectNode();
            pingMessage.put("id", messageIdCounter.getAndIncrement());
            pingMessage.put("type", "ping");
            
            String message = objectMapper.writeValueAsString(pingMessage);
            sendMessage(connectionId, message);
            
        } catch (Exception e) {
            logger.error("Error sending ping message for connection: {}", connectionId, e);
        }
    }
    
    /**
     * WebSocket handler for Home Assistant connections
     */
    private class HomeAssistantWebSocketHandler extends TextWebSocketHandler {
        
        private final HomeAssistantConnection connection;
        
        public HomeAssistantWebSocketHandler(HomeAssistantConnection connection) {
            this.connection = connection;
        }
        
        @Override
        public void afterConnectionEstablished(WebSocketSession session) throws Exception {
            logger.info("WebSocket connection established for connection: {}", connection.getId());
            connectionStates.put(connection.getId(), ConnectionState.CONNECTED);
        }
        
        @Override
        protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
            try {
                String payload = message.getPayload();
                JsonNode jsonMessage = objectMapper.readTree(payload);
                
                String messageType = jsonMessage.get("type").asText();
                
                switch (messageType) {
                    case "auth_ok":
                        handleAuthOk();
                        break;
                    case "auth_required":
                        handleAuthRequired();
                        break;
                    case "auth_invalid":
                        handleAuthInvalid();
                        break;
                    case "event":
                        handleEvent(jsonMessage);
                        break;
                    case "pong":
                        handlePong();
                        break;
                    default:
                        logger.debug("Received unknown message type: {} for connection: {}", messageType, connection.getId());
                }
                
            } catch (Exception e) {
                logger.error("Error handling WebSocket message for connection: {}", connection.getId(), e);
            }
        }
        
        @Override
        public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
            logger.info("WebSocket connection closed for connection: {} with status: {}", connection.getId(), status);
            connectionStates.put(connection.getId(), ConnectionState.DISCONNECTED);
            connection.setStatus(HomeAssistantConnection.ConnectionStatus.DISCONNECTED);
            activeSessions.remove(connection.getId());
        }
        
        @Override
        public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
            logger.error("WebSocket transport error for connection: {}", connection.getId(), exception);
            connectionStates.put(connection.getId(), ConnectionState.ERROR);
            connection.setStatus(HomeAssistantConnection.ConnectionStatus.ERROR);
        }
        
        private void handleAuthOk() {
            logger.info("Authentication successful for connection: {}", connection.getId());
            connectionStates.put(connection.getId(), ConnectionState.AUTHENTICATED);
        }
        
        private void handleAuthRequired() {
            logger.warn("Authentication required for connection: {}", connection.getId());
            connectionStates.put(connection.getId(), ConnectionState.AUTH_REQUIRED);
        }
        
        private void handleAuthInvalid() {
            logger.error("Authentication failed for connection: {}", connection.getId());
            connectionStates.put(connection.getId(), ConnectionState.AUTH_FAILED);
            connection.setStatus(HomeAssistantConnection.ConnectionStatus.ERROR);
        }
        
        private void handleEvent(JsonNode eventMessage) {
            try {
                // Create HomeAssistantEvent entity
                HomeAssistantEvent event = new HomeAssistantEvent();
                event.setId(UUID.randomUUID());
                event.setConnection(connection);
                event.setTimestamp(OffsetDateTime.now());
                
                if (eventMessage.has("event")) {
                    JsonNode eventData = eventMessage.get("event");
                    event.setEventType(eventData.get("event_type").asText());
                    
                    if (eventData.has("data")) {
                        JsonNode data = eventData.get("data");
                        if (data.has("entity_id")) {
                            event.setEntityId(data.get("entity_id").asText());
                        }
                        if (data.has("old_state")) {
                            event.setOldState(data.get("old_state").toString());
                        }
                        if (data.has("new_state")) {
                            event.setNewState(data.get("new_state").toString());
                        }
                        if (data.has("attributes")) {
                            event.setAttributes(data.get("attributes").toString());
                        }
                    }
                }
                
                // Update connection last seen
                connection.updateLastSeen();
                
                logger.debug("Received event for connection: {} - Type: {}, Entity: {}", 
                           connection.getId(), event.getEventType(), event.getEntityId());
                
                // TODO: Process event through Kafka or event processing pipeline
                
            } catch (Exception e) {
                logger.error("Error processing event for connection: {}", connection.getId(), e);
            }
        }
        
        private void handlePong() {
            logger.debug("Received pong for connection: {}", connection.getId());
            connection.updateLastSeen();
        }
    }
    
    /**
     * Connection state enum
     */
    public enum ConnectionState {
        DISCONNECTED,
        CONNECTING,
        CONNECTED,
        AUTH_REQUIRED,
        AUTHENTICATED,
        AUTH_FAILED,
        ERROR
    }
} 