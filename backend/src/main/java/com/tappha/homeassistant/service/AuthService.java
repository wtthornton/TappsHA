package com.tappha.homeassistant.service;

import com.tappha.homeassistant.dto.LoginRequest;
import com.tappha.homeassistant.dto.LoginResponse;
import com.tappha.homeassistant.dto.RefreshTokenRequest;
import com.tappha.homeassistant.dto.RefreshTokenResponse;
import com.tappha.homeassistant.dto.LogoutResponse;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.repository.UserRepository;
import com.tappha.homeassistant.exception.AuthenticationException;
import com.tappha.homeassistant.exception.RateLimitException;
import com.tappha.homeassistant.service.RateLimiter;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authentication Service for OAuth 2.1 and JWT token management
 * 
 * Implements secure authentication with rate limiting, token management,
 * and OWASP Top-10 compliance for security best practices.
 * 
 * @see https://owasp.org/www-project-top-ten/
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiter rateLimiter;

    // JWT configuration
    private static final SecretKey JWT_SECRET = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    private static final long ACCESS_TOKEN_EXPIRY = 3600; // 1 hour
    private static final long REFRESH_TOKEN_EXPIRY = 604800; // 7 days

    // Token blacklist for logout
    private static final Set<String> BLACKLISTED_TOKENS = ConcurrentHashMap.newKeySet();

    /**
     * Authenticate user and generate JWT tokens
     * 
     * @param loginRequest User credentials
     * @param request HTTP request for IP tracking
     * @return Login response with tokens
     */
    public LoginResponse login(LoginRequest loginRequest, HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);
        
        // Check rate limiting
        if (!rateLimiter.allowRequest(clientIp, "login")) {
            throw new RateLimitException("Too many login attempts");
        }

        // Find user by username
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new AuthenticationException("Invalid credentials"));

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            log.warn("Failed login attempt for user: {}", loginRequest.getUsername());
            throw new AuthenticationException("Invalid credentials");
        }

        // Generate tokens
        String accessToken = generateAccessToken(user);
        String refreshToken = generateRefreshToken(user);

        // Create user info
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(Arrays.asList(user.getRoles().split(",")))
                .build();

        log.info("Successful login for user: {}", user.getUsername());

        return LoginResponse.builder()
                .success(true)
                .message("Login successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(ACCESS_TOKEN_EXPIRY)
                .user(userInfo)
                .build();
    }

    /**
     * Refresh JWT access token using refresh token
     * 
     * @param refreshRequest Refresh token request
     * @param request HTTP request for security tracking
     * @return New access token
     */
    public RefreshTokenResponse refreshToken(RefreshTokenRequest refreshRequest, HttpServletRequest request) {
        try {
            // Validate refresh token
            Claims claims = Jwts.parser()
                    .setSigningKey(JWT_SECRET)
                    .parseClaimsJws(refreshRequest.getRefreshToken())
                    .getBody();

            // Check if token is blacklisted
            if (BLACKLISTED_TOKENS.contains(refreshRequest.getRefreshToken())) {
                throw new AuthenticationException("Token has been revoked");
            }

            // Extract user information
            String userId = claims.getSubject();
            User user = userRepository.findById(UUID.fromString(userId))
                    .orElseThrow(() -> new AuthenticationException("User not found"));

            // Generate new access token
            String newAccessToken = generateAccessToken(user);

            log.info("Token refreshed for user: {}", user.getUsername());

            return RefreshTokenResponse.builder()
                    .success(true)
                    .message("Token refreshed successfully")
                    .accessToken(newAccessToken)
                    .expiresIn(ACCESS_TOKEN_EXPIRY)
                    .tokenType("Bearer")
                    .build();

        } catch (Exception e) {
            log.warn("Token refresh failed: {}", e.getMessage());
            throw new AuthenticationException("Invalid refresh token");
        }
    }

    /**
     * Logout user and invalidate refresh token
     * 
     * @param logoutRequest Logout request with refresh token
     * @param request HTTP request for security tracking
     * @return Logout confirmation
     */
    public LogoutResponse logout(RefreshTokenRequest logoutRequest, HttpServletRequest request) {
        try {
            // Validate refresh token
            Claims claims = Jwts.parser()
                    .setSigningKey(JWT_SECRET)
                    .parseClaimsJws(logoutRequest.getRefreshToken())
                    .getBody();

            // Add token to blacklist
            BLACKLISTED_TOKENS.add(logoutRequest.getRefreshToken());

            log.info("User logged out successfully");

            return LogoutResponse.builder()
                    .success(true)
                    .message("Logged out successfully")
                    .build();

        } catch (Exception e) {
            log.warn("Logout failed: {}", e.getMessage());
            // Still return success to prevent information leakage
            return LogoutResponse.builder()
                    .success(true)
                    .message("Logged out successfully")
                    .build();
        }
    }

    /**
     * Validate JWT access token
     * 
     * @param token JWT access token
     * @return True if token is valid
     */
    public boolean validateToken(String token) {
        try {
            // Check if token is blacklisted
            if (BLACKLISTED_TOKENS.contains(token)) {
                return false;
            }

            // Validate token
            Claims claims = Jwts.parser()
                    .setSigningKey(JWT_SECRET)
                    .parseClaimsJws(token)
                    .getBody();

            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                return false;
            }

            return true;

        } catch (Exception e) {
            log.debug("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get user information from JWT token
     * 
     * @param token JWT access token
     * @return User information map
     */
    public Map<String, Object> getUserInfoFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .setSigningKey(JWT_SECRET)
                    .parseClaimsJws(token)
                    .getBody();

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", claims.getSubject());
            userInfo.put("username", claims.get("username"));
            userInfo.put("email", claims.get("email"));
            userInfo.put("roles", claims.get("roles"));

            return userInfo;

        } catch (Exception e) {
            log.warn("Failed to extract user info from token: {}", e.getMessage());
            throw new AuthenticationException("Invalid token");
        }
    }

    /**
     * Generate JWT access token
     */
    private String generateAccessToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(ACCESS_TOKEN_EXPIRY, ChronoUnit.SECONDS);

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("username", user.getUsername())
                .claim("email", user.getEmail())
                .claim("roles", user.getRoles())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(JWT_SECRET)
                .compact();
    }

    /**
     * Generate JWT refresh token
     */
    private String generateRefreshToken(User user) {
        Instant now = Instant.now();
        Instant expiry = now.plus(REFRESH_TOKEN_EXPIRY, ChronoUnit.SECONDS);

        return Jwts.builder()
                .setSubject(user.getId().toString())
                .claim("type", "refresh")
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiry))
                .signWith(JWT_SECRET)
                .compact();
    }

    /**
     * Get client IP address for security tracking
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
} 