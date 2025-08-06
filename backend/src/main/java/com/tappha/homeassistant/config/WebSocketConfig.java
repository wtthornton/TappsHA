package com.tappha.homeassistant.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tappha.homeassistant.security.JwtTokenProvider;
import com.tappha.homeassistant.websocket.AISuggestionWebSocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;

/**
 * WebSocket Configuration for AI Suggestion Engine
 * 
 * Configures WebSocket endpoints, security, and message handling for real-time
 * AI suggestion updates and notifications.
 * 
 * @see https://developers.home-assistant.io/docs/development_index
 */
@Configuration
@EnableWebSocket
@EnableWebSocketMessageBroker
@EnableWebSocketSecurity
public class WebSocketConfig implements WebSocketConfigurer, WebSocketMessageBrokerConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketConfig.class);

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private AISuggestionWebSocketHandler aiSuggestionWebSocketHandler;

    @Autowired
    private com.tappha.homeassistant.websocket.HomeAssistantWebSocketHandler homeAssistantWebSocketHandler;

    @Value("${tappha.websocket.max-text-message-size:8192}")
    private int maxTextMessageSize;

    @Value("${tappha.websocket.max-binary-message-size:8192}")
    private int maxBinaryMessageSize;

    @Value("${tappha.websocket.idle-timeout:600000}")
    private long idleTimeout;

    @Value("${tappha.websocket.max-sessions:100}")
    private int maxSessions;

    @Value("${tappha.websocket.heartbeat-interval:30000}")
    private long heartbeatInterval;

    /**
     * Configure WebSocket endpoints and handlers
     */
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        logger.info("Registering WebSocket handlers for AI Suggestion Engine");

        // Register AI Suggestion WebSocket handler
        registry.addHandler(aiSuggestionWebSocketHandler, "/ws/ai-suggestions")
                .setAllowedOrigins("*") // Configure CORS for development
                .withSockJS(); // Enable SockJS fallback

        // Register Home Assistant WebSocket handler
        registry.addHandler(homeAssistantWebSocketHandler, "/ws/home-assistant")
                .setAllowedOrigins("*")
                .withSockJS();

        logger.info("WebSocket handlers registered successfully");
    }

    /**
     * Configure message broker for STOMP over WebSocket
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple message broker for pub/sub
        config.enableSimpleBroker("/topic", "/queue")
                .setHeartbeatValue(new long[]{heartbeatInterval, heartbeatInterval});

        // Set application destination prefix
        config.setApplicationDestinationPrefixes("/app");

        // Set user destination prefix for user-specific messages
        config.setUserDestinationPrefix("/user");

        logger.info("Message broker configured with heartbeat interval: {}ms", heartbeatInterval);
    }

    /**
     * Configure STOMP endpoints
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Register STOMP endpoints
        registry.addEndpoint("/ws/stomp")
                .setAllowedOrigins("*")
                .withSockJS();

        logger.info("STOMP endpoints registered");
    }



    /**
     * Configure WebSocket container settings
     */
    @Bean
    public ServletServerContainerFactoryBean createWebSocketContainer() {
        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
        
        // Set message size limits
        container.setMaxTextMessageBufferSize(maxTextMessageSize);
        container.setMaxBinaryMessageBufferSize(maxBinaryMessageSize);
        
        // Set idle timeout
        container.setMaxSessionIdleTimeout(idleTimeout);
        
        // Note: setMaxSessions is not available in ServletServerContainerFactoryBean
        // Session limits are handled at the application level
        
        // Enable async send timeout
        container.setAsyncSendTimeout(5000L);
        
        logger.info("WebSocket container configured - Max text size: {} bytes, Max sessions: {}, Idle timeout: {}ms",
                maxTextMessageSize, maxSessions, idleTimeout);
        
        return container;
    }



    /**
     * WebSocket session manager for connection tracking
     */
    @Bean
    public com.tappha.homeassistant.websocket.WebSocketSessionManager webSocketSessionManager() {
        return new com.tappha.homeassistant.websocket.WebSocketSessionManager();
    }

    /**
     * WebSocket message broker for AI suggestions
     */
    @Bean
    public com.tappha.homeassistant.websocket.AISuggestionMessageBroker aiSuggestionMessageBroker() {
        return new com.tappha.homeassistant.websocket.AISuggestionMessageBroker(objectMapper);
    }

    /**
     * WebSocket authentication interceptor
     */
    @Bean
    public com.tappha.homeassistant.websocket.WebSocketAuthInterceptor webSocketAuthInterceptor() {
        return new com.tappha.homeassistant.websocket.WebSocketAuthInterceptor(jwtTokenProvider);
    }

    /**
     * WebSocket rate limiting interceptor
     */
    @Bean
    public com.tappha.homeassistant.websocket.WebSocketRateLimitInterceptor webSocketRateLimitInterceptor() {
        return new com.tappha.homeassistant.websocket.WebSocketRateLimitInterceptor();
    }

    /**
     * WebSocket error handler
     */
    @Bean
    public com.tappha.homeassistant.websocket.WebSocketErrorHandler webSocketErrorHandler() {
        return new com.tappha.homeassistant.websocket.WebSocketErrorHandler(objectMapper);
    }
} 