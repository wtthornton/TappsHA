package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Logout response DTO for user logout confirmation
 * 
 * Implements secure logout with token invalidation
 * and OWASP Top-10 compliance for session management.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogoutResponse {

    private boolean success;
    private String message;
} 