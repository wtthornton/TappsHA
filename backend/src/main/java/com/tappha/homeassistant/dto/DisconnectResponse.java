package com.tappha.homeassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for disconnect operation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisconnectResponse {
    
    private UUID connectionId;
    private String status;
    private String message;
    private boolean success;
} 