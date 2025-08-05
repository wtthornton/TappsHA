package com.tappha.homeassistant.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Refresh token request DTO for JWT token refresh
 * 
 * Implements OAuth 2.1 refresh token grant with validation
 * and OWASP Top-10 compliance for token security.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenRequest {

    @NotBlank(message = "Refresh token is required")
    private String refreshToken;
} 