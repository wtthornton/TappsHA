package com.tappha.homeassistant.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/**
 * JWT Token Provider for WebSocket Authentication
 * 
 * Handles JWT token generation, validation, and extraction for secure
 * WebSocket connections in the AI Suggestion Engine.
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${tappha.jwt.secret:default-jwt-secret-change-in-production}")
    private String jwtSecret;

    @Value("${tappha.jwt.expiration:86400000}")
    private long jwtExpiration;

    private final SecretKey secretKey;

    public JwtTokenProvider() {
        // Generate a secure key for JWT signing
        this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    }

    /**
     * Generate JWT token for user
     */
    public String generateToken(String userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", "USER");
        
        return createToken(claims, userId);
    }

    /**
     * Create JWT token with claims
     */
    private String createToken(Map<String, Object> claims, String subject) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .setId(UUID.randomUUID().toString())
                .signWith(secretKey, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            logger.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Extract user ID from token
     */
    public String getUserIdFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * Extract email from token
     */
    public String getEmailFromToken(String token) {
        Claims claims = getAllClaimsFromToken(token);
        return claims.get("email", String.class);
    }

    /**
     * Extract expiration date from token
     */
    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * Extract claim from token
     */
    private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Get all claims from token
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Extract token from authorization header
     */
    public String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }

    /**
     * Generate token for WebSocket connection
     */
    public String generateWebSocketToken(String userId, String connectionId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("connectionId", connectionId);
        claims.put("type", "websocket");
        claims.put("scope", "ai-suggestions");
        
        return createToken(claims, userId);
    }

    /**
     * Validate WebSocket token
     */
    public boolean validateWebSocketToken(String token, String expectedUserId) {
        try {
            if (!validateToken(token)) {
                return false;
            }
            
            String userId = getUserIdFromToken(token);
            return userId.equals(expectedUserId);
        } catch (Exception e) {
            logger.warn("WebSocket token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get connection ID from WebSocket token
     */
    public String getConnectionIdFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.get("connectionId", String.class);
        } catch (Exception e) {
            logger.warn("Failed to extract connection ID from token: {}", e.getMessage());
            return null;
        }
    }
} 