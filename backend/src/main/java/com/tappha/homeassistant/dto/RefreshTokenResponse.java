package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Refresh token response DTO with new JWT access token
 * 
 * Implements OAuth 2.1 token refresh response with security best practices
 * and OWASP Top-10 compliance for token handling.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenResponse {

    private boolean success;
    private String message;
    private String accessToken;
    private Long expiresIn;
    private String tokenType;
} 