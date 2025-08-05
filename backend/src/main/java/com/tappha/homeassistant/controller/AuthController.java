package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.LoginRequest;
import com.tappha.homeassistant.dto.LoginResponse;
import com.tappha.homeassistant.dto.RefreshTokenRequest;
import com.tappha.homeassistant.dto.RefreshTokenResponse;
import com.tappha.homeassistant.dto.LogoutResponse;
import com.tappha.homeassistant.service.AuthService;
import com.tappha.homeassistant.exception.AuthenticationException;
import com.tappha.homeassistant.exception.RateLimitException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;

/**
 * Authentication Controller for OAuth 2.1 and JWT token management
 * 
 * Provides secure authentication endpoints with rate limiting, 
 * comprehensive error handling, and OWASP Top-10 compliance.
 * 
 * @see https://developers.home-assistant.io/docs/api/rest/
 * @see https://owasp.org/www-project-top-ten/
 */
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication and authorization endpoints")
public class AuthController {

    private final AuthService authService;

    /**
     * User login endpoint with OAuth 2.1 password grant
     * 
     * @param loginRequest User credentials
     * @param request HTTP request for IP tracking
     * @return JWT tokens and user information
     */
    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate user with username/password and return JWT tokens")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletRequest request) {
        
        try {
            log.info("Login attempt for user: {} from IP: {}", 
                    loginRequest.getUsername(), 
                    getClientIpAddress(request));
            
            LoginResponse response = authService.login(loginRequest, request);
            
            log.info("Successful login for user: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
            
        } catch (RateLimitException e) {
            log.warn("Rate limit exceeded for user: {} from IP: {}", 
                    loginRequest.getUsername(), 
                    getClientIpAddress(request));
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("Too many login attempts. Please try again later.")
                            .build());
                            
        } catch (AuthenticationException e) {
            log.warn("Authentication failed for user: {} from IP: {}", 
                    loginRequest.getUsername(), 
                    getClientIpAddress(request));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("Invalid username or password")
                            .build());
                            
        } catch (Exception e) {
            log.error("Unexpected error during login for user: {}", loginRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(LoginResponse.builder()
                            .success(false)
                            .message("Internal server error")
                            .build());
        }
    }

    /**
     * Refresh JWT access token using refresh token
     * 
     * @param refreshRequest Refresh token request
     * @param request HTTP request for security tracking
     * @return New access token
     */
    @PostMapping("/refresh")
    @Operation(summary = "Refresh token", description = "Refresh JWT access token using refresh token")
    public ResponseEntity<RefreshTokenResponse> refreshToken(
            @Valid @RequestBody RefreshTokenRequest refreshRequest,
            HttpServletRequest request) {
        
        try {
            log.info("Token refresh attempt from IP: {}", getClientIpAddress(request));
            
            RefreshTokenResponse response = authService.refreshToken(refreshRequest, request);
            
            log.info("Successful token refresh from IP: {}", getClientIpAddress(request));
            return ResponseEntity.ok(response);
            
        } catch (AuthenticationException e) {
            log.warn("Token refresh failed from IP: {}", getClientIpAddress(request));
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(RefreshTokenResponse.builder()
                            .success(false)
                            .message("Invalid refresh token")
                            .build());
                            
        } catch (Exception e) {
            log.error("Unexpected error during token refresh from IP: {}", getClientIpAddress(request), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(RefreshTokenResponse.builder()
                            .success(false)
                            .message("Internal server error")
                            .build());
        }
    }

    /**
     * User logout endpoint with token invalidation
     * 
     * @param logoutRequest Logout request with refresh token
     * @param request HTTP request for security tracking
     * @return Logout confirmation
     */
    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logout user and invalidate refresh token")
    public ResponseEntity<LogoutResponse> logout(
            @RequestBody RefreshTokenRequest logoutRequest,
            HttpServletRequest request) {
        
        try {
            log.info("Logout attempt from IP: {}", getClientIpAddress(request));
            
            LogoutResponse response = authService.logout(logoutRequest, request);
            
            log.info("Successful logout from IP: {}", getClientIpAddress(request));
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Unexpected error during logout from IP: {}", getClientIpAddress(request), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(LogoutResponse.builder()
                            .success(false)
                            .message("Internal server error")
                            .build());
        }
    }

    /**
     * Validate current JWT token
     * 
     * @param request HTTP request containing Authorization header
     * @return Token validation result
     */
    @GetMapping("/validate")
    @Operation(summary = "Validate token", description = "Validate current JWT access token")
    public ResponseEntity<Map<String, Object>> validateToken(HttpServletRequest request) {
        
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("valid", false, "message", "No token provided"));
            }
            
            boolean isValid = authService.validateToken(token);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of("valid", true, "message", "Token is valid"));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("valid", false, "message", "Invalid token"));
            }
            
        } catch (Exception e) {
            log.error("Error validating token", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("valid", false, "message", "Internal server error"));
        }
    }

    /**
     * Get current user information from JWT token
     * 
     * @param request HTTP request containing Authorization header
     * @return User information
     */
    @GetMapping("/me")
    @Operation(summary = "Get user info", description = "Get current user information from JWT token")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpServletRequest request) {
        
        try {
            String token = extractTokenFromRequest(request);
            if (token == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "No token provided"));
            }
            
            Map<String, Object> userInfo = authService.getUserInfoFromToken(token);
            
            return ResponseEntity.ok(Map.of("success", true, "user", userInfo));
            
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Invalid token"));
                    
        } catch (Exception e) {
            log.error("Error getting user info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Internal server error"));
        }
    }

    /**
     * Health check endpoint for authentication service
     * 
     * @return Service health status
     */
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check authentication service health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Authentication Service",
                "version", "1.0.0",
                "timestamp", System.currentTimeMillis()
        ));
    }

    /**
     * Extract JWT token from Authorization header
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
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