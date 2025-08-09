package com.tappha.homeassistant.controller;

import com.tappha.homeassistant.dto.LoginRequest;
import com.tappha.homeassistant.dto.LoginResponse;
import com.tappha.homeassistant.dto.RegisterRequest;
import com.tappha.homeassistant.dto.RefreshTokenRequest;
import com.tappha.homeassistant.dto.RefreshTokenResponse;
import com.tappha.homeassistant.dto.LogoutResponse;
import com.tappha.homeassistant.entity.User;
import com.tappha.homeassistant.security.CustomUserPrincipal;
import com.tappha.homeassistant.service.UserService;
import com.tappha.homeassistant.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Authentication controller for basic username/password authentication
 */
@RestController
@RequestMapping("/v1/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    private final UserService userService;
    private final AuthService authService;
    
    public AuthController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }
    
    /**
     * Login with username/password and return JWT tokens
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        try {
            LoginResponse response = authService.login(loginRequest, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Login failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(LoginResponse.builder()
                    .success(false)
                    .message("Invalid credentials")
                    .build());
        }
    }

    /**
     * Refresh JWT access token
     */
    @PostMapping("/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshRequest, HttpServletRequest request) {
        try {
            RefreshTokenResponse response = authService.refreshToken(refreshRequest, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Token refresh failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(RefreshTokenResponse.builder()
                    .success(false)
                    .message("Invalid refresh token")
                    .build());
        }
    }

    /**
     * Logout and invalidate refresh token
     */
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(@Valid @RequestBody RefreshTokenRequest logoutRequest, HttpServletRequest request) {
        try {
            LogoutResponse response = authService.logout(logoutRequest, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());
            return ResponseEntity.ok(LogoutResponse.builder()
                .success(true)
                .message("Logged out successfully")
                .build());
        }
    }

    /**
     * Get current user information
     */
    @GetMapping("/me")
    public ResponseEntity<LoginResponse.UserInfo> getCurrentUser(@AuthenticationPrincipal CustomUserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        String username = principal.getUsername();
        String email = principal.getEmail();
        
        Optional<User> user = userService.findByUsername(username);
        
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(user.map(u -> u.getId().toString()).orElse(null))
            .username(username)
            .email(email)
            .roles(java.util.List.of(user.map(User::getRoles).orElse("USER")))
            .build();
        
        return ResponseEntity.ok(userInfo);
    }
    
    /**
     * Create a new user account
     */
    @PostMapping("/register")
    public ResponseEntity<LoginResponse.UserInfo> registerUser(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getName()
            );
            
            LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
                .id(user.getId().toString())
                .username(user.getUsername())
                .email(user.getEmail())
                .roles(java.util.List.of(user.getRoles()))
                .build();
            
            logger.info("Created new user: {}", user.getUsername());
            return ResponseEntity.ok(userInfo);
            
        } catch (Exception e) {
            logger.error("Failed to create user: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication service is running");
    }
} 