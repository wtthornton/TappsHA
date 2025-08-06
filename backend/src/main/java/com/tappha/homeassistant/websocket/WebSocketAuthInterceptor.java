package com.tappha.homeassistant.websocket;

import com.tappha.homeassistant.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * WebSocket Authentication Interceptor
 * 
 * Handles authentication for WebSocket connections using JWT tokens.
 */
@Component
public class WebSocketAuthInterceptor extends TextWebSocketHandler {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAuthInterceptor.class);

    private final JwtTokenProvider jwtTokenProvider;

    public WebSocketAuthInterceptor(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * Validate WebSocket session authentication
     */
    public boolean validateSession(WebSocketSession session) {
        try {
            // Extract token from session attributes or headers
            String token = extractTokenFromSession(session);
            if (token == null) {
                logger.warn("No authentication token found in session: {}", session.getId());
                return false;
            }

            // Validate token
            if (!jwtTokenProvider.validateToken(token)) {
                logger.warn("Invalid authentication token for session: {}", session.getId());
                return false;
            }

            logger.debug("Session authentication successful: {}", session.getId());
            return true;

        } catch (Exception e) {
            logger.error("Error validating session authentication: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract token from WebSocket session
     */
    private String extractTokenFromSession(WebSocketSession session) {
        // Try to get token from session attributes
        Object tokenObj = session.getAttributes().get("token");
        if (tokenObj instanceof String) {
            return (String) tokenObj;
        }

        // Try to get token from handshake headers
        String authHeader = session.getHandshakeHeaders().getFirst("Authorization");
        if (authHeader != null) {
            return jwtTokenProvider.extractTokenFromHeader(authHeader);
        }

        return null;
    }

    /**
     * Set authentication token for session
     */
    public void setSessionToken(WebSocketSession session, String token) {
        session.getAttributes().put("token", token);
        logger.debug("Set authentication token for session: {}", session.getId());
    }

    /**
     * Get user ID from session
     */
    public String getUserIdFromSession(WebSocketSession session) {
        try {
            String token = extractTokenFromSession(session);
            if (token != null) {
                return jwtTokenProvider.getUserIdFromToken(token);
            }
        } catch (Exception e) {
            logger.error("Error extracting user ID from session: {}", e.getMessage());
        }
        return null;
    }
} 